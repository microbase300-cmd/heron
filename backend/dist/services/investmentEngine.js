"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startInvestmentEngine = startInvestmentEngine;
const db_1 = require("./db");
const uuid_1 = require("uuid");
function startInvestmentEngine(intervalMs = 10000) {
    console.log('[Investment Engine] Starting automated smart escrow timelock monitor...');
    const check = () => {
        try {
            const active = db_1.db.getAllActiveInvestments();
            const now = Date.now();
            for (const inv of active) {
                const expiry = new Date(inv.expiresAt).getTime();
                if (expiry <= now) {
                    console.log(`[Investment Engine] Investment ${inv.id} (${inv.planName}) matured! Processing payout for user ${inv.userId}...`);
                    // 1. Mark completed
                    db_1.db.completeInvestment(inv.id);
                    // 2. Credit balance
                    const user = db_1.db.getUserById(inv.userId);
                    if (user) {
                        const newBal = user.balance + inv.totalPayout;
                        db_1.db.updateUserBalance(user.id, newBal);
                        // 3. Record transaction
                        const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                        db_1.db.createTransaction({
                            id: `tx_${(0, uuid_1.v4)()}`,
                            userId: user.id,
                            type: 'yield_payout',
                            amount: inv.totalPayout,
                            asset: 'USD',
                            status: 'completed',
                            txHash: `0x${randomHex}`,
                            note: `${inv.planName} Matured: Principal $${inv.amount.toLocaleString()} + Yield $${inv.expectedProfit.toLocaleString()}`,
                            createdAt: new Date().toISOString()
                        });
                        console.log(`[Investment Engine] Payout of $${inv.totalPayout.toFixed(2)} disbursed to ${user.email}. New Balance: $${newBal.toFixed(2)}`);
                    }
                }
            }
        }
        catch (err) {
            console.error('[Investment Engine] Error checking investments:', err);
        }
    };
    // Run on startup and every interval
    check();
    setInterval(check, intervalMs);
}
