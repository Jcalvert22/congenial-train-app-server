import { EXERCISES, DEFAULT_BEGINNER_WORKOUT, FALLBACK_EQUIPMENT } from '../data/exercises.js';

const GOAL_REP_SCHEMES = {
  strength: { reps: [4, 6], sets: 3, rest: 120 },
  hypertrophy: { reps: [8, 12], sets: 3, rest: 90 },
  endurance: { reps: [12, 20], sets: 2, rest: 45 },
  weight_loss: { reps: [10, 15], sets: 2, rest: 45 },
  general: { reps: [8, 12], sets: 2, rest: 60 }
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
    sets = Math.max(1, sets - 1);
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

export function generateWorkout({
  selectedEquipment = [],
  selectedMuscleGroups = [],
  selectedGoal = DEFAULT_GOAL,
  gymxietyMode = false,
  dislikedExercises = []
} = {}) {
  const equipment = sanitizeSelection(selectedEquipment);
  const muscles = sanitizeSelection(selectedMuscleGroups);
  const goalKey = normalizeGoal(selectedGoal);
  const dislikedSet = buildNameSet(dislikedExercises);

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

    let chosenPool = pickDeterministic(strictMatches);

    if (!chosenPool.length) {
      const fallbackMatches = filterDisliked(
        preferGymxiety(
        FALLBACK_POOL.filter(exercise => exercise.muscle_group === muscle),
        gymxietyMode
        ),
        dislikedSet
      );
      chosenPool = pickDeterministic(fallbackMatches);
    }

    if (!chosenPool.length) {
      const defaultMatches = filterDisliked(
        preferGymxiety(
        DEFAULT_BEGINNER_WORKOUT.filter(exercise => exercise.muscle_group === muscle),
        gymxietyMode
        ),
        dislikedSet
      );
      chosenPool = pickDeterministic(defaultMatches);
    }

    if (!chosenPool.length) {
      const finalFallback = filterDisliked(
        preferGymxiety(DEFAULT_BEGINNER_WORKOUT, gymxietyMode),
        dislikedSet
      );
      chosenPool = pickDeterministic(finalFallback);
    }

    finalExercises.push(...chosenPool);
  });

  if (!finalExercises.length) {
    const fallbackPool = filterDisliked(
      preferGymxiety(DEFAULT_BEGINNER_WORKOUT, gymxietyMode),
      dislikedSet
    );
    finalExercises.push(...pickDeterministic(fallbackPool));
  }

  const prescribedExercises = finalExercises.map(exercise =>
    applyGoalPrescription(exercise, goalKey, gymxietyMode)
  );

  return {
    exercises: prescribedExercises,
    selectedEquipment: equipment,
    selectedMuscleGroups: muscles,
    selectedGoal: goalKey,
     goal: GOAL_LABELS[goalKey] || GOAL_LABELS[DEFAULT_GOAL],
    gymxietyMode: Boolean(gymxietyMode),
    createdAt: Date.now()
  };
}
