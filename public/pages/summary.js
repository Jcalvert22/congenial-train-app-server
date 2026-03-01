import { escapeHTML } from '../utils/helpers.js';
import { getState, setState } from '../logic/state.js';
import { getAuth } from '../auth/state.js';
import {
  renderErrorStateCard,
  renderPageShell
} from '../components/stateCards.js';
import {
  getGymxietyPreference,
  resolveGymxietyFromPlan,
  applyConfidenceAlternative
} from '../utils/gymxiety.js';
import { confidenceAlternativeMap } from '../data/confidenceAlternativeMap.js';

const MUSCLE_ICONS = {
  Chest: '\u{1F9E1}',
  Back: '\u{1F499}',
  Legs: '\u{1F49A}',
  Shoulders: '\u{1F49B}',
  Arms: '\u{1F4AA}',
  Abs: '\u{1F300}'
};

const GYMXIETY_SUPPORTIVE_CUES = [
  'Choose a weight that feels comfortable.',
  'Move at a pace that feels natural.',
  'You can always take extra rest.'
];

const GYMXIETY_CONFIDENCE_DESCRIPTORS = {
  Easy: 'This one is simple and steady.',
  Moderate: 'Still beginner-friendly, just a bit more movement.'
};

const SUMMARY_CARD_TRANSITION_MS = 250;
const DEFAULT_SET_LABEL = '3 sets';
const DEFAULT_REP_LABEL = '10 reps';
const DEFAULT_REST_LABEL = 'Rest 90 sec';
const DEFAULT_CONFIDENCE_LABEL = 'Moderate';
const DEFAULT_INSTRUCTIONS = 'Move slowly, breathe through the hardest part, and stop if form slips.';

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
  return MUSCLE_ICONS[muscle] || '\u{1F3CB}';
}

function formatRestTime(row) {
  if (row?.rest) {
    return row.rest;
  }
  return row?.usesWeight ? 'Rest 75-90 sec' : 'Rest 40-60 sec';
}

function normalizeExerciseRow(row, index) {
  if (!row || typeof row !== 'object') {
    return {
      id: index,
      exercise: `Movement ${index + 1}`,
      sets: DEFAULT_SET_LABEL,
      repRange: DEFAULT_REP_LABEL,
      rest: DEFAULT_REST_LABEL,
      confidence: DEFAULT_CONFIDENCE_LABEL,
      supportiveCues: [],
      muscle: 'Full body',
      equipment: 'Bodyweight',
      description: DEFAULT_INSTRUCTIONS,
      usesWeight: false
    };
  }
  return {
    ...row,
    id: row.id ?? index,
    exercise: row.exercise || row.name || `Movement ${index + 1}`,
    sets: row.sets || DEFAULT_SET_LABEL,
    repRange: row.repRange || row.reps || DEFAULT_REP_LABEL,
    rest: row.rest || DEFAULT_REST_LABEL,
    confidence: row.confidence || DEFAULT_CONFIDENCE_LABEL,
    supportiveCues: Array.isArray(row.supportiveCues) ? row.supportiveCues : [],
    muscle: row.muscle || 'Full body',
    equipment: row.equipment || 'Bodyweight',
    description: row.description || row.instructions || DEFAULT_INSTRUCTIONS,
    usesWeight: Boolean(row.usesWeight)
  };
}

function normalizePlanRows(rows = []) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row, index) => normalizeExerciseRow(row, index));
}

function canUseConfidenceAlternative(row) {
  if (!row || row.confidenceApplied) {
    return false;
  }
  if (row.confidenceAlternative) {
    return true;
  }
  const source = row.baseExercise || row.exercise;
  return Boolean(source && confidenceAlternativeMap[source]);
}

function renderHeader(firstName, hasPlan, goalText, gymxietyMode) {
  const subtext = hasPlan
    ? `We personalized this calm session around your ${goalText} goal, ${firstName}.`
    : `We couldn\u2019t find your latest plan. Generate one to get a personalized breakdown, ${firstName}.`;
  const supportiveLead = gymxietyMode && hasPlan
    ? '<p class="supportive-text">Gymxiety Mode is ON \u2014 we built this plan to feel calm and confidence-forward.</p>'
    : '';
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Workout summary</span>
        <h1>Your Workout Is Ready</h1>
        <p class="landing-subtext lead">${escapeHTML(subtext)}</p>
        ${supportiveLead}
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Need a tweak?</p>
        <p>Adjust equipment or focus from the Generate page whenever you like.</p>
      </div>
    </header>
  `;
}

function renderGymxietyIntroCard() {
  return `
    <section class="landing-section" data-gymxiety-intro>
      <article class="landing-card">
        <h2>Gymxiety Mode is ON</h2>
        <p class="supportive-text">This workout is designed to feel calm, simple, and beginner-friendly.</p>
        <ul class="landing-list">
          ${GYMXIETY_SUPPORTIVE_CUES.map(cue => `<li>${escapeHTML(cue)}</li>`).join('')}
        </ul>
      </article>
    </section>
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

function resolveConfidenceCopy(label, gymxietyMode) {
  if (!gymxietyMode) {
    return `Confidence: ${label}`;
  }
  return GYMXIETY_CONFIDENCE_DESCRIPTORS[label] || 'Take it one rep at a time.';
}

function renderExerciseCard(row, index, options = {}) {
  const { gymxietyMode } = options;
  const exerciseName = row?.exercise || `Movement ${index + 1}`;
  const instructions = row?.description || 'Move slowly, breathe through the hardest part, and stop if form slips.';
  const restLabel = formatRestTime(row);
  const sets = row?.sets || '3 sets';
  const reps = row?.repRange || '8-12 reps';
  const muscle = row?.muscle || 'Full body';
  const equipment = row?.equipment || 'Bodyweight';
  const confidenceLabel = row?.confidence || 'Moderate';
  const confidenceCopy = resolveConfidenceCopy(confidenceLabel, gymxietyMode);
  const confidenceTag = `<span class="confidence-tag">${escapeHTML(confidenceCopy)}</span>`;
  const supportiveCues = gymxietyMode
    ? (Array.isArray(row?.supportiveCues) && row.supportiveCues.length ? row.supportiveCues : GYMXIETY_SUPPORTIVE_CUES)
    : [];
  const supportiveCopy = supportiveCues.map(cue => `<p class="supportive-text">${escapeHTML(cue)}</p>`).join('');
  const steadyReminder = gymxietyMode
    ? '<p class="supportive-text">Take your time - focus on slow, controlled movement.</p>'
    : '';
  const canSwap = canUseConfidenceAlternative(row);
  const easierLink = canSwap
    ? `<button class="easier-btn" type="button" data-action="confidence-alt" data-exercise-index="${index}">Need an easier version?</button>`
    : '';
  return `
    <article class="landing-card fade-transition" data-exercise-card data-exercise-index="${index}">
      <div class="landing-card-image" aria-hidden="true">${getExerciseIcon(muscle)}</div>
      <h3>${escapeHTML(exerciseName)}</h3>
      <p class="landing-subtext">${escapeHTML(sets)} x ${escapeHTML(reps)} - ${escapeHTML(restLabel)}</p>
      ${confidenceTag}
      <p>${escapeHTML(instructions)}</p>
      ${supportiveCopy}
      ${steadyReminder}
      <div class="landing-pill-list">
        <span class="landing-pill">${escapeHTML(muscle)}</span>
        <span class="landing-pill">${escapeHTML(equipment)}</span>
      </div>
      ${easierLink}
    </article>
  `;
}

function renderExercisesSection(rows, options = {}) {
  const cards = rows.map((row, index) => renderExerciseCard(row, index, options));
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
    actionLabel: 'Generate a New Workout',
    actionHref: '#/generate'
  });
}

function computeGymxietyMode(plan, profile) {
  const fallback = typeof profile?.gymxietyMode === 'boolean'
    ? profile.gymxietyMode
    : getGymxietyPreference();
  return resolveGymxietyFromPlan(plan, fallback);
}

export function renderWorkoutSummaryPage(state) {
  let isLoading = true;
  const plan = state.ui?.plannerResult;
  const rows = Array.isArray(plan?.planRows) ? plan.planRows.filter(Boolean) : [];
  const normalizedRows = normalizePlanRows(rows);
  const summary = plan && typeof plan.summary === 'object' ? plan.summary : {};
  const hasPlan = normalizedRows.length > 0;
  const firstName = getFirstName(state);
  const goalText = plan?.goal || state.profile?.goal || 'consistency';
  const reason = plan ? 'invalid' : 'missing';
  const gymxietyMode = computeGymxietyMode(plan, state.profile);
  isLoading = false;

  if (!hasPlan) {
    const sections = `
      ${renderHeader(firstName, false, goalText, gymxietyMode)}
      ${renderEmptyState(reason)}
    `;
    return renderPageShell(sections, { isLoading });
  }

  const sections = `
    ${renderHeader(firstName, true, goalText, gymxietyMode)}
    ${gymxietyMode ? renderGymxietyIntroCard() : ''}
    ${renderSummarySection(state, normalizedRows, summary)}
    ${renderExercisesSection(normalizedRows, { gymxietyMode })}
    ${renderCtaSection()}
  `;

  return renderPageShell(sections, { isLoading });
}

export function attachWorkoutSummaryEvents(root, state) {
  const gymxietyMode = computeGymxietyMode(state.ui?.plannerResult, state.profile);
  const cards = root.querySelectorAll('[data-exercise-card]');
  cards.forEach(card => requestAnimationFrame(() => card.classList.add('visible')));
  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-action="confidence-alt"]');
    if (!trigger) {
      return;
    }
    const index = Number.parseInt(trigger.dataset.exerciseIndex, 10);
    if (!Number.isFinite(index)) {
      return;
    }
    trigger.disabled = true;
    let applied = false;
    let updatedRow = null;
    setState(prev => {
      const plan = prev.ui?.plannerResult;
      if (!plan || !Array.isArray(plan.planRows)) {
        return prev;
      }
      const nextRows = plan.planRows.map(row => ({ ...row }));
      applied = applyConfidenceAlternative(nextRows, { index });
      if (!applied) {
        return prev;
      }
      updatedRow = nextRows[index];
      const updatedPlan = { ...plan, planRows: nextRows };
      const nextUi = { ...prev.ui, plannerResult: updatedPlan };
      if (nextUi.activeWorkout && Array.isArray(nextUi.activeWorkout.planRows)) {
        const activeRows = nextUi.activeWorkout.planRows.map(row => ({ ...row }));
        if (applyConfidenceAlternative(activeRows, { index })) {
          nextUi.activeWorkout = { ...nextUi.activeWorkout, planRows: activeRows };
        }
      }
      prev.ui = nextUi;
      return prev;
    });
    if (!applied || !updatedRow) {
      trigger.disabled = false;
      return;
    }
    const refreshedState = getState();
    state.ui = refreshedState.ui;
    const targetCard = root.querySelector(`[data-exercise-card][data-exercise-index="${index}"]`);
    if (targetCard) {
      targetCard.classList.remove('visible');
      window.setTimeout(() => {
        targetCard.outerHTML = renderExerciseCard(updatedRow, index, { gymxietyMode });
        const nextCard = root.querySelector(`[data-exercise-card][data-exercise-index="${index}"]`);
        if (nextCard) {
          requestAnimationFrame(() => nextCard.classList.add('visible'));
        }
      }, SUMMARY_CARD_TRANSITION_MS);
    }
  });
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
