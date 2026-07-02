/*
 * aurora.js — ambient gradient texture for navy bands (Three.js r170,
 * vendored at assets/vendor/three/three.module.min.js).
 *
 * Two layers per band, both quiet:
 *   1. A slow, domain-warped noise field flowing through the brand blues.
 *   2. A drifting node network — thin lines connect nearby nodes; on
 *      fine-pointer devices the cursor joins the network and carries a
 *      soft radial glow in the brand blues.
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
  1: { dpr: 0.75, octaves: 3, frameSkip: 1, nodes: 35 },
  2: { dpr: 1.25, octaves: 4, frameSkip: 0, nodes: 70 },
  3: { dpr: 1.5, octaves: 4, frameSkip: 0, nodes: 100 }
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
  'uniform vec2 uGlowPos;',    // cursor, band UV (y up)
  'uniform float uGlow;',      // 0..1, eased while the cursor is in the band
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
  // Cursor glow — soft radial in the brand blues, capped so white copy
  // inside it stays readable.
  '  vec2 pg = uGlowPos * vec2(uRes.x / uRes.y, 1.0) * 1.6;',
  '  float gd = distance(p, pg);',
  '  float glow = exp(-(gd * gd) / 0.2) * uGlow;',
  '  col += mix(uColorC, uColorD, clamp(glow, 0.0, 1.0)) * glow * 0.34;',
  '',
  // Dither to kill gradient banding.
  '  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;',
  '  gl_FragColor = vec4(col, 1.0);',
  '}'
].join('\n');

// ---- Node-network layer shaders (positions arrive pre-mapped to clip space) ----
const NODE_VERT = [
  'attribute float aSize;',
  'attribute float aAlpha;',
  'uniform float uPr;',
  'varying float vA;',
  'void main() {',
  '  vA = aAlpha;',
  '  gl_PointSize = aSize * uPr;',
  '  gl_Position = vec4(position.xy, 0.0, 1.0);',
  '}'
].join('\n');

const NODE_FRAG = [
  'precision mediump float;',
  'uniform vec3 uColor;',
  'varying float vA;',
  'void main() {',
  '  float d = length(gl_PointCoord - 0.5);',
  '  float f = smoothstep(0.5, 0.12, d);',
  '  gl_FragColor = vec4(uColor, vA * f);',
  '}'
].join('\n');

const LINE_VERT = [
  'attribute float aAlpha;',
  'varying float vA;',
  'void main() {',
  '  vA = aAlpha;',
  '  gl_Position = vec4(position.xy, 0.0, 1.0);',
  '}'
].join('\n');

const LINE_FRAG = [
  'precision mediump float;',
  'uniform vec3 uColor;',
  'varying float vA;',
  'void main() {',
  '  gl_FragColor = vec4(uColor, vA);',
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
  const colPale = new THREE.Color(cssColor('--color-blue-100', '#C5DFF2'));

  const pointer = { x: 0, y: 0, tx: 0, ty: 0, cx: -1, cy: -1 };
  const pointerFine = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);
  if (pointerFine) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
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
      uColorD: { value: colD },
      uGlowPos: { value: new THREE.Vector2(0.5, 0.5) },
      uGlow: { value: 0 }
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
      uniforms: uniforms, visible: false, driftT: 0,
      A: 1, net: null, glow: 0, glowT: 0, gx: 0.5, gy: 0.5
    };
    band.net = makeNetwork(band, deep);

    function size() {
      const w = Math.max(1, el.clientWidth);
      const h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(renderer.domElement.width, renderer.domElement.height);
      const A = w / h;
      // Keep node x positions proportional when the band's aspect changes.
      if (band.net && band.A !== A) {
        const k = A / band.A;
        for (let i = 0; i < band.net.count; i++) band.net.px[i] *= k;
      }
      band.A = A;
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

  // ---- Node network: drifting points, distance-linked lines, cursor node ----
  const LINK_R = 0.16;          // link radius, in band-height units
  const CURSOR_R = LINK_R * 1.4;

  function makeNetwork(band, deep) {
    const count = Math.max(16, Math.round(conf.nodes * (deep ? 0.7 : 1)));
    const px = new Float32Array(count), py = new Float32Array(count);
    const vx = new Float32Array(count), vy = new Float32Array(count);
    const sx = new Float32Array(count); // scratch: displayed x (drift applied)
    for (let i = 0; i < count; i++) {
      px[i] = Math.random();          // x spans [0, A]; A is 1 until size() runs
      py[i] = Math.random();
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.012 + Math.random() * 0.01;   // band-heights per second
      vx[i] = Math.cos(ang) * spd;
      vy[i] = Math.sin(ang) * spd;
    }

    const pgeo = new THREE.BufferGeometry();
    const ppos = new Float32Array(count * 3);
    const psize = new Float32Array(count);
    const palpha = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      psize[i] = 2.2 + Math.random() * 2.4;
      palpha[i] = 0.3 + Math.random() * 0.25;
    }
    pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3).setUsage(THREE.DynamicDrawUsage));
    pgeo.setAttribute('aSize', new THREE.BufferAttribute(psize, 1));
    pgeo.setAttribute('aAlpha', new THREE.BufferAttribute(palpha, 1));
    const pmat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: colPale }, uPr: { value: band.renderer.getPixelRatio() } },
      vertexShader: NODE_VERT, fragmentShader: NODE_FRAG,
      transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending
    });
    band.scene.add(new THREE.Points(pgeo, pmat));

    const maxSegs = (count * (count - 1)) / 2 + count;
    const lgeo = new THREE.BufferGeometry();
    const lpos = new Float32Array(maxSegs * 2 * 3);
    const lalpha = new Float32Array(maxSegs * 2);
    lgeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3).setUsage(THREE.DynamicDrawUsage));
    lgeo.setAttribute('aAlpha', new THREE.BufferAttribute(lalpha, 1).setUsage(THREE.DynamicDrawUsage));
    lgeo.setDrawRange(0, 0);
    const lmat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: colD } },
      vertexShader: LINE_VERT, fragmentShader: LINE_FRAG,
      transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending
    });
    band.scene.add(new THREE.LineSegments(lgeo, lmat));

    return { count: count, activeN: count, px: px, py: py, vx: vx, vy: vy, sx: sx,
             pgeo: pgeo, ppos: ppos, pmat: pmat, lgeo: lgeo, lpos: lpos, lalpha: lalpha, maxSegs: maxSegs };
  }

  function updateNetwork(b, dt) {
    const net = b.net;
    if (!net) return;
    const A = b.A;
    const n = net.activeN;
    const px = net.px, py = net.py, vx = net.vx, vy = net.vy, sx = net.sx;

    // Cursor in band-local network space (x in [0,A], y up).
    let cx = 0, cy = 0, inBand = false;
    if (pointerFine && pointer.cx >= 0) {
      const rect = b.el.getBoundingClientRect();
      const lx = (pointer.cx - rect.left) / Math.max(1, rect.width);
      const ly = (pointer.cy - rect.top) / Math.max(1, rect.height);
      if (lx >= 0 && lx <= 1 && ly >= 0 && ly <= 1) {
        cx = lx * A;
        cy = 1 - ly;
        inBand = true;
        b.gx = ease(b.gx, lx, 10, dt);
        b.gy = ease(b.gy, 1 - ly, 10, dt);
      }
    }
    b.glowT = inBand ? 1 : 0;
    b.glow = ease(b.glow, b.glowT, 5, dt);
    b.uniforms.uGlow.value = b.glow;
    b.uniforms.uGlowPos.value.set(b.gx, b.gy);

    const drift = b.uniforms.uDrift.value * 0.25;
    const wrapW = A + 0.12;

    for (let i = 0; i < n; i++) {
      // Gentle pull toward the cursor for nearby nodes.
      if (inBand) {
        const dx = cx - px[i] - drift, dy = cy - py[i];
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 0.001 && d < CURSOR_R) {
          vx[i] += (dx / d) * 0.008 * dt;
          vy[i] += (dy / d) * 0.008 * dt;
          const spd = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]);
          if (spd > 0.04) { vx[i] *= 0.04 / spd; vy[i] *= 0.04 / spd; }
        }
      }
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
      if (px[i] < -0.06) px[i] += wrapW;
      else if (px[i] > A + 0.06) px[i] -= wrapW;
      if (py[i] < -0.06) py[i] += 1.12;
      else if (py[i] > 1.06) py[i] -= 1.12;

      // Displayed x: scroll drift pans the whole field on the work band.
      let xd = px[i] + drift;
      if (xd > A + 0.06) xd -= wrapW;
      sx[i] = xd;
      net.ppos[i * 3] = (xd / A) * 2 - 1;
      net.ppos[i * 3 + 1] = py[i] * 2 - 1;
    }
    net.pgeo.setDrawRange(0, n);
    net.pgeo.attributes.position.needsUpdate = true;

    // Distance links (n <= 100 -> at most 4,950 pairs; trivial per frame).
    const lpos = net.lpos, lalpha = net.lalpha;
    let s = 0;
    const put = (x1, y1, x2, y2, a) => {
      const o = s * 6;
      lpos[o] = (x1 / A) * 2 - 1; lpos[o + 1] = y1 * 2 - 1; lpos[o + 2] = 0;
      lpos[o + 3] = (x2 / A) * 2 - 1; lpos[o + 4] = y2 * 2 - 1; lpos[o + 5] = 0;
      lalpha[s * 2] = a; lalpha[s * 2 + 1] = a;
      s++;
    };
    for (let i = 0; i < n && s < net.maxSegs; i++) {
      for (let j = i + 1; j < n && s < net.maxSegs; j++) {
        const dx = sx[i] - sx[j], dy = py[i] - py[j];
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_R * LINK_R) {
          put(sx[i], py[i], sx[j], py[j], (1 - Math.sqrt(d2) / LINK_R) * 0.28);
        }
      }
      if (inBand && s < net.maxSegs) {
        const dx = sx[i] - cx, dy = py[i] - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CURSOR_R) {
          put(sx[i], py[i], cx, cy, (1 - d / CURSOR_R) * 0.4 * (1 + b.glow * 0.5));
        }
      }
    }
    net.lgeo.setDrawRange(0, s * 2);
    net.lgeo.attributes.position.needsUpdate = true;
    net.lgeo.attributes.aAlpha.needsUpdate = true;
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
      if (b.net) {
        b.net.activeN = Math.max(18, b.net.activeN >> 1);
        b.net.pmat.uniforms.uPr.value = b.renderer.getPixelRatio();
      }
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
      updateNetwork(b, dt);
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
