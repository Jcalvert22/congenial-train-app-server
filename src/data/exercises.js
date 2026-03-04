import { createHash } from 'node:crypto';
import rawExercisesData from '../../public/data/exercises.json' assert { type: 'json' };

export const EXERCISE_LIBRARY_VERSION = '2026.03.03-1';
export const ALLOWED_EQUIPMENT = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'band',
  'bench',
  'smith_machine'
];
export const ALLOWED_MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core'
];
export const ALLOWED_INTIMIDATION_LEVELS = ['low', 'moderate', 'high', 'very_high'];

const SAFE_INTIMIDATION_LEVELS = new Set(['low', 'moderate']);
const EQUIPMENT_LABELS = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbells',
  machine: 'Machine',
  cable: 'Cables',
  bodyweight: 'Bodyweight',
  band: 'Bands',
  bench: 'Bench',
  smith_machine: 'Smith Machine'
};

const MUSCLE_BODY_CUES = {
  chest: 'your shoulder blades gently pinned and feet planted',
  back: 'a tall chest with hips pushed back slightly',
  shoulders: 'a proud chest, light bend in the knees, and steady stance',
  biceps: 'elbows close to your ribs and posture upright',
  triceps: 'elbows tucked near your sides with ribs lifted',
  legs: 'feet about shoulder-width apart and core braced',
  glutes: 'heels grounded, knees soft, and core lightly braced',
  core: 'your spine neutral and ribs stacked over your hips',
  default: 'a balanced stance with your core lightly engaged'
};

const MUSCLE_ACTION_CUES = {
  chest: 'pressing the weight away from your chest',
  back: 'pulling the weight toward your ribs',
  shoulders: 'guiding the weight overhead in a smooth arc',
  biceps: 'curling the weight toward your shoulders',
  triceps: 'extending your arms until they are almost straight',
  legs: 'driving through the floor to stand tall',
  glutes: 'pressing through your heels to squeeze your glutes at the top',
  core: 'bracing your midsection as you move through the range',
  default: 'moving through the full range with light pressure'
};

const EQUIPMENT_STABILITY_CUES = {
  barbell: 'your core braced and wrists stacked over your elbows',
  dumbbell: 'your wrists neutral and elbows steady',
  machine: 'your back supported by the pad and grip relaxed',
  cable: 'your shoulders relaxed and core lightly braced',
  bodyweight: 'your weight balanced evenly with palms or feet gripping the floor',
  band: 'tension smooth and your posture tall from start to finish',
  bench: 'your upper back supported on the bench and feet planted',
  smith_machine: 'your hips stacked under the bar with your core braced',
  default: 'your core steady and neck relaxed'
};

const EQUIPMENT_ETIQUETTE = {
  Barbell: 'Re-rack the plates and step back so others can load up.',
  Dumbbells: 'Carry the weights a few steps from the rack and set them down gently.',
  Cables: 'Lower the stack softly and hang the handle back on its hook.',
  Machine: 'Wipe the seat and handles, then return the pin to a light weight.',
  Bodyweight: 'Give nearby lifters space and reset any props you used.',
  Bands: 'Coil the band neatly and hang it where you found it.',
  Bench: 'Wipe the pad and clear any pads or props before you leave.',
  'Smith Machine': 'Unload both sides evenly and leave the bar clipped in place.'
};

export const RAW_MUSCLE_GROUP_MAP = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  biceps: 'biceps',
  triceps: 'triceps',
  quads: 'legs',
  hamstrings: 'legs',
  legs: 'legs',
  calves: 'legs',
  glutes: 'glutes',
  core: 'core',
  abs: 'core'
};
const MUSCLE_GROUP_MAP = RAW_MUSCLE_GROUP_MAP;

const rawExercises = rawExercisesData?.exercises || {};
const slugCounts = new Map();
const stagedEntries = [];
const nameToIdMap = new Map();

function normalizeSlugBase(value = '') {
  return (
    value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'exercise'
  );
}

function slugify(value = '') {
  const base = normalizeSlugBase(value);
  const nextIndex = (slugCounts.get(base) || 0) + 1;
  slugCounts.set(base, nextIndex);
  return nextIndex > 1 ? `${base}-${nextIndex}` : base;
}

function mapMuscleGroup(value = '') {
  const normalized = value.toString().trim().toLowerCase();
  return MUSCLE_GROUP_MAP[normalized] || 'core';
}

function getEtiquetteForEquipment(equipmentKey) {
  const label = EQUIPMENT_LABELS[equipmentKey] || 'Bodyweight';
  return EQUIPMENT_ETIQUETTE[label] || 'Reset the area so the next lifter can start right away.';
}

function selectCue(map, key) {
  const normalized = key?.toLowerCase();
  return (normalized && map[normalized]) || map.default;
}

function buildBeginnerDescription({ muscleGroup, equipment }) {
  const bodyCue = selectCue(MUSCLE_BODY_CUES, muscleGroup);
  const actionCue = selectCue(MUSCLE_ACTION_CUES, muscleGroup);
  const stabilityCue = selectCue(EQUIPMENT_STABILITY_CUES, equipment);
  return `Start in the setup position with ${bodyCue}. Move the weight by ${actionCue} while keeping ${stabilityCue}. Use a slow, controlled tempo and stop if you feel strain in your joints instead of the target muscle.`;
}

Object.values(rawExercises).forEach(group => {
  group.forEach(exercise => {
    const name = (exercise?.name || '').trim();
    if (!name) {
      return;
    }
    const id = slugify(name);
    const equipment = (exercise.equipment || 'bodyweight').toLowerCase();
    const muscleGroup = mapMuscleGroup(exercise.primary_muscle);
    const intimidationLevel = (exercise.intimidation_level || 'moderate').toLowerCase();
    const description = buildBeginnerDescription({ muscleGroup, equipment });
    const legacyNotes = exercise.description ? exercise.description.trim() : undefined;
    const staged = {
      id,
      name,
      equipment,
      muscleGroup,
      intimidationLevel,
      description,
      etiquette: getEtiquetteForEquipment(equipment),
      gymxietySafe: SAFE_INTIMIDATION_LEVELS.has(intimidationLevel),
      notes: legacyNotes,
      alternativeNames: []
    };
    if (exercise.gymxiety_alternative) {
      staged.alternativeNames.push(exercise.gymxiety_alternative);
    }
    stagedEntries.push(staged);
    nameToIdMap.set(name.toLowerCase(), id);
  });
});

const EXERCISE_LIBRARY = stagedEntries.map(entry => {
  const alternatives = entry.alternativeNames
    .map(name => {
      const lookup = name.trim().toLowerCase();
      const resolvedId = nameToIdMap.get(lookup);
      return resolvedId ?? `UNKNOWN:${normalizeSlugBase(name)}`;
    })
    .filter(Boolean);
  return {
    id: entry.id,
    name: entry.name,
    equipment: entry.equipment,
    muscleGroup: entry.muscleGroup,
    intimidationLevel: entry.intimidationLevel,
    alternatives,
    etiquette: entry.etiquette,
    gymxietySafe: entry.gymxietySafe,
    description: entry.description,
    notes: entry.notes
  };
});

export function generateExerciseLibraryChecksum(library = EXERCISE_LIBRARY) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(library));
  return hash.digest('hex');
}

export const EXERCISE_LIBRARY_CHECKSUM = generateExerciseLibraryChecksum();

export { EXERCISE_LIBRARY };
export default EXERCISE_LIBRARY;
