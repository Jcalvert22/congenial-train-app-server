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
const raw = loadJsonSync('./exercises.json', EXERCISES_JSON_FALLBACK);

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
  Machine: 'Adjust the seat and handles to fit you—everyone does.',
  Bodyweight: 'Give nearby lifters a little space before you start.',
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

const DEFAULT_WORKOUT_NAMES = [
  'Goblet Squat',
  'dumbbell bench press',
  'Lat Pulldown (Neutral Grip)',
  'Seated Cable Row',
  'Dumbbell Shoulder Press',
  'Dumbbell Bicep Curl',
  'Cable Tricep Pushdown',
  'Plank',
  'Dead Bug'
];

export const DEFAULT_BEGINNER_WORKOUT = DEFAULT_WORKOUT_NAMES
  .map(name => EXERCISES.find(exercise => exercise.name === name))
  .filter(Boolean);

export const BEGINNER_EQUIPMENT = [...EQUIPMENT_LIST];
export const BEGINNER_MUSCLES = [...MUSCLE_GROUPS];
