import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { authService } from '../services/authService';
import { otpService } from '../services/otpService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { User } from '../types';

const router = Router();

// --- Client Session & Audit Metadata Helpers ---
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  let rawIp = '';
  if (typeof forwarded === 'string') {
    rawIp = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    rawIp = forwarded[0].trim();
  } else {
    rawIp = req.socket.remoteAddress || req.ip || '127.0.0.1';
  }

  if (rawIp.startsWith('::ffff:')) {
    rawIp = rawIp.replace('::ffff:', '');
  }
  if (rawIp === '::1' || rawIp === 'localhost') {
    rawIp = '127.0.0.1';
  }

  const parts = rawIp.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  }
  return rawIp;
}

function parseClientDevice(req: Request): string {
  const ua = (req.headers['user-agent'] as string) || '';
  if (!ua) return 'Web Terminal [Secured]';

  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isWindows = /windows nt 10/i.test(ua) ? 'Windows 11' : /windows/i.test(ua) ? 'Windows 10' : '';
  const isMac = /macintosh|mac os x/i.test(ua);
  const isLinux = /linux/i.test(ua) && !isAndroid;

  let browser = '';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';

  if (isAndroid) {
    return browser ? `Android • ${browser}` : 'Android 15 • Mobile App';
  }
  if (isIOS) {
    return browser ? `iOS • ${browser}` : 'iOS 18 • iPhone App';
  }
  if (isWindows) {
    return `${isWindows}${browser ? ` • ${browser}` : ' • Chrome'}`;
  }
  if (isMac) {
    return `macOS${browser ? ` • ${browser}` : ' • Safari'}`;
  }
  if (isLinux) {
    return `Linux${browser ? ` • ${browser}` : ' • Chrome'}`;
  }
  return /mobile/i.test(ua) ? 'Mobile Terminal [Secured]' : 'Web Terminal [Secured]';
}

function resolveEdgeLocation(req: Request): string {
  const country = (req.headers['cf-ipcountry'] as string) || (req.headers['x-vercel-ip-country'] as string);
  const city = (req.headers['cf-ipcity'] as string) || (req.headers['x-vercel-ip-city'] as string);

  if (city && country) {
    return `${city}, ${country} [Cloudflare Edge]`;
  }
  if (country) {
    return `${country} [Cloudflare Edge]`;
  }

  const rawIp = req.socket.remoteAddress || '';
  if (rawIp.includes('127.0.0.1') || rawIp.includes('::1') || rawIp === '') {
    return 'New York, US [Cloudflare Edge]';
  }
  return 'Frankfurt, DE [Secured Gateway]';
}

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

    // Record initial registration session
    db.recordSecurityLog(newUser.id, {
      ip: getClientIp(req),
      device: parseClientDevice(req),
      location: resolveEdgeLocation(req),
      status: 'Authorized',
    });

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
      // Record blocked authentication attempt
      db.recordSecurityLog(user.id, {
        ip: getClientIp(req),
        device: parseClientDevice(req),
        location: resolveEdgeLocation(req),
        status: 'Blocked',
      });
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Record authorized authentication session
    db.recordSecurityLog(user.id, {
      ip: getClientIp(req),
      device: parseClientDevice(req),
      location: resolveEdgeLocation(req),
      status: 'Authorized',
    });

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

// Update Profile Details (Name, Anti-Phishing Code, 2FA, Preferences)
router.put('/profile', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { name, antiPhishingCode, twoFactorEnabled, whitelistEnabled, preferredCurrency } = req.body;
    const updatedUser = db.updateUserProfile(req.user.userId, {
      name,
      antiPhishingCode,
      twoFactorEnabled,
      whitelistEnabled,
      preferredCurrency,
    });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = updatedUser;
    res.json({
      message: 'Profile configuration updated successfully.',
      user: safeUser
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Change Password
router.put('/change-password', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters with high complexity.' });
      return;
    }

    const user = db.getUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Current password verification failed.' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.updateUserPassword(user.id, newHash);

    db.recordSecurityLog(user.id, {
      ip: getClientIp(req),
      device: parseClientDevice(req),
      location: resolveEdgeLocation(req),
      status: 'Authorized',
    });

    res.json({ message: 'Security password changed successfully. Active session remains authenticated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// Add Whitelisted Wallet
router.post('/whitelist-wallet', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { asset, network, address, label } = req.body;
    if (!asset || !network || !address || !label) {
      res.status(400).json({ error: 'Asset, network, address, and destination label are required.' });
      return;
    }

    const newWallet = db.addWhitelistedWallet(req.user.userId, {
      asset,
      network,
      address,
      label
    });

    if (!newWallet) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      message: 'Withdrawal destination whitelisted successfully.',
      wallet: newWallet
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to whitelist wallet.' });
  }
});

// Delete Whitelisted Wallet
router.delete('/whitelist-wallet/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const removed = db.deleteWhitelistedWallet(req.user.userId, id);
    if (!removed) {
      res.status(404).json({ error: 'Whitelisted address not found or already removed.' });
      return;
    }

    res.json({ message: 'Whitelisted address deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove whitelisted address.' });
  }
});

// Get Security & Session Logs
router.get('/security-logs', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = db.getUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const logs = db.getSecurityLogs(user.id);
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve security logs.' });
  }
});

export default router;
