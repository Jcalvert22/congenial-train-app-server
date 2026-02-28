import { escapeHTML, clamp } from '../utils/helpers.js';
import { getState, setState } from '../logic/state.js';
import { recordWorkoutCompletion } from '../logic/workout.js';
import { getAuth } from '../auth/state.js';
import { addWorkoutToHistory } from '../data/history.js';
import {
  renderEmptyStateCard,
  renderErrorStateCard,
  wrapWithPageLoading,
  revealPageContent
} from '../components/stateCards.js';

const READY_DELAY_MS = 1000;
const CARD_TRANSITION_MS = 220;

function getFirstName(state) {
  const auth = getAuth();
  const fallback = state.profile?.name || 'Friend';
  const displayName = auth.user?.name?.trim() || fallback;
  return displayName.split(' ')[0];
}

function getActiveWorkout(state) {
  return state.ui?.activeWorkout || state.ui?.plannerResult || null;
}

function formatRest(exercise) {
  if (exercise.rest) {
    return exercise.rest;
  }
  return exercise.usesWeight ? 'Rest 75-90 sec' : 'Rest 40-60 sec';
}

function renderHeader(status, firstName) {
  let title = 'Workout in Progress';
  let subtext = 'Follow each step at your own pace.';
  if (status === 'empty') {
    title = 'No Workout in Progress';
    subtext = `Let's start a new one, ${firstName}.`;
  } else if (status === 'ready') {
    title = 'Get Ready';
    subtext = 'Your workout is about to begin.';
  } else if (status === 'complete') {
    title = 'Workout Complete!';
    subtext = 'Great job - you finished your routine.';
  }
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Guided session</span>
        <h1>${escapeHTML(title)}</h1>
        <p class="landing-subtext lead">${escapeHTML(subtext)}</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Micro-reminder</p>
        <p>Pause between sets, sip water, and reset your breathing before the next move.</p>
      </div>
    </header>
  `;
}

function renderNoWorkoutSection() {
  return renderEmptyStateCard({
    title: 'No Workout in Progress',
    message: 'We could not find an active routine. Generate a new calm session to begin.',
    actionLabel: 'Generate a Workout',
    actionHref: '#/generate'
  });
}

function renderReadySection() {
  return `
    <section class="landing-section">
      <article class="landing-card landing-transition-card execution-ready-card card-pop-in" data-ready-card>
        <h1>Get Ready</h1>
        <p class="landing-subtext">Your workout is about to begin.</p>
      </article>
    </section>
  `;
}

function renderExerciseCard(exercise, index, total) {
  const instructions = exercise.description || 'Move slowly, keep breathing steady, and stop if form slips.';
  const rest = formatRest(exercise);
  const progressPercent = Math.round(((index + 1) / total) * 100);
  return `
    <section class="landing-section">
      <article class="landing-card exercise-card" data-exercise-card>
        <p class="execution-progress">Exercise ${index + 1} of ${total}</p>
        <div class="execution-progress-bar"><span style="width: ${progressPercent}%"></span></div>
        <h2 class="landing-card-title">${escapeHTML(exercise.exercise || 'Next movement')}</h2>
        <div class="execution-meta">
          <strong>${escapeHTML(exercise.sets || '3 sets')} × ${escapeHTML(exercise.repRange || '8 reps')}</strong>
          <span>${escapeHTML(rest)}</span>
        </div>
        <p>${escapeHTML(instructions)}</p>
        <div class="landing-pill-list">
          <span class="landing-pill">${escapeHTML(exercise.muscle || 'Full body')}</span>
          <span class="landing-pill">${escapeHTML(exercise.equipment || 'Bodyweight')}</span>
        </div>
      </article>
    </section>
  `;
}

function renderNavigationSection(index, total) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const nextLabel = isLast ? 'Finish Workout' : 'Next Exercise';
  const nextState = isLast ? 'finish' : 'next';
  return `
    <section class="landing-section">
      <article class="landing-card execution-nav">
        <p class="landing-subtext">Stay calm between sets.</p>
        <div class="landing-actions landing-actions-stack">
          <button class="landing-button secondary" type="button" data-action="prev-exercise" ${isFirst ? 'disabled' : ''}>Previous Exercise</button>
          <button class="landing-button" type="button" data-action="next-exercise" data-state="${nextState}">${nextLabel}</button>
        </div>
      </article>
    </section>
  `;
}

function renderCompletionSection(entry) {
  const exerciseCount = entry?.exercises?.length || 0;
  const goalLabel = entry?.goal || 'General fitness';
  const durationLabel = entry?.durationMinutes
    ? `${entry.durationMinutes} min`
    : 'Not recorded';
  return `
    <section class="landing-section">
      <article class="landing-card execution-complete">
        <h1>Workout Complete!</h1>
        <p class="landing-subtext">Great job - you finished your routine.</p>
        <div class="execution-summary landing-space-top-md">
          <div class="execution-summary-item">
            <p class="landing-subtext">Duration</p>
            <h3>${escapeHTML(durationLabel)}</h3>
          </div>
          <div class="execution-summary-item">
            <p class="landing-subtext">Exercises</p>
            <h3>${escapeHTML(String(exerciseCount))}</h3>
          </div>
          <div class="execution-summary-item">
            <p class="landing-subtext">Goal</p>
            <h3>${escapeHTML(goalLabel)}</h3>
          </div>
        </div>
        <div class="landing-actions landing-actions-stack execution-complete-actions landing-space-top-md">
          <a class="landing-button" href="#/dashboard">Back to Dashboard</a>
          <a class="landing-button secondary" href="#/history">View Workout History</a>
          <a class="landing-button secondary" href="#/generate">Generate Another Workout</a>
        </div>
      </article>
    </section>
  `;
}

function estimateFallbackDuration(planRows = []) {
  if (!Array.isArray(planRows) || !planRows.length) {
    return 10;
  }
  return Math.max(8, Math.round(planRows.length * 6));
}

function calculateDurationMinutes(startedAt, finishTimestamp, planRows) {
  const finish = typeof finishTimestamp === 'number' ? finishTimestamp : Date.now();
  if (typeof startedAt === 'number' && Number.isFinite(startedAt) && finish > startedAt) {
    const diffMinutes = Math.round((finish - startedAt) / 60000);
    if (diffMinutes >= 1) {
      return diffMinutes;
    }
  }
  return estimateFallbackDuration(planRows);
}

function buildHistoryEntryPayload(state, options = {}) {
  const workout = state.ui?.activeWorkout;
  if (!workout || !Array.isArray(workout.planRows) || !workout.planRows.length) {
    return null;
  }
  const profile = state.profile || {};
  const finishTimestamp = typeof options.finishTimestamp === 'number'
    ? options.finishTimestamp
    : Date.now();
  const exercises = workout.planRows.map(row => ({
    name: row.exercise,
    sets: row.sets,
    reps: row.repRange,
    rest: formatRest(row),
    instructions: row.description || 'Move smoothly and keep breathing steady.'
  }));
  const uniqueId = `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const durationMinutes = calculateDurationMinutes(
    state.ui?.activeWorkoutStartedAt,
    finishTimestamp,
    workout.planRows
  );
  return {
    id: uniqueId,
    date: new Date(finishTimestamp).toISOString(),
    goal: profile.goal || 'Build steady strength and confidence',
    experience: profile.experience || 'Beginner',
    equipment: profile.equipment || 'Bodyweight focus',
    durationMinutes,
    notes: '',
    exercises
  };
}

export function renderWorkoutExecution(state) {
  const workout = getActiveWorkout(state);
  const exercises = Array.isArray(workout?.planRows) ? workout.planRows : [];
  const total = exercises.length;
  const firstName = getFirstName(state);

  if (workout && !Array.isArray(workout.planRows)) {
    const sections = `
      ${renderHeader('empty', firstName)}
      ${renderErrorStateCard({
        title: 'Workout looks corrupted',
        message: 'We had trouble reading that routine. Please generate a new workout to continue.',
        actionLabel: 'Generate Workout',
        actionHref: '#/generate'
      })}
    `;
    return wrapWithPageLoading(sections, 'Loading workout...');
  }

  if (!total) {
    const sections = `
      ${renderHeader('empty', firstName)}
      ${renderNoWorkoutSection()}
    `;
    return wrapWithPageLoading(sections, 'Loading workout...');
  }

  if (state.ui?.activeWorkoutCompleted) {
    const savedEntry = state.ui?.activeWorkoutSavedEntry || buildHistoryEntryPayload(state);
    const sections = `
      ${renderHeader('complete', firstName)}
      ${renderCompletionSection(savedEntry)}
    `;
    return wrapWithPageLoading(sections, 'Loading workout...');
  }

  const introComplete = Boolean(state.ui?.activeWorkoutIntroComplete);
  if (!introComplete) {
    const sections = `
      ${renderHeader('ready', firstName)}
      ${renderReadySection()}
    `;
    return wrapWithPageLoading(sections, 'Loading workout...');
  }

  const currentIndex = clamp(state.ui?.activeWorkoutIndex ?? 0, 0, total - 1);
  const currentExercise = exercises[currentIndex];

  const sections = `
    ${renderHeader('in-progress', firstName)}
    ${renderExerciseCard(currentExercise, currentIndex, total)}
    ${renderNavigationSection(currentIndex, total)}
  `;

  return wrapWithPageLoading(sections, 'Loading workout...');
}

export function attachWorkoutExecutionEvents(root) {
  revealPageContent(root);
  const readyCard = root.querySelector('[data-ready-card]');
  if (readyCard) {
    requestAnimationFrame(() => readyCard.classList.add('visible'));
    window.setTimeout(() => {
      setState(prev => {
        prev.ui = prev.ui || {};
        prev.ui.activeWorkoutIntroComplete = true;
        if (!prev.ui.activeWorkoutStartedAt) {
          prev.ui.activeWorkoutStartedAt = Date.now();
        }
        return prev;
      });
    }, READY_DELAY_MS);
    return;
  }

  const exerciseCard = root.querySelector('[data-exercise-card]');
  if (exerciseCard) {
    requestAnimationFrame(() => exerciseCard.classList.add('visible'));
  }

  const shiftExercise = delta => {
    setState(prev => {
      const list = prev.ui?.activeWorkout?.planRows || [];
      if (!list.length) {
        return prev;
      }
      const maxIndex = list.length - 1;
      const nextIndex = clamp((prev.ui?.activeWorkoutIndex || 0) + delta, 0, maxIndex);
      prev.ui = prev.ui || {};
      prev.ui.activeWorkoutIndex = nextIndex;
      return prev;
    });
  };

  const animateShift = delta => {
    if (!exerciseCard) {
      shiftExercise(delta);
      return;
    }
    exerciseCard.classList.remove('visible');
    window.setTimeout(() => shiftExercise(delta), CARD_TRANSITION_MS);
  };

  const completeWorkout = () => {
    const state = getState();
    const entry = buildHistoryEntryPayload(state);
    if (!entry) {
      window.location.hash = '#/generate';
      return;
    }
    addWorkoutToHistory(entry);
    recordWorkoutCompletion(entry.date);
    setState(prev => {
      prev.ui = prev.ui || {};
      prev.ui.pendingWorkoutSave = null;
      prev.ui.activeWorkoutCompleted = true;
      prev.ui.activeWorkoutSavedEntry = entry;
      prev.ui.activeWorkoutStartedAt = null;
      return prev;
    });
  };

  const prevButton = root.querySelector('[data-action="prev-exercise"]');
  if (prevButton) {
    prevButton.addEventListener('click', () => animateShift(-1));
  }

  const nextButton = root.querySelector('[data-action="next-exercise"]');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const stateAttr = nextButton.dataset.state;
      if (stateAttr === 'finish') {
        nextButton.disabled = true;
        completeWorkout();
        return;
      }
      animateShift(1);
    });
  }
}