import { createVerifyPaymentHandler } from './handler.ts';
import {
  adminRequest as adminRequestType,
  type RazorpayEnvironment,
  razorpayRequest as razorpayRequestType,
  readRazorpayError,
  type SupabaseAdminEnvironment,
} from '../_shared/razorpay.ts';

type PaymentEnvironment = SupabaseAdminEnvironment & RazorpayEnvironment;

type PaymentRow = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
};

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const makeHarness = (options: {
  initialStatus?: string;
  providerPayment?: Record<string, unknown>;
  failEntitlementWrite?: boolean;
} = {}) => {
  const payment: PaymentRow = {
    id: 'payment-row-1',
    user_id: 'user-1',
    amount: 100,
    currency: 'INR',
    status: options.initialStatus || 'created',
    razorpay_order_id: 'order_123',
    razorpay_payment_id: options.initialStatus === 'paid' ? 'pay_123' : null,
  };
  let providerLookups = 0;
  let entitlementWrites = 0;
  let entitlementPaymentId: string | null = null;
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
    if (path.startsWith('platform_payments?') && method === 'GET') {
      return json(
        path.includes('user_id=eq.user-1') &&
          payment.razorpay_order_id === 'order_123'
          ? [payment]
          : [],
      );
    }
    if (path.startsWith('platform_payments?') && method === 'PATCH') {
      if (payment.status !== 'created') return json([]);
      Object.assign(payment, JSON.parse(String(init.body)));
      return json([payment]);
    }
    if (path.startsWith('platform_entitlements?') && method === 'POST') {
      entitlementWrites++;
      if (options.failEntitlementWrite) {
        return json({ error: 'db unavailable' }, 503);
      }
      entitlementPaymentId = JSON.parse(String(init.body)).razorpay_payment_id;
      return new Response(null, { status: 201 });
    }
    if (path.startsWith('platform_entitlements?') && method === 'GET') {
      return json(
        entitlementPaymentId
          ? [{ user_id: 'user-1', razorpay_payment_id: entitlementPaymentId }]
          : [],
      );
    }
    throw new Error(`Unexpected admin request: ${method} ${path}`);
  };
  const razorpayRequest = async (
    _env: Parameters<typeof razorpayRequestType>[0],
    path: string,
  ) => {
    await Promise.resolve();
    providerLookups++;
    if (!path.startsWith('payments/')) {
      throw new Error(`Unexpected provider path: ${path}`);
    }
    return json(
      options.providerPayment || {
        order_id: 'order_123',
        status: 'captured',
        amount: 100,
        currency: 'INR',
      },
    );
  };
  const handler = createVerifyPaymentHandler({
    loadAuthEnvironment: () => env,
    loadAdminEnvironment: () => env,
    loadRazorpayEnvironment: () => env,
    requireUser: async () => {
      await Promise.resolve();
      return { id: 'user-1' };
    },
    adminRequest,
    razorpayRequest,
    readRazorpayError,
    hmacSha256Hex: async () => {
      await Promise.resolve();
      return 'a'.repeat(64);
    },
  });
  const request = () =>
    new Request('https://edge.example/functions/v1/verify-payment', {
      method: 'POST',
      headers: {
        Origin: 'https://time2income.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'a'.repeat(64),
      }),
    });
  return {
    handler,
    payment,
    request,
    get providerLookups() {
      return providerLookups;
    },
    get entitlementWrites() {
      return entitlementWrites;
    },
    setEntitlementWriteFailure(enabled: boolean) {
      options.failEntitlementWrite = enabled;
    },
  };
};

function assertEquals(actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}.`);
  }
}

Deno.test('valid captured payment records paid state and creates entitlement', async () => {
  const harness = makeHarness();
  const response = await harness.handler(harness.request());
  const body = await response.json();

  assertEquals(response.status, 200);
  assertEquals(body.verified, true);
  assertEquals(harness.payment.status, 'paid');
  assertEquals(harness.payment.razorpay_payment_id, 'pay_123');
  assertEquals(harness.entitlementWrites, 1);
});

Deno.test('invalid signature is rejected before provider lookup or entitlement grant', async () => {
  const harness = makeHarness();
  const req = new Request('https://edge.example/functions/v1/verify-payment', {
    method: 'POST',
    headers: {
      Origin: 'https://time2income.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      razorpay_payment_id: 'pay_123',
      razorpay_order_id: 'order_123',
      razorpay_signature: 'b'.repeat(64),
    }),
  });
  const response = await harness.handler(req);

  assertEquals(response.status, 400);
  assertEquals(harness.providerLookups, 0);
  assertEquals(harness.entitlementWrites, 0);
});

Deno.test('mismatched order, amount, or currency is rejected without activation', async () => {
  const mismatches = [
    {
      order_id: 'order_other',
      status: 'captured',
      amount: 100,
      currency: 'INR',
    },
    { order_id: 'order_123', status: 'captured', amount: 200, currency: 'INR' },
    { order_id: 'order_123', status: 'captured', amount: 100, currency: 'USD' },
  ];
  for (const providerPayment of mismatches) {
    const harness = makeHarness({ providerPayment });
    const response = await harness.handler(harness.request());
    assertEquals(response.status, 400);
    assertEquals(harness.entitlementWrites, 0);
    assertEquals(harness.payment.status, 'created');
  }
});

Deno.test('authorized and failed provider payment states do not grant access', async () => {
  for (const status of ['authorized', 'failed', 'created']) {
    const harness = makeHarness({
      providerPayment: {
        order_id: 'order_123',
        status,
        amount: 100,
        currency: 'INR',
      },
    });
    const response = await harness.handler(harness.request());
    assertEquals(response.status, 400);
    assertEquals(harness.entitlementWrites, 0);
    assertEquals(harness.payment.status, 'created');
  }
});

Deno.test('repeated callback for the same captured payment is idempotent', async () => {
  const harness = makeHarness({ initialStatus: 'paid' });
  const first = await harness.handler(harness.request());
  const second = await harness.handler(harness.request());

  assertEquals(first.status, 200);
  assertEquals(second.status, 200);
  assertEquals(harness.entitlementWrites, 2);
});

Deno.test('a paid order cannot be replayed with a different payment id', async () => {
  const harness = makeHarness({ initialStatus: 'paid' });
  const req = new Request('https://edge.example/functions/v1/verify-payment', {
    method: 'POST',
    headers: {
      Origin: 'https://time2income.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      razorpay_payment_id: 'pay_other',
      razorpay_order_id: 'order_123',
      razorpay_signature: 'a'.repeat(64),
    }),
  });
  const response = await harness.handler(req);

  assertEquals(response.status, 409);
  assertEquals(harness.entitlementWrites, 0);
});

Deno.test('entitlement persistence failure is reported and can be retried', async () => {
  const harness = makeHarness({ failEntitlementWrite: true });
  const response = await harness.handler(harness.request());
  const body = await response.json();

  assertEquals(response.status, 503);
  assertEquals(body.verified, undefined);
  assertEquals(harness.payment.status, 'paid');

  harness.setEntitlementWriteFailure(false);
  const retry = await harness.handler(harness.request());
  const retryBody = await retry.json();
  assertEquals(retry.status, 200);
  assertEquals(retryBody.verified, true);
});
