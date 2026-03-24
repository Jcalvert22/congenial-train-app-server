import { renderPageShell } from '../components/stateCards.js';

export function renderCanceledPage() {
  const sections = `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Checkout canceled</span>
        <h1>No worries, your spot is still open.</h1>
        <p class="landing-subtext lead">You can restart checkout anytime. We saved your plan selection so it is one click away.</p>
      </div>
    </header>
    <section class="landing-section">
      <article class="landing-card">
        <div class="landing-actions landing-actions-stack">
          <a class="landing-button" href="#/pricing">Return to pricing</a>
          <a class="landing-button secondary" href="#/paywall">Open paywall</a>
        </div>
      </article>
    </section>
  `;
  return renderPageShell(sections);
}

export function attachCanceledPageEvents() {}
