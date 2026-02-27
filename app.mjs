import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use('/styles', express.static('styles'));
app.use('/images', express.static('public/images'));

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Core'];
const EQUIPMENT_OPTIONS = ['None', 'Dumbbells', 'Bench'];

const EXERCISES = [
  { muscle: 'Chest', equipment: ['None'], name: 'Wall Push-ups', steps: 'Stand an arm-length from a wall, bend elbows until nose nears the wall, press out slowly.' },
  { muscle: 'Chest', equipment: ['Dumbbells'], name: 'Floor Press', steps: 'Lie on your back, press dumbbells straight up, pause, lower with control.' },
  { muscle: 'Chest', equipment: ['Bench'], name: 'Incline Push-up', steps: 'Hands on a bench, body in one line, lower chest to the edge, press up.' },
  { muscle: 'Back', equipment: ['None'], name: 'Backpack Row', steps: 'Hinge at the hips, grab a backpack, pull it toward ribs, squeeze shoulder blades.' },
  { muscle: 'Back', equipment: ['Dumbbells'], name: 'Bent Over Row', steps: 'Hinge, keep back flat, row bells toward pockets, pause, lower slow.' },
  { muscle: 'Back', equipment: ['Bench'], name: 'Bench Supported Row', steps: 'One hand on a bench for balance, row the weight toward your hip.' },
  { muscle: 'Legs', equipment: ['None'], name: 'Bodyweight Squat', steps: 'Feet shoulder-width, sit back like a chair, stand tall and squeeze glutes.' },
  { muscle: 'Legs', equipment: ['Dumbbells'], name: 'Goblet Squat', steps: 'Hold one dumbbell at chest, squat down, keep heels heavy, drive up.' },
  { muscle: 'Legs', equipment: ['Bench'], name: 'Step-ups', steps: 'Step onto a bench, push through the front heel, switch legs each rep.' },
  { muscle: 'Core', equipment: ['None'], name: 'Plank', steps: 'Elbows under shoulders, squeeze glutes, hold for slow breaths.' },
  { muscle: 'Core', equipment: ['Dumbbells'], name: 'Deadbug Hold', steps: 'Hold a light weight over chest, lower opposite arm and leg, keep lower back down.' },
  { muscle: 'Core', equipment: ['Bench'], name: 'Bench Leg Raise', steps: 'Lie on a bench, brace, lift legs up, lower without swinging.' }
];

const userState = {
  isSubscribed: false,
  completedPlans: []
};

const BASE_STYLES = `
  <style>
    :root {
      --accent: #4f8cff;
      --accent-dark: #2563eb;
      --bg: #0d111f;
      --panel: #131a33;
      --panel-light: #1a2345;
      --text: #f5f7ff;
      --muted: #a0aedb;
      --border: rgba(255,255,255,0.12);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Segoe UI', 'Inter', Arial, sans-serif;
      color: var(--text);
      background: radial-gradient(circle at top, rgba(79,140,255,0.18), transparent 55%), var(--bg);
      min-height: 100vh;
    }
    a { color: inherit; text-decoration: none; }
    .site-header {
      position: sticky;
      top: 0;
      background: rgba(8,12,27,0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      z-index: 10;
    }
    .header-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      color: var(--accent);
    }
    .brand img {
      height: 56px;
      border-radius: 12px;
    }
    .nav-links {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      color: var(--muted);
      font-size: 0.95rem;
    }
    .page-shell {
      max-width: 1100px;
      margin: 0 auto;
      padding: 48px 24px 72px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 28px 30px;
      box-shadow: 0 28px 60px rgba(0,0,0,0.35);
    }
    .landing-hero {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      background: linear-gradient(135deg, #131b36, #1b2750);
    }
    .hero-tag {
      display: inline-flex;
      align-items: center;
      padding: 6px 16px;
      border-radius: 999px;
      background: rgba(255,255,255,0.15);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.78rem;
      color: #d6e3ff;
    }
    .hero-intro h1 {
      margin: 14px 0 12px;
      font-size: clamp(2.4rem, 4vw, 3.2rem);
    }
    .hero-intro p {
      color: var(--muted);
      line-height: 1.65;
      margin-bottom: 24px;
    }
    .hero-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .hero-btn {
      padding: 12px 24px;
      border-radius: 999px;
      font-weight: 600;
      border: 1px solid var(--border);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .hero-btn.primary {
      background: linear-gradient(135deg, #7fc4ff, var(--accent));
      color: #0c1633;
      border: none;
      box-shadow: 0 16px 35px rgba(79,140,255,0.35);
    }
    .hero-btn.secondary {
      color: var(--text);
      background: transparent;
    }
    .hero-btn:hover { transform: translateY(-2px); }
    .hero-secondary-card ul { list-style: none; padding: 0; margin: 0; line-height: 1.7; color: var(--muted); }
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    label { font-weight: 600; font-size: 0.95rem; color: var(--text); }
    input, select, textarea {
      margin-top: 6px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.2);
      background: var(--panel-light);
      color: var(--text);
      padding: 12px 14px;
      font-size: 1rem;
    }
    button, .primary-btn {
      border: none;
      border-radius: 12px;
      padding: 14px;
      font-size: 1rem;
      font-weight: 600;
      color: #0c1633;
      background: linear-gradient(135deg, #7fc4ff, var(--accent));
      cursor: pointer;
      box-shadow: 0 18px 35px rgba(79,140,255,0.35);
      transition: transform 0.2s ease;
    }
    button:hover, .primary-btn:hover { transform: translateY(-2px); }
    .plan-card {
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 18px;
      background: var(--panel-light);
      margin-bottom: 16px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.35);
    }
    .plan-card h3 { margin: 0 0 6px; }
    .plan-card p { margin: 4px 0; color: var(--muted); }
    .history-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .history-list li { padding: 10px 16px; border-radius: 12px; border: 1px dashed var(--border); color: var(--muted); }
    footer {
      text-align: center;
      color: var(--muted);
      padding: 24px 12px 40px;
      font-size: 0.85rem;
    }
    @media (max-width: 640px) {
      .header-inner { flex-direction: column; align-items: flex-start; }
      .hero-actions { flex-direction: column; }
      .hero-btn { width: 100%; text-align: center; }
      .panel { padding: 22px; }
    }
  </style>
`;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanInput(value, fallback = '') {
  const trimmed = (value || '').toString().trim();
  return trimmed || fallback;
}

function renderLayout(title, mainContent) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)}</title>
        <link rel="stylesheet" href="/styles/main.css">
        ${BASE_STYLES}
      </head>
      <body>
        <header class="site-header">
          <div class="header-inner">
            <div class="brand">
              <img src="/images/allaround-athlete-logo.png" alt="AllAroundAthlete logo">
              <span>All-Around Athlete</span>
            </div>
            <nav class="nav-links">
              <a href="/">Home</a>
              <a href="/subscribe">Subscribe</a>
              <a href="/planner">Planner</a>
            </nav>
          </div>
        </header>
        <main class="page-shell">
          ${mainContent}
        </main>
        <footer>
          © ${new Date().getFullYear()} · Class-demo build · Nothing here is real commerce.
        </footer>
      </body>
    </html>
  `;
}

function getExerciseSuggestions(muscle, equipment) {
  const filtered = EXERCISES.filter(entry => {
    const muscleMatch = muscle ? entry.muscle === muscle : true;
    const equipmentMatch = equipment ? entry.equipment.includes(equipment) : true;
    return muscleMatch && equipmentMatch;
  });
  return filtered.slice(0, 3);
}

function renderHistoryList() {
  if (!userState.completedPlans.length) {
    return '<p style="color:var(--muted);">No saved plans yet. Generate one to see it here.</p>';
  }
  return `
    <ul class="history-list">
      ${userState.completedPlans.map(entry => `<li>${escapeHtml(entry.summary)}</li>`).join('')}
    </ul>
  `;
}

app.get('/', (req, res) => {
  const ctaHref = userState.isSubscribed ? '/planner' : '/subscribe';
  const statusCopy = userState.isSubscribed
    ? 'You already unlocked the planner—pick a muscle group and get moving.'
    : 'Hit subscribe so we can unlock the planner. No real payment happens.';

  const body = `
    <section class="landing-hero panel">
      <div class="hero-intro">
        <span class="hero-tag">Beginner friendly</span>
        <h1>Structure without stress.</h1>
        <p>Pick a muscle, pick the gear you actually have, and get three calm moves with plain-English steps. Everything fits on one screen so new lifters never feel lost.</p>
        <p style="color:var(--muted);">${escapeHtml(statusCopy)}</p>
        <div class="hero-actions">
          <a class="hero-btn primary" href="${ctaHref}">Open Planner</a>
          <a class="hero-btn secondary" href="#history">See History</a>
        </div>
      </div>
      <div class="panel hero-secondary-card" style="background:rgba(255,255,255,0.03);">
        <h2 style="margin-top:0;">What stays simple?</h2>
        <ul>
          <li>Only four muscle groups and three equipment choices.</li>
          <li>Each workout = three moves, 3×10 reps, slow breathing.</li>
          <li>History lives in memory so demos reset with a restart.</li>
          <li>Zero login screens—just build, read, and close.</li>
        </ul>
      </div>
    </section>
    <section id="history" class="panel">
      <h2 style="margin-top:0;">Recent plans</h2>
      <p style="color:var(--muted);">We keep the last five titles so you can show classmates what you generated.</p>
      ${renderHistoryList()}
    </section>
  `;

  res.send(renderLayout('All-Around Athlete · Simple Planner', body));
});

app.get('/subscribe', (req, res) => {
  if (userState.isSubscribed) {
    return res.redirect('/planner');
  }
  const body = `
    <section class="panel">
      <span class="hero-tag">Mock checkout</span>
      <h1 style="margin:12px 0 6px;">Pretend subscription</h1>
      <p style="color:var(--muted);">No money moves here. Press the button so the planner unlocks and we can keep the storyline feeling real.</p>
      <form method="POST" action="/subscribe">
        <button type="submit">Confirm subscription</button>
      </form>
    </section>
  `;

  res.send(renderLayout('Subscribe · All-Around Athlete', body));
});

app.post('/subscribe', (req, res) => {
  userState.isSubscribed = true;
  res.redirect('/planner');
});

app.get('/planner', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  const muscleOptions = MUSCLE_GROUPS.map(group => `<option value="${group}">${group}</option>`).join('');
  const equipmentOptions = EQUIPMENT_OPTIONS.map(option => `<option value="${option}">${option}</option>`).join('');

  const body = `
    <section class="panel">
      <span class="hero-tag">Plan builder</span>
      <h1 style="margin:12px 0 6px;">Pick a focus</h1>
      <p style="color:var(--muted);">Choose one muscle group and the tools you actually have. We dial up three easy moves with calm cues.</p>
      <form method="POST" action="/planner">
        <label>
          Your name (optional)
          <input type="text" name="name" placeholder="Sam Student">
        </label>
        <label>
          Muscle group
          <select name="muscle" required>
            <option value="">Select...</option>
            ${muscleOptions}
          </select>
        </label>
        <label>
          Equipment on hand
          <select name="equipment" required>
            <option value="">Select...</option>
            ${equipmentOptions}
          </select>
        </label>
        <button type="submit">Show my moves</button>
      </form>
    </section>
    <section class="panel">
      <h2 style="margin-top:0;">Recent plans</h2>
      ${renderHistoryList()}
    </section>
  `;

  res.send(renderLayout('Planner · All-Around Athlete', body));
});

app.post('/planner', (req, res) => {
  if (!userState.isSubscribed) {
    return res.redirect('/subscribe');
  }
  const { name, muscle, equipment } = req.body;
  const rawName = cleanInput(name, 'Friend');
  const displayName = escapeHtml(rawName);
  const pickedMuscle = MUSCLE_GROUPS.includes(muscle) ? muscle : '';
  const pickedEquipment = EQUIPMENT_OPTIONS.includes(equipment) ? equipment : '';
  const exercises = getExerciseSuggestions(pickedMuscle, pickedEquipment);

  const planSummary = exercises.length
    ? exercises.map(ex => `
        <article class="plan-card">
          <h3>${escapeHtml(ex.name)}</h3>
          <p><strong>Muscle:</strong> ${escapeHtml(ex.muscle)} · <strong>Equipment:</strong> ${escapeHtml(ex.equipment.join(', '))}</p>
          <p>${escapeHtml(ex.steps)}</p>
          <p style="color:#d6e3ff;">Guideline: 3 sets × 10 calm reps · breathe through every rep.</p>
        </article>
      `).join('')
    : '<p style="color:var(--muted);">No matching moves yet. Try choosing different equipment.</p>';

  const historyLabel = `${rawName}'s ${pickedMuscle || 'General'} plan (${pickedEquipment || 'Any'})`;
  userState.completedPlans.unshift({ summary: historyLabel });
  if (userState.completedPlans.length > 5) {
    userState.completedPlans.pop();
  }

  const body = `
    <section class="panel">
      <span class="hero-tag">${escapeHtml(pickedMuscle || 'General focus')}</span>
      <h1 style="margin:12px 0 6px;">${displayName}'s workout card</h1>
      <p style="color:var(--muted);">Nothing fancy—run through each move for three sets of ten slow reps, rest when you need, and jot notes in your notebook.</p>
      ${planSummary}
      <div style="margin-top:18px;">
        <a class="hero-btn primary" href="/planner" style="display:inline-flex;">Build another plan</a>
      </div>
    </section>
    <section class="panel">
      <h2 style="margin-top:0;">Recent plans</h2>
      ${renderHistoryList()}
    </section>
  `;

  res.send(renderLayout('Your Plan · All-Around Athlete', body));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

