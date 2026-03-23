import { escapeHTML } from '../utils/helpers.js';
import { getState, setState } from '../logic/state.js';
import { getAuth } from '../auth/state.js';
import {
  renderEmptyStateCard,
  renderPageShell
} from '../components/stateCards.js';
import {
  getGymxietyPreference,
  resolveGymxietyFromPlan,
  applyConfidenceAlternative
} from '../utils/gymxiety.js';
import { confidenceAlternativeMap } from '../data/confidenceAlternativeMap.js';
import { buildPlanRowsFromExercises } from '../logic/workout.js';
import { EXERCISES, DEFAULT_BEGINNER_WORKOUT } from '../data/exercises.js';
import { getDislikedExercises, addDislikedExercise } from '../utils/dislikedExercises.js';
import {
  getFavoriteExercises,
  addFavoriteExercise,
  removeFavoriteExercise
} from '../utils/favoriteExercises.js';
import { applyGoalPrescription } from '../utils/generateWorkout.js';
import { collectEquipmentEtiquette, getExerciseEtiquetteLines } from '../utils/etiquette.js';
import { addSavedWorkout, generateSavedWorkoutId } from '../utils/savedWorkouts.js';
import { buildExerciseIconMarkup } from '../utils/iconHelpers.js';
import { machineIcons } from '../data/machineIcons.js';
import { renderCompactCard, attachCompactCardInteractions, renderStickyReassuranceBar } from '../components/compactCard.js';

const GYMXIETY_SUPPORTIVE_CUES = [
  'Choose a weight that feels comfortable.',
  'Move at a pace that feels natural.',
  'You can always take extra rest.'
];

const GYMXIETY_CONFIDENCE_DESCRIPTORS = {
  Easy: 'This one is simple and steady.',
  Moderate: 'Still beginner-friendly, just a bit more movement.'
};

const GOAL_LABELS = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  endurance: 'Endurance',
  weight_loss: 'Weight Loss',
  general: 'General Fitness'
};

const SUMMARY_CARD_TRANSITION_MS = 250;
const DEFAULT_SET_LABEL = '3 sets';
const DEFAULT_REP_LABEL = '10 reps';
const DEFAULT_REST_LABEL = 'Rest 90 sec';
const DEFAULT_CONFIDENCE_LABEL = 'Moderate';
const DEFAULT_INSTRUCTIONS = 'Move slowly, breathe through the hardest part, and stop if form slips.';
const DEFAULT_EXERCISE_REASSURANCE = 'It is okay to pause or adjust the range whenever you need.';
const SWAP_MODAL_MAX_OPTIONS = 8;
const SAVE_TOAST_DURATION_MS = 2200;
const FAVORITE_SWAP_LIMIT = 4;

const EXERCISE_LOOKUP = (() => {
  const map = new Map();
  if (Array.isArray(EXERCISES)) {
    EXERCISES.forEach(entry => {
      const key = normalizeExerciseName(entry?.name || entry?.display_name);
      if (key && !map.has(key)) {
        map.set(key, entry);
      }
    });
  }
  return map;
})();

function formatIntimidationBadge(value) {
  if (!value) {
    return '';
  }
  const token = value.toString().trim();
  if (!token) {
    return '';
  }
  return token.charAt(0).toUpperCase() + token.slice(1);
}

function renderVideoThumbnail(source) {
  if (!source) {
    return '';
  }
  const sanitized = escapeHTML(source);
  if (/^https?:\/\//i.test(source)) {
    return `<div class="compact-card-thumb"><img src="${sanitized}" alt="" loading="lazy" decoding="async"></div>`;
  }
  return `<div class="compact-card-thumb" aria-hidden="true"><span class="supportive-text" style="display:block;padding:0.4rem;">${sanitized}</span></div>`;
}

function renderVideoSection(source) {
  if (!source) {
    return '';
  }
  if (/^https?:\/\//i.test(source)) {
    const sanitized = escapeHTML(source);
    return `
      <div class="exercise-video-placeholder">
        <p class="landing-subtext execution-subhead">Video walk-through</p>
        <a class="video-frame-link" href="${sanitized}" target="_blank" rel="noopener">
          <span>Open tutorial in a new tab</span>
        </a>
      </div>
    `;
  }
  return `
    <div class="exercise-video-placeholder">
      <p class="landing-subtext execution-subhead">Video walk-through</p>
      <p class="supportive-text">${escapeHTML(source)}</p>
    </div>
  `;
}

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

function formatGoalLabel(goalValue) {
  if (!goalValue) {
    return GOAL_LABELS.general;
  }
  const normalized = goalValue.toString().trim().toLowerCase();
  return GOAL_LABELS[normalized] || goalValue;
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

function gatherPlanEquipmentSelections(plan, rows, profile) {
  if (Array.isArray(plan?.selectedEquipment) && plan.selectedEquipment.length) {
    return plan.selectedEquipment;
  }
  const tokens = new Set();
  rows.forEach(row => {
    splitEquipmentList(row?.equipment || '').forEach(token => tokens.add(token));
  });
  if (!tokens.size && profile) {
    splitEquipmentList(profile?.equipment || '').forEach(token => tokens.add(token));
  }
  return Array.from(tokens);
}

function collectMusclesFromRows(rows = []) {
  const set = new Set();
  rows.forEach(row => {
    const muscle = (row?.muscle || '').toString().trim();
    if (muscle) {
      set.add(muscle);
    }
  });
  return Array.from(set);
}

function buildMuscleSet(values = []) {
  const set = new Set();
  values.forEach(value => {
    const token = value?.toString().trim().toLowerCase();
    if (token) {
      set.add(token);
    }
  });
  return set;
}

function filterFavoritesByMuscles(entries = [], muscleSet) {
  if (!muscleSet || !muscleSet.size) {
    return entries;
  }
  return entries.filter(entry => {
    const muscleToken = entry?.muscle?.toString().trim().toLowerCase();
    return muscleToken && muscleSet.has(muscleToken);
  });
}

function buildFavoriteSet(favoriteNames = []) {
  const set = new Set();
  favoriteNames.forEach(name => {
    const key = normalizeExerciseName(name);
    if (key) {
      set.add(key);
    }
  });
  return set;
}

function findExerciseByName(name) {
  if (!name) {
    return null;
  }
  const key = normalizeExerciseName(name);
  if (!key) {
    return null;
  }
  return EXERCISE_LOOKUP.get(key) || null;
}

function resolveFavoriteEntries(favoriteNames = []) {
  if (!Array.isArray(favoriteNames) || !favoriteNames.length) {
    return [];
  }
  return favoriteNames
    .map(label => {
      const storedName = label;
      const match = findExerciseByName(label);
      const muscle = match?.muscle_group || 'Full body';
      const equipmentValue = match?.equipment;
      const equipment = Array.isArray(equipmentValue)
        ? equipmentValue.join(', ')
        : equipmentValue || 'Bodyweight';
      const intimidation = match?.intimidation_level
        ? match.intimidation_level.charAt(0).toUpperCase() + match.intimidation_level.slice(1)
        : '';
      const displayName = match?.display_name || match?.name || storedName;
      return {
        id: normalizeExerciseName(storedName),
        name: displayName,
        storedName,
        muscle,
        equipment,
        intimidation
      };
    })
    .filter(entry => entry?.id);
}

function formatRestTime(row) {
  if (row?.rest) {
    return row.rest;
  }
  return row?.usesWeight ? 'Rest 75-90 sec' : 'Rest 40-60 sec';
}

function renderWorkoutOverviewCard(plan, rows, profile = {}, options = {}) {
  const { sectionClass = '' } = options;
  const sectionClassName = sectionClass ? ` ${sectionClass}` : '';
  const goalValue = plan?.selectedGoal || plan?.goal || profile.goal || 'general';
  const goalLabel = formatGoalLabel(goalValue);
  const equipmentSelections = gatherPlanEquipmentSelections(plan, rows, profile);
  const equipmentLabel = equipmentSelections.length
    ? equipmentSelections.join(', ')
    : collectEquipmentSummary(rows, profile);
  const selectedMuscles = Array.isArray(plan?.selectedMuscleGroups) && plan.selectedMuscleGroups.length
    ? plan.selectedMuscleGroups
    : collectMusclesFromRows(rows);
  const muscleLabel = selectedMuscles.length ? selectedMuscles.join(', ') : 'Full body mix';
  const duration = estimateDuration(rows);
  const timeLabel = duration ? `~${duration} min` : '10-15 min';
  const detailPills = [
    { label: 'Goal', value: goalLabel },
    { label: 'Equipment', value: equipmentLabel },
    { label: 'Muscles', value: muscleLabel }
  ];

  return `
    <section class="landing-section${sectionClassName}">
      <p class="landing-subtext">Workout overview</p>
      <article class="landing-card summary-overview-card">
        <div class="summary-overview-header">
          <div>
            <p class="landing-subtext">Estimated time</p>
            <h2>${escapeHTML(timeLabel)}</h2>
          </div>
          <div>
            <p class="landing-subtext">Exercises</p>
            <h2>${escapeHTML(`${rows.length || 0} moves`)}</h2>
          </div>
        </div>
        <div class="summary-overview-tags">
          ${detailPills
            .map(item => `
              <span class="landing-pill summary-overview-pill">
                <strong>${escapeHTML(item.label)}:</strong> ${escapeHTML(item.value)}
              </span>
            `)
            .join('')}
        </div>
      </article>
    </section>
  `;
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
      usesWeight: false,
      reassurance: DEFAULT_EXERCISE_REASSURANCE
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
    usesWeight: Boolean(row.usesWeight),
    etiquetteTip: row.etiquetteTip || row.etiquette_tip || '',
    reassurance: row.reassurance || DEFAULT_EXERCISE_REASSURANCE,
    machine: row.machine || null
  };
}

function normalizePlanRows(rows = []) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row, index) => normalizeExerciseRow(row, index));
}

export function buildSavedWorkoutPayload(plan, profile = {}) {
  if (!plan || !Array.isArray(plan.planRows)) {
    return null;
  }
  const normalizedRows = normalizePlanRows(plan.planRows).filter(Boolean);
  if (!normalizedRows.length) {
    return null;
  }
  const selectedGoal = plan.selectedGoal || plan.goal || profile.goal || 'general';
  const selectedEquipment = gatherPlanEquipmentSelections(plan, normalizedRows, profile);
  const selectedMuscleGroups = Array.isArray(plan.selectedMuscleGroups) && plan.selectedMuscleGroups.length
    ? plan.selectedMuscleGroups
    : collectMusclesFromRows(normalizedRows);
  const exercises = normalizedRows.map(row => ({
    id: row.id,
    name: row.exercise,
    sets: row.sets || DEFAULT_SET_LABEL,
    reps: row.repRange || row.reps || DEFAULT_REP_LABEL,
    rest: formatRestTime(row),
    equipment: row.equipment || 'Bodyweight',
    muscle_group: row.muscle || 'Full body',
    confidence: row.confidence || DEFAULT_CONFIDENCE_LABEL,
    etiquette_tip: row.etiquetteTip || row.etiquette_tip || '',
    instructions: row.description || DEFAULT_INSTRUCTIONS,
    machine: row.machine || null
  }));
  return {
    id: generateSavedWorkoutId(),
    date: new Date().toISOString(),
    selectedGoal,
    selectedEquipment,
    selectedMuscleGroups,
    gymxietyMode: Boolean(plan.gymxietyMode),
    exercises,
    planRows: normalizedRows,
    summary: plan.summary || null
  };
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
    <header class="summary-hero">
      <span class="landing-tag">Workout summary</span>
      <h1>Your Workout Is Ready</h1>
      <p class="landing-subtext lead">${escapeHTML(subtext)}</p>
      ${supportiveLead}
    </header>
  `;
}

function renderPlanEtiquetteCard(plan, rows, profile = {}, gymxietyMode = false, options = {}) {
  const { sectionClass = '' } = options;
  const sectionClassName = sectionClass ? ` ${sectionClass}` : '';
  const equipmentSelections = gatherPlanEquipmentSelections(plan, rows, profile);
  const etiquetteEntries = collectEquipmentEtiquette(equipmentSelections, { gymxietyMode });
  if (!etiquetteEntries.length) {
    return '';
  }
  const displayEntries = etiquetteEntries.slice(0, 3);
  const intro = gymxietyMode
    ? 'These calm reminders keep the space feeling welcoming.'
    : 'Quick reminders to keep the space friendly for everyone.';
  const listItems = displayEntries
    .map(entry => `
        <li>
          <strong>${escapeHTML(entry.label)}:</strong>
          <span class="supportive-text">${escapeHTML(entry.tip)}</span>
        </li>
      `)
    .join('');
  return `
    <section class="landing-section${sectionClassName}">
      <p class="landing-subtext">Gym Etiquette</p>
      <article class="landing-card">
        <h2>Gym Etiquette for Today's Workout</h2>
        <p class="supportive-text">${escapeHTML(intro)}</p>
        <ul class="landing-list etiquette-list">
          ${listItems}
        </ul>
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
  const { gymxietyMode, favoriteSet } = options;
  const exerciseName = row?.exercise || `Movement ${index + 1}`;
  const exerciseSlug = normalizeExerciseName(exerciseName);
  const isFavorited = favoriteSet?.has(exerciseSlug);
  const instructions = row?.description || 'Move slowly, breathe through the hardest part, and stop if form slips.';
  const restLabel = formatRestTime(row);
  const sets = row?.sets || '3 sets';
  const reps = row?.repRange || '8-12 reps';
  const muscle = row?.muscle || 'Full body';
  const equipment = row?.equipment || 'Bodyweight';
  const confidenceLabel = row?.confidence || 'Moderate';
  const confidenceCopy = resolveConfidenceCopy(confidenceLabel, gymxietyMode);
  const supportiveCues = gymxietyMode
    ? (Array.isArray(row?.supportiveCues) && row.supportiveCues.length ? row.supportiveCues : GYMXIETY_SUPPORTIVE_CUES)
    : [];
  const supportiveCopy = supportiveCues.map(cue => `<p class="supportive-text">${escapeHTML(cue)}</p>`).join('');
  const steadyReminder = gymxietyMode
    ? '<p class="supportive-text">Take your time - focus on slow, controlled movement.</p>'
    : '';
  const reassurance = row?.reassurance || DEFAULT_EXERCISE_REASSURANCE;
  const reassuranceCopy = reassurance
    ? `<p class="supportive-text reassurance-text">${escapeHTML(reassurance)}</p>`
    : '';
  const muscleLabel = `<p class="supportive-text exercise-muscle-label">Targets: ${escapeHTML(muscle)}</p>`;
  const collapsedExtras = `
    <div class="exercise-card-extra">
      <p class="supportive-text">Targets: ${escapeHTML(muscle)}</p>
      <p class="supportive-text">Equipment: ${escapeHTML(equipment)}</p>
    </div>
  `;
  const etiquetteLines = getExerciseEtiquetteLines(row, { gymxietyMode });
  const etiquetteMarkup = etiquetteLines.length
    ? `<div class="exercise-etiquette">${etiquetteLines
        .map(line => `<p class="supportive-text">${escapeHTML(line)}</p>`)
        .join('')}</div>`
    : '';
  const favoriteLabel = isFavorited ? 'Remove from favorites' : 'Add to favorites';
  const favoriteButton = `
      <button
        class="secondary-btn favorite-toggle${isFavorited ? ' is-active' : ''}"
        type="button"
        data-action="favorite-exercise"
        data-exercise-index="${index}"
        data-exercise-name="${escapeHTML(exerciseName)}"
        data-exercise-slug="${escapeHTML(exerciseSlug)}"
        data-favorited="${isFavorited ? 'true' : 'false'}"
      >
        ${escapeHTML(favoriteLabel)}
      </button>
    `;
  const actionButtons = `
    <div class="exercise-card-actions">
      <button class="secondary-btn" type="button" data-action="change-exercise" data-exercise-index="${index}">Change</button>
      ${favoriteButton}
      <button class="subtle-link" type="button" data-action="dislike-exercise" data-exercise-index="${index}">Don't show this exercise again</button>
    </div>
  `;
  const canSwap = canUseConfidenceAlternative(row);
  const easierLink = canSwap
    ? `<button class="easier-btn" type="button" data-action="confidence-alt" data-exercise-index="${index}">Need an easier version?</button>`
    : '';
  const iconMarkup = buildExerciseIconMarkup(
    { exerciseName, muscle, equipment, machine: row?.machine },
    machineIcons
  );
  const whyCopy = row?.whyThisExercise;
  const whySection = whyCopy
    ? `
        <div class="execution-subsection">
          <p class="landing-subtext execution-subhead">Why this exercise</p>
          <p>${escapeHTML(whyCopy)}</p>
        </div>
      `
    : '';
  const feelingCopy = row?.howItShouldFeel;
  const feelingSection = feelingCopy
    ? `
        <div class="execution-subsection">
          <p class="landing-subtext execution-subhead">How it should feel</p>
          <p>${escapeHTML(feelingCopy)}</p>
        </div>
      `
    : '';
  const mistakeCopy = row?.commonMistakes;
  const mistakeSection = mistakeCopy
    ? `
        <div class="execution-subsection">
          <p class="landing-subtext execution-subhead">Common mistake</p>
          <p>${escapeHTML(mistakeCopy)}</p>
        </div>
      `
    : '';
  const badgeLabel = formatIntimidationBadge(row?.intimidation || row?.intimidation_level || row?.intimidationLevel);
  const badges = badgeLabel ? [`Intimidation: ${escapeHTML(badgeLabel)}`] : [];
  const videoThumb = renderVideoThumbnail(row?.videoPlaceholder);
  const videoExpanded = renderVideoSection(row?.videoPlaceholder);
  const collapsedMeta = [
    `${escapeHTML(sets)} · ${escapeHTML(reps)}`,
    escapeHTML(restLabel)
  ];
  const expandedContent = `
    ${confidenceCopy ? `<span class="confidence-tag">${escapeHTML(confidenceCopy)}</span>` : ''}
    <p>${escapeHTML(instructions)}</p>
    ${whySection}
    ${feelingSection}
    ${mistakeSection}
    ${reassuranceCopy}
    ${supportiveCopy}
    ${steadyReminder}
    ${videoExpanded}
    ${muscleLabel}
    <div class="landing-pill-list">
      <span class="landing-pill">${escapeHTML(muscle)}</span>
      <span class="landing-pill">${escapeHTML(equipment)}</span>
    </div>
    ${etiquetteMarkup}
    ${actionButtons}
    ${easierLink}
  `;
  return renderCompactCard({
    id: `summary-exercise-${index}`,
    title: exerciseName,
    subtitle: `${muscle} · ${equipment}`,
    icon: iconMarkup,
    badges,
    media: videoThumb,
    meta: collapsedMeta,
    collapsedExtras,
    expandedContent,
    className: 'fade-transition exercise-card',
    attributes: {
      'data-exercise-card': true,
      'data-exercise-index': index
    }
  });
}

function renderExercisesSection(rows, options = {}) {
  const { sectionClass = '', title = 'Exercises' } = options;
  const cards = rows.map((row, index) => renderExerciseCard(row, index, options));
  const sectionClassName = sectionClass ? ` ${sectionClass}` : '';
  return `
    <section class="landing-section${sectionClassName}">
      <p class="landing-subtext">${escapeHTML(title)}</p>
      ${renderStickyReassuranceBar()}
      <div class="compact-grid">
        ${cards.join('')}
      </div>
    </section>
  `;
}

function renderFavoriteCard(entry) {
  const intimidation = entry?.intimidation ? ` · ${escapeHTML(entry.intimidation)}` : '';
  const expandedContent = `
    <p class="supportive-text">${escapeHTML(entry.equipment || 'Bodyweight')}${intimidation}</p>
    <button class="subtle-link" type="button" data-action="remove-favorite" data-favorite-name="${escapeHTML(entry.storedName)}">
      Remove from favorites
    </button>
  `;
  return renderCompactCard({
    id: `favorite-${entry.id}`,
    title: entry.name,
    subtitle: entry.muscle || 'Full body',
    expandedContent,
    className: 'fade-transition',
    attributes: { 'data-favorite-card': true }
  });
}

function renderFavoritesSection(entries = []) {
  const hasEntries = Array.isArray(entries) && entries.length > 0;
  const countLabel = hasEntries
    ? (entries.length === 1 ? '1 favorite saved' : `${entries.length} favorites saved`)
    : '';
  const cards = hasEntries ? entries.map(renderFavoriteCard).join('') : '';
  const hiddenAttr = hasEntries ? '' : ' hidden';
  return `
    <section class="landing-section summary-spacing-md summary-favorites-section" data-favorites-section${hiddenAttr}>
      <div class="summary-favorites-header">
        <p class="landing-subtext">Favorite exercises</p>
        <p class="supportive-text" data-favorites-count>${escapeHTML(countLabel)}</p>
      </div>
      <div class="compact-grid" data-favorites-list>
        ${cards}
      </div>
    </section>
  `;
}

function renderCtaSection(options = {}) {
  const { sectionClass = '' } = options;
  const sectionClassName = sectionClass ? ` ${sectionClass}` : '';
  return `
    <section class="landing-section${sectionClassName}">
      <p class="landing-subtext">Ready to move?</p>
      <div class="landing-actions landing-actions-stack summary-cta-actions">
        <button class="landing-button" type="button" data-action="start-workout">Start Workout</button>
        <button class="landing-button secondary" type="button" data-action="save-workout">Save Workout</button>
        <a class="landing-button secondary" href="#/generate">Generate Another Workout</a>
      </div>
      <div class="save-toast" data-save-toast hidden>Workout saved!</div>
      <div class="save-toast" data-favorite-toast hidden></div>
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

function renderSwapModalShell() {
  return `
    <div class="swap-modal" data-swap-modal hidden aria-hidden="true">
      <div class="swap-modal-backdrop" data-modal-dismiss></div>
      <div class="swap-modal-card" role="dialog" aria-modal="true" aria-labelledby="swap-modal-title">
        <header class="swap-modal-header">
          <div>
            <p class="landing-subtext">Need a tweak?</p>
            <h2 id="swap-modal-title">Choose a replacement</h2>
          </div>
          <button class="swap-modal-close" type="button" aria-label="Close swap dialog" data-modal-dismiss>&times;</button>
        </header>
        <div class="swap-modal-list modal-grid" data-swap-list></div>
      </div>
    </div>
  `;
}

function buildDislikedSet(list = []) {
  const set = new Set();
  list.forEach(name => {
    const key = normalizeExerciseName(name);
    if (key) {
      set.add(key);
    }
  });
  return set;
}

function normalizeEquipmentToken(value = '') {
  return value.toString().trim().toLowerCase();
}

function buildEquipmentSet(values = []) {
  const set = new Set();
  values.forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(entry => {
        const key = normalizeEquipmentToken(entry);
        if (key) {
          set.add(key);
        }
      });
      return;
    }
    const key = normalizeEquipmentToken(value);
    if (key) {
      set.add(key);
    }
  });
  return set;
}

function matchesEquipmentRequirement(exercise = {}, equipmentSet) {
  if (!equipmentSet || !equipmentSet.size) {
    return true;
  }
  const requirement = Array.isArray(exercise.equipment) && exercise.equipment.length
    ? exercise.equipment
    : exercise.equipment
      ? [exercise.equipment]
      : ['Bodyweight'];
  return requirement.every(item => equipmentSet.has(normalizeEquipmentToken(item)));
}

function filterExercisesBySource(source = [], normalizedMuscle = '', filters = {}) {
  if (!Array.isArray(source) || !source.length) {
    return [];
  }
  const { equipmentSet, dislikedSet, avoidSet, gymxietyMode } = filters;
  return source.filter(entry => {
    const muscle = (entry?.muscle_group || '').toString().trim().toLowerCase();
    if (muscle !== normalizedMuscle) {
      return false;
    }
    const key = normalizeExerciseName(entry?.name);
    if (!key) {
      return false;
    }
    if (dislikedSet?.has(key) || avoidSet?.has(key)) {
      return false;
    }
    if (gymxietyMode && entry?.gymxiety_safe !== true) {
      return false;
    }
    if (!matchesEquipmentRequirement(entry, equipmentSet)) {
      return false;
    }
    return true;
  });
}

function mapExercisesToOptions(candidates = [], goalKey = 'general', gymxietyMode = false) {
  if (!candidates.length) {
    return [];
  }
  const options = [];
  const seen = new Set();
  for (let i = 0; i < candidates.length && options.length < SWAP_MODAL_MAX_OPTIONS; i += 1) {
    const candidate = candidates[i];
    const key = normalizeExerciseName(candidate?.name);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    const prescribed = applyGoalPrescription(candidate, goalKey, gymxietyMode);
    const rows = buildPlanRowsFromExercises([prescribed], gymxietyMode) || [];
    if (!rows.length) {
      continue;
    }
    options.push({ exercise: prescribed, row: rows[0] });
  }
  return options;
}

function buildAlternativeOptions(plan, targetRow, options = {}) {
  if (!plan || !targetRow) {
    return [];
  }
  const targetMuscle = (targetRow?.muscle || '').toString().trim();
  if (!targetMuscle) {
    return [];
  }
  const normalizedMuscle = targetMuscle.toLowerCase();
  const equipmentSelection = resolveEquipmentSelection(plan, targetRow, options.profile);
  const equipmentSet = buildEquipmentSet(equipmentSelection);
  const dislikedSet = buildDislikedSet(options.dislikedExercises || []);
  const avoidSet = buildDislikedSet(options.avoidNames || []);
  const gymxietyMode = Boolean(options.gymxietyMode);
  let candidates = filterExercisesBySource(EXERCISES, normalizedMuscle, {
    equipmentSet,
    dislikedSet,
    avoidSet,
    gymxietyMode
  });
  if (!candidates.length) {
    candidates = filterExercisesBySource(DEFAULT_BEGINNER_WORKOUT, normalizedMuscle, {
      equipmentSet: null,
      dislikedSet,
      avoidSet,
      gymxietyMode
    });
  }
  if (!candidates.length) {
    return [];
  }
  const goalKey = plan.selectedGoal || 'general';
  return mapExercisesToOptions(candidates, goalKey, gymxietyMode);
}

function buildFavoriteSwapOptions(plan, targetRow, options = {}) {
  if (!plan || !targetRow) {
    return [];
  }
  const favoriteNames = getFavoriteExercises();
  if (!Array.isArray(favoriteNames) || !favoriteNames.length) {
    return [];
  }
  const normalizedMuscle = (targetRow?.muscle || '').toString().trim().toLowerCase();
  const equipmentSelection = resolveEquipmentSelection(plan, targetRow, options.profile);
  const equipmentSet = buildEquipmentSet(equipmentSelection);
  const avoidNames = Array.isArray(options.avoidNames) ? options.avoidNames : [];
  const avoidSet = new Set(avoidNames.map(name => normalizeExerciseName(name)).filter(Boolean));
  const gymxietyMode = Boolean(options.gymxietyMode);
  const goalKey = plan.selectedGoal || 'general';
  const results = [];
  favoriteNames.forEach(name => {
    if (results.length >= FAVORITE_SWAP_LIMIT) {
      return;
    }
    const match = findExerciseByName(name);
    if (!match) {
      return;
    }
    const slug = normalizeExerciseName(match.name || name);
    if (!slug || avoidSet.has(slug)) {
      return;
    }
    const matchMuscle = (match.muscle_group || '').toString().trim().toLowerCase();
    if (normalizedMuscle && matchMuscle && matchMuscle !== normalizedMuscle) {
      return;
    }
    if (!matchesEquipmentRequirement(match, equipmentSet)) {
      return;
    }
    const prescribed = applyGoalPrescription(match, goalKey, gymxietyMode);
    const rows = buildPlanRowsFromExercises([prescribed], gymxietyMode) || [];
    if (!rows.length) {
      return;
    }
    results.push({ exercise: prescribed, row: rows[0], isFavorite: true });
  });
  return results;
}

function renderSwapOptionCard(option, index, { gymxietyMode }) {
  const row = option?.row;
  if (!row) {
    return '';
  }
  const repDetails = row.timeBased ? `Time: ${row.repRange}` : `${row.repRange}`;
  const favoriteBadge = option?.isFavorite ? '<span class="swap-option-badge">Favorite</span>' : '';
  const confidenceBadge = gymxietyMode && row.confidence
    ? `<span class="swap-option-badge swap-option-badge--calm">Calm: ${escapeHTML(row.confidence)}</span>`
    : '';
  const iconMarkup = buildExerciseIconMarkup(
    { exerciseName: row.exercise, muscle: row.muscle, equipment: row.equipment, machine: row.machine },
    machineIcons
  );
  return `
    <div class="swap-flat-card" data-swap-flat-card>
      <div class="swap-flat-header">
        <div class="swap-flat-icon">${iconMarkup}</div>
        <div class="swap-flat-info">
          <p class="swap-flat-name">${escapeHTML(row.exercise)}</p>
          <p class="swap-flat-meta">${escapeHTML(row.muscle)} · ${escapeHTML(row.equipment)}</p>
          <p class="swap-flat-reps">${escapeHTML(row.sets || DEFAULT_SET_LABEL)} · ${escapeHTML(repDetails || DEFAULT_REP_LABEL)}</p>
        </div>
      </div>
      ${favoriteBadge || confidenceBadge ? `<div class="swap-flat-badges">${favoriteBadge}${confidenceBadge}</div>` : ''}
      <button class="landing-button" type="button" data-action="apply-swap" data-swap-option="${index}">Use this exercise</button>
    </div>
  `;
}

function renderSwapEmptyState(muscle) {
  const target = muscle ? ` for ${escapeHTML(muscle)}` : '';
  return `
    <div class="swap-option-empty">
      <p>No alternatives matched those filters${target}.</p>
      <p class="supportive-text">Try adjusting equipment or regenerate from the planner.</p>
    </div>
  `;
}

function normalizeExerciseName(value) {
  return value?.toString().trim().toLowerCase() || '';
}

function splitEquipmentList(value = '') {
  return value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

function resolveEquipmentSelection(plan, row, profile = {}) {
  if (Array.isArray(plan?.selectedEquipment) && plan.selectedEquipment.length) {
    return plan.selectedEquipment;
  }
  const profileEquipment = splitEquipmentList(profile?.equipment || '');
  if (profileEquipment.length) {
    return profileEquipment;
  }
  const rowEquipment = splitEquipmentList(row?.equipment || '');
  if (rowEquipment.length) {
    return rowEquipment;
  }
  return ['Bodyweight'];
}

function buildAvoidNameList(planRows = [], skipIndex = -1) {
  return planRows
    .map((entry, index) => (index === skipIndex ? '' : normalizeExerciseName(entry?.exercise)))
    .filter(Boolean);
}

function applyReplacementToState(index, row, replacementExercise, targetId) {
  let updated = false;
  setState(prev => {
    const plan = prev.ui?.plannerResult;
    if (!plan || !Array.isArray(plan.planRows) || !plan.planRows[index]) {
      return prev;
    }
    const planRows = plan.planRows.map((entry, entryIndex) =>
      entryIndex === index ? { ...row } : { ...entry }
    );
    const exercises = Array.isArray(plan.exercises)
      ? plan.exercises.map((entry, entryIndex) =>
          entryIndex === index ? { ...replacementExercise } : { ...entry }
        )
      : plan.exercises;
    const nextPlan = { ...plan, planRows, exercises };
    const nextUi = { ...prev.ui, plannerResult: nextPlan };
    if (nextUi.activeWorkout && Array.isArray(nextUi.activeWorkout.planRows)) {
      const activeRows = nextUi.activeWorkout.planRows.map((entry, entryIndex) =>
        entryIndex === index ? { ...row } : { ...entry }
      );
      const activePlan = { ...nextUi.activeWorkout, planRows: activeRows };
      if (Array.isArray(activePlan.exercises)) {
        activePlan.exercises = activePlan.exercises.map((entry, entryIndex) =>
          entryIndex === index ? { ...replacementExercise } : { ...entry }
        );
      }
      nextUi.activeWorkout = activePlan;
    }
    prev.ui = nextUi;
    if (Array.isArray(prev.currentPlan)) {
      prev.currentPlan = prev.currentPlan.map(entry =>
        entry.id === targetId
          ? { ...entry, name: row.exercise, usesWeight: row.usesWeight }
          : entry
      );
    }
    updated = true;
    return prev;
  });
  return updated;
}

function animateExerciseCardSwap(root, index, row, options = {}) {
  const targetCard = root.querySelector(`[data-exercise-card][data-exercise-index="${index}"]`);
  if (!targetCard) {
    return;
  }
  const renderOptions = {
    ...options,
    favoriteSet: options.favoriteSet || buildFavoriteSet(getFavoriteExercises())
  };
  targetCard.classList.remove('visible');
  window.setTimeout(() => {
    targetCard.outerHTML = renderExerciseCard(row, index, renderOptions);
    const nextCard = root.querySelector(`[data-exercise-card][data-exercise-index="${index}"]`);
    if (nextCard) {
      requestAnimationFrame(() => nextCard.classList.add('visible'));
    }
  }, SUMMARY_CARD_TRANSITION_MS);
}

export function renderWorkoutSummaryPage(state) {
  let isLoading = true;
  const plan = state.ui?.plannerResult;
  const rows = Array.isArray(plan?.planRows) ? plan.planRows.filter(Boolean) : [];
  const normalizedRows = normalizePlanRows(rows);
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

  const favoriteNames = getFavoriteExercises();
  const favoriteSet = buildFavoriteSet(favoriteNames);
  const favoriteEntries = resolveFavoriteEntries(favoriteNames);

  const planMuscles = collectMusclesFromRows(normalizedRows);
  const planMuscleSet = buildMuscleSet(planMuscles);

  const sections = `
    ${renderHeader(firstName, true, goalText, gymxietyMode)}
    ${renderPlanEtiquetteCard(plan, normalizedRows, state.profile || {}, gymxietyMode, {
      sectionClass: 'summary-spacing-lg summary-etiquette-section'
    })}
    ${renderWorkoutOverviewCard(plan, normalizedRows, state.profile || {}, {
      sectionClass: 'summary-spacing-md'
    })}
    ${renderExercisesSection(normalizedRows, {
      gymxietyMode,
      favoriteSet,
      sectionClass: 'summary-spacing-md summary-exercises-section',
      title: 'Exercise rundown'
    })}
    ${renderFavoritesSection(filterFavoritesByMuscles(favoriteEntries, planMuscleSet))}
    ${renderCtaSection({
      sectionClass: 'summary-spacing-md summary-cta-section'
    })}
    ${renderSwapModalShell()}
  `;

  return renderPageShell(sections, { isLoading });
}

export function attachWorkoutSummaryEvents(root, state) {
  const gymxietyMode = computeGymxietyMode(state.ui?.plannerResult, state.profile);
  attachCompactCardInteractions(root);
  const cards = root.querySelectorAll('[data-exercise-card]');
  cards.forEach(card => requestAnimationFrame(() => card.classList.add('visible')));
  const saveButton = root.querySelector('[data-action="save-workout"]');
  const saveToast = root.querySelector('[data-save-toast]');
  const favoriteToast = root.querySelector('[data-favorite-toast]');
  let saveToastTimer = null;
  let favoriteToastTimer = null;

  const showSaveToast = () => {
    if (!saveToast) {
      return;
    }
    saveToast.hidden = false;
    saveToast.classList.add('visible');
    if (saveToastTimer) {
      window.clearTimeout(saveToastTimer);
    }
    saveToastTimer = window.setTimeout(() => {
      saveToast.classList.remove('visible');
      saveToast.hidden = true;
    }, SAVE_TOAST_DURATION_MS);
  };

  const showFavoriteToast = (message) => {
    if (!favoriteToast) {
      return;
    }
    favoriteToast.textContent = message || '';
    favoriteToast.hidden = false;
    favoriteToast.classList.add('visible');
    if (favoriteToastTimer) {
      window.clearTimeout(favoriteToastTimer);
    }
    favoriteToastTimer = window.setTimeout(() => {
      favoriteToast.classList.remove('visible');
      favoriteToast.hidden = true;
    }, SAVE_TOAST_DURATION_MS);
  };

  const handleSaveWorkout = () => {
    const latestState = getState();
    const plan = latestState.ui?.plannerResult;
    const payload = buildSavedWorkoutPayload(plan, latestState.profile || {});
    if (!payload) {
      console.warn('No workout available to save.');
      return;
    }
    addSavedWorkout(payload);
    showSaveToast();
  };

  saveButton?.addEventListener('click', handleSaveWorkout);

  const swapModal = root.querySelector('[data-swap-modal]');
  const swapList = swapModal?.querySelector('[data-swap-list]');
  const swapModalState = {
    index: null,
    options: [],
    targetId: null
  };

  const refreshFavoritesSection = () => {
    const section = root.querySelector('[data-favorites-section]');
    if (!section) {
      return;
    }
    const listNode = section.querySelector('[data-favorites-list]');
    const countNode = section.querySelector('[data-favorites-count]');
    const latestState = getState();
    const planRows = latestState.ui?.plannerResult?.planRows || [];
    const muscleSet = buildMuscleSet(collectMusclesFromRows(planRows));
    const favoriteNames = getFavoriteExercises();
    const entries = filterFavoritesByMuscles(resolveFavoriteEntries(favoriteNames), muscleSet);
    const hasEntries = entries.length > 0;
    section.hidden = !hasEntries;
    if (!hasEntries) {
      if (listNode) {
        listNode.innerHTML = '';
      }
      if (countNode) {
        countNode.textContent = '';
      }
      return;
    }
    if (listNode) {
      listNode.innerHTML = entries.map(renderFavoriteCard).join('');
    }
    if (countNode) {
      countNode.textContent = entries.length === 1
        ? '1 favorite saved'
        : `${entries.length} favorites saved`;
    }
  };

  const syncFavoriteButtons = () => {
    const favoriteSet = buildFavoriteSet(getFavoriteExercises());
    root.querySelectorAll('[data-action="favorite-exercise"]').forEach(button => {
      const slug = button.getAttribute('data-exercise-slug');
      const isFavorited = slug && favoriteSet.has(slug);
      button.dataset.favorited = isFavorited ? 'true' : 'false';
      button.textContent = isFavorited ? 'Remove from favorites' : 'Add to favorites';
      button.classList.toggle('is-active', Boolean(isFavorited));
    });
  };

  refreshFavoritesSection();
  syncFavoriteButtons();

  const closeSwapModal = () => {
    if (!swapModal) {
      return;
    }
    swapModal.classList.remove('visible');
    swapModal.setAttribute('aria-hidden', 'true');
    swapModal.hidden = true;
    swapModalState.index = null;
    swapModalState.options = [];
    swapModalState.targetId = null;
  };

  const openSwapModalForIndex = (index, action) => {
    if (!swapModal || !swapList) {
      return false;
    }
    const latestState = getState();
    const plan = latestState.ui?.plannerResult;
    if (!plan || !Array.isArray(plan.planRows) || !plan.planRows[index]) {
      return false;
    }
    const targetRow = plan.planRows[index];
    const dislikedList = action === 'dislike'
      ? addDislikedExercise(targetRow.exercise)
      : getDislikedExercises();
    const avoidNames = [...buildAvoidNameList(plan.planRows, index), targetRow.exercise];
    const favoriteOptions = buildFavoriteSwapOptions(plan, targetRow, {
      profile: latestState.profile,
      gymxietyMode,
      avoidNames
    });
    const extendedAvoidNames = [
      ...avoidNames,
      ...favoriteOptions.map(option => option?.row?.exercise).filter(Boolean)
    ];
    const suggestions = buildAlternativeOptions(plan, targetRow, {
      profile: latestState.profile,
      gymxietyMode,
      dislikedExercises: dislikedList,
      avoidNames: extendedAvoidNames
    });
    const combinedOptions = [...favoriteOptions, ...suggestions];
    swapModalState.index = index;
    swapModalState.targetId = targetRow.id ?? index;
    swapModalState.options = combinedOptions;
    const favoriteMarkup = favoriteOptions.length
      ? `
          <div class="swap-option-group">
            <p class="swap-group-label" style="margin:12px 0 6px;font-weight:600;">Your favorites</p>
            <div class="compact-grid">
              ${favoriteOptions
                .map((option, optionIndex) => renderSwapOptionCard(option, optionIndex, { gymxietyMode }))
                .join('')}
            </div>
          </div>
        `
      : '';
    const suggestionMarkup = suggestions.length
      ? `
          <div class="swap-option-group">
            ${favoriteOptions.length ? '<p class="swap-group-label" style="margin:12px 0 6px;font-weight:600;">Suggested swaps</p>' : ''}
            <div class="compact-grid">
              ${suggestions
                .map((option, optionIndex) =>
                  renderSwapOptionCard(option, favoriteOptions.length + optionIndex, { gymxietyMode })
                )
                .join('')}
            </div>
          </div>
        `
      : '';
    const combinedMarkup = `${favoriteMarkup}${suggestionMarkup}`;
    swapList.innerHTML = combinedOptions.length
      ? combinedMarkup
      : renderSwapEmptyState(targetRow.muscle);
    swapModal.hidden = false;
    swapModal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => swapModal.classList.add('visible'));
    return true;
  };

  const handleSwapSelection = optionIndex => {
    if (swapModalState.index === null) {
      return;
    }
    const option = swapModalState.options[optionIndex];
    if (!option) {
      return;
    }
    const targetId = swapModalState.targetId ?? swapModalState.index;
    const normalizedRow = { ...option.row, id: targetId };
    const applied = applyReplacementToState(swapModalState.index, normalizedRow, option.exercise, targetId);
    if (!applied) {
      return;
    }
    const refreshedState = getState();
    state.ui = refreshedState.ui;
    animateExerciseCardSwap(root, swapModalState.index, normalizedRow, { gymxietyMode });
    closeSwapModal();
  };

  if (swapModal) {
    swapModal.addEventListener('click', event => {
      if (event.target.closest('[data-modal-dismiss]')) {
        closeSwapModal();
        return;
      }
      const optionTrigger = event.target.closest('[data-action="apply-swap"]');
      if (!optionTrigger) {
        return;
      }
      const optionIndex = Number.parseInt(optionTrigger.dataset.swapOption, 10);
      if (!Number.isFinite(optionIndex)) {
        return;
      }
      handleSwapSelection(optionIndex);
    });
  }

  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && swapModal && !swapModal.hidden) {
      closeSwapModal();
    }
  });

  root.addEventListener('click', event => {
    const confidenceTrigger = event.target.closest('[data-action="confidence-alt"]');
    if (confidenceTrigger) {
      const index = Number.parseInt(confidenceTrigger.dataset.exerciseIndex, 10);
      if (!Number.isFinite(index)) {
        return;
      }
      confidenceTrigger.disabled = true;
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
        confidenceTrigger.disabled = false;
        return;
      }
      const refreshedState = getState();
      state.ui = refreshedState.ui;
      const targetCard = root.querySelector(`[data-exercise-card][data-exercise-index="${index}"]`);
      if (targetCard) {
        targetCard.classList.remove('visible');
        window.setTimeout(() => {
          const renderOptions = { gymxietyMode, favoriteSet: buildFavoriteSet(getFavoriteExercises()) };
          targetCard.outerHTML = renderExerciseCard(updatedRow, index, renderOptions);
          const nextCard = root.querySelector(`[data-exercise-card][data-exercise-index="${index}"]`);
          if (nextCard) {
            requestAnimationFrame(() => nextCard.classList.add('visible'));
          }
        }, SUMMARY_CARD_TRANSITION_MS);
      }
      return;
    }

    const favoriteTrigger = event.target.closest('[data-action="favorite-exercise"]');
    if (favoriteTrigger) {
      event.preventDefault();
      event.stopPropagation();
      const index = Number.parseInt(favoriteTrigger.dataset.exerciseIndex, 10);
      const latestState = getState();
      const plan = latestState.ui?.plannerResult;
      const row = Number.isFinite(index) && Array.isArray(plan?.planRows) ? plan.planRows[index] : null;
      const exerciseName = row?.exercise || favoriteTrigger.getAttribute('data-exercise-name');
      if (!exerciseName) {
        return;
      }
      const isFavorited = favoriteTrigger.dataset.favorited === 'true';
      if (isFavorited) {
        removeFavoriteExercise(exerciseName);
        favoriteTrigger.textContent = 'Add to favorites';
        favoriteTrigger.dataset.favorited = 'false';
        favoriteTrigger.classList.remove('is-active');
        showFavoriteToast(`Removed from favorites`);
      } else {
        addFavoriteExercise(exerciseName);
        favoriteTrigger.textContent = 'Remove from favorites';
        favoriteTrigger.dataset.favorited = 'true';
        favoriteTrigger.classList.add('is-active');
        showFavoriteToast(`${exerciseName} added to favorites`);
      }
      refreshFavoritesSection();
      syncFavoriteButtons();
      return;
    }

    const removeFavoriteTrigger = event.target.closest('[data-action="remove-favorite"]');
    if (removeFavoriteTrigger) {
      const targetName = removeFavoriteTrigger.getAttribute('data-favorite-name');
      if (!targetName) {
        return;
      }
      removeFavoriteExercise(targetName);
      refreshFavoritesSection();
      syncFavoriteButtons();
      return;
    }

    const changeTrigger = event.target.closest('[data-action="change-exercise"]');
    if (changeTrigger) {
      const index = Number.parseInt(changeTrigger.dataset.exerciseIndex, 10);
      if (!Number.isFinite(index)) {
        return;
      }
      openSwapModalForIndex(index, 'change');
      return;
    }

    const dislikeTrigger = event.target.closest('[data-action="dislike-exercise"]');
    if (dislikeTrigger) {
      const index = Number.parseInt(dislikeTrigger.dataset.exerciseIndex, 10);
      if (!Number.isFinite(index)) {
        return;
      }
      openSwapModalForIndex(index, 'dislike');
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
        prev.ui.activeWorkoutSavedEntry = null;
        prev.ui.activeWorkoutFeedback = {};
        return prev;
      });
      window.location.hash = '#/workout';
    });
  }
}
