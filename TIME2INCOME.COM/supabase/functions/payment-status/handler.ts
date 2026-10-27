import {
  PaymentConfigurationError,
  readSupabaseAuthEnvironment,
  requireUser,
} from '../_shared/razorpay.ts';

type AuthConfiguration = ReturnType<typeof readSupabaseAuthEnvironment>;

const corsHeaders = (request: Request) => {
  const origin = request.headers.get('Origin') || '';
  const siteOrigin = new URL(
    Deno.env.get('SITE_URL') || 'https://time2income.com',
  ).origin;
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

const jsonResponse = (body: unknown, status: number, request: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json',
    },
  });

const handleOptions = (request: Request) =>
  request.method === 'OPTIONS'
    ? new Response('ok', { headers: corsHeaders(request) })
    : null;

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
