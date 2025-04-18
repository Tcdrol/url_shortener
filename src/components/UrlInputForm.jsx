export default function UrlInputForm() {
  return (
    <form className="flex flex-col gap-2">
      <input
        type="url"
        className="border rounded p-2"
        placeholder="Paste your long URL here..."
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 transition"
      >
        Shorten URL
      </button>
    </form>
  );
}
