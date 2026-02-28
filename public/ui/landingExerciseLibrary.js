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
  { name: 'Goblet Squat', muscle: 'Legs', equipment: 'Dumbbell', icon: '🟢' },
  { name: 'Assisted Row', muscle: 'Back', equipment: 'Cable / Band', icon: '🔵' },
  { name: 'Incline Push-up', muscle: 'Chest', equipment: 'Bench', icon: '🟣' },
  { name: 'Tall Kneeling Press', muscle: 'Shoulders', equipment: 'Dumbbell', icon: '🟡' },
  { name: 'Deadbug Breathing', muscle: 'Core', equipment: 'Bodyweight', icon: '🟠' }
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

function buildHero(profile) {
  const goal = profile.goal || 'Build steady strength and confidence';
  return `
    <header class="el-hero">
      <div class="el-hero-copy">
        <p class="el-kicker">Beginner ready</p>
        <h1>Exercise Library</h1>
        <p class="el-subheadline">Teaches you how to perform every movement safely with calm visuals, soft cues, and equipment notes.</p>
        <ul class="el-hero-highlights">
          <li>Current goal: <strong>${escapeHTML(goal)}</strong></li>
          <li>Made for beginners who want gentle guidance.</li>
        </ul>
        <button class="el-cta" data-action="cta-start">Start free trial</button>
        <a class="el-text-link" href="#/planner">Visit the planner instead</a>
      </div>
      <div class="el-hero-visual" aria-hidden="true">
        <div class="el-visual-grid">
          ${SAMPLE_EXERCISES.slice(0, 3).map(ex => `
            <article class="el-visual-card">
              <div class="el-visual-icon">${ex.icon}</div>
              <h3>${escapeHTML(ex.name)}</h3>
              <p>${escapeHTML(ex.muscle)} · ${escapeHTML(ex.equipment)}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </header>
  `;
}

function buildHeader() {
  return `
    <header class="el-header">
      <div class="el-header-inner">
        <div class="el-brand">
          <img src="/images/allaround-athlete-logo.png" alt="AllAroundAthlete logo">
          <div>
            <p>All-Around Athlete</p>
            <small>Calm coaching for beginners</small>
          </div>
        </div>
        <nav class="el-nav">
          ${HEADER_LINKS.map(link => `<a href="${link.hash}">${link.label}</a>`).join('')}
        </nav>
      </div>
    </header>
  `;
}

function buildHowItHelps() {
  return `
    <section class="el-helps">
      <h2>How it helps you</h2>
      <div class="el-helps-grid">
        ${HOW_IT_HELPS.map(item => `
          <article class="el-help-card">
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
    <section class="el-sample">
      <h2>Peek inside the library</h2>
      <div class="el-card-grid">
        ${SAMPLE_EXERCISES.map(ex => `
          <article class="el-card">
            <div class="el-card-thumb">${ex.icon}</div>
            <div>
              <h3>${escapeHTML(ex.name)}</h3>
              <p>${escapeHTML(ex.muscle)} · ${escapeHTML(ex.equipment)}</p>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildFiltersSection() {
  return `
    <section class="el-filters">
      <h2>Filters keep it simple</h2>
      <div class="el-filter-grid">
        ${FILTERS.map(group => `
          <article class="el-filter-card">
            <h3>${escapeHTML(group.label)}</h3>
            <div class="el-chip-row">
              ${group.items.map(item => `<span class="el-chip">${escapeHTML(item)}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildBenefitsSection() {
  return `
    <section class="el-benefits">
      <h2>Why this matters for beginners</h2>
      <ul>
        ${BENEFITS.map(benefit => `<li>${escapeHTML(benefit)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function buildUnlockSection() {
  return `
    <section class="el-unlock">
      <h2>What you unlock with subscription</h2>
      <ul>
        ${UNLOCKS.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
      </ul>
      <button class="el-cta" data-action="cta-start">Unlock the Exercise Library</button>
    </section>
  `;
}

export function renderExerciseLibraryLanding(options = {}) {
  const { standalone = true } = options;
  const state = getState();
  const profile = state.profile || {};
  const hero = buildHero(profile);
  const helps = buildHowItHelps();
  const sample = buildSampleCards();
  const filters = buildFiltersSection();
  const benefits = buildBenefitsSection();
  const unlock = buildUnlockSection();

  const html = `
    <section class="el-landing">
      <style>
        .el-landing { padding: 48px 16px 80px; min-height: 100vh; background: #070b1b; color: #f5f7ff; }
        .el-shell { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 48px; }
        .el-header { position: sticky; top: 0; z-index: 5; background: rgba(7,11,27,0.95); border-bottom: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); margin: -48px -16px 32px; padding: 16px; }
        .el-header-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 18px; }
        .el-brand { display: flex; align-items: center; gap: 12px; color: #c7d3fb; }
        .el-brand img { width: 58px; height: 58px; border-radius: 12px; }
        .el-brand p { margin: 0; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; font-size: 0.95rem; }
        .el-brand small { color: #8fb4ff; }
        .el-nav { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.9rem; }
        .el-nav a { color: #aab4dc; text-decoration: none; padding: 6px 10px; border-radius: 999px; border: 1px solid transparent; }
        .el-nav a:hover { border-color: rgba(255,255,255,0.15); }
        .el-hero { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 36px; align-items: center; }
        .el-kicker { letter-spacing: 0.2em; text-transform: uppercase; color: #aab4dc; font-size: 0.78rem; }
        .el-subheadline { color: #c7d3fb; line-height: 1.6; }
        .el-hero-highlights { list-style: none; padding: 0; margin: 20px 0 24px; color: #c7d3fb; }
        .el-hero-visual { background: linear-gradient(135deg, #1d2750, #2c3a74); border-radius: 28px; padding: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.35); }
        .el-visual-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
        .el-visual-card { padding: 18px; border-radius: 18px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); }
        .el-visual-icon { font-size: 1.8rem; margin-bottom: 8px; }
        .el-cta { background: linear-gradient(135deg, #7fc4ff, #4f8cff); border: none; border-radius: 16px; padding: 14px 24px; color: #071023; font-weight: 600; cursor: pointer; box-shadow: 0 20px 40px rgba(79,140,255,0.35); }
        .el-text-link { display: inline-block; margin-top: 12px; color: #8fb4ff; }
        .el-helps-grid, .el-card-grid, .el-filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
        .el-help-card, .el-card, .el-filter-card { padding: 20px; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); }
        .el-card { display: flex; gap: 16px; align-items: center; }
        .el-card-thumb { width: 56px; height: 56px; border-radius: 16px; background: rgba(79,140,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; }
        .el-chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .el-chip { padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.2); font-size: 0.85rem; }
        .el-benefits ul, .el-unlock ul { list-style: none; padding: 0; margin: 18px 0 24px; display: flex; flex-direction: column; gap: 10px; color: #c7d3fb; }
        .el-unlock { padding: 28px; border-radius: 24px; background: rgba(15,20,45,0.9); border: 1px solid rgba(255,255,255,0.08); }
        @media (max-width: 600px) { .el-landing { padding-top: 24px; } }
      </style>
      <div class="el-shell">
        ${standalone ? buildHeader() : ''}
        ${hero}
        ${buildHowItHelps()}
        ${sample}
        ${filters}
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
