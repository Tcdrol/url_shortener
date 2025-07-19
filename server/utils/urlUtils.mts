import https from 'https';
import { parse } from 'url';
import { JSDOM } from 'jsdom';

/**
 * Extracts the title from a webpage
 * @param urlString The URL to fetch
 * @returns Promise resolving to the page title or null
 */
export const getTitleFromUrl = async (urlString: string): Promise<string | null> => {
  try {
    const url = new URL(urlString);
    
    // Only fetch from HTTP/HTTPS URLs
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    // Set up a promise to handle the request
    return new Promise((resolve) => {
      const req = https.get(url.toString(), { 
        timeout: 5000, // 5 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URLShortener/1.0; +https://github.com/yourusername/url-shortener)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      }, (res) => {
        // Check if the response is HTML
        const contentType = res.headers['content-type'] || '';
        if (!contentType.includes('text/html')) {
          res.resume(); // Consume response data to free up memory
          return resolve(null);
        }

        // Collect the data
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
          // Limit the amount of data we collect to 1MB
          if (data.length > 1024 * 1024) {
            req.destroy();
            resolve(null);
          }
        });

        res.on('end', () => {
          try {
            const dom = new JSDOM(data);
            const title = dom.window.document.querySelector('title')?.textContent;
            resolve(title || null);
          } catch (err) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  } catch (err) {
    return null;
  }
};

/**
 * Validates a URL
 * @param urlString The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (err) {
    return false;
  }
};

/**
 * Normalizes a URL to ensure consistency
 * @param urlString The URL to normalize
 * @returns Normalized URL or null if invalid
 */
export const normalizeUrl = (urlString: string): string | null => {
  try {
    const url = new URL(urlString);
    
    // Remove fragments and query parameters if needed
    url.hash = '';
    
    // Normalize the protocol
    url.protocol = url.protocol.toLowerCase();
    
    // Normalize the hostname
    url.hostname = url.hostname.toLowerCase();
    
    // Remove default ports
    if (url.port === '80' && url.protocol === 'http:') {
      url.port = '';
    } else if (url.port === '443' && url.protocol === 'https:') {
      url.port = '';
    }
    
    // Remove trailing slashes from path
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    
    // Sort query parameters for consistency
    if (url.search) {
      const params = new URLSearchParams(url.search);
      const sortedParams = new URLSearchParams();
      
      // Get and sort the keys
      const keys = Array.from(params.keys()).sort();
      
      // Rebuild the search params in sorted order
      keys.forEach(key => {
        const values = params.getAll(key).sort();
        values.forEach(value => {
          sortedParams.append(key, value);
        });
      });
      
      url.search = sortedParams.toString();
    }
    
    return url.toString();
  } catch (err) {
    return null;
  }
};
