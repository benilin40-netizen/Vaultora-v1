const TOKEN_KEY = 'vaultora_token';
const ADMIN_TOKEN_KEY = 'vaultora_admin_token';

export const api = {
  getToken(isAdmin = false): string | null {
    return localStorage.getItem(isAdmin ? ADMIN_TOKEN_KEY : TOKEN_KEY);
  },

  setToken(token: string, isAdmin = false) {
    localStorage.setItem(isAdmin ? ADMIN_TOKEN_KEY : TOKEN_KEY, token);
  },

  clearToken(isAdmin = false) {
    localStorage.removeItem(isAdmin ? ADMIN_TOKEN_KEY : TOKEN_KEY);
  },

  async request(endpoint: string, options: RequestInit = {}, isAdmin = false) {
    const token = this.getToken(isAdmin);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'An unexpected error occurred');
    }
    return data;
  },

  // Health
  async checkHealth() {
    return this.request('/api/health');
  },

  // Auth User
  async registerUser(payload: any) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token, false);
    return res;
  },

  async loginUser(payload: any) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token, false);
    return res;
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  async logoutUser() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken(false);
    }
  },

  // Admin Auth & Bootstrap
  async checkAdminBootstrap() {
    return this.request('/api/admin/check-bootstrap');
  },

  async adminSignup(payload: any) {
    const res = await this.request('/api/admin/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token, true);
    return res;
  },

  async adminLogin(payload: any) {
    const res = await this.request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token, true);
    return res;
  },

  async getAdminMe() {
    return this.request('/api/admin/me', {}, true);
  },

  async adminLogout() {
    this.clearToken(true);
  },

  // User Dashboard & Operations
  async getUserDashboard() {
    return this.request('/api/user/dashboard');
  },

  async createDeposit(payload: any) {
    return this.request('/api/user/deposits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createWithdrawal(payload: any) {
    return this.request('/api/user/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createSavingsPlan(payload: any) {
    return this.request('/api/user/savings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // User Support & Dispute Operations
  async getUserSupportTickets() {
    return this.request('/api/user/support-tickets');
  },

  async createUserSupportTicket(payload: { subject: string; category: string; message: string; transactionReference?: string }) {
    return this.request('/api/user/support-tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async replyUserSupportTicket(ticketId: string, message: string) {
    return this.request(`/api/user/support-tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Admin Dashboard & Management
  async getAdminOverview() {
    return this.request('/api/admin/overview', {}, true);
  },

  async getAdminUsers() {
    return this.request('/api/admin/users', {}, true);
  },

  async updateAdminUserStatus(id: string, status: string, reason: string) {
    return this.request(`/api/admin/users/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    }, true);
  },

  async getAdminDeposits() {
    return this.request('/api/admin/deposits', {}, true);
  },

  async reviewAdminDeposit(id: string, status: string, reason: string) {
    return this.request(`/api/admin/deposits/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    }, true);
  },

  async getAdminWithdrawals() {
    return this.request('/api/admin/withdrawals', {}, true);
  },

  async reviewAdminWithdrawal(id: string, status: string, payoutReference: string, reason: string) {
    return this.request(`/api/admin/withdrawals/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, payoutReference, reason }),
    }, true);
  },

  async getAdminTreasury() {
    return this.request('/api/admin/treasury', {}, true);
  },

  async recordAdminTreasury(payload: any) {
    return this.request('/api/admin/treasury', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },

  async getAdminCredits() {
    return this.request('/api/admin/credits', {}, true);
  },

  async issueAdminCredit(payload: any) {
    return this.request('/api/admin/credits', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },

  async getAdminSavingsConfig() {
    return this.request('/api/admin/savings', {}, true);
  },

  async updateAdminSavingsConfig(payload: any) {
    return this.request('/api/admin/savings/config', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },

  async runAdminDailyCalculation() {
    return this.request('/api/admin/savings/run-calculation', {
      method: 'POST',
    }, true);
  },

  async getAdminAuditLogs() {
    return this.request('/api/admin/audit-logs', {}, true);
  },

  async getAdminAdminsList() {
    return this.request('/api/admin/admins', {}, true);
  },

  async createAdminInvite(payload: any) {
    return this.request('/api/admin/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },

  // Website Status & Maintenance Mode
  async getSystemStatus() {
    return this.request('/api/system/status');
  },

  async getAdminWebsiteStatus() {
    return this.request('/api/admin/website-status', {}, true);
  },

  async updateAdminWebsiteStatus(maintenanceMode: boolean, reason?: string) {
    return this.request('/api/admin/website-status', {
      method: 'POST',
      body: JSON.stringify({ maintenanceMode, reason }),
    }, true);
  },

  // Advanced Management API Methods
  async getAdminSecurity() {
    return this.request('/api/admin/security', {}, true);
  },

  async revokeAdminSession(token: string) {
    return this.request('/api/admin/security/revoke-session', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, true);
  },

  async getAdminReconciliation() {
    return this.request('/api/admin/reconciliation', {}, true);
  },

  async getAdminBackupStatus() {
    return this.request('/api/admin/backup/status', {}, true);
  },

  async triggerAdminBackup() {
    return this.request('/api/admin/backup/trigger', {
      method: 'POST',
    }, true);
  },

  async getAdminDiagnostics() {
    return this.request('/api/admin/diagnostics', {}, true);
  },

  async getAdminWorkQueue() {
    return this.request('/api/admin/work-queue', {}, true);
  },

  // 6 Additional Modules
  async getAdminCashFlow() {
    return this.request('/api/admin/cash-flow', {}, true);
  },

  async getAdminSupportTickets() {
    return this.request('/api/admin/support-tickets', {}, true);
  },

  async updateSupportTicket(ticketId: string, status: string, response?: string) {
    return this.request(`/api/admin/support-tickets/${ticketId}`, {
      method: 'POST',
      body: JSON.stringify({ status, response }),
    }, true);
  },

  async getAdminFeatureControls() {
    return this.request('/api/admin/feature-controls', {}, true);
  },

  async updateAdminFeatureControl(featureKey: string, enabled: boolean) {
    return this.request('/api/admin/feature-controls', {
      method: 'POST',
      body: JSON.stringify({ featureKey, enabled }),
    }, true);
  },

  async getAdminDeployments() {
    return this.request('/api/admin/deployments', {}, true);
  },

  async getAdminCompliance() {
    return this.request('/api/admin/compliance', {}, true);
  },

  async getAdminDataIntegrity() {
    return this.request('/api/admin/data-integrity', {}, true);
  },

  async runAdminDataIntegrityCheck() {
    return this.request('/api/admin/data-integrity/run', {
      method: 'POST',
    }, true);
  }
};
