import { loadState, saveState } from '../utils/storage.js';
import { getAuth } from '../auth/state.js';
import { cloneDeep } from '../utils/helpers.js';

export const SEX_OPTIONS = ['Female', 'Male', 'Prefer not to say'];

let appState = null;
let lastUserId = null;

function getCurrentUserId() {
  return getAuth()?.user?.id || null;
}

function checkUserChanged() {
  const currentUserId = getCurrentUserId();
  if (currentUserId !== lastUserId) {
    appState = null;
    lastUserId = currentUserId;
  }
}

function createDefaultProfile() {
  return {
    name: '',
    subtitle: '',
    goal: '',
    experience: '',
    equipment: '',
    goalType: 'build_muscle',
    experienceLevel: 'beginner',
    equipmentAccess: 'dumbbells_only',
    daysPerWeek: 3,
    gymxietyMode: false,
    gymxietyIntroComplete: false,
    height: '',
    weight: '',
    sex: '',
    age: '',
    location: '',
    onboardingComplete: false
  };
}

function createDefaultProgram() {
  return {
    currentWeek: 1,
    totalWeeks: 8,
    nextWorkout: ''
  };
}

function createDefaultState() {
  return {
    isSubscribed: false,
    profile: createDefaultProfile(),
    program: createDefaultProgram(),
    workouts: [],
    planAdjustments: {},
    repAdjustments: {},
    currentPlan: [],
    ui: {
      plannerResult: null
    }
  };
}

function mergeState(base, incoming) {
  if (!incoming) {
    return base;
  }
  return {
    ...base,
    ...incoming,
    profile: { ...base.profile, ...(incoming.profile || {}) },
    program: { ...base.program, ...(incoming.program || {}) },
    ui: { ...base.ui, ...(incoming.ui || {}) }
  };
}

const subscribers = new Set();

export function initializeState() {
  checkUserChanged();
  if (appState) {
    return appState;
  }
  const stored = loadState(null);
  const base = createDefaultState();
  appState = stored ? mergeState(base, stored) : base;
  saveState(appState);
  return appState;
}

export function getState() {
  checkUserChanged();
  if (!appState) {
    return initializeState();
  }
  return appState;
}

export function setState(updater) {
  const current = getState();
  const draft = cloneDeep(current);
  const nextCandidate = typeof updater === 'function' ? updater(draft) : updater;
  const nextState = nextCandidate === undefined ? draft : mergeState(draft, nextCandidate);
  appState = nextState;
  saveState(appState);
  subscribers.forEach(listener => listener(appState));
  return appState;
}

export function subscribe(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}
