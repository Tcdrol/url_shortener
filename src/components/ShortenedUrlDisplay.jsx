import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { useToast } from '../context/ToastContext';

export default function ShortenedUrlDisplay() {
  const { history } = useContext(AppContext);
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const latestUrl = history[0];

  const copyToClipboard = () => {
    if (!latestUrl) return;
    
    navigator.clipboard.writeText(latestUrl.shortUrl)
      .then(() => {
        setCopied(true);
        showToast('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy URL', 'error');
      });
  };

  if (!latestUrl) return null;

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={latestUrl.shortUrl}
            readOnly
            className="w-full p-3 pr-20 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 truncate"
            onClick={(e) => e.target.select()}
            aria-label="Shortened URL"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">
              {latestUrl.clicks || 0} clicks
            </span>
          </div>
        </div>
        <button
          onClick={copyToClipboard}
          disabled={copied}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
          aria-label={copied ? 'Copied!' : 'Copy URL'}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-500 truncate">
        Original: <span className="text-gray-700">{latestUrl.originalUrl}</span>
      </div>
    </div>
  );
}
