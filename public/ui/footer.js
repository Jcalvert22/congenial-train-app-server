const EXPLORE_LINKS = [
  { label: 'Workout Program Generator', href: '#/program-generator' },
  { label: 'Exercise Library', href: '#/exercise-library' },
  { label: 'Workout Summary', href: '#/workout-summary' },
  { label: 'Timer', href: '#/timer' },
  { label: 'Progress Tracking', href: '#/progress-tracking' },
  { label: 'Beginner Onboarding', href: '#/beginner-onboarding' },
  { label: 'Training Philosophy', href: '#/relaxed-training' },
  { label: 'Pricing', href: '#/pricing' }
];

const COMPANY_LINKS = [
  { label: 'About', href: '#/about' },
  { label: 'Contact', href: '#/contact' }
];

const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '#/terms' },
  { label: 'Privacy Policy', href: '#/privacy' }
];

function renderLinkGroup(title, links) {
  return `
    <div>
      <p class="landing-footer-heading">${title}</p>
      <ul class="landing-footer-list">
        ${links
          .map(
            link => `
              <li>
                <a class="landing-footer-link" href="${link.href}">${link.label}</a>
              </li>
            `
          )
          .join('')}
      </ul>
    </div>
  `;
}

export function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="landing-footer" aria-label="Site footer">
      <div class="landing-container landing-footer-inner">
        <div class="landing-footer-columns">
          <div class="landing-footer-brand">
            <p class="landing-footer-logo">AllAroundAthlete</p>
            <p class="landing-subtext">Helping beginners build confidence, one workout at a time.</p>
          </div>
          <div class="landing-footer-grid">
            ${renderLinkGroup('Explore', EXPLORE_LINKS)}
            ${renderLinkGroup('Company', COMPANY_LINKS)}
            ${renderLinkGroup('Legal', LEGAL_LINKS)}
          </div>
        </div>
        <div class="landing-footer-meta-row">
          <p class="landing-footer-meta">© ${year} AllAroundAthlete · Built for everyday consistency.</p>
        </div>
      </div>
    </footer>
  `;
}
