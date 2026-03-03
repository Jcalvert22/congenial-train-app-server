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
  return {
    ...entry,
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
  Dumbbells: "Find a small space—you only need a few feet.",
  Barbell: 'You belong in the rack even if you are new.',
  Bench: "Move the bench if you need more room—it's expected.",
  'Smith Machine': 'Lock the bar wherever you need a pause—people expect it.'
};

export const EQUIPMENT_LIST = [...GENERAL_EQUIPMENT, ...MACHINE_EQUIPMENT];
export const FALLBACK_EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Cables'];
export const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Legs', 'Core', 'Bodyweight'];

const flattenExercises = groups => Object.values(groups).flat();

export const RAW_EXERCISE_LIBRARY = {
  exercises: {
    chest: [
      {
        name: 'barbell bench press',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps', 'shoulders'],
        equipment: 'barbell',
        intimidation_level: 'moderate',
        description: 'A compound barbell press targeting the chest, triceps, and shoulders.',
        gymxiety_alternative: 'dumbbell bench press'
      },
      {
        name: 'barbell incline bench press',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps', 'shoulders'],
        equipment: 'barbell',
        intimidation_level: 'moderate',
        description: 'Incline barbell press emphasizing the upper chest.',
        gymxiety_alternative: 'dumbbell incline press'
      },
      {
        name: 'smith machine bench press',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps', 'shoulders'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A guided bench press using the Smith machine.',
        gymxiety_alternative: 'machine chest press'
      },
      {
        name: 'smith machine incline bench press',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps', 'shoulders'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'Incline Smith machine press targeting the upper chest.',
        gymxiety_alternative: 'machine incline press'
      },
      {
        name: 'dumbbell bench press',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A beginner-friendly chest press using dumbbells.',
        gymxiety_alternative: 'machine chest press'
      },
      {
        name: 'dumbbell incline press',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'Incline dumbbell press emphasizing the upper chest.',
        gymxiety_alternative: 'machine incline press'
      },
      {
        name: 'dumbbell chest fly',
        primary_muscle: 'chest',
        secondary_muscles: [],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A dumbbell fly isolating the chest.',
        gymxiety_alternative: 'pec deck fly'
      },
      {
        name: 'dumbbell pullover',
        primary_muscle: 'chest',
        secondary_muscles: ['back'],
        equipment: 'dumbbell',
        intimidation_level: 'moderate',
        description: 'A pullover movement engaging chest and lats.',
        gymxiety_alternative: 'cable chest fly'
      },
      {
        name: 'machine chest press',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided chest press ideal for beginners.',
        gymxiety_alternative: 'dumbbell bench press'
      },
      {
        name: 'machine incline press',
        primary_muscle: 'chest',
        secondary_muscles: ['shoulders'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'Incline machine press targeting the upper chest.',
        gymxiety_alternative: 'dumbbell incline press'
      },
      {
        name: 'machine decline press',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'Decline machine press emphasizing lower chest.',
        gymxiety_alternative: 'machine chest press'
      },
      {
        name: 'pec deck fly',
        primary_muscle: 'chest',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'Machine fly isolating the chest.',
        gymxiety_alternative: 'cable chest fly'
      },
      {
        name: 'cable chest fly',
        primary_muscle: 'chest',
        secondary_muscles: [],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'Cable fly isolating the chest with adjustable angles.',
        gymxiety_alternative: 'pec deck fly'
      },
      {
        name: 'cable low-to-high fly',
        primary_muscle: 'chest',
        secondary_muscles: ['shoulders'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'Upward cable fly emphasizing upper chest.',
        gymxiety_alternative: 'machine incline press'
      },
      {
        name: 'cable high-to-low fly',
        primary_muscle: 'chest',
        secondary_muscles: ['shoulders'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'Downward cable fly emphasizing lower chest.',
        gymxiety_alternative: 'machine decline press'
      },
      {
        name: 'push-up',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps', 'shoulders'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A bodyweight chest press movement.',
        gymxiety_alternative: 'incline push-up'
      },
      {
        name: 'incline push-up',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'Beginner-friendly push-up variation using an elevated surface.',
        gymxiety_alternative: 'machine chest press'
      }
    ],
    back: [
      {
        name: 'lat pulldown',
        primary_muscle: 'back',
        secondary_muscles: ['biceps'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A vertical pulling movement targeting the lats.',
        gymxiety_alternative: 'seated cable row'
      },
      {
        name: 'seated cable row',
        primary_muscle: 'back',
        secondary_muscles: ['biceps', 'rear delts'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A horizontal pulling movement using a cable row station.',
        gymxiety_alternative: 'machine row'
      },
      {
        name: 'machine row',
        primary_muscle: 'back',
        secondary_muscles: ['biceps'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided rowing machine ideal for beginners.',
        gymxiety_alternative: 'seated cable row'
      },
      {
        name: 'machine high row',
        primary_muscle: 'back',
        secondary_muscles: ['rear delts', 'biceps'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A machine row variation emphasizing upper back and rear delts.',
        gymxiety_alternative: 'seated cable row'
      },
      {
        name: 'machine pullover',
        primary_muscle: 'back',
        secondary_muscles: ['chest'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A machine pullover isolating the lats.',
        gymxiety_alternative: 'lat pulldown'
      },
      {
        name: 'cable straight-arm pulldown',
        primary_muscle: 'back',
        secondary_muscles: ['rear delts'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A lat isolation movement using straight arms.',
        gymxiety_alternative: 'lat pulldown'
      },
      {
        name: 'cable high row',
        primary_muscle: 'back',
        secondary_muscles: ['rear delts', 'biceps'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A high-angle cable row targeting upper back.',
        gymxiety_alternative: 'machine row'
      },
      {
        name: 'dumbbell row',
        primary_muscle: 'back',
        secondary_muscles: ['biceps'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A single-arm dumbbell row for lat and upper-back development.',
        gymxiety_alternative: 'seated cable row'
      },
      {
        name: 'dumbbell incline row',
        primary_muscle: 'back',
        secondary_muscles: ['rear delts'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A chest-supported dumbbell row reducing lower-back strain.',
        gymxiety_alternative: 'machine row'
      },
      {
        name: 'barbell bent-over row',
        primary_muscle: 'back',
        secondary_muscles: ['biceps', 'rear delts'],
        equipment: 'barbell',
        intimidation_level: 'high',
        description: 'A compound barbell row targeting the entire back.',
        gymxiety_alternative: 'seated cable row'
      },
      {
        name: 'barbell landmine row',
        primary_muscle: 'back',
        secondary_muscles: ['biceps'],
        equipment: 'barbell',
        intimidation_level: 'moderate',
        description: 'A landmine row variation offering stability and reduced lower-back load.',
        gymxiety_alternative: 'machine row'
      },
      {
        name: 'smith machine row',
        primary_muscle: 'back',
        secondary_muscles: ['biceps', 'rear delts'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A guided rowing movement using the Smith machine.',
        gymxiety_alternative: 'seated cable row'
      },
      {
        name: 'reverse pec deck fly',
        primary_muscle: 'back',
        secondary_muscles: ['rear delts'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A machine fly variation targeting rear delts and upper back.',
        gymxiety_alternative: 'cable rear delt fly'
      },
      {
        name: 'cable rear delt fly',
        primary_muscle: 'back',
        secondary_muscles: ['shoulders'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A cable fly variation isolating the rear delts and upper back.',
        gymxiety_alternative: 'reverse pec deck fly'
      }
    ],
    shoulders: [
      {
        name: 'dumbbell shoulder press',
        primary_muscle: 'shoulders',
        secondary_muscles: ['triceps'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A seated or standing dumbbell press targeting the shoulders.',
        gymxiety_alternative: 'machine shoulder press'
      },
      {
        name: 'dumbbell lateral raise',
        primary_muscle: 'shoulders',
        secondary_muscles: [],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A dumbbell raise isolating the side delts.',
        gymxiety_alternative: 'cable lateral raise'
      },
      {
        name: 'dumbbell front raise',
        primary_muscle: 'shoulders',
        secondary_muscles: [],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A dumbbell raise isolating the front delts.',
        gymxiety_alternative: 'machine shoulder press'
      },
      {
        name: 'dumbbell rear delt raise',
        primary_muscle: 'shoulders',
        secondary_muscles: ['back'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A bent-over dumbbell raise targeting the rear delts.',
        gymxiety_alternative: 'reverse pec deck fly'
      },
      {
        name: 'machine shoulder press',
        primary_muscle: 'shoulders',
        secondary_muscles: ['triceps'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided overhead press ideal for beginners.',
        gymxiety_alternative: 'dumbbell shoulder press'
      },
      {
        name: 'machine lateral raise',
        primary_muscle: 'shoulders',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A machine-based lateral raise isolating the side delts.',
        gymxiety_alternative: 'dumbbell lateral raise'
      },
      {
        name: 'reverse pec deck fly',
        primary_muscle: 'shoulders',
        secondary_muscles: ['back'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A machine fly variation isolating the rear delts.',
        gymxiety_alternative: 'cable rear delt fly'
      },
      {
        name: 'cable lateral raise',
        primary_muscle: 'shoulders',
        secondary_muscles: [],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A cable raise isolating the side delts with constant tension.',
        gymxiety_alternative: 'machine lateral raise'
      },
      {
        name: 'cable rear delt fly',
        primary_muscle: 'shoulders',
        secondary_muscles: ['back'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A cable fly variation isolating the rear delts.',
        gymxiety_alternative: 'reverse pec deck fly'
      },
      {
        name: 'barbell overhead press',
        primary_muscle: 'shoulders',
        secondary_muscles: ['triceps'],
        equipment: 'barbell',
        intimidation_level: 'high',
        description: 'A standing or seated barbell press targeting the shoulders.',
        gymxiety_alternative: 'machine shoulder press'
      },
      {
        name: 'smith machine overhead press',
        primary_muscle: 'shoulders',
        secondary_muscles: ['triceps'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A guided overhead press using the Smith machine.',
        gymxiety_alternative: 'machine shoulder press'
      }
    ],
    biceps: [
      {
        name: 'dumbbell bicep curl',
        primary_muscle: 'biceps',
        secondary_muscles: [],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A simple dumbbell curl targeting the biceps.',
        gymxiety_alternative: 'cable bicep curl'
      },
      {
        name: 'dumbbell hammer curl',
        primary_muscle: 'biceps',
        secondary_muscles: ['forearms'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A neutral-grip curl emphasizing the brachialis and forearms.',
        gymxiety_alternative: 'cable hammer curl'
      },
      {
        name: 'dumbbell incline curl',
        primary_muscle: 'biceps',
        secondary_muscles: [],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A curl performed on an incline bench to increase biceps stretch.',
        gymxiety_alternative: 'dumbbell bicep curl'
      },
      {
        name: 'cable bicep curl',
        primary_muscle: 'biceps',
        secondary_muscles: [],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A cable-based curl providing constant tension on the biceps.',
        gymxiety_alternative: 'dumbbell bicep curl'
      },
      {
        name: 'cable hammer curl',
        primary_muscle: 'biceps',
        secondary_muscles: ['forearms'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A rope-attachment curl emphasizing the brachialis.',
        gymxiety_alternative: 'dumbbell hammer curl'
      },
      {
        name: 'cable high curl',
        primary_muscle: 'biceps',
        secondary_muscles: ['shoulders'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A high-angle cable curl targeting the short head of the biceps.',
        gymxiety_alternative: 'cable bicep curl'
      },
      {
        name: 'ez-bar curl',
        primary_muscle: 'biceps',
        secondary_muscles: [],
        equipment: 'barbell',
        intimidation_level: 'moderate',
        description: 'A curl using an EZ-bar to reduce wrist strain.',
        gymxiety_alternative: 'dumbbell bicep curl'
      },
      {
        name: 'ez-bar preacher curl',
        primary_muscle: 'biceps',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A preacher curl variation using a machine for stability.',
        gymxiety_alternative: 'cable bicep curl'
      },
      {
        name: 'machine preacher curl',
        primary_muscle: 'biceps',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided preacher curl ideal for beginners.',
        gymxiety_alternative: 'dumbbell bicep curl'
      },
      {
        name: 'barbell curl',
        primary_muscle: 'biceps',
        secondary_muscles: [],
        equipment: 'barbell',
        intimidation_level: 'moderate',
        description: 'A straight-bar curl emphasizing overall biceps development.',
        gymxiety_alternative: 'dumbbell bicep curl'
      }
    ],
    triceps: [
      {
        name: 'cable tricep pushdown',
        primary_muscle: 'triceps',
        secondary_muscles: [],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A cable pushdown using a straight bar or rope attachment.',
        gymxiety_alternative: 'machine tricep extension'
      },
      {
        name: 'cable rope extension',
        primary_muscle: 'triceps',
        secondary_muscles: [],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A rope-based tricep extension emphasizing the lateral head.',
        gymxiety_alternative: 'cable tricep pushdown'
      },
      {
        name: 'cable overhead tricep extension',
        primary_muscle: 'triceps',
        secondary_muscles: ['shoulders'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'An overhead cable extension targeting the long head of the triceps.',
        gymxiety_alternative: 'machine tricep extension'
      },
      {
        name: 'machine tricep extension',
        primary_muscle: 'triceps',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided tricep extension ideal for beginners.',
        gymxiety_alternative: 'cable tricep pushdown'
      },
      {
        name: 'machine dip press',
        primary_muscle: 'triceps',
        secondary_muscles: ['chest', 'shoulders'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A machine-based dip movement providing stability and control.',
        gymxiety_alternative: 'cable tricep pushdown'
      },
      {
        name: 'dumbbell tricep kickback',
        primary_muscle: 'triceps',
        secondary_muscles: ['shoulders'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A dumbbell kickback isolating the triceps.',
        gymxiety_alternative: 'cable tricep pushdown'
      },
      {
        name: 'dumbbell overhead tricep extension',
        primary_muscle: 'triceps',
        secondary_muscles: ['shoulders'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'An overhead dumbbell extension targeting the long head.',
        gymxiety_alternative: 'machine tricep extension'
      },
      {
        name: 'barbell close-grip bench press',
        primary_muscle: 'triceps',
        secondary_muscles: ['chest', 'shoulders'],
        equipment: 'barbell',
        intimidation_level: 'high',
        description: 'A narrow-grip barbell press emphasizing the triceps.',
        gymxiety_alternative: 'machine tricep extension'
      },
      {
        name: 'smith machine close-grip press',
        primary_muscle: 'triceps',
        secondary_muscles: ['chest', 'shoulders'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A guided close-grip press using the Smith machine.',
        gymxiety_alternative: 'cable tricep pushdown'
      }
    ],
    quads: [
      {
        name: 'leg press',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes', 'hamstrings'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided pressing movement targeting the quads with support for the lower back.',
        gymxiety_alternative: 'leg extension'
      },
      {
        name: 'leg extension',
        primary_muscle: 'quads',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'An isolation movement focusing on the quadriceps.',
        gymxiety_alternative: 'goblet squat'
      },
      {
        name: 'hack squat machine',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided squat pattern emphasizing the quads.',
        gymxiety_alternative: 'leg press'
      },
      {
        name: 'machine squat press',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A machine-based squat variation offering stability and support.',
        gymxiety_alternative: 'leg press'
      },
      {
        name: 'machine step-up',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided step-up movement targeting quads and glutes.',
        gymxiety_alternative: 'dumbbell step-up'
      },
      {
        name: 'goblet squat',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes', 'core'],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A beginner-friendly squat holding a dumbbell at the chest.',
        gymxiety_alternative: 'leg press'
      },
      {
        name: 'dumbbell lunge',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes', 'hamstrings'],
        equipment: 'dumbbell',
        intimidation_level: 'moderate',
        description: 'A forward lunge using dumbbells to target quads and glutes.',
        gymxiety_alternative: 'machine step-up'
      },
      {
        name: 'dumbbell split squat',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'dumbbell',
        intimidation_level: 'moderate',
        description: 'A stationary lunge variation emphasizing quad stability.',
        gymxiety_alternative: 'leg press'
      },
      {
        name: 'barbell back squat',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes', 'core'],
        equipment: 'barbell',
        intimidation_level: 'high',
        description: 'A compound squat movement targeting quads and glutes.',
        gymxiety_alternative: 'hack squat machine'
      },
      {
        name: 'barbell box squat',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'barbell',
        intimidation_level: 'high',
        description: 'A squat variation using a box to improve depth consistency.',
        gymxiety_alternative: 'leg press'
      },
      {
        name: 'smith machine squat',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A guided squat using the Smith machine.',
        gymxiety_alternative: 'hack squat machine'
      },
      {
        name: 'smith machine split squat',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A split squat performed with Smith machine stability.',
        gymxiety_alternative: 'dumbbell split squat'
      },
      {
        name: 'smith machine lunge',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A guided lunge pattern using the Smith machine.',
        gymxiety_alternative: 'machine step-up'
      }
    ],
    hamstrings: [
      {
        name: 'seated leg curl',
        primary_muscle: 'hamstrings',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided leg curl performed in a seated position to isolate the hamstrings.',
        gymxiety_alternative: 'lying leg curl'
      },
      {
        name: 'lying leg curl',
        primary_muscle: 'hamstrings',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A prone leg curl machine isolating the hamstrings.',
        gymxiety_alternative: 'seated leg curl'
      },
      {
        name: 'standing single-leg curl',
        primary_muscle: 'hamstrings',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A single-leg curl performed on a standing machine.',
        gymxiety_alternative: 'seated leg curl'
      },
      {
        name: 'cable leg curl',
        primary_muscle: 'hamstrings',
        secondary_muscles: [],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A cable-based curl using an ankle strap to isolate the hamstrings.',
        gymxiety_alternative: 'lying leg curl'
      },
      {
        name: 'dumbbell romanian deadlift',
        primary_muscle: 'hamstrings',
        secondary_muscles: ['glutes', 'lower back'],
        equipment: 'dumbbell',
        intimidation_level: 'moderate',
        description: 'A hip-hinge movement using dumbbells to target the hamstrings.',
        gymxiety_alternative: 'seated leg curl'
      },
      {
        name: 'dumbbell good morning',
        primary_muscle: 'hamstrings',
        secondary_muscles: ['glutes', 'lower back'],
        equipment: 'dumbbell',
        intimidation_level: 'moderate',
        description: 'A hinge movement performed with a dumbbell held at the chest.',
        gymxiety_alternative: 'lying leg curl'
      },
      {
        name: 'barbell romanian deadlift',
        primary_muscle: 'hamstrings',
        secondary_muscles: ['glutes', 'lower back'],
        equipment: 'barbell',
        intimidation_level: 'high',
        description: 'A barbell hinge pattern emphasizing hamstring stretch and tension.',
        gymxiety_alternative: 'dumbbell romanian deadlift'
      },
      {
        name: 'barbell good morning',
        primary_muscle: 'hamstrings',
        secondary_muscles: ['glutes', 'lower back'],
        equipment: 'barbell',
        intimidation_level: 'high',
        description: 'A barbell hinge movement targeting the hamstrings and posterior chain.',
        gymxiety_alternative: 'dumbbell good morning'
      },
      {
        name: 'smith machine romanian deadlift',
        primary_muscle: 'hamstrings',
        secondary_muscles: ['glutes', 'lower back'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A guided RDL using the Smith machine for stability.',
        gymxiety_alternative: 'seated leg curl'
      }
    ],
    glutes: [
      {
        name: 'glute bridge machine',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided glute bridge machine providing stability and support.',
        gymxiety_alternative: 'seated hip abduction'
      },
      {
        name: 'hip thrust machine',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A machine-based hip thrust ideal for beginners.',
        gymxiety_alternative: 'glute bridge machine'
      },
      {
        name: 'seated hip abduction',
        primary_muscle: 'glutes',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A machine exercise isolating the outer glutes.',
        gymxiety_alternative: 'cable hip abduction'
      },
      {
        name: 'standing hip abduction machine',
        primary_muscle: 'glutes',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A standing machine variation isolating the glute medius.',
        gymxiety_alternative: 'seated hip abduction'
      },
      {
        name: 'cable glute kickback',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A cable kickback using an ankle strap to isolate the glutes.',
        gymxiety_alternative: 'seated hip abduction'
      },
      {
        name: 'cable hip abduction',
        primary_muscle: 'glutes',
        secondary_muscles: [],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A cable-based abduction movement targeting the outer glutes.',
        gymxiety_alternative: 'seated hip abduction'
      },
      {
        name: 'dumbbell hip thrust',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings'],
        equipment: 'dumbbell',
        intimidation_level: 'moderate',
        description: 'A hip thrust performed with a dumbbell on the hips.',
        gymxiety_alternative: 'glute bridge machine'
      },
      {
        name: 'dumbbell glute bridge',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings'],
        equipment: 'dumbbell',
        intimidation_level: 'moderate',
        description: 'A glute bridge variation using a dumbbell for resistance.',
        gymxiety_alternative: 'hip thrust machine'
      },
      {
        name: 'barbell hip thrust',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings', 'core'],
        equipment: 'barbell',
        intimidation_level: 'high',
        description: 'A barbell hip thrust emphasizing glute strength and power.',
        gymxiety_alternative: 'hip thrust machine'
      },
      {
        name: 'barbell glute bridge',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings'],
        equipment: 'barbell',
        intimidation_level: 'high',
        description: 'A barbell glute bridge focusing on glute contraction.',
        gymxiety_alternative: 'glute bridge machine'
      },
      {
        name: 'smith machine hip thrust',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A guided hip thrust using the Smith machine.',
        gymxiety_alternative: 'hip thrust machine'
      },
      {
        name: 'smith machine glute bridge',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings'],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A Smith machine glute bridge variation for stability.',
        gymxiety_alternative: 'glute bridge machine'
      }
    ],
    legs: [
      {
        name: 'seated calf raise',
        primary_muscle: 'calves',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A seated machine exercise isolating the soleus muscle of the calves.',
        gymxiety_alternative: 'standing calf raise machine'
      },
      {
        name: 'standing calf raise machine',
        primary_muscle: 'calves',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A standing machine calf raise targeting the gastrocnemius.',
        gymxiety_alternative: 'seated calf raise'
      },
      {
        name: 'leg press calf raise',
        primary_muscle: 'calves',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A calf raise performed on the leg press machine for added stability.',
        gymxiety_alternative: 'standing calf raise machine'
      },
      {
        name: 'dumbbell calf raise',
        primary_muscle: 'calves',
        secondary_muscles: [],
        equipment: 'dumbbell',
        intimidation_level: 'low',
        description: 'A standing calf raise performed while holding dumbbells.',
        gymxiety_alternative: 'seated calf raise'
      },
      {
        name: 'smith machine calf raise',
        primary_muscle: 'calves',
        secondary_muscles: [],
        equipment: 'smith_machine',
        intimidation_level: 'very_high',
        description: 'A guided calf raise using the Smith machine for added load.',
        gymxiety_alternative: 'standing calf raise machine'
      }
    ],
    core: [
      {
        name: 'machine crunch',
        primary_muscle: 'core',
        secondary_muscles: [],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A guided crunch machine providing stability and controlled resistance.',
        gymxiety_alternative: 'bodyweight crunch'
      },
      {
        name: 'machine ab twist',
        primary_muscle: 'core',
        secondary_muscles: ['obliques'],
        equipment: 'machine',
        intimidation_level: 'low',
        description: 'A rotational core machine targeting the obliques.',
        gymxiety_alternative: 'cable wood chop'
      },
      {
        name: 'cable wood chop',
        primary_muscle: 'core',
        secondary_muscles: ['shoulders'],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A diagonal cable pull targeting the obliques and deep core.',
        gymxiety_alternative: 'machine ab twist'
      },
      {
        name: 'cable kneeling crunch',
        primary_muscle: 'core',
        secondary_muscles: [],
        equipment: 'cable',
        intimidation_level: 'low',
        description: 'A cable crunch performed from a kneeling position for controlled resistance.',
        gymxiety_alternative: 'machine crunch'
      },
      {
        name: 'bodyweight crunch',
        primary_muscle: 'core',
        secondary_muscles: [],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A simple crunch performed on the floor to target the upper abs.',
        gymxiety_alternative: 'machine crunch'
      },
      {
        name: 'bodyweight reverse crunch',
        primary_muscle: 'core',
        secondary_muscles: ['lower abs'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A reverse crunch lifting the hips to target the lower abs.',
        gymxiety_alternative: 'bodyweight crunch'
      },
      {
        name: 'bodyweight dead bug',
        primary_muscle: 'core',
        secondary_muscles: ['hip flexors'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A controlled core stability exercise performed on the back.',
        gymxiety_alternative: 'machine crunch'
      },
      {
        name: 'bodyweight bird dog',
        primary_muscle: 'core',
        secondary_muscles: ['lower back'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A stability exercise performed on hands and knees to engage the core.',
        gymxiety_alternative: 'bodyweight dead bug'
      }
    ],
    bodyweight: [
      {
        name: 'bodyweight squat',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes', 'core'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A simple squat using only bodyweight to build lower-body strength.',
        gymxiety_alternative: 'goblet squat'
      },
      {
        name: 'bodyweight lunge',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes', 'hamstrings'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A forward lunge performed without weights.',
        gymxiety_alternative: 'machine step-up'
      },
      {
        name: 'bodyweight step-up',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A step-up onto a stable platform using only bodyweight.',
        gymxiety_alternative: 'machine step-up'
      },
      {
        name: 'glute bridge',
        primary_muscle: 'glutes',
        secondary_muscles: ['hamstrings'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A floor-based glute bridge performed without added resistance.',
        gymxiety_alternative: 'glute bridge machine'
      },
      {
        name: 'hip hinge',
        primary_muscle: 'hamstrings',
        secondary_muscles: ['glutes'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A basic hinge pattern teaching hip mechanics for RDLs.',
        gymxiety_alternative: 'seated leg curl'
      },
      {
        name: 'wall sit',
        primary_muscle: 'quads',
        secondary_muscles: ['glutes'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A static hold performed against a wall to engage the quads.',
        gymxiety_alternative: 'leg press'
      },
      {
        name: 'incline push-up',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps', 'shoulders'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A push-up variation using an elevated surface for easier execution.',
        gymxiety_alternative: 'machine chest press'
      },
      {
        name: 'knee push-up',
        primary_muscle: 'chest',
        secondary_muscles: ['triceps'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A beginner push-up variation performed from the knees.',
        gymxiety_alternative: 'incline push-up'
      },
      {
        name: 'bodyweight row (inverted row)',
        primary_muscle: 'back',
        secondary_muscles: ['biceps'],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A horizontal pulling movement performed using a low bar or suspension trainer.',
        gymxiety_alternative: 'seated cable row'
      },
      {
        name: 'bodyweight calf raise',
        primary_muscle: 'calves',
        secondary_muscles: [],
        equipment: 'bodyweight',
        intimidation_level: 'low',
        description: 'A standing calf raise performed without weights.',
        gymxiety_alternative: 'seated calf raise'
      }
    ]
  }
};

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
*** End File