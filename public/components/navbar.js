import { getAuth, logout } from '../auth/state.js';

const NAVBAR_CONTAINER_ID = 'navbar';

const PUBLIC_LINKS = [
  { label: 'Home', href: '#/' },
  { label: 'Features', href: '#/features' },
  { label: 'Pricing', href: '#/pricing' },
  { label: 'About', href: '#/about' },
  { label: 'Contact', href: '#/contact' }
];

const APP_LINKS = [
  { label: 'Dashboard', href: '#/dashboard' },
  { label: 'Generate', href: '#/generate' },
  { label: 'Library', href: '#/library' },
  { label: 'History', href: '#/history' },
  { label: 'Profile', href: '#/profile' }
];

function ensureNavbarContainer() {
  let container = document.getElementById(NAVBAR_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = NAVBAR_CONTAINER_ID;
    const appRoot = document.getElementById('app');
    if (appRoot?.parentNode) {
      appRoot.parentNode.insertBefore(container, appRoot);
    } else {
      document.body.prepend(container);
    }
  }
  return container;
}

function createLink(label, href, isPrimary = false) {
  if (isPrimary) {
    return `<a class="landing-button" href="${href}">${label}</a>`;
  }
  return `<a class="landing-pill" href="${href}">${label}</a>`;
}

function mountNavbar(html, afterMount) {
  const container = ensureNavbarContainer();
  container.innerHTML = html;
  if (typeof afterMount === 'function') {
    afterMount(container);
  }
}

export function renderPublicNavbar() {
  const navLinks = PUBLIC_LINKS.map(link => createLink(link.label, link.href)).join('');
  const startTrial = createLink('Start Trial', '#/start-trial', true);
  mountNavbar(`
    <nav class="landing-section" aria-label="Public navigation">
      <div class="landing-container" style="gap: 12px;">
        <div>
          <span class="landing-label">AllAroundAthlete</span>
          <h2>Structure without stress.</h2>
        </div>
        <div class="landing-pill-list" role="list">
          ${navLinks}
        </div>
        <div class="landing-actions">
          ${startTrial}
        </div>
      </div>
    </nav>
  `);
}

export function renderAppNavbar() {
  const navLinks = APP_LINKS.map(link => createLink(link.label, link.href)).join('');
  mountNavbar(`
    <nav class="landing-section" aria-label="App navigation">
      <div class="landing-container" style="gap: 12px;">
        <div>
          <span class="landing-label">AllAroundAthlete</span>
          <h2>Your calm coaching hub.</h2>
        </div>
        <div class="landing-pill-list" role="list">
          ${navLinks}
        </div>
        <div class="landing-actions">
          <button class="landing-button secondary" type="button" data-nav-logout>Logout</button>
        </div>
      </div>
    </nav>
  `, container => {
    const logoutBtn = container.querySelector('[data-nav-logout]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', event => {
        event.preventDefault();
        logout();
        window.location.hash = '#/';
      });
    }
  });
}

export function updateNavbar() {
  const auth = getAuth();
  if (auth?.loggedIn) {
    renderAppNavbar();
  } else {
    renderPublicNavbar();
  }
}
