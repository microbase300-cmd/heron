export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  balance: number;
  referralCode: string;
  referredBy?: string | null;
  createdAt: string;
}

export type PlanId = 'amateur' | 'standard' | 'premium' | 'retirement';

export interface PlanConfig {
  id: PlanId;
  name: string;
  min: number;
  max: number;
  durationHours: number;
  rate: number;          // e.g. 0.045
  referralRate: number;  // e.g. 0.08
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
  status: 'active' | 'completed' | 'cancelled';
  startedAt: string;
  expiresAt: string;
  completedAt?: string | null;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'yield_payout' | 'referral_bonus' | 'investment_lock';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  asset: 'USD' | 'BTC' | 'ETH' | 'USDT' | 'SOL';
  status: 'completed' | 'pending' | 'rejected';
  txHash: string;
  note: string;
  createdAt: string;
}

export interface ReferralCommission {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserEmail: string;
  planId: PlanId;
  depositAmount: number;
  rate: number;
  commissionAmount: number;
  createdAt: string;
}
