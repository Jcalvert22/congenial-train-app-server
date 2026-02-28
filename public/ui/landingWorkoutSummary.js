import { render } from './render.js';
import { getState } from '../logic/state.js';
import { escapeHTML } from '../utils/helpers.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';

const CTA_HASH = '#/start-trial';

const HOW_IT_HELPS = [
  {
    title: 'Clarity before you start',
    copy: 'Know every lift, set, rep, and breathing note before you pick up a weight.'
  },
  {
    title: 'Built-in pacing',
    copy: 'Rest timers and estimated duration keep sessions short and calm.'
  },
  {
    title: 'Confidence booster',
    copy: 'Seeing the order removes guesswork so day-one lifters feel ready.'
  }
];

const SAMPLE_EXERCISES = [
  { name: 'Goblet Squat', sets: '3 sets', reps: '10 reps', rest: 'Rest 60 sec', muscle: 'Legs', icon: '🟢' },
  { name: 'Assisted Row', sets: '3 sets', reps: '12 reps', rest: 'Rest 60 sec', muscle: 'Back', icon: '🔵' },
  { name: 'Incline Push-up', sets: '3 sets', reps: '8 reps', rest: 'Rest 75 sec', muscle: 'Chest', icon: '🟣' },
  { name: 'Deadbug Breathing', sets: '2 sets', reps: '40 sec', rest: 'Rest 45 sec', muscle: 'Core', icon: '🟠' }
];

const BENEFITS = [
  'You arrive knowing the plan, so there is no decision fatigue.',
  'Beginner-friendly cues cut down on awkward starts.',
  'Timing guidance keeps workouts doable even on busy days.',
  'Seeing progress summaries builds trust in the process.'
];

const UNLOCKS = [
  'Unlimited workout summaries tailored to your goals.',
  'Feedback tools that adjust loads and reps over time.',
  'Progress log with streaks, notes, and etiquette reminders.',
  'Future packs: travel templates, hybrid classes, and more.'
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
  const equipment = profile.equipment || 'Dumbbells + bench';
  return `
    <header class="landing-hero">
      <div>
        <p class="landing-subtext">Calm prep</p>
        <h1>Workout Summary</h1>
        <p class="landing-subtext lead">Shows your full workout in a clear, confidence-building layout—so you know every rep, rest, and cue before you begin.</p>
        <ul class="landing-list">
          <li>Current goal: <strong>${escapeHTML(goal)}</strong></li>
          <li>Equipment detected: <strong>${escapeHTML(equipment)}</strong></li>
        </ul>
        <div class="landing-actions">
          <a class="landing-button" data-action="cta-start" href="${cta.href}">${cta.label}</a>
          <a class="landing-button secondary" href="#/planner">Preview planner instead</a>
        </div>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Today · Full Body Ease</p>
        <div class="landing-actions">
          <span class="landing-chip">~38 min</span>
        </div>
        <ul class="landing-list">
          ${SAMPLE_EXERCISES.slice(0, 3).map(exercise => `
            <li>
              <span>${escapeHTML(exercise.name)}</span>
              <small>${escapeHTML(exercise.sets)} · ${escapeHTML(exercise.reps)}</small>
            </li>
          `).join('')}
        </ul>
        <p class="landing-subtext">Everything laid out so you can breathe and begin.</p>
      </div>
    </header>
  `;
}

function buildHowItHelps() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Why it helps</p>
      <h2>Support before every session</h2>
      <div class="landing-grid">
        ${HOW_IT_HELPS.map(item => `
          <article class="landing-card">
            <div class="landing-card-image">✧</div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.copy)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildSampleSummary() {
  return `
    <section class="landing-section">
      <div class="landing-grid landing-grid-two">
        <div>
          <p class="landing-subtext">Sample summary preview</p>
          <h2>See the whole workout</h2>
          <p>Each workout card shows your exercises, sets × reps, rest times, and estimated session length.</p>
          <span class="landing-chip">Estimated time · ~38 min</span>
        </div>
        <div class="landing-grid">
          ${SAMPLE_EXERCISES.map(exercise => `
            <article class="landing-card">
              <div class="landing-card-image">${exercise.icon}</div>
              <h3>${escapeHTML(exercise.name)}</h3>
              <p>${escapeHTML(exercise.muscle)} · ${escapeHTML(exercise.sets)} · ${escapeHTML(exercise.reps)}</p>
              <span class="landing-chip">${escapeHTML(exercise.rest)}</span>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function buildBenefits() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Beginner confidence</p>
      <h2>Why seeing it ahead matters</h2>
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
        <a class="landing-button secondary" href="#/exercise-library">Explore form library</a>
      </div>
    </section>
  `;
}

export function renderWorkoutSummaryLanding(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  ensureLandingStyles();
  const state = getState();
  const profile = state.profile || {};
  const cta = resolveCta(state);

  const hero = buildHero(profile, cta);
  const helps = buildHowItHelps();
  const sample = buildSampleSummary();
  const benefits = buildBenefits();
  const unlock = buildUnlockSection(cta);

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${hero}
        ${helps}
        ${sample}
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
