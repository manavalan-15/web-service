export interface ProjectEnquiryPayload {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  serviceRequired: string;
}

export interface EnquirySubmissionResult {
  success: boolean;
  referenceId: string;
  submittedAt: string;
  emailNotificationSent: boolean;
  message: string;
}

export class EnquiryApiError extends Error {
  fieldErrors?: Partial<Record<keyof ProjectEnquiryPayload, string>>;

  constructor(
    message: string,
    fieldErrors?: Partial<Record<keyof ProjectEnquiryPayload, string>>
  ) {
    super(message);
    this.name = 'EnquiryApiError';
    this.fieldErrors = fieldErrors;
  }
}

export function validateEnquiryForm(
  data: ProjectEnquiryPayload
): Partial<Record<keyof ProjectEnquiryPayload, string>> {
  const errors: Partial<Record<keyof ProjectEnquiryPayload, string>> = {};

  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!emailPattern.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  const cleanedPhone = data.phone.replace(/[\s\-().+]/g, '');
  if (!data.phone.trim()) {
    errors.phone = 'Please enter your phone number.';
  } else if (
    cleanedPhone.length < 7 ||
    cleanedPhone.length > 18 ||
    !/^\d+$/.test(cleanedPhone)
  ) {
    errors.phone = 'Please enter a valid phone number (at least 7 digits).';
  }

  if (!data.serviceRequired.trim()) {
    errors.serviceRequired = 'Please select the service you require.';
  }

  return errors;
}

async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
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

async function fetchCsrfToken(): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(buildApiUrl('/api/csrf-token'), {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const data = await parseJsonSafely<{ csrfToken?: string }>(response);
    if (response.ok && data?.csrfToken) {
      return data.csrfToken;
    }
    if (attempt === 0) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }
  throw new Error('Unable to initialize secure submission session.');
}

export async function submitProjectEnquiry(
  payload: ProjectEnquiryPayload
): Promise<EnquirySubmissionResult> {
  const csrfToken = await fetchCsrfToken();

  const requestBody = JSON.stringify({
    full_name: payload.fullName.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    company_name: payload.companyName.trim(),
    service_required: payload.serviceRequired.trim(),
  });

  let response: Response | null = null;
  let body: {
    success?: boolean;
    referenceId?: string;
    submittedAt?: string;
    emailNotificationSent?: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Partial<Record<keyof ProjectEnquiryPayload, string>>;
  } | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    response = await fetch(buildApiUrl('/api/enquiries'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: requestBody,
    });

    body = await parseJsonSafely(response);
    if (body !== null) {
      break;
    }

    // Retry once if proxy/dev server returned a transient non-JSON page (e.g. 502/503)
    if (attempt === 0) {
      await new Promise((r) => setTimeout(r, 450));
    }
  }

  if (!response || !body) {
    const statusHint = response ? ` (HTTP ${response.status})` : '';
    throw new EnquiryApiError(
      `Unable to reach the enquiry API${statusHint}. Please wait a moment and try again.`
    );
  }

  if (!response.ok || !body.success) {
    throw new EnquiryApiError(
      body.error ||
        'We could not submit your project enquiry right now. Please try again.',
      body.fieldErrors
    );
  }

  return {
    success: true,
    referenceId: body.referenceId || 'QB-RECEIVED',
    submittedAt: body.submittedAt || new Date().toISOString(),
    emailNotificationSent: Boolean(body.emailNotificationSent),
    message:
      body.message ||
      'Your project enquiry has been saved securely. Our team will review your requirements and respond within one business day.',
  };
}
