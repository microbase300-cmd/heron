"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../services/db");
exports.JWT_SECRET = process.env.JWT_SECRET || 'heron_institutional_secret_jwt_2026_salt_8829';
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        const user = db_1.db.getUserById(payload.id);
        if (!user) {
            return res.status(401).json({ error: 'User session expired or user not found.' });
        }
        req.user = { id: user.id, email: user.email };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}
