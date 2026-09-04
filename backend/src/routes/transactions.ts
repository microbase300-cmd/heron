import { Router, Response } from 'express';
import { db } from '../services/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { type } = req.query;

  let transactions = db.getTransactionsByUserId(userId);
  if (type && typeof type === 'string' && type !== 'all') {
    transactions = transactions.filter(t => t.type === type);
  }

  return res.json({ transactions });
});

export default router;
