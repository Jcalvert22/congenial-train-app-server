import { escapeHTML } from '../utils/helpers.js';
import { getAuth, setAuth } from '../auth/state.js';
import { setState } from '../logic/state.js';
import { getGymxietyPreference, persistGymxietyPreference } from '../utils/gymxiety.js';

const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const GOAL_OPTIONS = ['Strength', 'Hypertrophy', 'Fat Loss', 'General Fitness'];

function wrapLandingPage(sections) {
  return `
    <section class="landing-page">
      <div class="landing-container">
        ${sections}
      </div>
    </section>
  `;
}

function renderHeader() {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Account</span>
        <h1>Edit Profile</h1>
        <p class="landing-subtext lead">Update your personal information and training preferences.</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Why update?</p>
        <p>Refreshing your details keeps recommendations aligned with how you want to train.</p>
      </div>
    </header>
  `;
}

function renderSelectOptions(options, selectedValue = '') {
  return options.map(option => `
    <option value="${escapeHTML(option)}" ${option === selectedValue ? 'selected' : ''}>${escapeHTML(option)}</option>
  `).join('');
}

function renderFormSection(user = {}) {
  const nameValue = user.name || '';
  const emailValue = user.email || '';
  const experienceValue = user.experienceLevel || EXPERIENCE_OPTIONS[0];
  const goalValue = user.goal || GOAL_OPTIONS[0];
  const gymxietyEnabled = getGymxietyPreference();
  return `
    <section class="landing-section">
      <article class="landing-card">
        <form class="landing-form" data-form="profile-edit">
          <label>
            <span class="landing-subtext">Name</span>
            <input class="landing-input" type="text" name="name" value="${escapeHTML(nameValue)}" required>
          </label>
          <label>
            <span class="landing-subtext">Email</span>
            <input class="landing-input" type="email" name="email" value="${escapeHTML(emailValue)}" required>
          </label>
          <label>
            <span class="landing-subtext">Experience level</span>
            <select class="landing-select" name="experience" required>
              ${renderSelectOptions(EXPERIENCE_OPTIONS, experienceValue)}
            </select>
          </label>
          <label>
            <span class="landing-subtext">Goal</span>
            <select class="landing-select" name="goal" required>
              ${renderSelectOptions(GOAL_OPTIONS, goalValue)}
            </select>
          </label>
          <label class="profile-toggle">
            <input type="checkbox" id="gymxietyToggle" name="gymxietyMode" ${gymxietyEnabled ? 'checked' : ''}>
            Gymxiety Mode (Beginner-friendly, confidence-focused workouts)
          </label>
          <div class="landing-actions landing-actions-stack landing-space-top-md">
            <button class="landing-button" type="submit">Save Changes</button>
            <button class="landing-button secondary" type="button" data-action="cancel-edit">Cancel</button>
          </div>
        </form>
      </article>
    </section>
  `;
}

export function renderProfileEdit() {
  const auth = getAuth();
  const user = auth.user || {};
  const sections = `
    ${renderHeader()}
    ${renderFormSection(user)}
  `;
  return wrapLandingPage(sections);
}

export function attachProfileEditEvents(root) {
  const form = root.querySelector('[data-form="profile-edit"]');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        if (typeof form.reportValidity === 'function') {
          form.reportValidity();
        }
        return;
      }
      const formData = new FormData(form);
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const experience = (formData.get('experience') || '').toString().trim();
      const goal = (formData.get('goal') || '').toString().trim();
      const gymxietyMode = Boolean(root.querySelector('#gymxietyToggle')?.checked);
      if (!name || !email || !experience || !goal) {
        window.alert('Please complete all required fields.');
        return;
      }
      const auth = getAuth();
      auth.user = auth.user || {};
      auth.user.name = name;
      auth.user.email = email;
      auth.user.experienceLevel = experience;
      auth.user.goal = goal;
      auth.user.profile = { ...(auth.user.profile || {}), gymxietyMode };
      auth.user.gymxietyMode = gymxietyMode;
      setAuth(auth);
      setState(prev => {
        prev.profile = {
          ...prev.profile,
          name,
          email,
          experience,
          experienceLevel: experience.toLowerCase(),
          goal,
          gymxietyMode
        };
        return prev;
      });
      persistGymxietyPreference(gymxietyMode);
      window.location.hash = '#/profile';
    });
  }

  const cancelButton = root.querySelector('[data-action="cancel-edit"]');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      window.location.hash = '#/profile';
    });
  }
}
