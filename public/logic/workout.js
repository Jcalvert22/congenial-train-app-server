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

const PERCENT_MIN = 30;
const PERCENT_MAX = 95;
const PERCENT_STEP = 5;
const PERCENT_OFFSET_MIN = -25;
const PERCENT_OFFSET_MAX = 25;
const REP_STEP = 2;
const REP_DELTA_MIN = -6;
const REP_DELTA_MAX = 6;

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

export function getMuscleGroups() {
  return MUSCLE_GROUPS;
}

export function getEquipmentList() {
  return EQUIPMENT_LIST;
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

  let benchMax = noMax ? 0 : Number.parseFloat(options.benchMax) || 0;
  let squatMax = noMax ? 0 : Number.parseFloat(options.squatMax) || 0;
  let deadliftMax = noMax ? 0 : Number.parseFloat(options.deadliftMax) || 0;

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
      ex.equipment.some(eq => filteredEquipment.includes(eq) || (eq === 'Bodyweight' && filteredEquipment.includes('Bodyweight Only')))
    );
    const shuffled = shuffleArray(matches);
    plan = plan.concat(shuffled.slice(0, exercisesPerGroup));
  });

  const MIN_MOVEMENTS = 3;
  const MAX_MOVEMENTS = 5;
  if (plan.length >= MIN_MOVEMENTS) {
    const targetCount = Math.min(plan.length, MAX_MOVEMENTS);
    if (plan.length > targetCount) {
      plan = shuffleArray(plan).slice(0, targetCount);
    }
  }

  const planRows = plan.map((ex, index) => {
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
      usesWeight,
      exerciseKey
    };
  });

  return {
    planRows,
    summary: {
      movementCount: planRows.length || 0,
      focus: filteredMuscles.slice(0, 2),
      repRange,
      setsPerExercise,
      mode: mode === 'bulking' ? 'Bulking' : 'Dieting'
    }
  };
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
