import { render } from './render.js';
import { getState } from '../logic/state.js';
import { escapeHTML } from '../utils/helpers.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';

const CTA_HASH = '#/start-trial';

const HOW_IT_HELPS = [
  {
    title: 'See every move',
    copy: 'Each exercise shows a friendly graphic, simple cues, and the gear you will touch so nothing feels mysterious.'
  },
  {
    title: 'Stay safe',
    copy: 'Plain-language reminders keep joints lined up, help you breathe on time, and teach proper pacing.'
  },
  {
    title: 'Know what to expect',
    copy: 'Etiquette nudges explain how to share equipment, wipe stations, and reset weights so you feel at home.'
  }
];

const SAMPLE_EXERCISES = [
  { name: 'Goblet Squat', muscle: 'Legs', equipment: 'Dumbbell', icon: '\u{1F7E2}' },
  { name: 'Assisted Row', muscle: 'Back', equipment: 'Cable / Band', icon: '\u{1F535}' },
  { name: 'Incline Push-up', muscle: 'Chest', equipment: 'Bench', icon: '\u{1F7E3}' },
  { name: 'Tall Kneeling Press', muscle: 'Shoulders', equipment: 'Dumbbell', icon: '\u{1F7E1}' },
  { name: 'Deadbug Breathing', muscle: 'Core', equipment: 'Bodyweight', icon: '\u{1F7E0}' }
];

const FILTERS = [
  { label: 'Equipment', items: ['Bodyweight', 'Bands', 'Dumbbells', 'Full Gym'] },
  { label: 'Muscle group', items: ['Chest', 'Back', 'Legs', 'Shoulders', 'Core'] },
  { label: 'Difficulty', items: ['Relaxed', 'Gentle', 'Steady'] }
];

const BENEFITS = [
  'Learning proper movement patterns builds day-one confidence.',
  'Clear visuals shrink gym anxiety before you ever step inside.',
  'Equipment tags make planning easier when gear is limited.',
  'Safety cues help beginners avoid awkward or painful reps.'
];

const UNLOCKS = [
  'Full access to every exercise walkthrough and cue card.',
  'Filter by equipment, muscle, and difficulty without limits.',
  "Save favorites and build 'confidence stacks' for practice.",
  'Unlock future packs: hotel gyms, mobility resets, and hybrid classes.'
];

function resolveCta(state) {
  if (!state?.isSubscribed) {
    return { href: CTA_HASH, label: 'Start free trial' };
  }
  if (!state?.profile?.onboardingComplete) {
    return { href: '#/onboarding', label: 'Continue onboarding' };
  }
  return { href: '#/planner', label: 'Open planner' };
}

function buildHero(profile, cta) {
  const goal = profile.goal || 'Build steady strength and confidence';
  return `
    <header class="landing-hero">
      <div>
        <p class="landing-subtext">Beginner ready</p>
        <h1>Exercise Library</h1>
        <p class="landing-subtext lead">Teaches you how to perform every movement safely with calm visuals, soft cues, and equipment notes.</p>
        <ul class="landing-list">
          <li>Current goal: <strong>${escapeHTML(goal)}</strong></li>
          <li>Made for beginners who want gentle guidance.</li>
        </ul>
        <div class="landing-actions">
          <a class="landing-button" data-action="cta-start" href="${cta.href}">${cta.label}</a>
          <a class="landing-button secondary" href="#/planner">Visit the planner instead</a>
        </div>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Library preview</p>
        <div class="landing-grid">
          ${SAMPLE_EXERCISES.slice(0, 3).map(exercise => `
            <article class="landing-card">
              <div class="landing-card-image">${exercise.icon}</div>
              <h3>${escapeHTML(exercise.name)}</h3>
              <p class="landing-subtext">${escapeHTML(exercise.muscle)} - ${escapeHTML(exercise.equipment)}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </header>
  `;
}

function buildHowItHelps() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Why it matters</p>
      <h2>How it helps you</h2>
      <div class="landing-grid">
        ${HOW_IT_HELPS.map(item => `
          <article class="landing-card">
            <div class="landing-card-image">&#x2737;</div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.copy)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildSampleCards() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Peek inside</p>
      <h2>Friendly exercise cards</h2>
      <div class="landing-grid">
        ${SAMPLE_EXERCISES.map(exercise => `
          <article class="landing-card">
            <div class="landing-card-image">${exercise.icon}</div>
            <h3>${escapeHTML(exercise.name)}</h3>
            <p>${escapeHTML(exercise.muscle)} - ${escapeHTML(exercise.equipment)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildFiltersSection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Stay organized</p>
      <h2>Filters keep it simple</h2>
      <div class="landing-grid">
        ${FILTERS.map(group => `
          <article class="landing-card">
            <h3>${escapeHTML(group.label)}</h3>
            <div class="landing-chip-row">
              ${group.items.map(item => `<span class="landing-chip">${escapeHTML(item)}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildBenefitsSection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Beginner confidence</p>
      <h2>Why this library matters</h2>
      <ul class="landing-list">
        ${BENEFITS.map(benefit => `<li>${escapeHTML(benefit)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function buildUnlockSection(cta) {
  return `
    <section class="landing-section landing-cta">
      <p class="landing-subtext">Subscribers unlock</p>
      <h2>What you unlock with subscription</h2>
      <ul class="landing-list">
        ${UNLOCKS.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
      </ul>
      <div class="landing-actions">
        <a class="landing-button" data-action="cta-start" href="${cta.href}">${cta.label}</a>
        <a class="landing-button secondary" href="#/program-generator">Generate a plan first</a>
      </div>
    </section>
  `;
}

export function renderExerciseLibraryLanding(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  ensureLandingStyles();
  const state = getState();
  const profile = state.profile || {};
  const cta = resolveCta(state);

  const hero = buildHero(profile, cta);
  const helps = buildHowItHelps();
  const sample = buildSampleCards();
  const filters = buildFiltersSection();
  const benefits = buildBenefitsSection();
  const unlock = buildUnlockSection(cta);

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${hero}
        ${helps}
        ${sample}
        ${filters}
        ${benefits}
        ${unlock}
      </div>
      ${includeFooter ? renderFooter() : ''}
    </section>
  `;

  const afterRender = root => {
    root.querySelectorAll('[data-action="cta-start"]').forEach(button => {
      if (button.tagName !== 'A') {
        button.addEventListener('click', event => {
          event.preventDefault();
          window.location.hash = cta.href;
        });
      }
    });
  };

  if (standalone) {
    render(html, afterRender);
  }

  return { html, afterRender };
}
