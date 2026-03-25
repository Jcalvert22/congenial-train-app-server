import { getAuth } from '../auth/state.js';

const BASE_KEY = 'aaa-app-state-v1';
const hasWindow = typeof window !== 'undefined';
const hasStorage = hasWindow && typeof window.localStorage !== 'undefined';
let memoryFallback = null;

function getScopedKey() {
  const auth = getAuth();
  const userId = auth?.user?.id;
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY;
}

function readRaw() {
  if (hasStorage) {
    return window.localStorage.getItem(getScopedKey());
  }
  return memoryFallback;
}

function writeRaw(value) {
  if (hasStorage) {
    if (value === null) {
      window.localStorage.removeItem(getScopedKey());
    } else {
      window.localStorage.setItem(getScopedKey(), value);
    }
  } else {
    memoryFallback = value;
  }
}

export function loadState(fallback = null) {
  try {
    const raw = readRaw();
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to parse stored state', error);
    return fallback;
  }
}

export function saveState(state) {
  try {
    writeRaw(JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to save state', error);
  }
}

export function clearState() {
  writeRaw(null);
}
