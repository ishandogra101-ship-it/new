/* Alvina Varughese — the painted water canvas.
   One fixed WebGL layer paints the whole page: flowing Van Gogh-style brush dashes
   over a watercolour wash, with light on the water. The colours follow the page
   (each section has a palette, set by data-pal) and the paint scrolls with the
   content, so the page reads as one long canvas.
   Interaction: ripples spread from the pointer, from taps and clicks, and from
   anything marked data-ripple as it scrolls into view; scrolling makes the
   surface wobble. The paint calms down behind blocks marked data-calm so the
   words stay readable. Falls back to a CSS gradient without WebGL. */
(function () {
  'use strict';
  var cv = document.getElementById('water');
  if (!cv) return;
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = null;
  try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' }); } catch (e) {}
  if (!gl) { root.classList.add('no-water'); return; }

  /* palettes: paper / main strokes / second strokes / accent strokes */
  var PALS = {
    hero:   ['#fbdcd3', '#ec6a92', '#f6a93b', '#9b6ad9'],
    moss:   ['#eef0c8', '#93bd5c', '#f3bf3c', '#e8577e'],
    lilac:  ['#e6dcf6', '#7d88ea', '#c578d8', '#f4a9bd'],
    peach:  ['#fde1cf', '#f0814f', '#e5507a', '#f5c24a'],
    night:  ['#1d2a6e', '#3b5fd4', '#f2c43c', '#7fb2f2'],
    sun:    ['#fff0bf', '#f5a623', '#ea5a36', '#7cc06a'],
    mint:   ['#dcf0e0', '#4fa56a', '#2b8077', '#f2c14e'],
    coral:  ['#fddccf', '#ec4a2c', '#f5a623', '#d4246f'],
    sky:    ['#d7e2fb', '#4f73e3', '#93c2f6', '#f294b4'],
    orchid: ['#f6dcec', '#c25fae', '#f4a83d', '#86c674'],
    dusk:   ['#22102c', '#5b2a83', '#f2c43c', '#d4246f']
  };

  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uScale,uScroll,uPageH,uT,uVel;',
    'uniform vec4 uRip[10];uniform vec4 uCalm[16];uniform sampler2D uPal;',
    'float perm(float x){return mod((x*34.+1.)*x,289.);}',
    'float hash(vec2 i){i=mod(i,289.);return perm(perm(i.x)+i.y)/289.;}',
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<3;k++){v+=a*vn(p);p=p*2.07+vec2(13.1,7.7);a*=.5;}return v/.875;}',
    'void main(){',
    ' vec2 css=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uScale;',
    ' vec2 P=css+vec2(0.,uScroll);',
    /* ripples: rings that push the paint outward and catch the light */
    ' vec2 disp=vec2(0.);float wave=0.;',
    ' for(int i=0;i<10;i++){vec4 r=uRip[i];float age=uT-r.z;',
    '  if(age>0.&&age<5.){vec2 d=P-r.xy;float dist=length(d)+.001;float x=dist-age*230.;',
    '   float env=exp(-x*x/3200.)*exp(-age*.75)*r.w;float w=sin(x*.085)*env;',
    '   disp+=d/dist*w*22.;wave+=w;}}',
    /* the swell: a slow travelling wave, plus a wobble while scrolling */
    ' float sw=sin(P.y*.010+uT*.8+sin(P.x*.005+uT*.35)*2.2);',
    ' disp+=vec2(sw*4.,cos(P.x*.008+uT*.6)*2.5)+vec2(sin(P.y*.018+uT*2.6)*uVel*.5,0.);',
    ' vec2 Q=P+disp;',
    ' float v=clamp(Q.y/uPageH,0.,1.);',
    ' vec3 base=texture2D(uPal,vec2(.125,v)).rgb,cA=texture2D(uPal,vec2(.375,v)).rgb,',
    '  cB=texture2D(uPal,vec2(.625,v)).rgb,cC=texture2D(uPal,vec2(.875,v)).rgb;',
    /* calm zones behind text */
    ' float calm=0.;',
    ' for(int i=0;i<16;i++){vec4 b=uCalm[i];vec2 c=(b.xy+b.zw)*.5,h=(b.zw-b.xy)*.5;',
    '  vec2 q=abs(P-c)-h;float sd=length(max(q,0.))+min(max(q.x,q.y),0.);',
    '  calm=max(calm,1.-smoothstep(-40.,110.,sd));}',
    /* flow field with a few Van Gogh swirls */
    ' vec2 lq=Q*.0016;',
    ' float ang=vn(lq+vec2(uT*.018,0.))*9.+vn(lq*2.7-vec2(0.,uT*.022))*3.;',
    ' vec2 cell=floor(Q/700.);float hv=hash(cell+31.);',
    ' if(hv>.42){vec2 cc=(cell+.3+.4*vec2(hash(cell+7.),hash(cell+19.)))*700.;',
    '  vec2 d=Q-cc;float rr=length(d);float wv=smoothstep(205.,25.,rr);',
    '  float tg=atan(d.y,d.x)+(hv>.71?1.5708:-1.5708)+rr*.004;',
    '  vec2 m=normalize(mix(vec2(cos(ang),sin(ang)),vec2(cos(tg),sin(tg)),wv)+1e-4);ang=atan(m.y,m.x);}',
    ' vec2 dir=vec2(cos(ang),sin(ang));',
    /* brush dashes: noise smeared along the flow */
    ' float s1=0.,s2=0.;',
    ' for(int k=-3;k<=3;k++){vec2 o=dir*float(k)*5.5;s1+=vn((Q+o)/7.5);s2+=vn((Q+o)/5.5+41.);}',
    ' s1/=7.;s2/=7.;',
    ' float m1=smoothstep(.555,.63,s1),m2=smoothstep(.575,.65,s2);',
    ' vec3 sc=mix(cA,cB,smoothstep(.32,.68,vn(Q*.0055+5.)));',
    ' float wash=fbm(Q*.0021+vec2(0.,uT*.012));',
    ' vec3 col=mix(base,cA,.28*smoothstep(.42,.85,wash));',
    ' col=mix(col,cC,.2*smoothstep(.52,.9,fbm(Q*.0031+9.)));',
    ' float k1=1.-calm*.86;',
    ' col=mix(col,sc,m1*.86*k1);',
    ' col=mix(col,cC,m2*.62*k1);',
    ' col+=(s1-.5)*.16*k1;',
    /* light on the water: drifting caustics, and ripple highlights */
    ' float cn=vn(Q*.011+vec2(uT*.22,uT*.15))+.7*vn(Q*.019-vec2(uT*.28,-uT*.1));',
    ' float caus=pow(1.-abs(cn/1.7*2.-1.),10.);',
    ' float lum=dot(base,vec3(.299,.587,.114));',
    ' vec3 glint=mix(vec3(1.,.98,.92),cB,.35);',
    ' col=mix(col,glint,caus*(.30+.25*(1.-lum))*(1.-calm*.6));',
    ' col+=wave*vec3(.16,.15,.13);',
    ' col*=.975+.035*vn(gl_FragCoord.xy*.9);',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(s)); }
    return s;
  }
  var prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { root.classList.add('no-water'); if (window.console) console.warn('water:', e.message); return; }
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ['uRes', 'uScale', 'uScroll', 'uPageH', 'uT', 'uVel', 'uRip', 'uCalm', 'uPal'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  /* palette texture: 4 columns (paper, A, B, C) x 512 rows down the page */
  var palCv = document.createElement('canvas'); palCv.width = 4; palCv.height = 512;
  var palCtx = palCv.getContext('2d');
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(U.uPal, 0);

  var pageH = 1, calmEls = [], calmRects = [], rippleEls = [];
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function measure() {
    pageH = Math.max(root.scrollHeight, 1);
    var sy = window.pageYOffset || 0;
    var secs = Array.prototype.slice.call(document.querySelectorAll('[data-pal]'));
    for (var c = 0; c < 4; c++) {
      var g = palCtx.createLinearGradient(0, 0, 0, 512);
      secs.forEach(function (s) {
        var p = PALS[s.getAttribute('data-pal')]; if (!p) return;
        var r = s.getBoundingClientRect(), top = r.top + sy, bot = r.bottom + sy;
        var blend = Math.min(s.classList.contains('dark') ? 150 : 260, (bot - top) * 0.28);
        g.addColorStop(clamp01((top + blend) / pageH), p[c]);
        g.addColorStop(clamp01((bot - blend) / pageH), p[c]);
      });
      palCtx.fillStyle = g; palCtx.fillRect(c, 0, 1, 512);
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, palCv);
    calmEls = Array.prototype.slice.call(document.querySelectorAll('[data-calm]'));
    calmRects = calmEls.map(function (el) {
      var r = el.getBoundingClientRect();
      return [r.left, r.top + sy, r.right, r.bottom + sy];
    }).filter(function (r) { return r[2] > r[0] && r[3] > r[1]; });
    dirty = true;
  }

  /* sizing: render below device resolution; the paint is soft anyway */
  var scale = 1, W = 0, H = 0;
  function size() {
    var w = window.innerWidth, h = window.innerHeight;
    var base = w < 700 ? 0.55 : 0.72;
    scale = Math.min(window.devicePixelRatio || 1, 1.5) * base * quality;
    W = Math.max(1, Math.round(w * scale)); H = Math.max(1, Math.round(h * scale));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    gl.viewport(0, 0, W, H);
    dirty = true;
  }

  /* ripples */
  var rip = new Float32Array(40), ri = 0;
  var t0 = performance.now();
  function now() { return (performance.now() - t0) / 1000; }
  function ripple(pageX, pageY, amp) {
    if (reduce) return;
    rip[ri * 4] = pageX; rip[ri * 4 + 1] = pageY; rip[ri * 4 + 2] = now(); rip[ri * 4 + 3] = amp;
    ri = (ri + 1) % 10;
  }
  window.paintRipple = ripple;
  for (var i = 0; i < 10; i++) rip[i * 4 + 2] = -99;

  var px = -1, py = -1, lastRx = -9999, lastRy = -9999, lastRt = 0;
  window.addEventListener('pointermove', function (e) {
    px = e.clientX; py = e.clientY;
    var x = px, y = py + window.pageYOffset, t = now();
    var d = Math.hypot(x - lastRx, y - lastRy);
    if (d > 110 && t - lastRt > 0.09) { ripple(x, y, 0.42); lastRx = x; lastRy = y; lastRt = t; }
  }, { passive: true });
  window.addEventListener('pointerdown', function (e) { ripple(e.clientX, e.clientY + window.pageYOffset, 1.25); }, { passive: true });

  var lastY = window.pageYOffset, vel = 0, lastScrollRip = 0;
  window.addEventListener('scroll', function () {
    dirty = true;
    var t = now();
    if (t - lastScrollRip > 0.22) {
      lastScrollRip = t;
      if (px >= 0) ripple(px, py + window.pageYOffset, 0.5);
      else ripple(window.innerWidth * (0.15 + Math.random() * 0.7), window.pageYOffset + window.innerHeight * (0.3 + Math.random() * 0.5), 0.45);
    }
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var r = e.target.getBoundingClientRect();
        ripple(r.left + r.width / 2, r.top + r.height / 2 + window.pageYOffset, 0.95);
      });
    }, { threshold: 0.35 });
    rippleEls = Array.prototype.slice.call(document.querySelectorAll('[data-ripple]'));
    rippleEls.forEach(function (el) { io.observe(el); });
  }

  var calmBuf = new Float32Array(64);
  function packCalm(sy, vh) {
    var n = 0;
    for (var i = 0; i < calmRects.length && n < 16; i++) {
      var r = calmRects[i];
      if (r[3] < sy - 200 || r[1] > sy + vh + 200) continue;
      calmBuf[n * 4] = r[0]; calmBuf[n * 4 + 1] = r[1]; calmBuf[n * 4 + 2] = r[2]; calmBuf[n * 4 + 3] = r[3]; n++;
    }
    for (; n < 16; n++) { calmBuf[n * 4] = -1e5; calmBuf[n * 4 + 1] = -1e5; calmBuf[n * 4 + 2] = -1e5 + 1; calmBuf[n * 4 + 3] = -1e5 + 1; }
  }

  var dirty = true, quality = 1, slow = 0, lastFrame = performance.now(), frames = 0;
  function draw() {
    var sy = window.pageYOffset || 0;
    vel += ((sy - lastY) - vel) * 0.12; lastY = sy;
    if (Math.abs(vel) > 40) vel = 40 * Math.sign(vel);
    packCalm(sy, window.innerHeight);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uScale, scale);
    gl.uniform1f(U.uScroll, sy);
    gl.uniform1f(U.uPageH, pageH);
    gl.uniform1f(U.uT, reduce ? 12.0 : now());
    gl.uniform1f(U.uVel, reduce ? 0 : vel);
    gl.uniform4fv(U.uRip, rip);
    gl.uniform4fv(U.uCalm, calmBuf);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    dirty = false;
  }
  function loop() {
    var t = performance.now(), dt = t - lastFrame; lastFrame = t;
    if (!document.hidden) {
      draw();
      /* if the device struggles, paint at a lower resolution */
      if (++frames > 30) { slow = slow * 0.9 + (dt > 26 ? 1 : 0) * 0.1; if (slow > 0.6 && quality > 0.55) { quality *= 0.82; slow = 0; size(); } }
    }
    requestAnimationFrame(loop);
  }

  measure(); size();
  root.classList.add('has-water');
  if (reduce) {
    draw();
    window.addEventListener('scroll', function () { requestAnimationFrame(draw); }, { passive: true });
    window.addEventListener('resize', function () { size(); measure(); draw(); });
  } else {
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { size(); measure(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);
  if ('ResizeObserver' in window) {
    var rt; new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(function () { measure(); if (reduce) draw(); }, 120); }).observe(document.body);
  }
  window.paintMeasure = measure;
  cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); root.classList.add('no-water'); });
})();
