/* Alvina Varughese — the painted canvas.
   One fixed WebGL layer paints the whole page as a single, continuous painting:
   soft watercolour washes under Van Gogh-style brush strokes that drift slowly
   along swirling currents, all the time, at a mellow pace. The colours wander
   across the page by themselves (they are not tied to sections), and the paint
   scrolls with the content, so the page reads as one canvas made in one go.
   The paint calms down behind blocks marked data-calm so text stays readable.
   Without WebGL the page falls back to a soft CSS gradient. */
(function () {
  'use strict';
  var cv = document.getElementById('water');
  if (!cv) return;
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = null;
  try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch (e) {}
  if (!gl) { root.classList.add('no-water'); return; }

  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uScale,uScroll,uPageH,uT;uniform vec4 uCalm[16];',
    /* one palette for the whole painting: warm paper, then rose, sage and
       lavender families that drift into each other, with ochre and plum accents */
    'const vec3 PAPER=vec3(.973,.937,.906);',
    'const vec3 ROSE_W=vec3(.953,.855,.847),ROSE_S=vec3(.875,.682,.718),ROSE_D=vec3(.776,.553,.635);',
    'const vec3 SAGE_W=vec3(.902,.914,.824),SAGE_S=vec3(.737,.773,.596),SAGE_D=vec3(.616,.667,.494);',
    'const vec3 LAV_W=vec3(.910,.890,.949),LAV_S=vec3(.761,.718,.867),LAV_D=vec3(.639,.596,.788);',
    'const vec3 OCHRE=vec3(.906,.796,.588),PLUM=vec3(.62,.46,.6);',
    'float perm(float x){return mod((x*34.+1.)*x,289.);}',
    'float hash(vec2 i){i=mod(i,289.);return perm(perm(i.x)+i.y)/289.;}',
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<3;k++){v+=a*vn(p);p=p*2.07+vec2(13.1,7.7);a*=.5;}return v/.875;}',
    /* brush strokes: noise smeared along the current (a cheap line-integral) */
    'float lic(vec2 q,vec2 d,float sc){float s=0.;for(int k=-3;k<=3;k++){s+=vn((q+d*float(k)*6.)/sc);}return s/7.;}',
    'void main(){',
    ' vec2 css=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uScale;',
    ' vec2 P=css+vec2(0.,uScroll);',
    /* a slow, gentle swell, like paint on water */
    ' vec2 Q=P+vec2(sin(P.y*.006+uT*.25)*3.,cos(P.x*.005+uT*.2)*3.);',
    /* calm zones behind text */
    ' float calm=0.;',
    ' for(int i=0;i<16;i++){vec4 b=uCalm[i];vec2 c=(b.xy+b.zw)*.5,h=(b.zw-b.xy)*.5;',
    '  vec2 q=abs(P-c)-h;float sd=length(max(q,0.))+min(max(q.x,q.y),0.);',
    '  calm=max(calm,1.-smoothstep(-30.,120.,sd));}',
    /* colour families wander across the page in big soft regions */
    ' float r1=fbm(Q*.00042+vec2(3.,uT*.002)),r2=fbm(Q*.00037+vec2(11.,-uT*.0015));',
    ' float a=smoothstep(.38,.62,r1),b=smoothstep(.45,.68,r2);',
    ' vec3 W=mix(mix(ROSE_W,SAGE_W,a),LAV_W,b),S=mix(mix(ROSE_S,SAGE_S,a),LAV_S,b),D=mix(mix(ROSE_D,SAGE_D,a),LAV_D,b);',
    /* the current: a slow-turning flow field with a few swirls */
    ' vec2 lq=Q*.0014;',
    ' float ang=vn(lq+vec2(uT*.006,0.))*8.+vn(lq*2.5-vec2(0.,uT*.008))*2.5;',
    ' vec2 cell=floor(Q/760.);float hv=hash(cell+31.);',
    ' if(hv>.4){vec2 cc=(cell+.3+.4*vec2(hash(cell+7.),hash(cell+19.)))*760.;',
    '  vec2 dd=Q-cc;float rr=length(dd);float wv=smoothstep(225.,30.,rr);',
    '  float tg=atan(dd.y,dd.x)+(hv>.7?1.5708:-1.5708)+rr*.0035;',
    '  vec2 m=normalize(mix(vec2(cos(ang),sin(ang)),vec2(cos(tg),sin(tg)),wv)+1e-4);ang=atan(m.y,m.x);}',
    ' vec2 dir=vec2(cos(ang),sin(ang));',
    /* strokes drift along the current; two phases cross-fade so it never stops */
    ' float ph=fract(uT/10.),p2=fract(ph+.5);',
    ' float wA=1.-abs(2.*ph-1.),wB=1.-wA;',
    ' float sA=lic(Q-dir*ph*70.,dir,8.5),sB=lic(Q-dir*p2*70.+53.1,dir,8.5);',
    ' float m1=smoothstep(.545,.655,sA)*wA+smoothstep(.545,.655,sB)*wB;',
    ' float tA=lic(Q-dir*ph*70.+21.7,dir,6.),tB=lic(Q-dir*p2*70.+77.3,dir,6.);',
    ' float m2=smoothstep(.585,.68,tA)*wA+smoothstep(.585,.68,tB)*wB;',
    /* watercolour wash */
    ' float wash=fbm(Q*.0019+vec2(0.,uT*.004));',
    ' vec3 col=mix(PAPER,W,.85*smoothstep(.22,.8,wash));',
    ' col=mix(col,S,.18*smoothstep(.55,.9,fbm(Q*.0028+9.)));',
    ' float k1=1.-calm*.82;',
    ' vec3 sc=mix(S,D,smoothstep(.35,.7,vn(Q*.005+5.)));',
    ' col=mix(col,sc,m1*.6*k1);',
    ' col=mix(col,mix(OCHRE,PLUM,smoothstep(.4,.7,vn(Q*.004+2.))),m2*.26*k1);',
    ' col+=(sA*wA+sB*wB-.5)*.05*k1;',
    ' col=mix(col,PAPER,calm*.3);',
    ' col*=.982+.03*vn(gl_FragCoord.xy*.9);',
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
  } catch (e) { root.classList.add('no-water'); if (window.console) console.warn('canvas:', e.message); return; }
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ['uRes', 'uScale', 'uScroll', 'uPageH', 'uT', 'uCalm'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  var pageH = 1, calmRects = [];
  function measure() {
    pageH = Math.max(root.scrollHeight, 1);
    var sy = window.pageYOffset || 0;
    calmRects = Array.prototype.slice.call(document.querySelectorAll('[data-calm]')).map(function (el) {
      var r = el.getBoundingClientRect();
      return [r.left, r.top + sy, r.right, r.bottom + sy];
    }).filter(function (r) { return r[2] > r[0] && r[3] > r[1]; });
  }

  /* render below device resolution: the paint is soft, and it saves battery */
  var quality = 1, scale = 1, W = 0, H = 0;
  function size() {
    var w = window.innerWidth, h = window.innerHeight;
    var base = w < 700 ? 0.55 : 0.7;
    scale = Math.min(window.devicePixelRatio || 1, 1.5) * base * quality;
    W = Math.max(1, Math.round(w * scale)); H = Math.max(1, Math.round(h * scale));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    gl.viewport(0, 0, W, H);
  }

  var calmBuf = new Float32Array(64);
  function packCalm(sy, vh) {
    var n = 0;
    for (var i = 0; i < calmRects.length && n < 16; i++) {
      var r = calmRects[i];
      if (r[3] < sy - 200 || r[1] > sy + vh + 200) continue;
      calmBuf.set(r, n * 4); n++;
    }
    for (; n < 16; n++) calmBuf.set([-1e5, -1e5, -1e5 + 1, -1e5 + 1], n * 4);
  }

  var t0 = performance.now();
  function draw() {
    var sy = window.pageYOffset || 0;
    packCalm(sy, window.innerHeight);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uScale, scale);
    gl.uniform1f(U.uScroll, sy);
    gl.uniform1f(U.uPageH, pageH);
    gl.uniform1f(U.uT, reduce ? 40.0 : (performance.now() - t0) / 1000 + 40.0);
    gl.uniform4fv(U.uCalm, calmBuf);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* the paint moves slowly, so ~30 frames a second is plenty; if the device
     still struggles, paint at a lower resolution */
  var last = 0, slow = 0, frames = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    var dt = now - last;
    if (dt < 30) return;
    last = now;
    draw();
    if (++frames > 20) {
      slow = slow * 0.9 + (dt > 60 ? 0.1 : 0);
      if (slow > 0.5 && quality > 0.5) { quality *= 0.8; slow = 0; size(); }
    }
  }

  measure(); size();
  root.classList.add('has-water');
  draw();
  if (reduce) {
    window.addEventListener('scroll', function () { requestAnimationFrame(draw); }, { passive: true });
    window.addEventListener('resize', function () { size(); measure(); draw(); });
  } else {
    /* scrolling repaints straight away so the canvas never lags the page */
    window.addEventListener('scroll', function () { requestAnimationFrame(draw); }, { passive: true });
    window.addEventListener('resize', function () { size(); measure(); });
    requestAnimationFrame(loop);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);
  if ('ResizeObserver' in window) {
    var rt; new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(function () { measure(); if (reduce) draw(); }, 120); }).observe(document.body);
  }
  cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); root.classList.add('no-water'); });
})();
