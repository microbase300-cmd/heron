export type UserRole = 'user' | 'admin' | 'compliance';
export type UserStatus = 'active' | 'suspended';

export type KycDocumentType = 'passport' | 'national_id' | 'driver_license' | 'proof_of_address';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'action_required';

export interface KycOcrResult {
  confidenceScore: number;
  documentType: KycDocumentType;
  extractedFullName: string;
  extractedDocumentNumber: string;
  extractedDob: string;
  extractedExpiryDate: string;
  extractedCountry: string;
  mrzDetected: boolean;
  mrzChecksumValid: boolean;
  mrzRawString?: string;
  faceDetected: boolean;
  faceMatchScore: number;
  antiSpoofingPass: boolean;
  tamperRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  discrepancies: string[];
  scannedAt: string;
}

export interface KycSubmission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userUid?: string;
  documentType: KycDocumentType;
  issuingCountry: string;
  documentNumber: string;
  fullName: string;
  dob: string;
  expiryDate: string;
  frontDocumentUrl: string;
  backDocumentUrl?: string;
  selfieUrl?: string;
  status: KycStatus;
  rejectionReason?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  ocrResult: KycOcrResult;
  submittedAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  status: UserStatus;
  kycStatus: KycStatus | string;
  kycRejectionReason?: string;
  forceReverification?: boolean;
  forceReverificationReason?: string;
  referralCode: string;
  referredBy?: string;
  uid?: string;
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
  pendingKycCount?: number;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'yield_payout' | 'referral_commission' | 'admin_adjustment';
export type TransactionStatus = 'pending' | 'completed' | 'rejected' | 'failed' | 'pending_kyc';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  asset: string;
  status: TransactionStatus;
  txHash?: string;
  note?: string;
  verificationHold?: boolean;
  holdReason?: string;
  heldAt?: string;
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

