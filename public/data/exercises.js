const EQUIPMENT_LABELS = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbells',
  machine: 'Machine',
  cable: 'Cables',
  bodyweight: 'Bodyweight'
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
  core: 'Core'
};

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
  return {
    ...entry,
    equipment_key: entry.equipment,
    equipment: [equipmentLabel],
    muscle_group: muscleGroup,
    movement_pattern: MOVEMENT_PATTERN_MAP[entry.primary_muscle] || 'General',
    gymxiety_safe: entry.intimidation_level !== 'high'
  };
};

export const GENERAL_EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Cables', 'Barbell'];
export const MACHINE_EQUIPMENT = ['Machine'];

export const EQUIPMENT_ETIQUETTE = {
  Barbell: 'Share the rack by stepping away during rest periods.',
  Dumbbells: 'Pick up your weights and take a few steps back from the rack.',
  Cables: 'Reset the pin and attachment so the next person can start quickly.',
  Machine: 'Adjust the seat and handles to fit you—everyone does.',
  Bodyweight: 'Give nearby lifters a little space before you start.'
};

export const GYMXIETY_ETIQUETTE = {
  Machines: "It's okay to take your time adjusting the seat.",
  Dumbbells: "Find a small space—you only need a few feet.",
  Barbell: 'You belong in the rack even if you are new.',
  Bench: "Move the bench if you need more room—it's expected."
};

export const EQUIPMENT_LIST = [...GENERAL_EQUIPMENT, ...MACHINE_EQUIPMENT];
export const FALLBACK_EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Cables'];
export const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Core'];

export const EXERCISE_LIBRARY = [
  // Chest
  {
    name: 'Barbell Bench Press',
    primary_muscle: 'chest',
    secondary_muscles: ['triceps', 'shoulders'],
    equipment: 'barbell',
    intimidation_level: 'moderate',
    description: 'A compound chest press using a barbell. Builds chest, triceps, and shoulders.',
    gymxiety_alternative: 'Dumbbell Bench Press'
  },
  {
    name: 'Barbell Incline Bench Press',
    primary_muscle: 'chest',
    secondary_muscles: ['triceps', 'shoulders'],
    equipment: 'barbell',
    intimidation_level: 'moderate',
    description: 'Incline barbell press targeting upper chest and shoulders.',
    gymxiety_alternative: 'Dumbbell Incline Press'
  },
  {
    name: 'Dumbbell Bench Press',
    primary_muscle: 'chest',
    secondary_muscles: ['triceps'],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'A beginner-friendly chest press using dumbbells.',
    gymxiety_alternative: 'Machine Chest Press'
  },
  {
    name: 'Dumbbell Incline Press',
    primary_muscle: 'chest',
    secondary_muscles: ['triceps'],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Incline dumbbell press targeting upper chest.',
    gymxiety_alternative: 'Machine Chest Press'
  },
  {
    name: 'Machine Chest Press',
    primary_muscle: 'chest',
    secondary_muscles: ['triceps'],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'A guided chest press machine ideal for beginners.',
    gymxiety_alternative: 'Dumbbell Bench Press'
  },
  {
    name: 'Pec Deck Fly',
    primary_muscle: 'chest',
    secondary_muscles: [],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Machine fly isolating the chest.',
    gymxiety_alternative: 'Cable Chest Fly'
  },
  {
    name: 'Cable Chest Fly',
    primary_muscle: 'chest',
    secondary_muscles: [],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Cable fly isolating the chest with adjustable angles.',
    gymxiety_alternative: 'Pec Deck Fly'
  },
  {
    name: 'Cable Low-to-High Fly',
    primary_muscle: 'chest',
    secondary_muscles: ['shoulders'],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Upward cable fly emphasizing upper chest.',
    gymxiety_alternative: 'Cable Chest Fly'
  },
  {
    name: 'Push-Up',
    primary_muscle: 'chest',
    secondary_muscles: ['triceps', 'shoulders'],
    equipment: 'bodyweight',
    intimidation_level: 'low',
    description: 'Bodyweight chest press movement.',
    gymxiety_alternative: 'Incline Push-Up'
  },
  {
    name: 'Incline Push-Up',
    primary_muscle: 'chest',
    secondary_muscles: ['triceps'],
    equipment: 'bodyweight',
    intimidation_level: 'low',
    description: 'Beginner-friendly push-up variation using an elevated surface.',
    gymxiety_alternative: 'Machine Chest Press'
  },

  // Back
  {
    name: 'Lat Pulldown (Wide Grip)',
    primary_muscle: 'back',
    secondary_muscles: ['biceps'],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Wide-grip pulldown targeting lats.',
    gymxiety_alternative: 'Seated Cable Row'
  },
  {
    name: 'Lat Pulldown (Neutral Grip)',
    primary_muscle: 'back',
    secondary_muscles: ['biceps'],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Neutral-grip pulldown for lats and upper back.',
    gymxiety_alternative: 'Seated Cable Row'
  },
  {
    name: 'Seated Cable Row',
    primary_muscle: 'back',
    secondary_muscles: ['biceps'],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Cable row targeting mid-back.',
    gymxiety_alternative: 'Machine Row'
  },
  {
    name: 'Machine Row',
    primary_muscle: 'back',
    secondary_muscles: ['biceps'],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Guided row machine ideal for beginners.',
    gymxiety_alternative: 'Seated Cable Row'
  },
  {
    name: 'Chest-Supported Row',
    primary_muscle: 'back',
    secondary_muscles: ['biceps'],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Supported row reducing lower-back strain.',
    gymxiety_alternative: 'Machine Row'
  },
  {
    name: 'Dumbbell Row (Supported)',
    primary_muscle: 'back',
    secondary_muscles: ['biceps'],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Single-arm dumbbell row using a bench for support.',
    gymxiety_alternative: 'Machine Row'
  },
  {
    name: 'Barbell Row',
    primary_muscle: 'back',
    secondary_muscles: ['biceps'],
    equipment: 'barbell',
    intimidation_level: 'moderate',
    description: 'Barbell row targeting lats and mid-back.',
    gymxiety_alternative: 'Seated Cable Row'
  },
  {
    name: 'Assisted Pull-Up Machine',
    primary_muscle: 'back',
    secondary_muscles: ['biceps'],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Beginner-friendly pull-up assistance machine.',
    gymxiety_alternative: 'Lat Pulldown (Neutral Grip)'
  },

  // Shoulders
  {
    name: 'Barbell Overhead Press',
    primary_muscle: 'shoulders',
    secondary_muscles: ['triceps'],
    equipment: 'barbell',
    intimidation_level: 'high',
    description: 'Standing barbell press targeting shoulders and triceps.',
    gymxiety_alternative: 'Dumbbell Shoulder Press'
  },
  {
    name: 'Dumbbell Shoulder Press',
    primary_muscle: 'shoulders',
    secondary_muscles: ['triceps'],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Beginner-friendly overhead press using dumbbells.',
    gymxiety_alternative: 'Machine Shoulder Press'
  },
  {
    name: 'Machine Shoulder Press',
    primary_muscle: 'shoulders',
    secondary_muscles: ['triceps'],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Guided overhead press machine.',
    gymxiety_alternative: 'Dumbbell Shoulder Press'
  },
  {
    name: 'Dumbbell Lateral Raise',
    primary_muscle: 'shoulders',
    secondary_muscles: [],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Isolation movement for side delts.',
    gymxiety_alternative: 'Cable Lateral Raise'
  },
  {
    name: 'Cable Lateral Raise',
    primary_muscle: 'shoulders',
    secondary_muscles: [],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Cable variation of lateral raise.',
    gymxiety_alternative: 'Dumbbell Lateral Raise'
  },
  {
    name: 'Cable Face Pull',
    primary_muscle: 'shoulders',
    secondary_muscles: ['upper back'],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Cable pull targeting rear delts and upper back.',
    gymxiety_alternative: 'Dumbbell Lateral Raise'
  },

  // Biceps
  {
    name: 'Dumbbell Bicep Curl',
    primary_muscle: 'biceps',
    secondary_muscles: [],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Simple dumbbell curl for biceps.',
    gymxiety_alternative: 'Cable Bicep Curl'
  },
  {
    name: 'Hammer Curl',
    primary_muscle: 'biceps',
    secondary_muscles: ['forearms'],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Neutral-grip curl targeting biceps and forearms.',
    gymxiety_alternative: 'Cable Bicep Curl'
  },
  {
    name: 'Cable Bicep Curl',
    primary_muscle: 'biceps',
    secondary_muscles: [],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Cable curl with constant tension.',
    gymxiety_alternative: 'Dumbbell Bicep Curl'
  },
  {
    name: 'Cable Rope Curl',
    primary_muscle: 'biceps',
    secondary_muscles: [],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Rope attachment curl for biceps.',
    gymxiety_alternative: 'Dumbbell Bicep Curl'
  },
  {
    name: 'Machine Bicep Curl',
    primary_muscle: 'biceps',
    secondary_muscles: [],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Guided bicep curl machine.',
    gymxiety_alternative: 'Cable Bicep Curl'
  },

  // Triceps
  {
    name: 'Cable Tricep Pushdown',
    primary_muscle: 'triceps',
    secondary_muscles: [],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Cable pushdown isolating triceps.',
    gymxiety_alternative: 'Dumbbell Overhead Tricep Extension'
  },
  {
    name: 'Cable Overhead Tricep Extension',
    primary_muscle: 'triceps',
    secondary_muscles: [],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Overhead cable extension for long head of triceps.',
    gymxiety_alternative: 'Dumbbell Overhead Tricep Extension'
  },
  {
    name: 'Dumbbell Overhead Tricep Extension',
    primary_muscle: 'triceps',
    secondary_muscles: [],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Beginner-friendly overhead tricep movement.',
    gymxiety_alternative: 'Cable Tricep Pushdown'
  },
  {
    name: 'Dumbbell Kickback',
    primary_muscle: 'triceps',
    secondary_muscles: [],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Isolation movement for triceps.',
    gymxiety_alternative: 'Cable Tricep Pushdown'
  },
  {
    name: 'Machine Tricep Extension',
    primary_muscle: 'triceps',
    secondary_muscles: [],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Guided tricep extension machine.',
    gymxiety_alternative: 'Cable Tricep Pushdown'
  },

  // Quads
  {
    name: 'Barbell Back Squat',
    primary_muscle: 'quads',
    secondary_muscles: ['glutes', 'hamstrings'],
    equipment: 'barbell',
    intimidation_level: 'high',
    description: 'A compound squat using a barbell. High intimidation due to setup and balance.',
    gymxiety_alternative: 'Leg Press'
  },
  {
    name: 'Barbell Front Squat',
    primary_muscle: 'quads',
    secondary_muscles: ['glutes'],
    equipment: 'barbell',
    intimidation_level: 'high',
    description: 'Front-loaded squat emphasizing quads.',
    gymxiety_alternative: 'Goblet Squat'
  },
  {
    name: 'Leg Press',
    primary_muscle: 'quads',
    secondary_muscles: ['glutes'],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Beginner-friendly leg press machine.',
    gymxiety_alternative: 'Goblet Squat'
  },
  {
    name: 'Leg Extension',
    primary_muscle: 'quads',
    secondary_muscles: [],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Quad isolation machine.',
    gymxiety_alternative: 'Goblet Squat'
  },
  {
    name: 'Goblet Squat',
    primary_muscle: 'quads',
    secondary_muscles: ['glutes'],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Beginner-friendly squat using a dumbbell.',
    gymxiety_alternative: 'Leg Press'
  },
  {
    name: 'Step-Up',
    primary_muscle: 'quads',
    secondary_muscles: ['glutes'],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Step-up movement targeting quads and glutes.',
    gymxiety_alternative: 'Leg Press'
  },

  // Hamstrings
  {
    name: 'Barbell Romanian Deadlift',
    primary_muscle: 'hamstrings',
    secondary_muscles: ['glutes'],
    equipment: 'barbell',
    intimidation_level: 'high',
    description: 'Barbell hinge movement targeting hamstrings.',
    gymxiety_alternative: 'Dumbbell Romanian Deadlift'
  },
  {
    name: 'Dumbbell Romanian Deadlift',
    primary_muscle: 'hamstrings',
    secondary_muscles: ['glutes'],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Beginner-friendly hinge movement.',
    gymxiety_alternative: 'Machine Leg Curl'
  },
  {
    name: 'Machine Leg Curl',
    primary_muscle: 'hamstrings',
    secondary_muscles: [],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Hamstring isolation machine.',
    gymxiety_alternative: 'Dumbbell Romanian Deadlift'
  },
  {
    name: 'Cable Pull-Through',
    primary_muscle: 'hamstrings',
    secondary_muscles: ['glutes'],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Cable hinge movement for glutes and hamstrings.',
    gymxiety_alternative: 'Dumbbell Romanian Deadlift'
  },

  // Glutes
  {
    name: 'Machine Hip Abduction',
    primary_muscle: 'glutes',
    secondary_muscles: [],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Hip abduction machine targeting glutes.',
    gymxiety_alternative: 'Step-Up'
  },
  {
    name: 'Machine Hip Adduction',
    primary_muscle: 'glutes',
    secondary_muscles: ['inner thighs'],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Adduction machine targeting inner thighs with some glute involvement.',
    gymxiety_alternative: 'Step-Up'
  },
  {
    name: 'Step-Up (Glutes)',
    primary_muscle: 'glutes',
    secondary_muscles: ['quads'],
    equipment: 'dumbbell',
    intimidation_level: 'low',
    description: 'Step-up variation focusing on glutes and quads.',
    gymxiety_alternative: 'Leg Press'
  },
  {
    name: 'Cable Kickback',
    primary_muscle: 'glutes',
    secondary_muscles: ['hamstrings'],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Cable kickback isolating the glutes.',
    gymxiety_alternative: 'Machine Hip Abduction'
  },

  // Core
  {
    name: 'Cable Crunch',
    primary_muscle: 'core',
    secondary_muscles: [],
    equipment: 'cable',
    intimidation_level: 'low',
    description: 'Kneeling cable crunch targeting the abs.',
    gymxiety_alternative: 'Plank'
  },
  {
    name: 'Machine Crunch',
    primary_muscle: 'core',
    secondary_muscles: [],
    equipment: 'machine',
    intimidation_level: 'low',
    description: 'Abdominal crunch machine for controlled core work.',
    gymxiety_alternative: 'Plank'
  },
  {
    name: 'Plank',
    primary_muscle: 'core',
    secondary_muscles: ['shoulders', 'glutes'],
    equipment: 'bodyweight',
    intimidation_level: 'low',
    description: 'Isometric core hold in a straight-body position.',
    gymxiety_alternative: 'Dead Bug'
  },
  {
    name: 'Dead Bug',
    primary_muscle: 'core',
    secondary_muscles: ['hip flexors'],
    equipment: 'bodyweight',
    intimidation_level: 'low',
    description: 'Supine core stability exercise with alternating arm and leg movement.',
    gymxiety_alternative: 'Plank'
  },
  {
    name: 'Bird Dog',
    primary_muscle: 'core',
    secondary_muscles: ['lower back', 'glutes'],
    equipment: 'bodyweight',
    intimidation_level: 'low',
    description: 'Quadruped stability exercise extending opposite arm and leg.',
    gymxiety_alternative: 'Dead Bug'
  }
];

export const EXERCISES = EXERCISE_LIBRARY.map(buildLegacyExercise);

const DEFAULT_WORKOUT_NAMES = [
  'Goblet Squat',
  'Dumbbell Bench Press',
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

export const RAW_EXERCISE_LIBRARY = EXERCISE_LIBRARY;