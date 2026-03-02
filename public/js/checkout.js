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

function applyPlanToButton(plan) {
  const button = typeof document !== 'undefined' ? document.getElementById('start-trial') : null;
  if (button) {
    button.dataset.plan = plan;
  }
  if (typeof window !== 'undefined') {
    window.__aaaSelectedPlan = plan;
  }
}

currentPlan = loadStoredPlan();
applyPlanToButton(currentPlan);

export function getSelectedPlan() {
  return currentPlan;
}

export async function startCheckout(priceId = currentPlan) {
  const normalizedPlan = normalizePlan(priceId);
  try {
    console.log('Starting checkout with plan:', normalizedPlan);
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ priceId: normalizedPlan })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Checkout request failed: ${errorText || response.status}`);
    }

    const data = await response.json();
    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    throw new Error('Checkout URL missing from response.');
  } catch (error) {
    console.error('Unable to start checkout', error);
    alert('We could not start your checkout right now. Please try again in a moment.');
  }
}

export function setTrialPlan(plan = currentPlan) {
  const nextPlan = normalizePlan(plan);
  currentPlan = nextPlan;
  applyPlanToButton(nextPlan);
  savePlan(nextPlan);
}
