import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use('/styles', express.static('styles'));
app.use('/images', express.static('public/images'));

const MUSCLE_GROUPS = [
  'Upper Chest', 'Chest', 'Shoulders', 'Arms', 'Back', 'Abs', 'Legs'
];

const EQUIPMENT_LIST = [
  // Chest
  'Bench', 'Pec Deck', 'Dumbbells', 'Cables',
  // Back
  'Lat Pulldown', 'Seated Row',
  // Shoulders
  'Shoulder Press',
  // Arms
  'Preacher Curl',
  // Legs
  'Squat Rack', 'Leg Extension', 'Hamstring Curl',
  // Cardio
  'Treadmill', 'Stair Stepper', 'Cardio Bike'
];

const EXERCISES = [
  // Upper Chest
  { name: "Incline Dumbbell Press", equipment: ["Bench", "Dumbbells"], muscle_group: "Upper Chest", howto: "Lie on an incline bench and press dumbbells upward.", video: "" },
  { name: "Incline Push-up", equipment: ["Bench"], muscle_group: "Upper Chest", howto: "Place hands on bench, feet on floor, and perform push-ups.", video: "" },

  // Chest
  { name: "Push-up", equipment: ["Bench", "Dumbbells"], muscle_group: "Chest", howto: "Start in a plank position and lower your body until your chest nearly touches the floor, then push back up.", video: "" },
  { name: "Bench Press", equipment: ["Bench", "Dumbbells"], muscle_group: "Chest", howto: "Lie on a bench, grip dumbbells. Lower to chest, then press up.", video: "" },
  { name: "Pec Deck Fly", equipment: ["Pec Deck"], muscle_group: "Chest", howto: "Sit at the machine, bring arms together in front of chest, then return.", video: "" },
  { name: "Cable Chest Fly", equipment: ["Cables"], muscle_group: "Chest", howto: "With arms slightly bent, bring handles together in a wide arc, then return.", video: "" },

  // Shoulders
  { name: "Shoulder Press", equipment: ["Shoulder Press", "Dumbbells"], muscle_group: "Shoulders", howto: "Press weight overhead, then lower.", video: "" },
  { name: "Lateral Raise", equipment: ["Dumbbells", "Cables"], muscle_group: "Shoulders", howto: "Raise weights to sides to shoulder height.", video: "" },
  { name: "Front Raise", equipment: ["Dumbbells", "Cables"], muscle_group: "Shoulders", howto: "Raise weights in front to shoulder height.", video: "" },

  // Arms
  { name: "Bicep Curl", equipment: ["Dumbbells", "Preacher Curl", "Cables"], muscle_group: "Arms", howto: "Curl weights up while keeping elbows close, then lower slowly.", video: "" },
  { name: "Triceps Pushdown", equipment: ["Cables"], muscle_group: "Arms", howto: "Push bar or rope down, keeping elbows at sides.", video: "" },
  { name: "Hammer Curl", equipment: ["Dumbbells"], muscle_group: "Arms", howto: "Curl dumbbells with palms facing each other.", video: "" },
  { name: "Overhead Triceps Extension", equipment: ["Dumbbells"], muscle_group: "Arms", howto: "Extend dumbbell overhead, then lower behind head and press up.", video: "" },

  // Back
  { name: "Lat Pulldown", equipment: ["Lat Pulldown", "Cables"], muscle_group: "Back", howto: "Pull bar to chest, then release.", video: "" },
  { name: "Seated Row", equipment: ["Cables"], muscle_group: "Back", howto: "Pull handles to torso, then release.", video: "" },
  { name: "Dumbbell Row", equipment: ["Bench", "Dumbbells"], muscle_group: "Back", howto: "Place one knee and hand on bench, row dumbbell to hip.", video: "" },

  // Abs
  { name: "Crunch", equipment: ["Bench"], muscle_group: "Abs", howto: "Curl shoulders toward hips, then lower.", video: "" },
  { name: "Plank", equipment: ["Bench"], muscle_group: "Abs", howto: "Hold body straight on elbows and toes.", video: "" },
  { name: "Leg Raise", equipment: ["Bench"], muscle_group: "Abs", howto: "Lie on bench, raise legs upward, then lower.", video: "" },

  // Legs
  { name: "Squat", equipment: ["Squat Rack", "Dumbbells"], muscle_group: "Legs", howto: "Lower hips back and down, then stand up.", video: "" },
  { name: "Leg Extension", equipment: ["Leg Extension"], muscle_group: "Legs", howto: "Extend knees to lift pad.", video: "" },
  { name: "Hamstring Curl", equipment: ["Hamstring Curl"], muscle_group: "Legs", howto: "Curl heels toward glutes.", video: "" },
  { name: "Calf Raise", equipment: ["Bench", "Dumbbells"], muscle_group: "Legs", howto: "Stand on edge of bench, raise heels, then lower.", video: "" },

  // Cardio
  { name: "Treadmill Walk", equipment: ["Treadmill"], muscle_group: "Legs", howto: "Walk at a steady pace.", video: "" },
  { name: "Stair Stepper", equipment: ["Stair Stepper"], muscle_group: "Legs", howto: "Climb rotating stairs.", video: "" },
  { name: "Bike Ride", equipment: ["Cardio Bike"], muscle_group: "Legs", howto: "Pedal at a steady pace.", video: "" }
];

const BEGINNER_EQUIPMENT = [
  'Dumbbells', 'Bench', 'Bodyweight Only', 'Resistance Bands', 'Pull-up Bar', 'Stationary Bike', 'Treadmill', 'Kettlebell', 'StepMill', 'Jump Rope', 'Foam Roller', 'Stability Ball', 'Mini Bands', 'Push-up Handles', 'Grip Trainer', 'Medicine Ball', 'Ab Wheel', 'Parallettes', 'Suspension Trainer', 'Roman Chair', 'Hyperextension Bench', 'Stepper', 'Elliptical', 'Rowing Machine', 'Weighted Vest', 'Ankle Weights', 'Bosu Ball'
];
const BEGINNER_MUSCLES = [
  'Upper Chest', 'Chest', 'Shoulders', 'Arms', 'Back', 'Abs', 'Legs'
];

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

const SEX_OPTIONS = ['Female', 'Male', 'Prefer not to say'];
const PERCENT_MIN = 30;
const PERCENT_MAX = 95;
const PERCENT_STEP = 5;
const PERCENT_OFFSET_MIN = -25;
const PERCENT_OFFSET_MAX = 25;
const REP_STEP = 2;
const REP_DELTA_MIN = -6;
const REP_DELTA_MAX = 6;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const userState = {
  isSubscribed: false,
  profile: {
    name: 'Jace Calvert',
    subtitle: 'Short, calm sessions focused on solid form and breathing.',
    goal: 'Build steady strength and confidence',
    experience: 'Beginner · Week 3',
    equipment: 'Adjustable dumbbells + flat bench',
    goalType: 'build_muscle',
    experienceLevel: 'beginner',
    equipmentAccess: 'dumbbells_only',
    daysPerWeek: 3,
    height: '',
    weight: '',
    sex: '',
    age: '',
    location: '',
    onboardingComplete: false
  },
  program: {
    currentWeek: 3,
    totalWeeks: 8,
    nextWorkout: 'Upper Body Reset'
  },
  workouts: seedWorkouts(),
  planAdjustments: {},
  repAdjustments: {},
  currentPlan: []
};

function seedWorkouts() {
  const completions = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    completions.push(new Date(now.getTime() - i * MS_PER_DAY).toISOString());
  }
  for (let i = 5; i < 18; i++) {
    completions.push(new Date(now.getTime() - (i + 1) * MS_PER_DAY).toISOString());
  }
  return completions;
}

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanInput(value, fallback = '') {
  const trimmed = (value || '').toString().trim();
  return trimmed.length ? trimmed : fallback;
}

function sanitizeNumberInput(value, { min = null, max = null } = {}) {
  const num = parseFloat(value);
  if (!Number.isFinite(num)) return '';
  if (min !== null && num < min) return '';
  if (max !== null && num > max) return '';
  return num.toString();
}

function renderSexOptions(fieldName, selectedValue, required = false) {
  return SEX_OPTIONS.map((option, index) => `
    <label class="option-chip">
      <input type="radio" name="${fieldName}" value="${option}" ${selectedValue === option ? 'checked' : ''} ${(required && index === 0) ? 'required' : ''}>
      <span>${option}</span>
    </label>
  `).join('');
}

function normalizeDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getAdjustedPercent(basePercent, exerciseName) {
  const offset = userState.planAdjustments[exerciseName] || 0;
  return clamp(basePercent + offset, PERCENT_MIN, PERCENT_MAX);
}

function applyRepDeltaToRange(repRange, exerciseName) {
  const delta = userState.repAdjustments[exerciseName] || 0;
  if (!delta) return repRange;
  const match = repRange.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return repRange;
  const low = parseInt(match[1], 10);
  const high = parseInt(match[2], 10);
  if (Number.isNaN(low) || Number.isNaN(high)) return repRange;
  const newLow = Math.max(1, low + delta);
  const newHigh = Math.max(newLow + 1, high + delta);
  return repRange.replace(match[0], `${newLow}-${newHigh}`);
}

function updatePercentAdjustment(exerciseName, delta) {
  const current = userState.planAdjustments[exerciseName] || 0;
  const next = clamp(current + delta, PERCENT_OFFSET_MIN, PERCENT_OFFSET_MAX);
  userState.planAdjustments[exerciseName] = next;
}

function updateRepAdjustment(exerciseName, delta) {
  const current = userState.repAdjustments[exerciseName] || 0;
  const next = clamp(current + delta, REP_DELTA_MIN, REP_DELTA_MAX);
  userState.repAdjustments[exerciseName] = next;
}

function calculateStreak(workouts) {
  const days = [...new Set(workouts.map(normalizeDay))].sort((a, b) => b - a);
  if (!days.length) return 0;
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

function calculateWorkoutStats() {
  return {
    total: userState.workouts.length,
    streak: calculateStreak(userState.workouts)
  };
}

function getWeeklyChartHeights() {
  const heights = [];
  const today = new Date();
  for (let offset = 6; offset >= 0; offset--) {
    const target = new Date(today.getTime() - offset * MS_PER_DAY);
    target.setHours(0, 0, 0, 0);
    const count = userState.workouts.filter(entry => normalizeDay(entry) === target.getTime()).length;
    const normalized = count === 0 ? 6 : Math.min(100, count * 30 + 10);
    heights.push(normalized);
  }
  return heights;
}

function recordWorkoutCompletion(timestamp = new Date()) {
  userState.workouts.unshift(new Date(timestamp).toISOString());
  if (userState.workouts.length > 365) {
    userState.workouts.length = 365;
  }
  const estimatedWeek = Math.ceil(userState.workouts.length / 3);
  userState.program.currentWeek = Math.min(
    userState.program.totalWeeks,
    Math.max(userState.program.currentWeek, estimatedWeek)
  );
}

function getRecommendedWeight(exercise, benchMax, squatMax, deadliftMax, percent, noMax) {
  if (noMax) return 'N/A';
  const name = exercise.name.toLowerCase();
  if (name.includes('bench')) return benchMax ? `${Math.round(benchMax * percent / 100)} lbs` : 'N/A';
  if (name.includes('squat')) return squatMax ? `${Math.round(squatMax * percent / 100)} lbs` : 'N/A';
  if (name.includes('deadlift')) return deadliftMax ? `${Math.round(deadliftMax * percent / 100)} lbs` : 'N/A';
  return 'Bodyweight or moderate';
}

function normalizeSelection(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function shuffleArray(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function resolveGoalType(profile = {}) {
  const direct = (profile.goalType || '').toLowerCase();
  if (PLAN_GOAL_CONFIGS[direct]) return direct;
  const text = (profile.goal || '').toLowerCase();
  if (text.includes('strong')) return 'get_stronger';
  if (text.includes('fat') || text.includes('lean') || text.includes('cut')) return 'lose_fat';
  if (text.includes('health') || text.includes('energy')) return 'get_healthier';
  return 'build_muscle';
}

function resolveEquipmentKey(profile = {}) {
  const direct = (profile.equipmentAccess || '').toLowerCase();
  if (direct.includes('body')) return 'bodyweight_only';
  if (direct.includes('dumb') || direct.includes('kettlebell')) return 'dumbbells_only';
  if (direct.includes('full') || direct.includes('gym')) return 'full_gym';
  const text = (profile.equipment || '').toLowerCase();
  if (text.includes('body')) return 'bodyweight_only';
  if (text.includes('dumb')) return 'dumbbells_only';
  return 'full_gym';
}

function resolveExperienceLevel(profile = {}) {
  const direct = (profile.experienceLevel || '').toLowerCase();
  if (direct.includes('inter')) return 'intermediate';
  return 'beginner';
}

function resolveDaysPerWeek(profile = {}) {
  const raw = parseInt(profile.daysPerWeek, 10);
  if (Number.isFinite(raw)) return clamp(raw, 2, 5);
  const text = (profile.schedulePreference || '').match(/(\d)/);
  if (text && text[1]) {
    return clamp(parseInt(text[1], 10), 2, 5);
  }
  return 3;
}

function determinePlanLength(daysPerWeek, experienceLevel) {
  if (daysPerWeek <= 2) return 4;
  if (daysPerWeek === 3) return 6;
  return 8;
}

function buildSetRep(goalConfig, weekNumber, isDeload) {
  if (!goalConfig) return { sets: 3, reps: '8-10' };
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
  if (!goalConfig) return '';
  if (isDeload) return 'Deload focus: keep reps smooth, lighten load, and walk away fresh.';
  const notes = goalConfig.progressionNotes || [];
  if (!notes.length) return 'Add a small rep or slow the tempo this week.';
  return notes[(weekNumber - 1) % notes.length];
}

function generateStructuredPlan(profile = {}) {
  const goalKey = resolveGoalType(profile);
  const equipmentKey = resolveEquipmentKey(profile);
  const experienceLevel = resolveExperienceLevel(profile);
  const daysPerWeek = resolveDaysPerWeek(profile);
  const goalConfig = PLAN_GOAL_CONFIGS[goalKey] || PLAN_GOAL_CONFIGS.build_muscle;
  const templates = WORKOUT_LIBRARY[equipmentKey] || WORKOUT_LIBRARY.full_gym;
  const planLengthRaw = determinePlanLength(daysPerWeek, experienceLevel);
  const planLength = clamp(planLengthRaw, 4, 8);
  const deloadWeeks = [];
  if (planLength >= 4) deloadWeeks.push(4);
  if (planLength >= 8) deloadWeeks.push(8);

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
      if (weekIndex === 0 && workoutIndex === 0) return;
      upcoming.push({ id: workout.id, label: `Week ${week.weekNumber} · ${workout.name}` });
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

function calculateMaintenanceCalories(profile = {}) {
  const weight = parseFloat(profile.weight);
  const height = parseFloat(profile.height);
  const age = parseFloat(profile.age);
  if (!Number.isFinite(weight) || !Number.isFinite(height) || !Number.isFinite(age)) {
    return null;
  }
  const weightKg = weight * 0.453592;
  const heightCm = height * 2.54;
  const sex = (profile.sex || '').toLowerCase();
  let sexOffset = -78;
  if (sex === 'female') sexOffset = -161;
  if (sex === 'male') sexOffset = 5;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;
  const activityMultiplier = resolveDaysPerWeek(profile) >= 4 ? 1.45 : 1.3;
  return Math.round(bmr * activityMultiplier);
}

const BASE_STYLES = `
  <style>
    :root {
      --accent: #4f8cff;
      --accent-dark: #325fdc;
      --bg: #070b1b;
      --panel: #101632;
      --panel-light: #161d3f;
      --text: #f5f7ff;
      --muted: #aab4dc;
      --border: rgba(255, 255, 255, 0.08);
      --success: #3dd598;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Segoe UI', 'Inter', sans-serif;
      background: radial-gradient(circle at top, rgba(79,140,255,0.18), transparent 55%), var(--bg);
      color: var(--text);
    }
    a { color: inherit; text-decoration: none; }
    .site-header {
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(16px);
      background: rgba(7,11,27,0.8);
      border-bottom: 1px solid var(--border);
    }
    .header-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand img {
      height: 72px;
      width: auto;
      border-radius: 10px;
    }
    .brand h1 {
      font-size: 1.1rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0;
      color: var(--accent);
    }
    .nav-links {
      display: flex;
      gap: 18px;
      font-size: 0.95rem;
      color: var(--muted);
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .cta-btn {
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid var(--accent);
      color: var(--text);
      background: linear-gradient(120deg, var(--accent), var(--accent-dark));
      font-weight: 600;
    }
    .page-shell {
      max-width: 1100px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }
    .landing-hero {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 32px;
      padding: 48px 36px;
      border-radius: 32px;
      background: linear-gradient(135deg, #101937 0%, #152348 55%, #1f2f5f 100%);
      border: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 45px 80px rgba(0,0,0,0.45);
      margin-bottom: 28px;
    }
    .hero-intro h1 {
      font-size: clamp(2.6rem, 4vw, 3.3rem);
      margin: 12px 0;
    }
    .hero-intro h2 {
      font-size: clamp(1.2rem, 2.8vw, 1.6rem);
      font-weight: 500;
      color: #b8c5e8;
      margin: 0 0 18px;
    }
    .hero-intro p {
      color: #d6def6;
      line-height: 1.65;
      margin: 0 0 28px;
      max-width: 540px;
    }
    .hero-tag {
      display: inline-flex;
      padding: 6px 16px;
      border-radius: 999px;
      background: rgba(255,255,255,0.12);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.78rem;
      color: #c9d7ff;
    }
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
    }
    .hero-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 26px;
      border-radius: 999px;
      font-weight: 600;
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .hero-btn.primary {
      background: linear-gradient(135deg, #7fc4ff, #4f8cff);
      color: #0c1633;
      box-shadow: 0 22px 40px rgba(79,140,255,0.35);
    }
    .hero-btn.secondary {
      border: 1px solid rgba(255,255,255,0.3);
      color: #f5f7ff;
      background: transparent;
    }
    .hero-btn:hover { transform: translateY(-2px); }
    .hero-secondary-card {
      background: rgba(255,255,255,0.04);
      border-radius: 28px;
      border: 1px solid rgba(255,255,255,0.08);
      padding: 28px 30px;
      box-shadow: 0 35px 60px rgba(7,11,27,0.55);
    }
    .hero-secondary-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
      color: #d1dcfa;
      line-height: 1.8;
    }
    .hero-secondary-card li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .hero-secondary-card li::before {
      content: '•';
      color: #7fc4ff;
      font-size: 1.2rem;
      line-height: 1;
      margin-top: 2px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35);
    }
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      align-items: stretch;
    }
    .plan-shell {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .plan-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }
    .plan-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.4);
    }
    .plan-today-card h2 {
      margin: 8px 0 4px;
      font-size: clamp(1.8rem, 4vw, 2.3rem);
    }
    .plan-today-card p {
      color: var(--muted);
      margin: 4px 0;
    }
    .plan-stats {
      display: flex;
      gap: 18px;
      margin-top: 18px;
      flex-wrap: wrap;
    }
    .plan-stats div {
      background: rgba(255,255,255,0.04);
      border-radius: 14px;
      padding: 12px 16px;
      min-width: 110px;
    }
    .plan-stats small {
      display: block;
      color: var(--muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .plan-stats strong {
      font-size: 1.2rem;
    }
    .plan-upcoming-card h3 {
      margin-top: 0;
    }
    .plan-upcoming-list {
      list-style: none;
      padding: 0;
      margin: 14px 0 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .plan-upcoming-list li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border: 1px dashed var(--border);
      border-radius: 14px;
      color: var(--muted);
    }
    .plan-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
    }
    .week-column {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .week-column h4 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
    }
    .deload-pill {
      padding: 2px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.12);
      font-size: 0.75rem;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .workout-card {
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.08);
      padding: 18px;
      background: var(--panel-light);
      box-shadow: 0 18px 45px rgba(0,0,0,0.35);
      filter: none;
      transition: border-color 0.2s ease, filter 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .workout-card.locked {
      filter: grayscale(0.3) brightness(0.85);
    }
    .workout-card.locked::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(7,11,27,0.55);
      border-radius: 18px;
      pointer-events: none;
    }
    .workout-card.active {
      border-color: var(--accent);
      filter: none;
    }
    .workout-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .workout-name {
      margin: 0;
      font-weight: 600;
    }
    .workout-focus {
      margin: 4px 0 8px;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .lock-icon {
      font-size: 1.2rem;
      z-index: 2;
    }
    .progression-note {
      margin: 0 0 12px;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .exercise-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      z-index: 2;
    }
    .exercise-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .exercise-row:last-child { border-bottom: none; }
    .exercise-title {
      margin: 0;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .exercise-cue {
      margin: 2px 0 0;
      color: var(--muted);
      font-size: 0.85rem;
    }
    .exercise-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-end;
      font-size: 0.85rem;
    }
    .exercise-meta input {
      width: 90px;
      border-radius: 10px;
      border: 1px solid var(--border);
      padding: 6px 8px;
      background: rgba(255,255,255,0.05);
      color: var(--text);
      text-align: center;
    }
    .exercise-meta input:disabled {
      opacity: 0.6;
    }
    .plan-toast {
      position: sticky;
      bottom: 18px;
      align-self: flex-end;
      background: rgba(7,11,27,0.85);
      padding: 12px 18px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text);
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
    }
    .plan-toast.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .relaxed-section {
      margin-top: 36px;
      padding: 36px;
      border-radius: 24px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 30px 60px rgba(0,0,0,0.4);
    }
    .relaxed-header {
      text-align: center;
      margin-bottom: 36px;
    }
    .relaxed-header h3 {
      margin: 0 0 12px;
      font-size: clamp(2rem, 3vw, 2.7rem);
    }
    .relaxed-header p {
      color: var(--muted);
      max-width: 620px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .relaxed-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .relaxed-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 180px;
    }
    .relaxed-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }
    .relaxed-card h4 {
      margin: 0;
      font-size: 1.1rem;
    }
    .relaxed-card p {
      color: var(--muted);
      line-height: 1.5;
      margin: 0;
    }
    .subscription-section {
      margin-top: 32px;
      padding: 36px;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(16,25,55,0.95), rgba(21,35,72,0.95));
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 30px 60px rgba(0,0,0,0.45);
    }
    .subscription-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .subscription-header h3 {
      margin: 0 0 10px;
      font-size: clamp(2rem, 3vw, 2.6rem);
    }
    .subscription-header p {
      color: var(--muted);
      margin: 0 auto;
      max-width: 620px;
      line-height: 1.6;
    }
    .subscription-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .subscription-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.35);
    }
    .subscription-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(255,255,255,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
    }
    .subscription-card h4 {
      margin: 0;
      font-size: 1.05rem;
    }
    .subscription-card p {
      color: var(--muted);
      line-height: 1.5;
      margin: 0;
    }
    .subscription-pricing {
      margin-top: 28px;
      padding: 24px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(7,11,27,0.55);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 18px;
      align-items: center;
    }
    .pricing-copy h4 {
      margin: 0 0 6px;
      font-size: 1.4rem;
    }
    .pricing-copy p {
      margin: 0;
      color: var(--muted);
    }
    .pricing-amounts {
      display: flex;
      gap: 16px;
      font-size: 1.4rem;
      font-weight: 600;
    }
    .pricing-amounts span { color: #cfe0ff; }
    .subscription-cta {
      padding: 14px 24px;
      border-radius: 999px;
      background: linear-gradient(135deg, #7fc4ff, #4f8cff);
      color: #0c1633;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 22px 40px rgba(79,140,255,0.3);
    }
    .hero-copy h2 {
      font-size: clamp(2rem, 4vw, 2.8rem);
      margin: 0 0 12px;
    }
    .hero-copy p {
      color: var(--muted);
      line-height: 1.5;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(79,140,255,0.15);
      color: var(--accent);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    form label.option {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 4px;
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--panel-light);
      cursor: pointer;
      font-size: 0.9rem;
    }
    .toggle-btn {
      background: none;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 14px;
      color: var(--muted);
      cursor: pointer;
      font-size: 0.85rem;
    }
    .primary-btn {
      display: inline-flex;
      justify-content: center;
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: none;
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(135deg, var(--accent), var(--accent-dark));
      margin-top: 14px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 18px;
      margin-top: 32px;
    }
    .info-card {
      padding: 18px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--panel-light);
    }
    .plan-table {
      width: 100%;
      border-collapse: collapse;
      color: var(--text);
    }
    .plan-table th,
    .plan-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
    }
    .plan-table th {
      text-align: left;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 1px;
      color: var(--muted);
    }
    .plan-table tbody tr:hover {
      background: rgba(79,140,255,0.05);
    }
    .plan-feedback-card {
      margin-top: 24px;
    }
    .plan-feedback-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .feedback-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding: 14px 0;
      border-bottom: 1px solid var(--border);
    }
    .feedback-row:last-child {
      border-bottom: none;
    }
    .feedback-subtext {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 0.85rem;
    }
    .feedback-options {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .feedback-options label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 6px 14px;
      font-size: 0.9rem;
      cursor: pointer;
      background: var(--panel-light);
    }
    .feedback-options input {
      accent-color: var(--accent);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
      gap: 16px;
    }
    .summary-card {
      padding: 18px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--panel-light);
    }
    .onboarding-panel {
      max-width: 720px;
      margin: 0 auto;
    }
    .onboarding-panel h2 {
      margin-top: 0;
      font-size: clamp(2rem, 4vw, 2.6rem);
    }
    .onboarding-lede {
      color: var(--muted);
      margin: 0 0 24px;
      line-height: 1.6;
    }
    .onboarding-form {
      display: grid;
      gap: 16px;
    }
    .onboarding-form label {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 0.9rem;
      color: var(--muted);
    }
    .onboarding-form input,
    .onboarding-form textarea,
    .onboarding-form select {
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.04);
      color: var(--text);
      padding: 12px 14px;
      font-size: 1rem;
    }
    .onboarding-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }
    .option-chip-fieldset {
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 14px;
      padding: 10px 16px 16px;
      margin: 0;
      min-width: 0;
    }
    .option-chip-fieldset legend {
      font-size: 0.82rem;
      color: var(--muted);
      padding: 0 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .option-chip-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
    }
    .option-chip {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    .option-chip input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    .option-chip span {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.18);
      padding: 8px 16px;
      font-size: 0.95rem;
      background: rgba(255,255,255,0.05);
      transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
    }
    .option-chip input:checked + span {
      border-color: var(--accent);
      background: rgba(79,140,255,0.2);
      color: var(--text);
      font-weight: 600;
    }
    .profile-shell {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .profile-summary-card {
      background: linear-gradient(145deg, #ffffff, #f5f7ff);
      color: #111531;
      border-radius: 24px;
      padding: 32px;
      border: 1px solid rgba(14,23,53,0.08);
      box-shadow: 0 25px 55px rgba(7,14,40,0.18);
    }
    .profile-summary-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
      flex-wrap: wrap;
    }
    .profile-eyebrow {
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.78rem;
      color: #6f7a9f;
      margin: 0 0 4px;
    }
    .profile-summary-card h2 {
      margin: 0 0 6px;
      font-size: clamp(1.8rem, 3vw, 2.4rem);
    }
    .profile-summary-subtitle {
      color: #4b557a;
      margin: 0;
      line-height: 1.5;
    }
    .profile-pill {
      padding: 8px 16px;
      border-radius: 999px;
      background: rgba(79,140,255,0.15);
      color: #325fdc;
      font-weight: 600;
      border: 1px solid rgba(79,140,255,0.35);
    }
    .profile-meta {
      margin-top: 28px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 18px;
    }
    .profile-meta-item {
      background: rgba(255,255,255,0.9);
      border-radius: 18px;
      padding: 16px 18px;
      border: 1px solid rgba(15,23,42,0.08);
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
    }
    .profile-meta-item span {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #7d88b2;
      margin-bottom: 6px;
    }
    .profile-meta-item strong {
      font-size: 1.05rem;
      color: #111531;
      font-weight: 600;
      line-height: 1.4;
    }
    .profile-program-card {
      background: linear-gradient(135deg, #1d274a, #325fdc 50%, #4f8cff 90%);
      border-radius: 28px;
      padding: 34px 32px;
      color: #f6f8ff;
      box-shadow: 0 35px 75px rgba(27,37,79,0.55);
      display: flex;
      flex-direction: column;
      gap: 22px;
    }
    .program-label {
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 0.75rem;
      color: rgba(245,247,255,0.78);
      margin: 0 0 6px;
    }
    .program-week-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .program-week-row h3 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 2.6rem);
    }
    .program-subtitle {
      margin: 6px 0 18px;
      font-size: 1.05rem;
      color: rgba(246,248,255,0.9);
    }
    .program-subtitle span {
      font-weight: 600;
      color: #ffffff;
    }
    .program-progress {
      width: 100%;
      height: 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.25);
      overflow: hidden;
    }
    .program-progress-fill {
      height: 100%;
      border-radius: 999px;
      background: #3dd598;
    }
    .program-start-btn {
      border: none;
      border-radius: 18px;
      padding: 18px;
      font-size: 1.05rem;
      font-weight: 700;
      color: #ffffff;
      background: linear-gradient(135deg, var(--accent), var(--accent-dark));
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 20px 40px rgba(13,18,37,0.35);
    }
    .program-start-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 24px 46px rgba(13,18,37,0.45);
    }
    .profile-progress-card {
      background: var(--panel-light);
      border-radius: 22px;
      padding: 28px 30px;
      border: 1px solid var(--border);
      box-shadow: 0 20px 48px rgba(0,0,0,0.35);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .progress-eyebrow {
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.75rem;
      color: var(--muted);
      margin: 0 0 4px;
    }
    .profile-progress-card h3 {
      margin: 0;
      font-size: 1.6rem;
    }
    .profile-progress-card p {
      margin: 6px 0 0;
      color: var(--muted);
    }
    .progress-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 18px;
    }
    .progress-metric {
      background: rgba(255,255,255,0.04);
      border-radius: 16px;
      padding: 16px 18px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .progress-metric span {
      font-size: 0.75rem;
      letter-spacing: 1px;
      color: var(--muted);
      text-transform: uppercase;
      display: block;
      margin-bottom: 6px;
    }
    .progress-metric strong {
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--text);
    }
    .progress-mini-chart {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      height: 80px;
    }
    .progress-mini-chart span {
      flex: 1;
      background: rgba(255,255,255,0.18);
      border-radius: 999px 999px 6px 6px;
      min-width: 8px;
    }
    .profile-settings-card {
      background: rgba(255,255,255,0.04);
      border-radius: 18px;
      padding: 22px 24px;
      border: 1px dashed rgba(255,255,255,0.2);
      color: var(--muted);
    }
    .profile-settings-card h4 {
      margin: 0;
      font-size: 1.15rem;
      color: var(--text);
    }
    .profile-settings-card p {
      margin: 6px 0 0;
      color: var(--muted);
    }
    .profile-settings-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 14px;
    }
    .settings-link {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 8px 16px;
      font-size: 0.9rem;
      color: var(--muted);
      background: transparent;
      text-decoration: none;
      transition: border-color 0.2s ease, color 0.2s ease;
    }
    .settings-link:hover {
      border-color: var(--accent);
      color: var(--text);
    }
    .profile-settings-forms {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }
    .settings-inline-form {
      background: rgba(0,0,0,0.25);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 16px;
      display: grid;
      gap: 12px;
    }
    .settings-inline-form label {
      font-size: 0.85rem;
      color: var(--muted);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .settings-inline-form input,
    .settings-inline-form textarea,
    .settings-inline-form select {
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(0,0,0,0.15);
      color: var(--text);
      padding: 10px 12px;
      font-size: 0.95rem;
    }
    .settings-inline-form textarea {
      min-height: 72px;
      resize: vertical;
    }
    .settings-inline-form button {
      justify-self: flex-start;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text);
      padding: 8px 18px;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .settings-inline-form button:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .settings-inline-form .option-chip-fieldset {
      border-color: var(--border);
      background: rgba(0,0,0,0.15);
    }
    footer {
      text-align: center;
      color: var(--muted);
      font-size: 0.8rem;
      padding: 24px 0 32px;
    }
    @media (max-width: 900px) {
      .header-inner { flex-direction: column; gap: 12px; }
      .nav-links { justify-content: center; }
      .page-shell { padding: 36px 18px 64px; }
      .landing-hero { padding: 40px 24px; grid-template-columns: 1fr; }
      .hero-actions { flex-direction: column; }
      .hero-btn { width: 100%; }
      .relaxed-section { padding: 32px 22px; }
      .subscription-section { padding: 32px 22px; }
      .plan-overview { grid-template-columns: 1fr; }
      .plan-card { padding: 24px; }
      .plan-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
      .plan-stats { flex-direction: column; }
      .plan-upcoming-list li { justify-content: flex-start; }
    }
    @media (max-width: 640px) {
      form label.option { width: 100%; justify-content: flex-start; }
      .plan-table { font-size: 0.85rem; }
      .hero-secondary-card { order: -1; }
      .plan-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 520px) {
      .page-shell { padding: 28px 14px 56px; }
      .hero-intro h1 { font-size: 2.1rem; }
      .hero-intro h2 { font-size: 1.1rem; }
      .plan-card { padding: 20px; }
      .plan-upcoming-list li { flex-direction: column; align-items: flex-start; }
      .exercise-row { flex-direction: column; align-items: flex-start; }
      .exercise-meta { width: 100%; flex-direction: row; justify-content: space-between; }
      .exercise-meta input { width: 100%; }
      .subscription-pricing { align-items: flex-start; }
      .pricing-amounts { width: 100%; justify-content: space-between; }
    }
  </style>
`;

function renderPage(title, mainContent) {
  return `
    <html>
      <head>
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/styles/main.css">
        ${BASE_STYLES}
      </head>
      <body>
        <header class="site-header">
          <div class="header-inner">
            <div class="brand">
              <img src="/images/allaround-athlete-logo.png" alt="AllAroundAthlete Logo">
              <h1>All-Around Athlete</h1>
            </div>
            <nav class="nav-links">
              <a href="/">Home</a>
              <a href="/planner">Planner</a>
              <a href="/plan-generator">Plan Generator</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/profile">Profile</a>
              <a href="/subscribe" class="cta-btn">Subscribe</a>
            </nav>
          </div>
        </header>
        <main class="page-shell">
          ${mainContent}
        </main>
        <footer>
          © ${new Date().getFullYear()} AllAroundAthlete · Built for everyday consistency
        </footer>
      </body>
    </html>
  `;
}

app.get('/planner', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  const equipmentOptions = EQUIPMENT_LIST.map(eq =>
    `<label class="option" data-equip="${eq}"><input type="checkbox" name="equipment" value="${eq}"> ${eq}</label>`
  ).join('');
  const muscleOptions = MUSCLE_GROUPS.map(mg =>
    `<label class="option" data-muscle="${mg}"><input type="checkbox" name="muscle" value="${mg}"> ${mg}</label>`
  ).join('');

  const landingContent = `
    <section class="panel" style="margin-bottom:28px;">
      <div class="hero-copy">
        <span class="badge">Why another planner?</span>
        <h2 style="margin:12px 0 12px;">Most "beginner" apps assume you already speak gym fluently.</h2>
        <p style="color:var(--muted);line-height:1.6;max-width:820px;">
          They throw strange words at you, hand over long plans, and never explain what to do after you walk past the front desk. AllAroundAthlete keeps each screen calm, limits you to a few useful moves, and turns your goal into plain rep, set, and manners tips so you never feel out of place.
        </p>
      </div>
    </section>
    <section class="hero-grid">
      <div class="panel hero-copy">
        <span class="badge">Starter program</span>
        <h2>Build a realistic session with the gear you actually have.</h2>
        <p>AllAroundAthlete designs beginner-friendly workouts that respect limited equipment, short time windows, and fresh motivation. No fluff—just three to five purposeful movements with dialed-in rep and set targets.</p>
        <div class="info-grid">
          <div class="info-card">
            <small style="color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Goal Support</small>
            <h3 style="margin:6px 0 0;">Dieting & Bulking tracks</h3>
          </div>
          <div class="info-card">
            <small style="color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Smart Equipment</small>
            <h3 style="margin:6px 0 0;">Auto filters for beginners</h3>
          </div>
          <div class="info-card">
            <small style="color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Subscription ready</small>
            <h3 style="margin:6px 0 0;">Stripe + Cloudflare stack</h3>
          </div>
        </div>
      </div>
      <div class="panel">
        <h3 style="margin-top:0;">Plan your next lift</h3>
        <p style="color:var(--muted);margin-bottom:18px;">Choose the tools on hand and the muscle groups you want to prioritize today.</p>
        <form method="POST" action="/plan">
          <p style="margin-bottom:6px;font-weight:600;">Equipment</p>
          <button type="button" onclick="toggleSection('equip-section')" class="toggle-btn">Select equipment</button>
          <div id="equip-section" style="display:none;margin:12px 0 20px;">
            ${equipmentOptions}
          </div>
          <p style="margin-bottom:6px;font-weight:600;">Muscle Groups</p>
          <button type="button" onclick="toggleSection('muscle-section')" class="toggle-btn">Select muscle focus</button>
          <div id="muscle-section" style="display:none;margin:12px 0 20px;">
            ${muscleOptions}
          </div>
          <button type="submit" class="primary-btn">Generate plan</button>
        </form>
      </div>
    </section>
    <section class="hero-grid" style="margin-top:32px;" id="gymxiety">
      <div class="panel">
        <span class="badge">Gymxiety Mode</span>
        <h3 style="margin:12px 0 8px;">Confidence coaching built into the basic membership.</h3>
        <p style="color:var(--muted);line-height:1.6;">Automatic reminders, polite prompts, and gym-etiquette walk-throughs show up inside every plan once you subscribe. You will know how to approach equipment, share the space, and avoid those awkward “am I doing this right?” moments.</p>
        <p style="color:var(--muted);margin-top:18px;">Turn it on from your dashboard and Gymxiety Mode travels with you—whether it’s a commercial gym, apartment setup, or hotel fitness room.</p>
      </div>
      <div class="panel">
        <h3 style="margin-top:0;">Subscription ready</h3>
        <p style="color:var(--muted);line-height:1.6;">Hosted on Cloudflare for instant global performance and connected to Stripe for secure billing. When you upgrade, Gymxiety Mode unlocks set check-ins, etiquette micro-lessons, and equipment walkthroughs.</p>
        <div class="info-card" style="margin-top:18px;">
          <small style="color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Coming soon</small>
          <h3 style="margin:8px 0 0;">Add-on packs for commercial gyms, apartment gyms, and hotel gyms.</h3>
        </div>
      </div>
    </section>
    <script>
      function toggleSection(id) {
        const section = document.getElementById(id);
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
      }
    </script>
  `;

  res.send(renderPage('AllAroundAthlete - Starter Gym Planner', landingContent));
});

app.get('/', (req, res) => {
  const ctaHref = userState.isSubscribed ? (userState.profile.onboardingComplete ? '/planner' : '/onboarding') : '/subscribe';
  const ctaLabel = userState.isSubscribed ? (userState.profile.onboardingComplete ? 'Open Planner' : 'Finish Setup') : 'Start My Plan';
  const marketingContent = `
    <section class="landing-hero">
      <div class="hero-intro">
        <span class="hero-tag">Beginner Friendly</span>
        <h1>Structure without stress for brand-new lifters.</h1>
        <h2>The only beginner app that swaps loud, crowded advice for calm, plain steps.</h2>
        <p>Other starter tools assume you already speak gym; we slow everything down. You get short workouts, soft words, and zero pressure—plus tiny etiquette nudges so walking in feels natural.</p>
        <div class="hero-actions">
          <a class="hero-btn primary" href="${ctaHref}">Start Free</a>
          <a class="hero-btn secondary" href="#relaxed">Learn More</a>
        </div>
      </div>
      <div class="hero-secondary-card">
        <ul>
          <li>Made for beginners who want a plan without stress.</li>
          <li>Eases gym nerves with short, clear workouts.</li>
          <li>No complicated numbers, no confusing talk, no overload.</li>
          <li>Every screen keeps things obvious, calm, and easy.</li>
        </ul>
      </div>
    </section>
    <section class="relaxed-section" id="relaxed">
      <div class="relaxed-header">
        <h3>A Relaxed Approach to Fitness</h3>
        <p>AllAroundAthlete is a calm corner of the gym world. We keep steps tiny, words soft, and guidance steady so you can focus on just showing up.</p>
      </div>
      <div class="relaxed-grid">
        <article class="relaxed-card">
          <div class="relaxed-icon" aria-hidden="true">🌿</div>
          <h4>No overwhelming choices</h4>
          <p>We pick a handful of moves for you, explain why they matter, and remove extra buttons so you can press start without second-guessing.</p>
        </article>
        <article class="relaxed-card">
          <div class="relaxed-icon" aria-hidden="true">🔢</div>
          <h4>No complicated metrics</h4>
          <p>You will never see mystery charts or math puzzles. Just plain reps, sets, and soft reminders to breathe and move with control.</p>
        </article>
        <article class="relaxed-card">
          <div class="relaxed-icon" aria-hidden="true">🧭</div>
          <h4>Simple, guided workouts</h4>
          <p>Each session feels like a friend texting you what to do next. Short cues, gentle pacing, and check-ins keep you grounded from warm-up to finisher.</p>
        </article>
        <article class="relaxed-card">
          <div class="relaxed-icon" aria-hidden="true">💛</div>
          <h4>Designed for gym anxiety</h4>
          <p>Etiquette nudges, shared-space tips, and calm language help you walk in with confidence even if gyms have felt scary before.</p>
        </article>
      </div>
    </section>
    <section class="subscription-section" id="subscription-benefits">
      <div class="subscription-header">
        <h3>What You Get With Your Subscription</h3>
        <p>Unlock every calm tool we build—designed for brand-new lifters who want structure without stress.</p>
      </div>
      <div class="subscription-grid">
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">🧩</div>
          <h4>Personalized training plan</h4>
          <p>We match your goals and available equipment to short sessions you can actually finish.</p>
        </article>
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">📋</div>
          <h4>Beginner-friendly workouts</h4>
          <p>Each move comes with simple cues, tempo notes, and manners tips so you always know what to do.</p>
        </article>
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">🍽️</div>
          <h4>Maintenance calorie calculator</h4>
          <p>Dial in portions with a calm, plain calculator made for real life schedules.</p>
        </article>
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">📈</div>
          <h4>Progress tracking & check-ins</h4>
          <p>Weekly nudge reminders and streak views keep you accountable without pressure.</p>
        </article>
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">🚀</div>
          <h4>Future modules unlocked</h4>
          <p>Gain access to every new pack we ship—running prep, mobility resets, and hybrid training.</p>
        </article>
      </div>
      <div class="subscription-pricing">
        <div class="pricing-copy">
          <h4>Try it free, stay for the calm coaching.</h4>
          <p>$7.99 per month or $49.99 per year after the trial.</p>
        </div>
        <div class="pricing-amounts">
          <span>$7.99/mo</span>
          <span>$49.99/yr</span>
        </div>
        <a class="subscription-cta" href="${ctaHref}">Start Free</a>
      </div>
    </section>
  `;

  res.send(renderPage('AllAroundAthlete - Welcome', marketingContent));
});

app.get('/subscribe', (req, res) => {
  if (userState.isSubscribed && !userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  if (userState.isSubscribed) {
    return res.redirect('/planner');
  }
  const subscribeContent = `
    <section class="panel onboarding-panel">
      <span class="badge">Membership</span>
      <h2>Unlock the calm planner.</h2>
      <p class="onboarding-lede">We are not processing real payments inside this demo—tap the button below to simulate a subscription and move into onboarding.</p>
      <form method="POST" action="/subscribe" class="onboarding-form">
        <button class="primary-btn" type="submit">Confirm subscription</button>
      </form>
      <p style="color:var(--muted);margin-top:12px;font-size:0.9rem;">Already subscribed? <a href="/planner" style="color:var(--text);">Head to your planner.</a></p>
    </section>
  `;
  res.send(renderPage('Subscribe - AllAroundAthlete', subscribeContent));
});

app.post('/subscribe', (req, res) => {
  if (userState.isSubscribed) {
    return res.redirect(userState.profile.onboardingComplete ? '/planner' : '/onboarding');
  }
  userState.isSubscribed = true;
  userState.profile.onboardingComplete = false;
  res.redirect('/onboarding');
});

app.post('/plan', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  const selectedEquipment = normalizeSelection(req.body.equipment);
  const selectedMuscles = normalizeSelection(req.body.muscle);
  let mode = req.body.mode || 'dieting';
  let percent = parseFloat(req.body.percent) || 70;
  const noMax = req.body.no_max === 'on';
  const workoutTime = parseInt(req.body.workout_time) || 60;
  const exercisesPerGroup = workoutTime <= 45 ? 2 : 3;
  const beginnerMode = req.body.beginner_mode === 'on';

  let benchMax = noMax ? 0 : parseFloat(req.body.bench_max) || 0;
  let squatMax = noMax ? 0 : parseFloat(req.body.squat_max) || 0;
  let deadliftMax = noMax ? 0 : parseFloat(req.body.deadlift_max) || 0;

  const repRange = mode === 'bulking' ? '4-8 reps, heavy weight' : '12-20 reps, light/moderate weight';
  const setsPerExercise = mode === 'bulking' ? '4 sets' : '3 sets';

  let filteredEquipment = selectedEquipment;
  let filteredMuscles = selectedMuscles;
  if (beginnerMode) {
    filteredEquipment = filteredEquipment.filter(eq => BEGINNER_EQUIPMENT.includes(eq));
    filteredMuscles = filteredMuscles.filter(mg => BEGINNER_MUSCLES.includes(mg));
  }

  let plan = [];
  filteredMuscles.forEach(muscle => {
    const matches = EXERCISES.filter(ex =>
      ex.muscle_group === muscle &&
      ex.equipment.some(eq => filteredEquipment.includes(eq) || (eq === "Bodyweight" && filteredEquipment.includes("Bodyweight Only")))
    );
    const shuffledMatches = shuffleArray(matches);
    plan = plan.concat(shuffledMatches.slice(0, exercisesPerGroup));
  });

  const MIN_MOVEMENTS = 3;
  const MAX_MOVEMENTS = 5;
  if (plan.length >= MIN_MOVEMENTS) {
    const targetCount = Math.min(plan.length, MAX_MOVEMENTS);
    if (plan.length > targetCount) {
      plan = shuffleArray(plan).slice(0, targetCount);
    }
  }

  let planRows = [];
  if (plan.length) {
    planRows = plan.map((ex, index) => {
      const exerciseKey = ex.name;
      const adjustedPercent = getAdjustedPercent(percent, exerciseKey);
      const recommendedWeight = getRecommendedWeight(ex, benchMax, squatMax, deadliftMax, adjustedPercent, noMax);
      const usesWeight = /lbs/i.test(recommendedWeight);
      const displayedRepRange = usesWeight ? repRange : applyRepDeltaToRange(repRange, exerciseKey);
      return {
        id: index,
        exercise: ex.name,
        equipment: ex.equipment.join(', '),
        muscle: ex.muscle_group,
        repRange: displayedRepRange,
        sets: setsPerExercise,
        recommendedWeight,
        description: ex.howto,
        video: ex.video,
        usesWeight
      };
    });
    userState.currentPlan = planRows.map(row => ({
      id: row.id,
      name: row.exercise,
      usesWeight: row.usesWeight
    }));
  } else {
    userState.currentPlan = [];
  }

  const planTable = planRows.length
    ? `
      <div style="overflow-x:auto;width:100%;">
        <table class="plan-table" style="min-width:960px;margin:auto;">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Equipment</th>
              <th>Muscle Group</th>
              <th>Rep Range</th>
              <th>Sets</th>
              <th>Recommended Weight</th>
              <th>Description</th>
              <th>Demo</th>
            </tr>
          </thead>
          <tbody>
            ${planRows.map(row => `
                <tr>
                  <td>${row.exercise}</td>
                  <td>${row.equipment}</td>
                  <td>${row.muscle}</td>
                  <td>${row.repRange}</td>
                  <td>${row.sets}</td>
                  <td>${row.recommendedWeight}</td>
                  <td style="max-width:320px;">${row.description}</td>
                  <td>${row.video ? `<iframe width="160" height="90" src="${row.video}" title="${row.exercise} demo" frameborder="0" allowfullscreen style="border-radius:6px;"></iframe>` : ''}</td>
                </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
    : '<p>No workouts available for selected equipment and muscle group.</p>';

  const feedbackPanel = planRows.length
    ? `
      <section class="panel plan-feedback-card">
        <h3 style="margin-top:0;">Did any set feel off?</h3>
        <p style="color:var(--muted);margin:6px 0 18px;">Select how each lift felt so we can gently adjust weight or reps next time.</p>
        <form method="POST" action="/plan/feedback" class="plan-feedback-form">
          ${planRows.map(row => `
            <div class="feedback-row">
              <div>
                <strong>${row.exercise}</strong>
                <p class="feedback-subtext">${row.usesWeight ? 'Weight calibration' : 'Rep calibration'}</p>
              </div>
              <div class="feedback-options">
                <label><input type="radio" name="feedback_${row.id}" value="too_easy" required> Too easy</label>
                <label><input type="radio" name="feedback_${row.id}" value="perfect"> Perfect</label>
                <label><input type="radio" name="feedback_${row.id}" value="too_hard"> Too hard</label>
              </div>
            </div>
          `).join('')}
          <button type="submit" class="primary-btn" style="margin-top:12px;">Save adjustments</button>
        </form>
      </section>
    `
    : '';

  const planContent = `
    <section class="panel" style="margin-bottom:24px;">
      <h2 style="margin-top:0;">Session overview</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <small style="color:var(--muted);">Movements</small>
          <h3 style="margin:6px 0 0;">${planRows.length || 0}</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Focus</small>
          <h3 style="margin:6px 0 0;">${filteredMuscles.slice(0, 2).join(', ') || 'General'}</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Intensity</small>
          <h3 style="margin:6px 0 0;">${repRange} · ${setsPerExercise}</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Mode</small>
          <h3 style="margin:6px 0 0;">${mode === 'bulking' ? 'Bulking' : 'Dieting'}</h3>
        </div>
      </div>
    </section>
    <section class="panel" style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
        <div>
          <h2 style="margin:0;">Your custom gym plan</h2>
          <p style="color:var(--muted);margin:6px 0 0;">Purposeful lifts matched to your selected equipment.</p>
        </div>
        <a href="/planner" class="cta-btn" style="text-decoration:none;">Start over</a>
      </div>
      ${planTable}
    </section>
    ${feedbackPanel}
  `;

  res.send(renderPage('Your Custom Gym Plan - AllAroundAthlete', planContent));
});

app.post('/plan/feedback', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  if (!userState.currentPlan.length) {
    return res.redirect('/planner');
  }

  userState.currentPlan.forEach(entry => {
    const choice = req.body[`feedback_${entry.id}`];
    if (!choice) return;
    if (entry.usesWeight) {
      if (choice === 'too_easy') updatePercentAdjustment(entry.name, PERCENT_STEP);
      if (choice === 'too_hard') updatePercentAdjustment(entry.name, -PERCENT_STEP);
      if (choice === 'perfect') return; // no change
    } else {
      if (choice === 'too_easy') updateRepAdjustment(entry.name, REP_STEP);
      if (choice === 'too_hard') updateRepAdjustment(entry.name, -REP_STEP);
      if (choice === 'perfect') return;
    }
  });

  res.redirect('/planner');
});

app.get('/plan-generator', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }

  const planData = generateStructuredPlan(userState.profile);
  const stats = calculateWorkoutStats();
  const maintenanceCalories = calculateMaintenanceCalories(userState.profile);

  const renderExercises = exercises => exercises.map(ex => `
        <div class="exercise-row">
          <div>
            <p class="exercise-title">${escapeHTML(ex.name)}</p>
            <p class="exercise-cue">${escapeHTML(ex.cue)}</p>
          </div>
          <div class="exercise-meta">
            <span>${escapeHTML(String(ex.sets))} x ${escapeHTML(ex.reps)}</span>
            <input type="text" placeholder="${escapeHTML(ex.weightPlaceholder)}" ${ex.allowWeight ? '' : 'disabled'}>
          </div>
        </div>
  `).join('');

  const planGrid = planData.weeks.map(week => `
      <div class="week-column">
        <h4>Week ${week.weekNumber} ${week.isDeload ? '<span class="deload-pill">Deload</span>' : ''}</h4>
        <p style="color:var(--muted);margin:0 0 6px;">${week.isDeload ? 'Ease back on volume and focus on breathing.' : 'Add tiny reps or plates while staying calm.'}</p>
        ${week.workouts.map(workout => `
          <article class="workout-card locked" data-workout-card="${workout.id}">
            <div class="workout-card-top">
              <div>
                <p class="workout-name">${escapeHTML(workout.name)}</p>
                <p class="workout-focus">${escapeHTML(workout.focus)}</p>
              </div>
              <span class="lock-icon">🔒</span>
            </div>
            <p class="progression-note">${escapeHTML(workout.progression)}</p>
            <div class="exercise-list">
              ${renderExercises(workout.exercises)}
            </div>
          </article>
        `).join('')}
      </div>
  `).join('');

  const upcomingItems = planData.upcoming.slice(0, 5).map(item => `
        <li>
          <span role="img" aria-hidden="true">🔒</span>
          <span>${escapeHTML(item.label)}</span>
        </li>
  `).join('') || '<li>Fresh workouts will appear here after generation.</li>';

  const today = planData.today;
  const planContent = `
    <section class="plan-shell">
      <div class="plan-overview">
        <div class="plan-card plan-today-card">
          <span class="badge">Your Plan</span>
          <p style="margin:8px 0 0;">Week 1 of ${planData.planLength}-week calm progression</p>
          <h2>${escapeHTML(today.title)}</h2>
          <p>${escapeHTML(today.focus)}</p>
          <p class="progression-note">${escapeHTML(today.progression)}</p>
          <p class="progression-note" data-today-status>Locked until you press start.</p>
          <p style="color:var(--muted);font-size:0.9rem;margin-top:6px;">Goal: ${escapeHTML(planData.goalLabel)} · Equipment: ${escapeHTML(planData.equipmentLabel)}</p>
          <button class="primary-btn plan-start-btn" data-start-workout>Start Workout</button>
          <div class="plan-stats">
            <div>
              <small>Streak</small>
              <strong data-streak-count data-base-streak="${stats.streak}">${stats.streak}</strong>
            </div>
            <div>
              <small>Maintenance</small>
              <strong>${maintenanceCalories ? `${maintenanceCalories} kcal` : 'Add stats'}</strong>
            </div>
            <div>
              <small>Days / Week</small>
              <strong>${planData.daysPerWeek}</strong>
            </div>
          </div>
        </div>
        <div class="plan-card plan-upcoming-card">
          <h3>Upcoming (locked)</h3>
          <ul class="plan-upcoming-list">
            ${upcomingItems}
          </ul>
          <p style="color:var(--muted);margin-top:12px;font-size:0.9rem;">Future sessions stay blurred until the day arrives.</p>
        </div>
      </div>
      <section class="plan-grid">
        ${planGrid}
      </section>
      <div class="plan-toast" id="plan-toast" role="status" aria-live="polite"></div>
    </section>
    <script>
      (() => {
        const PLAN_DATA = ${JSON.stringify({ todayId: today.id })};
        const startBtn = document.querySelector('[data-start-workout]');
        const todayStatus = document.querySelector('[data-today-status]');
        const streakEl = document.querySelector('[data-streak-count]');
        const cards = Array.from(document.querySelectorAll('[data-workout-card]'));
        const toast = document.getElementById('plan-toast');
        let unlockedId = null;

        const showToast = message => {
          if (!toast) return;
          toast.textContent = message;
          toast.classList.add('visible');
          setTimeout(() => toast.classList.remove('visible'), 2600);
        };

        const updateCards = () => {
          cards.forEach(card => {
            const icon = card.querySelector('.lock-icon');
            if (card.dataset.workoutCard === unlockedId) {
              card.classList.remove('locked');
              card.classList.add('active');
              if (icon) icon.textContent = '🟢';
            } else {
              card.classList.add('locked');
              card.classList.remove('active');
              if (icon) icon.textContent = '🔒';
            }
          });
        };

        if (startBtn) {
          startBtn.addEventListener('click', () => {
            if (unlockedId) return;
            unlockedId = PLAN_DATA.todayId;
            updateCards();
            startBtn.disabled = true;
            startBtn.textContent = 'Workout in progress';
            if (todayStatus) {
              todayStatus.textContent = 'Unlocked · move at your own pace.';
            }
            if (streakEl) {
              const base = parseInt(streakEl.dataset.baseStreak || '0', 10) || 0;
              streakEl.textContent = base + 1;
            }
            showToast('Today\'s workout unlocked. Breathe, then begin.');
          });
        }

        cards.forEach(card => {
          card.addEventListener('click', () => {
            const id = card.dataset.workoutCard;
            if (unlockedId && id === unlockedId) {
              showToast('Session active. Scroll for cues.');
              return;
            }
            if (!unlockedId && id === PLAN_DATA.todayId) {
              showToast('Press Start Workout to unlock today.');
              return;
            }
            showToast('This workout unlocks tomorrow.');
          });
        });

        updateCards();
      })();
    </script>
  `;

  res.send(renderPage('Plan Generator - AllAroundAthlete', planContent));
});

app.get('/dashboard', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  // Placeholder values for now
  const userDuration = '3 weeks'; // Replace with real tracking
  const savedWorkouts = ['Push/Pull/Legs', 'Full Body Beginner', 'Upper Body Blast']; // Replace with real saved workouts
  const deadliftMax = 315; // Replace with real user input
  const benchMax = 225; // Replace with real user input
  const squatMax = 275; // Replace with real user input
  const userWeight = 180; // Replace with real user input
  const userHeight = 70; // Replace with real user input

  const dashboardContent = `
    <section class="panel" style="margin-bottom:28px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
        <div>
          <span class="badge">Member since</span>
          <h2 style="margin:10px 0 6px;">${userDuration} of consistent work</h2>
          <p style="color:var(--muted);max-width:520px;">Keep logging sessions to unlock premium periodization templates. Your subscription syncs automatically with Stripe, so upgrades are instant.</p>
        </div>
        <button class="cta-btn">Manage Subscription</button>
      </div>
      <div class="summary-grid" style="margin-top:24px;">
        <div class="summary-card">
          <small style="color:var(--muted);">Current Weight</small>
          <h3 style="margin:6px 0 0;">${userWeight} lbs</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Height</small>
          <h3 style="margin:6px 0 0;">${userHeight} in</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Bench / Squat / Dead</small>
          <h3 style="margin:6px 0 0;">${benchMax}/${squatMax}/${deadliftMax} lbs</h3>
        </div>
      </div>
    </section>
    <section class="hero-grid" style="gap:24px;">
      <div class="panel">
        <h3 style="margin-top:0;">Saved workouts</h3>
        <p style="color:var(--muted);margin-top:4px;">Recently generated plans you bookmarked.</p>
        <ul style="margin:18px 0 0;padding-left:20px;line-height:1.8;">
          ${savedWorkouts.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>
      <div class="panel">
        <h3 style="margin-top:0;">Next focus</h3>
        <p style="color:var(--muted);margin-top:4px;">Dial in your training priorities for the week.</p>
        <ul style="margin:18px 0 0;padding-left:20px;line-height:1.8;">
          <li>Update rep targets after next PR attempt</li>
          <li>Log cardio minutes in the mobile app</li>
          <li>Enable Cloudflare Gateway for faster loads</li>
        </ul>
      </div>
    </section>
  `;

  res.send(renderPage('Dashboard - AllAroundAthlete', dashboardContent));
});

app.get('/onboarding', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (userState.profile.onboardingComplete) {
    return res.redirect('/planner');
  }
  const profile = userState.profile;
  const sexOptionChips = renderSexOptions('sex', profile.sex, true);

  const onboardingContent = `
    <section class="panel onboarding-panel">
      <span class="badge">Welcome</span>
      <h2>Let's get acquainted first</h2>
      <p class="onboarding-lede">We ask for a few basics so every plan respects your goals, body, and available space. This stays private on your device.</p>
      <form class="onboarding-form" method="POST" action="/onboarding">
        <label>
          Primary goal
          <textarea name="goal" required placeholder="e.g., Build strength without burning out">${escapeHTML(profile.goal)}</textarea>
        </label>
        <div class="onboarding-grid">
          <label>
            Height (in)
            <input type="number" name="height" min="36" max="96" required value="${escapeHTML(profile.height || '')}">
          </label>
          <label>
            Weight (lbs)
            <input type="number" name="weight" min="70" max="600" required value="${escapeHTML(profile.weight || '')}">
          </label>
          <fieldset class="option-chip-fieldset">
            <legend>Sex</legend>
            <div class="option-chip-group">
              ${sexOptionChips}
            </div>
          </fieldset>
          <label>
            Age
            <input type="number" name="age" min="13" max="90" required value="${escapeHTML(profile.age || '')}">
          </label>
          <label>
            Location
            <input type="text" name="location" required value="${escapeHTML(profile.location || '')}" placeholder="City, State">
          </label>
        </div>
        <button class="primary-btn" type="submit">Save and continue</button>
      </form>
    </section>
  `;

  res.send(renderPage('Welcome - AllAroundAthlete', onboardingContent));
});

app.post('/onboarding', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  const { goal, height, weight, sex, age, location } = req.body;
  const sanitizedHeight = sanitizeNumberInput(height, { min: 36, max: 96 });
  const sanitizedWeight = sanitizeNumberInput(weight, { min: 70, max: 600 });
  const sanitizedAge = sanitizeNumberInput(age, { min: 13, max: 90 });
  const normalizedSex = SEX_OPTIONS.includes(sex) ? sex : userState.profile.sex;

  userState.profile.goal = cleanInput(goal, userState.profile.goal);
  if (sanitizedHeight) userState.profile.height = sanitizedHeight;
  if (sanitizedWeight) userState.profile.weight = sanitizedWeight;
  if (sanitizedAge) userState.profile.age = sanitizedAge;
  userState.profile.sex = normalizedSex;
  userState.profile.location = cleanInput(location, userState.profile.location);
  userState.profile.onboardingComplete = true;

  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  const profileUser = userState.profile;
  const programInfo = userState.program;
  const stats = calculateWorkoutStats();
  const programProgress = Math.min(100, Math.round((programInfo.currentWeek / programInfo.totalWeeks) * 100));
  const weeklyHeights = getWeeklyChartHeights();
  const weightDisplay = profileUser.weight ? `${escapeHTML(profileUser.weight)} lbs` : 'Not set';
  const heightDisplay = profileUser.height ? `${escapeHTML(profileUser.height)} in` : 'Not set';
  const locationDisplay = profileUser.location ? escapeHTML(profileUser.location) : 'Not set';
  const ageSexParts = [];
  if (profileUser.age) ageSexParts.push(`${escapeHTML(profileUser.age)} yrs`);
  if (profileUser.sex) ageSexParts.push(escapeHTML(profileUser.sex));
  const ageSexDisplay = ageSexParts.length ? ageSexParts.join(' · ') : 'Not set';
  const profileSexChips = renderSexOptions('sex', profileUser.sex, true);

  const profileContent = `
    <section class="profile-shell">
      <div class="profile-summary-card">
        <div class="profile-summary-top">
          <div>
            <p class="profile-eyebrow">Profile</p>
            <h2>${escapeHTML(profileUser.name)}</h2>
            <p class="profile-summary-subtitle">${escapeHTML(profileUser.subtitle)}</p>
          </div>
          <div class="profile-pill">Beginner Mode</div>
        </div>
        <div class="profile-meta">
          <div class="profile-meta-item">
            <span>Goal</span>
            <strong>${escapeHTML(profileUser.goal)}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Experience Level</span>
            <strong>${escapeHTML(profileUser.experience)}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Equipment</span>
            <strong>${escapeHTML(profileUser.equipment)}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Weight</span>
            <strong>${weightDisplay}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Height</span>
            <strong>${heightDisplay}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Age · Sex</span>
            <strong>${ageSexDisplay}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Location</span>
            <strong>${locationDisplay}</strong>
          </div>
        </div>
      </div>
      <div class="profile-program-card">
        <div>
          <p class="program-label">Program</p>
          <div class="program-week-row">
            <h3>Week ${programInfo.currentWeek} of ${programInfo.totalWeeks}</h3>
          </div>
          <p class="program-subtitle">Next Workout: <span>${escapeHTML(programInfo.nextWorkout)}</span></p>
          <div class="program-progress">
            <div class="program-progress-fill" style="width:${programProgress}%;"></div>
          </div>
        </div>
        <form method="POST" action="/profile/start-workout">
          <button class="program-start-btn" type="submit">Start Today's Workout</button>
        </form>
      </div>
      <div class="profile-progress-card">
        <div>
          <p class="progress-eyebrow">Progress</p>
          <h3>Keeping it gentle and steady</h3>
          <p>Micro wins add up. Nothing fancy—just a calm snapshot.</p>
        </div>
        <div class="progress-metrics">
          <div class="progress-metric">
            <span>Workout Streak</span>
            <strong>${stats.streak} days</strong>
          </div>
          <div class="progress-metric">
            <span>Total Sessions</span>
            <strong>${stats.total}</strong>
          </div>
        </div>
        <div class="progress-mini-chart">
          ${weeklyHeights.map(val => `<span style="height:${val}%"></span>`).join('')}
        </div>
      </div>
      <div class="profile-settings-card">
        <h4>Tune the basics</h4>
        <p>Quick adjustments keep the plan feeling yours.</p>
        <div class="profile-settings-actions">
          <a href="#edit-profile" class="settings-link">Edit Profile</a>
          <a href="#change-goal" class="settings-link">Change Goal</a>
          <a href="#change-equipment" class="settings-link">Change Equipment</a>
        </div>
      </div>
      <div class="profile-settings-forms">
        <form id="edit-profile" class="settings-inline-form" method="POST" action="/profile/update-profile">
          <label>
            Display Name
            <input type="text" name="name" value="${escapeHTML(profileUser.name)}" required>
          </label>
          <label>
            Experience Note
            <input type="text" name="experience" value="${escapeHTML(profileUser.experience)}" required>
          </label>
          <label>
            Subtitle
            <textarea name="subtitle" required>${escapeHTML(profileUser.subtitle)}</textarea>
          </label>
          <label>
            Height (in)
            <input type="number" name="height" min="36" max="96" value="${escapeHTML(profileUser.height || '')}" required>
          </label>
          <label>
            Weight (lbs)
            <input type="number" name="weight" min="70" max="600" value="${escapeHTML(profileUser.weight || '')}" required>
          </label>
          <fieldset class="option-chip-fieldset">
            <legend>Sex</legend>
            <div class="option-chip-group">
              ${profileSexChips}
            </div>
          </fieldset>
          <label>
            Age
            <input type="number" name="age" min="13" max="90" value="${escapeHTML(profileUser.age || '')}" required>
          </label>
          <label>
            Location
            <input type="text" name="location" value="${escapeHTML(profileUser.location || '')}" required>
          </label>
          <label>
            Current Week
            <input type="number" min="1" max="${programInfo.totalWeeks}" name="current_week" value="${programInfo.currentWeek}" required>
          </label>
          <label>
            Total Weeks
            <input type="number" min="1" name="total_weeks" value="${programInfo.totalWeeks}" required>
          </label>
          <label>
            Next Workout Name
            <input type="text" name="next_workout" value="${escapeHTML(programInfo.nextWorkout)}" required>
          </label>
          <button type="submit">Save Profile</button>
        </form>
        <form id="change-goal" class="settings-inline-form" method="POST" action="/profile/update-goal">
          <label>
            Goal statement
            <textarea name="goal" required>${escapeHTML(profileUser.goal)}</textarea>
          </label>
          <button type="submit">Update Goal</button>
        </form>
        <form id="change-equipment" class="settings-inline-form" method="POST" action="/profile/update-equipment">
          <label>
            Equipment on hand
            <textarea name="equipment" required>${escapeHTML(profileUser.equipment)}</textarea>
          </label>
          <button type="submit">Update Equipment</button>
        </form>
      </div>
    </section>
  `;

  res.send(renderPage('Profile - AllAroundAthlete', profileContent));
});

app.post('/profile/start-workout', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  recordWorkoutCompletion();
  res.redirect('/profile');
});

app.post('/profile/update-profile', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  const {
    name,
    subtitle,
    experience,
    current_week,
    total_weeks,
    next_workout,
    height,
    weight,
    age,
    sex,
    location
  } = req.body;
  userState.profile.name = cleanInput(name, userState.profile.name);
  userState.profile.subtitle = cleanInput(subtitle, userState.profile.subtitle);
  userState.profile.experience = cleanInput(experience, userState.profile.experience);
  userState.program.nextWorkout = cleanInput(next_workout, userState.program.nextWorkout);

  const sanitizedHeight = sanitizeNumberInput(height, { min: 36, max: 96 });
  const sanitizedWeight = sanitizeNumberInput(weight, { min: 70, max: 600 });
  const sanitizedAge = sanitizeNumberInput(age, { min: 13, max: 90 });
  const normalizedSex = SEX_OPTIONS.includes(sex) ? sex : userState.profile.sex;
  if (sanitizedHeight) userState.profile.height = sanitizedHeight;
  if (sanitizedWeight) userState.profile.weight = sanitizedWeight;
  if (sanitizedAge) userState.profile.age = sanitizedAge;
  userState.profile.sex = normalizedSex;
  userState.profile.location = cleanInput(location, userState.profile.location);
  userState.profile.onboardingComplete = true;

  const totalWeeks = Math.max(1, parseInt(total_weeks, 10)) || userState.program.totalWeeks;
  userState.program.totalWeeks = totalWeeks;

  const currentWeek = Math.max(1, parseInt(current_week, 10)) || userState.program.currentWeek;
  userState.program.currentWeek = Math.min(currentWeek, userState.program.totalWeeks);

  res.redirect('/profile');
});

app.post('/profile/update-goal', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  const { goal } = req.body;
  userState.profile.goal = cleanInput(goal, userState.profile.goal);
  res.redirect('/profile');
});

app.post('/profile/update-equipment', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  if (!userState.profile.onboardingComplete) {
    return res.redirect('/onboarding');
  }
  const { equipment } = req.body;
  userState.profile.equipment = cleanInput(equipment, userState.profile.equipment);
  res.redirect('/profile');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

