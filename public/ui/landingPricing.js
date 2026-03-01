import { render } from './render.js';
import { getState } from '../logic/state.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';

const CTA_HASH = '#/start-trial';

function resolveCta(state) {
  if (!state?.isSubscribed) {
    return { href: CTA_HASH, label: 'Start Your Free Trial' };
  }
  if (!state?.profile?.onboardingComplete) {
    return { href: '#/onboarding', label: 'Resume Onboarding' };
  }
  return { href: '#/planner', label: 'Open Planner' };
}

function buildHero(cta) {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Pricing</span>
        <h1>Simple, transparent pricing.</h1>
        <p class="landing-subtext lead">Start your beginner journey with confidence. No pressure, no confusion.</p>
        <p>Every membership includes the same calm tools - no tiers, no upsells. Just steady guidance that keeps things approachable.</p>
        <div class="landing-actions">
          <a class="landing-button" href="${cta.href}">${cta.label}</a>
          <a class="landing-button secondary" href="#/program-generator">Explore features</a>
        </div>
      </div>
      <div class="landing-card emphasis" aria-hidden="true">
        <p class="landing-subtext">Soft visual</p>
        <h3>Structure without stress</h3>
        <p>Planner - Library - Workout summaries</p>
        <div class="landing-stat-list">
          <div class="landing-stat">
            <strong>7.99</strong>
            <span>Monthly (USD)</span>
          </div>
          <div class="landing-stat">
            <strong>49.99</strong>
            <span>Yearly</span>
          </div>
          <div class="landing-stat">
            <strong>All access</strong>
            <span>Future features too</span>
          </div>
        </div>
      </div>
    </header>
  `;
}

function buildPlanCard(cta) {
  const benefits = [
    'Beginner-ready planner',
    'Exercise library walkthroughs',
    'Workout summaries + cues',
    'Progress tracking + reminders',
    'Timer + workout flow helpers',
    'Beginner onboarding guidance',
    'All future feature drops included'
  ];
  return `
    <section class="landing-section">
      <p class="landing-subtext">Membership</p>
      <h2>One calm plan for everyone.</h2>
      <div class="landing-grid landing-grid-two">
        <article class="landing-card">
          <div class="landing-card-image" aria-hidden="true">&#x1F33F;</div>
          <h3>AllAccess - $7.99 / month</h3>
          <p>Try it free, then stay for gentle coaching, steady reminders, and a planner made for nervous beginners.</p>
          <ul class="landing-list">
            ${benefits.slice(0, 4).map(item => `<li>${item}</li>`).join('')}
          </ul>
          <div class="landing-actions landing-space-top-md">
            <a class="landing-button" href="${cta.href}">${cta.label}</a>
          </div>
        </article>
        <article class="landing-card">
          <h3>Annual - $49.99 / year</h3>
          <p>Same calm features, just one easy payment - and two months on us.</p>
          <ul class="landing-list">
            ${benefits.slice(4).map(item => `<li>${item}</li>`).join('')}
          </ul>
          <p class="landing-subtext landing-space-top-md">Switch plans anytime.</p>
        </article>
      </div>
    </section>
  `;
}

function buildIncludedSection() {
  const items = [
    'Beginner-friendly workout programs',
    'Full exercise library with images + instructions',
    'Clear workout summaries',
    'Progress tracking',
    'Timer and workout flow',
    'Beginner onboarding',
    'All future features included'
  ];
  return `
    <section class="landing-section">
      <p class="landing-subtext">What you get</p>
      <h2>Everything stays unlocked.</h2>
      <ul class="landing-list landing-list-check">
        ${items.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </section>
  `;
}

function buildWhySection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Why it matters</p>
      <h2>Reduce overwhelm, grow confidence.</h2>
      <p>AllAroundAthlete keeps directions plain, workouts short, and reminders gentle. Instead of juggling apps, you get one calm place that teaches etiquette, lays out reps, and lets you move at a breathable pace.</p>
    </section>
  `;
}

function buildFaqSection() {
  const faqs = [
    { q: 'Can I cancel anytime?', a: 'Yes. Manage your membership from the account screen - no hidden hoops.' },
    { q: 'Is this good for absolute beginners?', a: 'Every feature was written for day-one lifters who want gentle coaching.' },
    { q: 'Do I need equipment?', a: 'No. Start with bodyweight-only and add gear when you are ready.' },
    { q: 'What happens after my trial?', a: 'You choose to continue monthly or yearly. If you do nothing, access simply pauses.' }
  ];
  return `
    <section class="landing-section">
      <p class="landing-subtext">FAQ</p>
      <h2>Friendly answers before you commit.</h2>
      <div class="landing-grid">
        ${faqs.map(faq => `
          <article class="landing-card">
            <h3>${faq.q}</h3>
            <p>${faq.a}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildCtaSection(cta) {
  return `
    <section class="landing-section landing-cta">
      <p class="landing-subtext">Ready when you are</p>
      <h2>Start your free trial today.</h2>
      <p>Sign up when it feels right - no pressure, just steady support.</p>
      <div class="landing-actions">
        <a class="landing-button" href="${cta.href}">${cta.label}</a>
        <a class="landing-button secondary" href="#/exercise-library">Preview the library</a>
      </div>
    </section>
  `;
}

export function renderPricingLanding(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  ensureLandingStyles();
  const state = getState();
  const cta = resolveCta(state);

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${buildHero(cta)}
        ${buildPlanCard(cta)}
        ${buildIncludedSection()}
        ${buildWhySection()}
        ${buildFaqSection()}
        ${buildCtaSection(cta)}
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
