import { getAuth } from './state.js';

const LOGIN_URL = '/#/login';
const DASHBOARD_URL = '/#/dashboard';
const PAYWALL_URL = '/#/paywall';

function redirectTo(targetUrl) {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return;
  }
  const targetHash = targetUrl.replace('/#', '#');
  if (window.location.hash === targetHash) {
    return;
  }
  window.location.replace(targetUrl);
}

export function redirectToLogin() {
  redirectTo(LOGIN_URL);
}

export function protectRoute(renderCallback, options = {}) {
  const auth = getAuth();
  if (!auth || auth.loggedIn !== true) {
    redirectToLogin();
    return null;
  }
  if (options.requireSubscription !== false && auth.subscriptionStatus !== 'active') {
    if (typeof options.onLocked === 'function') {
      return options.onLocked(auth);
    }
    return null;
  }
  return typeof renderCallback === 'function' ? renderCallback(auth) : null;
}

export function redirectIfLoggedIn(target = null) {
  const auth = getAuth();
  if (auth && auth.loggedIn === true) {
    const destination = target || (auth.subscriptionStatus === 'active' ? DASHBOARD_URL : PAYWALL_URL);
    redirectTo(destination);
    return true;
  }
  return false;
}
