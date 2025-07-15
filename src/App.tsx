import { useState } from 'react';
import './App.css';

interface ShortenedUrl {
  originalUrl: string;
  shortenedUrl: string;
  createdAt: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [history, setHistory] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState('');

  const shortenUrl = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      // For now, we'll just generate a random string as the shortened URL
      const shortened = Math.random().toString(36).substring(2, 8);
      const shortenedUrl = `https://your-domain.com/${shortened}`;
      
      // Create a new shortened URL object
      const newUrl: ShortenedUrl = {
        originalUrl: url,
        shortenedUrl,
        createdAt: new Date().toISOString()
      };

      // Update state
      setShortenedUrl(shortenedUrl);
      setHistory(prev => [newUrl, ...prev]);
      setError('');
    } catch (err) {
      setError('Failed to shorten URL. Please try again.');
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
            placeholder="Enter URL to shorten"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
          />
          <button onClick={shortenUrl} className="shorten-btn">
            Shorten
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {shortenedUrl && (
          <div className="result-container">
            <div className="result-url">
              <input
                type="text"
                value={shortenedUrl}
                readOnly
                onClick={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.select();
                  document.execCommand('copy');
                }}
              />
              <button className="copy-btn">Copy</button>
            </div>
          </div>
        )}

        <div className="history-container">
          <h2>History</h2>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="original-url">{item.originalUrl}</div>
                <div className="shortened-url">{item.shortenedUrl}</div>
                <div className="created-at">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
