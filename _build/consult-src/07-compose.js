
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
