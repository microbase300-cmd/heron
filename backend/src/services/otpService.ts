import { v4 as uuidv4 } from 'uuid';
import { OtpRecord } from '../types';

class OtpService {
  private otps: Map<string, OtpRecord> = new Map();
  private readonly TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Generates a 6-digit secure numeric verification OTP
   */
  public generateOtp(email: string, purpose: OtpRecord['purpose']): { code: string; expiresAt: number } {
    const cleanEmail = email.toLowerCase().trim();
    // Generate 6 digit random number between 100000 and 999999
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + this.TTL_MS;

    const record: OtpRecord = {
      id: `otp_${uuidv4()}`,
      email: cleanEmail,
      code,
      purpose,
      expiresAt,
      createdAt: now,
    };

    // Store keyed by email:purpose
    const key = `${cleanEmail}:${purpose}`;
    this.otps.set(key, record);

    console.log(`🔑 [OTP Dispatch] Dispatched ${purpose.toUpperCase()} OTP for ${cleanEmail}: ${code} (Expires in 10m)`);

    return { code, expiresAt };
  }

  /**
   * Verifies and consumes a 6-digit OTP
   */
  public verifyOtp(email: string, code: string, purpose: OtpRecord['purpose']): boolean {
    const cleanEmail = email.toLowerCase().trim();
    const key = `${cleanEmail}:${purpose}`;
    const record = this.otps.get(key);

    if (!record) {
      console.warn(`⚠️ [OTP Verification Failed] No active OTP found for ${cleanEmail} (${purpose})`);
      return false;
    }

    if (Date.now() > record.expiresAt) {
      console.warn(`⚠️ [OTP Verification Failed] OTP expired for ${cleanEmail} (${purpose})`);
      this.otps.delete(key);
      return false;
    }

    if (record.code !== code.trim()) {
      console.warn(`⚠️ [OTP Verification Failed] Incorrect OTP code provided for ${cleanEmail} (${purpose})`);
      return false;
    }

    // Consume OTP so it cannot be re-used
    this.otps.delete(key);
    console.log(`✅ [OTP Verified] Successfully verified ${purpose} OTP for ${cleanEmail}`);
    return true;
  }

  /**
   * Optional helper to check current OTP in dev mode
   */
  public getRecentOtp(email: string, purpose: OtpRecord['purpose']): string | null {
    const cleanEmail = email.toLowerCase().trim();
    const key = `${cleanEmail}:${purpose}`;
    const record = this.otps.get(key);
    if (record && Date.now() <= record.expiresAt) {
      return record.code;
    }
    return null;
  }
}

export const otpService = new OtpService();
