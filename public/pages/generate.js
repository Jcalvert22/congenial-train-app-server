import { escapeHTML } from '../utils/helpers.js';
import { renderPageShell } from '../components/stateCards.js';
import { getState } from '../logic/state.js';
import { storePlannerResult } from '../logic/workout.js';
import { generateWorkout } from '../utils/generateWorkout.js';
import { EQUIPMENT_LIST, MUSCLE_GROUPS } from '../data/exercises.js';
import { MUSCLE_PAIRINGS } from '../data/musclePairings.js';
import { getGymxietyPreference, persistGymxietyPreference } from '../utils/gymxiety.js';
import { getDislikedExercises } from '../utils/dislikedExercises.js';
import { loadOnboardingPrefs, deriveComfortFromExperience } from '../utils/onboarding.js';

const EQUIPMENT_HELPER_LOCKED = 'Pick at least one option to keep the plan realistic.';
const MUSCLE_HELPER_LOCKED = 'Choose equipment first to unlock muscle targets.';
const MUSCLE_HELPER_READY = 'Tap every muscle you want to nudge today.';
const GOAL_OPTIONS = [
  { label: 'Strength', value: 'strength' },
  { label: 'Hypertrophy', value: 'hypertrophy' },
  { label: 'Endurance', value: 'endurance' },
  { label: 'Weight Loss', value: 'weight_loss' },
  { label: 'General Fitness', value: 'general' }
];
const DEFAULT_GOAL = 'general';
const MUSCLE_PAIRING_ALIASES = {
  quads: 'legs'
};

const GYMXIETY_PREVIEW_POINTS = [
  'Complex barbell lifts become simple, stable alternatives',
  'Heavy free-weight movements become machine-based options',
  'Technical cues become easy, supportive guidance',
  'Volume adjusts to a pace that feels manageable'
];

const GYMXIETY_DIFFERENTIATORS = [
  'Confidence-based exercise selection',
  'Easier alternatives for intimidating movements',
  'Supportive microcopy throughout your workout',
  'Calmer transitions and pacing',
  'Beginner-friendly instructions',
  'No pressure, no jargon, no judgment'
];

const COMFORT_OPTIONS = [
  { label: 'Low', value: 'low', helper: 'Stick with machines and ultra-stable moves.' },
  { label: 'Medium', value: 'medium', helper: 'Use the usual calm mix.' },
  { label: 'High', value: 'high', helper: 'Open to slightly more challenging variations.' }
];
const DEFAULT_COMFORT_LEVEL = 'medium';
const COMFORT_VALUES = COMFORT_OPTIONS.map(option => option.value);

const normalizeComfortSelection = value => {
  const token = (value || '').toString().trim().toLowerCase();
  return COMFORT_VALUES.includes(token) ? token : DEFAULT_COMFORT_LEVEL;
};

function renderHeader() {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Planner</span>
        <h1>Generate Your Workout</h1>
        <p class="landing-subtext lead">Pick what you have and what you want to train. We always match those picks.</p>
        <p class="supportive-text reassurance-text">Your plan adapts to your comfort level. Go at your own pace.</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Calm reminder</p>
        <p>Short, confident sessions beat marathon workouts. Three steady moves is enough.</p>
      </div>
    </header>
  `;
}

function renderChecklist(list, fieldName, selectedValues = [], disabled = false) {
  return `
    <div class="equipment-list" data-checklist="${escapeHTML(fieldName)}">
      ${list
        .map(item => {
          const checked = selectedValues.includes(item) ? 'checked' : '';
          const lock = disabled ? 'disabled' : '';
          return `
            <label class="equipment-item">
              <input type="checkbox" name="${escapeHTML(fieldName)}" value="${escapeHTML(item)}" ${checked} ${lock}>
              <span>${escapeHTML(item)}</span>
            </label>
          `;
        })
        .join('')}
    </div>
  `;
}

function formatPairingText(pairings = []) {
  return pairings
    .map(value => {
      if (!value) {
        return '';
      }
      if (value.toLowerCase() === 'any') {
        return 'Any muscle';
      }
      return value.charAt(0).toUpperCase() + value.slice(1);
    })
    .filter(Boolean)
    .join(', ');
}

function resolvePairingsForMuscle(muscleName = '') {
  const normalized = muscleName.toString().trim().toLowerCase();
  if (!normalized) {
    return [];
  }
  if (MUSCLE_PAIRINGS[normalized]) {
    return MUSCLE_PAIRINGS[normalized];
  }
  const alias = MUSCLE_PAIRING_ALIASES[normalized];
  return alias ? MUSCLE_PAIRINGS[alias] || [] : [];
}

function renderMuscleChecklist(list, selectedValues = [], disabled = false) {
  return `
    <div class="equipment-list" data-checklist="muscles">
      ${list
        .map(item => {
          const normalized = item.toString().trim().toLowerCase();
          const pairings = resolvePairingsForMuscle(normalized);
          const hasPairings = pairings.length > 0;
          const isChecked = selectedValues.includes(item);
          const checked = isChecked ? 'checked' : '';
          const lock = disabled ? 'disabled' : '';
          const pairingLabel = hasPairings ? formatPairingText(pairings) : '';
          const shouldShowPairing = isChecked && !disabled;
          const pairingMarkup = hasPairings
            ? `<span class="muscle-pairing-footer" data-muscle-pairing="${escapeHTML(normalized)}"${shouldShowPairing ? '' : ' hidden'}>Recommended: ${escapeHTML(pairingLabel)}</span>`
            : '';
          return `
            <label class="equipment-item muscle-card" data-muscle-card="${escapeHTML(normalized)}">
              <input type="checkbox" name="muscles" value="${escapeHTML(item)}" ${checked} ${lock}>
              <span class="muscle-card-name">${escapeHTML(item)}</span>
              ${pairingMarkup}
            </label>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderGoalSelector(selectedGoal = DEFAULT_GOAL) {
  return `
    <fieldset class="generate-step" data-goal-step>
      <legend class="landing-subtext">Step 3 · Goal for today</legend>
      <p class="landing-subtext">We tailor reps, sets, and pacing to this goal.</p>
      <div class="goal-selector" role="radiogroup">
        ${GOAL_OPTIONS.map(option => {
          const checked = option.value === selectedGoal ? 'checked' : '';
          return `
            <label class="goal-chip">
              <input type="radio" name="goal" value="${escapeHTML(option.value)}" ${checked}>
              <span>${escapeHTML(option.label)}</span>
            </label>
          `;
        }).join('')}
      </div>
    </fieldset>
  `;
}

function renderComfortSelector(selectedComfort = DEFAULT_COMFORT_LEVEL) {
  const normalized = normalizeComfortSelection(selectedComfort);
  return `
    <fieldset class="generate-step" data-comfort-step>
      <legend class="landing-subtext">Confidence level</legend>
      <div class="confidence-pill-row" role="radiogroup">
        ${COMFORT_OPTIONS.map(option => {
          const checked = option.value === normalized ? 'checked' : '';
          return `
            <label class="confidence-pill" data-comfort-option="${escapeHTML(option.value)}">
              <input type="radio" name="comfort-level" value="${escapeHTML(option.value)}" ${checked}>
              <span>${escapeHTML(option.label)}</span>
            </label>
          `;
        }).join('')}
      </div>
    </fieldset>
  `;
}

function renderGenerateShell(state) {
  const lastPlan = state.ui?.plannerResult || {};
  const onboardingPrefs = loadOnboardingPrefs();
  const onboardingEquipment = Array.isArray(onboardingPrefs.equipment) ? onboardingPrefs.equipment : [];
  const planEquipment = Array.isArray(lastPlan.selectedEquipment) ? lastPlan.selectedEquipment : [];
  const defaultEquipment = planEquipment.length ? planEquipment : onboardingEquipment;
  const defaultMuscles = Array.isArray(lastPlan.selectedMuscleGroups) ? lastPlan.selectedMuscleGroups : [];
  const defaultGoal = typeof lastPlan.selectedGoal === 'string' && lastPlan.selectedGoal
    ? lastPlan.selectedGoal
    : DEFAULT_GOAL;
  const normalizedGoal = GOAL_OPTIONS.some(option => option.value === defaultGoal) ? defaultGoal : DEFAULT_GOAL;
  const derivedComfort = deriveComfortFromExperience(onboardingPrefs.experienceLevel);
  const storedComfort = typeof lastPlan.selectedComfortLevel === 'string'
    ? lastPlan.selectedComfortLevel
    : lastPlan.comfortLevel || derivedComfort;
  const normalizedComfort = normalizeComfortSelection(storedComfort);
  const gymxietyEnabled = getGymxietyPreference();
  const lockMuscles = defaultEquipment.length === 0;

  return `
    <section class="landing-section" data-generate-shell>
      <div class="landing-error" data-generate-error hidden role="alert"></div>
      <article class="landing-card" data-generate-form>
        <form class="landing-form" data-form="generate-workout">
          ${renderComfortSelector(normalizedComfort)}
          <fieldset class="generate-step" data-equipment-step>
            <legend class="landing-subtext">Step 1 · Equipment on hand</legend>
            <p class="landing-subtext">Check only the tools you truly have nearby.</p>
            ${renderChecklist(EQUIPMENT_LIST, 'equipment', defaultEquipment)}
            <p class="supportive-text" data-equipment-helper>${defaultEquipment.length ? 'Great. Edit anything that changed today.' : EQUIPMENT_HELPER_LOCKED}</p>
          </fieldset>
          <fieldset class="generate-step" data-muscle-step>
            <legend class="landing-subtext">Step 2 · Muscles to nudge</legend>
            <p class="landing-subtext">Unlocks after you pick equipment.</p>
            ${renderMuscleChecklist(MUSCLE_GROUPS, defaultMuscles, lockMuscles)}
            <p class="supportive-text" data-muscle-helper>${lockMuscles ? MUSCLE_HELPER_LOCKED : MUSCLE_HELPER_READY}</p>
          </fieldset>
          ${renderGoalSelector(normalizedGoal)}
          <label class="profile-toggle">
            <input type="checkbox" data-gymxiety-toggle ${gymxietyEnabled ? 'checked' : ''}>
            Gymxiety Mode (keeps moves calm and beginner-friendly)
          </label>
          <div class="landing-actions landing-actions-stack landing-space-top-md">
            <button class="landing-button" type="submit" data-generate-submit ${defaultEquipment.length && defaultMuscles.length ? '' : 'disabled'}>Generate Workout</button>
            <button class="landing-button secondary" type="button" data-action="reset-generate">Reset</button>
          </div>
        </form>
      </article>
    </section>
  `;
}

function renderGymxietyPreview() {
  const previewList = GYMXIETY_PREVIEW_POINTS
    .map(point => `<li>${escapeHTML(point)}</li>`)
    .join('');
  const differentiatorList = GYMXIETY_DIFFERENTIATORS
    .map(point => `<li>${escapeHTML(point)}</li>`)
    .join('');
  return `
    <section class="landing-section">
      <div class="landing-card">
        <h2>Beginner-friendly workouts, built intelligently.</h2>
        <p class="landing-text">
          When Gymxiety Mode is on, your workouts automatically adjust to your comfort level:
        </p>
        <ul class="landing-list">
          ${previewList}
        </ul>
        <p class="landing-text">
          You still get effective, full-body training &mdash; just without the intimidation.
        </p>
      </div>
    </section>
    <section class="landing-section">
      <div class="landing-card">
        <h2>What makes Gymxiety Mode different?</h2>
        <ul class="landing-list">
          ${differentiatorList}
        </ul>
      </div>
    </section>
  `;
}

export function renderGeneratePage(state = getState()) {
  const sections = `
    ${renderHeader()}
    ${renderGymxietyPreview()}
    ${renderGenerateShell(state)}
  `;
  return renderPageShell(sections, { isLoading: false });
}

function getCheckedValues(inputs = []) {
  return inputs
    .filter(input => input.checked)
    .map(input => input.value.toString().trim())
    .filter(Boolean);
}

export function attachGeneratePageEvents(root) {
  const form = root.querySelector('[data-form="generate-workout"]');
  if (!form) {
    return;
  }

  const onboardingPrefs = loadOnboardingPrefs();
  const experienceLevel = onboardingPrefs.experienceLevel;
  const errorBox = root.querySelector('[data-generate-error]');
  const resetButton = root.querySelector('[data-action="reset-generate"]');
  const equipmentHelper = root.querySelector('[data-equipment-helper]');
  const muscleHelper = root.querySelector('[data-muscle-helper]');
  const submitButton = root.querySelector('[data-generate-submit]');
  const defaultSubmitLabel = submitButton?.textContent?.trim() || 'Generate Workout';
  const gymxietyToggle = root.querySelector('[data-gymxiety-toggle]');
  const equipmentInputs = Array.from(form.querySelectorAll('input[name="equipment"]'));
  const muscleInputs = Array.from(form.querySelectorAll('input[name="muscles"]'));
  const goalInputs = Array.from(form.querySelectorAll('input[name="goal"]'));
  const comfortInputs = Array.from(form.querySelectorAll('input[name="comfort-level"]'));

  let selectedEquipment = getCheckedValues(equipmentInputs);
  let selectedMuscles = getCheckedValues(muscleInputs);
  const checkedGoal = goalInputs.find(input => input.checked)?.value || DEFAULT_GOAL;
  let selectedGoal = GOAL_OPTIONS.some(option => option.value === checkedGoal) ? checkedGoal : DEFAULT_GOAL;
  const checkedComfort = comfortInputs.find(input => input.checked)?.value || DEFAULT_COMFORT_LEVEL;
  let comfortLevel = normalizeComfortSelection(checkedComfort);
  let gymxietyMode = Boolean(gymxietyToggle?.checked);
  let formIsBusy = false;

  const setError = message => {
    if (!errorBox) {
      return;
    }
    if (!message) {
      errorBox.hidden = true;
      errorBox.textContent = '';
      return;
    }
    errorBox.hidden = false;
    errorBox.textContent = message;
  };

  const refreshMusclePairingHints = () => {
    const equipmentLocked = selectedEquipment.length === 0;
    muscleInputs.forEach(input => {
      const pairingNode = input.closest('[data-muscle-card]')?.querySelector('[data-muscle-pairing]');
      if (!pairingNode) {
        return;
      }
      pairingNode.hidden = equipmentLocked || !input.checked;
    });
  };

  const updateHelpers = () => {
    const hasEquipment = selectedEquipment.length > 0;
    if (equipmentHelper) {
      equipmentHelper.textContent = hasEquipment ? 'Great. Add or remove anything that changed today.' : EQUIPMENT_HELPER_LOCKED;
    }
    if (muscleHelper) {
      if (!hasEquipment) {
        muscleHelper.textContent = MUSCLE_HELPER_LOCKED;
      } else if (!selectedMuscles.length) {
        muscleHelper.textContent = MUSCLE_HELPER_READY;
      } else {
        muscleHelper.textContent = 'Nice picks. Tap to add or remove as needed.';
      }
    }
    if (submitButton) {
      const ready = selectedEquipment.length && selectedMuscles.length;
      submitButton.disabled = formIsBusy || !ready;
      submitButton.textContent = formIsBusy ? 'Generating…' : defaultSubmitLabel;
    }
    refreshMusclePairingHints();
  };

  const setFormBusy = isBusy => {
    formIsBusy = Boolean(isBusy);
    if (form) {
      form.setAttribute('aria-busy', formIsBusy ? 'true' : 'false');
    }
    updateHelpers();
  };

  const syncMuscleState = () => {
    const hasEquipment = selectedEquipment.length > 0;
    if (!hasEquipment) {
      selectedMuscles = [];
    }
    muscleInputs.forEach(input => {
      input.disabled = !hasEquipment;
      if (!hasEquipment) {
        input.checked = false;
      } else {
        input.checked = selectedMuscles.includes(input.value);
      }
    });
    updateHelpers();
  };

  equipmentInputs.forEach(input => {
    input.addEventListener('change', () => {
      selectedEquipment = getCheckedValues(equipmentInputs);
      syncMuscleState();
    });
  });

  muscleInputs.forEach(input => {
    input.addEventListener('change', () => {
      selectedMuscles = getCheckedValues(muscleInputs);
      updateHelpers();
    });
  });

  goalInputs.forEach(input => {
    input.addEventListener('change', event => {
      const nextGoal = event.target.value;
      selectedGoal = GOAL_OPTIONS.some(option => option.value === nextGoal) ? nextGoal : DEFAULT_GOAL;
    });
  });

  comfortInputs.forEach(input => {
    input.addEventListener('change', event => {
      comfortLevel = normalizeComfortSelection(event.target.value);
    });
  });

  resetButton?.addEventListener('click', () => {
    form.reset();
    selectedEquipment = [];
    selectedMuscles = [];
    selectedGoal = DEFAULT_GOAL;
    comfortLevel = DEFAULT_COMFORT_LEVEL;
    goalInputs.forEach(input => {
      input.checked = input.value === DEFAULT_GOAL;
    });
    comfortInputs.forEach(input => {
      input.checked = input.value === DEFAULT_COMFORT_LEVEL;
    });
    syncMuscleState();
    setError('');
    setFormBusy(false);
  });

  gymxietyToggle?.addEventListener('change', event => {
    gymxietyMode = Boolean(event.target.checked);
    persistGymxietyPreference(gymxietyMode);
  });

  const finalizeSuccess = result => {
    storePlannerResult(result);
    window.location.hash = '#/summary';
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    setError('');

    if (!selectedEquipment.length || !selectedMuscles.length) {
      setError('Pick at least one piece of equipment and one muscle group before generating.');
      return;
    }

    setFormBusy(true);

    try {
      const currentState = getState();
      const plan = generateWorkout({
        selectedEquipment,
        selectedMuscleGroups: selectedMuscles,
        selectedGoal,
        comfortLevel,
        experienceLevel,
        gymxietyMode,
        dislikedExercises: getDislikedExercises(),
        lastWorkoutExercises: currentState.ui?.plannerResult?.exercises || []
      });
      if (!Array.isArray(plan.exercises) || !plan.exercises.length) {
        setFormBusy(false);
        setError('Nothing matched those exact picks. Try toggling one more option and generate again.');
        return;
      }
      setFormBusy(false);
      finalizeSuccess(plan);
    } catch (error) {
      setError('Something glitched while building that plan. Please try again.');
      setFormBusy(false);
    }
  });

  syncMuscleState();
}
