
/* ------------------------------------------------------------------ 3D core */
let T, OrbitControls, RoomEnvironment, RGBELoader, RoundedBoxGeometry, mergeGeometries, mergeVertices, PP = null;
let renderer, scene, camera, controls, sun, hemi, fillL, world, grass, sky, stars, composer = null, bloom = null, gtao = null, grade = null;
let threeOK = null, initP = null, raf = 0, dirty = true, autoT = 0, camGoal = null, userActive = false;
let lastLayout = null, lastFrameSig = '', openedAt = 0;
const live = new Map(), dying = [];
const M = {}, G = {}, TX = {};
const mobile = matchMedia('(max-width: 860px), (pointer: coarse)').matches;
const qParam = new URLSearchParams(location.search).get('q');
let quality = ['high', 'medium', 'low'].includes(qParam) ? qParam : (mobile ? 'medium' : 'high');
const adaptive = !qParam;
const TEXURL = new URL('../tex/', import.meta.url).href;
const PR = { high: 1.75, medium: 1.5, low: 1 };

function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}
function showFallback() {
  threeOK = false; fbEl.hidden = false; loadEl.hidden = true; canvas.hidden = true;
  root.classList.add('no3d');
  root.querySelector('.cx-hint').hidden = true;
  root.querySelector('.cx-light').hidden = true;
}
async function loadPP() {
  if (PP) return PP;
  const j = VENDOR + 'jsm/postprocessing/';
  const m = await Promise.all(['EffectComposer', 'RenderPass', 'UnrealBloomPass', 'OutputPass', 'ShaderPass', 'GTAOPass'].map(n => import(j + n + '.js')));
  PP = Object.assign({}, ...m); return PP;
}
function init3D() {
  if (initP) return initP;
  initP = (async () => {
    if (!webglAvailable()) { showFallback(); return; }
    try {
      const j = VENDOR + 'jsm/';
      const [m3, oc, re, rg, rb, bu] = await Promise.all([import(VENDOR + 'three.module.min.js'), import(VENDOR + 'OrbitControls.js'), import(VENDOR + 'RoomEnvironment.js'), import(j + 'loaders/RGBELoader.js'), import(j + 'geometries/RoundedBoxGeometry.js'), import(j + 'utils/BufferGeometryUtils.js')]);
      T = m3; OrbitControls = oc.OrbitControls; RoomEnvironment = re.RoomEnvironment; RGBELoader = rg.RGBELoader; RoundedBoxGeometry = rb.RoundedBoxGeometry; mergeGeometries = bu.mergeGeometries; mergeVertices = bu.mergeVertices;
      if (quality !== 'low') await loadPP().catch(() => { quality = 'low'; });
      setupScene();
      await Promise.race([preloadTextures(), new Promise(r => setTimeout(r, 9000))]);
      loadHDRI();
      threeOK = true;
      applyLight(S.light || 'golden');
      setTimeout(() => loadEl.classList.add('done'), 150);
    } catch (err) { console.warn('3D preview unavailable:', err && err.message); showFallback(); }
  })();
  return initP;
}

/* ---------- helpers */
function keep(g) { g.userData.keep = true; return g; }
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// metre-based planar UVs from the dominant normal axis, so tiled textures keep a real-world scale
function worldUV(g) {
  const p = g.attributes.position, n = g.attributes.normal; if (!n) g.computeVertexNormals();
  const nn = g.attributes.normal; let uv = g.attributes.uv;
  if (!uv) { uv = new T.BufferAttribute(new Float32Array(p.count * 2), 2); g.setAttribute('uv', uv); }
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(nn.getX(i)), ay = Math.abs(nn.getY(i)), az = Math.abs(nn.getZ(i)), x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (ay >= ax && ay >= az) uv.setXY(i, x, z); else if (ax >= az) uv.setXY(i, z, y); else uv.setXY(i, x, y);
  }
  uv.needsUpdate = true; return g;
}
// bevelled box with its base at y (geometry baked in place so world UVs line up)
function B(w, h, d, mat, x = 0, y = 0, z = 0, cast = true, r) {
  r = r == null ? Math.min(.05, Math.min(w, h, d) * .22) : r;
  const g = r > .004 ? new RoundedBoxGeometry(w, h, d, 2, r) : new T.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z); worldUV(g);
  const m = new T.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = true; return m;
}
// instanced unit boxes: [x, yCentre, z, sx, sy, sz, rotY]
function inst(list, mat, geo, cast = false) {
  if (!list.length) return null;
  geo = geo || G.unit || (G.unit = keep(new T.BoxGeometry(1, 1, 1)));
  const im = new T.InstancedMesh(geo, mat, list.length), m4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3(), e = new T.Euler();
  list.forEach((a, i) => { p.set(a[0], a[1], a[2]); s.set(a[3], a[4], a[5]); e.set(a[7] || 0, a[6] || 0, 0); q.setFromEuler(e); m4.compose(p, q, s); im.setMatrixAt(i, m4); });
  im.computeBoundingSphere(); im.castShadow = cast; im.receiveShadow = true; return im;
}
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (srgb) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
}

/* ---------- textures (CC0, ambientCG) */
const TEXSETS = { plaster: 3, concrete: 2.6, siding: 1.6, deck: 1.8, stone: 2.2, paving: 2.4, lawn: 3.2, tileroof: 1.8, slate: 2.4, pooltile: 1.1 };
function prepTex(t, name, kind) {
  t.wrapS = t.wrapT = T.RepeatWrapping; const r = 1 / TEXSETS[name]; t.repeat.set(r, r);
  if (kind === 'col') t.colorSpace = T.SRGBColorSpace;
  t.anisotropy = Math.min(quality === 'low' ? 2 : 8, renderer.capabilities.getMaxAnisotropy()); return t;
}
function tex(name, kind) {
  const k = name + '_' + kind; if (TX[k]) return TX[k];
  return (TX[k] = prepTex(new T.TextureLoader().load(TEXURL + k + '.jpg', () => { dirty = true; if (renderer) renderer.shadowMap.needsUpdate = true; }), name, kind));
}
function preloadTextures() {
  const L = new T.TextureLoader();
  return Promise.all(Object.keys(TEXSETS).flatMap(n => ['col', 'nrm', 'rgh'].map(k => L.loadAsync(TEXURL + n + '_' + k + '.jpg').then(t => { if (!TX[n + '_' + k]) TX[n + '_' + k] = prepTex(t, n, k); }).catch(() => {}))));
}
function loadHDRI() {
  new RGBELoader().load(TEXURL + 'qwantani_sunset_puresky_1k.hdr', t => {
    const pm = new T.PMREMGenerator(renderer); const env = pm.fromEquirectangular(t).texture; t.dispose(); pm.dispose();
    const old = scene.environment; scene.environment = env;
    for (const m of Object.values(M)) if (m && m.envMap === old) m.envMap = env;
    if (old) old.dispose(); dirty = true;
  }, undefined, () => {});
}

/* ---------- lighting modes */
const LIGHT = {
  day: { sunC: 0xfff3df, sunI: 3.0, el: 52, az: 38, hemiS: 0xc4daf2, hemiG: 0x6b5d48, hemiI: 1.1, fillI: .5, top: 0x2f6cc0, mid: 0x86b4e6, hor: 0xe2ebf0, sunGlow: 0xfff2d6, sunS: 2.5, fog: 0xbfd2e2, exp: .9, env: 1.0, win: .4, lamps: 0, pool: .15, bloomS: .1, bloomT: 1.9, stars: 0, city: .08 },
  golden: { sunC: 0xffb36b, sunI: 2.9, el: 13, az: 62, hemiS: 0xf3c9a0, hemiG: 0x3b2c22, hemiI: .75, fillI: .45, top: 0x2a3b66, mid: 0xc98a6e, hor: 0xffcd8a, sunGlow: 0xffb066, sunS: 6, fog: 0xc9967a, exp: 1.0, env: .85, win: 2.3, lamps: 1.8, pool: .5, bloomS: .3, bloomT: 1.85, stars: 0, city: .45 },
  night: { sunC: 0x93a9ff, sunI: .55, el: 42, az: -35, hemiS: 0x37466f, hemiG: 0x0d0c10, hemiI: .45, fillI: .18, top: 0x03050c, mid: 0x0a1226, hor: 0x2b2a38, sunGlow: 0x9fb2ff, sunS: .6, fog: 0x0b0f1b, exp: 1.12, env: .16, win: 2.6, lamps: 4, pool: 1.4, bloomS: .75, bloomT: .85, stars: 1, city: 1 },
};
let LM = LIGHT.golden;
function applyLight(mode) {
  LM = LIGHT[mode] || LIGHT.golden; if (!scene) return;
  const el = LM.el * Math.PI / 180, az = LM.az * Math.PI / 180;
  sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize();
  sun.color.set(LM.sunC); sun.intensity = LM.sunI;
  hemi.color.set(LM.hemiS); hemi.groundColor.set(LM.hemiG); hemi.intensity = LM.hemiI; fillL.intensity = LM.fillI;
  const u = sky.material.uniforms; u.top.value.set(LM.top); u.mid.value.set(LM.mid); u.hor.value.set(LM.hor); u.sunC.value.set(LM.sunGlow); u.sunS.value = LM.sunS; u.sunD.value.copy(sunDir);
  scene.fog.color.set(LM.fog); scene.background.set(LM.fog);
  renderer.toneMappingExposure = LM.exp; scene.environmentIntensity = LM.env;
  for (const m of Object.values(M)) if (m && m.isMeshStandardMaterial) m.envMapIntensity = (m.userData.envBase || 1) * LM.env;
  stars.material.opacity = LM.stars; stars.visible = LM.stars > 0;
  updateEmissives();
  if (bloom) { bloom.strength = LM.bloomS; bloom.threshold = LM.bloomT; }
  if (lastLayout) frameSun(lastLayout);
  renderer.shadowMap.needsUpdate = true; dirty = true;
}
let sunDir = null;
function updateEmissives() {
  const tierK = { standard: .85, premium: 1, luxury: 1.2 }[(lastLayout && lastLayout.tier) || 'standard'];
  for (const [k, m] of Object.entries(M)) {
    if (!m || !m.userData) continue;
    const e = m.userData.emis; if (!e) continue;
    if (e === 'win') m.emissiveIntensity = LM.win * tierK * (m.userData.k || 1);
    else if (e === 'lamp') m.emissiveIntensity = .15 + LM.lamps;
    else if (e === 'pool') m.emissiveIntensity = LM.pool;
    else if (e === 'city') m.emissiveIntensity = LM.city;
    else if (e === 'kerb') m.emissiveIntensity = .1 + LM.lamps * .8;
    else if (e === 'pool2') m.opacity = .22 + LM.lamps * .12;
  }
}

/* ---------- scene */
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, res: { value: null }, vig: { value: .38 }, blur: { value: 1 }, time: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 res; uniform float vig, blur, time; varying vec2 vUv;
  void main(){ vec2 uv = vUv; vec4 c = texture2D(tDiffuse, uv);
    float f = smoothstep(.3, .52, abs(uv.y - .52)) * blur;
    if (f > .01) { vec2 px = f * 2.2 / res; vec4 s = c;
      s += texture2D(tDiffuse, uv + vec2(px.x, 0.)); s += texture2D(tDiffuse, uv - vec2(px.x, 0.)); s += texture2D(tDiffuse, uv + vec2(0., px.y)); s += texture2D(tDiffuse, uv - vec2(0., px.y));
      s += texture2D(tDiffuse, uv + px); s += texture2D(tDiffuse, uv - px); s += texture2D(tDiffuse, uv + vec2(px.x, -px.y)); s += texture2D(tDiffuse, uv + vec2(-px.x, px.y)); c = s / 9.; }
    float d = distance(uv, vec2(.5, .48)); c.rgb *= mix(1., smoothstep(.95, .28, d), vig);
    c.rgb += (fract(sin(dot(uv * res + time, vec2(12.9898, 78.233))) * 43758.5453) - .5) * .014;
    gl_FragColor = c; }`
};
function setupScene() {
  renderer = new T.WebGLRenderer({ canvas, antialias: quality === 'low', powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, PR[quality]));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = quality === 'low' ? T.PCFShadowMap : T.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); showFallback(); });
  scene = new T.Scene();
  scene.background = new T.Color(0x0b0e15);
  scene.fog = new T.Fog(0x0b0e15, 120, 700);
  const pm = new T.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  camera = new T.PerspectiveCamera(34, 1, 0.5, 5000);
  camera.position.set(34, 22, 40);
  sunDir = new T.Vector3(.5, .5, .5);

  sky = new T.Mesh(new T.SphereGeometry(3000, 48, 24), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T.Color() }, mid: { value: new T.Color() }, hor: { value: new T.Color() }, sunC: { value: new T.Color() }, sunD: { value: new T.Vector3(0, 1, 0) }, sunS: { value: 1 } },
    vertexShader: 'varying vec3 vp; void main(){ vp = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 top, mid, hor, sunC, sunD; uniform float sunS; varying vec3 vp;
      void main(){ vec3 d = normalize(vp); float h = d.y;
        vec3 c = mix(hor, mid, smoothstep(-.02, .2, h)); c = mix(c, top, smoothstep(.2, .85, h));
        float s = max(dot(d, normalize(sunD)), 0.);
        c += sunC * (pow(s, 5.) * .28 + pow(s, 48.) * .55 + pow(s, 1400.) * sunS);
        c = mix(c, hor * .5, smoothstep(0., -.2, h));
        gl_FragColor = vec4(c, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  const sp = new Float32Array(1800 * 3), r0 = rng(5);
  for (let i = 0; i < 1800; i++) { const u = r0(), v = r0() * .95 + .05, th = u * Math.PI * 2, ph = Math.acos(v); sp.set([Math.sin(ph) * Math.cos(th) * 2500, Math.cos(ph) * 2500, Math.sin(ph) * Math.sin(th) * 2500], i * 3); }
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
  stars = new T.Points(sg, new T.PointsMaterial({ color: 0xdfe6ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  stars.frustumCulled = false; scene.add(stars);

  hemi = new T.HemisphereLight(0x9fb2d6, 0x2a2318, 0.75); scene.add(hemi);
  sun = new T.DirectionalLight(0xffe0b5, 2.6); sun.castShadow = true;
  setShadowRes(); sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.035; sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  scene.add(sun, sun.target);
  fillL = new T.DirectionalLight(0x8aa0d0, 0.5); fillL.position.set(-60, 30, -40); scene.add(fillL);

  // terrain: lawn-textured rolling ground, flat around the plot
  const tg = new T.PlaneGeometry(2400, 2400, 160, 160); tg.rotateX(-Math.PI / 2);
  const pos = tg.attributes.position, col = new Float32Array(pos.count * 3), c1 = new T.Color(0x8a9a6a), c2 = new T.Color(0xb7b886), c3 = new T.Color(0x6f7f56), tmp = new T.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z);
    const n = Math.sin(x * .021) * Math.cos(z * .017) + Math.sin((x + z) * .0093) * 1.4 + Math.sin(x * .052 + 1.3) * Math.sin(z * .047) * .35;
    const f = clamp((r - 160) / 300, 0, 1);
    pos.setY(i, n * 7 * f * f - 0.03);
    const v = .5 + .5 * Math.sin(x * .05 + Math.cos(z * .04) * 2) * Math.cos(z * .03), k = .78 + v * .3 - clamp(Math.sin(x * .013 + z * .011), 0, 1) * .18;
    tmp.setRGB(k * 1.02, k, k * .9);
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  tg.setAttribute('color', new T.BufferAttribute(col, 3)); tg.computeVertexNormals(); worldUV(tg);
  const ground = new T.Mesh(tg, mat.terrain()); ground.receiveShadow = true; scene.add(ground);

  world = new T.Group(); scene.add(world);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07; controls.enablePan = false;
  controls.minDistance = 6; controls.maxDistance = 600; controls.maxPolarAngle = 1.45; controls.minPolarAngle = 0.25;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.45; controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.9;
  controls.addEventListener('start', () => { userActive = true; camGoal = null; controls.autoRotate = false; clearTimeout(autoT); });
  controls.addEventListener('end', () => { userActive = false; clearTimeout(autoT); if (!reduce) autoT = setTimeout(() => { controls.autoRotate = true; }, 5000); });
  controls.addEventListener('change', () => { dirty = true; });
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', e => {
    const k = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
    if (k) { e.preventDefault(); e.stopPropagation(); const off = camera.position.clone().sub(controls.target); const s = new T.Spherical().setFromVector3(off); s.theta += k[0]; s.phi = clamp(s.phi - k[1], controls.minPolarAngle, controls.maxPolarAngle); off.setFromSpherical(s); camera.position.copy(controls.target).add(off); controls.autoRotate = false; camGoal = null; dirty = true; }
    if (e.key === '+' || e.key === '=' || e.key === '-') { e.preventDefault(); const off = camera.position.clone().sub(controls.target).multiplyScalar(e.key === '-' ? 1.12 : 0.89); camera.position.copy(controls.target).add(off); camGoal = null; dirty = true; }
  });
  new ResizeObserver(resize).observe(stageEl);
  buildComposer(); resize();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (isOpen) start(); });
  buildGrass();
}
function setShadowRes() {
  const s = quality === 'high' ? 2048 : 1024;
  if (sun.shadow.mapSize.x !== s) { sun.shadow.mapSize.set(s, s); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
}
function buildComposer() {
  if (composer) { composer.dispose && composer.dispose(); composer = null; bloom = null; gtao = null; grade = null; }
  if (quality === 'low' || !PP) return;
  const w = Math.max(2, stageEl.clientWidth), h = Math.max(2, stageEl.clientHeight), pr = renderer.getPixelRatio();
  const rt = new T.WebGLRenderTarget(w * pr, h * pr, { type: T.HalfFloatType, samples: renderer.capabilities.isWebGL2 ? 4 : 0 });
  composer = new PP.EffectComposer(renderer, rt);
  composer.addPass(new PP.RenderPass(scene, camera));
  if (quality === 'high') {
    gtao = new PP.GTAOPass(scene, camera, w, h);
    const ss = gtao.setSize.bind(gtao); gtao.setSize = (a, b) => ss(Math.ceil(a / 2), Math.ceil(b / 2));
    gtao.output = PP.GTAOPass.OUTPUT.Default; gtao.blendIntensity = .75;
    gtao.updateGtaoMaterial({ radius: .9, distanceExponent: 2, thickness: 1.5, scale: 1, samples: 16, distanceFallOff: .6, screenSpaceRadius: false });
    gtao.updatePdMaterial({ lumaPhi: 8, depthPhi: 1.2, normalPhi: 2.5, radius: 9, rings: 3, samples: 16 });
    composer.addPass(gtao);
  }
  bloom = new PP.UnrealBloomPass(new T.Vector2(w, h), LM.bloomS, .42, LM.bloomT); composer.addPass(bloom);
  composer.addPass(new PP.OutputPass());
  grade = new PP.ShaderPass(GradeShader); grade.uniforms.res.value = new T.Vector2(w * pr, h * pr); grade.uniforms.blur.value = quality === 'high' ? 1 : 0;
  composer.addPass(grade);
  composer.setPixelRatio(pr); composer.setSize(w, h);
}
function setQuality(q) {
  if (q === quality || !renderer) return;
  quality = q; fpsN = 0; fpsT0 = 0; openedAt = performance.now();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, PR[q]));
  renderer.shadowMap.type = q === 'low' ? T.PCFShadowMap : T.PCFSoftShadowMap;
  setShadowRes();
  for (const m of Object.values(M)) if (m && m.userData && m.userData.glass) setGlassQ(m);
  if (grass) grass.visible = q !== 'low';
  const done = () => { buildComposer(); resize(); renderer.shadowMap.needsUpdate = true; dirty = true; };
  if (q !== 'low' && !PP) loadPP().then(done).catch(done); else done();
}
function resize() {
  if (!renderer) return;
  const w = stageEl.clientWidth, h = stageEl.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); if (grade) grade.uniforms.res.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio()); }
  dirty = true;
  if (lastLayout && camera) frame(lastLayout, true);
}
function renderFrame(dt = 0) {
  if (composer) { if (grade) grade.uniforms.time.value = (grade.uniforms.time.value + dt * 60) % 1000; composer.render(dt); }
  else renderer.render(scene, camera);
}
function start() { if (!threeOK || raf) return; dirty = true; openedAt = performance.now(); let last = performance.now(); const loop = now => { raf = requestAnimationFrame(loop); tick(now, Math.min(0.05, (now - last) / 1000)); last = now; }; raf = requestAnimationFrame(loop); }
function stop() { cancelAnimationFrame(raf); raf = 0; }

const ease = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c = 1.2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
function applyAnim(o, k) {
  const a = o.userData.anim.type, v = Math.max(0.0001, k);
  if (a === 'rise') o.scale.set(1, v, 1); else if (a === 'pop') o.scale.setScalar(v); else if (a === 'grow') o.scale.set(v, 1, v);
  o.visible = k > 0.002;
}
let fpsN = 0, fpsT0 = 0, slow = 0;
function tick(now, dt) {
  let anim = false;
  for (const o of live.values()) {
    const A = o.userData.anim; if (!A || A.done) continue;
    const t = clamp((now - A.t0) / A.dur, 0, 1);
    applyAnim(o, A.type === 'grow' ? ease(t) : easeBack(t));
    if (t >= 1) { A.done = true; applyAnim(o, 1); }
    anim = true;
  }
  for (let i = dying.length - 1; i >= 0; i--) {
    const o = dying[i], A = o.userData.anim, t = clamp((now - A.t0) / A.dur, 0, 1);
    applyAnim(o, 1 - ease(t)); anim = true;
    if (t >= 1) { world.remove(o); disposeObj(o); dying.splice(i, 1); }
  }
  if (camGoal && !userActive) {
    const t = clamp((now - camGoal.t0) / camGoal.dur, 0, 1), k = ease(t);
    controls.target.lerpVectors(camGoal.ft, camGoal.tt, k);
    const dir = camera.position.clone().sub(controls.target).normalize();
    const d = camGoal.fd + (camGoal.td - camGoal.fd) * k;
    if (camGoal.phi != null) { const s = new T.Spherical().setFromVector3(dir); s.phi = camGoal.fphi + (camGoal.phi - camGoal.fphi) * k; dir.setFromSpherical(s); }
    camera.position.copy(controls.target).addScaledVector(dir, d);
    if (t >= 1) camGoal = null;
    dirty = true;
  }
  if (!reduce && TX.waterN) { TX.waterN.offset.x += dt * .018; TX.waterN.offset.y += dt * .011; if (TX.waterN2) { TX.waterN2.offset.x -= dt * .012; } dirty = true; }
  controls.update(dt);
  if (anim) renderer.shadowMap.needsUpdate = true;
  if (anim || dirty || controls.autoRotate || userActive) {
    renderFrame(dt); dirty = false;
    // adaptive quality: step down if the device can't keep up
    if (adaptive && now - openedAt > 4000) {
      if (!fpsT0) fpsT0 = now; fpsN++;
      const el = (now - fpsT0) / 1000;
      if (el > 2.5) { const fps = fpsN / el; fpsN = 0; fpsT0 = now; slow = fps < 42 ? slow + 1 : 0; if (slow >= 2) { slow = 0; if (quality === 'high') setQuality('medium'); else if (quality === 'medium') setQuality('low'); } }
    }
  }
}
function disposeObj(o) { o.traverse(c => { if (c.geometry && !c.geometry.userData.keep) c.geometry.dispose(); }); }

function reconcile(parts) {
  const now = performance.now(), seen = new Set();
  const fresh = parts.filter(p => !live.has(p.key));
  const newFloors = fresh.filter(p => p.floor != null), n = newFloors.length;
  const stagger = reduce ? 0 : Math.min(170, 1700 / Math.max(1, n));
  const after = reduce ? 0 : (n ? 260 + n * stagger : 0);
  for (const p of parts) {
    seen.add(p.key);
    if (live.has(p.key)) continue;
    const o = p.make(); if (!o) continue;
    const delay = p.instant ? 0 : p.floor != null ? 200 + newFloors.indexOf(p) * stagger : (p.late ? after : 80) + (p.d || 0);
    const i0 = reduce || p.instant;
    o.userData.anim = { type: p.anim || 'pop', t0: now + delay, dur: i0 ? 1 : (p.dur || (p.floor != null ? 620 : 700)), done: i0 };
    applyAnim(o, i0 ? 1 : 0);
    world.add(o); live.set(p.key, o);
  }
  for (const [k, o] of live) if (!seen.has(k)) {
    live.delete(k);
    o.userData.anim = { type: o.userData.anim.type, t0: now, dur: reduce ? 1 : 320 };
    dying.push(o);
  }
  renderer.shadowMap.needsUpdate = true; dirty = true;
}
function at(m, x, y, z, cast = false) { m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; return m; }
