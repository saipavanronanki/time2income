import {
  adminRequest,
  constantTimeEqual,
  errorResponse,
  handleOptions,
  hmacSha256Hex,
  jsonResponse,
  PaymentNetworkError,
  PaymentProviderAuthenticationError,
  PaymentProviderRequestError,
  PaymentRateLimitError,
  PaymentRequestConflictError,
  PaymentServiceUnavailableError,
  type RazorpayEnvironment,
  razorpayOperationError,
  razorpayRequest,
  readRazorpayEnvironment,
  readRazorpayError,
  readSupabaseAdminEnvironment,
  readSupabaseAuthEnvironment,
  requireUser,
  type SupabaseAdminEnvironment,
} from '../_shared/razorpay.ts';

type PaymentEnvironment = SupabaseAdminEnvironment & RazorpayEnvironment;
type PaymentRecord = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  razorpay_payment_id: string | null;
};
type User = { id: string; email?: string };

type Dependencies = {
  loadAuthEnvironment: typeof readSupabaseAuthEnvironment;
  loadAdminEnvironment: typeof readSupabaseAdminEnvironment;
  loadRazorpayEnvironment: typeof readRazorpayEnvironment;
  requireUser: typeof requireUser;
  adminRequest: typeof adminRequest;
  razorpayRequest: typeof razorpayRequest;
  readRazorpayError: typeof readRazorpayError;
  hmacSha256Hex: typeof hmacSha256Hex;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseResponseJson = async (response: Response): Promise<unknown> =>
  await response.json().catch(() => null);

const findPaymentRecord = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  userId: string,
  orderId: string,
) => {
  const response = await deps.adminRequest(
    env,
    `platform_payments?user_id=eq.${
      encodeURIComponent(userId)
    }&razorpay_order_id=eq.${
      encodeURIComponent(orderId)
    }&select=id,amount,currency,status,razorpay_payment_id&limit=1`,
  );
  if (!response.ok) {
    throw new PaymentServiceUnavailableError(
      'Could not verify the saved payment order.',
    );
  }
  const rows: unknown = await parseResponseJson(response);
  if (!Array.isArray(rows) || rows.length !== 1 || !isPaymentRecord(rows[0])) {
    throw new Error('INVALID_REQUEST');
  }
  return rows[0];
};

const isPaymentRecord = (value: unknown): value is PaymentRecord =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.amount === 'number' &&
  Number.isSafeInteger(value.amount) &&
  typeof value.currency === 'string' &&
  /^[A-Z]{3}$/.test(value.currency) &&
  typeof value.status === 'string' &&
  (typeof value.razorpay_payment_id === 'string' ||
    value.razorpay_payment_id === null);

const callProvider = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  path: string,
) => {
  try {
    return await deps.razorpayRequest(env, path);
  } catch (error) {
    if (
      error instanceof PaymentServiceUnavailableError ||
      error instanceof PaymentProviderAuthenticationError ||
      error instanceof PaymentRateLimitError ||
      error instanceof PaymentNetworkError ||
      error instanceof PaymentProviderRequestError
    ) throw error;
    throw new PaymentServiceUnavailableError(
      'Razorpay could not be reached. No account access was changed.',
    );
  }
};

const ensureEntitlement = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  userId: string,
  paymentId: string,
) => {
  const response = await deps.adminRequest(
    env,
    'platform_entitlements?on_conflict=user_id',
    {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({
        user_id: userId,
        razorpay_payment_id: paymentId,
      }),
    },
  );
  if (!response.ok) {
    throw new PaymentServiceUnavailableError(
      'Captured payment was verified, but account activation could not be recorded. Retry verification or contact support.',
    );
  }

  const entitlementResponse = await deps.adminRequest(
    env,
    `platform_entitlements?user_id=eq.${
      encodeURIComponent(userId)
    }&select=user_id,razorpay_payment_id&limit=1`,
  );
  if (!entitlementResponse.ok) {
    throw new PaymentServiceUnavailableError(
      'Could not confirm account activation. Retry verification or contact support.',
    );
  }
  const entitlements: unknown = await parseResponseJson(entitlementResponse);
  if (
    !Array.isArray(entitlements) ||
    entitlements.length !== 1 ||
    !isRecord(entitlements[0]) ||
    entitlements[0].razorpay_payment_id !== paymentId
  ) {
    throw new PaymentRequestConflictError(
      'Account activation is already linked to another payment. Contact support.',
    );
  }
};

export const createVerifyPaymentHandler = (
  overrides: Partial<Dependencies> = {},
) => {
  const deps: Dependencies = {
    loadAuthEnvironment: readSupabaseAuthEnvironment,
    loadAdminEnvironment: readSupabaseAdminEnvironment,
    loadRazorpayEnvironment: readRazorpayEnvironment,
    requireUser,
    adminRequest,
    razorpayRequest,
    readRazorpayError,
    hmacSha256Hex,
    ...overrides,
  };

  return async (request: Request) => {
    const options = handleOptions(request);
    if (options) return options;
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405, request);
    }

    try {
      const authEnvironment = deps.loadAuthEnvironment();
      const user = await deps.requireUser(request, authEnvironment);
      const env: PaymentEnvironment = {
        ...deps.loadAdminEnvironment(),
        ...deps.loadRazorpayEnvironment(),
      };
      const body: unknown = await request.json().catch(() => {
        throw new Error('INVALID_REQUEST');
      });
      if (!isRecord(body)) throw new Error('INVALID_REQUEST');
      const paymentId = typeof body.razorpay_payment_id === 'string'
        ? body.razorpay_payment_id
        : '';
      const orderId = typeof body.razorpay_order_id === 'string'
        ? body.razorpay_order_id
        : '';
      const signature = typeof body.razorpay_signature === 'string'
        ? body.razorpay_signature
        : '';
      if (
        !/^pay_[A-Za-z0-9]+$/.test(paymentId) ||
        !/^order_[A-Za-z0-9]+$/.test(orderId) ||
        !/^[a-f0-9]{64}$/i.test(signature)
      ) {
        throw new Error('INVALID_REQUEST');
      }

      const savedPayment = await findPaymentRecord(
        deps,
        env,
        user.id,
        orderId,
      );
      if (savedPayment.status !== 'created' && savedPayment.status !== 'paid') {
        throw new Error('INVALID_REQUEST');
      }

      const expectedSignature = await deps.hmacSha256Hex(
        env.RAZORPAY_KEY_SECRET,
        `${orderId}|${paymentId}`,
      );
      if (!constantTimeEqual(expectedSignature, signature)) {
        return jsonResponse(
          { error: 'Payment signature verification failed.' },
          400,
          request,
        );
      }

      const providerResponse = await callProvider(
        deps,
        env,
        `payments/${encodeURIComponent(paymentId)}`,
      );
      if (!providerResponse.ok) {
        const providerError = await deps.readRazorpayError(providerResponse);
        throw razorpayOperationError(
          'Razorpay payment lookup',
          providerResponse.status,
          providerError,
        );
      }
      const providerPayment: unknown = await parseResponseJson(
        providerResponse,
      );
      if (
        !isRecord(providerPayment) ||
        providerPayment.order_id !== orderId ||
        providerPayment.status !== 'captured' ||
        providerPayment.amount !== savedPayment.amount ||
        providerPayment.currency !== savedPayment.currency
      ) {
        return jsonResponse(
          { error: 'Payment is not captured for this account and order.' },
          400,
          request,
        );
      }

      if (savedPayment.status === 'paid') {
        if (savedPayment.razorpay_payment_id !== paymentId) {
          throw new PaymentRequestConflictError(
            'This order was already verified with a different payment. Contact support.',
          );
        }
        await ensureEntitlement(deps, env, user.id, paymentId);
        return jsonResponse({ verified: true, has_access: true }, 200, request);
      }

      const paidResponse = await deps.adminRequest(
        env,
        `platform_payments?user_id=eq.${
          encodeURIComponent(user.id)
        }&razorpay_order_id=eq.${
          encodeURIComponent(orderId)
        }&status=eq.created`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            status: 'paid',
            razorpay_payment_id: paymentId,
            paid_at: new Date().toISOString(),
          }),
        },
      );
      if (!paidResponse.ok) {
        throw new PaymentServiceUnavailableError(
          'Captured payment was verified, but its status could not be recorded. Retry verification.',
        );
      }
      const updatedRows: unknown = await parseResponseJson(paidResponse);
      if (Array.isArray(updatedRows) && updatedRows.length === 1) {
        await ensureEntitlement(deps, env, user.id, paymentId);
        return jsonResponse({ verified: true, has_access: true }, 200, request);
      }

      const currentPayment = await findPaymentRecord(
        deps,
        env,
        user.id,
        orderId,
      );
      if (
        currentPayment.status !== 'paid' ||
        currentPayment.razorpay_payment_id !== paymentId
      ) {
        throw new PaymentRequestConflictError(
          'Payment state changed during verification. Refresh and contact support if access is not active.',
        );
      }
      await ensureEntitlement(deps, env, user.id, paymentId);
      return jsonResponse({ verified: true, has_access: true }, 200, request);
    } catch (error) {
      return errorResponse(error, request);
    }
  };
};
