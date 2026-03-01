const DEFAULT_CONFIDENCE_CUES = [
  'Move slowly and breathe calmly.',
  'Stop if anything feels sharp or painful.'
];

export const confidenceAlternativeMap = {
  'Barbell Back Squat': 'Goblet Squat',
  'Front Squat': 'Goblet Squat',
  'Bulgarian Split Squat': 'Goblet Split Squat',
  'Barbell Deadlift': 'Dumbbell Romanian Deadlift',
  'Romanian Deadlift': 'Dumbbell Romanian Deadlift',
  'Barbell Hip Thrust': 'Hip Thrust Machine',
  'Barbell Bench Press': 'Chest Press Machine',
  'Incline Barbell Bench': 'Chest Press Machine',
  'Barbell Row': 'Seated Row Machine',
  'Pendlay Row': 'Seated Row Machine',
  'Weighted Pull-Up': 'Lat Pulldown',
  'Barbell Overhead Press': 'Machine Shoulder Press',
  'Arnold Press': 'Seated Dumbbell Shoulder Press',
  'Skull Crushers': 'Cable Triceps Pushdown',
  'Close-Grip Bench Press': 'Cable Triceps Pushdown',
  'Barbell Curl': 'Cable Biceps Curl',
  'Hanging Leg Raise': 'Dead Bug',
  'Ab Wheel': 'Dead Bug'
};

const confidenceAlternativeMeta = {
  'Goblet Squat': {
    description: 'Hold a single dumbbell at chest height, sit down slowly, and stand tall without rushing.',
    supportiveCues: ['Keep chest tall.', 'Drive through a steady mid-foot.'],
    equipment: 'Dumbbells',
    muscle: 'Legs',
    confidence: 'Easy'
  },
  'Goblet Split Squat': {
    description: 'Hold a light weight at the chest, drop the back knee under control, and rise with balance.',
    supportiveCues: ['Keep torso tall.', 'Use a light support if needed.'],
    equipment: 'Dumbbells',
    muscle: 'Legs',
    confidence: 'Easy'
  },
  'Dumbbell Romanian Deadlift': {
    description: 'Hold two light bells, hinge at the hips, and stand up while squeezing glutes.',
    supportiveCues: ['Keep spine long.', 'Move with a slow three-count.'],
    equipment: 'Dumbbells',
    muscle: 'Posterior Chain',
    confidence: 'Easy'
  },
  'Hip Thrust Machine': {
    description: 'Let the pad support you, press hips upward, and pause at the top before lowering.',
    supportiveCues: ['Drive through heels.', 'Keep chin slightly tucked.'],
    equipment: 'Machine',
    muscle: 'Glutes',
    confidence: 'Easy'
  },
  'Chest Press Machine': {
    description: 'Sit supported, grip handles slightly wider than shoulders, and press smoothly.',
    supportiveCues: ['Keep shoulders relaxed.', 'Exhale as you press.'],
    equipment: 'Machine',
    muscle: 'Chest',
    confidence: 'Easy'
  },
  'Seated Row Machine': {
    description: 'Sit tall with feet braced, pull handles toward ribs, and squeeze shoulder blades.',
    supportiveCues: ['Keep shoulders away from ears.', 'Control the return.'],
    equipment: 'Machine',
    muscle: 'Back',
    confidence: 'Easy'
  },
  'Lat Pulldown': {
    description: 'Hold bar slightly wider than shoulders, pull elbows down, and pause near collarbones.',
    supportiveCues: ['Keep ribs stacked.', 'Avoid shrugging shoulders.'],
    equipment: 'Machine',
    muscle: 'Back',
    confidence: 'Easy'
  },
  'Machine Shoulder Press': {
    description: 'Sit supported, keep wrists stacked over elbows, and press slowly overhead.',
    supportiveCues: ['Control the lowering.', 'Keep ribs down.'],
    equipment: 'Machine',
    muscle: 'Shoulders',
    confidence: 'Easy'
  },
  'Seated Dumbbell Shoulder Press': {
    description: 'Sit tall, use light bells, and press overhead without arching the back.',
    supportiveCues: ['Brace core softly.', 'Lower for a three-count.'],
    equipment: 'Dumbbells',
    muscle: 'Shoulders',
    confidence: 'Easy'
  },
  'Cable Triceps Pushdown': {
    description: 'Stand tall, elbows by sides, and press rope handles down while spreading the ends.',
    supportiveCues: ['Keep ribs stacked.', 'Pause at the bottom.'],
    equipment: 'Cable Machine',
    muscle: 'Arms',
    confidence: 'Easy'
  },
  'Cable Biceps Curl': {
    description: 'Hold the bar with palms up, curl toward shoulders, and lower slowly.',
    supportiveCues: ['Elbows stay close to ribs.', 'Exhale as you curl.'],
    equipment: 'Cable Machine',
    muscle: 'Arms',
    confidence: 'Easy'
  },
  'Dead Bug': {
    description: 'Lie on back, reach arms toward ceiling, and slowly lower opposite arm and leg.',
    supportiveCues: ['Press low back into floor.', 'Move with slow breaths.'],
    equipment: 'Bodyweight',
    muscle: 'Core',
    confidence: 'Easy'
  }
};

export function getConfidenceAlternativeDetails(sourceName, fallback = {}) {
  if (!sourceName) {
    return null;
  }
  const replacement = confidenceAlternativeMap[sourceName];
  if (!replacement) {
    return null;
  }
  const meta = confidenceAlternativeMeta[replacement] || {};
  const defaultDescription = `Switch to ${replacement} for more stability and confidence.`;
  return {
    exercise: replacement,
    equipment: meta.equipment || fallback.equipment || '',
    muscle: meta.muscle || fallback.muscle || '',
    description: meta.description || fallback.description || defaultDescription,
    confidence: meta.confidence || 'Easy',
    supportiveCues: meta.supportiveCues || fallback.supportiveCues || DEFAULT_CONFIDENCE_CUES
  };
}

export function hasConfidenceAlternative(sourceName) {
  return Boolean(confidenceAlternativeMap[sourceName]);
}
