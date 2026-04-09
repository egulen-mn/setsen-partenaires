const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://setsen.fr';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T = any>(method: Method, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body && method !== 'GET') {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    request('POST', '/api/partner-auth/login', { email, password }),

  register: (data: { inviteToken: string; email: string; password: string; name: string }) =>
    request('POST', '/api/partner-auth/register', data),

  selfRegister: (data: { email: string; password: string; name: string; companyName: string; phone?: string; category?: string; description?: string; message?: string; slug?: string }) =>
    request('POST', '/api/partner-auth/self-register', data),

  logout: () => request('POST', '/api/partner-auth/logout'),

  me: () => request('GET', '/api/partner-auth/me'),
};

// ── Dashboard ───────────────────────────────────────────────────────────────

export const dashboard = {
  get: () => request('GET', '/api/partner/dashboard'),
};

// ── Commissions ─────────────────────────────────────────────────────────────

export const commissions = {
  list: (params?: { status?: string; limit?: number; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page) qs.set('page', String(params.page));
    const q = qs.toString();
    return request('GET', `/api/partner/commissions${q ? `?${q}` : ''}`);
  },
};

// ── QR Placements ───────────────────────────────────────────────────────────

export const qrCodes = {
  list: () => request('GET', '/api/partner/qr-codes'),

  create: (data: { partnershipId: string; label: string; location?: string }) =>
    request('POST', '/api/partner/qr-codes', data),

  remove: (id: string) => request('DELETE', `/api/partner/qr-codes/${id}`),

  update: (id: string, data: { label?: string; location?: string; active?: boolean; isDefault?: boolean }) =>
    request('PATCH', `/api/partner/qr-codes/${id}`, data),

  /** Generate a branded QR PDF. Pass `unified: true` for global partner QR (no placementId). */
  generateAsset: async (opts: { placementId?: string; unified?: boolean; template: string; cta?: string }): Promise<Blob> => {
    const res = await fetch(`${API_BASE}/api/partner/qr-codes/generate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(res.status, data.error || `Request failed: ${res.status}`);
    }
    return res.blob();
  },
};

// ── Partnerships ────────────────────────────────────────────────────────────

export const partnerships = {
  list: () => request('GET', '/api/partner/partnerships'),

  requestNew: (restaurantId: string) =>
    request('POST', '/api/partner/partnerships/request', { restaurantId }),

  accept: (id: string) =>
    request('PATCH', `/api/partner/partnerships/${id}`, { action: 'accept' }),

  decline: (id: string) =>
    request('PATCH', `/api/partner/partnerships/${id}`, { action: 'decline' }),

  terminate: (id: string) =>
    request('PATCH', `/api/partner/partnerships/${id}`, { action: 'terminate' }),
};

// ── Partner Actions ─────────────────────────────────────────────────────────

export const partnerActions = {
  inviteRestaurant: (data: { restaurantName: string; restaurantEmail: string; message?: string }) =>
    request('POST', '/api/partner/invite-restaurant', data),
};

// ── Restaurant Search ────────────────────────────────────────────────────────

export const restaurants = {
  search: (q: string) =>
    request<{ restaurants: { id: string; name: string; slug: string; email: string | null; primaryDomain: string; address: string | null }[] }>(
      'GET', `/api/partner/restaurants/search?q=${encodeURIComponent(q)}`
    ),
};

// ── Payouts ─────────────────────────────────────────────────────────────────

export const payouts = {
  list: () => request('GET', '/api/partner/payouts'),
};

// ── Profile ─────────────────────────────────────────────────────────────────

export const profile = {
  update: (data: { companyName?: string; address?: string; siret?: string; logoUrl?: string; description?: string }) =>
    request('PATCH', '/api/partner-auth/profile', data),

  uploadLogo: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/partner-auth/upload-logo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(res.status, data.error || 'Upload failed');
    }
    return res.json();
  },

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request('POST', '/api/partner-auth/change-password', data),
};

// ── Password Reset ───────────────────────────────────────────────────────────

export const passwordReset = {
  requestReset: (email: string) =>
    request('POST', '/api/partner-auth/forgot-password', { email }),

  validateToken: (token: string): Promise<{ valid: boolean }> =>
    request('GET', `/api/partner-auth/reset-password?token=${encodeURIComponent(token)}`),

  resetPassword: (data: { token: string; password: string }) =>
    request('POST', '/api/partner-auth/reset-password', data),
};
