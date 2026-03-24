import { escapeHTML } from '../utils/helpers.js';
import { getAuth, setAuth } from '../auth/state.js';
import { getState, setState } from '../logic/state.js';
import { renderPageShell } from '../components/stateCards.js';

// ─── Options ──────────────────────────────────────────────────────────────────

const EXPERIENCE_OPTIONS = [
  {
    value: 'brand_new',
    label: 'Brand new',
    helper: 'Starting fresh — want the calmest possible approach.'
  },
  {
    value: 'returning_lifter',
    label: 'Returning lifter',
    helper: 'Been here before — looking for a gentle reset.'
  },
  {
    value: 'inconsistent',
    label: 'Comfortable but inconsistent',
    helper: 'Know the basics, need structure to stay steady.'
  }
];

const GOAL_OPTIONS = [
  { value: 'strength',    label: 'Strength'       },
  { value: 'hypertrophy', label: 'Hypertrophy'    },
  { value: 'endurance',   label: 'Endurance'      },
  { value: 'weight_loss', label: 'Weight Loss'    },
  { value: 'general',     label: 'General Fitness'}
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(value) {
  return typeof value === 'string' && value.includes('@') && value.lastIndexOf('.') > value.indexOf('@') + 1;
}

function isValidExperience(value) {
  return EXPERIENCE_OPTIONS.some(opt => opt.value === value);
}

function isValidGoal(value) {
  return GOAL_OPTIONS.some(opt => opt.value === value);
}

function readCurrentValues() {
  const auth = getAuth();
  const profile = getState().profile || {};
  return {
    name:            (auth.user?.name?.trim()          || profile.name                                    || ''),
    email:           (auth.user?.email?.trim()          || profile.email                                   || ''),
    experienceLevel: (auth.user?.experienceLevel        || profile.experienceLevel || profile.experience   || 'brand_new'),
    goal:            (auth.user?.goal                   || profile.goal                                    || 'general')
  };
}

// ─── Render helpers ───────────────────────────────────────────────────────────

function renderChips(groupName, options, selectedValue) {
  return options.map(opt => `
    <label class="landing-chip">
      <input
        type="radio"
        name="${escapeHTML(groupName)}"
        value="${escapeHTML(opt.value)}"
        ${opt.value === selectedValue ? 'checked' : ''}>
      <span>${escapeHTML(opt.label)}</span>
    </label>
  `).join('');
}

function renderField(label, inputHtml) {
  return `
    <div class="profile-edit-field">
      <p class="landing-label">${escapeHTML(label)}</p>
      ${inputHtml}
    </div>
  `;
}

function renderForm({ name, email, experienceLevel, goal }) {
  const safeExp  = isValidExperience(experienceLevel) ? experienceLevel : 'brand_new';
  const safeGoal = isValidGoal(goal)                  ? goal            : 'general';

  return `
    <section class="landing-section">
      <article class="landing-card card-pop-in" data-profile-edit-card>
        <form class="landing-form" data-form="profile-edit" novalidate>

          <div id="profile-edit-error" class="landing-error" hidden aria-live="assertive"></div>

          ${renderField('Name',
            `<input
               class="landing-input"
               type="text"
               name="name"
               value="${escapeHTML(name)}"
               autocomplete="name"
               placeholder="Your name"
               required>`
          )}

          ${renderField('Email',
            `<input
               class="landing-input"
               type="email"
               name="email"
               value="${escapeHTML(email)}"
               autocomplete="email"
               placeholder="your@email.com"
               required>`
          )}

          ${renderField('Experience level',
            `<div class="landing-chip-row" style="margin-top:0.5rem;">
               ${renderChips('experienceLevel', EXPERIENCE_OPTIONS, safeExp)}
             </div>`
          )}

          ${renderField('Primary goal',
            `<div class="landing-chip-row" style="margin-top:0.5rem;">
               ${renderChips('goal', GOAL_OPTIONS, safeGoal)}
             </div>`
          )}

          <div class="landing-actions landing-actions-stack landing-space-top-md">
            <button class="landing-button" type="submit">Save Changes</button>
            <button class="landing-button secondary" type="button" data-action="cancel-edit">Cancel</button>
          </div>

        </form>
      </article>
    </section>
  `;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function renderProfileEdit() {
  const values = readCurrentValues();
  const sections = `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Account</span>
        <h1>Edit Profile</h1>
        <p class="landing-subtext lead">Keep your details current so every plan stays personal.</p>
      </div>
    </header>
    ${renderForm(values)}
  `;
  return renderPageShell(sections);
}

export function attachProfileEditEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }

  // Fade in
  requestAnimationFrame(() => {
    const card = root.querySelector('[data-profile-edit-card]');
    if (card) card.classList.add('visible');
  });

  const form     = root.querySelector('[data-form="profile-edit"]');
  const errorEl  = root.querySelector('#profile-edit-error');

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      clearError();

      const data            = new FormData(form);
      const name            = data.get('name')?.toString().trim()            ?? '';
      const email           = data.get('email')?.toString().trim()           ?? '';
      const experienceLevel = data.get('experienceLevel')?.toString().trim() ?? 'brand_new';
      const goal            = data.get('goal')?.toString().trim()            ?? 'general';

      if (!name) {
        showError('Please enter your name.');
        root.querySelector('input[name="name"]')?.focus();
        return;
      }
      if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        root.querySelector('input[name="email"]')?.focus();
        return;
      }
      if (!isValidExperience(experienceLevel)) {
        showError('Please select your experience level.');
        return;
      }
      if (!isValidGoal(goal)) {
        showError('Please select a primary goal.');
        return;
      }

      // Persist to auth
      const auth = getAuth();
      setAuth({
        user: {
          ...auth.user,
          name,
          email,
          experienceLevel,
          goal
        }
      });

      // Persist to app state
      setState(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name,
          email,
          experience:      experienceLevel,
          experienceLevel,
          goal
        }
      }));

      window.location.hash = '#/profile';
    });
  }

  const cancelBtn = root.querySelector('[data-action="cancel-edit"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.hash = '#/profile';
    });
  }
}
