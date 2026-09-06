export type UserRole = 'user' | 'admin' | 'compliance';
export type UserStatus = 'active' | 'suspended';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  status: UserStatus;
  kycStatus: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalPlatformNAV: number;
  totalLockedInEscrow: number;
  totalYieldDisbursed: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactionsCount: number;
  activeInvestmentsCount: number;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'yield_payout' | 'referral_commission' | 'admin_adjustment';
export type TransactionStatus = 'pending' | 'completed' | 'rejected' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  asset: string;
  status: TransactionStatus;
  txHash?: string;
  note?: string;
  createdAt: string;
}

export type PlanId = 'amateur' | 'standard' | 'premium' | 'retirement';

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
  startedAt?: string;
  expiresAt?: string;
  startTime?: string;
  endTime?: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  disbursedBy?: string | null;
  progressPercent?: number;
}

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
  isActive?: boolean;
}

export interface MarketTicker {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
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
  createdAt: string;
}

