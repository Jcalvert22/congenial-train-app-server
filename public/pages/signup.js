import { refreshAuthState, getAuth } from '../auth/state.js';
import { redirectIfLoggedIn } from '../auth/guard.js';
import { signup } from '../js/supabaseClient.js';

function renderAuthShell(content) {
  return `
    <section class="auth-page">
      <div class="auth-card">
        ${content}
      </div>
    </section>
  `;
}

export function renderSignupPage() {
  if (redirectIfLoggedIn()) {
    return '';
  }
  return renderAuthShell(`
    <span class="badge">Account</span>
    <h1>Create your account.</h1>
    <p class="auth-subtext">Start your calm training journey with a secure login.</p>
    <form data-signup-form autocomplete="off">
      <label>
        <span>Email</span>
        <input type="email" name="email" required placeholder="you@example.com" />
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" required minlength="6" placeholder="Choose at least 6 characters" />
      </label>
      <button type="submit">Create account</button>
      <p class="auth-error" data-signup-error aria-live="polite"></p>
    </form>
    <p class="auth-meta">Already have an account? <a href="#/login">Log in</a>.</p>
  `);
}

export function attachSignupPageEvents(root) {
  const form = root.querySelector('[data-signup-form]');
  const errorEl = root.querySelector('[data-signup-error]');
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
      const { error } = await signup(email, password);
      if (error) {
        throw error;
      }
      await refreshAuthState();
      const auth = getAuth();
      const hasAccess = auth.subscriptionStatus === 'active' || auth.subscriptionStatus === 'trialing';
      window.location.hash = hasAccess ? '#/dashboard' : '#/paywall';
    } catch (error) {
      console.error('Signup error:', error);
      if (errorEl) {
        errorEl.textContent = error?.message || 'Unable to create your account right now.';
      }
    } finally {
      setBusy(false);
    }
  });
}
