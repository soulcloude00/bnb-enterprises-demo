
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
function lawnPlane(w, d, y) { // mown stripes + low-frequency patches so the lawn isn't one flat colour
  const nx = clamp(Math.round(w / 1.5), 8, 120), nz = clamp(Math.round(d / 1.5), 8, 120);
  const geo = new T.PlaneGeometry(w, d, nx, nz).rotateX(-Math.PI / 2), p = geo.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), stripe = (Math.floor((x + w / 2) / 2.4) % 2) ? .055 : -.035;
    const n = Math.sin(x * .21 + Math.cos(z * .17) * 1.7) * .05 + Math.sin(z * .37 - x * .11) * .035;
    const k = .93 + stripe + n; c[i * 3] = k * .93; c[i * 3 + 1] = k * 1.02; c[i * 3 + 2] = k * .84;
  }
  geo.setAttribute('color', new T.BufferAttribute(c, 3)); worldUV(geo);
  const m = new T.Mesh(geo, mat.terrain()); m.position.y = y; m.receiveShadow = true; return m;
}
function plotPart(L) {
  const g = new T.Group(), { pw, pd } = L;
  g.add(B(pw, .12, pd, mat.lawn(), 0, 0, 0, false, 0)); g.add(lawnPlane(pw, pd, .121));
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
    const x = (r() - .5) * (pw - 2.4), z = (r() - .5) * (pd - 2.4), s = (.7 + r() * .45) * sc; if (occ(x, z, 1.6 + 2.4 * s)) continue; // canopy + eaves clearance
    if (tl.some(o => Math.hypot(o.x - x, o.z - z) < 3.2 * sc)) continue;
    tl.push({ x, z, s, k: kinds[n % kinds.length] }); n++;
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
  g.add(B(z0.w - 1, .5, .6, pm, z0.x, z0.y, z0.z + z0.d / 2 - .95), B(.6, .5, z0.d - 2, pm, z0.x - z0.w / 2 + .95, z0.y, z0.z));
  hedgeRow(g, z0.x - z0.w / 2 + 1.3, z0.z + z0.d / 2 - .95, z0.x + z0.w / 2 - 1.3, z0.z + z0.d / 2 - .95, .55, .5, z0.y + .45);
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
