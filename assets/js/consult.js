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
const TIMES = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening'], ['any', 'Any time']];
const QI = Object.fromEntries(Q.map((q, i) => [q.id, i]));
const optLabel = (id, v) => { const q = Q[QI[id]]; const o = q && q.opts && q.opts.find(o => o[0] === v); return o ? o[1] : ''; };
const groupLabel = (g, v) => { const gr = Q[QI.plan].groups.find(x => x[0] === g); const o = gr[2].find(o => o[0] === v); return o ? o[1] : ''; };

/* ------------------------------------------------------------------ state */
const KEY = 'bnb-consult-v1';
let S = { extras: [] }, step = -1;
try { const j = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (j && j.S) { S = Object.assign({ extras: [] }, j.S); step = clamp(j.step | 0, -1, Q.length); } } catch (e) {}
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ S, step })); } catch (e) {} };

function plotFt() {
  const m = { '30x40': [30, 40], '30x50': [30, 50], '40x60': [40, 60], '60x80': [60, 80], 'acre': [200, 218] };
  if (S.plot === 'custom') return [clamp(+S.cw || 40, 15, 1500), clamp(+S.cd || 60, 15, 1500)];
  return m[S.plot] || [40, 60];
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
    if (t.name === 'type') { if (S.floors === 'hr' && S.type !== 'apartment') S.floors = null; }
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
  else if (a === 'restart') { S = { extras: [] }; save(); go(0); }
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
  step = clamp(i, -1, Q.length); save();
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
      <ul class="cx-feats"><li><b>${n}</b><span>quick questions</span></li><li><b>3D</b><span>live model</span></li><li><b>~2</b><span>minutes</span></li></ul>
      <button class="btn cx-begin" type="button" data-act="begin">Begin <span class="arr"></span></button>
      <p class="cx-fine">Illustrative concept only — not a design, drawing or quotation.</p></div>`;
  } else if (step >= n) {
    stepEl.innerHTML = `<b>${Q.length} / ${Q.length}</b> <span>· Complete</span>`;
    h = summaryHTML();
  } else {
    const q = Q[step];
    stepEl.innerHTML = `<b>${String(step + 1).padStart(2, '0')}</b> / ${String(n).padStart(2, '0')} <span>· ${q.label}</span>`;
    h = `<h2 id="cx-title" tabindex="-1">${q.title}</h2>${q.sub ? `<p class="cx-sub">${q.sub}</p>` : ''}`;
    if (q.kind === 'multi') {
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
      h += `<fieldset class="cx-grid${q.id === 'cons' || q.id === 'tier' ? ' one' : ''}"><legend class="sr">${q.label}</legend>${cardsHTML(q.id, opts, 'radio', S[q.id])}</fieldset>`;
      if (q.id === 'plot') h += `<div class="cx-custom" ${S.plot === 'custom' ? '' : 'hidden'}><div class="fld"><label for="cx-cw">Width (ft)</label><input id="cx-cw" name="cw" inputmode="numeric" value="${esc(S.cw)}" placeholder="e.g. 50"></div><span aria-hidden="true">×</span><div class="fld"><label for="cx-cd">Depth (ft)</label><input id="cx-cd" name="cd" inputmode="numeric" value="${esc(S.cd)}" placeholder="e.g. 80"></div></div>`;
    }
    if (q.hint) h += `<p class="cx-hintq"><i aria-hidden="true"></i>In 3D — ${q.hint}</p>`;
  }
  bodyEl.innerHTML = `<div class="cx-pane">${h}</div>`;
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
    ['type', 'Build', optLabel('type', S.type)], ['plot', 'Plot', plotLabel()], ['loc', 'Location', optLabel('loc', S.loc)],
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
  const bits = [optLabel('type', S.type), S.plot && plotLabel(), S.floors && optLabel('floors', S.floors), S.style && optLabel('style', S.style), S.tier && optLabel('tier', S.tier)].filter(Boolean);
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
let T, OrbitControls, RoomEnvironment;
let renderer, scene, camera, controls, sun, world, grass, threeOK = null, initP = null, raf = 0, dirty = true, autoT = 0, camGoal = null, userActive = false;
let lastLayout = null, lastFrameSig = '';
const live = new Map(), dying = [];
const M = {}, G = {};
const mobile = matchMedia('(max-width: 860px), (pointer: coarse)').matches;

function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}
function showFallback() {
  threeOK = false; fbEl.hidden = false; loadEl.hidden = true; canvas.hidden = true;
  root.classList.add('no3d');
  root.querySelector('.cx-hint').hidden = true;
}
function init3D() {
  if (initP) return initP;
  initP = (async () => {
    if (!webglAvailable()) { showFallback(); return; }
    try {
      T = await import(VENDOR + 'three.module.min.js');
      ({ OrbitControls } = await import(VENDOR + 'OrbitControls.js'));
      ({ RoomEnvironment } = await import(VENDOR + 'RoomEnvironment.js'));
      setupScene();
      threeOK = true;
      setTimeout(() => loadEl.classList.add('done'), 120);
    } catch (err) { console.warn('3D preview unavailable:', err && err.message); showFallback(); }
  })();
  return initP;
}

function keep(g) { g.userData.keep = true; return g; }
function std(key, p) { if (!M[key]) { const env = p.envI; delete p.envI; M[key] = new T.MeshStandardMaterial(p); if (env) { M[key].envMap = scene.environment; M[key].envMapIntensity = env; } } return M[key]; }
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function boxUV(g, scale = 2.4) { // world-space box projection so textures keep a constant scale
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (ax > .5) uv.setXY(i, z / scale, y / scale); else if (ay > .5) uv.setXY(i, x / scale, z / scale); else uv.setXY(i, x / scale, y / scale);
  }
  uv.needsUpdate = true; return g;
}
// box with its base at y
function B(w, h, d, mat, x = 0, y = 0, z = 0, cast = true) {
  const g = new T.BoxGeometry(w, h, d);
  if (mat.bumpMap) { g.translate(x, y + h / 2, z); boxUV(g); g.translate(-x, -y - h / 2, -z); }
  const m = new T.Mesh(g, mat); m.position.set(x, y + h / 2, z); m.castShadow = cast; m.receiveShadow = true; return m;
}
// instanced unit boxes: [x, yCentre, z, sx, sy, sz, rotY]
function inst(list, mat, geo) {
  if (!list.length) return null;
  geo = geo || G.unit || (G.unit = keep(new T.BoxGeometry(1, 1, 1)));
  const im = new T.InstancedMesh(geo, mat, list.length), m4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3(), e = new T.Euler();
  list.forEach((a, i) => { p.set(a[0], a[1], a[2]); s.set(a[3], a[4], a[5]); e.set(0, a[6] || 0, 0); q.setFromEuler(e); m4.compose(p, q, s); im.setMatrixAt(i, m4); });
  im.computeBoundingSphere(); im.castShadow = false; im.receiveShadow = false; return im;
}
function canvasTex(w, h, draw, color = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (color) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
}

function setupScene() {
  renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.6 : 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); showFallback(); });

  scene = new T.Scene();
  const BG = 0x0b0e15;
  scene.background = new T.Color(BG);
  scene.fog = new T.Fog(BG, 80, 420);
  const pm = new T.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.32;
  pm.dispose();
  camera = new T.PerspectiveCamera(36, 1, 0.3, 4000);
  camera.position.set(34, 22, 40);

  // sky dome: midnight overhead fading into a warm champagne horizon
  const sky = new T.Mesh(new T.SphereGeometry(2000, 32, 16), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T.Color(0x070a12) }, mid: { value: new T.Color(0x141a28) }, hor: { value: new T.Color(0x4a3a2a) } },
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 hor; varying vec3 vp; void main(){ float h = vp.y; vec3 c = mix(hor, mid, smoothstep(-0.02, 0.16, h)); c = mix(c, top, smoothstep(0.16, 0.7, h)); gl_FragColor = vec4(c, 1.0); }'
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  scene.add(new T.HemisphereLight(0x9fb2d6, 0x2a2318, 0.75));
  sun = new T.DirectionalLight(0xffe0b5, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const fill = new T.DirectionalLight(0x7b8fc4, 0.55); fill.position.set(-60, 30, -40); scene.add(fill);

  // terrain: gentle rolling ground with grass colour variation, flat around the plot
  const tg = new T.PlaneGeometry(1600, 1600, 140, 140); tg.rotateX(-Math.PI / 2);
  const pos = tg.attributes.position, col = new Float32Array(pos.count * 3), c1 = new T.Color(0x1b2618), c2 = new T.Color(0x2b3a22), c3 = new T.Color(0x3a3a26), tmp = new T.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z);
    const n = Math.sin(x * .021) * Math.cos(z * .017) + Math.sin((x + z) * .0093) * 1.4 + Math.sin(x * .052 + 1.3) * Math.sin(z * .047) * .35;
    const f = clamp((r - 140) / 260, 0, 1);
    pos.setY(i, n * 6 * f * f - 0.02);
    const v = .5 + .5 * Math.sin(x * .11 + Math.cos(z * .09) * 2) * Math.cos(z * .07);
    tmp.copy(c1).lerp(c2, v).lerp(c3, clamp(Math.sin(x * .013 + z * .011) * .5, 0, .5));
    col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
  }
  tg.setAttribute('color', new T.BufferAttribute(col, 3)); tg.computeVertexNormals();
  const ground = new T.Mesh(tg, new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
  ground.receiveShadow = true; scene.add(ground);

  world = new T.Group(); scene.add(world);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07; controls.enablePan = false;
  controls.minDistance = 6; controls.maxDistance = 600; controls.maxPolarAngle = 1.42; controls.minPolarAngle = 0.25;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.55; controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.9;
  controls.addEventListener('start', () => { userActive = true; camGoal = null; controls.autoRotate = false; clearTimeout(autoT); });
  controls.addEventListener('end', () => { userActive = false; clearTimeout(autoT); if (!reduce) autoT = setTimeout(() => { controls.autoRotate = true; }, 5000); });
  controls.addEventListener('change', () => { dirty = true; });
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', e => { // keyboard orbit / zoom when the canvas has focus
    const k = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
    if (k) { e.preventDefault(); e.stopPropagation(); const off = camera.position.clone().sub(controls.target); const sp = new T.Spherical().setFromVector3(off); sp.theta += k[0]; sp.phi = clamp(sp.phi - k[1], controls.minPolarAngle, controls.maxPolarAngle); off.setFromSpherical(sp); camera.position.copy(controls.target).add(off); controls.autoRotate = false; camGoal = null; dirty = true; }
    if (e.key === '+' || e.key === '=' || e.key === '-') { e.preventDefault(); const off = camera.position.clone().sub(controls.target).multiplyScalar(e.key === '-' ? 1.12 : 0.89); camera.position.copy(controls.target).add(off); camGoal = null; dirty = true; }
  });

  new ResizeObserver(resize).observe(stageEl); resize();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (isOpen) start(); });
  buildGrass();
}
function resize() {
  if (!renderer) return;
  const w = stageEl.clientWidth, h = stageEl.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true;
  if (lastLayout && camera) frame(lastLayout, true);
}
function start() { if (!threeOK || raf) return; dirty = true; let last = performance.now(); const loop = now => { raf = requestAnimationFrame(loop); tick(now, Math.min(0.05, (now - last) / 1000)); last = now; }; raf = requestAnimationFrame(loop); }
function stop() { cancelAnimationFrame(raf); raf = 0; }

const ease = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c = 1.2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
function applyAnim(o, k) {
  const a = o.userData.anim.type, v = Math.max(0.0001, k);
  if (a === 'rise') o.scale.set(1, v, 1);
  else if (a === 'pop') o.scale.setScalar(v);
  else if (a === 'grow') o.scale.set(v, 1, v);
  o.visible = k > 0.002;
}
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
    if (camGoal.phi != null) { const sp = new T.Spherical().setFromVector3(dir); sp.phi = camGoal.fphi + (camGoal.phi - camGoal.fphi) * k; dir.setFromSpherical(sp); }
    camera.position.copy(controls.target).addScaledVector(dir, d);
    if (t >= 1) camGoal = null;
    dirty = true;
  }
  controls.update(dt);
  if (anim) renderer.shadowMap.needsUpdate = true;
  if (anim || dirty || controls.autoRotate || userActive) { renderer.render(scene, camera); dirty = false; }
}
function disposeObj(o) { o.traverse(c => { if (c.geometry && !c.geometry.userData.keep) c.geometry.dispose(); }); }

// keyed scene diff: unchanged parts stay, new parts animate in (floors stagger upward), removed parts animate out
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
    const inst0 = reduce || p.instant;
    o.userData.anim = { type: p.anim || 'pop', t0: now + delay, dur: inst0 ? 1 : (p.dur || (p.floor != null ? 620 : 700)), done: inst0 };
    applyAnim(o, inst0 ? 1 : 0);
    world.add(o); live.set(p.key, o);
  }
  for (const [k, o] of live) if (!seen.has(k)) {
    live.delete(k);
    o.userData.anim = { type: o.userData.anim.type, t0: now, dur: reduce ? 1 : 320 };
    dying.push(o);
  }
  renderer.shadowMap.needsUpdate = true; dirty = true;
}

/* ---------- palettes & materials */
const PAL = {
  model: { wall: 0xe8e2d6, base: 0xcfc6b5, roof: 0xe0d9cc, trim: 0xd6cdbd, accent: 0xbdb3a1, frame: 0x8f877b, pitched: false },
  modern: { wall: 0xf0ebe2, base: 0x3a3a3d, roof: 0xe6dfd3, trim: 0x2a2a2d, accent: 0x8f5d38, frame: 0x1f1f22, pitched: false },
  glass: { wall: 0x2e3136, base: 0x1f2125, roof: 0x2a2c30, trim: 0x18191c, accent: 0x55606b, frame: 0x131416, pitched: false },
  classic: { wall: 0xebdcc0, base: 0xd6c4a1, roof: 0x4c3d36, trim: 0xfbf7ef, accent: 0xf2ebdd, frame: 0xfbf7ef, pitched: 'hip' },
  tropical: { wall: 0xdacdb5, base: 0x6a6157, roof: 0x34312e, trim: 0x7a4e2d, accent: 0x7d5030, frame: 0x3e2b1c, pitched: 'low' },
  indian: { wall: 0xd49c5d, base: 0x9b5a37, roof: 0xa8472b, trim: 0xead8b3, accent: 0x7d3f22, frame: 0x5c3319, pitched: 'gable' },
};
let blockBump = null, panelTex = null, cityTex = null;
function wallMat(style, cons, ghost) {
  if (ghost) return std('ghost', { color: 0xe9e1d2, roughness: .6, transparent: true, opacity: .3, depthWrite: false });
  const P = PAL[style], blk = cons === 'block';
  if (blk && !blockBump) blockBump = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a9a9a'; for (let r = 0; r < 8; r++) { g.fillRect(0, r * 32, w, 2); const off = r % 2 ? 0 : 64; for (let c = 0; c < 2; c++) g.fillRect(off + c * 128, r * 32, 2, 32); } }, false);
  return std(`wall-${style}-${blk ? 'b' : 's'}`, { color: P.wall, roughness: style === 'glass' ? .55 : .88, metalness: style === 'glass' ? .2 : 0, bumpMap: blk ? blockBump : null, bumpScale: blk ? .45 : 1 });
}
const mat = {
  base: s => std('base-' + s, { color: PAL[s].base, roughness: .85 }),
  roof: s => std('roof-' + s, { color: PAL[s].roof, roughness: PAL[s].pitched ? .78 : .9, flatShading: !!PAL[s].pitched }),
  trim: s => std('trim-' + s, { color: PAL[s].trim, roughness: .7 }),
  accent: s => std('acc-' + s, { color: PAL[s].accent, roughness: .7 }),
  frame: s => std('frame-' + s, { color: PAL[s].frame, roughness: .5, metalness: s === 'glass' ? .6 : 0 }),
  gold: () => std('gold', { color: 0xd4b47a, roughness: .28, metalness: 1, emissive: 0x4a3518, emissiveIntensity: .35, envI: 1.6 }),
  glow: tier => std('glow-' + tier, { color: 0x2a2620, roughness: .15, metalness: .3, emissive: 0xffaa5a, emissiveIntensity: { standard: .36, premium: .46, luxury: .58 }[tier] || .38, envI: .8 }),
  dark: () => std('darkglass', { color: 0x2c3c50, roughness: .1, metalness: .7, emissive: 0x0b121c, emissiveIntensity: 1, envI: 1.2 }),
  curtain: tier => std('curtain-' + tier, { color: 0x2f3438, roughness: .1, metalness: .75, emissive: 0xffbf73, emissiveIntensity: tier === 'luxury' ? .42 : tier === 'premium' ? .34 : .27, envI: 1.1 }),
  curtainD: () => std('curtainD', { color: 0x30455c, roughness: .06, metalness: .9, emissive: 0x0d1622, emissiveIntensity: .6, envI: 1.4 }),
  rail: () => std('rail', { color: 0xb9d3dd, roughness: .05, metalness: .2, transparent: true, opacity: .32, depthWrite: false }),
  conc: () => std('conc', { color: 0x8d8981, roughness: .95 }),
  soil: () => std('soil', { color: 0x5b4a37, roughness: 1 }),
  lawn: () => std('lawn', { color: 0x3f5a2c, roughness: 1 }),
  pave: () => std('pave', { color: 0x9a9284, roughness: .9 }),
  asph: () => std('asph', { color: 0x1d1e21, roughness: .95 }),
  water: () => std('water', { color: 0x1a8bab, roughness: .05, metalness: .1, emissive: 0x0e6f8c, emissiveIntensity: .9, envI: 1.2 }),
  leaf: k => std('leaf' + (k % 4), { color: [0x2f4a25, 0x3a5a2a, 0x2a4230, 0x4a6a32][k % 4], roughness: .9, flatShading: true }),
  trunk: () => std('trunk', { color: 0x4a3626, roughness: 1 }),
  wood: () => std('wood', { color: 0x8a5a36, roughness: .75 }),
  steel: () => std('steel', { color: 0xb8bcc2, roughness: .35, metalness: .9, envI: 1.2 }),
  solar: () => std('solar', { color: 0xffffff, roughness: .2, metalness: .5, emissive: 0x0a1630, emissiveIntensity: .5, map: panelTex || (panelTex = canvasTex(128, 192, (g, w, h) => { g.fillStyle = '#1b2a55'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8496cc'; g.lineWidth = 3; for (let x = 0; x <= w; x += w / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } })) }),
  black: () => std('black', { color: 0x050507, roughness: 1 }),
  theatre: () => std('theatre', { color: 0x10122a, emissive: 0x6d74ff, emissiveIntensity: 1.2, roughness: .4 }),
  lamp: () => std('lamp', { color: 0xfff1d6, emissive: 0xffd28f, emissiveIntensity: 2 }),
  edge: () => M.edge || (M.edge = new T.LineBasicMaterial({ color: 0xd8b97e, transparent: true, opacity: .9 })),
  peg: () => std('peg', { color: 0xc9a96e, emissive: 0xc9a96e, emissiveIntensity: .5, roughness: .4, metalness: .6 }),
  city: () => M.city || (M.city = new T.MeshStandardMaterial({ color: 0x151a24, roughness: .9, emissive: 0xffffff, emissiveIntensity: .6, emissiveMap: cityTex || (cityTex = canvasTex(64, 128, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const r = rng(7); for (let y = 4; y < h; y += 8) for (let x = 3; x < w; x += 8) if (r() < .33) { g.fillStyle = r() < .7 ? '#ffcf8f' : '#cfe3ff'; g.globalAlpha = .35 + r() * .5; g.fillRect(x, y, 4, 4); } })) })),
};

/* ---------- small builders */
function tree(x, z, s, kind = 0, palm = false) {
  const g = new T.Group(); g.position.set(x, .12, z);
  if (palm) {
    const tr = new T.Mesh(G.palmT || (G.palmT = keep(new T.CylinderGeometry(.12, .2, 5, 6).translate(0, 2.5, 0))), mat.trunk()); tr.castShadow = true; tr.rotation.z = .08; g.add(tr);
    const lf = G.palmL || (G.palmL = keep(new T.BoxGeometry(.5, .06, 2.4).translate(0, 0, 1.2)));
    for (let i = 0; i < 7; i++) { const l = new T.Mesh(lf, mat.leaf(kind)); l.position.set(.4, 4.95, 0); l.rotation.set(.45, i / 7 * Math.PI * 2, 0, 'YXZ'); l.castShadow = true; g.add(l); }
  } else {
    const tr = new T.Mesh(G.trunk || (G.trunk = keep(new T.CylinderGeometry(.13, .2, 2.2, 6).translate(0, 1.1, 0))), mat.trunk()); tr.castShadow = true; g.add(tr);
    const cg = G['can' + (kind % 2)] || (G['can' + (kind % 2)] = keep(new T.IcosahedronGeometry(1.5, kind % 2 ? 0 : 1)));
    const c = new T.Mesh(cg, mat.leaf(kind)); c.position.y = 3; c.scale.set(1, 1.15, 1); c.castShadow = true; g.add(c);
  }
  g.scale.setScalar(s); return g;
}
function car(color, x, z, rot = 0) {
  const g = new T.Group(); g.position.set(x, .12, z); g.rotation.y = rot;
  const body = std('car' + color, { color, roughness: .25, metalness: .6, envI: 1.3 });
  g.add(B(1.82, .62, 4.4, body, 0, .3, 0));
  g.add(B(1.6, .5, 2.2, mat.dark(), 0, .92, -.25));
  const wg = G.wheel || (G.wheel = keep(new T.CylinderGeometry(.34, .34, .25, 12).rotateZ(Math.PI / 2)));
  for (const [wx, wz] of [[-.86, 1.35], [.86, 1.35], [-.86, -1.35], [.86, -1.35]]) { const w = new T.Mesh(wg, mat.black()); w.position.set(wx, .34, wz); g.add(w); }
  return g;
}
function edges(mesh) { const l = new T.LineSegments(new T.EdgesGeometry(mesh.geometry), mat.edge()); l.position.copy(mesh.position); return l; }

/* ---------- layout: everything in metres, plot centred on the origin, road on +z */
function layoutOf() {
  const [W, D] = plotFt(); const pw = W * FT, pd = D * FT;
  const type = S.type || null, style = S.style || 'model', tier = S.tier || 'standard', cons = S.cons || 'advise';
  const ex = new Set(S.extras || []), park = S.park || 'none';
  const ghost = type === 'unsure' && !S.style;
  const fh = { villa: 3.3, apartment: 3.05, commercial: 4.0, row: 3.2, farm: 3.6, unsure: 3.3 }[type] || 3.2;
  const defF = { villa: 2, apartment: 4, commercial: 3, row: 2, farm: 1, unsure: 2 }[type] || 2;
  const nF = { g1: 2, g2: 3, g3: 4, hr: 16 }[S.floors] || defF;
  const pitched = PAL[style].pitched && !ghost && type !== 'commercial' && !(type === 'apartment' && nF > 4) ? PAL[style].pitched : false;
  const L = { pw, pd, type, style, tier, cons, ex, park, ghost, fh, nF, pitched, floors: [] };
  if (!type) { L.H = 0; return L; }
  let side = clamp(pw * .08, .9, 5), front = clamp(pd * .14, 1.5, 10), rear = clamp(pd * .08, 1, 6);
  const smallW = pw < 14;
  const stilt = park === 'three' && (smallW || type === 'apartment' || type === 'commercial');
  const carport = park === 'cov' || (park === 'three' && !stilt);
  if (carport) front = Math.max(front, 6.4);
  if (park === 'base') front = Math.max(front, 7.6);
  if (ex.has('wall')) { side = Math.max(side, 1.1); rear = Math.max(rear, 1.3); }
  const roofFlat = !pitched || ex.has('terrace');
  let poolMode = null;
  if (ex.has('pool')) poolMode = (type === 'commercial' || (type === 'apartment' && (nF > 4 || pd < 25)) || (pd < 16 && type !== 'farm' && type !== 'row')) ? 'roof' : 'ground';
  if (poolMode === 'ground' && type !== 'farm') rear = Math.max(rear, Math.min(6.5, pd * .3));
  if (ex.has('servant') && type !== 'farm') rear = Math.max(rear, Math.min(5, pd * .3));
  const cap = { villa: [20, 16], apartment: [36, 22], commercial: [44, 30], row: [56, 14], farm: [26, 12], unsure: [18, 14] }[type];
  const bw = clamp(Math.min(pw - 2 * side, cap[0]), 4, 999), bd = clamp(Math.min(pd - front - rear, cap[1]), 4, 999);
  const bz = (rear - front) / 2, bx = 0, plinth = 0.45;
  Object.assign(L, { side, front, rear, stilt, carport, poolMode, roofFlat, bw, bd, bx, bz, plinth });
  let y = plinth;
  if (stilt) { L.floors.push({ i: 0, w: bw, d: bd, x: bx, z: bz, y, h: 2.9, stilt: true, lvl: -1 }); y += 2.9; }
  const asym = ['model', 'modern', 'glass', 'tropical'].includes(style) && !ghost;
  for (let i = 0; i < nF; i++) {
    let w = bw, d = bd, x = bx, z = bz, h = fh;
    if (type === 'villa' || type === 'unsure') {
      if (i >= 1) { if (asym) { w = bw * .8; d = bd * .86; x = bx + (i % 2 ? -1 : 1) * bw * .1; z = bz - bd * .07; } else { w = bw * .94; d = bd * .9; z = bz - bd * .05; } }
    } else if (type === 'commercial') { if (i === 0) h = 4.8; else { w = bw * .88; d = bd * .86; z = bz - bd * .04; } }
    else if (type === 'farm') { if (i === 0) { d = bd * .72; z = bz - bd * .14; } else { w = bw * .45; d = bd * .62; x = bx + bw * .2; z = bz - bd * .16; } }
    L.floors.push({ i: L.floors.length, w, d, x, z, y, h, lvl: i });
    y += h;
  }
  L.top = L.floors[L.floors.length - 1];
  L.roofY = y;
  L.H = y + (pitched ? Math.min(L.top.w, L.top.d) * .3 : 1);
  if (type === 'row') L.units = clamp(Math.round(bw / 5.2), 2, 8);
  L.area = L.floors.filter(f => !f.stilt).reduce((a, f) => a + f.w * f.d, 0) / (FT * FT) + (type === 'farm' ? 64 / (FT * FT) : 0);
  return L;
}

/* ---------- building parts */
function winCfg(style, tier) {
  const big = tier === 'luxury' ? 1.22 : tier === 'premium' ? 1.08 : 1;
  return {
    model: { sp: 3.0, ww: 1.5 * big, wh: 1.4, sill: .9 },
    modern: { ribbon: true, wh: 1.45 * Math.min(big, 1.15), sill: .85 },
    glass: { curtain: true },
    classic: { sp: 2.4, ww: .95 * Math.min(big, 1.1), wh: 1.9, sill: .7, frame: true },
    tropical: { sp: 3.3, ww: 2.0 * big, wh: 1.75, sill: .55, frame: true, louvre: true },
    indian: { sp: 2.7, ww: 1.1 * big, wh: 1.5, sill: .85, frame: true, chhajja: true },
  }[style];
}
function facadeWindows(g, f, L, w, d, h, ox, oz, seedKey) {
  const style = L.ghost ? 'model' : L.style, cfg = winCfg(style, L.tier), r = rng(hash(seedKey + '|' + f.i));
  const lit = [], dk = [], fr = [], mull = [];
  const faces = [[w, 0, d / 2, 0, 1], [w, 0, -d / 2, 0, -1], [d, w / 2, 0, 1, 1], [d, -w / 2, 0, 1, -1]];
  for (const [Lf, fx, fz, axis, sgn] of faces) {
    const put = (c, ww, wh, yc, depth, list) => {
      if (axis === 0) list.push([ox + fx + c, yc, oz + fz + sgn * .04, ww, wh, depth]);
      else list.push([ox + fx + sgn * .04, yc, oz + c, depth, wh, ww]);
    };
    if (cfg.curtain) {
      const wh = h - .42, yc = .1 + wh / 2;
      put(0, Lf - .3, wh, yc, .1, r() < .38 ? lit : dk);
      const n = Math.max(2, Math.round(Lf / 1.5));
      for (let k = 1; k < n; k++) put(-Lf / 2 + .15 + (Lf - .3) * k / n, .07, wh, yc, .16, mull);
      continue;
    }
    if (cfg.ribbon) {
      const ww = Lf - 1.4; if (ww < 1) continue;
      put(0, ww, cfg.wh, cfg.sill + cfg.wh / 2, .1, r() < .6 ? lit : dk);
      put(0, ww + .2, cfg.wh + .2, cfg.sill + cfg.wh / 2, .06, fr);
      continue;
    }
    const n = Math.max(1, Math.floor((Lf - .6) / cfg.sp)), stp = Lf / n;
    for (let k = 0; k < n; k++) {
      const c = -Lf / 2 + stp * (k + .5), yc = cfg.sill + cfg.wh / 2, ww = Math.min(cfg.ww, stp - .5);
      if (ww < .4) continue;
      put(c, ww, cfg.wh, yc, .1, r() < .58 ? lit : dk);
      if (cfg.frame) put(c, ww + .22, cfg.wh + .22, yc, .06, fr);
      if (cfg.louvre && r() < .5) for (let s = -2; s <= 2; s++) put(c + s * ww / 5, .05, cfg.wh, yc, .2, mull);
    }
  }
  const cur = !!cfg.curtain;
  [[lit, cur ? mat.curtain(L.tier) : mat.glow(L.tier)], [dk, cur ? mat.curtainD() : mat.dark()], [fr, mat.frame(style)], [mull, L.tier === 'luxury' && style === 'glass' ? mat.gold() : mat.frame(style)]].forEach(([l, m]) => { const im = inst(l, m); if (im) g.add(im); });
  if (cfg.chhajja) g.add(B(w + 1.0, .1, d + 1.0, mat.trim(style), ox, cfg.sill + cfg.wh + .12, oz));
}

function floorPart(f, L) {
  const g = new T.Group(); g.position.set(0, f.y, 0);
  const st = L.ghost ? 'model' : L.style, wm = wallMat(st, L.cons, L.ghost);
  if (f.stilt) { // open stilt parking level: columns, core, cars
    const cols = [], nx = Math.max(2, Math.round(f.w / 4.5)), nz = Math.max(2, Math.round(f.d / 5));
    for (let a = 0; a <= nx; a++) for (let b = 0; b <= nz; b++) cols.push([f.x - f.w / 2 + .25 + (f.w - .5) * a / nx, f.h / 2, f.z - f.d / 2 + .25 + (f.d - .5) * b / nz, .4, f.h, .4]);
    const im = inst(cols, mat.conc()); im.castShadow = true; g.add(im);
    g.add(B(f.w - .6, .04, f.d - .6, mat.asph(), f.x, 0, f.z, false));
    g.add(B(Math.min(4, f.w * .35), f.h - .3, Math.min(4, f.d * .3), wm, f.x + f.w * .28, 0, f.z - f.d * .3));
    const nc = clamp(Math.floor((f.w - 1) / 2.8), 2, 4), cc = [0xd9c39a, 0xeeeae2, 0x1c1c1f, 0x6d7480];
    for (let k = 0; k < nc; k++) { const c = car(cc[k], f.x - f.w / 2 + 1.5 + k * 2.75, f.z + f.d * .2, 0); c.position.y = .04; g.add(c); }
    g.add(B(f.w + .2, .26, f.d + .2, L.tier === 'luxury' ? mat.gold() : mat.trim(st), f.x, f.h - .26, f.z));
    return g;
  }
  const units = L.type === 'row' ? L.units : 1;
  const slabM = L.ghost ? mat.trim('model') : L.tier === 'luxury' ? mat.gold() : L.tier === 'premium' ? mat.base(st) : mat.trim(st);
  for (let u = 0; u < units; u++) {
    let w = f.w, x = f.x, z = f.z;
    if (units > 1) { w = f.w / units - .12; x = f.x - f.w / 2 + (u + .5) * f.w / units; z = f.z + (u % 2 ? -.6 : .6); }
    const wall = B(w, f.h - .24, f.d, wm, x, 0, z); g.add(wall);
    if (L.ghost) { wall.castShadow = false; g.add(edges(wall)); }
    g.add(B(w + .24, .24, f.d + .24, slabM, x, f.h - .24, z));
    if (!L.ghost) facadeWindows(g, f, L, w, f.d, f.h, x, z, L.style + u);
    // balconies: every apartment floor; upper floors of premium / luxury homes
    if (f.lvl >= 1 && L.type !== 'commercial' && (L.type === 'apartment' || L.tier !== 'standard')) {
      const bwid = w * (L.type === 'apartment' ? .72 : .5), fz = z + f.d / 2;
      g.add(B(bwid, .18, 1.3, slabM, x, 0, fz + .65));
      if (L.tier === 'standard') g.add(B(bwid, .95, .14, wm, x, .18, fz + 1.23));
      else { g.add(B(bwid, 1.0, .05, mat.rail(), x, .18, fz + 1.27, false)); g.add(B(bwid, .05, .08, L.tier === 'luxury' ? mat.gold() : mat.frame(st), x, 1.18, fz + 1.27)); }
    }
    // premium timber / luxury gold feature fin on the ground-floor front
    if (!L.ghost && f.lvl === 0 && L.tier !== 'standard' && st !== 'glass' && units === 1) g.add(B(Math.min(2.4, w * .22), f.h - .3, .12, L.tier === 'luxury' ? mat.gold() : mat.accent(st), x + w * .34, 0, z + f.d / 2 + .06));
  }
  // portico columns (classic / Indian) and farmhouse verandah
  if (!L.ghost && f.lvl === 0 && (st === 'classic' || st === 'indian' || L.type === 'farm') && ['villa', 'farm', 'unsure'].includes(L.type)) {
    const vw = L.type === 'farm' ? f.w * .62 : Math.min(f.w * .55, 7), vx = L.type === 'farm' ? f.x + f.w * .17 : f.x, vz = f.z + f.d / 2 + 1.4, n = Math.max(2, Math.round(vw / 2.4));
    const cg = G.col || (G.col = keep(new T.CylinderGeometry(.16, .19, 1, 12).translate(0, .5, 0)));
    const cm = st === 'indian' || st === 'tropical' ? mat.wood() : mat.trim(st === 'model' ? 'classic' : st);
    for (let k = 0; k <= n; k++) { const c = new T.Mesh(cg, cm); c.scale.y = f.h - .3; c.position.set(vx - vw / 2 + vw * k / n, 0, vz + 1.1); c.castShadow = true; g.add(c); }
    g.add(B(vw + .8, .28, 3.1, st === 'classic' ? mat.trim('classic') : mat.roof(st), vx, f.h - .3, vz + .1));
    g.add(B(vw + .6, .12, 3, mat.pave(), vx, -.12, vz + .1, false));
  }
  if (f.lvl === 0 && L.type === 'farm' && !L.ghost) { // L-shaped wing
    const wx = f.x - f.w / 2 + 4, wz = f.z + f.d / 2 + 3.6;
    g.add(B(8, f.h - .24, 8, wm, wx, 0, wz));
    facadeWindows(g, { i: 99 }, L, 8, 8, f.h, wx, wz, 'wing');
    g.add(B(8.4, .24, 8.4, slabM, wx, f.h - .24, wz));
  }
  if (f.lvl === 0 && L.ex.has('theatre') && !L.ghost) g.add(B(.08, Math.min(1.7, f.h - 1), f.d * .55, mat.theatre(), f.x - f.w / 2 - .06, .7, f.z - f.d * .1, false));
  return g;
}

function gableGeo(W, D, hr) { // ridge along x (length W), spans z (width D)
  const s = new T.Shape(); s.moveTo(-D / 2, 0); s.lineTo(D / 2, 0); s.lineTo(0, hr); s.lineTo(-D / 2, 0);
  const g = new T.ExtrudeGeometry(s, { depth: W, bevelEnabled: false }); g.translate(0, 0, -W / 2); g.rotateY(Math.PI / 2); return g;
}
function addPitched(g, L, st, w, d, x, y, z, info, rowUnit) {
  const kind = L.pitched, ov = kind === 'low' ? 1.5 : .7;
  if (kind === 'hip') {
    const hr = Math.min(w, d) * .32, geo = new T.CylinderGeometry(.06, Math.SQRT1_2, 1, 4, 1); geo.rotateY(Math.PI / 4); geo.translate(0, .5, 0);
    const m = new T.Mesh(geo, mat.roof(st)); m.scale.set(w + ov * 2, hr, d + ov * 2); m.position.set(x, y + .35, z); m.castShadow = m.receiveShadow = true; g.add(m);
    g.add(B(w + .5, .35, d + .5, mat.trim(st), x, y, z)); // cornice
    const half = (d + ov * 2) / 2; info.slope = { x, z, y: y + .35, ang: Math.atan2(hr, half), run: half, w: (w + ov * 2) * .4 };
  } else {
    const W = w + ov * 2, D = d + ov * 2, hr = rowUnit ? W * (kind === 'low' ? .17 : .34) : D * (kind === 'low' ? .17 : .34);
    const geo = rowUnit ? gableGeo(D, W, hr).rotateY(Math.PI / 2) : gableGeo(W, D, hr);
    const m = new T.Mesh(geo, mat.roof(st)); m.position.set(x, y + .2, z); m.castShadow = m.receiveShadow = true; g.add(m);
    g.add(B(w + .3, .2, d + .3, mat.trim(st), x, y, z));
    if (!rowUnit) info.slope = { x, z, y: y + .2, ang: Math.atan2(hr, D / 2), run: D / 2, w: W * .66 };
  }
}
function roofPart(L) {
  const g = new T.Group(), t = L.top, st = L.ghost ? 'model' : L.style, y = L.roofY, ex = L.ex;
  const units = L.type === 'row' ? L.units : 1, info = { flatZones: [], slope: null };
  for (let u = 0; u < units; u++) {
    let w = t.w, x = t.x, z = t.z; const d = t.d;
    if (units > 1) { w = t.w / units - .12; x = t.x - t.w / 2 + (u + .5) * t.w / units; z = t.z + (u % 2 ? -.6 : .6); }
    const pitched = !!L.pitched;
    const terraceCut = pitched && ex.has('terrace') && units === 1; // flat front terrace + pitched roof over the rear
    if (!pitched || terraceCut) {
      const pd = terraceCut ? d * .4 : d, pz = terraceCut ? z + d / 2 - pd / 2 : z;
      if (!terraceCut) g.add(B(w + .1, .25, d + .1, mat.roof(st), x, y, z));
      const tt = .18;
      if (st !== 'glass') for (const [a, b, px, pz2] of [[w, tt, x, pz + pd / 2 - tt / 2], [w, tt, x, pz - pd / 2 + tt / 2], [tt, pd, x - w / 2 + tt / 2, pz], [tt, pd, x + w / 2 - tt / 2, pz]]) {
        const p = B(a, .9, b, wallMat(st, L.cons, L.ghost), px, y, pz2); g.add(p); if (L.ghost) g.add(edges(p));
      }
      if (st === 'glass') {
        g.add(B(w + 1.6, .22, d + 1.6, mat.frame(st), x, y + 3.2, z));
        g.add(B(w + 1.66, .07, d + 1.66, L.tier === 'luxury' ? mat.gold() : mat.frame(st), x, y + 3.42, z));
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(B(.12, 3.2, .12, mat.frame(st), x + sx * (w / 2 - .2), y, z + sz * (d / 2 - .2)));
        g.add(B(w, 1.0, .04, mat.rail(), x, y + .25, z + d / 2 - .1, false));
      }
      if (st === 'modern' && !ex.has('solar') && units === 1) { // roof pergola
        const sl = []; for (let k = 0; k < 9; k++) sl.push([x - w * .2 + (k - 4) * .45, y + 2.9, z - d * .15, .12, .12, d * .45]);
        const im = inst(sl, mat.wood()); im.castShadow = true; g.add(im);
        for (const sx of [-1, 1]) g.add(B(.14, 2.9, .14, mat.frame(st), x - w * .2 + sx * 1.8, y, z + d * .07));
      }
      info.flatZones.push({ x, z: pz, w, d: pd, y: y + .25 });
      if (terraceCut) addPitched(g, L, st, w, d * .6, x, y, z - d / 2 + d * .3, info);
    } else addPitched(g, L, st, w, d, x, y, z, info, units > 1);
  }
  if (L.type === 'apartment' && !L.pitched) g.add(B(4, 3, 4, wallMat(st, L.cons, L.ghost), t.x, y, t.z - t.d / 2 + 2.6)); // lift / stair headroom
  if (L.type === 'commercial') { const f0 = L.floors[L.stilt ? 1 : 0]; g.add(B(f0.w * .7, .5, .3, L.tier === 'luxury' ? mat.gold() : mat.lamp(), f0.x, f0.y + 4.0, f0.z + f0.d / 2 + .2, false)); }
  if (L.tier === 'luxury' && !L.ghost && units === 1) g.add(B(t.w + .3, .06, t.d + .3, mat.lamp(), t.x, y - .32, t.z, false)); // cove light
  g.userData.info = info;
  return g;
}

/* ---------- site parts */
function plotPart(L) {
  const g = new T.Group(), { pw, pd } = L;
  g.add(B(pw, .12, pd, mat.soil(), 0, 0, 0, false));
  const e = .09, gm = mat.peg();
  g.add(B(pw, .05, e, gm, 0, .12, pd / 2, false), B(pw, .05, e, gm, 0, .12, -pd / 2, false), B(e, .05, pd, gm, pw / 2, .12, 0, false), B(e, .05, pd, gm, -pw / 2, .12, 0, false));
  const pg = G.peg || (G.peg = keep(new T.CylinderGeometry(.07, .07, .7, 8).translate(0, .35, 0)));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = new T.Mesh(pg, gm); p.position.set(sx * pw / 2, .12, sz * pd / 2); p.castShadow = true; g.add(p); }
  return g;
}
function roadPart(L) {
  const g = new T.Group(), z = L.pd / 2 + 1.6 + 4.2, len = 640;
  g.add(B(len, .06, 8.4, mat.asph(), 0, 0, z, false));
  g.add(B(len, .16, 1.6, mat.pave(), 0, 0, L.pd / 2 + .8, false));
  const ds = []; for (let x = -len / 2; x < len / 2; x += 6) ds.push([x, .07, z, 2.6, .02, .14]);
  g.add(inst(ds, std('dash', { color: 0xd8cfb8, roughness: .8, emissive: 0x2a2516 })));
  const kb = []; for (let x = -120; x <= 120; x += 9) kb.push([x, .2, L.pd / 2 + 1.5, .5, .08, .08]); // low kerb lights
  g.add(inst(kb, mat.lamp()));
  return g;
}
function plinthPart(L) {
  const g = new T.Group(), f0 = L.floors[0], st = L.ghost ? 'model' : L.style;
  if (L.type === 'row') g.add(B(L.bw + .6, L.plinth, L.bd + 1.8, mat.base(st), L.bx, 0, L.bz));
  else g.add(B(f0.w + .6, L.plinth, f0.d + .6, mat.base(st), f0.x, 0, f0.z));
  g.add(B(2.4, L.plinth * .5, .8, mat.pave(), f0.x, 0, f0.z + f0.d / 2 + .6));
  return g;
}
function driveX(L) { const f0 = L.floors[0]; return L.type === 'row' ? 0 : clamp(f0.x + f0.w / 2 - 2, -L.pw / 2 + 2.2, L.pw / 2 - 2.2); }
function drivePart(L) {
  const g = new T.Group(), f0 = L.floors[0], dx = driveX(L);
  const z0 = f0.z + f0.d / 2, z1 = L.pd / 2, len = Math.max(.5, z1 - z0);
  if (L.type === 'row') g.add(B(L.pw - .4, .05, len, mat.pave(), 0, .12, z0 + len / 2, false));
  else g.add(B(3.2, .05, len, mat.pave(), dx, .12, z0 + len / 2, false));
  if (L.tier === 'luxury' && L.type !== 'row') { const ups = []; for (let z = z0 + 1.2; z < z1 - .6; z += 2.2) ups.push([dx - 1.85, .3, z, .14, .32, .14], [dx + 1.85, .3, z, .14, .32, .14]); const im = inst(ups, mat.lamp()); if (im) g.add(im); }
  return g;
}
function carportPart(L) {
  const g = new T.Group(), maxN = L.park === 'cov' ? 2 : 3;
  const n = clamp(Math.floor((L.pw - 2 * L.side + 1) / 2.9), 1, maxN), w = n * 2.9, d = 5.6;
  const z = L.pd / 2 - L.front / 2 + .1, x = clamp(-L.pw / 2 + L.side + w / 2, -L.pw / 2 + w / 2 + .3, L.pw / 2 - w / 2 - .3);
  const st = L.ghost || L.style === 'model' ? 'modern' : L.style;
  g.add(B(w + .4, .05, d + .4, mat.pave(), x, .12, z, false));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(B(.14, 2.6, .14, mat.frame(st), x + sx * w / 2, .12, z + sz * (d / 2 - .1)));
  g.add(B(w + .5, .16, d + .5, st === 'glass' ? mat.rail() : (L.tier === 'luxury' ? mat.gold() : mat.trim(st)), x, 2.72, z));
  g.add(B(w + .56, .06, d + .56, mat.frame(st), x, 2.66, z, false));
  const cc = [0xd9c39a, 0x1c1c1f, 0xeeeae2];
  for (let k = 0; k < n; k++) g.add(car(cc[k % 3], x - w / 2 + 1.45 + k * 2.9, z, 0));
  return g;
}
function basementPart(L) {
  const g = new T.Group(), w = 3.6, len = Math.max(4.5, L.front - 1.2);
  const x = clamp(-L.pw / 2 + L.side + w / 2, -L.pw / 2 + w / 2 + .3, L.pw / 2 - w / 2 - .3), z = L.pd / 2 - .2 - len / 2;
  g.add(B(w, .05, len, mat.asph(), x, .12, z, false));
  const ws = []; for (const sx of [-1, 1]) ws.push([x + sx * (w / 2 + .1), .12 + .5, z + .8, .2, 1.0, len - 1.6]);
  const im = inst(ws, mat.conc()); im.castShadow = true; g.add(im);
  // covered ramp hood with a dark portal descending to the basement
  const hz = z - len / 2 + 1.7;
  g.add(B(w + .6, 2.7, 3.4, mat.conc(), x, .12, hz));
  g.add(B(w - .4, 2.2, .1, mat.black(), x, .12, hz + 1.72, false));
  g.add(B(w - .2, .08, .14, mat.lamp(), x, 2.42, hz + 1.76, false));
  const stripes = []; for (let k = 0; k < 6; k++) stripes.push([x - w / 2 + .35 + k * (w - .7) / 5, .17, z + len / 2 - .6, .28, .02, .9]);
  g.add(inst(stripes, std('yellow', { color: 0xd9b23a, roughness: .7 })));
  g.add(car(0xd9c39a, x, z + 1.2, Math.PI));
  return g;
}
function poolPart(L, info) {
  const g = new T.Group();
  let x, z, y, w, d;
  if (L.poolMode === 'roof') {
    const t = L.top, zone = (info && info.flatZones[0]) || { x: t.x, z: t.z, w: t.w, d: t.d, y: L.roofY + .25 };
    w = Math.max(2.4, zone.w * .55); d = Math.max(1.8, Math.min(3.2, zone.d * .34)); x = zone.x - zone.w * .12; z = zone.z + zone.d / 2 - d / 2 - .8; y = zone.y;
  } else if (L.type === 'farm') {
    const f0 = L.floors[0]; w = 12; d = 5; x = f0.x + f0.w / 2 - 6; z = f0.z + f0.d / 2 + 7.8; y = .12;
  } else {
    w = clamp(L.bw * .62, 3, 12); d = clamp(L.rear - 2.4, 2, 4.5); x = L.ex.has('servant') ? -L.pw / 2 + L.side + w / 2 + .3 : 0; z = -L.pd / 2 + L.rear / 2 + .1; y = .12;
  }
  g.add(B(w + 1.4, .22, d + 1.4, std('coping', { color: 0xe6dfd0, roughness: .6 }), x, y, z));
  g.add(B(w, .05, d, mat.water(), x, y + .2, z, false));
  if (L.poolMode !== 'roof') for (const k of [0, 1]) g.add(B(.7, .28, 1.9, std('lounger', { color: 0xf1ece2, roughness: .7 }), x - w / 2 + .6 + k * 1.1, y + .22, z + d / 2 + 1.1 + .4));
  return g;
}
function gardenPart(L) {
  const g = new T.Group(), { pw, pd } = L, r = rng(hash('g' + pw + pd + L.type));
  g.add(B(pw - .3, .03, pd - .3, mat.lawn(), 0, .12, 0, false));
  const palm = L.style === 'tropical' || L.style === 'indian';
  const pts = [], sp = clamp(Math.min(pw, pd) / 4.5, 3.6, 9), inset = .9;
  const occ = (x, z) => (Math.abs(x - L.bx) < L.bw / 2 + 1.4 && Math.abs(z - L.bz) < L.bd / 2 + (L.type === 'farm' ? 9 : 2)) || (L.poolMode === 'ground' && z < -pd / 2 + L.rear && Math.abs(x) < L.bw * .4 + 1) || (z > pd / 2 - L.front && Math.abs(x - driveX(L)) < 3.4) || (L.carport && z > pd / 2 - L.front - .5 && x < -pw / 2 + L.side + 9);
  for (let x = -pw / 2 + inset; x <= pw / 2 - inset + .01; x += sp) pts.push([x, -pd / 2 + inset]);
  for (let z = -pd / 2 + inset + sp; z < pd / 2 - 1; z += sp) { pts.push([-pw / 2 + inset, z]); pts.push([pw / 2 - inset, z]); }
  if (L.type === 'farm' || pw > 40) for (let k = 0; k < 40; k++) pts.push([(r() - .5) * pw * .9, (r() - .5) * pd * .9]);
  let n = 0; const sc = clamp(Math.min(pw, pd) / 18, .55, 1.1);
  for (const [x, z] of pts) { if (occ(x, z) || n > 48) continue; g.add(tree(x, z, (.6 + r() * .4) * sc, n, palm && r() < .6)); n++; }
  const sg = G.shrub || (G.shrub = keep(new T.IcosahedronGeometry(.45, 0)));
  const sh = [], fz = pd / 2 - .8; for (let x = -pw / 2 + .8; x < pw / 2 - .8; x += 1.1) if (!occ(x, fz)) sh.push([x, .5, fz, 1, .8 + r() * .4, 1]);
  const ims = inst(sh, mat.leaf(1), sg); if (ims) { ims.castShadow = true; g.add(ims); }
  return g;
}
function terracePart(L, info) {
  const g = new T.Group(), z0 = info && info.flatZones[0]; if (!z0) return g;
  const pm = std('planter', { color: 0x3a3632, roughness: .8 });
  g.add(B(z0.w - 1, .5, .6, pm, z0.x, z0.y, z0.z + z0.d / 2 - .55), B(.6, .5, z0.d - 1.2, pm, z0.x - z0.w / 2 + .55, z0.y, z0.z));
  g.add(B(z0.w - 1.1, .14, .5, mat.leaf(3), z0.x, z0.y + .5, z0.z + z0.d / 2 - .55), B(.5, .14, z0.d - 1.3, mat.leaf(3), z0.x - z0.w / 2 + .55, z0.y + .5, z0.z));
  const t1 = tree(z0.x - z0.w / 2 + 1.2, z0.z + z0.d / 2 - 1.3, .42, 2), t2 = tree(z0.x + z0.w / 2 - 1.3, z0.z + z0.d / 2 - 1.2, .36, 1);
  t1.position.y = t2.position.y = z0.y; g.add(t1, t2);
  if (L.poolMode !== 'roof') g.add(B(Math.min(3.4, z0.w * .35), .04, Math.min(2.6, z0.d * .35), mat.lawn(), z0.x + z0.w * .12, z0.y, z0.z + z0.d * .05, false));
  return g;
}
function solarPart(L, info) {
  const g = new T.Group(), pm = mat.solar(), pg = G.panel || (G.panel = keep(new T.BoxGeometry(1, .05, 1.65)));
  const fz = info && info.flatZones[0];
  if (info && info.slope) { // panels laid on the front roof slope
    const s = info.slope, hr = Math.tan(s.ang) * s.run, slen = s.run / Math.cos(s.ang);
    const grp = new T.Group(), cols = Math.max(2, Math.floor(s.w / 1.08)), rows = Math.max(1, Math.floor(slen * .62 / 1.72));
    for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) { const p = new T.Mesh(pg, pm); p.position.set(-cols * 1.08 / 2 + .54 + a * 1.08, 0, (b - (rows - 1) / 2) * 1.72); grp.add(p); }
    grp.rotation.x = s.ang;
    grp.position.set(s.x, s.y + hr / 2 + .09 * Math.cos(s.ang), s.z + s.run / 2 + .09 * Math.sin(s.ang));
    g.add(grp);
  } else if (fz) { // tilted rows on a flat roof (rear part)
    const zw = fz.w - 1.4, cols = Math.max(2, Math.floor(zw / 1.08)), rows = clamp(Math.floor(fz.d * .42 / 2.2), 1, 6);
    for (let b = 0; b < rows; b++) {
      const zz = fz.z - fz.d / 2 + 1.3 + b * 2.2;
      for (let a = 0; a < cols; a++) { const p = new T.Mesh(pg, pm); p.position.set(fz.x - cols * 1.08 / 2 + .54 + a * 1.08, fz.y + .55, zz); p.rotation.x = .24; p.castShadow = true; g.add(p); }
      g.add(B(cols * 1.08, .45, .08, mat.steel(), fz.x, fz.y, zz - .3));
    }
  }
  return g;
}
function liftPart(L) {
  const g = new T.Group(), f0 = L.floors[0], h = L.roofY - L.plinth + 1.4;
  const x = f0.x + f0.w / 2 + .45, z = f0.z - f0.d * .15;
  g.add(B(1.7, h, 1.9, std('liftglass', { color: 0xbcd6e0, roughness: .05, metalness: .3, transparent: true, opacity: .38, depthWrite: false }), x, L.plinth, z, false));
  const fr = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) fr.push([x + sx * .85, L.plinth + h / 2, z + sz * .95, .09, h, .09]);
  for (let yy = L.plinth; yy <= L.plinth + h + .01; yy += Math.max(3, L.fh)) fr.push([x, yy, z + .95, 1.7, .08, .09], [x, yy, z - .95, 1.7, .08, .09], [x + .85, yy, z, .09, .08, 1.9]);
  fr.push([x, L.plinth + h, z, 1.8, .12, 2.0]);
  g.add(inst(fr, mat.gold()));
  g.add(B(1.3, 2.3, 1.4, mat.glow('luxury'), x, L.plinth + Math.min(h * .45, 3.4), z, false));
  return g;
}
function rwhPart(L) {
  const g = new T.Group(), x = -L.pw / 2 + Math.max(.9, L.side * .5), z = L.bz - L.bd * .2;
  const t = new T.Mesh(G.tank || (G.tank = keep(new T.CylinderGeometry(.62, .62, 1.6, 20).translate(0, .8, 0))), std('tank', { color: 0x7d8a8f, roughness: .6, metalness: .3 })); t.position.set(x, .12, z); t.castShadow = true; g.add(t);
  const pit = new T.Mesh(G.pit || (G.pit = keep(new T.CylinderGeometry(.6, .6, .07, 20))), mat.gold()); pit.position.set(x, .17, z + 2.2); g.add(pit);
  const f0 = L.floors[0]; g.add(B(.09, L.roofY - .3, .09, mat.steel(), f0.x - f0.w / 2 - .07, .12, z - .9));
  g.add(B(Math.max(.1, Math.abs(x - (f0.x - f0.w / 2))), .09, .09, mat.steel(), (x + f0.x - f0.w / 2) / 2, 1.8, z - .9));
  return g;
}
function servantPart(L) {
  const g = new T.Group(), w = 3.4, d = 3.0, st = L.ghost ? 'model' : L.style;
  const x = L.pw / 2 - L.side - w / 2 + .3, z = -L.pd / 2 + Math.max(.5, L.side * .4) + d / 2 + .1;
  g.add(B(w, 2.9, d, wallMat(st, L.cons, L.ghost), x, .12, z));
  g.add(B(w + .5, .22, d + .5, L.pitched ? mat.roof(st) : mat.trim(st), x, 3.02, z));
  g.add(B(.9, 2, .08, mat.wood(), x - .6, .12, z + d / 2 + .02), B(1, .9, .08, mat.glow(L.tier), x + .8, 1.1, z + d / 2 + .02, false));
  return g;
}
function wallPart(L) {
  const g = new T.Group(), { pw, pd } = L, h = 1.7, t = .22, st = L.ghost ? 'model' : L.style;
  const wm = st === 'glass' ? mat.frame('glass') : st === 'tropical' ? mat.base('tropical') : wallMat(st, L.cons, false);
  const gx = driveX(L), gw = L.type === 'row' ? Math.min(pw - 2, 6) : 3.8;
  g.add(B(pw, h, t, wm, 0, .12, -pd / 2 + t / 2), B(t, h, pd, wm, -pw / 2 + t / 2, .12, 0), B(t, h, pd, wm, pw / 2 - t / 2, .12, 0));
  const l1 = gx - gw / 2 - .55 + pw / 2, l2 = pw / 2 - (gx + gw / 2 + .55);
  if (l1 > .3) g.add(B(l1, h, t, wm, -pw / 2 + l1 / 2, .12, pd / 2 - t / 2));
  if (l2 > .3) g.add(B(l2, h, t, wm, pw / 2 - l2 / 2, .12, pd / 2 - t / 2));
  const cm = st === 'indian' ? mat.roof('indian') : mat.trim(st);
  g.add(B(pw + .1, .08, t + .1, cm, 0, .12 + h, -pd / 2 + t / 2), B(t + .1, .08, pd, cm, -pw / 2 + t / 2, .12 + h, 0), B(t + .1, .08, pd, cm, pw / 2 - t / 2, .12 + h, 0));
  for (const sx of [-1, 1]) { g.add(B(.55, 2.2, .55, mat.base(st), gx + sx * (gw / 2 + .27), .12, pd / 2 - t / 2)); g.add(B(.34, .3, .34, mat.lamp(), gx + sx * (gw / 2 + .27), 2.32, pd / 2 - t / 2, false)); }
  const sl = [], gm = L.tier === 'luxury' ? mat.gold() : mat.frame('modern');
  for (let k = 0; k < Math.round(gw / .2); k++) sl.push([gx - gw / 2 + .1 + k * .2, .12 + .95, pd / 2 - t / 2, .06, 1.6, .06]);
  g.add(inst(sl, gm)); g.add(B(gw, .08, .1, gm, gx, 1.85, pd / 2 - t / 2), B(gw, .08, .1, gm, gx, .2, pd / 2 - t / 2));
  return g;
}
function constructionPart(L) {
  const g = new T.Group(), t = L.top;
  if (L.cons === 'mivan') { // aluminium formwork shell on the top floor + tower crane
    const fm = std('alu', { color: 0xc9ced4, roughness: .32, metalness: .9 });
    g.add(B(t.w + .35, t.h + .3, t.d + .35, fm, t.x, t.y - .1, t.z));
    const jl = []; for (let k = -Math.floor(t.w / 2.4); k <= Math.floor(t.w / 2.4); k++) jl.push([t.x + k * 1.2, t.y + t.h / 2, t.z + t.d / 2 + .19, .05, t.h + .3, .03]);
    for (let k = 1; k < 3; k++) jl.push([t.x, t.y - .1 + k * (t.h + .3) / 3, t.z + t.d / 2 + .19, t.w + .35, .05, .03]);
    g.add(inst(jl, std('alu2', { color: 0x6b7078, roughness: .5, metalness: .8 })));
    const ch = L.roofY + 9, cx = t.x - t.w / 2 - 3.4, cz = t.z, jw = Math.max(18, t.w + 10), cm = std('crane', { color: 0xd9a400, roughness: .6, metalness: .3 });
    g.add(B(1.2, ch, 1.2, cm, cx, 0, cz));
    g.add(B(jw, .8, .8, cm, cx + jw / 2 - 4, ch, cz));
    g.add(B(2, 1.4, 1.6, std('cab', { color: 0xeeeeea, roughness: .5 }), cx, ch - 1.6, cz + 1.3));
    g.add(B(1.6, 1.6, 1.4, mat.conc(), cx - 3, ch - .4, cz));
    g.add(B(.05, 6, .05, mat.steel(), cx + jw - 6, ch - 6, cz));
  } else if (L.cons === 'block') { // scaffolding + stacked blocks on site
    const sc = [], off = 1.0, H = L.roofY + .8, x0 = L.bx - L.bw / 2 - off, x1 = L.bx + L.bw / 2 + off, z0 = L.bz - L.bd / 2 - off, z1 = L.bz + L.bd / 2 + off;
    for (let x = x0; x <= x1 + .01; x += 2.2) sc.push([x, H / 2, z1, .07, H, .07], [x, H / 2, z0, .07, H, .07]);
    for (let z = z0; z <= z1 + .01; z += 2.2) sc.push([x0, H / 2, z, .07, H, .07], [x1, H / 2, z, .07, H, .07]);
    for (let y = 1.8; y < H; y += 1.8) sc.push([(x0 + x1) / 2, y, z1, x1 - x0, .06, .06], [(x0 + x1) / 2, y, z0, x1 - x0, .06, .06], [x0, y, (z0 + z1) / 2, .06, .06, z1 - z0], [x1, y, (z0 + z1) / 2, .06, .06, z1 - z0]);
    for (let y = 1.8; y < H; y += 1.8) sc.push([(x0 + x1) / 2, y - .03, z1 - .35, x1 - x0, .04, .7]);
    const im = inst(sc, mat.steel()); im.castShadow = true; g.add(im);
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
  const tn = { north: 140, east: 50, south: 70, west: 90, central: 20, outside: 280 }[loc] ?? 80;
  const tr = [], cn = [];
  for (let k = 0; k < tn; k++) { const a = r() * Math.PI * 2, rad = 75 + r() * 240, x = Math.cos(a) * rad, z = Math.sin(a) * rad; if (Math.abs(z - 20) < 12) continue; const s = 1.2 + r() * 1.6; tr.push([x, 1.2 * s, z, .35 * s, 2.4 * s, .35 * s]); cn.push([x, 3.4 * s, z, 3 * s, 3.4 * s, 3 * s]); }
  const ti = inst(tr, mat.trunk()); if (ti) g.add(ti);
  const ci = inst(cn, mat.leaf(2), G.ctxCan || (G.ctxCan = keep(new T.IcosahedronGeometry(.5, 0)))); if (ci) g.add(ci);
  if (loc === 'outside' || loc === 'north') { const fs = []; for (let k = 0; k < 14; k++) fs.push([-220 + k * 34, .04, -150 - r() * 60, 30, .08, 70 + r() * 40]); g.add(inst(fs, std('field', { color: 0x4a4a26, roughness: 1 }))); }
  if (loc === 'west' || loc === 'south' || loc === 'outside') {
    const hg = G.hill || (G.hill = keep(new T.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2))), hl = [];
    for (let k = 0; k < 9; k++) { const a = -2.6 + k * .33 + r() * .2, rad = 380 + r() * 120; hl.push([Math.cos(a) * rad, 0, Math.sin(a) * rad, 60 + r() * 60, 18 + r() * (loc === 'west' ? 34 : 20), 50 + r() * 40]); }
    g.add(inst(hl, std('hill', { color: 0x17211a, roughness: 1 }), hg));
  }
  return g;
}

let grassPlot = '';
function buildGrass() {
  const geo = keep(new T.ConeGeometry(.05, .34, 3).translate(0, .17, 0));
  grass = new T.InstancedMesh(geo, std('grass', { color: 0xffffff, roughness: 1 }), mobile ? 2200 : 4200);
  grass.frustumCulled = false; scene.add(grass);
}
function placeGrass(pw, pd) {
  const s0 = pw.toFixed(1) + 'x' + pd.toFixed(1); if (s0 === grassPlot) return; grassPlot = s0;
  const r = rng(11), m4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3(), c = new T.Color(), ax = new T.Vector3(), rz = pd / 2 + 1.6 + 4.2;
  const R = Math.max(pw, pd) * .5 + 40;
  for (let i = 0; i < grass.count; i++) {
    let x, z, tries = 0;
    do { const a = r() * Math.PI * 2, rad = Math.sqrt(r()) * R; x = Math.cos(a) * rad; z = Math.sin(a) * rad; tries++; } while (tries < 30 && ((Math.abs(x) < pw / 2 + .3 && Math.abs(z) < pd / 2 + .3) || Math.abs(z - rz) < 5.4 || Math.abs(z - (pd / 2 + .8)) < 1.1));
    p.set(x, 0, z); ax.set(r() - .5, 0, r() - .5).normalize(); q.setFromAxisAngle(ax, r() * .35); const k = .5 + r() * .7; s.set(k, k * (.6 + r() * .7), k);
    m4.compose(p, q, s); grass.setMatrixAt(i, m4); c.setHSL(.22 + r() * .06, .38, .085 + r() * .06); grass.setColorAt(i, c);
  }
  grass.instanceMatrix.needsUpdate = true; if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
}

/* ---------- compose + camera framing */
const sig = o => JSON.stringify(o, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v instanceof Set ? [...v].sort() : v);
function composeParts(L) {
  const parts = [], { pw, pd } = L;
  parts.push({ key: 'plot' + sig([pw, pd]), anim: 'grow', make: () => plotPart(L), dur: 700 });
  parts.push({ key: 'road' + sig(pd), instant: true, make: () => roadPart(L) });
  parts.push({ key: 'ctx-' + (S.loc || 'default'), anim: 'rise', dur: 1400, make: () => contextPart(S.loc || 'default') });
  if (!L.type) return parts;
  const look = { st: L.ghost ? 'ghost' : L.style, tier: L.tier, cons: L.cons, type: L.type, units: L.units, th: L.ex.has('theatre') };
  const fsig = L.floors.map(f => sig([f.w, f.d, f.x, f.z, f.y, f.h, f.stilt]));
  parts.push({ key: 'plinth' + sig([L.floors[0], L.type, look.st, L.bw, L.bd]), anim: 'grow', make: () => plinthPart(L), dur: 500 });
  L.floors.forEach((f, i) => parts.push({ key: 'fl' + i + fsig[i] + sig(look), floor: i, anim: 'rise', make: () => floorPart(f, L) }));
  const roofKey = 'roof' + sig([fsig[fsig.length - 1], look, L.pitched, L.ex.has('terrace'), L.ex.has('solar'), L.roofY]);
  let roofObj = null;
  const getRoof = () => live.get(roofKey) || roofObj || (roofObj = roofPart(L));
  const info = () => getRoof().userData.info;
  parts.push({ key: roofKey, late: true, anim: 'rise', make: getRoof });
  parts.push({ key: 'drive' + sig([L.floors[0], pd, pw, L.tier, L.type]), anim: 'grow', late: true, make: () => drivePart(L) });
  const base = sig([pw, pd, L.bw, L.bd, L.bz, look.st, L.tier, L.side, L.front, L.rear]);
  if (L.carport) parts.push({ key: 'carport' + base + L.park, late: true, d: 150, make: () => carportPart(L) });
  if (L.park === 'base') parts.push({ key: 'basement' + base, late: true, d: 150, make: () => basementPart(L) });
  if (L.ex.has('garden')) parts.push({ key: 'garden' + base + L.poolMode + L.carport + L.type, late: true, d: 250, make: () => gardenPart(L) });
  if (L.poolMode) parts.push({ key: 'pool' + base + L.poolMode + L.ex.has('servant') + roofKey, late: true, d: 300, anim: 'grow', make: () => poolPart(L, info()) });
  if (L.ex.has('terrace')) parts.push({ key: 'terr' + roofKey + L.poolMode, late: true, d: 380, make: () => terracePart(L, info()) });
  if (L.ex.has('solar')) parts.push({ key: 'solar' + roofKey, late: true, d: 440, make: () => solarPart(L, info()) });
  if (L.ex.has('lift')) parts.push({ key: 'lift' + sig(L.floors) + L.roofY, late: true, d: 200, anim: 'rise', make: () => liftPart(L) });
  if (L.ex.has('rwh')) parts.push({ key: 'rwh' + base + L.roofY, late: true, d: 320, make: () => rwhPart(L) });
  if (L.ex.has('servant')) parts.push({ key: 'serv' + base + L.pitched, late: true, d: 260, anim: 'rise', make: () => servantPart(L) });
  if (L.ex.has('wall')) parts.push({ key: 'wall' + base + sig(L.floors[0]), late: true, d: 100, anim: 'rise', make: () => wallPart(L) });
  if (step === QI.cons && (L.cons === 'mivan' || L.cons === 'block')) parts.push({ key: 'cons' + L.cons + sig(L.floors) + base, late: true, d: 100, anim: 'rise', make: () => constructionPart(L) });
  return parts;
}
function frame(L, instant) {
  const size = Math.max(L.pw, L.pd), H = L.H || 0, isSum = step >= Q.length;
  const asp = camera.aspect, fit = asp < 1.2 ? 1.2 / asp : 1;
  const ty = Math.min(H * .4, 40) + .6;
  let dist = (Math.max(size * 1.25, H * 1.55, 18) * 1.6 + 8) * Math.pow(fit, .8);
  if (isSum) dist *= .92;
  sun.position.set(size * .5 + H * .5 + 30, Math.max(60, H * 2), size * .35 + 26);
  const sc = sun.shadow.camera, e = size * .72 + H * .8 + 10; sc.left = -e; sc.right = e; sc.top = e; sc.bottom = -e; sc.near = 1; sc.far = 400 + H * 4; sc.updateProjectionMatrix();
  renderer.shadowMap.needsUpdate = true;
  scene.fog.near = Math.max(90, dist * 1.5); scene.fog.far = Math.max(420, dist * 6);
  controls.maxDistance = dist * 2.6; controls.minDistance = Math.max(5, size * .3);
  const tt = new T.Vector3(0, ty, 0);
  const fs = sig([size, H, isSum, asp > 1.2]);
  if (instant || reduce) {
    controls.target.copy(tt);
    const dir = camera.position.clone().sub(controls.target).normalize();
    if (!isFinite(dir.x) || dir.y < .15) dir.set(.62, .42, .66).normalize();
    if (isSum) { const sp = new T.Spherical().setFromVector3(dir); sp.phi = 1.08; dir.setFromSpherical(sp); }
    camera.position.copy(tt).addScaledVector(dir, dist); lastFrameSig = fs; camGoal = null; dirty = true; return;
  }
  if (fs === lastFrameSig) return; lastFrameSig = fs;
  const fd = camera.position.distanceTo(controls.target), cur = new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  camGoal = { ft: controls.target.clone(), tt, fd, td: dist, t0: performance.now(), dur: 1500, fphi: cur.phi, phi: isSum ? 1.08 : (cur.phi < .7 || cur.phi > 1.3 ? 1.1 : null) };
}
let firstFrame = true;
function update3D(animate) {
  const L = layoutOf(); lastLayout = L;
  if (threeOK) {
    placeGrass(L.pw, L.pd);
    reconcile(composeParts(L));
    frame(L, firstFrame || !animate); firstFrame = false;
  }
  describe(L);
}
function describe(L) {
  const t = L.type ? `${optLabel('floors', S.floors) || ''} ${optLabel('style', S.style) || ''} ${optLabel('type', S.type)}`.replace(/\s+/g, ' ').trim() : 'an empty plot';
  const ex = (S.extras || []).map(v => optLabel('extras', v)).join(', ');
  const d = `3D preview: ${t} on a ${plotLabel() || '40 × 60 ft'} plot${S.loc ? ', ' + optLabel('loc', S.loc) + ' Bangalore' : ''}${S.park && S.park !== 'none' ? ', parking: ' + optLabel('park', S.park) : ''}${ex ? ', with ' + ex : ''}.`;
  if (canvas) canvas.setAttribute('aria-label', d);
  if (liveEl && isOpen && step >= 0 && step < Q.length) { clearTimeout(describe.t); describe.t = setTimeout(() => { liveEl.textContent = 'Model updated. ' + d; }, 700); }
  renderHud();
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
      renderer.render(scene, camera); // same task as drawImage, so the drawing buffer is still valid
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
  set(o) { Object.assign(S, o); save(); renderStep(true); update3D(true); },
  state: () => JSON.parse(JSON.stringify({ S, step })),
  settle() { for (const o of live.values()) if (o.userData.anim) { o.userData.anim.done = true; applyAnim(o, 1); } dying.splice(0).forEach(o => { world.remove(o); disposeObj(o); }); if (camGoal) camGoal.t0 = -1e9; if (renderer) renderer.shadowMap.needsUpdate = true; dirty = true; },
  stats: () => renderer ? { dist: +camera.position.distanceTo(controls.target).toFixed(1), tgt: controls.target.toArray().map(v => +v.toFixed(1)), asp: +camera.aspect.toFixed(2), H: lastLayout && +(+lastLayout.H).toFixed(1), calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geos: renderer.info.memory.geometries, pr: renderer.getPixelRatio() } : null,
};
