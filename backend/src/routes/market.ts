import { Router, Request, Response } from 'express';
import { marketDataService } from '../services/marketData';

const router = Router();

// GET /api/market/tickers
router.get('/tickers', async (_req: Request, res: Response) => {
  try {
    const tickers = await marketDataService.getTickers();
    res.json(tickers);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch live market tickers.' });
  }
});

// GET /api/market/history/:symbol?interval=1h&limit=48
router.get('/history/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const interval = (req.query.interval as string) || '1h';
    const limit = parseInt(req.query.limit as string) || 48;

    const klines = await marketDataService.getKlines(symbol, interval, Math.min(limit, 200));
    res.json({
      symbol: symbol.toUpperCase(),
      interval,
      data: klines,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch historical market data.' });
  }
});

export default router;
