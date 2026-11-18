export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'In Progress'
  | 'Completed'
  | 'Rejected';

export const ENQUIRY_STATUSES: EnquiryStatus[] = [
  'New',
  'Contacted',
  'In Progress',
  'Completed',
  'Rejected',
];

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AdminEnquiry {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  service_required: string;
  status: EnquiryStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total: number;
  newCount: number;
  contactedCount: number;
  inProgressCount: number;
  completedCount: number;
  rejectedCount: number;
}

export interface AdminEnquiryFilters {
  search?: string;
  status?: string;
  service?: string;
  dateFrom?: string;
  dateTo?: string;
}

const SESSION_STORAGE_KEY = 'qubex_admin_session_token';

function getStoredSessionToken(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredSessionToken(token: string | null): void {
  try {
    if (token) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // sessionStorage unavailable
  }
}

function buildAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getStoredSessionToken();
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function buildApiUrl(path: string): string {
  const base = (
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_API_BASE_URL || ''
  )
    .trim()
    .replace(/\/+$/, '');
  return `${base}${path}`;
}

export async function checkAdminSession(): Promise<{
  authenticated: boolean;
  admin?: AdminUser;
  csrfToken?: string;
}> {
  const res = await fetch(buildApiUrl('/api/admin/auth/me'), {
    method: 'GET',
    credentials: 'include',
    headers: buildAuthHeaders(),
  });
  if (res.status === 401 || res.status === 403) {
    setStoredSessionToken(null);
    return { authenticated: false };
  }
  if (!res.ok) {
    throw new Error('Unable to verify administrator session.');
  }
  const data = (await res.json()) as {
    authenticated: boolean;
    admin?: AdminUser;
    csrfToken?: string;
  };
  if (!data.authenticated) {
    setStoredSessionToken(null);
  }
  return data;
}

export async function loginAdmin(
  identifier: string,
  password: string
): Promise<{ admin: AdminUser; csrfToken: string }> {
  const csrfRes = await fetch(buildApiUrl('/api/csrf-token'), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!csrfRes.ok) {
    throw new Error('Unable to initialize secure login token.');
  }
  const { csrfToken: preLoginCsrf } = (await csrfRes.json()) as {
    csrfToken: string;
  };

  const res = await fetch(buildApiUrl('/api/admin/auth/login'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': preLoginCsrf,
    },
    body: JSON.stringify({
      email: identifier.trim(),
      password,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    authenticated?: boolean;
    admin?: AdminUser;
    csrfToken?: string;
    sessionToken?: string;
    error?: string;
  };

  if (!res.ok || !data.authenticated || !data.admin || !data.csrfToken) {
    throw new Error(data.error || 'Invalid administrator credentials.');
  }

  if (data.sessionToken) {
    setStoredSessionToken(data.sessionToken);
  }

  return { admin: data.admin, csrfToken: data.csrfToken };
}

export async function logoutAdmin(csrfToken: string): Promise<void> {
  try {
    await fetch(buildApiUrl('/api/admin/auth/logout'), {
      method: 'POST',
      credentials: 'include',
      headers: buildAuthHeaders({ 'X-CSRF-Token': csrfToken }),
    });
  } finally {
    setStoredSessionToken(null);
  }
}

function buildFilterQuery(filters: AdminEnquiryFilters): string {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.status && filters.status !== 'All') {
    params.set('status', filters.status);
  }
  if (filters.service && filters.service !== 'All') {
    params.set('service', filters.service);
  }
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  return params.toString();
}

export async function fetchAdminEnquiries(
  filters: AdminEnquiryFilters
): Promise<{ enquiries: AdminEnquiry[]; stats: AdminStats }> {
  const query = buildFilterQuery(filters);
  const url = buildApiUrl(
    query ? `/api/admin/enquiries?${query}` : '/api/admin/enquiries'
  );
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: buildAuthHeaders(),
  });
  if (res.status === 401 || res.status === 403) {
    setStoredSessionToken(null);
    throw new Error('SESSION_EXPIRED');
  }
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || 'Failed to load project enquiries.');
  }
  return (await res.json()) as {
    enquiries: AdminEnquiry[];
    stats: AdminStats;
  };
}

export async function updateAdminEnquiry(
  id: number,
  updates: { status?: EnquiryStatus; admin_notes?: string },
  csrfToken: string
): Promise<AdminEnquiry> {
  const res = await fetch(buildApiUrl(`/api/admin/enquiries/${id}`), {
    method: 'PATCH',
    credentials: 'include',
    headers: buildAuthHeaders({
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    }),
    body: JSON.stringify(updates),
  });
  if (res.status === 401) {
    setStoredSessionToken(null);
    throw new Error('SESSION_EXPIRED');
  }
  const data = (await res.json().catch(() => ({}))) as {
    enquiry?: AdminEnquiry;
    error?: string;
  };
  if (!res.ok || !data.enquiry) {
    throw new Error(data.error || 'Unable to update enquiry.');
  }
  return data.enquiry;
}

export async function deleteAdminEnquiry(
  id: number,
  csrfToken: string
): Promise<void> {
  const res = await fetch(buildApiUrl(`/api/admin/enquiries/${id}`), {
    method: 'DELETE',
    credentials: 'include',
    headers: buildAuthHeaders({
      'X-CSRF-Token': csrfToken,
    }),
  });
  if (res.status === 401) {
    setStoredSessionToken(null);
    throw new Error('SESSION_EXPIRED');
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || 'Unable to delete enquiry.');
  }
}

export async function downloadAdminExport(
  format: 'csv' | 'xlsx',
  filters: AdminEnquiryFilters
): Promise<void> {
  const params = new URLSearchParams(buildFilterQuery(filters));
  params.set('format', format);
  const res = await fetch(
    buildApiUrl(`/api/admin/enquiries/export?${params.toString()}`),
    {
      method: 'GET',
      credentials: 'include',
      headers: buildAuthHeaders({ Accept: '*/*' }),
    }
  );

  if (res.status === 401 || res.status === 403) {
    setStoredSessionToken(null);
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok) {
    throw new Error('Unable to export enquiries.');
  }

  const blob = await res.blob();
  const dateSlug = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `qubex-enquiries-${dateSlug}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
