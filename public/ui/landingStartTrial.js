import { render } from './render.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';
import { redirectIfLoggedIn } from '../auth/guard.js';
import { getGymxietyPreference, persistGymxietyPreference } from '../utils/gymxiety.js';
import { setTrialPlan } from '../js/checkout.js';
import { areSignupsEnabled } from '../js/supabaseClient.js';

function buildHero(signupsOpen) {
  const primaryCtaHref = '#/create-account';
  const secondaryHref = '#/pricing';
  const heroLead = 'No pressure. No confusion. Just a clear path to confidence.';
  const primaryAction = signupsOpen
    ? `<a class="landing-button" href="${primaryCtaHref}">Create Account</a>`
    : `
        <button class="landing-button is-disabled" type="button" disabled>
          Create Account
          <span class="landing-button-pill">Closed</span>
        </button>
      `;
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Trial</span>
        <h1>${signupsOpen ? 'Start your free trial.' : 'Trials are closed until launch.'}</h1>
        <p class="landing-subtext lead">${heroLead}</p>
        <p>
          ${signupsOpen
            ? 'AllAroundAthlete slows everything down so you can step into the gym with a calm plan, gentle cues, and supportive reminders.'
            : 'We are keeping the doors closed while we finish launch polish. Existing members can still log in from the top navigation.'}
        </p>
        <div class="landing-actions">
          ${primaryAction}
          <a class="landing-button secondary" href="${secondaryHref}">See pricing</a>
        </div>
        ${signupsOpen ? '' : '<p class="supportive-text">Need to get in touch? Email useallaroundathlete@gmail.com.</p>'}
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Soft preview</p>
        <h3>Structure without stress</h3>
        <p>Planner - Library - Workout summaries</p>
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

function buildGymxietySection(gymxietyEnabled = false) {
  const list = [
    'Confidence-first swaps ready from day one',
    'Gentle timers, friendly pacing, and supportive cues',
    'Reminders that prioritize breath, not burnout'
  ];
  return `
    <section class="landing-section landing-gymxiety-optin">
      <p class="landing-subtext">Optional calm setup</p>
      <article class="landing-card landing-gymxiety-card">
        <div>
          <h2>Gymxiety Mode keeps the trial soft.</h2>
          <p>Enable it now to have the trial automatically swap in easier movements, slower timers, and reassuring copy.</p>
          <ul class="landing-list landing-gymxiety-list">
            ${list.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="landing-toggle-wrap">
          <span class="landing-subtext" data-gymxiety-trial-status>${gymxietyEnabled ? 'Gentle mode already on' : 'Tap to enable instantly'}</span>
          <label class="landing-toggle" aria-label="Enable Gymxiety Mode during trial">
            <input type="checkbox" value="1" data-gymxiety-trial-toggle ${gymxietyEnabled ? 'checked' : ''}>
            <span class="landing-toggle-track" aria-hidden="true"></span>
            <span class="landing-toggle-thumb" aria-hidden="true"></span>
          </label>
        </div>
      </article>
    </section>
  `;
}

function buildCtaSection(signupsOpen) {
  if (!signupsOpen) {
    return `
      <section class="landing-section landing-cta">
        <p class="landing-subtext">Next step</p>
        <h2>Invites reopen soon.</h2>
        <p>We will email the early list before launch so you can hop in without waiting.</p>
        <div class="landing-actions">
          <a class="landing-button secondary" href="#/login">Log in</a>
          <a class="landing-button secondary" href="#/contact">Ask about access</a>
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

function buildPlanPicker() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Choose your billing plan</p>
      <h2>Pick monthly or yearly before you start.</h2>
      <p>Your top-right Start Free Trial button will always use the last plan you pick.</p>
      <div class="trial-plan-toggle" role="group" aria-label="Select billing plan">
        <button type="button" class="plan-toggle is-active" data-plan-select="monthly">
          <strong>Monthly</strong>
          <span>$7.99 &middot; cancel anytime</span>
        </button>
        <button type="button" class="plan-toggle" data-plan-select="yearly">
          <strong>Yearly</strong>
          <span>$49.99 &middot; two months free</span>
        </button>
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
  const gymxietyEnabled = getGymxietyPreference();
  const signupsOpen = areSignupsEnabled();

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${buildHero(signupsOpen)}
        ${signupsOpen ? buildPlanPicker() : ''}
        ${buildTrialDetails()}
        ${buildGymxietySection(gymxietyEnabled)}
        ${buildCtaSection(signupsOpen)}
      </div>
      ${includeFooter ? renderFooter() : ''}
    </section>
  `;

  const afterRender = root => {
    if (signupsOpen) {
      const planButtons = Array.from(root.querySelectorAll('[data-plan-select]'));
      if (planButtons.length) {
        const setActive = nextPlan => {
          planButtons.forEach(btn => {
            const isActive = btn.dataset.planSelect === nextPlan;
            btn.classList.toggle('is-active', isActive);
          });
        };
        const planSource = document.querySelector('[data-start-trial]');
        const currentPlan = planSource?.dataset.plan || 'monthly';
        setTrialPlan(currentPlan);
        setActive(currentPlan);
        planButtons.forEach(button => {
          button.addEventListener('click', () => {
            const plan = button.dataset.planSelect || 'monthly';
            setTrialPlan(plan);
            setActive(plan);
          });
        });
      }
    }

    const toggle = root.querySelector('[data-gymxiety-trial-toggle]');
    const status = root.querySelector('[data-gymxiety-trial-status]');
    if (!toggle || !status) {
      return;
    }
    toggle.addEventListener('change', () => {
      persistGymxietyPreference(toggle.checked);
      status.textContent = toggle.checked
        ? 'Gentle mode already on'
        : 'Tap to enable instantly';
    });
  };

  if (standalone) {
    render(html, afterRender);
  }

  return { html, afterRender };
}
