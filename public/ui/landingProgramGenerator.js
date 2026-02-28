import { render } from './render.js';
import { getState } from '../logic/state.js';
import { escapeHTML } from '../utils/helpers.js';

const CTA_HASH = '#/subscribe';
const HEADER_LINKS = [
  { label: 'Home', hash: '#/' },
  { label: 'Planner', hash: '#/planner' },
  { label: 'Plan Generator', hash: '#/plan-generator' },
  { label: 'Program Generator', hash: '#/program-generator' },
  { label: 'Exercise Library', hash: '#/exercise-library' },
  { label: 'Subscribe', hash: '#/subscribe' }
];

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
  'Removes guesswork so you always know what to do next.',
  'Keeps workouts short, calm, and confidence-building.',
  'Balances goals, experience level, and the gear you have.',
  'Adds gentle etiquette reminders so beginner gyms feel friendly.'
];

const UNLOCKS = [
  'Unlimited program generations tailored to your schedule.',
  'Progress tracking, streak views, and soft accountability nudges.',
  'Gymxiety Mode with etiquette walk-throughs and confidence tips.',
  'Early access to specialty packs (travel gyms, mobility resets, hybrids).'
];

function buildHero(profile) {
  const goal = profile.goal || 'Build steady strength and confidence';
  const equipment = profile.equipment || 'Dumbbells + bench or bodyweight';
  return `
    <header class="pg-hero">
      <div class="pg-hero-copy">
        <p class="pg-kicker">Beginner friendly</p>
        <h1>Workout Program Generator</h1>
        <p class="pg-subheadline">Creates calm, beginner-ready programs based on your goals, experience, and equipment—so you can follow a plan without overwhelm.</p>
        <ul class="pg-hero-list">
          <li>Goal detected: <strong>${escapeHTML(goal)}</strong></li>
          <li>Equipment noted: <strong>${escapeHTML(equipment)}</strong></li>
        </ul>
        <button class="pg-cta" data-action="cta-start">Start free trial</button>
        <a class="pg-text-link" href="#/planner">Preview the planner instead</a>
      </div>
      <div class="pg-hero-visual" aria-hidden="true">
        <div class="pg-visual-card">
          <p class="pg-visual-label">Today · Full Body Calm</p>
          <ul>
            <li>
              <span>Goblet Squat</span>
              <small>3 x 10 · steady tempo</small>
            </li>
            <li>
              <span>Assisted Row</span>
              <small>3 x 12 · squeeze & breathe</small>
            </li>
            <li>
              <span>Incline Push-up</span>
              <small>3 x 8 · walk away confident</small>
            </li>
          </ul>
          <p class="pg-visual-foot">Locked in for you — just tap start.</p>
        </div>
      </div>
    </header>
  `;
}

function buildHeader() {
  return `
    <header class="pg-header">
      <div class="pg-header-inner">
        <div class="pg-brand">
          <img src="/images/allaround-athlete-logo.png" alt="AllAroundAthlete logo">
          <div>
            <p>All-Around Athlete</p>
            <small>Beginner programs without overwhelm</small>
          </div>
        </div>
        <nav class="pg-nav">
          ${HEADER_LINKS.map(link => `<a href="${link.hash}">${link.label}</a>`).join('')}
        </nav>
      </div>
    </header>
  `;
}

function buildSteps() {
  return `
    <section class="pg-steps">
      <h2>How it works</h2>
      <div class="pg-steps-grid">
        ${STEPS.map(step => `
          <article class="pg-step">
            <div class="pg-step-icon">✦</div>
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
    <section class="pg-sample">
      <div>
        <h2>Sample calm session</h2>
        <p>Here is what a ${escapeHTML(equipment)} day can look like inside the generator. Every exercise comes with sets, reps, rest, and a simple cue.</p>
      </div>
      <div class="pg-sample-list">
        ${SAMPLE_EXERCISES.map(ex => `
          <article class="pg-sample-card">
            <div class="pg-sample-thumb">🏋️</div>
            <div>
              <h3>${escapeHTML(ex.name)}</h3>
              <p>${escapeHTML(ex.sets)} · ${escapeHTML(ex.reps)} · ${escapeHTML(ex.rest)}</p>
              <span class="pg-chip">${escapeHTML(ex.equipment)}</span>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildBenefits() {
  return `
    <section class="pg-benefits">
      <h2>Why guided programs help beginners</h2>
      <div class="pg-benefits-grid">
        ${BENEFITS.map(benefit => `
          <article class="pg-benefit-card">
            <h3>Less Overwhelm</h3>
            <p>${escapeHTML(benefit)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildUnlocks() {
  return `
    <section class="pg-unlock">
      <h2>What you unlock with subscription</h2>
      <ul>
        ${UNLOCKS.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
      </ul>
      <button class="pg-cta" data-action="cta-start">Unlock generator & trial</button>
    </section>
  `;
}

export function renderProgramGeneratorLanding(options = {}) {
  const { standalone = true } = options;
  const state = getState();
  const profile = state.profile || {};
  const hero = buildHero(profile);
  const steps = buildSteps();
  const sample = buildSampleProgram(profile);
  const benefits = buildBenefits();
  const unlocks = buildUnlocks();

  const html = `
    <section class="pg-landing">
      <style>
        .pg-landing { padding: 48px 16px 80px; background: #070b1b; color: #f5f7ff; min-height: 100vh; }
        .pg-shell { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 48px; }
        .pg-header { position: sticky; top: 0; z-index: 5; background: rgba(7,11,27,0.95); border-bottom: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); margin: -48px -16px 32px; padding: 16px; }
        .pg-header-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 18px; }
        .pg-brand { display: flex; align-items: center; gap: 12px; color: #c7d3fb; }
        .pg-brand img { width: 58px; height: 58px; border-radius: 12px; }
        .pg-brand p { margin: 0; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; font-size: 0.95rem; }
        .pg-brand small { color: #8fb4ff; }
        .pg-nav { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.9rem; }
        .pg-nav a { color: #aab4dc; text-decoration: none; padding: 6px 10px; border-radius: 999px; border: 1px solid transparent; }
        .pg-nav a:hover { border-color: rgba(255,255,255,0.15); }
        .pg-hero { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 36px; align-items: center; }
        .pg-hero-copy h1 { margin: 12px 0; font-size: clamp(2.2rem, 4vw, 3rem); }
        .pg-subheadline { color: #c7d3fb; line-height: 1.6; }
        .pg-hero-list { list-style: none; padding: 0; margin: 16px 0 24px; color: #c7d3fb; }
        .pg-hero-list li { margin-bottom: 8px; }
        .pg-hero-visual { background: linear-gradient(135deg, #1d2750, #2c3a74); border-radius: 28px; padding: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.35); }
        .pg-visual-card { background: rgba(0,0,0,0.3); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.08); }
        .pg-visual-card ul { list-style: none; padding: 0; margin: 18px 0; display: flex; flex-direction: column; gap: 12px; }
        .pg-visual-card li { display: flex; flex-direction: column; }
        .pg-visual-label { color: #8fb4ff; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.12em; }
        .pg-cta { background: linear-gradient(135deg, #7fc4ff, #4f8cff); border: none; border-radius: 16px; padding: 14px 24px; color: #071023; font-weight: 600; cursor: pointer; box-shadow: 0 20px 40px rgba(79,140,255,0.35); }
        .pg-text-link { display: inline-block; margin-top: 12px; color: #8fb4ff; }
        .pg-steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; }
        .pg-step { padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); }
        .pg-step-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .pg-sample-list { display: flex; flex-direction: column; gap: 14px; margin-top: 18px; }
        .pg-sample-card { display: flex; gap: 14px; padding: 18px; border-radius: 16px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); }
        .pg-sample-thumb { width: 56px; height: 56px; border-radius: 16px; background: rgba(79,140,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; }
        .pg-chip { display: inline-flex; padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.2); font-size: 0.85rem; margin-top: 6px; }
        .pg-benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
        .pg-benefit-card { padding: 20px; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); }
        .pg-unlock { padding: 28px; border-radius: 24px; background: rgba(15,20,45,0.9); border: 1px solid rgba(255,255,255,0.08); }
        .pg-unlock ul { list-style: none; padding: 0; margin: 18px 0 24px; display: flex; flex-direction: column; gap: 10px; color: #c7d3fb; }
        @media (max-width: 600px) { .pg-landing { padding-top: 24px; } }
      </style>
      <div class="pg-shell">
        ${standalone ? buildHeader() : ''}
        ${hero}
        ${steps}
        ${sample}
        ${benefits}
        ${unlocks}
      </div>
    </section>
  `;

  const afterRender = root => {
    root.querySelectorAll('[data-action="cta-start"]').forEach(button => {
      button.addEventListener('click', () => {
        window.location.hash = CTA_HASH;
      });
    });
  };

  if (standalone) {
    render(html, afterRender);
  }

  return { html, afterRender };
}
