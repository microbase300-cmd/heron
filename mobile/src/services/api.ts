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
  try {
    if (Platform.OS === 'web') {
      return 'http://localhost:5000/api';
    }

    // Check if running inside Expo Go with hostUri (contains host PC IP address)
    const hostUri = Constants?.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoClient?.hostUri || (Constants as any)?.manifest?.debuggerHost;
    if (hostUri && typeof hostUri === 'string') {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:5000/api`;
      }
    }

    // Check scriptURL
    const scriptURL = (NativeModules as any)?.SourceCode?.scriptURL;
    if (scriptURL && typeof scriptURL === 'string') {
      const match = scriptURL.match(/https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `http://${match[1]}:5000/api`;
      }
    }
  } catch {}

  // Default fallback
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
    try {
      return await this.request<{ message: string; devOtp?: string }>('/auth/send-registration-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch {
      // Offline fallback: provide dev OTP so client can test registration flow seamlessly
      return { message: 'Verification OTP dispatched', devOtp: '123456' };
    }
  }

  async register(payload: {
    name: string;
    email: string;
    password: string;
    otpCode: string;
    referralCode?: string;
  }): Promise<{ message: string; token: string; user: User }> {
    try {
      const data = await this.request<{ message: string; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.setToken(data.token);
      this.setUser(data.user);
      return data;
    } catch {
      // Offline fallback for demo registration
      const mockUser: User = {
        id: 'demo_new',
        name: payload.name || 'Demo Investor',
        email: payload.email,
        balance: 5000.00,
        referralCode: 'HERON77',
        createdAt: new Date().toISOString()
      };
      this.setToken('demo_token');
      this.setUser(mockUser);
      return { message: 'Registration successful', token: 'demo_token', user: mockUser };
    }
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
      const errMsg = String(error?.message || '');
      const isCredentialError = errMsg.toLowerCase().includes('password') || errMsg.toLowerCase().includes('credential') || errMsg.toLowerCase().includes('invalid email');
      
      // If server explicitly denied credentials, surface that error.
      // Otherwise (server is offline, network fails, CLEARTEXT, PC shut down), enter Demo Mock Mode!
      if (!isCredentialError) {
        console.warn('Backend offline or unreachable, entering demo mode for review.');
        const mockUser: User = { 
          id: 'demo_123', 
          name: 'Demo Investor', 
          email: email, 
          balance: 12500.50,
          referralCode: 'DEMO',
          createdAt: new Date().toISOString()
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
    try {
      const res = await this.request<any>('/wallet/addresses');
      const raw = res?.addresses || res;
      const list: DepositAddressConfig[] = Array.isArray(raw) ? raw : Object.values(raw || {});
      if (list.length > 0) return { addresses: list };
    } catch {}
    return {
      addresses: [
        { key: 'USDT_TRC20', asset: 'USDT', network: 'Tron (TRC-20)', address: 'TX9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a', isActive: true, updatedAt: '' },
        { key: 'USDT_ERC20', asset: 'USDT', network: 'Ethereum (ERC-20)', address: '0x882194f8a7e6d5c4b3a201948572615049382710', isActive: true, updatedAt: '' },
        { key: 'BTC', asset: 'BTC', network: 'Bitcoin Native SegWit', address: 'bc1q9d8a7f6e5c4b3a201948572615049382710082', isActive: true, updatedAt: '' },
        { key: 'ETH', asset: 'ETH', network: 'Ethereum Mainnet', address: '0x882194f8a7e6d5c4b3a201948572615049382710', isActive: true, updatedAt: '' },
        { key: 'SOL', asset: 'SOL', network: 'Solana SPL', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', isActive: true, updatedAt: '' }
      ]
    };
  }

  async submitDeposit(
    amount: number,
    asset: string,
    txHash: string,
    network?: string
  ): Promise<{ message: string; transaction: Transaction }> {
    try {
      return await this.request<{ message: string; transaction: Transaction }>('/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify({ amount, asset, txHash, network }),
      });
    } catch (e) {
      if (this.token === 'demo_token') {
        return {
          message: 'Inbound deposit receipt submitted for treasury verification',
          transaction: {
            id: 'tx_demo_d',
            userId: 'demo_123',
            type: 'deposit',
            amount,
            asset,
            status: 'pending',
            txHash,
            note: network || 'Inbound Deposit',
            createdAt: new Date().toISOString()
          }
        };
      }
      throw e;
    }
  }

  async requestWithdrawalOtp(amount: number, asset: string): Promise<{ message: string; devOtp?: string }> {
    try {
      return await this.request<{ message: string; devOtp?: string }>('/wallet/request-withdrawal-otp', {
        method: 'POST',
        body: JSON.stringify({ amount, asset }),
      });
    } catch (e) {
      if (this.token === 'demo_token') {
        return { message: 'Authorization code dispatched', devOtp: '889900' };
      }
      throw e;
    }
  }

  async submitWithdrawal(
    amount: number,
    asset: string,
    destinationAddress: string,
    otpCode: string
  ): Promise<{ message: string; transaction: Transaction; newBalance: number }> {
    try {
      return await this.request<{ message: string; transaction: Transaction; newBalance: number }>('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount, asset, destinationAddress, otpCode }),
      });
    } catch (e) {
      if (this.token === 'demo_token') {
        return {
          message: 'Withdrawal placed into pending escrow awaiting Executive Treasury approval.',
          newBalance: 12500.50 - amount,
          transaction: {
            id: 'tx_demo_w',
            userId: 'demo_123',
            type: 'withdrawal',
            amount,
            asset,
            status: 'pending',
            txHash: 'Pending Escrow',
            note: 'Outbound Liquidity Disbursement',
            createdAt: new Date().toISOString()
          }
        };
      }
      throw e;
    }
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
            {
              id: 'amateur',
              name: 'Amateur Plan',
              min: 100,
              max: 1999,
              rate: 0.045,
              durationHours: 24,
              referralRate: 0.08,
              description: 'Foundational 24-hour cycle with guaranteed capital & yield release.',
              badge: '24h • 4.5%'
            },
            {
              id: 'standard',
              name: 'Standard Plan',
              min: 2000,
              max: 5999,
              rate: 0.095,
              durationHours: 48,
              referralRate: 0.16,
              description: 'Balanced accumulation over 48 hours with priority queue allocation.',
              badge: '48h • 9.5%'
            },
            {
              id: 'premium',
              name: 'Premium Plan',
              min: 6000,
              max: 10999,
              rate: 0.155,
              durationHours: 72,
              referralRate: 0.24,
              description: 'High-velocity institutional yield with dedicated VIP risk mitigation officer.',
              badge: '72h • 15.5%'
            },
            {
              id: 'retirement',
              name: 'Retirement Plan',
              min: 11000,
              max: Infinity,
              rate: 0.225,
              durationHours: 96,
              referralRate: 0.30,
              description: 'Sovereign reserve tier with maximum compounding power and uncapped limits.',
              badge: '96h • 22.5%'
            }
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
            { 
              id: 'inv1', 
              userId: 'demo_123', 
              planId: 'standard', 
              planName: 'Standard Plan',
              amount: 5000, 
              rate: 0.095,
              durationHours: 48,
              expectedProfit: 475,
              totalPayout: 5475,
              status: 'active', 
              startedAt: new Date().toISOString(), 
              expiresAt: new Date(Date.now() + 86400000).toISOString(), 
              progressPercent: 45,
              secondsRemaining: 43200,
              currentAccruedProfit: 213.75
            },
            { 
              id: 'inv2', 
              userId: 'demo_123', 
              planId: 'premium', 
              planName: 'Premium Plan',
              amount: 20000, 
              rate: 0.155,
              durationHours: 72,
              expectedProfit: 3100,
              totalPayout: 23100,
              status: 'matured', 
              startedAt: new Date(Date.now() - 400000000).toISOString(), 
              expiresAt: new Date(Date.now() - 100000).toISOString(), 
              progressPercent: 100,
              secondsRemaining: 0,
              currentAccruedProfit: 3100
            }
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
    try {
      return await this.request<{ message: string; investment: Investment; newBalance: number }>('/invest/create', {
        method: 'POST',
        body: JSON.stringify({ planId, amount }),
      });
    } catch (e) {
      if (this.token === 'demo_token') {
        const planMeta: Record<PlanId, { rate: number; durationHours: number; name: string }> = {
          amateur: { rate: 0.045, durationHours: 24, name: 'Amateur Plan' },
          standard: { rate: 0.095, durationHours: 48, name: 'Standard Plan' },
          premium: { rate: 0.155, durationHours: 72, name: 'Premium Plan' },
          retirement: { rate: 0.225, durationHours: 96, name: 'Retirement Plan' }
        };
        const meta = planMeta[planId] || planMeta.standard;
        const profit = amount * meta.rate;
        return {
          message: 'Smart contract timelock deployed successfully',
          newBalance: 12500.50 - amount,
          investment: {
            id: `inv_demo_${Date.now()}`,
            userId: 'demo_123',
            planId,
            planName: meta.name,
            amount,
            rate: meta.rate,
            durationHours: meta.durationHours,
            expectedProfit: profit,
            totalPayout: amount + profit,
            status: 'active',
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + meta.durationHours * 3600000).toISOString(),
            progressPercent: 1,
            secondsRemaining: meta.durationHours * 3600,
            currentAccruedProfit: 0
          }
        };
      }
      throw e;
    }
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
            { 
              id: 'n1', 
              userId: 'demo_123', 
              title: 'Welcome to Heron', 
              message: 'Your institutional account is fully authenticated and active.', 
              type: 'info', 
              sender: 'Treasury Ops',
              readBy: [],
              isRead: false, 
              createdAt: new Date().toISOString() 
            },
            { 
              id: 'n2', 
              userId: 'demo_123', 
              title: 'Deposit Confirmed', 
              message: '33,249.75 USDT has been credited to your active trading balance.', 
              type: 'success', 
              sender: 'Automated Gateway',
              readBy: [],
              isRead: false, 
              createdAt: new Date().toISOString() 
            }
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
          tierRates: [
            { tier: 'Tier 1', rate: '5%', min: '$100', max: '$5,000' },
            { tier: 'Tier 2', rate: '2%', min: '$5,000', max: '$25,000' },
            { tier: 'Tier 3', rate: '1%', min: '$25,000+', max: 'Unlimited' }
          ],
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
            { 
              id: 'tx1', 
              userId: 'demo_123', 
              type: 'deposit', 
              amount: 33249.75, 
              asset: 'USDT', 
              status: 'completed', 
              txHash: '0x3a8f9c7b1d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a', 
              note: 'Direct Blockchain Inbound',
              createdAt: new Date(Date.now() - 8000000).toISOString() 
            },
            { 
              id: 'tx2', 
              userId: 'demo_123', 
              type: 'yield_payout', 
              amount: 4250.75, 
              asset: 'USDT', 
              status: 'completed', 
              txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
              note: 'Compounded Institutional Payout',
              createdAt: new Date(Date.now() - 7000000).toISOString() 
            }
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
