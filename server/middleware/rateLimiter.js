const timestamps = [];
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 50;

const finnhubRateLimiter = (req, res, next) => {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  while (timestamps.length > 0 && timestamps[0] < windowStart) {
    timestamps.shift();
  }

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      message: 'Rate limit exceeded. Please try again later.',
    });
  }

  timestamps.push(now);
  next();
};

export default finnhubRateLimiter;
