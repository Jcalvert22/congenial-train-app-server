import { getAuth } from '../auth/state.js';

const BASE_KEY = 'dislikedExercises';
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
    console.warn('Unable to read disliked exercises', error);
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
  checkUserChanged();
  if (initialized) {
    return getDislikedExercises();
  }
  cache = dedupe(readFromStorage());
  initialized = true;
  return getDislikedExercises();
}

export function getDislikedExercises() {
  checkUserChanged();
  if (!initialized) {
    initializeDislikedExercises();
  }
  return [...cache];
}

export function setDislikedExercises(values = []) {
  checkUserChanged();
  cache = dedupe(values);
  initialized = true;
  writeToStorage(cache);
  return getDislikedExercises();
}

export function addDislikedExercise(name) {
  checkUserChanged();
  const normalized = normalizeLabel(name);
  if (!normalized) {
    return getDislikedExercises();
  }
  if (!initialized) {
    initializeDislikedExercises();
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
  checkUserChanged();
  const normalized = normalizeLabel(name);
  if (!normalized) {
    return false;
  }
  if (!initialized) {
    initializeDislikedExercises();
  }
  return cache.some(entry => entry.toLowerCase() === normalized.toLowerCase());
}
