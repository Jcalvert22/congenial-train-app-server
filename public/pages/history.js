import { escapeHTML } from '../utils/helpers.js';
import { getSavedWorkouts } from '../utils/savedWorkouts.js';
import { renderEmptyStateCard, renderPageShell } from '../components/stateCards.js';

const GOAL_LABELS = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  endurance: 'Endurance',
  weight_loss: 'Weight Loss',
  general: 'General Fitness'
};

function formatGoal(value) {
  if (!value) {
    return 'General Fitness';
  }
  const normalized = value.toString().trim().toLowerCase();
  return GOAL_LABELS[normalized] || value;
}

function formatDateLabel(dateValue) {
  if (!dateValue) {
    return 'Recently saved';
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently saved';
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function summarizeEquipment(entry) {
  const list = Array.isArray(entry?.selectedEquipment) ? entry.selectedEquipment.filter(Boolean) : [];
  if (!list.length) {
    return 'Bodyweight only';
  }
  return list.join(', ');
}

function renderHeader() {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Saved workouts</span>
        <h1>Workout Library</h1>
        <p class="landing-subtext lead">Every time you tap \"Save Workout\", it will live here for future sessions.</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Tip</p>
        <p>Save a calm plan after generating it so you can re-run it on a busy day.</p>
      </div>
    </header>
  `;
}

function renderEmptyState() {
  return renderEmptyStateCard({
    title: 'No saved workouts yet',
    message: 'Tap “Save Workout” from your summary to keep a plan for later.',
    actionLabel: 'Generate a Workout',
    actionHref: '#/generate'
  });
}

function renderHistoryCard(entry) {
  const dateLabel = formatDateLabel(entry?.date);
  const goalLabel = formatGoal(entry?.selectedGoal);
  const equipmentLabel = summarizeEquipment(entry);
  const exerciseCount = Array.isArray(entry?.exercises) ? entry.exercises.length : 0;
  const detailHash = entry?.id ? `#/history/${encodeURIComponent(entry.id)}` : '#/history';
  return `
    <article class="landing-card history-card card-pop-in" data-history-card data-history-id="${escapeHTML(entry?.id || '')}" tabindex="0" role="link">
      <p class="landing-subtext">${escapeHTML(dateLabel)}</p>
      <h2 class="landing-card-title">${escapeHTML(goalLabel)}</h2>
      <div class="history-card-meta">
        <span><strong>Goal</strong> ${escapeHTML(goalLabel)}</span>
        <span><strong>Equipment</strong> ${escapeHTML(equipmentLabel)}</span>
        <span><strong>Exercises</strong> ${escapeHTML(`${exerciseCount} moves`)}</span>
      </div>
      <div class="landing-actions landing-actions-stack landing-space-top-sm">
        <a class="landing-button secondary" href="${detailHash}">View Details</a>
      </div>
    </article>
  `;
}

function renderHistoryList(entries) {
  const cards = entries.map(renderHistoryCard).join('');
  return `
    <section class="landing-section">
      <p class="landing-subtext">Saved plans</p>
      <div class="history-list" data-history-list>
        ${cards}
      </div>
    </section>
  `;
}

export function renderHistoryPage() {
  let isLoading = true;
  const saved = getSavedWorkouts();
  isLoading = false;
  const entries = Array.isArray(saved)
    ? saved.slice().sort((a, b) => {
        const aTime = new Date(a?.date || 0).getTime();
        const bTime = new Date(b?.date || 0).getTime();
        return bTime - aTime;
      })
    : [];
  const sections = `
    ${renderHeader()}
    ${entries.length ? renderHistoryList(entries) : renderEmptyState()}
  `;
  return renderPageShell(sections, { isLoading });
}

export function attachHistoryPageEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  const cards = root.querySelectorAll('[data-history-card]');
  cards.forEach((card, index) => {
    requestAnimationFrame(() => {
      window.setTimeout(() => card.classList.add('visible'), 60 * index);
    });
  });

  const navigateToDetail = id => {
    if (!id) {
      return;
    }
    window.location.hash = `#/history/${encodeURIComponent(id)}`;
  };

  root.addEventListener('click', event => {
    const card = event.target.closest('[data-history-card]');
    if (!card || event.target.closest('a')) {
      return;
    }
    const id = card.getAttribute('data-history-id');
    navigateToDetail(id);
  });

  root.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    const card = event.target.closest('[data-history-card]');
    if (!card) {
      return;
    }
    event.preventDefault();
    const id = card.getAttribute('data-history-id');
    navigateToDetail(id);
  });
}
