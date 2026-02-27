export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function cleanInput(value, fallback = '') {
  const trimmed = (value ?? '').toString().trim();
  return trimmed.length ? trimmed : fallback;
}

export function sanitizeNumberInput(value, { min = null, max = null } = {}) {
  const num = Number.parseFloat(value);
  if (!Number.isFinite(num)) {
    return '';
  }
  if (min !== null && num < min) {
    return '';
  }
  if (max !== null && num > max) {
    return '';
  }
  return num.toString();
}

export function normalizeDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function shuffleArray(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function normalizeSelection(value) {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export function cloneDeep(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}
