const EXPLORE_LINKS = [
  { label: 'Workout Program Generator', href: '#/program-generator' },
  { label: 'Exercise Library', href: '#/exercise-library' },
  { label: 'Workout Summary', href: '#/summary' },
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
    <div class="chrome-footer-group">
      <p class="chrome-footer-heading">${title}</p>
      <ul class="chrome-footer-links">
        ${links
          .map(
            link => `
              <li>
                <a class="chrome-footer-link" href="${link.href}">${link.label}</a>
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
    <footer class="chrome-footer" aria-label="Site footer">
      <div class="chrome-footer-inner">
        <div class="chrome-footer-columns chrome-footer-columns-only">
          <div class="chrome-footer-brand">
            <img
              class="chrome-footer-logo"
              src="./images/allaroundathletelogo.png"
              alt="AllAroundAthlete logo"
              loading="lazy"
              decoding="async"
            />
            <p class="chrome-footer-description">Gentle structure, calm cues, every rep.</p>
            <a class="chrome-footer-support" href="#/contact">Contact support</a>
            <a class="chrome-footer-email" href="mailto:useallaroundathlete@gmail.com">useallaroundathlete@gmail.com</a>
          </div>
          ${renderLinkGroup('Explore', EXPLORE_LINKS)}
          ${renderLinkGroup('Company', COMPANY_LINKS)}
          ${renderLinkGroup('Legal', LEGAL_LINKS)}
        </div>
        <div class="chrome-footer-bottom">
          <p>&copy; ${year} AllAroundAthlete. Built for everyday consistency.</p>
          <div class="chrome-footer-meta-links">
            <a class="chrome-footer-link" href="#/contact">Contact</a>
            <a class="chrome-footer-link" href="#/contact">Support</a>
            <a class="chrome-footer-link" href="#/privacy">Privacy</a>
            <a class="chrome-footer-link" href="#/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
