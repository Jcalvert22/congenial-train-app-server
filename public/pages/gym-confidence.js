import { escapeHTML } from '../utils/helpers.js';
import { renderPageShell } from '../components/stateCards.js';
import { getAuth } from '../auth/state.js';
import { GYM_SITUATIONS } from '../data/gymSituations.js';
import { EQUIPMENT_ETIQUETTE } from '../data/exercises.js';

const WELCOME_COPY = "Welcome to the gym. This quick guide shows you how to move through the space with confidence. You'll learn simple etiquette and how to handle common situations.";
const ETIQUETTE_COPY = "Most gym etiquette is simple. Wipe equipment when you're done, return attachments, and share machines when it's busy. These small habits help everyone feel comfortable.";
const CONFIDENCE_COPY = 'Most people are focused on their own workout. Moving slowly and with control looks confident, even with light weight. You belong here.';
const FINISH_LABEL = 'Start your workout';
const ETIQUETTE_KEYS = ['Barbell', 'Dumbbells', 'Machine', 'Cables'];

function formatEquipmentLabel(key) {
  if (!key) {
    return '';
  }
  return key.replace(/_/g, ' ');
}

function buildEtiquetteHighlights() {
  return ETIQUETTE_KEYS
    .map(key => {
      const tip = EQUIPMENT_ETIQUETTE[key];
      if (!tip) {
        return null;
      }
      return { label: formatEquipmentLabel(key), tip };
    })
    .filter(Boolean);
}

function renderEtiquetteCards() {
  const highlights = buildEtiquetteHighlights();
  if (!highlights.length) {
    return '';
  }
  return highlights
    .map(entry => `
      <div class="mt-3 rounded-md bg-gray-50 p-3">
        <p class="text-sm font-medium text-gray-700">${escapeHTML(entry.label)}</p>
        <p class="mt-1 text-xs text-gray-600">${escapeHTML(entry.tip)}</p>
      </div>
    `)
    .join('');
}

function renderSituationCards() {
  return GYM_SITUATIONS
    .map(situation => `
      <div class="mt-3 rounded-md bg-gray-50 p-3">
        <p class="text-sm font-medium text-gray-700">${escapeHTML(situation.title)}</p>
        <p class="mt-1 text-xs text-gray-600">${escapeHTML(situation.tip)}</p>
      </div>
    `)
    .join('');
}

export function renderGymConfidencePage() {
  const sections = `
    <section class="landing-section">
      <div class="flex h-full flex-col gap-6 rounded-lg bg-white p-5 text-gray-700" data-gym-confidence-root style="min-height:70vh;">
        <section>
          <p class="text-sm font-medium text-gray-700">Gym Confidence</p>
          <p class="mt-2 text-sm text-gray-600">${escapeHTML(WELCOME_COPY)}</p>
        </section>
        <section>
          <p class="text-sm font-medium text-gray-700">Equipment etiquette</p>
          <p class="mt-2 text-xs text-gray-600">${escapeHTML(ETIQUETTE_COPY)}</p>
          <div class="mt-3" data-etiquette-list>
            ${renderEtiquetteCards()}
          </div>
        </section>
        <section>
          <p class="text-sm font-medium text-gray-700">Common situations</p>
          <div class="mt-1 max-h-80 overflow-y-auto pr-1" data-situations-list>
            ${renderSituationCards()}
          </div>
        </section>
        <section>
          <p class="text-sm font-medium text-gray-700">Confidence mindset</p>
          <p class="mt-2 text-xs text-gray-600">${escapeHTML(CONFIDENCE_COPY)}</p>
        </section>
        <div class="pt-2">
          <button type="button" class="w-full rounded-md bg-gray-900 py-3 text-center text-sm font-semibold text-white" data-action="gym-confidence-finish">${FINISH_LABEL}</button>
        </div>
      </div>
    </section>
  `;
  return renderPageShell(sections);
}

export function attachGymConfidenceEvents(root) {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  const finishButton = root?.querySelector('[data-action="gym-confidence-finish"]');
  if (finishButton) {
    finishButton.addEventListener('click', event => {
      event.preventDefault();
      const auth = getAuth();
      const fallbackHash = auth?.loggedIn ? '#/dashboard' : '#/onboarding';
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.hash = fallbackHash;
    });
  }
}
