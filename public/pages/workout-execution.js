import { escapeHTML, clamp } from '../utils/helpers.js';
import { getState, setState } from '../logic/state.js';
import { recordWorkoutCompletion, handlePlanFeedback } from '../logic/workout.js';
import { getAuth } from '../auth/state.js';
import { addWorkoutToHistory } from '../data/history.js';
import { addSavedWorkout } from '../utils/savedWorkouts.js';
import { buildSavedWorkoutPayload } from './summary.js';
import {
  renderEmptyStateCard,
  renderErrorStateCard,
  renderPageShell
} from '../components/stateCards.js';
import {
  getGymxietyPreference,
  resolveGymxietyFromPlan,
  applyConfidenceAlternative
} from '../utils/gymxiety.js';
import { confidenceAlternativeMap } from '../data/confidenceAlternativeMap.js';
import { getExerciseEtiquetteLines } from '../utils/etiquette.js';

const READY_DELAY_MS = 1000;
const CARD_TRANSITION_MS = 220;
const EXECUTION_GYMXIETY_CUES = [
  'Keep chest tall.',
  'Move slow and controlled.',
  'Stop if anything feels sharp or painful.'
];
const EXECUTION_FEEDBACK_CHOICES = [
  { value: 'too_easy', label: 'Too easy', intent: 'easy' },
  { value: 'perfect', label: 'Perfect', intent: 'steady' },
  { value: 'too_hard', label: 'Too difficult', intent: 'hard' }
];
const EXECUTION_FEEDBACK_MESSAGES = {
  too_easy: 'Got it. We will gently nudge this move harder next time.',
  perfect: 'Nice. We will keep this prescription steady.',
  too_hard: 'Thanks. We will ease this exercise the next time it shows up.'
};
const DEFAULT_EXERCISE_SETS = '3 sets';
const DEFAULT_EXERCISE_REPS = '10 reps';
const DEFAULT_EXERCISE_REST = 'Rest 90 sec';
const DEFAULT_EXERCISE_CONFIDENCE = 'Moderate';
const DEFAULT_EXERCISE_INSTRUCTIONS = 'Move slowly, breathe through the hardest part, and stop if form slips.';

function getFirstName(state) {
  const auth = getAuth();
  const fallback = state.profile?.name || 'Friend';
  const displayName = auth.user?.name?.trim() || fallback;
  return displayName.split(' ')[0];
}

function getActiveWorkout(state) {
  return state.ui?.activeWorkout || state.ui?.plannerResult || null;
}

function formatRest(exercise, options = {}) {
  if (options.gymxietyMode) {
    return exercise.rest || 'Rest 60-90 sec';
  }
  if (exercise.rest) {
    return exercise.rest;
  }
  return exercise.usesWeight ? 'Rest 75-90 sec' : 'Rest 40-60 sec';
}

function canUseConfidenceAlternative(exercise) {
  if (!exercise || exercise.confidenceApplied) {
    return false;
  }
  if (exercise.confidenceAlternative) {
    return true;
  }
  const source = exercise.baseExercise || exercise.exercise;
  return Boolean(source && confidenceAlternativeMap[source]);
}

function renderHeader(status, firstName, gymxietyMode) {
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
  const supportiveLead = gymxietyMode && status !== 'empty'
    ? '<p class="supportive-text">Gymxiety Mode keeps everything calm, encouraging, and judgment-free.</p>'
    : '';
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Guided session</span>
        <h1>${escapeHTML(title)}</h1>
        <p class="landing-subtext lead">${escapeHTML(subtext)}</p>
        ${supportiveLead}
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
    actionLabel: 'Generate a New Workout',
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

function normalizeExecutionExercise(row, index) {
  if (!row || typeof row !== 'object') {
    return {
      id: index,
      exercise: `Movement ${index + 1}`,
      sets: DEFAULT_EXERCISE_SETS,
      repRange: DEFAULT_EXERCISE_REPS,
      reps: DEFAULT_EXERCISE_REPS,
      rest: DEFAULT_EXERCISE_REST,
      muscle: 'Full body',
      equipment: 'Bodyweight',
      description: DEFAULT_EXERCISE_INSTRUCTIONS,
      instructions: DEFAULT_EXERCISE_INSTRUCTIONS,
      confidence: DEFAULT_EXERCISE_CONFIDENCE,
      supportiveCues: [],
      usesWeight: false,
      baseExercise: `Movement ${index + 1}`,
      timeBased: false
    };
  }
  return {
    ...row,
    id: row.id ?? index,
    exercise: row.exercise || row.name || `Movement ${index + 1}`,
    sets: row.sets || DEFAULT_EXERCISE_SETS,
    repRange: row.repRange || row.reps || DEFAULT_EXERCISE_REPS,
    reps: row.repRange || row.reps || DEFAULT_EXERCISE_REPS,
    rest: row.rest,
    muscle: row.muscle || 'Full body',
    equipment: row.equipment || 'Bodyweight',
    description: row.description || row.instructions || DEFAULT_EXERCISE_INSTRUCTIONS,
    instructions: row.instructions || row.description || DEFAULT_EXERCISE_INSTRUCTIONS,
    confidence: row.confidence || DEFAULT_EXERCISE_CONFIDENCE,
    supportiveCues: Array.isArray(row.supportiveCues) ? row.supportiveCues : [],
    usesWeight: Boolean(row.usesWeight),
    baseExercise: row.baseExercise || row.exercise || row.name || `Movement ${index + 1}`,
    timeBased: Boolean(row.timeBased),
    etiquetteTip: row.etiquetteTip || row.etiquette_tip || ''
  };
}

function normalizeExecutionExercises(rows = []) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row, index) => normalizeExecutionExercise(row, index));
}

function renderExerciseCard(exercise, index, total, options = {}) {
  const { gymxietyMode, feedbackChoice = '', feedbackKey } = options;
  const rest = formatRest(exercise, { gymxietyMode });
  const progressPercent = Math.round(((index + 1) / total) * 100);
  const exerciseId = feedbackKey || String(exercise.id ?? index);
  const progressMarkup = gymxietyMode
    ? `<p class="landing-subtext">Movement ${index + 1} of ${total}</p>`
    : `
        <p class="execution-progress">Exercise ${index + 1} of ${total}</p>
        <div class="execution-progress-bar"><span style="width: ${progressPercent}%"></span></div>
      `;
  const supportiveIntro = gymxietyMode
    ? '<p class="supportive-text">You\u2019re doing great - take your time and move with control.</p>'
    : '';
  const simplifiedCues = EXECUTION_GYMXIETY_CUES.map(cue => `<p class="supportive-text">${escapeHTML(cue)}</p>`).join('');
  const instructionsMarkup = gymxietyMode
    ? simplifiedCues
    : `<p>${escapeHTML(exercise.description || 'Move slowly, keep breathing steady, and stop if form slips.')}</p>`;
  const extraCues = !gymxietyMode && Array.isArray(exercise.supportiveCues)
    ? exercise.supportiveCues.map(cue => `<p class="supportive-text">${escapeHTML(cue)}</p>`).join('')
    : '';
  const etiquetteLines = getExerciseEtiquetteLines(exercise, { gymxietyMode });
  const etiquetteMarkup = etiquetteLines.length
    ? etiquetteLines.map(line => `<p class="supportive-text">${escapeHTML(line)}</p>`).join('')
    : '';
  const confidenceTag = `<span class="confidence-tag">Confidence: ${escapeHTML(exercise.confidence || 'Moderate')}</span>`;
  const muscleLabel = `<p class="supportive-text exercise-muscle-label">Targets: ${escapeHTML(exercise.muscle || 'Full body')}</p>`;
  const feedbackButtons = EXECUTION_FEEDBACK_CHOICES
    .map(choice => {
      const isSelected = feedbackChoice === choice.value ? ' is-selected' : '';
      return `
        <button class="execution-feedback-btn${isSelected}" type="button"
          data-action="exercise-feedback"
          data-choice="${escapeHTML(choice.value)}"
          data-exercise-id="${escapeHTML(exerciseId)}"
          data-intent="${escapeHTML(choice.intent)}">
          ${escapeHTML(choice.label)}
        </button>
      `;
    })
    .join('');
  const feedbackStatusCopy = feedbackChoice ? EXECUTION_FEEDBACK_MESSAGES[feedbackChoice] : '';
  const feedbackControls = `
    <div class="execution-feedback" data-feedback-group="${escapeHTML(exerciseId)}">
      <p class="landing-subtext">How did that feel?</p>
      <div class="execution-feedback-actions">
        ${feedbackButtons}
      </div>
      <p class="supportive-text execution-feedback-status"${feedbackStatusCopy ? '' : ' hidden'} data-feedback-status>
        ${feedbackStatusCopy ? escapeHTML(feedbackStatusCopy) : ''}
      </p>
    </div>
  `;
  const easierButton = canUseConfidenceAlternative(exercise)
    ? `<button class="easy-version-btn" type="button" data-action="exercise-alt" data-exercise-index="${index}">Show easier version</button>`
    : '';
  return `
    <section class="landing-section">
      <article class="landing-card exercise-card fade-transition" data-exercise-card data-exercise-index="${index}">
        ${progressMarkup}
        <h2 class="landing-card-title">${escapeHTML(exercise.exercise || 'Next movement')}</h2>
        ${confidenceTag}
        <div class="execution-meta">
          <strong>${escapeHTML(exercise.sets || '3 sets')} x ${escapeHTML(exercise.repRange || '8 reps')}</strong>
          <span>${escapeHTML(rest)}</span>
        </div>
        ${supportiveIntro}
        ${instructionsMarkup}
        ${extraCues}
        ${etiquetteMarkup}
        ${muscleLabel}
        <div class="landing-pill-list">
          <span class="landing-pill">${escapeHTML(exercise.muscle || 'Full body')}</span>
          <span class="landing-pill">${escapeHTML(exercise.equipment || 'Bodyweight')}</span>
        </div>
        ${feedbackControls}
        ${easierButton}
      </article>
    </section>
  `;
}

function renderNavigationSection(index, total, options = {}) {
  const { gymxietyMode } = options;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const nextLabel = isLast ? 'Finish Workout' : 'Next Exercise';
  const nextState = isLast ? 'finish' : 'next';
  const navLead = gymxietyMode
    ? 'Pause whenever you need. Extra rest is always okay.'
    : 'Stay calm between sets.';
  return `
    <section class="landing-section">
      <article class="landing-card execution-nav">
        <p class="landing-subtext">${escapeHTML(navLead)}</p>
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
          <button class="landing-button" type="button" data-action="save-completed-workout">Save Workout</button>
          <a class="landing-button" href="#/dashboard">Back to Dashboard</a>
          <a class="landing-button secondary" href="#/history">View Workout History</a>
          <a class="landing-button secondary" href="#/generate">Generate Another Workout</a>
        </div>
        <p class="supportive-text completion-save-feedback" data-completion-save-feedback hidden>Saved for later. Check it on the History screen anytime.</p>
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

function inferTimeBasedFromRow(row) {
  if (typeof row?.timeBased === 'boolean') {
    return row.timeBased;
  }
  const value = (row?.repRange || row?.reps || '').toString().toLowerCase();
  return /sec|second|hold|walk|carry|march|bike|row|ride/.test(value);
}

function buildHistoryEntryPayload(state, options = {}) {
  const workout = state.ui?.activeWorkout;
  if (!workout || !Array.isArray(workout.planRows) || !workout.planRows.length) {
    return null;
  }
  const safeRows = normalizeExecutionExercises(workout.planRows);
  const profile = state.profile || {};
  const finishTimestamp = typeof options.finishTimestamp === 'number'
    ? options.finishTimestamp
    : Date.now();
  const exercises = safeRows.map(row => ({
    name: row.exercise,
    sets: row.sets,
    reps: row.repRange,
    rest: formatRest(row),
    instructions: row.description || 'Move smoothly and keep breathing steady.',
    timeBased: inferTimeBasedFromRow(row)
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
  let isLoading = true;
  const workout = getActiveWorkout(state);
  const normalizedExercises = normalizeExecutionExercises(Array.isArray(workout?.planRows) ? workout.planRows : []);
  const total = normalizedExercises.length;
  const feedbackSelections = state.ui?.activeWorkoutFeedback || {};
  const firstName = getFirstName(state);
  const fallbackPreference = typeof state.profile?.gymxietyMode === 'boolean'
    ? state.profile.gymxietyMode
    : getGymxietyPreference();
  const gymxietyMode = resolveGymxietyFromPlan(workout, fallbackPreference);
  isLoading = false;

  if (workout && !Array.isArray(workout.planRows)) {
    const sections = `
      ${renderHeader('empty', firstName, gymxietyMode)}
      ${renderErrorStateCard({
        title: 'Workout looks corrupted',
        message: 'We had trouble reading that routine. Please generate a new workout to continue.',
        actionLabel: 'Generate a New Workout',
        actionHref: '#/generate'
      })}
    `;
    return renderPageShell(sections, { isLoading });
  }

  if (!total) {
    const sections = `
      ${renderHeader('empty', firstName, gymxietyMode)}
      ${renderNoWorkoutSection()}
    `;
    return renderPageShell(sections, { isLoading });
  }

  if (state.ui?.activeWorkoutCompleted) {
    const savedEntry = state.ui?.activeWorkoutSavedEntry || buildHistoryEntryPayload(state);
    const sections = `
      ${renderHeader('complete', firstName, gymxietyMode)}
      ${renderCompletionSection(savedEntry)}
    `;
    return renderPageShell(sections, { isLoading });
  }

  const introComplete = Boolean(state.ui?.activeWorkoutIntroComplete);
  if (!introComplete) {
    const sections = `
      ${renderHeader('ready', firstName, gymxietyMode)}
      ${renderReadySection()}
    `;
    return renderPageShell(sections, { isLoading });
  }

  const currentIndex = clamp(state.ui?.activeWorkoutIndex ?? 0, 0, total - 1);
  const currentExercise = normalizedExercises[currentIndex];
  if (!currentExercise) {
    const sections = `
      ${renderHeader('empty', firstName, gymxietyMode)}
      ${renderErrorStateCard({
        title: 'Exercise missing',
        message: 'We could not load that specific movement. Generate a new workout to keep things steady.',
        actionLabel: 'Generate a New Workout',
        actionHref: '#/generate'
      })}
    `;
    return renderPageShell(sections, { isLoading });
  }

  const exerciseKey = String(currentExercise.id ?? currentIndex);
  const sections = `
    ${renderHeader('in-progress', firstName, gymxietyMode)}
    ${renderExerciseCard(currentExercise, currentIndex, total, {
      gymxietyMode,
      feedbackChoice: feedbackSelections[exerciseKey],
      feedbackKey: exerciseKey
    })}
    ${renderNavigationSection(currentIndex, total, { gymxietyMode })}
  `;

  return renderPageShell(sections, { isLoading });
}

export function attachWorkoutExecutionEvents(root) {
  const stateSnapshot = getState();
  const fallbackPreference = typeof stateSnapshot.profile?.gymxietyMode === 'boolean'
    ? stateSnapshot.profile.gymxietyMode
    : getGymxietyPreference();
  const activePlan = stateSnapshot.ui?.activeWorkout || stateSnapshot.ui?.plannerResult;
  const gymxietyMode = resolveGymxietyFromPlan(activePlan, fallbackPreference);
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

  const completionSaveButton = root.querySelector('[data-action="save-completed-workout"]');
  if (completionSaveButton) {
    const feedbackNote = root.querySelector('[data-completion-save-feedback]');
    completionSaveButton.addEventListener('click', () => {
      const latest = getState();
      const plan = latest.ui?.activeWorkout || latest.ui?.plannerResult;
      const payload = buildSavedWorkoutPayload(plan, latest.profile || {});
      if (!payload) {
        console.warn('No workout available to save.');
        return;
      }
      addSavedWorkout(payload);
      completionSaveButton.disabled = true;
      completionSaveButton.textContent = 'Saved Workout';
      if (feedbackNote) {
        feedbackNote.hidden = false;
      }
    });
  }

  const updateFeedbackUi = (exerciseId, choice) => {
    if (!exerciseId) {
      return;
    }
    const groups = root.querySelectorAll('[data-feedback-group]');
    let targetGroup = null;
    groups.forEach(group => {
      if (group.dataset.feedbackGroup === exerciseId) {
        targetGroup = group;
      }
    });
    if (!targetGroup) {
      return;
    }
    const buttons = targetGroup.querySelectorAll('[data-action="exercise-feedback"]');
    buttons.forEach(button => {
      button.classList.toggle('is-selected', button.dataset.choice === choice);
    });
    const statusEl = targetGroup.querySelector('[data-feedback-status]');
    if (statusEl) {
      if (choice && EXECUTION_FEEDBACK_MESSAGES[choice]) {
        statusEl.textContent = EXECUTION_FEEDBACK_MESSAGES[choice];
        statusEl.hidden = false;
      } else {
        statusEl.textContent = '';
        statusEl.hidden = true;
      }
    }
  };

  const useConfidenceAlternative = index => {
    let updatedRow = null;
    let applied = false;
    setState(prev => {
      const activeWorkout = prev.ui?.activeWorkout;
      if (!activeWorkout || !Array.isArray(activeWorkout.planRows)) {
        return prev;
      }
      const nextRows = activeWorkout.planRows.map(row => ({ ...row }));
      applied = applyConfidenceAlternative(nextRows, { index });
      if (!applied) {
        return prev;
      }
      updatedRow = nextRows[index];
      const nextUi = {
        ...prev.ui,
        activeWorkout: { ...activeWorkout, planRows: nextRows }
      };
      if (nextUi.plannerResult && Array.isArray(nextUi.plannerResult.planRows)) {
        const plannerRows = nextUi.plannerResult.planRows.map(row => ({ ...row }));
        if (applyConfidenceAlternative(plannerRows, { index })) {
          nextUi.plannerResult = { ...nextUi.plannerResult, planRows: plannerRows };
        }
      }
      prev.ui = nextUi;
      return prev;
    });
    return applied ? updatedRow : null;
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
      prev.ui.activeWorkoutFeedback = {};
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

  root.addEventListener('click', event => {
    const feedbackTrigger = event.target.closest('[data-action="exercise-feedback"]');
    if (feedbackTrigger) {
      event.preventDefault();
      const exerciseId = feedbackTrigger.dataset.exerciseId;
      const choice = feedbackTrigger.dataset.choice;
      if (!exerciseId || !choice) {
        return;
      }
      const latest = getState();
      const previousChoice = latest.ui?.activeWorkoutFeedback?.[exerciseId] || '';
      if (previousChoice === choice) {
        updateFeedbackUi(exerciseId, choice);
        return;
      }
      if (previousChoice && previousChoice !== 'perfect' && previousChoice !== choice) {
        const reverseChoice = previousChoice === 'too_easy' ? 'too_hard' : 'too_easy';
        handlePlanFeedback({ [exerciseId]: reverseChoice });
      }
      if (choice !== 'perfect') {
        handlePlanFeedback({ [exerciseId]: choice });
      }
      setState(prev => {
        const nextFeedback = { ...(prev.ui?.activeWorkoutFeedback || {}) };
        nextFeedback[exerciseId] = choice;
        prev.ui = { ...prev.ui, activeWorkoutFeedback: nextFeedback };
        return prev;
      });
      updateFeedbackUi(exerciseId, choice);
      return;
    }

    const confidenceTrigger = event.target.closest('[data-action="exercise-alt"]');
    if (!confidenceTrigger) {
      return;
    }
    event.preventDefault();
    const buttonIndex = Number.parseInt(confidenceTrigger.dataset.exerciseIndex, 10);
    const fallbackIndex = clamp(getState().ui?.activeWorkoutIndex ?? 0, 0, (getState().ui?.activeWorkout?.planRows || []).length - 1);
    const targetIndex = Number.isFinite(buttonIndex) ? buttonIndex : fallbackIndex;
    const card = root.querySelector('[data-exercise-card]');
    if (!card) {
      return;
    }
    confidenceTrigger.disabled = true;
    card.classList.remove('visible');
    window.setTimeout(() => {
      const updatedRow = useConfidenceAlternative(targetIndex);
      if (!updatedRow) {
        confidenceTrigger.disabled = false;
        card.classList.add('visible');
        return;
      }
      const latest = getState();
      const refreshedPlan = latest.ui?.activeWorkout || latest.ui?.plannerResult;
      const total = Array.isArray(refreshedPlan?.planRows) ? refreshedPlan.planRows.length : 0;
      const feedbackSelections = latest.ui?.activeWorkoutFeedback || {};
      const exerciseId = String(updatedRow.id ?? targetIndex);
      const nextMarkup = renderExerciseCard(updatedRow, targetIndex, total, {
        gymxietyMode,
        feedbackChoice: feedbackSelections[exerciseId],
        feedbackKey: exerciseId
      });
      card.outerHTML = nextMarkup;
      const nextCard = root.querySelector(`[data-exercise-card][data-exercise-index="${targetIndex}"]`);
      if (nextCard) {
        requestAnimationFrame(() => nextCard.classList.add('visible'));
      }
    }, CARD_TRANSITION_MS);
  });
}