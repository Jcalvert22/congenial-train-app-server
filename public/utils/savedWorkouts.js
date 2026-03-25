import { getAuth } from '../auth/state.js';

const BASE_KEY = 'savedWorkouts';
const hasWindow = typeof window !== 'undefined';
const hasStorage = hasWindow && typeof window.localStorage !== 'undefined';
let cache = [];
let initialized = false;
let lastUserId = null;

function getScopedKey() {
  const auth = getAuth();
  const userId = auth?.user?.id;
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY;
}

function checkUserChanged() {
  const auth = getAuth();
  const currentUserId = auth?.user?.id || null;
  if (currentUserId !== lastUserId) {
    cache = [];
    initialized = false;
    lastUserId = currentUserId;
  }
}

function readFromStorage() {
  checkUserChanged();
  if (!hasStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(getScopedKey());
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to read saved workouts', error);
    return [];
  }
}

function writeToStorage(values) {
  if (!hasStorage) {
    return;
  }
  try {
    window.localStorage.setItem(getScopedKey(), JSON.stringify(values));
  } catch (error) {
    console.warn('Unable to persist saved workouts', error);
  }
}

function ensureCache() {
  checkUserChanged();
  if (!initialized) {
    cache = readFromStorage();
    initialized = true;
  }
}

export function generateSavedWorkoutId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `workout-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function getSavedWorkouts() {
  ensureCache();
  return [...cache];
}

export function addSavedWorkout(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  ensureCache();
  const normalized = { ...entry };
  cache = [...cache, normalized];
  writeToStorage(cache);
  return normalized;
}

export function findSavedWorkout(id) {
  if (!id) {
    return null;
  }
  ensureCache();
  const key = id.toString().trim();
  return cache.find(item => item && String(item.id) === key) || null;
}

export function removeSavedWorkout(id) {
  if (!id) {
    return false;
  }
  ensureCache();
  const key = id.toString().trim();
  const next = cache.filter(item => item && String(item.id) !== key);
  if (next.length === cache.length) {
    return false;
  }
  cache = next;
  writeToStorage(cache);
  return true;
}
