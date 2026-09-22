import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { emailService } from '../services/emailService';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                        CLIENT LIVE SUPPORT ENDPOINTS                       */
/* -------------------------------------------------------------------------- */

// 1. Initiate or Resume Support Session
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      userId,
      userName,
      userEmail,
      userUid,
      userBalance,
      initialMessage
    } = req.body;

    const sanitizedName = (userName || 'Institutional Investor').trim();
    const sanitizedEmail = (userEmail || 'investor@heronassetstrusteess.com').trim();

    const { chat, isNew } = db.createOrGetSupportChat({
      sessionId,
      userId,
      userName: sanitizedName,
      userEmail: sanitizedEmail,
      userUid,
      userBalance: typeof userBalance === 'number' ? userBalance : 0,
      initialMessage: initialMessage ? String(initialMessage).trim() : undefined
    });

    const messages = db.getSupportMessages(chat.id);

    // Dispatch instant notification alert to Admin if this is a new session
    if (isNew || chat.unreadByAdmin === 1) {
      emailService.sendLiveChatAlertEmail({
        userName: sanitizedName,
        userEmail: sanitizedEmail,
        userBalance: chat.userBalance,
        initialMessage: initialMessage || 'Investor requested live human representative assistance.',
        chatId: chat.id
      }).catch(err => console.warn('Email dispatch background notice:', err.message));
    }

    res.json({
      success: true,
      chat,
      messages
    });
  } catch (err: any) {
    console.error('Error initiating support chat:', err);
    res.status(500).json({ error: 'Failed to initiate support chat session.' });
  }
});

// 2. Poll Active Chat Details & Messages
router.get('/chat/:chatId', (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { markRead } = req.query;

    const chat = db.getSupportChat(chatId);
    if (!chat) {
      res.status(404).json({ error: 'Support chat session not found.' });
      return;
    }

    if (markRead === 'user') {
      db.markChatRead(chatId, 'user');
    }

    const messages = db.getSupportMessages(chatId);
    res.json({
      chat,
      messages
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve support chat.' });
  }
});

// 3. User Sends Message
router.post('/chat/:chatId/message', (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { text, senderName, sender } = req.body;

    if (!text || !String(text).trim()) {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    const chat = db.getSupportChat(chatId);
    if (!chat) {
      res.status(404).json({ error: 'Support chat session not found.' });
      return;
    }

    const role = sender === 'agent' ? 'agent' : 'user';
    const name = (senderName || (role === 'agent' ? 'Institutional Representative' : chat.userName)).trim();

    const message = db.addSupportMessage(chatId, role, name, String(text).trim());
    const updatedChat = db.getSupportChat(chatId);

    res.json({
      success: true,
      message,
      chat: updatedChat
    });
  } catch (err: any) {
    console.error('Error sending support message:', err);
    res.status(500).json({ error: 'Failed to post message to support session.' });
  }
});

/* -------------------------------------------------------------------------- */
/*                         ADMIN LIVE SUPPORT DESK API                        */
/* -------------------------------------------------------------------------- */

// 4. Admin: List All Support Chats (with filter & stats)
router.get('/admin/chats', (req: Request, res: Response) => {
  try {
    const chats = db.getAllSupportChats();
    const waitingCount = chats.filter(c => c.status === 'waiting_agent' || c.unreadByAdmin > 0).length;
    const activeCount = chats.filter(c => c.status === 'active').length;

    res.json({
      chats,
      metrics: {
        total: chats.length,
        waitingCount,
        activeCount
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load support chats.' });
  }
});

// 5. Admin: Reply to Support Chat
router.post('/admin/chat/:chatId/message', (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { text, agentName } = req.body;

    if (!text || !String(text).trim()) {
      res.status(400).json({ error: 'Reply text cannot be empty.' });
      return;
    }

    const chat = db.getSupportChat(chatId);
    if (!chat) {
      res.status(404).json({ error: 'Chat session not found.' });
      return;
    }

    const senderName = agentName || 'Senior Support Officer';
    const message = db.addSupportMessage(chatId, 'agent', senderName, String(text).trim());
    db.markChatRead(chatId, 'admin');

    const updatedChat = db.getSupportChat(chatId);

    res.json({
      success: true,
      message,
      chat: updatedChat
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to post agent reply.' });
  }
});

// 6. Admin: Update Status (Active, Resolved, Closed)
router.put('/admin/chat/:chatId/status', (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { status, agentName } = req.body;

    if (!status || !['waiting_agent', 'active', 'resolved', 'closed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status parameter.' });
      return;
    }

    const updated = db.updateSupportChatStatus(chatId, status, agentName);
    if (!updated) {
      res.status(404).json({ error: 'Chat session not found.' });
      return;
    }

    res.json({
      success: true,
      chat: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update support session status.' });
  }
});

// 7. Admin: Mark Chat as Read
router.post('/admin/chat/:chatId/read', (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    db.markChatRead(chatId, 'admin');
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark chat as read.' });
  }
});

export default router;