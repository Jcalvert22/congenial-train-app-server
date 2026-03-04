function loadJsonSync(relativePath, fallback) {
  try {
    const request = new XMLHttpRequest();
    request.overrideMimeType('application/json');
    request.open('GET', new URL(relativePath, import.meta.url), false);
    request.send(null);
    if (request.status >= 200 && request.status < 300) {
      return JSON.parse(request.responseText);
    }
  } catch (error) {
    console.error(`Failed to load ${relativePath}`, error);
  }
  return fallback;
}

const EXERCISES_JSON_FALLBACK = { exercises: {} };
const EXERCISE_META_FALLBACK = {
  version: 'development',
  checksum: 'missing-meta',
  entries: 0,
  generatedAt: null
};
const raw = loadJsonSync('./exercises.json', EXERCISES_JSON_FALLBACK);
const meta = loadJsonSync('./exercises.meta.json', EXERCISE_META_FALLBACK);

export const EXERCISE_LIBRARY_VERSION = meta.version;
export const EXERCISE_LIBRARY_CHECKSUM = meta.checksum;

const EQUIPMENT_LABELS = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbells',
  machine: 'Machine',
  cable: 'Cables',
  bodyweight: 'Bodyweight',
  smith_machine: 'Smith Machine'
};

const MOVEMENT_PATTERN_MAP = {
  chest: 'Horizontal Push',
  back: 'Horizontal Pull',
  shoulders: 'Accessory',
  biceps: 'Accessory',
  triceps: 'Accessory',
  quads: 'Squat',
  hamstrings: 'Hinge',
  glutes: 'Hinge',
  legs: 'Calf',
  core: 'Core',
  bodyweight: 'Full Body'
};

const SAFE_INTIMIDATION_LEVELS = new Set(['low', 'moderate']);

const TITLE_CASE = value => {
  if (!value) {
    return '';
  }
  return value
    .split(/\s|-/)
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
};

const buildLegacyExercise = entry => {
  const equipmentLabel = EQUIPMENT_LABELS[entry.equipment] || 'Bodyweight';
  const muscleGroup = TITLE_CASE(entry.primary_muscle);
  const displayName = TITLE_CASE(entry.name || entry.display_name);
  return {
    ...entry,
    display_name: displayName,
    equipment_key: entry.equipment,
    equipment: [equipmentLabel],
    muscle_group: muscleGroup,
    movement_pattern: MOVEMENT_PATTERN_MAP[entry.primary_muscle] || 'General',
    gymxiety_safe: SAFE_INTIMIDATION_LEVELS.has(entry.intimidation_level)
  };
};

export const GENERAL_EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Cables', 'Barbell'];
export const MACHINE_EQUIPMENT = ['Machine', 'Smith Machine'];

export const EQUIPMENT_ETIQUETTE = {
  Barbell: 'Share the rack by stepping away during rest periods.',
  Dumbbells: 'Pick up your weights and take a few steps back from the rack.',
  Cables: 'Reset the pin and attachment so the next person can start quickly.',
  Machine: 'Adjust the seat and handles to fit you and leave the pin on a light weight.',
  Machines: 'Adjust the setup, wipe it down, and leave the pin on a light weight.',
  Bodyweight: 'Give nearby lifters a little space before you start.',
  Bench: 'Wipe the pad and move the bench back if you rolled it to a new spot.',
  Bands: 'Coil the band and hang it back on the rack so it does not tangle.',
  'Cardio Machines': 'Wipe the handles and console, then step aside so the next person can hop on.',
  'Squat Rack': 'Strip the plates in order and clear clips or belts off the platform.',
  'Smith Machine': 'Set the safeties first so you can rack the bar whenever you need.'
};

export const GYMXIETY_ETIQUETTE = {
  Machines: "It's okay to take your time adjusting the seat.",
  Dumbbells: 'Find a small space—you only need a few feet.',
  Barbell: 'You belong in the rack even if you are new.',
  Bench: "Move the bench if you need more room—it's expected.",
  'Smith Machine': 'Lock the bar wherever you need a pause—people expect it.'
};

export const EQUIPMENT_LIST = [...GENERAL_EQUIPMENT, ...MACHINE_EQUIPMENT];
export const FALLBACK_EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Cables'];
export const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Legs', 'Core', 'Bodyweight'];

const flattenExercises = groups => Object.values(groups).flat();

export const RAW_EXERCISE_LIBRARY = raw;

export const EXERCISE_LIBRARY = flattenExercises(RAW_EXERCISE_LIBRARY.exercises);
export const EXERCISES = EXERCISE_LIBRARY.map(buildLegacyExercise);

if (typeof console !== 'undefined') {
  const checksumPreview = (EXERCISE_LIBRARY_CHECKSUM || 'missing').slice(0, 12);
  const message = `exercise-library v${EXERCISE_LIBRARY_VERSION} (${EXERCISE_LIBRARY.length} entries, checksum ${checksumPreview}…)`;
  if (meta.checksum === 'missing-meta') {
    console.warn(`[exercise-library] metadata missing, using fallback. ${message}`);
  } else {
    console.info(`[exercise-library] ${message}`);
  }
  if (meta.entries && meta.entries !== EXERCISE_LIBRARY.length) {
    console.warn(
      `[exercise-library] entry count mismatch (meta ${meta.entries} vs runtime ${EXERCISE_LIBRARY.length}).`
    );
  }
}

const DEFAULT_WORKOUT_NAMES = [
  'Goblet Squat',
  'dumbbell bench press',
  'Lat Pulldown',
  'Seated Cable Row',
  'Dumbbell Shoulder Press',
  'Dumbbell Bicep Curl',
  'Cable Tricep Pushdown',
  'Plank',
  'Dead Bug'
];

const normalizeExerciseNameKey = value => value?.toString().trim().toLowerCase() || '';
const EXERCISE_NAME_LOOKUP = new Map(
  EXERCISES.map(exercise => [normalizeExerciseNameKey(exercise?.name), exercise])
);

export const DEFAULT_BEGINNER_WORKOUT = DEFAULT_WORKOUT_NAMES
  .map(name => EXERCISE_NAME_LOOKUP.get(normalizeExerciseNameKey(name)))
  .filter(Boolean);

if (typeof console !== 'undefined' && DEFAULT_BEGINNER_WORKOUT.length !== DEFAULT_WORKOUT_NAMES.length) {
  const missingDefaults = DEFAULT_WORKOUT_NAMES.filter(
    name => !EXERCISE_NAME_LOOKUP.has(normalizeExerciseNameKey(name))
  );
  if (missingDefaults.length) {
    console.warn('[exercise-library] missing default exercises:', missingDefaults.join(', '));
  }
}

export const BEGINNER_EQUIPMENT = [...EQUIPMENT_LIST];
export const BEGINNER_MUSCLES = [...MUSCLE_GROUPS];
