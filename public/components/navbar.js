import { getAuth, logout } from '../auth/state.js';

const NAVBAR_CONTAINER_ID = 'navbar';
const NAVBAR_MENU_ID = 'aaa-chrome-menu';

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

function mountNavbar(html, afterMount) {
  const container = ensureNavbarContainer();
  container.innerHTML = html;
  attachChromeInteractions(container);
  if (typeof afterMount === 'function') {
    afterMount(container);
  }
}

function attachChromeInteractions(container) {
  const toggle = container.querySelector('[data-chrome-toggle]');
  const menu = container.querySelector(`#${NAVBAR_MENU_ID}`);
  if (!toggle || !menu) {
    return;
  }

  const setMenuState = isOpen => {
    toggle.setAttribute('aria-expanded', String(isOpen));
    menu.classList.toggle('is-open', isOpen);
  };

  toggle.addEventListener('click', () => {
    const nextState = toggle.getAttribute('aria-expanded') !== 'true';
    setMenuState(nextState);
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuState(false));
  });
}

function renderNavbarMarkup({ tagline, links, primaryAction, secondaryAction }) {
  const currentHash = window.location.hash || '#/';
  const navLinks = links
    .map(link => createLinkMarkup(link, currentHash))
    .join('');

  return `
    <header class="chrome-header">
      <div class="chrome-inner">
        <a class="chrome-brand" href="#/">
          <span class="chrome-mark" aria-hidden="true">AA</span>
          <span class="chrome-brand-text">
            <strong>AllAroundAthlete</strong>
            <span>${tagline}</span>
          </span>
        </a>
        <button class="chrome-burger" type="button" aria-expanded="false" aria-controls="${NAVBAR_MENU_ID}" data-chrome-toggle>
          <span></span>
          <span></span>
          <span></span>
          <span class="visually-hidden">Toggle navigation</span>
        </button>
        <nav class="chrome-menu" id="${NAVBAR_MENU_ID}" aria-label="Primary navigation">
          <div class="chrome-links" role="list">
            ${navLinks}
          </div>
          <div class="chrome-ctas">
            ${secondaryAction || ''}
            ${primaryAction || ''}
          </div>
        </nav>
      </div>
    </header>
  `;
}

function createLinkMarkup(link, currentHash) {
  const activeHashes = new Set(['#/home', '#/']);
  const isHome = link.href === '#/';
  const isActive = isHome ? activeHashes.has(currentHash || '#/') : currentHash === link.href;
  const classes = ['chrome-link'];
  if (isActive) {
    classes.push('is-active');
  }
  return `<a class="${classes.join(' ')}" href="${link.href}">${link.label}</a>`;
}

export function renderPublicNavbar() {
  const html = renderNavbarMarkup({
    tagline: 'Structure without stress',
    links: PUBLIC_LINKS,
    secondaryAction: `<a class="chrome-button ghost" href="#/pricing">View plans</a>`,
    primaryAction: `<a class="chrome-button" href="#/start-trial">Start free trial</a>`
  });
  mountNavbar(html);
}

export function renderAppNavbar() {
  const html = renderNavbarMarkup({
    tagline: 'Calm guidance, every day',
    links: APP_LINKS,
    secondaryAction: `<a class="chrome-button ghost" href="#/generate">Create plan</a>`,
    primaryAction: `<button class="chrome-button" type="button" data-nav-logout>Logout</button>`
  });
  mountNavbar(html, container => {
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
