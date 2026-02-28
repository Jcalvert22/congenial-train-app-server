import { escapeHTML } from '../utils/helpers.js';
import { getState } from '../logic/state.js';
import { getAuth, logout } from '../auth/state.js';
import {
  renderEmptyStateCard,
  renderErrorStateCard,
  wrapWithPageLoading,
  revealPageContent
} from '../components/stateCards.js';

function renderHeader(displayName) {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <div class="profile-avatar" aria-hidden="true"></div>
        <span class="landing-tag">Profile</span>
        <h1>Your Profile</h1>
        <p class="landing-subtext lead">Manage your personal information and training preferences.</p>
        <p class="landing-subtext">Signed in as ${escapeHTML(displayName)}</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Reminder</p>
        <p>Keeping your details current helps every calm plan stay personal and pressure-free.</p>
      </div>
    </header>
  `;
}

function renderProfileCard({ name, email, experience, goal }) {
  return `
    <section class="landing-section">
      <article class="landing-card profile-card card-pop-in" data-profile-card>
        <h2 class="landing-card-title">${escapeHTML(name)}</h2>
        <p class="landing-subtext">${escapeHTML(email)}</p>
        <div class="landing-card-body profile-details">
          <div>
            <p class="landing-subtext">Experience level</p>
            <strong>${escapeHTML(experience)}</strong>
          </div>
          <div>
            <p class="landing-subtext">Primary goal</p>
            <strong>${escapeHTML(goal)}</strong>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderPreferenceCard(profile) {
  const equipment = profile.equipment || 'Bodyweight focus';
  const location = profile.location || 'Location not set';
  const nextWorkout = profile.nextWorkout || 'Pick a focus when ready';
  return `
    <section class="landing-section">
      <article class="landing-card card-pop-in" data-profile-card>
        <p class="landing-subtext">Preferences</p>
        <div class="profile-details">
          <div>
            <p class="landing-subtext">Equipment</p>
            <strong>${escapeHTML(equipment)}</strong>
          </div>
          <div>
            <p class="landing-subtext">Location</p>
            <strong>${escapeHTML(location)}</strong>
          </div>
          <div>
            <p class="landing-subtext">Next workout</p>
            <strong>${escapeHTML(nextWorkout)}</strong>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderActionsSection() {
  return `
    <section class="landing-section">
      <article class="landing-card">
        <p class="landing-subtext">Actions</p>
        <div class="landing-actions landing-actions-stack">
          <a class="landing-button" href="#/profile-edit">Edit Profile</a>
          <button class="landing-button secondary" type="button" data-action="profile-logout">Log Out</button>
        </div>
      </article>
    </section>
  `;
}

export function renderProfilePage(state = getState()) {
  const profile = state.profile || {};
  const auth = getAuth();
  if (!auth?.user && !profile.name) {
    const sections = `
      ${renderHeader('Friend')}
      ${renderErrorStateCard({
        title: 'No account detected',
        message: 'We could not find your signed-in details. Please log in again to manage your profile.',
        actionLabel: 'Back Home',
        actionHref: '#/'
      })}
    `;
    return wrapWithPageLoading(sections, 'Loading profile...');
  }
  const displayName = auth.user?.name?.trim() || profile.name || 'Friend';
  const email = auth.user?.email?.trim() || profile.email || 'Email not set';
  const experience = profile.experience || 'Beginner';
  const goal = profile.goal || 'Build steady confidence';

  if (!profile.goal && !profile.experience) {
    const sections = `
      ${renderHeader(displayName)}
      ${renderEmptyStateCard({
        title: 'Profile not set up',
        message: 'Add your basics so we can personalize every calm plan.',
        actionLabel: 'Edit Profile',
        actionHref: '#/profile-edit'
      })}
    `;
    return wrapWithPageLoading(sections, 'Loading profile...');
  }

  const sections = `
    ${renderHeader(displayName)}
    ${renderProfileCard({ name: displayName, email, experience, goal })}
    ${renderPreferenceCard({
      equipment: profile.equipment,
      location: profile.location,
      nextWorkout: state.program?.nextWorkout
    })}
    ${renderActionsSection()}
  `;

  return wrapWithPageLoading(sections, 'Loading profile...');
}

export function attachProfilePageEvents(root) {
  revealPageContent(root);
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  const cards = root.querySelectorAll('[data-profile-card]');
  cards.forEach((card, index) => {
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add('visible'), 60 * index);
    });
  });
  const logoutButton = root.querySelector('[data-action="profile-logout"]');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logout();
      window.location.hash = '#/';
    });
  }
}
