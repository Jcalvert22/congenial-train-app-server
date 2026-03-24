import { escapeHTML } from '../utils/helpers.js';
import { renderPageShell } from '../components/stateCards.js';
import { GYM_BASICS_MODULE, GYM_BASICS_TOPICS } from '../data/gymBasics.js';

const HERO_CHIPS = ['Form confidence', 'Machine setup', 'Breathing rhythm', 'Warm-up flow'];
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #e2fbf3, #d6f0ff)',
  'linear-gradient(135deg, #fef9e7, #fde1e5)',
  'linear-gradient(135deg, #f0f4ff, #e3ffe8)',
  'linear-gradient(135deg, #fff5f2, #eaf7ff)'
];

function renderHeroChips() {
  return HERO_CHIPS
    .map(label => `<span class="gb-chip">${escapeHTML(label)}</span>`)
    .join('');
}

function renderTopicBullets(bullets = []) {
  if (!bullets.length) {
    return '';
  }
  return `
    <ul class="gb-topic-bullets">
      ${bullets.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
    </ul>
  `;
}

function renderTopicCard(topic, index) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const positionLabel = `Step ${index + 1}`;
  return `
    <article class="gb-topic-card" data-topic-id="${escapeHTML(topic.id)}">
      <div class="gb-topic-card-inner" style="background:${gradient};">
        <div class="gb-topic-meta">
          <span class="gb-topic-step">${escapeHTML(positionLabel)}</span>
          <h3>${escapeHTML(topic.title)}</h3>
          <p>${escapeHTML(topic.summary)}</p>
        </div>
        ${renderTopicBullets(topic.bullets)}
      </div>
    </article>
  `;
}

export function renderGymBasicsPage() {
  const moduleData = GYM_BASICS_MODULE;
  const topics = moduleData.topics?.length ? moduleData.topics : GYM_BASICS_TOPICS;

  const hero = `
    <header class="gb-hero">
      <p class="gb-eyebrow">${escapeHTML(moduleData.tagline || 'Steady foundations')}</p>
      <h1>${escapeHTML(moduleData.title)}</h1>
      <p>${escapeHTML(moduleData.intro)}</p>
      <div class="gb-chip-row">${renderHeroChips()}</div>
    </header>
  `;

  const topicCards = topics.map((topic, index) => renderTopicCard(topic, index)).join('');

  const supportCard = `
    <article class="gb-support-card">
      <h3>Pair with Gymxiety Mode</h3>
      <p>Turn on Gymxiety Mode anytime you want the app to echo the same calm pacing you see here. It keeps cues brief, swaps intimidating moves, and links you back to this module whenever you need a refresher.</p>
      <a href="#/gym-confidence">Need social cues too? Open the Gym Confidence guide.</a>
    </article>
  `;

  const sections = `
    <section class="landing-section gb-page">
      ${hero}
      <div class="gb-grid" aria-label="Gym Basics topics">
        ${topicCards}
      </div>
      ${supportCard}
    </section>
  `;

  return renderPageShell(sections);
}

export function attachGymBasicsEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  return root;
}
