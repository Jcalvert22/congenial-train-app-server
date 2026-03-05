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

## Account creation gate (signup freeze)
We also locked down the create-account flow so only existing users can log in:
- [public/js/supabaseClient.js](public/js/supabaseClient.js)
  - `SIGNUPS_ENABLED` is `false`, so any actual Supabase signup call returns the "New account creation is closed" error.
- [public/ui/landingCreateAccount.js](public/ui/landingCreateAccount.js) and [public/ui/landingStartTrial.js](public/ui/landingStartTrial.js)
  - Both pages call `areSignupsEnabled()`. When it is `false` they swap their forms/CTAs for disabled buttons + explanatory copy and keep only the login/contact options active.
- [public/index.html](public/index.html)
  - Adds `<meta name="next-public-subscriptions-enabled" content="false" />`. The navbar "Start free trial" button reads this flag (via `areSubscriptionsEnabled()`) and stays disabled everywhere until you flip it back.

### Re-open signups on launch day
1. Set `SIGNUPS_ENABLED` to `true` in [public/js/supabaseClient.js](public/js/supabaseClient.js). That re-enables the Supabase signup helper and automatically unlocks the create-account/start-trial forms.
2. Update the meta flag in [public/index.html](public/index.html) to `content="true"` (or remove the tag). This brings the global "Start free trial" button back to its clickable state.
3. Verify the CTA pages: visit `#/start-trial` and `#/create-account`. With the flag flipped, the original forms render again and the submit button posts to Supabase.
4. If you ever need to lock things again, revert those two changes: set the constant back to `false` and set the meta `content="false"`.

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
