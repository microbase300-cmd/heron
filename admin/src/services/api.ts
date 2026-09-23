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
  KycSubmission,
  KycStatus,
  SupportChatSession,
  SupportMessage,
  VisitorLog,
  VisitorAnalyticsSummary,
  WebmailMessage,
  WebmailFolder,
  WebmailFolderStats,
} from '../types';

const getAdminApiBase = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:5000/api';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  if (hostname.includes('heronassetstrusteess.com') || hostname.includes('heronassetstrustees.com')) {
    return 'https://api.heronassetstrusteess.com/api';
  }
  if (hostname.includes('stealthssolutions.com')) {
    return 'https://api.stealthssolutions.com/api';
  }
  if (hostname === '68.168.211.36') {
    return `http://${hostname}:5000/api`;
  }
  return '/api';
};

const API_BASE_URL = getAdminApiBase();

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
    const res = await this.request<any>('/admin/investments');
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.investments)) return res.investments;
    return [];
  }

  public async disburseInvestment(id: string): Promise<{ message: string; totalPayout: number; newBalance?: number }> {
    return this.request<{ message: string; totalPayout: number; newBalance?: number }>(`/admin/investments/${id}/disburse`, {
      method: 'POST',
    });
  }

  public async forceMatureInvestment(id: string): Promise<{ message: string; totalPayout: number }> {
    return this.request<{ message: string; totalPayout: number }>(`/admin/investments/${id}/force-mature`, {
      method: 'POST',
    });
  }

  public async cancelInvestment(
    id: string,
    reason: string,
    refundPrincipal: boolean = true
  ): Promise<{ message: string; investment: Investment; newBalance?: number }> {
    return this.request<{ message: string; investment: Investment; newBalance?: number }>(`/admin/investments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, refundPrincipal }),
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
    const res = await this.request<any>('/admin/wallets');
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
      const target = res.addresses || res;
      if (Array.isArray(target)) return target;
      return Object.entries(target).map(([key, val]: [string, any]) => ({
        key: val?.key || key,
        asset: val?.asset || 'USDT',
        network: val?.network || key,
        address: val?.address || '',
        memo: val?.memo,
        isActive: val?.isActive !== undefined ? val.isActive : true,
        updatedAt: val?.updatedAt || new Date().toISOString(),
      }));
    }
    return [];
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

  // --- KYC & Compliance Desk Methods ---
  public async getKycSubmissions(status?: KycStatus | string): Promise<{ submissions: KycSubmission[]; count: number; pendingCount: number }> {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<{ submissions: KycSubmission[]; count: number; pendingCount: number }>(`/kyc/admin/submissions${query}`);
  }

  public async getKycSubmission(id: string): Promise<{ submission: KycSubmission }> {
    return this.request<{ submission: KycSubmission }>(`/kyc/admin/submissions/${id}`);
  }

  public async approveKyc(id: string, notes?: string): Promise<{ message: string; submission: KycSubmission }> {
    return this.request<{ message: string; submission: KycSubmission }>(`/kyc/admin/submissions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  public async rejectKyc(id: string, reason: string, notes?: string): Promise<{ message: string; submission: KycSubmission }> {
    return this.request<{ message: string; submission: KycSubmission }>(`/kyc/admin/submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, notes }),
    });
  }

  public async forceReverification(userId: string, reason: string): Promise<{ message: string; user: AdminUser }> {
    return this.request<{ message: string; user: AdminUser }>(`/kyc/admin/users/${userId}/force-reverification`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async pendTransactionForKyc(txId: string, reason: string): Promise<{ message: string; transaction: Transaction }> {
    return this.request<{ message: string; transaction: Transaction }>(`/kyc/admin/transactions/${txId}/pend-kyc`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async releaseTransactionKycHold(txId: string): Promise<{ message: string; transaction: Transaction }> {
    return this.request<{ message: string; transaction: Transaction }>(`/kyc/admin/transactions/${txId}/release-kyc`, {
      method: 'POST',
    });
  }

  // Support Live Desk
  public async getSupportChats(): Promise<{ chats: SupportChatSession[]; metrics: { total: number; waitingCount: number; activeCount: number } }> {
    return this.request('/support/admin/chats');
  }

  public async getSupportChatDetails(chatId: string): Promise<{ chat: SupportChatSession; messages: SupportMessage[] }> {
    return this.request(`/support/chat/${chatId}`);
  }

  public async sendSupportReply(chatId: string, text: string, agentName?: string): Promise<{ success: boolean; message: SupportMessage; chat: SupportChatSession }> {
    return this.request(`/support/admin/chat/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ text, agentName })
    });
  }

  public async updateSupportChatStatus(chatId: string, status: string, agentName?: string): Promise<{ success: boolean; chat: SupportChatSession }> {
    return this.request(`/support/admin/chat/${chatId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, agentName })
    });
  }

  public async markSupportChatRead(chatId: string): Promise<{ success: boolean }> {
    return this.request(`/support/admin/chat/${chatId}/read`, {
      method: 'POST'
    });
  }

  // Live Visitor Telemetry
  public async getVisitorTelemetry(params?: { limit?: number; search?: string; filter?: string }): Promise<{ success: boolean; analytics: VisitorAnalyticsSummary; visitors: VisitorLog[] }> {
    const sp = new URLSearchParams();
    if (params?.limit) sp.append('limit', String(params.limit));
    if (params?.search) sp.append('search', params.search);
    if (params?.filter) sp.append('filter', params.filter);
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return this.request(`/analytics/visitors${query}`);
  }

  public async clearVisitorHistory(): Promise<{ success: boolean; message: string }> {
    return this.request('/analytics/visitors', { method: 'DELETE' });
  }

  // Institutional Webmail Suite
  public async getWebmailMessages(params?: { folder?: WebmailFolder; search?: string; limit?: number }): Promise<{ success: boolean; messages: WebmailMessage[]; stats: WebmailFolderStats }> {
    const sp = new URLSearchParams();
    if (params?.folder) sp.append('folder', params.folder);
    if (params?.search) sp.append('search', params.search);
    if (params?.limit) sp.append('limit', String(params.limit));
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return this.request(`/webmail/messages${query}`);
  }

  public async getWebmailMessage(id: string): Promise<{ success: boolean; message: WebmailMessage }> {
    return this.request(`/webmail/message/${id}`);
  }

  public async sendWebmail(data: {
    to: string | string[];
    subject: string;
    bodyText: string;
    bodyHtml?: string;
    fromName?: string;
    replyTo?: string;
    isDraft?: boolean;
  }): Promise<{ success: boolean; message?: WebmailMessage; messageId?: string }> {
    return this.request('/webmail/send', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async markWebmailRead(id: string, isRead = true): Promise<{ success: boolean }> {
    return this.request(`/webmail/message/${id}/read`, {
      method: 'PUT',
      body: JSON.stringify({ isRead })
    });
  }

  public async deleteWebmailMessage(id: string, permanent = false): Promise<{ success: boolean }> {
    return this.request(`/webmail/message/${id}?permanent=${permanent}`, {
      method: 'DELETE'
    });
  }

  public async getWebmailStats(): Promise<{ success: boolean; stats: WebmailFolderStats }> {
    return this.request('/webmail/stats');
  }

  public async syncWebmail(): Promise<{ success: boolean; importedCount: number; stats: WebmailFolderStats }> {
    return this.request('/webmail/sync', { method: 'POST' });
  }
}

export const adminApi = new AdminApiService();
