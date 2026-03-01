import { escapeHTML } from '../utils/helpers.js';
import { findSavedWorkout, removeSavedWorkout } from '../utils/savedWorkouts.js';
import { renderErrorStateCard, renderPageShell } from '../components/stateCards.js';

const GOAL_LABELS = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  endurance: 'Endurance',
  weight_loss: 'Weight Loss',
  general: 'General Fitness'
};

function formatGoal(goal) {
  if (!goal) {
    return 'General Fitness';
  }
  const normalized = goal.toString().trim().toLowerCase();
  return GOAL_LABELS[normalized] || goal;
}

function formatDateLabel(dateValue) {
  if (!dateValue) {
    return 'Unknown date';
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function renderHeader(dateLabel, goalLabel) {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Saved workout</span>
        <h1>Workout Details</h1>
        <p class="landing-subtext lead">Saved on ${escapeHTML(dateLabel)} · Goal: ${escapeHTML(goalLabel)}</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Reminder</p>
        <p>Use saved workouts on days you want zero planning—just tap start and move.</p>
      </div>
    </header>
  `;
}

function renderSummary(entry) {
  const equipment = Array.isArray(entry?.selectedEquipment) && entry.selectedEquipment.length
    ? entry.selectedEquipment.join(', ')
    : 'Bodyweight only';
  const stats = [
    { label: 'Goal', value: formatGoal(entry?.selectedGoal) },
    { label: 'Equipment', value: equipment },
    { label: 'Gymxiety Mode', value: entry?.gymxietyMode ? 'On' : 'Off' },
    { label: 'Exercises', value: `${Array.isArray(entry?.exercises) ? entry.exercises.length : 0} moves` }
  ];
  return `
    <section class="landing-section">
      <p class="landing-subtext">Overview</p>
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

function renderExerciseCard(exercise) {
  if (!exercise) {
    return '';
  }
  const name = exercise.name || 'Exercise';
  const sets = exercise.sets || '3 sets';
  const reps = exercise.reps || '';
  const time = exercise.time || '';
  const rest = exercise.rest || 'Rest 45-60 sec';
  const confidence = exercise.confidence || 'Moderate';
  const etiquette = exercise.etiquette_tip || '';
  const prescriptionLabel = time ? `Time: ${time}` : `Reps: ${reps || '—'}`;
  return `
    <article class="landing-card">
      <h3>${escapeHTML(name)}</h3>
      <p class="landing-subtext">${escapeHTML(sets)} · ${escapeHTML(prescriptionLabel)} · ${escapeHTML(rest)}</p>
      <div class="landing-pill-list landing-space-top-xs">
        <span class="landing-pill">${escapeHTML(exercise.muscle_group || 'Full body')}</span>
        <span class="landing-pill">${escapeHTML(exercise.equipment || 'Bodyweight')}</span>
        <span class="landing-pill">Confidence: ${escapeHTML(confidence)}</span>
      </div>
      ${etiquette ? `<p class="supportive-text landing-space-top-xs">${escapeHTML(etiquette)}</p>` : ''}
    </article>
  `;
}

function renderExercisesSection(entry) {
  const list = Array.isArray(entry?.exercises) ? entry.exercises : [];
  if (!list.length) {
    return `
      <section class="landing-section">
        <article class="landing-card">
          <p>No exercises were stored with this workout.</p>
        </article>
      </section>
    `;
  }
  return `
    <section class="landing-section">
      <p class="landing-subtext">Exercises</p>
      <div class="landing-grid">
        ${list.map(renderExerciseCard).join('')}
      </div>
    </section>
  `;
}

function renderActions(entry) {
  return `
    <section class="landing-section" data-workout-detail-root data-workout-id="${escapeHTML(entry.id)}">
      <div class="landing-actions landing-actions-stack">
        <a class="landing-button" href="#/history">Back to History</a>
        <a class="landing-button secondary" href="#/generate">Generate a Fresh Workout</a>
        <button class="landing-button secondary" type="button" data-action="delete-saved-workout">Delete Saved Workout</button>
      </div>
    </section>
  `;
}

export function renderWorkoutDetailPage(id) {
  let isLoading = true;
  const entry = findSavedWorkout(id);
  isLoading = false;
  if (!entry) {
    const sections = `
      ${renderErrorStateCard({
        title: 'Saved workout not found',
        message: 'It may have been deleted or never saved. Head back to history to choose another plan.',
        actionLabel: 'Back to History',
        actionHref: '#/history'
      })}
    `;
    return renderPageShell(sections, { isLoading });
  }
  const dateLabel = formatDateLabel(entry.date);
  const goalLabel = formatGoal(entry.selectedGoal);
  const sections = `
    ${renderHeader(dateLabel, goalLabel)}
    ${renderSummary(entry)}
    ${renderExercisesSection(entry)}
    ${renderActions(entry)}
  `;
  return renderPageShell(sections, { isLoading });
}

export function attachWorkoutDetailEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  const deleteButton = root.querySelector('[data-action="delete-saved-workout"]');
  if (!deleteButton) {
    return;
  }
  deleteButton.addEventListener('click', () => {
    const container = root.querySelector('[data-workout-detail-root]');
    const workoutId = container?.getAttribute('data-workout-id');
    if (!workoutId) {
      return;
    }
    const confirmed = window.confirm('Delete this saved workout?');
    if (!confirmed) {
      return;
    }
    removeSavedWorkout(workoutId);
    window.location.hash = '#/history';
  });
}
