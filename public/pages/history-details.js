import { escapeHTML } from '../utils/helpers.js';
import { getHistory } from '../data/history.js';
import { getAuth } from '../auth/state.js';

function wrapLandingPage(sections) {
  return `
    <section class="landing-page">
      <div class="landing-container">
        ${sections}
      </div>
    </section>
  `;
}

function formatDateLabel(dateValue) {
  if (!dateValue) {
    return 'Unknown date';
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function renderHeader(dateLabel) {
  const auth = getAuth();
  const firstName = (auth.user?.name || 'Friend').split(' ')[0];
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">History detail</span>
        <h1>Workout Details</h1>
        <p class="landing-subtext lead">Completed on ${escapeHTML(dateLabel)} · logged for ${escapeHTML(firstName)}</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Reflection tip</p>
        <p>Note any sets that felt especially smooth or sticky before planning the next session.</p>
      </div>
    </header>
  `;
}

function renderSummary(entry) {
  const stats = [
    { label: 'Goal', value: entry.goal || 'Build confidence' },
    { label: 'Experience level', value: entry.experience || 'Beginner' },
    { label: 'Equipment', value: entry.equipment || 'Bodyweight' },
    { label: 'Duration', value: entry.durationMinutes ? `${entry.durationMinutes} min` : 'Not tracked' },
    { label: 'Exercises', value: `${(entry.exercises || []).length} moves` }
  ];
  return `
    <section class="landing-section">
      <p class="landing-subtext">Summary</p>
      <article class="landing-card">
        <div class="landing-grid landing-grid-two">
          ${stats.map(stat => `
            <div>
              <p class="landing-subtext">${escapeHTML(stat.label)}</p>
              <h3>${escapeHTML(stat.value)}</h3>
            </div>
          `).join('')}
        </div>
      </article>
    </section>
  `;
}

function renderNotesSection(notes) {
  const copy = typeof notes === 'string' && notes.trim()
    ? notes.trim()
    : 'No notes were saved for this workout. Try adding a quick cue next time for future you.';
  return `
    <section class="landing-section">
      <p class="landing-subtext">Notes</p>
      <article class="landing-card">
        <p>${escapeHTML(copy)}</p>
      </article>
    </section>
  `;
}

function renderExercises(exercises) {
  const list = Array.isArray(exercises) ? exercises : [];
  if (!list.length) {
    return `
      <section class="landing-section">
        <article class="landing-card">
          <p>No exercises were stored for this workout.</p>
        </article>
      </section>
    `;
  }
  const cards = list.map(exercise => `
    <article class="landing-card">
      <h3>${escapeHTML(exercise.name || 'Exercise')}</h3>
      <p class="landing-subtext">${escapeHTML(exercise.sets || '?')} × ${escapeHTML(exercise.reps || '?')} · ${escapeHTML(exercise.rest || 'Rest 40-60 sec')}</p>
      <p>${escapeHTML(exercise.instructions || 'Move slowly, breathe through the hardest part, and stop if form slips.')}</p>
    </article>
  `).join('');
  return `
    <section class="landing-section">
      <p class="landing-subtext">Exercises</p>
      <div class="landing-grid">
        ${cards}
      </div>
    </section>
  `;
}

function renderNavigation() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Next steps</p>
      <div class="landing-actions landing-actions-stack">
        <a class="landing-button" href="#/history">Back to History</a>
        <a class="landing-button secondary" href="#/generate">Generate Similar Workout</a>
      </div>
    </section>
  `;
}

function renderMissingEntry() {
  return `
    <section class="landing-section">
      <article class="landing-card">
        <p class="landing-subtext">No workout found</p>
        <p>We could not load that log. It may have been cleared from storage.</p>
        <div class="landing-actions landing-space-top-sm">
          <a class="landing-button" href="#/history">Back to History</a>
        </div>
      </article>
    </section>
  `;
}

export function renderHistoryDetails(id) {
  const entry = getHistory().find(item => String(item.id) === String(id));
  if (!entry) {
    const sections = `
      ${renderHeader('Unknown date')}
      ${renderMissingEntry()}
    `;
    return wrapLandingPage(sections);
  }
  const dateLabel = formatDateLabel(entry.date);
  const sections = `
    ${renderHeader(dateLabel)}
    ${renderSummary(entry)}
    ${renderNotesSection(entry.notes)}
    ${renderExercises(entry.exercises)}
    ${renderNavigation()}
  `;
  return wrapLandingPage(sections);
}
