const STORAGE_KEY = 'favoriteExercises';
const hasWindow = typeof window !== 'undefined';
const hasStorage = hasWindow && typeof window.localStorage !== 'undefined';
let cache = [];
let initialized = false;

function normalizeLabel(value) {
  return value?.toString().trim() || '';
}

function readFromStorage() {
  if (!hasStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
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
  if (initialized) {
    return getFavoriteExercises();
  }
  cache = dedupe(readFromStorage());
  initialized = true;
  return getFavoriteExercises();
}

export function getFavoriteExercises() {
  if (!initialized) {
    initializeFavoriteExercises();
  }
  return [...cache];
}

export function setFavoriteExercises(values = []) {
  cache = dedupe(values);
  initialized = true;
  writeToStorage(cache);
  return getFavoriteExercises();
}

export function addFavoriteExercise(name) {
  const normalized = normalizeLabel(name);
  if (!normalized) {
    return getFavoriteExercises();
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
