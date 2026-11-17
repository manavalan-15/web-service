import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { SERVICES } from '../data/agencyData';
import { BrandLogo } from './ui/BrandLogo';
import {
  AdminEnquiry,
  AdminEnquiryFilters,
  AdminStats,
  AdminUser,
  ENQUIRY_STATUSES,
  EnquiryStatus,
  checkAdminSession,
  deleteAdminEnquiry,
  downloadAdminExport,
  fetchAdminEnquiries,
  loginAdmin,
  logoutAdmin,
  updateAdminEnquiry,
} from '../utils/adminApi';

const EMPTY_STATS: AdminStats = {
  total: 0,
  newCount: 0,
  contactedCount: 0,
  inProgressCount: 0,
  completedCount: 0,
  rejectedCount: 0,
};

function formatRefId(id: number): string {
  return `QB-${String(id).padStart(5, '0')}`;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function StatusDisplay({ status }: { status: EnquiryStatus }) {
  switch (status) {
    case 'New':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E40AF]">
          <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>New</span>
        </span>
      );
    case 'Contacted':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
          <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Contacted</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>In Progress</span>
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Completed</span>
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
          <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Rejected</span>
        </span>
      );
  }
}

export function AdminDashboard() {
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [csrfToken, setCsrfToken] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard state
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detail modal state
  const [selectedEnquiry, setSelectedEnquiry] = useState<AdminEnquiry | null>(
    null
  );
  const [editStatus, setEditStatus] = useState<EnquiryStatus>('New');
  const [editNotes, setEditNotes] = useState('');
  const [savingDetail, setSavingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminEnquiry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Verify existing admin session on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await checkAdminSession();
        if (!active) return;
        if (session.authenticated && session.admin && session.csrfToken) {
          setAdminUser(session.admin);
          setCsrfToken(session.csrfToken);
        }
      } catch {
        // Unauthenticated
      } finally {
        if (active) setAuthChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 220);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeFilters: AdminEnquiryFilters = useMemo(
    () => ({
      search: debouncedSearch,
      status: statusFilter,
      service: serviceFilter,
      dateFrom,
      dateTo,
    }),
    [debouncedSearch, statusFilter, serviceFilter, dateFrom, dateTo]
  );

  const loadEnquiries = useCallback(async () => {
    if (!adminUser) return;
    setLoadingList(true);
    setListError(null);
    try {
      const data = await fetchAdminEnquiries(activeFilters);
      setEnquiries(data.enquiries);
      setStats(data.stats);
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        setAdminUser(null);
        setCsrfToken('');
        setEnquiries([]);
        setLoginError('Your session expired. Please sign in again.');
      } else {
        setListError(
          err instanceof Error ? err.message : 'Unable to load enquiries.'
        );
      }
    } finally {
      setLoadingList(false);
    }
  }, [adminUser, activeFilters]);

  useEffect(() => {
    if (adminUser) {
      void loadEnquiries();
    }
  }, [adminUser, loadEnquiries]);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Please enter your administrator email and password.');
      return;
    }

    setLoginLoading(true);
    try {
      const result = await loginAdmin(loginIdentifier, loginPassword);
      setAdminUser(result.admin);
      setCsrfToken(result.csrfToken);
      setLoginPassword('');
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : 'Unable to sign in.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (csrfToken) {
        await logoutAdmin(csrfToken);
      }
    } finally {
      setAdminUser(null);
      setCsrfToken('');
      setEnquiries([]);
      setStats(EMPTY_STATS);
      setSelectedEnquiry(null);
    }
  };

  const openDetailModal = (item: AdminEnquiry) => {
    setSelectedEnquiry(item);
    setEditStatus(item.status);
    setEditNotes(item.admin_notes || '');
    setDetailError(null);
  };

  const handleSaveDetail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEnquiry || !csrfToken) return;
    setSavingDetail(true);
    setDetailError(null);
    try {
      const updated = await updateAdminEnquiry(
        selectedEnquiry.id,
        {
          status: editStatus,
          admin_notes: editNotes,
        },
        csrfToken
      );
      setSelectedEnquiry(updated);
      setActionBanner(
        `Updated ${formatRefId(updated.id)} (${updated.full_name}) to "${updated.status}".`
      );
      await loadEnquiries();
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        setAdminUser(null);
        setSelectedEnquiry(null);
        setLoginError('Your session expired. Please sign in again.');
      } else {
        setDetailError(
          err instanceof Error ? err.message : 'Unable to save changes.'
        );
      }
    } finally {
      setSavingDetail(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !csrfToken) return;
    setDeleting(true);
    try {
      await deleteAdminEnquiry(deleteTarget.id, csrfToken);
      const deletedRef = formatRefId(deleteTarget.id);
      const deletedName = deleteTarget.full_name;
      if (selectedEnquiry?.id === deleteTarget.id) {
        setSelectedEnquiry(null);
      }
      setDeleteTarget(null);
      setActionBanner(`Deleted enquiry ${deletedRef} (${deletedName}).`);
      await loadEnquiries();
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        setAdminUser(null);
        setDeleteTarget(null);
        setLoginError('Your session expired. Please sign in again.');
      } else {
        setListError(
          err instanceof Error ? err.message : 'Unable to delete enquiry.'
        );
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setServiceFilter('All');
    setDateFrom('');
    setDateTo('');
  };

  const applyDatePreset = (daysBack: number | 'today' | 'all') => {
    if (daysBack === 'all') {
      setDateFrom('');
      setDateTo('');
      return;
    }
    const today = new Date();
    const toStr = today.toISOString().slice(0, 10);
    if (daysBack === 'today') {
      setDateFrom(toStr);
      setDateTo(toStr);
      return;
    }
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - daysBack);
    setDateFrom(fromDate.toISOString().slice(0, 10));
    setDateTo(toStr);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    statusFilter !== 'All' ||
    serviceFilter !== 'All' ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  const recentEnquiries = useMemo(() => enquiries.slice(0, 4), [enquiries]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E40AF]" aria-hidden="true" />
          <span>Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated Login View
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between p-4 sm:p-6">
        <div className="max-w-md w-full mx-auto my-auto py-10">
          <div className="mb-8 flex items-center justify-between">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0F172A] transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Website</span>
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="mb-6 pb-6 border-b border-slate-100">
              <div className="mb-5">
                <BrandLogo variant="dark" />
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.06em] text-[#1E40AF] uppercase mb-1.5">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Restricted Access</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
                Admin Dashboard Sign In
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Sign in with an authorized administrator account to manage project enquiries.
              </p>
            </div>

            {loginError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
              >
                <AlertCircle
                  className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="admin-identifier"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Admin Email or Username
                </label>
                <input
                  id="admin-identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="admin@qubextech.com"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E40AF] disabled:opacity-70 transition-colors cursor-pointer"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </form>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-500 py-4">
          Qubex Tech Solutions · Protected Enquiry Management Portal
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] flex flex-col">
      {/* Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <a href="/" className="shrink-0" aria-label="Qubex Tech Solutions Home">
              <BrandLogo variant="dark" />
            </a>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">
              /
            </span>
            <span className="hidden sm:inline text-sm font-semibold text-slate-700 truncate">
              Project Enquiry Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-xs text-slate-500">
              {adminUser.email}
            </span>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Website</span>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Heading + Export Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.06em] text-[#1E40AF] uppercase mb-1.5">
              Enquiry Operations
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              Project Enquiries
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void loadEnquiries()}
              disabled={loadingList}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => {
                void downloadAdminExport('csv', activeFilters).catch((err) => {
                  setListError(
                    err instanceof Error ? err.message : 'CSV export failed.'
                  );
                });
              }}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                void downloadAdminExport('xlsx', activeFilters).catch((err) => {
                  setListError(
                    err instanceof Error ? err.message : 'Excel export failed.'
                  );
                });
              }}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {actionBanner && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
              <span>{actionBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionBanner(null)}
              aria-label="Dismiss notification"
              className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {listError && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
            <span>{listError}</span>
          </div>
        )}

        {/* 4 Summary Metrics */}
        <section
          aria-label="Enquiry summary metrics"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium text-slate-500 mb-2">
              Total Enquiries
            </div>
            <div className="font-display text-3xl font-bold text-[#0F172A] tabular-nums">
              {stats.total}
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              All recorded submissions
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium text-slate-500 mb-2">
              New Enquiries
            </div>
            <div className="font-display text-3xl font-bold text-[#1E40AF] tabular-nums">
              {stats.newCount}
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              Awaiting initial contact
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium text-slate-500 mb-2">
              In-Progress Enquiries
            </div>
            <div className="font-display text-3xl font-bold text-amber-700 tabular-nums">
              {stats.inProgressCount}
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              Contacted: <span className="tabular-nums">{stats.contactedCount}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-medium text-slate-500 mb-2">
              Completed Enquiries
            </div>
            <div className="font-display text-3xl font-bold text-emerald-700 tabular-nums">
              {stats.completedCount}
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              Rejected: <span className="tabular-nums">{stats.rejectedCount}</span>
            </div>
          </div>
        </section>

        {/* Recent Enquiries Strip */}
        {recentEnquiries.length > 0 && !hasActiveFilters && (
          <section aria-label="Recent enquiries" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-[#0F172A]">
                Recent Enquiries
              </h2>
              <span className="text-xs text-slate-500">
                Latest {recentEnquiries.length} submissions
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {recentEnquiries.map((item) => (
                <button
                  key={`recent-${item.id}`}
                  type="button"
                  onClick={() => openDetailModal(item)}
                  className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-[#1E40AF] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-500 tabular-nums">
                      {formatRefId(item.id)}
                    </span>
                    <StatusDisplay status={item.status} />
                  </div>
                  <div className="text-sm font-bold text-[#0F172A] truncate">
                    {item.full_name}
                  </div>
                  <div className="text-xs text-slate-600 truncate mt-0.5">
                    {item.service_required}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 font-mono tabular-nums">
                    {formatDateTime(item.created_at)}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Filter & Search Bar + Enquiries Table */}
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {/* Filters Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search */}
              <div className="md:col-span-4 relative">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search name, email, phone, company, service..."
                  aria-label="Search enquiries"
                  className="w-full min-h-[40px] pl-10 pr-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Service Filter */}
              <div className="md:col-span-3">
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  aria-label="Filter by service"
                  className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Services</option>
                  {SERVICES.map((svc) => (
                    <option key={svc.id} value={svc.title}>
                      {svc.title}
                    </option>
                  ))}
                  <option value="Multiple Services / Consultation">
                    Multiple Services / Consultation
                  </option>
                </select>
              </div>

              {/* Date From */}
              <div className="md:col-span-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  aria-label="Filter from date"
                  className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-[#0F172A] focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Date To */}
              <div className="md:col-span-2">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  aria-label="Filter to date"
                  className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-[#0F172A] focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Clear */}
              <div className="md:col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters}
                  className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Segmented Status Filter + Date Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg"
                role="tablist"
                aria-label="Filter enquiries by status"
              >
                {(['All', ...ENQUIRY_STATUSES] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      statusFilter === status
                        ? 'bg-white text-[#0F172A] shadow-xs'
                        : 'text-slate-600 hover:text-[#0F172A]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => applyDatePreset('today')}
                  className="hover:text-[#1E40AF] font-medium cursor-pointer"
                >
                  Today
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => applyDatePreset(7)}
                  className="hover:text-[#1E40AF] font-medium cursor-pointer"
                >
                  Last 7d
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => applyDatePreset(30)}
                  className="hover:text-[#1E40AF] font-medium cursor-pointer"
                >
                  Last 30d
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => applyDatePreset('all')}
                  className="hover:text-[#1E40AF] font-medium cursor-pointer"
                >
                  All time
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          {loadingList && enquiries.length === 0 ? (
            <div className="p-6 space-y-3" aria-busy="true">
              {[1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="h-12 rounded-lg bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-base font-bold text-[#0F172A] mb-1">
                {hasActiveFilters
                  ? 'No matching enquiries found'
                  : 'No project enquiries yet'}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                {hasActiveFilters
                  ? 'Try clearing your search query, date range, or status filters to see all submissions.'
                  : 'Customer submissions from the website Project Enquiry form will appear here automatically.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E40AF] transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8F9FA] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4 whitespace-nowrap">Ref</th>
                    <th className="py-3 px-4 whitespace-nowrap">Customer</th>
                    <th className="py-3 px-4 whitespace-nowrap">Service Required</th>
                    <th className="py-3 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 whitespace-nowrap">Submitted</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {enquiries.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 align-top font-mono text-xs font-semibold text-slate-600 tabular-nums whitespace-nowrap">
                        {formatRefId(item.id)}
                      </td>
                      <td className="py-3.5 px-4 align-top min-w-[210px]">
                        <div className="font-semibold text-[#0F172A]">
                          {item.full_name}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {item.email}
                          {item.phone ? ` · ${item.phone}` : ''}
                        </div>
                        {item.company_name && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {item.company_name}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 align-top min-w-[200px]">
                        <div className="font-medium text-[#0F172A]">
                          {item.service_required}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <StatusDisplay status={item.status} />
                      </td>
                      <td className="py-3.5 px-4 align-top text-xs text-slate-600 font-mono tabular-nums whitespace-nowrap">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDetailModal(item)}
                            className="inline-flex items-center justify-center min-h-[34px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[#0F172A] hover:border-[#1E40AF] hover:text-[#1E40AF] transition-colors cursor-pointer"
                          >
                            View &amp; Manage
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            aria-label={`Delete enquiry ${formatRefId(item.id)}`}
                            className="inline-flex items-center justify-center min-h-[34px] px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Individual Enquiry Detail & Management Modal */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-detail-title"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="font-mono text-xs font-semibold text-[#1E40AF] tabular-nums">
                  {formatRefId(selectedEnquiry.id)} · Submitted{' '}
                  {formatDateTime(selectedEnquiry.created_at)}
                </div>
                <h2
                  id="enquiry-detail-title"
                  className="font-display text-lg font-bold text-[#0F172A] mt-0.5"
                >
                  {selectedEnquiry.full_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                aria-label="Close enquiry details"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleSaveDetail}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {detailError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                  <span>{detailError}</span>
                </div>
              )}

              {/* Customer Contact Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pb-5 border-b border-slate-100">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">Email</div>
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="font-semibold text-[#1E40AF] hover:underline break-all"
                    >
                      {selectedEnquiry.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <div className="text-xs text-slate-500">Phone</div>
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="font-semibold text-[#0F172A] hover:text-[#1E40AF]"
                    >
                      {selectedEnquiry.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <div className="text-xs text-slate-500">Company</div>
                    <div className="font-semibold text-[#0F172A]">
                      {selectedEnquiry.company_name || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Last Updated</div>
                  <div className="font-mono text-xs font-medium text-slate-700 mt-0.5 tabular-nums">
                    {formatDateTime(selectedEnquiry.updated_at)}
                  </div>
                </div>
              </div>

              {/* Service Required */}
              <div className="pb-5 border-b border-slate-100 text-sm">
                <div className="text-xs text-slate-500 mb-0.5">
                  Service Required
                </div>
                <div className="font-semibold text-[#0F172A]">
                  {selectedEnquiry.service_required}
                </div>
              </div>

              {/* Status & Admin Notes Controls */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="detail-status"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Enquiry Status
                  </label>
                  <select
                    id="detail-status"
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as EnquiryStatus)
                    }
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                  >
                    {ENQUIRY_STATUSES.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="detail-notes"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Internal Admin Notes
                  </label>
                  <textarea
                    id="detail-notes"
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Record follow-up calls, quotation details, assigned developer, or internal notes..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100 resize-y"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedEnquiry)}
                  className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>Delete Enquiry</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(null)}
                    className="min-h-[42px] px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingDetail}
                    className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E40AF] disabled:opacity-70 transition-colors cursor-pointer"
                  >
                    {savingDetail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explicit Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h2
              id="delete-confirm-title"
              className="font-display text-lg font-bold text-[#0F172A]"
            >
              Delete Project Enquiry?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              This will permanently remove enquiry{' '}
              <span className="font-mono font-semibold text-[#0F172A]">
                {formatRefId(deleteTarget.id)}
              </span>{' '}
              from <span className="font-semibold text-[#0F172A]">{deleteTarget.full_name}</span>.
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deleting}
                className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-70 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
