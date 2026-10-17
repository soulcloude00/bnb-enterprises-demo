
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
