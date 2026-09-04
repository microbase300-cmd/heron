import { Router, Response } from 'express';
import { db, PLANS } from '../services/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const commissions = db.getReferralCommissionsByReferrerId(userId);
  const referredUsers = db.getReferredUsers(user.referralCode);

  const totalCommissionEarned = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  const tierRates = [
    { tier: 'Amateur Plan', rate: '8%', min: '$100', max: '$1,999' },
    { tier: 'Standard Plan', rate: '16%', min: '$2,000', max: '$5,999' },
    { tier: 'Premium Plan', rate: '24%', min: '$6,000', max: '$10,999' },
    { tier: 'Retirement Plan', rate: '30%', min: '$11,000', max: 'Unlimited' }
  ];

  const downline = referredUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email.replace(/(.{2})(.*)(?=@)/, (_match, a, b) => a + '*'.repeat(b.length)),
    joinedAt: u.createdAt
  }));

  return res.json({
    referralCode: user.referralCode,
    referralLink: `http://localhost:5173/register?ref=${user.referralCode}`,
    totalReferrals: referredUsers.length,
    totalCommissionEarned,
    tierRates,
    commissions,
    downline
  });
});

export default router;
