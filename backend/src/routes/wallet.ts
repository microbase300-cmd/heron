import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const DEPOSIT_ADDRESSES: Record<string, { network: string; address: string; memo?: string }> = {
  USDT_TRC20: {
    network: 'Tron (TRC-20)',
    address: 'TX9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a'
  },
  USDT_ERC20: {
    network: 'Ethereum (ERC-20)',
    address: '0x882194f8a7e6d5c4b3a201948572615049382710'
  },
  BTC: {
    network: 'Bitcoin Native SegWit',
    address: 'bc1q9d8a7f6e5c4b3a201948572615049382710082'
  },
  ETH: {
    network: 'Ethereum Mainnet',
    address: '0x882194f8a7e6d5c4b3a201948572615049382710'
  },
  SOL: {
    network: 'Solana SPL',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
  }
};

// Summary metrics
router.get('/summary', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const investments = db.getInvestmentsByUserId(userId);
  const transactions = db.getTransactionsByUserId(userId);

  const activeInvestments = investments.filter(i => i.status === 'active');
  const lockedInInvestments = activeInvestments.reduce((sum, i) => sum + i.amount, 0);
  const totalProfitAccrued = investments
    .filter(i => i.status === 'completed')
    .reduce((sum, i) => sum + i.expectedProfit, 0);

  const totalDeposited = transactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReferralEarnings = transactions
    .filter(t => t.type === 'referral_bonus' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return res.json({
    availableBalance: user.balance,
    lockedInInvestments,
    totalPortfolioValue: user.balance + lockedInInvestments,
    totalProfitAccrued,
    totalDeposited,
    totalWithdrawn,
    totalReferralEarnings,
    activePlansCount: activeInvestments.length
  });
});

// Deposit addresses
router.get('/addresses', requireAuth, (_req: AuthRequest, res: Response) => {
  return res.json({ addresses: DEPOSIT_ADDRESSES });
});

// Deposit credit (simulated blockchain deposit verification)
router.post('/deposit', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, asset, txHash } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid deposit amount.' });
    }

    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const newBalance = user.balance + numAmount;
    db.updateUserBalance(user.id, newBalance);

    const generatedHash = txHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const tx = db.createTransaction({
      id: `tx_${uuidv4()}`,
      userId: user.id,
      type: 'deposit',
      amount: numAmount,
      asset: asset || 'USDT',
      status: 'completed',
      txHash: generatedHash,
      note: `Confirmed deposit of $${numAmount.toLocaleString()} via ${asset || 'USDT'} smart contract`,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      message: 'Deposit confirmed and credited to available balance.',
      transaction: tx,
      newBalance
    });
  } catch (err) {
    console.error('Deposit error:', err);
    return res.status(500).json({ error: 'Deposit transaction failed.' });
  }
});

// Withdrawal request
router.post('/withdraw', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, asset, destinationAddress } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid withdrawal amount.' });
    }

    if (!destinationAddress || destinationAddress.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid destination cryptographic wallet address.' });
    }

    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (user.balance < numAmount) {
      return res.status(400).json({ error: 'Insufficient available balance for this withdrawal.' });
    }

    const newBalance = user.balance - numAmount;
    db.updateUserBalance(user.id, newBalance);

    const generatedHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const tx = db.createTransaction({
      id: `tx_${uuidv4()}`,
      userId: user.id,
      type: 'withdrawal',
      amount: numAmount,
      asset: asset || 'USDT',
      status: 'completed',
      txHash: generatedHash,
      note: `Automated withdrawal of $${numAmount.toLocaleString()} to ${destinationAddress.slice(0, 6)}...${destinationAddress.slice(-4)}`,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      message: 'Withdrawal processed and dispatched to blockchain mempool.',
      transaction: tx,
      newBalance
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    return res.status(500).json({ error: 'Withdrawal failed.' });
  }
});

export default router;
