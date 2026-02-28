import { escapeHTML, clamp } from '../utils/helpers.js';
import { getState, setState } from '../logic/state.js';
import { recordWorkoutCompletion } from '../logic/workout.js';
import { getAuth } from '../auth/state.js';
import { addWorkoutToHistory } from '../data/history.js';

function wrapLandingPage(sections) {
  return `
    <section class="landing-page">
      <div class="landing-container">
        ${sections}
      </div>
    </section>
  `;
}

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
  let title;
  let subtext;
  if (status === 'empty') {
    title = 'Workout Missing';
    subtext = `We could not find your last plan, ${firstName}.`;
  } else if (status === 'reflection') {
    title = 'Workout Wrap-Up';
    subtext = `Take 20 seconds to jot what stood out, ${firstName}. Optional but helpful.`;
  } else {
    title = 'Workout in Progress';
    subtext = 'Follow each step at your own pace.';
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

function renderEmptyState() {
  return `
    <section class="landing-section">
      <article class="landing-card">
        <p class="landing-subtext">No active workout</p>
        <p>We could not find a current plan. Generate a new calm session to begin.</p>
        <div class="landing-actions landing-space-top-sm">
          <a class="landing-button" href="#/generate">Go to Generate</a>
        </div>
      </article>
    </section>
  `;
}

function renderExerciseCard(exercise, index, total) {
  const instructions = exercise.description || 'Move slowly, keep breathing steady, and stop if form slips.';
  const rest = formatRest(exercise);
  return `
    <section class="landing-section">
      <p class="landing-subtext">Exercise ${index + 1} of ${total}</p>
      <article class="landing-card">
        <h2>${escapeHTML(exercise.exercise || 'Next movement')}</h2>
        <p class="landing-subtext">${escapeHTML(exercise.sets || '')} × ${escapeHTML(exercise.repRange || '')} · ${escapeHTML(rest)}</p>
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
  return `
    <section class="landing-section">
      <p class="landing-subtext">Navigation</p>
      <div class="landing-actions landing-actions-stack">
        <button class="landing-button secondary" type="button" data-action="prev-exercise" ${isFirst ? 'disabled' : ''}>Previous Exercise</button>
        <button class="landing-button" type="button" data-action="next-exercise" ${isLast ? 'disabled' : ''}>Next Exercise</button>
        <button class="landing-button success" type="button" data-action="finish-workout">Finish Workout</button>
      </div>
    </section>
  `;
}

function formatCompletionDate(value) {
  if (!value) {
    return 'Just now';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function renderCompletionSection(entry) {
  const dateLabel = formatCompletionDate(entry?.date);
  const exerciseCount = entry?.exercises?.length || 0;
  const goalLabel = entry?.goal || 'Calm practice';
  const durationLabel = entry?.durationMinutes
    ? `${entry.durationMinutes} min`
    : 'Not recorded';
  const notesCopy = entry?.notes?.trim()
    ? entry.notes.trim()
    : 'No notes saved this time, but you can add reflections after future sessions.';
  return `
    <section class="landing-section">
      <article class="landing-card">
        <h1>Workout Complete!</h1>
        <p class="landing-subtext">Great job — your workout has been saved.</p>
        <div class="landing-grid landing-grid-two landing-space-top-md">
          <div>
            <p class="landing-subtext">Date</p>
            <h3>${escapeHTML(dateLabel)}</h3>
          </div>
          <div>
            <p class="landing-subtext">Duration</p>
            <h3>${escapeHTML(durationLabel)}</h3>
          </div>
          <div>
            <p class="landing-subtext">Exercises</p>
            <h3>${escapeHTML(String(exerciseCount))}</h3>
          </div>
          <div class="landing-grid-span">
            <p class="landing-subtext">Goal</p>
            <h3>${escapeHTML(goalLabel)}</h3>
          </div>
        </div>
        <div class="landing-space-top-md">
          <p class="landing-subtext">Notes</p>
          <p>${escapeHTML(notesCopy)}</p>
        </div>
        <div class="landing-actions landing-actions-stack landing-space-top-md">
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

function renderReflectionSection(entry) {
  const durationLabel = entry?.durationMinutes
    ? `${entry.durationMinutes} min`
    : 'Duration tracked automatically';
  const exerciseCount = entry?.exercises?.length || 0;
  return `
    <section class="landing-section">
      <p class="landing-subtext">Ready to save?</p>
      <article class="landing-card">
        <h2>Log a quick reflection</h2>
        <p>${escapeHTML(`This took about ${durationLabel} across ${exerciseCount} moves. Jot what felt smooth or sticky.`)}</p>
        <div class="landing-grid landing-grid-two landing-space-top-md">
          <div>
            <p class="landing-subtext">Duration</p>
            <h3>${escapeHTML(durationLabel)}</h3>
          </div>
          <div>
            <p class="landing-subtext">Exercises</p>
            <h3>${escapeHTML(String(exerciseCount))}</h3>
          </div>
        </div>
        <form class="landing-space-top-md" data-form="workout-notes">
          <label>
            <span class="landing-subtext">Session notes (optional)</span>
            <textarea name="notes" rows="4" placeholder="e.g., Tempo squats felt smooth—add 5 lbs next time."></textarea>
          </label>
          <div class="landing-actions landing-actions-stack landing-space-top-sm">
            <button class="landing-button" type="submit">Save Workout</button>
            <button class="landing-button secondary" type="button" data-action="skip-notes">Skip Notes</button>
          </div>
        </form>
      </article>
    </section>
  `;
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
  const pendingSave = state.ui?.pendingWorkoutSave;

  if (!total) {
    const sections = `
      ${renderHeader('empty', firstName)}
      ${renderEmptyState()}
    `;
    return wrapLandingPage(sections);
  }

  if (state.ui?.activeWorkoutCompleted) {
    const savedEntry = state.ui?.activeWorkoutSavedEntry;
    const sections = `
      ${renderCompletionSection(savedEntry)}
    `;
    return wrapLandingPage(sections);
  }

  if (pendingSave) {
    const sections = `
      ${renderHeader('reflection', firstName)}
      ${renderReflectionSection(pendingSave)}
    `;
    return wrapLandingPage(sections);
  }

  const currentIndex = clamp(state.ui?.activeWorkoutIndex ?? 0, 0, total - 1);
  const currentExercise = exercises[currentIndex];

  const sections = `
    ${renderHeader('in-progress', firstName)}
    ${renderExerciseCard(currentExercise, currentIndex, total)}
    ${renderNavigationSection(currentIndex, total)}
  `;

  return wrapLandingPage(sections);
}

export function attachWorkoutExecutionEvents(root) {
  const finalizeWorkout = notesValue => {
    const cleanNotes = typeof notesValue === 'string' ? notesValue.trim() : '';
    const state = getState();
    const pending = state.ui?.pendingWorkoutSave;
    if (!pending) {
      return;
    }
    const payload = { ...pending, notes: cleanNotes };
    addWorkoutToHistory(payload);
    recordWorkoutCompletion(payload.date);
    setState(prev => {
      prev.ui = prev.ui || {};
      prev.ui.pendingWorkoutSave = null;
      prev.ui.activeWorkoutCompleted = true;
      prev.ui.activeWorkoutSavedEntry = payload;
      prev.ui.activeWorkoutStartedAt = null;
      return prev;
    });
  };

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

  const prevButton = root.querySelector('[data-action="prev-exercise"]');
  if (prevButton) {
    prevButton.addEventListener('click', () => shiftExercise(-1));
  }

  const nextButton = root.querySelector('[data-action="next-exercise"]');
  if (nextButton) {
    nextButton.addEventListener('click', () => shiftExercise(1));
  }

  const finishButton = root.querySelector('[data-action="finish-workout"]');
  if (finishButton) {
    finishButton.addEventListener('click', () => {
      finishButton.disabled = true;
      const state = getState();
      const pendingEntry = buildHistoryEntryPayload(state);
      if (!pendingEntry) {
        finishButton.disabled = false;
        return;
      }
      setState(prev => {
        prev.ui = prev.ui || {};
        prev.ui.pendingWorkoutSave = pendingEntry;
        return prev;
      });
    });
  }

  const notesForm = root.querySelector('[data-form="workout-notes"]');
  if (notesForm) {
    notesForm.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(notesForm);
      const notesValue = formData.get('notes');
      finalizeWorkout(typeof notesValue === 'string' ? notesValue : '');
    });
  }

  const skipButton = root.querySelector('[data-action="skip-notes"]');
  if (skipButton) {
    skipButton.addEventListener('click', () => finalizeWorkout(''));
  }
}
