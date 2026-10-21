
/* ---------- v7: communities — gated villa societies, row-house layouts, mid / high-rise towers, mixed-use.
   One unit is modelled in full detail, baked once per material and drawn with InstancedMesh across every lot;
   repeated tower floors share a single baked floor. Large or low-quality scenes switch to a lite facade. */
const UNIT_PLOT = { villas: [40, 60], rows: [80, 45], midrise: [120, 90], highrise: [110, 82], mixed: [170, 125] };
function societyPlan(st) {
  const type = st.type, n = countOf(st), [uw, ud] = UNIT_PLOT[type], lw = uw * FT, ld = ud * FT, tower = isTower(type);
  const lots = [], WALL = 2, RING = 7, AM = tower ? 46 : 44;
  let SW, SD;
  if (!tower) {
    const m = type === 'rows' ? Math.ceil(n / 4) : n, STREET = 9, SPINE = 10;
    let k = Math.max(2, Math.round(Math.sqrt(m * (2 * ld + STREET) / 2 / lw))); if (k % 2) k++;
    const nb = Math.ceil(m / (2 * k)), half = k / 2, bd = 2 * ld;
    SW = 2 * (SPINE / 2 + half * lw + RING + WALL);
    SD = 2 * (WALL + RING) + nb * bd + nb * STREET + AM;
    const zFront = SD / 2 - WALL - RING - AM - STREET; // front edge of the block nearest the gate
    let c = 0;
    for (let b = 0; b < nb && c < m; b++) {
      const z1 = zFront - b * (bd + STREET);
      for (const [zc, rot] of [[z1 - ld / 2, 0], [z1 - ld * 1.5, Math.PI]]) for (let i = 0; i < k && c < m; i++) {
        const side = i % 2 ? 1 : -1, j = Math.floor(i / 2);
        lots.push({ x: side * (SPINE / 2 + lw * (j + .5)), z: zc, r: rot }); c++;
      }
    }
    Object.assign(st, {}); return { type, n, m, k, nb, lw, ld, SW, SD, AM, lots, street: STREET, spine: SPINE, ring: RING, zFront, bd };
  }
  const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), gx = lw + 26, gz = ld + 24;
  SW = cols * gx + 2 * (RING + WALL) + 8; SD = rows * gz + AM + 2 * (RING + WALL) + 6;
  const z0 = SD / 2 - WALL - RING - AM - gz / 2;
  for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols), inRow = Math.min(cols, n - r * cols); lots.push({ x: (c - (inRow - 1) / 2) * gx, z: z0 - r * gz, r: 0 }); }
  return { type, n, m: n, cols, rows, lw, ld, gx, gz, SW, SD, AM, lots, ring: RING, z0 };
}
function societyAcres(st) { try { const p = societyPlan(st); return p.SW * p.SD / 4046.86; } catch (e) { return 0; } }
function societyLayout(st, opt) {
  const P = societyPlan(st), ut = unitType(st.type), tower = isTower(st.type), ex = new Set(st.extras || []);
  const uex = (st.extras || []).filter(e => e === 'solar' || e === 'terrace');
  const U = layoutOf({ ...st, type: ut, extras: uex, park: 'none' }, { plot: UNIT_PLOT[st.type], unit: true });
  const nF = U.levels.length, podH = tower && (st.park === 'podium' || st.type !== 'midrise') ? 6.6 : 0;
  const lite = quality === 'low' || (mobile && P.m * nF > 90) || P.m * nF > 260;
  U.lite = lite;
  const L = { comm: true, type: st.type, unitType: ut, plan: P, unit: U, pw: P.SW, pd: P.SD, H: U.H + podH, podH, lite, style: U.style, tier: U.tier, variant: U.variant, ex, park: st.park || 'none', levels: [], decor: [], nF, area: U.area * (st.type === 'rows' ? P.m : P.m) };
  return L;
}

/* ---------- baking: an Object3D tree -> one merged geometry per material (instance colours kept as vertex colours) */
function vcMat(m) {
  if (m.vertexColors) return m;
  const k = 'vc|' + m.uuid; if (M[k]) return M[k];
  const c = m.clone(); c.vertexColors = true; c.onBeforeCompile = m.onBeforeCompile; c.customProgramCacheKey = m.customProgramCacheKey; return (M[k] = c);
}
function bakeObj(obj, lite) {
  obj.updateMatrixWorld(true);
  const buckets = new Map(), prepC = new Map(), m4 = new T.Matrix4(), im4 = new T.Matrix4(), col = new T.Color();
  const prep = geo => {
    if (prepC.has(geo)) return prepC.get(geo);
    let g = geo;
    if (lite && g.type === 'IcosahedronGeometry' && g.parameters.detail > 0) { g.computeBoundingBox(); const c = g.boundingBox.getCenter(new T.Vector3()), sz = g.boundingBox.getSize(new T.Vector3()); const lo = new T.IcosahedronGeometry(1, 0); lo.scale(sz.x / 2, sz.y / 2, sz.z / 2).translate(c.x, c.y, c.z); g = lo; }
    else if (lite && (g instanceof RoundedBoxGeometry || (g.type === 'CylinderGeometry' && g.parameters.radialSegments > 4))) { // LOD: plain boxes / 6-sided columns
      g.computeBoundingBox(); const bb = g.boundingBox, sz = bb.getSize(new T.Vector3()), c = bb.getCenter(new T.Vector3());
      const p = g.parameters, lo = !(g instanceof RoundedBoxGeometry) && g.type === 'CylinderGeometry' ? new T.CylinderGeometry(p.radiusTop, p.radiusBottom, sz.y, 4, 1, true) : new T.BoxGeometry(sz.x, sz.y, sz.z);
      lo.translate(c.x, c.y, c.z); g = worldUV(lo);
    }
    g = g.index ? g.toNonIndexed() : g.clone();
    for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(a)) g.deleteAttribute(a);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.clearGroups(); prepC.set(geo, g); return g;
  };
  obj.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    let vis = true; o.traverseAncestors(a => { if (!a.visible) vis = false; }); if (!o.visible || !vis) return;
    const base = prep(o.geometry), key = o.material; (bakeObj.types || (bakeObj.types = {}))[o.geometry.type + (o.isInstancedMesh ? 'x' + o.count : '')] = ((bakeObj.types || {})[o.geometry.type + (o.isInstancedMesh ? 'x' + o.count : '')] || 0) + base.attributes.position.count / 3 * (o.isInstancedMesh ? o.count : 1);
    let b = buckets.get(key); if (!b) buckets.set(key, b = { list: [], cast: false });
    b.cast = b.cast || o.castShadow;
    const add = (mtx, c) => {
      const g = base.clone().applyMatrix4(mtx), n = g.attributes.position.count, ca = new Float32Array(n * 3);
      const r = c ? c.r : 1, gg = c ? c.g : 1, bb = c ? c.b : 1; for (let i = 0; i < n; i++) { ca[i * 3] = r; ca[i * 3 + 1] = gg; ca[i * 3 + 2] = bb; }
      g.setAttribute('color', new T.BufferAttribute(ca, 3)); b.list.push(g);
    };
    if (o.isInstancedMesh) for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, im4); m4.multiplyMatrices(o.matrixWorld, im4); if (o.instanceColor) o.getColorAt(i, col); add(m4, o.instanceColor ? col : null); }
    else add(o.matrixWorld, null);
  });
  const out = [];
  for (const [m, b] of buckets) { if (!b.list.length) continue; const g = mergeGeometries(b.list, false); b.list.forEach(x => x.dispose()); if (g) { g.computeBoundingSphere(); out.push({ geo: g, mat: vcMat(m), cast: b.cast }); } }
  prepC.forEach(g => g.dispose());
  disposeObj(obj);
  return out;
}
function instBaked(baked, mats4, grp) {
  for (const b of baked) (instBaked.log || (instBaked.log = [])).push([b.mat.name || b.mat.type, b.geo.attributes.position.count / 3, mats4.length]);
  for (const b of baked) {
    const im = new T.InstancedMesh(b.geo, b.mat, mats4.length);
    mats4.forEach((m, i) => im.setMatrixAt(i, m));
    im.castShadow = b.cast; im.receiveShadow = true; im.computeBoundingSphere(); im.frustumCulled = false; grp.add(im);
  }
}
function massingLevel(l, U) { // far-LOD floor plate: clad box, slab band and a window band per face
  const g = new T.Group(), st = U.style, cm = clad(st, PAL[st] ? PAL[st].clad : 'render'), bx = G.mbox || (G.mbox = keep(new T.BoxGeometry(1, 1, 1).translate(0, .5, 0)));
  for (const v of l.vols) {
    const vg = new T.Group(); vg.position.set(v.x, 0, v.z); if (v.rot) vg.rotation.y = v.rot;
    const glazed = v.kind === 'glazed', h = l.h;
    if (v.kind === 'canopy') { const m = new T.Mesh(bx, slabMat(U)); m.scale.set(v.w, .22, v.d); m.position.y = h - .3; vg.add(m); g.add(vg); continue; }
    const w = new T.Mesh(bx, glazed ? mat.glass() : cm); w.scale.set(v.w - .02, h - .26, v.d - .02); vg.add(w);
    const sl = new T.Mesh(bx, slabMat(U)); sl.scale.set(v.w + .14, .26, v.d + .14); sl.position.y = h - .26; vg.add(sl);
    if (!glazed && v.kind !== 'stilt') { const wb = new T.Mesh(bx, mat.glass()); wb.scale.set(v.w * .8, Math.min(1.6, h * .45), v.d + .06); wb.position.y = h * .3; vg.add(wb); const wb2 = new T.Mesh(bx, mat.glass()); wb2.scale.set(v.w + .06, Math.min(1.6, h * .45), v.d * .8); wb2.position.y = h * .3; vg.add(wb2); }
    g.add(vg);
  }
  return g;
}
function lotMatrix(lot, y, yOff = 0) { return new T.Matrix4().makeTranslation(lot.x, y + yOff, lot.z).multiply(new T.Matrix4().makeRotationY(lot.r || 0)); }
function unitsPart(L) {
  const U = L.unit, P = L.plan, g = new T.Group(), lots = P.lots; instBaked.log = []; bakeObj.types = {};
  // floors: dedupe identical floor plates (towers repeat one plate dozens of times)
  const bySig = new Map();
  U.levels.forEach(l => { const k = sig([l.h, l.stilt, l.lvl === 0, l.vols.map(v => [v.x, v.z, v.w, v.d, v.kind, v.clad, v.rot, v.ribbon, v.fins, v.pil, v.planters, v.bal])]); let e = bySig.get(k); if (!e) bySig.set(k, e = { l, ys: [] }); e.ys.push(l.y); });
  const budget = quality === 'low' || mobile ? 5e5 : 1.3e6, nT = b => b.reduce((a, x) => a + x.geo.attributes.position.count / 3, 0);
  const plates = [...bySig.values()].map(({ l, ys }) => { const part = levelPart(l, U); part.position.y = 0; return { l, ys, baked: bakeObj(part, L.lite) }; });
  const info = { slopes: U.slopes, flatZones: U.flatZones };
  const makeTop = massing => {
    const top = new T.Group();
    if (!massing) top.add(plinthPart(U)); else for (const v of U.levels[0].vols) if (v.kind !== 'canopy') top.add(B(v.w + .5, U.plinth, v.d + .5, clad(U.style, 'stone'), v.x, 0, v.z, true, 0));
    top.add(roofsPart(U));
    if (U.decor.length && !massing) top.add(decorPart(U));
    if (U.ex.has('terrace') && !massing) top.add(terracePart(U, info));
    if (U.ex.has('solar')) { if (!massing) top.add(solarPart(U, info)); else { const z = U.flatZones.slice().sort((a, b) => b.w * b.d - a.w * a.d)[0]; if (z) top.add(B(z.w * .7, .12, z.d * .55, mat.solar(), z.x, z.y + .35, z.z, false, 0)); } }
    return bakeObj(top, L.lite || massing);
  };
  let topB = makeTop(false);
  const tris = (plates.reduce((a, p) => a + nT(p.baked) * p.ys.length, 0) + nT(topB)) * lots.length;
  L.massing = tris > budget;
  if (L.massing) { plates.forEach(p => { p.baked.forEach(b => b.geo.dispose()); p.baked = bakeObj(massingLevel(p.l, U), true); }); topB.forEach(b => b.geo.dispose()); topB = makeTop(true); }
  for (const { ys, baked } of plates) { const mats = []; for (const lot of lots) for (const y of ys) mats.push(lotMatrix(lot, y, L.podH)); instBaked(baked, mats, g); }
  instBaked(topB, lots.map(lot => lotMatrix(lot, 0, L.podH)), g);
  return g;
}

/* ---------- society site: lawn, streets, wall + gate, clubhouse, amenities, trees, lamps, podium */
function societyPart(L) {
  const g = new T.Group(), P = L.plan, { SW, SD } = P, st = L.style === 'model' ? 'modern' : L.style, r = rng(hash('soc' + L.type + P.n));
  const asph = mat.asph(), pave = mat.pave(), paveD = mat.paveD(), trim = mat.trim(st), roads = [], kerbs = [], tl = [], lamps = [];
  g.add(B(SW + 24, .1, SD + 24, mat.lawn(), 0, 0, 0, false, 0)); g.add(lawnPlane(SW, SD, .101));
  const road = (x, z, w, d) => { roads.push([x, .14, z, w, .06, d]); };
  const ring = P.ring, iw = SW / 2 - 2, id = SD / 2 - 2;
  // perimeter ring road just inside the wall
  road(0, id - ring / 2, SW - 4, ring); road(0, -id + ring / 2, SW - 4, ring); road(-iw + ring / 2, 0, ring, SD - 4); road(iw - ring / 2, 0, ring, SD - 4);
  const tower = isTower(L.type);
  if (!tower) {
    { const za = -id + ring, zb = P.zFront + P.street; road(0, (za + zb) / 2, P.spine, zb - za); } // spine
    for (let b = 0; b < P.nb; b++) { const zs = P.zFront + P.street / 2 - b * (P.bd + P.street); road(0, zs, SW - 4, P.street); }
    // per-lot drive + front lawn edge, street trees and lamps on the verges
    const dr = [], hed = [];
    for (const lot of P.lots) {
      const f = Math.cos(lot.r) > 0 ? 1 : -1, zf = lot.z + f * P.ld / 2;
      dr.push([lot.x - P.lw * .28, .14, zf - f * 2.2, 3, .05, 4.4]);
      hed.push([lot.x + P.lw / 2 - .25, .12, lot.z, .5, .7, P.ld - 1.2]);
    }
    kerbs.push(...dr); g.add(inst(hed, std('hedge', { color: 0x5e7a3e, roughness: .95 }), null, true));
    for (let b = 0; b < P.nb; b++) { const zs = P.zFront + P.street / 2 - b * (P.bd + P.street); for (let x = -iw + ring + 6; x < iw - ring - 4; x += 16) { if (Math.abs(x) < P.spine / 2 + 3) continue; tl.push({ x, z: zs + (b % 2 ? 1 : -1) * (P.street / 2 - .6) * (x > 0 ? 1 : -1), s: .75 + r() * .3, k: st === 'tropical' || st === 'indian' ? (r() < .5 ? 'palm' : 'broad') : 'broad' }); } for (let x = -iw + ring + 12; x < iw - ring; x += 28) lamps.push([x, zs - P.street / 2 + .4]); }
  } else {
    // podium deck and internal drive loop around the towers
    const ext = (P.cols - 1) * P.gx / 2 + P.lw / 2 + 6, ez = (P.rows - 1) * P.gz / 2 + P.ld / 2 + 6, cz = P.z0 - (P.rows - 1) * P.gz / 2;
    road(0, cz + ez + 3.5, ext * 2 + 7, 7); road(0, cz - ez - 3.5, ext * 2 + 7, 7); road(-ext - 3.5, cz, 7, ez * 2 + 14); road(ext + 3.5, cz, 7, ez * 2 + 14);
    road(0, (cz + ez + id - P.AM) / 2 + 2, 8, Math.max(2, id - ring - (cz + ez + 7)) + 2);
    if (L.podH) {
      const pm = clad(st, st === 'glass' ? 'concrete' : PAL[st].clad), h = L.podH;
      g.add(B(ext * 2, h - .3, ez * 2, pm, 0, .12, cz));
      g.add(B(ext * 2 + .3, .3, ez * 2 + .3, slabMatComm(st), 0, h - .18, cz));
      const op = []; for (let x = -ext + 3; x < ext - 2; x += 6) for (const s of [-1, 1]) for (const y of [1.6, 4.6]) op.push([x + 2.2, y, cz + s * (ez + .01), 4.2, 1.4, .06]);
      for (let z = -ez + 3; z < ez - 2; z += 6) for (const s of [-1, 1]) for (const y of [1.6, 4.6]) op.push([s * (ext + .01), y, cz + z + 2.2, .06, 1.4, 4.2]);
      g.add(inst(op, std('podOpen', { color: 0x1a1c1f, roughness: .9 })));
      g.add(B(ext * 2 - 2, .06, ez * 2 - 2, mat.lawn(), 0, h, cz, false, 0));
      const pt = []; for (let k = 0; k < 18; k++) { const x = (r() - .5) * (ext * 2 - 6), z = cz + (r() - .5) * (ez * 2 - 6); if (P.lots.some(l => Math.abs(l.x - x) < P.lw / 2 + 3 && Math.abs(l.z - z) < P.ld / 2 + 3)) continue; pt.push({ x, z, s: .6, k: 'frangipani', y: h }); }
      trees(g, pt, true);
    }
    for (let x = -ext - 7; x <= ext + 7; x += 14) for (const z of [cz + ez + 8.5, cz - ez - 8.5]) tl.push({ x, z, s: .8 + r() * .3, k: 'broad' });
    for (let x = -ext; x <= ext; x += 22) lamps.push([x, cz + ez + 7.4]);
  }
  g.add(inst(roads, asph)); if (kerbs.length) g.add(inst(kerbs, pave));
  // boundary wall with a gate gap at the front centre
  const wh = 2.1, gap = 14, wl = [];
  wl.push([0, wh / 2, -SD / 2 + .2, SW, wh, .35], [-SW / 2 + .2, wh / 2, 0, .35, wh, SD], [SW / 2 - .2, wh / 2, 0, .35, wh, SD]);
  const seg = (SW - gap) / 2; wl.push([-(gap / 2 + seg / 2), wh / 2, SD / 2 - .2, seg, wh, .35], [gap / 2 + seg / 2, wh / 2, SD / 2 - .2, seg, wh, .35]);
  g.add(inst(wl, clad(st, st === 'glass' || st === 'modern' ? 'concrete' : 'stone'), null, true));
  const cap = wl.map(w => [w[0], wh + .06, w[2], w[3] + .1, .12, w[5] + .1]); g.add(inst(cap, trim));
  // gate: pylons, a canopy beam, guard house
  const gz = SD / 2 - .2;
  g.add(B(1.4, 5.2, 1.4, clad(st, 'stone'), -gap / 2 - .4, 0, gz), B(1.4, 5.2, 1.4, clad(st, 'stone'), gap / 2 + .4, 0, gz));
  g.add(B(gap + 3.6, .7, 2.4, trim, 0, 4.6, gz), B(gap - 2, .05, .1, mat.gold(), 0, 4.9, gz + 1.21, false));
  g.add(B(3.4, 2.8, 3, clad(st, PAL[st].clad), gap / 2 + 4, 0, gz - 3), B(3.8, .25, 3.4, trim, gap / 2 + 4, 2.8, gz - 3));
  road(0, gz + 6, gap + 4, 12); g.add(inst([[0, .14, gz + 6, gap + 4, .06, 12]], asph));
  // amenity zone between gate and homes: clubhouse, pool, gardens, courts, jogging loop
  const az = SD / 2 - 2 - ring - P.AM / 2, aw = SW - 2 * (ring + 6), big = L.ex.has('club');
  const cw = Math.min(big ? 34 : 26, aw * .32), cd = Math.min(16, P.AM - 14), cx = -aw / 2 + cw / 2 + 2, ch = big ? 2 : 1;
  for (let f = 0; f < ch; f++) {
    const y = .12 + f * 4.2, w = f ? cw * .7 : cw;
    g.add(B(w, 3.9, cd, f ? clad(st, PAL[st].clad) : mat.glass(), cx - (f ? cw * .12 : 0), y, az));
    g.add(B(w + .6, .32, cd + .6, trim, cx - (f ? cw * .12 : 0), y + 3.9, az));
    if (!f) { const mu = []; for (let x = -w / 2 + 1.5; x < w / 2; x += 2.4) mu.push([cx + x, y + 1.95, az + cd / 2 + .02, .12, 3.9, .12]); g.add(inst(mu, mat.frame(st, L.tier), null, true)); g.add(B(w - 1, 3.5, cd - 1, mat.intCore(), cx, y, az, false, 0)); }
  }
  g.add(B(cw * .6, .06, 1.2, mat.gold(), cx, .12 + ch * 4.2 + .1, az + cd / 2 - .1, false));
  const pxs = cx + cw / 2 + 4;
  if (L.ex.has('pool')) { const pw = Math.min(25, aw * .25), pd = Math.min(12, P.AM - 18); g.add(B(pw + 4, .2, pd + 4, mat.deck(), pxs + pw / 2 + 2, .12, az, false, 0)); g.add(B(pw + .4, .14, pd + .4, paveD, pxs + pw / 2 + 2, .3, az, false)); g.add(B(pw, .05, pd, mat.water(), pxs + pw / 2 + 2, .4, az, false, 0)); }
  const sx = pxs + (L.ex.has('pool') ? Math.min(25, aw * .25) + 10 : 4);
  if (L.ex.has('sports')) { const cm = std('court', { color: 0x3d6f5a, roughness: .85 }), lm = std('courtLine', { color: 0xf2efe6, roughness: .8 }); for (let k = 0; k < 2; k++) { const x = sx + 9 + k * 20; if (x + 9 > aw / 2) break; g.add(B(17, .06, 32 > P.AM - 6 ? P.AM - 10 : 32, cm, x, .14, az, false, 0)); g.add(B(.1, .02, (P.AM - 10) * .9, lm, x, .2, az, false, 0), B(15, .02, .1, lm, x, .2, az, false, 0)); g.add(B(16, 1, .04, std('net', { color: 0x222222, roughness: 1, transparent: true, opacity: .5 }), x, .2, az, false)); } }
  if (L.ex.has('garden') || !L.ex.size) { const hb = []; for (let k = 0; k < 10; k++) { const x = (r() - .5) * aw, z = az + (r() - .5) * (P.AM - 8); if (x < cx + cw / 2 + 2 && x > cx - cw / 2 - 2 && Math.abs(z - az) < cd / 2 + 2) continue; if (L.ex.has('pool') && x > pxs && x < pxs + 30 && Math.abs(z - az) < 9) continue; if (L.ex.has('sports') && x > sx) continue; tl.push({ x, z, s: .7 + r() * .5, k: r() < .3 ? 'frangipani' : 'broad' }); } }
  if (L.ex.has('jog')) { const jt = std('jog', { color: 0xa0523d, roughness: .9 }), ww = 1.8, J = [], jw = SW - 2 * ring - 9, jd = SD - 2 * ring - 9; J.push([0, .2, jd / 2, jw, .03, ww], [0, .2, -jd / 2, jw, .03, ww], [-jw / 2, .2, 0, ww, .03, jd], [jw / 2, .2, 0, ww, .03, jd]); g.add(inst(J, jt)); }
  // perimeter trees just inside the wall, landscaped verge
  for (let x = -SW / 2 + 4; x < SW / 2 - 3; x += 11) { tl.push({ x, z: -SD / 2 + 3.2, s: .9 + r() * .3, k: 'broad' }); if (Math.abs(x) > gap / 2 + 6) tl.push({ x, z: SD / 2 - 3.2, s: .9 + r() * .3, k: st === 'classic' ? 'cypress' : 'broad' }); }
  for (let z = -SD / 2 + 9; z < SD / 2 - 6; z += 11) { tl.push({ x: -SW / 2 + 3.2, z, s: .9 + r() * .3, k: 'broad' }, { x: SW / 2 - 3.2, z, s: .9 + r() * .3, k: 'broad' }); }
  trees(g, tl, tl.length > 120);
  const pole = [], head = []; for (const [x, z] of lamps) { pole.push([x, 2.4, z, .12, 4.8, .12]); head.push([x, 4.85, z, .5, .12, .5]); }
  for (const s of [-1, 1]) { pole.push([s * (gap / 2 + 2.4), 1.8, gz + 1.6, .14, 3.6, .14]); head.push([s * (gap / 2 + 2.4), 3.7, gz + 1.6, .4, .3, .4]); }
  if (pole.length) { g.add(inst(pole, mat.steel(), null, true)); g.add(inst(head, mat.lamp())); }
  return g;
}
function slabMatComm(st) { return ['glass', 'modern'].includes(st) ? mat.trim('modern') : mat.trim(st); }
function societyParts(L) {
  const s = sig([L.type, L.plan.SW, L.plan.SD, L.plan.n, L.style, L.tier, L.variant, L.unit.levels.length, L.podH, [...L.ex].sort(), L.park, L.lite, L.unit.ex.has('solar'), L.unit.ex.has('terrace')]);
  return [
    { key: 'ctx-' + (S.loc || 'default') + '-' + Math.round(Math.max(L.pw, L.pd) + L.H), anim: 'rise', dur: 1400, make: () => contextPart(S.loc || 'default', Math.max(L.pw, L.pd) / 2 + L.H * 1.1) },
    { key: 'soc-site' + s, anim: 'grow', dur: 800, make: () => societyPart(L) },
    { key: 'soc-units' + s, anim: 'rise', d: 200, dur: 1100, make: () => unitsPart(L) },
  ];
}
