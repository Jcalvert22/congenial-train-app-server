import { escapeHTML } from './helpers.js';

const MUSCLE_EMOJIS = {
  Chest: '\u{1F9E1}',
  Back: '\u{1F499}',
  Legs: '\u{1F49A}',
  Shoulders: '\u{1F49B}',
  Arms: '\u{1F4AA}',
  Abs: '\u{1F300}'
};

const DEFAULT_FALLBACK_EMOJI = '\u{1F3CB}\uFE0F';
const IMAGE_EXTENSION_PATTERN = /\.(png|svg)$/i;

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

function getMuscleEmoji(targetMuscle = '') {
  const normalized = targetMuscle?.toString().trim();
  if (normalized && MUSCLE_EMOJIS[normalized]) {
    return MUSCLE_EMOJIS[normalized];
  }
  return DEFAULT_FALLBACK_EMOJI;
}

function findIconMatch(value, iconMap) {
  const key = value?.toString().trim();
  if (!key) {
    return '';
  }
  return iconMap[key] || '';
}

function resolveExerciseIconValue(details = {}, iconMap = {}) {
  const machineKey = details.machine?.toString().trim();
  if (machineKey && iconMap[machineKey]) {
    return iconMap[machineKey];
  }
  const nameMatch = findIconMatch(details.exerciseName, iconMap);
  if (nameMatch) {
    return nameMatch;
  }
  const equipmentKey = normalizeEquipmentName(details.equipment);
  if (equipmentKey) {
    const equipmentMatch = findIconMatch(equipmentKey, iconMap);
    if (equipmentMatch) {
      return equipmentMatch;
    }
  }
  return '';
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
  const emoji = trimmedIcon || getMuscleEmoji(details.muscle);
  return `<span class="exercise-emoji" aria-hidden="true">${escapeHTML(emoji || DEFAULT_FALLBACK_EMOJI)}</span>`;
}
