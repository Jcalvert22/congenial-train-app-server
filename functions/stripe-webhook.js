import Stripe from 'stripe';

const STRIPE_API_VERSION = '2023-10-16';
const SUPABASE_TABLE = 'profiles';

function textResponse(body, init = {}) {
  return new Response(body, init);
}

function assertEnv(env) {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  const missing = required.filter(key => !env?.[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

function buildSupabaseHeaders(serviceKey) {
  return {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Prefer: 'return=minimal'
  };
}

function buildFilter(field, value) {
  if (!value) {
    throw new Error(`Missing value for ${field}`);
  }
  const encodedValue = encodeURIComponent(value);
  return `?${field}=eq.${encodedValue}`;
}

async function patchSupabase(env, filter, payload) {
  if (!payload || !Object.keys(payload).length) {
    return;
  }
  const url = `${env.SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}${filter}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: buildSupabaseHeaders(env.SUPABASE_SERVICE_ROLE_KEY),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase update failed (${response.status}): ${errorText}`);
  }
}

async function handleCheckoutSessionCompleted(session, env) {
  const email = session?.customer_details?.email || session?.customer_email;
  if (!email) {
    console.warn('checkout.session.completed missing email');
    return;
  }
  const payload = {
    subscription_status: 'active'
  };
  if (session?.customer) {
    payload.stripe_customer_id = session.customer;
  }
  await patchSupabase(env, buildFilter('email', email), payload);
}

async function handlePaymentStatus(sessionObject, env, status) {
  const customerId = sessionObject?.customer;
  if (!customerId) {
    console.warn(`Payment event missing customer for status ${status}`);
    return;
  }
  await patchSupabase(env, buildFilter('stripe_customer_id', customerId), {
    subscription_status: status
  });
}

async function handleSessionExpired(session, env) {
  const email = session?.customer_details?.email || session?.customer_email;
  if (!email) {
    console.warn('session.expired missing email');
    return;
  }
  await patchSupabase(env, buildFilter('email', email), {
    subscription_status: 'incomplete'
  });
}

async function routeEvent(event, env) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object, env);
      break;
    case 'payment.succeeded':
    case 'payment_intent.succeeded':
      await handlePaymentStatus(event.data.object, env, 'active');
      break;
    case 'payment.failed':
    case 'payment_intent.payment_failed':
      await handlePaymentStatus(event.data.object, env, 'past_due');
      break;
    case 'session.expired':
    case 'checkout.session.expired':
      await handleSessionExpired(event.data.object, env);
      break;
    default:
      // Ignore unsupported event types
      break;
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    assertEnv(env);
  } catch (error) {
    console.error('Stripe webhook missing configuration', error);
    return textResponse('Server misconfiguration', { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return textResponse('Missing signature.', { status: 400 });
  }

  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Stripe signature verification failed', error);
    return textResponse('Invalid signature.', { status: 400 });
  }

  try {
    await routeEvent(event, env);
    return textResponse('ok', { status: 200 });
  } catch (error) {
    console.error('Stripe webhook handler failed', error);
    return textResponse('Webhook processing failed.', { status: 500 });
  }
}
