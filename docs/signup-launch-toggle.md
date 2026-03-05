# Prelaunch Signup Toggle

We temporarily disabled new account creation so nobody can sign up before the public launch. Two things were changed:

- `SIGNUPS_ENABLED` flag in `public/js/supabaseClient.js` now blocks all calls to `signup()` and surfaces a friendly error.
- The signup page renders a "launching soon" message and the login page no longer links to `#/signup` while signups are closed.

## Re-enabling signups at launch

1. Open `public/js/supabaseClient.js` and set `SIGNUPS_ENABLED` to `true`. That automatically re-enables the form, the Supabase `signup()` call, and the UI events.
2. Update any marketing copy if desired (e.g., tweak the message in `public/pages/login.js` back to "Create one" and adjust `public/pages/signup.js` hero text).
3. Smoke-test the signup flow (fill out the form, confirm the email, ensure the post-signup redirect works) before announcing the launch.

Reverse those steps whenever you need to freeze signups again.
