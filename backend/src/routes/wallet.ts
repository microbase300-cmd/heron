import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { otpService } from '../services/otpService';
import { emailService } from '../services/emailService';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Summary metrics
router.get('/summary', requireAuth, (req: AuthRequest, res: Response): void => {
  const userId = req.user!.userId || req.user!.id;
  const user = db.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const investments = db.getInvestmentsByUserId(userId);
  const transactions = db.getTransactionsByUserId(userId);

  const activeInvestments = investments.filter(i => i.status === 'active' || i.status === 'matured');
  const lockedInInvestments = activeInvestments.reduce((sum, i) => sum + i.amount, 0);
  const totalProfitAccrued = investments
    .filter(i => i.status === 'completed' || i.status === 'matured')
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

  res.json({
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

// Dynamic Deposit addresses configured by Admin
router.get('/addresses', requireAuth, (_req: AuthRequest, res: Response): void => {
  const addresses = db.getDepositAddresses();
  res.json({ addresses });
});

// Submit Deposit (creates pending transaction for Admin settlement confirmation)
router.post('/deposit', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId || req.user!.id;
    const { amount, asset, txHash } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Please enter a valid deposit amount.' });
      return;
    }

    const user = db.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const generatedHash = txHash && txHash.trim().length > 5
      ? txHash.trim()
      : `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Create pending deposit transaction
    const tx = db.createTransaction({
      id: `tx_${uuidv4()}`,
      userId: user.id,
      type: 'deposit',
      amount: numAmount,
      asset: asset || 'USDT',
      status: 'pending',
      txHash: generatedHash,
      note: `Inbound ${asset || 'USDT'} deposit of $${numAmount.toLocaleString()} awaiting admin confirmation (TX: ${generatedHash.slice(0, 10)}...)`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Deposit submitted successfully. Placed in executive queue for blockchain confirmation.',
      transaction: tx,
      status: 'pending'
    });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: 'Deposit transaction failed.' });
  }
});

// Request Withdrawal OTP
router.post('/request-withdrawal-otp', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId || req.user!.id;
    const user = db.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const otp = otpService.generateOtp(user.email, 'withdrawal');
    await emailService.sendOtpEmail({ to: user.email, code: otp.code, purpose: 'withdrawal' });

    res.json({
      message: `Withdrawal authorization code sent to ${user.email}. Valid for 10 minutes.`,
      expiresAt: otp.expiresAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate withdrawal authorization code.' });
  }
});

// Submit Withdrawal (Requires OTP & creates pending transaction for Admin approval)
router.post('/withdraw', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId || req.user!.id;
    const { amount, asset, destinationAddress, otpCode } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Please enter a valid withdrawal amount.' });
      return;
    }

    if (!destinationAddress || destinationAddress.trim().length < 8) {
      res.status(400).json({ error: 'Please provide a valid destination cryptographic wallet address.' });
      return;
    }

    if (!otpCode || otpCode.trim().length !== 6) {
      res.status(400).json({ error: 'A valid 6-digit withdrawal verification code is required.' });
      return;
    }

    const user = db.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Verify OTP
    const isOtpValid = otpService.verifyOtp(user.email, otpCode, 'withdrawal');
    if (!isOtpValid) {
      res.status(400).json({ error: 'Invalid or expired 6-digit withdrawal authorization code.' });
      return;
    }

    if (user.balance < numAmount) {
      res.status(400).json({ error: 'Insufficient available balance for this withdrawal.' });
      return;
    }

    // Deduct from balance to hold in pending escrow
    const newBalance = user.balance - numAmount;
    db.updateUserBalance(user.id, newBalance);

    const generatedHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Create pending withdrawal transaction
    const tx = db.createTransaction({
      id: `tx_${uuidv4()}`,
      userId: user.id,
      type: 'withdrawal',
      amount: numAmount,
      asset: asset || 'USDT',
      status: 'pending',
      txHash: generatedHash,
      note: `Pending withdrawal of $${numAmount.toLocaleString()} to ${destinationAddress.slice(0, 6)}...${destinationAddress.slice(-4)} (${asset || 'USDT'})`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Withdrawal request authorized and submitted to executive settlement queue.',
      transaction: tx,
      newBalance,
      status: 'pending'
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Withdrawal processing failed.' });
  }
});

export default router;
