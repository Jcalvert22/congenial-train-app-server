const TRIAL_LENGTH_SECONDS = 7 * 24 * 60 * 60;

function normalizeStatus(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeSeconds(value) {
  if (!value && value !== 0) {
    return 0;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return Math.floor(parsed / 1000);
    }
  }
  const coerced = Number(value);
  if (Number.isFinite(coerced)) {
    return Math.floor(coerced);
  }
  return 0;
}

export function getDaysSince(dateString) {
  const created = Date.parse(dateString || '');
  if (Number.isNaN(created)) {
    return 1;
  }
  const now = Date.now();
  const elapsedDays = Math.floor((now - created) / 86400000);
  return Math.max(elapsedDays + 1, 1);
}

export function getTrialDaysLeft(currentPeriodEnd) {
  const periodSeconds = normalizeSeconds(currentPeriodEnd);
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = periodSeconds - now;
  return Math.max(Math.ceil(secondsLeft / 86400), 0);
}

export function formatDate(ts) {
  const seconds = normalizeSeconds(ts);
  if (!seconds) {
    return 'TBD';
  }
  return new Date(seconds * 1000).toLocaleDateString();
}

function resolveTrialFallbackSeconds(user) {
  const createdMs = Date.parse(user?.created_at || '');
  if (Number.isNaN(createdMs)) {
    return 0;
  }
  return Math.floor(createdMs / 1000) + TRIAL_LENGTH_SECONDS;
}

export function resolveBillingPeriodEnd(user, profile = {}) {
  const storedSeconds = normalizeSeconds(profile.current_period_end);
  if (storedSeconds > 0) {
    return storedSeconds;
  }
  const status = normalizeStatus(profile.subscription_status);
  if (status === 'trialing') {
    return resolveTrialFallbackSeconds(user);
  }
  return storedSeconds;
}

export function getTrialProgress(daysLeft) {
  const total = 7;
  const remaining = Number.isFinite(daysLeft) ? daysLeft : 0;
  const used = total - remaining;
  return Math.min(Math.max((used / total) * 100, 0), 100);
}

export function updateProfileMessage(user, profile = {}) {
  const el = document.getElementById('profile-message');
  const bar = document.getElementById('trial-progress-bar');
  const progressContainer = document.getElementById('trial-progress-container');
  if (!el || !user || !profile) {
    return;
  }

  const daysUsingApp = getDaysSince(user.created_at);
  const resolvedPeriodEnd = resolveBillingPeriodEnd(user, profile);
  const daysLeft = getTrialDaysLeft(resolvedPeriodEnd);
  const memberSince = new Date(user.created_at).toLocaleDateString();

  const normalizedStatus = normalizeStatus(profile.subscription_status);

  if (normalizedStatus === 'trialing') {
    el.textContent =
      `You've been using the app for ${daysUsingApp} days. ` +
      `Your free trial ends in ${daysLeft} days.`;

    const pct = getTrialProgress(daysLeft);
    if (bar) {
      bar.style.width = pct + '%';
    }
    if (progressContainer) {
      progressContainer.style.display = 'block';
    }
  } else if (normalizedStatus === 'active') {
    el.textContent =
      `Member since ${memberSince}. ` +
      `You've been using the app for ${daysUsingApp} days.`;

    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
  } else {
    el.textContent =
      `You've been using the app for ${daysUsingApp} days. ` +
      `Your free trial has ended.`;

    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
  }

  el.style.display = 'block';
}
