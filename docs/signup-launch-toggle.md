# Signup Toggle

## Current state: OPEN
Signups are enabled for public launch.

- `SIGNUPS_ENABLED = true` in `public/js/supabaseClient.js`
- Login page links to `#/create-account`
- All signup forms are fully active

## To freeze signups again
1. Set `SIGNUPS_ENABLED` to `false` in `public/js/supabaseClient.js`.
2. The signup form and Supabase `signup()` call are blocked automatically.
3. Update the login page message if desired.

## To re-open signups
1. Set `SIGNUPS_ENABLED` back to `true` in `public/js/supabaseClient.js`.
