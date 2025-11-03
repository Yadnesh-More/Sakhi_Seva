import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai/node";
import { z } from "zod";
import { searchYouTube } from "@/lib/scrapers/youtube";
import { retryWithBackoff } from "@/lib/utils/retry";
import {
  validateAndFetchArticles,
  filterErrorPages,
} from "@/lib/scrapers/article-fetcher";

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = chatSchema.parse(body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key not configured. Please set GEMINI_API_KEY in your .env.local file.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const queryPrompt = `${message}

Generate ONLY search queries in the following JSON format:

{
  "youtubeQueries": ["search query 1", "search query 2", "search query 3"],
  "articleQueries": ["search query 1", "search query 2", "search query 3"]
}

Generate 3-5 YouTube search queries and 3-5 article/blog search queries. Return ONLY valid JSON, no other text.`;

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: queryPrompt,
      })
    );

    const responseText = response.text || "";

    let queries = null;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        queries = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log("Could not parse queries JSON");
      return NextResponse.json(
        { error: "Failed to generate search queries", message: responseText },
        { status: 500 }
      );
    }

    if (!queries || !queries.youtubeQueries || !queries.articleQueries) {
      return NextResponse.json(
        { error: "Invalid search queries format" },
        { status: 500 }
      );
    }

    const youtubeVideos = await Promise.all(
      queries.youtubeQueries.slice(0, 3).map((q: string) => searchYouTube(q))
    ).then((results) => results.flat());

    console.log("YouTube results:", youtubeVideos.length);

    const groundingTool = {
      googleSearch: {},
    };

    const config = {
      tools: [groundingTool],
    };

    const summaryPrompt = `Provide a brief, informative 3-4 sentence summary about: ${message}

Return ONLY the summary text, no additional formatting or explanation.`;

    let aiSummary =
      "Here are the best resources I found to help you learn about this topic.";

    try {
      const summaryResponse = await retryWithBackoff(() =>
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: summaryPrompt,
          config,
        })
      );
      aiSummary = summaryResponse.text || aiSummary;
    } catch (error) {
      console.log("Could not generate summary, using default");
    }

    const articlePrompt = `Based on these queries: ${queries.articleQueries.join(
      ", "
    )}

Using your Google Search grounding, find 5-7 high-quality articles or blogs about this topic. Return ONLY a JSON array in this format:

[
  {
    "title": "Article title",
    "link": "Full URL",
    "summary": "Brief 2-3 sentence summary"
  }
]

Return ONLY valid JSON, no additional text.`;

    const articleResponse = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: articlePrompt,
        config,
      })
    );

    const articleResponseText = articleResponse.text || "";

    let articles: any[] = [];
    try {
      const jsonMatch = articleResponseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        articles = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log("Could not parse articles JSON");
    }

    const groundingMetadata =
      (articleResponse as any).candidates?.[0]?.groundingMetadata || null;

    let citations: Array<{ title: string; url: string; index: number }> = [];

    if (groundingMetadata?.groundingChunks) {
      groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
        if (chunk.web) {
          citations.push({
            title: chunk.web.title || "Untitled",
            url: chunk.web.uri || "",
            index: index + 1,
          });
        }
      });
    }

    console.log("Article results:", articles.length);

    let allUrls: string[] = [];

    if (articles.length > 0) {
      allUrls = articles.map((a: any) => a.link);
    } else if (citations.length > 0) {
      allUrls = citations.map((c) => c.url);
    }

    console.log(
      "Validating and fetching article metadata for",
      allUrls.length,
      "URLs"
    );

    let validatedArticles = await validateAndFetchArticles(allUrls);

    console.log("Valid articles found:", validatedArticles.length);

    if (validatedArticles.length === 0 && articles.length > 0) {
      const filteredArticles = filterErrorPages(articles);
      validatedArticles = filteredArticles.slice(0, 5).map((article: any) => ({
        title: article.title,
        link: article.link,
        summary: article.summary,
      }));
    } else if (validatedArticles.length === 0 && citations.length > 0) {
      validatedArticles = citations.slice(0, 5).map((cite) => ({
        title: cite.title,
        link: cite.url,
        summary: `Learn more about ${cite.title}`,
      }));
    }

    const structuredData = {
      header: "Recommended Resources",
      intro: aiSummary,
      youtubeVideos: youtubeVideos.slice(0, 5).map((video) => ({
        title: video.title,
        link: video.link,
        summary: video.summary,
      })),
      resources: validatedArticles.slice(0, 5).map((article) => ({
        type: "article" as const,
        title: article.title,
        link: article.link,
        summary: article.summary,
        image: article.image,
      })),
    };

    return NextResponse.json({
      message: responseText,
      structuredData,
      citations: [],
    });
  } catch (error: any) {
    console.error("Chat error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
