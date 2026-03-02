import { loginWithEmail, refreshAuthState, getAuth } from '../auth/state.js';
import { redirectIfLoggedIn } from '../auth/guard.js';

function renderAuthShell(content) {
  return `
    <section class="auth-page">
      <div class="auth-card">
        ${content}
      </div>
    </section>
  `;
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
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString() || '';
    if (!email || !password) {
      if (errorEl) {
        errorEl.textContent = 'Enter your email and password to continue.';
      }
      return;
    }
    try {
      setBusy(true);
      await loginWithEmail({ email, password });
      await refreshAuthState();
      const auth = getAuth();
      window.location.hash = auth.subscriptionStatus === 'active' ? '#/dashboard' : '#/paywall';
    } catch (error) {
      console.error('Login failed', error);
      if (errorEl) {
        errorEl.textContent = error?.message || 'Unable to log in right now.';
      }
    } finally {
      setBusy(false);
    }
  });
}
