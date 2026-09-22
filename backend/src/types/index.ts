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
  biometricVideoUrl?: string;
  status: KycStatus;
  rejectionReason?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  ocrResult: KycOcrResult;
  livenessVerified?: boolean;
  livenessDetails?: {
    botDetected: boolean;
    turnLeftPassed: boolean;
    turnRightPassed: boolean;
    waveHandPassed?: boolean;
    nodPassed?: boolean;
    blinkPassed?: boolean;
    smilePassed?: boolean;
    capturedLive: boolean;
    confidenceScore?: number;
    videoUrl?: string;
  };
  submittedAt: string;
  updatedAt: string;
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
  kycStatus?: KycStatus;
  kycRejectionReason?: string;
  forceReverification?: boolean;
  forceReverificationReason?: string;
  vipLevel?: string;
  antiPhishingCode?: string;
  twoFactorEnabled?: boolean;
  whitelistEnabled?: boolean;
  whitelistedWallets?: WhitelistedWallet[];
  securityLogs?: SecurityLogItem[];
  preferredCurrency?: string;
  pushTokens?: string[];
  biometricsEnabled?: boolean;
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
  status: 'completed' | 'pending' | 'rejected' | 'pending_kyc';
  txHash: string;
  note: string;
  verificationHold?: boolean;
  holdReason?: string;
  heldAt?: string;
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

export type SupportChatStatus = 'waiting_agent' | 'active' | 'resolved' | 'closed';

export interface SupportMessage {
  id: string;
  chatId: string;
  sender: 'user' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface SupportChatSession {
  id: string;
  userId?: string | null;
  userName: string;
  userEmail: string;
  userUid?: string;
  userBalance?: number;
  status: SupportChatStatus;
  assignedAgentName?: string;
  lastMessageText: string;
  lastMessageSender: 'user' | 'agent' | 'system';
  lastMessageAt: string;
  unreadByAdmin: number;
  unreadByUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorLog {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  isp: string;
  org?: string;
  asn?: string;
  device: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  deviceModel?: string;
  browser: string;
  os: string;
  path: string;
  site: 'website' | 'dashboard' | 'other';
  referrer: string;
  userAgent?: string;
  visitedAt: string;
  lastActiveAt: string;
  visitCount: number;
  userName?: string;
  userEmail?: string;
  userUid?: string;
}

export interface VisitorAnalyticsSummary {
  onlineCount: number;
  totalUniqueVisitors: number;
  totalVisits: number;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topCountries: { country: string; countryCode: string; count: number }[];
  topIsps: { isp: string; count: number }[];
}

