const AUTH_STORAGE_KEY = 'aaa_auth';
const AUTH_EVENT_NAME = 'aaa-auth-changed';
const hasWindow = typeof window !== 'undefined';
const hasStorage = hasWindow && typeof window.localStorage !== 'undefined';
const defaultAuthState = { loggedIn: false };
let cachedAuthState = null;
let memoryFallback = null;

function readStoredState() {
  if (hasStorage) {
    return window.localStorage.getItem(AUTH_STORAGE_KEY);
  }
  return memoryFallback;
}

function writeStoredState(value) {
  if (hasStorage) {
    if (value === null) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      window.localStorage.setItem(AUTH_STORAGE_KEY, value);
    }
  } else {
    memoryFallback = value;
  }
}

function parseAuthState(raw) {
  if (!raw) {
    return { ...defaultAuthState };
  }
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.loggedIn === 'boolean') {
      return { loggedIn: parsed.loggedIn };
    }
    return { ...defaultAuthState };
  } catch (error) {
    console.warn('Unable to parse auth state', error);
    return { ...defaultAuthState };
  }
}

function serializeAuthState(state) {
  try {
    return JSON.stringify(state);
  } catch (error) {
    console.warn('Unable to serialize auth state', error);
    return null;
  }
}

function loadAuthState() {
  if (cachedAuthState) {
    return cachedAuthState;
  }
  cachedAuthState = parseAuthState(readStoredState());
  return cachedAuthState;
}

function notifyAuthChange() {
  if (!hasWindow || typeof window.dispatchEvent !== 'function') {
    return;
  }
  const eventDetail = { detail: { loggedIn: cachedAuthState.loggedIn } };
  let event = null;
  if (typeof window.CustomEvent === 'function') {
    event = new CustomEvent(AUTH_EVENT_NAME, eventDetail);
  } else if (window.document && typeof window.document.createEvent === 'function') {
    event = window.document.createEvent('CustomEvent');
    event.initCustomEvent(AUTH_EVENT_NAME, false, false, eventDetail.detail);
  }
  if (event) {
    window.dispatchEvent(event);
  }
}

function persistAuthState(nextState, options = {}) {
  const { clearStorage = false } = options;
  cachedAuthState = { ...defaultAuthState, ...nextState };
  if (clearStorage) {
    writeStoredState(null);
  } else {
    const serialized = serializeAuthState(cachedAuthState);
    if (serialized !== null) {
      writeStoredState(serialized);
    }
  }
  notifyAuthChange();
}

export function isLoggedIn() {
  const state = loadAuthState();
  return Boolean(state.loggedIn);
}

export function login() {
  persistAuthState({ loggedIn: true });
}

export function logout() {
  persistAuthState({ loggedIn: false }, { clearStorage: true });
}
