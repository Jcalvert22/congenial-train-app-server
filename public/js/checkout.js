import { getCurrentUser } from '../auth/state.js';
import { redirectToLogin } from '../auth/guard.js';

const STORAGE_KEY = 'aaa-selected-plan';
let currentPlan = 'monthly';

function normalizePlan(plan) {
  const value = (plan || '').toLowerCase();
  return value === 'yearly' ? 'yearly' : 'monthly';
}

function loadStoredPlan() {
  if (typeof window === 'undefined') {
    return 'monthly';
  }
  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    return normalizePlan(stored);
  } catch (error) {
    console.warn('Unable to load stored plan', error);
    return 'monthly';
  }
}

function savePlan(plan) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage?.setItem(STORAGE_KEY, plan);
  } catch (error) {
    console.warn('Unable to save selected plan', error);
  }
}

function applyPlanToButtons(plan) {
  if (typeof document !== 'undefined') {
    document.querySelectorAll('[data-start-trial]').forEach(button => {
      button.dataset.plan = plan;
    });
  }
  if (typeof window !== 'undefined') {
    window.__aaaSelectedPlan = plan;
  }
}

currentPlan = loadStoredPlan();
applyPlanToButtons(currentPlan);

export function getSelectedPlan() {
  return currentPlan;
}

export async function startCheckout(priceId = currentPlan) {
  const normalizedPlan = normalizePlan(priceId);
  const user = await getCurrentUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  const response = await fetch('/functions/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId: normalizedPlan, userId: user.id })
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Checkout unavailable (${response.status}). Please try again or contact support.`);
  }
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || 'Unable to create checkout session.');
  }

  window.location.assign(payload.url);
}

export function setTrialPlan(plan = currentPlan) {
  const nextPlan = normalizePlan(plan);
  currentPlan = nextPlan;
  applyPlanToButtons(nextPlan);
  savePlan(nextPlan);
}
