import { initRenderer } from './render.js';
import {
  initializeState,
  getState,
  setState,
  subscribe,
  SEX_OPTIONS
} from '../logic/state.js';
import {
  calculateWorkoutStats,
  generateStructuredPlan,
  calculateMaintenanceCalories,
  getWeeklyChartHeights,
  getMuscleGroups,
  getEquipmentList,
  createPlannerPlan,
  storePlannerResult,
  handlePlanFeedback,
  recordWorkoutCompletion
} from '../logic/workout.js';
import {
  escapeHTML,
  cleanInput,
  sanitizeNumberInput,
  normalizeSelection,
  clamp
} from '../utils/helpers.js';
import { renderWorkoutSummary } from './workoutSummary.js';
import { renderProgramGeneratorLanding } from './landingProgramGenerator.js';
import { renderExerciseLibraryLanding } from './landingExerciseLibrary.js';
import { renderWorkoutSummaryLanding } from './landingWorkoutSummary.js';
import { renderAboutLanding } from './landingAbout.js';
import { renderContactLanding } from './landingContact.js';
import { renderPricingLanding } from './landingPricing.js';
import { renderStartTrial } from './landingStartTrial.js';
import { renderCreateAccount } from './landingCreateAccount.js';
import { renderWelcome } from './landingWelcome.js';
import { renderNavbar } from './navbar.js';
import { renderFooter } from './footer.js';
import { protectRoute, redirectIfLoggedIn } from '../auth/guard.js';
import { isLoggedIn } from '../auth/state.js';
import { renderNotFound } from '../router/404.js';

const AUTH_EVENT_NAME = 'aaa-auth-changed';

const ROUTE_HASHES = {
  home: '#/',
  planner: '#/planner',
  'plan-generator': '#/plan-generator',
  dashboard: '#/dashboard',
  profile: '#/profile',
  subscribe: '#/subscribe',
  onboarding: '#/onboarding',
  'program-generator': '#/program-generator',
  'exercise-library': '#/exercise-library',
  'workout-summary': '#/workout-summary',
  about: '#/about',
  contact: '#/contact',
  'start-trial': '#/start-trial',
  'create-account': '#/create-account',
  welcome: '#/welcome',
  pricing: '#/pricing',
  timer: '#/timer',
  'progress-tracking': '#/progress-tracking',
  'beginner-onboarding': '#/beginner-onboarding',
  'relaxed-training': '#/relaxed-training',
  '404': '#/404'
};

const BASE_STYLES = `
  :root {
    --accent: #9ae6b4;
    --accent-dark: #3c9b74;
    --bg: #050d0b;
    --panel: #0f201d;
    --panel-light: #16302b;
    --text: #fcfffc;
    --muted: #d8f3e6;
    --border: rgba(210, 255, 234, 0.4);
    --success: #a7fad2;
  }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Segoe UI', 'Inter', sans-serif;
  background: radial-gradient(circle at top, rgba(127,198,162,0.22), transparent 55%), var(--bg);
  color: var(--text);
}
a { color: inherit; text-decoration: none; }
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(16px);
  background: rgba(12,24,22,0.86);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 14px 32px rgba(0,0,0,0.45);
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}
.brand img {
  height: 72px;
  width: auto;
  border-radius: 10px;
}
.brand h1 {
  font-size: 1.1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  color: var(--accent);
}
.nav-links {
  display: flex;
  gap: 18px;
  font-size: 0.95rem;
  color: var(--muted);
  flex-wrap: wrap;
  justify-content: flex-end;
}
.nav-public {
  align-items: center;
  gap: 14px;
}
.nav-app {
  align-items: center;
}
.nav-features {
  position: relative;
}
.nav-features summary {
  list-style: none;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.18);
  color: var(--muted);
}
.nav-features summary::-webkit-details-marker {
  display: none;
}
.nav-feature-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  background: rgba(12,22,22,0.96);
  border: 1px solid rgba(176,255,221,0.22);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 240px;
  box-shadow: 0 22px 50px rgba(0,0,0,0.55);
}
.nav-feature-panel a {
  padding: 6px 8px;
  border-radius: 8px;
  color: #f1fff8;
}
.nav-feature-panel a:hover {
  background: rgba(127,198,162,0.15);
}
.nav-trial {
  font-weight: 600;
}
.cta-btn {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--accent);
  color: var(--text);
  background: linear-gradient(120deg, var(--accent), var(--accent-dark));
  font-weight: 600;
}
.page-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}
.plan-shell {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.plan-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}
.plan-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
}
.plan-today-card h2 {
  margin: 8px 0 4px;
  font-size: clamp(1.8rem, 4vw, 2.3rem);
}
.plan-today-card p { color: var(--muted); margin: 4px 0; }
.plan-stats {
  display: flex;
  gap: 18px;
  margin-top: 18px;
  flex-wrap: wrap;
}
.plan-stats div {
  background: rgba(127,198,162,0.08);
  border-radius: 14px;
  padding: 12px 16px;
  min-width: 110px;
}
.plan-upcoming-card h3 { margin-top: 0; }
.plan-upcoming-list {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.plan-upcoming-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px dashed var(--border);
  border-radius: 14px;
  color: var(--muted);
}
.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}
.week-column {
  background: rgba(255,255,255,0.035);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.week-column h4 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}
.deload-pill {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.workout-card {
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  padding: 18px;
  background: var(--panel-light);
  box-shadow: 0 18px 45px rgba(0,0,0,0.35);
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s ease, filter 0.2s ease;
}
.workout-card.locked {
  filter: grayscale(0.3) brightness(0.85);
}
.workout-card.locked::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(10,18,20,0.55);
  border-radius: 18px;
  pointer-events: none;
}
.workout-card.active {
  border-color: var(--accent);
  filter: none;
}
.workout-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.workout-focus { margin: 4px 0 8px; color: var(--muted); font-size: 0.9rem; }
.progression-note { margin: 0 0 12px; color: var(--muted); font-size: 0.9rem; }
.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 2;
}
.exercise-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.exercise-row:last-child { border-bottom: none; }
.exercise-cue { margin: 2px 0 0; color: var(--muted); font-size: 0.85rem; }
.exercise-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  font-size: 0.85rem;
}
.exercise-meta input {
  width: 90px;
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 6px 8px;
  background: rgba(255,255,255,0.05);
  color: var(--text);
  text-align: center;
}
.exercise-meta input:disabled { opacity: 0.6; }
.plan-toast {
  position: sticky;
  bottom: 18px;
  align-self: flex-end;
  background: rgba(11,22,22,0.82);
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}
.plan-toast.visible {
  opacity: 1;
  transform: translateY(0);
}
.relaxed-section {
  margin-top: 36px;
  padding: 36px;
  border-radius: 24px;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(176,255,221,0.18);
  box-shadow: 0 28px 58px rgba(0,0,0,0.38);
}
.relaxed-header {
  text-align: center;
  margin-bottom: 36px;
}
.relaxed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.relaxed-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;
}
.relaxed-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}
.subscription-section {
  margin-top: 32px;
  padding: 36px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(20,40,38,0.95), rgba(28,60,54,0.9));
  border: 1px solid rgba(176,255,221,0.2);
  box-shadow: 0 28px 58px rgba(0,0,0,0.42);
}
.subscription-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.subscription-card {
  background: rgba(8,18,18,0.35);
  border: 1px solid rgba(176,255,221,0.18);
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.35);
}
.subscription-cta {
  padding: 14px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #a5e8c7, #54a887);
  color: #06251d;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 22px 40px rgba(32,110,86,0.4);
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(127,198,162,0.2);
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
form label.option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 4px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--panel-light);
  cursor: pointer;
  font-size: 0.9rem;
}
.toggle-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.85rem;
}
.primary-btn {
  display: inline-flex;
  justify-content: center;
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  margin-top: 14px;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
  margin-top: 32px;
}
.info-card {
  padding: 18px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--panel-light);
}
.plan-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text);
}
.plan-table th,
.plan-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}
.plan-table th {
  text-align: left;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: var(--muted);
}
.plan-table tbody tr:hover {
  background: rgba(127,198,162,0.08);
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
  gap: 16px;
}
.summary-card {
  padding: 18px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--panel-light);
}
.onboarding-panel {
  max-width: 720px;
  margin: 0 auto;
}
.onboarding-form {
  display: grid;
  gap: 16px;
}
.onboarding-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.option-chip-fieldset {
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 14px;
  padding: 10px 16px 16px;
  margin: 0;
  min-width: 0;
}
.option-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}
.option-chip {
  display: inline-flex;
  align-items: center;
}
.option-chip input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.option-chip span {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.18);
  padding: 8px 16px;
  font-size: 0.95rem;
  background: rgba(255,255,255,0.05);
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}
.option-chip input:checked + span {
  border-color: var(--accent);
  background: rgba(127,198,162,0.2);
  color: var(--text);
  font-weight: 600;
}
.profile-shell {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.profile-summary-card {
  background: linear-gradient(145deg, #111f1c, #1c342f);
  color: var(--text);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(176,255,221,0.2);
  box-shadow: 0 24px 52px rgba(0,0,0,0.45);
}
.profile-pill {
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(127,198,162,0.2);
  color: var(--accent);
  font-weight: 600;
  border: 1px solid rgba(176,255,221,0.32);
}
.profile-meta {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 18px;
}
.profile-meta-item {
  background: rgba(255,255,255,0.9);
  border-radius: 18px;
  padding: 16px 18px;
  border: 1px solid rgba(15,23,42,0.08);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}
.profile-program-card {
  background: linear-gradient(135deg, #0f221f, #1f3d35 55%, #3c8f6b 95%);
  border-radius: 28px;
  padding: 34px 32px;
  color: var(--text);
  box-shadow: 0 35px 70px rgba(0,0,0,0.52);
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.program-progress {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.2);
  overflow: hidden;
}
.program-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--success);
}
.program-start-btn {
  border: none;
  border-radius: 18px;
  padding: 18px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 20px 40px rgba(13,18,37,0.35);
}
.program-start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 46px rgba(13,18,37,0.45);
}
.profile-progress-card {
  background: var(--panel-light);
  border-radius: 22px;
  padding: 28px 30px;
  border: 1px solid var(--border);
  box-shadow: 0 20px 48px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.progress-mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 80px;
}
.progress-mini-chart span {
  flex: 1;
  background: rgba(255,255,255,0.18);
  border-radius: 999px 999px 6px 6px;
  min-width: 8px;
}
.profile-settings-card {
  background: rgba(255,255,255,0.04);
  border-radius: 18px;
  padding: 22px 24px;
  border: 1px dashed rgba(255,255,255,0.2);
  color: var(--muted);
}
.profile-settings-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}
.settings-link {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 0.9rem;
  color: var(--muted);
  background: transparent;
  text-decoration: none;
}
.profile-settings-forms {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.settings-inline-form {
  background: rgba(0,0,0,0.25);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  display: grid;
  gap: 12px;
}
.settings-inline-form input,
.settings-inline-form textarea,
.settings-inline-form select {
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.15);
  color: var(--text);
  padding: 10px 12px;
  font-size: 0.95rem;
}
.settings-inline-form textarea {
  min-height: 72px;
  resize: vertical;
}
.settings-inline-form button {
  justify-self: flex-start;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  padding: 8px 18px;
  font-size: 0.85rem;
  cursor: pointer;
}
.settings-inline-form button:hover {
  border-color: var(--accent);
  color: var(--accent);
}
footer {
  text-align: center;
  color: var(--muted);
  font-size: 0.8rem;
  padding: 24px 0 32px;
}
@media (max-width: 900px) {
  .header-inner { flex-direction: column; gap: 12px; }
  .nav-links { justify-content: center; }
  .page-shell { padding: 36px 18px 64px; }
  .relaxed-section { padding: 32px 22px; }
  .subscription-section { padding: 32px 22px; }
  .plan-overview { grid-template-columns: 1fr; }
  .plan-card { padding: 24px; }
  .plan-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .plan-stats { flex-direction: column; }
  .plan-upcoming-list li { justify-content: flex-start; }
}
@media (max-width: 640px) {
  form label.option { width: 100%; justify-content: flex-start; }
  .plan-table { font-size: 0.85rem; }
  .plan-grid { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .page-shell { padding: 28px 14px 56px; }
  .plan-card { padding: 20px; }
  .plan-upcoming-list li { flex-direction: column; align-items: flex-start; }
  .exercise-row { flex-direction: column; align-items: flex-start; }
  .exercise-meta { width: 100%; flex-direction: row; justify-content: space-between; }
  .exercise-meta input { width: 100%; }
  .subscription-pricing { align-items: flex-start; }
  .pricing-amounts { width: 100%; justify-content: space-between; }
}
`;

const HOME_PILLARS = [
  'Short, confidence-building workouts',
  'Plain-language cues and etiquette tips',
  'Progress gentle enough for nervous starters'
];

const HOME_STATS = [
  { label: 'Average session', value: '~28 min' },
  { label: 'Experience needed', value: 'Day-one' },
  { label: 'Tone', value: 'Soft + encouraging' }
];

const HOME_BENEFITS = [
  'Tiny tutorials teach etiquette, pacing, and breathing.',
  'Planner and landings share the same calm layout.',
  'Soft reminders keep you consistent without shouting.'
];

const HOME_CALM_POINTS = [
  'Made for beginners who want a plan without stress.',
  'Eases gym nerves with short, clear workouts.',
  'No complicated numbers, no confusing talk, no overload.',
  'Every screen keeps things obvious, calm, and easy.'
];

let latestProgramLanding = null;
let latestExerciseLanding = null;
let latestWorkoutLanding = null;
let latestAboutLanding = null;
let latestContactLanding = null;
let latestPricingLanding = null;
let latestStartTrialLanding = null;
let latestCreateAccountLanding = null;
let latestWelcomeLanding = null;
let latestNotFoundLanding = null;

const ROUTES = {
  home: { render: renderHome },
  planner: {
    render: (...args) => protectRoute(() => renderPlanner(...args)),
    afterRender: (...args) => protectRoute(() => attachPlannerEvents(...args))
  },
  'plan-generator': {
    render: (...args) => protectRoute(() => renderPlanGenerator(...args)),
    afterRender: (...args) => protectRoute(() => attachPlanGeneratorEvents(...args))
  },
  dashboard: {
    render: (...args) => protectRoute(() => renderDashboard(...args))
  },
  profile: {
    render: (...args) => protectRoute(() => renderProfile(...args)),
    afterRender: (...args) => protectRoute(() => attachProfileEvents(...args))
  },
  subscribe: { render: renderSubscribe, afterRender: attachSubscribeEvents },
  pricing: {
    render: () => {
      latestPricingLanding = renderPricingLanding({ standalone: false, includeFooter: false });
      return latestPricingLanding.html;
    },
    afterRender: root => {
      if (latestPricingLanding?.afterRender) {
        latestPricingLanding.afterRender(root);
      }
    }
  },
  onboarding: { render: renderOnboarding, afterRender: attachOnboardingEvents },
  'program-generator': {
    render: () => {
      latestProgramLanding = renderProgramGeneratorLanding({ standalone: false, includeFooter: false });
      return latestProgramLanding.html;
    },
    afterRender: root => {
      if (latestProgramLanding?.afterRender) {
        latestProgramLanding.afterRender(root);
      }
    }
  },
  'exercise-library': {
    render: () => {
      latestExerciseLanding = renderExerciseLibraryLanding({ standalone: false, includeFooter: false });
      return latestExerciseLanding.html;
    },
    afterRender: root => {
      if (latestExerciseLanding?.afterRender) {
        latestExerciseLanding.afterRender(root);
      }
    }
  },
  'workout-summary': {
    render: () => {
      latestWorkoutLanding = renderWorkoutSummaryLanding({ standalone: false, includeFooter: false });
      return latestWorkoutLanding.html;
    },
    afterRender: root => {
      if (latestWorkoutLanding?.afterRender) {
        latestWorkoutLanding.afterRender(root);
      }
    }
  },
  about: {
    render: () => {
      latestAboutLanding = renderAboutLanding({ standalone: false, includeFooter: false });
      return latestAboutLanding.html;
    },
    afterRender: root => {
      if (latestAboutLanding?.afterRender) {
        latestAboutLanding.afterRender(root);
      }
    }
  },
  contact: {
    render: () => {
      latestContactLanding = renderContactLanding({ standalone: false, includeFooter: false });
      return latestContactLanding.html;
    },
    afterRender: root => {
      if (latestContactLanding?.afterRender) {
        latestContactLanding.afterRender(root);
      }
    }
  },
  'start-trial': {
    render: () => {
      if (redirectIfLoggedIn()) {
        return null;
      }
      latestStartTrialLanding = renderStartTrial({ standalone: false, includeFooter: false });
      return latestStartTrialLanding.html;
    },
    afterRender: root => {
      if (latestStartTrialLanding?.afterRender) {
        latestStartTrialLanding.afterRender(root);
      }
    }
  },
  'create-account': {
    render: () => {
      if (redirectIfLoggedIn()) {
        return null;
      }
      latestCreateAccountLanding = renderCreateAccount({ standalone: false, includeFooter: false });
      return latestCreateAccountLanding.html;
    },
    afterRender: root => {
      if (latestCreateAccountLanding?.afterRender) {
        latestCreateAccountLanding.afterRender(root);
      }
    }
  },
  welcome: {
    render: () => {
      if (redirectIfLoggedIn()) {
        return null;
      }
      latestWelcomeLanding = renderWelcome({ standalone: false, includeFooter: false });
      return latestWelcomeLanding.html;
    },
    afterRender: root => {
      if (latestWelcomeLanding?.afterRender) {
        latestWelcomeLanding.afterRender(root);
      }
    }
  },
  timer: { render: () => renderFeaturePlaceholder('Calm Timer', 'Gentle timers keep you breathing at a relaxed pace between sets and circuits.') },
  'progress-tracking': { render: () => renderFeaturePlaceholder('Progress Tracking', 'Soft streaks, session notes, and encouragement nudges help you stay consistent without pressure.') },
  'beginner-onboarding': { render: () => renderFeaturePlaceholder('Beginner Onboarding', 'Step-by-step setup that explains gym etiquette, equipment, and pacing in calm language.') },
  'relaxed-training': { render: () => renderFeaturePlaceholder('Relaxed Training Philosophy', 'Learn our slow-and-steady approach that favors confidence over intensity.') },
  '404': {
    render: () => {
      latestNotFoundLanding = renderNotFound({ standalone: false, includeFooter: false });
      return latestNotFoundLanding.html;
    },
    afterRender: root => {
      if (latestNotFoundLanding?.afterRender) {
        latestNotFoundLanding.afterRender(root);
      }
    }
  }
};

export function startApp() {
  initializeState();
  injectBaseStyles();
  const renderer = initRenderer('#app');

  const renderCurrentRoute = () => {
    const state = getState();
    const requested = parseRoute(window.location.hash);
    const routeKey = ROUTES[requested] ? requested : '404';
    const routeConfig = ROUTES[routeKey];
    const content = routeConfig.render(state, routeKey);
    if (content === null) {
      return;
    }
    const shellHtml = renderShell(routeKey, state, content);
    renderer.render(shellHtml, root => {
      if (typeof routeConfig.afterRender === 'function') {
        routeConfig.afterRender(root, state, routeKey);
      }
    });
  };

  window.addEventListener('hashchange', renderCurrentRoute);
  window.addEventListener(AUTH_EVENT_NAME, renderCurrentRoute);
  subscribe(renderCurrentRoute);
  renderCurrentRoute();
}

function injectBaseStyles() {
  if (document.getElementById('aaa-inline-styles')) {
    return;
  }
  const style = document.createElement('style');
  style.id = 'aaa-inline-styles';
  style.textContent = BASE_STYLES;
  document.head.append(style);
}

function parseRoute(hash) {
  if (!hash || hash === '#/' || hash === '#') {
    return 'home';
  }
  return hash.replace(/^#\/?/, '');
}

function navigateTo(route) {
  const targetHash = ROUTE_HASHES[route] || ROUTE_HASHES.home;
  if (window.location.hash === targetHash) {
    return;
  }
  window.location.hash = targetHash;
}

function renderShell(route, state, content) {
  const nav = renderNavbar(route, ROUTE_HASHES);

  return `
    <header class="site-header">
      <div class="header-inner">
        <div class="brand">
          <img src="/images/allaround-athlete-logo.png" alt="AllAroundAthlete Logo">
          <h1>All-Around Athlete</h1>
        </div>
        ${nav}
      </div>
    </header>
    <main class="page-shell">${content}</main>
    ${renderFooter()}
  `;
}

function renderFeaturePlaceholder(title, description) {
  return `
    <section class="panel" style="margin-top:32px;">
      <span class="badge">Feature Preview</span>
      <h2 style="margin:12px 0 8px;">${escapeHTML(title)}</h2>
      <p style="color:var(--muted);line-height:1.6;max-width:720px;">${escapeHTML(description)}</p>
      <a class="cta-btn" href="${ROUTE_HASHES['start-trial']}" style="display:inline-flex;margin-top:18px;">Start Trial</a>
    </section>
  `;
}

function resolvePrimaryCta(state) {
  if (!isLoggedIn()) {
    return { href: ROUTE_HASHES['start-trial'] || '#/start-trial', label: 'Start free trial' };
  }
  if (!state.profile.onboardingComplete) {
    return { href: ROUTE_HASHES.dashboard, label: 'Continue setup' };
  }
  return { href: ROUTE_HASHES.dashboard, label: 'Go to Dashboard' };
}

function renderHome(state) {
  const cta = resolvePrimaryCta(state);
  return `
    <section class="landing-hero">
      <div class="landing-hero-content">
        <span class="landing-tag">Beginner friendly</span>
        <h1>Structure without stress for brand-new lifters.</h1>
        <p class="landing-subtext lead">The only beginner app that swaps loud, crowded advice for calm, plain steps.</p>
        <p>Other starter tools assume you already speak gym; we slow everything down. You get short workouts, soft words, and zero pressure—plus tiny etiquette nudges so walking in feels natural.</p>
        <ul class="landing-list landing-list-check">
          ${HOME_BENEFITS.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
        </ul>
        <div class="landing-pill-list">
          ${HOME_PILLARS.map(point => `<span class="landing-pill">${escapeHTML(point)}</span>`).join('')}
        </div>
        <div class="landing-actions">
          <a class="landing-button" href="${cta.href}">${cta.label}</a>
          <a class="landing-button secondary" href="#relaxed">Learn More</a>
        </div>
      </div>
      <div class="landing-hero-aside">
        <div class="landing-card emphasis">
          <div class="landing-label">Why it stays calm</div>
          <ul class="landing-list landing-list-check">
            ${HOME_CALM_POINTS.map(point => `<li>${escapeHTML(point)}</li>`).join('')}
          </ul>
        </div>
        <div class="landing-card landing-card-compact">
          <div class="landing-label">What to expect</div>
          <div class="landing-stat-list">
            ${HOME_STATS.map(stat => `
              <div class="landing-stat">
                <strong>${escapeHTML(stat.value)}</strong>
                <span>${escapeHTML(stat.label)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
    <section class="relaxed-section" id="relaxed">
      <div class="relaxed-header">
        <h3>A Relaxed Approach to Fitness</h3>
        <p>AllAroundAthlete is a calm corner of the gym world. We keep steps tiny, words soft, and guidance steady so you can focus on just showing up.</p>
      </div>
      <div class="relaxed-grid">
        <article class="relaxed-card">
          <div class="relaxed-icon" aria-hidden="true">🌿</div>
          <h4>No overwhelming choices</h4>
          <p>We pick a handful of moves for you, explain why they matter, and remove extra buttons so you can press start without second-guessing.</p>
        </article>
        <article class="relaxed-card">
          <div class="relaxed-icon" aria-hidden="true">🔢</div>
          <h4>No complicated metrics</h4>
          <p>You will never see mystery charts or math puzzles. Just plain reps, sets, and soft reminders to breathe and move with control.</p>
        </article>
        <article class="relaxed-card">
          <div class="relaxed-icon" aria-hidden="true">🧭</div>
          <h4>Simple, guided workouts</h4>
          <p>Each session feels like a friend texting you what to do next. Short cues, gentle pacing, and check-ins keep you grounded from warm-up to finisher.</p>
        </article>
        <article class="relaxed-card">
          <div class="relaxed-icon" aria-hidden="true">💛</div>
          <h4>Designed for gym anxiety</h4>
          <p>Etiquette nudges, shared-space tips, and calm language help you walk in with confidence even if gyms have felt scary before.</p>
        </article>
      </div>
    </section>
    <section class="subscription-section" id="subscription-benefits">
      <div class="subscription-header">
        <h3>What You Get With Your Subscription</h3>
        <p>Unlock every calm tool we build—designed for brand-new lifters who want structure without stress.</p>
      </div>
      <div class="subscription-grid">
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">🧩</div>
          <h4>Personalized training plan</h4>
          <p>We match your goals and available equipment to short sessions you can actually finish.</p>
        </article>
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">📋</div>
          <h4>Beginner-friendly workouts</h4>
          <p>Each move comes with simple cues, tempo notes, and manners tips so you always know what to do.</p>
        </article>
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">🍽️</div>
          <h4>Maintenance calorie calculator</h4>
          <p>Dial in portions with a calm, plain calculator made for real life schedules.</p>
        </article>
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">📈</div>
          <h4>Progress tracking & check-ins</h4>
          <p>Weekly nudge reminders and streak views keep you accountable without pressure.</p>
        </article>
        <article class="subscription-card">
          <div class="subscription-icon" aria-hidden="true">🚀</div>
          <h4>Future modules unlocked</h4>
          <p>Gain access to every new pack we ship—running prep, mobility resets, and hybrid training.</p>
        </article>
      </div>
      <div class="subscription-pricing">
        <div class="pricing-copy">
          <h4>Try it free, stay for the calm coaching.</h4>
          <p>$7.99 per month or $49.99 per year after the trial.</p>
        </div>
        <div class="pricing-amounts">
          <span>$7.99/mo</span>
          <span>$49.99/yr</span>
        </div>
        <a class="subscription-cta" href="${cta.href}">${cta.label}</a>
      </div>
    </section>
    <section class="landing-section landing-cta">
      <p class="landing-subtext">Ready when you are</p>
      <h2>Start your calm routine today</h2>
      <p>Tap in for the beginner-friendly planner, exercise walk-throughs, and Gymxiety Mode support—all wrapped in one gentle membership.</p>
      <div class="landing-actions">
        <a class="landing-button" href="${ROUTE_HASHES.subscribe}">Start free trial</a>
        <a class="landing-button secondary" href="${ROUTE_HASHES.pricing}">See pricing</a>
      </div>
    </section>
  `;
}

function renderPlanner(state) {
  const equipmentOptions = getEquipmentList().map(eq => `
    <label class="option" data-equip="${escapeHTML(eq)}">
      <input type="checkbox" name="equipment" value="${escapeHTML(eq)}">
      ${escapeHTML(eq)}
    </label>
  `).join('');

  const muscleOptions = getMuscleGroups().map(mg => `
    <label class="option" data-muscle="${escapeHTML(mg)}">
      <input type="checkbox" name="muscle" value="${escapeHTML(mg)}">
      ${escapeHTML(mg)}
    </label>
  `).join('');

  const plannerResult = state.ui?.plannerResult || null;

  return `
    <section class="panel" style="margin-bottom:28px;">
      <div class="hero-copy">
        <span class="badge">Why another planner?</span>
        <h2 style="margin:12px 0 12px;">Most "beginner" apps assume you already speak gym fluently.</h2>
        <p style="color:var(--muted);line-height:1.6;max-width:820px;">
          They throw strange words at you, hand over long plans, and never explain what to do after you walk past the front desk. AllAroundAthlete keeps each screen calm, limits you to a few useful moves, and turns your goal into plain rep, set, and manners tips so you never feel out of place.
        </p>
      </div>
    </section>
    <section class="hero-grid">
      <div class="panel hero-copy">
        <span class="badge">Starter program</span>
        <h2>Build a realistic session with the gear you actually have.</h2>
        <p>AllAroundAthlete designs beginner-friendly workouts that respect limited equipment, short time windows, and fresh motivation. No fluff—just three to five purposeful movements with dialed-in rep and set targets.</p>
        <div class="info-grid">
          <div class="info-card">
            <small style="color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Goal Support</small>
            <h3 style="margin:6px 0 0;">Dieting & Bulking tracks</h3>
          </div>
          <div class="info-card">
            <small style="color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Smart Equipment</small>
            <h3 style="margin:6px 0 0;">Auto filters for beginners</h3>
          </div>
          <div class="info-card">
            <small style="color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Subscription ready</small>
            <h3 style="margin:6px 0 0;">Stripe + Cloudflare stack</h3>
          </div>
        </div>
      </div>
      <div class="panel">
        <h3 style="margin-top:0;">Plan your next lift</h3>
        <p style="color:var(--muted);margin-bottom:18px;">Choose the tools on hand and the muscle groups you want to prioritize today.</p>
        <form data-form="planner">
          <p style="margin-bottom:6px;font-weight:600;">Equipment</p>
          <button type="button" data-toggle-target="#equip-section" class="toggle-btn">Select equipment</button>
          <div id="equip-section" data-collapsible style="display:none;margin:12px 0 20px;">
            ${equipmentOptions}
          </div>
          <p style="margin-bottom:6px;font-weight:600;">Muscle Groups</p>
          <button type="button" data-toggle-target="#muscle-section" class="toggle-btn">Select muscle focus</button>
          <div id="muscle-section" data-collapsible style="display:none;margin:12px 0 20px;">
            ${muscleOptions}
          </div>
          <button type="submit" class="primary-btn">Generate plan</button>
        </form>
      </div>
    </section>
    <section class="hero-grid" style="margin-top:32px;" id="gymxiety">
      <div class="panel">
        <span class="badge">Gymxiety Mode</span>
        <h3 style="margin:12px 0 8px;">Confidence coaching built into the basic membership.</h3>
        <p style="color:var(--muted);line-height:1.6;">Automatic reminders, polite prompts, and gym-etiquette walk-throughs show up inside every plan once you subscribe. You will know how to approach equipment, share the space, and avoid those awkward “am I doing this right?” moments.</p>
        <p style="color:var(--muted);margin-top:18px;">Turn it on from your dashboard and Gymxiety Mode travels with you—whether it’s a commercial gym, apartment setup, or hotel fitness room.</p>
      </div>
      <div class="panel">
        <h3 style="margin-top:0;">Subscription ready</h3>
        <p style="color:var(--muted);line-height:1.6;">Hosted on Cloudflare for instant global performance and connected to Stripe for secure billing. When you upgrade, Gymxiety Mode unlocks set check-ins, etiquette micro-lessons, and equipment walkthroughs.</p>
        <div class="info-card" style="margin-top:18px;">
          <small style="color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Coming soon</small>
          <h3 style="margin:8px 0 0;">Add-on packs for commercial gyms, apartment gyms, and hotel gyms.</h3>
        </div>
      </div>
    </section>
    ${renderPlannerResult(plannerResult)}
  `;
}

function renderPlannerResult(result) {
  if (!result) {
    return '';
  }
  const planRows = result.planRows || [];
  const summary = result.summary || { movementCount: 0, focus: [], repRange: '', setsPerExercise: '', mode: '' };
  const planTable = planRows.length ? `
    <div style="overflow-x:auto;width:100%;">
      <table class="plan-table" style="min-width:960px;margin:auto;">
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Equipment</th>
            <th>Muscle Group</th>
            <th>Rep Range</th>
            <th>Sets</th>
            <th>Recommended Weight</th>
            <th>Description</th>
            <th>Demo</th>
          </tr>
        </thead>
        <tbody>
          ${planRows.map(row => `
            <tr>
              <td>${escapeHTML(row.exercise)}</td>
              <td>${escapeHTML(row.equipment)}</td>
              <td>${escapeHTML(row.muscle)}</td>
              <td>${escapeHTML(row.repRange)}</td>
              <td>${escapeHTML(row.sets)}</td>
              <td>${escapeHTML(row.recommendedWeight)}</td>
              <td style="max-width:320px;">${escapeHTML(row.description)}</td>
              <td>${row.video ? `<iframe width="160" height="90" src="${escapeHTML(row.video)}" title="${escapeHTML(row.exercise)} demo" frameborder="0" allowfullscreen style="border-radius:6px;"></iframe>` : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : '<p>No workouts available for selected equipment and muscle group.</p>';

  const feedbackPanel = planRows.length ? `
    <section class="panel plan-feedback-card">
      <h3 style="margin-top:0;">Did any set feel off?</h3>
      <p style="color:var(--muted);margin:6px 0 18px;">Select how each lift felt so we can gently adjust weight or reps next time.</p>
      <form data-form="plan-feedback" class="plan-feedback-form">
        ${planRows.map(row => `
          <div class="feedback-row" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:14px 0;border-bottom:1px solid var(--border);">
            <div>
              <strong>${escapeHTML(row.exercise)}</strong>
              <p class="feedback-subtext">${row.usesWeight ? 'Weight calibration' : 'Rep calibration'}</p>
            </div>
            <div class="feedback-options" style="display:flex;flex-wrap:wrap;gap:10px;">
              <label><input type="radio" name="feedback_${row.id}" value="too_easy" required> Too easy</label>
              <label><input type="radio" name="feedback_${row.id}" value="perfect"> Perfect</label>
              <label><input type="radio" name="feedback_${row.id}" value="too_hard"> Too hard</label>
            </div>
          </div>
        `).join('')}
        <button type="submit" class="primary-btn" style="margin-top:12px;">Save adjustments</button>
      </form>
    </section>
  ` : '';

  return `
    <section class="panel" style="margin-top:32px;">
      <h2 style="margin-top:0;">Session overview</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <small style="color:var(--muted);">Movements</small>
          <h3 style="margin:6px 0 0;">${summary.movementCount || 0}</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Focus</small>
          <h3 style="margin:6px 0 0;">${summary.focus?.slice(0, 2).map(escapeHTML).join(', ') || 'General'}</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Intensity</small>
          <h3 style="margin:6px 0 0;">${escapeHTML(summary.repRange || '')} · ${escapeHTML(summary.setsPerExercise || '')}</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Mode</small>
          <h3 style="margin:6px 0 0;">${escapeHTML(summary.mode || 'Dieting')}</h3>
        </div>
      </div>
    </section>
    <section class="panel" style="margin-top:24px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
        <div>
          <h2 style="margin:0;">Your custom gym plan</h2>
          <p style="color:var(--muted);margin:6px 0 0;">Purposeful lifts matched to your selected equipment.</p>
        </div>
        <a href="${ROUTE_HASHES.planner}" class="cta-btn" style="text-decoration:none;">Start over</a>
      </div>
      ${planTable}
    </section>
    ${feedbackPanel}
  `;
}

function renderPlanGenerator(state) {
  const planData = generateStructuredPlan(state.profile);
  const stats = calculateWorkoutStats();
  const maintenanceCalories = calculateMaintenanceCalories(state.profile);
  const weekly = planData.weeks.map(week => `
    <div class="week-column">
      <h4>Week ${week.weekNumber} ${week.isDeload ? '<span class="deload-pill">Deload</span>' : ''}</h4>
      <p style="color:var(--muted);margin:0 0 6px;">${week.isDeload ? 'Ease back on volume and focus on breathing.' : 'Add tiny reps or plates while staying calm.'}</p>
      ${week.workouts.map(workout => `
        <article class="workout-card locked" data-workout-card="${escapeHTML(workout.id)}">
          <div class="workout-card-top">
            <div>
              <p class="workout-name">${escapeHTML(workout.name)}</p>
              <p class="workout-focus">${escapeHTML(workout.focus)}</p>
            </div>
            <span class="lock-icon">🔒</span>
          </div>
          <p class="progression-note">${escapeHTML(workout.progression)}</p>
          <div class="exercise-list">
            ${workout.exercises.map(ex => `
              <div class="exercise-row">
                <div>
                  <p class="exercise-title">${escapeHTML(ex.name)}</p>
                  <p class="exercise-cue">${escapeHTML(ex.cue)}</p>
                </div>
                <div class="exercise-meta">
                  <span>${escapeHTML(String(ex.sets))} x ${escapeHTML(ex.reps)}</span>
                  <input type="text" placeholder="${escapeHTML(ex.weightPlaceholder)}" ${ex.allowWeight ? '' : 'disabled'}>
                </div>
              </div>
            `).join('')}
          </div>
        </article>
      `).join('')}
    </div>
  `).join('');

  const upcomingItems = planData.upcoming.slice(0, 5).map(item => `
    <li>
      <span role="img" aria-hidden="true">🔒</span>
      <span>${escapeHTML(item.label)}</span>
    </li>
  `).join('') || '<li>Fresh workouts will appear here after generation.</li>';

  const maintenanceCopy = maintenanceCalories ? `${maintenanceCalories} kcal` : 'Add stats';

  return `
    <section class="plan-shell" data-plan-shell data-today-id="${escapeHTML(planData.today.id)}">
      <div class="plan-overview">
        <div class="plan-card plan-today-card">
          <span class="badge">Your Plan</span>
          <p style="margin:8px 0 0;">Week 1 of ${planData.planLength}-week calm progression</p>
          <h2>${escapeHTML(planData.today.title)}</h2>
          <p>${escapeHTML(planData.today.focus)}</p>
          <p class="progression-note">${escapeHTML(planData.today.progression)}</p>
          <p class="progression-note" data-today-status>Locked until you press start.</p>
          <p style="color:var(--muted);font-size:0.9rem;margin-top:6px;">Goal: ${escapeHTML(planData.goalLabel)} · Equipment: ${escapeHTML(planData.equipmentLabel)}</p>
          <button class="primary-btn plan-start-btn" data-start-workout>Start Workout</button>
          <div class="plan-stats">
            <div>
              <small>Streak</small>
              <strong data-streak-count data-base-streak="${stats.streak}">${stats.streak}</strong>
            </div>
            <div>
              <small>Maintenance</small>
              <strong>${maintenanceCopy}</strong>
            </div>
            <div>
              <small>Days / Week</small>
              <strong>${planData.daysPerWeek}</strong>
            </div>
          </div>
        </div>
        <div class="plan-card plan-upcoming-card">
          <h3>Upcoming (locked)</h3>
          <ul class="plan-upcoming-list">
            ${upcomingItems}
          </ul>
          <p style="color:var(--muted);margin-top:12px;font-size:0.9rem;">Future sessions stay blurred until the day arrives.</p>
        </div>
      </div>
      <section class="plan-grid">
        ${weekly}
      </section>
      <div class="plan-toast" id="plan-toast" role="status" aria-live="polite"></div>
    </section>
  `;
}

function renderDashboard() {
  const userDuration = '3 weeks';
  const savedWorkouts = ['Push/Pull/Legs', 'Full Body Beginner', 'Upper Body Blast'];
  const deadliftMax = 315;
  const benchMax = 225;
  const squatMax = 275;
  const userWeight = 180;
  const userHeight = 70;

  return `
    <section class="panel" style="margin-bottom:28px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
        <div>
          <span class="badge">Member since</span>
          <h2 style="margin:10px 0 6px;">${userDuration} of consistent work</h2>
          <p style="color:var(--muted);max-width:520px;">Keep logging sessions to unlock premium periodization templates. Your subscription syncs automatically with Stripe, so upgrades are instant.</p>
        </div>
        <button class="cta-btn">Manage Subscription</button>
      </div>
      <div class="summary-grid" style="margin-top:24px;">
        <div class="summary-card">
          <small style="color:var(--muted);">Current Weight</small>
          <h3 style="margin:6px 0 0;">${userWeight} lbs</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Height</small>
          <h3 style="margin:6px 0 0;">${userHeight} in</h3>
        </div>
        <div class="summary-card">
          <small style="color:var(--muted);">Bench / Squat / Dead</small>
          <h3 style="margin:6px 0 0;">${benchMax}/${squatMax}/${deadliftMax} lbs</h3>
        </div>
      </div>
    </section>
    <section class="hero-grid" style="gap:24px;">
      <div class="panel">
        <h3 style="margin-top:0;">Saved workouts</h3>
        <p style="color:var(--muted);margin-top:4px;">Recently generated plans you bookmarked.</p>
        <ul style="margin:18px 0 0;padding-left:20px;line-height:1.8;">
          ${savedWorkouts.map(w => `<li>${escapeHTML(w)}</li>`).join('')}
        </ul>
      </div>
      <div class="panel">
        <h3 style="margin-top:0;">Next focus</h3>
        <p style="color:var(--muted);margin-top:4px;">Dial in your training priorities for the week.</p>
        <ul style="margin:18px 0 0;padding-left:20px;line-height:1.8;">
          <li>Update rep targets after next PR attempt</li>
          <li>Log cardio minutes in the mobile app</li>
          <li>Enable Cloudflare Gateway for faster loads</li>
        </ul>
      </div>
    </section>
  `;
}

function renderSubscribe(state) {
  if (!state.isSubscribed) {
    return `
      <section class="panel onboarding-panel">
        <span class="badge">Membership</span>
        <h2>Unlock the calm planner.</h2>
        <p class="onboarding-lede">We are not processing real payments inside this demo—tap the button below to simulate a subscription and move into onboarding.</p>
        <form data-form="subscribe" class="onboarding-form">
          <button class="primary-btn" type="submit">Confirm subscription</button>
        </form>
        <p style="color:var(--muted);margin-top:12px;font-size:0.9rem;">Need more info first? <a href="${ROUTE_HASHES.pricing}" style="color:var(--text);">Visit pricing.</a></p>
      </section>
    `;
  }

  const onboardingComplete = Boolean(state.profile?.onboardingComplete);
  const nextHref = onboardingComplete ? ROUTE_HASHES.planner : ROUTE_HASHES.onboarding;
  const nextLabel = onboardingComplete ? 'Go to planner' : 'Resume onboarding';
  const message = onboardingComplete
    ? 'You already unlocked every calm tool. Jump back into the planner or reset the demo to experience the subscription flow again.'
    : 'Subscription is active—finish onboarding to start building calm workouts, or reset the demo if you want to re-run the process.';

  return `
    <section class="panel onboarding-panel">
      <span class="badge">Membership</span>
      <h2>${onboardingComplete ? 'Membership active' : 'Almost there—complete setup'}</h2>
      <p class="onboarding-lede">${message}</p>
      <div class="onboarding-form" style="gap:12px;">
        <a class="primary-btn" href="${nextHref}" style="text-align:center;">${nextLabel}</a>
        <button type="button" class="toggle-btn" data-action="reset-membership">Reset demo state</button>
      </div>
    </section>
  `;
}

function renderOnboarding(state) {
  const profile = state.profile;
  const sexOptions = renderSexOptions('sex', profile.sex, true);
  return `
    <section class="panel onboarding-panel">
      <span class="badge">Welcome</span>
      <h2>Let's get acquainted first</h2>
      <p class="onboarding-lede">We ask for a few basics so every plan respects your goals, body, and available space. This stays private on your device.</p>
      <form class="onboarding-form" data-form="onboarding">
        <label>
          Primary goal
          <textarea name="goal" required placeholder="e.g., Build strength without burning out">${escapeHTML(profile.goal)}</textarea>
        </label>
        <div class="onboarding-grid">
          <label>
            Height (in)
            <input type="number" name="height" min="36" max="96" required value="${escapeHTML(profile.height || '')}">
          </label>
          <label>
            Weight (lbs)
            <input type="number" name="weight" min="70" max="600" required value="${escapeHTML(profile.weight || '')}">
          </label>
          <fieldset class="option-chip-fieldset">
            <legend>Sex</legend>
            <div class="option-chip-group">
              ${sexOptions}
            </div>
          </fieldset>
          <label>
            Age
            <input type="number" name="age" min="13" max="90" required value="${escapeHTML(profile.age || '')}">
          </label>
          <label>
            Location
            <input type="text" name="location" required value="${escapeHTML(profile.location || '')}" placeholder="City, State">
          </label>
        </div>
        <button class="primary-btn" type="submit">Save and continue</button>
      </form>
    </section>
  `;
}

function renderProfile(state) {
  const profileUser = state.profile;
  const programInfo = state.program;
  const stats = calculateWorkoutStats();
  const weeklyHeights = getWeeklyChartHeights();
  const programProgress = Math.min(100, Math.round((programInfo.currentWeek / programInfo.totalWeeks) * 100));
  const weightDisplay = profileUser.weight ? `${escapeHTML(profileUser.weight)} lbs` : 'Not set';
  const heightDisplay = profileUser.height ? `${escapeHTML(profileUser.height)} in` : 'Not set';
  const locationDisplay = profileUser.location ? escapeHTML(profileUser.location) : 'Not set';
  const ageSexParts = [];
  if (profileUser.age) {
    ageSexParts.push(`${escapeHTML(profileUser.age)} yrs`);
  }
  if (profileUser.sex) {
    ageSexParts.push(escapeHTML(profileUser.sex));
  }
  const ageSexDisplay = ageSexParts.length ? ageSexParts.join(' · ') : 'Not set';
  const profileSexChips = renderSexOptions('sex', profileUser.sex, true);

  return `
    <section class="profile-shell">
      <div class="profile-summary-card">
        <div class="profile-summary-top">
          <div>
            <p class="profile-eyebrow">Profile</p>
            <h2>${escapeHTML(profileUser.name)}</h2>
            <p class="profile-summary-subtitle">${escapeHTML(profileUser.subtitle)}</p>
          </div>
          <div class="profile-pill">Beginner Mode</div>
        </div>
        <div class="profile-meta">
          <div class="profile-meta-item">
            <span>Goal</span>
            <strong>${escapeHTML(profileUser.goal)}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Experience Level</span>
            <strong>${escapeHTML(profileUser.experience)}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Equipment</span>
            <strong>${escapeHTML(profileUser.equipment)}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Weight</span>
            <strong>${weightDisplay}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Height</span>
            <strong>${heightDisplay}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Age · Sex</span>
            <strong>${ageSexDisplay}</strong>
          </div>
          <div class="profile-meta-item">
            <span>Location</span>
            <strong>${locationDisplay}</strong>
          </div>
        </div>
      </div>
      <div class="profile-program-card">
        <div>
          <p class="program-label">Program</p>
          <div class="program-week-row" style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <h3>Week ${programInfo.currentWeek} of ${programInfo.totalWeeks}</h3>
          </div>
          <p class="program-subtitle">Next Workout: <span>${escapeHTML(programInfo.nextWorkout)}</span></p>
          <div class="program-progress">
            <div class="program-progress-fill" style="width:${programProgress}%;"></div>
          </div>
        </div>
        <form data-form="profile-start-workout">
          <button class="program-start-btn" type="submit">Start Today's Workout</button>
        </form>
      </div>
      <div class="profile-progress-card">
        <div>
          <p class="progress-eyebrow">Progress</p>
          <h3>Keeping it gentle and steady</h3>
          <p>Micro wins add up. Nothing fancy—just a calm snapshot.</p>
        </div>
        <div class="progress-metrics" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:18px;">
          <div class="progress-metric">
            <span>Workout Streak</span>
            <strong>${stats.streak} days</strong>
          </div>
          <div class="progress-metric">
            <span>Total Sessions</span>
            <strong>${stats.total}</strong>
          </div>
        </div>
        <div class="progress-mini-chart">
          ${weeklyHeights.map(val => `<span style="height:${val}%"></span>`).join('')}
        </div>
      </div>
      <div class="profile-settings-card">
        <h4>Tune the basics</h4>
        <p>Quick adjustments keep the plan feeling yours.</p>
        <div class="profile-settings-actions">
          <a href="#edit-profile" class="settings-link">Edit Profile</a>
          <a href="#change-goal" class="settings-link">Change Goal</a>
          <a href="#change-equipment" class="settings-link">Change Equipment</a>
        </div>
      </div>
      <div class="profile-settings-forms">
        <form id="edit-profile" class="settings-inline-form" data-form="profile-main">
          <label>
            Display Name
            <input type="text" name="name" value="${escapeHTML(profileUser.name)}" required>
          </label>
          <label>
            Experience Note
            <input type="text" name="experience" value="${escapeHTML(profileUser.experience)}" required>
          </label>
          <label>
            Subtitle
            <textarea name="subtitle" required>${escapeHTML(profileUser.subtitle)}</textarea>
          </label>
          <label>
            Height (in)
            <input type="number" name="height" min="36" max="96" value="${escapeHTML(profileUser.height || '')}" required>
          </label>
          <label>
            Weight (lbs)
            <input type="number" name="weight" min="70" max="600" value="${escapeHTML(profileUser.weight || '')}" required>
          </label>
          <fieldset class="option-chip-fieldset">
            <legend>Sex</legend>
            <div class="option-chip-group">
              ${profileSexChips}
            </div>
          </fieldset>
          <label>
            Age
            <input type="number" name="age" min="13" max="90" value="${escapeHTML(profileUser.age || '')}" required>
          </label>
          <label>
            Location
            <input type="text" name="location" value="${escapeHTML(profileUser.location || '')}" required>
          </label>
          <label>
            Current Week
            <input type="number" min="1" max="${programInfo.totalWeeks}" name="current_week" value="${programInfo.currentWeek}" required>
          </label>
          <label>
            Total Weeks
            <input type="number" min="1" name="total_weeks" value="${programInfo.totalWeeks}" required>
          </label>
          <label>
            Next Workout Name
            <input type="text" name="next_workout" value="${escapeHTML(programInfo.nextWorkout)}" required>
          </label>
          <button type="submit">Save Profile</button>
        </form>
        <form id="change-goal" class="settings-inline-form" data-form="profile-goal">
          <label>
            Goal statement
            <textarea name="goal" required>${escapeHTML(profileUser.goal)}</textarea>
          </label>
          <button type="submit">Update Goal</button>
        </form>
        <form id="change-equipment" class="settings-inline-form" data-form="profile-equipment">
          <label>
            Equipment on hand
            <textarea name="equipment" required>${escapeHTML(profileUser.equipment)}</textarea>
          </label>
          <button type="submit">Update Equipment</button>
        </form>
      </div>
    </section>
  `;
}

function renderSexOptions(fieldName, selectedValue, required = false) {
  return SEX_OPTIONS.map((option, index) => `
    <label class="option-chip">
      <input type="radio" name="${fieldName}" value="${option}" ${selectedValue === option ? 'checked' : ''} ${(required && index === 0) ? 'required' : ''}>
      <span>${option}</span>
    </label>
  `).join('');
}

function attachPlannerEvents(root) {
  root.querySelectorAll('[data-toggle-target]').forEach(button => {
    button.addEventListener('click', () => {
      const selector = button.getAttribute('data-toggle-target');
      const target = root.querySelector(selector);
      if (!target) {
        return;
      }
      const isHidden = target.style.display === 'none' || !target.style.display;
      target.style.display = isHidden ? 'block' : 'none';
    });
  });

  const form = root.querySelector('[data-form="planner"]');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      const equipment = data.getAll('equipment');
      const muscles = data.getAll('muscle');
      const plan = createPlannerPlan({ equipment, muscles });
      storePlannerResult(plan);
      renderWorkoutSummary();
    });
  }

  const feedbackForm = root.querySelector('[data-form="plan-feedback"]');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(feedbackForm);
      const feedback = {};
      for (const [key, value] of data.entries()) {
        if (key.startsWith('feedback_')) {
          feedback[key.replace('feedback_', '')] = value;
        }
      }
      handlePlanFeedback(feedback);
      feedbackForm.reset();
    });
  }
}

function attachPlanGeneratorEvents(root) {
  const shell = root.querySelector('[data-plan-shell]');
  if (!shell) {
    return;
  }
  const todayId = shell.getAttribute('data-today-id');
  const startBtn = root.querySelector('[data-start-workout]');
  const todayStatus = root.querySelector('[data-today-status]');
  const streakEl = root.querySelector('[data-streak-count]');
  const cards = Array.from(root.querySelectorAll('[data-workout-card]'));
  const toast = root.querySelector('#plan-toast');
  let unlockedId = null;

  const showToast = message => {
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2600);
  };

  const updateCards = () => {
    cards.forEach(card => {
      const icon = card.querySelector('.lock-icon');
      if (card.getAttribute('data-workout-card') === unlockedId) {
        card.classList.remove('locked');
        card.classList.add('active');
        if (icon) {
          icon.textContent = '🟢';
        }
      } else {
        card.classList.add('locked');
        card.classList.remove('active');
        if (icon) {
          icon.textContent = '🔒';
        }
      }
    });
  };

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (unlockedId || !todayId) {
        return;
      }
      unlockedId = todayId;
      updateCards();
      startBtn.disabled = true;
      startBtn.textContent = 'Workout in progress';
      if (todayStatus) {
        todayStatus.textContent = 'Unlocked · move at your own pace.';
      }
      if (streakEl) {
        const base = Number.parseInt(streakEl.getAttribute('data-base-streak') || '0', 10) || 0;
        streakEl.textContent = base + 1;
      }
      showToast("Today's workout unlocked. Breathe, then begin.");
    });
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-workout-card');
      if (unlockedId && id === unlockedId) {
        showToast('Session active. Scroll for cues.');
        return;
      }
      if (!unlockedId && id === todayId) {
        showToast('Press Start Workout to unlock today.');
        return;
      }
      showToast('This workout unlocks tomorrow.');
    });
  });

  updateCards();
}

function attachSubscribeEvents(root) {
  const form = root.querySelector('[data-form="subscribe"]');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      setState(prev => {
        prev.isSubscribed = true;
        prev.profile.onboardingComplete = false;
        return prev;
      });
      navigateTo('onboarding');
    });
  }

  const resetBtn = root.querySelector('[data-action="reset-membership"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      setState(prev => {
        prev.isSubscribed = false;
        prev.profile.onboardingComplete = false;
        return prev;
      });
      navigateTo('home');
    });
  }
}

function attachOnboardingEvents(root) {
  const form = root.querySelector('[data-form="onboarding"]');
  if (!form) {
    return;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    setState(prev => {
      prev.profile.goal = cleanInput(data.get('goal'), prev.profile.goal);
      const height = sanitizeNumberInput(data.get('height'), { min: 36, max: 96 });
      const weight = sanitizeNumberInput(data.get('weight'), { min: 70, max: 600 });
      const age = sanitizeNumberInput(data.get('age'), { min: 13, max: 90 });
      const sex = data.get('sex');
      if (height) {
        prev.profile.height = height;
      }
      if (weight) {
        prev.profile.weight = weight;
      }
      if (age) {
        prev.profile.age = age;
      }
      if (SEX_OPTIONS.includes(sex)) {
        prev.profile.sex = sex;
      }
      prev.profile.location = cleanInput(data.get('location'), prev.profile.location);
      prev.profile.onboardingComplete = true;
      return prev;
    });
    navigateTo('profile');
  });
}

function attachProfileEvents(root) {
  const startForm = root.querySelector('[data-form="profile-start-workout"]');
  if (startForm) {
    startForm.addEventListener('submit', event => {
      event.preventDefault();
      recordWorkoutCompletion();
    });
  }

  const mainForm = root.querySelector('[data-form="profile-main"]');
  if (mainForm) {
    mainForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(mainForm);
      setState(prev => {
        prev.profile.name = cleanInput(data.get('name'), prev.profile.name);
        prev.profile.experience = cleanInput(data.get('experience'), prev.profile.experience);
        prev.profile.subtitle = cleanInput(data.get('subtitle'), prev.profile.subtitle);
        const height = sanitizeNumberInput(data.get('height'), { min: 36, max: 96 });
        const weight = sanitizeNumberInput(data.get('weight'), { min: 70, max: 600 });
        const age = sanitizeNumberInput(data.get('age'), { min: 13, max: 90 });
        const sex = data.get('sex');
        if (height) {
          prev.profile.height = height;
        }
        if (weight) {
          prev.profile.weight = weight;
        }
        if (age) {
          prev.profile.age = age;
        }
        if (SEX_OPTIONS.includes(sex)) {
          prev.profile.sex = sex;
        }
        prev.profile.location = cleanInput(data.get('location'), prev.profile.location);
        prev.program.nextWorkout = cleanInput(data.get('next_workout'), prev.program.nextWorkout);
        const totalWeeks = Number.parseInt(data.get('total_weeks'), 10);
        if (Number.isFinite(totalWeeks) && totalWeeks > 0) {
          prev.program.totalWeeks = totalWeeks;
        }
        const currentWeek = Number.parseInt(data.get('current_week'), 10);
        if (Number.isFinite(currentWeek) && currentWeek > 0) {
          prev.program.currentWeek = clamp(currentWeek, 1, prev.program.totalWeeks);
        }
        return prev;
      });
    });
  }

  const goalForm = root.querySelector('[data-form="profile-goal"]');
  if (goalForm) {
    goalForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(goalForm);
      setState(prev => {
        prev.profile.goal = cleanInput(data.get('goal'), prev.profile.goal);
        return prev;
      });
    });
  }

  const equipmentForm = root.querySelector('[data-form="profile-equipment"]');
  if (equipmentForm) {
    equipmentForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(equipmentForm);
      setState(prev => {
        prev.profile.equipment = cleanInput(data.get('equipment'), prev.profile.equipment);
        return prev;
      });
    });
  }
}
