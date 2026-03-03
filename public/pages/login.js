import { refreshAuthState } from '../auth/state.js';
import { redirectIfLoggedIn } from '../auth/guard.js';
import { login, getSupabaseClient, getCurrentUser } from '../js/supabaseClient.js';
import { getTrialDaysLeft, updateProfileMessage, resolveBillingPeriodEnd } from '../js/profileStatus.js';
import { showTrialCountdown } from '../js/subscription.js';
import { openBillingPortal } from './profile.js';

function renderAuthShell(content) {
  return `
    <section class="auth-page">
      <div class="auth-card">
        ${content}
      </div>
    </section>
  `;
}

function unlockFullApp() {
  window.location.hash = '#/dashboard';
}

function showPaywall() {
  window.location.hash = '#/paywall';
}

async function runSubscriptionCheck() {
  const user = await getCurrentUser();
  if (!user) {
    showPaywall();
    return;
  }
  const client = getSupabaseClient();
  const { data: profile, error } = await client
    .from('profile')
    .select('subscription_status, current_period_end')
    .eq('id', user.id)
    .single();
  if (error) {
    throw error;
  }
  const safeProfile = profile || {};
  updateProfileMessage(user, safeProfile);

  const cancelBtn = document.getElementById('cancel-subscription-btn');
  if (cancelBtn) {
    if (safeProfile?.subscription_status === 'active') {
      cancelBtn.style.display = 'block';
      cancelBtn.onclick = () => openBillingPortal(user.id);
    } else {
      cancelBtn.style.display = 'none';
    }
  }

  if (safeProfile?.subscription_status === 'trialing') {
    const resolvedPeriodEnd = resolveBillingPeriodEnd(user, safeProfile);
    const daysLeft = getTrialDaysLeft(resolvedPeriodEnd);
    showTrialCountdown(daysLeft);
    unlockFullApp();
  } else if (safeProfile?.subscription_status === 'active') {
    unlockFullApp();
  } else {
    showPaywall();
  }
}

export function renderLoginPage() {
  if (redirectIfLoggedIn()) {
    return '';
  }
  return renderAuthShell(`
    <span class="badge">Account</span>
    <h1>Welcome back.</h1>
    <p class="auth-subtext">Sign in to continue building calm routines.</p>
    <form data-login-form autocomplete="off">
      <label>
        <span>Email</span>
        <input type="email" name="email" required placeholder="you@example.com" />
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" required minlength="6" placeholder="•••••••" />
      </label>
      <button type="submit">Log in</button>
      <p class="auth-error" data-login-error aria-live="polite"></p>
    </form>
    <p class="auth-meta">Need an account? <a href="#/signup">Create one</a>.</p>
  `);
}

export function attachLoginPageEvents(root) {
  const form = root.querySelector('[data-login-form]');
  const errorEl = root.querySelector('[data-login-error]');
  if (!form) {
    return;
  }

  const setBusy = isBusy => {
    form.querySelector('button[type="submit"]').disabled = isBusy;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (errorEl) {
      errorEl.textContent = '';
    }
    const formData = new FormData(form);
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString() || '';
    if (!email || !password) {
      if (errorEl) {
        errorEl.textContent = 'Enter your email and password to continue.';
      }
      return;
    }
    try {
      setBusy(true);
      const { error } = await login(email, password);
      if (error) {
        throw error;
      }
      await refreshAuthState();
      await runSubscriptionCheck();
    } catch (error) {
      console.error('Login error:', error);
      if (errorEl) {
        errorEl.textContent = error?.message || 'Unable to log in right now.';
      }
    } finally {
      setBusy(false);
    }
  });
}
