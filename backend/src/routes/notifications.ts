import { Router, Response } from 'express';
import { db } from '../services/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications - Get all user-facing notifications with isRead status
router.get('/', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId || req.user!.id;
    const user = db.getUserById(userId);
    const notifications = db.getNotificationsForUser(userId, user?.email);
    res.json({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// POST /api/notifications/:id/read - Mark specific notification as read
router.post('/:id/read', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId || req.user!.id;
    const { id } = req.params;
    db.markNotificationAsRead(id, userId);
    res.json({ message: 'Notification marked as read.', id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// POST /api/notifications/read-all - Mark all notifications as read
router.post('/read-all', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId || req.user!.id;
    db.markAllNotificationsAsRead(userId);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

export default router;
