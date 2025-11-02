import * as cheerio from 'cheerio';
import axios from 'axios';

export interface YouTubeVideo {
  title: string;
  link: string;
  summary: string;
}

export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const videos: YouTubeVideo[] = [];
  
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const scriptTags = $('script').toArray();
    let ytInitialData = null;
    
    for (const script of scriptTags) {
      const content = $(script).html();
      if (content && content.includes('var ytInitialData')) {
        const match = content.match(/var ytInitialData = ({[\s\S]*?});/);
        if (match) {
          try {
            ytInitialData = JSON.parse(match[1]);
            break;
          } catch (e) {
            console.log('Failed to parse ytInitialData');
          }
        }
      }
    }
    
    if (ytInitialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents) {
      const contents = ytInitialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents;
      
      for (const section of contents) {
        if (section.itemSectionRenderer?.contents) {
          for (const item of section.itemSectionRenderer.contents) {
            const videoRenderer = item.videoRenderer;
            if (videoRenderer && videoRenderer.videoId) {
              const videoId = videoRenderer.videoId;
              const title = videoRenderer.title?.runs?.[0]?.text || '';
              const description = videoRenderer.descriptionSnippet?.runs?.[0]?.text || '';
              const channelName = videoRenderer.ownerText?.runs?.[0]?.text || '';
              
              if (title && videoId) {
                videos.push({
                  title: title,
                  link: `https://www.youtube.com/watch?v=${videoId}`,
                  summary: description || `Learn from ${channelName} - ${title}`
                });
                
                if (videos.length >= 5) break;
              }
            }
          }
        }
        if (videos.length >= 5) break;
      }
    }
  } catch (error) {
    console.error('YouTube search error:', error);
  }
  
  return videos;
}

