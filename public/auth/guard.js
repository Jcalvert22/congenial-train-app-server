import { isLoggedIn } from './state.js';

const START_TRIAL_HASH = '#/start-trial';

function redirectToTrial() {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return;
  }
  if (window.location.hash === START_TRIAL_HASH) {
    return;
  }
  window.location.hash = START_TRIAL_HASH;
}

export function protectRoute(callback) {
  if (!isLoggedIn()) {
    redirectToTrial();
    return null;
  }
  return typeof callback === 'function' ? callback() : null;
}
