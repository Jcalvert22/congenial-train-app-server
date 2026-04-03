const EXPLORE_LINKS = [
  {
    label: 'Workout Program Generator',
    href: '#/program-generator',
    description: 'Coming soon — builds weekly plans that last as long as you want support.',
    comingSoonMessage: 'The Workout Program Generator is still in progress. Weekly plans will unlock soon.'
  },
  {
    label: 'Gym Basics',
    href: '#/gym-basics',
    description: 'Step-by-step pointers on form, machine setup, breathing, and warm-ups.'
  },
  {
    label: 'Exercise Library',
    href: '#/library',
    description: 'Opens the full move library with calm, plain-language cues.'
  },
  {
    label: 'Progress Tracking',
    href: '#/progress-tracking',
    description: 'Coming soon — tracks streaks, collects lift feedback by muscle group, and celebrates consistent days.',
    comingSoonMessage: 'Progress Tracking is under construction. Streaks and feedback insights will arrive soon.'
  },
  { label: 'Training Philosophy', href: '#/relaxed-training' },
  { label: 'Pricing', href: '#/pricing' }
];

function escapeAttribute(value = '') {
  return String(value).replace(/"/g, '&quot;');
}

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
          .map(link => {
            const comingSoonAttrs = link.comingSoonMessage
              ? ` data-coming-message="${escapeAttribute(link.comingSoonMessage)}" onclick="event.preventDefault(); alert(this.dataset.comingMessage);"`
              : '';
            return `
              <li>
                <a class="chrome-footer-link" href="${link.href}"${comingSoonAttrs}>${link.label}</a>
                ${link.description ? `<p class="chrome-footer-link-note">${link.description}</p>` : ''}
              </li>
            `;
          })
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
            <p class="chrome-footer-description">Structure without stress. Workouts that feel safe, simple, and beginner-friendly.</p>
            <a class="chrome-footer-support" href="#/contact">Contact support</a>
            <a class="chrome-footer-email" href="mailto:useallaroundathlete@gmail.com">useallaroundathlete@gmail.com</a>
          </div>
          ${renderLinkGroup('Explore', EXPLORE_LINKS)}
          ${renderLinkGroup('Company', COMPANY_LINKS)}
          ${renderLinkGroup('Legal', LEGAL_LINKS)}
        </div>
        <div class="chrome-footer-bottom">
          <p>&copy; ${year} All Around Athlete. Structure without stress.</p>
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
