import { render } from './render.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';
import { isLoggedIn } from '../auth/state.js';

function buildHero(isMember) {
  const primaryCtaLabel = isMember ? 'Go to Dashboard' : 'Create Account';
  const primaryCtaHref = isMember ? '#/dashboard' : '#/create-account';
  const secondaryLabel = isMember ? 'See latest features' : 'See pricing';
  const secondaryHref = isMember ? '#/plan-generator' : '#/pricing';
  const heroLead = isMember
    ? 'You are already inside the calm workspace. Jump back into your tools whenever you are ready.'
    : 'No pressure. No confusion. Just a clear path to confidence.';
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Trial</span>
        <h1>Start your free trial.</h1>
        <p class="landing-subtext lead">${heroLead}</p>
        <p>AllAroundAthlete slows everything down so you can step into the gym with a calm plan, gentle cues, and supportive reminders.</p>
        <div class="landing-actions">
          <a class="landing-button" href="${primaryCtaHref}">${primaryCtaLabel}</a>
          <a class="landing-button secondary" href="${secondaryHref}">${secondaryLabel}</a>
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

function buildCtaSection(isMember) {
  if (isMember) {
    return `
      <section class="landing-section landing-cta">
        <p class="landing-subtext">Next step</p>
        <h2>Head back into your workspace.</h2>
        <p>Your dashboard, planner, and history are ready whenever you are.</p>
        <div class="landing-actions">
          <a class="landing-button" href="#/dashboard">Open Dashboard</a>
          <a class="landing-button secondary" href="#/profile">Update profile</a>
        </div>
      </section>
    `;
  }
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
  ensureLandingStyles();
  const loggedIn = isLoggedIn();

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${buildHero(loggedIn)}
        ${buildTrialDetails()}
        ${buildCtaSection(loggedIn)}
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
