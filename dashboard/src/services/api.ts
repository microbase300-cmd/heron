import { User, PlanConfig, Investment, WalletSummary, Transaction, ReferralData } from '../types';

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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Network request failed');
    }
    return data;
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async register(name: string, email: string, password: string, referralCode?: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, referralCode })
    });
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Investments
  async getPlans(): Promise<{ plans: PlanConfig[] }> {
    return this.request<{ plans: PlanConfig[] }>('/invest/plans');
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

  // Wallet
  async getWalletSummary(): Promise<WalletSummary> {
    return this.request<WalletSummary>('/wallet/summary');
  }

  async getDepositAddresses(): Promise<{ addresses: Record<string, { network: string; address: string }> }> {
    return this.request('/wallet/addresses');
  }

  async deposit(amount: number, asset: string): Promise<{ message: string; transaction: Transaction; newBalance: number }> {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, asset })
    });
  }

  async withdraw(amount: number, asset: string, destinationAddress: string): Promise<{ message: string; transaction: Transaction; newBalance: number }> {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, asset, destinationAddress })
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
      // Fallback prices if offline
      return [
        { symbol: 'BTC', price: 68420.50, change24h: 3.42 },
        { symbol: 'ETH', price: 3540.20, change24h: 2.15 },
        { symbol: 'SOL', price: 148.75, change24h: 5.82 },
        { symbol: 'BNB', price: 585.10, change24h: -0.45 },
        { symbol: 'XRP', price: 0.584, change24h: 1.28 }
      ];
    }
  }
}

export const api = new ApiService();
