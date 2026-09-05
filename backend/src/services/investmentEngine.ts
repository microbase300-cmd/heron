import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export function startInvestmentEngine(intervalMs = 10000) {
  console.log('[Investment Engine] Starting automated smart escrow timelock monitor...');

  const check = () => {
    try {
      const active = db.getAllActiveInvestments();
      const now = Date.now();

      for (const inv of active) {
        const expiry = new Date(inv.expiresAt).getTime();
        if (expiry <= now) {
          console.log(`[Investment Engine] Investment ${inv.id} (${inv.planName}) matured! Processing payout for user ${inv.userId}...`);

          // 1. Mark completed
          db.completeInvestment(inv.id);

          // 2. Credit balance
          const user = db.getUserById(inv.userId);
          if (user) {
            const newBal = user.balance + inv.totalPayout;
            db.updateUserBalance(user.id, newBal);

            // 3. Record transaction
            const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            db.createTransaction({
              id: `tx_${uuidv4()}`,
              userId: user.id,
              type: 'yield_payout',
              amount: inv.totalPayout,
              asset: 'USD',
              status: 'completed',
              txHash: `0x${randomHex}`,
              note: `${inv.planName} Matured: Principal $${inv.amount.toLocaleString()} + Yield $${inv.expectedProfit.toLocaleString()}`,
              createdAt: new Date().toISOString()
            });

            // 4. Send celebratory yield payout notification
            db.createNotification({
              id: `notif_${uuidv4()}`,
              userId: user.id,
              targetEmail: user.email,
              title: `Yield Mandate Matured: ${inv.planName}`,
              message: `Your ${inv.planName} cycle is complete. Payout of $${inv.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })} ($${inv.amount.toLocaleString()} principal + $${inv.expectedProfit.toLocaleString()} yield) has been credited to your available balance.`,
              type: 'success',
              sender: 'Smart Escrow Yield Engine',
              readBy: [],
              createdAt: new Date().toISOString()
            });

            console.log(`[Investment Engine] Payout of $${inv.totalPayout.toFixed(2)} disbursed to ${user.email}. New Balance: $${newBal.toFixed(2)}`);
          }
        }
      }
    } catch (err) {
      console.error('[Investment Engine] Error checking investments:', err);
    }
  };

  // Run on startup and every interval
  check();
  setInterval(check, intervalMs);
}
