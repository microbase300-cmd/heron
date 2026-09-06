export type PlanId = 'amateur' | 'standard' | 'premium' | 'retirement';

export interface PlanConfig {
  id: PlanId;
  name: string;
  min: number;
  max: number;
  durationHours: number;
  rate: number;
  referralRate: number;
  description: string;
  badge: string;
}

export interface Investment {
  id: string;
  userId: string;
  planId: PlanId;
  planName: string;
  amount: number;
  rate: number;
  durationHours: number;
  expectedProfit: number;
  totalPayout: number;
  status: 'active' | 'matured' | 'completed' | 'cancelled';
  startedAt: string;
  expiresAt: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  disbursedBy?: string | null;
  progressPercent: number;
  secondsRemaining: number;
  currentAccruedProfit: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  referralCode: string;
  referredBy?: string | null;
  createdAt: string;
}

export interface WalletSummary {
  availableBalance: number;
  lockedInInvestments: number;
  totalPortfolioValue: number;
  totalProfitAccrued: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalReferralEarnings: number;
  activePlansCount: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'yield_payout' | 'referral_bonus' | 'investment_lock' | 'admin_adjustment';
  amount: number;
  asset: string;
  status: 'completed' | 'pending' | 'rejected';
  txHash: string;
  note: string;
  createdAt: string;
}

export interface DepositAddressConfig {
  key: string;
  asset: string;
  network: string;
  address: string;
  memo?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface NotificationMessage {
  id: string;
  userId?: string | null;
  targetEmail?: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'announcement';
  sender: string;
  readBy: string[];
  isRead: boolean;
  createdAt: string;
}

export interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalCommissionEarned: number;
  tierRates: { tier: string; rate: string; min: string; max: string }[];
  commissions: {
    id: string;
    referredUserEmail: string;
    planId: PlanId;
    depositAmount: number;
    rate: number;
    commissionAmount: number;
    createdAt: string;
  }[];
  downline: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  }[];
}

export interface MarketTicker {
  symbol: string;
  price: number;
  change24h: number;
}
