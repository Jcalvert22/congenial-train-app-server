const SUPABASE_TABLE = 'profile';
const STRIPE_PORTAL_ENDPOINT = 'https://api.stripe.com/v1/billing_portal/sessions';

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { ...init, headers });
}

function buildSupabaseHeaders(serviceKey) {
  return {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`
  };
}

async function fetchProfile(env, userId) {
  const url = `${env.SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${encodeURIComponent(userId)}&select=stripe_customer_id`;
  const response = await fetch(url, {
    headers: buildSupabaseHeaders(env.SUPABASE_SERVICE_ROLE_KEY)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Profile lookup failed: ${errorText}`);
  }
  const data = await response.json();
  return data?.[0] || null;
}

function createStripeClient(secretKey) {
  return {
    billingPortal: {
      sessions: {
        async create({ customer, return_url }) {
          const params = new URLSearchParams();
          params.set('customer', customer);
          params.set('return_url', return_url);

          const response = await fetch(STRIPE_PORTAL_ENDPOINT, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Stripe portal request failed: ${errorText}`);
          }

          return response.json();
        }
      }
    }
  };
}

async function getSupabaseUser(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    console.error('Supabase user lookup failed', await response.text());
    return null;
  }
  return response.json();
}

export async function onRequestPost({ request, env }) {
  if (!env?.STRIPE_SECRET_KEY || !env?.SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const supabaseUser = await getSupabaseUser(request, env);
  if (!supabaseUser?.id) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = supabaseUser.id;

  try {
    const profile = await fetchProfile(env, userId);
    if (!profile?.stripe_customer_id) {
      return jsonResponse({ error: 'Missing Stripe customer ID' }, { status: 400 });
    }

    const stripe = createStripeClient(env.STRIPE_SECRET_KEY);
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: "https://allaround-athlete.com/profile"
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error('Portal session failed', error);
    return jsonResponse({ error: 'Portal session failed' }, { status: 500 });
  }
}
