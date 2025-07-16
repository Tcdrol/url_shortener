import { useState, useEffect } from 'react';
import './App.css';

interface ShortenedUrl {
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
  lastAccessed?: string;
}

interface ApiResponse {
  data: ShortenedUrl[];
  total: number;
  page: number;
  totalPages: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/shorturl';

function App() {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [history, setHistory] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch URL history on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (response.ok) {
          const data: ApiResponse = await response.json();
          setHistory(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load URL history');
      }
    };

    fetchHistory();
  }, []);

  const shortenUrl = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to shorten URL');
      }

      const data = await response.json();
      const fullShortUrl = `${window.location.origin}/${data.shortUrl}`;
      
      setShortenedUrl(fullShortUrl);
      
      // Update history with the new URL
      setHistory(prev => [{
        originalUrl: data.originalUrl,
        shortUrl: fullShortUrl,
        createdAt: new Date(data.createdAt).toISOString(),
        clicks: data.clicks || 0,
        lastAccessed: data.lastAccessed ? new Date(data.lastAccessed).toISOString() : undefined
      }, ...prev]);
      
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shorten URL. Please try again.');
      console.error('Error shortening URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optional: Show a success message
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>URL Shortener</h1>
      </div>
      
      <div className="shortener-container">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && shortenUrl()}
            aria-label="URL to shorten"
          />
          <button 
            onClick={shortenUrl} 
            disabled={isLoading || !url.trim()}
            className={isLoading ? 'loading' : ''}
            aria-label="Shorten URL"
          >
            {isLoading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {shortenedUrl && (
          <div className="result">
            <p>Shortened URL: </p>
            <div className="result-url">
              <a 
                href={shortenedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={`Visit ${shortenedUrl}`}
              >
                {shortenedUrl}
              </a>
              <button 
                onClick={() => copyToClipboard(shortenedUrl)}
                className="copy-button"
                title="Copy to clipboard"
                aria-label="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="history">
            <h2>Your Shortened URLs</h2>
            <div className="history-list" role="list">
              {history.map((item) => (
                <div key={item.shortUrl} className="history-item" role="listitem">
                  <div className="history-url">
                    <a 
                      href={item.shortUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={`Visit ${item.shortUrl}`}
                    >
                      {item.shortUrl}
                    </a>
                    <button 
                      onClick={() => copyToClipboard(item.shortUrl)}
                      className="copy-button"
                      title="Copy to clipboard"
                      aria-label={`Copy ${item.shortUrl} to clipboard`}
                    >
                      📋
                    </button>
                  </div>
                  <div className="history-original" title={item.originalUrl}>
                    {item.originalUrl.length > 50 
                      ? `${item.originalUrl.substring(0, 50)}...`
                      : item.originalUrl}
                  </div>
                  <div className="history-stats">
                    <span title="Number of clicks">
                      <span role="img" aria-label="Clicks">👆</span> {item.clicks}
                    </span>
                    <span title="Created date">
                      <span role="img" aria-label="Created">📅</span> {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    {item.lastAccessed && (
                      <span title="Last accessed">
                        <span role="img" aria-label="Last accessed">⏱️</span> {new Date(item.lastAccessed).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
