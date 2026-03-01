import { render } from './render.js';
import { getState } from '../logic/state.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';

const CTA_HASH = '#/start-trial';

function resolveCta(state) {
  if (!state?.isSubscribed) {
    return { href: CTA_HASH, label: 'Start Your Beginner Journey' };
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
        <span class="landing-tag">About</span>
        <h1>Fitness made simple, safe, and confidence-building.</h1>
        <p class="landing-subtext lead">AllAroundAthlete helps beginners build momentum without pressure or confusion.</p>
        <p>We designed every screen for people who feel overwhelmed by loud fitness advice. Short, calm explanations replace jargon so you can focus on steady progress.</p>
        <div class="landing-actions">
          <a class="landing-button" href="${cta.href}">${cta.label}</a>
          <a class="landing-button secondary" href="#/exercise-library">See the exercise library</a>
        </div>
      </div>
      <div class="landing-card emphasis" aria-hidden="true">
        <p class="landing-subtext">Soft visual</p>
        <h3>Structure without stress</h3>
        <p>Planner - Library - Workout summaries</p>
        <div class="landing-stat-list">
          <div class="landing-stat">
            <strong>4</strong>
            <span>Beginner pillars</span>
          </div>
          <div class="landing-stat">
            <strong>30 min</strong>
            <span>Average session</span>
          </div>
          <div class="landing-stat">
            <strong>100%</strong>
            <span>Plain language</span>
          </div>
        </div>
      </div>
    </header>
  `;
}

function buildWhySection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Why it exists</p>
      <h2>Beginners deserve clarity, not chaos.</h2>
      <p>New lifters often face information overload, gym anxiety, and the feeling that everyone else knows what to do. AllAroundAthlete slows everything down so you can step into the gym with a calm plan and friendly cues.</p>
      <p>Our mission is to trade overwhelm for clarity, replace pressure with confidence, and deliver simple steps that compound into growth.</p>
    </section>
  `;
}

function buildHowSection() {
  const benefits = [
    'Beginner-friendly workout programs',
    'Exercise library with simple instructions',
    'Clear workout summaries',
    'Calm, supportive interface',
    'A philosophy built around progress, not perfection'
  ];
  return `
    <section class="landing-section">
      <p class="landing-subtext">How we help</p>
      <h2>Tools designed for day-one lifters.</h2>
      <ul class="landing-list landing-list-check">
        ${benefits.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </section>
  `;
}

function buildFounderSection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Founder story</p>
      <h2>Built for anyone who has ever felt out of place in the gym.</h2>
      <p>AllAroundAthlete started after guiding friends who whispered, "I want to lift, but I am terrified of messing up." We listened, removed the noise, and created a calm companion that keeps directions soft, specific, and encouraging.</p>
    </section>
  `;
}

function buildValuesSection() {
  const values = ['Clarity', 'Confidence', 'Simplicity', 'Growth', 'Accessibility'];
  return `
    <section class="landing-section">
      <p class="landing-subtext">Values</p>
      <h2>What guides every feature.</h2>
      <div class="landing-pill-list">
        ${values.map(value => `<span class="landing-pill">${value}</span>`).join('')}
      </div>
    </section>
  `;
}

function buildCtaSection(cta) {
  return `
    <section class="landing-section landing-cta">
      <p class="landing-subtext">Ready when you are</p>
      <h2>Start your beginner journey with us.</h2>
      <p>Short workouts, simple cues, and gentle accountability - everything you need to build confidence.</p>
      <div class="landing-actions">
        <a class="landing-button" href="${cta.href}">${cta.label}</a>
        <a class="landing-button secondary" href="#/pricing">See pricing</a>
      </div>
    </section>
  `;
}

export function renderAboutLanding(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  ensureLandingStyles();
  const state = getState();
  const cta = resolveCta(state);

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${buildHero(cta)}
        ${buildWhySection()}
        ${buildHowSection()}
        ${buildFounderSection()}
        ${buildValuesSection()}
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
