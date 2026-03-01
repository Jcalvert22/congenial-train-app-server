import Stripe from 'stripe';

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
  const priceIdMap = {
    monthly: env.STRIPE_MONTHLY_PRICE_ID,
    yearly: env.STRIPE_YEARLY_PRICE_ID
  };
  const selectedPriceId = priceIdMap[priceKey];

  if (!selectedPriceId) {
    return jsonResponse({ error: 'Unsupported price selection.' }, { status: 400 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: `${env.APP_URL}/checkout/success`,
      cancel_url: `${env.APP_URL}/checkout/cancel`,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1
        }
      ]
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error', error);
    return jsonResponse({ error: 'Unable to create checkout session.' }, { status: 500 });
  }
}
