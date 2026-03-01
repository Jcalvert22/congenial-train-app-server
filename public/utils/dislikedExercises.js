const STORAGE_KEY = 'dislikedExercises';
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
    console.warn('Unable to read disliked exercises', error);
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
    console.warn('Unable to persist disliked exercises', error);
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

export function initializeDislikedExercises() {
  if (initialized) {
    return getDislikedExercises();
  }
  cache = dedupe(readFromStorage());
  initialized = true;
  return getDislikedExercises();
}

export function getDislikedExercises() {
  if (!initialized) {
    initializeDislikedExercises();
  }
  return [...cache];
}

export function setDislikedExercises(values = []) {
  cache = dedupe(values);
  initialized = true;
  writeToStorage(cache);
  return getDislikedExercises();
}

export function addDislikedExercise(name) {
  const normalized = normalizeLabel(name);
  if (!normalized) {
    return getDislikedExercises();
  }
  const exists = cache.some(entry => entry.toLowerCase() === normalized.toLowerCase());
  if (!exists) {
    cache = [...cache, normalized];
    writeToStorage(cache);
  }
  initialized = true;
  return getDislikedExercises();
}

export function isExerciseDisliked(name) {
  const normalized = normalizeLabel(name);
  if (!normalized) {
    return false;
  }
  if (!initialized) {
    initializeDislikedExercises();
  }
  return cache.some(entry => entry.toLowerCase() === normalized.toLowerCase());
}
