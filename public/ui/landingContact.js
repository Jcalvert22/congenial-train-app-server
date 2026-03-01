import { render } from './render.js';
import { getState } from '../logic/state.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';

const CTA_HASH = '#/start-trial';

function resolveCta(state) {
  if (!state?.isSubscribed) {
    return { href: CTA_HASH, label: 'Start Trial' };
  }
  if (!state?.profile?.onboardingComplete) {
    return { href: '#/onboarding', label: 'Resume Onboarding' };
  }
  return { href: '#/planner', label: 'Open Planner' };
}

function buildHero() {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Contact</span>
        <h1>Let's talk.</h1>
        <p class="landing-subtext lead">Have a question or need help getting started? I'm here to support you.</p>
        <p>Reach out any time. Whether you are nervous about equipment, wondering how to begin, or need help unlocking a feature, I respond with the same calm clarity you feel throughout the app.</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Direct line</p>
        <h3>support@allaroundathlete.com</h3>
        <p>Send a note, share a win, or ask for guidance. Friendly help is always inside your inbox.</p>
      </div>
    </header>
  `;
}

function buildContactSection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Say hello</p>
      <h2>Send a quick message.</h2>
      <form class="landing-grid" data-form="contact">
        <label class="landing-card">
          <span class="landing-subtext">Name</span>
          <input type="text" name="name" placeholder="Your name" required>
        </label>
        <label class="landing-card">
          <span class="landing-subtext">Email</span>
          <input type="email" name="email" placeholder="you@example.com" required>
        </label>
        <label class="landing-card landing-card-compact landing-grid-span">
          <span class="landing-subtext">Message</span>
          <textarea name="message" rows="4" placeholder="Share your question or situation" required></textarea>
        </label>
        <button class="landing-button landing-grid-span" type="submit">Send Message</button>
      </form>
      <p class="landing-subtext landing-space-top-sm">Prefer email? Write to <a href="mailto:support@allaroundathlete.com">support@allaroundathlete.com</a>.</p>
    </section>
  `;
}

function buildFaqSection() {
  const faqs = [
    { q: 'Do I need equipment?', a: 'No. The planner adapts to bodyweight-only setups and grows with you when you add gear.' },
    { q: 'Can beginners use this?', a: 'Absolutely. Every screen explains concepts in calm language for day-one lifters.' },
    { q: 'How do I start a workout?', a: 'Open your plan, tap Start, and follow the simple cues. The interface keeps everything relaxed and clear.' }
  ];
  return `
    <section class="landing-section">
      <p class="landing-subtext">FAQ</p>
      <h2>Quick answers while you wait.</h2>
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

function buildResponseSection() {
  return `
    <section class="landing-section">
      <p class="landing-subtext">Response time</p>
      <h2>I usually reply within 24-48 hours.</h2>
      <p>Expect a thoughtful, encouraging email with next steps, resources, or links into the app so you can keep moving forward.</p>
    </section>
  `;
}

function buildCtaSection(cta) {
  return `
    <section class="landing-section landing-cta">
      <p class="landing-subtext">Ready now?</p>
      <h2>Jump into your calm trial today.</h2>
      <div class="landing-actions">
        <a class="landing-button" href="${cta.href}">${cta.label}</a>
        <a class="landing-button secondary" href="#/pricing">See pricing</a>
      </div>
    </section>
  `;
}

export function renderContactLanding(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  ensureLandingStyles();
  const state = getState();
  const cta = resolveCta(state);

  const html = `
    <section class="landing-page">
      <div class="landing-container">
        ${buildHero()}
        ${buildContactSection()}
        ${buildFaqSection()}
        ${buildResponseSection()}
        ${buildCtaSection(cta)}
      </div>
      ${includeFooter ? renderFooter() : ''}
    </section>
  `;

  const afterRender = root => {
    const form = root.querySelector('[data-form="contact"]');
    if (form) {
      form.addEventListener('submit', event => {
        event.preventDefault();
      });
    }
  };

  if (standalone) {
    render(html, afterRender);
  }

  return { html, afterRender };
}
