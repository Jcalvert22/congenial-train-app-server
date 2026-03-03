import { escapeHTML } from '../utils/helpers.js';
import { getState } from '../logic/state.js';
import { getAuth, logout } from '../auth/state.js';
import { updateProfileMessage } from '../js/profileStatus.js';
import { getSupabaseClient } from '../js/supabaseClient.js';
import { fetchSubscriptionStatus } from '../js/subscription.js';

export async function openBillingPortal() {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;

    if (!accessToken) {
      throw new Error('Missing Supabase session');
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    };

    const res = await fetch('/create-portal-session', {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });

    if (!res.ok) {
      throw new Error(`Portal request failed: ${res.status}`);
    }

    const payload = await res.json();
    if (payload?.url) {
      window.location.href = payload.url;
      return;
    }
    throw new Error('Portal URL missing');
  } catch (error) {
    console.error('Unable to open billing portal', error);
    window.alert('Unable to open billing portal.');
  }
}
import {
  renderEmptyStateCard,
  renderErrorStateCard,
  renderPageShell,
  revealPageContent
} from '../components/stateCards.js';

function renderHeader(displayName) {
  return `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <div class="profile-avatar" aria-hidden="true"></div>
        <span class="landing-tag">Profile</span>
        <h1>Your Profile</h1>
        <p class="landing-subtext lead">Manage your personal information and training preferences.</p>
        <p class="landing-subtext">Signed in as ${escapeHTML(displayName)}</p>
      </div>
      <div class="landing-card" aria-hidden="true">
        <p class="landing-subtext">Reminder</p>
        <p>Keeping your details current helps every calm plan stay personal and pressure-free.</p>
      </div>
    </header>
  `;
}

function wrapProfileContent(content) {
  return `
    <div class="profile-container">
      <div id="profile-message" class="profile-message" style="display:none;"></div>

      <div id="trial-progress-container" class="trial-progress-container" style="display:none;">
        <div id="trial-progress-bar" class="trial-progress-bar"></div>
      </div>

      <button id="cancel-subscription-btn" class="cancel-sub-btn" style="display:none;">
        Manage Subscription
      </button>

      <!-- rest of your profile UI -->
      ${content}
    </div>
  `;
}

const PORTAL_ELIGIBLE_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid']);

function normalizeStatus(status) {
  return typeof status === 'string' ? status.trim().toLowerCase() : '';
}

function hasPortalAccess(status) {
  return PORTAL_ELIGIBLE_STATUSES.has(normalizeStatus(status));
}

function canAttemptPortal(profile, stripeCustomerId) {
  if (hasPortalAccess(profile?.subscription_status)) {
    return true;
  }
  return Boolean(stripeCustomerId);
}

function extractPeriodEndSeconds(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return Math.floor(parsed / 1000);
    }
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return Math.floor(numeric);
    }
  }
  return null;
}

function hasValidPeriodEnd(value) {
  const seconds = extractPeriodEndSeconds(value);
  return typeof seconds === 'number' && seconds > 0;
}

function needsBillingRefresh(profile) {
  if (!profile) {
    return false;
  }
  return hasPortalAccess(profile.subscription_status) && !hasValidPeriodEnd(profile.current_period_end);
}

async function refreshBillingMetadata(user, cancelBtn, stripeCustomerId) {
  if (!user) {
    return null;
  }
  try {
    const latest = await fetchSubscriptionStatus();
    if (!latest) {
      return null;
    }
    const normalized = {
      subscription_status: normalizeStatus(latest.subscription_status) || 'inactive',
      current_period_end: latest.current_period_end ?? null
    };
    updateProfileMessage(user, normalized);
    if (cancelBtn) {
      const shouldShow = canAttemptPortal(normalized, stripeCustomerId);
      cancelBtn.style.display = shouldShow ? 'block' : 'none';
      if (cancelBtn.style.display === 'block') {
        cancelBtn.onclick = () => openBillingPortal();
      }
    }
    return normalized;
  } catch (error) {
    console.error('Unable to refresh billing info', error);
    return null;
  }
}

function renderProfileCard({ name, email, experience, goal, gymxietyMode }) {
  return `
    <section class="landing-section">
      <article class="landing-card profile-card card-pop-in" data-profile-card>
        <h2 class="landing-card-title">${escapeHTML(name)}</h2>
        <p class="landing-subtext">${escapeHTML(email)}</p>
        <div class="landing-card-body profile-details">
          <div>
            <p class="landing-subtext">Experience level</p>
            <strong>${escapeHTML(experience)}</strong>
          </div>
          <div>
            <p class="landing-subtext">Primary goal</p>
            <strong>${escapeHTML(goal)}</strong>
          </div>
          <div>
            <p class="landing-subtext">Gymxiety Mode</p>
            <strong>${gymxietyMode ? 'On' : 'Off'}</strong>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderPreferenceCard(profile) {
  const equipment = profile.equipment || 'Bodyweight focus';
  const location = profile.location || 'Location not set';
  const nextWorkout = profile.nextWorkout || 'Pick a focus when ready';
  return `
    <section class="landing-section">
      <article class="landing-card card-pop-in" data-profile-card>
        <p class="landing-subtext">Preferences</p>
        <div class="profile-details">
          <div>
            <p class="landing-subtext">Equipment</p>
            <strong>${escapeHTML(equipment)}</strong>
          </div>
          <div>
            <p class="landing-subtext">Location</p>
            <strong>${escapeHTML(location)}</strong>
          </div>
          <div>
            <p class="landing-subtext">Next workout</p>
            <strong>${escapeHTML(nextWorkout)}</strong>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderActionsSection() {
  return `
    <section class="landing-section">
      <article class="landing-card">
        <p class="landing-subtext">Actions</p>
        <div class="landing-actions landing-actions-stack">
          <a class="landing-button" href="#/profile-edit">Edit Profile</a>
          <button class="landing-button secondary" type="button" data-action="profile-logout">Log Out</button>
        </div>
      </article>
    </section>
  `;
}

export function renderProfilePage(state = getState()) {
  let isLoading = true;
  const profile = state.profile || {};
  const auth = getAuth();
  isLoading = false;
  if (!auth?.user && !profile.name) {
    const sections = `
      ${renderHeader('Friend')}
      ${renderErrorStateCard({
        title: 'No account detected',
        message: 'We could not find your signed-in details. Please log in again to manage your profile.',
        actionLabel: 'Back Home',
        actionHref: '#/'
      })}
    `;
    return renderPageShell(sections, { isLoading });
  }
  const displayName = auth.user?.name?.trim() || profile.name || 'Friend';
  const email = auth.user?.email?.trim() || profile.email || 'Email not set';
  const experience = profile.experience || 'Beginner';
  const goal = profile.goal || 'Build steady confidence';
  const gymxietyMode = typeof profile.gymxietyMode === 'boolean'
    ? profile.gymxietyMode
    : Boolean(auth.user?.profile?.gymxietyMode);

  if (!profile.goal && !profile.experience) {
    const sections = `
      ${renderHeader(displayName)}
      ${wrapProfileContent(renderEmptyStateCard({
        title: 'Profile not set up',
        message: 'Add your basics so we can personalize every calm plan.',
        actionLabel: 'Edit Profile',
        actionHref: '#/profile-edit'
      }))}
    `;
    return renderPageShell(sections, { isLoading });
  }

  const profileContent = `
    ${renderProfileCard({ name: displayName, email, experience, goal, gymxietyMode })}
    ${renderPreferenceCard({
      equipment: profile.equipment,
      location: profile.location,
      nextWorkout: state.program?.nextWorkout
    })}
    ${renderActionsSection()}
  `;

  const sections = `
    ${renderHeader(displayName)}
    ${wrapProfileContent(profileContent)}
  `;

  return renderPageShell(sections, { isLoading });
}

export function attachProfilePageEvents(root) {
  revealPageContent(root);
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  const cards = root.querySelectorAll('[data-profile-card]');
  cards.forEach((card, index) => {
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add('visible'), 60 * index);
    });
  });
  const logoutButton = root.querySelector('[data-action="profile-logout"]');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logout();
      window.location.hash = '#/';
    });
  }

  const auth = getAuth();
  const state = getState();
  const profile = state.profile || {};
  const status = profile.subscription_status ?? auth.subscriptionStatus ?? 'inactive';
  let normalizedProfile = {
    subscription_status: normalizeStatus(status) || 'inactive',
    current_period_end: profile.current_period_end ?? auth.currentPeriodEnd ?? null
  };

  if (auth?.user) {
    updateProfileMessage(auth.user, normalizedProfile);
    const cancelBtn = document.getElementById('cancel-subscription-btn');
    if (cancelBtn) {
      if (canAttemptPortal(normalizedProfile, auth.stripeCustomerId)) {
        cancelBtn.style.display = 'block';
        cancelBtn.onclick = () => openBillingPortal();
      } else {
        cancelBtn.style.display = 'none';
      }
    }
    if (!hasPortalAccess(normalizedProfile.subscription_status) || needsBillingRefresh(normalizedProfile)) {
      refreshBillingMetadata(auth.user, cancelBtn, auth.stripeCustomerId).then(updated => {
        if (updated) {
          normalizedProfile = updated;
        }
      });
    }
  }
}
