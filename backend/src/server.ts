import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import investRoutes from './routes/invest';
import walletRoutes from './routes/wallet';
import referralsRoutes from './routes/referrals';
import transactionsRoutes from './routes/transactions';
import { startInvestmentEngine } from './services/investmentEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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
app.use('/api/auth', authRoutes);
app.use('/api/invest', investRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/transactions', transactionsRoutes);

import path from 'path';

// Serve dashboard static assets
const dashboardDist = path.join(__dirname, '../../dashboard/dist');
app.use('/dashboard', express.static(dashboardDist));
app.get('/dashboard/*', (_req, res) => {
  res.sendFile(path.join(dashboardDist, 'index.html'));
});

// Start background investment maturity engine
startInvestmentEngine(10000);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🦅 Heron Assets Institutional API listening on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 React Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`=======================================================`);
});
