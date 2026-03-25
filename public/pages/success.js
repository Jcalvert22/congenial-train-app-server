import { routeBySubscription } from '../js/subscription.js';
import { getCurrentUser } from '../auth/state.js';
import { redirectToLogin } from '../auth/guard.js';
import { renderPageShell } from '../components/stateCards.js';
import { loadOnboardingPrefs } from '../utils/onboarding.js';

export function renderSuccessPage() {
  const sections = `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Payment complete</span>
        <h1>Thanks for joining AllAroundAthlete.</h1>
        <p class="landing-subtext lead">We are refreshing your subscription to unlock the full app. This usually takes a few seconds.</p>
      </div>
    </header>
    <section class="landing-section">
      <article class="landing-card">
        <div class="landing-actions landing-actions-stack">
          <button class="landing-button" type="button" data-success-refresh>Refresh access</button>
          <a class="landing-button secondary" href="#/dashboard">Go to dashboard</a>
        </div>
        <p class="landing-subtext" data-success-status aria-live="polite">Waiting for Stripe confirmation...</p>
      </article>
    </section>
  `;
  return renderPageShell(sections);
}

export function attachSuccessPageEvents(root) {
  const refreshBtn = root.querySelector('[data-success-refresh]');
  const statusEl = root.querySelector('[data-success-status]');
  if (!refreshBtn || !statusEl) {
    return;
  }

  const refresh = async () => {
    refreshBtn.disabled = true;
    statusEl.textContent = 'Checking your subscription...';
    try {
      const user = await getCurrentUser();
      if (!user) {
        redirectToLogin();
        return;
      }
      await routeBySubscription({
        onActive: () => {
          statusEl.textContent = 'Subscription active! Redirecting...';
          setTimeout(() => {
            const prefs = loadOnboardingPrefs();
            window.location.hash = prefs.completed ? '#/dashboard' : '#/onboarding';
          }, 800);
        },
        onInactive: () => {
          statusEl.textContent = 'We did not find an active subscription yet. You can retry or head to the paywall.';
          setTimeout(() => {
            window.location.hash = '#/paywall';
          }, 1800);
        }
      });
    } catch (error) {
      statusEl.textContent = 'Unable to refresh access right now. Please try again.';
    } finally {
      refreshBtn.disabled = false;
    }
  };

  refreshBtn.addEventListener('click', event => {
    event.preventDefault();
    refresh();
  });

  refresh();
}
