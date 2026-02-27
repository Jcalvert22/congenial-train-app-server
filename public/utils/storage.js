const STORAGE_KEY = 'aaa-app-state-v1';
const hasWindow = typeof window !== 'undefined';
const hasStorage = hasWindow && typeof window.localStorage !== 'undefined';
let memoryFallback = null;

function readRaw() {
  if (hasStorage) {
    return window.localStorage.getItem(STORAGE_KEY);
  }
  return memoryFallback;
}

function writeRaw(value) {
  if (hasStorage) {
    if (value === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, value);
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
