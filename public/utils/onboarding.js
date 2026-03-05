const STORAGE_KEY = 'aaa-onboarding-prefs-v1';
const DEFAULT_PREFS = {
  experienceLevel: 'brand_new',
  equipment: [],
  completed: false
};

const EXPERIENCE_COMFORT_MAP = {
  brand_new: 'low',
  returning_lifter: 'medium',
  inconsistent: 'high'
};

const EXPERIENCE_OPTIONS = [
  {
    value: 'brand_new',
    label: 'Brand new',
    helper: 'I am just starting and want the calmest approach.'
  },
  {
    value: 'returning_lifter',
    label: 'Returning lifter',
    helper: 'I have lifted before but want a gentle reset.'
  },
  {
    value: 'inconsistent',
    label: 'Comfortable but inconsistent',
    helper: 'I know the basics but need structure to stay steady.'
  }
];

const hasWindow = typeof window !== 'undefined';
const hasStorage = hasWindow && typeof window.localStorage !== 'undefined';
let memoryPrefs = { ...DEFAULT_PREFS };

function readRaw() {
  if (hasStorage) {
    return window.localStorage.getItem(STORAGE_KEY);
  }
  return JSON.stringify(memoryPrefs);
}

function writeRaw(value) {
  if (hasStorage) {
    window.localStorage.setItem(STORAGE_KEY, value);
    return;
  }
  memoryPrefs = JSON.parse(value);
}

function safeParse(raw) {
  if (!raw) {
    return { ...DEFAULT_PREFS };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_PREFS };
    }
    return { ...DEFAULT_PREFS, ...parsed };
  } catch (error) {
    console.warn('Unable to parse onboarding prefs', error);
    return { ...DEFAULT_PREFS };
  }
}

function dedupeEquipment(list = []) {
  if (!Array.isArray(list)) {
    return [];
  }
  const unique = Array.from(new Set(list.map(item => item?.toString().trim()).filter(Boolean)));
  return unique;
}

function normalizeExperienceLevel(value = '') {
  const token = value.toString().trim().toLowerCase();
  if (token === 'brand_new' || token === 'brand-new') {
    return 'brand_new';
  }
  if (token === 'returning_lifter' || token === 'returning') {
    return 'returning_lifter';
  }
  if (token === 'inconsistent' || token === 'comfortable_but_inconsistent') {
    return 'inconsistent';
  }
  return DEFAULT_PREFS.experienceLevel;
}

function deriveComfortFromExperience(experienceLevel = DEFAULT_PREFS.experienceLevel) {
  const normalized = normalizeExperienceLevel(experienceLevel);
  return EXPERIENCE_COMFORT_MAP[normalized] || 'medium';
}

function loadOnboardingPrefs() {
  const raw = readRaw();
  const parsed = safeParse(raw);
  const experienceLevel = normalizeExperienceLevel(parsed.experienceLevel);
  const equipment = dedupeEquipment(parsed.equipment);
  return {
    ...DEFAULT_PREFS,
    ...parsed,
    experienceLevel,
    equipment
  };
}

function saveOnboardingPrefs(partial = {}) {
  const current = loadOnboardingPrefs();
  const nextExperience = normalizeExperienceLevel(partial.experienceLevel ?? current.experienceLevel);
  const nextEquipment = dedupeEquipment(partial.equipment ?? current.equipment);
  const completed = Boolean(partial.completed ?? current.completed ?? (nextExperience && nextEquipment.length));
  const next = {
    ...current,
    ...partial,
    experienceLevel: nextExperience,
    equipment: nextEquipment,
    completed
  };
  writeRaw(JSON.stringify(next));
  return next;
}

function clearOnboardingPrefs() {
  writeRaw(JSON.stringify({ ...DEFAULT_PREFS }));
}

export {
  EXPERIENCE_OPTIONS,
  DEFAULT_PREFS as DEFAULT_ONBOARDING_PREFS,
  normalizeExperienceLevel,
  deriveComfortFromExperience,
  loadOnboardingPrefs,
  saveOnboardingPrefs,
  clearOnboardingPrefs
};
