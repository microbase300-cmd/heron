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
  PlanId
} from '../types';

// Dynamic host determination for Physical Devices, Emulators, and Web
const resolveDefaultHost = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Check if running inside Expo Go with hostUri (contains host PC IP address)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000/api`;
    }
  }

  // Check scriptURL
  const scriptURL = (NativeModules as any)?.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return `http://${match[1]}:5000/api`;
    }
  }

  // Default to PC's active Wi-Fi LAN IP
  return 'http://192.168.43.149:5000/api';
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
      if (err.message && (err.message.includes('Network request failed') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
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
    try {
      const data = await this.request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(data.token);
      this.setUser(data.user);
      return data;
    } catch (error: any) {
      // If the backend is unreachable, gracefully enter Demo Mock Mode for client review.
      if (error.message && (error.message.includes('Cannot reach') || error.message.includes('timed out'))) {
        console.warn('Backend offline, entering demo mode.');
        const mockUser: User = { 
          id: 'demo_123', 
          name: 'Demo Investor', 
          email: email, 
          role: 'user', 
          referralCode: 'DEMO' 
        };
        this.setToken('demo_token');
        this.setUser(mockUser);
        return { token: 'demo_token', user: mockUser };
      }
      throw error;
    }
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
    try {
      const res = await this.request<any>('/wallet/summary');
      return res?.summary || res;
    } catch (e) {
      if (this.token === 'demo_token') {
        return {
          availableBalance: 12500.50,
          lockedInInvestments: 25000.00,
          totalPortfolioValue: 37500.50,
          totalProfitAccrued: 4250.75,
          totalDeposited: 33249.75,
          totalWithdrawn: 0,
          totalReferralEarnings: 150.00,
          activePlansCount: 2
        };
      }
      return {
        availableBalance: 0, lockedInInvestments: 0, totalPortfolioValue: 0,
        totalProfitAccrued: 0, totalDeposited: 0, totalWithdrawn: 0,
        totalReferralEarnings: 0, activePlansCount: 0
      };
    }
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
    try {
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
    } catch (e) {
      if (this.token === 'demo_token') {
        return {
          plans: [
            { id: 'standard', name: 'Standard Yield', min: 100, max: 10000, rate: 0.045, durationHours: 24, referralRate: 0.02 },
            { id: 'premium', name: 'Premium Institutional', min: 10000, max: Infinity, rate: 0.085, durationHours: 72, referralRate: 0.05 }
          ]
        };
      }
      return { plans: [] };
    }
  }

  async getMyInvestments(): Promise<{ investments: Investment[] }> {
    try {
      const res = await this.request<any>('/invest/my');
      const raw = res?.investments || res;
      return { investments: Array.isArray(raw) ? raw : [] };
    } catch (e) {
      if (this.token === 'demo_token') {
        return {
          investments: [
            { id: 'inv1', userId: 'demo_123', planId: 'standard', amount: 5000, status: 'active', startedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), finalAmount: 5225, createdAt: new Date().toISOString() },
            { id: 'inv2', userId: 'demo_123', planId: 'premium', amount: 20000, status: 'matured', startedAt: new Date(Date.now() - 400000000).toISOString(), expiresAt: new Date(Date.now() - 100000).toISOString(), finalAmount: 21700, createdAt: new Date(Date.now() - 400000000).toISOString() }
          ]
        };
      }
      return { investments: [] };
    }
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
    try {
      const res = await this.request<any>('/notifications');
      const list = Array.isArray(res?.notifications) ? res.notifications : Array.isArray(res) ? res : [];
      return {
        notifications: list,
        unreadCount: res?.unreadCount ?? list.filter((n: any) => !n.isRead).length
      };
    } catch (e) {
      if (this.token === 'demo_token') {
        return {
          notifications: [
            { id: 'n1', userId: 'demo_123', title: 'Welcome to Heron', message: 'Your demo account is ready.', type: 'info', isRead: false, createdAt: new Date().toISOString() },
            { id: 'n2', userId: 'demo_123', title: 'Deposit Received', message: '33,249.75 USDT has been deposited.', type: 'success', isRead: false, createdAt: new Date().toISOString() }
          ],
          unreadCount: 2
        };
      }
      return { notifications: [], unreadCount: 0 };
    }
  }

  async markNotificationRead(id: string): Promise<{ message: string }> {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return this.request('/notifications/read-all', { method: 'POST' });
  }

  // --- Referrals & Transactions ---
  async getReferrals(): Promise<ReferralData> {
    try {
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
    } catch (e) {
      if (this.token === 'demo_token') {
        return {
          referralCode: 'DEMO-8X91P',
          referralLink: 'https://heroncapital.com/register?ref=DEMO-8X91P',
          totalReferrals: 12,
          totalCommissionEarned: 150.00,
          tierRates: [0.05, 0.02, 0.01],
          commissions: [],
          downline: []
        };
      }
      return { referralCode: '', referralLink: '', totalReferrals: 0, totalCommissionEarned: 0, tierRates: [], commissions: [], downline: [] };
    }
  }

  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    try {
      const res = await this.request<any>('/transactions');
      const raw = res?.transactions || res;
      return { transactions: Array.isArray(raw) ? raw : [] };
    } catch (e) {
      if (this.token === 'demo_token') {
        return {
          transactions: [
            { id: 'tx1', userId: 'demo_123', type: 'deposit', amount: 33249.75, asset: 'USDT', status: 'completed', txHash: '0x...', createdAt: new Date(Date.now() - 8000000).toISOString() },
            { id: 'tx2', userId: 'demo_123', type: 'investment', amount: 5000, asset: 'USD', status: 'completed', createdAt: new Date(Date.now() - 7000000).toISOString() }
          ]
        };
      }
      return { transactions: [] };
    }
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
}

export const mobileApi = new MobileApiService();
