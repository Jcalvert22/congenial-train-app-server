import { EXERCISES, DEFAULT_BEGINNER_WORKOUT, FALLBACK_EQUIPMENT } from '../data/exercises.js';
import { normalizeExperienceLevel, deriveComfortFromExperience } from './onboarding.js';

const GOAL_REP_SCHEMES = {
  strength: { reps: [4, 6], sets: 4, rest: 120 },
  hypertrophy: { reps: [8, 12], sets: 3, rest: 90 },
  endurance: { reps: [12, 20], sets: 3, rest: 45 },
  weight_loss: { reps: [10, 15], sets: 3, rest: 45 },
  general: { reps: [8, 12], sets: 3, rest: 60 }
};

const GOAL_TIME_SCHEMES = {
  strength: [20, 30],
  hypertrophy: [25, 40],
  endurance: [30, 60],
  weight_loss: [30, 45],
  general: [20, 40]
};

const GOAL_LABELS = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  endurance: 'Endurance',
  weight_loss: 'Weight Loss',
  general: 'General Fitness'
};

const COMFORT_LEVELS = new Set(['low', 'medium', 'high']);
const DEFAULT_COMFORT_LEVEL = 'medium';
const STABLE_EQUIPMENT_KEYWORDS = ['machine', 'smith', 'cable', 'bench', 'seated', 'leg press'];
const CHALLENGE_EQUIPMENT_KEYWORDS = ['barbell', 'dumbbell', 'kettlebell', 'single-leg', 'split squat'];

const TIME_BASED_EXERCISES = [
  'Dead Bug',
  'Mountain Climbers',
  'Plank',
  'Side Plank',
  'Bird Dog',
  'Hollow Hold',
  'Bicycle Crunches',
  'Flutter Kicks',
  'Plank on Bench',
  'Low-Impact March',
  'Treadmill Walk',
  'Bike',
  'Rower',
  'Elliptical Glide'
];

const TIME_BASED_EXERCISE_SET = new Set(TIME_BASED_EXERCISES.map(name => name.toLowerCase()));
const DEFAULT_GOAL = 'general';

function normalizeComfortLevel(value = DEFAULT_COMFORT_LEVEL) {
  const token = value.toString().trim().toLowerCase();
  return COMFORT_LEVELS.has(token) ? token : DEFAULT_COMFORT_LEVEL;
}

function getEquipmentTokens(exercise = {}) {
  if (!Array.isArray(exercise.equipment)) {
    return [];
  }
  return exercise.equipment.map(item => item.toString().trim().toLowerCase());
}

function isStableExercise(exercise) {
  const tokens = getEquipmentTokens(exercise);
  return tokens.some(token => STABLE_EQUIPMENT_KEYWORDS.some(keyword => token.includes(keyword)));
}

function isChallengingExercise(exercise) {
  const tokens = getEquipmentTokens(exercise);
  if (tokens.some(token => CHALLENGE_EQUIPMENT_KEYWORDS.some(keyword => token.includes(keyword)))) {
    return true;
  }
  const intimidation = (exercise.intimidation_level || '').toString().trim().toLowerCase();
  return intimidation === 'high';
}

function scoreExerciseForComfort(exercise, comfortLevel) {
  const intimidation = (exercise.intimidation_level || '').toString().trim().toLowerCase();
  const stable = isStableExercise(exercise);
  const challenging = isChallengingExercise(exercise);
  let score = 0;
  if (comfortLevel === 'low') {
    if (stable) {
      score += 3;
    }
    if (exercise.gymxiety_safe) {
      score += 2;
    }
    if (intimidation === 'low') {
      score += 1;
    }
    if (challenging) {
      score -= 2;
    }
  } else if (comfortLevel === 'high') {
    if (challenging) {
      score += 3;
    }
    if (!stable) {
      score += 1;
    }
    if (exercise.gymxiety_safe) {
      score -= 1;
    }
  }
  return score;
}

function prioritizeComfort(list = [], comfortLevel = DEFAULT_COMFORT_LEVEL) {
  if (!list.length || comfortLevel === 'medium') {
    return list;
  }
  const sorted = [...list].sort((a, b) => scoreExerciseForComfort(b, comfortLevel) - scoreExerciseForComfort(a, comfortLevel));
  if (comfortLevel === 'low') {
    const nonHigh = sorted.filter(item => (item.intimidation_level || '').toString().trim().toLowerCase() !== 'high');
    const high = sorted.filter(item => (item.intimidation_level || '').toString().trim().toLowerCase() === 'high');
    return nonHigh.concat(high.filter(item => !nonHigh.includes(item)));
  }
  return sorted;
}

// Extends prioritizeComfort with explicit barbell placement based on confidence.
// LOW  → barbell exercises move to the back of the pool.
// HIGH → barbell/compound exercises move to the front.
// MEDIUM → defers entirely to existing comfort scoring.
function applyConfidenceDifficultyBias(list = [], confidenceLevel = DEFAULT_COMFORT_LEVEL) {
  const sorted = prioritizeComfort(list, confidenceLevel);
  if (confidenceLevel === 'low') {
    const nonBarbell = sorted.filter(ex => !getEquipmentTokens(ex).some(t => t.includes('barbell')));
    const barbell = sorted.filter(ex => getEquipmentTokens(ex).some(t => t.includes('barbell')));
    return nonBarbell.concat(barbell);
  }
  if (confidenceLevel === 'high') {
    const barbell = sorted.filter(ex => getEquipmentTokens(ex).some(t => t.includes('barbell')));
    const rest = sorted.filter(ex => !getEquipmentTokens(ex).some(t => t.includes('barbell')));
    return barbell.concat(rest);
  }
  return sorted;
}

function applyExperiencePreferences(list = [], experienceLevel = 'brand_new') {
  if (!list.length) {
    return list;
  }
  if (experienceLevel === 'brand_new') {
    const safeFirst = list.filter(item => {
      const intimidation = (item.intimidation_level || '').toString().trim().toLowerCase();
      return item.gymxiety_safe || intimidation !== 'high';
    });
    return safeFirst.length ? safeFirst : list;
  }
  if (experienceLevel === 'inconsistent') {
    const moderate = list.filter(item => (item.intimidation_level || '').toString().trim().toLowerCase() !== 'high');
    if (!moderate.length) {
      return list;
    }
    const challenging = list.filter(item => !moderate.includes(item));
    return moderate.concat(challenging);
  }
  return list;
}

function sanitizeSelection(values = []) {
  if (!Array.isArray(values)) {
    return [];
  }
  return Array.from(new Set(values.map(value => value?.toString().trim()).filter(Boolean)));
}

function normalizeGoal(goal = '') {
  const key = goal
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (GOAL_REP_SCHEMES[key]) {
    return key;
  }
  return DEFAULT_GOAL;
}

function pickMidpoint(range = []) {
  if (!Array.isArray(range) || !range.length) {
    return 0;
  }
  const [min, max = min] = range;
  return Math.round((Number(min) + Number(max)) / 2);
}

function pickRandom(range = []) {
  if (!Array.isArray(range) || !range.length) {
    return 0;
  }
  const [min, max = min] = range;
  const floor = Math.min(Number(min), Number(max));
  const ceiling = Math.max(Number(min), Number(max));
  const span = Math.max(ceiling - floor, 0);
  return Math.floor(Math.random() * (span + 1)) + floor;
}

function isTimeBasedExercise(exercise = {}) {
  const name = (exercise.name || '').toString().trim().toLowerCase();
  return name && TIME_BASED_EXERCISE_SET.has(name);
}

export function applyGoalPrescription(exercise, goalKey, gymxietyMode) {
  const repScheme = GOAL_REP_SCHEMES[goalKey] || GOAL_REP_SCHEMES[DEFAULT_GOAL];
  const timeScheme = GOAL_TIME_SCHEMES[goalKey] || GOAL_TIME_SCHEMES[DEFAULT_GOAL];
  const base = { ...exercise };
  const usesTime = isTimeBasedExercise(base);
  let sets = repScheme.sets;
  let reps = pickMidpoint(repScheme.reps);
  let rest = repScheme.rest;

  if (gymxietyMode) {
    reps = Math.max(1, Math.floor(reps * 0.8));
    sets = Math.max(2, sets - 1);
  }

  if (usesTime) {
    const seconds = gymxietyMode ? pickRandom([15, 25]) : pickMidpoint(timeScheme);
    base.time = `${seconds} sec`;
    delete base.reps;
  } else {
    base.reps = reps;
  }

  base.sets = sets;
  base.rest = `Rest ${rest} sec`;
  base.timeBased = usesTime;

  if (gymxietyMode) {
    const intimidation = (base.intimidation_level || '').toLowerCase();
    base.confidence = intimidation === 'low' ? 'Easy' : 'Moderate';
  }

  return base;
}

const FALLBACK_EQUIPMENT_SET = new Set(FALLBACK_EQUIPMENT);

const FALLBACK_POOL = EXERCISES.filter(exercise =>
  exercise.equipment.every(item => FALLBACK_EQUIPMENT_SET.has(item))
);

function preferGymxiety(list = [], gymxietyMode = false) {
  if (!gymxietyMode) {
    return list;
  }
  const safeList = list.filter(exercise => exercise.gymxiety_safe === true);
  return safeList.length ? safeList : list;
}

function shuffleArray(list = []) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickDeterministic(list = []) {
  if (!list.length) {
    return [];
  }
  const cap = Math.min(2, list.length);
  return list.slice(0, cap);
}

function normalizeNameKey(value = '') {
  return value.toString().trim().toLowerCase();
}

function buildNameSet(list = []) {
  const set = new Set();
  list.forEach(name => {
    const key = normalizeNameKey(name);
    if (key) {
      set.add(key);
    }
  });
  return set;
}

function filterDisliked(list = [], dislikedSet) {
  if (!dislikedSet || !dislikedSet.size) {
    return list;
  }
  return list.filter(item => {
    const key = normalizeNameKey(item?.name || item?.exercise);
    return key && !dislikedSet.has(key);
  });
}

// Removes exercises that appeared in the user's last workout.
// Falls back to the full list when every candidate was already used,
// so the pool never goes empty due to repeat-avoidance alone.
function filterOutLastWorkout(list = [], lastWorkoutSet) {
  if (!lastWorkoutSet || !lastWorkoutSet.size) {
    return list;
  }
  const fresh = list.filter(item => {
    const key = normalizeNameKey(item?.name || item?.exercise);
    return key && !lastWorkoutSet.has(key);
  });
  return fresh.length ? fresh : list;
}

export function generateWorkout({
  selectedEquipment = [],
  selectedMuscleGroups = [],
  selectedGoal = DEFAULT_GOAL,
  comfortLevel = DEFAULT_COMFORT_LEVEL,
  experienceLevel = 'brand_new',
  gymxietyMode = false,
  dislikedExercises = [],
  lastWorkoutExercises = []
} = {}) {
  const equipment = sanitizeSelection(selectedEquipment);
  const muscles = sanitizeSelection(selectedMuscleGroups);
  const goalKey = normalizeGoal(selectedGoal);
  const normalizedExperience = normalizeExperienceLevel(experienceLevel);
  const fallbackComfort = deriveComfortFromExperience(normalizedExperience);
  const normalizedComfort = normalizeComfortLevel(comfortLevel || fallbackComfort);
  const dislikedSet = buildNameSet(dislikedExercises);
  const lastWorkoutSet = buildNameSet(
    lastWorkoutExercises.map(ex => (typeof ex === 'string' ? ex : ex?.name || ex?.exercise || ''))
  );

  const strictPool = EXERCISES.filter(exercise =>
    exercise.equipment.length > 0 &&
    exercise.equipment.every(item => equipment.includes(item))
  ).filter(exercise => {
    const key = normalizeNameKey(exercise.name);
    return key && !dislikedSet.has(key);
  });

  const finalExercises = [];

  muscles.forEach(muscle => {
    const strictMatches = filterDisliked(
      preferGymxiety(
        strictPool.filter(exercise => exercise.muscle_group === muscle),
        gymxietyMode
      ),
      dislikedSet
    );

    let chosenPool = pickDeterministic(
      shuffleArray(applyExperiencePreferences(applyConfidenceDifficultyBias(filterOutLastWorkout(strictMatches, lastWorkoutSet), normalizedComfort), normalizedExperience))
    );

    if (!chosenPool.length) {
      const fallbackMatches = filterDisliked(
        preferGymxiety(
          FALLBACK_POOL.filter(exercise => exercise.muscle_group === muscle),
          gymxietyMode
        ),
        dislikedSet
      );
      chosenPool = pickDeterministic(
        shuffleArray(applyExperiencePreferences(applyConfidenceDifficultyBias(filterOutLastWorkout(fallbackMatches, lastWorkoutSet), normalizedComfort), normalizedExperience))
      );
    }

    if (!chosenPool.length) {
      const defaultMatches = filterDisliked(
        preferGymxiety(
          DEFAULT_BEGINNER_WORKOUT.filter(exercise => exercise.muscle_group === muscle),
          gymxietyMode
        ),
        dislikedSet
      );
      chosenPool = pickDeterministic(
        shuffleArray(applyExperiencePreferences(applyConfidenceDifficultyBias(filterOutLastWorkout(defaultMatches, lastWorkoutSet), normalizedComfort), normalizedExperience))
      );
    }

    if (!chosenPool.length) {
      const finalFallback = filterDisliked(
        preferGymxiety(DEFAULT_BEGINNER_WORKOUT, gymxietyMode),
        dislikedSet
      );
      chosenPool = pickDeterministic(
        shuffleArray(applyExperiencePreferences(applyConfidenceDifficultyBias(filterOutLastWorkout(finalFallback, lastWorkoutSet), normalizedComfort), normalizedExperience))
      );
    }

    finalExercises.push(...chosenPool);
  });

  if (!finalExercises.length) {
    const fallbackPool = filterDisliked(
      preferGymxiety(DEFAULT_BEGINNER_WORKOUT, gymxietyMode),
      dislikedSet
    );
    finalExercises.push(
      ...pickDeterministic(
        shuffleArray(applyExperiencePreferences(applyConfidenceDifficultyBias(filterOutLastWorkout(fallbackPool, lastWorkoutSet), normalizedComfort), normalizedExperience))
      )
    );
  }

  const prescribedExercises = finalExercises.map(exercise =>
    applyGoalPrescription(exercise, goalKey, gymxietyMode)
  );

  return {
    exercises: prescribedExercises,
    selectedEquipment: equipment,
    selectedMuscleGroups: muscles,
    selectedGoal: goalKey,
    selectedComfortLevel: normalizedComfort,
    comfortLevel: normalizedComfort,
    selectedExperienceLevel: normalizedExperience,
    experienceLevel: normalizedExperience,
    goal: GOAL_LABELS[goalKey] || GOAL_LABELS[DEFAULT_GOAL],
    gymxietyMode: Boolean(gymxietyMode),
    createdAt: Date.now()
  };
}
