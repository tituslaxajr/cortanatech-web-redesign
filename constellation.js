/*
 * constellation.js — "Constellation of Light" WebGL layer (Three.js r170,
 * vendored at assets/vendor/three/three.module.min.js).
 *
 * One fixed canvas behind the page renders a living field of lights:
 * every mission is a light; connected missions form constellations.
 *
 * Contract (HTML):
 *   <body data-constellation="hero-full | ambient | cta-burst">
 *     hero-full  homepage narrative — scroll scenes drive kindling,
 *                line-draw and camera via window.Story
 *     ambient    inner pages — sparser field, slow drift, scroll parallax
 *     cta-burst  ambient + "your light joins" as the page bottom nears
 *   Optional: data-constellation-density="0.6" (multiplier)
 *
 * Enhancement-only. The page baseline is the CSS starfield (.css-stars)
 * and finished-state scroll compositions; this layer only fades in over
 * them (html.js-constellation) after every gate below passes. Reduced
 * motion, missing WebGL, save-data and low-memory devices never load
 * Three.js at all.
 */

const body = document.body;
const rootEl = document.documentElement;
const preset = body ? body.getAttribute('data-constellation') : null;

const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const conn = navigator.connection || {};
const mem = navigator.deviceMemory || 4;
const cores = navigator.hardwareConcurrency || 4;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

// ---- Gates: bail out to the CSS starfield without touching Three.js ----
if (preset && !reduced && !conn.saveData && mem > 2 && webglAvailable()) {
  const start = () => { boot().catch(() => { /* stay on CSS stars */ }); };
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1200 });
  else setTimeout(start, 200);
}

// Device tier: 1 = low (few points, no lines, 30fps), 2 = mid, 3 = high.
function detectTier() {
  if (mem >= 8 && (window.devicePixelRatio || 1) >= 2 && window.innerWidth >= 1200) return 3;
  if (mem <= 4 || cores <= 4 || Math.min(window.screen.width, window.screen.height) < 420) return 1;
  return 2;
}

const TIER = {
  1: { points: 350, dpr: 1, lines: false, frameSkip: 1 },
  2: { points: 900, dpr: 1.5, lines: true, frameSkip: 0 },
  3: { points: 1600, dpr: 2, lines: true, frameSkip: 0 }
};

// Deterministic PRNG so the WebGL field matches the CSS fallback art.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- The four audience constellations (abstract shapes, no zodiac) ----
// Local star offsets + link index pairs; centers spread for the work pan.
const CLUSTERS = [
  { // churches — a steeple reaching up
    center: [-45, 4, -50],
    stars: [[0, 9], [-4.5, 3], [4.5, 3], [-4.5, -4], [4.5, -4], [0, -1], [0, 14]],
    links: [[6, 0], [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5]]
  },
  { // schools — an open book
    center: [-15, -2, -52],
    stars: [[-8, -1], [-4, 2.5], [0, 0.5], [4, 2.5], [8, -1], [0, 6]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [3, 5]]
  },
  { // nonprofits — joined hands (an arc closing)
    center: [15, 3, -48],
    stars: [[-7, -3], [-4.5, 1.5], [-1.5, 4], [1.5, 4], [4.5, 1.5], [7, -3]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]
  },
  { // startups — an arrow rising
    center: [45, 1, -50],
    stars: [[0, 8], [-4, 2.5], [4, 2.5], [-2, -3], [2, -3], [0, -8]],
    links: [[5, 3], [5, 4], [3, 1], [4, 2], [1, 0], [2, 0], [3, 4]]
  }
];

const FOCUS_POS = [0, -5, -34];   // "one light" — the hero star

function cssColor(name, fallback) {
  const v = getComputedStyle(rootEl).getPropertyValue(name).trim();
  return v || fallback;
}

async function boot() {
  const THREE = await import('./assets/vendor/three/three.module.min.js?v=light1');

  let tier = detectTier();
  const forced = body.getAttribute('data-constellation-tier');
  if (forced) tier = Math.max(1, Math.min(3, parseInt(forced, 10) || tier));
  let conf = TIER[tier];
  const density = parseFloat(body.getAttribute('data-constellation-density')) ||
    (preset === 'hero-full' ? 1 : 0.6);

  // ---- Renderer / camera / canvas ----
  const canvas = document.createElement('canvas');
  canvas.className = 'constellation-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  body.insertBefore(canvas, body.firstChild);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: false,
    powerPreference: preset === 'hero-full' && tier >= 2 ? 'high-performance' : 'low-power'
  });
  let dpr = Math.min(window.devicePixelRatio || 1, conf.dpr);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 400);
  camera.position.set(0, 0, 60);

  // ---- Palette from brand tokens ----
  const cWhite = new THREE.Color('#F4F8FF');
  const cSky = new THREE.Color(cssColor('--color-blue-sky', '#29ABE2'));
  const cPale = new THREE.Color(cssColor('--color-blue-100', '#C5DFF2'));
  const cWarm = new THREE.Color('#FFE9C9');
  const ramp = [cWhite, cWhite, cWhite, cPale, cPale, cSky, cWarm];

  const rand = mulberry32(20260702);

  // ---- Star field (ambient + cluster stars in one buffer) ----
  const clusterStars = [];
  CLUSTERS.forEach((cl, ci) => {
    cl.stars.forEach((s) => {
      clusterStars.push({
        x: cl.center[0] + s[0], y: cl.center[1] + s[1],
        z: cl.center[2] + (rand() - 0.5) * 4,
        size: 30 + rand() * 12, cluster: ci
      });
    });
  });

  const ambientCount = Math.round(conf.points * density);
  const fixedCount = clusterStars.length + 1; // clusters + focus star
  const total = fixedCount + ambientCount;
  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const size = new Float32Array(total);
  const phase = new Float32Array(total);
  const kindleT = new Float32Array(total);

  function setStar(i, x, y, z, c, s) {
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    size[i] = s;
    phase[i] = rand() * Math.PI * 2;
    // Kindle order radiates outward from the focus star.
    const dx = x - FOCUS_POS[0], dy = y - FOCUS_POS[1], dz = z - FOCUS_POS[2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    kindleT[i] = Math.min(1, d / 110 + rand() * 0.15);
  }

  // Fixed stars go first so tier demotion (setDrawRange) only trims the
  // ambient tail, never a constellation.
  setStar(0, FOCUS_POS[0], FOCUS_POS[1], FOCUS_POS[2], cWarm, 64);
  kindleT[0] = 0; // the "one light" is lit from the start
  clusterStars.forEach((s, j) => {
    setStar(1 + j, s.x, s.y, s.z, cWhite, s.size);
  });
  for (let i = 0; i < ambientCount; i++) {
    const x = (rand() - 0.5) * 170;
    const y = (rand() - 0.5) * 90;
    const z = -15 - rand() * 110;
    const c = ramp[Math.floor(rand() * ramp.length)];
    setStar(fixedCount + i, x, y, z, c, 8 + rand() * 16);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  geo.setAttribute('aKindleT', new THREE.BufferAttribute(kindleT, 1));

  const uniforms = {
    uTime: { value: 0 },
    uKindle: { value: 1 },       // default: everything lit (finished state)
    uPixelRatio: { value: dpr }
  };

  const starMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute float aSize;',
      'attribute vec3 aColor;',
      'attribute float aPhase;',
      'attribute float aKindleT;',
      'uniform float uTime;',
      'uniform float uKindle;',
      'uniform float uPixelRatio;',
      'varying vec3 vColor;',
      'varying float vAlpha;',
      'void main() {',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  float lit = smoothstep(aKindleT - 0.06, aKindleT + 0.04, uKindle);',
      '  float tw = 0.72 + 0.28 * sin(uTime * 0.8 + aPhase);',
      '  vAlpha = mix(0.16, tw, lit);',
      '  vColor = aColor * mix(0.5, 1.0, lit);',
      '  float s = aSize * mix(0.65, 1.0, lit);',
      '  gl_PointSize = s * uPixelRatio * (34.0 / -mv.z);',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vColor;',
      'varying float vAlpha;',
      'void main() {',
      '  float d = length(gl_PointCoord - 0.5);',
      '  float glow = smoothstep(0.5, 0.0, d);',
      '  glow *= glow;',
      '  gl_FragColor = vec4(vColor, vAlpha * glow);',
      '}'
    ].join('\n')
  });
  scene.add(new THREE.Points(geo, starMat));

  // ---- Constellation lines (draw in per cluster via uDraw) ----
  const lineUniforms = {
    uDraw: { value: new THREE.Vector4(1, 1, 1, 1) },  // default: drawn
    uColor: { value: cSky },
    uOpacity: { value: preset === 'hero-full' ? 0.42 : 0.16 }
  };
  if (conf.lines) {
    const segs = [];
    CLUSTERS.forEach((cl, ci) => {
      const n = cl.links.length;
      cl.links.forEach((lk, li) => {
        const a = cl.stars[lk[0]], b = cl.stars[lk[1]];
        segs.push({
          ax: cl.center[0] + a[0], ay: cl.center[1] + a[1],
          bx: cl.center[0] + b[0], by: cl.center[1] + b[1],
          z: cl.center[2], cluster: ci,
          p0: li / n, p1: (li + 1) / n
        });
      });
    });
    const lp = new Float32Array(segs.length * 6);
    const lprog = new Float32Array(segs.length * 2);
    const lclu = new Float32Array(segs.length * 2);
    segs.forEach((s, i) => {
      lp[i * 6] = s.ax; lp[i * 6 + 1] = s.ay; lp[i * 6 + 2] = s.z;
      lp[i * 6 + 3] = s.bx; lp[i * 6 + 4] = s.by; lp[i * 6 + 5] = s.z;
      lprog[i * 2] = s.p0; lprog[i * 2 + 1] = s.p1;
      lclu[i * 2] = s.cluster; lclu[i * 2 + 1] = s.cluster;
    });
    const lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
    lgeo.setAttribute('aProgress', new THREE.BufferAttribute(lprog, 1));
    lgeo.setAttribute('aCluster', new THREE.BufferAttribute(lclu, 1));
    const lineMat = new THREE.ShaderMaterial({
      uniforms: lineUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: [
        'attribute float aProgress;',
        'attribute float aCluster;',
        'uniform vec4 uDraw;',
        'varying float vVis;',
        'void main() {',
        '  float d = aCluster < 0.5 ? uDraw.x : aCluster < 1.5 ? uDraw.y : aCluster < 2.5 ? uDraw.z : uDraw.w;',
        '  vVis = clamp((d - aProgress) / 0.12, 0.0, 1.0);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'uniform float uOpacity;',
        'varying float vVis;',
        'void main() {',
        '  gl_FragColor = vec4(uColor, uOpacity * vVis);',
        '}'
      ].join('\n')
    });
    scene.add(new THREE.LineSegments(lgeo, lineMat));
  }

  // ---- "Your light" — the visitor's star (finale / cta-burst) ----
  const yourGeo = new THREE.BufferGeometry();
  const yourPos = new Float32Array([0, -60, -30]);
  yourGeo.setAttribute('position', new THREE.BufferAttribute(yourPos, 3));
  yourGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array([cWarm.r, cWarm.g, cWarm.b]), 3));
  yourGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array([70]), 1));
  yourGeo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array([1.7]), 1));
  yourGeo.setAttribute('aKindleT', new THREE.BufferAttribute(new Float32Array([0]), 1));
  const yourStar = new THREE.Points(yourGeo, starMat);
  yourStar.visible = false;
  scene.add(yourStar);

  // ---- Narrative state (targets are eased toward each frame) ----
  const state = {
    kindle: 1, kindleT: 1,
    draw: [1, 1, 1, 1], drawT: [1, 1, 1, 1],
    camX: 0, camXT: 0, camZ: 60, camZT: 60,
    your: 0, yourT: 0,
    px: 0, py: 0
  };

  const YOUR_FROM = [4, -55, -30];
  const YOUR_TO = [30, 12, -49];   // an open spot beside the startups cluster

  // ---- Scroll wiring ----
  if (preset === 'hero-full' && window.Story) {
    const stagger = (p, i) => Math.max(0, Math.min(1, (p - (0.12 + i * 0.16)) / 0.18));
    const seed = (name, fn) => {
      const s = window.Story.get(name);
      if (s && s.progress >= 0) fn({ progress: s.progress, step: s.step });
      window.Story.on(name, fn);
    };
    seed('sky', (s) => {
      // --hxraw rests at 0.5; push the camera in as the hero scrolls out.
      state.camZT = 60 - Math.max(0, s.progress - 0.5) * 44;
    });
    seed('kindle', (s) => { state.kindleT = s.progress; });
    seed('audiences', (s) => {
      for (let i = 0; i < 4; i++) state.drawT[i] = stagger(s.progress, i);
    });
    seed('constellation', (s) => {
      state.camXT = -38 + Math.max(0, Math.min(1, s.progress)) * 76;
    });
    // Bottom-of-page scenes never reach progress 1 (the page can't scroll
    // past the footer) — treat ~0.5 as journey's end.
    seed('yourlight', (s) => { state.yourT = Math.min(1, s.progress / 0.5); });
    // Top-of-page default when Story is live: field waits to be kindled.
    const k = window.Story.get('kindle');
    if (k && k.progress >= 0) state.kindle = state.kindleT;
  }

  if (preset === 'cta-burst') {
    yourStar.visible = true;
  }

  // Pointer parallax — fine pointers only.
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      state.px = (e.clientX / window.innerWidth - 0.5) * 2;
      state.py = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  // ---- Resize ----
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }, 150);
  });

  // ---- Render loop: pause when hidden, skip frames on low tier,
  //      auto-demote if the device can't hold frame time. ----
  let running = false, rafId = 0, frameNo = 0;
  let last = performance.now();
  let acc = 0, samples = 0;

  function demote() {
    if (tier <= 1) return;
    tier -= 1;
    conf = TIER[tier];
    dpr = Math.min(window.devicePixelRatio || 1, conf.dpr);
    renderer.setPixelRatio(dpr);
    uniforms.uPixelRatio.value = dpr;
    geo.setDrawRange(0, fixedCount + Math.round(ambientCount * (conf.points / TIER[tier + 1].points)));
    scene.traverse((o) => { if (o.isLineSegments && !conf.lines) o.visible = false; });
    acc = 0; samples = 0;
  }

  const ease = (v, t, k, dt) => v + (t - v) * (1 - Math.exp(-k * dt));

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    frameNo++;

    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;

    let skip = conf.frameSkip;
    // Ambient pages: deep below the fold the canvas is fully occluded
    // by white content — idle down to every 3rd frame.
    if (preset !== 'hero-full' && window.scrollY > window.innerHeight * 1.6) skip = 2;
    if (skip && frameNo % (skip + 1) !== 0) return;

    uniforms.uTime.value += dt;

    state.kindle = ease(state.kindle, state.kindleT, 6, dt);
    state.camX = ease(state.camX, state.camXT, 4, dt);
    state.camZ = ease(state.camZ, state.camZT, 4, dt);
    state.your = ease(state.your, state.yourT, 6, dt);
    uniforms.uKindle.value = state.kindle;
    for (let i = 0; i < 4; i++) {
      state.draw[i] = ease(state.draw[i], state.drawT[i], 6, dt);
    }
    lineUniforms.uDraw.value.set(state.draw[0], state.draw[1], state.draw[2], state.draw[3]);

    // "Your light" rises to its place as the finale scrubs.
    if (preset === 'hero-full') {
      if (state.your > 0.01) {
        yourStar.visible = true;
        const t = state.your;
        yourPos[0] = YOUR_FROM[0] + (YOUR_TO[0] - YOUR_FROM[0]) * t;
        yourPos[1] = YOUR_FROM[1] + (YOUR_TO[1] - YOUR_FROM[1]) * t;
        yourPos[2] = YOUR_FROM[2] + (YOUR_TO[2] - YOUR_FROM[2]) * t;
        yourGeo.attributes.position.needsUpdate = true;
      } else {
        yourStar.visible = false;
      }
    } else {
      // Ambient drift + scroll parallax for content pages.
      state.camXT = 0;
      camera.position.y = -window.scrollY * 0.004;
      if (preset === 'cta-burst') {
        const max = rootEl.scrollHeight - window.innerHeight;
        const f = max > 0 ? window.scrollY / max : 0;
        const t = Math.max(0, Math.min(1, (f - 0.72) / 0.24));
        yourPos[0] = YOUR_FROM[0] + (YOUR_TO[0] - YOUR_FROM[0]) * t;
        yourPos[1] = YOUR_FROM[1] + (YOUR_TO[1] - YOUR_FROM[1]) * t;
        yourPos[2] = YOUR_FROM[2] + (YOUR_TO[2] - YOUR_FROM[2]) * t;
        yourGeo.attributes.position.needsUpdate = true;
      }
    }

    // Slow drift + pointer parallax on top of narrative camera targets.
    const t = uniforms.uTime.value;
    camera.position.x = state.camX + Math.sin(t * 0.05) * 1.6 + state.px * 3;
    if (preset === 'hero-full') {
      camera.position.y = Math.cos(t * 0.04) * 1.2 - state.py * 2;
    }
    camera.position.z = state.camZ;
    camera.lookAt(state.camX, camera.position.y * 0.4, -50);

    renderer.render(scene, camera);

    // Rolling frame-time check: demote a tier if we can't hold ~40fps.
    const spent = performance.now() - now;
    acc += spent; samples++;
    if (samples >= 60) {
      if (acc / samples > 24) demote();
      acc = 0; samples = 0;
    }
  }

  function play() {
    if (running) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function pause() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }
  document.addEventListener('visibilitychange', () => {
    document.hidden ? pause() : play();
  });

  play();
  rootEl.classList.add('js-constellation');

  window.Constellation = {
    get tier() { return tier; },
    demote: demote,
    pause: pause,
    play: play
  };
}
