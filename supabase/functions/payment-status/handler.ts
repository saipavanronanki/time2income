import {
  handleOptions,
  jsonResponse,
  PaymentConfigurationError,
  readSupabaseAuthEnvironment,
  requireUser,
} from '../_shared/razorpay.ts';

type AuthConfiguration = ReturnType<typeof readSupabaseAuthEnvironment>;

export const createPaymentStatusHandler = (
  loadConfiguration: () => AuthConfiguration = readSupabaseAuthEnvironment,
  fetcher: typeof fetch = fetch,
) =>
async (request: Request) => {
  const options = handleOptions(request);
  if (options) return options;
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405, request);
  }

  const authorization = request.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    return jsonResponse({ error: 'Please sign in to continue.' }, 401, request);
  }

  try {
    const env = loadConfiguration();
    await requireUser(request, env, fetcher);
    const response = await fetcher(
      `${env.SUPABASE_URL}/rest/v1/rpc/has_active_platform_access`,
      {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          authorization,
          'Content-Type': 'application/json',
        },
        body: '{}',
      },
    );
    if (response.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    if (!response.ok) {
      throw new Error(`Access RPC failed (HTTP ${response.status}).`);
    }

    const hasAccess: unknown = await response.json();
    if (typeof hasAccess !== 'boolean') {
      throw new Error('Access RPC returned an invalid response.');
    }
    return jsonResponse({ has_access: hasAccess }, 200, request);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return jsonResponse(
        { error: 'Please sign in to continue.' },
        401,
        request,
      );
    }
    if (error instanceof PaymentConfigurationError) {
      console.error('Supabase authentication configuration is missing.', {
        missing_names: error.missingNames.filter((name) =>
          ['SUPABASE_URL', 'SUPABASE_ANON_KEY'].includes(name)
        ),
      });
    } else {
      console.error('Platform access status check failed.');
    }
    return jsonResponse(
      { error: 'Account access could not be verified. Please try again.' },
      500,
      request,
    );
  }
};
