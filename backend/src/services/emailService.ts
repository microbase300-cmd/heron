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
    require('dotenv').config();
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host === '127.0.0.1' || host === 'localhost') {
      this.transporter = nodemailer.createTransport({
        host: '127.0.0.1',
        port: port || 25,
        secure: false,
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`✉️ [Email Service] Local Postfix SMTP Configured (127.0.0.1:${port || 25})`);
    } else if (host && user && pass) {
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

    const fromAddress = process.env.SMTP_FROM || 'Heron Assets Trustee <support@heronassetstrusteess.com>';

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
              If you did not initiate this action, please contact your Security Trustee immediately at support@heronassetstrusteess.com.
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
        sender: 'support@heronassetstrusteess.com',
        replyTo: 'support@heronassetstrusteess.com',
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

  /**
   * Dispatches instant notification to admin when live chat is initiated
   */
  public async sendLiveChatAlertEmail(params: {
    to?: string;
    userName: string;
    userEmail: string;
    userBalance?: number;
    initialMessage?: string;
    chatId: string;
  }): Promise<boolean> {
    const adminEmail = params.to || process.env.ADMIN_ALERT_EMAIL || 'support@heronassetstrusteess.com';
    const fromAddress = process.env.SMTP_FROM || 'Heron Support <support@heronassetstrusteess.com>';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #181A20; padding: 30px; color: #EAECEF;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #1E2329; border: 1px solid #F0B90B; border-radius: 16px; padding: 32px;">
          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0; color: #F0B90B; font-size: 20px; font-weight: 700;">🚨 Live Support Request Alert</h2>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #EAECEF; margin-bottom: 16px;">
            An investor has requested an immediate conversation with a live human representative on Heron Assets Trustee.
          </p>

          <div style="background-color: #181A20; border: 1px solid #2B313A; border-radius: 10px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
            <div style="margin-bottom: 8px;"><strong>Investor:</strong> ${params.userName}</div>
            <div style="margin-bottom: 8px;"><strong>Email:</strong> ${params.userEmail}</div>
            <div style="margin-bottom: 8px;"><strong>Account Balance:</strong> $${(params.userBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</div>
            <div><strong>Initial Message:</strong> "${params.initialMessage || 'Client is waiting for a live agent...'}"</div>
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://admin.heronassetstrusteess.com" style="background-color: #F0B90B; color: #181A20; padding: 12px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 14px;">
              Open Admin Support Desk →
            </a>
          </div>

          <p style="margin: 0; font-size: 11px; color: #848E9C; text-align: center;">
            Chat Session ID: ${params.chatId} • Heron Assets Institutional Desk
          </p>
        </div>
      </div>
    `;

    if (!this.transporter) {
      console.log(`📧 [Real Email Simulation] Live Chat Alert to ${adminEmail} for ${params.userName} (${params.userEmail})`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject: `🚨 [URGENT LIVE CHAT] Investor ${params.userName} is waiting for a representative`,
        html: htmlContent,
      });
      console.log(`✅ [Live Chat Alert Sent] Dispatched to ${adminEmail}`);
      return true;
    } catch (err: any) {
      console.error(`❌ [Live Chat Alert Error]`, err.message);
      return false;
    }
  }

  /**
   * Dispatches a custom outbound email via verified SMTP (Port 587)
   */
  public async sendCustomEmail(params: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    fromName?: string;
    replyTo?: string;
    attachments?: Array<{ filename: string; content?: any; path?: string; contentType?: string }>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const defaultFrom = process.env.SMTP_FROM || 'Heron Assets Trustee <support@heronassetstrusteess.com>';
    const emailMatch = defaultFrom.match(/<([^>]+)>/);
    const pureEmail = emailMatch ? emailMatch[1] : 'support@heronassetstrusteess.com';
    const from = params.fromName ? `"${params.fromName}" <${pureEmail}>` : defaultFrom;

    if (!this.transporter) {
      console.log(`📧 [Simulated Email] To: ${params.to} | Subject: ${params.subject}`);
      return { success: true, messageId: `sim_${Date.now()}` };
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
        replyTo: params.replyTo,
        subject: params.subject,
        text: params.text,
        html: params.html || (params.text ? `<div style="font-family: Arial, sans-serif; white-space: pre-wrap; color: #111;">${params.text}</div>` : ''),
        attachments: params.attachments
      });
      console.log(`✅ [Custom Email Sent] Dispatched to ${params.to} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`❌ [Custom Email Error]`, err.message);
      return { success: false, error: err.message };
    }
  }
}

export const emailService = new EmailService();
