
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
      if (L.lite) { const k = r(); put(it[k < .55 ? 0 : k < .8 ? 1 : 2], c, yc, ww, wh, .012, .02); put(gl, c, yc, ww, wh, .05, .02); return; }
      if (!v.rot && l.vols.length > 1) { const o = half + .35, px = v.x + (nz ? c * nz : nx * o), pz = v.z + (nz ? nz * o : -c * nx); for (const e of [-ww / 2, 0, ww / 2]) { const qx = px + (nz ? e : 0), qz = pz + (nz ? 0 : e); if (l.vols.some(u => u !== v && u.kind !== 'canopy' && inVol(u, qx, qz))) return; } }
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
function inVol(u, x, z, m = 0) { return Math.abs(x - u.x) < u.w / 2 + m && Math.abs(z - u.z) < u.d / 2 + m; }
function balconyFree(v, l, L) { // a cantilevered balcony must not land on a lower roof or clip a neighbour
  if (v.rot) return false;
  const z = v.z + v.d / 2 + .75, bw = v.w * .3, below = L.levels[L.levels.indexOf(l) - 1];
  for (const x of [v.x - bw, v.x, v.x + bw]) {
    if (below && below.vols.some(u => u.kind !== 'canopy' && inVol(u, x, z, .2))) return false;
    if (l.vols.some(u => u !== v && inVol(u, x, z, .2))) return false;
  }
  return true;
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
  if (l.lvl >= 1 && !v.planters && balconyFree(v, l, L) && ((L.type === 'apartment' && v.w > 6) || (L.tier !== 'standard' && ['villa', 'unsure'].includes(L.type) && v.w > 5))) {
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
  const st = L.style, r = v.roofK, low = PAL[st].low, ov0 = v.monoH ? .2 : r === 'barn' ? .3 : low ? 1.3 : .6, hr = v.monoH || roofRise(r, v, st);
  let ovx = ov0, ovz = ov0;
  for (const u of (v._nb || [])) { // keep eaves clear of adjacent wings / the floor above
    const gx = Math.abs(u.x - v.x) - (u.w + v.w) / 2, gz = Math.abs(u.z - v.z) - (u.d + v.d) / 2;
    if (gx >= -.01 && Math.abs(u.z - v.z) < (u.d + v.d) / 2) ovx = Math.min(ovx, Math.max(.12, gx * .5 - .1));
    if (gz >= -.01 && Math.abs(u.x - v.x) < (u.w + v.w) / 2) ovz = Math.min(ovz, Math.max(.12, gz * .5 - .1));
  }
  const ov = r === 'gable-z' ? ovx : r === 'gable-x' ? ovz : Math.min(ovx, ovz);
  const W = v.w + 2 * ovx, D = v.d + 2 * ovz;
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
    if (v.planters || L.tier !== 'standard') { const pl = [[0, .3, d / 2 - .95, w - 1.6, .6, .6]]; grp.add(inst(pl, clad(st, 'concrete'), null, true)); hedgeRow(grp, -w / 2 + 1, d / 2 - .95, w / 2 - 1, d / 2 - .95, .6, .5); }
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
    v._nb = l.vols.filter(u => u !== v && u.kind !== 'canopy' && !u.rot);
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
      g.add(B(d.w + .3, Math.max(.06, y0 - .12), d.d + .3, mat.paveD(), d.x, .12, d.z, false, 0)); g.add(B(d.w, .06, d.d, d.paved ? mat.pave() : mat.lawn(), d.x, Math.max(.12, y0 - .06), d.z, false, 0));
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
