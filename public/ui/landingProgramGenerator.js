import { render } from './render.js';
import { getState } from '../logic/state.js';
import { escapeHTML } from '../utils/helpers.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';

const CTA_HASH = '#/start-trial';
const SAMPLE_ICONS = ['🏋️', '🧘', '💪', '🌀'];

const STEPS = [
  {
    title: 'Share your goal',
    copy: 'Tell us if you want steady strength, gentle fat loss, or simply to feel better moving through the day.'
  },
  {
    title: 'Pick your equipment',
    copy: 'Select whatever you actually have—apartment dumbbells, hotel gym, or just bodyweight.'
  },
  {
    title: 'We build the plan',
    copy: 'The generator stacks short sessions with sets, reps, and breathing cues that make sense for beginners.'
  },
  {
    title: 'Stay consistent',
    copy: 'We nudge you with reminders, etiquette tips, and calm progress notes so you keep showing up.'
  }
];

const SAMPLE_EXERCISES = [
  { name: 'Goblet Squat', sets: '3 sets', reps: '10 reps', rest: 'Rest 60 sec', equipment: 'Dumbbell' },
  { name: 'Assisted Row', sets: '3 sets', reps: '12 reps', rest: 'Rest 60 sec', equipment: 'Cable / Band' },
  { name: 'Incline Push-up', sets: '3 sets', reps: '8 reps', rest: 'Rest 75 sec', equipment: 'Bench' },
  { name: 'Deadbug Breathing', sets: '2 sets', reps: '40 sec', rest: 'Rest 45 sec', equipment: 'Bodyweight' }
];

const BENEFITS = [
  {
    title: 'No guesswork',
    copy: 'Removes guesswork so you always know what to do next.'
  },
  {
    title: 'Calm pacing',
    copy: 'Keeps workouts short, calm, and confidence-building so sessions feel approachable.'
  },
  {
    title: 'Personal inputs',
    copy: 'Balances goals, experience level, and the gear you have on hand.'
  },
  {
    title: 'Gym confidence',
    copy: 'Adds gentle etiquette reminders so beginner gyms feel friendly.'
  }
];

const UNLOCKS = [
  'Unlimited program generations tailored to your schedule.',
  'Progress tracking, streak views, and soft accountability nudges.',
  'Gymxiety Mode with etiquette walk-throughs and confidence tips.',
  'Early access to specialty packs (travel gyms, mobility resets, hybrids).'
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
  const equipment = profile.equipment || 'Dumbbells + bench or bodyweight';
  return `
    <header class="landing-hero">
      <div>
        <p class="landing-subtext">Beginner friendly</p>
        <h1>Workout Program Generator</h1>
        <p class="landing-subtext lead">Creates calm, beginner-ready programs based on your goals, experience, and equipment—so you can follow a plan without overwhelm.</p>
        <ul class="landing-list">
          <li>Goal detected: <strong>${escapeHTML(goal)}</strong></li>
          <li>Equipment noted: <strong>${escapeHTML(equipment)}</strong></li>
        </ul>
        <div class="landing-actions">
          <a class="landing-button" data-action="cta-start" href="${cta.href}">${cta.label}</a>
          <a class="landing-button secondary" href="#/planner">Preview the planner instead</a>
        </div>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Today · Full Body Calm</p>
        <ul class="landing-list">
          ${SAMPLE_EXERCISES.slice(0, 3).map(exercise => `
            <li>
              <span>${escapeHTML(exercise.name)}</span>
              <small>${escapeHTML(exercise.sets)} · ${escapeHTML(exercise.reps)} · ${escapeHTML(exercise.rest)}</small>
            </li>
          `).join('')}
        </ul>
        <p class="landing-subtext">Locked in for you — just tap start.</p>
      </div>
    </header>
  `;
}

function buildSteps() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">How it works</p>
      <h2>Steady steps to your plan</h2>
      <div class="landing-grid">
        ${STEPS.map(step => `
          <article class="landing-card">
            <div class="landing-card-image">✦</div>
            <h3>${escapeHTML(step.title)}</h3>
            <p>${escapeHTML(step.copy)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildSampleProgram(profile) {
  const equipment = profile.equipment || 'dumbbells + bench';
  return `
    <section class="landing-section">
      <div class="landing-grid landing-grid-two">
        <div>
          <p class="landing-subtext">Sample calm session</p>
          <h2>A preview of your workouts</h2>
          <p>Here is what a ${escapeHTML(equipment)} day can look like inside the generator. Every exercise comes with sets, reps, rest, and a simple cue.</p>
        </div>
        <div class="landing-grid">
          ${SAMPLE_EXERCISES.map((exercise, index) => `
            <article class="landing-card">
              <div class="landing-card-image">${SAMPLE_ICONS[index % SAMPLE_ICONS.length]}</div>
              <h3>${escapeHTML(exercise.name)}</h3>
              <p>${escapeHTML(exercise.sets)} · ${escapeHTML(exercise.reps)} · ${escapeHTML(exercise.rest)}</p>
              <span class="landing-chip">${escapeHTML(exercise.equipment)}</span>
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
      <p class="landing-subtext">Beginner focus</p>
      <h2>Why guided programs help</h2>
      <div class="landing-grid">
        ${BENEFITS.map(benefit => `
          <article class="landing-card">
            <div class="landing-card-image">☺︎</div>
            <h3>${escapeHTML(benefit.title)}</h3>
            <p>${escapeHTML(benefit.copy)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildUnlocks(cta) {
  return `
    <section class="landing-section landing-cta">
      <p class="landing-subtext">Subscribers unlock</p>
      <h2>What you unlock with subscription</h2>
      <ul class="landing-list">
        ${UNLOCKS.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
      </ul>
      <div class="landing-actions">
        <a class="landing-button" data-action="cta-start" href="${cta.href}">${cta.label}</a>
        <a class="landing-button secondary" href="#/plan-generator">See manual planner</a>
      </div>
    </section>
  `;
}

export function renderProgramGeneratorLanding(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  ensureLandingStyles();
  const state = getState();
  const profile = state.profile || {};
  const cta = resolveCta(state);

  const hero = buildHero(profile, cta);
  const steps = buildSteps();
  const sample = buildSampleProgram(profile);
  const benefits = buildBenefits();
  const unlocks = buildUnlocks(cta);

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${hero}
        ${steps}
        ${sample}
        ${benefits}
        ${unlocks}
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
