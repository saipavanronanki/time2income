import {
  corsHeaders,
  errorResponse,
  feeForCurrency,
  PaymentConfigurationError,
  PaymentNetworkError,
  PaymentProviderAuthenticationError,
  PaymentProviderRequestError,
  PaymentRateLimitError,
  razorpayOperationError,
  razorpayRequest,
  readRazorpayEnvironment,
  readRazorpayError,
} from './razorpay.ts';

const assertEquals = (actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}.`);
  }
};

Deno.test('Razorpay authentication failures return a safe actionable response', async () => {
  const providerError = await readRazorpayError(
    new Response(
      JSON.stringify({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Authentication failed',
        },
      }),
      { status: 400 },
    ),
  );
  const error = razorpayOperationError(
    'Razorpay pending order check',
    400,
    providerError,
  );
  const response = errorResponse(
    error,
    new Request('https://edge.example/functions/v1/create-order', {
      headers: { Origin: 'https://time2income.com' },
    }),
  );
  const body = await response.json();

  assertEquals(error instanceof PaymentProviderAuthenticationError, true);
  assertEquals(response.status, 503);
  assertEquals(body.code, 'PAYMENT_PROVIDER_AUTH_FAILED');
  assertEquals(
    body.error,
    'Payment provider authentication failed. Please contact TIME2INCOME support.',
  );
  assertEquals(JSON.stringify(body).includes('RAZORPAY_KEY_SECRET'), false);
});

Deno.test('Razorpay Basic Auth uses the configured key pair without exposing it', async () => {
  const originalFetch = globalThis.fetch;
  const testKeyId = 'rzp_test_example';
  const testSecret = 'unit-test-only-secret';
  let authorizationHeader: string | null = null;

  globalThis.fetch = (_input, init) => {
    authorizationHeader = new Headers(init?.headers).get('authorization');
    return Promise.resolve(new Response('{}', { status: 200 }));
  };

  try {
    await razorpayRequest({
      RAZORPAY_KEY_ID: testKeyId,
      RAZORPAY_KEY_SECRET: testSecret,
    }, 'orders');
  } finally {
    globalThis.fetch = originalFetch;
  }

  assertEquals(
    authorizationHeader,
    `Basic ${btoa(`${testKeyId}:${testSecret}`)}`,
  );
});

Deno.test('Razorpay credentials are trimmed when read from the environment', () => {
  const environment = readRazorpayEnvironment((name) =>
    name === 'RAZORPAY_KEY_ID'
      ? '  rzp_live_example  '
      : '  unit-test-only-secret  '
  );

  assertEquals(environment.RAZORPAY_KEY_ID, 'rzp_live_example');
  assertEquals(environment.RAZORPAY_KEY_SECRET, 'unit-test-only-secret');
});

Deno.test('payment configuration failures do not disclose credential values', async () => {
  let configurationError: PaymentConfigurationError | null = null;
  try {
    readRazorpayEnvironment(() => undefined);
  } catch (error) {
    if (!(error instanceof PaymentConfigurationError)) throw error;
    configurationError = error;
  }
  if (!configurationError) {
    throw new Error('Missing Razorpay credentials were not rejected.');
  }
  const response = errorResponse(
    configurationError,
    new Request('https://edge.example/functions/v1/create-order'),
  );
  const body = await response.json();

  assertEquals(response.status, 503);
  assertEquals(body.code, 'PAYMENT_CONFIGURATION_MISSING');
  assertEquals(
    body.error,
    'Payment service is not configured. Please contact TIME2INCOME support.',
  );
  assertEquals(JSON.stringify(body).includes('unit-test-only-secret'), false);
});

Deno.test('provider response details are normalized before diagnostics or response', async () => {
  const rawDescription =
    'Authentication failed for secret unit-test-only-secret';
  const providerError = await readRazorpayError(
    new Response(
      JSON.stringify({
        error: { code: 'BAD_REQUEST_ERROR', description: rawDescription },
      }),
      { status: 400 },
    ),
  );
  const error = razorpayOperationError(
    'Razorpay order creation',
    400,
    providerError,
  );
  const response = errorResponse(
    error,
    new Request('https://edge.example/functions/v1/create-order'),
  );
  const body = await response.text();

  assertEquals(body.includes(rawDescription), false);
  assertEquals(body.includes('unit-test-only-secret'), false);
});

Deno.test('rate limiting is reported separately from other provider errors', async () => {
  const rateLimit = razorpayOperationError(
    'Razorpay order creation',
    429,
    {
      code: 'RATE_LIMIT_ERROR',
      message: 'Provider rejected request',
      resourceNotFound: false,
    },
  );
  const providerFailure = razorpayOperationError(
    'Razorpay order creation',
    400,
    {
      code: 'BAD_REQUEST_ERROR',
      message: 'Provider rejected request',
      resourceNotFound: false,
    },
  );
  const request = new Request('https://edge.example/functions/v1/create-order');
  const rateResponse = errorResponse(rateLimit, request);
  const providerResponse = errorResponse(providerFailure, request);

  assertEquals(rateLimit instanceof PaymentRateLimitError, true);
  assertEquals(rateResponse.status, 503);
  assertEquals(
    (await rateResponse.json()).code,
    'PAYMENT_PROVIDER_RATE_LIMITED',
  );
  assertEquals(providerFailure instanceof PaymentProviderRequestError, true);
  assertEquals(providerResponse.status, 502);
  assertEquals((await providerResponse.json()).code, 'PAYMENT_PROVIDER_ERROR');
});

Deno.test('network failures return a safe payment error', async () => {
  const response = errorResponse(
    new PaymentNetworkError(),
    new Request('https://edge.example/functions/v1/create-order'),
  );
  const body = await response.json();

  assertEquals(response.status, 503);
  assertEquals(body.code, 'PAYMENT_PROVIDER_NETWORK_FAILURE');
  assertEquals(JSON.stringify(body).includes('unit-test-only-secret'), false);
});

Deno.test('activation fee remains one major currency unit with supported minor-unit precision', () => {
  assertEquals(feeForCurrency('INR').amount, 100);
  assertEquals(feeForCurrency('USD').amount, 100);
  assertEquals(feeForCurrency('JPY').amount, 1);
  assertEquals(feeForCurrency('KWD').amount, 1000);

  let rejected = false;
  try {
    feeForCurrency('XXX');
  } catch (error) {
    rejected = error instanceof Error && error.message === 'INVALID_REQUEST';
  }
  assertEquals(rejected, true);
});

Deno.test('corsHeaders reflects requesting Origin header or defaults to wildcard', () => {
  const reqCloudflare = new Request('https://edge.example/functions/v1/create-order', {
    headers: { Origin: 'https://time2income.pages.dev' },
  });
  const headers = corsHeaders(reqCloudflare);
  assertEquals(headers['Access-Control-Allow-Origin'], 'https://time2income.pages.dev');

  const reqNoOrigin = new Request('https://edge.example/functions/v1/create-order');
  const defaultHeaders = corsHeaders(reqNoOrigin);
  assertEquals(defaultHeaders['Access-Control-Allow-Origin'], '*');
});
