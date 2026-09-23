import * as nodemailer from 'nodemailer';

interface SendOtpEmailParams {
  to: string;
  code: string;
  purpose: 'registration' | 'withdrawal' | 'reset_password' | 'security';
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
      : purpose === 'reset_password'
      ? 'Password Reset Security Code'
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

  /**
   * Dispatches deposit initiation notification to investor
   */
  public async sendDepositInitiatedEmail(params: {
    to: string;
    name: string;
    amount: number;
    asset: string;
    txHash: string;
  }): Promise<boolean> {
    const fromAddress = process.env.SMTP_FROM || 'Heron Assets Trustee <support@heronassetstrusteess.com>';
    const formattedAmount = params.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const shortHash = params.txHash.length > 20 ? `${params.txHash.slice(0, 10)}...${params.txHash.slice(-8)}` : params.txHash;

    const htmlContent = `
      <div style="background-color: #0b0e11; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EAECEF;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #181A20; border: 1px solid #2B313A; border-radius: 16px; padding: 36px; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
          
          <!-- Header Badge -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 8px 18px; background: rgba(240, 185, 11, 0.1); border: 1px solid rgba(240, 185, 11, 0.35); border-radius: 30px; color: #F0B90B; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">
              HERON ASSETS TRUSTEE • INBOUND SETTLEMENT
            </div>
          </div>

          <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #FFFFFF; text-align: center; font-weight: 700;">
            Deposit Request Awaiting Confirmation
          </h2>

          <p style="margin: 0 0 24px 0; font-size: 14px; color: #848E9C; line-height: 1.6; text-align: center;">
            Dear <strong style="color: #FFFFFF;">${params.name || 'Investor'}</strong>, your inbound capital deposit has been submitted to the institutional settlement desk and is currently under blockchain verification.
          </p>

          <!-- Transaction Summary Card -->
          <div style="background-color: #1E2329; border: 1px solid #2B313A; border-radius: 12px; padding: 22px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Deposit Asset:</td>
                <td style="padding: 8px 0; color: #FFFFFF; font-weight: 600; text-align: right;">${params.asset}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Amount:</td>
                <td style="padding: 8px 0; color: #F0B90B; font-size: 18px; font-weight: 700; text-align: right;">$${formattedAmount} USD</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Verification Hash:</td>
                <td style="padding: 8px 0; font-family: monospace; color: #EAECEF; text-align: right; font-size: 12px;">${shortHash}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Status:</td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="background: rgba(240, 185, 11, 0.15); color: #F0B90B; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                    ⏳ Pending Blockchain Nodes
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background-color: rgba(255,255,255,0.02); border-left: 3px solid #F0B90B; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #B7BDC6; line-height: 1.5;">
              <strong>Settlement Note:</strong> Once the requisite institutional confirmations are registered, your portfolio balance will immediately reflect this deposit and you will receive a secondary clearance notification.
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://heronassetstrusteess.com/dashboard" style="background-color: #F0B90B; color: #181A20; padding: 13px 32px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px;">
              View Dashboard Portfolio →
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #2B313A; padding-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #848E9C;">
              Security & Settlement Operations • Heron Assets Trustee Platform
            </p>
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #474D57;">
              If you did not initiate this deposit, contact our defense desk immediately at support@heronassetstrusteess.com
            </p>
          </div>

        </div>
      </div>
    `;

    return this.sendCustomEmail({
      to: params.to,
      subject: `Deposit Initiated: $${formattedAmount} ${params.asset} [Pending Confirmation]`,
      html: htmlContent
    }).then(res => res.success).catch(err => {
      console.error('Failed to send deposit initiated email:', err);
      return false;
    });
  }

  /**
   * Dispatches deposit approved / confirmed notification to investor
   */
  public async sendDepositConfirmedEmail(params: {
    to: string;
    name: string;
    amount: number;
    asset: string;
    newBalance?: number;
    txHash?: string;
  }): Promise<boolean> {
    const formattedAmount = params.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedBalance = params.newBalance !== undefined 
      ? params.newBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : null;
    const shortHash = params.txHash && params.txHash.length > 20 
      ? `${params.txHash.slice(0, 10)}...${params.txHash.slice(-8)}` 
      : (params.txHash || 'N/A');

    const htmlContent = `
      <div style="background-color: #0b0e11; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EAECEF;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #181A20; border: 1px solid #0ECB81; border-radius: 16px; padding: 36px; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
          
          <!-- Header Badge -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 8px 18px; background: rgba(14, 203, 129, 0.1); border: 1px solid rgba(14, 203, 129, 0.35); border-radius: 30px; color: #0ECB81; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">
              ✓ SETTLEMENT CONFIRMED • FUNDS CREDITED
            </div>
          </div>

          <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #FFFFFF; text-align: center; font-weight: 700;">
            Deposit Approved & Credited
          </h2>

          <p style="margin: 0 0 24px 0; font-size: 14px; color: #848E9C; line-height: 1.6; text-align: center;">
            Dear <strong style="color: #FFFFFF;">${params.name || 'Investor'}</strong>, your deposit has been verified, cleared by the Treasury Settlement Desk, and credited to your active portfolio balance.
          </p>

          <!-- Transaction Summary Card -->
          <div style="background-color: #1E2329; border: 1px solid #2B313A; border-radius: 12px; padding: 22px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Credited Asset:</td>
                <td style="padding: 8px 0; color: #FFFFFF; font-weight: 600; text-align: right;">${params.asset}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Amount Credited:</td>
                <td style="padding: 8px 0; color: #0ECB81; font-size: 20px; font-weight: 700; text-align: right;">+$${formattedAmount} USD</td>
              </tr>
              ${formattedBalance ? `
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">New Portfolio Balance:</td>
                <td style="padding: 8px 0; color: #F0B90B; font-weight: 700; text-align: right;">$${formattedBalance} USD</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Reference Hash:</td>
                <td style="padding: 8px 0; font-family: monospace; color: #EAECEF; text-align: right; font-size: 12px;">${shortHash}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Status:</td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="background: rgba(14, 203, 129, 0.15); color: #0ECB81; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                    ✓ Completed & Available
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://heronassetstrusteess.com/dashboard" style="background-color: #0ECB81; color: #181A20; padding: 13px 32px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px;">
              Access Dashboard & Allocation →
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #2B313A; padding-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #848E9C;">
              Heron Assets Trustee Global Custody & Settlement
            </p>
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #474D57;">
              © 2026 Heron Assets Trustee Platform. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `;

    return this.sendCustomEmail({
      to: params.to,
      subject: `Deposit Confirmed: $${formattedAmount} ${params.asset} Credited to Your Account`,
      html: htmlContent
    }).then(res => res.success).catch(err => {
      console.error('Failed to send deposit confirmed email:', err);
      return false;
    });
  }

  /**
   * Dispatches withdrawal approved & disbursed notification to investor
   */
  public async sendWithdrawalApprovedEmail(params: {
    to: string;
    name: string;
    amount: number;
    asset: string;
    destinationAddress?: string;
    txHash?: string;
  }): Promise<boolean> {
    const formattedAmount = params.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const shortHash = params.txHash && params.txHash.length > 20 
      ? `${params.txHash.slice(0, 10)}...${params.txHash.slice(-8)}` 
      : (params.txHash || 'Verified On-Chain');
    const destDisplay = params.destinationAddress && params.destinationAddress.length > 16
      ? `${params.destinationAddress.slice(0, 8)}...${params.destinationAddress.slice(-6)}`
      : (params.destinationAddress || 'Custody Registered Wallet');

    const htmlContent = `
      <div style="background-color: #0b0e11; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EAECEF;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #181A20; border: 1px solid #2B313A; border-radius: 16px; padding: 36px; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
          
          <!-- Header Badge -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 8px 18px; background: rgba(14, 203, 129, 0.1); border: 1px solid rgba(14, 203, 129, 0.35); border-radius: 30px; color: #0ECB81; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">
              HERON ASSETS TRUSTEE • WITHDRAWAL DISBURSED
            </div>
          </div>

          <!-- Title -->
          <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">
            Withdrawal Request Approved & Executed
          </h1>
          <p style="color: #848E9C; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
            Dear <strong style="color: #EAECEF;">${params.name}</strong>, your withdrawal authorization has been approved by the Settlement Treasury Desk. Funds have been released and broadcast to your destination address.
          </p>

          <!-- Transaction Summary Card -->
          <div style="background-color: #121418; border: 1px solid #2B313A; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Disbursement Asset:</td>
                <td style="padding: 8px 0; color: #EAECEF; font-weight: 600; text-align: right;">${params.asset}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Disbursed Amount:</td>
                <td style="padding: 8px 0; color: #F0B90B; font-size: 20px; font-weight: 700; text-align: right;">$${formattedAmount} USD</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Destination Address:</td>
                <td style="padding: 8px 0; font-family: monospace; color: #EAECEF; text-align: right; font-size: 12px;">${destDisplay}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Settlement Tx Hash:</td>
                <td style="padding: 8px 0; font-family: monospace; color: #0ECB81; text-align: right; font-size: 12px;">${shortHash}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #848E9C;">Settlement Status:</td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="background: rgba(14, 203, 129, 0.15); color: #0ECB81; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                    ✓ Approved & Dispatched
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background-color: rgba(240, 185, 11, 0.05); border: 1px dashed rgba(240, 185, 11, 0.3); border-radius: 10px; padding: 14px; margin-bottom: 24px; font-size: 12px; color: #848E9C; line-height: 1.5;">
            <strong style="color: #F0B90B;">Note:</strong> Depending on network traffic for <span style="color: #EAECEF;">${params.asset}</span>, the transfer may require standard block confirmations before showing in your private wallet balance.
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://heronassetstrusteess.com/dashboard" style="background-color: #F0B90B; color: #181A20; padding: 13px 32px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px;">
              View Portfolio & Audit Ledger →
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #2B313A; padding-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #848E9C;">
              Heron Assets Trustee Global Custody & Settlement Treasury
            </p>
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #474D57;">
              © 2026 Heron Assets Trustee Platform. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `;

    return this.sendCustomEmail({
      to: params.to,
      subject: `Withdrawal Approved: $${formattedAmount} ${params.asset} Dispatched`,
      html: htmlContent
    }).then(res => res.success).catch(err => {
      console.error('Failed to send withdrawal approved email:', err);
      return false;
    });
  }
}

export const emailService = new EmailService();
