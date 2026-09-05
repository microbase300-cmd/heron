import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { authService } from '../services/authService';
import { otpService } from '../services/otpService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { User } from '../types';

const router = Router();

// Send registration OTP
router.post('/send-registration-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    const otp = otpService.generateOtp(cleanEmail, 'registration');
    res.json({
      message: `Security verification OTP sent to ${cleanEmail}. Valid for 10 minutes.`,
      expiresAt: otp.expiresAt,
      devOtp: otp.code, // Included for zero-friction sandbox testing
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to dispatch registration OTP.' });
  }
});

// Register new investor (requires OTP verification)
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, referralCode, otpCode } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (!otpCode || otpCode.trim().length !== 6) {
      res.status(400).json({ error: 'A valid 6-digit email verification code is required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify OTP
    const isOtpValid = otpService.verifyOtp(cleanEmail, otpCode, 'registration');
    if (!isOtpValid) {
      res.status(400).json({ error: 'Invalid or expired 6-digit verification code.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const existingUser = db.getUserByEmail(cleanEmail);
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    let validReferredBy: string | null = null;
    if (referralCode) {
      const referrer = db.getUserByReferralCode(referralCode);
      if (referrer) {
        validReferredBy = referrer.referralCode;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const generatedReferralCode = `HERON-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: User = {
      id: `usr_${uuidv4()}`,
      email: cleanEmail,
      name: name.trim(),
      passwordHash,
      role: 'user',
      balance: 0.00, // Balance starts at zero; credited only upon admin deposit confirmation or executive top-up
      referralCode: generatedReferralCode,
      referredBy: validReferredBy,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    const accessToken = authService.generateAccessToken(newUser);
    const refreshToken = authService.generateRefreshToken(newUser);

    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Account created and verified successfully.',
      token: accessToken,
      accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Your account has been suspended by compliance.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      message: 'Authentication successful.',
      token: accessToken,
      accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Refresh Token Rotation
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required.' });
      return;
    }

    const rotated = authService.refreshTokens(refreshToken);
    const { passwordHash: _, ...safeUser } = rotated.user;

    res.json({
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Token refresh failed.', code: 'REFRESH_FAILED' });
  }
});

// Logout (Revoke Refresh Token)
router.post('/logout', (req: Request, res: Response): void => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      authService.revokeRefreshToken(refreshToken);
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (err: any) {
    res.json({ message: 'Logged out.' });
  }
});

// Get authenticated user profile
router.get('/me', authenticateToken, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const user = db.getUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

export default router;
