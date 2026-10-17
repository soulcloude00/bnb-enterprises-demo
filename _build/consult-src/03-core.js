
/* ------------------------------------------------------------------ 3D core */
let T, OrbitControls, RoomEnvironment;
let renderer, scene, camera, controls, sun, world, grass, threeOK = null, initP = null, raf = 0, dirty = true, autoT = 0, camGoal = null, userActive = false;
let lastLayout = null, lastFrameSig = '';
const live = new Map(), dying = [];
const M = {}, G = {};
const mobile = matchMedia('(max-width: 860px), (pointer: coarse)').matches;

function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}
function showFallback() {
  threeOK = false; fbEl.hidden = false; loadEl.hidden = true; canvas.hidden = true;
  root.classList.add('no3d');
  root.querySelector('.cx-hint').hidden = true;
}
function init3D() {
  if (initP) return initP;
  initP = (async () => {
    if (!webglAvailable()) { showFallback(); return; }
    try {
      T = await import(VENDOR + 'three.module.min.js');
      ({ OrbitControls } = await import(VENDOR + 'OrbitControls.js'));
      ({ RoomEnvironment } = await import(VENDOR + 'RoomEnvironment.js'));
      setupScene();
      threeOK = true;
      setTimeout(() => loadEl.classList.add('done'), 120);
    } catch (err) { console.warn('3D preview unavailable:', err && err.message); showFallback(); }
  })();
  return initP;
}

function keep(g) { g.userData.keep = true; return g; }
function std(key, p) { if (!M[key]) { const env = p.envI; delete p.envI; M[key] = new T.MeshStandardMaterial(p); if (env) { M[key].envMap = scene.environment; M[key].envMapIntensity = env; } } return M[key]; }
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function boxUV(g, scale = 2.4) { // world-space box projection so textures keep a constant scale
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (ax > .5) uv.setXY(i, z / scale, y / scale); else if (ay > .5) uv.setXY(i, x / scale, z / scale); else uv.setXY(i, x / scale, y / scale);
  }
  uv.needsUpdate = true; return g;
}
// box with its base at y
function B(w, h, d, mat, x = 0, y = 0, z = 0, cast = true) {
  const g = new T.BoxGeometry(w, h, d);
  if (mat.bumpMap) { g.translate(x, y + h / 2, z); boxUV(g); g.translate(-x, -y - h / 2, -z); }
  const m = new T.Mesh(g, mat); m.position.set(x, y + h / 2, z); m.castShadow = cast; m.receiveShadow = true; return m;
}
// instanced unit boxes: [x, yCentre, z, sx, sy, sz, rotY]
function inst(list, mat, geo) {
  if (!list.length) return null;
  geo = geo || G.unit || (G.unit = keep(new T.BoxGeometry(1, 1, 1)));
  const im = new T.InstancedMesh(geo, mat, list.length), m4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3(), e = new T.Euler();
  list.forEach((a, i) => { p.set(a[0], a[1], a[2]); s.set(a[3], a[4], a[5]); e.set(0, a[6] || 0, 0); q.setFromEuler(e); m4.compose(p, q, s); im.setMatrixAt(i, m4); });
  im.computeBoundingSphere(); im.castShadow = false; im.receiveShadow = false; return im;
}
function canvasTex(w, h, draw, color = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (color) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
}

function setupScene() {
  renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.6 : 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); showFallback(); });

  scene = new T.Scene();
  const BG = 0x0b0e15;
  scene.background = new T.Color(BG);
  scene.fog = new T.Fog(BG, 80, 420);
  const pm = new T.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.32;
  pm.dispose();
  camera = new T.PerspectiveCamera(36, 1, 0.3, 4000);
  camera.position.set(34, 22, 40);

  // sky dome: midnight overhead fading into a warm champagne horizon
  const sky = new T.Mesh(new T.SphereGeometry(2000, 32, 16), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T.Color(0x070a12) }, mid: { value: new T.Color(0x141a28) }, hor: { value: new T.Color(0x4a3a2a) } },
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 hor; varying vec3 vp; void main(){ float h = vp.y; vec3 c = mix(hor, mid, smoothstep(-0.02, 0.16, h)); c = mix(c, top, smoothstep(0.16, 0.7, h)); gl_FragColor = vec4(c, 1.0); }'
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  scene.add(new T.HemisphereLight(0x9fb2d6, 0x2a2318, 0.75));
  sun = new T.DirectionalLight(0xffe0b5, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const fill = new T.DirectionalLight(0x7b8fc4, 0.55); fill.position.set(-60, 30, -40); scene.add(fill);

  // terrain: gentle rolling ground with grass colour variation, flat around the plot
  const tg = new T.PlaneGeometry(1600, 1600, 140, 140); tg.rotateX(-Math.PI / 2);
  const pos = tg.attributes.position, col = new Float32Array(pos.count * 3), c1 = new T.Color(0x1b2618), c2 = new T.Color(0x2b3a22), c3 = new T.Color(0x3a3a26), tmp = new T.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z);
    const n = Math.sin(x * .021) * Math.cos(z * .017) + Math.sin((x + z) * .0093) * 1.4 + Math.sin(x * .052 + 1.3) * Math.sin(z * .047) * .35;
    const f = clamp((r - 140) / 260, 0, 1);
    pos.setY(i, n * 6 * f * f - 0.02);
    const v = .5 + .5 * Math.sin(x * .11 + Math.cos(z * .09) * 2) * Math.cos(z * .07);
    tmp.copy(c1).lerp(c2, v).lerp(c3, clamp(Math.sin(x * .013 + z * .011) * .5, 0, .5));
    col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
  }
  tg.setAttribute('color', new T.BufferAttribute(col, 3)); tg.computeVertexNormals();
  const ground = new T.Mesh(tg, new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
  ground.receiveShadow = true; scene.add(ground);

  world = new T.Group(); scene.add(world);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07; controls.enablePan = false;
  controls.minDistance = 6; controls.maxDistance = 600; controls.maxPolarAngle = 1.42; controls.minPolarAngle = 0.25;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.55; controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.9;
  controls.addEventListener('start', () => { userActive = true; camGoal = null; controls.autoRotate = false; clearTimeout(autoT); });
  controls.addEventListener('end', () => { userActive = false; clearTimeout(autoT); if (!reduce) autoT = setTimeout(() => { controls.autoRotate = true; }, 5000); });
  controls.addEventListener('change', () => { dirty = true; });
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', e => { // keyboard orbit / zoom when the canvas has focus
    const k = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
    if (k) { e.preventDefault(); e.stopPropagation(); const off = camera.position.clone().sub(controls.target); const sp = new T.Spherical().setFromVector3(off); sp.theta += k[0]; sp.phi = clamp(sp.phi - k[1], controls.minPolarAngle, controls.maxPolarAngle); off.setFromSpherical(sp); camera.position.copy(controls.target).add(off); controls.autoRotate = false; camGoal = null; dirty = true; }
    if (e.key === '+' || e.key === '=' || e.key === '-') { e.preventDefault(); const off = camera.position.clone().sub(controls.target).multiplyScalar(e.key === '-' ? 1.12 : 0.89); camera.position.copy(controls.target).add(off); camGoal = null; dirty = true; }
  });

  new ResizeObserver(resize).observe(stageEl); resize();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (isOpen) start(); });
  buildGrass();
}
function resize() {
  if (!renderer) return;
  const w = stageEl.clientWidth, h = stageEl.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true;
  if (lastLayout && camera) frame(lastLayout, true);
}
function start() { if (!threeOK || raf) return; dirty = true; let last = performance.now(); const loop = now => { raf = requestAnimationFrame(loop); tick(now, Math.min(0.05, (now - last) / 1000)); last = now; }; raf = requestAnimationFrame(loop); }
function stop() { cancelAnimationFrame(raf); raf = 0; }

const ease = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c = 1.2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
function applyAnim(o, k) {
  const a = o.userData.anim.type, v = Math.max(0.0001, k);
  if (a === 'rise') o.scale.set(1, v, 1);
  else if (a === 'pop') o.scale.setScalar(v);
  else if (a === 'grow') o.scale.set(v, 1, v);
  o.visible = k > 0.002;
}
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
    if (camGoal.phi != null) { const sp = new T.Spherical().setFromVector3(dir); sp.phi = camGoal.fphi + (camGoal.phi - camGoal.fphi) * k; dir.setFromSpherical(sp); }
    camera.position.copy(controls.target).addScaledVector(dir, d);
    if (t >= 1) camGoal = null;
    dirty = true;
  }
  controls.update(dt);
  if (anim) renderer.shadowMap.needsUpdate = true;
  if (anim || dirty || controls.autoRotate || userActive) { renderer.render(scene, camera); dirty = false; }
}
function disposeObj(o) { o.traverse(c => { if (c.geometry && !c.geometry.userData.keep) c.geometry.dispose(); }); }

// keyed scene diff: unchanged parts stay, new parts animate in (floors stagger upward), removed parts animate out
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
    const inst0 = reduce || p.instant;
    o.userData.anim = { type: p.anim || 'pop', t0: now + delay, dur: inst0 ? 1 : (p.dur || (p.floor != null ? 620 : 700)), done: inst0 };
    applyAnim(o, inst0 ? 1 : 0);
    world.add(o); live.set(p.key, o);
  }
  for (const [k, o] of live) if (!seen.has(k)) {
    live.delete(k);
    o.userData.anim = { type: o.userData.anim.type, t0: now, dur: reduce ? 1 : 320 };
    dying.push(o);
  }
  renderer.shadowMap.needsUpdate = true; dirty = true;
}
