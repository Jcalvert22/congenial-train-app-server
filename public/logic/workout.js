import {
  EXERCISES,
  MUSCLE_GROUPS,
  EQUIPMENT_LIST,
  BEGINNER_EQUIPMENT,
  BEGINNER_MUSCLES
} from '../data/exercises.js';
import {
  clamp,
  normalizeDay,
  normalizeSelection,
  shuffleArray,
  MS_PER_DAY
} from '../utils/helpers.js';
import { getState, setState } from './state.js';
import {
  getConfidenceAlternativeDetails,
  confidenceAlternativeMap
} from '../data/confidenceAlternativeMap.js';

const PERCENT_MIN = 30;
const PERCENT_MAX = 95;
const PERCENT_STEP = 5;
const PERCENT_OFFSET_MIN = -25;
const PERCENT_OFFSET_MAX = 25;
const REP_STEP = 2;
const REP_DELTA_MIN = -6;
const REP_DELTA_MAX = 6;

const DEFAULT_GYMXIETY_CUES = [
  'Keep chest tall.',
  'Move slow and controlled.',
  'Stop if anything feels sharp or painful.'
];

const DEFAULT_GYMXIETY_REST = 'Rest 60-90 sec';
const GYMXIETY_REP_RANGE = '8-12 reps, calm tempo';
const GYMXIETY_SETS = '2-3 sets';
const GYMXIETY_WEIGHT_TEXT = 'Use a light setting that feels steady.';
const DEFAULT_GYMXIETY_DESCRIPTION = 'Move slowly, breathe through each rep, and stop if anything feels sharp.';
const MIN_GYMXIETY_EXERCISES = 4;
const MAX_GYMXIETY_EXERCISES = 6;
const MIN_STANDARD_MOVEMENTS = 3;
const MAX_STANDARD_MOVEMENTS = 5;
const DEFAULT_FALLBACK_SETS = '3 sets';
const DEFAULT_FALLBACK_REP_RANGE = '10 calm reps';
const DEFAULT_FALLBACK_REST = 'Rest 90 sec';

const DEFAULT_BEGINNER_WORKOUT = [
  {
    name: 'Goblet Squat',
    equipment: 'Dumbbells',
    muscle: 'Legs',
    instructions: 'Hold a light dumbbell at chest height, sit back into hips, and stand tall without rushing.'
  },
  {
    name: 'Dumbbell RDL',
    equipment: 'Dumbbells',
    muscle: 'Posterior Chain',
    instructions: 'Hinge at the hips with soft knees, feel hamstrings load, and squeeze glutes to stand up.'
  },
  {
    name: 'Chest Press Machine',
    equipment: 'Chest Press Machine',
    muscle: 'Chest',
    instructions: 'Sit tall against the pad, press handles forward smoothly, and return with control.'
  },
  {
    name: 'Seated Row Machine',
    equipment: 'Seated Row Machine',
    muscle: 'Back',
    instructions: 'Keep chest supported, pull elbows toward ribs, and pause briefly before releasing.'
  },
  {
    name: 'Cable Biceps Curl',
    equipment: 'Cable Machine',
    muscle: 'Arms',
    instructions: 'Stand tall, curl hands toward shoulders, and lower slowly while breathing out.'
  },
  {
    name: 'Cable Triceps Pushdown',
    equipment: 'Cable Machine',
    muscle: 'Arms',
    instructions: 'Keep elbows tucked, press rope down, and pause at the bottom without locking out hard.'
  },
  {
    name: 'Dead Bug',
    equipment: 'Bodyweight',
    muscle: 'Core',
    instructions: 'Lie on your back, lower opposite arm and leg slowly, and exhale through the motion.'
  }
];

function mapDefaultEntryToExercise(entry) {
  if (!entry) {
    return null;
  }
  const equipmentValue = entry.equipment || 'Bodyweight';
  const equipment = equipmentValue
    .split('/')
    .join(',')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
  return {
    name: entry.name,
    equipment: equipment.length ? equipment : ['Bodyweight'],
    muscle_group: entry.muscle || 'Full Body',
    howto: entry.instructions,
    video: ''
  };
}

const DEFAULT_MOVEMENT_PATTERN = 'General';
const DEFAULT_INTIMIDATION_LEVEL = 'moderate';
const INTIMIDATION_LEVEL_ORDER = ['low', 'moderate', 'high'];
const DEFAULT_EQUIPMENT_FALLBACK = ['Bodyweight'];
const TIME_BASED_KEYWORDS = ['plank', 'carry', 'hold', 'march', 'walk', 'bike', 'ride', 'row', 'glide', 'crawl'];
const CONDITIONING_TIME_RANGE = '60-90 sec steady pace';
const HOLD_TIME_RANGE = '30-45 sec hold';
const CURATED_EQUIPMENT_PRIORITIES = [
  'Bodyweight',
  'Dumbbells',
  'Bench',
  'Resistance Bands',
  'Cables',
  'Machine',
  'Smith Machine',
  'Suspension Trainer',
  'Stability Ball',
  'Mini Bands',
  'Lat Pulldown',
  'Seated Row',
  'Leg Extension',
  'Hamstring Curl',
  'Cardio Bike',
  'Treadmill',
  'Rowing Machine',
  'Elliptical'
];
const CURATED_EQUIPMENT_LIST = CURATED_EQUIPMENT_PRIORITIES.filter(item => EQUIPMENT_LIST.includes(item));
const CURATED_MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Abs', 'Core'].filter(item =>
  MUSCLE_GROUPS.includes(item)
);
const BODYWEIGHT_CORE_MUSCLES = new Set(['abs', 'core']);

function expandEquipmentTokens(value = '') {
  return value
    .split('/')
    .join(',')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

function buildEquipmentKeys(list = []) {
  const keys = new Set();
  list.forEach(item => {
    const lower = item.toLowerCase();
    keys.add(lower);
    if (lower.includes('bodyweight')) {
      keys.add('bodyweight');
    }
    if (lower.includes('dumbbell')) {
      keys.add('dumbbells');
    }
    if (lower.includes('bench')) {
      keys.add('bench');
    }
    if (lower.includes('machine')) {
      keys.add('machine');
    }
    if (lower.includes('smith')) {
      keys.add('smith machine');
    }
    if (lower.includes('cable')) {
      keys.add('cables');
    }
    if (lower.includes('band')) {
      keys.add('resistance bands');
      keys.add('bands');
    }
    if (lower.includes('bike')) {
      keys.add('cardio bike');
    }
    if (lower.includes('row')) {
      keys.add('rowing machine');
    }
    if (lower.includes('elliptical')) {
      keys.add('elliptical');
    }
    if (lower.includes('treadmill')) {
      keys.add('treadmill');
    }
    if (lower.includes('suspension')) {
      keys.add('suspension trainer');
    }
    if (lower.includes('stability')) {
      keys.add('stability ball');
    }
  });
  return Array.from(keys);
}

function normalizeExerciseEntry(exercise) {
  if (!exercise || !exercise.name) {
    return null;
  }
  const equipmentValues = Array.isArray(exercise.equipment) && exercise.equipment.length
    ? exercise.equipment
    : exercise.equipment
      ? [exercise.equipment]
      : DEFAULT_EQUIPMENT_FALLBACK;
  const flattenedEquipment = equipmentValues
    .flatMap(value => expandEquipmentTokens((value || '').toString()))
    .filter(Boolean);
  const equipmentList = flattenedEquipment.length ? flattenedEquipment : DEFAULT_EQUIPMENT_FALLBACK;
  const equipmentKeys = buildEquipmentKeys(equipmentList);
  return {
    ...exercise,
    equipment: equipmentList,
    equipmentKeys,
    muscle_group: exercise.muscle_group || 'Full Body',
    movement_pattern: exercise.movement_pattern || DEFAULT_MOVEMENT_PATTERN,
    intimidation_level: (exercise.intimidation_level || DEFAULT_INTIMIDATION_LEVEL).toLowerCase(),
    gymxiety_safe: typeof exercise.gymxiety_safe === 'boolean' ? exercise.gymxiety_safe : false,
    howto: exercise.howto || DEFAULT_GYMXIETY_DESCRIPTION,
    video: exercise.video || ''
  };
}

const NORMALIZED_EXERCISES = EXERCISES.map(normalizeExerciseEntry).filter(Boolean);

function shouldUseTimeBasedPrescription(exercise) {
  if (!exercise) {
    return false;
  }
  const name = (exercise.name || '').toLowerCase();
  if ((exercise.movement_pattern || '').toLowerCase() === 'conditioning') {
    return true;
  }
  const equipmentList = Array.isArray(exercise.equipment) ? exercise.equipment : [];
  const hasBodyweight = equipmentList.some(item => item.toLowerCase().includes('bodyweight'));
  const muscleGroup = (exercise.muscle_group || '').toLowerCase();
  if (!hasBodyweight) {
    return false;
  }
  if (BODYWEIGHT_CORE_MUSCLES.has(muscleGroup)) {
    return true;
  }
  return TIME_BASED_KEYWORDS.some(keyword => name.includes(keyword));
}

function getTimeBasedPrescription(exercise, options = {}) {
  const name = (exercise?.name || '').toLowerCase();
  if (name.includes('plank') || name.includes('hold')) {
    return options.gymxietyMode ? '20-30 sec calm hold' : HOLD_TIME_RANGE;
  }
  if (name.includes('carry')) {
    return options.gymxietyMode ? '25-35 sec steady walk' : '35-45 sec walk';
  }
  if (
    (exercise?.movement_pattern || '').toLowerCase() === 'conditioning' ||
    name.includes('walk') ||
    name.includes('bike') ||
    name.includes('ride') ||
    name.includes('row') ||
    name.includes('march')
  ) {
    return CONDITIONING_TIME_RANGE;
  }
  return options.gymxietyMode ? '20-30 sec controlled tempo' : '30-40 sec steady tempo';
}

function resolveAllowedIntimidationLevels(cap = '') {
  if (!cap) {
    return null;
  }
  const normalized = cap.toString().trim().toLowerCase();
  const index = INTIMIDATION_LEVEL_ORDER.indexOf(normalized);
  if (index === -1) {
    return null;
  }
  return INTIMIDATION_LEVEL_ORDER.slice(0, index + 1);
}

function collectMatchesForMuscle(muscle, options = {}) {
  const normalizedMuscle = (muscle || '').toString().trim().toLowerCase();
  if (!normalizedMuscle) {
    return [];
  }
  const equipmentSet = options.equipmentSet;
  const preferGymxietySafe = Boolean(options.preferGymxietySafe);
  const allowedIntimidationLevels = Array.isArray(options.allowedIntimidationLevels)
    ? options.allowedIntimidationLevels
    : null;
  const baseMatches = NORMALIZED_EXERCISES.filter(exercise => {
    if ((exercise.muscle_group || '').toLowerCase() !== normalizedMuscle) {
      return false;
    }
    if (!equipmentSet || !equipmentSet.size) {
      return true;
    }
    return exercise.equipmentKeys.some(key => equipmentSet.has(key));
  });
  if (!baseMatches.length) {
    return [];
  }
  let matches = baseMatches;
  if (preferGymxietySafe) {
    const safeMatches = matches.filter(exercise => exercise.gymxiety_safe);
    if (safeMatches.length) {
      matches = safeMatches;
    }
  }
  if (allowedIntimidationLevels && allowedIntimidationLevels.length) {
    const cappedMatches = matches.filter(exercise => allowedIntimidationLevels.includes(exercise.intimidation_level));
    if (cappedMatches.length) {
      matches = cappedMatches;
    }
  }
  return matches;
}

const GOAL_MUSCLE_FALLBACKS = {
  Strength: ['Back', 'Legs', 'Chest'],
  Hypertrophy: ['Chest', 'Shoulders', 'Arms'],
  'Fat Loss': ['Legs', 'Shoulders', 'Abs'],
  'General Fitness': ['Back', 'Legs', 'Abs']
};

function inferGoalFromInputs(goalInput, muscles = [], mode = 'dieting') {
  const normalizedGoal = (goalInput || '').toString().trim();
  if (normalizedGoal) {
    return normalizedGoal;
  }
  const normalizedMode = (mode || '').toString().trim().toLowerCase();
  if (normalizedMode.includes('bulk')) {
    return 'Hypertrophy';
  }
  if (normalizedMode.includes('strength')) {
    return 'Strength';
  }
  if (normalizedMode.includes('diet')) {
    return 'Fat Loss';
  }
  const muscleSet = new Set((Array.isArray(muscles) ? muscles : [muscles]).map(muscle => (muscle || '').toString().trim().toLowerCase()));
  if (muscleSet.has('legs') || muscleSet.has('glutes')) {
    return 'Strength';
  }
  if (muscleSet.has('chest') || muscleSet.has('shoulders') || muscleSet.has('arms') || muscleSet.has('upper chest')) {
    return 'Hypertrophy';
  }
  if (muscleSet.has('abs') || muscleSet.has('core') || muscleSet.has('conditioning')) {
    return 'Fat Loss';
  }
  return 'General Fitness';
}

function mapExerciseToPlanRow(exercise, index, options = {}) {
  if (!exercise) {
    return null;
  }
  const {
    percent = 70,
    benchMax = 0,
    squatMax = 0,
    deadliftMax = 0,
    noMax = false,
    repRange = '12-20 reps, light/moderate weight',
    setsPerExercise = '3 sets',
    gymxietyMode = false
  } = options;
  const exerciseKey = exercise.name;
  let recommendedWeight = getRecommendedWeight(exercise, benchMax, squatMax, deadliftMax, percent, noMax);
  let usesWeight = /lbs/i.test(recommendedWeight);
  const timeBased = shouldUseTimeBasedPrescription(exercise);
  let displayedRepRange = repRange;
  let appliedSets = setsPerExercise;
  if (timeBased) {
    displayedRepRange = getTimeBasedPrescription(exercise, { gymxietyMode });
    recommendedWeight = 'Bodyweight / steady tempo';
    usesWeight = false;
    appliedSets = gymxietyMode ? GYMXIETY_SETS : setsPerExercise;
  } else if (!usesWeight) {
    displayedRepRange = applyRepDeltaToRange(repRange, exerciseKey);
  }
  const confidenceAlternative = buildConfidenceAlternative(exercise, {
    sets: appliedSets,
    repRange: displayedRepRange
  });
  return {
    id: index,
    exercise: exerciseKey,
    name: exerciseKey,
    baseExercise: exerciseKey,
    equipment: exercise.equipment.join(', '),
    muscle: exercise.muscle_group || 'Full Body',
    repRange: displayedRepRange,
    reps: displayedRepRange,
    sets: appliedSets,
    recommendedWeight,
    description: exercise.howto,
    instructions: exercise.howto,
    video: exercise.video,
    usesWeight,
    exerciseKey,
    confidence: 'Moderate',
    supportiveCues: [],
    confidenceAlternative,
    confidenceApplied: false,
    rest: undefined
  };
}

function buildGoalDrivenFallbackPlan(options = {}) {
  const {
    goal = 'General Fitness',
    gymxietyMode = false,
    planMeta = null,
    preferredMuscles = []
  } = options;
  const targets = preferredMuscles.length
    ? preferredMuscles
    : GOAL_MUSCLE_FALLBACKS[goal] || GOAL_MUSCLE_FALLBACKS['General Fitness'];
  const usedNames = new Set();
  const selections = [];
  targets.forEach(muscle => {
    const matches = collectMatchesForMuscle(muscle, {
      equipmentSet: null,
      preferGymxietySafe: gymxietyMode,
      allowedIntimidationLevels: gymxietyMode ? resolveAllowedIntimidationLevels('moderate') : null
    });
    if (!matches.length) {
      return;
    }
    const pick = matches.find(entry => !usedNames.has(entry.name)) || matches[0];
    if (pick) {
      usedNames.add(pick.name);
      selections.push(pick);
    }
  });
  if (!selections.length) {
    return null;
  }
  const repRange = gymxietyMode ? GYMXIETY_REP_RANGE : '12-20 reps, light/moderate weight';
  const setsPerExercise = gymxietyMode ? GYMXIETY_SETS : '3 sets';
  const planRows = selections
    .slice(0, MAX_STANDARD_MOVEMENTS)
    .map((exercise, index) =>
      mapExerciseToPlanRow(exercise, index, {
        percent: 60,
        benchMax: 0,
        squatMax: 0,
        deadliftMax: 0,
        noMax: true,
        repRange,
        setsPerExercise,
        gymxietyMode
      })
    )
    .filter(Boolean);
  if (!planRows.length) {
    return null;
  }
  const focus = Array.from(new Set(planRows.map(row => row.muscle))).slice(0, 2);
  const summary = {
    movementCount: planRows.length,
    focus: focus.length ? focus : targets.slice(0, 2),
    repRange,
    setsPerExercise,
    mode: gymxietyMode ? 'Gymxiety' : 'Goal Fallback'
  };
  return finalizePlanPayload(planRows, summary, { goal, gymxietyMode, planMeta });
}

const GYMXIETY_CATEGORY_POOLS = {
  squat: [
    {
      name: 'Goblet Squat',
      equipment: 'Dumbbells',
      muscle: 'Legs',
      instructions: 'Hold a light dumbbell at chest height, sit down slowly, and stand tall without rushing.',
      tags: ['dumbbell']
    },
    {
      name: 'Leg Press',
      equipment: 'Leg Press Machine',
      muscle: 'Legs',
      instructions: 'Set feet shoulder-width, press through mid-foot, and control the return.',
      tags: ['machine']
    },
    {
      name: 'Smith Machine Squat',
      equipment: 'Smith Machine',
      muscle: 'Legs',
      instructions: 'Let the rails guide you, keep chest tall, and move with a calm tempo.',
      tags: ['smith', 'machine']
    },
    {
      name: 'Bodyweight Squat',
      equipment: 'Bodyweight',
      muscle: 'Legs',
      instructions: 'Reach arms forward as you sit back, then stand up softly.',
      tags: ['bodyweight']
    }
  ],
  hinge: [
    {
      name: 'Dumbbell Romanian Deadlift',
      equipment: 'Dumbbells',
      muscle: 'Posterior Chain',
      instructions: 'Hinge at the hips with soft knees and stand tall while squeezing glutes.',
      tags: ['dumbbell']
    },
    {
      name: 'Cable Pull-Through',
      equipment: 'Cable Machine',
      muscle: 'Glutes',
      instructions: 'Face away from the cable, let hips travel back, and drive forward calmly.',
      tags: ['cable']
    },
    {
      name: 'Hip Thrust Machine',
      equipment: 'Hip Thrust Machine',
      muscle: 'Glutes',
      instructions: 'Let the pad support you, press hips upward, and pause briefly on top.',
      tags: ['machine']
    },
    {
      name: 'Glute Bridge',
      equipment: 'Bodyweight / Bench',
      muscle: 'Glutes',
      instructions: 'Drive through heels, squeeze glutes, and lower with control.',
      tags: ['bodyweight']
    }
  ],
  push: [
    {
      name: 'Chest Press Machine',
      equipment: 'Chest Press Machine',
      muscle: 'Chest',
      instructions: 'Sit tall against the pad, press handles forward, and return slowly.',
      tags: ['machine']
    },
    {
      name: 'Seated Dumbbell Shoulder Press',
      equipment: 'Bench + Dumbbells',
      muscle: 'Shoulders',
      instructions: 'Brace back against the bench, press bells overhead, and lower for three counts.',
      tags: ['dumbbell']
    },
    {
      name: 'Cable Chest Press',
      equipment: 'Cable Machine',
      muscle: 'Chest',
      instructions: 'Stagger your stance, press handles forward, and bring them back with control.',
      tags: ['cable']
    }
  ],
  pull: [
    {
      name: 'Seated Row Machine',
      equipment: 'Seated Row Machine',
      muscle: 'Back',
      instructions: 'Keep chest against the pad, pull elbows toward ribs, and squeeze shoulder blades.',
      tags: ['machine']
    },
    {
      name: 'Lat Pulldown',
      equipment: 'Lat Pulldown Machine',
      muscle: 'Back',
      instructions: 'Hold the bar slightly wider than shoulders, pull toward collarbones, and control back up.',
      tags: ['machine']
    },
    {
      name: 'Chest-Supported Row',
      equipment: 'Bench + Dumbbells',
      muscle: 'Back',
      instructions: 'Lie on an incline bench, row bells toward hips, and lower slowly.',
      tags: ['dumbbell']
    }
  ],
  arms: [
    {
      name: 'Cable Biceps Curl',
      equipment: 'Cable Machine',
      muscle: 'Arms',
      instructions: 'Stand tall, curl the bar toward shoulders, and lower with control.',
      tags: ['cable']
    },
    {
      name: 'Cable Triceps Pushdown',
      equipment: 'Cable Machine',
      muscle: 'Arms',
      instructions: 'Keep elbows close, press rope down, and pause briefly at the bottom.',
      tags: ['cable']
    },
    {
      name: 'Dumbbell Curl',
      equipment: 'Dumbbells',
      muscle: 'Arms',
      instructions: 'Curl bells with soft grip and lower for a steady three-count.',
      tags: ['dumbbell']
    }
  ],
  core: [
    {
      name: 'Dead Bug',
      equipment: 'Bodyweight',
      muscle: 'Core',
      instructions: 'Lie on your back, lower opposite arm and leg slowly, and exhale.',
      tags: ['bodyweight']
    },
    {
      name: 'Plank',
      equipment: 'Bodyweight',
      muscle: 'Core',
      instructions: 'Press forearms into the floor, keep hips level, and breathe steadily.',
      tags: ['bodyweight']
    },
    {
      name: 'Machine Crunch',
      equipment: 'Ab Machine',
      muscle: 'Core',
      instructions: 'Brace lightly, crunch forward slowly, and return with control.',
      tags: ['machine']
    }
  ]
};

const DEFAULT_GYMXIETY_CATEGORY_ORDER = ['squat', 'hinge', 'push', 'pull', 'core', 'arms'];

const GYMXIETY_GOAL_CATEGORY_ORDER = {
  Strength: ['squat', 'hinge', 'pull', 'push', 'core', 'arms'],
  Hypertrophy: ['push', 'pull', 'squat', 'arms', 'hinge', 'core'],
  'Fat Loss': ['hinge', 'squat', 'push', 'pull', 'core', 'arms'],
  'General Fitness': DEFAULT_GYMXIETY_CATEGORY_ORDER
};

const MACHINE_ACCESS_TOKENS = ['lat pulldown', 'seated row', 'pec deck', 'leg extension', 'hamstring curl', 'shoulder press', 'squat rack'];
const DUMBBELL_ACCESS_TOKENS = ['dumbbells', 'bench', 'preacher curl'];
const CABLE_ACCESS_TOKENS = ['cables', 'lat pulldown', 'seated row', 'pec deck'];

const PLAN_GOAL_CONFIGS = {
  build_muscle: {
    label: 'Build Muscle Calmly',
    repRange: { low: 8, high: 12, deloadLow: 6, deloadHigh: 8 },
    sets: { base: 3, max: 4, deload: 2 },
    progressionNotes: [
      'Week focus: learn the pattern and keep tension steady.',
      'Add one slow rep to your final set if it felt smooth.',
      'Lightly increase weight or tempo while breathing through reps.',
      'Shift attention to pauses and clean form between reps.'
    ],
    style: 'hypertrophy'
  },
  get_stronger: {
    label: 'Get Stronger Without Noise',
    repRange: { low: 5, high: 8, deloadLow: 3, deloadHigh: 5 },
    sets: { base: 4, max: 5, deload: 3 },
    progressionNotes: [
      'Dial in bar path and bracing first.',
      'Add a small plate or micro-load on your top set.',
      'Hold reps at the bottom for a second before driving up.',
      'Use the deload to reinforce the setup and breathing cues.'
    ],
    style: 'strength'
  },
  lose_fat: {
    label: 'Lose Fat With Structure',
    repRange: { low: 10, high: 15, deloadLow: 8, deloadHigh: 10 },
    sets: { base: 3, max: 4, deload: 2 },
    progressionNotes: [
      'Move steady and breathe through every rep.',
      'Add a round or squeeze the top of each move for two seconds.',
      'Shorten rest by ten seconds to nudge the heart rate.',
      'Ease back during deload and walk away feeling fresh.'
    ],
    style: 'circuit'
  },
  get_healthier: {
    label: 'Get Healthier Gently',
    repRange: { low: 8, high: 12, deloadLow: 8, deloadHigh: 10 },
    sets: { base: 2, max: 3, deload: 2 },
    progressionNotes: [
      'Focus on posture, tempo, and breathing through the ribs.',
      'Add a light pause or a single extra rep when it feels right.',
      'Mix in short walks between sets to keep calm energy.',
      'Use deload week to reinforce the basics without fatigue.'
    ],
    style: 'foundation'
  }
};

const EQUIPMENT_LABELS = {
  full_gym: 'Full Gym Access',
  dumbbells_only: 'Dumbbells + Bench',
  bodyweight_only: 'Bodyweight Only'
};

const WORKOUT_LIBRARY = {
  full_gym: [
    {
      name: 'Full-Body Foundation',
      focus: 'Leg drive, back strength, calm breathing',
      exercises: [
        { name: 'Goblet Squat', cue: 'Sit down slowly, keep heels heavy.', allowWeight: true },
        { name: 'Assisted Lat Pulldown', cue: 'Pull elbows toward ribs with control.', allowWeight: true },
        { name: 'Incline Push-up', cue: 'Lower chest to the bench, exhale up.', allowWeight: false },
        { name: 'Dumbbell Romanian Deadlift', cue: 'Hinge at hips, keep spine long.', allowWeight: true },
        { name: 'Half-Kneeling Dumbbell Press', cue: 'Stack ribs over hips.', allowWeight: true },
        { name: 'Deadbug Breathing', cue: 'Exhale hard as you lower opposite limbs.', allowWeight: false }
      ]
    },
    {
      name: 'Lower Body Grounding',
      focus: 'Quads, hamstrings, and steady heart rate',
      exercises: [
        { name: 'Leg Press', cue: 'Push through mid-foot, avoid locking knees.', allowWeight: true },
        { name: 'Walking Lunges', cue: 'Keep steps short and torso tall.', allowWeight: true },
        { name: 'Hamstring Curl', cue: 'Control the return on every rep.', allowWeight: true },
        { name: 'Bodyweight Step-down', cue: 'Tap heel and drive up softly.', allowWeight: false },
        { name: 'Calf Raise', cue: 'Pause on top, lower for three counts.', allowWeight: true },
        { name: 'Easy Treadmill Walk', cue: 'Breathe through the nose for two minutes.', allowWeight: false }
      ]
    },
    {
      name: 'Upper Body Reset',
      focus: 'Rows, presses, and posture cues',
      exercises: [
        { name: 'Seated Row', cue: 'Squeeze shoulder blades, keep chin neutral.', allowWeight: true },
        { name: 'Floor or Bench Press', cue: 'Touch lightly, press up evenly.', allowWeight: true },
        { name: 'Cable Face Pull', cue: 'Lead with elbows, pause near the face.', allowWeight: true },
        { name: 'Assisted Dip or Bench Dip', cue: 'Lower slowly, keep shoulders away from ears.', allowWeight: true },
        { name: 'Hammer Curl', cue: 'Elbows stay tucked against ribs.', allowWeight: true },
        { name: 'Triceps Rope Pressdown', cue: 'Open the rope and lock out softly.', allowWeight: true }
      ]
    },
    {
      name: 'Push + Pull Flow',
      focus: 'Balanced upper body and core',
      exercises: [
        { name: 'Incline Dumbbell Press', cue: 'Drive feet into floor, wrists stacked.', allowWeight: true },
        { name: 'Single-Arm Dumbbell Row', cue: 'Row toward hip, keep hips level.', allowWeight: true },
        { name: 'Cable Lateral Raise', cue: 'Lift to shoulder height with soft elbows.', allowWeight: true },
        { name: 'Chest Supported Row', cue: 'Let the bench hold you, move only arms.', allowWeight: true },
        { name: 'Farmer Carry', cue: 'Short steps, tall spine.', allowWeight: true },
        { name: 'Forearm Plank', cue: 'Press forearms down, squeeze glutes.', allowWeight: false }
      ]
    },
    {
      name: 'Core + Conditioning',
      focus: 'Steady cardio and trunk control',
      exercises: [
        { name: 'Bike Ride or Rower', cue: 'Stay conversational with breathing.', allowWeight: false },
        { name: 'Suitcase Carry', cue: 'One side loaded, keep ribs stacked.', allowWeight: true },
        { name: 'Tall Kneeling Press', cue: 'Glutes tight, press overhead slowly.', allowWeight: true },
        { name: 'Step-up + Knee Drive', cue: 'Focus on pushing through the lead heel.', allowWeight: true },
        { name: 'Side Plank', cue: 'Stack hips and hold for 20 seconds.', allowWeight: false },
        { name: 'Box Breathing', cue: 'Four count inhale, hold, exhale, hold.', allowWeight: false }
      ]
    }
  ],
  dumbbells_only: [
    {
      name: 'Home Full-Body A',
      focus: 'Squat hinge mix with easy core',
      exercises: [
        { name: 'Chair or Box Squat', cue: 'Tap the seat, stand tall.', allowWeight: true },
        { name: 'Single-Leg RDL Tap', cue: 'Reach long, keep hips square.', allowWeight: true },
        { name: 'Bent-Over Row', cue: 'Row toward pockets, pause on top.', allowWeight: true },
        { name: 'Floor Press', cue: 'Lower for three counts, press up smoothly.', allowWeight: true },
        { name: 'Half-Kneeling Halo', cue: 'Move bell around head slowly.', allowWeight: true },
        { name: 'Deadbug with Dumbbell Hold', cue: 'Brace core before lowering leg.', allowWeight: false }
      ]
    },
    {
      name: 'Lower Flow B',
      focus: 'Leg strength and balance',
      exercises: [
        { name: 'Goblet Squat Pulse', cue: 'Little bounce at bottom, stay tall.', allowWeight: true },
        { name: 'Reverse Lunge', cue: 'Step back gently, knee under hip.', allowWeight: true },
        { name: 'Hip Hinge Good Morning', cue: 'Push hips back, soft knees.', allowWeight: true },
        { name: 'Heel Elevated Calf Raise', cue: 'Use wall for balance, pause on top.', allowWeight: true },
        { name: 'Glute Bridge March', cue: 'Squeeze glutes as each knee lifts.', allowWeight: false },
        { name: '90/90 Breathing', cue: 'Feet on wall, exhale slowly.', allowWeight: false }
      ]
    },
    {
      name: 'Upper Ease',
      focus: 'Press, row, and arm confidence',
      exercises: [
        { name: 'Standing Overhead Press', cue: 'Ribs down, push through floor.', allowWeight: true },
        { name: 'Supported Single-Arm Row', cue: 'Pull to ribs, pause, lower slow.', allowWeight: true },
        { name: 'Incline Chest Fly (on pillows)', cue: 'Soft elbows, hug the air.', allowWeight: true },
        { name: 'Hammer Curl + Press', cue: 'Curl then press with control.', allowWeight: true },
        { name: 'Skull Crusher on Floor', cue: 'Lower to ears, extend up.', allowWeight: true },
        { name: 'Bird Dog Reach', cue: 'Lengthen from fingers to heel.', allowWeight: false }
      ]
    },
    {
      name: 'Conditioning Circuit',
      focus: 'Heart rate without chaos',
      exercises: [
        { name: 'Suitcase Carry March', cue: 'March slowly, stay tall.', allowWeight: true },
        { name: 'Alternating Step-back Lunge', cue: 'Light tap, drive forward.', allowWeight: true },
        { name: 'Renegade Row (knees down)', cue: 'Keep hips steady.', allowWeight: true },
        { name: 'Thoracic Open Book', cue: 'Rotate rib cage slowly.', allowWeight: false },
        { name: 'Tempo Glute Bridge', cue: 'Pause on top, breathe out.', allowWeight: false },
        { name: 'Slow Mountain Climbers', cue: 'Exhale as knee comes in.', allowWeight: false }
      ]
    },
    {
      name: 'Core + Mobility',
      focus: 'Trunk, shoulders, and breath work',
      exercises: [
        { name: 'Tall Kneeling Windmill', cue: 'Reach overhead, hinge sideways.', allowWeight: true },
        { name: 'Supported Hip Airplane', cue: 'Hold onto chair, rotate hip.', allowWeight: false },
        { name: 'Prone T Raise', cue: 'Thumbs up, squeeze blades.', allowWeight: false },
        { name: 'Deep Squat Hold with Pulse', cue: 'Elbows inside knees, sway gently.', allowWeight: false },
        { name: 'Bear Plank Shoulder Tap', cue: 'Knees hover low, tap opposite shoulder.', allowWeight: false },
        { name: 'Box Breathing on Floor', cue: 'Four-count inhale and exhale.', allowWeight: false }
      ]
    }
  ],
  bodyweight_only: [
    {
      name: 'Bodyweight Day A',
      focus: 'Full-body pattern practice',
      exercises: [
        { name: 'Chair Squat', cue: 'Sit to the chair, stand up softly.', allowWeight: false },
        { name: 'Wall Push-up', cue: 'Step feet back, keep hips aligned.', allowWeight: false },
        { name: 'Glute Bridge', cue: 'Drive through heels, pause on top.', allowWeight: false },
        { name: 'Reverse Lunge Tap', cue: 'Light touch with back knee.', allowWeight: false },
        { name: 'Forearm Plank', cue: 'Press forearms down, breathe low.', allowWeight: false },
        { name: 'Cat-Cow Breath', cue: 'Match breath with spine movement.', allowWeight: false }
      ]
    },
    {
      name: 'Bodyweight Day B',
      focus: 'Push, pull, and balance',
      exercises: [
        { name: 'Incline Table Push-up', cue: 'Keep ribs tucked as you press.', allowWeight: false },
        { name: 'Doorway Row', cue: 'Lean back and pull chest toward frame.', allowWeight: false },
        { name: 'Split Squat Hold', cue: 'Hold low, keep front heel heavy.', allowWeight: false },
        { name: 'Hip Hinge Good Morning', cue: 'Hands on thighs, push hips back.', allowWeight: false },
        { name: 'Side-Lying Open Book', cue: 'Rotate top arm with breath.', allowWeight: false },
        { name: 'Deadbug March', cue: 'Brace core, alternate legs.', allowWeight: false }
      ]
    },
    {
      name: 'Core + Cardio Track',
      focus: 'Steady sweat without impact',
      exercises: [
        { name: 'March in Place', cue: 'Pump arms gently, breathe steady.', allowWeight: false },
        { name: 'Tall Plank Shoulder Tap', cue: 'Feet wide for balance.', allowWeight: false },
        { name: 'Lateral Step-overs', cue: 'Touch floor lightly, stay low.', allowWeight: false },
        { name: 'Bird Dog Hold', cue: 'Reach long through heel and fingertip.', allowWeight: false },
        { name: 'Glute Bridge Pulse', cue: 'Just lift an inch at the top.', allowWeight: false },
        { name: 'Seated Box Breathing', cue: '4-in, 4 hold, 4-out, 4 hold.', allowWeight: false }
      ]
    },
    {
      name: 'Mobility & Strength Blend',
      focus: 'Gentle flow with pauses',
      exercises: [
        { name: 'Quadruped Rock Back', cue: 'Hips to heels, breathe through nose.', allowWeight: false },
        { name: 'Hip Airplane Supported', cue: 'Hold chair, rotate open and closed.', allowWeight: false },
        { name: 'Wall Slide', cue: 'Glide arms up without shrugging.', allowWeight: false },
        { name: 'Single-Leg Balance Reach', cue: 'Toe taps three directions.', allowWeight: false },
        { name: 'Prone Swimmer', cue: 'Lift arms slightly off floor.', allowWeight: false },
        { name: 'Supine Twist', cue: 'Drop knees side to side slowly.', allowWeight: false }
      ]
    },
    {
      name: 'Recovery Walk Prep',
      focus: 'Breath-led walking warm up',
      exercises: [
        { name: 'Calf Wall Stretch', cue: 'Exhale as you lean forward.', allowWeight: false },
        { name: 'Ankle Circles', cue: 'Slow 10 circles each way.', allowWeight: false },
        { name: 'Standing Hip CARs', cue: 'Hold support, draw big circles.', allowWeight: false },
        { name: 'Shoulder Blade Squeeze', cue: 'Pinch shoulder blades for two seconds.', allowWeight: false },
        { name: 'Marching Bridge', cue: 'Lift one knee at a time, hips high.', allowWeight: false },
        { name: 'Box Breathing', cue: 'Inhale, hold, exhale, hold for four counts.', allowWeight: false }
      ]
    }
  ]
};

function isWeightedEquipment(label = '') {
  const normalized = label.toLowerCase();
  return !normalized.includes('bodyweight');
}

function buildFallbackRow(entry, index, options = {}) {
  const gymxietyMode = Boolean(options.gymxietyMode);
  const equipmentTokens = Array.isArray(entry.equipment)
    ? entry.equipment
    : expandEquipmentTokens((entry.equipment || '').toString());
  const pseudoExercise = {
    name: entry.name,
    movement_pattern: entry.movement_pattern || 'General',
    equipment: equipmentTokens.length ? equipmentTokens : ['Bodyweight'],
    muscle_group: entry.muscle || 'Full Body'
  };
  let repRange = gymxietyMode ? GYMXIETY_REP_RANGE : DEFAULT_FALLBACK_REP_RANGE;
  let sets = gymxietyMode ? GYMXIETY_SETS : DEFAULT_FALLBACK_SETS;
  const rest = gymxietyMode ? DEFAULT_GYMXIETY_REST : DEFAULT_FALLBACK_REST;
  let recommendedWeight = gymxietyMode ? GYMXIETY_WEIGHT_TEXT : 'Choose a load that feels steady and light.';
  const supportiveCues = gymxietyMode ? DEFAULT_GYMXIETY_CUES : [];
  let usesWeight = isWeightedEquipment(entry.equipment || '');
  if (shouldUseTimeBasedPrescription(pseudoExercise)) {
    repRange = getTimeBasedPrescription(pseudoExercise, { gymxietyMode });
    recommendedWeight = GYMXIETY_WEIGHT_TEXT;
    usesWeight = false;
  }
  return {
    id: index,
    exercise: entry.name,
    name: entry.name,
    baseExercise: entry.name,
    equipment: entry.equipment,
    muscle: entry.muscle,
    repRange,
    reps: repRange,
    sets,
    recommendedWeight,
    description: entry.instructions,
    instructions: entry.instructions,
    video: null,
    usesWeight,
    exerciseKey: entry.name,
    confidence: 'Moderate',
    supportiveCues,
    confidenceAlternative: null,
    confidenceApplied: false,
    rest
  };
}

function finalizePlanPayload(planRows, summary, meta = {}) {
  const timestamp = meta.timestamp || new Date().toISOString();
  const payload = {
    planRows,
    exercises: planRows,
    summary,
    gymxietyMode: Boolean(meta.gymxietyMode),
    goal: meta.goal || 'General Fitness',
    timestamp
  };
  if (meta.planMeta) {
    payload.meta = meta.planMeta;
  }
  return payload;
}

function buildDefaultFallbackPlan(options = {}) {
  const { goal = 'General Fitness', gymxietyMode = false, planMeta = null } = options;
  const planRows = DEFAULT_BEGINNER_WORKOUT.map((exercise, index) => buildFallbackRow(exercise, index, { gymxietyMode }));
  const focus = Array.from(new Set(planRows.map(row => row.muscle))).slice(0, 2);
  const summary = {
    movementCount: planRows.length,
    focus,
    repRange: gymxietyMode ? GYMXIETY_REP_RANGE : DEFAULT_FALLBACK_REP_RANGE,
    setsPerExercise: gymxietyMode ? GYMXIETY_SETS : DEFAULT_FALLBACK_SETS,
    mode: gymxietyMode ? 'Gymxiety' : 'Beginner Reset'
  };
  return finalizePlanPayload(planRows, summary, { goal, gymxietyMode, planMeta });
}

function ensurePlanPayload(plan, options = {}) {
  const safeRows = Array.isArray(plan?.planRows) ? plan.planRows.filter(Boolean) : [];
  if (!safeRows.length) {
    return buildDefaultFallbackPlan(options);
  }
  const exercises = Array.isArray(plan.exercises) && plan.exercises.length
    ? plan.exercises.filter(Boolean)
    : safeRows;
  return {
    ...plan,
    planRows: safeRows,
    exercises,
    goal: plan?.goal || options.goal || 'General Fitness',
    gymxietyMode: typeof plan?.gymxietyMode === 'boolean' ? plan.gymxietyMode : Boolean(options.gymxietyMode),
    timestamp: plan?.timestamp || new Date().toISOString(),
    meta: plan?.meta || options.planMeta
  };
}

export function getMuscleGroups() {
  return CURATED_MUSCLE_GROUPS.length ? CURATED_MUSCLE_GROUPS : MUSCLE_GROUPS;
}

export function getEquipmentList() {
  return CURATED_EQUIPMENT_LIST.length ? CURATED_EQUIPMENT_LIST : EQUIPMENT_LIST;
}

function getAdjustedPercent(basePercent, exerciseName) {
  const state = getState();
  const offset = state.planAdjustments[exerciseName] || 0;
  return clamp(basePercent + offset, PERCENT_MIN, PERCENT_MAX);
}

function applyRepDeltaToRange(repRange, exerciseName) {
  const state = getState();
  const delta = state.repAdjustments[exerciseName] || 0;
  if (!delta) {
    return repRange;
  }
  const match = repRange.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) {
    return repRange;
  }
  const low = Number.parseInt(match[1], 10);
  const high = Number.parseInt(match[2], 10);
  if (Number.isNaN(low) || Number.isNaN(high)) {
    return repRange;
  }
  const newLow = Math.max(1, low + delta);
  const newHigh = Math.max(newLow + 1, high + delta);
  return repRange.replace(match[0], `${newLow}-${newHigh}`);
}

function updatePercentAdjustment(exerciseName, delta) {
  setState(prev => {
    prev.planAdjustments = { ...prev.planAdjustments };
    const current = prev.planAdjustments[exerciseName] || 0;
    const next = clamp(current + delta, PERCENT_OFFSET_MIN, PERCENT_OFFSET_MAX);
    prev.planAdjustments[exerciseName] = next;
    return prev;
  });
}

function updateRepAdjustment(exerciseName, delta) {
  setState(prev => {
    prev.repAdjustments = { ...prev.repAdjustments };
    const current = prev.repAdjustments[exerciseName] || 0;
    const next = clamp(current + delta, REP_DELTA_MIN, REP_DELTA_MAX);
    prev.repAdjustments[exerciseName] = next;
    return prev;
  });
}

function buildConfidenceAlternative(exercise, overrides = {}) {
  if (!exercise) {
    return null;
  }
  const fallback = {
    equipment: Array.isArray(exercise.equipment) ? exercise.equipment.join(', ') : exercise.equipment,
    muscle: exercise.muscle_group,
    description: exercise.howto,
    supportiveCues: DEFAULT_GYMXIETY_CUES
  };
  const details = getConfidenceAlternativeDetails(exercise.name, fallback);
  if (!details) {
    return null;
  }
  return {
    exercise: details.exercise,
    equipment: details.equipment,
    muscle: details.muscle,
    description: details.description,
    sets: overrides.sets || '2 sets',
    repRange: overrides.repRange || '8-12 gentle reps',
    confidence: details.confidence || 'Easy',
    source: exercise.name,
    supportiveCues: details.supportiveCues || DEFAULT_GYMXIETY_CUES
  };
}

const EQUIPMENT_SELECTION_SYNONYMS = {
  'bodyweight only': ['bodyweight']
};

function normalizeEquipmentSelection(list = []) {
  if (!Array.isArray(list)) {
    return new Set();
  }
  const normalized = new Set();
  list
    .map(item => (item || '').toString().trim().toLowerCase())
    .filter(Boolean)
    .forEach(value => {
      normalized.add(value);
      const synonyms = EQUIPMENT_SELECTION_SYNONYMS[value];
      if (Array.isArray(synonyms)) {
        synonyms.forEach(alias => normalized.add(alias));
      }
    });
  return normalized;
}

function hasAnyToken(equipmentSet, tokens = []) {
  if (!equipmentSet || !equipmentSet.size) {
    return false;
  }
  return tokens.some(token => equipmentSet.has(token));
}

function userHasMachineAccess(equipmentSet) {
  if (!equipmentSet || !equipmentSet.size) {
    return true;
  }
  return hasAnyToken(equipmentSet, MACHINE_ACCESS_TOKENS);
}

function userHasDumbbellAccess(equipmentSet) {
  if (!equipmentSet || !equipmentSet.size) {
    return true;
  }
  return hasAnyToken(equipmentSet, DUMBBELL_ACCESS_TOKENS);
}

function userHasCableAccess(equipmentSet) {
  if (!equipmentSet || !equipmentSet.size) {
    return true;
  }
  return hasAnyToken(equipmentSet, CABLE_ACCESS_TOKENS);
}

function userHasSmithAccess(equipmentSet) {
  return userHasMachineAccess(equipmentSet) || (equipmentSet && equipmentSet.has('squat rack'));
}

function matchesGymxietyEquipmentTags(entry, equipmentSet) {
  if (!entry?.tags || !entry.tags.length) {
    return true;
  }
  if (!equipmentSet || !equipmentSet.size) {
    return true;
  }
  return entry.tags.every(tag => {
    switch (tag) {
      case 'machine':
        return userHasMachineAccess(equipmentSet);
      case 'cable':
        return userHasCableAccess(equipmentSet);
      case 'dumbbell':
        return userHasDumbbellAccess(equipmentSet);
      case 'smith':
        return userHasSmithAccess(equipmentSet);
      case 'bodyweight':
        return true;
      default:
        return true;
    }
  });
}

function formatEquipmentLabel(value = '') {
  return value || 'Bodyweight';
}

function mapGymxietyCategoryToMuscle(category) {
  switch (category) {
    case 'squat':
      return 'Legs';
    case 'hinge':
      return 'Glutes';
    case 'push':
      return 'Chest';
    case 'pull':
      return 'Back';
    case 'arms':
      return 'Arms';
    case 'core':
      return 'Core';
    default:
      return 'Full Body';
  }
}

function mapGymxietyCategoryToPattern(category) {
  switch (category) {
    case 'squat':
      return 'Squat';
    case 'hinge':
      return 'Hinge';
    case 'push':
      return 'Horizontal Push';
    case 'pull':
      return 'Horizontal Pull';
    case 'arms':
      return 'Arms';
    case 'core':
      return 'Core';
    default:
      return 'General';
  }
}

function resolveGymxietyCategoryOrder(goal = '') {
  if (!goal) {
    return DEFAULT_GYMXIETY_CATEGORY_ORDER;
  }
  const normalized = goal.trim();
  return GYMXIETY_GOAL_CATEGORY_ORDER[normalized] || DEFAULT_GYMXIETY_CATEGORY_ORDER;
}

function pickGymxietyExercise(category, equipmentSet, usedNames) {
  const pool = GYMXIETY_CATEGORY_POOLS[category] || [];
  if (!pool.length) {
    return null;
  }
  const available = pool.find(entry => !usedNames.has(entry.name) && matchesGymxietyEquipmentTags(entry, equipmentSet));
  if (available) {
    usedNames.add(available.name);
    return { ...available, category };
  }
  const fallback = pool.find(entry => !usedNames.has(entry.name));
  if (fallback) {
    usedNames.add(fallback.name);
    return { ...fallback, category };
  }
  return { ...pool[0], category };
}

function buildGymxietySelections(goal, equipmentList = []) {
  const equipmentSet = normalizeEquipmentSelection(equipmentList);
  const order = resolveGymxietyCategoryOrder(goal);
  const selections = [];
  const usedNames = new Set();

  order.forEach(category => {
    if (selections.length >= MAX_GYMXIETY_EXERCISES) {
      return;
    }
    const choice = pickGymxietyExercise(category, equipmentSet, usedNames);
    if (choice) {
      selections.push(choice);
    }
  });

  let cursor = 0;
  while (selections.length < MIN_GYMXIETY_EXERCISES && cursor < DEFAULT_GYMXIETY_CATEGORY_ORDER.length) {
    const fallbackCategory = DEFAULT_GYMXIETY_CATEGORY_ORDER[cursor++];
    const choice = pickGymxietyExercise(fallbackCategory, equipmentSet, usedNames);
    if (choice) {
      selections.push(choice);
    }
  }

  if (!selections.length) {
    DEFAULT_GYMXIETY_CATEGORY_ORDER.forEach(category => {
      const choice = pickGymxietyExercise(category, equipmentSet, usedNames);
      if (choice) {
        selections.push(choice);
      }
    });
  }

  return selections.slice(0, MAX_GYMXIETY_EXERCISES);
}

function buildGymxietyPlanRow(entry, index) {
  if (!entry) {
    return null;
  }
  const fallback = {
    equipment: formatEquipmentLabel(entry.equipment),
    muscle: entry.muscle || mapGymxietyCategoryToMuscle(entry.category),
    description: entry.instructions || DEFAULT_GYMXIETY_DESCRIPTION,
    supportiveCues: DEFAULT_GYMXIETY_CUES
  };
  const alternative = confidenceAlternativeMap[entry.name]
    ? getConfidenceAlternativeDetails(entry.name, fallback)
    : null;
  const exerciseName = alternative?.exercise || entry.name;
  const description = alternative?.description || fallback.description;
  const equipment = alternative?.equipment || fallback.equipment;
  const muscle = alternative?.muscle || fallback.muscle;
  const supportiveCues = alternative?.supportiveCues || fallback.supportiveCues;
  const confidence = alternative ? 'Easy' : 'Moderate';

  const row = {
    id: index,
    exercise: exerciseName,
    name: exerciseName,
    baseExercise: entry.name,
    equipment,
    muscle,
    repRange: GYMXIETY_REP_RANGE,
    reps: '8-12 reps',
    sets: GYMXIETY_SETS,
    recommendedWeight: GYMXIETY_WEIGHT_TEXT,
    description,
    instructions: description,
    video: null,
    usesWeight: false,
    exerciseKey: entry.name,
    confidence,
    supportiveCues,
    confidenceAlternative: null,
    confidenceApplied: Boolean(alternative),
    rest: DEFAULT_GYMXIETY_REST
  };
  const equipmentTokens = expandEquipmentTokens((equipment || '').toString());
  const pseudoExercise = {
    name: exerciseName,
    movement_pattern: mapGymxietyCategoryToPattern(entry.category),
    equipment: equipmentTokens.length ? equipmentTokens : ['Bodyweight'],
    muscle_group: muscle
  };
  if (shouldUseTimeBasedPrescription(pseudoExercise)) {
    const durationRange = getTimeBasedPrescription(pseudoExercise, { gymxietyMode: true });
    row.repRange = durationRange;
    row.reps = durationRange;
  }
  return row;
}

function buildGymxietyPlannerPlan({ goal, equipmentList }) {
  const selections = buildGymxietySelections(goal, equipmentList);
  const planRows = selections.map((entry, index) => buildGymxietyPlanRow(entry, index)).filter(Boolean);
  if (!planRows.length) {
    return buildDefaultFallbackPlan({ goal, gymxietyMode: true });
  }
  const focus = Array.from(new Set(planRows.map(row => row.muscle))).slice(0, 2);
  const summary = {
    movementCount: planRows.length,
    focus,
    repRange: GYMXIETY_REP_RANGE,
    setsPerExercise: GYMXIETY_SETS,
    mode: 'Gymxiety'
  };
  return finalizePlanPayload(planRows, summary, { goal, gymxietyMode: true });
}

function buildStandardPlannerPlan(options = {}) {
  const {
    selectedMuscles = [],
    selectedEquipment = [],
    exercisesPerGroup = 3,
    repRange = '12-20 reps, light/moderate weight',
    setsPerExercise = '3 sets',
    percent = 70,
    noMax = false,
    benchMax = 0,
    squatMax = 0,
    deadliftMax = 0,
    mode = 'dieting',
    goal = 'General Fitness'
  } = options;

  const equipmentSet = normalizeEquipmentSelection(selectedEquipment);
  const requestedMuscles = Array.isArray(selectedMuscles) ? selectedMuscles.slice() : [];
  const requestedEquipment = Array.isArray(selectedEquipment) ? selectedEquipment.slice() : [];
  const preferGymxietySafe = Boolean(options.preferGymxietySafe);
  const allowedIntimidationLevels = resolveAllowedIntimidationLevels(options.intimidationCap);
  const planMeta = {
    requestedMuscles,
    requestedEquipment,
    requestedEquipmentNormalized: Array.from(equipmentSet),
    matchCount: 0,
    missingMuscles: [],
    matchedMuscles: [],
    usedFallback: false,
    filters: {
      preferGymxietySafe,
      intimidationCap: options.intimidationCap || null
    }
  };

  if (!requestedMuscles.length) {
    planMeta.usedFallback = true;
    planMeta.errorReason = 'missing-muscles';
    return (
      buildGoalDrivenFallbackPlan({ goal, gymxietyMode: false, planMeta }) ||
      buildDefaultFallbackPlan({ goal, gymxietyMode: false, planMeta })
    );
  }

  let plan = [];
  const muscleMatchCounts = {};
  const usedExerciseNames = new Set();
  requestedMuscles.forEach(muscle => {
    const matches = collectMatchesForMuscle(muscle, {
      equipmentSet,
      preferGymxietySafe,
      allowedIntimidationLevels
    });
    const shuffled = shuffleArray(matches);
    muscleMatchCounts[muscle] = matches.length;
    if (!shuffled.length) {
      return;
    }
    let pool = shuffled.filter(entry => !usedExerciseNames.has(entry.name));
    if (!pool.length && plan.length < MIN_STANDARD_MOVEMENTS) {
      pool = shuffled;
    }
    if (!pool.length) {
      return;
    }
    const picks = pool.slice(0, exercisesPerGroup);
    picks.forEach(entry => usedExerciseNames.add(entry.name));
    plan = plan.concat(picks);
  });

  planMeta.matchCount = Object.values(muscleMatchCounts).reduce((sum, count = 0) => sum + count, 0);
  planMeta.missingMuscles = requestedMuscles.filter(muscle => (muscleMatchCounts[muscle] || 0) === 0);
  planMeta.matchedMuscles = requestedMuscles.filter(muscle => (muscleMatchCounts[muscle] || 0) > 0);

  if (!plan.length) {
    const relaxedTargets = requestedMuscles.length
      ? requestedMuscles
      : GOAL_MUSCLE_FALLBACKS[goal] || GOAL_MUSCLE_FALLBACKS['General Fitness'];
    const relaxedUsed = new Set();
    relaxedTargets.forEach(muscle => {
      const matches = collectMatchesForMuscle(muscle, {
        equipmentSet: null,
        preferGymxietySafe: false,
        allowedIntimidationLevels: null
      });
      if (!matches.length) {
        return;
      }
      const pick = matches.find(entry => !relaxedUsed.has(entry.name)) || matches[0];
      if (pick) {
        relaxedUsed.add(pick.name);
        plan.push(pick);
      }
    });
    if (plan.length) {
      planMeta.relaxedFilters = true;
    }
  }

  if (!plan.length) {
    planMeta.usedFallback = true;
    planMeta.errorReason = planMeta.missingMuscles.length ? 'no-matches' : 'missing-muscles';
    return (
      buildGoalDrivenFallbackPlan({ goal, gymxietyMode: false, planMeta, preferredMuscles: requestedMuscles }) ||
      buildDefaultFallbackPlan({ goal, gymxietyMode: false, planMeta })
    );
  }

  if (plan.length >= MIN_STANDARD_MOVEMENTS) {
    const targetCount = Math.min(plan.length, MAX_STANDARD_MOVEMENTS);
    if (plan.length > targetCount) {
      plan = shuffleArray(plan).slice(0, targetCount);
    }
  }

  const planRows = plan
    .map((exercise, index) =>
      mapExerciseToPlanRow(exercise, index, {
        percent: getAdjustedPercent(percent, exercise.name),
        benchMax,
        squatMax,
        deadliftMax,
        noMax,
        repRange,
        setsPerExercise,
        gymxietyMode: false
      })
    )
    .filter(Boolean);

  if (!planRows.length) {
    planMeta.usedFallback = true;
    planMeta.errorReason = 'no-matches';
    return buildDefaultFallbackPlan({ goal, gymxietyMode: false, planMeta });
  }

  const focus = planRows.length
    ? Array.from(new Set(planRows.map(row => row.muscle))).slice(0, 2)
    : selectedMuscles.slice(0, 2);
  const summary = {
    movementCount: planRows.length || 0,
    focus: focus.length ? focus : ['Full Body'],
    repRange,
    setsPerExercise,
    mode: mode === 'bulking' ? 'Bulking' : 'Dieting'
  };

  return finalizePlanPayload(planRows, summary, { goal, gymxietyMode: false, planMeta });
}

export function generateWorkout(goal, equipment = [], gymxietyMode = false, extraOptions = {}) {
  const normalizedGoal = typeof goal === 'string' && goal.trim() ? goal.trim() : 'General Fitness';
  const normalizedEquipment = Array.isArray(equipment) ? equipment : [equipment].filter(Boolean);
  try {
    const plan = gymxietyMode
      ? buildGymxietyPlannerPlan({ goal: normalizedGoal, equipmentList: normalizedEquipment })
      : buildStandardPlannerPlan({
          ...extraOptions,
          goal: normalizedGoal,
          selectedEquipment: extraOptions.selectedEquipment || normalizedEquipment
        });
    return ensurePlanPayload(plan, { goal: normalizedGoal, gymxietyMode });
  } catch (error) {
    console.warn('generateWorkout fallback applied', error);
    return buildDefaultFallbackPlan({ goal: normalizedGoal, gymxietyMode });
  }
}

function calculateStreak(workouts) {
  const days = [...new Set(workouts.map(normalizeDay))].sort((a, b) => b - a);
  if (!days.length) {
    return 0;
  }
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === days[i - 1] - MS_PER_DAY) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function calculateWorkoutStats() {
  const state = getState();
  return {
    total: state.workouts.length,
    streak: calculateStreak(state.workouts)
  };
}

export function getWeeklyChartHeights() {
  const state = getState();
  const heights = [];
  const today = new Date();
  for (let offset = 6; offset >= 0; offset--) {
    const target = new Date(today.getTime() - offset * MS_PER_DAY);
    target.setHours(0, 0, 0, 0);
    const count = state.workouts.filter(entry => normalizeDay(entry) === target.getTime()).length;
    const normalized = count === 0 ? 6 : Math.min(100, count * 30 + 10);
    heights.push(normalized);
  }
  return heights;
}

export function recordWorkoutCompletion(timestamp = new Date()) {
  setState(prev => {
    const workouts = [new Date(timestamp).toISOString(), ...prev.workouts];
    if (workouts.length > 365) {
      workouts.length = 365;
    }
    prev.workouts = workouts;
    const estimatedWeek = Math.ceil(workouts.length / 3);
    prev.program.currentWeek = Math.min(prev.program.totalWeeks, Math.max(prev.program.currentWeek, estimatedWeek));
    return prev;
  });
}

function getRecommendedWeight(exercise, benchMax, squatMax, deadliftMax, percent, noMax) {
  if (noMax) {
    return 'N/A';
  }
  const name = exercise.name.toLowerCase();
  if (name.includes('bench')) {
    return benchMax ? `${Math.round((benchMax * percent) / 100)} lbs` : 'N/A';
  }
  if (name.includes('squat')) {
    return squatMax ? `${Math.round((squatMax * percent) / 100)} lbs` : 'N/A';
  }
  if (name.includes('deadlift')) {
    return deadliftMax ? `${Math.round((deadliftMax * percent) / 100)} lbs` : 'N/A';
  }
  return 'Bodyweight or moderate';
}

function resolveGoalType(profile = {}) {
  const direct = (profile.goalType || '').toLowerCase();
  if (PLAN_GOAL_CONFIGS[direct]) {
    return direct;
  }
  const text = (profile.goal || '').toLowerCase();
  if (text.includes('strong')) {
    return 'get_stronger';
  }
  if (text.includes('fat') || text.includes('lean') || text.includes('cut')) {
    return 'lose_fat';
  }
  if (text.includes('health') || text.includes('energy')) {
    return 'get_healthier';
  }
  return 'build_muscle';
}

function resolveEquipmentKey(profile = {}) {
  const direct = (profile.equipmentAccess || '').toLowerCase();
  if (direct.includes('body')) {
    return 'bodyweight_only';
  }
  if (direct.includes('dumb') || direct.includes('kettlebell')) {
    return 'dumbbells_only';
  }
  if (direct.includes('full') || direct.includes('gym')) {
    return 'full_gym';
  }
  const text = (profile.equipment || '').toLowerCase();
  if (text.includes('body')) {
    return 'bodyweight_only';
  }
  if (text.includes('dumb')) {
    return 'dumbbells_only';
  }
  return 'full_gym';
}

function resolveExperienceLevel(profile = {}) {
  const direct = (profile.experienceLevel || '').toLowerCase();
  if (direct.includes('inter')) {
    return 'intermediate';
  }
  return 'beginner';
}

function resolveDaysPerWeek(profile = {}) {
  const raw = Number.parseInt(profile.daysPerWeek, 10);
  if (Number.isFinite(raw)) {
    return clamp(raw, 2, 5);
  }
  const text = (profile.schedulePreference || '').match(/(\d)/);
  if (text && text[1]) {
    return clamp(Number.parseInt(text[1], 10), 2, 5);
  }
  return 3;
}

function determinePlanLength(daysPerWeek, experienceLevel) {
  if (daysPerWeek <= 2) {
    return 4;
  }
  if (daysPerWeek === 3) {
    return 6;
  }
  return experienceLevel === 'intermediate' ? 8 : 6;
}

function buildSetRep(goalConfig, weekNumber, isDeload) {
  if (!goalConfig) {
    return { sets: 3, reps: '8-10' };
  }
  if (isDeload) {
    return {
      sets: goalConfig.sets.deload,
      reps: `${goalConfig.repRange.deloadLow}-${goalConfig.repRange.deloadHigh}`
    };
  }
  const progressionSteps = Math.floor((weekNumber - 1) / 2);
  const sets = Math.min(goalConfig.sets.max, goalConfig.sets.base + progressionSteps);
  const low = goalConfig.repRange.low + progressionSteps;
  const high = goalConfig.repRange.high + progressionSteps;
  return {
    sets,
    reps: `${low}-${high}`
  };
}

function buildProgressionNote(goalConfig, weekNumber, isDeload) {
  if (!goalConfig) {
    return '';
  }
  if (isDeload) {
    return 'Deload focus: keep reps smooth, lighten load, and walk away fresh.';
  }
  const notes = goalConfig.progressionNotes || [];
  if (!notes.length) {
    return 'Add a small rep or slow the tempo this week.';
  }
  return notes[(weekNumber - 1) % notes.length];
}

export function generateStructuredPlan(profile = {}) {
  const goalKey = resolveGoalType(profile);
  const equipmentKey = resolveEquipmentKey(profile);
  const experienceLevel = resolveExperienceLevel(profile);
  const daysPerWeek = resolveDaysPerWeek(profile);
  const goalConfig = PLAN_GOAL_CONFIGS[goalKey] || PLAN_GOAL_CONFIGS.build_muscle;
  const templates = WORKOUT_LIBRARY[equipmentKey] || WORKOUT_LIBRARY.full_gym;
  const planLengthRaw = determinePlanLength(daysPerWeek, experienceLevel);
  const planLength = clamp(planLengthRaw, 4, 8);
  const deloadWeeks = [];
  if (planLength >= 4) {
    deloadWeeks.push(4);
  }
  if (planLength >= 8) {
    deloadWeeks.push(8);
  }

  const weeks = [];
  let templateCursor = 0;
  for (let weekNumber = 1; weekNumber <= planLength; weekNumber++) {
    const isDeload = deloadWeeks.includes(weekNumber);
    const workouts = [];
    for (let dayIndex = 0; dayIndex < daysPerWeek; dayIndex++) {
      const template = templates[(templateCursor + dayIndex) % templates.length];
      const prescription = buildSetRep(goalConfig, weekNumber, isDeload);
      const exercises = template.exercises.slice(0, 6).map(ex => ({
        name: ex.name,
        cue: ex.cue,
        allowWeight: ex.allowWeight,
        sets: prescription.sets,
        reps: goalConfig.style === 'circuit' ? `${prescription.reps} pace` : prescription.reps,
        weightPlaceholder: ex.allowWeight ? 'lbs' : 'Bodyweight'
      }));
      workouts.push({
        id: `week${weekNumber}-day${dayIndex + 1}`,
        name: template.name,
        focus: template.focus,
        progression: buildProgressionNote(goalConfig, weekNumber, isDeload),
        exercises
      });
    }
    weeks.push({ weekNumber, isDeload, workouts });
    templateCursor++;
  }

  const todayWeek = weeks[0] || { workouts: [] };
  const todayWorkout = todayWeek.workouts[0] || {
    id: 'week1-day1',
    name: 'Full-Body Reset',
    focus: 'Breathing, balance, and core control',
    progression: 'Move slowly, this is a practice session.'
  };

  const upcoming = [];
  weeks.forEach((week, weekIndex) => {
    week.workouts.forEach((workout, workoutIndex) => {
      if (weekIndex === 0 && workoutIndex === 0) {
        return;
      }
      upcoming.push({ id: workout.id, label: `Week ${week.weekNumber} - ${workout.name}` });
    });
  });

  return {
    goalKey,
    goalLabel: goalConfig.label,
    equipmentKey,
    equipmentLabel: EQUIPMENT_LABELS[equipmentKey] || EQUIPMENT_LABELS.full_gym,
    experienceLevel,
    daysPerWeek,
    planLength,
    weeks,
    today: {
      id: todayWorkout.id,
      title: todayWorkout.name,
      focus: todayWorkout.focus,
      progression: todayWorkout.progression
    },
    upcoming
  };
}

export function calculateMaintenanceCalories(profile = {}) {
  const weight = Number.parseFloat(profile.weight);
  const height = Number.parseFloat(profile.height);
  const age = Number.parseFloat(profile.age);
  if (!Number.isFinite(weight) || !Number.isFinite(height) || !Number.isFinite(age)) {
    return null;
  }
  const weightKg = weight * 0.453592;
  const heightCm = height * 2.54;
  const sex = (profile.sex || '').toLowerCase();
  let sexOffset = -78;
  if (sex === 'female') {
    sexOffset = -161;
  }
  if (sex === 'male') {
    sexOffset = 5;
  }
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;
  const activityMultiplier = resolveDaysPerWeek(profile) >= 4 ? 1.45 : 1.3;
  return Math.round(bmr * activityMultiplier);
}

export function createPlannerPlan(options = {}) {
  const selectedEquipment = normalizeSelection(options.equipment);
  const selectedMuscles = normalizeSelection(options.muscles || options.muscle);
  const mode = options.mode || 'dieting';
  const percent = Number.parseFloat(options.percent) || 70;
  const noMax = Boolean(options.noMax);
  const workoutTime = Number.parseInt(options.workoutTime, 10) || 60;
  const exercisesPerGroup = workoutTime <= 45 ? 2 : 3;
  const beginnerMode = Boolean(options.beginnerMode);
  const gymxietyMode = Boolean(options.gymxietyMode);

  let benchMax = noMax ? 0 : Number.parseFloat(options.benchMax) || 0;
  let squatMax = noMax ? 0 : Number.parseFloat(options.squatMax) || 0;
  let deadliftMax = noMax ? 0 : Number.parseFloat(options.deadliftMax) || 0;

  let repRange = mode === 'bulking' ? '4-8 reps, heavy weight' : '12-20 reps, light/moderate weight';
  let setsPerExercise = mode === 'bulking' ? '4 sets' : '3 sets';
  if (gymxietyMode) {
    repRange = GYMXIETY_REP_RANGE;
    setsPerExercise = GYMXIETY_SETS;
  }

  let filteredEquipment = selectedEquipment;
  let filteredMuscles = selectedMuscles;
  if (beginnerMode) {
    filteredEquipment = filteredEquipment.filter(eq => BEGINNER_EQUIPMENT.includes(eq));
    filteredMuscles = filteredMuscles.filter(mg => BEGINNER_MUSCLES.includes(mg));
  }

  if (!filteredEquipment.length) {
    filteredEquipment = selectedEquipment;
  }
  if (!filteredMuscles.length) {
    filteredMuscles = selectedMuscles;
  }

  const inferredGoal = inferGoalFromInputs(options.goal || options.goalPreference || options.goalName, filteredMuscles, mode);

  const generationOptions = {
    selectedEquipment: filteredEquipment,
    selectedMuscles: filteredMuscles,
    exercisesPerGroup: gymxietyMode ? MIN_GYMXIETY_EXERCISES : exercisesPerGroup,
    repRange,
    setsPerExercise,
    percent,
    noMax,
    benchMax,
    squatMax,
    deadliftMax,
    mode,
    preferGymxietySafe: beginnerMode,
    intimidationCap: beginnerMode ? 'moderate' : null
  };

  try {
    const plan = generateWorkout(inferredGoal, filteredEquipment, gymxietyMode, generationOptions);
    return ensurePlanPayload(plan, { goal: inferredGoal, gymxietyMode });
  } catch (error) {
    console.warn('createPlannerPlan fallback applied', error);
    return buildDefaultFallbackPlan({ goal: inferredGoal, gymxietyMode });
  }
}

export function storePlannerResult(result) {
  setState(prev => {
    const rows = result?.planRows || [];
    prev.ui = { ...prev.ui, plannerResult: result };
    prev.currentPlan = rows.map(row => ({
      id: row.id,
      name: row.exercise,
      usesWeight: row.usesWeight
    }));
    return prev;
  });
}

export function handlePlanFeedback(feedback = {}) {
  const state = getState();
  if (!state.currentPlan.length) {
    return;
  }
  state.currentPlan.forEach(entry => {
    const choice = feedback[entry.id];
    if (!choice || choice === 'perfect') {
      return;
    }
    if (entry.usesWeight) {
      if (choice === 'too_easy') {
        updatePercentAdjustment(entry.name, PERCENT_STEP);
      } else if (choice === 'too_hard') {
        updatePercentAdjustment(entry.name, -PERCENT_STEP);
      }
    } else {
      if (choice === 'too_easy') {
        updateRepAdjustment(entry.name, REP_STEP);
      } else if (choice === 'too_hard') {
        updateRepAdjustment(entry.name, -REP_STEP);
      }
    }
  });
}
