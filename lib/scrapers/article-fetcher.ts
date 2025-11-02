import { getLinkPreview } from 'link-preview-js';

export interface ArticleResult {
  title: string;
  link: string;
  summary: string;
  image?: string;
}

function isErrorPage(title: string, summary: string): boolean {
  const errorPatterns = [
    /^Error \d{3}/i,
    /not found/i,
    /unsupported media type/i,
    /server error/i,
    /forbidden/i,
    /unauthorized/i,
    /bad gateway/i,
    /service unavailable/i,
    /gateway timeout/i,
  ];

  return errorPatterns.some(pattern => pattern.test(title) || pattern.test(summary));
}

export async function fetchArticleMeta(url: string): Promise<ArticleResult | null> {
  try {
    const preview = await getLinkPreview(url, {
      followRedirects: 'follow',
      timeout: 5000,
    });

    if (preview && typeof preview === 'object') {
      const title = preview.title || 'Untitled';
      const summary = preview.description || 'Learn more about this article';
      
      if (isErrorPage(title, summary)) {
        console.log(`Skipping error page: ${title}`);
        return null;
      }

      return {
        title,
        link: url,
        summary,
        image: preview.images && preview.images.length > 0 ? preview.images[0] : undefined,
      };
    }

    return null;
  } catch (error) {
    console.log(`Failed to fetch metadata for ${url}:`, error.message);
    return null;
  }
}

function isErrorPageExported(title: string, summary: string): boolean {
  const errorPatterns = [
    /^Error \d{3}/i,
    /not found/i,
    /unsupported media type/i,
    /server error/i,
    /forbidden/i,
    /unauthorized/i,
    /bad gateway/i,
    /service unavailable/i,
    /gateway timeout/i,
  ];

  return errorPatterns.some(pattern => pattern.test(title) || pattern.test(summary));
}

export async function validateAndFetchArticles(urls: string[]): Promise<ArticleResult[]> {
  const results: ArticleResult[] = [];

  for (const url of urls) {
    const meta = await fetchArticleMeta(url);
    if (meta) {
      results.push(meta);
    }
    
    if (results.length >= 5) break;
  }

  return results;
}

export function filterErrorPages(articles: any[]): any[] {
  return articles.filter(article => {
    if (!article.title || !article.summary) return false;
    return !isErrorPageExported(article.title, article.summary);
  });
}

