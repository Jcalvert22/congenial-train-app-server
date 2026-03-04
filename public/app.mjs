import { EXERCISE_LIBRARY_CHECKSUM, EXERCISE_LIBRARY_VERSION } from './data/exercises.js';
import { startApp } from './ui/screens.js';
import { initializeDislikedExercises } from './utils/dislikedExercises.js';

console.info('Exercise Library Version:', EXERCISE_LIBRARY_VERSION);
console.info('Exercise Library Checksum:', EXERCISE_LIBRARY_CHECKSUM);

function renderFatalMessage() {
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

async function bootstrap() {
  try {
    initializeDislikedExercises();
    await startApp();
  } catch (error) {
    console.error('Failed to start AllAroundAthlete', error);
    renderFatalMessage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
  }, { once: true });
} else {
  bootstrap();
}
