import { escapeHTML } from './helpers.js';

const IMAGE_EXTENSION_PATTERN = /\.(png|svg)$/i;

// Maps muscle group + cable to the closest machine-equivalent SVG key.
// Cable exercises perform the same movements as their machine counterparts.
const MUSCLE_EQUIPMENT_ICON_KEYS = {
  'chest:cables':      'chest_fly',
  'chest:cable':       'chest_fly',
  'back:cables':       'seated_row',
  'back:cable':        'seated_row',
  'shoulders:cables':  'lateral_raise',
  'shoulders:cable':   'lateral_raise',
  'biceps:cables':     'preacher_curl',
  'biceps:cable':      'preacher_curl',
  'triceps:cables':    'tricep_pushdown',
  'triceps:cable':     'tricep_pushdown',
  'quads:cables':      'leg_extension',
  'quads:cable':       'leg_extension',
  'hamstrings:cables': 'leg_curl',
  'hamstrings:cable':  'leg_curl',
  'glutes:cables':     'hip_abduction',
  'glutes:cable':      'hip_abduction',
  'core:cables':       'ab_crunch',
  'core:cable':        'ab_crunch',
  'calves:cables':     'calf_raise_standing',
  'calves:cable':      'calf_raise_standing',
  'legs:cables':       'leg_extension',
  'legs:cable':        'leg_extension'
};

// Maps normalized equipment labels to icon keys for non-cable/non-machine exercises.
const EQUIPMENT_LABEL_TO_KEY = {
  'dumbbells':   'dumbbell',
  'dumbbell':    'dumbbell',
  'barbell':     'barbell',
  'bodyweight':  'bodyweight',
  'smith machine': 'smith_machine',
  'cables':      'lat_pulldown',
  'cable':       'lat_pulldown',
  'machine':     'chest_press'
};

function normalizeEquipmentName(value) {
  if (Array.isArray(value) && value.length) {
    return normalizeEquipmentName(value[0]);
  }
  if (!value) {
    return '';
  }
  const raw = value.toString();
  const separators = [',', '/', '|'];
  let token = raw;
  separators.forEach(separator => {
    if (token.includes(separator)) {
      token = token.split(separator)[0];
    }
  });
  return token.trim();
}

function findIconMatch(value, iconMap) {
  const key = value?.toString().trim();
  if (!key) {
    return '';
  }
  return iconMap[key] || iconMap[key.toLowerCase()] || '';
}

function resolveExerciseIconValue(details = {}, iconMap = {}) {
  // 1. Machine-specific icon (e.g., chest_press, lat_pulldown)
  const machineKey = details.machine?.toString().trim();
  if (machineKey && iconMap[machineKey]) {
    return iconMap[machineKey];
  }

  // 2. Exact exercise name match (e.g., a name added directly to the icon map)
  const nameMatch = findIconMatch(details.exerciseName, iconMap);
  if (nameMatch) {
    return nameMatch;
  }

  const muscle = details.muscle?.toString().trim().toLowerCase() || '';
  const equipmentRaw = normalizeEquipmentName(details.equipment);
  const equipmentKey = equipmentRaw.toLowerCase();

  // 3. Muscle + equipment combo (maps cable exercises to their machine-equivalent icon)
  if (muscle && equipmentKey) {
    const comboKey = `${muscle}:${equipmentKey}`;
    const iconKey = MUSCLE_EQUIPMENT_ICON_KEYS[comboKey];
    if (iconKey && iconMap[iconKey]) {
      return iconMap[iconKey];
    }
  }

  // 4. Equipment-level icon (dumbbell, barbell, bodyweight, smith machine)
  if (equipmentKey) {
    const equipmentIconKey = EQUIPMENT_LABEL_TO_KEY[equipmentKey];
    if (equipmentIconKey && iconMap[equipmentIconKey]) {
      return iconMap[equipmentIconKey];
    }
  }

  // 5. Final fallback — bodyweight figure covers anything remaining
  return iconMap['bodyweight'] || iconMap['dumbbell'] || '';
}

function buildAccessibleLabel({ exerciseName = '', equipment = '', muscle = '' } = {}) {
  if (exerciseName?.toString().trim()) {
    return exerciseName;
  }
  const equipmentLabel = normalizeEquipmentName(equipment);
  if (equipmentLabel) {
    return equipmentLabel;
  }
  if (muscle?.toString().trim()) {
    return muscle;
  }
  return 'Exercise icon';
}

export function buildExerciseIconMarkup(details = {}, iconMap = {}) {
  const iconValue = resolveExerciseIconValue(details, iconMap);
  const accessibleLabel = buildAccessibleLabel(details);
  const trimmedIcon = iconValue?.toString().trim();
  if (trimmedIcon && IMAGE_EXTENSION_PATTERN.test(trimmedIcon)) {
    return `<img class="exercise-icon machine-icon" src="${trimmedIcon}" alt="${escapeHTML(accessibleLabel)} icon" loading="lazy">`;
  }
  // Should not be reached when machineIcons is loaded — kept as a safety net
  return `<img class="exercise-icon machine-icon" src="${iconMap['bodyweight'] || ''}" alt="${escapeHTML(accessibleLabel)} icon" loading="lazy">`;
}
