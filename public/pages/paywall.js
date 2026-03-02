import { startCheckout, setTrialPlan } from '../js/checkout.js';
import { getCurrentUser } from '../auth/state.js';
import { redirectToLogin } from '../auth/guard.js';

export function renderPaywall(auth) {
  const plan = auth?.plan || 'monthly';
  return `
    <section class="panel" style="margin-top:32px;">
      <span class="badge">Membership</span>
      <h1 style="margin:12px 0 6px;">Unlock your calm tools.</h1>
      <p style="color:var(--muted);max-width:540px;">You're logged in, but an active subscription is required to access workout planning, summaries, and execution helpers.</p>
      <div class="landing-actions" style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
        <button class="landing-button" data-paywall-plan="monthly">Start monthly ($7.99)</button>
        <button class="landing-button secondary" data-paywall-plan="yearly">Start yearly ($49.99)</button>
      </div>
      <p style="margin-top:18px;color:var(--muted);">Already subscribed? Head to <a href="#/success">the success page</a> to refresh your access.</p>
      <p style="margin-top:18px;font-size:0.9rem;color:var(--muted);">Current status: <strong>${auth?.subscriptionStatus || 'inactive'}</strong>. Last plan: <strong>${plan}</strong>.</p>
    </section>
  `;
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
