# Subscription Toggle Reference

## Current state: LIVE
Subscriptions and Stripe checkout are fully enabled for public launch.

- `public/js/checkout.js` — `startCheckout()` POSTs to `/create-checkout-session` and redirects to Stripe.
- `public/index.html` — meta tag `next-public-subscriptions-enabled` is `content="true"`. Navbar "Start free trial" button is active.
- `public/js/supabaseClient.js` — `SIGNUPS_ENABLED = true`. New accounts can be created.

## To pause subscriptions (preview mode)
1. In `public/index.html` set `<meta name="next-public-subscriptions-enabled" content="false" />`. This disables the navbar CTA and pricing buttons.
2. In `public/js/checkout.js` replace `startCheckout()` with an alert stub if you want to block checkout entirely.
3. In `public/js/supabaseClient.js` set `SIGNUPS_ENABLED = false` to freeze new account creation.

## To re-enable (back to launch mode)
1. Set meta tag back to `content="true"`.
2. Restore `startCheckout()` to POST to `/create-checkout-session`.
3. Set `SIGNUPS_ENABLED = true`.
