import { escapeHTML } from '../utils/helpers.js';
import { getState } from '../logic/state.js';
import { getAuth, logout } from '../auth/state.js';
import { updateProfileMessage } from '../js/profileStatus.js';
import { getSupabaseClient } from '../js/supabaseClient.js';
import { fetchSubscriptionStatus } from '../js/subscription.js';
import {
  renderEmptyStateCard,
  renderErrorStateCard,
  renderPageShell
} from '../components/stateCards.js';

// ─── Billing portal ──────────────────────────────────────────────────────────

export async function openBillingPortal() {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;
    if (!accessToken) throw new Error('Missing Supabase session');
    const res = await fetch('/functions/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({})
    });
    if (!res.ok) throw new Error(`Portal request failed: ${res.status}`);
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

// ─── Subscription helpers ────────────────────────────────────────────────────

const PORTAL_ELIGIBLE_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid']);

function normalizeStatus(status) {
  return typeof status === 'string' ? status.trim().toLowerCase() : '';
}

function hasPortalAccess(status) {
  return PORTAL_ELIGIBLE_STATUSES.has(normalizeStatus(status));
}

function canAttemptPortal(profile, stripeCustomerId) {
  return hasPortalAccess(profile?.subscription_status) || Boolean(stripeCustomerId);
}

function extractPeriodEndSeconds(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return Math.floor(numeric);
  }
  return null;
}

function hasValidPeriodEnd(value) {
  const s = extractPeriodEndSeconds(value);
  return typeof s === 'number' && s > 0;
}

function needsBillingRefresh(profile) {
  if (!profile) return false;
  return hasPortalAccess(profile.subscription_status) && !hasValidPeriodEnd(profile.current_period_end);
}

async function refreshBillingMetadata(user, cancelBtn, stripeCustomerId) {
  if (!user) return null;
  try {
    const latest = await fetchSubscriptionStatus();
    if (!latest) return null;
    const normalized = {
      subscription_status: normalizeStatus(latest.subscription_status) || 'inactive',
      current_period_end: latest.current_period_end ?? null
    };
    updateProfileMessage(user, normalized);
    if (cancelBtn) {
      const shouldShow = canAttemptPortal(normalized, stripeCustomerId);
      cancelBtn.style.display = shouldShow ? 'block' : 'none';
      if (shouldShow) cancelBtn.onclick = () => openBillingPortal();
    }
    return normalized;
  } catch (error) {
    console.error('Unable to refresh billing info', error);
    return null;
  }
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

const EXPERIENCE_LABELS = {
  brand_new: 'Brand new',
  returning_lifter: 'Returning lifter',
  inconsistent: 'Comfortable but inconsistent'
};

function formatExperience(value = '') {
  const key = value.toString().trim().toLowerCase();
  return EXPERIENCE_LABELS[key] || (value.trim() || null);
}

function calcDaysUsing(createdAt) {
  if (!createdAt) return null;
  const ms = typeof createdAt === 'number' ? createdAt : Date.parse(createdAt);
  if (isNaN(ms)) return null;
  const days = Math.max(0, Math.floor((Date.now() - ms) / 86400000));
  if (days === 0) return 'today';
  return days === 1 ? '1 day' : `${days} days`;
}

function readUserData(auth, profile) {
  return {
    name:        auth.user?.name?.trim()          || profile.name          || '',
    email:       auth.user?.email?.trim()          || profile.email         || '',
    experience:  auth.user?.experienceLevel        || profile.experienceLevel || profile.experience || '',
    goal:        auth.user?.goal                   || profile.goal          || '',
    createdAt:   auth.user?.created_at             || auth.user?.createdAt  || null
  };
}

// ─── Render helpers ───────────────────────────────────────────────────────────

function renderDetailRow(label, value) {
  return `
    <div>
      <p class="landing-subtext">${escapeHTML(label)}</p>
      <strong>${escapeHTML(value)}</strong>
    </div>
  `;
}

function renderProfileCard({ name, email, experience, goal, daysUsing }) {
  const experienceLabel = formatExperience(experience);
  return `
    <section class="landing-section">
      <article class="landing-card card-pop-in" data-profile-card>
        <h2 class="landing-card-title">${escapeHTML(name)}</h2>
        <p class="landing-subtext">${escapeHTML(email)}</p>
        <div class="landing-card-body profile-details">
          ${experienceLabel  ? renderDetailRow('Experience level', experienceLabel) : ''}
          ${goal             ? renderDetailRow('Primary goal', goal)               : ''}
          ${daysUsing        ? renderDetailRow('Using the app for', daysUsing)     : ''}
        </div>
      </article>
    </section>
  `;
}

function renderActionsCard() {
  return `
    <section class="landing-section">
      <article class="landing-card card-pop-in" data-profile-card>
        <div class="landing-actions landing-actions-stack">
          <a class="landing-button" href="#/profile-edit">Edit Profile</a>
          <button class="landing-button secondary" type="button" data-action="profile-logout">Log Out</button>
        </div>
      </article>
    </section>
  `;
}

function renderSubscriptionWidgets() {
  return `
    <section class="landing-section">
      <div class="profile-container">
        <div id="profile-message" class="profile-message" style="display:none;"></div>
        <div id="trial-progress-container" class="trial-progress-container" style="display:none;">
          <div id="trial-progress-bar" class="trial-progress-bar"></div>
        </div>
        <button id="cancel-subscription-btn" class="cancel-sub-btn" style="display:none;">
          Manage Subscription
        </button>
      </div>
    </section>
  `;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function renderProfilePage(state = getState()) {
  const profile = state.profile || {};
  const auth = getAuth();

  if (!auth?.user && !profile.name) {
    return renderPageShell(
      renderErrorStateCard({
        title: 'No account detected',
        message: 'We could not find your account details. Please log in again.',
        actionLabel: 'Log In',
        actionHref: '#/login'
      })
    );
  }

  const { name, email, experience, goal, createdAt } = readUserData(auth, profile);
  const daysUsing = calcDaysUsing(createdAt);

  if (!experience && !goal) {
    return renderPageShell(
      renderEmptyStateCard({
        title: 'Profile not set up yet',
        message: 'Add your basics so every plan stays personal.',
        actionLabel: 'Set Up Profile',
        actionHref: '#/profile-edit'
      })
    );
  }

  const sections = `
    <header class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Account</span>
        <h1>Your Profile</h1>
      </div>
    </header>
    ${renderProfileCard({ name, email, experience, goal, daysUsing })}
    ${renderActionsCard()}
    ${renderSubscriptionWidgets()}
  `;

  return renderPageShell(sections);
}

export function attachProfilePageEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }

  // Staggered fade-in for each card
  const cards = root.querySelectorAll('[data-profile-card]');
  cards.forEach((card, index) => {
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add('visible'), 80 * index);
    });
  });

  // Log out
  const logoutButton = root.querySelector('[data-action="profile-logout"]');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logout();
      window.location.hash = '#/';
    });
  }

  // Subscription status
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
        if (updated) normalizedProfile = updated;
      });
    }
  }
}
