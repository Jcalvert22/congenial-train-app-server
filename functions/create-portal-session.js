import Stripe from 'stripe';

const SUPABASE_TABLE = 'profile';

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

export async function onRequestPost({ request, env }) {
  if (!env?.STRIPE_SECRET_KEY || !env?.SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Server misconfiguration', { status: 500 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return new Response('Invalid JSON payload', { status: 400 });
  }

  const userId = payload?.userId;
  if (!userId) {
    return new Response('userId is required', { status: 400 });
  }

  try {
    const profile = await fetchProfile(env, userId);
    if (!profile?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'Missing Stripe customer ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: 'https://allaround-athlete.com/profile'
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Portal session failed', error);
    return new Response(JSON.stringify({ error: 'Portal session failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
