import { escapeHTML } from '../utils/helpers.js';
import { renderPageShell } from '../components/stateCards.js';
import { getAuth } from '../auth/state.js';
import { GYM_SITUATIONS } from '../data/gymSituations.js';
import { EQUIPMENT_ETIQUETTE } from '../data/exercises.js';

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
  const sections = `
    <section class="landing-section">
      <div class="gym-confidence-shell" data-gym-confidence-root>
        <header class="gc-hero">
          <p class="gc-eyebrow">Gymxiety Mode</p>
          <h1>Remove the pressure, confusion, and intimidation of the gym.</h1>
          <p>Gymxiety Mode removes the pressure, confusion, and intimidation of the gym. You'll learn simple etiquette and exactly how to handle common situations — calmly.</p>
          <div class="gc-chip-row">${renderChips()}</div>
        </header>
        <article class="gc-highlight-card">
          <h2>Workouts that feel safe, simple, and beginner-friendly.</h2>
          <p>Walking into a gym can feel overwhelming — the equipment, the people, the pressure to "know what you're doing." Gymxiety Mode removes all of that. Every workout is structured without stress, designed to feel approachable, doable, and safe from day one.</p>
        </article>
        <div class="gc-grid">
          <article class="gc-card">
            <div>
              <p class="landing-subtext gc-section-label">Equipment etiquette</p>
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
              <p class="landing-subtext gc-section-label">Common situations</p>
              <h3>Exactly what to do when the gym gets busy</h3>
            </div>
            <div class="gc-situations-list" data-situations-list>
              ${renderSituationCards()}
            </div>
          </article>
          <article class="gc-card">
            <div>
              <p class="landing-subtext gc-section-label">Confidence mindset</p>
              <h3>Short cues to keep your nerves low</h3>
              ${renderBulletList(CONFIDENCE_POINTS)}
              <p>${escapeHTML(CONFIDENCE_COPY)}</p>
            </div>
            <div class="gc-card-footer">
              <button type="button" class="landing-button" data-action="gym-confidence-finish">${FINISH_LABEL}</button>
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
