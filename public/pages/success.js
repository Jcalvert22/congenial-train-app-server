import { routeBySubscription } from '../js/subscription.js';
import { getCurrentUser } from '../auth/state.js';
import { redirectToLogin } from '../auth/guard.js';

export function renderSuccessPage() {
  return `
    <section class="panel" style="margin-top:32px;">
      <span class="badge">Payment complete</span>
      <h1 style="margin:12px 0 6px;">Thanks for joining AllAroundAthlete.</h1>
      <p style="color:var(--muted);max-width:540px;">We are refreshing your subscription to unlock the full app. This usually takes a few seconds.</p>
      <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
        <button class="landing-button" data-success-refresh>Refresh access</button>
        <a class="landing-button secondary" href="#/dashboard">Go to dashboard</a>
      </div>
      <p class="auth-subtext" data-success-status style="margin-top:18px;">Waiting for Stripe confirmation...</p>
    </section>
  `;
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
          statusEl.textContent = 'Subscription active! Redirecting to your dashboard...';
          setTimeout(() => {
            window.location.hash = '#/dashboard';
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
      console.error('Subscription refresh failed', error);
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
