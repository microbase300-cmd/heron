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
          console.log(`[Investment Engine] Investment ${inv.id} (${inv.planName}) reached maturity. Transitioning status to 'matured' (Awaiting Admin Disbursement)...`);

          // 1. Transition status from 'active' to 'matured'
          db.matureInvestment(inv.id);

          // 2. Dispatch informative status update notification
          const user = db.getUserById(inv.userId);
          if (user) {
            db.createNotification({
              id: `notif_${uuidv4()}`,
              userId: user.id,
              targetEmail: user.email,
              title: `Investment Matured: ${inv.planName}`,
              message: `Your ${inv.planName} contract has completed its ${inv.durationHours}-hour cycle. Total accrued return of $${inv.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })} ($${inv.amount.toLocaleString()} principal + $${inv.expectedProfit.toLocaleString()} yield) is verified and queued for Treasury Desk disbursement settlement.`,
              type: 'info',
              sender: 'Smart Escrow Yield Engine',
              readBy: [],
              createdAt: new Date().toISOString()
            });

            console.log(`[Investment Engine] Investment ${inv.id} for ${user.email} marked as 'matured' awaiting executive disbursement.`);
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
