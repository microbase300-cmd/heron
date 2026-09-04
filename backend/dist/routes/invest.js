"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_1 = require("../services/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public plans list
router.get('/plans', (_req, res) => {
    return res.json({ plans: Object.values(db_1.PLANS) });
});
// User's active & completed investments
router.get('/my', auth_1.requireAuth, (req, res) => {
    const investments = db_1.db.getInvestmentsByUserId(req.user.id);
    const now = Date.now();
    const formatted = investments.map(inv => {
        const started = new Date(inv.startedAt).getTime();
        const expires = new Date(inv.expiresAt).getTime();
        const totalDurationMs = expires - started;
        const elapsedMs = Math.max(0, now - started);
        const progressPercent = inv.status === 'completed' ? 100 : Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100));
        const secondsRemaining = inv.status === 'completed' ? 0 : Math.max(0, Math.round((expires - now) / 1000));
        const currentAccruedProfit = inv.status === 'completed' ? inv.expectedProfit : Number(((elapsedMs / totalDurationMs) * inv.expectedProfit).toFixed(2));
        return {
            ...inv,
            progressPercent,
            secondsRemaining,
            currentAccruedProfit
        };
    });
    return res.json({ investments: formatted });
});
// Create investment
router.post('/create', auth_1.requireAuth, (req, res) => {
    try {
        const userId = req.user.id;
        const { planId, amount } = req.body;
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({ error: 'Please enter a valid investment amount.' });
        }
        const plan = db_1.PLANS[planId];
        if (!plan) {
            return res.status(400).json({ error: 'Invalid investment plan selected.' });
        }
        if (numAmount < plan.min) {
            return res.status(400).json({ error: `Minimum deposit for ${plan.name} is $${plan.min.toLocaleString()}.` });
        }
        if (plan.max !== Infinity && numAmount > plan.max) {
            return res.status(400).json({ error: `Maximum deposit for ${plan.name} is $${plan.max.toLocaleString()}.` });
        }
        const user = db_1.db.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (user.balance < numAmount) {
            return res.status(400).json({
                error: `Insufficient balance. Your available balance is $${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Please deposit additional liquidity.`
            });
        }
        // Deduct balance
        const newBalance = user.balance - numAmount;
        db_1.db.updateUserBalance(user.id, newBalance);
        const now = Date.now();
        const durationMs = plan.durationHours * 3600 * 1000;
        const expectedProfit = Number((numAmount * plan.rate).toFixed(2));
        const totalPayout = Number((numAmount + expectedProfit).toFixed(2));
        const investment = {
            id: `inv_${(0, uuid_1.v4)()}`,
            userId: user.id,
            planId: plan.id,
            planName: plan.name,
            amount: numAmount,
            rate: plan.rate,
            durationHours: plan.durationHours,
            expectedProfit,
            totalPayout,
            status: 'active',
            startedAt: new Date(now).toISOString(),
            expiresAt: new Date(now + durationMs).toISOString(),
            completedAt: null
        };
        db_1.db.createInvestment(investment);
        // Record transaction
        const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        db_1.db.createTransaction({
            id: `tx_${(0, uuid_1.v4)()}`,
            userId: user.id,
            type: 'investment_lock',
            amount: numAmount,
            asset: 'USD',
            status: 'completed',
            txHash: `0x${randomHex}`,
            note: `Committed capital to ${plan.name} (${plan.badge})`,
            createdAt: new Date(now).toISOString()
        });
        // Check referral bonus
        if (user.referredBy) {
            const referrer = db_1.db.getUserByReferralCode(user.referredBy);
            if (referrer && referrer.id !== user.id) {
                const commission = Number((numAmount * plan.referralRate).toFixed(2));
                db_1.db.updateUserBalance(referrer.id, referrer.balance + commission);
                const refTxHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                db_1.db.createTransaction({
                    id: `tx_${(0, uuid_1.v4)()}`,
                    userId: referrer.id,
                    type: 'referral_bonus',
                    amount: commission,
                    asset: 'USD',
                    status: 'completed',
                    txHash: `0x${refTxHash}`,
                    note: `Referral Commission from ${user.name} on ${plan.name} (${(plan.referralRate * 100).toFixed(0)}%)`,
                    createdAt: new Date(now).toISOString()
                });
                db_1.db.createReferralCommission({
                    id: `ref_${(0, uuid_1.v4)()}`,
                    referrerId: referrer.id,
                    referredUserId: user.id,
                    referredUserEmail: user.email,
                    planId: plan.id,
                    depositAmount: numAmount,
                    rate: plan.referralRate,
                    commissionAmount: commission,
                    createdAt: new Date(now).toISOString()
                });
                console.log(`[Referral Engine] Credited $${commission} referral bonus to ${referrer.email}`);
            }
        }
        return res.status(201).json({
            message: `${plan.name} opened successfully. Yield lockup initiated.`,
            investment,
            newBalance
        });
    }
    catch (err) {
        console.error('Create investment error:', err);
        return res.status(500).json({ error: 'Failed to create investment.' });
    }
});
exports.default = router;
