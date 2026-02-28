const AUTH_KEY = 'aaa_auth';
const AUTH_EVENT_NAME = 'aaa-auth-changed';
const hasWindow = typeof window !== 'undefined';
const hasStorage = hasWindow && typeof window.localStorage !== 'undefined';
const defaultAuthState = Object.freeze({
  loggedIn: false,
  user: null,
  stripeCustomerId: null,
  subscriptionStatus: null
});

let cachedAuth = null;
let memoryFallback = null;

function cloneDefault() {
  return { ...defaultAuthState };
}

function readStoredValue() {
  if (hasStorage) {
    return window.localStorage.getItem(AUTH_KEY);
  }
  return memoryFallback;
}

function writeStoredValue(value) {
  if (hasStorage) {
    if (value === null) {
      window.localStorage.removeItem(AUTH_KEY);
    } else {
      window.localStorage.setItem(AUTH_KEY, value);
    }
  } else {
    memoryFallback = value;
  }
}

function normalizeAuth(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return cloneDefault();
  }
  return {
    loggedIn: parsed.loggedIn === true,
    user: parsed.user ?? null,
    stripeCustomerId: parsed.stripeCustomerId ?? null,
    subscriptionStatus: parsed.subscriptionStatus ?? null
  };
}

function notifyAuthChange(state) {
  if (!hasWindow || typeof window.dispatchEvent !== 'function') {
    return;
  }
  const detail = { detail: state };
  if (typeof window.CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, detail));
  } else if (window.document && typeof window.document.createEvent === 'function') {
    const event = window.document.createEvent('CustomEvent');
    event.initCustomEvent(AUTH_EVENT_NAME, false, false, detail.detail);
    window.dispatchEvent(event);
  }
}

export function getAuth() {
  if (cachedAuth) {
    return { ...cachedAuth };
  }
  const raw = readStoredValue();
  if (!raw) {
    cachedAuth = cloneDefault();
    return { ...cachedAuth };
  }
  try {
    cachedAuth = normalizeAuth(JSON.parse(raw));
  } catch (error) {
    console.warn('Unable to parse auth state', error);
    cachedAuth = cloneDefault();
  }
  return { ...cachedAuth };
}

export function setAuth(nextAuth) {
  const state = normalizeAuth(nextAuth);
  cachedAuth = state;
  try {
    writeStoredValue(JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist auth state', error);
  }
  notifyAuthChange(state);
  return state;
}

export function login(userData = null) {
  const state = {
    loggedIn: true,
    user: userData || null,
    stripeCustomerId: null,
    subscriptionStatus: 'trialing'
  };
  setAuth(state);
  return state;
}

export function logout(options = {}) {
  cachedAuth = cloneDefault();
  writeStoredValue(null);
  notifyAuthChange(cachedAuth);
  if (options.redirect !== false && hasWindow && window.location) {
    window.location.replace('/#/');
  }
}

export function isLoggedIn() {
  return getAuth().loggedIn === true;
}
