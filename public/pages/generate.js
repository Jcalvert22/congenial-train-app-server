import { escapeHTML } from '../utils/helpers.js';
import { createPlannerPlan, storePlannerResult, getEquipmentList, getMuscleGroups } from '../logic/workout.js';
import { getState } from '../logic/state.js';
import { renderPageShell } from '../components/stateCards.js';
import {
  getGymxietyPreference,
  persistGymxietyPreference,
  hasCompletedGymxietyOnboarding,
  persistGymxietyOnboardingComplete
} from '../utils/gymxiety.js';

const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const GOAL_OPTIONS = ['Strength', 'Hypertrophy', 'Fat Loss', 'General Fitness'];
const DURATION_OPTIONS = [
  { label: '~20 minutes - 3 moves', value: '20' },
  { label: '~30 minutes - 4 moves', value: '30' },
  { label: '~40 minutes - 5 moves', value: '40' }
];
const GOAL_MUSCLE_MAP = {
  Strength: ['Back', 'Legs', 'Chest'],
  Hypertrophy: ['Chest', 'Shoulders', 'Arms'],
  'Fat Loss': ['Legs', 'Shoulders', 'Abs'],
  'General Fitness': ['Back', 'Legs', 'Abs']
};
const LOADING_DELAY_MS = 1100;
const GYMXIETY_MODAL_TRANSITION_MS = 220;
const MIN_MUSCLE_SELECTION = 1;
const MAX_MUSCLE_SELECTION = 3;
const EQUIPMENT_HELPER_LOCKED = 'Pick at least one option to keep the session realistic.';
const EQUIPMENT_HELPER_UNLOCKED = 'Edit anything that does not match today and add or remove as needed.';
const MUSCLE_HELPER_LOCKED = 'Choose equipment first to unlock these muscle chips.';
const MUSCLE_HELPER_RANGE = 'Pick one to three groups so we keep this workout focused.';

function renderHeader() {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Planner</span>
        <h1>Generate Your Workout</h1>
        <p class="landing-subtext lead">Choose your preferences and we\u2019ll build a personalized routine.</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Calm reminder</p>
        <p>Short, consistent sessions beat marathons. Three focused moves is enough.</p>
      </div>
    </header>
  `;
}

function buildOptionElements(options, selectedValue) {
  return options
    .map(option => {
      const value = typeof option === 'string' ? option : option.value;
      const label = typeof option === 'string' ? option : option.label;
      const selected = value === selectedValue ? 'selected' : '';
      return `<option value="${escapeHTML(value)}" ${selected}>${escapeHTML(label)}</option>`;
    })
    .join('');
}

function guessEquipment(profileEquipmentText) {
  if (!profileEquipmentText) {
    return [];
  }
  const normalized = profileEquipmentText.toLowerCase();
  return getEquipmentList().filter(item => normalized.includes(item.toLowerCase().split(' ')[0]));
}

function renderEquipmentOptions(selectedEquipment = []) {
  return `
    <div class="equipment-list" data-equipment-list>
      ${getEquipmentList().map(item => `
        <label class="equipment-item">
          <input type="checkbox" name="equipment" value="${escapeHTML(item)}" ${selectedEquipment.includes(item) ? 'checked' : ''}>
          <span>${escapeHTML(item)}</span>
        </label>
      `).join('')}
    </div>
  `;
}

function renderMuscleOptions(selectedMuscles = [], disabled = false) {
  const safeSelection = Array.isArray(selectedMuscles) ? selectedMuscles : [];
  return `
    <div class="equipment-list" data-muscle-list>
      ${getMuscleGroups().map(item => `
        <label class="equipment-item">
          <input type="checkbox" name="muscles" value="${escapeHTML(item)}" ${safeSelection.includes(item) ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
          <span>${escapeHTML(item)}</span>
        </label>
      `).join('')}
    </div>
  `;
}

function renderFormSection(state) {
  const profile = state.profile || {};
  const defaultExperience = EXPERIENCE_OPTIONS.find(option => {
    const matches = profile.experienceLevel || profile.experience;
    return matches && matches.toLowerCase().includes(option.toLowerCase().split(' ')[0]);
  }) || EXPERIENCE_OPTIONS[0];
  const defaultGoal = GOAL_OPTIONS.find(option => {
    const text = profile.goal || '';
    return text.toLowerCase().includes(option.split(' ')[0].toLowerCase());
  }) || GOAL_OPTIONS[0];
  const previousPlanEquipment = state.ui?.plannerResult?.preferences?.equipment;
  const defaultEquipment = Array.isArray(previousPlanEquipment) && previousPlanEquipment.length
    ? previousPlanEquipment
    : guessEquipment(profile.equipment);
  const previousPlanMuscles = state.ui?.plannerResult?.preferences?.muscles;
  const shouldLockMuscles = !defaultEquipment.length;
  const baseMuscleDefaults = shouldLockMuscles
    ? []
    : (Array.isArray(previousPlanMuscles) && previousPlanMuscles.length
        ? previousPlanMuscles
        : buildMuscles(defaultGoal));
  const defaultMuscles = Array.isArray(baseMuscleDefaults)
    ? baseMuscleDefaults.slice(0, MAX_MUSCLE_SELECTION)
    : [];
  const gymxietyEnabled = getGymxietyPreference();

  return `
    <section class="landing-section" data-generate-shell>
      <div class="landing-error" data-generate-error hidden role="alert"></div>
      <article class="landing-card" data-generate-form>
        <form class="landing-form" data-form="generate-workout">
          <fieldset class="generate-step" data-equipment-step>
            <legend class="landing-subtext">Step 1 · Equipment on hand</legend>
            <p class="landing-subtext">Tap everything you truly have nearby today.</p>
            ${renderEquipmentOptions(defaultEquipment)}
            <p class="supportive-text" data-equipment-helper>${defaultEquipment.length ? EQUIPMENT_HELPER_UNLOCKED : EQUIPMENT_HELPER_LOCKED}</p>
          </fieldset>
          <fieldset class="generate-step" data-muscle-step>
            <legend class="landing-subtext">Step 2 · Muscles to nudge</legend>
            <p class="landing-subtext">Unlocked after you choose your equipment.</p>
            ${renderMuscleOptions(defaultMuscles, shouldLockMuscles)}
            <p class="supportive-text" data-muscle-helper>${shouldLockMuscles ? MUSCLE_HELPER_LOCKED : MUSCLE_HELPER_RANGE}</p>
          </fieldset>
          <label>
            <span class="landing-subtext">Experience level</span>
            <select class="landing-select" name="experience" required>
              ${buildOptionElements(EXPERIENCE_OPTIONS, defaultExperience)}
            </select>
          </label>
          <label>
            <span class="landing-subtext">Session intention</span>
            <select class="landing-select" name="goal" required>
              ${buildOptionElements(GOAL_OPTIONS, defaultGoal)}
            </select>
          </label>
          <label>
            <span class="landing-subtext">Estimated workout length (optional)</span>
            <select class="landing-select" name="duration">
              <option value="">Keep it flexible</option>
              ${buildOptionElements(DURATION_OPTIONS, '')}
            </select>
          </label>
          <label class="profile-toggle">
            <input type="checkbox" id="gymxietyGenerateToggle" name="gymxietyMode" ${gymxietyEnabled ? 'checked' : ''}>
            Gymxiety Mode (Beginner-friendly, confidence-focused workouts)
          </label>
          <div class="landing-actions landing-actions-stack landing-space-top-md">
            <button class="landing-button" type="submit" data-generate-submit ${shouldLockMuscles ? 'disabled' : ''}>Build my workout</button>
            <button class="landing-button secondary" type="button" data-action="reset-generate">Reset</button>
          </div>
        </form>
      </article>
      <article class="landing-card landing-loading" data-generate-loading hidden>
        <div class="landing-spinner" aria-hidden="true"></div>
        <div>
          <h3>Building your workout...</h3>
          <p class="landing-subtext">We\u2019re picking gentle-but-effective moves tailored to your picks.</p>
        </div>
      </article>
      <article class="landing-card landing-empty-card" data-generate-fallback hidden>
        <p class="landing-subtext">No workout found</p>
        <h3>We couldn\u2019t build that routine.</h3>
        <p data-generate-fallback-copy>Try adjusting your equipment or goal, then generate again.</p>
        <div class="landing-actions landing-space-top-sm">
          <button class="landing-button" type="button" data-action="retry-generate">Back to form</button>
        </div>
      </article>
    </section>
  `;
}

function renderTipsSection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Need ideas?</p>
      <h2>Beginner-friendly guardrails</h2>
      <ul class="landing-list">
        <li>Stick with 3-5 movements when you\u2019re rebuilding consistency.</li>
        <li>Choose equipment you truly have nearby - no pressure to find more.</li>
        <li>Hypertrophy keeps reps moderate; Fat Loss mixes in more steady cardio-style moves.</li>
        <li>Refresh the page? Just generate again and we\u2019ll rebuild instantly.</li>
      </ul>
    </section>
  `;
}

function renderGymxietyModal() {
  return `
    <div class="gymxiety-modal" data-gymxiety-modal aria-hidden="true" hidden>
      <article
        class="gymxiety-modal-card"
        data-gymxiety-modal-card
        role="dialog"
        aria-labelledby="gymxietyModalTitle"
        aria-describedby="gymxietyModalBody"
        tabindex="-1"
      >
        <div class="gymxiety-modal-header">
          <span class="landing-tag">Gymxiety Mode</span>
          <button class="gymxiety-modal-close" type="button" data-action="dismiss-gymxiety-modal" aria-label="Dismiss Gymxiety overview">Close</button>
        </div>
        <h2 id="gymxietyModalTitle">Before your first calm plan</h2>
        <p class="landing-subtext" id="gymxietyModalBody">Three small guardrails keep your first Gymxiety workout steady and pressure-free.</p>
        <ul class="landing-list gymxiety-modal-list">
          <li>We cap the plan around 3-5 moves with longer exhales.</li>
          <li>Tap the Easy version toggle on the summary screen to swap anything that feels intimidating.</li>
          <li>Pause whenever breathing spikes; shorter sessions still count.</li>
        </ul>
        <p class="supportive-text">Need this pep talk later? It lives in the summary screen under Gymxiety Mode.</p>
        <div class="landing-actions landing-actions-stack landing-space-top-md">
          <button class="landing-button" type="button" data-action="confirm-gymxiety-modal">Let\u2019s build it</button>
          <button class="landing-button secondary" type="button" data-action="dismiss-gymxiety-modal">Maybe later</button>
        </div>
      </article>
    </div>
  `;
}

function buildMuscles(goal) {
  return GOAL_MUSCLE_MAP[goal] || ['Legs', 'Back', 'Shoulders'];
}

function buildPlanPayload(formValues) {
  const duration = Number.parseInt(formValues.duration, 10);
  const workoutTime = Number.isFinite(duration) ? duration : 35;
  const beginnerMode = formValues.experience === 'Beginner';
  const mode = formValues.goal === 'Hypertrophy' ? 'bulking' : 'dieting';
  const requestedMuscles = Array.isArray(formValues.muscles) && formValues.muscles.length
    ? formValues.muscles
    : buildMuscles(formValues.goal);
  return createPlannerPlan({
    equipment: formValues.equipment,
    muscles: requestedMuscles,
    beginnerMode,
    workoutTime,
    mode,
    gymxietyMode: Boolean(formValues.gymxietyMode)
  });
}

export function renderGeneratePage(state = getState()) {
  let isLoading = true;
  const sections = `
    ${renderHeader()}
    ${renderFormSection(state)}
    ${renderTipsSection()}
    ${renderGymxietyModal()}
  `;
  isLoading = false;
  return renderPageShell(sections, { isLoading });
}

export function attachGeneratePageEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  const form = root.querySelector('[data-form="generate-workout"]');
  const formCard = root.querySelector('[data-generate-form]');
  const loadingCard = root.querySelector('[data-generate-loading]');
  const fallbackCard = root.querySelector('[data-generate-fallback]');
  const fallbackCopy = root.querySelector('[data-generate-fallback-copy]');
  const errorBox = root.querySelector('[data-generate-error]');
  const retryButtons = root.querySelectorAll('[data-action="retry-generate"]');
  const resetButton = root.querySelector('[data-action="reset-generate"]');
  const submitButton = root.querySelector('[data-generate-submit]');
  const equipmentHelper = root.querySelector('[data-equipment-helper]');
  const muscleHelper = root.querySelector('[data-muscle-helper]');
  const equipmentInputs = form ? Array.from(form.querySelectorAll('input[name="equipment"]')) : [];
  const muscleInputs = form ? Array.from(form.querySelectorAll('input[name="muscles"]')) : [];
  const gymxietyToggle = root.querySelector('#gymxietyGenerateToggle');
  const modal = root.querySelector('[data-gymxiety-modal]');
  const modalCard = root.querySelector('[data-gymxiety-modal-card]');
  const confirmModalButton = root.querySelector('[data-action="confirm-gymxiety-modal"]');
  const dismissModalButtons = root.querySelectorAll('[data-action="dismiss-gymxiety-modal"]');
  let loadingTimer = null;
  let gymxietyModalTimer = null;
  let gymxietyModalOpen = false;
  let onboardingComplete = hasCompletedGymxietyOnboarding();
  const shouldAutoShowGymxietyModal = !onboardingComplete && getGymxietyPreference();

  const getCheckedValues = inputs => inputs
    .filter(input => input.checked)
    .map(input => input.value.toString().trim())
    .filter(Boolean);

  const updateEquipmentHelper = hasEquipment => {
    if (!equipmentHelper) {
      return;
    }
    equipmentHelper.textContent = hasEquipment ? EQUIPMENT_HELPER_UNLOCKED : EQUIPMENT_HELPER_LOCKED;
  };

  const updateMuscleHelper = (hasEquipment, muscleValues, helperMessage) => {
    if (!muscleHelper) {
      return;
    }
    if (!hasEquipment) {
      muscleHelper.textContent = MUSCLE_HELPER_LOCKED;
      return;
    }
    if (helperMessage) {
      muscleHelper.textContent = helperMessage;
      return;
    }
    if (!muscleValues.length) {
      muscleHelper.textContent = MUSCLE_HELPER_RANGE;
      return;
    }
    if (muscleValues.length >= MAX_MUSCLE_SELECTION) {
      muscleHelper.textContent = 'Great mix selected. Tap one to swap or deselect if you want to change focus.';
      return;
    }
    const remaining = MAX_MUSCLE_SELECTION - muscleValues.length;
    muscleHelper.textContent = remaining === 1
      ? 'You can pick one more group for balance.'
      : `You can pick ${remaining} more groups for balance.`;
  };

  const updateSubmitState = (hasEquipment, muscleValues) => {
    if (!submitButton) {
      return;
    }
    const withinRange = muscleValues.length >= MIN_MUSCLE_SELECTION && muscleValues.length <= MAX_MUSCLE_SELECTION;
    submitButton.disabled = !hasEquipment || !withinRange;
  };

  const syncSelectionState = options => {
    const equipmentValues = getCheckedValues(equipmentInputs);
    const hasEquipment = equipmentValues.length > 0;
    if (!hasEquipment) {
      muscleInputs.forEach(input => {
        input.checked = false;
        input.disabled = true;
      });
    } else {
      muscleInputs.forEach(input => {
        input.disabled = false;
      });
    }
    const muscleValues = getCheckedValues(muscleInputs);
    updateEquipmentHelper(hasEquipment);
    updateMuscleHelper(hasEquipment, muscleValues, options?.muscleHelperMessage);
    updateSubmitState(hasEquipment, muscleValues);
  };

  equipmentInputs.forEach(input => {
    input.addEventListener('change', () => syncSelectionState());
  });

  muscleInputs.forEach(input => {
    input.addEventListener('change', event => {
      if (!event.target.checked) {
        syncSelectionState();
        return;
      }
      const nextValues = getCheckedValues(muscleInputs);
      if (nextValues.length > MAX_MUSCLE_SELECTION) {
        event.target.checked = false;
        syncSelectionState({
          muscleHelperMessage: `Pick up to ${MAX_MUSCLE_SELECTION} groups. Deselect one before adding another.`
        });
        return;
      }
      syncSelectionState();
    });
    syncSelectionState();

  });

  const markGymxietyOnboardingComplete = () => {
    if (onboardingComplete) {
      return;
    }
    persistGymxietyOnboardingComplete(true);
    onboardingComplete = true;
  };

  const closeGymxietyModal = (markComplete = false) => {
    if (!modal || !gymxietyModalOpen) {
      if (markComplete) {
        markGymxietyOnboardingComplete();
      }
      return;
    }
    gymxietyModalOpen = false;
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('modal-open');
    }
    window.clearTimeout(gymxietyModalTimer);
    gymxietyModalTimer = window.setTimeout(() => {
      modal.hidden = true;
    }, GYMXIETY_MODAL_TRANSITION_MS);
    if (markComplete) {
      markGymxietyOnboardingComplete();
    }
  };

  const openGymxietyModal = () => {
    if (!modal || gymxietyModalOpen) {
      return;
    }
    gymxietyModalOpen = true;
    window.clearTimeout(gymxietyModalTimer);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('modal-open');
    }
    requestAnimationFrame(() => {
      modal.classList.add('visible');
      modalCard?.focus();
    });
  };

  if (modal) {
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeGymxietyModal(false);
      }
    });
  }

  confirmModalButton?.addEventListener('click', () => {
    closeGymxietyModal(true);
  });

  dismissModalButtons.forEach(button => {
    button.addEventListener('click', () => closeGymxietyModal(false));
  });

  if (shouldAutoShowGymxietyModal) {
    window.setTimeout(() => openGymxietyModal(), 300);
  }

  if (gymxietyToggle) {
    gymxietyToggle.addEventListener('change', event => {
      const nextValue = event.currentTarget.checked;
      persistGymxietyPreference(nextValue);
      if (nextValue && !onboardingComplete) {
        openGymxietyModal();
      } else if (!nextValue) {
        closeGymxietyModal(false);
      }
    });
  }

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

  const toggleView = view => {
    if (formCard) {
      formCard.hidden = view !== 'form';
    }
    if (loadingCard) {
      loadingCard.hidden = view !== 'loading';
      if (view === 'loading') {
        loadingCard.classList.remove('card-fade-out');
      }
    }
    if (fallbackCard) {
      fallbackCard.hidden = view !== 'fallback';
    }
  };

  const resetView = () => {
    window.clearTimeout(loadingTimer);
    toggleView('form');
    setError('');
    loadingCard?.classList.remove('card-fade-out');
  };

  retryButtons.forEach(button => {
    button.addEventListener('click', () => {
      resetView();
    });
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      form?.reset();
      syncSelectionState();
      resetView();
    });
  }

  if (!form) {
    return;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    setError('');

    const formData = new FormData(form);
    const experience = (formData.get('experience') || '').toString().trim();
    const goal = (formData.get('goal') || '').toString().trim();
    const equipment = Array.from(form.querySelectorAll('input[name="equipment"]:checked'))
      .map(input => input.value.toString().trim())
      .filter(Boolean);
    const muscles = getCheckedValues(muscleInputs);
    const duration = (formData.get('duration') || '').toString().trim();
    const gymxietyMode = Boolean(form.querySelector('#gymxietyGenerateToggle')?.checked);

    if (!experience || !goal || !equipment.length || muscles.length < MIN_MUSCLE_SELECTION) {
      setError('Please pick an experience level, goal, at least one piece of equipment, and at least one muscle focus.');
      return;
    }

    toggleView('loading');
    loadingTimer = window.setTimeout(() => {
      try {
        const plan = buildPlanPayload({ experience, goal, equipment, muscles, duration, gymxietyMode });
        if (!plan || !Array.isArray(plan.planRows) || !plan.planRows.length) {
          if (fallbackCopy) {
            fallbackCopy.textContent = 'Nothing matched those exact inputs. Try selecting different equipment or a new goal, then generate again.';
          }
          toggleView('fallback');
          loadingCard?.classList.remove('card-fade-out');
          return;
        }
        plan.generatedAt = new Date().toISOString();
        plan.preferences = { experience, goal, equipment, muscles, duration, gymxietyMode };
        if (loadingCard) {
          loadingCard.classList.remove('card-fade-out');
          requestAnimationFrame(() => loadingCard.classList.add('card-fade-out'));
        }
        window.setTimeout(() => {
          storePlannerResult(plan);
          window.location.hash = '#/summary';
          loadingCard?.classList.remove('card-fade-out');
        }, 250);
      } catch (error) {
        console.warn('Unable to build plan', error);
        setError('Something glitched while building that plan. Please try again.');
        toggleView('form');
        loadingCard?.classList.remove('card-fade-out');
      }
    }, LOADING_DELAY_MS);
  });
}
