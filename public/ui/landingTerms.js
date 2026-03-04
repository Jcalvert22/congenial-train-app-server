import { render } from './render.js';
import { ensureLandingStyles } from './landingStyles.js';
import { renderFooter } from './footer.js';

const TERMS_SECTIONS = [
  {
    title: 'Introduction & Acceptance',
    paragraphs: [
      'AllAroundAthlete ("AAA," "we," "us") offers a beginner-friendly workout planning web app. These Terms of Service govern your use of AAA. By creating an account or continuing to use the app, you agree to these Terms. If you disagree, please stop using the service.',
      'We may update these Terms occasionally. When changes are material we will email you or post an in-app notice before they take effect.'
    ]
  },
  {
    title: 'Eligibility & Lawful Use',
    paragraphs: [
      'AllAroundAthlete is designed for adults. You promise that you meet the requirements below.'
    ],
    bullets: [
      'You are at least 18 years old and legally able to form a contract.',
      'You will only use the app for lawful, personal fitness purposes.',
      'You will comply with local regulations, gym rules, and any other agreements that apply to you.'
    ]
  },
  {
    title: 'No Medical Advice',
    paragraphs: [
      'AAA provides general gym guidance, not individualized health advice. We do not diagnose conditions, prescribe treatments, or replace doctors, physical therapists, or certified trainers. Always consult qualified professionals before beginning or changing an exercise program.'
    ]
  },
  {
    title: 'Assumption of Risk & Release',
    paragraphs: [
      'Exercise involves inherent risks, including injury or worse. By using AAA you understand and accept those risks. To the fullest extent allowed by law, you release AAA and its team from liability arising from your workouts, gym visits, equipment choices, or any actions you take based on the app.'
    ]
  },
  {
    title: 'User Responsibilities & Acceptable Use',
    paragraphs: [
      'You agree to keep your information accurate and respectful. Please use the app responsibly:'
    ],
    bullets: [
      'Protect your login credentials and notify us of suspected unauthorized use.',
      'Do not scrape, reverse engineer, or overload the service.',
      'Do not upload malware, infringing content, or anything that violates others’ privacy or rights.',
      'Respect gym rules, other users, and local laws at all times.'
    ]
  },
  {
    title: 'Accounts & Security',
    paragraphs: [
      'Accounts are created through Supabase Auth with your email and password. You are responsible for the security of your login and for all activity that occurs under your account. If you believe your account has been compromised, contact us immediately.'
    ]
  },
  {
    title: 'Subscriptions, Billing & Cancellations',
    paragraphs: [
      'Paid plans are managed by Stripe. Pricing, renewal dates, and plan options are shown in-app. Subscriptions renew automatically unless you cancel before the renewal date. You can cancel at any time inside the app; you will keep access until the end of the paid period. Refund requests are evaluated in good faith but are not guaranteed once a term begins. Taxes or currency fees may apply depending on where you live.'
    ]
  },
  {
    title: 'Intellectual Property',
    paragraphs: [
      'AAA retains all rights to its workouts, UI, branding, trademarks, text, graphics, and software. You receive a personal, non-transferable license to use the app for your own workouts. Please do not copy, resell, or exploit our content without written permission.'
    ]
  },
  {
    title: 'Third-Party Services',
    paragraphs: [
      'AAA relies on trusted partners, including Supabase for authentication and Stripe for payments. Their own terms and privacy policies apply to any data you share with them. We are not responsible for their services, but we choose reputable providers and expect them to protect your data.'
    ]
  },
  {
    title: 'Termination',
    paragraphs: [
      'We may suspend or terminate your access if you violate these Terms, break the law, or put the service or other users at risk. You may delete your account at any time. Even after termination, sections about intellectual property, disclaimers, and liability continue to apply.'
    ]
  },
  {
    title: 'Disclaimers & Limitation of Liability',
    paragraphs: [
      'AAA is provided “as is” without warranties of any kind. To the fullest extent allowed by law we disclaim implied warranties (such as fitness for a particular purpose) and limit total liability to the amount you paid in the six months before any claim. Some jurisdictions do not allow such limitations, so they may not apply to you.'
    ]
  },
  {
    title: 'Governing Law & Disputes',
    paragraphs: [
      'These Terms are governed by the laws of the State of Alabama, USA, excluding its conflict-of-law rules. Any dispute must be resolved in state or federal courts located in Alabama, and you consent to their jurisdiction.'
    ]
  },
  {
    title: 'Changes to These Terms',
    paragraphs: [
      'When we materially update these Terms, we will let you know via email or in-app notice. Continued use after the effective date constitutes acceptance of the updated Terms.'
    ]
  }
];

function renderTermsSections() {
  return TERMS_SECTIONS.map(section => {
    const bullets = section.bullets
      ? `<ul class="legal-list">${section.bullets.map(item => `<li>${item}</li>`).join('')}</ul>`
      : '';
    const paragraphs = section.paragraphs
      .map(paragraph => `<p>${paragraph}</p>`) 
      .join('');
    return `
      <article class="landing-section legal-section">
        <h3>${section.title}</h3>
        ${paragraphs}
        ${bullets}
      </article>
    `;
  }).join('');
}

export function renderTermsPage(options = {}) {
  const { standalone = true, includeFooter = true } = options;
  ensureLandingStyles();

  const html = `
    <section class="landing-page legal-page">
      <div class="landing-container">
        <header class="landing-hero legal-hero">
          <div class="landing-hero-content">
            <span class="landing-tag">Terms of Service</span>
            <h1>Plain-language terms built for calm guidance.</h1>
            <p class="landing-subtext lead">These Terms explain how AllAroundAthlete works, what you can expect from us, and what we expect from you.</p>
          </div>
        </header>
        ${renderTermsSections()}
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
