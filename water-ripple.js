/*
 * Cursor-driven WATER REFRACTION for blue hero backgrounds (WebGL).
 * The hero gradient is recreated inside the shader so the cursor's wave
 * packets warp the actual pixels — true refraction, not drawn rings.
 *
 * Auto-applies to: any `.page-hero` element and any element with [data-water].
 * Falls back silently to the CSS gradient if WebGL is unavailable.
 */
(function () {
  var MAX = 24; // max simultaneous ripples (uniform array size)
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupWater(section) {
    if (!section || section.dataset.waterInit === '1') return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;';

    var gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true }) ||
             canvas.getContext('experimental-webgl');
    if (!gl) return; // leave the CSS gradient untouched

    // Mount: canvas above the CSS gradient, decorative SVGs lifted above the canvas.
    section.insertBefore(canvas, section.firstChild);
    var svgs = section.querySelectorAll(':scope > svg');
    for (var s = 0; s < svgs.length; s++) svgs[s].style.zIndex = '2';
    section.dataset.waterInit = '1';

    var vsSrc =
      'attribute vec2 a_pos;' +
      'void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }';

    var fsSrc =
      'precision highp float;' +
      'uniform vec2 u_res;' +
      'uniform float u_time;' +
      'uniform float u_dpr;' +
      'uniform float u_ambient;' +
      'uniform int u_count;' +
      'uniform vec2 u_centers[' + MAX + '];' +
      'uniform float u_starts[' + MAX + '];' +
      'vec3 bg(vec2 uv){' +
      '  float ang = radians(148.0);' +
      '  vec2 dir = vec2(sin(ang), -cos(ang));' +
      '  float t = clamp(dot(uv - 0.5, dir) + 0.5, 0.0, 1.0);' +
      '  vec3 c0 = vec3(0.114,0.427,0.690);' + // #1d6db0
      '  vec3 c1 = vec3(0.122,0.220,0.510);' + // #1f3882
      '  vec3 c2 = vec3(0.098,0.137,0.353);' + // #19235a
      '  vec3 col = t < 0.42 ? mix(c0,c1,t/0.42) : mix(c1,c2,(t-0.42)/0.58);' +
      '  float f2 = smoothstep(0.65, 0.0, distance(uv, vec2(1.05,0.95)));' +
      '  col += vec3(0.169,0.224,0.565) * 0.50 * f2;' +
      '  return col;' +
      '}' +
      'void main(){' +
      '  vec2 uv = vec2(gl_FragCoord.x / u_res.x, 1.0 - gl_FragCoord.y / u_res.y);' +
      '  vec2 px = uv * u_res;' +
      '  vec2 disp = vec2(0.0);' +
      '  float crest = 0.0;' +
      '  float maxAge = 3.4;' +
      '  float speed = 65.0 * u_dpr;' +
      '  float width = 60.0 * u_dpr;' +
      '  float freq  = 0.13 / u_dpr;' +
      '  for (int i = 0; i < ' + MAX + '; i++){' +
      '    if (i >= u_count) break;' +
      '    float age = u_time - u_starts[i];' +
      '    if (age < 0.0 || age > maxAge) continue;' +
      '    vec2 c = u_centers[i];' +
      '    float dist = distance(px, c);' +
      '    float wr = age * speed;' +
      '    float dd = dist - wr;' +
      '    float env = exp(-(dd*dd) / (2.0*width*width));' +
      '    float life = 1.0 - age / maxAge;' +
      '    float w = sin(dd * freq) * env * life;' +
      '    vec2 dirp = dist > 0.001 ? (px - c) / dist : vec2(0.0);' +
      '    disp += dirp * w;' +
      '    crest += max(0.0, w) * life;' +
      '  }' +
      '  float amp = 4.5 * u_dpr;' +
      // Ambient drift: layered low-freq sines so the surface shimmers at rest.
      '  vec2 ambient = vec2(0.0);' +
      '  if (u_ambient > 0.5) {' +
      '    float aa = 1.3 * u_dpr;' +
      '    ambient.x = sin(uv.y * 6.0 + u_time * 0.55) * 0.6 + sin(uv.y * 11.0 - u_time * 0.32) * 0.35;' +
      '    ambient.y = sin(uv.x * 7.0 - u_time * 0.48) * 0.6 + sin(uv.x * 13.0 + u_time * 0.4) * 0.35;' +
      '    ambient *= aa;' +
      '  }' +
      '  vec2 ruv = uv + (disp * amp + ambient) / u_res;' +
      '  vec3 col = bg(ruv);' +
      '  col += vec3(0.70,0.85,1.0) * clamp(crest, 0.0, 1.0) * 0.07;' +
      '  gl_FragColor = vec4(col, 1.0);' +
      '}';

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn('water-ripple shader error:', gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }

    var vs = compile(gl.VERTEX_SHADER, vsSrc);
    var fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) { canvas.remove(); section.dataset.waterInit = ''; return; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var locPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'u_res');
    var uTime = gl.getUniformLocation(prog, 'u_time');
    var uDpr = gl.getUniformLocation(prog, 'u_dpr');
    var uAmbient = gl.getUniformLocation(prog, 'u_ambient');
    var uCount = gl.getUniformLocation(prog, 'u_count');
    var uCenters = gl.getUniformLocation(prog, 'u_centers');
    var uStarts = gl.getUniformLocation(prog, 'u_starts');

    // Clamp DPR harder on narrow screens: quarter-to-half the fill cost on
    // cheap phones, invisible on a soft gradient.
    var dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.25 : 2);
    function resize() {
      var r = section.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    var centers = new Float32Array(MAX * 2);
    var starts = new Float32Array(MAX);
    for (var k = 0; k < MAX; k++) starts[k] = -999;
    var head = 0, count = 0, lastSpawn = 0, t0 = performance.now();

    function spawn(x, y) {
      centers[head * 2] = x;
      centers[head * 2 + 1] = y;
      starts[head] = (performance.now() - t0) / 1000;
      head = (head + 1) % MAX;
      if (count < MAX) count++;
    }

    // pointermove covers mouse, pen and (while touching) touch input.
    section.addEventListener('pointermove', function (e) {
      if (prefersReduced) return;
      var now = performance.now();
      if (now - lastSpawn < 60) return; // throttle spawn rate
      lastSpawn = now;
      var rect = section.getBoundingClientRect();
      spawn((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr);
    });

    // Idle / touch coverage: a slow auto-ripple so the surface always has life
    // on mobile and when the cursor is still. Paused while off-screen.
    if (!prefersReduced) {
      setInterval(function () {
        if (!running) return;
        spawn(Math.random() * canvas.width, Math.random() * canvas.height);
      }, 2500);
    }

    function draw() {
      var time = (performance.now() - t0) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uDpr, dpr);
      gl.uniform1f(uAmbient, prefersReduced ? 0.0 : 1.0);
      gl.uniform1i(uCount, count);
      gl.uniform2fv(uCenters, centers);
      gl.uniform1fv(uStarts, starts);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Render loop with start/stop so the GPU idles while the hero is
    // off-screen (the section keeps its last frame as a static image).
    var running = false, rafId = 0;
    function frame() {
      if (!running) return;
      draw();
      rafId = requestAnimationFrame(frame);
    }
    function start() {
      if (running || prefersReduced) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    if (prefersReduced) {
      draw(); // one static frame; never loop, never spawn
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0 }).observe(section);
    } else {
      start();
    }

    // Programmatic drop API (coords are 0..1 ratios of the section box) so
    // scroll scenes can land a ripple on cue. No-ops under reduced motion.
    section.waterAPI = {
      drop: function (rx, ry) {
        if (prefersReduced) return;
        spawn(rx * canvas.width, ry * canvas.height);
        start();
      },
      burst: function (rx, ry, n, gapMs) {
        n = n || 3; gapMs = gapMs || 180;
        for (var i = 0; i < n; i++) setTimeout(section.waterAPI.drop, i * gapMs, rx, ry);
      }
    };
  }

  // Global facade: WaterRipple.drop('#hero', 0.5, 0.4) from other scripts.
  window.WaterRipple = window.WaterRipple || {
    drop: function (target, rx, ry) {
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el && el.waterAPI) el.waterAPI.drop(rx, ry);
    },
    burst: function (target, rx, ry, n, gapMs) {
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el && el.waterAPI) el.waterAPI.burst(rx, ry, n, gapMs);
    }
  };

  function init() {
    var heroes = document.querySelectorAll('.page-hero, [data-water]');
    for (var i = 0; i < heroes.length; i++) setupWater(heroes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
