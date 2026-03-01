import { escapeHTML } from '../utils/helpers.js';

export function renderLoadingCard(message = 'Loading...') {
  return `
    <section class="landing-section state-card" data-page-loading>
      <article class="landing-card landing-loading-card" aria-live="polite">
        <div class="landing-spinner" aria-hidden="true"></div>
        <p class="landing-subtext">${escapeHTML(message)}</p>
      </article>
    </section>
  `;
}

export function showLoadingCard(message = 'Loading...') {
  return renderLoadingCard(message);
}

export function renderEmptyStateCard({
  title = 'Nothing here yet',
  message = 'Try refreshing or creating new data.',
  actionLabel = 'Go back',
  actionHref = '#/'
} = {}) {
  return `
    <section class="landing-section state-card">
      <article class="landing-card landing-empty-card state-card-body">
        <h2>${escapeHTML(title)}</h2>
        <p class="landing-subtext">${escapeHTML(message)}</p>
        <div class="landing-actions landing-space-top-sm">
          <a class="landing-button" href="${escapeHTML(actionHref)}">${escapeHTML(actionLabel)}</a>
        </div>
      </article>
    </section>
  `;
}

export function renderErrorStateCard({
  title = 'Something went wrong',
  message = 'Please try again or contact support.',
  actionLabel = 'Back home',
  actionHref = '#/'
} = {}) {
  return `
    <section class="landing-section state-card">
      <article class="landing-card landing-error-card state-card-body" aria-live="assertive">
        <h2>${escapeHTML(title)}</h2>
        <p class="landing-subtext">${escapeHTML(message)}</p>
        <div class="landing-actions landing-space-top-sm">
          <a class="landing-button" href="${escapeHTML(actionHref)}">${escapeHTML(actionLabel)}</a>
        </div>
      </article>
    </section>
  `;
}

export function showErrorCard(message = 'Something went wrong', buttonText = 'Back home', buttonHref = '#/') {
  return renderErrorStateCard({
    title: 'Something went wrong',
    message,
    actionLabel: buttonText,
    actionHref: buttonHref
  });
}

export function renderPageShell(sections, options = {}) {
  const { isLoading = false, loadingMessage = 'Loading...' } = options;
  if (isLoading) {
    return `
      <section class="landing-page">
        <div class="landing-container">
          ${renderLoadingCard(loadingMessage)}
        </div>
      </section>
    `;
  }
  return `
    <section class="landing-page">
      <div class="landing-container">
        ${sections}
      </div>
    </section>
  `;
}

export function wrapWithPageLoading(sections, loadingMessage = 'Loading...') {
  return `
    <section class="landing-page">
      <div class="landing-container">
        ${renderLoadingCard(loadingMessage)}
        <div data-page-content hidden>
          ${sections}
        </div>
      </div>
    </section>
  `;
}

export function revealPageContent(root, delay = 220) {
  const content = root.querySelector('[data-page-content]');
  if (!content) {
    return;
  }
  const loading = root.querySelector('[data-page-loading]');
  const execute = () => {
    if (loading) {
      loading.hidden = true;
    }
    content.hidden = false;
  };
  if (typeof window === 'undefined') {
    execute();
    return;
  }
  const schedule = () => window.setTimeout(execute, delay);
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(schedule);
  } else {
    schedule();
  }
}
