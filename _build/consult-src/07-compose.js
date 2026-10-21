
/* ---------- compose + camera framing */
const sig = o => JSON.stringify(o, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v instanceof Set ? [...v].sort() : v);
function edges(mesh) { const l = new T.LineSegments(new T.EdgesGeometry(mesh.geometry), mat.edge()); l.position.copy(mesh.position); return l; }
function composeParts(L) {
  const parts = [], { pw, pd } = L;
  parts.push({ key: 'plot' + sig([pw, pd]), anim: 'grow', make: () => plotPart(L), dur: 700 });
  parts.push({ key: 'road' + sig([pw, pd]), instant: true, make: () => roadPart(L) });
  parts.push({ key: 'ctx-' + (S.loc || 'default'), anim: 'rise', dur: 1400, make: () => contextPart(S.loc || 'default') });
  if (L.comm) return societyParts(L);
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
  const ty = L.comm ? Math.max(4, H * .42) : Math.min(H * .4, 40) + .6;
  let dist = L.comm ? (Math.max(size * 1.1, H * (asp < 1.2 ? 2.1 : 1.65)) * 1.3 + 10) * Math.pow(fit, .7) : (Math.max(size * 1.25, H * 1.55, 18) * 1.32 + 7) * Math.pow(fit, .8);
  if (isSum) dist *= .92;
  frameSun(L);
  scene.fog.near = Math.max(120, dist * 2); scene.fog.far = Math.max(700, dist * 9);
  controls.maxDistance = dist * 2.6; controls.minDistance = Math.max(5, Math.min(size * .3, L.comm ? 25 : 1e9));
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
  bakeTypes: () => bakeObj.types,
  bakeLog: () => (instBaked.log || []).map(([n, t, c]) => [n, Math.round(t), c]).sort((a, b) => b[1] * b[2] - a[1] * a[2]).slice(0, 25),
  stats: () => renderer ? { dist: +camera.position.distanceTo(controls.target).toFixed(1), tgt: controls.target.toArray().map(v => +v.toFixed(1)), asp: +camera.aspect.toFixed(2), H: lastLayout && +(+lastLayout.H).toFixed(1), calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geos: renderer.info.memory.geometries, pr: renderer.getPixelRatio(), q: quality, comp: !!composer } : null,
};
