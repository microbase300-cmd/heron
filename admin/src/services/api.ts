import {
  AdminMetrics,
  AdminUser,
  Transaction,
  Investment,
  PlanConfig,
  MarketTicker,
  PlanId,
  DepositAddressConfig,
  NotificationMessage,
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

class AdminApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('heron_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public setToken(token: string) {
    localStorage.setItem('heron_admin_token', token);
  }

  public getToken(): string | null {
    return localStorage.getItem('heron_admin_token');
  }

  public clearToken() {
    localStorage.removeItem('heron_admin_token');
    localStorage.removeItem('heron_admin_user');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (res.status === 401 || res.status === 403) {
      this.clearToken();
      window.dispatchEvent(new Event('admin_auth_error'));
      throw new Error('Executive session expired or invalid. Please re-authenticate.');
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Request failed.');
    }
    return data;
  }

  public async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed.');
    }

    if (data.user.role !== 'admin' && data.user.role !== 'compliance') {
      throw new Error('Access denied. Administrator clearance required.');
    }

    const token = data.token || data.accessToken;
    this.setToken(token);
    localStorage.setItem('heron_admin_user', JSON.stringify(data.user));
    return data;
  }

  public getStoredUser(): AdminUser | null {
    const saved = localStorage.getItem('heron_admin_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  public async getMetrics(): Promise<AdminMetrics> {
    return this.request<AdminMetrics>('/admin/metrics');
  }

  public async getUsers(): Promise<AdminUser[]> {
    const res = await this.request<any>('/admin/users');
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.users)) return res.users;
    return [];
  }

  public async adjustUserBalance(
    userId: string,
    amount: number,
    action: 'credit' | 'debit',
    note?: string
  ): Promise<{ message: string; newBalance: number }> {
    return this.request<{ message: string; newBalance: number }>(`/admin/users/${userId}/balance`, {
      method: 'POST',
      body: JSON.stringify({ amount, action, note }),
    });
  }

  public async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  public async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/admin/transactions');
  }

  public async approveTransaction(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/transactions/${id}/approve`, {
      method: 'POST',
    });
  }

  public async rejectTransaction(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/transactions/${id}/reject`, {
      method: 'POST',
    });
  }

  public async getInvestments(): Promise<Investment[]> {
    return this.request<Investment[]>('/admin/investments');
  }

  public async forceMatureInvestment(id: string): Promise<{ message: string; totalPayout: number }> {
    return this.request<{ message: string; totalPayout: number }>(`/admin/investments/${id}/force-mature`, {
      method: 'POST',
    });
  }

  public async getPlans(): Promise<PlanConfig[]> {
    return this.request<PlanConfig[]>('/admin/plans');
  }

  public async updatePlan(id: PlanId, updates: Partial<PlanConfig>): Promise<{ message: string; plan: PlanConfig }> {
    return this.request<{ message: string; plan: PlanConfig }>(`/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async getWallets(): Promise<DepositAddressConfig[]> {
    return this.request<DepositAddressConfig[]>('/admin/wallets');
  }

  public async updateWallet(
    key: string,
    updates: Partial<DepositAddressConfig>
  ): Promise<{ message: string; wallet: DepositAddressConfig }> {
    return this.request<{ message: string; wallet: DepositAddressConfig }>(`/admin/wallets/${key}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async getNotifications(): Promise<NotificationMessage[]> {
    const res = await this.request<any>('/admin/notifications');
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.notifications)) return res.notifications;
    return [];
  }

  public async sendNotification(payload: {
    title: string;
    message: string;
    type?: string;
    recipientType?: 'broadcast' | 'direct';
    targetUserId?: string;
    targetEmail?: string;
    sender?: string;
  }): Promise<{ message: string; notification: NotificationMessage }> {
    return this.request<{ message: string; notification: NotificationMessage }>('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteNotification(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  public async getMarketTickers(): Promise<MarketTicker[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/market/tickers`);
      if (!res.ok) throw new Error('Market feed unavailable');
      return res.json();
    } catch {
      return [];
    }
  }
}

export const adminApi = new AdminApiService();
