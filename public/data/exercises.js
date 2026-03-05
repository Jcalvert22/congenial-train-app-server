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

const HOW_IT_SHOULD_FEEL_MAP = {
  chest: 'Gentle squeeze across the front of your chest while your shoulders stay relaxed.',
  back: 'Smooth pull between your shoulder blades with ribs tall and neck soft.',
  shoulders: 'Light lift through your shoulders while your neck and jaw stay calm.',
  biceps: 'Calm tension through the front of your arms with elbows tucked near your ribs.',
  triceps: 'Soft press through the back of your arms while wrists stay neutral.',
  quads: 'Warm, steady work through the front of your thighs as you press through your feet.',
  hamstrings: 'Stretchy tension down the back of your legs as your hips glide back.',
  glutes: 'Firm squeeze through your hips as you stand tall without arching.',
  legs: 'Even pressure through both feet with knees tracking gently over toes.',
  calves: 'Gentle spring through your lower legs as heels lift and lower with control.',
  core: 'Gentle hug around your midsection while ribs stay stacked over hips.',
  bodyweight: 'Light full-body effort with steady breathing and relaxed shoulders.',
  cardio: 'Easy rhythm in your breathing as your stride stays smooth.',
  general: 'Calm, steady tension in the target muscle without joint discomfort.'
};

const COMMON_MISTAKE_MAP = {
  chest: 'Common mistake is letting shoulders shrug up and taking tension away from the chest.',
  back: 'Common mistake is yanking with your arms instead of driving elbows back.',
  shoulders: 'Common mistake is arching the lower back and locking the elbows.',
  biceps: 'Common mistake is swinging the torso and letting elbows drift forward.',
  triceps: 'Common mistake is flaring elbows wide and losing control near the bottom.',
  quads: 'Common mistake is letting knees collapse inward or heels pop up.',
  hamstrings: 'Common mistake is rounding the back instead of hinging at the hips.',
  glutes: 'Common mistake is thrusting too fast and skipping the squeeze at the top.',
  legs: 'Common mistake is rushing the movement and letting balance fall forward.',
  calves: 'Common mistake is bouncing at the bottom instead of using a full range.',
  core: 'Common mistake is holding the breath and letting ribs flare open.',
  bodyweight: 'Common mistake is racing through reps without feeling the target muscle.',
  cardio: 'Common mistake is gripping handles tightly and tensing the shoulders.',
  general: 'Common mistake is moving too quickly and letting posture collapse.'
};

const REASSURANCE_MAP = {
  chest: 'It is okay if this press feels awkward at first. Move slowly and breathe.',
  back: 'Start light and focus on guiding elbows back. The rhythm will come.',
  shoulders: 'Keep the weight light and explore the motion. Your stability will build each rep.',
  biceps: 'You can pause between reps. Smooth curls beat heavy swinging.',
  triceps: 'Small presses count. Stop before joints feel pinchy.',
  quads: 'It is fine to use a small range until knees feel warm.',
  hamstrings: 'Ease into the hinge. Gentle tension beats forcing depth.',
  glutes: 'Light squeezes still train your hips. Control matters more than load.',
  legs: 'Go at a pace that lets you balance. Rest whenever you need.',
  calves: 'Hold the top for a beat and use the rail if you need balance.',
  core: 'If breathing feels tricky, slow down and reset. That still counts.',
  bodyweight: 'Adjust the lever or angle until the move feels steady.',
  cardio: 'Keep the effort conversational. You can always dial the pace down.',
  general: 'It is okay to pause or modify anytime. Start light and focus on smooth motion.'
};

const resolveMuscleCueKey = entry => {
  const source = entry?.primary_muscle || entry?.muscleGroup || '';
  const key = source.toString().trim().toLowerCase();
  return key || 'general';
};

const normalizeCueValue = (value, fallback) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || fallback;
};

const enrichExerciseEntry = entry => {
  if (!entry || typeof entry !== 'object') {
    return;
  }
  entry.videoUrl = normalizeCueValue(entry.videoUrl, '');
  const cueKey = resolveMuscleCueKey(entry);
  entry.howItShouldFeel = normalizeCueValue(
    entry.howItShouldFeel,
    HOW_IT_SHOULD_FEEL_MAP[cueKey] || HOW_IT_SHOULD_FEEL_MAP.general
  );
  entry.commonMistakes = normalizeCueValue(
    entry.commonMistakes,
    COMMON_MISTAKE_MAP[cueKey] || COMMON_MISTAKE_MAP.general
  );
  entry.reassurance = normalizeCueValue(
    entry.reassurance,
    REASSURANCE_MAP[cueKey] || REASSURANCE_MAP.general
  );
};

Object.values(raw.exercises || {}).forEach(group => {
  if (Array.isArray(group)) {
    group.forEach(enrichExerciseEntry);
  }
});

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
  const videoUrl = typeof entry.videoUrl === 'string' ? entry.videoUrl.trim() : '';
  const howItShouldFeel = typeof entry.howItShouldFeel === 'string' ? entry.howItShouldFeel.trim() : '';
  const commonMistakes = typeof entry.commonMistakes === 'string' ? entry.commonMistakes.trim() : '';
  const reassurance = typeof entry.reassurance === 'string' ? entry.reassurance.trim() : '';
  return {
    ...entry,
    videoUrl,
    howItShouldFeel,
    commonMistakes,
    reassurance,
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
