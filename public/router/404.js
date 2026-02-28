import { render } from '../ui/render.js';
import { ensureLandingStyles } from '../ui/landingStyles.js';
import { renderFooter } from '../ui/footer.js';

function buildNotFound(includeFooter) {
  return `
    <section class="landing-page">
      <div class="landing-container">
        <header class="landing-hero">
          <div class="landing-hero-content">
            <span class="landing-tag">404</span>
            <h1>Page not found.</h1>
            <p class="landing-subtext lead">The link you followed is resting or no longer exists.</p>
            <p>Head back to the calm homepage and we'll guide you to the right place.</p>
            <div class="landing-actions">
              <a class="landing-button" href="#/">Go Home</a>
            </div>
          </div>
        </header>
      </div>
      ${includeFooter ? renderFooter() : ''}
    </section>
  `;
}

export function renderNotFound(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  ensureLandingStyles();
  const html = buildNotFound(includeFooter);

  if (standalone) {
    render(html, () => {});
  }

  return { html, afterRender: () => {} };
}
