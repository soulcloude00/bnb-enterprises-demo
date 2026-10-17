
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
