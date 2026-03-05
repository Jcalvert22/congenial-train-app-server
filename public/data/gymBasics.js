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

const MODULE_FALLBACK = {
  module: {
    id: 'gym_basics',
    title: 'Gym Basics',
    tagline: 'A calm primer for day-one confidence.',
    intro: 'This module gives gentle answers to the questions beginners ask most so you can step onto the floor without guessing.',
    topics: []
  }
};

const raw = loadJsonSync('./gymBasics.json', MODULE_FALLBACK);
const rawModule = raw?.module || MODULE_FALLBACK.module;

const sanitizeText = (value, fallback = '') => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || fallback;
};

const normalizeTopics = topics => {
  if (!Array.isArray(topics)) {
    return [];
  }
  return topics.map(topic => ({
    id: sanitizeText(topic?.id, 'topic'),
    title: sanitizeText(topic?.title, 'Gym topic'),
    summary: sanitizeText(topic?.summary, ''),
    bullets: Array.isArray(topic?.bullets)
      ? topic.bullets.map(item => sanitizeText(item)).filter(Boolean)
      : []
  }));
};

export const GYM_BASICS_MODULE = {
  id: sanitizeText(rawModule.id, 'gym_basics'),
  title: sanitizeText(rawModule.title, 'Gym Basics'),
  tagline: sanitizeText(rawModule.tagline),
  intro: sanitizeText(rawModule.intro),
  topics: normalizeTopics(rawModule.topics)
};

export const GYM_BASICS_TOPICS = GYM_BASICS_MODULE.topics;
export const getGymBasicsTopicById = id => GYM_BASICS_TOPICS.find(topic => topic.id === id) || null;
