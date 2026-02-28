import { escapeHTML } from '../utils/helpers.js';
import { setState } from '../logic/state.js';
import { getAuth } from '../auth/state.js';
import {
  renderEmptyStateCard,
  wrapWithPageLoading,
  revealPageContent
} from '../components/stateCards.js';

const MUSCLE_ICONS = {
  Chest: '🧡',
  Back: '💙',
  Legs: '💚',
  Shoulders: '💛',
  Arms: '💪',
  Abs: '🌀'
};

function getFirstName(state) {
  const auth = getAuth();
  const fallback = state.profile?.name || 'Friend';
  const displayName = auth.user?.name?.trim() || fallback;
  return displayName.split(' ')[0];
}

function estimateDuration(rows) {
  if (!rows.length) {
    return 0;
  }
  return Math.round(8 + rows.length * 6.5);
}

function collectEquipmentSummary(rows, profile) {
  const tags = new Set();
  rows.forEach(row => {
    (row?.equipment || '')
      .split(',')
      .map(piece => piece.trim())
      .filter(Boolean)
      .forEach(piece => tags.add(piece));
  });
  if (!tags.size) {
    const profileEquipment = (profile?.equipment || '').trim();
    return profileEquipment || 'Bodyweight only';
  }
  return Array.from(tags).join(', ');
}

function getExerciseIcon(muscle) {
  return MUSCLE_ICONS[muscle] || '🏋️';
}

function formatRestTime(row) {
  if (row?.rest) {
    return row.rest;
  }
  return row?.usesWeight ? 'Rest 75-90 sec' : 'Rest 40-60 sec';
}

function renderHeader(firstName, hasPlan, goalText) {
  const subtext = hasPlan
    ? `We personalized this calm session around your ${goalText} goal, ${firstName}.`
    : `We couldn\u2019t find your latest plan. Generate one to get a personalized breakdown, ${firstName}.`;
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Workout summary</span>
        <h1>Your Workout Is Ready</h1>
        <p class="landing-subtext lead">${escapeHTML(subtext)}</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Need a tweak?</p>
        <p>Adjust equipment or focus from the Generate page whenever you like.</p>
      </div>
    </header>
  `;
}

function renderSummarySection(state, rows, summary) {
  const profile = state.profile || {};
  const totalExercises = rows.length;
  const duration = estimateDuration(rows);
  const equipmentSummary = collectEquipmentSummary(rows, profile);
  const focusAreas = Array.isArray(summary?.focus) && summary.focus.length
    ? summary.focus.filter(Boolean).slice(0, 2).join(', ')
    : 'Full body';

  const stats = [
    { label: 'Goal', value: profile.goal || 'Build confidence' },
    { label: 'Experience level', value: profile.experience || 'Beginner mode' },
    { label: 'Equipment', value: equipmentSummary },
    { label: 'Exercises', value: `${totalExercises} moves` },
    { label: 'Estimated time', value: duration ? `~${duration} min` : '10-15 min' },
    { label: 'Focus', value: focusAreas }
  ];

  return `
    <section class="landing-section">
      <p class="landing-subtext">Summary</p>
      <article class="landing-card">
        <div class="landing-grid landing-grid-two">
          ${stats
            .map(stat => `
              <div>
                <p class="landing-subtext">${escapeHTML(stat.label)}</p>
                <h3>${escapeHTML(stat.value)}</h3>
              </div>
            `)
            .join('')}
        </div>
      </article>
    </section>
  `;
}

function renderExercisesSection(rows) {
  const cards = rows.map((row, index) => {
    const exerciseName = row?.exercise || `Movement ${index + 1}`;
    const instructions = row?.description || 'Move slowly, breathe through the hardest part, and stop if form slips.';
    const restLabel = formatRestTime(row);
    const sets = row?.sets || '3 sets';
    const reps = row?.repRange || '8-12 reps';
    const muscle = row?.muscle || 'Full body';
    const equipment = row?.equipment || 'Bodyweight';
    return `
      <article class="landing-card">
        <div class="landing-card-image" aria-hidden="true">${getExerciseIcon(muscle)}</div>
        <h3>${escapeHTML(exerciseName)}</h3>
        <p class="landing-subtext">${escapeHTML(sets)} × ${escapeHTML(reps)} · ${escapeHTML(restLabel)}</p>
        <p>${escapeHTML(instructions)}</p>
        <div class="landing-pill-list">
          <span class="landing-pill">${escapeHTML(muscle)}</span>
          <span class="landing-pill">${escapeHTML(equipment)}</span>
        </div>
      </article>
    `;
  });

  return `
    <section class="landing-section">
      <p class="landing-subtext">Exercises</p>
      <div class="landing-grid">
        ${cards.join('')}
      </div>
    </section>
  `;
}

function renderCtaSection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Ready to move?</p>
      <div class="landing-actions">
        <button class="landing-button" type="button" data-action="start-workout">Start Workout</button>
        <a class="landing-button secondary" href="#/generate">Generate Another Workout</a>
      </div>
    </section>
  `;
}

function renderEmptyState(reason) {
  const message = reason === 'invalid'
    ? 'We found a workout but it looks incomplete. Let\u2019s rebuild one that feels solid.'
    : 'Looks like the summary was cleared (maybe after a refresh). Let\u2019s build a new one in a few taps.';
  return renderEmptyStateCard({
    title: 'No workout found',
    message,
    actionLabel: 'Generate Workout',
    actionHref: '#/generate'
  });
}

export function renderWorkoutSummaryPage(state) {
  const plan = state.ui?.plannerResult;
  const rows = Array.isArray(plan?.planRows) ? plan.planRows.filter(Boolean) : [];
  const summary = plan && typeof plan.summary === 'object' ? plan.summary : {};
  const hasPlan = rows.length > 0;
  const firstName = getFirstName(state);
  const goalText = state.profile?.goal || 'consistency';
  const reason = plan ? 'invalid' : 'missing';

  if (!hasPlan) {
    const sections = `
      ${renderHeader(firstName, false, goalText)}
      ${renderEmptyState(reason)}
    `;
    return wrapWithPageLoading(sections, 'Loading summary...');
  }

  const sections = `
    ${renderHeader(firstName, true, goalText)}
    ${renderSummarySection(state, rows, summary)}
    ${renderExercisesSection(rows)}
    ${renderCtaSection()}
  `;

  return wrapWithPageLoading(sections, 'Loading summary...');
}

export function attachWorkoutSummaryEvents(root, state) {
  revealPageContent(root);
  const startButton = root.querySelector('[data-action="start-workout"]');
  if (startButton) {
    startButton.addEventListener('click', () => {
      const plan = state.ui?.plannerResult;
      if (!plan || !Array.isArray(plan.planRows) || !plan.planRows.length) {
        window.location.hash = '#/generate';
        return;
      }
      setState(prev => {
        prev.ui = prev.ui || {};
        prev.ui.activeWorkout = plan;
        prev.ui.activeWorkoutIndex = 0;
        prev.ui.activeWorkoutCompleted = false;
        prev.ui.activeWorkoutStartedAt = Date.now();
        prev.ui.pendingWorkoutSave = null;
        prev.ui.activeWorkoutIntroComplete = false;
        return prev;
      });
      window.location.hash = '#/workout';
    });
  }
}
