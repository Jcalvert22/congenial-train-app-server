function loadJsonSync(relativePath, fallback) {
  try {
    const request = new XMLHttpRequest();
    request.overrideMimeType('application/json');
    request.open('GET', new URL(relativePath, import.meta.url), false);
    request.send(null);
    if (request.status >= 200 && request.status < 300) {
      return JSON.parse(request.responseText);
    }
  } catch (error) {
    console.error(`Failed to load ${relativePath}`, error);
  }
  return fallback;
}

const CONFIDENCE_MAP_FALLBACK = {
  confidenceAlternativeMap: {},
  confidenceAlternativeMeta: {}
};

const raw = loadJsonSync('./confidenceAlternativeMap.json', CONFIDENCE_MAP_FALLBACK);

const { confidenceAlternativeMap: confidenceAlternativeMapData = {}, confidenceAlternativeMeta = {} } = raw;

const normalizedConfidenceAlternativeMap = Object.create(null);
Object.entries(confidenceAlternativeMapData).forEach(([key, value]) => {
  if (!key) {
    return;
  }
  normalizedConfidenceAlternativeMap[key] = value;
  normalizedConfidenceAlternativeMap[key.toLowerCase()] = value;
});

const DEFAULT_CONFIDENCE_CUES = [
  'Move slowly and breathe calmly.',
  'Stop if anything feels sharp or painful.'
];

export const confidenceAlternativeMap = normalizedConfidenceAlternativeMap;

function resolveReplacement(sourceName) {
  if (!sourceName) {
    return null;
  }
  const normalized = sourceName.toString ? sourceName.toString().trim() : '';
  if (!normalized) {
    return null;
  }
  const direct = confidenceAlternativeMap[normalized];
  if (direct) {
    return direct;
  }
  return confidenceAlternativeMap[normalized.toLowerCase()] || null;
}

export function getConfidenceAlternativeDetails(sourceName, fallback = {}) {
  if (!sourceName) {
    return null;
  }
  const replacement = resolveReplacement(sourceName);
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
  return Boolean(resolveReplacement(sourceName));
}
