import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { db } from '../services/db';
import { emailService } from '../services/emailService';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { PlanId, Transaction } from '../types';

const router = Router();

// Apply auth + admin guard to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// 1. GET /api/admin/metrics - Global Executive Platform Metrics
router.get('/metrics', (_req: AuthRequest, res: Response) => {
  try {
    const metrics = db.getAdminMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute admin metrics.' });
  }
});

// 2. GET /api/admin/users - User Directory & Balances
router.get('/users', (_req: AuthRequest, res: Response) => {
  try {
    const users = db.getAllUsers().map(({ passwordHash: _, ...safeUser }) => safeUser);
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users directory.' });
  }
});

// 3. POST /api/admin/users/:id/balance - Manual Credit / Debit Adjustment
router.post('/users/:id/balance', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, action, note } = req.body;

    const user = db.getUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const adjustAmount = parseFloat(amount);
    if (isNaN(adjustAmount) || adjustAmount <= 0) {
      res.status(400).json({ error: 'Valid positive amount is required.' });
      return;
    }

    let newBalance = user.balance;
    if (action === 'credit') {
      newBalance += adjustAmount;
    } else if (action === 'debit') {
      if (user.balance < adjustAmount) {
        res.status(400).json({ error: 'Insufficient user balance for debit.' });
        return;
      }
      newBalance -= adjustAmount;
    } else {
      res.status(400).json({ error: 'Action must be "credit" or "debit".' });
      return;
    }

    db.updateUserBalance(user.id, newBalance);

    // Create immutable audit ledger transaction
    const tx: Transaction = {
      id: `tx_${uuidv4()}`,
      userId: user.id,
      type: 'admin_adjustment',
      amount: adjustAmount,
      asset: 'USD',
      status: 'completed',
      txHash: `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 64)}`,
      note: `Admin ${action.toUpperCase()}: ${note || 'Manual executive balance update'}`,
      createdAt: new Date().toISOString(),
    };
    db.createTransaction(tx);

    // Dispatch real-time notification to user
    db.createNotification({
      id: `notif_${uuidv4()}`,
      userId: user.id,
      targetEmail: user.email,
      title: action === 'credit'
        ? `Liquidity Credited: $${adjustAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        : `Balance Debit Adjustment: $${adjustAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      message: `An executive balance ${action} of $${adjustAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been applied to your portfolio. ${note ? `Note: ${note}` : ''}`,
      type: action === 'credit' ? 'success' : 'alert',
      sender: 'Executive Treasury Desk',
      readBy: [],
      createdAt: new Date().toISOString()
    });

    res.json({
      message: `Successfully ${action}ed $${adjustAmount.toFixed(2)} to ${user.name}.`,
      newBalance,
      transaction: tx,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to adjust user balance.' });
  }
});

// 4. POST /api/admin/users/:id/status - Update Account Status
router.post('/users/:id/status', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      res.status(400).json({ error: 'Status must be "active" or "suspended".' });
      return;
    }

    db.updateUserStatus(id, status);
    if (status === 'suspended') {
      db.revokeAllUserRefreshTokens(id);
    }

    res.json({ message: `User status updated to ${status}.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// 5. GET /api/admin/transactions - All Platform Ledger Records
router.get('/transactions', (_req: AuthRequest, res: Response) => {
  try {
    const transactions = db.getAllTransactions();
    const users = db.getAllUsers();
    const userMap = new Map(users.map((u) => [u.id, { name: u.name, email: u.email }]));

    const enriched = transactions.map((t) => {
      const u = userMap.get(t.userId);
      return {
        ...t,
        userName: u ? u.name : 'Unknown Investor',
        userEmail: u ? u.email : undefined,
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch platform transactions.' });
  }
});

// 6. POST /api/admin/transactions/:id/approve - Approve Pending Transaction
router.post('/transactions/:id/approve', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const txs = db.getAllTransactions();
    const tx = txs.find((t) => t.id === id);

    if (!tx) {
      res.status(404).json({ error: 'Transaction not found.' });
      return;
    }

    if (tx.status !== 'pending') {
      res.status(400).json({ error: 'Only pending transactions can be approved.' });
      return;
    }

    db.updateTransactionStatus(id, 'completed');

    // If it was a pending deposit, credit the user's balance and notify user
    if (tx.type === 'deposit') {
       const user = db.getUserById(tx.userId);
       if (user) {
         const newBalance = user.balance + tx.amount;
         db.updateUserBalance(user.id, newBalance);
         db.createNotification({
           id: `notif_${uuidv4()}`,
           userId: user.id,
           targetEmail: user.email,
           title: `Inbound Deposit Confirmed: $${tx.amount.toLocaleString()} ${tx.asset}`,
           message: `Your deposit of $${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${tx.asset} has been confirmed and credited to your available balance.`,
           type: 'success',
           sender: 'Settlement Treasury Desk',
           readBy: [],
           createdAt: new Date().toISOString()
         });

         // Dispatch institutional deposit confirmed email (non-blocking)
         if (user.email) {
           emailService.sendDepositConfirmedEmail({
             to: user.email,
             name: user.name || 'Investor',
             amount: tx.amount,
             asset: tx.asset,
             newBalance,
             txHash: tx.txHash
           }).catch(err => {
             console.warn('⚠️ [Deposit Approval Email Error]:', err?.message || err);
           });
         }
       }
    } else if (tx.type === 'withdrawal') {
      const user = db.getUserById(tx.userId);
      if (user) {
        db.createNotification({
          id: `notif_${uuidv4()}`,
          userId: user.id,
          targetEmail: user.email,
          title: `Withdrawal Disbursement Authorized: $${tx.amount.toLocaleString()} ${tx.asset}`,
          message: `Your withdrawal request of $${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${tx.asset} has been approved and dispatched to your destination wallet.`,
          type: 'success',
          sender: 'Settlement Treasury Desk',
          readBy: [],
          createdAt: new Date().toISOString()
        });
      }
    }

    res.json({ message: 'Transaction approved and settled.', transactionId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to approve transaction.' });
  }
});

// 7. POST /api/admin/transactions/:id/reject - Reject Pending Transaction
router.post('/transactions/:id/reject', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const txs = db.getAllTransactions();
    const tx = txs.find((t) => t.id === id);

    if (!tx) {
      res.status(404).json({ error: 'Transaction not found.' });
      return;
    }

    if (tx.status !== 'pending') {
      res.status(400).json({ error: 'Only pending transactions can be rejected.' });
      return;
    }

    db.updateTransactionStatus(id, 'rejected');

    // If it was a withdrawal that was rejected, refund the user's balance and notify user
    if (tx.type === 'withdrawal') {
      const user = db.getUserById(tx.userId);
      if (user) {
        db.updateUserBalance(user.id, user.balance + tx.amount);
        db.createNotification({
          id: `notif_${uuidv4()}`,
          userId: user.id,
          targetEmail: user.email,
          title: `Withdrawal Request Rejected & Refunded`,
          message: `Your withdrawal request of $${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${tx.asset} was not approved. The escrowed funds have been fully refunded to your available balance.`,
          type: 'alert',
          sender: 'Settlement Treasury Desk',
          readBy: [],
          createdAt: new Date().toISOString()
        });
      }
    } else if (tx.type === 'deposit') {
      const user = db.getUserById(tx.userId);
      if (user) {
        db.createNotification({
          id: `notif_${uuidv4()}`,
          userId: user.id,
          targetEmail: user.email,
          title: `Inbound Deposit Receipt Rejected`,
          message: `Your submitted deposit receipt of $${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${tx.asset} could not be validated on-chain. Please verify transaction hash and resubmit.`,
          type: 'alert',
          sender: 'Settlement Treasury Desk',
          readBy: [],
          createdAt: new Date().toISOString()
        });
      }
    }

    res.json({ message: 'Transaction rejected.', transactionId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reject transaction.' });
  }
});

// 8. GET /api/admin/investments - All Live & Completed Investments
router.get('/investments', (_req: AuthRequest, res: Response) => {
  try {
    const investments = db.getAllInvestments();
    res.json(investments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch platform investments.' });
  }
});

// 9. POST /api/admin/investments/:id/disburse - Disburse Payout for Matured or Active Investment
router.post('/investments/:id/disburse', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const investments = db.getAllInvestments();
    const inv = investments.find((i) => i.id === id);

    if (!inv) {
      res.status(404).json({ error: 'Investment not found.' });
      return;
    }

    if (inv.status === 'completed') {
      res.status(400).json({ error: 'Investment payout has already been disbursed.' });
      return;
    }

    if (inv.status === 'cancelled') {
      res.status(400).json({ error: 'Cannot disburse a cancelled investment contract.' });
      return;
    }

    const user = db.getUserById(inv.userId);
    if (!user) {
      res.status(404).json({ error: 'Investor user record not found.' });
      return;
    }

    // Complete investment and disburse total payout
    db.completeInvestment(inv.id, 'Executive Treasury Desk');
    const newBal = user.balance + inv.totalPayout;
    db.updateUserBalance(user.id, newBal);

    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const tx: Transaction = {
      id: `tx_${uuidv4()}`,
      userId: user.id,
      type: 'yield_payout',
      amount: inv.totalPayout,
      asset: 'USD',
      status: 'completed',
      txHash: `0x${randomHex}`,
      note: `Treasury Disbursement: ${inv.planName} Matured (Principal $${inv.amount.toLocaleString()} + Yield $${inv.expectedProfit.toLocaleString()})`,
      createdAt: new Date().toISOString(),
    };
    db.createTransaction(tx);

    // Dispatch priority celebration pop-up alert to user
    db.createNotification({
      id: `notif_${uuidv4()}`,
      userId: user.id,
      targetEmail: user.email,
      title: `Investment Payout Disbursed: ${inv.planName}`,
      message: `Your ${inv.planName} investment has been approved and disbursed! Total payout of $${inv.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })} ($${inv.amount.toLocaleString()} principal + $${inv.expectedProfit.toLocaleString()} yield) has been credited to your available balance.`,
      type: 'success',
      sender: 'Executive Treasury Desk',
      readBy: [],
      createdAt: new Date().toISOString(),
    });

    res.json({
      message: `Investment payout of $${inv.totalPayout.toLocaleString()} successfully disbursed to ${user.email}.`,
      investmentId: id,
      totalPayout: inv.totalPayout,
      newBalance: newBal,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to disburse investment payout.' });
  }
});

// 9b. POST /api/admin/investments/:id/force-mature (Alias to disburse)
router.post('/investments/:id/force-mature', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const investments = db.getAllInvestments();
    const inv = investments.find((i) => i.id === id);

    if (!inv) {
      res.status(404).json({ error: 'Investment not found.' });
      return;
    }

    if (inv.status === 'completed' || inv.status === 'cancelled') {
      res.status(400).json({ error: 'Investment is already completed or cancelled.' });
      return;
    }

    const user = db.getUserById(inv.userId);
    if (!user) {
      res.status(404).json({ error: 'Investor user record not found.' });
      return;
    }

    // Complete investment and disburse total payout
    db.completeInvestment(inv.id, 'Executive Override');
    const newBal = user.balance + inv.totalPayout;
    db.updateUserBalance(user.id, newBal);

    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const tx: Transaction = {
      id: `tx_${uuidv4()}`,
      userId: user.id,
      type: 'yield_payout',
      amount: inv.totalPayout,
      asset: 'USD',
      status: 'completed',
      txHash: `0x${randomHex}`,
      note: `Executive Early Settlement: ${inv.planName} matured (Principal $${inv.amount.toLocaleString()} + Yield $${inv.expectedProfit.toLocaleString()})`,
      createdAt: new Date().toISOString(),
    };
    db.createTransaction(tx);

    // Dispatch priority celebration pop-up alert to user
    db.createNotification({
      id: `notif_${uuidv4()}`,
      userId: user.id,
      targetEmail: user.email,
      title: `Investment Payout Disbursed: ${inv.planName}`,
      message: `Executive settlement complete for ${inv.planName}. Payout of $${inv.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been disbursed directly to your available balance.`,
      type: 'success',
      sender: 'Executive Treasury Desk',
      readBy: [],
      createdAt: new Date().toISOString(),
    });

    res.json({
      message: 'Investment successfully force-matured and disbursed.',
      investmentId: id,
      totalPayout: inv.totalPayout,
      newBalance: newBal,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to force-mature investment.' });
  }
});

// 9c. POST /api/admin/investments/:id/cancel - Cancel Investment for Breach of Rules
router.post('/investments/:id/cancel', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, refundPrincipal = true } = req.body;
    const investments = db.getAllInvestments();
    const inv = investments.find((i) => i.id === id);

    if (!inv) {
      res.status(404).json({ error: 'Investment not found.' });
      return;
    }

    if (inv.status === 'completed') {
      res.status(400).json({ error: 'Cannot cancel an investment that is already completed and disbursed.' });
      return;
    }

    if (inv.status === 'cancelled') {
      res.status(400).json({ error: 'Investment is already cancelled.' });
      return;
    }

    const user = db.getUserById(inv.userId);
    if (!user) {
      res.status(404).json({ error: 'Investor user record not found.' });
      return;
    }

    const breachReason = (reason && reason.trim()) || 'Breach of institutional investor terms and conditions';
    
    // Mark investment as cancelled
    db.cancelInvestment(inv.id, breachReason);

    let newBalance = user.balance;
    if (refundPrincipal) {
      newBalance += inv.amount;
      db.updateUserBalance(user.id, newBalance);

      const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      db.createTransaction({
        id: `tx_${uuidv4()}`,
        userId: user.id,
        type: 'investment_refund',
        amount: inv.amount,
        asset: 'USD',
        status: 'completed',
        txHash: `0x${randomHex}`,
        note: `Principal Refund (Investment Cancelled): ${breachReason}`,
        createdAt: new Date().toISOString(),
      });
    }

    // Dispatch HIGH-PRIORITY ALERT POP-UP to the user's dashboard
    db.createNotification({
      id: `notif_${uuidv4()}`,
      userId: user.id,
      targetEmail: user.email,
      title: `Investment Terminated: ${inv.planName}`,
      message: `Your ${inv.planName} investment contract (#${inv.id.slice(-8)}) was cancelled by Risk & Compliance.\n\nReason: "${breachReason}".\n\n${
        refundPrincipal
          ? `Your principal capital of $${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been refunded back to your available balance.`
          : 'Principal capital is held pending compliance audit. Please contact the compliance desk for review.'
      }`,
      type: 'alert',
      sender: 'Compliance & Risk Management',
      readBy: [],
      createdAt: new Date().toISOString(),
    });

    res.json({
      message: `Investment #${inv.id} cancelled. ${refundPrincipal ? 'Principal refunded to user.' : 'Principal held.'} Alert dispatched to investor.`,
      investmentId: id,
      newBalance,
      cancellationReason: breachReason,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to cancel investment.' });
  }
});

// 10. GET /api/admin/plans - Current Plan Configurations
router.get('/plans', (_req: AuthRequest, res: Response) => {
  try {
    const plans = db.getPlanConfigs();
    res.json(Object.values(plans));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch plan configs.' });
  }
});

// 11. PUT /api/admin/plans/:id - Update Investment Plan Parameters
router.put('/plans/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: PlanId };
    const updates = req.body;

    const updated = db.updatePlanConfig(id, updates);
    res.json({
      message: `Plan "${updated.name}" updated successfully.`,
      plan: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update plan configuration.' });
  }
});

// 12. GET /api/admin/wallets - Retrieve Deposit Receiving Addresses
router.get('/wallets', (_req: AuthRequest, res: Response) => {
  try {
    const addresses = db.getDepositAddresses();
    res.json(addresses);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch deposit wallet configurations.' });
  }
});

// 13. PUT /api/admin/wallets/:key - Update Platform Receiving Wallet Address
router.put('/wallets/:key', (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { address, network, asset, memo, isActive } = req.body;

    if (!address || address.trim().length < 8) {
      res.status(400).json({ error: 'A valid wallet address string is required.' });
      return;
    }

    const updated = db.updateDepositAddress(key, {
      address: address.trim(),
      ...(network ? { network: network.trim() } : {}),
      ...(asset ? { asset: asset.trim() } : {}),
      ...(memo !== undefined ? { memo: memo.trim() } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
    });

    res.json({
      message: `Receiving address for ${updated.network || key} updated successfully.`,
      wallet: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update deposit wallet configuration.' });
  }
});

// 14. GET /api/admin/notifications - Retrieve All Platform Messages
router.get('/notifications', (_req: AuthRequest, res: Response) => {
  try {
    const notifications = db.getAllNotifications();
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch platform notifications.' });
  }
});

// 15. POST /api/admin/notifications - Compose & Dispatch Notification
router.post('/notifications', (req: AuthRequest, res: Response) => {
  try {
    const { title, message, type, recipientType, targetUserId, targetEmail, sender } = req.body;

    if (!title || !message) {
      res.status(400).json({ error: 'Title and message body are required.' });
      return;
    }

    let resolvedUserId: string | null = null;
    let resolvedEmail: string | null = null;

    if (recipientType === 'direct') {
      if (targetUserId) {
        const user = db.getUserById(targetUserId) || db.getUserByEmail(targetUserId);
        if (!user) {
          res.status(404).json({ error: 'Target investor account not found.' });
          return;
        }
        resolvedUserId = user.id;
        resolvedEmail = user.email;
      } else if (targetEmail) {
        const user = db.getUserByEmail(targetEmail);
        if (!user) {
          res.status(404).json({ error: 'Target investor email not found.' });
          return;
        }
        resolvedUserId = user.id;
        resolvedEmail = user.email;
      } else {
        res.status(400).json({ error: 'Target user ID or email is required for direct messages.' });
        return;
      }
    }

    const newNotif = db.createNotification({
      id: `notif_${uuidv4()}`,
      userId: resolvedUserId, // null = broadcast to all
      targetEmail: resolvedEmail,
      title: title.trim(),
      message: message.trim(),
      type: type || 'announcement',
      sender: sender || 'Chief Risk Officer',
      readBy: [],
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: resolvedUserId ? 'Direct message dispatched successfully.' : 'Platform broadcast announced.',
      notification: newNotif,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to dispatch notification.' });
  }
});

// 17. GET /api/admin/inbox - Read Incoming Support & Desk Mailboxes
router.get('/inbox', (_req: AuthRequest, res: Response) => {
  try {
    const mailboxes = [
      { name: 'support@heronassetstrusteess.com', dirs: ['/home/support/Maildir/new', '/home/support/Maildir/cur'] },
      { name: 'desk@heronassetstrusteess.com', dirs: ['/home/desk/Maildir/new', '/home/desk/Maildir/cur'] }
    ];

    const messages: any[] = [];

    for (const m of mailboxes) {
      for (const d of m.dirs) {
        if (!fs.existsSync(d)) continue;
        const files = fs.readdirSync(d);
        for (const file of files) {
          try {
            const filePath = path.join(d, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Basic parsing of RFC 822 / 2822 email headers
            const subjectMatch = content.match(/^Subject:\s*(.*)$/mi);
            const fromMatch = content.match(/^From:\s*(.*)$/mi);
            const toMatch = content.match(/^To:\s*(.*)$/mi);
            const dateMatch = content.match(/^Date:\s*(.*)$/mi);
            
            // Extract body (after double newline)
            const parts = content.split(/\r?\n\r?\n/);
            const body = parts.slice(1).join('\n\n').trim();

            messages.push({
              id: file,
              mailbox: m.name,
              subject: subjectMatch ? subjectMatch[1].trim() : 'No Subject',
              from: fromMatch ? fromMatch[1].trim() : 'Unknown',
              to: toMatch ? toMatch[1].trim() : m.name,
              date: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
              body: body.length > 2000 ? body.substring(0, 2000) + '...' : body,
              receivedAt: fs.statSync(filePath).mtime
            });
          } catch {
            // skip malformed file
          }
        }
      }
    }

    // Sort newest first
    messages.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

    res.json({
      count: messages.length,
      mailboxes: ['support@heronassetstrusteess.com', 'desk@heronassetstrusteess.com'],
      messages
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read server mailboxes.', details: err.message });
  }
});

export default router;
