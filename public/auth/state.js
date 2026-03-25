import { getSupabaseClient, getCurrentUser as fetchSupabaseUser, onSupabaseAuthChange } from '../js/supabaseClient.js';

const AUTH_EVENT_NAME = 'aaa-auth-changed';
const defaultAuthState = Object.freeze({
  initialized: false,
  loggedIn: false,
  user: null,
  stripeCustomerId: null,
  subscriptionStatus: null,
  plan: null,
  currentPeriodEnd: null
});

let authState = { ...defaultAuthState };
let initPromise = null;
let authSubscription = null;

function getOptionalClient() {
  return getSupabaseClient({ required: false });
}

function getRequiredClient() {
  return getSupabaseClient({ required: true });
}

function cloneState(overrides = {}) {
  return { ...defaultAuthState, ...overrides, initialized: true };
}

function notifyAuthChange(state) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return;
  }
  const detail = { detail: state };
  if (typeof window.CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, detail));
    return;
  }
  const doc = window.document;
  if (doc && typeof doc.createEvent === 'function') {
    const event = doc.createEvent('CustomEvent');
    event.initCustomEvent(AUTH_EVENT_NAME, false, false, detail.detail);
    window.dispatchEvent(event);
  }
}

async function fetchProfile(userId) {
  if (!userId) {
    return null;
  }
  const client = getOptionalClient();
  if (!client) {
    return null;
  }
  const { data, error } = await client
    .from('profile')
    .select('id,email,stripe_customer_id,subscription_status,current_period_end')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Unable to load profile', error);
    return null;
  }
  return data || null;
}

async function ensureProfile(user) {
  if (!user) {
    return null;
  }
  try {
    const response = await fetch('/functions/sync-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unable to sync profile row', errorText);
      return fetchProfile(user.id);
    }
    const data = await response.json();
    if (data?.profile) {
      return data.profile;
    }
  } catch (error) {
    console.error('Unable to sync profile row', error);
  }
  return fetchProfile(user.id);
}

async function hydrateAuthState() {
  try {
    const user = await fetchSupabaseUser();
    if (!user) {
      authState = cloneState();
      notifyAuthChange(authState);
      return authState;
    }
    const profile = await ensureProfile(user);
    authState = cloneState({
      loggedIn: true,
      user,
      stripeCustomerId: profile?.stripe_customer_id || null,
      subscriptionStatus: profile?.subscription_status || null,
      currentPeriodEnd: profile?.current_period_end || null
    });
    notifyAuthChange(authState);
    return authState;
  } catch (error) {
    console.error('Failed to hydrate auth state', error);
    authState = cloneState();
    notifyAuthChange(authState);
    return authState;
  }
}

export function ensureAuthInitialized() {
  if (!initPromise) {
    initPromise = hydrateAuthState().finally(() => {
      if (!authSubscription) {
        authSubscription = onSupabaseAuthChange(() => {
          hydrateAuthState();
        });
      }
    });
  }
  return initPromise;
}

export function getAuth() {
  return { ...authState };
}

export function setAuth(nextAuth = {}) {
  const merged = cloneState({
    ...authState,
    ...nextAuth,
    loggedIn: nextAuth.loggedIn ?? authState.loggedIn,
    user: nextAuth.user ?? authState.user,
    stripeCustomerId:
      nextAuth.stripeCustomerId !== undefined
        ? nextAuth.stripeCustomerId
        : authState.stripeCustomerId,
    subscriptionStatus:
      nextAuth.subscriptionStatus !== undefined
        ? nextAuth.subscriptionStatus
        : authState.subscriptionStatus,
    plan: nextAuth.plan !== undefined ? nextAuth.plan : authState.plan,
    currentPeriodEnd:
      nextAuth.currentPeriodEnd !== undefined
        ? nextAuth.currentPeriodEnd
        : authState.currentPeriodEnd
  });
  authState = merged;
  notifyAuthChange(authState);
  return authState;
}

export async function refreshAuthState() {
  return hydrateAuthState();
}

export async function loginWithEmail({ email, password }) {
  const client = getRequiredClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  await hydrateAuthState();
  return getAuth();
}

export async function signupWithEmail({ email, password }) {
  const client = getRequiredClient();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) {
    throw error;
  }
  if (data?.user) {
    await ensureProfile(data.user);
  }
  await hydrateAuthState();
  return getAuth();
}

export async function logout(options = {}) {
  const client = getOptionalClient();
  const { error } = client ? await client.auth.signOut() : { error: null };
  if (error) {
    console.error('Supabase sign out failed', error);
  }
  authState = cloneState();
  notifyAuthChange(authState);
  if (options.redirect !== false && typeof window !== 'undefined') {
    window.location.hash = '#/login';
  }
}

export async function isLoggedIn() {
  const user = await fetchSupabaseUser();
  return Boolean(user);
}

export { fetchSupabaseUser as getCurrentUser };
