import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { emailService } from '../services/emailService';
import { WebmailFolder, WebmailMessage } from '../types';

const router = Router();

const RESEND_API_BASE = 'https://api.resend.com';

function getResendApiKey(): string {
  return process.env.RESEND_API_KEY || process.env.SMTP_PASS || '';
}

/**
 * Parse an email sender string into name and address
 * E.g.: '"Heron Support" <support@heronassetstrusteess.com>' or 'user@gmail.com'
 */
function parseSender(fromRaw: string, headersFrom?: string): { address: string; name?: string } {
  const source = headersFrom || fromRaw || '';
  if (!source) return { address: 'support@heronassetstrusteess.com' };

  // Match: "Name" <email> or Name <email>
  const match = source.match(/^(?:"?([^"]*)"?\s)?(?:<?([^\s<]+@[^\s>]+)>?)$/);
  if (match) {
    const name = match[1] ? match[1].trim() : undefined;
    const address = match[2] ? match[2].trim() : fromRaw;
    return { address: address || fromRaw, name: name || undefined };
  }

  if (source.includes('<') && source.includes('>')) {
    const angleMatch = source.match(/(.*?)\s*<([^>]+)>/);
    if (angleMatch) {
      const name = angleMatch[1].replace(/["']/g, '').trim();
      const address = angleMatch[2].trim();
      return { address: address || fromRaw, name: name || undefined };
    }
  }

  return { address: fromRaw || source.replace(/["'<>]/g, '').trim() };
}

/**
 * Fetch a single received email from Resend Receiving API
 */
export async function fetchResendEmail(emailId: string): Promise<any | null> {
  const apiKey = getResendApiKey();
  try {
    const response = await fetch(`${RESEND_API_BASE}/emails/receiving/${emailId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'HeronAssets-Webmail/1.0'
      }
    });

    if (!response.ok) {
      console.warn(`[Resend Receiving] Failed to fetch email ${emailId}: HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as any;
    return data;
  } catch (err: any) {
    console.error(`[Resend Receiving] Network error fetching email ${emailId}:`, err.message || err);
    return null;
  }
}

/**
 * Fetch list of received emails from Resend Receiving API
 */
export async function fetchResendReceivedList(): Promise<any[]> {
  const apiKey = getResendApiKey();
  try {
    const response = await fetch(`${RESEND_API_BASE}/emails/receiving`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'HeronAssets-Webmail/1.0'
      }
    });

    if (!response.ok) {
      console.warn(`[Resend Receiving] Failed to fetch list: HTTP ${response.status}`);
      return [];
    }

    const data = (await response.json()) as any;
    return Array.isArray(data?.data) ? data.data : [];
  } catch (err: any) {
    console.error('[Resend Receiving] Network error fetching received list:', err.message || err);
    return [];
  }
}

/**
 * Import or update a Resend received email into the database
 */
export function importResendEmail(resendEmail: any): WebmailMessage | null {
  if (!resendEmail || !resendEmail.id) return null;

  const resendId = String(resendEmail.id).trim();
  const messageId = String(resendEmail.message_id || resendEmail.headers?.['message-id'] || '').trim();

  // Extract and format sender
  const sender = parseSender(resendEmail.from, resendEmail.headers?.from);

  // Normalize recipient(s)
  let toAddresses: string[] = [];
  if (Array.isArray(resendEmail.to)) {
    toAddresses = resendEmail.to.map((s: any) => String(s).trim());
  } else if (typeof resendEmail.to === 'string') {
    toAddresses = resendEmail.to.split(',').map((s: string) => s.trim());
  } else {
    toAddresses = ['support@heronassetstrusteess.com'];
  }

  const subject = String(resendEmail.subject || '(No Subject)').trim();
  const bodyText = String(resendEmail.text || (resendEmail.html ? resendEmail.html.replace(/<[^>]*>?/gm, ' ') : '')).trim();
  const bodyHtml = resendEmail.html || undefined;
  const replyTo = Array.isArray(resendEmail.reply_to) && resendEmail.reply_to.length > 0
    ? resendEmail.reply_to[0]
    : (typeof resendEmail.reply_to === 'string' ? resendEmail.reply_to : sender.address);
  const date = resendEmail.created_at || resendEmail.date || new Date().toISOString();

  // Check if this email was already saved
  const existing = db.findWebmailMessage(m =>
    (Boolean(resendId) && m.headers?.['x-resend-id'] === resendId) ||
    (Boolean(messageId) && m.headers?.['message-id'] === messageId)
  );

  if (existing) {
    // If it was stored as an incomplete placeholder, update it with real body and sender
    if (existing.from === 'unknown@domain.com' || !existing.bodyText) {
      db.updateWebmailMessage(existing.id, {
        from: sender.address,
        fromName: sender.name,
        to: toAddresses,
        replyTo,
        subject,
        bodyText,
        bodyHtml,
        date,
        headers: {
          ...(existing.headers || {}),
          'x-resend-id': resendId,
          'message-id': messageId
        }
      });
      console.log(`📥 [Webmail] Updated placeholder message ${existing.id} with complete Resend email (${sender.address}: "${subject}")`);
      return db.getWebmailMessageById(existing.id) || null;
    }
    return existing;
  }

  // Remove any stale dummy placeholders created before full sync
  db.deleteWebmailMessageByFilter(m => m.from === 'unknown@domain.com' && m.subject === '(No Subject)');

  const saved = db.saveWebmailMessage({
    folder: 'inbox',
    from: sender.address,
    fromName: sender.name,
    to: toAddresses,
    replyTo,
    subject,
    bodyText,
    bodyHtml,
    isRead: false,
    date,
    headers: {
      'x-resend-id': resendId,
      'message-id': messageId
    }
  });

  console.log(`📥 [Webmail Inbound] Ingested email from ${sender.address} regarding "${subject}" (ID: ${saved.id}, Resend: ${resendId})`);
  return saved;
}

/**
 * Background / on-demand sync from Resend Receiving queue
 */
export async function syncReceivedEmailsFromResend(): Promise<number> {
  try {
    const list = await fetchResendReceivedList();
    if (!list || list.length === 0) return 0;

    let importedCount = 0;
    for (const item of list) {
      const exists = db.findWebmailMessage(m =>
        (item.id && m.headers?.['x-resend-id'] === item.id) ||
        (item.message_id && m.headers?.['message-id'] === item.message_id)
      );

      // If exists with valid sender and text, skip
      if (exists && exists.from !== 'unknown@domain.com' && exists.bodyText) {
        continue;
      }

      const fullEmail = await fetchResendEmail(item.id);
      if (fullEmail) {
        const imported = importResendEmail(fullEmail);
        if (imported) importedCount++;
      }
    }

    if (importedCount > 0) {
      console.log(`📥 [Resend Sync] Synced ${importedCount} incoming email(s) into database`);
    }
    return importedCount;
  } catch (err: any) {
    console.warn('⚠️ [Resend Sync Warning]:', err.message || err);
    return 0;
  }
}

// Throttle for route-triggered background syncs
let lastSyncTimestamp = 0;
const SYNC_THROTTLE_MS = 10000;

function triggerThrottledSync(): void {
  const now = Date.now();
  if (now - lastSyncTimestamp > SYNC_THROTTLE_MS) {
    lastSyncTimestamp = now;
    syncReceivedEmailsFromResend().catch(() => {});
  }
}

/* -------------------------------------------------------------------------- */
/*                         INBOUND EMAIL WEBHOOK (RECEIVING)                  */
/* -------------------------------------------------------------------------- */

/**
 * Universal webhook endpoint to receive incoming emails
 * Supports Resend webhooks (email.received) as well as direct JSON forwarders
 */
router.post('/inbound', async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};

    // 1. Check if this is a Resend webhook event
    const emailId = payload.data?.email_id || payload.data?.id || payload.email_id || payload.id;
    if (emailId) {
      console.log(`📥 [Webmail Webhook] Processing Resend email ID: ${emailId}`);
      const fullEmail = await fetchResendEmail(emailId);
      if (fullEmail) {
        const saved = importResendEmail(fullEmail);
        res.json({
          success: true,
          id: saved?.id,
          emailId,
          message: 'Resend inbound email successfully retrieved and stored in inbox'
        });
        return;
      }
    }

    // 2. Direct or generic webhook payload fallback
    let fromAddress = payload.from || payload.sender || 'unknown@domain.com';
    let fromName = payload.fromName || payload.name;
    const parsed = parseSender(fromAddress);
    fromAddress = parsed.address;
    fromName = fromName || parsed.name;

    let toAddresses: string[] = [];
    if (Array.isArray(payload.to)) {
      toAddresses = payload.to;
    } else if (typeof payload.to === 'string') {
      toAddresses = payload.to.split(',').map((s: string) => s.trim());
    } else if (payload.recipient) {
      toAddresses = [String(payload.recipient).trim()];
    } else {
      toAddresses = ['support@heronassetstrusteess.com'];
    }

    const subject = payload.subject || '(No Subject)';
    const bodyText = payload.text || payload.bodyText || payload.body || '';
    const bodyHtml = payload.html || payload.bodyHtml;

    const saved = db.saveWebmailMessage({
      folder: 'inbox',
      from: fromAddress,
      fromName: fromName || undefined,
      to: toAddresses,
      replyTo: payload.replyTo || fromAddress,
      subject,
      bodyText: bodyText || (bodyHtml ? bodyHtml.replace(/<[^>]*>?/gm, ' ') : ''),
      bodyHtml,
      isRead: false,
      date: payload.date || new Date().toISOString(),
      headers: payload.headers || undefined
    });

    console.log(`📥 [Webmail Inbound] Received direct email from ${fromAddress} regarding "${subject}" (ID: ${saved.id})`);

    res.json({
      success: true,
      id: saved.id,
      message: 'Inbound message processed and saved to institutional inbox'
    });
  } catch (err: any) {
    console.error('Error handling inbound email:', err);
    res.status(500).json({ error: 'Failed to process inbound email' });
  }
});

/**
 * Manual sync endpoint to trigger Resend receiving sync
 */
router.post('/sync', async (_req: Request, res: Response) => {
  try {
    const importedCount = await syncReceivedEmailsFromResend();
    const stats = db.getWebmailStats();
    res.json({
      success: true,
      importedCount,
      stats
    });
  } catch (err: any) {
    console.error('Error in manual webmail sync:', err);
    res.status(500).json({ error: 'Failed to synchronize webmail' });
  }
});

/* -------------------------------------------------------------------------- */
/*                         OUTBOUND EMAIL (SENDING VIA PORT 587)              */
/* -------------------------------------------------------------------------- */

/**
 * Send email or save draft
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const {
      to,
      subject,
      bodyText,
      bodyHtml,
      fromName = 'Heron Assets Trustee Support',
      replyTo,
      isDraft = false
    } = req.body;

    if (!to || (Array.isArray(to) && to.length === 0)) {
      res.status(400).json({ error: 'Recipient address (to) is required.' });
      return;
    }

    const toList = Array.isArray(to) ? to : [String(to).trim()];
    const cleanSubject = String(subject || '(No Subject)').trim();
    const cleanText = String(bodyText || '').trim();

    if (isDraft) {
      const draft = db.saveWebmailMessage({
        folder: 'drafts',
        from: 'support@heronassetstrusteess.com',
        fromName,
        to: toList,
        replyTo,
        subject: cleanSubject,
        bodyText: cleanText,
        bodyHtml,
        isRead: true
      });
      res.json({ success: true, message: draft, isDraft: true });
      return;
    }

    // Outbound dispatch via SMTP Port 587
    const dispatchResult = await emailService.sendCustomEmail({
      to: toList,
      subject: cleanSubject,
      text: cleanText,
      html: bodyHtml,
      fromName,
      replyTo
    });

    if (!dispatchResult.success) {
      res.status(500).json({
        error: `Failed to dispatch email via SMTP: ${dispatchResult.error || 'Unknown error'}`
      });
      return;
    }

    // Save copy in Sent folder
    const sentRecord = db.saveWebmailMessage({
      folder: 'sent',
      from: 'support@heronassetstrusteess.com',
      fromName,
      to: toList,
      replyTo,
      subject: cleanSubject,
      bodyText: cleanText,
      bodyHtml,
      isRead: true,
      headers: {
        'x-message-id': dispatchResult.messageId || ''
      }
    });

    res.json({
      success: true,
      messageId: dispatchResult.messageId,
      email: sentRecord
    });
  } catch (err: any) {
    console.error('Error sending webmail:', err);
    res.status(500).json({ error: 'Internal error dispatching email' });
  }
});

/* -------------------------------------------------------------------------- */
/*                         MAILBOX FOLDER MANAGEMENT                          */
/* -------------------------------------------------------------------------- */

/**
 * List messages in a folder
 */
router.get('/messages', (req: Request, res: Response) => {
  try {
    triggerThrottledSync();

    const folder = (req.query.folder as WebmailFolder) || 'inbox';
    const search = req.query.search ? String(req.query.search) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;

    const messages = db.getWebmailMessages(folder, search, limit);
    const stats = db.getWebmailStats();

    res.json({
      success: true,
      folder,
      stats,
      messages
    });
  } catch (err: any) {
    console.error('Error fetching webmail messages:', err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

/**
 * Get message details by ID
 */
router.get('/message/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const message = db.getWebmailMessageById(id);
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    // Auto mark read if viewing in inbox
    if (!message.isRead && message.folder === 'inbox') {
      db.markWebmailRead(id, true);
    }
    res.json({ success: true, message });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve message' });
  }
});

/**
 * Mark message read / unread
 */
router.put('/message/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isRead = true } = req.body;
    const success = db.markWebmailRead(id, Boolean(isRead));
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update read status' });
  }
});

/**
 * Delete message (move to trash or permanently remove)
 */
router.delete('/message/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';
    const success = db.deleteWebmailMessage(id, permanent);
    res.json({ success, permanent });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

/**
 * Folder stats
 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    triggerThrottledSync();
    const stats = db.getWebmailStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve folder statistics' });
  }
});

export default router;
