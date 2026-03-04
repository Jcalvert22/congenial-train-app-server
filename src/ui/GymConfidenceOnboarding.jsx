import { GYM_SITUATIONS } from '../data/gymSituations.js';
import { EQUIPMENT_ETIQUETTE } from '../data/equipmentEtiquette.js';

const DEFAULT_WELCOME = "Welcome to the gym. This quick guide shows you how to move through the space with confidence. You'll learn simple etiquette and how to handle common situations.";
const DEFAULT_ETIQUETTE_COPY = "Most gym etiquette is simple. Wipe equipment when you're done, return attachments, and share machines when it's busy. These small habits help everyone feel comfortable.";
const DEFAULT_CONFIDENCE_COPY = "Most people are focused on their own workout. Moving slowly and with control looks confident, even with light weight. You belong here.";

const ETIQUETTE_HIGHLIGHTS = Object.entries(EQUIPMENT_ETIQUETTE).slice(0, 4);

const formatEquipmentLabel = key => key
  .replace(/_/g, ' ')
  .replace(/\b\w/g, match => match.toUpperCase());

export default function GymConfidenceOnboarding({ onFinish = () => {} }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white px-4 py-6">
      <section className="mb-6">
        <p className="text-sm font-medium text-gray-700">Gym Confidence</p>
        <p className="mt-2 text-sm text-gray-600">{DEFAULT_WELCOME}</p>
      </section>

      <section className="mb-6">
        <p className="text-sm font-medium text-gray-700">Equipment etiquette</p>
        <p className="mt-2 text-xs text-gray-600">{DEFAULT_ETIQUETTE_COPY}</p>
        <div className="mt-3 space-y-3">
          {ETIQUETTE_HIGHLIGHTS.map(([key, tip]) => (
            <div key={key} className="rounded-md bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-700">{formatEquipmentLabel(key)}</p>
              <p className="mt-1 text-xs text-gray-600">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <p className="text-sm font-medium text-gray-700">Common situations</p>
        <div className="mt-1">
          {GYM_SITUATIONS.map(situation => (
            <div key={situation.id} className="mt-3 rounded-md bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-700">{situation.title}</p>
              <p className="mt-1 text-xs text-gray-600">{situation.tip}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <p className="text-sm font-medium text-gray-700">Confidence mindset</p>
        <p className="mt-2 text-xs text-gray-600">{DEFAULT_CONFIDENCE_COPY}</p>
      </section>

      <button
        type="button"
        className="mt-auto rounded-md bg-gray-900 py-3 text-center text-sm font-semibold text-white"
        onClick={onFinish}
      >
        Start your workout
      </button>
    </div>
  );
}
