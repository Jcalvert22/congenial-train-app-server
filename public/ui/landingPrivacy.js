import { render } from './render.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';

const PRIVACY_SECTIONS = [
  {
    title: 'Introduction',
    paragraphs: [
      'This Privacy Policy explains how AllAroundAthlete ("AAA") collects, uses, and shares data when you use our web app. It applies to all product experiences and is written in calm, plain language to keep you in the loop.'
    ]
  },
  {
    title: 'What Data We Collect',
    paragraphs: ['We keep data collection focused on supporting your workouts.'],
    bullets: [
      '<strong>Account data</strong> — your email address and password hash managed by Supabase Auth.',
      '<strong>Profile & preferences</strong> — workout goals, equipment access, experience level, and any other fields you complete.',
      '<strong>Usage data</strong> — pages visited, workouts generated, feature usage, device/browser information, error diagnostics.',
      '<strong>Payment data</strong> — handled by Stripe. We see plan type and transaction status but never store full card numbers.'
    ]
  },
  {
    title: 'How We Use the Data',
    bullets: [
      'Provide and personalize workouts, progress summaries, and reminders.',
      'Improve the product, debug issues, and develop new features.',
      'Send essential communications such as account confirmations, subscription notices, and key product updates.'
    ]
  },
  {
    title: 'Legal Bases in Simple Terms',
    bullets: [
      '<strong>Contract</strong> — we need certain data to deliver the service you requested.',
      '<strong>Consent</strong> — you can opt in or out of optional analytics or communications.',
      '<strong>Legitimate interest</strong> — we secure, maintain, and improve the app in ways that benefit users while respecting privacy.'
    ]
  },
  {
    title: 'How We Share Data',
    bullets: [
      'With service providers such as Supabase, Stripe, analytics, and infrastructure partners who help us run AAA.',
      'When required by law, legal process, or to protect the rights and safety of AAA and our users.',
      'Never with data brokers for sale or rental. We do not sell personal data.'
    ]
  },
  {
    title: 'Storage, Security & Retention',
    paragraphs: [
      'We use encryption, access controls, and monitoring to keep your data safe. No security practice is perfect, but we continually improve our safeguards. We retain data only as long as needed to deliver the service, meet legal requirements, or resolve disputes. When data is no longer needed we delete or anonymize it.'
    ]
  },
  {
    title: 'Your Rights',
    paragraphs: [
      'Depending on your location you may have rights to access, correct, delete, or export your personal data, and to object to certain processing.'
    ],
    bullets: [
      'Contact us anytime at <a href="mailto:useallaroundathlete@gmail.com">useallaroundathlete@gmail.com</a> to exercise these rights.',
      'We will respond within a reasonable timeframe and explain any steps we need to verify your identity.'
    ]
  },
  {
    title: 'Cookies & Tracking',
    paragraphs: [
      'AAA may use cookies or similar technologies to keep you signed in, remember preferences, and understand product usage. You can adjust browser settings to limit cookies, but some features might not function fully.'
    ]
  },
  {
    title: 'Children’s Privacy',
    paragraphs: [
      'AllAroundAthlete is for adults 18+. We do not knowingly collect data from children under 13. If we learn that we collected data from a child, we will delete it promptly.'
    ]
  },
  {
    title: 'International Users',
    paragraphs: [
      'All data is processed in the United States, where our infrastructure and team are located. By using the app you consent to this processing, which may be subject to different privacy laws than in your country.'
    ]
  },
  {
    title: 'Changes to this Policy',
    paragraphs: [
      'If we make material updates, we will notify you via email or in-app notice. Continued use of AAA after the effective date means you accept the updated policy.'
    ]
  },
  {
    title: 'Contact Us',
    paragraphs: [
      'Have privacy questions? Reach us anytime at <a href="mailto:useallaroundathlete@gmail.com">useallaroundathlete@gmail.com</a> or via the in-app contact page.'
    ]
  }
];

function renderPrivacySections() {
  return PRIVACY_SECTIONS.map(section => {
    const bullets = section.bullets
      ? `<ul class="legal-list">${section.bullets.map(item => `<li>${item}</li>`).join('')}</ul>`
      : '';
    const paragraphs = section.paragraphs
      ? section.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')
      : '';
    return `
      <article class="landing-section legal-section">
        <h3>${section.title}</h3>
        ${paragraphs}
        ${bullets}
      </article>
    `;
  }).join('');
}

export function renderPrivacyPage(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  ensureLandingStyles();

  const html = `
    <section class="landing-page legal-page">
      <div class="landing-container">
        <header class="landing-hero legal-hero">
          <div class="landing-hero-content">
            <span class="landing-tag">Privacy Policy</span>
            <h1>Your data, kept calm and clear.</h1>
            <p class="landing-subtext lead">This policy explains what we collect, how we use it, and the choices you have.</p>
          </div>
        </header>
        ${renderPrivacySections()}
      </div>
      ${includeFooter ? renderFooter() : ''}
    </section>
  `;

  const afterRender = () => {};

  if (standalone) {
    render(html, afterRender);
  }

  return { html, afterRender };
}
