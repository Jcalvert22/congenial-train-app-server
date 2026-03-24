import { escapeHTML, getExerciseDisplayName } from '../utils/helpers.js';
import { findSavedWorkout, removeSavedWorkout } from '../utils/savedWorkouts.js';
import { setState } from '../logic/state.js';
import { renderErrorStateCard, renderPageShell } from '../components/stateCards.js';
import { buildExerciseIconMarkup } from '../utils/iconHelpers.js';
import { machineIcons } from '../data/machineIcons.js';
import { attachCompactCardInteractions } from '../components/compactCard.js';

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

function formatDurationLabel(entry) {
  const explicitMinutes = Number(entry?.durationMinutes);
  if (Number.isFinite(explicitMinutes) && explicitMinutes > 0) {
    return `${explicitMinutes} min`;
  }
  const count = Array.isArray(entry?.exercises)
    ? entry.exercises.length
    : Array.isArray(entry?.planRows)
      ? entry.planRows.length
      : 0;
  if (!count) {
    return '~15 min';
  }
  const estimated = Math.max(10, Math.round(count * 6));
  return `~${estimated} min`;
}

function formatMuscleGroups(entry) {
  if (Array.isArray(entry?.selectedMuscleGroups) && entry.selectedMuscleGroups.length) {
    return entry.selectedMuscleGroups.join(', ');
  }
  const exercise = Array.isArray(entry?.exercises) ? entry.exercises.find(item => item?.muscle_group) : null;
  return exercise?.muscle_group || 'Full body mix';
}

function renderHeader(dateLabel, goalLabel) {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Saved workout</span>
        <h1>Workout Details</h1>
        <p class="landing-subtext lead">Saved on ${escapeHTML(dateLabel)} · Goal: ${escapeHTML(goalLabel)}</p>
      </div>
    </header>
  `;
}

function renderSummary(entry) {
  const equipment = Array.isArray(entry?.selectedEquipment) && entry.selectedEquipment.length
    ? entry.selectedEquipment.join(', ')
    : '';
  const muscleGroups = formatMuscleGroups(entry);
  const durationLabel = formatDurationLabel(entry);
  const stats = [
    { label: 'Duration', value: durationLabel },
    { label: 'Equipment', value: equipment },
    { label: 'Muscles', value: muscleGroups }
  ].filter(stat => stat.value);
  return `
    <section class="landing-section history-overview-section">
      <p class="landing-subtext">Overview</p>
      <article class="landing-card summary-overview-card history-overview-card">
        <div class="history-overview-grid">
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


function renderAnimationsGrid(entry) {
  const list = Array.isArray(entry?.exercises) ? entry.exercises : [];
  if (!list.length) {
    return '';
  }
  const tiles = list.map(exercise => {
    const name = getExerciseDisplayName(exercise) || 'Exercise';
    const muscle = exercise.muscle_group || 'Full body';
    const equipment = exercise.equipment || 'Bodyweight';
    const iconMarkup = buildExerciseIconMarkup(
      { exerciseName: name, muscle, equipment, machine: exercise.machine },
      machineIcons
    );
    return `
      <div class="workout-detail-anim-tile">
        <div class="workout-detail-anim-icon" aria-hidden="true">${iconMarkup}</div>
        <p class="workout-detail-anim-label">${escapeHTML(name)}</p>
      </div>
    `;
  }).join('');
  return `
    <section class="landing-section workout-detail-animations">
      <p class="landing-subtext">What you'll do</p>
      <div class="workout-detail-anim-grid">
        ${tiles}
      </div>
    </section>
  `;
}


function renderActions(entry) {
  const hasRows = Array.isArray(entry?.planRows) && entry.planRows.length > 0;
  return `
    <section class="landing-section history-detail-actions" data-workout-detail-root data-workout-id="${escapeHTML(entry.id)}">
      <article class="landing-card">
        <div class="landing-actions landing-actions-stack">
          ${hasRows ? `<button class="landing-button" type="button" data-action="start-saved-workout">Start Workout</button>` : ''}
          <a class="landing-button secondary" href="#/history">Back to History</a>
        </div>
        <div class="history-detail-links">
          <a class="supportive-link" href="#/generate">Generate a Fresh Workout</a>
          <button class="supportive-link danger" type="button" data-action="delete-saved-workout">Delete Saved Workout</button>
        </div>
      </article>
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
    ${renderAnimationsGrid(entry)}
    ${renderActions(entry)}
  `;
  return renderPageShell(sections, { isLoading });
}

export function attachWorkoutDetailEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  attachCompactCardInteractions(root);

  const startButton = root.querySelector('[data-action="start-saved-workout"]');
  if (startButton) {
    startButton.addEventListener('click', () => {
      const container = root.querySelector('[data-workout-detail-root]');
      const workoutId = container?.getAttribute('data-workout-id');
      const entry = workoutId ? findSavedWorkout(workoutId) : null;
      const planRows = Array.isArray(entry?.planRows) ? entry.planRows : [];
      if (!planRows.length) {
        window.location.hash = '#/generate';
        return;
      }
      setState(prev => {
        prev.ui = prev.ui || {};
        prev.ui.activeWorkout = entry;
        prev.ui.activeWorkoutIndex = 0;
        prev.ui.activeWorkoutCompleted = false;
        prev.ui.activeWorkoutStartedAt = Date.now();
        prev.ui.pendingWorkoutSave = null;
        prev.ui.activeWorkoutIntroComplete = false;
        prev.ui.activeWorkoutSavedEntry = null;
        prev.ui.activeWorkoutFeedback = {};
        return prev;
      });
      window.location.hash = '#/workout';
    });
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
