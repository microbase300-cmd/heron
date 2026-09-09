import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';
import {
  User,
  WalletSummary,
  Transaction,
  DepositAddressConfig,
  NotificationMessage,
  ReferralData,
  MarketTicker,
  Investment,
  PlanConfig,
  PlanId,
  WhitelistedWallet,
  SecurityLogItem,
  KycDocumentType,
  KycStatus,
  KycSubmission
} from '../types';

// Dynamic host determination for Physical Devices, Emulators, and Web
const resolveDefaultHost = (): string => {
  return 'http://2.59.161.183/api';
};

let currentApiHost = resolveDefaultHost();

class MobileApiService {
  private token: string | null = null;
  private user: User | null = null;

  public setBaseUrl(url: string) {
    currentApiHost = url.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return currentApiHost;
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  public setUser(user: User | null) {
    this.user = user;
  }

  public getUser(): User | null {
    return this.user;
  }

  public async checkHealth(): Promise<{ online: boolean; message?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${currentApiHost}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return { online: res.ok };
    } catch {
      return { online: false };
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const url = `${currentApiHost}${endpoint}`;
      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }
      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Connection timed out. Please verify your internet connection.`);
      }
      const msg = String(err?.message || '');
      // Catch all Java socket, Cleartext, or DNS/network errors and shield the UI from raw technical traces
      if (
        msg.includes('Network') ||
        msg.includes('fetch failed') ||
        msg.includes('CLEARTEXT') ||
        msg.includes('ConnectException') ||
        msg.includes('Socket') ||
        msg.includes('Failed to connect') ||
        msg.includes('UnknownServiceException') ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError')
      ) {
        throw new Error(`Cannot reach server. The system is currently offline or in maintenance.`);
      }
      throw err;
    }
  }

  // --- Auth ---
  async sendRegistrationOtp(email: string): Promise<{ message: string; devOtp?: string }> {
    return this.request<{ message: string; devOtp?: string }>('/auth/send-registration-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async register(payload: {
    name: string;
    email: string;
    password: string;
    otpCode: string;
    referralCode?: string;
  }): Promise<{ message: string; token: string; user: User }> {
    const data = await this.request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignored on logout
    } finally {
      this.setToken(null);
      this.setUser(null);
    }
  }

  async getProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // --- Wallet ---
  async getWalletSummary(): Promise<WalletSummary> {
    const res = await this.request<any>('/wallet/summary');
    return res?.summary || res;
  }

  async getDepositAddresses(): Promise<{ addresses: DepositAddressConfig[] }> {
    const res = await this.request<any>('/wallet/addresses');
    const raw = res?.addresses || res;
    const list: DepositAddressConfig[] = Array.isArray(raw) ? raw : Object.values(raw || {});
    return { addresses: list };
  }

  async submitDeposit(
    amount: number,
    asset: string,
    txHash: string,
    network?: string
  ): Promise<{ message: string; transaction: Transaction }> {
    return this.request<{ message: string; transaction: Transaction }>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, asset, txHash, network }),
    });
  }

  async requestWithdrawalOtp(amount: number, asset: string): Promise<{ message: string; devOtp?: string }> {
    return this.request<{ message: string; devOtp?: string }>('/wallet/request-withdrawal-otp', {
      method: 'POST',
      body: JSON.stringify({ amount, asset }),
    });
  }

  async submitWithdrawal(
    amount: number,
    asset: string,
    destinationAddress: string,
    otpCode: string
  ): Promise<{ message: string; transaction: Transaction; newBalance: number }> {
    return this.request<{ message: string; transaction: Transaction; newBalance: number }>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, asset, destinationAddress, otpCode }),
    });
  }

  async getPlans(): Promise<{ plans: PlanConfig[] }> {
    const res = await this.request<any>('/invest/plans');
    const raw = res?.plans || res;
    const list: any[] = Array.isArray(raw) ? raw : Object.values(raw || {});
    const normalized: PlanConfig[] = list.map((p) => ({
      ...p,
      min: typeof p.min === 'number' ? p.min : 100,
      max: (p.max === null || p.max === undefined || p.max === Infinity || p.max >= 99999999 || !isFinite(p.max)) ? Infinity : Number(p.max),
      rate: typeof p.rate === 'number' ? p.rate : 0.05,
      referralRate: typeof p.referralRate === 'number' ? p.referralRate : 0.1,
      durationHours: typeof p.durationHours === 'number' ? p.durationHours : 24
    }));
    return { plans: normalized };
  }

  async getMyInvestments(): Promise<{ investments: Investment[] }> {
    const res = await this.request<any>('/invest/my');
    const raw = res?.investments || res;
    return { investments: Array.isArray(raw) ? raw : [] };
  }

  async createInvestment(
    planId: PlanId,
    amount: number
  ): Promise<{ message: string; investment: Investment; newBalance: number }> {
    return this.request<{ message: string; investment: Investment; newBalance: number }>('/invest/create', {
      method: 'POST',
      body: JSON.stringify({ planId, amount }),
    });
  }

  // --- Notifications ---
  async getNotifications(): Promise<{ notifications: NotificationMessage[]; unreadCount: number }> {
    const res = await this.request<any>('/notifications');
    const list = Array.isArray(res?.notifications) ? res.notifications : Array.isArray(res) ? res : [];
    return {
      notifications: list,
      unreadCount: res?.unreadCount ?? list.filter((n: any) => !n.isRead).length
    };
  }

  async markNotificationRead(id: string): Promise<{ message: string }> {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return this.request('/notifications/read-all', { method: 'POST' });
  }

  // --- Referrals & Transactions ---
  async getReferrals(): Promise<ReferralData> {
    const res = await this.request<any>('/referrals');
    return {
      referralCode: res?.referralCode || '',
      referralLink: res?.referralLink || '',
      totalReferrals: res?.totalReferrals || 0,
      totalCommissionEarned: res?.totalCommissionEarned || 0,
      tierRates: Array.isArray(res?.tierRates) ? res.tierRates : [],
      commissions: Array.isArray(res?.commissions) ? res.commissions : [],
      downline: Array.isArray(res?.downline) ? res.downline : []
    };
  }

  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    const res = await this.request<any>('/transactions');
    const raw = res?.transactions || res;
    return { transactions: Array.isArray(raw) ? raw : [] };
  }

  async getMarketTickers(): Promise<MarketTicker[]> {
    try {
      const res = await this.request<any>('/market/tickers');
      const list = Array.isArray(res) ? res : Array.isArray(res?.tickers) ? res.tickers : [];
      if (list.length > 0) return list;
    } catch {
      // Fallback to default institutional tickers
    }
    return [
      { symbol: 'BTC/USD', price: 92450.00, change24h: 3.42 },
      { symbol: 'ETH/USD', price: 3420.50, change24h: 1.85 },
      { symbol: 'SOL/USD', price: 184.20, change24h: 6.12 },
      { symbol: 'USDT/USD', price: 1.00, change24h: 0.01 }
    ];
  }

  // --- Profile & Security Operations ---
  async updateProfile(updates: Partial<User>): Promise<{ message: string; user: User }> {
    const res = await this.request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (res?.user) this.setUser({ ...(this.getUser() || {}), ...res.user } as User);
    return res;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async addWhitelistedWallet(wallet: { asset: string; network: string; address: string; label: string }): Promise<{ message: string; wallet: WhitelistedWallet }> {
    return this.request<{ message: string; wallet: WhitelistedWallet }>('/auth/whitelist-wallet', {
      method: 'POST',
      body: JSON.stringify(wallet)
    });
  }

  async deleteWhitelistedWallet(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/auth/whitelist-wallet/${id}`, {
      method: 'DELETE'
    });
  }

  async getSecurityLogs(): Promise<{ logs: SecurityLogItem[] }> {
    const res = await this.request<{ logs: SecurityLogItem[] }>('/auth/security-logs');
    return { logs: res?.logs || [] };
  }

  async registerPushToken(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/notifications/push-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // --- KYC Verification Operations ---
  async getKycStatus(): Promise<{
    status: KycStatus;
    submission?: KycSubmission;
    kycRejectionReason?: string;
    forceReverification?: boolean;
    forceReverificationReason?: string;
    kycLevel?: string;
  }> {
    return this.request('/kyc/status');
  }

  async submitKyc(data: {
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
    };
  }): Promise<{ message: string; submission: KycSubmission; status: KycStatus; ocrResult?: any }> {
    return this.request('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExchangeRates(): Promise<{ base: string; rates: Record<string, number>; lastUpdated: string }> {
    try {
      return await this.request<{ base: string; rates: Record<string, number>; lastUpdated: string }>('/market/exchange-rates');
    } catch {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data?.rates) {
            return {
              base: 'USD',
              rates: {
                USD: 1.0,
                EUR: typeof data.rates.EUR === 'number' ? Number(data.rates.EUR.toFixed(6)) : 0.860364,
                GBP: typeof data.rates.GBP === 'number' ? Number(data.rates.GBP.toFixed(6)) : 0.738631,
              },
              lastUpdated: new Date().toISOString(),
            };
          }
        }
      } catch {
        // fallback
      }
      return {
        base: 'USD',
        rates: {
          USD: 1.0,
          EUR: 0.860364,
          GBP: 0.738631,
        },
        lastUpdated: new Date().toISOString(),
      };
    }
  }
}

export const mobileApi = new MobileApiService();
