import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import investRoutes from './routes/invest';
import walletRoutes from './routes/wallet';
import referralsRoutes from './routes/referrals';
import transactionsRoutes from './routes/transactions';
import adminRoutes from './routes/admin';
import marketRoutes from './routes/market';
import notificationsRoutes from './routes/notifications';
import kycRoutes from './routes/kyc';
import { dbPool } from './db';
import { startInvestmentEngine } from './services/investmentEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
    service: 'Heron Assets Trustee API',
    version: '1.0.0',
    database: dbPool.isConnected ? 'postgresql-connected' : 'in-memory-active'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/invest', investRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/kyc', kycRoutes);

import path from 'path';

// Serve dashboard static assets
const dashboardDist = path.join(__dirname, '../../dashboard/dist');
app.use('/dashboard', express.static(dashboardDist));
app.get('/dashboard/*', (_req, res) => {
  res.sendFile(path.join(dashboardDist, 'index.html'));
});

// Start background investment maturity engine
startInvestmentEngine(10000);

// Initialize DB pool asynchronously and start server
dbPool.testConnection().then((connected) => {
  if (connected) {
    dbPool.runMigrations();
  }
}).catch((err) => {
  console.warn('⚠️ [PostgreSQL Connect Handled]', err.message);
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🦅 Heron Assets Institutional API listening on port ${PORT} (0.0.0.0)`);
  console.log(`🔗 Local Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📱 LAN Network API: http://192.168.43.149:${PORT}/api`);
  console.log(`📊 React Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🛡️ Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`📈 Market API: http://localhost:${PORT}/api/market/tickers`);
  console.log(`=======================================================`);
});
