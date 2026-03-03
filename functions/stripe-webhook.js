const SUPABASE_TABLE = 'profile';

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

function hexToUint8Array(hex) {
  if (!hex || hex.length % 2 !== 0) {
    return null;
  }
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i += 1) {
    const byte = hex.substr(i * 2, 2);
    const value = parseInt(byte, 16);
    if (Number.isNaN(value)) {
      return null;
    }
    array[i] = value;
  }
  return array;
}

function parseStripeSignature(signatureHeader) {
  return signatureHeader.split(',').reduce(
    (acc, part) => {
      const [key, value] = part.split('=');
      if (!key || !value) {
        return acc;
      }
      if (key === 't') {
        acc.timestamp = value;
      } else {
        acc.signatures[key] = acc.signatures[key] || [];
        acc.signatures[key].push(value);
      }
      return acc;
    },
    { timestamp: null, signatures: {} }
  );
}

async function verifyStripeSignature(body, signatureHeader, secret) {
  if (!signatureHeader || !secret) {
    return false;
  }
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('SubtleCrypto not available in this runtime');
  }
  const parsed = parseStripeSignature(signatureHeader);
  const signatures = parsed.signatures.v1 || [];
  if (!parsed.timestamp || !signatures.length) {
    return false;
  }
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const signingKey = await subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const payload = encoder.encode(`${parsed.timestamp}.${body}`);
  for (const signature of signatures) {
    const signatureBytes = hexToUint8Array(signature);
    if (!signatureBytes) {
      continue;
    }
    const verified = await subtle.verify('HMAC', signingKey, signatureBytes, payload);
    if (verified) {
      return true;
    }
  }
  return false;
}

function buildStripeHeaders(env) {
  return {
    Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`
  };
}

async function retrieveSubscription(env, subscriptionId) {
  if (!subscriptionId) {
    return null;
  }
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: buildStripeHeaders(env)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Unable to fetch subscription');
  }
  return data;
}

function buildSubscriptionPayload(customerId, subscription, fallbackStatus = 'inactive') {
  const normalizedStatus = subscription?.status || fallbackStatus;
  const periodEnd = subscription?.current_period_end ?? null;
  return {
    stripe_customer_id: customerId,
    subscription_status: normalizedStatus,
    current_period_end: periodEnd
  };
}

async function syncSubscription(env, customerId, subscription, fallbackStatus = 'inactive') {
  if (!customerId) {
    console.warn('Subscription sync missing customerId');
    return;
  }
  console.log('Preparing subscription sync', {
    customerId,
    fallbackStatus,
    subscriptionStatus: subscription?.status || null,
    hasSubscription: Boolean(subscription)
  });
  const payload = buildSubscriptionPayload(customerId, subscription, fallbackStatus);
  await patchSupabase(env, buildFilter('stripe_customer_id', customerId), payload);
  console.log('Subscription sync complete', {
    customerId,
    storedStatus: payload.subscription_status,
    storedPeriodEnd: payload.current_period_end
  });
}

async function handleCheckoutSessionCompleted(session, env) {
  const subscriptionId = typeof session?.subscription === 'string' ? session.subscription : null;
  let subscription = null;
  if (subscriptionId) {
    try {
      subscription = await retrieveSubscription(env, subscriptionId);
    } catch (error) {
      console.error('Failed to retrieve subscription after checkout', subscriptionId, error);
    }
  }
  await syncSubscription(env, session?.customer, subscription, 'trialing');
}

async function handleCustomerSubscriptionCreated(subscription, env) {
  await syncSubscription(env, subscription?.customer, subscription, 'trialing');
}

async function handleCustomerSubscriptionUpdated(subscription, env) {
  await syncSubscription(env, subscription?.customer, subscription, 'active');
}

async function handleCustomerSubscriptionDeleted(subscription, env) {
  await syncSubscription(env, subscription?.customer, subscription, 'canceled');
}

async function handleInvoicePaid(invoice, env) {
  const subscriptionId = invoice?.subscription;
  let subscription = null;
  if (subscriptionId) {
    try {
      subscription = await retrieveSubscription(env, subscriptionId);
    } catch (error) {
      console.error('Failed to retrieve subscription for invoice', subscriptionId, error);
    }
  }
  await syncSubscription(env, invoice?.customer, subscription, 'active');
}

async function routeEvent(event, env) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object, env);
      break;
    case 'customer.subscription.created':
      await handleCustomerSubscriptionCreated(event.data.object, env);
      break;
    case 'customer.subscription.updated':
      await handleCustomerSubscriptionUpdated(event.data.object, env);
      break;
    case 'customer.subscription.deleted':
      await handleCustomerSubscriptionDeleted(event.data.object, env);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object, env);
      break;
    default:
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

  const signature =
    request.headers.get('stripe-signature') || request.headers.get('Stripe-Signature');
  if (!signature) {
    return textResponse('Missing signature.', { status: 400 });
  }

  const body = await request.text();
  const verified = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!verified) {
    return textResponse('Invalid signature.', { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch (error) {
    console.error('Invalid JSON payload received from Stripe', error);
    return textResponse('Invalid payload.', { status: 400 });
  }

  try {
    console.log('Stripe webhook received event', event?.type);
    await routeEvent(event, env);
    return textResponse('ok', { status: 200 });
  } catch (error) {
    console.error('Stripe webhook handler failed', error);
    return textResponse('Webhook processing failed.', { status: 500 });
  }
}
