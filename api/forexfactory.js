let memoryCache = null;
let lastCacheTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

export default async function handler(req, res) {
  if (!res.status) {
    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };
  }
  if (!res.json) {
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return from in-memory cache if fresh
  if (memoryCache && Date.now() - lastCacheTime < CACHE_DURATION_MS) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(memoryCache);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      if (memoryCache) {
        return res.status(200).json(memoryCache);
      }
      throw new Error(`ForexFactory responded with status ${response.status}`);
    }

    const data = await response.json();
    memoryCache = data;
    lastCacheTime = Date.now();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (error) {
    console.error('ForexFactory serverless fetch error:', error);
    if (memoryCache) {
      return res.status(200).json(memoryCache);
    }
    return res.status(500).json({
      error: 'Failed to fetch ForexFactory calendar',
      message: error?.message || String(error),
    });
  }
}
