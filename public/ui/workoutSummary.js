import { initRenderer } from './render.js';
import { getState } from '../logic/state.js';
import { escapeHTML } from '../utils/helpers.js';

const WORKOUT_SUMMARY_STYLES = `
.ws-screen {
  min-height: 100vh;
  padding: 48px 20px 72px;
  background: radial-gradient(circle at top, rgba(79,140,255,0.18), rgba(7,11,27,0.95));
  color: #f5f7ff;
}
.ws-shell {
  max-width: 960px;
  margin: 0 auto;
  background: rgba(16,22,50,0.9);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 36px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.45);
}
.ws-header {
  text-align: center;
  margin-bottom: 32px;
}
.ws-kicker {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.78rem;
  color: #aab4dc;
  margin: 0 0 6px;
}
.ws-header h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.8rem);
}
.ws-subtitle {
  color: #c7d3fb;
  margin: 12px 0 18px;
}
.ws-back-link {
  color: #7fc4ff;
  font-weight: 600;
  text-decoration: none;
}
.ws-summary-box {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  padding: 22px;
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 32px;
}
.ws-stat label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #aab4dc;
}
.ws-stat strong {
  display: block;
  margin-top: 6px;
  font-size: 1.4rem;
}
.ws-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.ws-chip {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.18);
  font-size: 0.85rem;
}
.ws-chip-muted {
  background: rgba(255,255,255,0.08);
  border-color: transparent;
}
.ws-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.ws-card {
  display: flex;
  gap: 18px;
  padding: 20px;
  border-radius: 18px;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
}
.ws-thumb {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #7fc4ff, #4f8cff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.ws-card-body {
  flex: 1;
}
.ws-card-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.ws-card-head h3 {
  margin: 0;
  font-size: 1.2rem;
}
.ws-prescription {
  font-size: 0.95rem;
  color: #aab4dc;
}
.ws-card-copy {
  margin: 8px 0 10px;
  color: #d6def6;
}
.ws-card-meta {
  list-style: none;
  padding: 0;
  margin: 0 0 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #aab4dc;
  font-size: 0.9rem;
}
.ws-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.ws-empty {
  text-align: center;
  color: #aab4dc;
}
.ws-start-btn {
  margin-top: 36px;
  width: 100%;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #7fc4ff, #4f8cff);
  color: #060b1d;
  cursor: pointer;
  box-shadow: 0 25px 50px rgba(79,140,255,0.3);
}
.ws-start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@media (max-width: 640px) {
  .ws-shell { padding: 24px; }
  .ws-card { flex-direction: column; }
  .ws-card-head { flex-direction: column; align-items: flex-start; }
  .ws-thumb { width: 60px; height: 60px; font-size: 1.6rem; }
}
`;

const MUSCLE_ICONS = {
  Chest: '🧡',
  Back: '💙',
  Legs: '💚',
  Shoulders: '💛',
  Arms: '💪',
  Abs: '🌀'
};

let rendererInstance = null;

function ensureRenderer() {
  if (!rendererInstance) {
    rendererInstance = initRenderer('#app');
  }
  return rendererInstance;
}

function estimateDuration(rows) {
  if (!rows.length) {
    return 0;
  }
  const minutes = Math.round(8 + rows.length * 6.5);
  return minutes;
}

function collectEquipmentTags(rows) {
  const tags = new Set();
  rows.forEach(row => {
    row.equipment.split(',').map(piece => piece.trim()).filter(Boolean).forEach(piece => tags.add(piece));
  });
  return Array.from(tags);
}

function getExerciseIcon(muscle) {
  return MUSCLE_ICONS[muscle] || '🏋️';
}

function resolveRestTime(row) {
  return row.usesWeight ? 'Rest 75-90 sec' : 'Rest 40-60 sec';
}

function resolveDifficulty(state, plan) {
  const profileLevel = (state.profile?.experienceLevel || '').trim();
  if (profileLevel) {
    return profileLevel.charAt(0).toUpperCase() + profileLevel.slice(1);
  }
  const mode = plan?.summary?.mode || '';
  if (mode.toLowerCase() === 'bulking') {
    return 'Moderate';
  }
  return 'Gentle';
}

function buildExerciseCards(rows) {
  if (!rows.length) {
    return '<p class="ws-empty">Generate a plan to preview each lift.</p>';
  }
  return rows.map(row => `
    <article class="ws-card">
      <div class="ws-thumb" aria-hidden="true">${getExerciseIcon(row.muscle)}</div>
      <div class="ws-card-body">
        <div class="ws-card-head">
          <h3>${escapeHTML(row.exercise)}</h3>
          <span class="ws-prescription">${escapeHTML(row.sets)} · ${escapeHTML(row.repRange)}</span>
        </div>
        <p class="ws-card-copy">${escapeHTML(row.description || 'Move with steady breathing and soft knees.')}</p>
        <ul class="ws-card-meta">
          <li>${resolveRestTime(row)}</li>
          <li>${escapeHTML(row.equipment)}</li>
        </ul>
        <div class="ws-card-tags">
          <span class="ws-chip">${escapeHTML(row.muscle)}</span>
          <span class="ws-chip ws-chip-muted">${row.usesWeight ? 'Moderate load' : 'Bodyweight focus'}</span>
        </div>
      </div>
    </article>
  `).join('');
}

export function renderWorkoutSummary() {
  const { render } = ensureRenderer();
  const state = getState();
  const plan = state.ui?.plannerResult;
  const rows = plan?.planRows || [];
  const summary = plan?.summary || {};

  const totalExercises = rows.length;
  const duration = estimateDuration(rows);
  const equipmentTags = collectEquipmentTags(rows);
  const difficulty = resolveDifficulty(state, plan);

  const equipmentChips = equipmentTags.length ? equipmentTags.map(tag => `<span class="ws-chip">${escapeHTML(tag)}</span>`).join('') : '<span class="ws-chip ws-chip-muted">Bodyweight</span>';

  const html = `
    <section class="ws-screen">
      <style>${WORKOUT_SUMMARY_STYLES}</style>
      <div class="ws-shell">
        <header class="ws-header">
          <p class="ws-kicker">Preview & Prep</p>
          <h1>Your Workout</h1>
          <p class="ws-subtitle">Look over each lift, note the cues, then tap start when you feel ready.</p>
          <a class="ws-back-link" href="#/planner">← Back to planner</a>
        </header>
        <div class="ws-summary-box">
          <div class="ws-stat">
            <label>Total exercises</label>
            <strong>${totalExercises || 0}</strong>
          </div>
          <div class="ws-stat">
            <label>Estimated time</label>
            <strong>${duration ? `~${duration} min` : 'Add moves'}</strong>
          </div>
          <div class="ws-stat">
            <label>Difficulty</label>
            <strong>${escapeHTML(difficulty)}</strong>
          </div>
          <div class="ws-stat">
            <label>Equipment needed</label>
            <div class="ws-tags">${equipmentChips}</div>
          </div>
        </div>
        <section class="ws-list">
          ${buildExerciseCards(rows)}
        </section>
        <button class="ws-start-btn" data-action="start-workout">Start Workout</button>
      </div>
    </section>
  `;

  render(html, root => {
    const button = root.querySelector('[data-action="start-workout"]');
    if (button) {
      button.addEventListener('click', () => {
        console.info('Workout started — placeholder action.');
        button.textContent = 'Workout in progress';
        button.disabled = true;
      });
    }
  });
}
