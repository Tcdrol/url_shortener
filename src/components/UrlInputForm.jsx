import { useState, useContext } from 'react';
import { AppContext } from '../App';
import { useToast } from '../context/ToastContext';
import { shortenUrl } from '../api/urlApi';

export default function UrlInputForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToHistory } = useContext(AppContext);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      showToast('Please enter a URL', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await shortenUrl(url);
      
      const urlData = {
        originalUrl: url,
        shortUrl: response.shortUrl,
        timestamp: new Date().toISOString(),
        clicks: 0
      };
      
      addToHistory(urlData);
      setUrl('');
      showToast('URL shortened successfully!');
    } catch (error) {
      console.error('Error shortening URL:', error);
      showToast('Failed to shorten URL. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="Paste your long URL here..."
          disabled={isLoading}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`px-6 py-3 rounded-lg font-medium text-white transition ${
          isLoading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Shortening...' : 'Shorten URL'}
      </button>
    </form>
  );
}
