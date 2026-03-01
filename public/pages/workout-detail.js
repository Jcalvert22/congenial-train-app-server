import { escapeHTML } from '../utils/helpers.js';
import { findSavedWorkout, removeSavedWorkout } from '../utils/savedWorkouts.js';
import { renderErrorStateCard, renderPageShell } from '../components/stateCards.js';
import { buildExerciseIconMarkup } from '../utils/iconHelpers.js';
import { machineIcons } from '../data/machineIcons.js';

const GOAL_LABELS = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  endurance: 'Endurance',
  weight_loss: 'Weight Loss',
  general: 'General Fitness'
};

const DEFAULT_SET_LABEL = '3 sets';
const DEFAULT_REST_LABEL = 'Rest 60 sec';

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
    <section class="landing-section history-detail-header">
      <span class="landing-tag">Saved workout</span>
      <h1>Workout Details</h1>
      <p class="landing-subtext lead">Saved on ${escapeHTML(dateLabel)} · Goal: ${escapeHTML(goalLabel)}</p>
    </section>
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

function renderExerciseCard(exercise) {
  if (!exercise) {
    return '';
  }
  const name = exercise.name || 'Exercise';
  const sets = exercise.sets || DEFAULT_SET_LABEL;
  const reps = exercise.reps || '';
  const rest = exercise.rest || DEFAULT_REST_LABEL;
  const confidence = exercise.confidence || '';
  const muscle = exercise.muscle_group || 'Full body';
  const equipment = exercise.equipment || 'Bodyweight';
  const iconMarkup = buildExerciseIconMarkup(
    { exerciseName: name, muscle, equipment },
    machineIcons
  );
  const prescription = reps ? `${sets} · ${reps}` : sets;
  return `
    <article class="landing-card history-exercise-card">
      <div class="history-exercise-icon exercise-icon-wrapper" aria-hidden="true">${iconMarkup}</div>
      <div class="history-exercise-text">
        <h3>${escapeHTML(name)}</h3>
        <p class="landing-subtext">${escapeHTML(prescription)} · ${escapeHTML(rest)}</p>
        <div class="history-exercise-meta">
          <span>${escapeHTML(muscle)}</span>
          <span>${escapeHTML(equipment)}</span>
          ${confidence ? `<span>Confidence: ${escapeHTML(confidence)}</span>` : ''}
        </div>
        ${exercise.etiquette_tip ? `<p class="supportive-text history-exercise-etiquette">${escapeHTML(exercise.etiquette_tip)}</p>` : ''}
      </div>
    </article>
  `;
}

function renderExercisesSection(entry) {
  const list = Array.isArray(entry?.exercises) ? entry.exercises : [];
  if (!list.length) {
    return `
      <section class="landing-section history-exercises">
        <article class="landing-card history-exercise-card empty">
          <p class="supportive-text">No exercises were saved with this workout.</p>
        </article>
      </section>
    `;
  }
  return `
    <section class="landing-section history-exercises">
      <p class="landing-subtext">Exercises</p>
      <div class="history-exercise-list">
        ${list.map(renderExerciseCard).join('')}
      </div>
    </section>
  `;
}

function renderActions(entry) {
  return `
    <section class="landing-section history-detail-actions" data-workout-detail-root data-workout-id="${escapeHTML(entry.id)}">
      <a class="landing-button history-back-button" href="#/history">Back to History</a>
      <div class="history-detail-links">
        <a class="supportive-link" href="#/generate">Generate a Fresh Workout</a>
        <button class="supportive-link danger" type="button" data-action="delete-saved-workout">Delete Saved Workout</button>
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
