import { escapeHTML } from '../utils/helpers.js';
import { getAuth, setAuth } from '../auth/state.js';
import { setState } from '../logic/state.js';

const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const GOAL_OPTIONS = ['Fat Loss', 'Muscle Gain', 'Strength', 'General Fitness'];

function renderSelectOptions(options, selectedValue = '') {
  return options.map(option => `
    <option value="${escapeHTML(option)}" ${option === selectedValue ? 'selected' : ''}>${escapeHTML(option)}</option>
  `).join('');
}

function renderHeader() {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Account</span>
        <h1>Edit Profile</h1>
        <p class="landing-subtext lead">Update your personal information and training preferences.</p>
      </div>
    </header>
  `;
}

function renderFormSection(user = {}) {
  const nameValue = user.name || '';
  const emailValue = user.email || '';
  const experienceValue = user.experienceLevel || EXPERIENCE_OPTIONS[0];
  const goalValue = user.goal || GOAL_OPTIONS[0];

  return `
    <section class="landing-section">
      <article class="landing-card">
        <form class="landing-form" data-form="profile-edit" novalidate>
          <label>
            <span class="landing-subtext">Name</span>
            <input class="landing-input" type="text" name="name" value="${escapeHTML(nameValue)}" autocomplete="name" required>
          </label>
          <label>
            <span class="landing-subtext">Email</span>
            <input class="landing-input" type="email" name="email" value="${escapeHTML(emailValue)}" autocomplete="email" required>
          </label>
          <label>
            <span class="landing-subtext">Experience level</span>
            <select class="landing-select" name="experience" required>
              ${renderSelectOptions(EXPERIENCE_OPTIONS, experienceValue)}
            </select>
          </label>
          <label>
            <span class="landing-subtext">Training goal</span>
            <select class="landing-select" name="goal" required>
              ${renderSelectOptions(GOAL_OPTIONS, goalValue)}
            </select>
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
  return `
    <section class="landing-page">
      <div class="landing-container">
        ${renderHeader()}
        ${renderFormSection(user)}
      </div>
    </section>
  `;
}

export function attachProfileEditEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }

  const form = root.querySelector('[data-form="profile-edit"]');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(form);
      const name = formData.get('name').toString().trim();
      const email = formData.get('email').toString().trim();
      const experience = formData.get('experience').toString().trim();
      const goal = formData.get('goal').toString().trim();

      if (!name) {
        window.alert('Please enter your name.');
        return;
      }
      if (!email || !email.includes('@')) {
        window.alert('Please enter a valid email address.');
        return;
      }

      const auth = getAuth();
      auth.user = auth.user || {};
      auth.user.name = name;
      auth.user.email = email;
      auth.user.experienceLevel = experience;
      auth.user.goal = goal;
      setAuth(auth);

      setState(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name,
          email,
          experience,
          experienceLevel: experience,
          goal
        }
      }));

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
