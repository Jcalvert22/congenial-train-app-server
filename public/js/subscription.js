import { getSupabaseClient } from './supabaseClient.js';
import { getCurrentUser } from '../auth/state.js';

const TRIAL_BANNER_ID = 'aaa-trial-countdown';

export function getTrialDaysLeft(currentPeriodEnd) {
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = (Number(currentPeriodEnd) || 0) - now;
  const daysLeft = Math.ceil(secondsLeft / 86400);
  return Math.max(daysLeft, 0);
}

function ensureTrialBanner() {
  if (typeof document === 'undefined') {
    return null;
  }
  let banner = document.getElementById(TRIAL_BANNER_ID);
  if (banner) {
    return banner;
  }
  banner = document.createElement('div');
  banner.id = TRIAL_BANNER_ID;
  banner.className = 'trial-countdown-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.style.background = '#0f201d';
  banner.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
  banner.style.color = '#f5fff7';
  banner.style.fontWeight = '600';
  banner.style.letterSpacing = '0.02em';
  banner.style.padding = '12px 18px';
  banner.style.textAlign = 'center';
  banner.style.fontSize = '0.95rem';
  banner.dataset.trialCountdown = 'true';
  const navbar = document.getElementById('navbar');
  if (navbar?.parentNode) {
    navbar.parentNode.insertBefore(banner, navbar.nextSibling);
  } else {
    document.body.prepend(banner);
  }
  return banner;
}

export function showTrialCountdown(daysLeft) {
  const banner = ensureTrialBanner();
  if (!banner) {
    return;
  }
  const normalizedDays = Math.max(0, Math.ceil(Number(daysLeft) || 0));
  const unit = normalizedDays === 1 ? 'day' : 'days';
  banner.textContent = `Your free trial ends in ${normalizedDays} ${unit}`;
  banner.hidden = false;
}

export async function fetchSubscriptionStatus() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  const client = getSupabaseClient({ required: false });
  if (!client) {
    return null;
  }
  const { data, error } = await client
    .from('profile')
    .select('subscription_status, current_period_end')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Subscription lookup failed', error);
    throw error;
  }
  return data;
}

function hasSubscriptionAccess(status) {
  return status === 'trialing' || status === 'active';
}

export async function routeBySubscription({ onActive, onInactive }) {
  const data = await fetchSubscriptionStatus();
  if (hasSubscriptionAccess(data?.subscription_status)) {
    if (typeof onActive === 'function') {
      onActive(data);
    }
    return data;
  }
  if (typeof onInactive === 'function') {
    onInactive(data);
  }
  return data;
}
