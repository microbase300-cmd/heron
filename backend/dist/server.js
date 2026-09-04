"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const invest_1 = __importDefault(require("./routes/invest"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const referrals_1 = __importDefault(require("./routes/referrals"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const investmentEngine_1 = require("./services/investmentEngine");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Request logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        service: 'Heron Digital Capital API',
        version: '1.0.0'
    });
});
// Mount routes
app.use('/api/auth', auth_1.default);
app.use('/api/invest', invest_1.default);
app.use('/api/wallet', wallet_1.default);
app.use('/api/referrals', referrals_1.default);
app.use('/api/transactions', transactions_1.default);
const path_1 = __importDefault(require("path"));
// Serve dashboard static assets
const dashboardDist = path_1.default.join(__dirname, '../../dashboard/dist');
app.use('/dashboard', express_1.default.static(dashboardDist));
app.get('/dashboard/*', (_req, res) => {
    res.sendFile(path_1.default.join(dashboardDist, 'index.html'));
});
// Start background investment maturity engine
(0, investmentEngine_1.startInvestmentEngine)(10000);
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🦅 Heron Assets Institutional API listening on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📊 React Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`=======================================================`);
});
