import { escapeHTML } from '../utils/helpers.js';
import { renderPageShell } from '../components/stateCards.js';
import { getState } from '../logic/state.js';
import { storePlannerResult } from '../logic/workout.js';
import { generateWorkout } from '../utils/generateWorkout.js';
import { EQUIPMENT_LIST, MUSCLE_GROUPS } from '../data/exercises.js';
import { getGymxietyPreference, persistGymxietyPreference } from '../utils/gymxiety.js';
import { getDislikedExercises } from '../utils/dislikedExercises.js';

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

function renderHeader() {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Planner</span>
        <h1>Generate Your Workout</h1>
        <p class="landing-subtext lead">Pick what you have and what you want to train. We always match those picks.</p>
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

function renderGenerateShell(state) {
  const lastPlan = state.ui?.plannerResult || {};
  const defaultEquipment = Array.isArray(lastPlan.selectedEquipment) ? lastPlan.selectedEquipment : [];
  const defaultMuscles = Array.isArray(lastPlan.selectedMuscleGroups) ? lastPlan.selectedMuscleGroups : [];
  const defaultGoal = typeof lastPlan.selectedGoal === 'string' && lastPlan.selectedGoal
    ? lastPlan.selectedGoal
    : DEFAULT_GOAL;
  const normalizedGoal = GOAL_OPTIONS.some(option => option.value === defaultGoal) ? defaultGoal : DEFAULT_GOAL;
  const gymxietyEnabled = getGymxietyPreference();
  const lockMuscles = defaultEquipment.length === 0;

  return `
    <section class="landing-section" data-generate-shell>
      <div class="landing-error" data-generate-error hidden role="alert"></div>
      <article class="landing-card" data-generate-form>
        <form class="landing-form" data-form="generate-workout">
          <fieldset class="generate-step" data-equipment-step>
            <legend class="landing-subtext">Step 1 · Equipment on hand</legend>
            <p class="landing-subtext">Check only the tools you truly have nearby.</p>
            ${renderChecklist(EQUIPMENT_LIST, 'equipment', defaultEquipment)}
            <p class="supportive-text" data-equipment-helper>${defaultEquipment.length ? 'Great. Edit anything that changed today.' : EQUIPMENT_HELPER_LOCKED}</p>
          </fieldset>
          <fieldset class="generate-step" data-muscle-step>
            <legend class="landing-subtext">Step 2 · Muscles to nudge</legend>
            <p class="landing-subtext">Unlocks after you pick equipment.</p>
            ${renderChecklist(MUSCLE_GROUPS, 'muscles', defaultMuscles, lockMuscles)}
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
      <article class="landing-card landing-loading" data-generate-loading hidden>
        <div class="landing-spinner" aria-hidden="true"></div>
        <div>
          <h3>Building your workout...</h3>
          <p class="landing-subtext">We are matching only the equipment and muscles you selected.</p>
        </div>
      </article>
      <article class="landing-card landing-empty-card" data-generate-fallback hidden>
        <p class="landing-subtext">No workout found</p>
        <h3>Those filters were too strict.</h3>
        <p data-generate-fallback-copy>Try toggling one more piece of equipment or another muscle group.</p>
        <div class="landing-actions landing-space-top-sm">
          <button class="landing-button" type="button" data-action="retry-generate">Back to form</button>
        </div>
      </article>
    </section>
  `;
}

export function renderGeneratePage(state = getState()) {
  const sections = `
    ${renderHeader()}
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

function toggleView(view, refs) {
  const { formCard, loadingCard, fallbackCard } = refs;
  if (formCard) {
    formCard.hidden = view !== 'form';
  }
  if (loadingCard) {
    loadingCard.hidden = view !== 'loading';
  }
  if (fallbackCard) {
    fallbackCard.hidden = view !== 'fallback';
  }
}

export function attachGeneratePageEvents(root) {
  const form = root.querySelector('[data-form="generate-workout"]');
  if (!form) {
    return;
  }

  const formCard = root.querySelector('[data-generate-form]');
  const loadingCard = root.querySelector('[data-generate-loading]');
  const fallbackCard = root.querySelector('[data-generate-fallback]');
  const fallbackCopy = root.querySelector('[data-generate-fallback-copy]');
  const errorBox = root.querySelector('[data-generate-error]');
  const retryButtons = root.querySelectorAll('[data-action="retry-generate"]');
  const resetButton = root.querySelector('[data-action="reset-generate"]');
  const equipmentHelper = root.querySelector('[data-equipment-helper]');
  const muscleHelper = root.querySelector('[data-muscle-helper]');
  const submitButton = root.querySelector('[data-generate-submit]');
  const gymxietyToggle = root.querySelector('[data-gymxiety-toggle]');
  const equipmentInputs = Array.from(form.querySelectorAll('input[name="equipment"]'));
  const muscleInputs = Array.from(form.querySelectorAll('input[name="muscles"]'));
  const goalInputs = Array.from(form.querySelectorAll('input[name="goal"]'));
  const refs = { formCard, loadingCard, fallbackCard };

  let selectedEquipment = getCheckedValues(equipmentInputs);
  let selectedMuscles = getCheckedValues(muscleInputs);
  const checkedGoal = goalInputs.find(input => input.checked)?.value || DEFAULT_GOAL;
  let selectedGoal = GOAL_OPTIONS.some(option => option.value === checkedGoal) ? checkedGoal : DEFAULT_GOAL;
  let gymxietyMode = Boolean(gymxietyToggle?.checked);

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
      submitButton.disabled = !(selectedEquipment.length && selectedMuscles.length);
    }
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

  retryButtons.forEach(button => button.addEventListener('click', () => {
    toggleView('form', refs);
    setError('');
  }));

  resetButton?.addEventListener('click', () => {
    form.reset();
    selectedEquipment = [];
    selectedMuscles = [];
    selectedGoal = DEFAULT_GOAL;
    goalInputs.forEach(input => {
      input.checked = input.value === DEFAULT_GOAL;
    });
    syncMuscleState();
    setError('');
    toggleView('form', refs);
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

    toggleView('loading', refs);

    try {
      const plan = generateWorkout({
        selectedEquipment,
        selectedMuscleGroups: selectedMuscles,
        selectedGoal,
        gymxietyMode,
        dislikedExercises: getDislikedExercises()
      });
      if (!Array.isArray(plan.exercises) || !plan.exercises.length) {
        if (fallbackCopy) {
          fallbackCopy.textContent = 'Nothing matched those exact picks. Try toggling one more option and generate again.';
        }
        toggleView('fallback', refs);
        return;
      }
      finalizeSuccess(plan);
    } catch (error) {
      console.warn('Unable to build workout', error);
      setError('Something glitched while building that plan. Please try again.');
      toggleView('form', refs);
    }
  });

  syncMuscleState();
}
