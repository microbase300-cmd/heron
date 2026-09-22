import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { emailService } from '../services/emailService';
import { WebmailFolder } from '../types';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                         INBOUND EMAIL WEBHOOK (RECEIVING)                  */
/* -------------------------------------------------------------------------- */

/**
 * Universal webhook endpoint to receive incoming emails
 * Supports Cloudflare Email Workers, Resend, Sendgrid, and custom webhooks
 */
router.post('/inbound', async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};

    // Normalize sender
    let fromAddress = payload.from || payload.sender || 'unknown@domain.com';
    let fromName = payload.fromName || payload.name;
    if (typeof fromAddress === 'string' && fromAddress.includes('<')) {
      const match = fromAddress.match(/(.*?)\s*<([^>]+)>/);
      if (match) {
        fromName = fromName || match[1].trim();
        fromAddress = match[2].trim();
      }
    }

    // Normalize recipient(s)
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

    console.log(`📥 [Webmail Inbound] Received email from ${fromAddress} regarding "${subject}" (ID: ${saved.id})`);

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
    const stats = db.getWebmailStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve folder statistics' });
  }
});

export default router;
