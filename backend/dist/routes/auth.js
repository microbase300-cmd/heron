"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const db_1 = require("../services/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, referralCode } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        const existing = db_1.db.getUserByEmail(email);
        if (existing) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }
        let referredBy = null;
        if (referralCode) {
            const referrer = db_1.db.getUserByReferralCode(referralCode);
            if (referrer) {
                referredBy = referrer.referralCode;
            }
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        // Generate unique referral code
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
        const userReferralCode = `HERON-${uniqueSuffix}`;
        const newUser = {
            id: `usr_${(0, uuid_1.v4)()}`,
            email: email.trim().toLowerCase(),
            name: name.trim(),
            passwordHash,
            balance: 1000.00, // Welcome trial liquidity credit for immediate testing
            referralCode: userReferralCode,
            referredBy,
            createdAt: new Date().toISOString()
        };
        db_1.db.createUser(newUser);
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email }, auth_1.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
            message: 'Account registered successfully.',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                balance: newUser.balance,
                referralCode: newUser.referralCode,
                referredBy: newUser.referredBy,
                createdAt: newUser.createdAt
            }
        });
    }
    catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Internal server error during registration.' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = db_1.db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
        }
        const match = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, auth_1.JWT_SECRET, { expiresIn: '7d' });
        return res.json({
            message: 'Authentication successful.',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                balance: user.balance,
                referralCode: user.referralCode,
                referredBy: user.referredBy,
                createdAt: user.createdAt
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error during login.' });
    }
});
router.get('/me', auth_1.requireAuth, (req, res) => {
    const user = db_1.db.getUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            balance: user.balance,
            referralCode: user.referralCode,
            referredBy: user.referredBy,
            createdAt: user.createdAt
        }
    });
});
exports.default = router;
