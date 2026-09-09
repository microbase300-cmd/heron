import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Investment, Transaction, ReferralCommission, PlanConfig, PlanId, RefreshToken, AdminMetrics, NotificationMessage, DepositAddressConfig, WhitelistedWallet, SecurityLogItem, KycSubmission, KycStatus } from '../types';
import { pushService } from './pushNotificationService';

export const DEFAULT_DEPOSIT_ADDRESSES: Record<string, DepositAddressConfig> = {
  USDT_TRC20: {
    key: 'USDT_TRC20',
    asset: 'USDT',
    network: 'Tron (TRC-20)',
    address: 'TX9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  USDT_ERC20: {
    key: 'USDT_ERC20',
    asset: 'USDT',
    network: 'Ethereum (ERC-20)',
    address: '0x882194f8a7e6d5c4b3a201948572615049382710',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  BTC: {
    key: 'BTC',
    asset: 'BTC',
    network: 'Bitcoin Native SegWit',
    address: 'bc1q9d8a7f6e5c4b3a201948572615049382710082',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  ETH: {
    key: 'ETH',
    asset: 'ETH',
    network: 'Ethereum Mainnet',
    address: '0x882194f8a7e6d5c4b3a201948572615049382710',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  SOL: {
    key: 'SOL',
    asset: 'SOL',
    network: 'Solana SPL',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
};

export const PLANS: Record<PlanId, PlanConfig> = {
  amateur: {
    id: 'amateur',
    name: 'Amateur Plan',
    min: 100,
    max: 1999,
    durationHours: 24,
    rate: 0.045, // 4.5%
    referralRate: 0.08, // 8%
    description: 'Foundational 24-hour cycle with guaranteed capital & yield release.',
    badge: '24h • 4.5%',
    isActive: true
  },
  standard: {
    id: 'standard',
    name: 'Standard Plan',
    min: 2000,
    max: 5999,
    durationHours: 48,
    rate: 0.095, // 9.5%
    referralRate: 0.16, // 16%
    description: 'Balanced accumulation over 48 hours with priority queue allocation.',
    badge: '48h • 9.5%',
    isActive: true
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    min: 6000,
    max: 10999,
    durationHours: 72,
    rate: 0.155, // 15.5%
    referralRate: 0.24, // 24%
    description: 'High-velocity institutional yield with dedicated VIP risk mitigation officer.',
    badge: '72h • 15.5%',
    isActive: true
  },
  retirement: {
    id: 'retirement',
    name: 'Retirement Plan',
    min: 11000,
    max: Infinity,
    durationHours: 96,
    rate: 0.225, // 22.5%
    referralRate: 0.30, // 30%
    description: 'Sovereign reserve tier with maximum compounding power and uncapped limits.',
    badge: '96h • 22.5%',
    isActive: true
  }
};

interface DatabaseSchema {
  users: User[];
  refreshTokens: RefreshToken[];
  investments: Investment[];
  transactions: Transaction[];
  referralCommissions: ReferralCommission[];
  planConfigs: Record<PlanId, PlanConfig>;
  notifications: NotificationMessage[];
  depositAddresses: Record<string, DepositAddressConfig>;
  kycSubmissions: KycSubmission[];
}

const DB_FILE = path.join(__dirname, '../../data/db.json');

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const schema: DatabaseSchema = {
          users: parsed.users || [],
          refreshTokens: parsed.refreshTokens || [],
          investments: parsed.investments || [],
          transactions: parsed.transactions || [],
          referralCommissions: parsed.referralCommissions || [],
          planConfigs: parsed.planConfigs || PLANS,
          notifications: parsed.notifications || [],
          depositAddresses: parsed.depositAddresses || DEFAULT_DEPOSIT_ADDRESSES,
          kycSubmissions: parsed.kycSubmissions || [],
        };
        this.ensureDefaults(schema);
        return schema;
      }
    } catch (err) {
      console.error('Error reading db.json, reinitializing...', err);
    }
    const initial = this.seedInitial();
    this.save(initial);
    return initial;
  }

  private ensureDefaults(schema: DatabaseSchema): void {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('Heron2026!', salt);

    // 1. Ensure admin user exists
    const adminEmail = 'admin@heronassets.com';
    let adminUser = schema.users.find(u => u.email.toLowerCase() === adminEmail);
    if (!adminUser) {
      adminUser = {
        id: 'usr_admin_001',
        email: adminEmail,
        name: 'Chief Risk Officer',
        passwordHash: defaultPasswordHash,
        role: 'admin',
        balance: 0.00,
        referralCode: 'HERON-ADMIN',
        referredBy: null,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      schema.users.unshift(adminUser);
    } else {
      adminUser.role = 'admin';
      adminUser.status = 'active';
      adminUser.passwordHash = defaultPasswordHash;
    }

    // 2. Ensure all users have roles and statuses
    schema.users.forEach(u => {
      if (!u.role) u.role = 'user';
      if (!u.status) u.status = 'active';
      if (typeof u.balance !== 'number') u.balance = 0;
    });

    // 4. Ensure deposit addresses initialized
    if (!schema.depositAddresses || Object.keys(schema.depositAddresses).length === 0) {
      schema.depositAddresses = DEFAULT_DEPOSIT_ADDRESSES;
    }

    // 5. Ensure institutional plan configurations exist
    if (!schema.planConfigs || Object.keys(schema.planConfigs).length === 0) {
      schema.planConfigs = { ...PLANS };
    }

    // 6. Ensure initial welcoming broadcast notification exists
    if (!schema.notifications || schema.notifications.length === 0) {
      schema.notifications = [
        {
          id: 'notif_welcome_01',
          userId: null, // Broadcast to all
          targetEmail: null,
          title: 'Institutional Smart Contract Protocol Activated',
          message: 'Welcome to Heron Assets Trustee. Programmatic yield disbursals and cold-custody vault protections are fully active for the 2026 fiscal cycle.',
          type: 'announcement',
          sender: 'Chief Risk Officer',
          readBy: [],
          createdAt: new Date().toISOString()
        }
      ];
    }

    // 7. Ensure security audit logs initialized for existing users
    const nowTs = Date.now();
    schema.users.forEach((u, i) => {
      if (!u.securityLogs || u.securityLogs.length === 0) {
        u.securityLogs = [
          {
            id: `sec_init_${u.id}_01`,
            timestamp: new Date(nowTs - 3600000 * 2).toISOString(),
            ip: '197.210.84.***',
            device: 'Windows 11 • Chrome 128',
            location: 'New York, US [Cloudflare Edge]',
            status: 'Authorized'
          },
          {
            id: `sec_init_${u.id}_02`,
            timestamp: new Date(nowTs - 3600000 * 14).toISOString(),
            ip: '197.210.84.***',
            device: 'Android 15 • Mobile App',
            location: 'New York, US [Mobile Node]',
            status: 'Authorized'
          },
          {
            id: `sec_init_${u.id}_03`,
            timestamp: new Date(nowTs - 86400000 * 2).toISOString(),
            ip: '104.28.19.***',
            device: 'macOS Sonoma • Safari 17',
            location: 'London, UK [Secured Gateway]',
            status: 'Authorized'
          }
        ];
      }
    });

    // 7. Ensure KYC Submissions initialized
    if (!schema.kycSubmissions) {
      schema.kycSubmissions = [];
    }

    this.save(schema);
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const d = dataToSave || this.data;
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json', err);
    }
  }

  private seedInitial(): DatabaseSchema {
    const salt = bcrypt.genSaltSync(10);
    const initialPasswordHash = bcrypt.hashSync('Heron2026!', salt);

    const now = Date.now();
    const adminUser: User = {
      id: 'usr_admin_001',
      email: 'admin@heronassets.com',
      name: 'Chief Risk Officer',
      passwordHash: initialPasswordHash,
      role: 'admin',
      balance: 0.00,
      referralCode: 'HERON-ADMIN',
      referredBy: null,
      status: 'active',
      createdAt: new Date(now - 86400000 * 10).toISOString()
    };

    return {
      users: [adminUser],
      refreshTokens: [],
      investments: [],
      transactions: [],
      referralCommissions: [],
      planConfigs: PLANS,
      notifications: [
        {
          id: 'notif_welcome_01',
          userId: null,
          targetEmail: null,
          title: 'Institutional Smart Contract Protocol Activated',
          message: 'Welcome to Heron Assets Trustee. Programmatic yield disbursals and cold-custody vault protections are fully active for the 2026 fiscal cycle.',
          type: 'announcement',
          sender: 'Chief Risk Officer',
          readBy: [],
          createdAt: new Date().toISOString()
        }
      ],
      depositAddresses: DEFAULT_DEPOSIT_ADDRESSES,
      kycSubmissions: []
    };
  }

  // --- Users ---
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByReferralCode(code: string): User | undefined {
    return this.data.users.find(u => u.referralCode.toUpperCase() === code.toUpperCase());
  }

  getAllUsers(): User[] {
    return this.data.users;
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUserBalance(userId: string, newBalance: number): void {
    const user = this.getUserById(userId);
    if (user) {
      user.balance = Math.max(0, Number(newBalance.toFixed(2)));
      this.save();
    }
  }

  updateUserRole(userId: string, role: User['role']): void {
    const user = this.getUserById(userId);
    if (user) {
      user.role = role;
      this.save();
    }
  }

  updateUserStatus(userId: string, status: User['status']): void {
    const user = this.getUserById(userId);
    if (user) {
      user.status = status;
      this.save();
    }
  }

  // --- Refresh Tokens ---
  saveRefreshToken(token: RefreshToken): RefreshToken {
    this.data.refreshTokens.push(token);
    this.save();
    return token;
  }

  findRefreshToken(tokenHash: string): RefreshToken | undefined {
    return this.data.refreshTokens.find(r => r.tokenHash === tokenHash && !r.revokedAt);
  }

  revokeRefreshToken(tokenHash: string): void {
    const token = this.data.refreshTokens.find(r => r.tokenHash === tokenHash);
    if (token) {
      token.revokedAt = new Date().toISOString();
      this.save();
    }
  }

  revokeAllUserRefreshTokens(userId: string): void {
    const now = new Date().toISOString();
    this.data.refreshTokens.forEach(r => {
      if (r.userId === userId && !r.revokedAt) {
        r.revokedAt = now;
      }
    });
    this.save();
  }

  // --- Investments ---
  getInvestmentsByUserId(userId: string): Investment[] {
    return this.data.investments.filter(i => i.userId === userId);
  }

  getAllInvestments(): Investment[] {
    return this.data.investments;
  }

  getAllActiveInvestments(): Investment[] {
    return this.data.investments.filter(i => i.status === 'active');
  }

  getEscrowInvestments(): Investment[] {
    return this.data.investments.filter(i => i.status === 'active' || i.status === 'matured');
  }

  createInvestment(investment: Investment): Investment {
    this.data.investments.push(investment);
    this.save();
    return investment;
  }

  matureInvestment(investmentId: string): Investment | null {
    const inv = this.data.investments.find(i => i.id === investmentId);
    if (inv && inv.status === 'active') {
      inv.status = 'matured';
      this.save();
      return inv;
    }
    return inv || null;
  }

  completeInvestment(investmentId: string, disbursedBy?: string): Investment | null {
    const inv = this.data.investments.find(i => i.id === investmentId);
    if (inv) {
      inv.status = 'completed';
      inv.completedAt = new Date().toISOString();
      if (disbursedBy) inv.disbursedBy = disbursedBy;
      this.save();
      return inv;
    }
    return null;
  }

  cancelInvestment(investmentId: string, reason?: string): Investment | null {
    const inv = this.data.investments.find(i => i.id === investmentId);
    if (inv && inv.status !== 'completed' && inv.status !== 'cancelled') {
      inv.status = 'cancelled';
      inv.cancelledAt = new Date().toISOString();
      inv.cancellationReason = reason || 'Breach of investment terms and conditions';
      this.save();
      return inv;
    }
    return null;
  }

  // --- Transactions ---
  getTransactionsByUserId(userId: string): Transaction[] {
    return this.data.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllTransactions(): Transaction[] {
    return this.data.transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createTransaction(tx: Transaction): Transaction {
    this.data.transactions.push(tx);
    this.save();
    return tx;
  }

  updateTransactionStatus(txId: string, status: Transaction['status']): void {
    const tx = this.data.transactions.find(t => t.id === txId);
    if (tx) {
      tx.status = status;
      this.save();
    }
  }

  // --- Referrals ---
  getReferralCommissionsByReferrerId(referrerId: string): ReferralCommission[] {
    return this.data.referralCommissions.filter(r => r.referrerId === referrerId);
  }

  getReferredUsers(referralCode: string): User[] {
    return this.data.users.filter(u => u.referredBy?.toUpperCase() === referralCode.toUpperCase());
  }

  createReferralCommission(comm: ReferralCommission): ReferralCommission {
    this.data.referralCommissions.push(comm);
    this.save();
    return comm;
  }

  // --- Plan Configs ---
  getPlanConfigs(): Record<PlanId, PlanConfig> {
    if (!this.data.planConfigs || Object.keys(this.data.planConfigs).length === 0) {
      this.data.planConfigs = { ...PLANS };
      this.save();
    }
    return this.data.planConfigs;
  }

  updatePlanConfig(planId: PlanId, updates: Partial<PlanConfig>): PlanConfig {
    if (!this.data.planConfigs) this.data.planConfigs = PLANS;
    this.data.planConfigs[planId] = {
      ...this.data.planConfigs[planId],
      ...updates
    };
    this.save();
    return this.data.planConfigs[planId];
  }

  // --- Notifications & Messaging ---
  getNotificationsForUser(userId: string, email?: string): (NotificationMessage & { isRead: boolean })[] {
    if (!this.data.notifications) this.data.notifications = [];
    const cleanEmail = email ? email.toLowerCase() : null;

    return this.data.notifications
      .filter((n) => {
        // Broadcasts (null or 'all') OR directed to this specific user ID or email
        return (
          !n.userId ||
          n.userId === 'all' ||
          n.userId === userId ||
          (cleanEmail && n.targetEmail && n.targetEmail.toLowerCase() === cleanEmail)
        );
      })
      .map((n) => ({
        ...n,
        isRead: Array.isArray(n.readBy) && n.readBy.includes(userId),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllNotifications(): NotificationMessage[] {
    return (this.data.notifications || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createNotification(notification: NotificationMessage): NotificationMessage {
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(notification);
    this.save();

    // Asynchronously dispatch push notification to registered mobile devices
    try {
      let tokens: string[] = [];
      if (notification.userId) {
        tokens = this.getUserPushTokens(notification.userId);
      } else if (notification.targetEmail) {
        const target = this.getUserByEmail(notification.targetEmail);
        if (target) tokens = this.getUserPushTokens(target.id);
      } else {
        // System broadcast: dispatch to all registered mobile tokens
        tokens = this.getAllPushTokens();
      }

      if (tokens.length > 0) {
        pushService.dispatchNotification(notification, tokens).catch((err) => {
          console.error('[Push Gateway] Dispatch error:', err);
        });
      }
    } catch (e) {
      console.error('[Push Gateway] Token resolution failure:', e);
    }

    return notification;
  }

  markNotificationAsRead(notificationId: string, userId: string): void {
    if (!this.data.notifications) return;
    const notif = this.data.notifications.find((n) => n.id === notificationId);
    if (notif) {
      if (!Array.isArray(notif.readBy)) notif.readBy = [];
      if (!notif.readBy.includes(userId)) {
        notif.readBy.push(userId);
        this.save();
      }
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    if (!this.data.notifications) return;
    let modified = false;
    this.data.notifications.forEach((n) => {
      if (!Array.isArray(n.readBy)) n.readBy = [];
      if (!n.readBy.includes(userId)) {
        n.readBy.push(userId);
        modified = true;
      }
    });
    if (modified) {
      this.save();
    }
  }

  deleteNotification(notificationId: string): void {
    if (!this.data.notifications) return;
    this.data.notifications = this.data.notifications.filter((n) => n.id !== notificationId);
    this.save();
  }

  // --- Deposit Wallets Configuration ---
  getDepositAddresses(): Record<string, DepositAddressConfig> {
    return this.data.depositAddresses || DEFAULT_DEPOSIT_ADDRESSES;
  }

  updateDepositAddress(key: string, updates: Partial<DepositAddressConfig>): DepositAddressConfig {
    if (!this.data.depositAddresses) {
      this.data.depositAddresses = { ...DEFAULT_DEPOSIT_ADDRESSES };
    }
    const current = this.data.depositAddresses[key] || {
      key,
      asset: 'USDT',
      network: 'Unknown',
      address: '',
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    const updated: DepositAddressConfig = {
      ...current,
      ...updates,
      key,
      updatedAt: new Date().toISOString(),
    };

    this.data.depositAddresses[key] = updated;
    this.save();
    return updated;
  }

  // --- Admin Aggregated Metrics ---
  getAdminMetrics(): AdminMetrics {
    const totalUsers = this.data.users.filter(u => u.role !== 'admin').length;
    const totalPlatformNAV = this.data.users.reduce((acc, u) => acc + (u.balance || 0), 0);
    const activeInvestments = this.data.investments.filter(i => i.status === 'active' || i.status === 'matured');
    const totalLockedInEscrow = activeInvestments.reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalYieldDisbursed = this.data.transactions
      .filter(t => t.type === 'yield_payout' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalReferralsPaid = this.data.referralCommissions
      .reduce((acc, r) => acc + r.commissionAmount, 0);
    const pendingTransactionsCount = this.data.transactions.filter(t => t.status === 'pending').length;

    return {
      totalUsers,
      totalPlatformNAV: totalPlatformNAV + totalLockedInEscrow,
      totalLockedInEscrow,
      totalYieldDisbursed,
      totalReferralsPaid,
      activeInvestmentsCount: activeInvestments.length,
      activeMandatesCount: activeInvestments.length,
      pendingTransactionsCount
    };
  }

  // --- Profile & Security Operations ---
  updateUserProfile(userId: string, updates: Partial<User>): User | undefined {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return undefined;

    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.antiPhishingCode !== undefined) user.antiPhishingCode = updates.antiPhishingCode.trim();
    if (updates.twoFactorEnabled !== undefined) user.twoFactorEnabled = updates.twoFactorEnabled;
    if (updates.whitelistEnabled !== undefined) user.whitelistEnabled = updates.whitelistEnabled;
    if (updates.preferredCurrency !== undefined) user.preferredCurrency = updates.preferredCurrency;
    if (updates.biometricsEnabled !== undefined) user.biometricsEnabled = updates.biometricsEnabled;

    this.save();
    return user;
  }

  updateUserPassword(userId: string, newPasswordHash: string): boolean {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return false;

    user.passwordHash = newPasswordHash;
    this.save();
    return true;
  }

  addWhitelistedWallet(userId: string, wallet: Omit<WhitelistedWallet, 'id' | 'addedAt'>): WhitelistedWallet | undefined {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return undefined;

    if (!user.whitelistedWallets) {
      user.whitelistedWallets = [];
    }

    const newWallet: WhitelistedWallet = {
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      asset: wallet.asset,
      network: wallet.network,
      address: wallet.address.trim(),
      label: wallet.label.trim(),
      addedAt: new Date().toISOString()
    };

    user.whitelistedWallets.push(newWallet);
    this.save();
    return newWallet;
  }

  deleteWhitelistedWallet(userId: string, walletId: string): boolean {
    const user = this.data.users.find(u => u.id === userId);
    if (!user || !user.whitelistedWallets) return false;

    const initialLen = user.whitelistedWallets.length;
    user.whitelistedWallets = user.whitelistedWallets.filter(w => w.id !== walletId);
    if (user.whitelistedWallets.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  recordSecurityLog(userId: string, log: Omit<SecurityLogItem, 'id' | 'timestamp'>): void {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return;

    if (!user.securityLogs) {
      user.securityLogs = [];
    }

    user.securityLogs.unshift({
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ip: log.ip,
      device: log.device,
      location: log.location,
      status: log.status
    });

    if (user.securityLogs.length > 20) {
      user.securityLogs = user.securityLogs.slice(0, 20);
    }
    this.save();
  }

  getSecurityLogs(userId: string): SecurityLogItem[] {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return [];

    if (!user.securityLogs || user.securityLogs.length === 0) {
      const now = Date.now();
      user.securityLogs = [
        {
          id: `sec_init_${user.id}_01`,
          timestamp: new Date(now - 3600000 * 2).toISOString(),
          ip: '197.210.84.***',
          device: 'Windows 11 • Chrome 128',
          location: 'New York, US [Cloudflare Edge]',
          status: 'Authorized'
        },
        {
          id: `sec_init_${user.id}_02`,
          timestamp: new Date(now - 3600000 * 14).toISOString(),
          ip: '197.210.84.***',
          device: 'Android 15 • Mobile App',
          location: 'New York, US [Mobile Node]',
          status: 'Authorized'
        },
        {
          id: `sec_init_${user.id}_03`,
          timestamp: new Date(now - 86400000 * 2).toISOString(),
          ip: '104.28.19.***',
          device: 'macOS Sonoma • Safari 17',
          location: 'London, UK [Secured Gateway]',
          status: 'Authorized'
        }
      ];
      this.save();
    }

    return user.securityLogs;
  }

  saveUserPushToken(userId: string, token: string): boolean {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return false;

    if (!user.pushTokens) {
      user.pushTokens = [];
    }

    if (!user.pushTokens.includes(token)) {
      user.pushTokens.push(token);
      this.save();
      return true;
    }
    return false;
  }

  getUserPushTokens(userId: string): string[] {
    const user = this.data.users.find((u) => u.id === userId);
    return user?.pushTokens || [];
  }

  getAllPushTokens(): string[] {
    const tokens: string[] = [];
    for (const u of this.data.users) {
      if (Array.isArray(u.pushTokens)) {
        for (const t of u.pushTokens) {
          if (!tokens.includes(t)) tokens.push(t);
        }
      }
    }
    return tokens;
  }

  // --- Automated KYC & Compliance Management ---
  createKycSubmission(submission: KycSubmission): KycSubmission {
    if (!this.data.kycSubmissions) this.data.kycSubmissions = [];
    // Remove previous submission for this user if any exists
    this.data.kycSubmissions = this.data.kycSubmissions.filter(s => s.userId !== submission.userId);
    this.data.kycSubmissions.unshift(submission);

    const user = this.getUserById(submission.userId);
    if (user) {
      user.kycStatus = submission.status;
      user.forceReverification = false;
      user.forceReverificationReason = undefined;
    }

    this.save();
    return submission;
  }

  getAllKycSubmissions(): KycSubmission[] {
    if (!this.data.kycSubmissions) this.data.kycSubmissions = [];
    return [...this.data.kycSubmissions].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  getKycSubmissionById(id: string): KycSubmission | undefined {
    return (this.data.kycSubmissions || []).find(s => s.id === id);
  }

  getKycSubmissionByUserId(userId: string): KycSubmission | undefined {
    return (this.data.kycSubmissions || []).find(s => s.userId === userId);
  }

  updateKycSubmissionStatus(
    id: string,
    status: KycStatus,
    rejectionReason?: string,
    adminNotes?: string,
    reviewer?: string
  ): KycSubmission | null {
    const sub = (this.data.kycSubmissions || []).find(s => s.id === id);
    if (!sub) return null;

    sub.status = status;
    sub.updatedAt = new Date().toISOString();
    if (rejectionReason) sub.rejectionReason = rejectionReason;
    if (adminNotes) sub.adminNotes = adminNotes;
    if (reviewer) {
      sub.reviewedBy = reviewer;
      sub.reviewedAt = new Date().toISOString();
    }

    const user = this.getUserById(sub.userId);
    if (user) {
      user.kycStatus = status;
      if (status === 'verified') {
        user.kycLevel = 'tier2';
        user.kycRejectionReason = undefined;
        user.forceReverification = false;
        user.forceReverificationReason = undefined;

        // Automatically release any KYC-held transactions for this user
        if (this.data.transactions) {
          this.data.transactions.forEach(tx => {
            if (tx.userId === user.id && tx.status === 'pending_kyc') {
              tx.status = 'pending';
              tx.verificationHold = false;
              tx.note = `${tx.note} [Compliance Verification Cleared]`;
            }
          });
        }

        // Send celebration notification to user
        this.createNotification({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.id,
          targetEmail: user.email,
          title: 'Identity Verification Approved (Level 2 Verified)',
          message: 'Congratulations! Your identity credentials have been verified by the Compliance Desk. Full institutional settlement limits ($2,000,000.00/24h) and direct cold-custody privileges are active.',
          type: 'success',
          sender: 'Compliance & Risk Desk',
          readBy: [],
          createdAt: new Date().toISOString()
        });
      } else if (status === 'rejected') {
        user.kycStatus = 'rejected';
        user.kycRejectionReason = rejectionReason || 'Verification document was unreadable or failed compliance check.';

        this.createNotification({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.id,
          targetEmail: user.email,
          title: 'Verification Requires Attention',
          message: `Your identity verification was rejected: "${user.kycRejectionReason}". Please visit the Client Verification Portal to submit updated documentation.`,
          type: 'alert',
          sender: 'Compliance & Risk Desk',
          readBy: [],
          createdAt: new Date().toISOString()
        });
      }
    }

    this.save();
    return sub;
  }

  forceUserReverification(userId: string, reason: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    user.kycStatus = 'action_required';
    user.forceReverification = true;
    user.forceReverificationReason = reason;

    const sub = this.getKycSubmissionByUserId(userId);
    if (sub) {
      sub.status = 'action_required';
      sub.rejectionReason = reason;
      sub.updatedAt = new Date().toISOString();
    }

    this.createNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      targetEmail: user.email,
      title: 'Action Required: Re-Verification Requested',
      message: `The Executive Compliance Officer has requested fresh verification credentials for your account. Reason: "${reason}". Please complete re-verification in your profile.`,
      type: 'warning',
      sender: 'Chief Compliance Officer',
      readBy: [],
      createdAt: new Date().toISOString()
    });

    this.save();
    return true;
  }

  pendTransactionForKyc(txId: string, reason: string): Transaction | null {
    const tx = (this.data.transactions || []).find(t => t.id === txId);
    if (!tx) return null;

    tx.status = 'pending_kyc';
    tx.verificationHold = true;
    tx.holdReason = reason || 'KYC Clearance required before disbursement';
    tx.heldAt = new Date().toISOString();

    const user = this.getUserById(tx.userId);
    if (user) {
      this.createNotification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        targetEmail: user.email,
        title: `Transaction Held for Verification: ${tx.id}`,
        message: `Your transaction of $${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${tx.asset} has been paused on compliance hold: "${tx.holdReason}". Please complete identity verification in the Client Portal to release funds.`,
        type: 'alert',
        sender: 'Settlement Compliance Desk',
        readBy: [],
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    return tx;
  }

  releaseTransactionKycHold(txId: string): Transaction | null {
    const tx = (this.data.transactions || []).find(t => t.id === txId);
    if (!tx) return null;

    tx.status = 'pending';
    tx.verificationHold = false;
    tx.holdReason = undefined;

    const user = this.getUserById(tx.userId);
    if (user) {
      this.createNotification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        targetEmail: user.email,
        title: `Verification Hold Released: ${tx.id}`,
        message: `The compliance hold on your transaction of $${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${tx.asset} has been cleared. Settlement will proceed in the standard queue.`,
        type: 'success',
        sender: 'Settlement Compliance Desk',
        readBy: [],
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    return tx;
  }
}

export const db = new DatabaseService();
