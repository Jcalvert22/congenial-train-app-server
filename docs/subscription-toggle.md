# Subscription Toggle Reference

Use this note to remember exactly what changed to pause subscriptions and how to flip everything back when you are ready to launch.

## Preview Mode ("Coming Soon" alert)
These edits are live today:
- [public/js/checkout.js](public/js/checkout.js)
  - Introduces `SUBSCRIPTION_ALERT_MESSAGE` and `showSubscriptionAlert()`.
  - `startCheckout()` immediately calls the alert and logs a warning instead of creating a Stripe session.
- [public/index.html](public/index.html)
  - The inline landing script imports `showSubscriptionAlert()` and calls it for both the modal plan options and any `[data-checkout-plan]` trigger.
  - All login/checkout logic inside the landing page modal was removed because the helper blocks everything centrally.

## Launch Mode (restore real checkout)
When launch day arrives, undo the alert-only behavior and re-enable Stripe checkout.

### 1. Restore `startCheckout()`
Replace the alert logic with the original network flow in [public/js/checkout.js](public/js/checkout.js):
```js
export async function startCheckout(priceId = currentPlan) {
  const normalizedPlan = normalizePlan(priceId);
  const user = await getCurrentUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  const response = await fetch('/.netlify/functions/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId: normalizedPlan, userId: user.id })
  });

  const payload = await response.json();
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || 'Unable to create checkout session.');
  }

  window.location.assign(payload.url);
}
```
That snippet matches the logic required by [functions/create-checkout-session.js](functions/create-checkout-session.js), so no backend changes are needed.

### 2. Reconnect landing CTA logic
Swap the inline module in [public/index.html](public/index.html) back to the version that relied on `startCheckout()`:
```js
import { startCheckout, setTrialPlan, getSelectedPlan } from './js/checkout.js';
import { getCurrentUser } from './auth/state.js';
import { redirectToLogin } from './auth/guard.js';
...
optionsContainer.addEventListener('click', async event => {
  const option = event.target.closest('[data-plan-option]');
  if (!option) {
    return;
  }
  const plan = option.dataset.planOption || 'monthly';
  setTrialPlan(plan);
  highlightPlanOption(plan);
  option.disabled = true;
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirectToLogin();
      return;
    }
    await startCheckout(plan);
  } finally {
    option.disabled = false;
    closePlanModal();
  }
});

const checkoutTarget = event.target.closest('[data-checkout-plan]');
...
const user = await getCurrentUser();
if (!user) {
  redirectToLogin();
  return;
}
await startCheckout(plan);
```
Every other CTA (pricing section, paywall, etc.) already imports `startCheckout()`; once the helper is restored they will redirect to Stripe automatically.

### 3. Optional quick flip via Git
If you just need to jump between modes, use Git to swap the two files:
- Preview mode: keep the versions from `docs/subscription-toggle.md` (current HEAD).
- Launch mode: `git checkout origin/main -- public/js/checkout.js public/index.html` (then reapply any landing page changes you still want).

Keep this document as the single source of truth so you can re-enable subscriptions in seconds.
