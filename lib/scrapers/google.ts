import * as cheerio from 'cheerio';
import axios from 'axios';

export interface ArticleResult {
  title: string;
  link: string;
  summary: string;
}

export async function searchGoogle(query: string): Promise<ArticleResult[]> {
  const results: ArticleResult[] = [];
  
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=20&hl=en`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    $('div.g').each((i, element) => {
      if (results.length >= 5) return false;
      
      const title = $(element).find('h3').first().text().trim();
      let link = $(element).find('a').first().attr('href') || '';
      const snippet = $(element).find('div.VwiC3b, div.IsZvec, div.aCOpRe').first().text().trim() || '';
      
      if (link.startsWith('/url?q=')) {
        link = link.replace('/url?q=', '').split('&')[0];
      }
      
      if (title && link && link.startsWith('http') && !link.includes('youtube.com') && !link.includes('youtu.be') && !link.includes('google.com')) {
        results.push({
          title: title,
          link: decodeURIComponent(link),
          summary: snippet || `${title} - learn more about this topic`
        });
      }
    });
    
    if (results.length === 0) {
      console.log('No results from Google, trying alternative parsing');
      
      $('div.g, div[data-hveid]').each((i, element) => {
        if (results.length >= 5) return false;
        
        const title = $(element).find('h3, .LC20lb').first().text().trim();
        let link = $(element).find('a').first().attr('href') || '';
        const snippet = $(element).find('.VwiC3b, .IsZvec, .aCOpRe, .s3v9rd').first().text().trim() || '';
        
        if (link.startsWith('/url?q=')) {
          link = link.replace('/url?q=', '').split('&')[0];
        }
        
        if (title && link && link.startsWith('http') && !link.includes('youtube.com') && !link.includes('youtu.be') && !link.includes('google.com')) {
          results.push({
            title: title,
            link: decodeURIComponent(link),
            summary: snippet || `${title} - learn more about this topic`
          });
        }
      });
    }
    
  } catch (error) {
    console.error('Google search error:', error);
    console.error('Error details:', error.response?.status, error.response?.statusText);
    console.error('Response data:', error.response?.data?.substring(0, 500));
  }
  
  console.log('Final Google results count:', results.length);
  
  return results;
}

