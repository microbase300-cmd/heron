export type UserRole = 'user' | 'admin' | 'compliance';
export type UserStatus = 'active' | 'suspended' | 'pending_verification';

export interface WhitelistedWallet {
  id: string;
  asset: string;
  network: string;
  address: string;
  label: string;
  addedAt: string;
}

export interface SecurityLogItem {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  location: string;
  status: 'Authorized' | 'Blocked' | 'Challenge';
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  balance: number;
  referralCode: string;
  referredBy?: string | null;
  status: UserStatus;
  createdAt: string;
  uid?: string;
  kycLevel?: 'unverified' | 'tier1' | 'tier2';
  vipLevel?: string;
  antiPhishingCode?: string;
  twoFactorEnabled?: boolean;
  whitelistEnabled?: boolean;
  whitelistedWallets?: WhitelistedWallet[];
  securityLogs?: SecurityLogItem[];
  preferredCurrency?: string;
  pushTokens?: string[];
}

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt?: string | null;
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
  isActive?: boolean;
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
}

export type TransactionType = 'deposit' | 'withdrawal' | 'yield_payout' | 'referral_bonus' | 'investment_lock' | 'investment_refund' | 'admin_adjustment';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  asset: string;
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

export interface NotificationMessage {
  id: string;
  userId?: string | null; // null = broadcast to all users, string = specific user
  targetEmail?: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'announcement';
  sender: string;
  readBy: string[]; // user IDs who have marked this as read
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

export interface OtpRecord {
  id: string;
  email: string;
  code: string;
  purpose: 'registration' | 'withdrawal' | 'login';
  expiresAt: number; // timestamp ms
  createdAt: number;
}

export interface AdminMetrics {
  totalUsers: number;
  totalPlatformNAV: number;
  totalLockedInEscrow: number;
  totalYieldDisbursed: number;
  totalReferralsPaid: number;
  activeInvestmentsCount: number;
  activeMandatesCount?: number;
  pendingTransactionsCount: number;
}

