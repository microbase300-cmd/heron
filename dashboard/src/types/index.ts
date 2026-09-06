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

export const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'amateur',
    name: 'Amateur Plan',
    min: 100,
    max: 1999,
    durationHours: 24,
    rate: 0.045,
    referralRate: 0.08,
    description: 'Foundational 24-hour cycle with guaranteed capital & yield release.',
    badge: '24h • 4.5%'
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    min: 2000,
    max: 5999,
    durationHours: 48,
    rate: 0.095,
    referralRate: 0.16,
    description: 'Balanced accumulation over 48 hours with priority queue allocation.',
    badge: '48h • 9.5%'
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    min: 6000,
    max: 10999,
    durationHours: 72,
    rate: 0.155,
    referralRate: 0.24,
    description: 'High-velocity institutional yield with dedicated VIP risk mitigation officer.',
    badge: '72h • 15.5%'
  },
  {
    id: 'retirement',
    name: 'Retirement Plan',
    min: 11000,
    max: Infinity,
    durationHours: 96,
    rate: 0.225,
    referralRate: 0.30,
    description: 'Sovereign reserve tier with maximum compounding power and uncapped limits.',
    badge: '96h • 22.5%'
  }
];

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
  status: 'active' | 'completed' | 'cancelled';
  startedAt: string;
  expiresAt: string;
  completedAt?: string | null;
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

