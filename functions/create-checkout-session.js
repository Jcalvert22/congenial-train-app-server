const SUCCESS_URL = 'https://allaround-athlete.com/success';
const CANCEL_URL = 'https://allaround-athlete.com/cancel';

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { ...init, headers });
}

function assertEnv(env) {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_MONTHLY_PRICE_ID',
    'STRIPE_YEARLY_PRICE_ID',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  const missing = required.filter(key => !env?.[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

function buildSupabaseHeaders(env) {
  return {
    'Content-Type': 'application/json',
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
  };
}

async function fetchProfile(env, userId) {
  if (!userId) {
    return null;
  }
  const filter = `id=eq.${encodeURIComponent(userId)}`;
  const url = `${env.SUPABASE_URL}/rest/v1/profile?${filter}&select=id,email,stripe_customer_id`;
  const response = await fetch(url, { headers: buildSupabaseHeaders(env) });
  if (!response.ok) {
    throw new Error(`Failed to load profile (${response.status})`);
  }
  const data = await response.json();
  return data?.[0] || null;
}

async function insertProfile(env, payload) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/profile`, {
    method: 'POST',
    headers: { ...buildSupabaseHeaders(env), Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to insert profile (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data?.[0] || payload;
}

async function ensureProfile(env, userId) {
  let profile = await fetchProfile(env, userId);
  if (profile) {
    return profile;
  }
  const payload = {
    id: userId,
    stripe_customer_id: 'pending',
    subscription_status: 'inactive',
    current_period_end: new Date(0).toISOString()
  };
  profile = await insertProfile(env, payload);
  return profile;
}

async function updateProfile(env, userId, patch) {
  const url = `${env.SUPABASE_URL}/rest/v1/profile?id=eq.${encodeURIComponent(userId)}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { ...buildSupabaseHeaders(env), Prefer: 'return=minimal' },
    body: JSON.stringify(patch)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update profile (${response.status}): ${errorText}`);
  }
}

async function createStripeCustomer(env, { email, userId }) {
  const params = new URLSearchParams();
  if (email) {
    params.append('email', email);
  }
  params.append('metadata[supabase_user_id]', userId);

  const response = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Unable to create Stripe customer');
  }
  return result;
}

function isStripeCustomerId(value) {
  return typeof value === 'string' && value.startsWith('cus_');
}

async function ensureStripeCustomer(env, profile, userId) {
  if (isStripeCustomerId(profile?.stripe_customer_id)) {
    return profile.stripe_customer_id;
  }
  const customer = await createStripeCustomer(env, { email: profile?.email, userId });
  await updateProfile(env, userId, { stripe_customer_id: customer.id });
  return customer.id;
}

async function createStripeCheckoutSession(env, customerId, priceId, userId) {
  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('success_url', SUCCESS_URL);
  params.append('cancel_url', CANCEL_URL);
  params.append('customer', customerId);
  params.append('line_items[0][price]', priceId);
  params.append('line_items[0][quantity]', '1');
  params.append('client_reference_id', userId);
  params.append('metadata[supabase_user_id]', userId);
  params.append('subscription_data[trial_period_days]', '7');
  params.append('subscription_data[metadata][supabase_user_id]', userId);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Stripe API error');
  }
  return result;
}

export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    assertEnv(env);
  } catch (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const priceKey = payload?.priceId === 'yearly' ? 'yearly' : 'monthly';
  const userId = payload?.userId;
  if (!userId) {
    return jsonResponse({ error: 'userId is required.' }, { status: 400 });
  }

  const priceMap = {
    monthly: env.STRIPE_MONTHLY_PRICE_ID,
    yearly: env.STRIPE_YEARLY_PRICE_ID
  };
  const priceId = priceMap[priceKey];
  if (!priceId) {
    return jsonResponse({ error: 'Unsupported price selection.' }, { status: 400 });
  }

  try {
    const profile = await ensureProfile(env, userId);
    const stripeCustomerId = await ensureStripeCustomer(env, profile, userId);
    const session = await createStripeCheckoutSession(env, stripeCustomerId, priceId, userId);
    console.log('Stripe session created for', userId, 'plan', priceKey, 'url', session.url);
    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error('Unable to start checkout', error);
    return jsonResponse({ error: error?.message || 'Unable to create checkout session.' }, { status: 500 });
  }
}
