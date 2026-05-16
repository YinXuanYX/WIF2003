const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const ALLOWED_DAYS = ['1', '7', '14', '30', '90', '365'];
const ALLOWED_CATEGORIES = ['general', 'forex', 'crypto', 'merger'];

export const getCryptoChart = async (req, res, next) => {
  try {
    const { coinId } = req.params;
    const days = req.query.days || '7';

    if (!coinId || typeof coinId !== 'string' || !coinId.trim()) {
      return res.status(400).json({ message: 'Invalid coin ID' });
    }

    if (!ALLOWED_DAYS.includes(days)) {
      return res.status(400).json({
        message: `Invalid days value. Allowed: ${ALLOWED_DAYS.join(', ')}`,
      });
    }

    const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(coinId.trim())}/market_chart?vs_currency=usd&days=${days}`;

    const headers = { accept: 'application/json' };
    if (process.env.COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[CoinGecko] ${response.status}: ${text}`);
      return res.status(502).json({ message: 'Failed to fetch market data' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getMarketNews = async (req, res, next) => {
  try {
    const category = req.query.category || 'general';

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`,
      });
    }

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'Market API is not configured' });
    }

    const url = `${FINNHUB_BASE}/news?category=${encodeURIComponent(category)}&token=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[Finnhub] ${response.status}: ${text}`);
      return res.status(502).json({ message: 'Failed to fetch market news' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
