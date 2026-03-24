import { escapeHTML } from '../utils/helpers.js';
import { startCheckout, setTrialPlan } from '../js/checkout.js';
import { getCurrentUser } from '../auth/state.js';
import { redirectToLogin } from '../auth/guard.js';
import { renderPageShell } from '../components/stateCards.js';

export function renderPaywall(auth) {
  const status = escapeHTML(auth?.subscriptionStatus || 'inactive');
  const sections = `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Membership</span>
        <h1>Unlock your calm tools.</h1>
        <p class="landing-subtext lead">An active subscription is required to access workout planning, summaries, and execution helpers.</p>
      </div>
    </header>
    <section class="landing-section">
      <article class="landing-card">
        <div class="landing-actions landing-actions-stack">
          <button class="landing-button" type="button" data-paywall-plan="monthly">Start monthly ($7.99)</button>
          <button class="landing-button secondary" type="button" data-paywall-plan="yearly">Start yearly ($49.99)</button>
        </div>
        <p class="landing-subtext">Already subscribed? Head to <a href="#/success">the success page</a> to refresh your access.</p>
        <p class="landing-subtext">Current status: <strong>${status}</strong>.</p>
      </article>
    </section>
  `;
  return renderPageShell(sections);
}

export function attachPaywallEvents(root) {
  const buttons = root.querySelectorAll('[data-paywall-plan]');
  buttons.forEach(button => {
    button.addEventListener('click', async event => {
      event.preventDefault();
      const plan = button.dataset.paywallPlan || 'monthly';
      const user = await getCurrentUser();
      if (!user) {
        redirectToLogin();
        return;
      }
      setTrialPlan(plan);
      button.disabled = true;
      try {
        await startCheckout(plan);
      } finally {
        button.disabled = false;
      }
    });
  });
}
