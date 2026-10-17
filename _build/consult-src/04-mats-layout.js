
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
