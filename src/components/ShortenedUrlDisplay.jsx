export default function ShortenedUrlDisplay() {
  return (
    <div className="hidden"> {/* Show this when a URL is shortened */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value="https://short.ly/abc123"
          readOnly
          className="border rounded p-2 flex-1"
        />
        <button className="bg-green-600 text-white rounded p-2 hover:bg-green-700 transition">
          Copy
        </button>
      </div>
    </div>
  );
}
