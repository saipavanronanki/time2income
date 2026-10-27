export const corsHeaders = (request: Request) => {
  const origin = request.headers.get('Origin') || '';
  const siteOrigin =
    new URL(Deno.env.get('SITE_URL') || 'https://time2income.com').origin;
  const siteUrl = new URL(siteOrigin);
  const wwwUrl = new URL(siteOrigin);
  wwwUrl.hostname = siteUrl.hostname.startsWith('www.')
    ? siteUrl.hostname.slice(4)
    : `www.${siteUrl.hostname}`;
  const allowedOrigins = new Set([
    siteOrigin,
    wwwUrl.origin,
    'http://127.0.0.1:8765',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ]);

  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin)
      ? origin
      : siteOrigin,
    'Access-Control-Allow-Headers':
      'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
};

export const jsonResponse = (body: unknown, status: number, request: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
  });

export const handleOptions = (request: Request) =>
  request.method === 'OPTIONS'
    ? new Response('ok', { headers: corsHeaders(request) })
    : null;

const readRequiredEnvironment = <T extends string>(
  names: readonly T[],
  getEnvironmentValue: (name: string) => string | undefined = (name) =>
    Deno.env.get(name),
) => {
  const values = Object.fromEntries(
    names.map((name) => [name, getEnvironmentValue(name)?.trim() || '']),
  ) as Record<T, string>;
  const missing = names.filter((name) => !values[name]);
  if (missing.length) throw new PaymentConfigurationError(missing);
  return values;
};

export const readSupabaseAuthEnvironment = (
  getEnvironmentValue?: (name: string) => string | undefined,
) => {
  return readRequiredEnvironment(
    [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
    ] as const,
    getEnvironmentValue,
  );
};

export const readSupabaseAdminEnvironment = () => {
  return {
    ...readSupabaseAuthEnvironment(),
    ...readRequiredEnvironment(['SUPABASE_SERVICE_ROLE_KEY'] as const),
  };
};

export const readRazorpayEnvironment = (
  getEnvironmentValue?: (name: string) => string | undefined,
) => {
  return readRequiredEnvironment(
    [
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
    ] as const,
    getEnvironmentValue,
  );
};

type SupabaseAuthEnvironment = ReturnType<typeof readSupabaseAuthEnvironment>;
export type SupabaseAdminEnvironment = ReturnType<
  typeof readSupabaseAdminEnvironment
>;
export type RazorpayEnvironment = ReturnType<typeof readRazorpayEnvironment>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const requireUser = async (
  request: Request,
  env: SupabaseAuthEnvironment,
  fetcher: typeof fetch = fetch,
) => {
  const authorization = request.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S+$/i.test(authorization)) throw new Error('AUTH_REQUIRED');

  const response = await fetcher(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      authorization,
    },
  });
  if (!response.ok) throw new Error('AUTH_REQUIRED');

  const user: unknown = await response.json();
  if (
    !isRecord(user) ||
    typeof user.id !== 'string' ||
    !user.id
  ) throw new Error('AUTH_REQUIRED');
  return {
    id: user.id,
    ...(typeof user.email === 'string' ? { email: user.email } : {}),
  };
};

export const adminRequest = (
  env: SupabaseAdminEnvironment,
  path: string,
  init: RequestInit = {},
) =>
  fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

export const razorpayRequest = (
  env: RazorpayEnvironment,
  path: string,
  init: RequestInit = {},
) => {
  const timeoutSignal = AbortSignal.timeout(10_000);
  return fetch(`https://api.razorpay.com/v1/${path}`, {
    ...init,
    signal: init.signal || timeoutSignal,
    headers: {
      authorization: `Basic ${
        btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)
      }`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  }).catch(() => {
    throw new PaymentNetworkError();
  });
};

const safeProviderCode = (code: string) =>
  /^[A-Z0-9_]{1,48}$/.test(code) ? code : 'UNKNOWN';

export const readRazorpayError = async (response: Response) => {
  const payload: unknown = await response.json().catch(() => null);
  const providerError = isRecord(payload) && isRecord(payload.error)
    ? payload.error
    : {};
  const rawCode = typeof providerError.code === 'string'
    ? providerError.code
    : 'UNKNOWN';
  const code = safeProviderCode(rawCode);
  const description = typeof providerError.description === 'string'
    ? providerError.description
    : '';

  return {
    code,
    message: /^authentication failed$/i.test(description)
      ? 'Authentication failed'
      : /does not exist|not found/i.test(description)
      ? 'Resource not found'
      : 'Provider rejected request',
    resourceNotFound: /does not exist|not found/i.test(description),
  };
};

export class PaymentProviderAuthenticationError extends Error {
  constructor(
    readonly operation: string,
    readonly providerStatus: number,
    readonly providerCode: string,
  ) {
    super('PAYMENT_PROVIDER_AUTHENTICATION_FAILED');
    this.name = 'PaymentProviderAuthenticationError';
  }
}

export class PaymentRateLimitError extends Error {
  constructor(
    readonly operation: string,
    readonly providerStatus: number,
    readonly providerCode: string,
  ) {
    super('PAYMENT_PROVIDER_RATE_LIMITED');
    this.name = 'PaymentRateLimitError';
  }
}

export class PaymentNetworkError extends Error {
  constructor() {
    super('PAYMENT_PROVIDER_NETWORK_FAILURE');
    this.name = 'PaymentNetworkError';
  }
}

export class PaymentProviderRequestError extends Error {
  constructor(
    readonly operation: string,
    readonly providerStatus: number,
    readonly providerCode: string,
    readonly safeDescription: string,
  ) {
    super('PAYMENT_PROVIDER_REQUEST_FAILED');
    this.name = 'PaymentProviderRequestError';
  }
}

export class PaymentConfigurationError extends Error {
  constructor(readonly missingNames: string[]) {
    super('PAYMENT_CONFIGURATION_MISSING');
    this.name = 'PaymentConfigurationError';
  }
}

export class PaymentServiceUnavailableError extends Error {
  constructor(
    message = 'Payment service is unavailable. Please try again later.',
  ) {
    super(message);
    this.name = 'PaymentServiceUnavailableError';
  }
}

export class PaymentRequestConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentRequestConflictError';
  }
}

export const razorpayOperationError = (
  operation: string,
  status: number,
  providerError: Awaited<ReturnType<typeof readRazorpayError>>,
) => {
  if (providerError.message === 'Authentication failed') {
    return new PaymentProviderAuthenticationError(
      operation,
      status,
      providerError.code,
    );
  }
  if (status === 429) {
    return new PaymentRateLimitError(operation, status, providerError.code);
  }
  return new PaymentProviderRequestError(
    operation,
    status,
    providerError.code,
    providerError.message,
  );
};

export const paymentErrorStatus = (error: unknown) => {
  if (error instanceof Error && error.message === 'AUTH_REQUIRED') return 401;
  if (error instanceof Error && error.message === 'INVALID_REQUEST') return 400;
  if (
    error instanceof PaymentConfigurationError ||
    error instanceof PaymentProviderAuthenticationError ||
    error instanceof PaymentRateLimitError ||
    error instanceof PaymentNetworkError
  ) return 503;
  if (error instanceof PaymentProviderRequestError) {
    return error.providerStatus === 408 || error.providerStatus >= 500
      ? 503
      : 502;
  }
  if (error instanceof PaymentServiceUnavailableError) return 503;
  if (error instanceof PaymentRequestConflictError) return 409;
  return 500;
};

export const errorResponse = (error: unknown, request: Request) => {
  const status = paymentErrorStatus(error);
  const message = error instanceof PaymentConfigurationError
    ? 'Payment service is not configured. Please contact TIME2INCOME support.'
    : error instanceof PaymentProviderAuthenticationError
    ? 'Payment provider authentication failed. Please contact TIME2INCOME support.'
    : error instanceof PaymentRateLimitError
    ? 'Payment provider is temporarily limiting requests. Please wait briefly and try again.'
    : error instanceof PaymentNetworkError
    ? 'Could not reach the payment provider. Your payment attempt is retained for safe retry.'
    : error instanceof PaymentProviderRequestError
    ? 'The payment provider could not complete this request. Please try again or contact support.'
    : status === 401
    ? 'Please sign in to continue.'
    : status === 400
    ? 'Invalid request. Please select a supported currency and try again.'
    : error instanceof PaymentServiceUnavailableError
    ? 'Payment service is temporarily unavailable. Please try again later.'
    : error instanceof PaymentRequestConflictError
    ? error.message
    : 'Payment service is unavailable. Please try again later.';
  let code: string | undefined;
  if (error instanceof PaymentConfigurationError) {
    code = 'PAYMENT_CONFIGURATION_MISSING';
    console.error('Payment configuration is missing.', {
      missing_names: error.missingNames.filter((name) =>
        [
          'SUPABASE_URL',
          'SUPABASE_ANON_KEY',
          'SUPABASE_SERVICE_ROLE_KEY',
          'RAZORPAY_KEY_ID',
          'RAZORPAY_KEY_SECRET',
        ].includes(name)
      ),
    });
  } else if (error instanceof PaymentProviderAuthenticationError) {
    code = 'PAYMENT_PROVIDER_AUTH_FAILED';
    console.error('Razorpay rejected configured credentials.', {
      operation: error.operation.replace(/[^A-Za-z0-9 _-]/g, '').slice(0, 64),
      http_status: error.providerStatus,
      provider_code: safeProviderCode(error.providerCode),
    });
  } else if (error instanceof PaymentRateLimitError) {
    code = 'PAYMENT_PROVIDER_RATE_LIMITED';
    console.error('Razorpay rate limit reached.', {
      operation: error.operation.replace(/[^A-Za-z0-9 _-]/g, '').slice(0, 64),
      http_status: error.providerStatus,
      provider_code: safeProviderCode(error.providerCode),
    });
  } else if (error instanceof PaymentNetworkError) {
    code = 'PAYMENT_PROVIDER_NETWORK_FAILURE';
    console.error('Razorpay network request failed.');
  } else if (error instanceof PaymentProviderRequestError) {
    code = 'PAYMENT_PROVIDER_ERROR';
    console.error('Razorpay returned an error response.', {
      operation: error.operation.replace(/[^A-Za-z0-9 _-]/g, '').slice(0, 64),
      http_status: error.providerStatus,
      provider_code: safeProviderCode(error.providerCode),
      provider_description: [
          'Authentication failed',
          'Resource not found',
          'Provider rejected request',
        ].includes(error.safeDescription)
        ? error.safeDescription
        : 'Provider rejected request',
    });
  } else if (error instanceof PaymentServiceUnavailableError) {
    code = 'PAYMENT_SERVICE_UNAVAILABLE';
  } else if (error instanceof PaymentRequestConflictError) {
    code = 'PAYMENT_ATTEMPT_CONFLICT';
  } else if (status === 500) {
    console.error('Payment function failed with an unexpected internal error.');
  }
  return jsonResponse(
    { error: message, ...(code ? { code } : {}) },
    status,
    request,
  );
};

export const feeForCurrency = (currency: unknown) => {
  if (typeof currency !== 'string') throw new Error('INVALID_REQUEST');
  const code = currency.toUpperCase();
  const fractionDigits: Record<string, number> = {
    INR: 2,
    USD: 2,
    EUR: 2,
    GBP: 2,
    AED: 2,
    SAR: 2,
    QAR: 2,
    OMR: 3,
    BHD: 3,
    KWD: 3,
    SGD: 2,
    MYR: 2,
    AUD: 2,
    NZD: 2,
    CAD: 2,
    CHF: 2,
    CNY: 2,
    JPY: 0,
    KRW: 0,
    THB: 2,
    IDR: 2,
    PHP: 2,
    VND: 0,
    PKR: 2,
    BDT: 2,
    LKR: 2,
    NPR: 2,
    ZAR: 2,
    NGN: 2,
    KES: 2,
    EGP: 2,
    TRY: 2,
    BRL: 2,
    MXN: 2,
    HKD: 2,
    TWD: 2,
    SEK: 2,
    NOK: 2,
    DKK: 2,
    PLN: 2,
    CZK: 2,
    RUB: 2,
    ILS: 2,
    CLP: 0,
    COP: 2,
    ARS: 2,
    GHS: 2,
    MAD: 2,
  };
  const digits = fractionDigits[code];
  if (digits === undefined) throw new Error('INVALID_REQUEST');
  return { currency: code, amount: 10 ** digits };
};

export const constantTimeEqual = (left: string, right: string) => {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) difference |= (a[i] || 0) ^ (b[i] || 0);
  return difference === 0;
};

export const hmacSha256Hex = async (secret: string, message: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(
    new Uint8Array(signature),
    (value) => value.toString(16).padStart(2, '0'),
  ).join('');
};
