import { User, PlanConfig, Investment, WalletSummary, Transaction, ReferralData, NotificationMessage, DepositAddressConfig, DEFAULT_PLANS, WhitelistedWallet, SecurityLogItem, KycSubmission, KycStatus, KycDocumentType } from '../types';

const API_BASE = 'http://localhost:5000/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('heron_auth_token');
  }

  public setToken(token: string) {
    localStorage.setItem('heron_auth_token', token);
  }

  public removeToken() {
    localStorage.removeItem('heron_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text && text.length < 250 ? text : `Server error (${res.status}: ${res.statusText})` };
    }

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // Auth & OTP
  async sendRegistrationOtp(email: string): Promise<{ message: string; devOtp?: string; expiresAt: number }> {
    return this.request('/auth/send-registration-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async register(
    name: string,
    email: string,
    password: string,
    otpCode: string,
    referralCode?: string
  ): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, otpCode, referralCode })
    });
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Investments
  async getPlans(): Promise<{ plans: PlanConfig[] }> {
    try {
      const res = await this.request<any>('/invest/plans');
      const rawList = Array.isArray(res) ? res : Array.isArray(res?.plans) ? res.plans : [];
      if (rawList.length > 0) {
        const normalized = rawList.map((p: any) => ({
          ...p,
          min: typeof p.min === 'number' ? p.min : 100,
          max: (p.max === null || p.max === undefined || p.max === Infinity || p.max >= 99999999 || !isFinite(p.max)) ? Infinity : Number(p.max),
          rate: typeof p.rate === 'number' ? p.rate : 0.05,
          referralRate: typeof p.referralRate === 'number' ? p.referralRate : 0.1,
          durationHours: typeof p.durationHours === 'number' ? p.durationHours : 24
        }));
        return { plans: normalized };
      }
    } catch (e) {
      console.warn('Could not load remote plans, utilizing standard institutional fallback tiers:', e);
    }
    return { plans: DEFAULT_PLANS };
  }

  async getMyInvestments(): Promise<{ investments: Investment[] }> {
    return this.request<{ investments: Investment[] }>('/invest/my');
  }

  async createInvestment(planId: string, amount: number): Promise<{ message: string; investment: Investment; newBalance: number }> {
    return this.request('/invest/create', {
      method: 'POST',
      body: JSON.stringify({ planId, amount })
    });
  }

  // Wallet & Deposit Addresses
  async getWalletSummary(): Promise<WalletSummary> {
    return this.request<WalletSummary>('/wallet/summary');
  }

  async getDepositAddresses(): Promise<{ addresses: Record<string, DepositAddressConfig> }> {
    return this.request('/wallet/addresses');
  }

  async deposit(amount: number, asset: string, txHash?: string): Promise<{ message: string; transaction: Transaction; status: string }> {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, asset, txHash })
    });
  }

  async requestWithdrawalOtp(): Promise<{ message: string; devOtp?: string; expiresAt: number }> {
    return this.request('/wallet/request-withdrawal-otp', {
      method: 'POST'
    });
  }

  async withdraw(
    amount: number,
    asset: string,
    destinationAddress: string,
    otpCode: string
  ): Promise<{ message: string; transaction: Transaction; newBalance: number; status: string }> {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, asset, destinationAddress, otpCode })
    });
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationMessage[]; unreadCount: number }> {
    return this.request<{ notifications: NotificationMessage[]; unreadCount: number }>('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<{ message: string; id: string }> {
    return this.request(`/notifications/${id}/read`, {
      method: 'POST'
    });
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return this.request('/notifications/read-all', {
      method: 'POST'
    });
  }

  // Referrals
  async getReferralData(): Promise<ReferralData> {
    return this.request<ReferralData>('/referrals');
  }

  // Transactions
  async getTransactions(type?: string): Promise<{ transactions: Transaction[] }> {
    const query = type ? `?type=${type}` : '';
    return this.request<{ transactions: Transaction[] }>(`/transactions${query}`);
  }

  // Public live Binance prices
  async getMarketTickers(): Promise<Array<{ symbol: string; price: number; change24h: number }>> {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!res.ok) throw new Error('Binance error');
      const all = await res.json();
      const targets = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];
      return targets.map(s => {
        const item = all.find((x: any) => x.symbol === s);
        return item ? {
          symbol: s.replace('USDT', ''),
          price: parseFloat(item.lastPrice),
          change24h: parseFloat(item.priceChangePercent)
        } : null;
      }).filter(Boolean) as any;
    } catch {
      return [
        { symbol: 'BTC', price: 68420.50, change24h: 3.42 },
        { symbol: 'ETH', price: 3540.20, change24h: 2.15 },
        { symbol: 'SOL', price: 148.75, change24h: 5.82 },
        { symbol: 'BNB', price: 585.10, change24h: -0.45 },
        { symbol: 'XRP', price: 0.584, change24h: 1.28 }
      ];
    }
  }

  // Profile & Security
  async updateProfile(updates: Partial<User>): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
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

  async getExchangeRates(): Promise<{ base: string; rates: Record<string, number>; lastUpdated: string }> {
    try {
      return await this.request<{ base: string; rates: Record<string, number>; lastUpdated: string }>('/market/exchange-rates');
    } catch {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates) {
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

  // KYC Verification
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
      confidenceScore?: number;
      videoUrl?: string;
    };
  }): Promise<{ message: string; submission: KycSubmission }> {
    return this.request('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiService();
