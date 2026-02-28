import { render } from './render.js';
import { getState } from '../logic/state.js';
import { escapeHTML } from '../utils/helpers.js';

const CTA_HASH = '#/subscribe';

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

function buildHero(profile) {
  const goal = profile.goal || 'Build steady strength and confidence';
  const equipment = profile.equipment || 'Dumbbells + bench';
  return `
    <header class="ws-hero">
      <div class="ws-hero-copy">
        <p class="ws-kicker">Calm prep</p>
        <h1>Workout Summary</h1>
        <p class="ws-subheadline">Shows your full workout in a clear, confidence-building layout—so you know every rep, rest, and cue before you begin.</p>
        <ul class="ws-hero-list">
          <li>Current goal: <strong>${escapeHTML(goal)}</strong></li>
          <li>Equipment detected: <strong>${escapeHTML(equipment)}</strong></li>
        </ul>
        <button class="ws-cta" data-action="cta-start">Start free trial</button>
        <a class="ws-text-link" href="#/planner">Preview planner instead</a>
      </div>
      <div class="ws-hero-visual" aria-hidden="true">
        <div class="ws-visual-card">
          <div class="ws-visual-header">
            <p>Today · Full Body Ease</p>
            <span class="ws-time-chip">~38 min</span>
          </div>
          <ul>
            ${SAMPLE_EXERCISES.slice(0, 3).map(ex => `
              <li>
                <div>
                  <p>${escapeHTML(ex.name)}</p>
                  <small>${escapeHTML(ex.sets)} · ${escapeHTML(ex.reps)}</small>
                </div>
                <span>${escapeHTML(ex.rest)}</span>
              </li>
            `).join('')}
          </ul>
          <p class="ws-visual-foot">Everything laid out so you can breathe and begin.</p>
        </div>
      </div>
    </header>
  `;
}

function buildHowItHelps() {
  return `
    <section class="ws-helps">
      <h2>How it helps you</h2>
      <div class="ws-helps-grid">
        ${HOW_IT_HELPS.map(item => `
          <article class="ws-help-card">
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
    <section class="ws-sample">
      <div class="ws-sample-head">
        <div>
          <h2>Sample summary preview</h2>
          <p>Each workout card shows your exercises, sets × reps, rest times, and estimated session length.</p>
        </div>
        <div class="ws-total-chip">Estimated time: ~38 min</div>
      </div>
      <div class="ws-card-grid">
        ${SAMPLE_EXERCISES.map(ex => `
          <article class="ws-card">
            <div class="ws-card-thumb">${ex.icon}</div>
            <div>
              <h3>${escapeHTML(ex.name)}</h3>
              <p>${escapeHTML(ex.muscle)} · ${escapeHTML(ex.sets)} · ${escapeHTML(ex.reps)}</p>
              <span class="ws-rest">${escapeHTML(ex.rest)}</span>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildBenefits() {
  return `
    <section class="ws-benefits">
      <h2>Why seeing it ahead of time matters</h2>
      <ul>
        ${BENEFITS.map(benefit => `<li>${escapeHTML(benefit)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function buildUnlockSection() {
  return `
    <section class="ws-unlock">
      <h2>What you unlock with subscription</h2>
      <ul>
        ${UNLOCKS.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
      </ul>
      <button class="ws-cta" data-action="cta-start">Unlock workout summaries</button>
    </section>
  `;
}

export function renderWorkoutSummaryLanding(options = {}) {
  const { standalone = true } = options;
  const state = getState();
  const profile = state.profile || {};
  const hero = buildHero(profile);
  const helps = buildHowItHelps();
  const sample = buildSampleSummary();
  const benefits = buildBenefits();
  const unlock = buildUnlockSection();

  const html = `
    <section class="ws-landing">
      <style>
        .ws-landing { padding: 48px 16px 80px; min-height: 100vh; background: #070b1b; color: #f5f7ff; }
        .ws-shell { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 48px; }
        .ws-hero { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 36px; align-items: center; }
        .ws-kicker { letter-spacing: 0.2em; text-transform: uppercase; color: #aab4dc; font-size: 0.78rem; }
        .ws-subheadline { color: #c7d3fb; line-height: 1.6; }
        .ws-hero-list { list-style: none; padding: 0; margin: 20px 0 24px; color: #c7d3fb; }
        .ws-hero-visual { background: linear-gradient(135deg, #1d2750, #2c3a74); border-radius: 28px; padding: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.35); }
        .ws-visual-card { background: rgba(0,0,0,0.3); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.08); }
        .ws-visual-card ul { list-style: none; padding: 0; margin: 18px 0; display: flex; flex-direction: column; gap: 12px; }
        .ws-visual-card li { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; }
        .ws-time-chip { background: rgba(255,255,255,0.12); padding: 4px 12px; border-radius: 999px; font-size: 0.85rem; }
        .ws-cta { background: linear-gradient(135deg, #7fc4ff, #4f8cff); border: none; border-radius: 16px; padding: 14px 24px; color: #071023; font-weight: 600; cursor: pointer; box-shadow: 0 20px 40px rgba(79,140,255,0.35); }
        .ws-text-link { display: inline-block; margin-top: 12px; color: #8fb4ff; }
        .ws-helps-grid, .ws-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
        .ws-help-card, .ws-card { padding: 20px; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); }
        .ws-card { display: flex; gap: 16px; align-items: center; }
        .ws-card-thumb { width: 56px; height: 56px; border-radius: 16px; background: rgba(79,140,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; }
        .ws-rest { display: inline-flex; padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.2); font-size: 0.85rem; margin-top: 8px; }
        .ws-total-chip { background: rgba(255,255,255,0.08); padding: 10px 18px; border-radius: 999px; font-weight: 600; }
        .ws-benefits ul, .ws-unlock ul { list-style: none; padding: 0; margin: 18px 0 24px; display: flex; flex-direction: column; gap: 10px; color: #c7d3fb; }
        .ws-unlock { padding: 28px; border-radius: 24px; background: rgba(15,20,45,0.9); border: 1px solid rgba(255,255,255,0.08); }
        @media (max-width: 600px) { .ws-landing { padding-top: 24px; } }
      </style>
      <div class="ws-shell">
        ${hero}
        ${helps}
        ${sample}
        ${benefits}
        ${unlock}
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
