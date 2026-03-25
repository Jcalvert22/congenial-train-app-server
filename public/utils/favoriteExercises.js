import { getAuth } from '../auth/state.js';

const BASE_KEY = 'favoriteExercises';
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

function normalizeLabel(value) {
  return value?.toString().trim() || '';
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
    console.warn('Unable to read favorite exercises', error);
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
    console.warn('Unable to persist favorite exercises', error);
  }
}

function dedupe(values = []) {
  const seen = new Set();
  const result = [];
  values.forEach(entry => {
    const normalized = normalizeLabel(entry);
    if (!normalized) {
      return;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(normalized);
  });
  return result;
}

export function initializeFavoriteExercises() {
  checkUserChanged();
  if (initialized) {
    return getFavoriteExercises();
  }
  cache = dedupe(readFromStorage());
  initialized = true;
  return getFavoriteExercises();
}

export function getFavoriteExercises() {
  checkUserChanged();
  if (!initialized) {
    initializeFavoriteExercises();
  }
  return [...cache];
}

export function setFavoriteExercises(values = []) {
  checkUserChanged();
  cache = dedupe(values);
  initialized = true;
  writeToStorage(cache);
  return getFavoriteExercises();
}

export function addFavoriteExercise(name) {
  checkUserChanged();
  const normalized = normalizeLabel(name);
  if (!normalized) {
    return getFavoriteExercises();
  }
  if (!initialized) {
    initializeFavoriteExercises();
  }
  const exists = cache.some(entry => entry.toLowerCase() === normalized.toLowerCase());
  if (!exists) {
    cache = [...cache, normalized];
    writeToStorage(cache);
  }
  initialized = true;
  return getFavoriteExercises();
}

export function removeFavoriteExercise(name) {
  checkUserChanged();
  const normalized = normalizeLabel(name);
  if (!normalized) {
    return getFavoriteExercises();
  }
  const slug = normalized.toLowerCase();
  const next = cache.filter(entry => entry.toLowerCase() !== slug);
  if (next.length !== cache.length) {
    cache = next;
    writeToStorage(cache);
  }
  initialized = true;
  return getFavoriteExercises();
}

export function isExerciseFavorited(name) {
  checkUserChanged();
  const normalized = normalizeLabel(name);
  if (!normalized) {
    return false;
  }
  if (!initialized) {
    initializeFavoriteExercises();
  }
  const slug = normalized.toLowerCase();
  return cache.some(entry => entry.toLowerCase() === slug);
}
