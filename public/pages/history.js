import { escapeHTML } from '../utils/helpers.js';
import { getHistory } from '../data/history.js';
import {
  renderEmptyStateCard,
  renderErrorStateCard,
  wrapWithPageLoading,
  revealPageContent
} from '../components/stateCards.js';

export function formatDate(isoString) {
  if (!isoString) {
    return 'Recently';
  }
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently';
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDuration(minutes) {
  if (!Number.isFinite(Number(minutes)) || Number(minutes) <= 0) {
    return 'Duration not tracked';
  }
  return `${Number(minutes)} minutes`;
}

function formatNotesPreview(notes) {
  if (typeof notes !== 'string') {
    return '';
  }
  const trimmed = notes.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.length <= 80) {
    return trimmed;
  }
  return `${trimmed.slice(0, 77)}...`;
}

function renderHeader() {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">History</span>
        <h1>Workout History</h1>
        <p class="landing-subtext lead">Review your past workouts and track your progress.</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Consistency tip</p>
        <p>Short reflections help future you remember which cues kept things calm.</p>
      </div>
    </header>
  `;
}

function renderEmptyState() {
  return renderEmptyStateCard({
    title: 'No Workouts Yet',
    message: 'Your completed workouts will appear here once you log them.',
    actionLabel: 'Generate a Workout',
    actionHref: '#/generate'
  });
}

function renderHistoryCard(entry) {
  const dateLabel = formatDate(entry?.date);
  const goalLabel = entry?.goal || 'General fitness';
  const durationLabel = formatDuration(entry?.durationMinutes);
  const exerciseCount = Array.isArray(entry?.exercises) ? entry.exercises.length : 0;
  const notesPreview = formatNotesPreview(entry?.notes);
  const detailHref = entry?.id ? `#/history/${encodeURIComponent(entry.id)}` : '#/history';
  const notesMarkup = notesPreview
    ? `<p class="history-notes-preview">${escapeHTML(notesPreview)}</p>`
    : '';
  return `
    <article class="landing-card history-card card-pop-in" data-history-card>
      <p class="landing-subtext">${escapeHTML(dateLabel)}</p>
      <h2 class="landing-card-title">${escapeHTML(goalLabel)}</h2>
      <div class="history-card-meta">
        <span><strong>Goal</strong> ${escapeHTML(goalLabel)}</span>
        <span><strong>Duration</strong> ${escapeHTML(durationLabel)}</span>
        <span><strong>Exercises</strong> ${escapeHTML(`${exerciseCount || 0} moves`)}</span>
      </div>
      ${notesMarkup}
      <div class="landing-actions landing-actions-stack landing-space-top-sm">
        <a class="landing-button secondary" href="${detailHref}">View Details</a>
      </div>
    </article>
  `;
}

function renderHistoryList(entries) {
  const cards = entries.map(renderHistoryCard).join('');
  return `
    <section class="landing-section">
      <p class="landing-subtext">Recent workouts</p>
      <div class="history-list" data-history-list>
        ${cards}
      </div>
    </section>
  `;
}

export function renderHistoryPage() {
  const history = getHistory();
  if (!Array.isArray(history)) {
    const sections = `
      ${renderHeader()}
      ${renderErrorStateCard({
        title: 'History is unavailable',
        message: 'We could not read your saved workouts. Try refreshing or generating a new session.',
        actionLabel: 'Back to Dashboard',
        actionHref: '#/dashboard'
      })}
    `;
    return wrapWithPageLoading(sections, 'Loading history...');
  }
  const entries = history.slice().reverse();
  const sections = `
    ${renderHeader()}
    ${entries.length ? renderHistoryList(entries) : renderEmptyState()}
  `;
  return wrapWithPageLoading(sections, 'Loading history...');
}

export function attachHistoryPageEvents(root) {
  revealPageContent(root);
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  const cards = root.querySelectorAll('[data-history-card]');
  cards.forEach((card, index) => {
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add('visible'), 60 * index);
    });
  });
}
