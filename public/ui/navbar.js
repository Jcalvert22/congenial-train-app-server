import { getState } from '../logic/state.js';

const FEATURE_LINKS = [
	{ label: 'Workout Program Generator', route: 'program-generator' },
	{ label: 'Exercise Library', route: 'exercise-library' },
	{ label: 'Workout Summary', route: 'workout-summary' },
	{ label: 'Timer', route: 'timer' },
	{ label: 'Progress Tracking', route: 'progress-tracking' },
	{ label: 'Beginner Onboarding', route: 'beginner-onboarding' },
	{ label: 'Relaxed Training Philosophy', route: 'relaxed-training' }
];

const APP_NAV_LINKS = [
	{ label: 'Generate', route: 'planner' },
	{ label: 'Library', route: 'plan-generator' },
	{ label: 'History', route: 'dashboard' },
	{ label: 'Profile', route: 'profile' }
];

const PUBLIC_BASE_LINKS = [
	{ label: 'Home', route: 'home' },
	{ label: 'Pricing', route: 'pricing' }
];

export const FEATURE_ROUTES = FEATURE_LINKS.map(link => link.route);
export const PUBLIC_NAV_ROUTES = new Set([...FEATURE_ROUTES, 'home', 'pricing']);

function isAppMode(state) {
	return Boolean(state?.isSubscribed && state?.profile?.onboardingComplete);
}

function anchorHtml(label, routeKey, currentRoute, routeMap, extraClass = '') {
	const href = routeMap[routeKey] || '#/';
	const classes = [extraClass, routeKey === currentRoute ? 'active-link' : ''].filter(Boolean).join(' ');
	return `<a href="${href}" class="${classes}">${label}</a>`;
}

function renderFeaturesDropdown(currentRoute, routeMap) {
	const isOpen = FEATURE_ROUTES.includes(currentRoute) ? ' open' : '';
	const links = FEATURE_LINKS.map(link => anchorHtml(link.label, link.route, currentRoute, routeMap, 'nav-feature-link')).join('');
	return `
		<details class="nav-item nav-features"${isOpen}>
			<summary>Features</summary>
			<div class="nav-feature-panel">
				${links}
			</div>
		</details>
	`;
}

function renderPublicNav(currentRoute, routeMap) {
	const [home, pricing] = PUBLIC_BASE_LINKS.map(link => anchorHtml(link.label, link.route, currentRoute, routeMap));
	const trialHref = routeMap.subscribe || '#/subscribe';
	return `
		<nav class="nav-links nav-public">
			${home}
			${renderFeaturesDropdown(currentRoute, routeMap)}
			${pricing}
			<a href="${trialHref}" class="cta-btn nav-trial">Start Trial</a>
		</nav>
	`;
}

function renderAppNav(currentRoute, routeMap) {
	const links = APP_NAV_LINKS.map(link => anchorHtml(link.label, link.route, currentRoute, routeMap)).join('');
	return `<nav class="nav-links nav-app">${links}</nav>`;
}

export function renderNavbar(currentRoute, routeMap, stateOverride) {
	const state = stateOverride ?? getState();
	return isAppMode(state) ? renderAppNav(currentRoute, routeMap) : renderPublicNav(currentRoute, routeMap);
}
