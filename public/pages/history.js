import { escapeHTML } from '../utils/helpers.js';
import { getSavedWorkouts } from '../utils/savedWorkouts.js';
import { renderPageShell } from '../components/stateCards.js';
import { buildExerciseIconMarkup } from '../utils/iconHelpers.js';
import { machineIcons } from '../data/machineIcons.js';

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

function formatMuscleGroup(entry) {
  if (Array.isArray(entry?.selectedMuscleGroups) && entry.selectedMuscleGroups.length) {
    return entry.selectedMuscleGroups[0];
  }
  const exercise = Array.isArray(entry?.exercises) ? entry.exercises.find(item => item?.muscle_group) : null;
  return exercise?.muscle_group || 'Full body';
}

function resolvePrimaryEquipment(entry) {
  if (Array.isArray(entry?.selectedEquipment) && entry.selectedEquipment.length) {
    return entry.selectedEquipment[0];
  }
  const exercise = Array.isArray(entry?.exercises)
    ? entry.exercises.find(item => item?.equipment)
    : null;
  if (exercise?.equipment) {
    return exercise.equipment.split(',')[0].trim();
  }
  if (Array.isArray(entry?.planRows) && entry.planRows.length && entry.planRows[0]?.equipment) {
    return entry.planRows[0].equipment;
  }
  return '';
}

function formatDurationLabel(entry) {
  const explicitMinutes = Number(entry?.durationMinutes);
  if (Number.isFinite(explicitMinutes) && explicitMinutes > 0) {
    return `${explicitMinutes} min`;
  }
  const exerciseCount = Array.isArray(entry?.exercises)
    ? entry.exercises.length
    : Array.isArray(entry?.planRows)
      ? entry.planRows.length
      : 0;
  if (!exerciseCount) {
    return '~15 min';
  }
  const estimated = Math.max(10, Math.round(exerciseCount * 6));
  return `~${estimated} min`;
}

function formatExerciseCount(entry) {
  const count = Array.isArray(entry?.exercises) ? entry.exercises.length : 0;
  return count ? `${count} exercises` : 'No exercises saved';
}

function renderHeader(savedCount) {
  const description = savedCount
    ? 'Browse every plan you saved for low-planning days.'
    : 'When you save a workout, it appears here for future sessions.';
  return `
    <section class="landing-section history-header">
      <div class="history-header-top" style="display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:flex-start;">
        <div class="history-header-copy" style="flex:1 1 260px;min-width:240px;">
          <span class="landing-tag">Workout history</span>
          <h1>Workout Library</h1>
          <p class="landing-subtext lead">${escapeHTML(description)}</p>
        </div>
        <a class="landing-button secondary" style="flex:0 0 auto;min-width:220px;text-align:center;" href="#/library">Open Exercise Library</a>
      </div>
    </section>
  `;
}

function renderEmptyState() {
  return `
    <section class="landing-section history-empty">
      <h2>No workouts saved yet</h2>
      <p class="supportive-text">Tap “Save Workout” on your summary screen to keep a calm plan for later.</p>
      <a class="landing-button" href="#/generate">Generate a Workout</a>
    </section>
  `;
}

function renderHistoryCard(entry) {
  const dateLabel = formatDateLabel(entry?.date);
  const goalLabel = formatGoal(entry?.selectedGoal);
  const equipmentLabel = summarizeEquipment(entry);
  const durationLabel = formatDurationLabel(entry);
  const exercisesLabel = formatExerciseCount(entry);
  const muscleLabel = formatMuscleGroup(entry);
  const primaryExercise = Array.isArray(entry?.exercises) && entry.exercises.length
    ? entry.exercises[0].name
    : entry?.planRows?.[0]?.exercise || goalLabel;
  const iconMarkup = buildExerciseIconMarkup(
    {
      exerciseName: primaryExercise,
      muscle: muscleLabel,
      equipment: resolvePrimaryEquipment(entry)
    },
    machineIcons
  );
  const detailHash = entry?.id ? `#/history/${encodeURIComponent(entry.id)}` : '#/history';
  return `
    <a class="landing-card history-card card-pop-in" data-history-card data-history-id="${escapeHTML(entry?.id || '')}" href="${detailHash}">
      <div class="history-card-layout">
        <div class="history-card-icon exercise-icon-wrapper" aria-hidden="true">${iconMarkup}</div>
        <div class="history-card-text">
          <p class="history-card-date">${escapeHTML(dateLabel)}</p>
          <h3>${escapeHTML(goalLabel)}</h3>
          <p class="history-card-subtext">${escapeHTML(durationLabel)} · ${escapeHTML(exercisesLabel)}</p>
          <p class="history-card-meta-line">${escapeHTML(equipmentLabel)}</p>
        </div>
        <span class="history-card-chip">${escapeHTML(muscleLabel)}</span>
      </div>
      <div class="history-card-footer" aria-hidden="true">
        <span>View details</span>
        <span class="history-card-arrow">→</span>
      </div>
    </a>
  `;
}

function renderHistoryList(entries) {
  const cards = entries.map(renderHistoryCard).join('');
  return `
    <section class="landing-section history-list-section">
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
    ${renderHeader(entries.length)}
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
