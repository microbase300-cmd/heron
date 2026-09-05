import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { User, RefreshToken } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'heron_institutional_vault_secret_2026';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;

export interface TokenPayload {
  id: string;
  userId: string;
  email: string;
  role: User['role'];
}

export class AuthService {
  /**
   * Generates a short-lived Access Token (15 min)
   */
  public generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  /**
   * Generates and stores a cryptographically secure, rotated Refresh Token (7 days)
   */
  public generateRefreshToken(user: User): string {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    const refreshTokenRecord: RefreshToken = {
      id: `rft_${uuidv4()}`,
      userId: user.id,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.saveRefreshToken(refreshTokenRecord);
    return rawToken;
  }

  /**
   * Validates and rotates an existing Refresh Token
   */
  public refreshTokens(rawRefreshToken: string): { accessToken: string; refreshToken: string; user: User } {
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const tokenRecord = db.findRefreshToken(tokenHash);

    if (!tokenRecord) {
      throw new Error('Invalid or revoked refresh token');
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      db.revokeRefreshToken(tokenHash);
      throw new Error('Refresh token expired');
    }

    const user = db.getUserById(tokenRecord.userId);
    if (!user || user.status === 'suspended') {
      throw new Error('User account not found or suspended');
    }

    // Revoke the old token (Single-use rotation)
    db.revokeRefreshToken(tokenHash);

    // Issue new pair
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  /**
   * Revokes a refresh token on logout
   */
  public revokeRefreshToken(rawRefreshToken: string): void {
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    db.revokeRefreshToken(tokenHash);
  }

  /**
   * Verifies an access token
   */
  public verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}

export const authService = new AuthService();
