export function renderCanceledPage() {
  return `
    <section class="panel" style="margin-top:32px;">
      <span class="badge">Checkout canceled</span>
      <h1 style="margin:12px 0 6px;">No worries, your spot is still open.</h1>
      <p style="color:var(--muted);max-width:540px;">You can restart checkout anytime. We saved your plan selection so it is one click away.</p>
      <div class="landing-actions" style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
        <a class="landing-button" href="#/pricing">Return to pricing</a>
        <a class="landing-button secondary" href="#/paywall">Open paywall</a>
      </div>
    </section>
  `;
}

export function attachCanceledPageEvents() {}
