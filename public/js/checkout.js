export async function startCheckout(priceId = 'monthly') {
  try {
    const response = await fetch('/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ priceId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Checkout request failed: ${errorText || response.status}`);
    }

    const data = await response.json();
    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    throw new Error('Checkout URL missing from response.');
  } catch (error) {
    console.error('Unable to start checkout', error);
    alert('We could not start your checkout right now. Please try again in a moment.');
  }
}
