import { Router } from 'express';
import { getCryptoChart } from '../controllers/marketController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/crypto/:coinId/chart', getCryptoChart);

export default router;
