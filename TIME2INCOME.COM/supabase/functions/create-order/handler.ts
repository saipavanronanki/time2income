import {
  adminRequest,
  errorResponse,
  feeForCurrency,
  handleOptions,
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
type User = { id: string; email?: string };
type PendingOrder = {
  razorpay_order_id: string;
  receipt: string;
  amount: number;
  currency: string;
  status: string;
  creation_lease_until: string | null;
};
type ProviderOrder = {
  id: string;
  receipt: string;
  amount: number;
  currency: string;
  status: string;
};

type Dependencies = {
  loadAuthEnvironment: typeof readSupabaseAuthEnvironment;
  loadAdminEnvironment: typeof readSupabaseAdminEnvironment;
  loadRazorpayEnvironment: typeof readRazorpayEnvironment;
  requireUser: typeof requireUser;
  adminRequest: typeof adminRequest;
  razorpayRequest: typeof razorpayRequest;
  readRazorpayError: typeof readRazorpayError;
  now: () => number;
  createId: () => string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPendingOrder = (value: unknown): value is PendingOrder =>
  isRecord(value) &&
  typeof value.razorpay_order_id === 'string' &&
  (value.razorpay_order_id.startsWith('pending_') ||
    /^order_[A-Za-z0-9]+$/.test(value.razorpay_order_id)) &&
  typeof value.receipt === 'string' &&
  /^t2i_[A-Za-z0-9]+$/.test(value.receipt) &&
  typeof value.amount === 'number' &&
  Number.isSafeInteger(value.amount) &&
  value.amount > 0 &&
  typeof value.currency === 'string' &&
  /^[A-Z]{3}$/.test(value.currency) &&
  value.status === 'created' &&
  (typeof value.creation_lease_until === 'string' ||
    value.creation_lease_until === null);

const isProviderOrder = (value: unknown): value is ProviderOrder =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  /^order_[A-Za-z0-9]+$/.test(value.id) &&
  typeof value.receipt === 'string' &&
  typeof value.amount === 'number' &&
  Number.isSafeInteger(value.amount) &&
  typeof value.currency === 'string' &&
  /^[A-Z]{3}$/.test(value.currency) &&
  ['created', 'attempted', 'paid'].includes(String(value.status));

const orderResponse = (
  order: ProviderOrder,
  env: RazorpayEnvironment,
  user: User,
  request: Request,
) =>
  jsonResponse(
    {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: env.RAZORPAY_KEY_ID,
      user_email: user.email || '',
    },
    200,
    request,
  );

const parseResponseJson = async (response: Response): Promise<unknown> =>
  await response.json().catch(() => null);

const pendingOrderPath = (userId: string) =>
  `platform_payments?user_id=eq.${
    encodeURIComponent(userId)
  }&status=eq.created&select=razorpay_order_id,receipt,amount,currency,status,creation_lease_until&order=created_at.desc`;

const createOrderPath = (orderId: string) =>
  `orders/${encodeURIComponent(orderId)}`;

const updatePendingOrder = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  receipt: string,
  oldOrderId: string,
  update: Record<string, unknown>,
) => {
  const response = await deps.adminRequest(
    env,
    `platform_payments?receipt=eq.${
      encodeURIComponent(receipt)
    }&razorpay_order_id=eq.${encodeURIComponent(oldOrderId)}&status=eq.created`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(update),
    },
  );
  if (!response.ok) {
    throw new PaymentServiceUnavailableError(
      'Could not safely update the payment order record.',
    );
  }
  const rows = await parseResponseJson(response);
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new PaymentRequestConflictError(
      'Payment order state changed. Refresh the page and try again.',
    );
  }
};

const getProviderError = async (
  deps: Dependencies,
  response: Response,
  operation: string,
) => {
  const detail = await deps.readRazorpayError(response);
  return razorpayOperationError(operation, response.status, detail);
};

const callRazorpay = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  path: string,
  init?: RequestInit,
) => {
  try {
    return await deps.razorpayRequest(env, path, init);
  } catch (error) {
    if (
      error instanceof PaymentServiceUnavailableError ||
      error instanceof PaymentProviderAuthenticationError ||
      error instanceof PaymentRateLimitError ||
      error instanceof PaymentNetworkError ||
      error instanceof PaymentProviderRequestError
    ) {
      throw error;
    }
    throw new PaymentServiceUnavailableError(
      'Razorpay could not be reached. The payment attempt has been retained for reconciliation.',
    );
  }
};

const readPendingOrders = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  userId: string,
) => {
  const response = await deps.adminRequest(env, pendingOrderPath(userId));
  if (!response.ok) {
    throw new PaymentServiceUnavailableError(
      'Could not check your existing payment attempt.',
    );
  }
  const rows: unknown = await parseResponseJson(response);
  if (!Array.isArray(rows) || !rows.every(isPendingOrder)) {
    throw new PaymentServiceUnavailableError(
      'Payment records need reconciliation before retrying.',
    );
  }
  return rows;
};

const reconcileReceipt = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  pending: PendingOrder,
) => {
  const query = new URLSearchParams({ receipt: pending.receipt, count: '100' });
  const response = await callRazorpay(deps, env, `orders?${query.toString()}`);
  if (!response.ok) {
    throw await getProviderError(
      deps,
      response,
      'Razorpay order reconciliation',
    );
  }
  const payload: unknown = await parseResponseJson(response);
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new PaymentServiceUnavailableError(
      'Razorpay order reconciliation returned an invalid response.',
    );
  }
  const receiptItems = payload.items.filter(
    (item) => isRecord(item) && item.receipt === pending.receipt,
  );
  if (!receiptItems.every(isProviderOrder)) {
    throw new PaymentServiceUnavailableError(
      'Razorpay returned invalid order details for this receipt. Contact support before retrying.',
    );
  }
  const matches = receiptItems.filter(
    (item): item is ProviderOrder =>
      isProviderOrder(item) && item.receipt === pending.receipt,
  );
  if (matches.length > 1) {
    throw new PaymentRequestConflictError(
      'Multiple provider orders match this attempt. Contact support before retrying.',
    );
  }
  return matches[0] || null;
};

const persistProviderOrder = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  pending: PendingOrder,
  providerOrder: ProviderOrder,
) => {
  if (
    providerOrder.receipt !== pending.receipt ||
    providerOrder.amount !== pending.amount ||
    providerOrder.currency !== pending.currency
  ) {
    throw new PaymentRequestConflictError(
      'The existing payment attempt does not match this request. Contact support before retrying.',
    );
  }
  if (providerOrder.status !== 'created') {
    throw new PaymentRequestConflictError(
      'A previous payment attempt is still processing. Do not start another payment.',
    );
  }

  try {
    await updatePendingOrder(
      deps,
      env,
      pending.receipt,
      pending.razorpay_order_id,
      {
        razorpay_order_id: providerOrder.id,
        creation_lease_until: null,
      },
    );
  } catch (error) {
    console.error(
      'Razorpay order created but its payment record needs reconciliation.',
    );
    throw error;
  }
};

const claimReservation = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  pending: PendingOrder,
) => {
  const now = deps.now();
  const claimUntil = new Date(now + 60_000).toISOString();
  const query = `platform_payments?receipt=eq.${
    encodeURIComponent(pending.receipt)
  }&razorpay_order_id=eq.${
    encodeURIComponent(pending.razorpay_order_id)
  }&status=eq.created&or=(creation_lease_until.is.null,creation_lease_until.lt.${
    encodeURIComponent(new Date(now).toISOString())
  })`;
  const response = await deps.adminRequest(env, query, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ creation_lease_until: claimUntil }),
  });
  if (!response.ok) {
    throw new PaymentServiceUnavailableError(
      'Could not reserve this payment attempt safely.',
    );
  }
  const rows = await parseResponseJson(response);
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new PaymentRequestConflictError(
      'A payment attempt is already being prepared. Wait briefly, then refresh and retry.',
    );
  }
  return { ...pending, creation_lease_until: claimUntil };
};

const createProviderOrder = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  pending: PendingOrder,
  user: User,
) => {
  const receiptLookup = await reconcileReceipt(deps, env, pending);
  if (receiptLookup) return receiptLookup;

  const response = await callRazorpay(deps, env, 'orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: pending.amount,
      currency: pending.currency,
      receipt: pending.receipt,
      notes: { user_id: user.id, purpose: 'TIME2INCOME account activation' },
    }),
  });
  if (!response.ok) {
    throw await getProviderError(deps, response, 'Razorpay order creation');
  }
  const providerOrder: unknown = await parseResponseJson(response);
  if (!isProviderOrder(providerOrder)) {
    throw new PaymentServiceUnavailableError(
      'Razorpay order was created but could not be safely recorded. Its receipt is retained for reconciliation.',
    );
  }
  return providerOrder;
};

const processPendingOrder = async (
  deps: Dependencies,
  env: PaymentEnvironment,
  pendingOrder: PendingOrder,
  user: User,
  requested: { amount: number; currency: string },
  request: Request,
) => {
  if (pendingOrder.razorpay_order_id.startsWith('pending_')) {
    const claimed = await claimReservation(deps, env, pendingOrder);
    const providerOrder = await createProviderOrder(deps, env, claimed, user);
    await persistProviderOrder(deps, env, claimed, providerOrder);
    if (
      providerOrder.amount !== requested.amount ||
      providerOrder.currency !== requested.currency
    ) {
      throw new PaymentRequestConflictError(
        'A payment attempt exists in another currency. Finish or reconcile it before starting another.',
      );
    }
    return orderResponse(providerOrder, env, user, request);
  }

  if (!/^order_[A-Za-z0-9]+$/.test(pendingOrder.razorpay_order_id)) {
    throw new PaymentServiceUnavailableError(
      'Payment order record is invalid and requires reconciliation.',
    );
  }
  const providerResponse = await callRazorpay(
    deps,
    env,
    createOrderPath(pendingOrder.razorpay_order_id),
  );
  if (providerResponse.status === 404) {
    await updatePendingOrder(
      deps,
      env,
      pendingOrder.receipt,
      pendingOrder.razorpay_order_id,
      { status: 'failed' },
    );
    return null;
  }
  if (!providerResponse.ok) {
    throw await getProviderError(
      deps,
      providerResponse,
      'Razorpay pending order check',
    );
  }

  const providerOrder: unknown = await parseResponseJson(providerResponse);
  if (
    !isProviderOrder(providerOrder) ||
    providerOrder.id !== pendingOrder.razorpay_order_id ||
    providerOrder.receipt !== pendingOrder.receipt
  ) {
    throw new PaymentServiceUnavailableError(
      'Razorpay returned order details that do not match the saved payment attempt.',
    );
  }
  if (
    providerOrder.amount !== pendingOrder.amount ||
    providerOrder.currency !== pendingOrder.currency
  ) {
    throw new PaymentRequestConflictError(
      'The existing payment order does not match its saved details. Contact support before retrying.',
    );
  }
  if (providerOrder.status !== 'created') {
    throw new PaymentRequestConflictError(
      'A previous payment attempt is still processing. Do not start another payment.',
    );
  }
  if (
    pendingOrder.amount !== requested.amount ||
    pendingOrder.currency !== requested.currency
  ) {
    throw new PaymentRequestConflictError(
      'A payment attempt already exists in another currency. Finish or reconcile it before starting another.',
    );
  }
  return orderResponse(providerOrder, env, user, request);
};

export const createOrderHandler = (
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
    now: Date.now,
    createId: () => crypto.randomUUID().replaceAll('-', '').slice(0, 32),
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
      const adminEnvironment = deps.loadAdminEnvironment();
      const body: unknown = await request.json().catch(() => {
        throw new Error('INVALID_REQUEST');
      });
      if (!isRecord(body) || !Object.hasOwn(body, 'currency')) {
        throw new Error('INVALID_REQUEST');
      }
      const requested = feeForCurrency(body.currency);

      const entitlementResponse = await deps.adminRequest(
        adminEnvironment,
        `platform_entitlements?user_id=eq.${
          encodeURIComponent(user.id)
        }&select=user_id&limit=1`,
      );
      if (!entitlementResponse.ok) {
        throw new PaymentServiceUnavailableError(
          'Could not verify account activation status.',
        );
      }
      const entitlements: unknown = await parseResponseJson(
        entitlementResponse,
      );
      if (!Array.isArray(entitlements)) {
        throw new PaymentServiceUnavailableError(
          'Account activation status returned an invalid response.',
        );
      }
      if (entitlements.length > 0) {
        return jsonResponse(
          { error: 'This account is already activated.' },
          409,
          request,
        );
      }

      const env: PaymentEnvironment = {
        ...adminEnvironment,
        ...deps.loadRazorpayEnvironment(),
      };
      let pendingOrders = await readPendingOrders(deps, env, user.id);
      if (pendingOrders.length > 1) {
        throw new PaymentRequestConflictError(
          'Multiple pending payment attempts need reconciliation. Contact support before retrying.',
        );
      }
      if (pendingOrders.length === 1) {
        const result = await processPendingOrder(
          deps,
          env,
          pendingOrders[0],
          user,
          requested,
          request,
        );
        if (result) return result;
      }

      const receipt = `t2i_${deps.createId()}`;
      const placeholderOrderId = `pending_${receipt}`;
      const leaseUntil = new Date(deps.now() + 60_000).toISOString();
      const reservationResponse = await deps.adminRequest(
        env,
        'platform_payments',
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            user_id: user.id,
            razorpay_order_id: placeholderOrderId,
            receipt,
            amount: requested.amount,
            currency: requested.currency,
            status: 'created',
            creation_lease_until: leaseUntil,
          }),
        },
      );
      if (!reservationResponse.ok) {
        if (reservationResponse.status === 409) {
          pendingOrders = await readPendingOrders(deps, env, user.id);
          if (pendingOrders.length === 1) {
            const result = await processPendingOrder(
              deps,
              env,
              pendingOrders[0],
              user,
              requested,
              request,
            );
            if (result) return result;
          }
        }
        throw new PaymentServiceUnavailableError(
          'Could not reserve a payment attempt safely. Refresh and try again.',
        );
      }

      const rows = await parseResponseJson(reservationResponse);
      const pending: PendingOrder = {
        razorpay_order_id: placeholderOrderId,
        receipt,
        amount: requested.amount,
        currency: requested.currency,
        status: 'created',
        creation_lease_until: leaseUntil,
      };
      if (Array.isArray(rows) && rows.length === 1 && isPendingOrder(rows[0])) {
        pending.razorpay_order_id = rows[0].razorpay_order_id;
      }

      const providerOrder = await createProviderOrder(
        deps,
        env,
        pending,
        user,
      );
      await persistProviderOrder(deps, env, pending, providerOrder);
      return orderResponse(providerOrder, env, user, request);
    } catch (error) {
      return errorResponse(error, request);
    }
  };
};
