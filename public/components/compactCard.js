import { escapeHTML } from '../utils/helpers.js';

const boundRoots = new WeakSet();

function buildAttrString(attributes = {}) {
  return Object.entries(attributes)
    .filter(([key, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => {
      if (value === true) {
        return key;
      }
      return `${key}="${escapeHTML(String(value))}"`;
    })
    .join(' ');
}

function hydrateBodyHeights(root) {
  const bodies = root.querySelectorAll('[data-compact-body]');
  bodies.forEach(body => {
    if (body.hidden) {
      body.style.height = '0px';
    } else {
      body.style.height = 'auto';
    }
  });
}

function animateBody(body, expand) {
  if (!body) {
    return;
  }
  body.style.transition = 'height 0.25s ease';
  if (expand) {
    body.hidden = false;
    body.setAttribute('aria-hidden', 'false');
    const target = body.scrollHeight;
    body.style.height = '0px';
    requestAnimationFrame(() => {
      body.style.height = `${target}px`;
    });
    const finalize = () => {
      body.style.height = 'auto';
      body.removeEventListener('transitionend', finalize);
    };
    body.addEventListener('transitionend', finalize);
    return;
  }
  const start = body.scrollHeight;
  body.style.height = `${start}px`;
  requestAnimationFrame(() => {
    body.style.height = '0px';
  });
  const finalize = () => {
    body.hidden = true;
    body.setAttribute('aria-hidden', 'true');
    body.style.height = '0px';
    body.removeEventListener('transitionend', finalize);
  };
  body.addEventListener('transitionend', finalize);
}

const DEFAULT_REASSURANCE_COPY = 'Your plan adapts to your comfort level. Go at your own pace.';

export function renderCompactCard({
  id = '',
  title = '',
  subtitle = '',
  eyebrow = '',
  icon = '',
  badges = [],
  meta = [],
  media = '',
  collapsedExtras = '',
  expandedContent = '',
  defaultExpanded = false,
  className = '',
  attributes = {}
} = {}) {
  const attrString = buildAttrString({
    'data-compact-card': true,
    ...(id ? { 'data-compact-id': id } : {}),
    ...attributes
  });
  const stateAttr = defaultExpanded ? 'true' : 'false';
  const hiddenAttr = defaultExpanded ? '' : ' hidden';
  const eyebrowMarkup = eyebrow ? `<p class="compact-card-eyebrow">${escapeHTML(eyebrow)}</p>` : '';
  const subtitleMarkup = subtitle ? `<p class="compact-card-subtitle">${escapeHTML(subtitle)}</p>` : '';
  const metaMarkup = meta
    .filter(Boolean)
    .map(entry => `<span class="compact-card-meta">${entry}</span>`)
    .join('');
  const badgesMarkup = badges
    .filter(Boolean)
    .map(badge => `<span class="compact-card-badge">${badge}</span>`)
    .join('');
  const detailHint = '<span class="compact-card-detail-hint">More details</span>';
  return `
    <article class="compact-card${className ? ` ${className}` : ''}" data-expanded="${stateAttr}" ${attrString}>
      <button class="compact-card-collapsed" type="button" data-compact-toggle aria-expanded="${stateAttr}">
        <div class="compact-card-summary">
          ${icon ? `<div class="compact-card-icon" aria-hidden="true">${icon}</div>` : ''}
          <div class="compact-card-text">
            ${eyebrowMarkup}
            <h3 class="compact-card-title">${escapeHTML(title)}</h3>
            ${subtitleMarkup}
            ${metaMarkup ? `<div class="compact-card-meta-row">${metaMarkup}</div>` : ''}
            ${collapsedExtras}
          </div>
        </div>
        <div class="compact-card-aside">
          ${media || ''}
          ${badgesMarkup}
          ${detailHint}
          <span class="compact-card-chevron" aria-hidden="true"></span>
        </div>
      </button>
      <div class="compact-card-expanded"${hiddenAttr} data-compact-body aria-hidden="${defaultExpanded ? 'false' : 'true'}">
        <div class="compact-card-expanded-inner">
          ${expandedContent}
        </div>
      </div>
    </article>
  `;
}

export function renderStickyReassuranceBar(copy = DEFAULT_REASSURANCE_COPY) {
  return `<div class="sticky-reassurance" role="status">${escapeHTML(copy)}</div>`;
}

export function attachCompactCardInteractions(root = document) {
  if (!root || boundRoots.has(root)) {
    return;
  }
  boundRoots.add(root);
  hydrateBodyHeights(root);

  root.addEventListener('click', event => {
    const toggle = event.target.closest('[data-compact-toggle]');
    if (!toggle || !root.contains(toggle)) {
      return;
    }
    event.preventDefault();
    const card = toggle.closest('[data-compact-card]');
    if (!card) {
      return;
    }
    const body = card.querySelector('[data-compact-body]');
    if (!body) {
      return;
    }
    const expanded = card.getAttribute('data-expanded') === 'true';
    const nextState = !expanded;
    card.setAttribute('data-expanded', String(nextState));
    toggle.setAttribute('aria-expanded', String(nextState));
    animateBody(body, nextState);
  });
}
