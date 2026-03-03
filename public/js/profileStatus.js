export function getDaysSince(dateString) {
  const created = new Date(dateString).getTime();
  const now = Date.now();
  return Math.floor((now - created) / 86400000);
}

export function getTrialDaysLeft(currentPeriodEnd) {
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = currentPeriodEnd - now;
  return Math.max(Math.ceil(secondsLeft / 86400), 0);
}

export function formatDate(ts) {
  return new Date(ts * 1000).toLocaleDateString();
}

export function getTrialProgress(daysLeft) {
  const total = 7;
  const used = total - daysLeft;
  return Math.min(Math.max((used / total) * 100, 0), 100);
}

export function updateProfileMessage(user, profile) {
  const el = document.getElementById('profile-message');
  const bar = document.getElementById('trial-progress-bar');
  if (!el || !user || !profile) {
    return;
  }

  const daysUsingApp = getDaysSince(user.created_at);
  const daysLeft = getTrialDaysLeft(profile.current_period_end);
  const memberSince = new Date(user.created_at).toLocaleDateString();
  const nextBilling = formatDate(profile.current_period_end);

  if (profile.subscription_status === 'trialing') {
    el.textContent =
      `You've been using the app for ${daysUsingApp} days. ` +
      `Your free trial ends in ${daysLeft} days.`;

    const pct = getTrialProgress(daysLeft);
    if (bar) {
      bar.style.width = pct + '%';
      if (bar.parentElement) {
        bar.parentElement.style.display = 'block';
      }
    }
  } else if (profile.subscription_status === 'active') {
    el.textContent =
      `Member since ${memberSince}. ` +
      `You've been using the app for ${daysUsingApp} days. ` +
      `Your next billing date is ${nextBilling}.`;

    if (bar?.parentElement) {
      bar.parentElement.style.display = 'none';
    }
  } else {
    el.textContent =
      `You've been using the app for ${daysUsingApp} days. ` +
      `Your free trial has ended.`;

    if (bar?.parentElement) {
      bar.parentElement.style.display = 'none';
    }
  }

  el.style.display = 'block';
}
