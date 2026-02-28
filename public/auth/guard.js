import { getAuth } from './state.js';

const START_TRIAL_URL = '/#/start-trial';
const DASHBOARD_URL = '/#/dashboard';

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

export function protectRoute(renderCallback) {
  const auth = getAuth();
  if (!auth || auth.loggedIn !== true) {
    redirectTo(START_TRIAL_URL);
    return null;
  }
  return typeof renderCallback === 'function' ? renderCallback() : null;
}

export function redirectIfLoggedIn() {
  const auth = getAuth();
  if (auth && auth.loggedIn === true) {
    redirectTo(DASHBOARD_URL);
    return true;
  }
  return false;
}
