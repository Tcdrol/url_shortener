import { useState, useContext } from 'react';
import { AppContext } from '../App';
import { useToast } from '../context/ToastContext';

export default function UrlHistory() {
  const { history } = useContext(AppContext);
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      showToast('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy URL', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <div className="mt-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No history yet</h3>
        <p className="mt-1 text-sm text-gray-500">Shorten a URL to see it here</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Your Links</h2>
        <span className="text-sm text-gray-500">{history.length} total</span>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {history.map((item, index) => (
            <li key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {item.shortUrl}
                  </p>
                  <p className="text-sm text-gray-500 truncate" title={item.originalUrl}>
                    {item.originalUrl}
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    Created: {formatDate(item.timestamp)}
                    <span className="mx-2">•</span>
                    <span>{item.clicks || 0} clicks</span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => copyToClipboard(item.shortUrl, index)}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                      copiedId === index
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    {copiedId === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
