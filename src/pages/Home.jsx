import UrlInputForm from '../components/UrlInputForm.jsx';
import ShortenedUrlDisplay from '../components/ShortenedUrlDisplay.jsx';
import UrlHistory from '../components/UrlHistory.jsx';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4">URL Shortener</h1>
      <div className="w-full max-w-md space-y-6">
        <UrlInputForm />
        <ShortenedUrlDisplay />
        <UrlHistory />
      </div>
    </div>
  );
}
