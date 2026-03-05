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
  const styles = `
    <style>
      .gb-page { display: flex; flex-direction: column; gap: 28px; font-family: 'Space Grotesk', 'Plus Jakarta Sans', 'Segoe UI', sans-serif; }
      .gb-hero { border-radius: 32px; border: 1px solid #e0ecff; padding: clamp(24px, 5vw, 40px); background: radial-gradient(circle at top left, rgba(58,122,87,0.12), rgba(15,23,42,0)); box-shadow: 0 30px 80px rgba(8, 23, 43, 0.12); }
      .gb-eyebrow { text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.75rem; color: #1f5a45; margin: 0 0 10px; display: inline-flex; align-items: center; gap: 10px; }
      .gb-eyebrow::before { content: ''; width: 32px; height: 1px; background: currentColor; opacity: 0.4; }
      .gb-hero h1 { margin: 0 0 12px; font-size: clamp(1.8rem, 4vw, 2.6rem); color: #0f1a1b; }
      .gb-hero p { margin: 0; color: #3c4a5b; line-height: 1.7; max-width: 720px; }
      .gb-chip-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
      .gb-chip { padding: 6px 16px; border-radius: 999px; font-size: 0.85rem; font-weight: 600; color: #0f3d35; background: rgba(19, 78, 74, 0.12); border: 1px solid rgba(19, 78, 74, 0.2); }
      .gb-grid { display: grid; gap: 22px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
      .gb-topic-card { width: 100%; }
      .gb-topic-card-inner { border-radius: 28px; border: 1px solid rgba(15,23,42,0.08); padding: 24px; min-height: 100%; display: flex; flex-direction: column; gap: 18px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2); }
      .gb-topic-meta h3 { margin: 10px 0 8px; font-size: 1.15rem; color: #0f1a1b; }
      .gb-topic-meta p { margin: 0; color: #253344; font-size: 0.95rem; line-height: 1.6; }
      .gb-topic-step { font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase; color: #0f3d35; background: rgba(255,255,255,0.6); padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(15,61,53,0.2); }
      .gb-topic-bullets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
      .gb-topic-bullets li { display: flex; gap: 8px; align-items: flex-start; font-size: 0.9rem; color: #11212f; }
      .gb-topic-bullets li::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #0ea5e9; margin-top: 6px; flex-shrink: 0; }
      .gb-support-card { border-radius: 24px; border: 1px dashed #b6d1ff; padding: 24px; background: #f8fbff; color: #1a2740; display: flex; flex-direction: column; gap: 10px; }
      .gb-support-card h3 { margin: 0; font-size: 1.05rem; }
      .gb-support-card p { margin: 0; line-height: 1.5; }
      .gb-support-card a { color: #0f62fe; font-weight: 600; }
      @media (max-width: 640px) {
        .gb-topic-card-inner { padding: 20px; }
        .gb-chip-row { flex-direction: column; }
      }
    </style>
  `;

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
    ${styles}
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
