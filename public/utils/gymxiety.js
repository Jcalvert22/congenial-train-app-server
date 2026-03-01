import { getAuth, setAuth } from '../auth/state.js';
import { getState, setState } from '../logic/state.js';
import { getConfidenceAlternativeDetails } from '../data/confidenceAlternativeMap.js';

const USER_STORAGE_KEY = 'user';
const GYMXIETY_ONBOARDING_KEY = 'gymxietyIntroComplete';
const GYMXIETY_MODE_KEY = 'gymxietyMode';

function coerceBoolean(value) {
  return value === true || value === 'true';
}

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredUser() {
  if (!hasStorage()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to parse stored user profile', error);
    return null;
  }
}

function writeStoredProfilePatch(patch = {}) {
  if (!hasStorage()) {
    return;
  }
  try {
    const existing = readStoredUser();
    const nextSnapshot = {
      ...(existing || {}),
      profile: {
        ...(existing?.profile || {}),
        ...patch
      }
    };
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextSnapshot));
  } catch (error) {
    console.warn('Unable to persist profile patch to user profile', error);
  }
}

function resolveProfileBoolean(key) {
  if (!key) {
    return undefined;
  }
  const state = getState();
  const stateValue = state?.profile?.[key];
  if (typeof stateValue === 'boolean') {
    return stateValue;
  }

  const storedUser = readStoredUser();
  const storedProfileValue = storedUser?.profile?.[key];
  if (typeof storedProfileValue === 'boolean') {
    return storedProfileValue;
  }
  if (typeof storedProfileValue === 'string') {
    return coerceBoolean(storedProfileValue);
  }

  const auth = getAuth();
  const authProfileValue = auth?.user?.profile?.[key] ?? auth?.user?.[key];
  if (typeof authProfileValue === 'boolean') {
    return authProfileValue;
  }
  if (typeof authProfileValue === 'string') {
    return coerceBoolean(authProfileValue);
  }
  return undefined;
}

export function getGymxietyPreference() {
  const preference = resolveProfileBoolean(GYMXIETY_MODE_KEY);
  if (typeof preference === 'boolean') {
    return preference;
  }
  return false;
}

export function persistGymxietyPreference(enabled) {
  const normalized = Boolean(enabled);
  setState(prev => {
    prev.profile = { ...prev.profile, gymxietyMode: normalized };
    return prev;
  });
  const auth = getAuth();
  const nextAuth = { ...auth };
  nextAuth.user = nextAuth.user || {};
  nextAuth.user.profile = { ...(nextAuth.user.profile || {}), gymxietyMode: normalized };
  nextAuth.user.gymxietyMode = normalized;
  setAuth(nextAuth);
  writeStoredProfilePatch({ [GYMXIETY_MODE_KEY]: normalized });
  return normalized;
}

export function hasCompletedGymxietyOnboarding() {
  const resolved = resolveProfileBoolean(GYMXIETY_ONBOARDING_KEY);
  return resolved === true;
}

export function persistGymxietyOnboardingComplete(value = true) {
  const normalized = Boolean(value);
  setState(prev => {
    prev.profile = { ...prev.profile, [GYMXIETY_ONBOARDING_KEY]: normalized };
    return prev;
  });
  const auth = getAuth();
  const nextAuth = { ...auth };
  nextAuth.user = nextAuth.user || {};
  nextAuth.user.profile = { ...(nextAuth.user.profile || {}), [GYMXIETY_ONBOARDING_KEY]: normalized };
  nextAuth.user[GYMXIETY_ONBOARDING_KEY] = normalized;
  setAuth(nextAuth);
  writeStoredProfilePatch({ [GYMXIETY_ONBOARDING_KEY]: normalized });
  return normalized;
}

export function resolveGymxietyFromPlan(plan, fallback) {
  if (typeof plan?.preferences?.gymxietyMode === 'boolean') {
    return plan.preferences.gymxietyMode;
  }
  if (typeof fallback === 'boolean') {
    return fallback;
  }
  return getGymxietyPreference();
}

function buildAlternativeFromMap(row) {
  if (!row || row.confidenceApplied) {
    return null;
  }
  const sourceName = row.baseExercise || row.exercise;
  if (!sourceName) {
    return null;
  }
  const fallback = {
    equipment: row.equipment,
    muscle: row.muscle,
    description: row.description,
    supportiveCues: row.supportiveCues
  };
  const details = getConfidenceAlternativeDetails(sourceName, fallback);
  if (!details) {
    return null;
  }
  return {
    exercise: details.exercise,
    equipment: details.equipment || row.equipment,
    muscle: details.muscle || row.muscle,
    description: details.description || row.description,
    sets: row.sets,
    repRange: row.repRange,
    confidence: details.confidence || 'Easy',
    supportiveCues: details.supportiveCues || row.supportiveCues,
    source: sourceName
  };
}

export function applyConfidenceAlternative(planRows, options = {}) {
  if (!Array.isArray(planRows) || !planRows.length) {
    return false;
  }
  let targetIndex = -1;
  if (typeof options.index === 'number' && options.index >= 0 && options.index < planRows.length) {
    targetIndex = options.index;
  } else if (options.id !== undefined) {
    const normalizedId = typeof options.id === 'string'
      ? Number.parseInt(options.id, 10)
      : options.id;
    if (Number.isFinite(normalizedId)) {
      targetIndex = planRows.findIndex(row => row?.id === normalizedId);
    }
  }
  if (targetIndex < 0) {
    return false;
  }
  const current = planRows[targetIndex];
  let alternative = current?.confidenceAlternative;
  if (!alternative) {
    alternative = buildAlternativeFromMap(current);
  }
  if (!alternative) {
    return false;
  }
  planRows[targetIndex] = {
    ...current,
    exercise: alternative.exercise,
    equipment: alternative.equipment || current.equipment,
    muscle: alternative.muscle || current.muscle,
    repRange: alternative.repRange || current.repRange,
    sets: alternative.sets || current.sets,
    description: alternative.description || current.description,
    confidence: alternative.confidence || 'Easy',
    supportiveCues: alternative.supportiveCues || current.supportiveCues,
    confidenceAlternative: null,
    confidenceApplied: true,
    baseExercise: current.baseExercise || current.exercise
  };
  return true;
}
