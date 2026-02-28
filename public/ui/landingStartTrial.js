import { render } from './render.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';
import { redirectIfLoggedIn } from '../auth/guard.js';

function buildHero() {
  const primaryCtaHref = '#/create-account';
  const secondaryHref = '#/pricing';
  const heroLead = 'No pressure. No confusion. Just a clear path to confidence.';
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Trial</span>
        <h1>Start your free trial.</h1>
        <p class="landing-subtext lead">${heroLead}</p>
        <p>AllAroundAthlete slows everything down so you can step into the gym with a calm plan, gentle cues, and supportive reminders.</p>
        <div class="landing-actions">
          <a class="landing-button" href="${primaryCtaHref}">Create Account</a>
          <a class="landing-button secondary" href="${secondaryHref}">See pricing</a>
        </div>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Soft preview</p>
        <h3>Structure without stress</h3>
        <p>Planner · Library · Workout summaries</p>
        <div class="landing-stat-list">
          <div class="landing-stat">
            <strong>7 days</strong>
            <span>Free access</span>
          </div>
          <div class="landing-stat">
            <strong>Cancel</strong>
            <span>Anytime</span>
          </div>
        </div>
      </div>
    </header>
  `;
}

function buildTrialDetails() {
  const perks = [
    'Full planner access with beginner templates',
    'Exercise library with friendly walkthroughs',
    'Workout summaries that explain every rep',
    'Progress tracking, reminders, and timer tools'
  ];
  return `
    <section class="landing-section">
      <p class="landing-subtext">During your trial</p>
      <h2>Explore everything for 7 days.</h2>
      <p>Try every calm feature with no obligation. Cancel anytime in two taps.</p>
      <ul class="landing-list landing-list-check">
        ${perks.map(perk => `<li>${perk}</li>`).join('')}
      </ul>
    </section>
  `;
}

function buildCtaSection() {
  return `
    <section class="landing-section landing-cta">
      <p class="landing-subtext">Next step</p>
      <h2>Create your account to begin.</h2>
      <p>We will walk you through the calm setup in under two minutes.</p>
      <div class="landing-actions">
        <a class="landing-button" href="#/create-account">Create Account</a>
        <a class="landing-button secondary" href="#/contact">Need help first?</a>
      </div>
    </section>
  `;
}

export function renderStartTrial(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  if (redirectIfLoggedIn()) {
    return { html: '', afterRender: () => {} };
  }
  ensureLandingStyles();

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${buildHero()}
        ${buildTrialDetails()}
        ${buildCtaSection()}
      </div>
      ${includeFooter ? renderFooter() : ''}
    </section>
  `;

  const afterRender = () => {};

  if (standalone) {
    render(html, afterRender);
  }

  return { html, afterRender };
}
