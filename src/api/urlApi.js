// Dummy API for URL shortening
export async function shortenUrl(longUrl) {
  // Replace this with real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ shortUrl: 'https://short.ly/' + Math.random().toString(36).substr(2, 6) });
    }, 1000);
  });
}
