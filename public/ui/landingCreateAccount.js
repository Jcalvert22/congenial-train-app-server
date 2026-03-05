import { render } from './render.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';
import { login } from '../auth/state.js';
import { redirectIfLoggedIn } from '../auth/guard.js';
import { getGymxietyPreference, persistGymxietyPreference } from '../utils/gymxiety.js';
import { areSignupsEnabled } from '../js/supabaseClient.js';

function buildHero(signupsOpen) {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Account</span>
        <h1>${signupsOpen ? 'Create your account.' : 'Invites are currently closed.'}</h1>
        <p class="landing-subtext lead">
          ${signupsOpen ? 'Just a few details to get you started.' : 'We are pausing new accounts until launch to keep things stable.'}
        </p>
        <p>
          ${signupsOpen
            ? 'Your information is safe and never shared. We use it only to personalize your calm plan.'
            : 'Existing members can still log in below. Need access? Email useallaroundathlete@gmail.com and we will reach out when spots open again.'}
        </p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Need help?</p>
        <h3>useallaroundathlete@gmail.com</h3>
        <p>Reach out anytime if you get stuck. A friendly reply arrives within 24-48 hours.</p>
      </div>
    </header>
  `;
}

function buildFormSection(gymxietyEnabled = false, signupsOpen = true) {
  if (!signupsOpen) {
    return `
      <section class="landing-section">
        <p class="landing-subtext">Access</p>
        <h2>New account creation is paused.</h2>
        <p class="supportive-text">
          We are finishing final launch prep. Existing members can <a href="#/login">log in</a> like usual.
          Tap the button below once invites reopen.
        </p>
        <button class="landing-button is-disabled" type="button" disabled>
          Create Account
          <span class="landing-button-pill">Closed</span>
        </button>
        <div class="landing-actions landing-space-top-sm">
          <a class="landing-button secondary" href="#/login">Go to login</a>
        </div>
      </section>
    `;
  }
  return `
    <section class="landing-section">
      <p class="landing-subtext">Setup</p>
      <h2>Tell us who to cheer on.</h2>
      <form class="landing-grid" data-form="create-account" autocomplete="off">
        <label class="landing-card">
          <span class="landing-subtext">Name</span>
          <input type="text" name="name" placeholder="Your name" required>
        </label>
        <label class="landing-card">
          <span class="landing-subtext">Email</span>
          <input type="email" name="email" placeholder="you@example.com" required>
        </label>
        <div class="landing-card landing-grid-span landing-gymxiety-card">
          <div>
            <p class="landing-subtext">Optional calm layer</p>
            <h3>Gymxiety Mode</h3>
            <p>Flip this on whenever you want the interface to slow down, swap in softer moves, and keep reminders gentle.</p>
            <ul class="landing-list landing-list-check landing-gymxiety-list">
              <li>Confidence-first exercise swaps</li>
              <li>Reassuring cues before every set</li>
              <li>Timers that whisper instead of shout</li>
            </ul>
            <p class="landing-subtext" style="margin-top: 12px;">
              Need a calm refresher first?
              <a href="#/gym-basics">Open Gym Basics</a> for form checks, machine setup, breathing, and warm-up cues.
            </p>
          </div>
          <div class="landing-toggle-wrap">
            <span class="landing-subtext" data-gymxiety-create-status>${gymxietyEnabled ? 'Gentle mode already on' : 'Toggle it on anytime'}</span>
            <label class="landing-toggle" aria-label="Enable Gymxiety Mode">
              <input type="checkbox" name="gymxietyMode" value="1" data-gymxiety-create-toggle ${gymxietyEnabled ? 'checked' : ''}>
              <span class="landing-toggle-track" aria-hidden="true"></span>
              <span class="landing-toggle-thumb" aria-hidden="true"></span>
            </label>
          </div>
        </div>
        <button class="landing-button landing-grid-span" type="submit">Create Account</button>
      </form>
    </section>
  `;
}

function buildCtaSection(signupsOpen) {
  if (!signupsOpen) {
    return `
      <section class="landing-section landing-cta">
        <p class="landing-subtext">Next</p>
        <h2>Keep an eye on your inbox.</h2>
        <p>We will email you before launch so you can claim a spot without racing anyone.</p>
        <div class="landing-actions">
          <a class="landing-button secondary" href="#/login">Log in</a>
          <a class="landing-button secondary" href="#/contact">Ask a question</a>
        </div>
      </section>
    `;
  }
  return `
    <section class="landing-section landing-cta">
      <p class="landing-subtext">Next</p>
      <h2>Ready to meet your new routine?</h2>
      <p>We will greet you with a calm welcome and show you where everything lives.</p>
      <div class="landing-actions">
        <a class="landing-button" href="#/welcome">Skip to welcome</a>
        <a class="landing-button secondary" href="#/start-trial">Back to trial details</a>
      </div>
    </section>
  `;
}

export function renderCreateAccount(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  if (redirectIfLoggedIn()) {
    return { html: '', afterRender: () => {} };
  }
  ensureLandingStyles();
  const gymxietyEnabled = getGymxietyPreference();
  const signupsOpen = areSignupsEnabled();

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${buildHero(signupsOpen)}
        ${buildFormSection(gymxietyEnabled, signupsOpen)}
        ${buildCtaSection(signupsOpen)}
      </div>
      ${includeFooter ? renderFooter() : ''}
    </section>
  `;

  const afterRender = root => {
    if (!signupsOpen) {
      return;
    }
    const form = root.querySelector('[data-form="create-account"]');
    const gymxietyToggle = root.querySelector('[data-gymxiety-create-toggle]');
    const gymxietyStatus = root.querySelector('[data-gymxiety-create-status]');

    if (gymxietyToggle && gymxietyStatus) {
      gymxietyToggle.addEventListener('change', () => {
        gymxietyStatus.textContent = gymxietyToggle.checked
          ? 'Gentle mode already on'
          : 'Toggle it on anytime';
      });
    }

    if (form) {
      form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const name = formData.get('name')?.toString().trim() || 'New Member';
        const email = formData.get('email')?.toString().trim() || '';
        const gymxietyMode = Boolean(formData.get('gymxietyMode'));
        const profile = { gymxietyMode };
        login({ name, email, profile });
        persistGymxietyPreference(gymxietyMode);
        window.location.hash = '#/welcome';
      });
    }
  };

  if (standalone) {
    render(html, afterRender);
  }

  return { html, afterRender };
}
