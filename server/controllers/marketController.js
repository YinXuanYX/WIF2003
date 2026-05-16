const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const ALLOWED_CURRENCIES = ['usd', 'eur', 'gbp', 'jpy', 'myr'];

export const getCryptoChart = async (req, res, next) => {
  try {
    const { coinId } = req.params;
    const days = req.query.days || '7';
    const currency = (req.query.currency || 'usd').toLowerCase();

    if (!ALLOWED_CURRENCIES.includes(currency)) {
      return res.status(400).json({ message: `Unsupported currency. Allowed: ${ALLOWED_CURRENCIES.join(', ')}` });
    }

    const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(coinId.trim())}/market_chart?vs_currency=${currency}&days=${days}`;

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

export const getEquityQuote = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'Market API is not configured' });
    }

    const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[Finnhub] ${response.status}: ${text}`);
      return res.status(502).json({ message: 'Failed to fetch equity quote' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getForexRates = async (req, res, next) => {
  try {
    const vsCurrencies = ALLOWED_CURRENCIES.join(',');
    const url = `${COINGECKO_BASE}/simple/price?ids=tether&vs_currencies=${vsCurrencies}`;

    const headers = { accept: 'application/json' };
    if (process.env.COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[CoinGecko] ${response.status}: ${text}`);
      return res.status(502).json({ message: 'Failed to fetch forex rates' });
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
