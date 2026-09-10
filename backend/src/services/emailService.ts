import * as nodemailer from 'nodemailer';

interface SendOtpEmailParams {
  to: string;
  code: string;
  purpose: 'registration' | 'withdrawal' | 'security';
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for 587 / other ports
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`✉️ [Email Service] SMTP Configured (${host}:${port})`);
    } else {
      console.log('ℹ️ [Email Service] Standard SMTP environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) not set. Email dispatch will log to console.');
    }
  }

  /**
   * Dispatches a real security OTP email to user inbox
   */
  public async sendOtpEmail({ to, code, purpose }: SendOtpEmailParams): Promise<boolean> {
    const title = purpose === 'registration'
      ? 'Identity Verification Code'
      : purpose === 'withdrawal'
      ? 'Capital Withdrawal Authorization'
      : 'Security Authorization Code';

    const fromAddress = process.env.SMTP_FROM || 'Heron Assets Trustee <security@stealthssolutions.com>';

    const htmlContent = `
      <div style="background-color: #0d0f0e; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #EAECEF;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #181A20; border: 1px solid #2B313A; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; padding: 10px 16px; background-color: rgba(240, 185, 11, 0.1); border: 1px solid rgba(240, 185, 11, 0.3); border-radius: 30px; color: #F0B90B; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
              HERON ASSETS TRUSTEE • INSTITUTIONAL DEFENSE
            </div>
          </div>

          <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #FFFFFF; text-align: center; font-weight: 700;">
            ${title}
          </h2>

          <p style="margin: 0 0 24px 0; font-size: 14px; color: #848E9C; line-height: 1.6; text-align: center;">
            Please use the 6-digit security code below to authorize your ${purpose} request. This code is valid for 10 minutes.
          </p>

          <div style="background: linear-gradient(135deg, rgba(240,185,11,0.08) 0%, rgba(24,26,32,1) 100%); border: 1px solid rgba(240, 185, 11, 0.4); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px;">
            <div style="font-family: 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #F0B90B;">
              ${code}
            </div>
          </div>

          <div style="border-top: 1px solid #2B313A; pt: 20px; padding-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #848E9C;">
              If you did not initiate this action, please contact your Security Trustee immediately.
            </p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #474D57;">
              © 2026 Heron Assets Trustee Platform. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `;

    if (!this.transporter) {
      console.log(`📧 [Real Email Simulation] Dispatching OTP [${code}] to ${to} (${purpose})`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: fromAddress,
        to,
        subject: `[Heron Trustee] ${code} is your ${title}`,
        html: htmlContent,
      });
      console.log(`✅ [Real Email Dispatched] OTP successfully sent to ${to}`);
      return true;
    } catch (err: any) {
      console.error(`❌ [Email Error] Failed to send email to ${to}:`, err.message);
      return false;
    }
  }
}

export const emailService = new EmailService();
