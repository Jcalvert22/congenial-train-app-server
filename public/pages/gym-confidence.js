import { escapeHTML } from '../utils/helpers.js';
import { renderPageShell } from '../components/stateCards.js';
import { getAuth } from '../auth/state.js';
import { GYM_SITUATIONS } from '../data/gymSituations.js';
import { EQUIPMENT_ETIQUETTE } from '../data/exercises.js';

const WELCOME_COPY = "Welcome to the gym. This quick guide shows you how to move through the space with confidence. You'll learn simple etiquette and how to handle common situations.";
const ETIQUETTE_COPY = "Most gym etiquette is simple. Wipe equipment when you're done, return attachments, and share machines when it's busy. These small habits help everyone feel comfortable.";
const CONFIDENCE_COPY = 'Most people are focused on their own workout. Moving slowly and with control looks confident, even with light weight. You belong here.';
const FINISH_LABEL = 'Start your workout';
const ETIQUETTE_KEYS = ['Barbell', 'Dumbbells', 'Machine', 'Cables'];
const HERO_CHIPS = ['Clear etiquette', 'Real situations', 'Confidence cues'];
const ETIQUETTE_POINTS = [
  'Wipe equipment when you finish your sets.',
  'Return attachments and handles to their hooks.',
  'Offer to alternate on machines when the space is busy.'
];
const CONFIDENCE_POINTS = [
  'Most people are dialed into their own workout.',
  'Slow, controlled reps read as confident at any weight.',
  'Staying present and breathing keeps nerves down.'
];

function formatEquipmentLabel(key) {
  if (!key) {
    return '';
  }
  return key.replace(/_/g, ' ');
}

function buildEtiquetteHighlights() {
  return ETIQUETTE_KEYS
    .map(key => {
      const tip = EQUIPMENT_ETIQUETTE[key];
      if (!tip) {
        return null;
      }
      return { label: formatEquipmentLabel(key), tip };
    })
    .filter(Boolean);
}

function renderEtiquetteCards() {
  const highlights = buildEtiquetteHighlights();
  if (!highlights.length) {
    return '';
  }
  return highlights
    .map(entry => `
      <div class="gc-mini-card">
        <p class="gc-mini-card-title">${escapeHTML(entry.label)}</p>
        <p class="gc-mini-card-tip">${escapeHTML(entry.tip)}</p>
      </div>
    `)
    .join('');
}

function renderSituationCards() {
  return GYM_SITUATIONS
    .map(situation => `
      <div class="gc-situation-card">
        <p class="gc-situation-card-title">${escapeHTML(situation.title)}</p>
        <p class="gc-situation-card-tip">${escapeHTML(situation.tip)}</p>
      </div>
    `)
    .join('');
}

function renderChips() {
  return HERO_CHIPS
    .map(label => `<span class="gc-chip">${escapeHTML(label)}</span>`)
    .join('');
}

function renderBulletList(items = []) {
  if (!items.length) {
    return '';
  }
  return `
    <ul class="gc-bullet-list">
      ${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
    </ul>
  `;
}

export function renderGymConfidencePage() {
  const pageStyles = `
    <style>
      .gym-confidence-shell { display: flex; flex-direction: column; gap: 28px; }
      .gc-hero {
        background: linear-gradient(135deg, #f4fbf7 0%, #f0f5ff 100%);
        border: 1px solid #dfe8f1;
        border-radius: 28px;
        padding: clamp(24px, 5vw, 36px);
        box-shadow: 0 25px 60px rgba(15, 25, 40, 0.08);
      }
      .gc-eyebrow { text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.75rem; color: #25634c; margin: 0 0 8px; display: inline-flex; align-items: center; gap: 8px; }
      .gc-eyebrow::before { content: ''; width: 26px; height: 1px; background: currentColor; opacity: 0.4; }
      .gc-hero h1 { margin: 0 0 12px; font-size: clamp(1.6rem, 4vw, 2.3rem); color: #0f1a1b; }
      .gc-hero p { margin: 0; color: #425066; line-height: 1.5; max-width: 640px; }
      .gc-hero p + p { margin-top: 8px; }
      .gc-chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
      .gc-chip { padding: 6px 14px; border-radius: 999px; background: rgba(16, 185, 129, 0.15); color: #065f46; font-size: 0.85rem; font-weight: 600; }
      .gc-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
      .gc-card { background: #fff; border-radius: 24px; border: 1px solid #e7ecf3; padding: 24px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06); display: flex; flex-direction: column; gap: 14px; min-height: 0; }
      .gc-card h3 { margin: 0; font-size: 1rem; color: #0f1a1b; }
      .gc-card p { margin: 0; color: #4b5563; font-size: 0.9rem; line-height: 1.5; }
      .gc-mini-card { border-radius: 16px; border: 1px solid #edf1f7; padding: 14px; background: #f8fafc; }
      .gc-mini-card-title { margin: 0; font-weight: 600; font-size: 0.95rem; color: #1f2937; }
      .gc-mini-card-tip { margin: 6px 0 0; font-size: 0.8rem; color: #4b5563; }
      .gc-mini-card + .gc-mini-card { margin-top: 12px; }
      .gc-bullet-list { list-style: none; padding: 0; margin: 4px 0 0; display: flex; flex-direction: column; gap: 8px; }
      .gc-bullet-list li { display: flex; gap: 8px; font-size: 0.9rem; color: #1f2a37; align-items: flex-start; }
      .gc-bullet-list li::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #0ea5e9; margin-top: 6px; flex-shrink: 0; }
      .gc-situations-card { min-height: 0; }
      .gc-situations-list { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .gc-situation-card { border: 1px solid #e5e9f2; border-radius: 16px; padding: 14px 16px; background: #fdfefe; }
      .gc-situation-card-title { margin: 0; font-size: 0.95rem; font-weight: 600; color: #111827; }
      .gc-situation-card-tip { margin: 6px 0 0; font-size: 0.82rem; color: #4b5563; line-height: 1.4; }
      .gc-primary-btn { width: 100%; border: none; border-radius: 999px; padding: 14px; font-size: 0.95rem; font-weight: 600; background: linear-gradient(120deg, #111827, #1f2937); color: #fff; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .gc-primary-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 20px rgba(15, 23, 42, 0.25); }
      .gc-primary-btn:focus-visible { outline: 3px solid #a7f3d0; outline-offset: 2px; }
      .gc-card-footer { margin-top: auto; }
      @media (max-width: 600px) {
        .gc-card { padding: 20px; }
        .gc-situations-list { max-height: 280px; }
      }
    </style>
  `;
  const sections = `
    ${pageStyles}
    <section class="landing-section">
      <div class="gym-confidence-shell" data-gym-confidence-root>
        <header class="gc-hero">
          <p class="gc-eyebrow">Gym Confidence</p>
          <h1>Move calmly, even on day one</h1>
          <p>${escapeHTML(WELCOME_COPY.split(' You')[0])}</p>
          <p>${escapeHTML('You\'ll learn simple etiquette and how to handle common situations.')}</p>
          <div class="gc-chip-row">${renderChips()}</div>
        </header>
        <div class="gc-grid">
          <article class="gc-card">
            <div>
              <p class="landing-subtext" style="margin:0;">Equipment etiquette</p>
              <h3>Small habits that keep the space friendly</h3>
              <p>${escapeHTML(ETIQUETTE_COPY)}</p>
              ${renderBulletList(ETIQUETTE_POINTS)}
            </div>
            <div data-etiquette-list>
              ${renderEtiquetteCards()}
            </div>
          </article>
          <article class="gc-card gc-situations-card">
            <div>
              <p class="landing-subtext" style="margin:0;">Common situations</p>
              <h3>Exactly what to do when the gym gets busy</h3>
            </div>
            <div class="gc-situations-list" data-situations-list>
              ${renderSituationCards()}
            </div>
          </article>
          <article class="gc-card">
            <div>
              <p class="landing-subtext" style="margin:0;">Confidence mindset</p>
              <h3>Short cues to keep your nerves low</h3>
              ${renderBulletList(CONFIDENCE_POINTS)}
              <p>${escapeHTML(CONFIDENCE_COPY)}</p>
            </div>
            <div class="gc-card-footer">
              <button type="button" class="gc-primary-btn" data-action="gym-confidence-finish">${FINISH_LABEL}</button>
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
  return renderPageShell(sections);
}

export function attachGymConfidenceEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  const finishButton = root?.querySelector('[data-action="gym-confidence-finish"]');
  if (finishButton) {
    finishButton.addEventListener('click', event => {
      event.preventDefault();
      const auth = getAuth();
      const fallbackHash = auth?.loggedIn ? '#/dashboard' : '#/onboarding';
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.hash = fallbackHash;
    });
  }
}
