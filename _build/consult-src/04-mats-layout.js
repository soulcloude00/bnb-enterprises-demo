
/* ---------- palettes & materials */
const PAL = {
  model: { wall: 0xe9e3d8, base: 0xd2c9b8, trim: 0xf1ece3, frame: 0x8f877b, clad: 'render', roofM: 'slate', pitched: false, stone: 0xffffff, timber: 0xffe2c4 },
  modern: { wall: 0xf3efe7, base: 0x55565a, trim: 0xe9e4da, frame: 0x1d1e21, clad: 'render', roofM: 'metal', pitched: false, stone: 0xf4ece0, timber: 0xffd6b0 },
  glass: { wall: 0x3b3e44, base: 0x2b2d31, trim: 0x2a2c30, frame: 0x16171a, clad: 'dark', roofM: 'metal', pitched: false, stone: 0xd8d4ce, timber: 0xd9b090 },
  classic: { wall: 0xf0e4cb, base: 0xd9c9a8, trim: 0xfbf7ef, frame: 0xf6f1e6, clad: 'render', roofM: 'slate', pitched: 'hip', stone: 0xffffff, timber: 0xf2caa0 },
  tropical: { wall: 0xe7dcc8, base: 0x6d655b, trim: 0xd9ccb4, frame: 0x3e2b1c, clad: 'render', roofM: 'slate', pitched: 'hip', low: true, stone: 0xf6eadb, timber: 0xffd2a4 },
  indian: { wall: 0xdba86d, base: 0xa86448, trim: 0xf1e2c4, frame: 0x5c3319, clad: 'render', roofM: 'tile', pitched: 'gable', stone: 0xffc8a8, timber: 0xf0b890 },
};
// material cache: envBase scales with the lighting mode's env intensity; emis tags drive per-mode emissive levels
function std(key, p, Ctor) {
  if (M[key]) return M[key];
  const { envI = 1, emis, k, ...q } = p;
  const m = new (Ctor || T.MeshStandardMaterial)(q);
  m.userData.envBase = envI; if (emis) { m.userData.emis = emis; m.userData.k = k || 1; }
  if (m.isMeshStandardMaterial) { m.envMap = scene.environment; m.envMapIntensity = envI * LM.env; }
  M[key] = m; if (emis) updateEmissives(); return m;
}
const phys = (key, p) => std(key, p, T.MeshPhysicalMaterial);
function texd(key, set, p, Ctor) {
  return std(key, Object.assign({ map: tex(set, 'col'), normalMap: tex(set, 'nrm'), roughnessMap: tex(set, 'rgh'), roughness: 1 }, p), Ctor);
}
function setGlassQ(m) {
  const hi = quality === 'high';
  m.transmission = hi ? 1 : 0; m.transparent = !hi; m.opacity = hi ? 1 : m.userData.op; m.depthWrite = hi; m.needsUpdate = true;
}
function glassMat(key, color, op = .28, rough = .03) {
  if (M[key]) return M[key];
  const m = phys(key, { color, metalness: 0, roughness: rough, ior: 1.5, thickness: .04, specularIntensity: 1, envI: 1.5, side: T.FrontSide });
  m.userData.glass = true; m.userData.op = op; setGlassQ(m); return m;
}
const INT = [];
function interiorTex(v) {
  if (INT[v]) return INT[v];
  return (INT[v] = canvasTex(256, 256, (g, w, h) => {
    const r = rng(31 + v * 7);
    const pal = [['#ffcf94', '#d9944f', '#5a3a22'], ['#fff0d8', '#d2b48e', '#4a4038'], ['#f0b77a', '#7d5236', '#2a1c14']][v];
    let gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, pal[0]); gr.addColorStop(.55, pal[1]); gr.addColorStop(1, pal[2]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,250,235,.95)'; g.fillRect(w * .1, 6, w * .8, 7); // ceiling light strip
    for (let i = 0; i < 3; i++) { const x = r() * w, rg = g.createRadialGradient(x, 30, 2, x, 30, 70); rg.addColorStop(0, 'rgba(255,240,210,.7)'); rg.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); }
    g.fillStyle = 'rgba(40,25,15,.75)'; // furniture silhouettes
    g.fillRect(w * (.15 + r() * .2), h * .72, w * .32, h * .12); g.fillRect(w * .62, h * .4, w * .06, h * .48);
    g.fillRect(w * .7, h * .3, w * .22, h * .03); g.fillRect(w * .7, h * .5, w * .22, h * .03);
    g.beginPath(); g.arc(w * .1, h * .62, w * .07, 0, 7); g.fill(); g.fillRect(w * .09, h * .62, w * .02, h * .26);
    if (v === 2) { g.fillStyle = 'rgba(20,14,10,.55)'; for (let y = 0; y < h; y += 9) g.fillRect(0, y, w, 4); } // blinds
  }));
}
function clad(style, c) {
  const P = PAL[style] || PAL.model;
  switch (c) {
    case 'stone': return texd('stone-' + style, 'stone', { color: P.stone, normalScale: new T.Vector2(1.2, 1.2) });
    case 'timber': return texd('timber-' + style, 'siding', { color: P.timber, envI: .6 });
    case 'stone2': return texd('stone2-' + style, 'stone', { color: 0xffffff });
    case 'concrete': return texd('conc-' + style, 'concrete', { color: 0xd4d0c8, normalScale: new T.Vector2(.6, .6) });
    case 'dark': return texd('dark-' + style, 'concrete', { color: 0x4a4c52, metalness: .35, roughness: .7, normalScale: new T.Vector2(.4, .4) });
    case 'trim': return texd('trimr-' + style, 'plaster', { color: P.trim, normalScale: new T.Vector2(.35, .35) });
    case 'base': return texd('baser-' + style, 'plaster', { color: P.base, normalScale: new T.Vector2(.5, .5) });
    default: return texd('render-' + style, 'plaster', { color: P.wall, normalScale: new T.Vector2(.45, .45) });
  }
}
const mat = {
  ghost: () => std('ghost', { color: 0xe9e1d2, roughness: .6, transparent: true, opacity: .3, depthWrite: false }),
  trim: s => clad(s, 'trim'),
  base: s => clad(s, 'base'),
  frame: (s, tier) => tier === 'luxury' && s !== 'classic' ? mat.gold() : std('frame-' + s, { color: PAL[s].frame, roughness: .42, metalness: ['modern', 'glass', 'model'].includes(s) ? .7 : 0, envI: 1.1 }),
  roofT: (s, m) => {
    m = m || PAL[s].roofM;
    if (m === 'tile') return texd('rooftile', 'tileroof', { color: 0xf2e2d6, side: T.DoubleSide });
    if (m === 'metal') return std('roofmetal-' + s, { color: s === 'glass' ? 0x3a3c40 : 0x45474c, roughness: .45, metalness: .75, side: T.DoubleSide, envI: 1.1 });
    if (m === 'thatch') return texd('roofthatch', 'deck', { color: 0x8a6a48, side: T.DoubleSide });
    return texd('roofslate-' + s, 'slate', { color: s === 'tropical' ? 0x8a8078 : 0xb4b4bc, side: T.DoubleSide });
  },
  gold: () => std('gold', { color: 0xd7b77c, roughness: .26, metalness: 1, envI: 1.6 }),
  glass: () => glassMat('glass', 0xe3eef0, .26),
  glassD: () => glassMat('glassD', 0xb9cbd6, .45, .02),
  rail: () => glassMat('railg', 0xd6e6ea, .22),
  int: v => std('int' + v, { color: 0x111111, roughness: .9, emissive: 0xffffff, emissiveMap: interiorTex(v), emis: 'win', k: [1, .85, .55][v], envI: .2 }),
  intCore: () => std('intcore', { color: 0x111111, roughness: .9, emissive: 0xffffff, emissiveMap: (() => { const t = interiorTex(0).clone(); t.repeat.set(.24, .3); t.needsUpdate = true; return t; })(), emis: 'win', k: .9 }),
  conc: () => texd('concG', 'concrete', { color: 0xbab6ae }),
  pave: () => texd('pave', 'paving', { color: 0xe2dacd }),
  paveD: () => texd('paveD', 'stone', { color: 0xe8e0d4 }),
  deck: () => texd('deck', 'deck', { color: 0xe0c3a4, envI: .7 }),
  lawn: () => texd('lawn', 'lawn', { color: 0xd2dcb4, roughnessMap: null, roughness: .95, normalScale: new T.Vector2(.6, .6), envI: .5 }),
  pooltile: () => texd('pooltile', 'pooltile', { color: 0xbfe2ea, emissive: 0x0e7f9c, emis: 'pool', envI: .8 }),
  asph: () => texd('asph', 'concrete', { color: 0x4a4a4e, normalScale: new T.Vector2(.5, .5) }),
  soil: () => std('soil', { color: 0x5b4a37, roughness: 1 }),
  terrain: () => texd('terrain', 'lawn', { color: 0xd8dcbc, vertexColors: true, roughnessMap: null, roughness: 1, normalScale: new T.Vector2(.5, .5), envI: .45 }),
  water: () => {
    if (M.water) return M.water;
    if (!TX.waterN) { TX.waterN = waterNormal(); }
    return phys('water', { color: 0x2a9fbf, roughness: .04, metalness: 0, transmission: 0, transparent: true, opacity: .86, normalMap: TX.waterN, normalScale: new T.Vector2(.35, .35), clearcoat: 1, clearcoatRoughness: .05, envI: 1.4, emissive: 0x0b6f8a, emis: 'pool' });
  },
  leaf: k => std('leaf' + k, { color: 0xffffff, roughness: .8, envI: .45 }),
  trunk: () => std('trunk', { color: 0x3b3029, roughness: 1 }),
  wood: () => texd('woodm', 'deck', { color: 0xc08a5c, envI: .3 }),
  steel: () => std('steel', { color: 0xb8bcc2, roughness: .32, metalness: .9, envI: 1.2 }),
  black: () => std('black', { color: 0x0b0b0d, roughness: .85 }),
  rubber: () => std('rubber', { color: 0x161618, roughness: .7 }),
  solar: () => std('solar', { color: 0xffffff, roughness: .18, metalness: .4, map: solarTex(), envI: 1.5 }),
  theatre: () => std('theatre', { color: 0x10122a, emissive: 0x6d74ff, emissiveIntensity: 1.2, roughness: .4 }),
  lamp: () => std('lamp', { color: 0xfff1d6, emissive: 0xffc983, emis: 'lamp' }),
  kerbL: () => std('kerbL', { color: 0xfff1d6, emissive: 0xffc983, emis: 'kerb' }),
  peg: () => std('peg', { color: 0xc9a96e, emissive: 0xc9a96e, emissiveIntensity: .5, roughness: .4, metalness: .6 }),
  edge: () => M.edge || (M.edge = new T.LineBasicMaterial({ color: 0xd8b97e, transparent: true, opacity: .9 })),
  city: () => std('city', { color: 0xb8b2a8, roughness: .85, map: cityTex(1), emissive: 0xffffff, emissiveMap: cityTex(), emis: 'city', envI: .5 }),
  shadow: () => M.shadow || (M.shadow = new T.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: .55, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -2 })),
  pool2: () => std('pool2', { color: 0xffc27a, map: radialTex(), transparent: true, depthWrite: false, blending: T.AdditiveBlending, emis: 'pool2', fog: false }, T.MeshBasicMaterial),
};
function solarTex() { return TX.solar || (TX.solar = canvasTex(128, 192, (g, w, h) => { g.fillStyle = '#152349'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7c8ec4'; g.lineWidth = 2; for (let x = 0; x <= w; x += w / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } })); }
function cityTex(alb) { const k = alb ? 'cityA' : 'city'; return TX[k] || (TX[k] = canvasTex(64, 128, (g, w, h) => { g.fillStyle = alb ? '#cfc8bc' : '#000'; g.fillRect(0, 0, w, h); const r = rng(7); for (let y = 4; y < h; y += 8) for (let x = 3; x < w; x += 8) { const lit = r() < .33, c = r(), a = .35 + r() * .5; if (alb) { g.fillStyle = '#3a3f47'; g.globalAlpha = .9; g.fillRect(x, y, 4, 5); } else if (lit) { g.fillStyle = c < .7 ? '#ffcf8f' : '#cfe3ff'; g.globalAlpha = a; g.fillRect(x, y, 4, 4); } } if (alb) { g.globalAlpha = 1; g.fillStyle = '#b5ad9f'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 1); } })); }
function radialTex() { return TX.radial || (TX.radial = canvasTex(128, 128, (g, w, h) => { const rg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(.4, 'rgba(255,255,255,.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); })); }
function shadowTex() { // soft rounded-rect falloff: stretches cleanly under boxes, cars and trees
  return TX.shadow || (TX.shadow = canvasTex(128, 128, (g, w, h) => {
    const id = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = Math.max(0, Math.abs(x - w / 2 + .5) - w * .26) / (w * .24), dy = Math.max(0, Math.abs(y - h / 2 + .5) - h * .26) / (h * .24), d = Math.min(1, Math.hypot(dx, dy)); id.data[(y * w + x) * 4 + 3] = 255 * Math.pow(1 - d, 2); }
    g.putImageData(id, 0, 0);
  }, false));
}
function waterNormal() {
  const t = canvasTex(256, 256, (g, w, h) => {
    const id = g.createImageData(w, h), H = (x, y) => { const a = x / w * Math.PI * 2, b = y / h * Math.PI * 2; return Math.sin(a * 3 + Math.sin(b * 2) * 1.5) * .5 + Math.sin(b * 5 + a * 2) * .3 + Math.sin((a - b) * 7) * .15 + Math.sin(a * 11 + b * 4) * .07; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = H(x + 1, y) - H(x - 1, y), dy = H(x, y + 1) - H(x, y - 1), l = Math.hypot(dx * 3, dy * 3, 1), i = (y * w + x) * 4; id.data[i] = 128 + 127 * (-dx * 3 / l); id.data[i + 1] = 128 + 127 * (-dy * 3 / l); id.data[i + 2] = 255 / l; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0);
  }, false);
  t.repeat.set(.35, .35); return t;
}

/* ---------- layout: everything in metres, plot centred on the origin, road on +z.
   Each design variant is a stack of levels of volumes; roofs are assigned from coverage. */
const effStyle = st => st.style || ((variantRow(st) || [])[3]) || 'model';
function vol(x, z, w, d, o = {}) { return Object.assign({ x, z, w, d, kind: 'solid' }, o); }
function variantLevels(type, v, W, D, n, P) {
  const lv = [], dec = [], rep = (k, f) => { for (let i = 0; i < k; i++) lv.push(f(i)); };
  const top = i => i === n - 1;
  switch (type + '/' + v) {
    case 'villa/cantilever':
      lv.push([vol(-W * .2, -D * .1, W * .5, D * .7, { clad: 'stone' }), vol(W * .27, -D * .14, W * .42, D * .6, { kind: 'glazed' })]);
      if (n > 1) lv.push([vol(W * .05, D * .07, W * .98, D * .48, { clad: 'render', ribbon: true })]);
      for (let i = 2; i < n; i++) lv.push([vol(i % 2 ? -W * .18 : W * .12, -D * .12, W * .48, D * .44, { clad: i % 2 ? 'timber' : 'render' })]);
      if (n === 1) lv[0].push(vol(-W * .2, D * .3, W * .5, D * .12, { h: .3, kind: 'canopy' }));
      dec.push({ k: 'pond', x: W * .3, z: D * .3, w: W * .38, d: 1.6 });
      break;
    case 'villa/courtyard':
      lv.push([vol(0, -D * .32, W, D * .36, { roof: 'gable-x' }), vol(-W * .37, D * .14, W * .26, D * .56, { roof: 'gable-z', clad: 'stone' }), vol(W * .37, D * .14, W * .26, D * .56, { roof: 'gable-z', clad: 'stone' })]);
      for (let i = 1; i < n; i++) lv.push([vol(0, -D * .32, W * (i === 1 ? .74 : .5), D * .34, { roof: 'hip', clad: i === 1 ? 'timber' : 'render' })]);
      dec.push({ k: 'court', x: 0, z: D * .12, w: W * .46, d: D * .5 }, { k: 'pergola', x: 0, z: D * .4, w: W * .44, d: 2.4 });
      break;
    case 'villa/palladian': {
      const cw = W * .46, cd = D * .78;
      lv.push([vol(0, 0, cw, cd, { roof: 'hip' }), vol(-W * .37, -D * .1, W * .28, D * .5, { roof: 'flat', bal: true }), vol(W * .37, -D * .1, W * .28, D * .5, { roof: 'flat', bal: true })]);
      for (let i = 1; i < n; i++) lv.push([vol(0, 0, cw, cd, { roof: 'hip' })]);
      dec.push({ k: 'portico', x: 0, z: cd / 2, w: Math.min(cw * .8, 9), floors: Math.min(2, n), ped: true });
      break; }
    case 'apartment/tower': {
      const pod = n > 5 ? 2 : 1;
      rep(Math.min(pod, n), () => [vol(0, 0, W, D, { kind: 'glazed' })]);
      for (let i = pod; i < n; i++) lv.push([vol(W * .14, -D * .06, W * .56, D * .66, { kind: 'glazed', fins: true })]);
      dec.push({ k: 'crown', lvl: n - 1 });
      break; }
    case 'apartment/terraced': {
      const k = Math.min(.13, .6 / Math.max(1, n - 1));
      rep(n, i => [vol(0, -D * k * i / 2, W * (1 - (i > n * .6 ? .1 : 0)), D * (1 - k * i), { clad: i % 3 === 2 ? 'timber' : 'render', planters: true })]);
      break; }
    case 'apartment/deco':
      rep(n, i => {
        const f = i / Math.max(1, n), s = f > .82 ? .5 : f > .62 ? .74 : 1;
        const a = [vol(0, 0, W * s, D * (s === 1 ? 1 : s + .1), { pil: true, roof: 'flat' })];
        if (s === 1) a.push(vol(0, D / 2 + .5, W * .26, 1, { clad: 'trim', pil: true, roof: 'flat' }));
        return a;
      });
      dec.push({ k: 'spire', lvl: n - 1 });
      break;
    case 'commercial/podium':
      lv.push([vol(0, 0, W, D, { kind: 'glazed' })]);
      if (n > 1) lv.push([vol(0, 0, W, D, { clad: 'stone', ribbon: true })]);
      for (let i = 2; i < n; i++) lv.push([vol(-W * .2, -D * .12, W * .52, D * .62, { kind: 'glazed', fins: true })]);
      if (n <= 2) lv.push([vol(-W * .2, -D * .12, W * .52, D * .62, { kind: 'glazed', fins: true })]);
      dec.push({ k: 'canopy', x: W * .2, z: D / 2 + 1.2, w: W * .4, d: 2.4, y: 3.6 });
      break;
    case 'commercial/campus':
      rep(n, () => [vol(-W * .32, 0, W * .36, D * .88, { clad: 'concrete', fins: true }), vol(W * .32, -D * .05, W * .36, D * .78, { clad: 'concrete', fins: true }), vol(0, -D * .02, W * .3, D * .46, { kind: 'glazed' })]);
      dec.push({ k: 'canopy', x: 0, z: D * .23 + 1.4, w: W * .34, d: 3, y: 3.2 });
      break;
    case 'commercial/twist': {
      const s = Math.min(W, D) * .86;
      rep(Math.max(n + 1, 5), i => [vol(0, 0, s, s, { kind: 'glazed', rot: i * .13, slab: .55 })]);
      break; }
    case 'row/gabled': case 'row/staggered': case 'row/sawtooth': {
      const u = P.units, uw = W / u;
      for (let i = 0; i < n; i++) {
        const a = [];
        for (let k = 0; k < u; k++) {
          const x = -W / 2 + uw * (k + .5);
          if (v === 'gabled') a.push(vol(x, (k % 2 ? -.4 : .4), uw - .14, D - .8, { roof: 'gable-z', unit: k }));
          else if (v === 'staggered') { if (i === n - 1 && k % 2 && n > 1) continue; a.push(vol(x, (k % 2 ? -1.1 : .5) - (i ? .9 : 0), uw - .1, D * (k % 2 ? .8 : .92) - (i ? 1.4 : 0), { roof: 'flat', clad: k % 2 ? 'timber' : 'render', unit: k })); }
          else a.push(vol(x, -1.3, uw - .14, D - 2.6, { roof: i === n - 1 ? 'mono-x' : 'flat', unit: k, clad: k % 2 ? 'render' : 'stone' }));
        }
        lv.push(a);
      }
      for (let k = 0; k < u; k++) { const x = -W / 2 + uw * (k + .5); if (v === 'gabled') dec.push({ k: 'porch', x, z: D / 2 - .4 + (k % 2 ? -.8 : 0), w: Math.min(2.6, uw * .5), d: 1.5 }); if (v === 'sawtooth') dec.push({ k: 'pergola', x, z: D / 2 - 1.1, w: uw - .8, d: 2 }); }
      break; }
    case 'farm/ranch':
      lv.push([vol(W * .1, -D * .16, W * .8, D * .42, { roof: 'gable-x', clad: 'stone' }), vol(-W * .36, D * .2, W * .26, D * .44, { roof: 'gable-z' })]);
      for (let i = 1; i < n; i++) lv.push([vol(W * .12, -D * .18, W * .34, D * .34, { roof: 'gable-x', clad: 'timber' })]);
      dec.push({ k: 'verandah', x: W * .14, z: -D * .16 + D * .21 + 1.4, w: W * .7, d: 2.8 });
      break;
    case 'farm/barn': {
      const bh = Math.max(1, Math.min(n, 2));
      for (let i = 0; i < bh; i++) lv.push([vol(-W * .28, 0, W * .3, D * .82, { roof: 'barn', clad: 'timber', gableGlass: true }), vol(W * .28, -D * .06, W * .3, D * .7, { roof: 'barn', clad: 'dark', gableGlass: true }), ...(i === 0 ? [vol(0, -D * .05, W * .26, D * .36, { kind: 'glazed', roof: 'flat' })] : [])]);
      for (let i = bh; i < n; i++) lv.push([vol(-W * .28, 0, W * .3, D * .82, { roof: 'barn', clad: 'timber', gableGlass: true })]);
      break; }
    case 'farm/hacienda':
      lv.push([vol(0, -D * .37, W, D * .26, { roof: 'gable-x' }), vol(-W * .4, .3, W * .2, D * .48, { roof: 'gable-z' }), vol(W * .4, .3, W * .2, D * .48, { roof: 'gable-z' }), vol(-W * .29, D * .37, W * .42, D * .24, { roof: 'gable-x' }), vol(W * .29, D * .37, W * .42, D * .24, { roof: 'gable-x' })]);
      for (let i = 1; i < n; i++) lv.push([vol(0, -D * .37, W * .55, D * .24, { roof: 'hip', clad: 'render' })]);
      dec.push({ k: 'fountain', x: 0, z: 0 }, { k: 'court', x: 0, z: 0, w: W * .5, d: D * .42, paved: true });
      break;
    case 'unsure/spread':
      lv.push([vol(-W * .15, -D * .1, W * .66, D * .5), vol(W * .3, D * .12, W * .36, D * .5)]);
      for (let i = 1; i < n; i++) lv.push([vol(-W * .15, -D * .1, W * .5, D * .42)]);
      break;
    case 'unsure/stacked':
      rep(n, i => [vol(i % 2 ? W * .1 : -W * .08, i % 2 ? -D * .1 : D * .04, W * (.7 - i * .05), D * (.68 - i * .04), { kind: i % 2 ? 'glazed' : 'solid' })]);
      break;
    default: // unsure/compact and the neutral "help me decide" model
      rep(n, i => [vol(0, i ? -D * .04 : 0, W * (i ? .9 : .86), D * (i ? .82 : .86))]);
  }
  return { lv, dec };
}
function layoutOf(st = S, opt = {}) {
  const [W0, D0] = opt.plot || plotFt(st); const pw = W0 * FT, pd = D0 * FT;
  const type = st.type || null, tier = st.tier || 'standard', cons = st.cons || 'advise';
  const vrow = variantRow(st), variant = vrow ? vrow[0] : null;
  const ghost = type === 'unsure' && !variant && !st.style;
  const style = ghost ? 'model' : effStyle(st);
  const ex = new Set(opt.bare ? [] : (st.extras || [])), park = opt.bare ? 'none' : (st.park || 'none');
  const fh = { villa: 3.3, apartment: 3.05, commercial: 4.0, row: 3.2, farm: 3.6, unsure: 3.3 }[type] || 3.2;
  const defF = { villa: 2, apartment: 4, commercial: 3, row: 2, farm: 1, unsure: 2 }[type] || 2;
  const nF = { g1: 2, g2: 3, g3: 4, hr: 16 }[st.floors] || defF;
  const L = { pw, pd, type, variant, style, tier, cons, ex, park, ghost, fh, nF, levels: [], decor: [], flatZones: [], slopes: [], thumb: !!opt.bare };
  if (!type) { L.H = 0; return L; }
  let side = clamp(pw * .08, .9, 5), front = clamp(pd * .14, 1.5, 10), rear = clamp(pd * .08, 1, 6);
  const smallW = pw < 14;
  const stilt = park === 'three' && (smallW || type === 'apartment' || type === 'commercial');
  const carport = park === 'cov' || (park === 'three' && !stilt);
  if (carport) front = Math.max(front, 6.4);
  if (park === 'base') front = Math.max(front, 7.6);
  if (ex.has('wall')) { side = Math.max(side, 1.1); rear = Math.max(rear, 1.3); }
  let poolMode = null;
  if (ex.has('pool')) poolMode = (type === 'commercial' || (type === 'apartment' && (nF > 4 || pd < 25)) || (pd < 16 && type !== 'farm' && type !== 'row')) ? 'roof' : 'ground';
  if (poolMode === 'ground' && type !== 'farm') rear = Math.max(rear, Math.min(6.5, pd * .3));
  if (ex.has('servant') && type !== 'farm') rear = Math.max(rear, Math.min(5, pd * .3));
  const cap = { villa: [22, 17], apartment: [36, 22], commercial: [44, 30], row: [56, 14], farm: [30, 22], unsure: [18, 14] }[type];
  const bw = clamp(Math.min(pw - 2 * side, cap[0]), 4, 999), bd = clamp(Math.min(pd - front - rear, cap[1]), 4, 999);
  const bz = (rear - front) / 2, bx = 0, plinth = 0.45;
  const units = type === 'row' ? clamp(Math.round(bw / 5.2), 2, 8) : 1;
  Object.assign(L, { side, front, rear, stilt, carport, poolMode, bw, bd, bx, bz, plinth, units });
  const { lv, dec } = variantLevels(type, ghost ? 'compact' : (variant || ({ villa: 'cantilever', apartment: 'terraced', commercial: 'podium', row: 'gabled', farm: 'ranch' }[type] || 'compact')), bw, bd, nF, { units });
  // clamp volumes into the plot and offset by the buildable centre
  for (const a of lv) for (const v of a) { v.x += bx; v.z += bz; const mx = pw / 2 - .4, mz = pd / 2 - .4; v.w = Math.min(v.w, 2 * mx); v.d = Math.min(v.d, 2 * mz); v.x = clamp(v.x, -mx + v.w / 2, mx - v.w / 2); v.z = clamp(v.z, -mz + v.d / 2, mz - v.d / 2); }
  for (const d of dec) { if (d.x != null) d.x += bx; if (d.z != null) d.z += bz; }
  const bb = vs => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const v of vs) { const e = v.rot ? Math.hypot(v.w, v.d) / 2 : 0; x0 = Math.min(x0, v.x - (e || v.w / 2)); x1 = Math.max(x1, v.x + (e || v.w / 2)); z0 = Math.min(z0, v.z - (e || v.d / 2)); z1 = Math.max(z1, v.z + (e || v.d / 2)); } return { x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0, x0, x1, z0, z1 }; };
  L.fp = bb(lv[0]);
  let y = plinth;
  if (stilt) { L.levels.push({ i: 0, y, h: 2.9, stilt: true, vols: [vol(L.fp.x, L.fp.z, L.fp.w, L.fp.d, { kind: 'stilt' })] }); y += 2.9; }
  lv.forEach((vols, i) => {
    let h = fh;
    if (type === 'commercial' && i === 0) h = 4.8;
    if (type === 'farm' && variant === 'barn') h = 3.4;
    L.levels.push({ i: L.levels.length, lvl: i, y, h, vols }); y += h;
  });
  L.decor = dec;
  L.bbox = bb(L.levels.flatMap(l => l.vols));
  // roof assignment from coverage of the level above
  const inside = (px, pz, v) => Math.abs(px - v.x) < v.w / 2 + .05 && Math.abs(pz - v.z) < v.d / 2 + .05;
  const pitch = style === 'model' || ghost ? false : PAL[style].pitched;
  let H = y;
  L.levels.forEach((l, li) => {
    const up = L.levels[li + 1] ? L.levels[li + 1].vols : [];
    for (const v of l.vols) {
      let c = 0, n = 0;
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) { n++; if (up.some(u => inside(v.x - v.w / 2 + v.w * (a + .5) / 6, v.z - v.d / 2 + v.d * (b + .5) / 6, u))) c++; }
      const cov = c / n, ry = l.y + l.h;
      if (l.stilt || v.kind === 'canopy') { v.roofK = 'none'; continue; }
      if (cov > .86) v.roofK = 'none';
      else if (cov > .04) { v.roofK = 'terrace'; L.flatZones.push({ x: v.x, z: v.z, w: v.w, d: v.d, y: ry, part: true }); }
      else {
        let r = v.roof || (pitch && !['apartment', 'commercial'].includes(type) ? (pitch === 'gable' ? (v.w >= v.d ? 'gable-x' : 'gable-z') : 'hip') : 'flat');
        if (r !== 'flat' && v.kind === 'glazed' && !v.roof) r = 'flat';
        if (ghost) r = 'flat';
        if (ex.has('terrace') && r !== 'flat' && v === largest(L.levels[L.levels.length - 1].vols) && li === L.levels.length - 1) r = 'flat';
        v.roofK = r;
        if (r === 'flat') L.flatZones.push({ x: v.x, z: v.z, w: v.w, d: v.d, y: ry, rot: v.rot || 0 });
        const hr = roofRise(r, v, style);
        H = Math.max(H, ry + hr + (r === 'flat' ? .9 : .3));
      }
    }
  });
  L.H = H + (dec.some(d => d.k === 'spire') ? 6 : 0);
  L.roofY = y; L.top = largest(L.levels[L.levels.length - 1].vols);
  L.area = L.levels.filter(l => !l.stilt).reduce((a, l) => a + l.vols.filter(v => v.kind !== 'canopy').reduce((s, v) => s + v.w * v.d, 0), 0) / (FT * FT);
  return L;
}
function largest(vs) { return vs.reduce((a, v) => (v.w * v.d > a.w * a.d ? v : a), vs[0]); }
function roofRise(r, v, style) {
  const low = PAL[style] && PAL[style].low;
  if (r === 'hip') return Math.min(v.w, v.d) * (low ? .22 : .32);
  if (r === 'gable-x') return v.d * (low ? .2 : .34);
  if (r === 'gable-z') return v.w * (low ? .2 : .36);
  if (r === 'mono') return v.d * .22;
  if (r === 'mono-x') return Math.min(3.2, v.w * .55);
  if (r === 'barn') return v.w * .62;
  return 0;
}
