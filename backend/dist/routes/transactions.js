"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../services/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, (req, res) => {
    const userId = req.user.id;
    const { type } = req.query;
    let transactions = db_1.db.getTransactionsByUserId(userId);
    if (type && typeof type === 'string' && type !== 'all') {
        transactions = transactions.filter(t => t.type === type);
    }
    return res.json({ transactions });
});
exports.default = router;
