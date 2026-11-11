const TOKEN_KEY = 'vaultora_token';
const ADMIN_TOKEN_KEY = 'vaultora_admin_token';

/**
 * Base URL resolver for API requests.
 * Respects VITE_API_URL if configured, otherwise uses relative paths.
 */
export function getApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any).VITE_API_URL) || '';
  if (baseUrl) {
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBase}${cleanPath}`;
  }
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Centralized API request utility that safely handles:
 * - Base URL resolution via getApiUrl
 * - In-flight GET request deduplication
 * - Setting Accept: application/json and Content-Type: application/json headers
 * - Attaching Bearer tokens when available
 * - Credentials inclusion for secure HTTP-only cookies
 * - Validating Content-Type before parsing JSON
 * - Preventing 'Unexpected token' syntax errors when servers return HTML/text
 * - Extracting clean error messages from non-JSON responses
 * - Returning typed JSON data
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  isAdmin = false
): Promise<T> {
  const finalUrl = getApiUrl(url);
  const token = api.getToken(isAdmin);
  const method = (options.method || 'GET').toUpperCase();

  // Deduplicate identical in-flight GET requests to prevent redundant network bursts
  const dedupeKey = method === 'GET' ? `${method}:${finalUrl}:${token || ''}` : null;
  if (dedupeKey && inFlightRequests.has(dedupeKey)) {
    return inFlightRequests.get(dedupeKey) as Promise<T>;
  }

  const execute = async (): Promise<T> => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Ensure JSON Content-Type for mutation methods if body is a string
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    } else if (!headers['Content-Type'] && method !== 'GET' && method !== 'HEAD') {
      headers['Content-Type'] = 'application/json';
    }

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(finalUrl, {
        ...options,
        credentials: 'include',
        headers,
      });
    } catch (networkError: any) {
      throw new Error(
        `Network connection failed: ${networkError.message || 'Unable to reach the server.'}`
      );
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const rawBody = await response.text();

    // If no content returned (e.g. 204 No Content or empty string)
    if (!rawBody || !rawBody.trim()) {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}.`);
      }
      return {} as T;
    }

    // If response is NOT JSON (e.g. HTML 404, Vercel routing fallback, plain text error)
    if (!contentType.includes('application/json')) {
      const cleanSnippet = rawBody
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);

      throw new Error(
        `API returned an unexpected response (${response.status}): ${cleanSnippet || 'Non-JSON response received'}`
      );
    }

    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new Error('The server returned malformed JSON.');
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error || `API request failed with status ${response.status}.`;
      throw new Error(errorMsg);
    }

    return data as T;
  };

  if (dedupeKey) {
    const requestPromise = execute().finally(() => {
      inFlightRequests.delete(dedupeKey);
    });
    inFlightRequests.set(dedupeKey, requestPromise);
    return requestPromise;
  }

  return execute();
}

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
    return apiRequest(endpoint, options, isAdmin);
  },

  // Health
  async checkHealth() {
    return this.request('/api/health');
  },

  // Auth User - Supports register, signup, login, logout, me
  async registerUser(payload: any) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token, false);
    return res;
  },

  async signupUser(payload: any) {
    const res = await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token, false);
    return res;
  },

  async signup(payload: any) {
    return this.signupUser(payload);
  },

  async loginUser(payload: any) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token, false);
    return res;
  },

  async login(payload: any) {
    return this.loginUser(payload);
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  async me() {
    return this.getMe();
  },

  async logoutUser() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken(false);
    }
  },

  async logout() {
    return this.logoutUser();
  },

  async logoutAllUser() {
    try {
      await this.request('/api/auth/logout-all', { method: 'POST' });
    } finally {
      this.clearToken(false);
    }
  },

  async forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(payload: { token: string; newPassword: string; confirmNewPassword?: string }) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyEmail(token: string) {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async resendVerificationToken(email: string) {
    return this.request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
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
