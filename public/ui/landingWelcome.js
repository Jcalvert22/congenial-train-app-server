import { render } from './render.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';
import { getAuth } from '../auth/state.js';
import { protectRoute } from '../auth/guard.js';

function buildHero(profileName) {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Welcome</span>
        <h1>Welcome to AllAroundAthlete!</h1>
        <p class="landing-subtext lead">Let's build your confidence, one workout at a time.</p>
        <p>${profileName}, you now have access to the calm planner, exercise walk-throughs, and beginner-friendly reminders.</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">You're ready for</p>
        <ul class="landing-list">
          <li>Generate your first workout</li>
          <li>Explore the exercise library</li>
          <li>Learn the basics at your own pace</li>
        </ul>
      </div>
    </header>
  `;
}

function buildOrientationSection() {
  const steps = [
    { title: 'Plan a session', copy: 'Open the planner, choose your equipment, and let us build a short, calm workout.' },
    { title: 'Learn each move', copy: 'Use the exercise library to see cues, etiquette tips, and confidence reminders.' },
    { title: 'Track progress', copy: 'Log workouts and watch your streak grow without pressure.' }
  ];
  return `
    <section class="landing-section">
      <p class="landing-subtext">Next steps</p>
      <h2>Here's what happens now.</h2>
      <div class="landing-grid">
        ${steps.map(step => `
          <article class="landing-card">
            <h3>${step.title}</h3>
            <p>${step.copy}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function buildCtaSection() {
  return `
    <section class="landing-section landing-cta">
      <p class="landing-subtext">Ready?</p>
      <h2>Head to your dashboard.</h2>
      <p>We'll keep everything calm and obvious so you always know what to do next.</p>
      <div class="landing-actions">
        <a class="landing-button" href="#/dashboard">Go to Dashboard</a>
        <a class="landing-button secondary" href="#/exercise-library">Review moves first</a>
      </div>
    </section>
  `;
}

export function renderWelcome(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  const guardResult = protectRoute(() => true);
  if (!guardResult) {
    return { html: '', afterRender: () => {} };
  }
  ensureLandingStyles();
  const auth = getAuth();
  const profileName = auth.user?.name?.trim() || 'Friend';

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${buildHero(profileName)}
        ${buildOrientationSection()}
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
