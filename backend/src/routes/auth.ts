import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { JWT_SECRET, requireAuth, AuthRequest } from '../middleware/auth';
import { User } from '../types';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, referralCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    let referredBy: string | null = null;
    if (referralCode) {
      const referrer = db.getUserByReferralCode(referralCode);
      if (referrer) {
        referredBy = referrer.referralCode;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate unique referral code
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const userReferralCode = `HERON-${uniqueSuffix}`;

    const newUser: User = {
      id: `usr_${uuidv4()}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash,
      balance: 1000.00, // Welcome trial liquidity credit for immediate testing
      referralCode: userReferralCode,
      referredBy,
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        balance: newUser.balance,
        referralCode: newUser.referralCode,
        referredBy: newUser.referredBy,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  const user = db.getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      createdAt: user.createdAt
    }
  });
});

export default router;
