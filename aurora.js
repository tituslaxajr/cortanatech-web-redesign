/*
 * aurora.js — ambient gradient texture for navy bands (Three.js r170,
 * vendored at assets/vendor/three/three.module.min.js).
 *
 * A slow, domain-warped noise field flowing through the brand blues.
 * Pure material texture — nothing representational, no narrative.
 *
 * Contract (HTML):
 *   <section class="page-hero" data-aurora>          brighter hero palette
 *   <div class="band-navy" data-aurora="deep">       deeper CTA/work palette
 *
 * Each [data-aurora] band gets its own canvas, sized to the band and
 * paused whenever the band is off-screen — at most one renders at a time
 * on a normal page. The band's opaque navy CSS gradient is the fallback
 * art: reduced motion, save-data, low memory, and missing WebGL never
 * load Three.js at all, and the canvas only fades in (html.js-aurora)
 * after its first frame renders.
 *
 * On the homepage work band, scroll progress from story.js nudges a
 * drift uniform so the texture flows sideways with the panel pan.
 */

const rootEl = document.documentElement;
const bandsEls = Array.prototype.slice.call(document.querySelectorAll('[data-aurora]'));

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

// ---- Gates: bail to the CSS gradient without touching Three.js ----
if (bandsEls.length && !reduced && !conn.saveData && mem > 2 && webglAvailable()) {
  const start = () => { boot().catch(() => { /* CSS gradient stands */ }); };
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1200 });
  else setTimeout(start, 200);
}

// Device tier: 1 = low, 2 = mid, 3 = high. Fragment cost is pixel-bound,
// so tiers govern DPR, noise octaves, and frame skipping.
function detectTier() {
  if (mem >= 8 && (window.devicePixelRatio || 1) >= 2 && window.innerWidth >= 1200) return 3;
  if (mem <= 4 || cores <= 4 || Math.min(window.screen.width, window.screen.height) < 420) return 1;
  return 2;
}

const TIER = {
  1: { dpr: 0.75, octaves: 3, frameSkip: 1 },
  2: { dpr: 1.25, octaves: 4, frameSkip: 0 },
  3: { dpr: 1.5, octaves: 4, frameSkip: 0 }
};

function cssColor(name, fallback) {
  const v = getComputedStyle(rootEl).getPropertyValue(name).trim();
  return v || fallback;
}

const VERT = [
  'void main() { gl_Position = vec4(position, 1.0); }'
].join('\n');

const FRAG = [
  'precision highp float;',
  'uniform float uTime;',
  'uniform vec2 uRes;',
  'uniform vec2 uPointer;',
  'uniform float uDrift;',
  'uniform float uVariant;',   // 0 = hero (brighter), 1 = deep
  'uniform vec3 uColorA;',     // deep navy base
  'uniform vec3 uColorB;',     // navy
  'uniform vec3 uColorC;',     // primary blue
  'uniform vec3 uColorD;',     // sky highlight
  '',
  'float hash(vec2 p) {',
  '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
  '}',
  'float noise(vec2 p) {',
  '  vec2 i = floor(p);',
  '  vec2 f = fract(p);',
  '  vec2 u = f * f * (3.0 - 2.0 * f);',
  '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
  '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
  '}',
  'float fbm(vec2 p) {',
  '  float v = 0.0;',
  '  float a = 0.55;',
  '  for (int i = 0; i < OCTAVES; i++) {',
  '    v += a * noise(p);',
  '    p = p * 2.02 + vec2(17.3, 9.1);',
  '    a *= 0.5;',
  '  }',
  '  return v;',
  '}',
  '',
  'void main() {',
  '  vec2 uv = gl_FragCoord.xy / uRes;',
  '  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 1.6;',
  '',
  '  float q = fbm(p + uTime * 0.3);',
  '  float r = fbm(p + 2.4 * q + vec2(uDrift * 0.9 + uPointer.x * 0.08, uPointer.y * 0.06) + uTime * 0.18);',
  '',
  // Brand ramp: base gradient echoing the CSS fallback, warped by noise.
  '  float base = mix(uv.y * 0.6 + uv.x * 0.25, uv.y * 0.8, uVariant);',
  '  vec3 col = mix(uColorB, uColorA, clamp(base + (r - 0.5) * 0.5, 0.0, 1.0));',
  '  col = mix(col, uColorC, smoothstep(0.45, 0.85, r) * mix(0.55, 0.4, uVariant));',
  '  col += uColorD * pow(smoothstep(0.6, 0.95, r), 3.0) * mix(0.35, 0.22, uVariant);',
  '',
  // Vignette: keep the band edges (where text sits) calmest.
  '  float vig = smoothstep(1.25, 0.45, distance(uv, vec2(0.5)));',
  '  col = mix(col * 0.92, col, vig);',
  '',
  // Dither to kill gradient banding.
  '  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;',
  '  gl_FragColor = vec4(col, 1.0);',
  '}'
].join('\n');

async function boot() {
  const THREE = await import('./assets/vendor/three/three.module.min.js?v=warm1');

  let tier = detectTier();
  const forced = document.body.getAttribute('data-aurora-tier');
  if (forced) tier = Math.max(1, Math.min(3, parseInt(forced, 10) || tier));
  let conf = TIER[tier];

  const colA = new THREE.Color(cssColor('--color-blue-900', '#1E2A70')).multiplyScalar(0.72);
  const colB = new THREE.Color(cssColor('--color-blue-800', '#2B3990'));
  const colC = new THREE.Color(cssColor('--color-blue-500', '#1C75BC'));
  const colD = new THREE.Color(cssColor('--color-blue-sky', '#29ABE2'));

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  const bands = bandsEls.map((el) => makeBand(el));
  let revealed = false;

  function makeBand(el) {
    const canvas = document.createElement('canvas');
    canvas.className = 'aurora-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    el.insertBefore(canvas, el.firstChild);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas, alpha: false, antialias: false, powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, conf.dpr));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const deep = el.getAttribute('data-aurora') === 'deep';
    const uniforms = {
      uTime: { value: Math.random() * 40 },   // desync bands
      uRes: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uDrift: { value: 0 },
      uVariant: { value: deep ? 1 : 0 },
      uColorA: { value: colA },
      uColorB: { value: colB },
      uColorC: { value: colC },
      uColorD: { value: colD }
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG.replace(/OCTAVES/g, String(conf.octaves)),
      depthTest: false, depthWrite: false
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const band = {
      el: el, canvas: canvas, renderer: renderer, scene: scene, camera: camera,
      uniforms: uniforms, visible: false, driftT: 0
    };

    function size() {
      const w = Math.max(1, el.clientWidth);
      const h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(renderer.domElement.width, renderer.domElement.height);
    }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(el);
    else window.addEventListener('resize', size);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        band.visible = entries[0].isIntersecting;
        if (band.visible) play();
      }, { threshold: 0.01 }).observe(el);
    } else {
      band.visible = true;
    }

    // Pinned work band: let scroll progress push the texture sideways.
    const sceneHost = el.closest('[data-scene]');
    if (sceneHost && window.Story) {
      const name = sceneHost.getAttribute('data-scene');
      window.Story.on(name, (s) => { band.driftT = s.progress * 2.2; });
    }

    return band;
  }

  // ---- Shared render loop: only visible bands draw ----
  let running = false, rafId = 0, frameNo = 0;
  let last = performance.now();
  let acc = 0, samples = 0;

  function demote() {
    if (tier <= 1) return;
    tier -= 1;
    conf = TIER[tier];
    bands.forEach((b) => {
      b.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, conf.dpr));
      b.renderer.setSize(Math.max(1, b.el.clientWidth), Math.max(1, b.el.clientHeight), false);
      b.uniforms.uRes.value.set(b.renderer.domElement.width, b.renderer.domElement.height);
    });
    acc = 0; samples = 0;
  }

  const ease = (v, t, k, dt) => v + (t - v) * (1 - Math.exp(-k * dt));

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    frameNo++;

    const anyVisible = bands.some((b) => b.visible);
    if (!anyVisible) { running = false; return; }
    if (conf.frameSkip && frameNo % (conf.frameSkip + 1) !== 0) return;

    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    pointer.x = ease(pointer.x, pointer.tx, 3, dt);
    pointer.y = ease(pointer.y, pointer.ty, 3, dt);

    for (let i = 0; i < bands.length; i++) {
      const b = bands[i];
      if (!b.visible) continue;
      b.uniforms.uTime.value += dt * 0.12;
      b.uniforms.uPointer.value.set(pointer.x, pointer.y);
      b.uniforms.uDrift.value = ease(b.uniforms.uDrift.value, b.driftT, 4, dt);
      b.renderer.render(b.scene, b.camera);
    }

    if (!revealed) {
      revealed = true;
      rootEl.classList.add('js-aurora');
    }

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

  window.Aurora = {
    get tier() { return tier; },
    bands: bands,
    demote: demote,
    pause: pause,
    play: play
  };
}
