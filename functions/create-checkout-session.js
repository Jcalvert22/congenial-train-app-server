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
    'APP_URL'
  ];
  const missing = required.filter(key => !env?.[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

async function createStripeCheckoutSession(env, priceId) {
  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('success_url', `${env.APP_URL}/success`);
  params.append('cancel_url', `${env.APP_URL}/canceled`);
  params.append('line_items[0][price]', priceId);
  params.append('line_items[0][quantity]', '1');

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

  console.log('Received checkout payload:', payload);
  const priceKey = payload?.priceId === 'yearly' ? 'yearly' : 'monthly';
  const priceIdMap = {
    monthly: env.STRIPE_MONTHLY_PRICE_ID,
    yearly: env.STRIPE_YEARLY_PRICE_ID
  };
  const selectedPriceId = priceIdMap[priceKey];
  console.log('Resolved plan:', priceKey, 'Stripe price ID:', selectedPriceId);

  if (!selectedPriceId) {
    return jsonResponse({ error: 'Unsupported price selection.' }, { status: 400 });
  }

  try {
    const session = await createStripeCheckoutSession(env, selectedPriceId);
    console.log('Stripe session created for plan:', priceKey, 'url:', session.url);
    return jsonResponse({ url: session.url, plan: priceKey });
  } catch (error) {
  console.error("Stripe error details:", error?.message, error);
  return jsonResponse(
    { error: 'Unable to create checkout session.' },
    { status: 500 }
  );
}
}
