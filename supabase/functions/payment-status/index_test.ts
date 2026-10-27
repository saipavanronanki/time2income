import { createPaymentStatusHandler } from './handler.ts';
import { readSupabaseAuthEnvironment } from '../_shared/razorpay.ts';

const testEnvironment = () => ({
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'public-anon-key',
});

const request = (
  method = 'POST',
  authorization?: string,
  origin = 'https://time2income.com',
) =>
  new Request('https://edge.example/functions/v1/payment-status', {
    method,
    headers: {
      ...(authorization ? { Authorization: authorization } : {}),
      Origin: origin,
    },
  });

const mockFetch = (
  respond: (url: URL, init: RequestInit) => Response | Promise<Response>,
) => {
  const calls: { url: URL; init: RequestInit }[] = [];
  const fetcher: typeof fetch = (input, init) => {
    const url = input instanceof Request
      ? new URL(input.url)
      : new URL(String(input));
    const options = init || {};
    calls.push({ url, init: options });
    return Promise.resolve(respond(url, options));
  };
  return { fetcher, calls };
};

const assertEquals = (actual: unknown, expected: unknown) => {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}.`);
  }
};

const readBody = async (response: Response) =>
  await response.json() as Record<string, unknown>;

Deno.test('missing bearer token is rejected before reading configuration', async () => {
  let environmentRead = false;
  const handler = createPaymentStatusHandler(() => {
    environmentRead = true;
    throw new Error('configuration should not be read');
  });
  const response = await handler(request());

  assertEquals(response.status, 401);
  assertEquals(environmentRead, false);
});

Deno.test('invalid bearer token is rejected by Supabase Auth', async () => {
  const { fetcher } = mockFetch(() => new Response('{}', { status: 401 }));
  const response = await createPaymentStatusHandler(testEnvironment, fetcher)(
    request('POST', 'Bearer invalid-token'),
  );

  assertEquals(response.status, 401);
});

Deno.test('malformed Supabase user identity is rejected before access lookup', async () => {
  const { fetcher, calls } = mockFetch(() =>
    new Response(JSON.stringify({ id: 123 }), { status: 200 })
  );
  const response = await createPaymentStatusHandler(testEnvironment, fetcher)(
    request('POST', 'Bearer test-token'),
  );

  assertEquals(response.status, 401);
  assertEquals(calls.length, 1);
});

Deno.test('authenticated user with access receives true from the access RPC', async () => {
  const { fetcher, calls } = mockFetch((url) =>
    url.pathname === '/auth/v1/user'
      ? new Response(JSON.stringify({ id: 'user-id' }), { status: 200 })
      : new Response('true', { status: 200 })
  );
  const response = await createPaymentStatusHandler(testEnvironment, fetcher)(
    request('POST', 'Bearer valid-token'),
  );
  const body = await readBody(response);

  assertEquals(response.status, 200);
  assertEquals(body.has_access, true);
  assertEquals(
    new Headers(calls[0].init.headers).get('authorization'),
    'Bearer valid-token',
  );
  assertEquals(
    calls[1].url.pathname,
    '/rest/v1/rpc/has_active_platform_access',
  );
  assertEquals(
    new Headers(calls[1].init.headers).get('apikey'),
    'public-anon-key',
  );
  assertEquals(
    new Headers(calls[1].init.headers).get('authorization'),
    'Bearer valid-token',
  );
  assertEquals(calls[1].init.body, '{}');
});

Deno.test('access status does not call the payment provider', async () => {
  const { fetcher, calls } = mockFetch((url) =>
    url.pathname === '/auth/v1/user'
      ? new Response(JSON.stringify({ id: 'user-id' }), { status: 200 })
      : new Response('false', { status: 200 })
  );
  const response = await createPaymentStatusHandler(testEnvironment, fetcher)(
    request('POST', 'Bearer valid-token'),
  );
  const body = await readBody(response);

  assertEquals(response.status, 200);
  assertEquals(body.has_access, false);
  assertEquals(calls.length, 2);
  assertEquals(
    calls.some((call) => call.url.hostname === 'api.razorpay.com'),
    false,
  );
});

Deno.test('payment status succeeds with Supabase auth config and no Razorpay secrets', async () => {
  const authValues: Record<string, string> = {
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_ANON_KEY: 'public-anon-key',
  };
  const loadAuthConfiguration = () =>
    readSupabaseAuthEnvironment((name) => authValues[name]);
  const { fetcher } = mockFetch((url) =>
    url.pathname === '/auth/v1/user'
      ? new Response(JSON.stringify({ id: 'user-id' }), { status: 200 })
      : new Response('true', { status: 200 })
  );

  const response = await createPaymentStatusHandler(
    loadAuthConfiguration,
    fetcher,
  )(request('POST', 'Bearer test-token'));
  const body = await readBody(response);

  assertEquals(response.status, 200);
  assertEquals(body.has_access, true);
});

Deno.test('authenticated user without access receives false', async () => {
  const { fetcher } = mockFetch((url) =>
    url.pathname === '/auth/v1/user'
      ? new Response(JSON.stringify({ id: 'user-id' }), { status: 200 })
      : new Response('false', { status: 200 })
  );
  const response = await createPaymentStatusHandler(testEnvironment, fetcher)(
    request('POST', 'Bearer valid-token'),
  );
  const body = await readBody(response);

  assertEquals(response.status, 200);
  assertEquals(body.has_access, false);
});

Deno.test('access RPC failure fails closed without returning access', async () => {
  const { fetcher } = mockFetch((url) =>
    url.pathname === '/auth/v1/user'
      ? new Response(JSON.stringify({ id: 'user-id' }), { status: 200 })
      : new Response('{}', { status: 503 })
  );
  const response = await createPaymentStatusHandler(testEnvironment, fetcher)(
    request('POST', 'Bearer valid-token'),
  );
  const body = await readBody(response);

  assertEquals(response.status, 500);
  assertEquals(Object.hasOwn(body, 'has_access'), false);
  assertEquals(
    body.error,
    'Account access could not be verified. Please try again.',
  );
});

Deno.test('malformed access RPC response fails closed', async () => {
  const { fetcher } = mockFetch((url) =>
    url.pathname === '/auth/v1/user'
      ? new Response(JSON.stringify({ id: 'user-id' }), { status: 200 })
      : new Response('null', { status: 200 })
  );
  const response = await createPaymentStatusHandler(testEnvironment, fetcher)(
    request('POST', 'Bearer test-token'),
  );
  const body = await readBody(response);

  assertEquals(response.status, 500);
  assertEquals(Object.hasOwn(body, 'has_access'), false);
  assertEquals(
    body.error,
    'Account access could not be verified. Please try again.',
  );
});

Deno.test('missing Supabase configuration fails closed', async () => {
  const { fetcher, calls } = mockFetch(() =>
    new Response('{}', { status: 200 })
  );
  const response = await createPaymentStatusHandler(() => {
    throw new Error('Missing server secrets: SUPABASE_URL');
  }, fetcher)(request('POST', 'Bearer valid-token'));

  assertEquals(response.status, 500);
  assertEquals(calls.length, 0);
  assertEquals(
    (await readBody(response)).error,
    'Account access could not be verified. Please try again.',
  );
});

Deno.test('CORS preflight allows the configured production origin', async () => {
  const response = await createPaymentStatusHandler(testEnvironment)(
    request('OPTIONS', undefined, 'https://www.time2income.com'),
  );

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get('Access-Control-Allow-Origin'),
    'https://www.time2income.com',
  );
});

Deno.test('unsupported HTTP methods are rejected', async () => {
  const response = await createPaymentStatusHandler(testEnvironment)(
    request('GET'),
  );

  assertEquals(response.status, 405);
});
