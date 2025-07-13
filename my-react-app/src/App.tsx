import { useState } from 'react';
import './App.css';

interface ShortenedUrl {
  original: string;
  shortened: string;
  id: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, you would call your backend API here
      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUrl: ShortenedUrl = {
        original: url,
        shortened: `short.ly/${Math.random().toString(36).substring(2, 8)}`,
        id: Date.now().toString()
      };
      
      setShortenedUrls(prev => [newUrl, ...prev]);
      setUrl('');
    } catch (err) {
      setError('Failed to shorten URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you might want to show a toast notification
  };

  return (
    <div className="app">
      <header className="header">
        <h1>URL Shortener</h1>
        <p>Paste your long URL to make it shorter</p>
      </header>
      
      <main className="main-content">
        <form onSubmit={handleSubmit} className="url-form">
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              className="url-input"
              required
            />
            <button 
              type="submit" 
              className="shorten-button"
              disabled={isLoading}
            >
              {isLoading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>

        {shortenedUrls.length > 0 && (
          <div className="results">
            <h2>Your Shortened URLs</h2>
            <ul className="url-list">
              {shortenedUrls.map((item) => (
                <li key={item.id} className="url-item">
                  <div className="url-original">
                    <a href={item.original} target="_blank" rel="noopener noreferrer">
                      {item.original.length > 50 
                        ? `${item.original.substring(0, 50)}...` 
                        : item.original}
                    </a>
                  </div>
                  <div className="url-shortened">
                    <a href={item.shortened} target="_blank" rel="noopener noreferrer">
                      {item.shortened}
                    </a>
                    <button 
                      onClick={() => copyToClipboard(item.shortened)}
                      className="copy-button"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      
      <footer className="footer">
        <p> {new Date().getFullYear()} URL Shortener. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App
