
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
