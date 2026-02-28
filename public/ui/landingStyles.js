const LANDING_STYLES_ID = 'aaa-landing-styles';

export function ensureLandingStyles() {
  if (document.getElementById(LANDING_STYLES_ID)) {
    return;
  }

  const link = document.createElement('link');
  link.id = LANDING_STYLES_ID;
  link.rel = 'stylesheet';
  link.href = './styles/landing.css';
  document.head.appendChild(link);
}
