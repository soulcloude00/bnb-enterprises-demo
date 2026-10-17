/* B&B Enterprises — "Build your vision" consultation configurator
   Front-end only. Three.js r169 is vendored at assets/vendor/three-0.169.0 (MIT).
   Source is split in _build/consult-src/ and concatenated by _build/build.py. */
const VENDOR = new URL('../vendor/three-0.169.0/', import.meta.url).href;
// PLACEHOLDER WhatsApp number — replace with B&B Enterprises' real number (country code + number, digits only).
const WA_NUMBER = '910000000000';
const WA_IS_PLACEHOLDER = true;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FT = 0.3048;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------------------------ questions */
const Q = [
  { id: 'type', label: 'Project', title: 'What do you want to <em>build?</em>', sub: 'Choose the closest fit — everything can be refined with our team.', hint: 'Sets the massing of the model.',
    opts: [['villa', 'Villa', 'Independent luxury home'], ['apartment', 'Apartment building', 'Multi-family residential'], ['commercial', 'Commercial', 'Offices, retail or mixed-use'], ['row', 'Row houses', 'A terrace of homes'], ['farm', 'Farmhouse', 'Weekend or estate living'], ['unsure', 'Not sure yet', 'We’ll help you decide']] },
  { id: 'variant', label: 'Design', kind: 'variant', title: 'Choose a <em>design</em>', sub: 'Three distinct directions — each with its own silhouette. Materials and finish come next.', hint: 'The whole massing and roofline change.' },
  { id: 'plot', label: 'Plot', title: 'How large is your <em>plot?</em>', sub: 'Width × depth, in feet.', hint: 'The plot and footprint rescale to match.',
    opts: [['30x40', '30 × 40', '1,200 sq ft'], ['30x50', '30 × 50', '1,500 sq ft'], ['40x60', '40 × 60', '2,400 sq ft'], ['60x80', '60 × 80', '4,800 sq ft'], ['acre', '1 acre +', '43,560 sq ft and above'], ['custom', 'Custom', 'Enter your dimensions']] },
  { id: 'loc', label: 'Location', title: 'Where in <em>Bangalore?</em>', sub: 'Roughly is fine.', hint: 'The surroundings change around your plot.',
    opts: [['north', 'North', 'Devanahalli · Hebbal · Yelahanka'], ['east', 'East', 'Whitefield · Sarjapur'], ['south', 'South', 'JP Nagar · Kanakapura Rd · E-City'], ['west', 'West', 'Rajajinagar · Mysore Rd'], ['central', 'Central', 'CBD · Indiranagar · Koramangala'], ['outside', 'Outside Bangalore', 'Elsewhere in Karnataka & beyond']] },
  { id: 'floors', label: 'Floors', title: 'How many <em>floors?</em>', sub: 'G = ground floor.', hint: 'Watch it rise floor by floor.',
    opts: [['g1', 'G + 1', 'Ground + 1 floor'], ['g2', 'G + 2', 'Ground + 2 floors'], ['g3', 'G + 3', 'Ground + 3 floors'], ['hr', 'High-rise', 'G + 10 and above · apartments']] },
  { id: 'cons', label: 'Construction', title: 'Construction <em>system</em>', sub: 'Our two core systems — or let us recommend.', hint: 'Shows the site set-up: aluminium formwork & crane, or scaffolding & blockwork.',
    opts: [['mivan', 'Mivan', 'Aluminium formwork · monolithic walls & slabs'], ['block', 'Block masonry', 'Supervised masonry crews'], ['advise', 'Advise me', 'We’ll recommend the right fit']] },
  { id: 'tier', label: 'Finish', title: 'Quality & <em>finish</em>', sub: 'The level of specification you have in mind.', hint: 'Glazing size, railings, trims and lighting upgrade.',
    opts: [['standard', 'Standard', 'Durable, well-specified'], ['premium', 'Premium', 'Upgraded finishes & detailing'], ['luxury', 'Luxury', 'Bespoke materials, statement design']] },
  { id: 'style', label: 'Style', title: 'Architectural <em>style</em>', sub: 'How should it look and feel?', hint: 'Facade materials, colours, windows and roof change.',
    opts: [['modern', 'Modern minimal', 'Clean planes, white render, ribbon windows'], ['glass', 'Contemporary glass', 'Full-height glazing, slim frames'], ['classic', 'Classic / colonial', 'Columns, cornices, hipped roof'], ['tropical', 'Tropical', 'Timber, stone, deep overhangs'], ['indian', 'Indian traditional', 'Tiled roofs, chhajjas, warm ochre']] },
  { id: 'park', label: 'Parking', title: 'Parking', sub: 'How many cars should we plan for?', hint: 'Adds a carport, stilt parking or a basement ramp.',
    opts: [['none', 'None', 'No dedicated parking'], ['cov', '1–2 cars, covered', 'Carport in the front setback'], ['three', '3+ cars', 'Stilt or multi-bay parking'], ['base', 'Basement', 'Ramp down to basement parking']] },
  { id: 'extras', label: 'Extras', kind: 'multi', title: 'Anything <em>extra?</em>', sub: 'Select all that apply — or skip.', hint: 'Each extra appears on the model.',
    opts: [['pool', 'Swimming pool', ''], ['garden', 'Garden & landscaping', ''], ['terrace', 'Terrace garden', ''], ['lift', 'Home lift', ''], ['solar', 'Solar panels', ''], ['rwh', 'Rainwater harvesting', ''], ['theatre', 'Home theatre', ''], ['servant', 'Servant quarters', ''], ['wall', 'Boundary wall & gate', '']] },
  { id: 'plan', label: 'Timeline & budget', kind: 'plan', title: 'Timeline & <em>budget</em>', sub: 'Ranges only — this simply helps us prepare.',
    groups: [['timeline', 'When would you like to start?', [['t3', 'Within 3 months'], ['t6', '3–6 months'], ['t12', '6–12 months'], ['t0', 'Just exploring']]],
             ['budget', 'Approximate budget range', [['b1', 'Under ₹1 Cr'], ['b3', '₹1 – 3 Cr'], ['b10', '₹3 – 10 Cr'], ['b10p', '₹10 Cr +'], ['bx', 'Prefer to discuss']]]] },
  { id: 'contact', label: 'Contact', kind: 'contact', title: 'How should we <em>reach you?</em>', sub: 'Nothing is sent from this page — your details only prefill your brief.' },
];
// design variants per building type: [id, name, description, suggested style]
const VARIANTS = {
  villa: [['cantilever', 'Cantilever Modern', 'Floating volumes over a glass pavilion', 'modern'], ['courtyard', 'Courtyard Tropical', 'Low wings wrapped around a planted court', 'tropical'], ['palladian', 'Classic Palladian', 'Symmetry, a columned portico and pediment', 'classic']],
  apartment: [['tower', 'Glass Tower', 'A slender tower on a glazed podium', 'glass'], ['terraced', 'Terraced Green', 'Stepped floors with planted terraces', 'modern'], ['deco', 'Art Deco', 'Vertical fins and a stepped crown', 'classic']],
  commercial: [['podium', 'Podium & Tower', 'Retail podium with an offset tower', 'glass'], ['campus', 'Low-rise Campus', 'Twin blocks linked by a glass atrium', 'modern'], ['twist', 'Sculpted Twist', 'Floor plates that rotate as they rise', 'glass']],
  row: [['gabled', 'Gabled Terrace', 'Street-facing gables, front porches', 'indian'], ['staggered', 'Staggered Modern', 'Alternating heights and depths', 'modern'], ['sawtooth', 'Sawtooth Mews', 'Mono-pitch roofs and front courts', 'tropical']],
  farm: [['ranch', 'Long Ranch', 'Long and low with a deep verandah', 'tropical'], ['barn', 'Modern Barn', 'Twin timber barns with glazed gables', 'modern'], ['hacienda', 'Hacienda Courtyard', 'Tiled wings around a fountain court', 'indian']],
  unsure: [['compact', 'Compact', 'One efficient, simple volume', 'modern'], ['spread', 'Spread Out', 'Low, wide and garden-facing', 'tropical'], ['stacked', 'Stacked', 'Offset volumes with more height', 'glass']],
};
const variantsOf = t => VARIANTS[t] || [];
const variantRow = (st = S) => variantsOf(st.type).find(v => v[0] === st.variant) || null;
const LIGHTS = [['day', 'Day'], ['golden', 'Golden hour'], ['night', 'Night']];
const TIMES = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening'], ['any', 'Any time']];
const QI = Object.fromEntries(Q.map((q, i) => [q.id, i]));
const optLabel = (id, v) => { const q = Q[QI[id]]; const o = q && q.opts && q.opts.find(o => o[0] === v); return o ? o[1] : ''; };
const groupLabel = (g, v) => { const gr = Q[QI.plan].groups.find(x => x[0] === g); const o = gr[2].find(o => o[0] === v); return o ? o[1] : ''; };

/* ------------------------------------------------------------------ state */
const KEY = 'bnb-consult-v2';
let S = { extras: [], light: 'golden' }, step = -1;
try { const j = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (j && j.S) { S = Object.assign({ extras: [], light: 'golden' }, j.S); step = clamp(j.step | 0, -1, Q.length); } } catch (e) {}
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ S, step })); } catch (e) {} };

function plotFt(st = S) {
  const m = { '30x40': [30, 40], '30x50': [30, 50], '40x60': [40, 60], '60x80': [60, 80], 'acre': [200, 218] };
  if (st.plot === 'custom') return [clamp(+st.cw || 40, 15, 1500), clamp(+st.cd || 60, 15, 1500)];
  return m[st.plot] || [40, 60];
}
function plotLabel() {
  if (!S.plot) return '';
  if (S.plot === 'custom') { const [w, d] = plotFt(); return `${w} × ${d} ft (custom)`; }
  if (S.plot === 'acre') return '1 acre +';
  return optLabel('plot', S.plot) + ' ft';
}
function floorOpts() { return Q[QI.floors].opts.filter(o => o[0] !== 'hr' || S.type === 'apartment'); }
function valid(i) {
  const q = Q[i]; if (!q) return true;
  if (q.kind === 'multi') return true;
  if (q.kind === 'plan') return !!(S.timeline && S.budget);
  if (q.kind === 'contact') return contactErrors().length === 0;
  if (q.id === 'plot' && S.plot === 'custom') return +S.cw >= 15 && +S.cd >= 15;
  if (q.kind === 'variant') return !!variantRow();
  return !!S[q.id];
}
function contactErrors() {
  const e = [];
  if (!(S.name || '').trim()) e.push('name');
  if (!/^[+0-9 ()-]{8,}$/.test((S.phone || '').trim())) e.push('phone');
  if ((S.email || '').trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.email.trim())) e.push('email');
  return e;
}

/* ------------------------------------------------------------------ DOM */
let root, stageEl, canvas, bodyEl, progI, progBar, stepEl, backBtn, nextBtn, liveEl, hudEl, fbEl, loadEl, errEl, lastFocus, pushed = false, prevTitle = '';
const ICON_X = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';
const WA_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.42 1.3-1.95 1.35-.5.05-1.13.07-1.83-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.14.46.12.62-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z"/></svg>';
const FALLBACK_SVG = `<svg viewBox="0 0 600 420" aria-hidden="true" fill="none" stroke="#c9a96e" stroke-width="1.2"><path d="M60 300 300 380 540 300 300 220Z" opacity=".55"/><path d="M80 300 300 372 520 300" stroke-dasharray="4 6" opacity=".35"/><path d="M210 290V170L300 140 390 170V290L300 320Z" fill="rgba(201,169,110,.06)"/><path d="M210 170 300 200 390 170M300 200V320"/><path d="M230 200v30M255 208v30M325 208v30M350 200v30M230 250v30M255 258v30M325 258v30M350 250v30" opacity=".6"/><path d="M190 175 300 120 410 175" opacity=".8"/></svg>`;

function mount() {
  root = document.createElement('div');
  root.className = 'cx';
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'cx-title');
  root.innerHTML = `
  <div class="cx-stage">
    <canvas class="cx-canvas" role="img" aria-label="3D preview of your project"></canvas>
    <div class="cx-fallback" hidden>${FALLBACK_SVG}<p><b>3D preview unavailable</b>This device or browser can’t show the 3D model. Your answers still build your brief.</p></div>
    <div class="cx-top"><div class="cx-brand"><span class="mono">B<i>&amp;</i>B</span><span class="cx-bt">Build your vision</span></div></div>
    <div class="cx-light" role="group" aria-label="Preview lighting">${LIGHTS.map(([v, l]) => `<button type="button" data-light="${v}" aria-pressed="${S.light === v}">${l}</button>`).join('')}</div>
    <div class="cx-hud" aria-hidden="true"></div>
    <div class="cx-hint" aria-hidden="true">Drag to rotate · Scroll or pinch to zoom</div>
    <div class="cx-load" aria-hidden="true"><i></i><span>Preparing your site…</span></div>
  </div>
  <section class="cx-panel" aria-label="Consultation questions">
    <div class="cx-grab" aria-hidden="true"></div>
    <div class="cx-head">
      <div class="cx-meta"><span class="cx-step"></span></div>
      <div class="cx-prog" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="${Q.length}"><i></i></div>
    </div>
    <div class="cx-body"></div>
    <div class="cx-foot">
      <button class="cx-back" type="button"><span aria-hidden="true">←</span> Back</button>
      <p class="cx-err" role="alert"></p>
      <button class="btn cx-next" type="button">Next <span class="arr"></span></button>
    </div>
    <p class="sr cx-live" aria-live="polite"></p>
  </section>
  <button class="cx-x" type="button" aria-label="Close configurator">${ICON_X}</button>`;
  document.body.appendChild(root);
  stageEl = root.querySelector('.cx-stage'); canvas = root.querySelector('canvas'); bodyEl = root.querySelector('.cx-body');
  progBar = root.querySelector('.cx-prog'); progI = progBar.querySelector('i'); stepEl = root.querySelector('.cx-step');
  backBtn = root.querySelector('.cx-back'); nextBtn = root.querySelector('.cx-next'); liveEl = root.querySelector('.cx-live');
  hudEl = root.querySelector('.cx-hud'); fbEl = root.querySelector('.cx-fallback'); loadEl = root.querySelector('.cx-load'); errEl = root.querySelector('.cx-err');
  root.querySelector('.cx-x').addEventListener('click', () => close());
  backBtn.addEventListener('click', () => go(step - 1));
  nextBtn.addEventListener('click', next);
  root.addEventListener('keydown', onKey);
  bodyEl.addEventListener('change', onChange);
  bodyEl.addEventListener('input', onInput);
  bodyEl.addEventListener('click', onBodyClick);
  root.querySelector('.cx-light').addEventListener('click', e => {
    const b = e.target.closest('[data-light]'); if (!b) return;
    S.light = b.dataset.light; save();
    root.querySelectorAll('[data-light]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    if (threeOK) { applyLight(S.light); if (step === QI.variant) requestThumbs(); } liveEl.textContent = 'Lighting: ' + b.textContent;
  });
}

function onKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); close(); return; }
  if (e.key === 'Tab') { // focus trap
    const f = [...root.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.offsetParent !== null && !x.closest('[hidden]'));
    if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    return;
  }
  if (e.key === 'Enter' && e.target.matches('input[type=radio],input[type=checkbox]')) { e.preventDefault(); next(); }
}
function next() {
  if (step >= 0 && step < Q.length && !valid(step)) { showErr(); return; }
  go(step + 1);
}
function showErr() {
  const q = Q[step];
  let m = 'Please choose an option to continue.';
  if (q.kind === 'plan') m = 'Please choose a timeline and a budget range.';
  if (q.id === 'plot' && S.plot === 'custom') m = 'Please enter both dimensions (15 ft or more).';
  if (q.kind === 'contact') {
    const er = contactErrors();
    bodyEl.querySelectorAll('.fld').forEach(f => { const bad = er.includes(f.dataset.f); f.classList.toggle('bad', bad); const i = f.querySelector('input'); if (i) i.setAttribute('aria-invalid', bad); });
    m = 'Please check the highlighted fields.';
    const first = bodyEl.querySelector('.fld.bad input'); if (first) first.focus();
  }
  errEl.textContent = m; errEl.classList.add('show');
  clearTimeout(showErr.t); showErr.t = setTimeout(() => errEl.classList.remove('show'), 3200);
}
function onChange(e) {
  const t = e.target; if (!t.name) return;
  if (t.type === 'radio') {
    S[t.name] = t.value;
    if (t.name === 'type') { if (S.floors === 'hr' && S.type !== 'apartment') S.floors = null; if (!variantRow()) S.variant = null; if (S.styleAuto) { S.style = null; S.styleAuto = false; } }
    if (t.name === 'variant' && S.styleAuto) { S.style = null; S.styleAuto = false; }
    if (t.name === 'style') S.styleAuto = false;
    if (t.name === 'plot') { const c = bodyEl.querySelector('.cx-custom'); if (c) { c.hidden = t.value !== 'custom'; if (t.value === 'custom') c.querySelector('input').focus(); } }
  } else if (t.type === 'checkbox' && t.name === 'extras') {
    S.extras = [...bodyEl.querySelectorAll('input[name=extras]:checked')].map(x => x.value);
  }
  errEl.classList.remove('show');
  save(); refreshNav(); update3D(true);
}
function onInput(e) {
  const t = e.target;
  if (t.name === 'cw' || t.name === 'cd') { S[t.name] = t.value.replace(/[^0-9]/g, ''); save(); refreshNav(); clearTimeout(onInput.t); onInput.t = setTimeout(() => update3D(true), 350); }
  if (['name', 'phone', 'email'].includes(t.name)) { S[t.name] = t.value; save(); const f = t.closest('.fld'); if (f) f.classList.remove('bad'); refreshNav(); }
}
function onBodyClick(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act;
  if (a === 'begin') go(0);
  else if (a === 'edit') go(+b.dataset.i);
  else if (a === 'restart') { S = { extras: [], light: S.light || 'golden' }; save(); go(0); }
  else if (a === 'download') download(b);
}

/* ---------- step rendering */
function cardsHTML(name, opts, type, sel) {
  return opts.map(([v, l, s], i) => {
    const on = type === 'checkbox' ? (sel || []).includes(v) : sel === v;
    return `<label class="cx-opt"><input type="${type}" name="${name}" value="${v}"${on ? ' checked' : ''}><span class="cx-card"><span class="cx-ix" aria-hidden="true">${String.fromCharCode(65 + i)}</span><b>${l}</b>${s ? `<small>${s}</small>` : ''}</span></label>`;
  }).join('');
}
function go(i, opts = {}) {
  step = clamp(i, -1, Q.length);
  if (step === QI.style && !S.style && variantRow()) { S.style = variantRow()[3]; S.styleAuto = true; }
  save();
  renderStep(opts.noFocus);
  update3D(true);
}
function renderStep(noFocus) {
  errEl.classList.remove('show');
  const n = Q.length;
  root.classList.toggle('is-intro', step < 0); root.classList.toggle('is-summary', step >= n);
  progI.style.transform = `scaleX(${step < 0 ? 0 : Math.min(1, step / n)})`;
  progBar.setAttribute('aria-valuenow', Math.max(0, Math.min(step, n)));
  let h = '';
  if (step < 0) {
    stepEl.textContent = 'Consultation';
    h = `<div class="cx-intro">
      <p class="eyebrow">Build your vision</p>
      <h2 id="cx-title" tabindex="-1">Shape your project. <em>See it rise.</em></h2>
      <p class="cx-lead">Answer ${n} short questions and watch a 3D model of your project take shape on its plot — then share the brief with our team.</p>
      <ul class="cx-feats"><li><b>${n}</b><span>quick questions</span></li><li><b>3D</b><span>live model</span></li><li><b>~3</b><span>minutes</span></li></ul>
      <button class="btn cx-begin" type="button" data-act="begin">Begin <span class="arr"></span></button>
      <p class="cx-fine">Illustrative concept only — not a design, drawing or quotation.</p></div>`;
  } else if (step >= n) {
    stepEl.innerHTML = `<b>${Q.length} / ${Q.length}</b> <span>· Complete</span>`;
    h = summaryHTML();
  } else {
    const q = Q[step];
    stepEl.innerHTML = `<b>${String(step + 1).padStart(2, '0')}</b> / ${String(n).padStart(2, '0')} <span>· ${q.label}</span>`;
    h = `<h2 id="cx-title" tabindex="-1">${q.title}</h2>${q.sub ? `<p class="cx-sub">${q.sub}</p>` : ''}`;
    if (q.kind === 'variant') {
      const vs = variantsOf(S.type);
      h += vs.length ? `<fieldset class="cx-grid cx-vgrid"><legend class="sr">${q.label}</legend>${vs.map(([v, l, dsc, st], i) => `<label class="cx-opt cx-vopt"><input type="radio" name="variant" value="${v}"${S.variant === v ? ' checked' : ''}><span class="cx-card"><span class="cx-thumb" data-v="${v}" aria-hidden="true"><i></i></span><span class="cx-ix" aria-hidden="true">${String.fromCharCode(65 + i)} · ${optLabel('style', st)}</span><b>${l}</b><small>${dsc}</small></span></label>`).join('')}</fieldset>`
        : `<p class="cx-sub">Please choose what you want to build first.</p>`;
    } else if (q.kind === 'multi') {
      h += `<fieldset class="cx-grid multi"><legend class="sr">${q.label}</legend>${cardsHTML('extras', q.opts, 'checkbox', S.extras)}</fieldset>`;
    } else if (q.kind === 'plan') {
      h += q.groups.map(([g, lg, o]) => `<fieldset class="cx-chips"><legend>${lg}</legend><div>${o.map(([v, l]) => `<label class="cx-chip"><input type="radio" name="${g}" value="${v}"${S[g] === v ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>`).join('');
      h += `<p class="cx-fine">Budget ranges help us prepare for the conversation. We don’t quote prices here.</p>`;
    } else if (q.kind === 'contact') {
      h += `<div class="cx-form">
        <div class="fld" data-f="name"><label for="cx-name">Full name *</label><input id="cx-name" name="name" autocomplete="name" value="${esc(S.name)}"><div class="err">Please enter your name.</div></div>
        <div class="fld" data-f="phone"><label for="cx-phone">Phone / WhatsApp *</label><input id="cx-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91" value="${esc(S.phone)}"><div class="err">Please enter a valid phone number.</div></div>
        <div class="fld" data-f="email"><label for="cx-email">Email</label><input id="cx-email" name="email" type="email" autocomplete="email" value="${esc(S.email)}"><div class="err">Please enter a valid email.</div></div>
        <fieldset class="cx-chips"><legend>Preferred time to call</legend><div>${TIMES.map(([v, l]) => `<label class="cx-chip"><input type="radio" name="time" value="${v}"${S.time === v ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>
        <p class="cx-fine">Front-end demo — nothing is submitted or stored on a server.</p></div>`;
    } else {
      const opts = q.id === 'floors' ? floorOpts() : q.opts;
      if (q.id === 'style' && variantRow()) h += `<p class="cx-suggest"><span>Suggested for ${variantRow()[1]}:</span> ${optLabel('style', variantRow()[3])}</p>`;
      h += `<fieldset class="cx-grid${q.id === 'cons' || q.id === 'tier' ? ' one' : ''}"><legend class="sr">${q.label}</legend>${cardsHTML(q.id, opts, 'radio', S[q.id])}</fieldset>`;
      if (q.id === 'plot') h += `<div class="cx-custom" ${S.plot === 'custom' ? '' : 'hidden'}><div class="fld"><label for="cx-cw">Width (ft)</label><input id="cx-cw" name="cw" inputmode="numeric" value="${esc(S.cw)}" placeholder="e.g. 50"></div><span aria-hidden="true">×</span><div class="fld"><label for="cx-cd">Depth (ft)</label><input id="cx-cd" name="cd" inputmode="numeric" value="${esc(S.cd)}" placeholder="e.g. 80"></div></div>`;
    }
    if (q.hint) h += `<p class="cx-hintq"><i aria-hidden="true"></i>In 3D — ${q.hint}</p>`;
  }
  bodyEl.innerHTML = `<div class="cx-pane">${h}</div>`;
  if (step >= 0 && step < n && Q[step].kind === 'variant') requestThumbs();
  bodyEl.scrollTop = 0;
  refreshNav();
  if (!noFocus) { const t = bodyEl.querySelector('#cx-title'); if (t) t.focus({ preventScroll: true }); }
  renderHud();
}
function refreshNav() {
  const n = Q.length;
  backBtn.hidden = step < 0;
  nextBtn.hidden = step < 0 || step >= n;
  if (step >= 0 && step < n) {
    const q = Q[step];
    let lbl = 'Next';
    if (q.kind === 'multi') lbl = S.extras.length ? 'Next' : 'Skip';
    if (step === n - 1) lbl = 'See my vision';
    nextBtn.innerHTML = `${lbl} <span class="arr"></span>`;
    nextBtn.classList.toggle('is-off', !valid(step));
    nextBtn.setAttribute('aria-disabled', String(!valid(step)));
  }
  backBtn.innerHTML = step >= n ? '<span aria-hidden="true">←</span> Edit answers' : '<span aria-hidden="true">←</span> Back';
}
function rows() {
  const ex = (S.extras || []).map(v => optLabel('extras', v));
  return [
    ['type', 'Build', optLabel('type', S.type)], ['variant', 'Design', (variantRow() || [])[1]], ['plot', 'Plot', plotLabel()], ['loc', 'Location', optLabel('loc', S.loc)],
    ['floors', 'Floors', optLabel('floors', S.floors)], ['cons', 'Construction', optLabel('cons', S.cons)], ['tier', 'Finish', optLabel('tier', S.tier)],
    ['style', 'Style', optLabel('style', S.style)], ['park', 'Parking', optLabel('park', S.park)], ['extras', 'Extras', ex.length ? ex.join(', ') : 'None'],
    ['plan', 'Timeline', groupLabel('timeline', S.timeline)], ['plan', 'Budget range', groupLabel('budget', S.budget)],
    ['contact', 'Name', S.name], ['contact', 'Phone / WhatsApp', S.phone], ['contact', 'Email', S.email], ['contact', 'Preferred time', (TIMES.find(t => t[0] === S.time) || [])[1]],
  ];
}
function areaTxt() { return lastLayout && lastLayout.area ? (Math.round(lastLayout.area / 100) * 100).toLocaleString('en-IN') : ''; }
function summaryHTML() {
  const area = areaTxt();
  const r = rows().map(([id, k, v]) => `<div><dt>${k}</dt><dd>${v ? esc(v) : '<span class="cx-na">Not specified</span>'}</dd><button type="button" class="cx-edit" data-act="edit" data-i="${QI[id]}" aria-label="Edit ${k}">Edit</button></div>`).join('');
  return `<p class="eyebrow">Build your vision</p><h2 id="cx-title" tabindex="-1">Here’s your <em>vision.</em></h2>
  <p class="cx-sub">${esc(S.name ? S.name.trim().split(' ')[0] + ', ' : '')}this is the brief our team will use to prepare for your consultation.</p>
  <div class="cx-acts">
    <a class="btn cx-wa" href="${waLink()}" target="_blank" rel="noopener">${WA_ICON} Send via WhatsApp</a>
    <button class="btn ghost" type="button" data-act="download">Download brief <span class="arr"></span></button>
  </div>
  ${WA_IS_PLACEHOLDER ? `<p class="cx-ph"><span class="ph">Placeholder</span> WhatsApp number +${WA_NUMBER} is a placeholder — B&amp;B’s real number will be added before launch.</p>` : ''}
  <div class="cx-brief"><p class="cx-bh">Your brief</p><dl>${r}</dl>${area ? `<p class="cx-area"><b>≈ ${area} sq ft</b> built-up area in this concept <span>· indicative, for discussion only</span></p>` : ''}</div>
  <p class="cx-fine">The 3D model is an illustrative concept generated from your answers — not a design, drawing or quotation. <button type="button" class="cx-txt" data-act="restart">Start over</button></p>`;
}
function briefText() {
  const L = ['Hello B&B Enterprises — I’d like to discuss a project.', '', '*My brief — Build your vision*'];
  rows().forEach(([, k, v]) => { if (v) L.push(`• ${k}: ${v}`); });
  if (areaTxt()) L.push(`• Concept built-up area: ≈ ${areaTxt()} sq ft (indicative, for discussion only)`);
  return L.join('\n');
}
function waLink() { return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(briefText())}`; }
function renderHud() {
  if (!hudEl) return;
  const bits = [optLabel('type', S.type), variantRow() && variantRow()[1], S.plot && plotLabel(), S.floors && optLabel('floors', S.floors), S.style && optLabel('style', S.style), S.tier && optLabel('tier', S.tier)].filter(Boolean);
  hudEl.innerHTML = bits.length ? bits.map(b => `<span>${esc(b)}</span>`).join('') : '<span>Empty plot · awaiting your vision</span>';
}

/* ------------------------------------------------------------------ open / close */
let mounted = false, isOpen = false;
export function open(opts = {}) {
  if (!mounted) { mount(); mounted = true; }
  if (isOpen) return;
  isOpen = true; lastFocus = document.activeElement;
  prevTitle = document.title; document.title = 'Build your vision — B&B Enterprises';
  if (opts.push && location.pathname.split('/').pop() !== 'consult.html') { history.pushState({ bnbConsult: 1 }, '', 'consult.html'); pushed = true; }
  document.documentElement.classList.add('cx-lock');
  root.classList.add('open');
  renderStep();
  init3D().then(() => { update3D(false); start(); });
}
export function close(fromPop) {
  if (!isOpen) return;
  isOpen = false;
  root.classList.remove('open');
  document.documentElement.classList.remove('cx-lock');
  document.title = prevTitle;
  stop();
  if (pushed && !fromPop) { pushed = false; history.back(); }
  else pushed = false;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
addEventListener('popstate', e => { if (isOpen && !(e.state && e.state.bnbConsult)) close(true); else if (!isOpen && e.state && e.state.bnbConsult) { open(); pushed = true; } });

/* ------------------------------------------------------------------ 3D core */
let T, OrbitControls, RoomEnvironment, RGBELoader, RoundedBoxGeometry, mergeGeometries, mergeVertices, PP = null;
let renderer, scene, camera, controls, sun, hemi, fillL, world, grass, sky, stars, composer = null, bloom = null, gtao = null, grade = null;
let threeOK = null, initP = null, raf = 0, dirty = true, autoT = 0, camGoal = null, userActive = false;
let lastLayout = null, lastFrameSig = '', openedAt = 0;
const live = new Map(), dying = [];
const M = {}, G = {}, TX = {};
const mobile = matchMedia('(max-width: 860px), (pointer: coarse)').matches;
const qParam = new URLSearchParams(location.search).get('q');
let quality = ['high', 'medium', 'low'].includes(qParam) ? qParam : (mobile ? 'medium' : 'high');
const adaptive = !qParam;
const TEXURL = new URL('../tex/', import.meta.url).href;
const PR = { high: 1.75, medium: 1.5, low: 1 };

function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}
function showFallback() {
  threeOK = false; fbEl.hidden = false; loadEl.hidden = true; canvas.hidden = true;
  root.classList.add('no3d');
  root.querySelector('.cx-hint').hidden = true;
  root.querySelector('.cx-light').hidden = true;
}
async function loadPP() {
  if (PP) return PP;
  const j = VENDOR + 'jsm/postprocessing/';
  const m = await Promise.all(['EffectComposer', 'RenderPass', 'UnrealBloomPass', 'OutputPass', 'ShaderPass', 'GTAOPass'].map(n => import(j + n + '.js')));
  PP = Object.assign({}, ...m); return PP;
}
function init3D() {
  if (initP) return initP;
  initP = (async () => {
    if (!webglAvailable()) { showFallback(); return; }
    try {
      const j = VENDOR + 'jsm/';
      const [m3, oc, re, rg, rb, bu] = await Promise.all([import(VENDOR + 'three.module.min.js'), import(VENDOR + 'OrbitControls.js'), import(VENDOR + 'RoomEnvironment.js'), import(j + 'loaders/RGBELoader.js'), import(j + 'geometries/RoundedBoxGeometry.js'), import(j + 'utils/BufferGeometryUtils.js')]);
      T = m3; OrbitControls = oc.OrbitControls; RoomEnvironment = re.RoomEnvironment; RGBELoader = rg.RGBELoader; RoundedBoxGeometry = rb.RoundedBoxGeometry; mergeGeometries = bu.mergeGeometries; mergeVertices = bu.mergeVertices;
      if (quality !== 'low') await loadPP().catch(() => { quality = 'low'; });
      setupScene();
      await Promise.race([preloadTextures(), new Promise(r => setTimeout(r, 9000))]);
      loadHDRI();
      threeOK = true;
      applyLight(S.light || 'golden');
      setTimeout(() => loadEl.classList.add('done'), 150);
    } catch (err) { console.warn('3D preview unavailable:', err && err.message); showFallback(); }
  })();
  return initP;
}

/* ---------- helpers */
function keep(g) { g.userData.keep = true; return g; }
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// metre-based planar UVs from the dominant normal axis, so tiled textures keep a real-world scale
function worldUV(g) {
  const p = g.attributes.position, n = g.attributes.normal; if (!n) g.computeVertexNormals();
  const nn = g.attributes.normal; let uv = g.attributes.uv;
  if (!uv) { uv = new T.BufferAttribute(new Float32Array(p.count * 2), 2); g.setAttribute('uv', uv); }
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(nn.getX(i)), ay = Math.abs(nn.getY(i)), az = Math.abs(nn.getZ(i)), x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (ay >= ax && ay >= az) uv.setXY(i, x, z); else if (ax >= az) uv.setXY(i, z, y); else uv.setXY(i, x, y);
  }
  uv.needsUpdate = true; return g;
}
// bevelled box with its base at y (geometry baked in place so world UVs line up)
function B(w, h, d, mat, x = 0, y = 0, z = 0, cast = true, r) {
  r = r == null ? Math.min(.05, Math.min(w, h, d) * .22) : r;
  const g = r > .004 ? new RoundedBoxGeometry(w, h, d, 2, r) : new T.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z); worldUV(g);
  const m = new T.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = true; return m;
}
// instanced unit boxes: [x, yCentre, z, sx, sy, sz, rotY]
function inst(list, mat, geo, cast = false) {
  if (!list.length) return null;
  geo = geo || G.unit || (G.unit = keep(new T.BoxGeometry(1, 1, 1)));
  const im = new T.InstancedMesh(geo, mat, list.length), m4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3(), e = new T.Euler();
  list.forEach((a, i) => { p.set(a[0], a[1], a[2]); s.set(a[3], a[4], a[5]); e.set(a[7] || 0, a[6] || 0, 0); q.setFromEuler(e); m4.compose(p, q, s); im.setMatrixAt(i, m4); });
  im.computeBoundingSphere(); im.castShadow = cast; im.receiveShadow = true; return im;
}
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (srgb) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
}

/* ---------- textures (CC0, ambientCG) */
const TEXSETS = { plaster: 3, concrete: 2.6, siding: 1.6, deck: 1.8, stone: 2.2, paving: 2.4, lawn: 3.2, tileroof: 1.8, slate: 2.4, pooltile: 1.1 };
function prepTex(t, name, kind) {
  t.wrapS = t.wrapT = T.RepeatWrapping; const r = 1 / TEXSETS[name]; t.repeat.set(r, r);
  if (kind === 'col') t.colorSpace = T.SRGBColorSpace;
  t.anisotropy = Math.min(quality === 'low' ? 2 : 8, renderer.capabilities.getMaxAnisotropy()); return t;
}
function tex(name, kind) {
  const k = name + '_' + kind; if (TX[k]) return TX[k];
  return (TX[k] = prepTex(new T.TextureLoader().load(TEXURL + k + '.jpg', () => { dirty = true; if (renderer) renderer.shadowMap.needsUpdate = true; }), name, kind));
}
function preloadTextures() {
  const L = new T.TextureLoader();
  return Promise.all(Object.keys(TEXSETS).flatMap(n => ['col', 'nrm', 'rgh'].map(k => L.loadAsync(TEXURL + n + '_' + k + '.jpg').then(t => { if (!TX[n + '_' + k]) TX[n + '_' + k] = prepTex(t, n, k); }).catch(() => {}))));
}
function loadHDRI() {
  new RGBELoader().load(TEXURL + 'qwantani_sunset_puresky_1k.hdr', t => {
    const pm = new T.PMREMGenerator(renderer); const env = pm.fromEquirectangular(t).texture; t.dispose(); pm.dispose();
    const old = scene.environment; scene.environment = env;
    for (const m of Object.values(M)) if (m && m.envMap === old) m.envMap = env;
    if (old) old.dispose(); dirty = true;
  }, undefined, () => {});
}

/* ---------- lighting modes */
const LIGHT = {
  day: { sunC: 0xfff3df, sunI: 3.0, el: 52, az: 38, hemiS: 0xc4daf2, hemiG: 0x6b5d48, hemiI: 1.1, fillI: .5, top: 0x2f6cc0, mid: 0x86b4e6, hor: 0xe2ebf0, sunGlow: 0xfff2d6, sunS: 2.5, fog: 0xbfd2e2, exp: .9, env: 1.0, win: .4, lamps: 0, pool: .15, bloomS: .1, bloomT: 1.9, stars: 0, city: .08 },
  golden: { sunC: 0xffb36b, sunI: 2.9, el: 13, az: 62, hemiS: 0xf3c9a0, hemiG: 0x3b2c22, hemiI: .75, fillI: .45, top: 0x2a3b66, mid: 0xc98a6e, hor: 0xffcd8a, sunGlow: 0xffb066, sunS: 6, fog: 0xc9967a, exp: 1.0, env: .85, win: 2.3, lamps: 1.8, pool: .5, bloomS: .3, bloomT: 1.85, stars: 0, city: .45 },
  night: { sunC: 0x93a9ff, sunI: .55, el: 42, az: -35, hemiS: 0x37466f, hemiG: 0x0d0c10, hemiI: .45, fillI: .18, top: 0x03050c, mid: 0x0a1226, hor: 0x2b2a38, sunGlow: 0x9fb2ff, sunS: .6, fog: 0x0b0f1b, exp: 1.12, env: .16, win: 2.6, lamps: 4, pool: 1.4, bloomS: .75, bloomT: .85, stars: 1, city: 1 },
};
let LM = LIGHT.golden;
function applyLight(mode) {
  LM = LIGHT[mode] || LIGHT.golden; if (!scene) return;
  const el = LM.el * Math.PI / 180, az = LM.az * Math.PI / 180;
  sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize();
  sun.color.set(LM.sunC); sun.intensity = LM.sunI;
  hemi.color.set(LM.hemiS); hemi.groundColor.set(LM.hemiG); hemi.intensity = LM.hemiI; fillL.intensity = LM.fillI;
  const u = sky.material.uniforms; u.top.value.set(LM.top); u.mid.value.set(LM.mid); u.hor.value.set(LM.hor); u.sunC.value.set(LM.sunGlow); u.sunS.value = LM.sunS; u.sunD.value.copy(sunDir);
  scene.fog.color.set(LM.fog); scene.background.set(LM.fog);
  renderer.toneMappingExposure = LM.exp; scene.environmentIntensity = LM.env;
  for (const m of Object.values(M)) if (m && m.isMeshStandardMaterial) m.envMapIntensity = (m.userData.envBase || 1) * LM.env;
  stars.material.opacity = LM.stars; stars.visible = LM.stars > 0;
  updateEmissives();
  if (bloom) { bloom.strength = LM.bloomS; bloom.threshold = LM.bloomT; }
  if (lastLayout) frameSun(lastLayout);
  renderer.shadowMap.needsUpdate = true; dirty = true;
}
let sunDir = null;
function updateEmissives() {
  const tierK = { standard: .85, premium: 1, luxury: 1.2 }[(lastLayout && lastLayout.tier) || 'standard'];
  for (const [k, m] of Object.entries(M)) {
    if (!m || !m.userData) continue;
    const e = m.userData.emis; if (!e) continue;
    if (e === 'win') m.emissiveIntensity = LM.win * tierK * (m.userData.k || 1);
    else if (e === 'lamp') m.emissiveIntensity = .15 + LM.lamps;
    else if (e === 'pool') m.emissiveIntensity = LM.pool;
    else if (e === 'city') m.emissiveIntensity = LM.city;
    else if (e === 'kerb') m.emissiveIntensity = .1 + LM.lamps * .8;
    else if (e === 'pool2') m.opacity = .22 + LM.lamps * .12;
  }
}

/* ---------- scene */
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, res: { value: null }, vig: { value: .38 }, blur: { value: 1 }, time: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 res; uniform float vig, blur, time; varying vec2 vUv;
  void main(){ vec2 uv = vUv; vec4 c = texture2D(tDiffuse, uv);
    float f = smoothstep(.3, .52, abs(uv.y - .52)) * blur;
    if (f > .01) { vec2 px = f * 2.2 / res; vec4 s = c;
      s += texture2D(tDiffuse, uv + vec2(px.x, 0.)); s += texture2D(tDiffuse, uv - vec2(px.x, 0.)); s += texture2D(tDiffuse, uv + vec2(0., px.y)); s += texture2D(tDiffuse, uv - vec2(0., px.y));
      s += texture2D(tDiffuse, uv + px); s += texture2D(tDiffuse, uv - px); s += texture2D(tDiffuse, uv + vec2(px.x, -px.y)); s += texture2D(tDiffuse, uv + vec2(-px.x, px.y)); c = s / 9.; }
    float d = distance(uv, vec2(.5, .48)); c.rgb *= mix(1., smoothstep(.95, .28, d), vig);
    c.rgb += (fract(sin(dot(uv * res + time, vec2(12.9898, 78.233))) * 43758.5453) - .5) * .014;
    gl_FragColor = c; }`
};
function setupScene() {
  renderer = new T.WebGLRenderer({ canvas, antialias: quality === 'low', powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, PR[quality]));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = quality === 'low' ? T.PCFShadowMap : T.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); showFallback(); });
  scene = new T.Scene();
  scene.background = new T.Color(0x0b0e15);
  scene.fog = new T.Fog(0x0b0e15, 120, 700);
  const pm = new T.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  camera = new T.PerspectiveCamera(34, 1, 0.5, 5000);
  camera.position.set(34, 22, 40);
  sunDir = new T.Vector3(.5, .5, .5);

  sky = new T.Mesh(new T.SphereGeometry(3000, 48, 24), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T.Color() }, mid: { value: new T.Color() }, hor: { value: new T.Color() }, sunC: { value: new T.Color() }, sunD: { value: new T.Vector3(0, 1, 0) }, sunS: { value: 1 } },
    vertexShader: 'varying vec3 vp; void main(){ vp = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 top, mid, hor, sunC, sunD; uniform float sunS; varying vec3 vp;
      void main(){ vec3 d = normalize(vp); float h = d.y;
        vec3 c = mix(hor, mid, smoothstep(-.02, .2, h)); c = mix(c, top, smoothstep(.2, .85, h));
        float s = max(dot(d, normalize(sunD)), 0.);
        c += sunC * (pow(s, 5.) * .28 + pow(s, 48.) * .55 + pow(s, 1400.) * sunS);
        c = mix(c, hor * .5, smoothstep(0., -.2, h));
        gl_FragColor = vec4(c, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  const sp = new Float32Array(1800 * 3), r0 = rng(5);
  for (let i = 0; i < 1800; i++) { const u = r0(), v = r0() * .95 + .05, th = u * Math.PI * 2, ph = Math.acos(v); sp.set([Math.sin(ph) * Math.cos(th) * 2500, Math.cos(ph) * 2500, Math.sin(ph) * Math.sin(th) * 2500], i * 3); }
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
  stars = new T.Points(sg, new T.PointsMaterial({ color: 0xdfe6ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  stars.frustumCulled = false; scene.add(stars);

  hemi = new T.HemisphereLight(0x9fb2d6, 0x2a2318, 0.75); scene.add(hemi);
  sun = new T.DirectionalLight(0xffe0b5, 2.6); sun.castShadow = true;
  setShadowRes(); sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.035; sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  scene.add(sun, sun.target);
  fillL = new T.DirectionalLight(0x8aa0d0, 0.5); fillL.position.set(-60, 30, -40); scene.add(fillL);

  // terrain: lawn-textured rolling ground, flat around the plot
  const tg = new T.PlaneGeometry(2400, 2400, 160, 160); tg.rotateX(-Math.PI / 2);
  const pos = tg.attributes.position, col = new Float32Array(pos.count * 3), c1 = new T.Color(0x8a9a6a), c2 = new T.Color(0xb7b886), c3 = new T.Color(0x6f7f56), tmp = new T.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z);
    const n = Math.sin(x * .021) * Math.cos(z * .017) + Math.sin((x + z) * .0093) * 1.4 + Math.sin(x * .052 + 1.3) * Math.sin(z * .047) * .35;
    const f = clamp((r - 160) / 300, 0, 1);
    pos.setY(i, n * 7 * f * f - 0.03);
    const v = .5 + .5 * Math.sin(x * .05 + Math.cos(z * .04) * 2) * Math.cos(z * .03), k = .78 + v * .3 - clamp(Math.sin(x * .013 + z * .011), 0, 1) * .18;
    tmp.setRGB(k * 1.02, k, k * .9);
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  tg.setAttribute('color', new T.BufferAttribute(col, 3)); tg.computeVertexNormals(); worldUV(tg);
  const ground = new T.Mesh(tg, mat.terrain()); ground.receiveShadow = true; scene.add(ground);

  world = new T.Group(); scene.add(world);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07; controls.enablePan = false;
  controls.minDistance = 6; controls.maxDistance = 600; controls.maxPolarAngle = 1.45; controls.minPolarAngle = 0.25;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.45; controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.9;
  controls.addEventListener('start', () => { userActive = true; camGoal = null; controls.autoRotate = false; clearTimeout(autoT); });
  controls.addEventListener('end', () => { userActive = false; clearTimeout(autoT); if (!reduce) autoT = setTimeout(() => { controls.autoRotate = true; }, 5000); });
  controls.addEventListener('change', () => { dirty = true; });
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', e => {
    const k = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
    if (k) { e.preventDefault(); e.stopPropagation(); const off = camera.position.clone().sub(controls.target); const s = new T.Spherical().setFromVector3(off); s.theta += k[0]; s.phi = clamp(s.phi - k[1], controls.minPolarAngle, controls.maxPolarAngle); off.setFromSpherical(s); camera.position.copy(controls.target).add(off); controls.autoRotate = false; camGoal = null; dirty = true; }
    if (e.key === '+' || e.key === '=' || e.key === '-') { e.preventDefault(); const off = camera.position.clone().sub(controls.target).multiplyScalar(e.key === '-' ? 1.12 : 0.89); camera.position.copy(controls.target).add(off); camGoal = null; dirty = true; }
  });
  new ResizeObserver(resize).observe(stageEl);
  buildComposer(); resize();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (isOpen) start(); });
  buildGrass();
}
function setShadowRes() {
  const s = quality === 'high' ? 2048 : 1024;
  if (sun.shadow.mapSize.x !== s) { sun.shadow.mapSize.set(s, s); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
}
function buildComposer() {
  if (composer) { composer.dispose && composer.dispose(); composer = null; bloom = null; gtao = null; grade = null; }
  if (quality === 'low' || !PP) return;
  const w = Math.max(2, stageEl.clientWidth), h = Math.max(2, stageEl.clientHeight), pr = renderer.getPixelRatio();
  const rt = new T.WebGLRenderTarget(w * pr, h * pr, { type: T.HalfFloatType, samples: renderer.capabilities.isWebGL2 ? 4 : 0 });
  composer = new PP.EffectComposer(renderer, rt);
  composer.addPass(new PP.RenderPass(scene, camera));
  if (quality === 'high') {
    gtao = new PP.GTAOPass(scene, camera, w, h);
    const ss = gtao.setSize.bind(gtao); gtao.setSize = (a, b) => ss(Math.ceil(a / 2), Math.ceil(b / 2));
    gtao.output = PP.GTAOPass.OUTPUT.Default; gtao.blendIntensity = .75;
    gtao.updateGtaoMaterial({ radius: .9, distanceExponent: 2, thickness: 1.5, scale: 1, samples: 16, distanceFallOff: .6, screenSpaceRadius: false });
    gtao.updatePdMaterial({ lumaPhi: 8, depthPhi: 1.2, normalPhi: 2.5, radius: 9, rings: 3, samples: 16 });
    composer.addPass(gtao);
  }
  bloom = new PP.UnrealBloomPass(new T.Vector2(w, h), LM.bloomS, .42, LM.bloomT); composer.addPass(bloom);
  composer.addPass(new PP.OutputPass());
  grade = new PP.ShaderPass(GradeShader); grade.uniforms.res.value = new T.Vector2(w * pr, h * pr); grade.uniforms.blur.value = quality === 'high' ? 1 : 0;
  composer.addPass(grade);
  composer.setPixelRatio(pr); composer.setSize(w, h);
}
function setQuality(q) {
  if (q === quality || !renderer) return;
  quality = q; fpsN = 0; fpsT0 = 0; openedAt = performance.now();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, PR[q]));
  renderer.shadowMap.type = q === 'low' ? T.PCFShadowMap : T.PCFSoftShadowMap;
  setShadowRes();
  for (const m of Object.values(M)) if (m && m.userData && m.userData.glass) setGlassQ(m);
  if (grass) grass.visible = q !== 'low';
  const done = () => { buildComposer(); resize(); renderer.shadowMap.needsUpdate = true; dirty = true; };
  if (q !== 'low' && !PP) loadPP().then(done).catch(done); else done();
}
function resize() {
  if (!renderer) return;
  const w = stageEl.clientWidth, h = stageEl.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); if (grade) grade.uniforms.res.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio()); }
  dirty = true;
  if (lastLayout && camera) frame(lastLayout, true);
}
function renderFrame(dt = 0) {
  if (composer) { if (grade) grade.uniforms.time.value = (grade.uniforms.time.value + dt * 60) % 1000; composer.render(dt); }
  else renderer.render(scene, camera);
}
function start() { if (!threeOK || raf) return; dirty = true; openedAt = performance.now(); let last = performance.now(); const loop = now => { raf = requestAnimationFrame(loop); tick(now, Math.min(0.05, (now - last) / 1000)); last = now; }; raf = requestAnimationFrame(loop); }
function stop() { cancelAnimationFrame(raf); raf = 0; }

const ease = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c = 1.2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
function applyAnim(o, k) {
  const a = o.userData.anim.type, v = Math.max(0.0001, k);
  if (a === 'rise') o.scale.set(1, v, 1); else if (a === 'pop') o.scale.setScalar(v); else if (a === 'grow') o.scale.set(v, 1, v);
  o.visible = k > 0.002;
}
let fpsN = 0, fpsT0 = 0, slow = 0;
function tick(now, dt) {
  let anim = false;
  for (const o of live.values()) {
    const A = o.userData.anim; if (!A || A.done) continue;
    const t = clamp((now - A.t0) / A.dur, 0, 1);
    applyAnim(o, A.type === 'grow' ? ease(t) : easeBack(t));
    if (t >= 1) { A.done = true; applyAnim(o, 1); }
    anim = true;
  }
  for (let i = dying.length - 1; i >= 0; i--) {
    const o = dying[i], A = o.userData.anim, t = clamp((now - A.t0) / A.dur, 0, 1);
    applyAnim(o, 1 - ease(t)); anim = true;
    if (t >= 1) { world.remove(o); disposeObj(o); dying.splice(i, 1); }
  }
  if (camGoal && !userActive) {
    const t = clamp((now - camGoal.t0) / camGoal.dur, 0, 1), k = ease(t);
    controls.target.lerpVectors(camGoal.ft, camGoal.tt, k);
    const dir = camera.position.clone().sub(controls.target).normalize();
    const d = camGoal.fd + (camGoal.td - camGoal.fd) * k;
    if (camGoal.phi != null) { const s = new T.Spherical().setFromVector3(dir); s.phi = camGoal.fphi + (camGoal.phi - camGoal.fphi) * k; dir.setFromSpherical(s); }
    camera.position.copy(controls.target).addScaledVector(dir, d);
    if (t >= 1) camGoal = null;
    dirty = true;
  }
  if (!reduce && TX.waterN) { TX.waterN.offset.x += dt * .018; TX.waterN.offset.y += dt * .011; if (TX.waterN2) { TX.waterN2.offset.x -= dt * .012; } dirty = true; }
  controls.update(dt);
  if (anim) renderer.shadowMap.needsUpdate = true;
  if (anim || dirty || controls.autoRotate || userActive) {
    renderFrame(dt); dirty = false;
    // adaptive quality: step down if the device can't keep up
    if (adaptive && now - openedAt > 4000) {
      if (!fpsT0) fpsT0 = now; fpsN++;
      const el = (now - fpsT0) / 1000;
      if (el > 2.5) { const fps = fpsN / el; fpsN = 0; fpsT0 = now; slow = fps < 42 ? slow + 1 : 0; if (slow >= 2) { slow = 0; if (quality === 'high') setQuality('medium'); else if (quality === 'medium') setQuality('low'); } }
    }
  }
}
function disposeObj(o) { o.traverse(c => { if (c.geometry && !c.geometry.userData.keep) c.geometry.dispose(); }); }

function reconcile(parts) {
  const now = performance.now(), seen = new Set();
  const fresh = parts.filter(p => !live.has(p.key));
  const newFloors = fresh.filter(p => p.floor != null), n = newFloors.length;
  const stagger = reduce ? 0 : Math.min(170, 1700 / Math.max(1, n));
  const after = reduce ? 0 : (n ? 260 + n * stagger : 0);
  for (const p of parts) {
    seen.add(p.key);
    if (live.has(p.key)) continue;
    const o = p.make(); if (!o) continue;
    const delay = p.instant ? 0 : p.floor != null ? 200 + newFloors.indexOf(p) * stagger : (p.late ? after : 80) + (p.d || 0);
    const i0 = reduce || p.instant;
    o.userData.anim = { type: p.anim || 'pop', t0: now + delay, dur: i0 ? 1 : (p.dur || (p.floor != null ? 620 : 700)), done: i0 };
    applyAnim(o, i0 ? 1 : 0);
    world.add(o); live.set(p.key, o);
  }
  for (const [k, o] of live) if (!seen.has(k)) {
    live.delete(k);
    o.userData.anim = { type: o.userData.anim.type, t0: now, dur: reduce ? 1 : 320 };
    dying.push(o);
  }
  renderer.shadowMap.needsUpdate = true; dirty = true;
}
function at(m, x, y, z, cast = false) { m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; return m; }

/* ---------- palettes & materials */
const PAL = {
  model: { wall: 0xe9e3d8, base: 0xd2c9b8, trim: 0xf1ece3, frame: 0x8f877b, clad: 'render', roofM: 'slate', pitched: false, stone: 0xffffff, timber: 0xffe2c4 },
  modern: { wall: 0xf3efe7, base: 0x55565a, trim: 0xe9e4da, frame: 0x1d1e21, clad: 'render', roofM: 'metal', pitched: false, stone: 0xf4ece0, timber: 0xffd6b0 },
  glass: { wall: 0x3b3e44, base: 0x2b2d31, trim: 0x2a2c30, frame: 0x16171a, clad: 'dark', roofM: 'metal', pitched: false, stone: 0xd8d4ce, timber: 0xd9b090 },
  classic: { wall: 0xf0e4cb, base: 0xd9c9a8, trim: 0xfbf7ef, frame: 0xf6f1e6, clad: 'render', roofM: 'slate', pitched: 'hip', stone: 0xffffff, timber: 0xf2caa0 },
  tropical: { wall: 0xe7dcc8, base: 0x6d655b, trim: 0xd9ccb4, frame: 0x3e2b1c, clad: 'render', roofM: 'slate', pitched: 'hip', low: true, stone: 0xf6eadb, timber: 0xffd2a4 },
  indian: { wall: 0xdba86d, base: 0xa86448, trim: 0xf1e2c4, frame: 0x5c3319, clad: 'render', roofM: 'tile', pitched: 'gable', stone: 0xffc8a8, timber: 0xf0b890 },
};
// material cache: envBase scales with the lighting mode's env intensity; emis tags drive per-mode emissive levels
function std(key, p, Ctor) {
  if (M[key]) return M[key];
  const { envI = 1, emis, k, ...q } = p;
  const m = new (Ctor || T.MeshStandardMaterial)(q);
  m.userData.envBase = envI; if (emis) { m.userData.emis = emis; m.userData.k = k || 1; }
  if (m.isMeshStandardMaterial) { m.envMap = scene.environment; m.envMapIntensity = envI * LM.env; }
  M[key] = m; if (emis) updateEmissives(); return m;
}
const phys = (key, p) => std(key, p, T.MeshPhysicalMaterial);
function texd(key, set, p, Ctor) {
  return std(key, Object.assign({ map: tex(set, 'col'), normalMap: tex(set, 'nrm'), roughnessMap: tex(set, 'rgh'), roughness: 1 }, p), Ctor);
}
function setGlassQ(m) {
  const hi = quality === 'high';
  m.transmission = hi ? 1 : 0; m.transparent = !hi; m.opacity = hi ? 1 : m.userData.op; m.depthWrite = hi; m.needsUpdate = true;
}
function glassMat(key, color, op = .28, rough = .03) {
  if (M[key]) return M[key];
  const m = phys(key, { color, metalness: 0, roughness: rough, ior: 1.5, thickness: .04, specularIntensity: 1, envI: 1.5, side: T.FrontSide });
  m.userData.glass = true; m.userData.op = op; setGlassQ(m); return m;
}
const INT = [];
function interiorTex(v) {
  if (INT[v]) return INT[v];
  return (INT[v] = canvasTex(256, 256, (g, w, h) => {
    const r = rng(31 + v * 7);
    const pal = [['#ffcf94', '#d9944f', '#5a3a22'], ['#fff0d8', '#d2b48e', '#4a4038'], ['#f0b77a', '#7d5236', '#2a1c14']][v];
    let gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, pal[0]); gr.addColorStop(.55, pal[1]); gr.addColorStop(1, pal[2]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,250,235,.95)'; g.fillRect(w * .1, 6, w * .8, 7); // ceiling light strip
    for (let i = 0; i < 3; i++) { const x = r() * w, rg = g.createRadialGradient(x, 30, 2, x, 30, 70); rg.addColorStop(0, 'rgba(255,240,210,.7)'); rg.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); }
    g.fillStyle = 'rgba(40,25,15,.75)'; // furniture silhouettes
    g.fillRect(w * (.15 + r() * .2), h * .72, w * .32, h * .12); g.fillRect(w * .62, h * .4, w * .06, h * .48);
    g.fillRect(w * .7, h * .3, w * .22, h * .03); g.fillRect(w * .7, h * .5, w * .22, h * .03);
    g.beginPath(); g.arc(w * .1, h * .62, w * .07, 0, 7); g.fill(); g.fillRect(w * .09, h * .62, w * .02, h * .26);
    if (v === 2) { g.fillStyle = 'rgba(20,14,10,.55)'; for (let y = 0; y < h; y += 9) g.fillRect(0, y, w, 4); } // blinds
  }));
}
function clad(style, c) {
  const P = PAL[style] || PAL.model;
  switch (c) {
    case 'stone': return texd('stone-' + style, 'stone', { color: P.stone, normalScale: new T.Vector2(1.2, 1.2) });
    case 'timber': return texd('timber-' + style, 'siding', { color: P.timber, envI: .6 });
    case 'stone2': return texd('stone2-' + style, 'stone', { color: 0xffffff });
    case 'concrete': return texd('conc-' + style, 'concrete', { color: 0xd4d0c8, normalScale: new T.Vector2(.6, .6) });
    case 'dark': return texd('dark-' + style, 'concrete', { color: 0x4a4c52, metalness: .35, roughness: .7, normalScale: new T.Vector2(.4, .4) });
    case 'trim': return texd('trimr-' + style, 'plaster', { color: P.trim, normalScale: new T.Vector2(.35, .35) });
    case 'base': return texd('baser-' + style, 'plaster', { color: P.base, normalScale: new T.Vector2(.5, .5) });
    default: return texd('render-' + style, 'plaster', { color: P.wall, normalScale: new T.Vector2(.45, .45) });
  }
}
const mat = {
  ghost: () => std('ghost', { color: 0xe9e1d2, roughness: .6, transparent: true, opacity: .3, depthWrite: false }),
  trim: s => clad(s, 'trim'),
  base: s => clad(s, 'base'),
  frame: (s, tier) => tier === 'luxury' && s !== 'classic' ? mat.gold() : std('frame-' + s, { color: PAL[s].frame, roughness: .42, metalness: ['modern', 'glass', 'model'].includes(s) ? .7 : 0, envI: 1.1 }),
  roofT: (s, m) => {
    m = m || PAL[s].roofM;
    if (m === 'tile') return texd('rooftile', 'tileroof', { color: 0xf2e2d6, side: T.DoubleSide });
    if (m === 'metal') return std('roofmetal-' + s, { color: s === 'glass' ? 0x3a3c40 : 0x45474c, roughness: .45, metalness: .75, side: T.DoubleSide, envI: 1.1 });
    if (m === 'thatch') return texd('roofthatch', 'deck', { color: 0x8a6a48, side: T.DoubleSide });
    return texd('roofslate-' + s, 'slate', { color: s === 'tropical' ? 0x8a8078 : 0xb4b4bc, side: T.DoubleSide });
  },
  gold: () => std('gold', { color: 0xd7b77c, roughness: .26, metalness: 1, envI: 1.6 }),
  glass: () => glassMat('glass', 0xe3eef0, .26),
  glassD: () => glassMat('glassD', 0xb9cbd6, .45, .02),
  rail: () => glassMat('railg', 0xd6e6ea, .22),
  int: v => std('int' + v, { color: 0x111111, roughness: .9, emissive: 0xffffff, emissiveMap: interiorTex(v), emis: 'win', k: [1, .85, .55][v], envI: .2 }),
  intCore: () => std('intcore', { color: 0x111111, roughness: .9, emissive: 0xffffff, emissiveMap: (() => { const t = interiorTex(0).clone(); t.repeat.set(.24, .3); t.needsUpdate = true; return t; })(), emis: 'win', k: .9 }),
  conc: () => texd('concG', 'concrete', { color: 0xbab6ae }),
  pave: () => texd('pave', 'paving', { color: 0xe2dacd }),
  paveD: () => texd('paveD', 'stone', { color: 0xe8e0d4 }),
  deck: () => texd('deck', 'deck', { color: 0xe0c3a4, envI: .7 }),
  lawn: () => texd('lawn', 'lawn', { color: 0xd2dcb4, roughnessMap: null, roughness: .95, normalScale: new T.Vector2(.6, .6), envI: .5 }),
  pooltile: () => texd('pooltile', 'pooltile', { color: 0xbfe2ea, emissive: 0x0e7f9c, emis: 'pool', envI: .8 }),
  asph: () => texd('asph', 'concrete', { color: 0x4a4a4e, normalScale: new T.Vector2(.5, .5) }),
  soil: () => std('soil', { color: 0x5b4a37, roughness: 1 }),
  terrain: () => texd('terrain', 'lawn', { color: 0xd8dcbc, vertexColors: true, roughnessMap: null, roughness: 1, normalScale: new T.Vector2(.5, .5), envI: .45 }),
  water: () => {
    if (M.water) return M.water;
    if (!TX.waterN) { TX.waterN = waterNormal(); }
    return phys('water', { color: 0x2a9fbf, roughness: .04, metalness: 0, transmission: 0, transparent: true, opacity: .86, normalMap: TX.waterN, normalScale: new T.Vector2(.35, .35), clearcoat: 1, clearcoatRoughness: .05, envI: 1.4, emissive: 0x0b6f8a, emis: 'pool' });
  },
  leaf: k => std('leaf' + k, { color: 0xffffff, roughness: .8, envI: .45 }),
  trunk: () => std('trunk', { color: 0x3b3029, roughness: 1 }),
  wood: () => texd('woodm', 'deck', { color: 0xc08a5c, envI: .3 }),
  steel: () => std('steel', { color: 0xb8bcc2, roughness: .32, metalness: .9, envI: 1.2 }),
  black: () => std('black', { color: 0x0b0b0d, roughness: .85 }),
  rubber: () => std('rubber', { color: 0x161618, roughness: .7 }),
  solar: () => std('solar', { color: 0xffffff, roughness: .18, metalness: .4, map: solarTex(), envI: 1.5 }),
  theatre: () => std('theatre', { color: 0x10122a, emissive: 0x6d74ff, emissiveIntensity: 1.2, roughness: .4 }),
  lamp: () => std('lamp', { color: 0xfff1d6, emissive: 0xffc983, emis: 'lamp' }),
  kerbL: () => std('kerbL', { color: 0xfff1d6, emissive: 0xffc983, emis: 'kerb' }),
  peg: () => std('peg', { color: 0xc9a96e, emissive: 0xc9a96e, emissiveIntensity: .5, roughness: .4, metalness: .6 }),
  edge: () => M.edge || (M.edge = new T.LineBasicMaterial({ color: 0xd8b97e, transparent: true, opacity: .9 })),
  city: () => std('city', { color: 0xb8b2a8, roughness: .85, map: cityTex(1), emissive: 0xffffff, emissiveMap: cityTex(), emis: 'city', envI: .5 }),
  shadow: () => M.shadow || (M.shadow = new T.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: .55, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -2 })),
  pool2: () => std('pool2', { color: 0xffc27a, map: radialTex(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, emis: 'pool2', fog: false }, T.MeshBasicMaterial),
};
function solarTex() { return TX.solar || (TX.solar = canvasTex(128, 192, (g, w, h) => { g.fillStyle = '#152349'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7c8ec4'; g.lineWidth = 2; for (let x = 0; x <= w; x += w / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } })); }
function cityTex(alb) { const k = alb ? 'cityA' : 'city'; return TX[k] || (TX[k] = canvasTex(64, 128, (g, w, h) => { g.fillStyle = alb ? '#cfc8bc' : '#000'; g.fillRect(0, 0, w, h); const r = rng(7); for (let y = 4; y < h; y += 8) for (let x = 3; x < w; x += 8) { const lit = r() < .33, c = r(), a = .35 + r() * .5; if (alb) { g.fillStyle = '#3a3f47'; g.globalAlpha = .9; g.fillRect(x, y, 4, 5); } else if (lit) { g.fillStyle = c < .7 ? '#ffcf8f' : '#cfe3ff'; g.globalAlpha = a; g.fillRect(x, y, 4, 4); } } if (alb) { g.globalAlpha = 1; g.fillStyle = '#b5ad9f'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 1); } })); }
function radialTex() { return TX.radial || (TX.radial = canvasTex(128, 128, (g, w, h) => { const rg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(.4, 'rgba(255,255,255,.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); })); }
function shadowTex() { // soft rounded-rect falloff: stretches cleanly under boxes, cars and trees
  return TX.shadow || (TX.shadow = canvasTex(128, 128, (g, w, h) => {
    const id = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = Math.max(0, Math.abs(x - w / 2 + .5) - w * .26) / (w * .24), dy = Math.max(0, Math.abs(y - h / 2 + .5) - h * .26) / (h * .24), d = Math.min(1, Math.hypot(dx, dy)); id.data[(y * w + x) * 4 + 3] = 255 * Math.pow(1 - d, 2); }
    g.putImageData(id, 0, 0);
  }, false));
}
function waterNormal() {
  const t = canvasTex(256, 256, (g, w, h) => {
    const id = g.createImageData(w, h), H = (x, y) => { const a = x / w * Math.PI * 2, b = y / h * Math.PI * 2; return Math.sin(a * 3 + Math.sin(b * 2) * 1.5) * .5 + Math.sin(b * 5 + a * 2) * .3 + Math.sin((a - b) * 7) * .15 + Math.sin(a * 11 + b * 4) * .07; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = H(x + 1, y) - H(x - 1, y), dy = H(x, y + 1) - H(x, y - 1), l = Math.hypot(dx * 3, dy * 3, 1), i = (y * w + x) * 4; id.data[i] = 128 + 127 * (-dx * 3 / l); id.data[i + 1] = 128 + 127 * (-dy * 3 / l); id.data[i + 2] = 255 / l; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0);
  }, false);
  t.repeat.set(.35, .35); return t;
}

/* ---------- layout: everything in metres, plot centred on the origin, road on +z.
   Each design variant is a stack of levels of volumes; roofs are assigned from coverage. */
const effStyle = st => st.style || ((variantRow(st) || [])[3]) || 'model';
function vol(x, z, w, d, o = {}) { return Object.assign({ x, z, w, d, kind: 'solid' }, o); }
function variantLevels(type, v, W, D, n, P) {
  const lv = [], dec = [], rep = (k, f) => { for (let i = 0; i < k; i++) lv.push(f(i)); };
  const top = i => i === n - 1;
  switch (type + '/' + v) {
    case 'villa/cantilever':
      lv.push([vol(-W * .2, -D * .1, W * .5, D * .7, { clad: 'stone' }), vol(W * .27, -D * .14, W * .42, D * .6, { kind: 'glazed' })]);
      if (n > 1) lv.push([vol(W * .05, D * .07, W * .98, D * .48, { clad: 'render', ribbon: true })]);
      for (let i = 2; i < n; i++) lv.push([vol(i % 2 ? -W * .18 : W * .12, -D * .12, W * .48, D * .44, { clad: i % 2 ? 'timber' : 'render' })]);
      if (n === 1) lv[0].push(vol(-W * .2, D * .3, W * .5, D * .12, { h: .3, kind: 'canopy' }));
      dec.push({ k: 'pond', x: W * .3, z: D * .3, w: W * .38, d: 1.6 });
      break;
    case 'villa/courtyard':
      lv.push([vol(0, -D * .32, W, D * .36, { roof: 'gable-x' }), vol(-W * .37, D * .14, W * .26, D * .56, { roof: 'gable-z', clad: 'stone' }), vol(W * .37, D * .14, W * .26, D * .56, { roof: 'gable-z', clad: 'stone' })]);
      for (let i = 1; i < n; i++) lv.push([vol(0, -D * .32, W * (i === 1 ? .74 : .5), D * .34, { roof: 'hip', clad: i === 1 ? 'timber' : 'render' })]);
      dec.push({ k: 'court', x: 0, z: D * .12, w: W * .46, d: D * .5 }, { k: 'pergola', x: 0, z: D * .4, w: W * .44, d: 2.4 });
      break;
    case 'villa/palladian': {
      const cw = W * .46, cd = D * .78;
      lv.push([vol(0, 0, cw, cd, { roof: 'hip' }), vol(-W * .37, -D * .1, W * .28, D * .5, { roof: 'flat', bal: true }), vol(W * .37, -D * .1, W * .28, D * .5, { roof: 'flat', bal: true })]);
      for (let i = 1; i < n; i++) lv.push([vol(0, 0, cw, cd, { roof: 'hip' })]);
      dec.push({ k: 'portico', x: 0, z: cd / 2, w: Math.min(cw * .8, 9), floors: Math.min(2, n), ped: true });
      break; }
    case 'apartment/tower': {
      const pod = n > 5 ? 2 : 1;
      rep(Math.min(pod, n), () => [vol(0, 0, W, D, { kind: 'glazed' })]);
      for (let i = pod; i < n; i++) lv.push([vol(W * .14, -D * .06, W * .56, D * .66, { kind: 'glazed', fins: true })]);
      dec.push({ k: 'crown', lvl: n - 1 });
      break; }
    case 'apartment/terraced': {
      const k = Math.min(.13, .6 / Math.max(1, n - 1));
      rep(n, i => [vol(0, -D * k * i / 2, W * (1 - (i > n * .6 ? .1 : 0)), D * (1 - k * i), { clad: i % 3 === 2 ? 'timber' : 'render', planters: true })]);
      break; }
    case 'apartment/deco':
      rep(n, i => {
        const f = i / Math.max(1, n), s = f > .82 ? .5 : f > .62 ? .74 : 1;
        const a = [vol(0, 0, W * s, D * (s === 1 ? 1 : s + .1), { pil: true, roof: 'flat' })];
        if (s === 1) a.push(vol(0, D / 2 + .5, W * .26, 1, { clad: 'trim', pil: true, roof: 'flat' }));
        return a;
      });
      dec.push({ k: 'spire', lvl: n - 1 });
      break;
    case 'commercial/podium':
      lv.push([vol(0, 0, W, D, { kind: 'glazed' })]);
      if (n > 1) lv.push([vol(0, 0, W, D, { clad: 'stone', ribbon: true })]);
      for (let i = 2; i < n; i++) lv.push([vol(-W * .2, -D * .12, W * .52, D * .62, { kind: 'glazed', fins: true })]);
      if (n <= 2) lv.push([vol(-W * .2, -D * .12, W * .52, D * .62, { kind: 'glazed', fins: true })]);
      dec.push({ k: 'canopy', x: W * .2, z: D / 2 + 1.2, w: W * .4, d: 2.4, y: 3.6 });
      break;
    case 'commercial/campus':
      rep(n, () => [vol(-W * .32, 0, W * .36, D * .88, { clad: 'concrete', fins: true }), vol(W * .32, -D * .05, W * .36, D * .78, { clad: 'concrete', fins: true }), vol(0, -D * .02, W * .3, D * .46, { kind: 'glazed' })]);
      dec.push({ k: 'canopy', x: 0, z: D * .23 + 1.4, w: W * .34, d: 3, y: 3.2 });
      break;
    case 'commercial/twist': {
      const s = Math.min(W, D) * .86;
      rep(Math.max(n + 1, 5), i => [vol(0, 0, s, s, { kind: 'glazed', rot: i * .13, slab: .55 })]);
      break; }
    case 'row/gabled': case 'row/staggered': case 'row/sawtooth': {
      const u = P.units, uw = W / u;
      for (let i = 0; i < n; i++) {
        const a = [];
        for (let k = 0; k < u; k++) {
          const x = -W / 2 + uw * (k + .5);
          if (v === 'gabled') a.push(vol(x, (k % 2 ? -.4 : .4), uw - .14, D - .8, { roof: 'gable-z', unit: k }));
          else if (v === 'staggered') { if (i === n - 1 && k % 2 && n > 1) continue; a.push(vol(x, (k % 2 ? -1.1 : .5) - (i ? .9 : 0), uw - .1, D * (k % 2 ? .8 : .92) - (i ? 1.4 : 0), { roof: 'flat', clad: k % 2 ? 'timber' : 'render', unit: k })); }
          else a.push(vol(x, -1.3, uw - .14, D - 2.6, { roof: i === n - 1 ? 'mono-x' : 'flat', unit: k, clad: k % 2 ? 'render' : 'stone' }));
        }
        lv.push(a);
      }
      for (let k = 0; k < u; k++) { const x = -W / 2 + uw * (k + .5); if (v === 'gabled') dec.push({ k: 'porch', x, z: D / 2 - .4 + (k % 2 ? -.8 : 0), w: Math.min(2.6, uw * .5), d: 1.5 }); if (v === 'sawtooth') dec.push({ k: 'pergola', x, z: D / 2 - 1.1, w: uw - .8, d: 2 }); }
      break; }
    case 'farm/ranch':
      lv.push([vol(W * .1, -D * .16, W * .8, D * .42, { roof: 'gable-x', clad: 'stone' }), vol(-W * .36, D * .2, W * .26, D * .44, { roof: 'gable-z' })]);
      for (let i = 1; i < n; i++) lv.push([vol(W * .12, -D * .18, W * .34, D * .34, { roof: 'gable-x', clad: 'timber' })]);
      dec.push({ k: 'verandah', x: W * .14, z: -D * .16 + D * .21 + 1.4, w: W * .7, d: 2.8 });
      break;
    case 'farm/barn': {
      const bh = Math.max(1, Math.min(n, 2));
      for (let i = 0; i < bh; i++) lv.push([vol(-W * .28, 0, W * .3, D * .82, { roof: 'barn', clad: 'timber', gableGlass: true }), vol(W * .28, -D * .06, W * .3, D * .7, { roof: 'barn', clad: 'dark', gableGlass: true }), ...(i === 0 ? [vol(0, -D * .05, W * .26, D * .36, { kind: 'glazed', roof: 'flat' })] : [])]);
      for (let i = bh; i < n; i++) lv.push([vol(-W * .28, 0, W * .3, D * .82, { roof: 'barn', clad: 'timber', gableGlass: true })]);
      break; }
    case 'farm/hacienda':
      lv.push([vol(0, -D * .37, W, D * .26, { roof: 'gable-x' }), vol(-W * .4, .3, W * .2, D * .48, { roof: 'gable-z' }), vol(W * .4, .3, W * .2, D * .48, { roof: 'gable-z' }), vol(-W * .29, D * .37, W * .42, D * .24, { roof: 'gable-x' }), vol(W * .29, D * .37, W * .42, D * .24, { roof: 'gable-x' })]);
      for (let i = 1; i < n; i++) lv.push([vol(0, -D * .37, W * .55, D * .24, { roof: 'hip', clad: 'render' })]);
      dec.push({ k: 'fountain', x: 0, z: 0 }, { k: 'court', x: 0, z: 0, w: W * .5, d: D * .42, paved: true });
      break;
    case 'unsure/spread':
      lv.push([vol(-W * .15, -D * .1, W * .66, D * .5), vol(W * .3, D * .12, W * .36, D * .5)]);
      for (let i = 1; i < n; i++) lv.push([vol(-W * .15, -D * .1, W * .5, D * .42)]);
      break;
    case 'unsure/stacked':
      rep(n, i => [vol(i % 2 ? W * .1 : -W * .08, i % 2 ? -D * .1 : D * .04, W * (.7 - i * .05), D * (.68 - i * .04), { kind: i % 2 ? 'glazed' : 'solid' })]);
      break;
    default: // unsure/compact and the neutral "help me decide" model
      rep(n, i => [vol(0, i ? -D * .04 : 0, W * (i ? .9 : .86), D * (i ? .82 : .86))]);
  }
  return { lv, dec };
}
function layoutOf(st = S, opt = {}) {
  const [W0, D0] = opt.plot || plotFt(st); const pw = W0 * FT, pd = D0 * FT;
  const type = st.type || null, tier = st.tier || 'standard', cons = st.cons || 'advise';
  const vrow = variantRow(st), variant = vrow ? vrow[0] : null;
  const ghost = type === 'unsure' && !variant && !st.style;
  const style = ghost ? 'model' : effStyle(st);
  const ex = new Set(opt.bare ? [] : (st.extras || [])), park = opt.bare ? 'none' : (st.park || 'none');
  const fh = { villa: 3.3, apartment: 3.05, commercial: 4.0, row: 3.2, farm: 3.6, unsure: 3.3 }[type] || 3.2;
  const defF = { villa: 2, apartment: 4, commercial: 3, row: 2, farm: 1, unsure: 2 }[type] || 2;
  const nF = { g1: 2, g2: 3, g3: 4, hr: 16 }[st.floors] || defF;
  const L = { pw, pd, type, variant, style, tier, cons, ex, park, ghost, fh, nF, levels: [], decor: [], flatZones: [], slopes: [], thumb: !!opt.bare };
  if (!type) { L.H = 0; return L; }
  let side = clamp(pw * .08, .9, 5), front = clamp(pd * .14, 1.5, 10), rear = clamp(pd * .08, 1, 6);
  const smallW = pw < 14;
  const stilt = park === 'three' && (smallW || type === 'apartment' || type === 'commercial');
  const carport = park === 'cov' || (park === 'three' && !stilt);
  if (carport) front = Math.max(front, 6.4);
  if (park === 'base') front = Math.max(front, 7.6);
  if (ex.has('wall')) { side = Math.max(side, 1.1); rear = Math.max(rear, 1.3); }
  let poolMode = null;
  if (ex.has('pool')) poolMode = (type === 'commercial' || (type === 'apartment' && (nF > 4 || pd < 25)) || (pd < 16 && type !== 'farm' && type !== 'row')) ? 'roof' : 'ground';
  if (poolMode === 'ground' && type !== 'farm') rear = Math.max(rear, Math.min(6.5, pd * .3));
  if (ex.has('servant') && type !== 'farm') rear = Math.max(rear, Math.min(5, pd * .3));
  const cap = { villa: [22, 17], apartment: [36, 22], commercial: [44, 30], row: [56, 14], farm: [30, 22], unsure: [18, 14] }[type];
  const bw = clamp(Math.min(pw - 2 * side, cap[0]), 4, 999), bd = clamp(Math.min(pd - front - rear, cap[1]), 4, 999);
  const bz = (rear - front) / 2, bx = 0, plinth = 0.45;
  const units = type === 'row' ? clamp(Math.round(bw / 5.2), 2, 8) : 1;
  Object.assign(L, { side, front, rear, stilt, carport, poolMode, bw, bd, bx, bz, plinth, units });
  const { lv, dec } = variantLevels(type, ghost ? 'compact' : (variant || ({ villa: 'cantilever', apartment: 'terraced', commercial: 'podium', row: 'gabled', farm: 'ranch' }[type] || 'compact')), bw, bd, nF, { units });
  // clamp volumes into the plot and offset by the buildable centre
  for (const a of lv) for (const v of a) { v.x += bx; v.z += bz; const mx = pw / 2 - .4, mz = pd / 2 - .4; v.w = Math.min(v.w, 2 * mx); v.d = Math.min(v.d, 2 * mz); v.x = clamp(v.x, -mx + v.w / 2, mx - v.w / 2); v.z = clamp(v.z, -mz + v.d / 2, mz - v.d / 2); }
  for (const d of dec) { if (d.x != null) d.x += bx; if (d.z != null) d.z += bz; }
  const bb = vs => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const v of vs) { const e = v.rot ? Math.hypot(v.w, v.d) / 2 : 0; x0 = Math.min(x0, v.x - (e || v.w / 2)); x1 = Math.max(x1, v.x + (e || v.w / 2)); z0 = Math.min(z0, v.z - (e || v.d / 2)); z1 = Math.max(z1, v.z + (e || v.d / 2)); } return { x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0, x0, x1, z0, z1 }; };
  L.fp = bb(lv[0]);
  let y = plinth;
  if (stilt) { L.levels.push({ i: 0, y, h: 2.9, stilt: true, vols: [vol(L.fp.x, L.fp.z, L.fp.w, L.fp.d, { kind: 'stilt' })] }); y += 2.9; }
  lv.forEach((vols, i) => {
    let h = fh;
    if (type === 'commercial' && i === 0) h = 4.8;
    if (type === 'farm' && variant === 'barn') h = 3.4;
    L.levels.push({ i: L.levels.length, lvl: i, y, h, vols }); y += h;
  });
  L.decor = dec;
  L.bbox = bb(L.levels.flatMap(l => l.vols));
  // roof assignment from coverage of the level above
  const inside = (px, pz, v) => Math.abs(px - v.x) < v.w / 2 + .05 && Math.abs(pz - v.z) < v.d / 2 + .05;
  const pitch = style === 'model' || ghost ? false : PAL[style].pitched;
  let H = y;
  L.levels.forEach((l, li) => {
    const up = L.levels[li + 1] ? L.levels[li + 1].vols : [];
    for (const v of l.vols) {
      let c = 0, n = 0;
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) { n++; if (up.some(u => inside(v.x - v.w / 2 + v.w * (a + .5) / 6, v.z - v.d / 2 + v.d * (b + .5) / 6, u))) c++; }
      const cov = c / n, ry = l.y + l.h;
      if (l.stilt || v.kind === 'canopy') { v.roofK = 'none'; continue; }
      if (cov > .86) v.roofK = 'none';
      else if (cov > .04) { v.roofK = 'terrace'; L.flatZones.push({ x: v.x, z: v.z, w: v.w, d: v.d, y: ry, part: true }); }
      else {
        let r = v.roof || (pitch && !['apartment', 'commercial'].includes(type) ? (pitch === 'gable' ? (v.w >= v.d ? 'gable-x' : 'gable-z') : 'hip') : 'flat');
        if (r !== 'flat' && v.kind === 'glazed' && !v.roof) r = 'flat';
        if (ghost) r = 'flat';
        if (ex.has('terrace') && r !== 'flat' && v === largest(L.levels[L.levels.length - 1].vols) && li === L.levels.length - 1) r = 'flat';
        v.roofK = r;
        if (r === 'flat') L.flatZones.push({ x: v.x, z: v.z, w: v.w, d: v.d, y: ry, rot: v.rot || 0 });
        const hr = roofRise(r, v, style);
        H = Math.max(H, ry + hr + (r === 'flat' ? .9 : .3));
      }
    }
  });
  L.H = H + (dec.some(d => d.k === 'spire') ? 6 : 0);
  L.roofY = y; L.top = largest(L.levels[L.levels.length - 1].vols);
  L.area = L.levels.filter(l => !l.stilt).reduce((a, l) => a + l.vols.filter(v => v.kind !== 'canopy').reduce((s, v) => s + v.w * v.d, 0), 0) / (FT * FT);
  return L;
}
function largest(vs) { return vs.reduce((a, v) => (v.w * v.d > a.w * a.d ? v : a), vs[0]); }
function roofRise(r, v, style) {
  const low = PAL[style] && PAL[style].low;
  if (r === 'hip') return Math.min(v.w, v.d) * (low ? .22 : .32);
  if (r === 'gable-x') return v.d * (low ? .2 : .34);
  if (r === 'gable-z') return v.w * (low ? .2 : .36);
  if (r === 'mono') return v.d * .22;
  if (r === 'mono-x') return Math.min(3.2, v.w * .55);
  if (r === 'barn') return v.w * .62;
  return 0;
}

/* ---------- building parts */
function winCfg(style, tier) {
  const big = tier === 'luxury' ? 1.2 : tier === 'premium' ? 1.08 : 1;
  return {
    model: { sp: 3.0, ww: 1.5 * big, wh: 1.4, sill: .9, ft: .07, sillB: true },
    modern: { sp: 3.6, ww: 2.4 * big, wh: 1.6, sill: .7, ft: .06, ribbonOK: true },
    glass: { sp: 1.6, ww: 1.4, wh: 2.55, sill: .12, ft: .05, tall: true },
    classic: { sp: 2.4, ww: .95 * Math.min(big, 1.1), wh: 1.9, sill: .7, ft: .1, muntin: true, sillB: true, head: true },
    tropical: { sp: 3.3, ww: 2.0 * big, wh: 1.85, sill: .5, ft: .09, louvre: true, sillB: true },
    indian: { sp: 2.7, ww: 1.1 * big, wh: 1.5, sill: .85, ft: .1, chhajja: true, sillB: true, muntin: true },
  }[style];
}
// faces of a volume in its local frame: [length, nx, nz]
const FACES = (w, d) => [[w, 0, 1, d / 2], [w, 0, -1, d / 2], [d, 1, 0, w / 2], [d, -1, 0, w / 2]];
function faceBlocked(v, l, nx, nz) { // shared walls (row houses, joined wings)
  const off = (nx ? v.w / 2 : v.d / 2) + .35, px = v.x + nx * off, pz = v.z + nz * off;
  return l.vols.some(u => u !== v && u.kind !== 'canopy' && Math.abs(px - u.x) < u.w / 2 && Math.abs(pz - u.z) < u.d / 2);
}
function facade(g, v, l, L, h, W) {
  const style = L.style, cfg = winCfg(style, L.tier), r = rng(hash(L.variant + '|' + l.i + '|' + v.x.toFixed(1) + v.z.toFixed(1)));
  const it = [[], [], []], gl = [], fr = [], sl = [], lv = [], ch = [], dr = [];
  for (const [Lf, nx, nz, half] of FACES(v.w, v.d)) {
    if (faceBlocked(v, l, nx, nz)) continue;
    const put = (list, c, yc, a, b, off, dep) => { if (nz) list.push([c * nz, yc, nz * (half + off), a, b, dep]); else list.push([nx * (half + off), yc, -c * nx, dep, b, a]); };
    const open = (c, yc, ww, wh, kind) => {
      const k = r(), iv = k < .55 ? 0 : k < .8 ? 1 : 2, ft = cfg.ft;
      put(it[iv], c, yc, ww, wh, .012, .02); put(gl, c, yc, ww, wh, .075, .02);
      put(fr, c, yc + wh / 2 + ft / 2, ww + 2 * ft, ft, .07, .16); put(fr, c, yc - wh / 2 - ft / 2, ww + 2 * ft, ft, .07, .16);
      put(fr, c - ww / 2 - ft / 2, yc, ft, wh, .07, .16); put(fr, c + ww / 2 + ft / 2, yc, ft, wh, .07, .16);
      const nm = Math.max(0, Math.round(ww / 1.4) - 1);
      for (let m = 1; m <= nm; m++) put(fr, c - ww / 2 + ww * m / (nm + 1), yc, .045, wh, .08, .06);
      if (cfg.muntin && kind !== 'door') { put(fr, c, yc + wh / 6, ww, .035, .08, .05); put(fr, c, yc - wh / 6, ww, .035, .08, .05); }
      if (cfg.sillB && kind !== 'door') put(sl, c, yc - wh / 2 - ft - .04, ww + .34, .08, .1, .2);
      if (cfg.head && kind !== 'door') put(sl, c, yc + wh / 2 + ft + .1, ww + .5, .2, .06, .14);
      if (cfg.chhajja) put(ch, c, yc + wh / 2 + .28, ww + .7, .07, .3, .6);
      if (cfg.louvre && kind !== 'door' && r() < .4) for (let s = 0; s < Math.floor(ww / .14); s++) put(lv, c - ww / 2 + .07 + s * .14, yc, .05, wh, .2, .09);
    };
    const front = nz === 1;
    if (L.ghost) continue;
    if (v.ribbon || (cfg.ribbonOK && L.type !== 'row' && Lf > 6 && r() < .55)) {
      const ww = Lf - 1.4; if (ww > 1) open(0, cfg.sill + cfg.wh / 2, ww, cfg.wh);
      continue;
    }
    const n = Math.max(1, Math.floor((Lf - .6) / cfg.sp)), stp = Lf / n;
    for (let k = 0; k < n; k++) {
      const c = -Lf / 2 + stp * (k + .5);
      if (front && l.lvl === 0 && k === Math.floor(n / 2) && L.type !== 'apartment' && L.type !== 'commercial') { // entrance
        const dw = Math.min(stp - .5, style === 'classic' || style === 'indian' ? 1.5 : 2.6);
        if (style === 'classic' || style === 'indian' || style === 'model') { put(dr, c, 1.25, dw, 2.5, .05, .08); put(fr, c, 2.55, dw + .3, .12, .08, .18); }
        else open(c, .06 + (h - .9) / 2, dw, h - .9, 'door');
        continue;
      }
      const ww = Math.min(cfg.ww, stp - .5), wh = Math.min(cfg.wh, h - cfg.sill - .45); if (ww < .4) continue;
      const tallG = front && l.lvl === 0 && (style === 'modern' || style === 'tropical');
      if (tallG) open(c, .06 + (h - .85) / 2, Math.min(stp - .4, ww * 1.3), h - .85, 'door');
      else open(c, cfg.sill + wh / 2, ww, wh);
    }
  }
  const fm = mat.frame(style, L.tier);
  [[it[0], mat.int(0)], [it[1], mat.int(1)], [it[2], mat.int(2)], [gl, mat.glass()], [fr, fm], [sl, mat.trim(style)], [ch, mat.trim(style)], [lv, mat.wood()], [dr, mat.wood()]].forEach(([a, m]) => { const im = inst(a, m, null, m === fm || m === M['trimr-' + style]); if (im) g.add(im); });
}
function slabMat(L) { return L.ghost ? mat.trim('model') : L.tier === 'luxury' && L.style !== 'classic' ? mat.gold() : ['glass', 'modern'].includes(L.style) ? (L.style === 'glass' ? mat.frame('glass') : mat.trim('modern')) : mat.trim(L.style); }
function solidVol(g, v, l, L) {
  const h = l.h, st = L.style, cm = L.ghost ? mat.ghost() : clad(st, v.clad || PAL[st].clad), slabT = v.slab || .26;
  const wall = B(v.w, h - slabT, v.d, cm, 0, 0, 0); g.add(wall);
  if (L.ghost) { wall.castShadow = false; g.add(edges(wall)); g.add(B(v.w + .1, slabT, v.d + .1, mat.trim('model'), 0, h - slabT, 0)); return; }
  g.add(B(v.w + .14, slabT, v.d + .14, slabMat(L), 0, h - slabT, 0));
  if (l.lvl === 0 && st === 'classic') g.add(B(v.w + .1, .5, v.d + .1, mat.base(st), 0, 0, 0)); // rusticated base course
  facade(g, v, l, L, h - slabT);
  if (v.pil) { const p = []; for (const [Lf, nx, nz, half] of FACES(v.w, v.d)) { if (faceBlocked(v, l, nx, nz)) continue; const n = Math.max(2, Math.round(Lf / 2.6)); for (let k = 0; k <= n; k++) { const c = -Lf / 2 + Lf * k / n; if (nz) p.push([c, h / 2, nz * (half + .1), .32, h, .22]); else p.push([nx * (half + .1), h / 2, c, .22, h, .32]); } } g.add(inst(p, mat.trim(st), null, true)); }
  // balconies: apartments (and upper floors of premium / luxury homes)
  if (l.lvl >= 1 && !v.planters && ((L.type === 'apartment' && v.w > 6) || (L.tier !== 'standard' && ['villa', 'unsure'].includes(L.type) && v.w > 5))) {
    const bw = v.w * (L.type === 'apartment' ? .62 : .42), z = v.d / 2;
    g.add(B(bw, .16, 1.4, slabMat(L), 0, 0, z + .7));
    railing(g, [[-bw / 2, z + 1.36, bw / 2, z + 1.36], [-bw / 2, z, -bw / 2, z + 1.36], [bw / 2, z, bw / 2, z + 1.36]], .16, L);
  }
  if (l.lvl === 0 && L.tier !== 'standard' && st !== 'glass' && st !== 'classic' && v === l.vols[0]) g.add(B(Math.min(2.4, v.w * .2), h - .3, .14, L.tier === 'luxury' ? mat.gold() : clad(st, 'timber'), v.w * .34, 0, v.d / 2 + .07));
}
function railing(g, segs, y, L, hgt = 1.05) { // frameless glass balustrade with a slim metal cap
  const gp = [], cap = [];
  for (const [x0, z0, x1, z1] of segs) { const len = Math.hypot(x1 - x0, z1 - z0); if (len < .2) continue; const a = Math.atan2(z1 - z0, x1 - x0); gp.push([(x0 + x1) / 2, y + hgt / 2, (z0 + z1) / 2, len, hgt - .06, .025, -a]); cap.push([(x0 + x1) / 2, y + hgt, (z0 + z1) / 2, len + .04, .05, .07, -a]); }
  const a = inst(gp, mat.rail()), b = inst(cap, L.tier === 'luxury' ? mat.gold() : mat.steel(), null, true); if (a) g.add(a); if (b) g.add(b);
}
function glazedVol(g, v, l, L) {
  const h = l.h, slabT = v.slab || .32, gh = h - slabT, st = L.style;
  g.add(B(v.w + .1, slabT, v.d + .1, st === 'glass' || st === 'model' ? mat.frame('glass') : slabMat(L), 0, gh, 0));
  g.add(B(v.w - .3, .05, v.d - .3, mat.deck(), 0, 0, 0, false));
  if (v.w > 4.5 && v.d > 4.5) {
    g.add(B(v.w - 3, gh - .05, v.d - 3, mat.intCore(), 0, .05, 0, true, 0));
    const lt = []; for (let k = -1; k <= 1; k++) lt.push([k * (v.w - 2) / 3, gh - .06, (v.d - 1.4) / 2, (v.w - 2) / 3 - .6, .05, .18], [k * (v.w - 2) / 3, gh - .06, -(v.d - 1.4) / 2, (v.w - 2) / 3 - .6, .05, .18]);
    g.add(inst(lt, mat.lamp()));
  }
  const gp = [], mu = [], sp = 1.5;
  for (const [Lf, nx, nz, half] of FACES(v.w - .2, v.d - .2)) {
    if (faceBlocked(v, l, nx, nz)) continue;
    if (nz) gp.push([0, gh / 2, nz * half, Lf, gh, .03]); else gp.push([nx * half, gh / 2, 0, .03, gh, Lf]);
    const n = Math.max(2, Math.round(Lf / sp));
    for (let k = 0; k <= n; k++) { const c = -Lf / 2 + Lf * k / n, fd = v.fins ? .38 : .1; if (nz) mu.push([c, gh / 2, nz * (half + fd / 2), .06, gh, fd]); else mu.push([nx * (half + fd / 2), gh / 2, c, fd, gh, .06]); }
    if (nz) mu.push([0, .05, nz * half, Lf, .1, .12]); else mu.push([nx * half, .05, 0, .12, .1, Lf]);
  }
  g.add(inst(gp, mat.glass()));
  g.add(inst(mu, mat.frame(st === 'model' ? 'glass' : st, L.tier), null, true));
}
function stiltVol(g, v, l, L) {
  const cols = [], nx = Math.max(2, Math.round(v.w / 4.5)), nz = Math.max(2, Math.round(v.d / 5));
  for (let a = 0; a <= nx; a++) for (let b = 0; b <= nz; b++) cols.push([-v.w / 2 + .25 + (v.w - .5) * a / nx, l.h / 2, -v.d / 2 + .25 + (v.d - .5) * b / nz, .4, l.h, .4]);
  g.add(inst(cols, mat.conc(), null, true));
  g.add(B(v.w - .6, .04, v.d - .6, mat.asph(), 0, 0, 0, false, 0));
  g.add(B(Math.min(4, v.w * .35), l.h - .3, Math.min(4, v.d * .3), clad(L.style, PAL[L.style].clad), v.w * .28, 0, -v.d * .3));
  const nc = clamp(Math.floor((v.w - 1) / 2.8), 2, 4), cc = [0xd9c39a, 0xeeeae2, 0x1c1c1f, 0x6d7480];
  for (let k = 0; k < nc; k++) { const c = car(cc[k], -v.w / 2 + 1.5 + k * 2.75, v.d * .2, 0); c.position.y = .04; g.add(c); }
  g.add(B(v.w + .2, .3, v.d + .2, slabMat(L), 0, l.h - .3, 0));
  g.add(B(v.w - 1, .04, v.d - 1, mat.lamp(), 0, l.h - .33, 0, false, 0));
}
function levelPart(l, L) {
  const G0 = new T.Group(); G0.position.y = l.y;
  for (const v of l.vols) {
    const g = new T.Group(); g.position.set(v.x, 0, v.z); if (v.rot) g.rotation.y = v.rot;
    if (v.kind === 'stilt') stiltVol(g, v, l, L);
    else if (v.kind === 'canopy') { g.add(B(v.w, .22, v.d, slabMat(L), 0, l.h - .3, 0)); g.add(B(.14, l.h - .3, .14, mat.steel(), -v.w / 2 + .3, 0, v.d / 2 - .3), B(.14, l.h - .3, .14, mat.steel(), v.w / 2 - .3, 0, v.d / 2 - .3)); }
    else if (v.kind === 'glazed' && !L.ghost) glazedVol(g, v, l, L);
    else solidVol(g, v, l, L);
    G0.add(g);
  }
  if (l.lvl === 0 && L.ex.has('theatre') && !L.ghost) { const v = l.vols[0]; G0.add(B(.08, Math.min(1.7, l.h - 1), v.d * .5, mat.theatre(), v.x - v.w / 2 - .06, .7, v.z - v.d * .1, false, 0)); }
  return G0;
}

/* ---------- roofs */
function triGeo(pts) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pts.flat(), 3)); g.computeVertexNormals(); return worldUV(g); }
const quad = (a, b, c, d) => [a, b, c, a, c, d];
function pitchedRoof(g, v, ry, L) {
  if (v.roofK === 'mono-x') { // sawtooth: mono-pitch rising across the unit's width
    const tmp = new T.Group(), n = L.slopes.length;
    pitchedRoof(tmp, Object.assign({}, v, { x: 0, z: 0, w: v.d, d: v.w, roofK: 'mono', monoH: roofRise('mono-x', v) }), 0, L);
    L.slopes.length = n; tmp.rotation.y = Math.PI / 2; tmp.position.set(v.x, ry, v.z); g.add(tmp); return;
  }
  const st = L.style, r = v.roofK, low = PAL[st].low, ov = v.monoH ? .2 : r === 'barn' ? .3 : low ? 1.3 : .6, hr = v.monoH || roofRise(r, v, st);
  const W = v.w + 2 * ov, D = v.d + 2 * ov;
  const rmat = v.roofMat || (L.variant === 'hacienda' || (L.variant === 'ranch' && st !== 'tropical') ? 'tile' : L.variant === 'barn' ? 'metal' : null);
  const rm = mat.roofT(st, rmat), wm = dbl(clad(st, v.clad || PAL[st].clad));
  const grp = new T.Group(); grp.position.set(v.x, ry, v.z); if (v.rot) grp.rotation.y = v.rot;
  const tris = [], ends = [], gends = [];
  let soffY = 0;
  if (r === 'hip' || r === 'gable-x' || r === 'gable-z') {
    const span = r === 'gable-z' ? W : r === 'gable-x' ? D : Math.min(W, D), drop = hr * ov / (span / 2 - ov) * .9; soffY = -drop;
    if (r === 'hip') {
      const alongX = W >= D, rr = Math.abs(W - D) / 2, y0 = -drop;
      const A = [-W / 2, y0, D / 2], Bp = [W / 2, y0, D / 2], C = [W / 2, y0, -D / 2], Dd = [-W / 2, y0, -D / 2];
      const R1 = alongX ? [-rr, hr, 0] : [0, hr, rr], R2 = alongX ? [rr, hr, 0] : [0, hr, -rr];
      if (alongX) tris.push(...quad(A, Bp, R2, R1), ...quad(C, Dd, R1, R2), Bp, C, R2, Dd, A, R1);
      else tris.push(A, Bp, R1, C, Dd, R2, ...quad(Bp, C, R2, R1), ...quad(Dd, A, R1, R2));
      if (alongX) L.slopes.push({ x: v.x, z: v.z, y: ry + y0, ang: Math.atan2(hr - y0, D / 2), run: D / 2, w: Math.max(2, (W - D) + D * .3), rot: v.rot || 0 });
    } else {
      const sx = r === 'gable-x', Lr = sx ? W : D, S2 = sx ? D : W, s0 = sx ? v.d : v.w, w0 = sx ? v.w : v.d, y0 = -drop;
      const P = (a, y, b) => sx ? [a, y, b] : [b, y, a];
      tris.push(...quad(P(-Lr / 2, y0, S2 / 2), P(Lr / 2, y0, S2 / 2), P(Lr / 2, hr, 0), P(-Lr / 2, hr, 0)), ...quad(P(Lr / 2, y0, -S2 / 2), P(-Lr / 2, y0, -S2 / 2), P(-Lr / 2, hr, 0), P(Lr / 2, hr, 0)));
      const hW = hr - (hr - y0) * (s0 / S2);
      for (const e of [-1, 1]) { const list = v.gableGlass && !sx && e === 1 ? gends : ends, a = e * w0 / 2; list.push(...quad(P(a, 0, -s0 / 2), P(a, 0, s0 / 2), P(a, hW, s0 / 2), P(a, hW, -s0 / 2)), P(a, hW, -s0 / 2), P(a, hW, s0 / 2), P(a, hr - .02, 0)); }
      L.slopes.push({ x: v.x, z: v.z, y: ry + y0, ang: Math.atan2(hr - y0, S2 / 2), run: S2 / 2, w: Lr * .7, rot: v.rot || 0, side: !sx });
    }
  } else if (r === 'mono') {
    const y0 = -.15, hz = z => y0 + (hr - y0) * (D / 2 - z) / D, hf = hz(v.d / 2), hb = hz(-v.d / 2); soffY = y0;
    tris.push(...quad([-W / 2, y0, D / 2], [W / 2, y0, D / 2], [W / 2, hr, -D / 2], [-W / 2, hr, -D / 2]));
    for (const e of [-1, 1]) ends.push(...quad([e * v.w / 2, 0, v.d / 2], [e * v.w / 2, 0, -v.d / 2], [e * v.w / 2, hb, -v.d / 2], [e * v.w / 2, hf, v.d / 2]));
    ends.push(...quad([-v.w / 2, 0, -v.d / 2], [v.w / 2, 0, -v.d / 2], [v.w / 2, hb, -v.d / 2], [-v.w / 2, hb, -v.d / 2]));
    gends.push(...quad([-v.w / 2, 0, v.d / 2], [v.w / 2, 0, v.d / 2], [v.w / 2, Math.max(.05, hf), v.d / 2], [-v.w / 2, Math.max(.05, hf), v.d / 2]));
    L.slopes.push({ x: v.x, z: v.z, y: ry + y0, ang: Math.atan2(hr - y0, D), run: D, w: W * .7, rot: 0 });
  } else if (r === 'barn') {
    const pr = [[-W / 2, -.1], [-W * .37, hr * .6], [0, hr], [W * .37, hr * .6], [W / 2, -.1]], sc = v.w / W;
    for (let i = 0; i < 4; i++) { const a = pr[i], b = pr[i + 1]; tris.push(...quad([a[0], a[1], D / 2], [b[0], b[1], D / 2], [b[0], b[1], -D / 2], [a[0], a[1], -D / 2])); }
    for (const e of [-1, 1]) for (let i = 0; i < 4; i++) { const a = pr[i], b = pr[i + 1]; (v.gableGlass && e === 1 ? gends : ends).push([0, 0, e * v.d / 2], [a[0] * sc, Math.max(0, a[1]), e * v.d / 2], [b[0] * sc, Math.max(0, b[1]), e * v.d / 2]); }
    soffY = -.1;
  }
  const rmesh = new T.Mesh(triGeo(tris), rm); rmesh.castShadow = rmesh.receiveShadow = true; grp.add(rmesh);
  if (ends.length) { const e = new T.Mesh(triGeo(ends), wm); e.castShadow = e.receiveShadow = true; grp.add(e); }
  if (gends.length) {
    grp.add(new T.Mesh(triGeo(gends), dbl(mat.glass())));
    const z0 = gends[0][2], inner = gends.map(p => [p[0] * .94, p[1] * .94, p[2] - Math.sign(z0 || 1) * .9]);
    grp.add(new T.Mesh(triGeo(inner), dbl(mat.intCore())));
    const mu = []; const xs = Math.max(...gends.map(p => Math.abs(p[0]))), ys = Math.max(...gends.map(p => p[1]));
    const hAt = x => { let m = 0; for (let i = 0; i < gends.length; i += 3) for (let e = 0; e < 3; e++) { const a = gends[i + e], b = gends[i + (e + 1) % 3]; if ((x - a[0]) * (x - b[0]) <= 0 && a[0] !== b[0]) m = Math.max(m, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])); } return m; };
    for (let k = -2; k <= 2; k++) { const x = k * xs / 2.5, hh = hAt(x) - .05; if (hh > .2) mu.push([x, hh / 2, z0 + Math.sign(z0) * .05, .06, hh, .08]); }
    const ty = Math.min(ys * .45, 2.9); let tw = 0; for (let x = 0; x < xs; x += .05) if (hAt(x) > ty) tw = x; mu.push([0, ty, z0 + Math.sign(z0) * .05, tw * 2, .06, .08]);
    grp.add(inst(mu, mat.frame(st, L.tier), null, true));
  }
  grp.add(B(W - .02, .05, D - .02, mat.trim(st), 0, soffY - .05, 0, false, 0)); // soffit closes the eaves
  const fs = [[0, soffY - .06, D / 2, W, .18, .07], [0, soffY - .06, -D / 2, W, .18, .07]]; if (r === 'hip' || r === 'mono') fs.push([W / 2, soffY - .06, 0, .07, .18, D], [-W / 2, soffY - .06, 0, .07, .18, D]);
  grp.add(inst(fs, mat.trim(st), null, true));
  g.add(grp);
}
function dbl(m) { const k = m.uuid + '-dbl'; if (M[k]) return M[k]; const c = m.clone(); c.side = T.DoubleSide; c.userData = Object.assign({}, m.userData); M[k] = c; return c; }
function flatRoof(g, v, ry, L, terrace) {
  const grp = new T.Group(); grp.position.set(v.x, ry, v.z); if (v.rot) grp.rotation.y = v.rot;
  const st = L.style, w = v.w, d = v.d;
  if (terrace) {
    grp.add(B(w - .1, .06, d - .1, mat.deck(), 0, 0, 0, false, 0));
    railing(grp, [[-w / 2 + .1, d / 2 - .1, w / 2 - .1, d / 2 - .1], [-w / 2 + .1, -d / 2 + .1, w / 2 - .1, -d / 2 + .1], [-w / 2 + .1, -d / 2 + .1, -w / 2 + .1, d / 2 - .1], [w / 2 - .1, -d / 2 + .1, w / 2 - .1, d / 2 - .1]], .06, L);
    if (v.planters || L.tier !== 'standard') { const pl = [[0, .3, d / 2 - .45, w - 1, .6, .6]]; grp.add(inst(pl, clad(st, 'concrete'), null, true)); hedgeRow(grp, -w / 2 + .7, d / 2 - .45, w / 2 - .7, d / 2 - .45, .6, .5); }
  } else if (v.bal) { // classical balustrade
    grp.add(B(w, .08, d, mat.conc(), 0, 0, 0, false, 0));
    const bl = [], rl = [];
    for (const [Lf, nx, nz, half] of FACES(w - .2, d - .2)) { const n = Math.floor(Lf / .28); for (let k = 0; k < n; k++) { const c = -Lf / 2 + (k + .5) * Lf / n; bl.push(nz ? [c, .42, nz * half, .12, .66, .12] : [nx * half, .42, c, .12, .66, .12]); } rl.push(nz ? [0, .82, nz * half, Lf + .2, .14, .26] : [nx * half, .82, 0, .26, .14, Lf + .2], nz ? [0, .06, nz * half, Lf + .2, .12, .26] : [nx * half, .06, 0, .26, .12, Lf + .2]); }
    grp.add(inst(bl, mat.trim(st), G.bal || (G.bal = keep(new T.CylinderGeometry(.4, .5, 1, 8))), true)); grp.add(inst(rl, mat.trim(st), null, true));
  } else {
    const glz = v.kind === 'glazed', ph = glz ? .35 : st === 'classic' ? .9 : .7, t = .2, pm = glz ? mat.frame(st === 'model' ? 'glass' : st, L.tier) : clad(st, v.clad || PAL[st].clad);
    grp.add(B(w - .1, .05, d - .1, mat.conc(), 0, 0, 0, false, 0));
    const pp = [[0, ph / 2, d / 2 - t / 2, w, ph, t], [0, ph / 2, -d / 2 + t / 2, w, ph, t], [w / 2 - t / 2, ph / 2, 0, t, ph, d - 2 * t], [-w / 2 + t / 2, ph / 2, 0, t, ph, d - 2 * t]];
    grp.add(inst(pp, pm, null, true));
    const cp = [[0, ph + .03, d / 2 - t / 2, w + .08, .06, t + .08], [0, ph + .03, -d / 2 + t / 2, w + .08, .06, t + .08], [w / 2 - t / 2, ph + .03, 0, t + .08, .06, d], [-w / 2 + t / 2, ph + .03, 0, t + .08, .06, d]];
    grp.add(inst(cp, st === 'classic' ? mat.trim(st) : L.tier === 'luxury' ? mat.gold() : mat.trim(st === 'glass' ? 'modern' : st), null, true));
    if (!L.thumb && w * d > 60 && (L.type === 'apartment' || L.type === 'commercial')) grp.add(inst([[-w * .2, .55, -d * .2, 2.2, 1.1, 1.6, 0], [w * .15, .45, -d * .25, 1.4, .9, 1.4, 0]], std('mech', { color: 0x8c9096, roughness: .5, metalness: .6 }), null, true));
  }
  g.add(grp);
}
function roofsPart(L) {
  const g = new T.Group();
  L.slopes.length = 0;
  for (const l of L.levels) for (const v of l.vols) {
    const ry = l.y + l.h, r = v.roofK;
    if (!r || r === 'none') continue;
    if (L.ghost) { if (r === 'flat') g.add(B(v.w, .1, v.d, mat.trim('model'), v.x, ry, v.z)); continue; }
    if (r === 'terrace') flatRoof(g, v, ry, L, true);
    else if (r === 'flat') flatRoof(g, v, ry, L, false);
    else pitchedRoof(g, v, ry, L);
  }
  return g;
}

/* ---------- variant decor (portico, courts, pergolas, crowns...) */
function decorPart(L) {
  const g = new T.Group(), st = L.style, y0 = L.plinth;
  const lvl = i => L.levels.find(l => l.lvl === i) || L.levels[L.levels.length - 1];
  for (const d of L.decor) {
    if (d.k === 'portico') {
      const l0 = lvl(0), h = lvl(d.floors - 1).y + lvl(d.floors - 1).h - l0.y - .3, n = d.w > 7 ? 6 : 4, z = d.z + 1.9, y = l0.y;
      const cg = G.col || (G.col = keep(new T.CylinderGeometry(.24, .29, 1, 16).translate(0, .5, 0))), cols = [];
      for (let k = 0; k < n; k++) cols.push([d.x - d.w / 2 + d.w * k / (n - 1), y + .3, z, 1, h - .3, 1]);
      const im = inst(cols, mat.trim(st), cg, true); g.add(im);
      const caps = cols.map(c => [c[0], y + h - .1, z, .75, .2, .75]).concat(cols.map(c => [c[0], y + .15, z, .75, .3, .75]));
      g.add(inst(caps, mat.trim(st), null, true));
      g.add(B(d.w + 1.2, .6, 2.6, mat.trim(st), d.x, y + h, z - .9));
      if (d.ped) { const ph = 1.6, W = d.w + 1.3; const t = [[-W / 2, 0, .4], [W / 2, 0, .4], [0, ph, .4], [W / 2, 0, -2.2], [-W / 2, 0, -2.2], [0, ph, -2.2]]; const pts = [t[0], t[1], t[2], t[3], t[4], t[5], ...quad(t[1], t[3], t[5], t[2]), ...quad(t[4], t[0], t[2], t[5])]; const m = new T.Mesh(triGeo(pts), dbl(mat.trim(st))); m.position.set(d.x, y + h + .6, z); m.castShadow = true; g.add(m); g.add(at(new T.Mesh(triGeo(quad([-W / 2 - .1, 0, .45], [0, ph + .1, .45], [0, ph + .1, -2.3], [-W / 2 - .1, 0, -2.3]).concat(quad([0, ph + .1, .45], [W / 2 + .1, 0, .45], [W / 2 + .1, 0, -2.3], [0, ph + .1, -2.3]))), dbl(mat.roofT(st))), d.x, y + h + .62, z, true)); }
      for (let s = 0; s < 3; s++) g.add(B(d.w + 1.6 - s * .2, .15, 1.2 + (2 - s) * .4, mat.paveD(), d.x, y - .45 + s * .15, z + 1.4 + (2 - s) * .2, false));
    } else if (d.k === 'pond') {
      g.add(B(d.w + .4, .3, d.d + .4, mat.paveD(), d.x, .12, d.z)); g.add(B(d.w, .04, d.d, mat.water(), d.x, .4, d.z, false, 0));
    } else if (d.k === 'court') {
      g.add(B(d.w, .06, d.d, d.paved ? mat.pave() : mat.lawn(), d.x, y0, d.z, false, 0));
      if (!d.paved) { g.add(B(d.w * .4, .05, d.d * .3, mat.water(), d.x + d.w * .2, y0 + .06, d.z + d.d * .2, false, 0)); trees(g, [{ x: d.x - d.w * .18, z: d.z - d.d * .1, s: 1.1, k: 'frangipani', y: y0 }, { x: d.x + d.w * .3, z: d.z - d.d * .3, s: .9, k: 'palm', y: y0 }]); }
      else trees(g, [{ x: d.x - d.w * .35, z: d.z - d.d * .3, s: .8, k: 'cypress', y: y0 }, { x: d.x + d.w * .35, z: d.z - d.d * .3, s: .8, k: 'cypress', y: y0 }, { x: d.x - d.w * .35, z: d.z + d.d * .3, s: .8, k: 'cypress', y: y0 }, { x: d.x + d.w * .35, z: d.z + d.d * .3, s: .8, k: 'cypress', y: y0 }]);
    } else if (d.k === 'fountain') {
      g.add(at(new T.Mesh(G.ft1 || (G.ft1 = keep(new T.CylinderGeometry(2.2, 2.3, .55, 32))), mat.paveD()), d.x, y0 + .27, d.z, true));
      g.add(at(new T.Mesh(G.ft2 || (G.ft2 = keep(new T.CylinderGeometry(2.0, 2.0, .05, 32))), mat.water()), d.x, y0 + .5, d.z));
      g.add(at(new T.Mesh(G.ft3 || (G.ft3 = keep(new T.CylinderGeometry(.18, .3, 1.4, 12))), mat.paveD()), d.x, y0 + 1, d.z, true));
      g.add(at(new T.Mesh(G.ft4 || (G.ft4 = keep(new T.CylinderGeometry(.8, .5, .2, 20))), mat.paveD()), d.x, y0 + 1.7, d.z, true));
    } else if (d.k === 'pergola') {
      const posts = [], sl = [], h = 2.7, y = y0;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) posts.push([d.x + sx * (d.w / 2 - .15), y + h / 2, d.z + sz * (d.d / 2 - .15), .14, h, .14]);
      for (let k = 0; k <= Math.floor(d.w / .4); k++) sl.push([d.x - d.w / 2 + k * .4, y + h + .05, d.z, .07, .16, d.d + .3]);
      sl.push([d.x, y + h - .06, d.z + d.d / 2 - .15, d.w + .3, .14, .12], [d.x, y + h - .06, d.z - d.d / 2 + .15, d.w + .3, .14, .12]);
      g.add(inst(posts, mat.wood(), null, true), inst(sl, mat.wood(), null, true));
    } else if (d.k === 'verandah') {
      const l0 = lvl(0), h = l0.h - .35, y = l0.y, posts = [], n = Math.max(3, Math.round(d.w / 2.6));
      for (let k = 0; k <= n; k++) posts.push([d.x - d.w / 2 + d.w * k / n, y + h / 2, d.z + d.d / 2 - .2, .18, h, .18]);
      g.add(inst(posts, mat.wood(), null, true));
      const m = new T.Mesh(triGeo(quad([-d.w / 2 - .4, 0, d.d / 2 + .3], [d.w / 2 + .4, 0, d.d / 2 + .3], [d.w / 2 + .4, .7, -d.d / 2], [-d.w / 2 - .4, .7, -d.d / 2])), mat.roofT(st, 'tile')); m.position.set(d.x, y + h, d.z); m.castShadow = m.receiveShadow = true; g.add(m);
      g.add(B(d.w + .4, .1, d.d, mat.deck(), d.x, y - .05, d.z, false, 0));
    } else if (d.k === 'porch') {
      const y = y0, h = 2.6;
      g.add(inst([[d.x - d.w / 2 + .1, y + h / 2, d.z + d.d, .14, h, .14], [d.x + d.w / 2 - .1, y + h / 2, d.z + d.d, .14, h, .14]], mat.trim(st), null, true));
      const P = [[-d.w / 2 - .2, 0, d.d + .3], [d.w / 2 + .2, 0, d.d + .3], [0, .9, d.d + .3], [-d.w / 2 - .2, 0, 0], [d.w / 2 + .2, 0, 0], [0, .9, 0]];
      const m = new T.Mesh(triGeo([...quad(P[0], P[1], P[4], P[3]).slice(0, 0), ...quad(P[3], P[0], P[2], P[5]), ...quad(P[1], P[4], P[5], P[2]), P[0], P[1], P[2]]), dbl(mat.roofT(st))); m.position.set(d.x, y + h, d.z); m.castShadow = true; g.add(m);
    } else if (d.k === 'canopy') {
      g.add(B(d.w, .25, d.d, slabMat(L), d.x, d.y, d.z), B(d.w - .6, .03, d.d - .5, mat.lamp(), d.x, d.y - .03, d.z, false, 0));
      g.add(B(.12, d.y, .12, mat.steel(), d.x - d.w / 2 + .3, 0, d.z + d.d / 2 - .25), B(.12, d.y, .12, mat.steel(), d.x + d.w / 2 - .3, 0, d.z + d.d / 2 - .25));
    } else if (d.k === 'crown' || d.k === 'spire') {
      const l = lvl(d.lvl), v = largest(l.vols), y = l.y + l.h;
      if (d.k === 'crown') { const f = []; for (const [Lf, nx, nz, half] of FACES(v.w, v.d)) { const n = Math.round(Lf / 1.5); for (let k = 0; k <= n; k++) { const c = -Lf / 2 + Lf * k / n; f.push(nz ? [v.x + c, y + 1.6, v.z + nz * half, .08, 3.2, .45] : [v.x + nx * half, y + 1.6, v.z + c, .45, 3.2, .08]); } } f.push([v.x, y + 3.2, v.z + v.d / 2, v.w, .16, .45], [v.x, y + 3.2, v.z - v.d / 2, v.w, .16, .45], [v.x + v.w / 2, y + 3.2, v.z, .45, .16, v.d], [v.x - v.w / 2, y + 3.2, v.z, .45, .16, v.d]); g.add(inst(f, mat.frame('glass', L.tier), null, true)); }
      else { let w = v.w * .55, dd = v.d * .55, yy = y + .9; for (let s = 0; s < 3; s++) { g.add(B(w, 1.4, dd, mat.trim(st), v.x, yy, v.z)); yy += 1.4; w *= .62; dd *= .62; } g.add(at(new T.Mesh(G.spire || (G.spire = keep(new T.ConeGeometry(.35, 5, 8).translate(0, 2.5, 0))), mat.gold()), v.x, yy, v.z, true)); }
    }
  }
  return g;
}

/* ---------- vegetation: instanced species (broad, cypress, palm, frangipani) */
function blobGeo(lo) {
  const k = lo ? 'blobLo' : 'blob'; if (G[k]) return G[k];
  let g = new T.IcosahedronGeometry(1, lo ? 1 : 3); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g);
  const p = g.attributes.position, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + .16 * Math.sin(v.x * 5.1 + v.y * 2.3) * Math.cos(v.z * 4.7 - v.y * 3.1) + .08 * Math.sin(v.x * 11 + v.z * 9); v.multiplyScalar(n); v.y *= v.y < 0 ? .7 : 1; p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return (G[k] = keep(g));
}
function frondGeo() {
  if (G.frond) return G.frond;
  const pts = [], n = 6, Lf = 2.8;
  for (let i = 0; i < n; i++) {
    const a = i / n, b = (i + 1) / n, wa = Math.sin(a * Math.PI) * .42 + .04, wb = Math.sin(b * Math.PI) * .42 + .04, ya = -a * a * 1.3, yb = -b * b * 1.3;
    const A = [-wa, ya - .08, a * Lf], Bq = [wa, ya - .08, a * Lf], C = [wb, yb - .08, b * Lf], D = [-wb, yb - .08, b * Lf], Ma = [0, ya, a * Lf], Mb = [0, yb, b * Lf];
    pts.push(A, Ma, Mb, A, Mb, D, Ma, Bq, C, Ma, C, Mb);
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pts.flat(), 3)); g.computeVertexNormals(); return (G.frond = keep(g));
}
const GREENS = [[.26, .5, .14], [.23, .46, .12], [.29, .44, .16], [.2, .4, .13], [.31, .42, .17]];
function trees(g, list, lo = false) {
  lo = lo || mobile;
  if (!list.length) return;
  const tr = [], bl = [], cy = [], fr = [], fl = [], blC = [], cyC = [], frC = [];
  for (const t of list) {
    const r = rng(hash(t.x.toFixed(1) + ',' + t.z.toFixed(1))), s = t.s || 1, y = t.y || .12, x = t.x, z = t.z;
    const gc = GREENS[Math.floor(r() * GREENS.length)], col = () => new T.Color().setHSL(gc[0] + (r() - .5) * .04, gc[1] + (r() - .5) * .1, gc[2] * (.8 + r() * .35));
    if (t.k === 'palm') {
      const h = (4.5 + r() * 2) * s, lean = (r() - .5) * .25;
      tr.push([x + Math.sin(lean) * h / 2, y + h / 2, z, .16 * s, h, .16 * s, 0, 0]);
      const tx = x + Math.sin(lean) * h, ty = y + h;
      for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2 + r(); fr.push([tx, ty, z, s, s, s, a, -.15 - r() * .3]); frC.push(col()); }
    } else if (t.k === 'cypress') {
      tr.push([x, y + .5 * s, z, .14 * s, 1 * s, .14 * s]);
      cy.push([x, y + 2.9 * s, z, .58 * s, 2.5 * s, .58 * s, r() * 6]); cyC.push(col());
    } else if (t.k === 'frangipani') {
      tr.push([x, y + 1 * s, z, .14 * s, 2 * s, .14 * s]);
      for (let k = 0; k < 4; k++) { const a = k * 1.7 + r(), d = (.7 + r() * .4) * s; bl.push([x + Math.cos(a) * d, y + (2.3 + r() * .5) * s, z + Math.sin(a) * d, .85 * s, .45 * s, .85 * s, r() * 6]); blC.push(col()); fl.push([x + Math.cos(a) * d, y + (2.6 + r() * .4) * s, z + Math.sin(a) * d, .5 * s, .2 * s, .5 * s, r() * 6]); }
    } else if (t.k === 'shrub') {
      bl.push([x, y + .35 * s, z, .7 * s, .5 * s, .7 * s, r() * 6]); blC.push(col());
    } else { // broad canopy built from several overlapping lumps
      const h = (1.5 + r() * .6) * s;
      tr.push([x, y + (h + 1.2 * s) / 2, z, .22 * s, h + 1.2 * s, .22 * s, 0, 0]);
      const n = 5 + Math.floor(r() * 4);
      for (let k = 0; k < n; k++) { const a = r() * 6.28, d = (.4 + r() * 1.3) * s, rr = (1.0 + r() * .7) * s; bl.push([x + Math.cos(a) * d, y + h + (.9 + r() * 1.8) * s, z + Math.sin(a) * d, rr, rr * .8, rr, r() * 6]); blC.push(col()); }
      bl.push([x, y + h + 2.9 * s, z, 1.3 * s, 1.1 * s, 1.3 * s, r() * 6]); blC.push(col());
    }
  }
  const tg = G.trunkU || (G.trunkU = keep(new T.CylinderGeometry(.55, 1, 1, 7)));
  const add = (l, m, geo, cols, cast = true) => { const im = inst(l, m, geo, cast); if (!im) return; if (cols) cols.forEach((c, i) => im.setColorAt(i, c)); g.add(im); };
  add(tr, mat.trunk(), tg); add(bl, mat.leaf(0), blobGeo(lo), blC); add(cy, mat.leaf(1), blobGeo(lo), cyC);
  add(fl, std('flowers', { color: 0xf6efe3, roughness: .8 }), blobGeo(), null, false);
  // fronds: oriented by (yaw, pitch); use inst with rotation in Euler order handled below
  if (fr.length) { const im = new T.InstancedMesh(frondGeo(), dbl(mat.leaf(2)), fr.length), m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(0, 0, 0, 'YXZ'); fr.forEach((a, i) => { e.set(a[7], a[6], 0); q.setFromEuler(e); m4.compose(new T.Vector3(a[0], a[1], a[2]), q, new T.Vector3(a[3], a[4], a[5])); im.setMatrixAt(i, m4); im.setColorAt(i, frC[i]); }); im.castShadow = true; im.computeBoundingSphere(); g.add(im); }
}
function hedgeRow(g, x0, z0, x1, z1, h = .9, t = .8, y = 0) {
  const len = Math.hypot(x1 - x0, z1 - z0); if (len < .5) return;
  const n = Math.max(1, Math.round(len / .9)), l = [], cl = [], r = rng(hash('h' + x0.toFixed(1) + z0.toFixed(1)));
  for (let k = 0; k < n; k++) { const f = (k + .5) / n; l.push([x0 + (x1 - x0) * f, y + h * .5, z0 + (z1 - z0) * f, (len / n) * .75 + .2, h * .55, t * .62, r() * 6]); cl.push(new T.Color().setHSL(.27 + r() * .03, .42, .13 + r() * .04)); }
  const im = inst(l, mat.leaf(3), blobGeo(), true); cl.forEach((c, i) => im.setColorAt(i, c)); g.add(im);
}
function shadowDecal(g, x, z, w, d, y = .135, rot = 0) {
  const m = new T.Mesh(G.dec || (G.dec = keep(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2))), mat.shadow());
  m.position.set(x, y, z); m.scale.set(w, 1, d); m.rotation.y = rot; m.renderOrder = 1; g.add(m);
}

/* ---------- car (extruded profile, clearcoat paint) and people */
function carGeos() {
  if (G.carBody) return;
  const s = new T.Shape(); // side profile, x along the car (length 4.5), y up
  s.moveTo(-2.25, .32); s.lineTo(-2.25, .78); s.quadraticCurveTo(-2.2, .9, -1.9, .92); s.lineTo(-1.05, .98); s.lineTo(1.5, .96); s.quadraticCurveTo(2.2, .9, 2.25, .7); s.lineTo(2.25, .32); s.lineTo(-2.25, .32);
  G.carBody = keep(new T.ExtrudeGeometry(s, { depth: 1.7, bevelEnabled: true, bevelSize: .08, bevelThickness: .1, bevelSegments: 3, curveSegments: 6 }).translate(0, 0, -.85));
  const c = new T.Shape(); c.moveTo(-1.6, .96); c.lineTo(-.95, 1.42); c.lineTo(.6, 1.42); c.lineTo(1.25, .96); c.lineTo(-1.6, .96);
  G.carCab = keep(new T.ExtrudeGeometry(c, { depth: 1.44, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 2 }).translate(0, 0, -.72));
  G.wheel = keep(new T.CylinderGeometry(.34, .34, .24, 18).rotateX(Math.PI / 2));
  G.rim = keep(new T.CylinderGeometry(.21, .21, .25, 12).rotateX(Math.PI / 2));
}
function car(color, x, z, rot = 0) {
  carGeos();
  const g = new T.Group(); g.position.set(x, .12, z); g.rotation.y = rot + Math.PI / 2;
  const paint = phys('car' + color, { color, roughness: .32, metalness: .55, clearcoat: 1, clearcoatRoughness: .06, envI: 1.4 });
  const b = new T.Mesh(G.carBody, paint); b.castShadow = true; g.add(b);
  g.add(Object.assign(new T.Mesh(G.carCab, std('cabin', { color: 0x15191e, roughness: .06, metalness: .8, envI: 1.6 })), { castShadow: true }));
  for (const [wx, wz] of [[-1.42, .82], [1.42, .82], [-1.42, -.82], [1.42, -.82]]) { const w = new T.Mesh(G.wheel, mat.rubber()); w.position.set(wx, .34, wz); g.add(w); const rm = new T.Mesh(G.rim, mat.steel()); rm.position.set(wx, .34, wz + Math.sign(wz) * .01); g.add(rm); }
  g.add(inst([[2.3, .66, .55, .06, .1, .32], [2.3, .66, -.55, .06, .1, .32]], mat.lamp()));
  g.add(inst([[-2.33, .7, .6, .05, .1, .3], [-2.33, .7, -.6, .05, .1, .3]], std('tail', { color: 0x3a0505, emissive: 0xff2a1a, emissiveIntensity: .6 })));
  shadowDecal(g, 0, 0, 5.2, 2.3, .015);
  return g;
}
function people(g, list) {
  if (!list.length) return;
  const legs = [], body = [], head = [], bc = [], r = rng(hash('ppl' + list.length + list[0].x.toFixed(1)));
  const tones = [0xe9e2d4, 0x2f3a4a, 0x8a5a3c, 0xc9a96e, 0x5e6b52, 0x9c3b30, 0x1f1f22];
  for (const p of list) { const s = .92 + r() * .16, y = p.y || .14; legs.push([p.x, y + .42 * s, p.z, .3 * s, .84 * s, .2 * s, p.rot || 0]); body.push([p.x, y + 1.15 * s, p.z, .42 * s, .66 * s, .26 * s, p.rot || 0]); head.push([p.x, y + 1.62 * s, p.z, .2 * s, .24 * s, .21 * s, 0]); bc.push(new T.Color(tones[Math.floor(r() * tones.length)])); }
  const cg = G.caps || (G.caps = keep(new T.CapsuleGeometry(.5, .5, 3, 8).scale(1, .5, 1)));
  g.add(inst(legs, std('pants', { color: 0x2a2a2e, roughness: .8 }), cg, true));
  const b = inst(body, std('shirt', { color: 0xffffff, roughness: .8 }), cg, true); bc.forEach((c, i) => b.setColorAt(i, c)); g.add(b);
  g.add(inst(head, std('skin', { color: 0x8d5f43, roughness: .7 }), G.head || (G.head = keep(new T.SphereGeometry(1, 10, 8))), true));
}
function streetLamp(list, x, z, face) { list.push({ x, z, face }); }

/* ---------- site parts */
function plotPart(L) {
  const g = new T.Group(), { pw, pd } = L;
  g.add(B(pw, .12, pd, mat.lawn(), 0, 0, 0, false, 0));
  const e = .16, km = mat.paveD();
  g.add(inst([[0, .14, pd / 2 - e / 2, pw, .06, e], [0, .14, -pd / 2 + e / 2, pw, .06, e], [pw / 2 - e / 2, .14, 0, e, .06, pd], [-pw / 2 + e / 2, .14, 0, e, .06, pd]], km));
  const pg = G.peg || (G.peg = keep(new T.CylinderGeometry(.07, .07, .7, 8).translate(0, .35, 0)));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = new T.Mesh(pg, mat.peg()); p.position.set(sx * pw / 2, .12, sz * pd / 2); p.castShadow = true; g.add(p); }
  return g;
}
const roadZ = L => L.pd / 2 + 2.4 + 4.2;
function roadPart(L) {
  const g = new T.Group(), z = roadZ(L), len = 700, pd = L.pd;
  g.add(B(len, .06, 8.4, mat.asph(), 0, 0, z, false, 0));
  g.add(B(len, .18, 2.4, mat.pave(), 0, 0, pd / 2 + 1.2, false, 0), B(len, .18, 2.4, mat.pave(), 0, 0, z + 5.4, false, 0));
  g.add(inst([[0, .1, pd / 2 + 2.45, len, .2, .14], [0, .1, z + 4.15, len, .2, .14]], mat.conc()));
  const ds = []; for (let x = -len / 2; x < len / 2; x += 6) ds.push([x, .07, z, 2.6, .02, .12]);
  g.add(inst(ds, std('dash', { color: 0xd8cfb8, roughness: .8 })));
  // street lamps flanking the plot, light pools on the road at night
  const lamps = [], P = [], H = [], pools = [];
  for (const sx of [-1, 1]) for (const k of [0, 1]) lamps.push([sx * (L.pw / 2 + 12 + k * 24), pd / 2 + 2.1, 1]);
  for (const sx of [-1, 1]) for (const k of [0, 1]) lamps.push([sx * (L.pw / 2 + 6 + k * 24), z + 4.5, -1]);
  for (const [x, lz, f] of lamps) { P.push([x, 3, lz, .1, 6, .1], [x, 5.9, lz - f * .6, .07, .07, 1.3]); H.push([x, 5.85, lz - f * 1.2, .26, .1, .5]); pools.push([x, .1, lz - f * 1.8, 7, .01, 7]); }
  g.add(inst(P, std('lampPole', { color: 0x2a2b2e, roughness: .45, metalness: .8 }), null, true), inst(H, mat.lamp()));
  const pl = inst(pools, mat.pool2(), G.dec || (G.dec = keep(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)))); pl.renderOrder = 2; g.add(pl);
  // street trees and passers-by
  const st = []; for (const sx of [-1, 1]) for (const k of [0, 1]) st.push({ x: sx * (L.pw / 2 + 14 + k * 22), z: pd / 2 + 1.2, s: .9, k: 'broad', y: .18 });
  for (const k of [-2, -1, 1, 2]) st.push({ x: k * 22, z: z + 5.4, s: .85, k: 'broad', y: .18 });
  trees(g, st);
  people(g, [{ x: L.pw / 2 + 6, z: pd / 2 + 1.0, rot: 1.57 }, { x: L.pw / 2 + 6.7, z: pd / 2 + 1.4, rot: 1.4 }, { x: -L.pw / 2 - 9, z: z + 5.2, rot: -1.6 }]);
  g.add(car(0x6d7480, -L.pw / 2 - 12, z - 2.2, Math.PI / 2), car(0xeeeae2, L.pw / 2 + 20, z + 2.2, -Math.PI / 2));
  return g;
}
function plinthPart(L) {
  const g = new T.Group(), st = L.ghost ? 'model' : L.style, l0 = L.levels.find(l => l.lvl === 0) || L.levels[0];
  const pm = L.ghost ? mat.trim('model') : clad(st, st === 'glass' || st === 'modern' ? 'concrete' : 'stone');
  for (const v of l0.vols.concat(L.stilt ? [] : [])) {
    if (v.kind === 'canopy') continue;
    const p = B(v.w + .5, L.plinth, v.d + .5, pm, v.x, 0, v.z); if (v.rot) { p.geometry.translate(-v.x, 0, -v.z); p.position.set(v.x, 0, v.z); p.rotation.y = v.rot; } g.add(p);
    shadowDecal(g, v.x, v.z, v.w + 2.4, v.d + 2.4, .126, v.rot || 0);
  }
  if (L.stilt) { const f = L.fp; g.add(B(f.w + .5, L.plinth, f.d + .5, pm, f.x, 0, f.z)); }
  const f = L.fp, ex = entranceX(L);
  for (let s = 0; s < 3; s++) g.add(B(2.6 - s * .1, L.plinth * (s + 1) / 3, .38, mat.paveD(), ex, 0, f.z1 + .25 + (2 - s) * .36, true, .02));
  return g;
}
function entranceX(L) { const l0 = L.levels.find(l => l.lvl === 0) || L.levels[0], v = l0.vols.reduce((a, b) => (b.z + b.d / 2 > a.z + a.d / 2 + .5 ? b : a)); return L.type === 'row' ? 0 : clamp(v.x, -L.pw / 2 + 2, L.pw / 2 - 2); }
function driveX(L) { const f = L.fp; return L.type === 'row' ? 0 : clamp(f.x + f.w / 2 - 2, -L.pw / 2 + 2.2, L.pw / 2 - 2.2); }
function drivePart(L) {
  const g = new T.Group(), f = L.fp, dx = driveX(L), ex = entranceX(L);
  const z0 = f.z1, z1 = L.pd / 2, len = Math.max(.5, z1 - z0);
  if (L.type === 'row') g.add(B(L.pw - .4, .05, len, mat.pave(), 0, .12, z0 + len / 2, false, 0));
  else {
    g.add(B(3.2, .05, len, mat.pave(), dx, .12, z0 + len / 2, false, 0));
    g.add(inst([[dx - 1.68, .15, z0 + len / 2, .16, .08, len], [dx + 1.68, .15, z0 + len / 2, .16, .08, len]], mat.paveD()));
    if (Math.abs(ex - dx) > 2.5) { const st = []; for (let z = z0 + 1.6; z < z1 - .4; z += .9) st.push([ex + Math.sin(z * 1.3) * .15, .14, z, .9, .05, .55, Math.sin(z) * .1]); g.add(inst(st, mat.paveD(), null, false)); }
  }
  if (L.tier !== 'standard' && L.type !== 'row') { const ups = []; for (let z = z0 + 1.2; z < z1 - .6; z += 2.2) ups.push([dx - 1.95, .32, z, .12, .4, .12], [dx + 1.95, .32, z, .12, .4, .12]); const im = inst(ups, mat.lamp()); if (im) g.add(im); }
  return g;
}
// always-on landscaping: hedges on the boundary, specimen trees, planters at the entrance
function landPart(L) {
  const g = new T.Group(), { pw, pd } = L, f = L.fp, r = rng(hash('land' + L.type + L.variant + pw.toFixed(1) + pd.toFixed(1)));
  const dx = driveX(L), ex = entranceX(L), sp = L.style;
  const occ = (x, z, m = 1.4) => (x > f.x0 - m && x < f.x1 + m && z > f.z0 - m && z < f.z1 + m) || (z > f.z1 - .5 && Math.abs(x - dx) < 2.6) || (L.carport && z > pd / 2 - L.front - .5 && x < -pw / 2 + L.side + 9.5) || (L.park === 'base' && z > pd / 2 - L.front && x < -pw / 2 + L.side + 4.5) || (L.poolMode === 'ground' && L.type !== 'farm' && z < -pd / 2 + L.rear + .3 && Math.abs(x) < L.bw * .4 + 1.5) || (L.ex.has('servant') && x > pw / 2 - L.side - 4.2 && z < -pd / 2 + 4.2);
  if (!L.ex.has('wall') && L.type !== 'row') { // front hedge with a gap for the drive
    const fz = pd / 2 - .55, gx0 = Math.min(dx, ex) - 2.2, gx1 = Math.max(dx, ex) + (Math.abs(ex - dx) > 2.5 ? .9 : 2.2);
    hedgeRow(g, -pw / 2 + .5, fz, gx0, fz, .9, .8, .12); hedgeRow(g, gx1, fz, pw / 2 - .5, fz, .9, .8, .12);
  }
  if (L.type !== 'row') { hedgeRow(g, -pw / 2 + .55, -pd / 2 + .6, -pw / 2 + .55, pd / 2 - 1.6, 1.2, .9, .12); hedgeRow(g, pw / 2 - .55, -pd / 2 + .6, pw / 2 - .55, pd / 2 - 1.6, 1.2, .9, .12); }
  const tl = [], kinds = sp === 'tropical' || sp === 'indian' ? ['palm', 'frangipani', 'broad'] : sp === 'classic' ? ['cypress', 'broad', 'cypress'] : ['broad', 'frangipani', 'cypress'];
  const sc = clamp(Math.min(pw, pd) / 18, .6, 1.15), want = (L.tier === 'luxury' ? 9 : L.tier === 'premium' ? 7 : 5) + (L.ex.has('garden') ? 10 : 0) + (pw * pd > 2500 ? 14 : 0);
  for (let t = 0, n = 0; t < 260 && n < want; t++) {
    const x = (r() - .5) * (pw - 2.4), z = (r() - .5) * (pd - 2.4); if (occ(x, z, 1.8)) continue;
    if (tl.some(o => Math.hypot(o.x - x, o.z - z) < 3.2 * sc)) continue;
    tl.push({ x, z, s: (.7 + r() * .45) * sc, k: kinds[n % kinds.length] }); n++;
  }
  trees(g, tl); tl.forEach(t => shadowDecal(g, t.x, t.z, 3.2 * t.s, 3.2 * t.s, .128));
  // entrance planters and shrubs along the plinth
  const pm = clad(sp === 'model' ? 'modern' : sp, 'concrete'), pls = [];
  for (const s of [-1, 1]) pls.push([ex + s * 1.9, .12 + .3, f.z1 + .7, .9, .6, .9]);
  g.add(inst(pls, pm, null, true)); trees(g, pls.map(p => ({ x: p[0], z: p[2], s: .9, k: 'shrub', y: .62 })));
  const sh = []; for (let x = f.x0 + .6; x < f.x1 - .4; x += 1.3) if (Math.abs(x - ex) > 2.4 && !occ(x, f.z1 + .9, 0) && r() < .8) sh.push({ x, z: f.z1 + .75, s: .75 + r() * .4, k: 'shrub' });
  trees(g, sh);
  return g;
}
function carportPart(L) {
  const g = new T.Group(), maxN = L.park === 'cov' ? 2 : 3;
  const n = clamp(Math.floor((L.pw - 2 * L.side + 1) / 2.9), 1, maxN), w = n * 2.9, d = 5.6;
  const z = L.pd / 2 - L.front / 2 + .1, x = clamp(-L.pw / 2 + L.side + w / 2, -L.pw / 2 + w / 2 + .3, L.pw / 2 - w / 2 - .3);
  const st = L.ghost || L.style === 'model' ? 'modern' : L.style;
  g.add(B(w + .4, .05, d + .4, mat.pave(), x, .12, z, false, 0));
  const posts = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) posts.push([x + sx * w / 2, .12 + 1.3, z + sz * (d / 2 - .1), .14, 2.6, .14]);
  g.add(inst(posts, mat.frame(st, L.tier), null, true));
  g.add(B(w + .5, .16, d + .5, st === 'tropical' || st === 'indian' ? mat.roofT(st) : (L.tier === 'luxury' ? mat.gold() : mat.trim(st)), x, 2.72, z));
  g.add(B(w - .3, .03, d - .3, mat.lamp(), x, 2.69, z, false, 0));
  const cc = [0xd9c39a, 0x1c1c1f, 0xeeeae2];
  for (let k = 0; k < n; k++) g.add(car(cc[k % 3], x - w / 2 + 1.45 + k * 2.9, z, 0));
  return g;
}
function basementPart(L) {
  const g = new T.Group(), w = 3.6, len = Math.max(4.5, L.front - 1.2);
  const x = clamp(-L.pw / 2 + L.side + w / 2, -L.pw / 2 + w / 2 + .3, L.pw / 2 - w / 2 - .3), z = L.pd / 2 - .2 - len / 2;
  g.add(B(w, .05, len, mat.asph(), x, .12, z, false, 0));
  const ws = []; for (const sx of [-1, 1]) ws.push([x + sx * (w / 2 + .1), .12 + .5, z + .8, .2, 1.0, len - 1.6]);
  g.add(inst(ws, mat.conc(), null, true));
  const hz = z - len / 2 + 1.7;
  g.add(B(w + .6, 2.7, 3.4, mat.conc(), x, .12, hz));
  g.add(B(w - .4, 2.2, .1, mat.black(), x, .12, hz + 1.72, false, 0));
  g.add(B(w - .2, .08, .14, mat.lamp(), x, 2.42, hz + 1.76, false, 0));
  const stripes = []; for (let k = 0; k < 6; k++) stripes.push([x - w / 2 + .35 + k * (w - .7) / 5, .17, z + len / 2 - .6, .28, .02, .9]);
  g.add(inst(stripes, std('yellow', { color: 0xd9b23a, roughness: .7 })));
  g.add(car(0xd9c39a, x, z + 1.2, Math.PI));
  return g;
}
function topZone(info, L, preferPart) {
  const z = (info && info.flatZones) || L.flatZones, f = z.filter(a => !a.part && !a.rot), p = z.filter(a => a.part);
  const pick = a => a.reduce((m, b) => (b.w * b.d > m.w * m.d ? b : m), a[0]);
  return (preferPart && p.length ? pick(p) : f.length ? pick(f) : p.length ? pick(p) : null);
}
function poolPart(L, info) {
  const g = new T.Group();
  let x, z, y, w, d;
  if (L.poolMode === 'roof') {
    const zone = topZone(info, L) || { x: L.fp.x, z: L.fp.z, w: L.fp.w, d: L.fp.d, y: L.roofY };
    w = Math.max(2.4, zone.w * .55); d = Math.max(1.8, Math.min(3.2, zone.d * .34)); x = zone.x - zone.w * .12; z = zone.z + zone.d / 2 - d / 2 - .9; y = zone.y + .05;
  } else if (L.type === 'farm') {
    const f = L.fp; w = 12; d = 5; x = clamp(f.x + f.w / 2 - 6, -L.pw / 2 + 7, L.pw / 2 - 7); z = Math.min(f.z1 + 6.5, L.pd / 2 - L.front - 3); y = .12;
  } else {
    w = clamp(L.bw * .62, 3, 12); d = clamp(L.rear - 2.4, 2, 4.5); x = L.ex.has('servant') ? -L.pw / 2 + L.side + w / 2 + .3 : 0; z = -L.pd / 2 + L.rear / 2 + .1; y = .12;
  }
  g.add(B(w + 1.6, .22, d + 1.6, mat.paveD(), x, y, z, true, .03));
  g.add(B(w, .12, d, mat.pooltile(), x, y + .1, z, false, 0));
  g.add(B(w - .02, .02, d - .02, mat.water(), x, y + .22, z, false, 0));
  if (L.poolMode !== 'roof') {
    g.add(B(w + 1.6, .05, 2.2, mat.deck(), x, y, z + d / 2 + .8 + 1.1, false, 0));
    const lm = std('lounger', { color: 0xf1ece2, roughness: .7 }); for (const k of [0, 1]) g.add(B(.7, .3, 1.9, lm, x - w / 2 + .7 + k * 1.1, y + .05, z + d / 2 + 1.9, true, .08));
    g.add(at(new T.Mesh(G.umb || (G.umb = keep(new T.ConeGeometry(1.3, .45, 12))), std('umbrella', { color: 0xf3ead8, roughness: .8 })), x - w / 2 + 3.2, y + 2.3, z + d / 2 + 1.9, true));
    g.add(B(.05, 2.2, .05, mat.steel(), x - w / 2 + 3.2, y, z + d / 2 + 1.9));
  }
  return g;
}
function gardenPart(L) { // extra: lawn beds, a seating nook and a stone path loop (trees come from landPart)
  const g = new T.Group(), { pw, pd } = L, f = L.fp, r = rng(hash('garden' + pw + pd));
  const zR = (-pd / 2 + f.z0) / 2;
  if (f.z0 + pd / 2 > 3.5 && L.poolMode !== 'ground') {
    g.add(B(Math.min(pw - 3, f.w), .05, (f.z0 + pd / 2) - 1.6, mat.lawn(), f.x, .12, zR, false, 0));
    const st = []; for (let k = 0; k < 7; k++) st.push([f.x - f.w * .3 + k * f.w * .1, .16, zR + Math.sin(k * .9) * .8, .8, .05, .55, k * .3]);
    g.add(inst(st, mat.paveD()));
  }
  const beds = []; for (let k = 0; k < 6; k++) { const x = (r() - .5) * (pw - 3), z = f.z1 + .9 + r() * Math.max(.2, pd / 2 - f.z1 - 2.5); if (Math.abs(x - driveX(L)) > 2.4 && Math.abs(x - entranceX(L)) > 1.4) beds.push({ x, z, s: .6 + r() * .3, k: 'shrub' }); }
  trees(g, beds);
  return g;
}
function terracePart(L, info) {
  const g = new T.Group(), z0 = topZone(info, L, true); if (!z0) return g;
  const pm = std('planter', { color: 0x3a3632, roughness: .8 });
  g.add(B(z0.w - 1, .5, .6, pm, z0.x, z0.y, z0.z + z0.d / 2 - .55), B(.6, .5, z0.d - 1.2, pm, z0.x - z0.w / 2 + .55, z0.y, z0.z));
  hedgeRow(g, z0.x - z0.w / 2 + 1, z0.z + z0.d / 2 - .55, z0.x + z0.w / 2 - 1, z0.z + z0.d / 2 - .55, .55, .5, z0.y + .45);
  trees(g, [{ x: z0.x - z0.w / 2 + 1.2, z: z0.z + z0.d / 2 - 1.3, s: .45, k: 'frangipani', y: z0.y }, { x: z0.x + z0.w / 2 - 1.3, z: z0.z - z0.d / 2 + 1.2, s: .4, k: 'broad', y: z0.y }]);
  if (L.poolMode !== 'roof') g.add(B(Math.min(3.4, z0.w * .35), .04, Math.min(2.6, z0.d * .35), mat.lawn(), z0.x + z0.w * .12, z0.y, z0.z + z0.d * .05, false, 0));
  g.add(at(new T.Mesh(G.umb || (G.umb = keep(new T.ConeGeometry(1.3, .45, 12))), std('umbrella', { color: 0xf3ead8, roughness: .8 })), z0.x + z0.w * .2, z0.y + 2.3, z0.z - z0.d * .1, true));
  return g;
}
function solarPart(L, info) {
  const g = new T.Group(), pm = mat.solar(), pg = G.panel || (G.panel = keep(new T.BoxGeometry(1, .05, 1.65)));
  const slopes = ((info && info.slopes) || []).filter(s => !s.side && !s.rot);
  const s = slopes.sort((a, b) => b.w - a.w)[0], fz = topZone(info, L);
  if (s && !(L.ex.has('terrace') && fz)) {
    const slen = s.run / Math.cos(s.ang), grp = new T.Group(), cols = Math.max(2, Math.floor(s.w / 1.08)), rows = Math.max(1, Math.floor(slen * .6 / 1.72)), l = [];
    for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) l.push([-cols * 1.08 / 2 + .54 + a * 1.08, 0, (b - (rows - 1) / 2) * 1.72, 1, 1, 1]);
    grp.add(inst(l, pm, pg, true)); grp.rotation.x = s.ang;
    const mid = s.run / 2; grp.position.set(s.x, s.y + Math.tan(s.ang) * mid + .1, s.z + mid);
    g.add(grp);
  } else if (fz) {
    const cols = Math.max(2, Math.floor((fz.w - 1.4) / 1.08)), rows = clamp(Math.floor(fz.d * .42 / 2.2), 1, 6), l = [], st = [];
    for (let b = 0; b < rows; b++) { const zz = fz.z - fz.d / 2 + 1.3 + b * 2.2; for (let a = 0; a < cols; a++) l.push([fz.x - cols * 1.08 / 2 + .54 + a * 1.08, fz.y + .55, zz, 1, 1, 1, 0, .24]); st.push([fz.x, fz.y + .25, zz - .3, cols * 1.08, .45, .08]); }
    g.add(inst(l, pm, pg, true), inst(st, mat.steel()));
  } else { // no usable roof: a small ground-mounted array in the rear corner
    const l = [], st = [], x0 = -L.pw / 2 + 1.4, z0 = -L.pd / 2 + 1.6;
    for (let a = 0; a < 4; a++) for (let b = 0; b < 2; b++) { l.push([x0 + .6 + a * 1.08, .9 + b * .4, z0 + b * 1.5, 1, 1, 1, 0, .5]); }
    for (let a = 0; a < 3; a++) st.push([x0 + .6 + a * 1.6, .5, z0 + .7, .06, .9, .06]);
    g.add(inst(l, pm, pg, true), inst(st, mat.steel()));
  }
  return g;
}
function liftPart(L) {
  const g = new T.Group(), f = L.fp, h = L.roofY - L.plinth + 1.4;
  const x = f.x1 + .45, z = f.z - f.d * .15;
  g.add(B(1.7, h, 1.9, mat.rail(), x, L.plinth, z, false, 0));
  const fr = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) fr.push([x + sx * .85, L.plinth + h / 2, z + sz * .95, .09, h, .09]);
  for (let yy = L.plinth; yy <= L.plinth + h + .01; yy += Math.max(3, L.fh)) fr.push([x, yy, z + .95, 1.7, .08, .09], [x, yy, z - .95, 1.7, .08, .09], [x + .85, yy, z, .09, .08, 1.9]);
  fr.push([x, L.plinth + h, z, 1.8, .12, 2.0]);
  g.add(inst(fr, mat.gold(), null, true));
  g.add(B(1.3, 2.3, 1.4, mat.int(0), x, L.plinth + Math.min(h * .45, 3.4), z, false, 0));
  return g;
}
function rwhPart(L) {
  const g = new T.Group(), x = -L.pw / 2 + Math.max(.9, L.side * .5), z = L.bz - L.bd * .2, f = L.fp;
  const t = new T.Mesh(G.tank || (G.tank = keep(new T.CylinderGeometry(.62, .62, 1.6, 20).translate(0, .8, 0))), std('tank', { color: 0x7d8a8f, roughness: .6, metalness: .3 })); t.position.set(x, .12, z); t.castShadow = true; g.add(t);
  const pit = new T.Mesh(G.pit || (G.pit = keep(new T.CylinderGeometry(.6, .6, .07, 20))), mat.gold()); pit.position.set(x, .17, z + 2.2); g.add(pit);
  g.add(B(.09, L.roofY - .3, .09, mat.steel(), f.x0 - .07, .12, z - .9, true, 0));
  g.add(B(Math.max(.1, Math.abs(x - f.x0)), .09, .09, mat.steel(), (x + f.x0) / 2, 1.8, z - .9, true, 0));
  return g;
}
function servantPart(L) {
  const g = new T.Group(), w = 3.4, d = 3.0, st = L.ghost ? 'model' : L.style;
  const x = L.pw / 2 - L.side - w / 2 + .3, z = -L.pd / 2 + Math.max(.5, L.side * .4) + d / 2 + .1;
  g.add(B(w, 2.9, d, L.ghost ? mat.ghost() : clad(st, PAL[st].clad), x, .12, z));
  g.add(B(w + .5, .22, d + .5, PAL[st].pitched ? mat.roofT(st) : mat.trim(st), x, 3.02, z));
  g.add(B(.9, 2, .08, mat.wood(), x - .6, .12, z + d / 2 + .02), B(1, .9, .08, mat.int(1), x + .8, 1.1, z + d / 2 + .02, false, 0));
  return g;
}
function wallPart(L) {
  const g = new T.Group(), { pw, pd } = L, h = 1.7, t = .22, st = L.ghost ? 'model' : L.style;
  const wm = st === 'glass' ? clad('glass', 'dark') : st === 'tropical' ? clad(st, 'stone') : clad(st, PAL[st].clad);
  const gx = driveX(L), gw = L.type === 'row' ? Math.min(pw - 2, 6) : 3.8;
  g.add(B(pw, h, t, wm, 0, .12, -pd / 2 + t / 2), B(t, h, pd, wm, -pw / 2 + t / 2, .12, 0), B(t, h, pd, wm, pw / 2 - t / 2, .12, 0));
  const l1 = gx - gw / 2 - .55 + pw / 2, l2 = pw / 2 - (gx + gw / 2 + .55);
  if (l1 > .3) g.add(B(l1, h, t, wm, -pw / 2 + l1 / 2, .12, pd / 2 - t / 2));
  if (l2 > .3) g.add(B(l2, h, t, wm, pw / 2 - l2 / 2, .12, pd / 2 - t / 2));
  const cm = st === 'indian' ? mat.roofT('indian') : mat.trim(st);
  g.add(inst([[0, .12 + h + .04, -pd / 2 + t / 2, pw + .1, .08, t + .1], [-pw / 2 + t / 2, .12 + h + .04, 0, t + .1, .08, pd], [pw / 2 - t / 2, .12 + h + .04, 0, t + .1, .08, pd]], cm, null, true));
  for (const sx of [-1, 1]) { g.add(B(.55, 2.2, .55, mat.base(st), gx + sx * (gw / 2 + .27), .12, pd / 2 - t / 2)); g.add(B(.34, .3, .34, mat.lamp(), gx + sx * (gw / 2 + .27), 2.32, pd / 2 - t / 2, false)); }
  const sl = [], gm = L.tier === 'luxury' ? mat.gold() : mat.frame('modern');
  for (let k = 0; k < Math.round(gw / .2); k++) sl.push([gx - gw / 2 + .1 + k * .2, .12 + .95, pd / 2 - t / 2, .06, 1.6, .06]);
  g.add(inst(sl, gm, null, true)); g.add(B(gw, .08, .1, gm, gx, 1.85, pd / 2 - t / 2), B(gw, .08, .1, gm, gx, .2, pd / 2 - t / 2));
  return g;
}
function constructionPart(L) {
  const g = new T.Group(), top = L.levels[L.levels.length - 1], t = largest(top.vols);
  if (L.cons === 'mivan') {
    const fm = std('alu', { color: 0xc9ced4, roughness: .32, metalness: .9 });
    g.add(B(t.w + .35, top.h + .3, t.d + .35, fm, t.x, top.y - .1, t.z));
    const jl = []; for (let k = -Math.floor(t.w / 2.4); k <= Math.floor(t.w / 2.4); k++) jl.push([t.x + k * 1.2, top.y + top.h / 2, t.z + t.d / 2 + .19, .05, top.h + .3, .03]);
    for (let k = 1; k < 3; k++) jl.push([t.x, top.y - .1 + k * (top.h + .3) / 3, t.z + t.d / 2 + .19, t.w + .35, .05, .03]);
    g.add(inst(jl, std('alu2', { color: 0x6b7078, roughness: .5, metalness: .8 })));
    const ch = L.roofY + 9, cx = L.bbox.x0 - 3.4, cz = t.z, jw = Math.max(18, t.w + 10), cm = std('crane', { color: 0xd9a400, roughness: .6, metalness: .3 });
    g.add(B(1.2, ch, 1.2, cm, cx, 0, cz)); g.add(B(jw, .8, .8, cm, cx + jw / 2 - 4, ch, cz));
    g.add(B(2, 1.4, 1.6, std('cab', { color: 0xeeeeea, roughness: .5 }), cx, ch - 1.6, cz + 1.3));
    g.add(B(1.6, 1.6, 1.4, mat.conc(), cx - 3, ch - .4, cz)); g.add(B(.05, 6, .05, mat.steel(), cx + jw - 6, ch - 6, cz, true, 0));
  } else if (L.cons === 'block') {
    const sc = [], off = 1.0, H = L.roofY + .8, b = L.bbox, x0 = b.x0 - off, x1 = b.x1 + off, z0 = b.z0 - off, z1 = b.z1 + off;
    for (let x = x0; x <= x1 + .01; x += 2.2) sc.push([x, H / 2, z1, .07, H, .07], [x, H / 2, z0, .07, H, .07]);
    for (let z = z0; z <= z1 + .01; z += 2.2) sc.push([x0, H / 2, z, .07, H, .07], [x1, H / 2, z, .07, H, .07]);
    for (let y = 1.8; y < H; y += 1.8) sc.push([(x0 + x1) / 2, y, z1, x1 - x0, .06, .06], [(x0 + x1) / 2, y, z0, x1 - x0, .06, .06], [x0, y, (z0 + z1) / 2, .06, .06, z1 - z0], [x1, y, (z0 + z1) / 2, .06, .06, z1 - z0]);
    for (let y = 1.8; y < H; y += 1.8) sc.push([(x0 + x1) / 2, y - .03, z1 - .35, x1 - x0, .04, .7]);
    g.add(inst(sc, mat.steel(), null, true));
    const bl = []; for (let k = 0; k < 5; k++) bl.push([x0 + 1 + k * 1.5, .12 + .35, z1 + 1.5, 1.1, .7, 1.1]);
    g.add(inst(bl, std('blocks', { color: 0xa9a297, roughness: .95 })));
  }
  return g;
}
function contextPart(loc) {
  const g = new T.Group();
  const P = { north: [26, 6, 22, 150, 330], east: [110, 22, 85, 130, 320], south: [80, 12, 46, 120, 300], west: [55, 8, 30, 140, 320], central: [170, 26, 115, 95, 280], outside: [0, 0, 0, 0, 0] }[loc] || [50, 8, 34, 140, 320];
  const [n, h0, h1, r0, r1] = P, r = rng(hash('ctx' + loc)), list = [];
  for (let k = 0; k < n; k++) {
    const a = r() * Math.PI * 2, rad = r0 + Math.pow(r(), .7) * (r1 - r0), x = Math.cos(a) * rad, z = Math.sin(a) * rad;
    if (Math.abs(z - 20) < 16) continue;
    const h = h0 + Math.pow(r(), 1.6) * (h1 - h0), w = 10 + r() * 18, d = 10 + r() * 16;
    list.push([x, h / 2, z, w, h, d, r() * Math.PI]);
  }
  if (list.length) g.add(inst(list, mat.city()));
  const tn = { north: 150, east: 60, south: 80, west: 100, central: 30, outside: 260 }[loc] ?? 90, tl = [];
  for (let k = 0; k < tn; k++) { const a = r() * Math.PI * 2, rad = 60 + r() * 240, x = Math.cos(a) * rad, z = Math.sin(a) * rad; if (Math.abs(z - 20) < 12) continue; tl.push({ x, z, s: 1.3 + r() * 1.4, k: r() < .12 ? 'palm' : r() < .2 ? 'cypress' : 'broad', y: 0 }); }
  trees(g, tl, true);
  if (loc === 'outside' || loc === 'north') { const fs = []; for (let k = 0; k < 14; k++) fs.push([-220 + k * 34, .04, -150 - r() * 60, 30, .08, 70 + r() * 40]); g.add(inst(fs, std('field', { color: 0x6a6a3a, roughness: 1 }))); }
  if (loc === 'west' || loc === 'south' || loc === 'outside') {
    const hg = G.hill || (G.hill = keep(new T.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2))), hl = [];
    for (let k = 0; k < 9; k++) { const a = -2.6 + k * .33 + r() * .2, rad = 380 + r() * 120; hl.push([Math.cos(a) * rad, 0, Math.sin(a) * rad, 60 + r() * 60, 18 + r() * (loc === 'west' ? 34 : 20), 50 + r() * 40]); }
    g.add(inst(hl, std('hill', { color: 0x3a4a34, roughness: 1 }), hg));
  }
  return g;
}

let grassPlot = '';
function buildGrass() {
  const geo = keep(new T.ConeGeometry(.035, .22, 3).translate(0, .11, 0));
  grass = new T.InstancedMesh(geo, std('grass', { color: 0xffffff, roughness: 1 }), mobile ? 2200 : 5000);
  grass.frustumCulled = false; grass.visible = false; scene.add(grass); // blades read as noise at this scale; the textured lawn carries it
}
function placeGrass(pw, pd) {
  const s0 = pw.toFixed(1) + 'x' + pd.toFixed(1); if (s0 === grassPlot) return; grassPlot = s0;
  const r = rng(11), m4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3(), c = new T.Color(), ax = new T.Vector3(), rz = pd / 2 + 6.6;
  const R = Math.max(pw, pd) * .5 + 40;
  for (let i = 0; i < grass.count; i++) {
    let x, z, tries = 0;
    do { const a = r() * Math.PI * 2, rad = Math.sqrt(r()) * R; x = Math.cos(a) * rad; z = Math.sin(a) * rad; tries++; } while (tries < 30 && ((Math.abs(x) < pw / 2 + .3 && Math.abs(z) < pd / 2 + .3) || Math.abs(z - rz) < 6.8));
    p.set(x, 0, z); ax.set(r() - .5, 0, r() - .5).normalize(); q.setFromAxisAngle(ax, r() * .35); const k = .5 + r() * .7; s.set(k, k * (.6 + r() * .7), k);
    m4.compose(p, q, s); grass.setMatrixAt(i, m4); c.setHSL(.2 + r() * .05, .42, .07 + r() * .05); grass.setColorAt(i, c);
  }
  grass.instanceMatrix.needsUpdate = true; if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
}

/* ---------- compose + camera framing */
const sig = o => JSON.stringify(o, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v instanceof Set ? [...v].sort() : v);
function edges(mesh) { const l = new T.LineSegments(new T.EdgesGeometry(mesh.geometry), mat.edge()); l.position.copy(mesh.position); return l; }
function composeParts(L) {
  const parts = [], { pw, pd } = L;
  parts.push({ key: 'plot' + sig([pw, pd]), anim: 'grow', make: () => plotPart(L), dur: 700 });
  parts.push({ key: 'road' + sig([pw, pd]), instant: true, make: () => roadPart(L) });
  parts.push({ key: 'ctx-' + (S.loc || 'default'), anim: 'rise', dur: 1400, make: () => contextPart(S.loc || 'default') });
  if (!L.type) return parts;
  const look = { st: L.style, g: L.ghost, tier: L.tier, type: L.type, v: L.variant, th: L.ex.has('theatre') };
  const lsig = L.levels.map(l => sig([l.y, l.h, l.stilt, l.vols.map(v => [v.x, v.z, v.w, v.d, v.kind, v.clad, v.rot, v.ribbon, v.fins, v.pil])]));
  parts.push({ key: 'plinth' + sig([lsig[0], L.stilt, look]), anim: 'grow', make: () => plinthPart(L), dur: 500 });
  L.levels.forEach((l, i) => parts.push({ key: 'lv' + i + lsig[i] + sig(look), floor: i, anim: 'rise', make: () => levelPart(l, L) }));
  const roofKey = 'roof' + sig([lsig, L.levels.map(l => l.vols.map(v => v.roofK)), look]);
  let roofObj = null;
  const getRoof = () => live.get(roofKey) || roofObj || (roofObj = (() => { const g = roofsPart(L); g.userData.info = { slopes: L.slopes, flatZones: L.flatZones }; return g; })());
  const info = () => getRoof().userData.info;
  parts.push({ key: roofKey, late: true, anim: 'rise', make: getRoof });
  if (L.decor.length) parts.push({ key: 'decor' + sig([L.decor, lsig]) + sig(look), late: true, d: 120, anim: 'rise', make: () => decorPart(L) });
  const base = sig([pw, pd, L.bw, L.bd, L.bz, look, L.side, L.front, L.rear, L.fp]);
  parts.push({ key: 'land' + base + sig([L.park, L.carport, L.poolMode, L.ex.has('garden'), L.ex.has('wall'), L.ex.has('servant')]), late: true, d: 200, make: () => landPart(L) });
  parts.push({ key: 'drive' + base, anim: 'grow', late: true, make: () => drivePart(L) });
  if (L.carport) parts.push({ key: 'carport' + base + L.park, late: true, d: 150, make: () => carportPart(L) });
  if (L.park === 'base') parts.push({ key: 'basement' + base, late: true, d: 150, make: () => basementPart(L) });
  if (L.ex.has('garden')) parts.push({ key: 'garden' + base + L.poolMode, late: true, d: 250, make: () => gardenPart(L) });
  if (L.poolMode) parts.push({ key: 'pool' + base + L.poolMode + L.ex.has('servant') + roofKey, late: true, d: 300, anim: 'grow', make: () => poolPart(L, info()) });
  if (L.ex.has('terrace')) parts.push({ key: 'terr' + roofKey + L.poolMode, late: true, d: 380, make: () => terracePart(L, info()) });
  if (L.ex.has('solar')) parts.push({ key: 'solar' + roofKey + L.ex.has('terrace'), late: true, d: 440, make: () => solarPart(L, info()) });
  if (L.ex.has('lift')) parts.push({ key: 'lift' + sig(lsig) + base, late: true, d: 200, anim: 'rise', make: () => liftPart(L) });
  if (L.ex.has('rwh')) parts.push({ key: 'rwh' + base + L.roofY, late: true, d: 320, make: () => rwhPart(L) });
  if (L.ex.has('servant')) parts.push({ key: 'serv' + base, late: true, d: 260, anim: 'rise', make: () => servantPart(L) });
  if (L.ex.has('wall')) parts.push({ key: 'wall' + base, late: true, d: 100, anim: 'rise', make: () => wallPart(L) });
  if (step === QI.cons && (L.cons === 'mivan' || L.cons === 'block')) parts.push({ key: 'cons' + L.cons + sig(lsig) + base, late: true, d: 100, anim: 'rise', make: () => constructionPart(L) });
  return parts;
}
function frameSun(L) {
  const size = Math.max(L.pw, L.pd), H = L.H || 0, R = size * .75 + H * .9 + 14;
  sun.position.copy(sunDir).multiplyScalar(R * 2.2 + 40); sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
  const sc = sun.shadow.camera, e = size * .72 + H * .7 + 12; sc.left = -e; sc.right = e; sc.top = e; sc.bottom = -e; sc.near = 1; sc.far = R * 4.4 + 120; sc.updateProjectionMatrix();
  renderer.shadowMap.needsUpdate = true;
}
function frame(L, instant) {
  const size = Math.max(L.pw, L.pd), H = L.H || 0, isSum = step >= Q.length;
  const asp = camera.aspect, fit = asp < 1.2 ? 1.2 / asp : 1;
  const ty = Math.min(H * .4, 40) + .6;
  let dist = (Math.max(size * 1.25, H * 1.55, 18) * 1.32 + 7) * Math.pow(fit, .8);
  if (isSum) dist *= .92;
  frameSun(L);
  scene.fog.near = Math.max(120, dist * 2); scene.fog.far = Math.max(700, dist * 9);
  controls.maxDistance = dist * 2.6; controls.minDistance = Math.max(5, size * .3);
  const tt = new T.Vector3(0, ty, 0);
  const fs = sig([size, H, isSum, asp > 1.2]);
  if (instant || reduce) {
    controls.target.copy(tt);
    const dir = camera.position.clone().sub(controls.target).normalize();
    if (!isFinite(dir.x) || dir.y < .15) dir.set(.62, .38, .7).normalize();
    if (isSum) { const sp = new T.Spherical().setFromVector3(dir); sp.phi = 1.12; dir.setFromSpherical(sp); }
    camera.position.copy(tt).addScaledVector(dir, dist); lastFrameSig = fs; camGoal = null; dirty = true; return;
  }
  if (fs === lastFrameSig) return; lastFrameSig = fs;
  const fd = camera.position.distanceTo(controls.target), cur = new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  camGoal = { ft: controls.target.clone(), tt, fd, td: dist, t0: performance.now(), dur: 1500, fphi: cur.phi, phi: isSum ? 1.12 : (cur.phi < .7 || cur.phi > 1.3 ? 1.12 : null) };
}
let firstFrame = true;
function update3D(animate) {
  const L = layoutOf(); lastLayout = L;
  if (threeOK) {
    placeGrass(L.pw, L.pd);
    reconcile(composeParts(L));
    updateEmissives();
    frame(L, firstFrame || !animate); firstFrame = false;
  }
  describe(L);
}
function describe(L) {
  const vr = variantRow();
  const t = L.type ? `${optLabel('floors', S.floors) || ''} ${vr ? vr[1] : ''} ${optLabel('style', S.style) || ''} ${optLabel('type', S.type)}`.replace(/\s+/g, ' ').trim() : 'an empty plot';
  const ex = (S.extras || []).map(v => optLabel('extras', v)).join(', ');
  const d = `3D preview: ${t} on a ${plotLabel() || '40 × 60 ft'} plot${S.loc ? ', ' + optLabel('loc', S.loc) + ' Bangalore' : ''}${S.park && S.park !== 'none' ? ', parking: ' + optLabel('park', S.park) : ''}${ex ? ', with ' + ex : ''}, ${(LIGHTS.find(l => l[0] === S.light) || LIGHTS[1])[1].toLowerCase()} lighting.`;
  if (canvas) canvas.setAttribute('aria-label', d);
  if (liveEl && isOpen && step >= 0 && step < Q.length) { clearTimeout(describe.t); describe.t = setTimeout(() => { liveEl.textContent = 'Model updated. ' + d; }, 700); }
  renderHud();
}

/* ---------- design thumbnails: rendered offscreen into a corner of the live canvas, copied, then the main view is redrawn */
const TH = {}, thumbQ = [];
let thumbScene = null, thumbCam = null, thumbBusy = false;
function thumbState(v) { const row = variantsOf(S.type).find(r => r[0] === v); return { ...S, variant: v, style: (S.styleAuto || !S.style) ? row[3] : S.style, extras: [], park: 'none', floors: S.floors }; }
function thumbKey(v) { const t = thumbState(v); return [t.type, v, t.style, t.tier, t.floors, S.light, quality].join('|'); }
function svgThumb(v) {
  const L = layoutOf(thumbState(v), { bare: true, plot: [40, 60] }); if (!L.levels.length) return '';
  const b = L.bbox, H = Math.max(L.H, 6), sx = 280 / Math.max(b.w + 4, H * 1.6), x0 = 150 - b.x * sx, y0 = 176;
  let p = '';
  for (const l of L.levels) for (const vv of l.vols) {
    const x = x0 + (vv.x - vv.w / 2) * sx, w = vv.w * sx, y = y0 - (l.y + l.h) * sx, h = l.h * sx, back = vv.z < b.z - .5;
    p += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${vv.kind === 'glazed' ? 'rgba(201,169,110,.22)' : back ? 'rgba(244,239,230,.06)' : 'rgba(244,239,230,.12)'}" stroke="#c9a96e" stroke-width="1"/>`;
    const hr = roofRise(vv.roofK, vv, L.style) * sx, ty = y;
    if (vv.roofK === 'gable-z' || vv.roofK === 'barn' || vv.roofK === 'hip' || vv.roofK === 'gable-x') p += `<path d="M${(x - 4).toFixed(1)} ${ty.toFixed(1)} L${(x + w / 2).toFixed(1)} ${(ty - hr).toFixed(1)} L${(x + w + 4).toFixed(1)} ${ty.toFixed(1)}" fill="rgba(201,169,110,.18)" stroke="#c9a96e" stroke-width="1"/>`;
    else if (vv.roofK === 'mono' || vv.roofK === 'mono-x') p += `<path d="M${x.toFixed(1)} ${ty.toFixed(1)} L${(x + w).toFixed(1)} ${(ty - hr * .6).toFixed(1)}" stroke="#c9a96e" fill="none"/>`;
  }
  return `<svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet"><line x1="10" y1="${y0}" x2="290" y2="${y0}" stroke="rgba(201,169,110,.5)"/>${p}</svg>`;
}
function requestThumbs() {
  const els = [...bodyEl.querySelectorAll('.cx-thumb[data-v]')];
  for (const el of els) { const k = thumbKey(el.dataset.v); if (TH[k]) el.innerHTML = `<img alt="" src="${TH[k]}">`; else if (!el.dataset.k) el.innerHTML = svgThumb(el.dataset.v); el.dataset.k = k; }
  if (threeOK === false) return;
  (initP || init3D()).then(() => {
    if (!threeOK) return;
    for (const el of els) { const k = thumbKey(el.dataset.v); if (!TH[k] && !thumbQ.some(q => q.k === k)) thumbQ.push({ k, v: el.dataset.v }); }
    pumpThumbs();
  });
}
function pumpThumbs() {
  if (thumbBusy || !thumbQ.length) return; thumbBusy = true;
  requestAnimationFrame(() => {
    const j = thumbQ.shift();
    try { if (!TH[j.k] && S.type) TH[j.k] = renderThumb(j.v); } catch (e) { console.warn('thumb', e && e.message); }
    const el = bodyEl && bodyEl.querySelector(`.cx-thumb[data-v="${j.v}"]`);
    if (el && TH[j.k] && el.dataset.k === j.k) el.innerHTML = `<img alt="" src="${TH[j.k]}">`;
    thumbBusy = false; pumpThumbs(); thumbsDone();
  });
}
let thumbWait = [];
function thumbsDone() { if (!thumbQ.length && !thumbBusy) { thumbWait.splice(0).forEach(f => f()); } }
function skyGrad() {
  const k = 'sky-' + (S.light || 'golden'); if (TX[k]) return TX[k];
  const hex = c => '#' + new T.Color(c).getHexString();
  const t = canvasTex(4, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, hex(LM.top)); gr.addColorStop(.62, hex(LM.mid)); gr.addColorStop(1, hex(LM.hor)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  t.wrapS = t.wrapT = T.ClampToEdgeWrapping; return (TX[k] = t);
}
function renderThumb(v) {
  if (!thumbScene) {
    thumbScene = new T.Scene(); thumbScene.fog = new T.Fog(0, 400, 2000);
    thumbScene.add(new T.HemisphereLight()); const s = new T.DirectionalLight(); s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -.0003; s.shadow.normalBias = .03; s.shadow.radius = 3; thumbScene.add(s, s.target); thumbScene.add(new T.DirectionalLight());
    thumbCam = new T.PerspectiveCamera(30, 1.5, .5, 2000);
  }
  const [hm, sn, fl] = thumbScene.children.filter(c => c.isLight);
  hm.color.copy(hemi.color); hm.groundColor.copy(hemi.groundColor); hm.intensity = hemi.intensity; sn.color.copy(sun.color); sn.intensity = sun.intensity; fl.intensity = fillL.intensity; fl.color.copy(fillL.color); fl.position.copy(fillL.position);
  thumbScene.background = skyGrad(); thumbScene.environment = scene.environment; thumbScene.environmentIntensity = scene.environmentIntensity; thumbScene.fog.color.set(LM.fog);
  const L = layoutOf(thumbState(v), { bare: true, plot: plotFt() });
  const grp = new T.Group(), b = L.bbox;
  grp.add(B(b.w + 14, .12, b.d + 14, mat.lawn(), b.x, 0, b.z, false, 0));
  grp.add(plinthPart(L)); L.levels.forEach(l => grp.add(levelPart(l, L))); grp.add(roofsPart(L)); if (L.decor.length) grp.add(decorPart(L));
  trees(grp, [{ x: b.x0 - 2.6, z: b.z1 + 1, s: .9, k: L.style === 'tropical' || L.style === 'indian' ? 'palm' : 'broad' }, { x: b.x1 + 2.4, z: b.z0 + 1.5, s: 1, k: L.style === 'classic' ? 'cypress' : 'broad' }]);
  thumbScene.add(grp);
  const H = L.H, size = Math.max(b.w, b.d, H * .9), dist = Math.max(size * 1.55 + 9, H * 2.5 + 6), dir = new T.Vector3(.62, .4, .68).normalize(), tgt = new T.Vector3(b.x, H * .36, b.z);
  thumbCam.position.copy(tgt).addScaledVector(dir, dist); thumbCam.lookAt(tgt);
  sn.position.copy(sunDir).multiplyScalar(size * 3 + 60).add(tgt); sn.target.position.copy(tgt); sn.target.updateMatrixWorld();
  const sc = sn.shadow.camera, e = size * .9 + 8; sc.left = -e; sc.right = e; sc.top = e; sc.bottom = -e; sc.far = size * 8 + 200; sc.updateProjectionMatrix();
  const pr = renderer.getPixelRatio(), cw = canvas.width / pr, ch = canvas.height / pr, tw = Math.min(300, cw), th = Math.min(200, ch, tw / 1.5);
  thumbCam.aspect = tw / th; thumbCam.updateProjectionMatrix();
  const vp = new T.Vector4(); renderer.getViewport(vp);
  renderer.setScissorTest(true); renderer.setViewport(0, 0, tw, th); renderer.setScissor(0, 0, tw, th);
  renderer.shadowMap.needsUpdate = true; renderer.setRenderTarget(null); renderer.render(thumbScene, thumbCam);
  const out = document.createElement('canvas'); out.width = Math.round(tw * pr); out.height = Math.round(th * pr);
  out.getContext('2d').drawImage(canvas, 0, canvas.height - out.height, out.width, out.height, 0, 0, out.width, out.height);
  renderer.setScissorTest(false); renderer.setViewport(vp);
  thumbScene.remove(grp); disposeObj(grp);
  renderer.shadowMap.needsUpdate = true; renderFrame(0); dirty = true;
  return out.toDataURL('image/jpeg', .86);
}

/* ------------------------------------------------------------------ download brief (PNG: 3D snapshot + brief text) */
async function download(btn) {
  btn.disabled = true;
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const Wd = 1800, Hd = 1100, c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    g.fillStyle = '#0a0b0e'; g.fillRect(0, 0, Wd, Hd);
    const imgW = 1060;
    if (threeOK) {
      renderFrame(0); // same task as drawImage, so the drawing buffer is still valid
      const src = renderer.domElement, sr = src.width / src.height, dr = imgW / Hd;
      let sw = src.width, sh = src.height, sx = 0, sy = 0; if (sr > dr) { sw = sh * dr; sx = (src.width - sw) / 2; } else { sh = sw / dr; sy = (src.height - sh) / 2; }
      g.drawImage(src, sx, sy, sw, sh, 0, 0, imgW, Hd);
    } else {
      const gr = g.createLinearGradient(0, 0, 0, Hd); gr.addColorStop(0, '#121722'); gr.addColorStop(1, '#0a0b0e'); g.fillStyle = gr; g.fillRect(0, 0, imgW, Hd);
      g.fillStyle = '#c9a96e'; g.font = 'italic 300 64px "Cormorant Garamond", Georgia, serif'; g.textAlign = 'center'; g.fillText('Your vision', imgW / 2, Hd / 2); g.textAlign = 'left';
    }
    const fade = g.createLinearGradient(imgW - 240, 0, imgW, 0); fade.addColorStop(0, 'rgba(10,11,14,0)'); fade.addColorStop(1, 'rgba(10,11,14,1)'); g.fillStyle = fade; g.fillRect(imgW - 240, 0, 240, Hd);
    const top = g.createLinearGradient(0, 0, 0, 200); top.addColorStop(0, 'rgba(10,11,14,.85)'); top.addColorStop(1, 'rgba(10,11,14,0)'); g.fillStyle = top; g.fillRect(0, 0, imgW, 200);
    g.strokeStyle = 'rgba(201,169,110,.5)'; g.lineWidth = 1; g.strokeRect(28.5, 28.5, Wd - 57, Hd - 57);
    g.font = '500 48px "Cormorant Garamond", Georgia, serif'; let bx = 66;
    for (const [ch, col] of [['B', '#f4efe6'], ['&', '#c9a96e'], ['B', '#f4efe6']]) { g.fillStyle = col; g.fillText(ch, bx, 104); bx += g.measureText(ch).width + 1; }
    g.font = '600 14px Manrope, system-ui, sans-serif'; g.fillStyle = '#c9a96e'; g.fillText('B&B ENTERPRISES  ·  BUILD YOUR VISION', 68, 136);
    const x0 = imgW + 20; let y = 116;
    g.fillStyle = '#c9a96e'; g.font = '600 14px Manrope, system-ui, sans-serif'; g.fillText('YOUR BRIEF', x0, y); y += 60;
    g.fillStyle = '#f4efe6'; g.font = '300 58px "Cormorant Garamond", Georgia, serif'; g.fillText(S.name && S.name.trim() ? `${S.name.trim().split(' ')[0]}’s vision` : 'Your vision', x0, y); y += 34;
    g.fillStyle = 'rgba(201,169,110,.55)'; g.fillRect(x0, y, 80, 1); y += 46;
    for (const [, k, v] of rows().filter(r => r[2])) {
      g.font = '600 12px Manrope, system-ui, sans-serif'; g.fillStyle = '#a7a196'; g.fillText(k.toUpperCase(), x0, y);
      g.font = '400 25px "Cormorant Garamond", Georgia, serif'; g.fillStyle = '#f4efe6';
      const lines = wrap(g, String(v), Wd - x0 - 200 - 70); lines.forEach((ln, i) => g.fillText(ln, x0 + 190, y + 2 + i * 28)); y += Math.max(1, lines.length) * 28 + 13;
      if (y > Hd - 150) break;
    }
    if (areaTxt()) { g.font = '500 15px Manrope, system-ui, sans-serif'; g.fillStyle = '#e6cc98'; g.fillText(`≈ ${areaTxt()} sq ft built-up in this concept — indicative, for discussion only`, x0, Hd - 100); }
    g.font = '400 13px Manrope, system-ui, sans-serif'; g.fillStyle = '#7d776e';
    g.fillText(`Illustrative concept, ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} — not a design, drawing or quotation.`, x0, Hd - 70);
    const a = document.createElement('a'); a.download = 'BnB-brief-' + (S.type || 'vision') + '.png';
    a.href = c.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
    liveEl.textContent = 'Brief downloaded as an image.';
  } finally { btn.disabled = false; }
}
function wrap(g, t, max) { const w = t.split(' '), out = []; let l = ''; for (const x of w) { const s = l ? l + ' ' + x : x; if (g.measureText(s).width > max && l) { out.push(l); l = x; } else l = s; } if (l) out.push(l); return out; }

// small hook for automated QA screenshots (no effect on normal use)
window.__bnbConsult = {
  open, close, go, ready: () => initP,
  set(o) { Object.assign(S, o); save(); renderStep(true); update3D(true); if (o.light && threeOK) applyLight(o.light); },
  light(m) { S.light = m; save(); if (threeOK) applyLight(m); root.querySelectorAll('[data-light]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.light === m))); },
  quality: q => (q ? setQuality(q) : quality),
  perf() { const i = renderer.info; i.autoReset = false; i.reset(); renderer.render(scene, camera); const r = { calls: i.render.calls, tris: i.render.triangles, geos: i.memory.geometries, tex: i.memory.textures, progs: i.programs.length }; i.autoReset = true; dirty = true; return r; },
  thumbs: () => new Promise(r => { if (!thumbQ.length && !thumbBusy) r(); else thumbWait.push(r); }),
  layout: () => { const L = layoutOf(); return { H: L.H, levels: L.levels.map(l => ({ y: l.y, h: l.h, vols: l.vols.map(v => [v.kind, v.roofK, +v.w.toFixed(1), +v.d.toFixed(1)]) })) }; },
  state: () => JSON.parse(JSON.stringify({ S, step })),
  settle() { for (const o of live.values()) if (o.userData.anim) { o.userData.anim.done = true; applyAnim(o, 1); } dying.splice(0).forEach(o => { world.remove(o); disposeObj(o); }); if (camGoal) camGoal.t0 = -1e9; if (renderer) renderer.shadowMap.needsUpdate = true; dirty = true; },
  stats: () => renderer ? { dist: +camera.position.distanceTo(controls.target).toFixed(1), tgt: controls.target.toArray().map(v => +v.toFixed(1)), asp: +camera.aspect.toFixed(2), H: lastLayout && +(+lastLayout.H).toFixed(1), calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geos: renderer.info.memory.geometries, pr: renderer.getPixelRatio(), q: quality, comp: !!composer } : null,
};
