import { Router } from 'express';
import { getCryptoChart, getEquityQuote, getMarketNews } from '../controllers/marketController.js';
import { protect } from '../middleware/auth.js';
import finnhubRateLimiter from '../middleware/rateLimiter.js';

const router = Router();

router.use(protect);

router.get('/crypto/:coinId/chart', getCryptoChart);
router.get('/equity/:symbol/quote', finnhubRateLimiter, getEquityQuote);
router.get('/news', finnhubRateLimiter, getMarketNews);

export default router;
