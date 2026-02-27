import { startApp } from './ui/screens.js';

function bootstrap() {
  try {
    startApp();
  } catch (error) {
    console.error('Failed to start AllAroundAthlete', error);
    const root = document.querySelector('#app');
    if (root) {
      root.innerHTML = `
        <section style="padding:32px;text-align:center;">
          <h2>We hit a snag.</h2>
          <p>Refresh the page to try again.</p>
        </section>
      `;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
