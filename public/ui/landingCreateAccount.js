import { render } from './render.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';
import { setState } from '../logic/state.js';

function buildHero() {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Account</span>
        <h1>Create your account.</h1>
        <p class="landing-subtext lead">Just a few details to get you started.</p>
        <p>Your information is safe and never shared. We use it only to personalize your calm plan.</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Need help?</p>
        <h3>support@allaroundathlete.com</h3>
        <p>Reach out anytime if you get stuck. A friendly reply arrives within 24–48 hours.</p>
      </div>
    </header>
  `;
}

function buildFormSection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Setup</p>
      <h2>Tell us who to cheer on.</h2>
      <form class="landing-grid" data-form="create-account" autocomplete="off">
        <label class="landing-card">
          <span class="landing-subtext">Name</span>
          <input type="text" name="name" placeholder="Your name" required style="margin-top:8px;">
        </label>
        <label class="landing-card">
          <span class="landing-subtext">Email</span>
          <input type="email" name="email" placeholder="you@example.com" required style="margin-top:8px;">
        </label>
        <label class="landing-card">
          <span class="landing-subtext">Password</span>
          <input type="password" name="password" placeholder="Create a password" minlength="6" required style="margin-top:8px;">
        </label>
        <label class="landing-card">
          <span class="landing-subtext">Confirm password</span>
          <input type="password" name="confirm" placeholder="Repeat password" minlength="6" required style="margin-top:8px;">
        </label>
        <div class="landing-card" style="grid-column:1 / -1;">
          <p>Your information is safe and never shared. We only use it to personalize your plan.</p>
        </div>
        <button class="landing-button" type="submit" style="grid-column:1 / -1;">Continue</button>
      </form>
    </section>
  `;
}

function buildCtaSection() {
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
  ensureLandingStyles();

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${buildHero()}
        ${buildFormSection()}
        ${buildCtaSection()}
      </div>
      ${includeFooter ? renderFooter() : ''}
    </section>
  `;

  const afterRender = root => {
    const form = root.querySelector('[data-form="create-account"]');
    if (form) {
      form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const payload = {
          name: formData.get('name')?.toString().trim() || 'New Member',
          email: formData.get('email')?.toString().trim() || ''
        };
        setState(prev => {
          prev.ui = prev.ui || {};
          prev.ui.trialAccount = payload;
          return prev;
        });
        window.location.hash = '#/welcome';
      });
    }
  };

  if (standalone) {
    render(html, afterRender);
  }

  return { html, afterRender };
}
