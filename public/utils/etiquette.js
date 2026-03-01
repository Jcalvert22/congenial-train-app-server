import { EQUIPMENT_ETIQUETTE, GYMXIETY_ETIQUETTE, MACHINE_EQUIPMENT } from '../data/exercises.js';

const MACHINE_OVERRIDE_KEY = 'Machines';
const MACHINE_KEY_MAP = MACHINE_EQUIPMENT.reduce((acc, label) => {
  acc[label.toLowerCase()] = label;
  return acc;
}, {});

function normalizeToken(value) {
  if (!value && value !== 0) {
    return '';
  }
  return value.toString().trim();
}

function normalizeList(input) {
  if (!input && input !== 0) {
    return [];
  }
  if (Array.isArray(input)) {
    return input.flatMap(entry => normalizeList(entry));
  }
  const token = normalizeToken(input);
  if (!token) {
    return [];
  }
  return token
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

function resolveEquipmentKey(token) {
  const normalized = normalizeToken(token);
  if (!normalized) {
    return null;
  }
  const lower = normalized.toLowerCase();
  const machineLabel = MACHINE_KEY_MAP[lower];
  if (EQUIPMENT_ETIQUETTE[normalized]) {
    const overrideKey = machineLabel ? MACHINE_OVERRIDE_KEY : normalized;
    return { key: normalized, label: normalized, overrideKey };
  }
  if (machineLabel) {
    return { key: machineLabel, label: machineLabel, overrideKey: MACHINE_OVERRIDE_KEY };
  }
  if (lower.includes('machine')) {
    return { key: MACHINE_OVERRIDE_KEY, label: normalized, overrideKey: MACHINE_OVERRIDE_KEY };
  }
  if (lower.includes('bench')) {
    return { key: 'Bench', label: normalized, overrideKey: 'Bench' };
  }
  if (lower.includes('squat')) {
    return { key: 'Squat Rack', label: normalized, overrideKey: 'Squat Rack' };
  }
  if (lower.includes('dumbbell')) {
    return { key: 'Dumbbells', label: normalized, overrideKey: 'Dumbbells' };
  }
  if (lower.includes('cable')) {
    return { key: 'Cables', label: normalized, overrideKey: 'Cables' };
  }
  if (lower.includes('cardio') || lower.includes('bike') || lower.includes('treadmill') || lower.includes('row')) {
    return { key: 'Cardio Machines', label: normalized, overrideKey: 'Cardio Machines' };
  }
  if (lower.includes('band')) {
    return { key: 'Bands', label: normalized, overrideKey: 'Bands' };
  }
  if (lower.includes('bodyweight') || lower.includes('pull-up') || lower.includes('pull up')) {
    return { key: 'Bodyweight', label: normalized, overrideKey: 'Bodyweight' };
  }
  return null;
}

function pickEtiquetteTip(mapping, gymxietyMode) {
  if (!mapping) {
    return '';
  }
  const overrideKey = mapping.overrideKey || mapping.key;
  if (gymxietyMode && overrideKey && GYMXIETY_ETIQUETTE[overrideKey]) {
    return GYMXIETY_ETIQUETTE[overrideKey];
  }
  return EQUIPMENT_ETIQUETTE[mapping.key] || '';
}

export function collectEquipmentEtiquette(equipmentValues, { gymxietyMode } = {}) {
  const tokens = normalizeList(equipmentValues);
  const results = [];
  const seen = new Set();
  tokens.forEach(source => {
    const mapping = resolveEquipmentKey(source);
    if (!mapping) {
      return;
    }
    const tip = pickEtiquetteTip(mapping, gymxietyMode);
    if (!tip) {
      return;
    }
    const cacheKey = `${mapping.label}|${tip}`;
    if (seen.has(cacheKey)) {
      return;
    }
    seen.add(cacheKey);
    results.push({ ...mapping, tip });
  });
  return results;
}

export function getExerciseEtiquetteLines(row, { gymxietyMode } = {}) {
  if (!row) {
    return [];
  }
  const lines = [];
  if (row.etiquetteTip || row.etiquette_tip) {
    lines.push(row.etiquetteTip || row.etiquette_tip);
  }
  const equipmentTips = collectEquipmentEtiquette(row.equipment, { gymxietyMode });
  equipmentTips.forEach(entry => {
    if (!entry.tip) {
      return;
    }
    lines.push(entry.tip);
  });
  return lines;
}
