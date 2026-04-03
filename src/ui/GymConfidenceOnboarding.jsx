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
    <div className="flex h-full flex-col overflow-y-auto" style={{ background: 'var(--color-surface)', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>

      <section style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-headline)', color: 'var(--color-text)' }}>Gym Confidence</p>
        <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--color-muted)' }}>{DEFAULT_WELCOME}</p>
      </section>


      <section style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-headline)', color: 'var(--color-text)' }}>Equipment etiquette</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>{DEFAULT_ETIQUETTE_COPY}</p>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ETIQUETTE_HIGHLIGHTS.map(([key, tip]) => (
            <div key={key} style={{ borderRadius: '0.75rem', background: 'var(--color-soft-bg)', padding: '1rem' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-headline)', color: 'var(--color-text)' }}>{formatEquipmentLabel(key)}</p>
              <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>{tip}</p>
            </div>
          ))}
        </div>
      </section>


      <section style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-headline)', color: 'var(--color-text)' }}>Common situations</p>
        <div style={{ marginTop: '0.25rem' }}>
          {GYM_SITUATIONS.map(situation => (
            <div key={situation.id} style={{ marginTop: '0.75rem', borderRadius: '0.75rem', background: 'var(--color-soft-bg)', padding: '1rem' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-headline)', color: 'var(--color-text)' }}>{situation.title}</p>
              <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>{situation.tip}</p>
            </div>
          ))}
        </div>
      </section>


      <section style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-headline)', color: 'var(--color-text)' }}>Confidence mindset</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>{DEFAULT_CONFIDENCE_COPY}</p>
      </section>

      <button
        type="button"
        style={{
          marginTop: 'auto',
          borderRadius: '999px',
          background: 'var(--color-primary-action)',
          color: 'var(--color-card-bg)',
          padding: '0.85rem 0',
          width: '100%',
          fontFamily: 'var(--font-headline)',
          fontWeight: 700,
          fontSize: '1rem',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(5, 62, 29, 0.2)',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={onFinish}
      >
        Start your workout
      </button>
    </div>
  );
}
