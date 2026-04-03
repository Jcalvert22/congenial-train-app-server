import { renderPageShell } from '../components/stateCards.js';
import { escapeHTML } from '../utils/helpers.js';
import { EQUIPMENT_LIST } from '../data/exercises.js';
import {
  EXPERIENCE_OPTIONS,
  loadOnboardingPrefs,
  saveOnboardingPrefs,
  normalizeExperienceLevel
} from '../utils/onboarding.js';

function renderExperienceRadios(selectedValue) {
  const normalized = normalizeExperienceLevel(selectedValue);
  return EXPERIENCE_OPTIONS.map(option => {
    const checked = option.value === normalized ? 'checked' : '';
    return `
      <label class="onboarding-experience-card">
        <input type="radio" name="onboarding-experience" value="${escapeHTML(option.value)}" ${checked}>
        <div>
          <p class="onboarding-card-title">${escapeHTML(option.label)}</p>
          <p class="onboarding-card-helper">${escapeHTML(option.helper)}</p>
        </div>
      </label>
    `;
  }).join('');
}

function renderEquipmentChecklist(selectedValues = []) {
  const set = new Set((selectedValues || []).map(value => value?.toString().trim()));
  return EQUIPMENT_LIST.map(item => {
    const checked = set.has(item) ? 'checked' : '';
    return `
      <label class="equipment-item">
        <input type="checkbox" name="onboarding-equipment" value="${escapeHTML(item)}" ${checked}>
        <span>${escapeHTML(item)}</span>
      </label>
    `;
  }).join('');
}

export function renderOnboardingPage() {
  const prefs = loadOnboardingPrefs();
  const styles = `
    <style>
      .onboarding-flow { display: flex; flex-direction: column; gap: 24px; }
      .onboarding-hero { border-radius: 28px; border: none; padding: clamp(20px, 5vw, 36px); background: #053E1D; box-shadow: 0 12px 40px rgba(5, 62, 29, 0.2); }
      .onboarding-hero h1 { margin: 8px 0 10px; font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: clamp(1.8rem, 4vw, 2.4rem); color: #F9F0E1; }
      .onboarding-hero p { margin: 0; color: rgba(249, 240, 225, 0.85); line-height: 1.6; font-family: 'Roboto', sans-serif; }
      .onboarding-progress { font-size: 0.85rem; color: #00FF4F; text-transform: uppercase; letter-spacing: 0.18em; font-family: 'Montserrat', sans-serif; font-weight: 700; }
      .onboarding-steps { display: flex; flex-direction: column; gap: 20px; }
      .onboarding-card { border-radius: 28px; border: 1px solid rgba(5, 62, 29, 0.1); padding: 24px; background: #FFFFFF; box-shadow: 0 4px 16px rgba(5, 62, 29, 0.06); }
      .onboarding-card h2 { margin: 0 0 10px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1.3rem; color: #053E1D; }
      .onboarding-card p { margin: 0 0 16px; color: #4A4A4A; font-family: 'Roboto', sans-serif; }
      .onboarding-experience-grid { display: grid; gap: 12px; }
      .onboarding-experience-card { border: 1px solid rgba(5, 62, 29, 0.15); border-radius: 20px; padding: 16px; display: flex; gap: 14px; align-items: flex-start; background: #F9F0E1; cursor: pointer; transition: border-color 0.2s ease, background 0.2s ease; }
      .onboarding-experience-card:has(input:checked) { border-color: #053E1D; background: #E6FFDA; }
      .onboarding-experience-card input { margin-top: 6px; accent-color: #053E1D; }
      .onboarding-card-title { margin: 0 0 4px; font-family: 'Montserrat', sans-serif; font-weight: 700; color: #1D1D1D; }
      .onboarding-card-helper { margin: 0; color: #4A4A4A; font-size: 0.9rem; line-height: 1.4; font-family: 'Roboto', sans-serif; }
      .onboarding-equipment-grid { border-radius: 22px; border: 1px solid rgba(5, 62, 29, 0.1); padding: 18px; background: #F9F0E1; }
      .equipment-list-small { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(140px, 100%), 1fr)); gap: 10px; }
      .equipment-item { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border: 1px solid rgba(5, 62, 29, 0.15); border-radius: 14px; background: #FFFFFF; font-size: 0.9rem; color: #1D1D1D; cursor: pointer; font-family: 'Roboto', sans-serif; transition: border-color 0.2s ease, background 0.2s ease; }
      .equipment-item:has(input:checked) { border-color: #053E1D; background: #E6FFDA; }
      .equipment-item input { margin: 0; flex-shrink: 0; accent-color: #053E1D; }
      .onboarding-actions { display: flex; gap: 12px; flex-wrap: wrap; }
      .onboarding-actions .landing-button { flex: 1 1 120px; }
      .onboarding-error { color: #b91c1c; font-size: 0.9rem; margin-top: 12px; font-family: 'Roboto', sans-serif; }
      @media (max-width: 480px) {
        .onboarding-card { padding: 16px; }
        .equipment-list-small { grid-template-columns: repeat(2, 1fr); }
        .onboarding-actions .landing-button { flex: 1 1 100%; }
      }
    </style>
  `;

  const sections = `
    ${styles}
    <section class="landing-section onboarding-flow" data-onboarding-root>
      <div class="onboarding-hero">
        <p class="onboarding-progress">Step <span data-onboarding-step>1</span> of 2</p>
        <h1>Structure without stress.</h1>
        <p>Two quick questions help us build a plan that feels safe and simple — no pressure, no confusion.</p>
      </div>
      <article class="onboarding-card" data-onboarding-step-panel="1">
        <h2>What’s your experience level?</h2>
        <p class="landing-subtext">Pick the option that feels closest. You can always change this later.</p>
        <div class="onboarding-experience-grid">
          ${renderExperienceRadios(prefs.experienceLevel)}
        </div>
        <div class="onboarding-actions landing-space-top-sm">
          <button class="landing-button" type="button" data-action="next-step">Next</button>
        </div>
      </article>
      <article class="onboarding-card" data-onboarding-step-panel="2" hidden>
        <h2>What equipment do you have access to?</h2>
        <p class="landing-subtext">Check everything you can touch today. We only program within this list.</p>
        <div class="onboarding-equipment-grid">
          <div class="equipment-list-small" data-onboarding-equipment-list>
            ${renderEquipmentChecklist(prefs.equipment)}
          </div>
        </div>
        <p class="onboarding-error" data-onboarding-error hidden>Please pick at least one piece of equipment.</p>
        <div class="onboarding-actions landing-space-top-sm">
          <button class="landing-button secondary" type="button" data-action="prev-step">Back</button>
          <button class="landing-button" type="button" data-action="save-onboarding">Save and continue</button>
        </div>
      </article>
    </section>
  `;

  return renderPageShell(sections);
}

export function attachOnboardingEvents(root) {
  if (!root) {
    return;
  }
  const panels = Array.from(root.querySelectorAll('[data-onboarding-step-panel]'));
  const stepLabel = root.querySelector('[data-onboarding-step]');
  const errorNode = root.querySelector('[data-onboarding-error]');
  const experienceInputs = Array.from(root.querySelectorAll('input[name="onboarding-experience"]'));
  const equipmentInputs = Array.from(root.querySelectorAll('input[name="onboarding-equipment"]'));
  const nextBtn = root.querySelector('[data-action="next-step"]');
  const prevBtn = root.querySelector('[data-action="prev-step"]');
  const saveBtn = root.querySelector('[data-action="save-onboarding"]');
  const prefs = loadOnboardingPrefs();
  let currentStep = 1;
  let experienceLevel = prefs.experienceLevel;
  const equipmentSet = new Set((prefs.equipment || []).map(item => item?.toString().trim()).filter(Boolean));

  const updateStepVisibility = step => {
    currentStep = step;
    panels.forEach(panel => {
      const panelStep = Number(panel.getAttribute('data-onboarding-step-panel'));
      panel.hidden = panelStep !== step;
    });
    if (stepLabel) {
      stepLabel.textContent = String(step);
    }
    if (errorNode) {
      errorNode.hidden = true;
    }
  };

  experienceInputs.forEach(input => {
    input.addEventListener('change', () => {
      experienceLevel = input.value;
    });
  });

  equipmentInputs.forEach(input => {
    input.addEventListener('change', () => {
      const value = input.value.toString().trim();
      if (!value) {
        return;
      }
      if (input.checked) {
        equipmentSet.add(value);
      } else {
        equipmentSet.delete(value);
      }
    });
  });

  nextBtn?.addEventListener('click', () => {
    if (!experienceLevel) {
      experienceLevel = prefs.experienceLevel || 'brand_new';
    }
    updateStepVisibility(2);
  });

  prevBtn?.addEventListener('click', () => {
    updateStepVisibility(1);
  });

  saveBtn?.addEventListener('click', () => {
    if (!equipmentSet.size) {
      if (errorNode) {
        errorNode.hidden = false;
      }
      return;
    }
    saveOnboardingPrefs({
      experienceLevel,
      equipment: Array.from(equipmentSet),
      completed: true
    });
    window.location.hash = '#/generate';
  });

  updateStepVisibility(currentStep);
}
