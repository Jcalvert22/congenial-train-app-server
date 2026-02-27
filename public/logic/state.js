import { loadState, saveState } from '../utils/storage.js';
import { cloneDeep, MS_PER_DAY } from '../utils/helpers.js';

export const SEX_OPTIONS = ['Female', 'Male', 'Prefer not to say'];

function seedWorkouts() {
  const completions = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    completions.push(new Date(now.getTime() - i * MS_PER_DAY).toISOString());
  }
  for (let i = 5; i < 18; i++) {
    completions.push(new Date(now.getTime() - (i + 1) * MS_PER_DAY).toISOString());
  }
  return completions;
}

function createDefaultProfile() {
  return {
    name: 'Jace Calvert',
    subtitle: 'Short, calm sessions focused on solid form and breathing.',
    goal: 'Build steady strength and confidence',
    experience: 'Beginner · Week 3',
    equipment: 'Adjustable dumbbells + flat bench',
    goalType: 'build_muscle',
    experienceLevel: 'beginner',
    equipmentAccess: 'dumbbells_only',
    daysPerWeek: 3,
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
    currentWeek: 3,
    totalWeeks: 8,
    nextWorkout: 'Upper Body Reset'
  };
}

function createDefaultState() {
  return {
    isSubscribed: false,
    profile: createDefaultProfile(),
    program: createDefaultProgram(),
    workouts: seedWorkouts(),
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

let appState = null;
const subscribers = new Set();

export function initializeState() {
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
