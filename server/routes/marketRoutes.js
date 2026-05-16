import { Router } from 'express';
import { getCryptoChart, getEquityQuote, getForexRates, getMarketNews } from '../controllers/marketController.js';
import { protect } from '../middleware/auth.js';
import finnhubRateLimiter from '../middleware/rateLimiter.js';
import {
  validateCryptoChart,
  validateEquityQuote,
  validateMarketNews,
} from '../validators/marketValidators.js';

const router = Router();

router.use(protect);

router.get('/crypto/:coinId/chart', validateCryptoChart, getCryptoChart);
router.get('/equity/:symbol/quote', finnhubRateLimiter, validateEquityQuote, getEquityQuote);
router.get('/forex/rates', getForexRates);
router.get('/news', finnhubRateLimiter, validateMarketNews, getMarketNews);

export default router;
