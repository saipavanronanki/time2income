import { createOrderHandler } from './handler.ts';
import {
  adminRequest as adminRequestType,
  PaymentConfigurationError,
  type RazorpayEnvironment,
  razorpayRequest as razorpayRequestType,
  readRazorpayError,
  type SupabaseAdminEnvironment,
} from '../_shared/razorpay.ts';

type PaymentEnvironment = SupabaseAdminEnvironment & RazorpayEnvironment;

type PaymentRow = {
  user_id: string;
  razorpay_order_id: string;
  receipt: string;
  amount: number;
  currency: string;
  status: string;
  creation_lease_until: string | null;
};

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const makeHarness = (options: {
  entitled?: boolean;
  providerFailure?: (
    path: string,
    init?: RequestInit,
  ) => Response | Error | null;
  timeoutAfterProviderCreate?: boolean;
  failPaymentUpdate?: boolean;
  razorpayConfigured?: boolean;
} = {}) => {
  const rows: PaymentRow[] = [];
  const providerOrders: {
    id: string;
    receipt: string;
    amount: number;
    currency: string;
    status: string;
  }[] = [];
  let id = 0;
  let now = Date.now();
  let providerCreates = 0;
  let razorpayEnvironmentReads = 0;
  const env: PaymentEnvironment = {
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
    RAZORPAY_KEY_ID: 'rzp_live_test',
    RAZORPAY_KEY_SECRET: 'not-used-in-tests',
  };
  const adminRequest = async (
    _env: Parameters<typeof adminRequestType>[0],
    path: string,
    init: RequestInit = {},
  ) => {
    await Promise.resolve();
    const method = init.method || 'GET';
    if (path.startsWith('platform_entitlements')) {
      return json(options.entitled ? [{ user_id: 'user-1' }] : []);
    }
    if (path.startsWith('platform_payments?') && method === 'GET') {
      return json(
        rows.filter((row) =>
          row.user_id === 'user-1' && row.status === 'created'
        ),
      );
    }
    if (path === 'platform_payments' && method === 'POST') {
      if (
        rows.some((row) => row.user_id === 'user-1' && row.status === 'created')
      ) {
        return json({ error: 'duplicate pending' }, 409);
      }
      const row = JSON.parse(String(init.body)) as PaymentRow;
      rows.push(row);
      return json([row], 201);
    }
    if (path.startsWith('platform_payments?') && method === 'PATCH') {
      if (
        options.failPaymentUpdate &&
        String(init.body).includes('"razorpay_order_id":"order_')
      ) {
        return json({ error: 'simulated persistence error' }, 500);
      }
      const url = new URL(`https://db.example/rest/v1/${path}`);
      const receipt = url.searchParams.get('receipt')?.replace(/^eq\./, '');
      const oldOrderId = url.searchParams.get('razorpay_order_id')?.replace(
        /^eq\./,
        '',
      );
      const isClaim = url.searchParams.has('or');
      const row = rows.find((item) =>
        item.receipt === receipt &&
        item.razorpay_order_id === oldOrderId &&
        item.status === 'created'
      );
      if (
        !row ||
        (isClaim && row.creation_lease_until &&
          Date.parse(row.creation_lease_until) > now)
      ) {
        return json([]);
      }
      Object.assign(row, JSON.parse(String(init.body)));
      return json([row]);
    }
    throw new Error(`Unexpected admin request: ${method} ${path}`);
  };
  const razorpayRequest = async (
    _env: Parameters<typeof razorpayRequestType>[0],
    path: string,
    init?: RequestInit,
  ) => {
    await Promise.resolve();
    const configuredFailure = options.providerFailure?.(path, init);
    if (configuredFailure instanceof Error) throw configuredFailure;
    if (configuredFailure) return configuredFailure;
    if (path.startsWith('orders?receipt=')) {
      const receipt = new URL(`https://api.example/v1/${path}`).searchParams
        .get('receipt');
      return json({
        items: providerOrders.filter((order) => order.receipt === receipt),
      });
    }
    if (path === 'orders' && init?.method === 'POST') {
      providerCreates++;
      const body = JSON.parse(String(init.body));
      const order = {
        id: 'order_valid123',
        receipt: body.receipt,
        amount: body.amount,
        currency: body.currency,
        status: 'created',
      };
      providerOrders.push(order);
      if (options.timeoutAfterProviderCreate) {
        options.timeoutAfterProviderCreate = false;
        throw new Error('response timed out after remote creation');
      }
      return json(order);
    }
    if (path === 'orders/order_valid123') {
      const row = rows.find((item) =>
        item.razorpay_order_id === 'order_valid123'
      );
      return row
        ? json({
          id: row.razorpay_order_id,
          receipt: row.receipt,
          amount: row.amount,
          currency: row.currency,
          status: 'created',
        })
        : json({
          error: {
            code: 'BAD_REQUEST_ERROR',
            description: 'Order does not exist',
          },
        }, 404);
    }
    if (path.startsWith('orders/order_')) {
      return json({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Order does not exist',
        },
      }, 404);
    }
    throw new Error(`Unexpected Razorpay request: ${path}`);
  };
  const handler = createOrderHandler({
    loadAuthEnvironment: () => env,
    loadAdminEnvironment: () => env,
    loadRazorpayEnvironment: () => {
      razorpayEnvironmentReads++;
      if (options.razorpayConfigured === false) {
        throw new PaymentConfigurationError([
          'RAZORPAY_KEY_ID',
          'RAZORPAY_KEY_SECRET',
        ]);
      }
      return env;
    },
    requireUser: async () => {
      await Promise.resolve();
      return { id: 'user-1', email: 'user@example.com' };
    },
    adminRequest,
    razorpayRequest,
    readRazorpayError,
    now: () => now,
    createId: () => `receipt${++id}`,
  });

  return {
    handler,
    rows,
    advanceTime(milliseconds: number) {
      now += milliseconds;
    },
    setPaymentUpdateFailure(enabled: boolean) {
      options.failPaymentUpdate = enabled;
    },
    get providerCreates() {
      return providerCreates;
    },
    get razorpayEnvironmentReads() {
      return razorpayEnvironmentReads;
    },
  };
};

const request = (body: string) =>
  new Request('https://edge.example/functions/v1/create-order', {
    method: 'POST',
    headers: {
      Origin: 'https://time2income.com',
      'Content-Type': 'application/json',
    },
    body,
  });

const responseBody = async (response: Response) =>
  await response.json() as Record<string, unknown>;

Deno.test('invalid currency and malformed JSON are rejected before provider calls', async () => {
  const harness = makeHarness();
  const invalidCurrency = await harness.handler(request('{"currency":"XYZ"}'));
  const malformed = await harness.handler(request('{'));

  assertEquals(invalidCurrency.status, 400);
  assertEquals(malformed.status, 400);
  assertEquals(harness.providerCreates, 0);
  assertEquals(harness.rows.length, 0);
});

Deno.test('client amount is ignored and server amount is persisted and returned', async () => {
  const harness = makeHarness();
  const response = await harness.handler(
    request('{"currency":"INR","amount":1}'),
  );
  const body = await responseBody(response);

  assertEquals(response.status, 200);
  assertEquals(body.amount, 100);
  assertEquals(harness.rows[0].amount, 100);
  assertEquals(harness.providerCreates, 1);
});

Deno.test('existing entitlement check does not require Razorpay configuration', async () => {
  const harness = makeHarness({ entitled: true, razorpayConfigured: false });
  const response = await harness.handler(request('{"currency":"INR"}'));

  assertEquals(response.status, 409);
  assertEquals(harness.providerCreates, 0);
  assertEquals(harness.rows.length, 0);
  assertEquals(harness.razorpayEnvironmentReads, 0);
});

Deno.test('Razorpay authentication failure is safe and reservation remains recoverable', async () => {
  const harness = makeHarness({
    providerFailure: (path) =>
      path === 'orders'
        ? json({
          error: {
            code: 'BAD_REQUEST_ERROR',
            description: 'Authentication failed',
          },
        }, 400)
        : null,
  });
  const response = await harness.handler(request('{"currency":"INR"}'));
  const body = await responseBody(response);

  assertEquals(response.status, 503);
  assertEquals(body.code, 'PAYMENT_PROVIDER_AUTH_FAILED');
  assertEquals(
    body.error,
    'Payment provider authentication failed. Please contact TIME2INCOME support.',
  );
  assertEquals(JSON.stringify(body).includes('Authentication failed'), false);
  assertEquals(harness.rows[0].status, 'created');
  assertEquals(harness.rows[0].razorpay_order_id.startsWith('pending_'), true);
});

Deno.test('timeout and rate limit preserve pending attempt without duplicate order creation', async () => {
  const timeout = makeHarness({
    providerFailure: (path) =>
      path.startsWith('orders?') ? new Error('network timeout') : null,
  });
  const timeoutResponse = await timeout.handler(request('{"currency":"INR"}'));

  assertEquals(timeoutResponse.status, 503);
  assertEquals(timeout.rows.length, 1);
  assertEquals(timeout.rows[0].status, 'created');

  const rateLimited = makeHarness({
    providerFailure: (path) =>
      path.startsWith('orders?')
        ? json({
          error: { code: 'RATE_LIMIT_ERROR', description: 'Too many requests' },
        }, 429)
        : null,
  });
  const rateResponse = await rateLimited.handler(request('{"currency":"INR"}'));
  assertEquals(rateResponse.status, 503);
  assertEquals(rateLimited.rows[0].status, 'created');
});

Deno.test('reservation lease permits only one concurrent provider order attempt', async () => {
  const harness = makeHarness();
  const [first, second] = await Promise.all([
    harness.handler(request('{"currency":"INR"}')),
    harness.handler(request('{"currency":"INR"}')),
  ]);

  assertEquals(harness.providerCreates, 1);
  assertEquals([200, 409].includes(first.status), true);
  assertEquals([200, 409].includes(second.status), true);
  assertEquals(first.status === 200 || second.status === 200, true);
});

Deno.test('database update failure retains a receipt for later provider reconciliation', async () => {
  const harness = makeHarness({ failPaymentUpdate: true });
  const response = await harness.handler(request('{"currency":"INR"}'));
  const body = await responseBody(response);

  assertEquals(response.status, 503);
  assertEquals(body.code, 'PAYMENT_SERVICE_UNAVAILABLE');
  assertEquals(harness.providerCreates, 1);
  assertEquals(harness.rows[0].razorpay_order_id.startsWith('pending_'), true);
  assertEquals(harness.rows[0].status, 'created');

  harness.setPaymentUpdateFailure(false);
  harness.advanceTime(61_000);
  const retry = await harness.handler(request('{"currency":"INR"}'));
  const retryBody = await responseBody(retry);
  assertEquals(retry.status, 200);
  assertEquals(retryBody.order_id, 'order_valid123');
  assertEquals(harness.providerCreates, 1);
});

Deno.test('ambiguous order-create timeout recovers the same provider order by receipt', async () => {
  const harness = makeHarness({ timeoutAfterProviderCreate: true });
  const first = await harness.handler(request('{"currency":"INR"}'));
  assertEquals(first.status, 503);
  assertEquals(harness.providerCreates, 1);

  harness.advanceTime(61_000);
  const retry = await harness.handler(request('{"currency":"INR"}'));
  const body = await responseBody(retry);
  assertEquals(retry.status, 200);
  assertEquals(body.order_id, 'order_valid123');
  assertEquals(harness.providerCreates, 1);
});

Deno.test('invalid pending order data fails closed without another provider order', async () => {
  const harness = makeHarness();
  harness.rows.push({
    user_id: 'user-1',
    razorpay_order_id: 'not-a-provider-order',
    receipt: 't2i_previous',
    amount: 100,
    currency: 'INR',
    status: 'created',
    creation_lease_until: null,
  });
  const response = await harness.handler(request('{"currency":"INR"}'));

  assertEquals(response.status, 503);
  assertEquals(harness.providerCreates, 0);
  assertEquals(harness.rows[0].status, 'created');
});

Deno.test('pending provider order with mismatched amount is never marked failed', async () => {
  const harness = makeHarness();
  harness.rows.push({
    user_id: 'user-1',
    razorpay_order_id: 'order_valid123',
    receipt: 't2i_previous',
    amount: 200,
    currency: 'INR',
    status: 'created',
    creation_lease_until: null,
  });
  const response = await harness.handler(request('{"currency":"INR"}'));

  assertEquals(response.status, 409);
  assertEquals(harness.providerCreates, 0);
  assertEquals(harness.rows[0].status, 'created');
});

Deno.test('only authoritative missing-order response can mark an existing order failed', async () => {
  const harness = makeHarness();
  harness.rows.push({
    user_id: 'user-1',
    razorpay_order_id: 'order_missing123',
    receipt: 't2i_previous',
    amount: 100,
    currency: 'INR',
    status: 'created',
    creation_lease_until: null,
  });
  const response = await harness.handler(request('{"currency":"INR"}'));

  assertEquals(response.status, 200);
  assertEquals(harness.rows[0].status, 'failed');
  assertEquals(harness.providerCreates, 1);
});

function assertEquals(actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}.`);
  }
}
