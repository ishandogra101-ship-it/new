/* Alvina Varughese — interactions. Everything here is progressive enhancement:
   the page reads fully without it. The painted canvas lives in water.js. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* nav: scrolled state, back-to-top, active section */
  var nav = $('#nav'), toTop = $('#toTop');
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (nav) nav.classList.toggle('scrolled', y > 10);
    if (toTop) toTop.classList.toggle('show', y > 900);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  var links = $$('.nav__links a[data-nav]');
  var map = {};
  links.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) map[t.id] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (l) { l.classList.remove('active'); });
          map[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { spy.observe($('#' + id)); });
  }

  /* mobile menu */
  var toggle = $('#navToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
      });
    });
  }

  /* wobbly letters: split into spans; each one boings when touched */
  $$('.wobble').forEach(function (el) {
    var text = el.textContent, i = 0;
    el.setAttribute('aria-label', text.trim());
    el.textContent = '';
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
      var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      part.split('').forEach(function (ch) {
        var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch;
        s.style.setProperty('--i', i++);
        w.appendChild(s);
      });
      el.appendChild(w);
    });
    if (reduce) return;
    el.addEventListener('pointerover', function (e) {
      var c = e.target.closest && e.target.closest('.ch');
      if (!c || c.classList.contains('boing')) return;
      c.classList.add('boing');
      c.addEventListener('animationend', function done() { c.classList.remove('boing'); c.removeEventListener('animationend', done); });
    });
  });

  /* things that happen once a block is on screen: doodles draw, highlights
     sweep, numbers count, blocks settle in */
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 1400;
    if (reduce || !end) return;
    function f(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(f);
    }
    el.textContent = '0'; requestAnimationFrame(f);
  }
  var onView = $$('.doodle, .hl, [data-count], .reveal-me');
  if ('IntersectionObserver' in window && !reduce) {
    var vh = window.innerHeight;
    $$('.stat, .deliver__list li, .role, .case__body, .case__visual, .tag, .writing, .about__cols > div, .langs li, .pills li').forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.92) { el.classList.add('reveal'); onView.push(el); }
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in', 'drawn');
        if (el.hasAttribute('data-count')) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
    onView.forEach(function (el) { io.observe(el); });
    setTimeout(function () { $$('.reveal').forEach(function (el) { el.classList.add('in'); }); }, 6000);
  } else {
    onView.forEach(function (el) { el.classList.add('in', 'drawn'); });
  }

  /* figs on strings: spring physics. The pointer's sideways speed pushes any
     fig it passes; clicking a fig gives it a gentle shove. */
  var swings = $$('.hang, .node__fig').map(function (el) {
    return { el: el, a: 0, v: 0, ph: Math.random() * 6.28, sp: 0.6 + Math.random() * 0.5, vis: false };
  });
  var pX = -1e4, pY = -1e4, pVX = 0;
  window.addEventListener('pointermove', function (e) {
    if (pX > -1e3) pVX = pVX * 0.5 + Math.max(-60, Math.min(60, e.clientX - pX)) * 0.5;
    pX = e.clientX; pY = e.clientY;
  }, { passive: true });
  if (swings.length && !reduce) {
    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target._sw.vis = e.isIntersecting; });
      }, { rootMargin: '100px' });
      swings.forEach(function (s) { s.el._sw = s; sio.observe(s.el); });
    } else swings.forEach(function (s) { s.vis = true; });
    swings.forEach(function (s) {
      s.el.addEventListener('pointerdown', function (e) {
        s.v += (e.clientX < s.el.getBoundingClientRect().left + s.el.offsetWidth / 2 ? 1 : -1) * 4;
      });
    });
    var t = 0;
    (function tick() {
      t += 1 / 60;
      for (var i = 0; i < swings.length; i++) {
        var s = swings[i];
        if (!s.vis) continue;
        var r = s.el.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height * 0.6;
        var dx = pX - cx, dy = pY - cy, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) s.v += pVX * 0.05 * (1 - d / 130);
        s.v += -0.035 * s.a - 0.045 * s.v;
        s.a += s.v;
        if (s.a > 40) s.a = 40; else if (s.a < -40) s.a = -40;
        var idle = Math.sin(t * s.sp + s.ph) * 2.2;
        s.el.style.setProperty('--a', (s.a + idle).toFixed(2) + 'deg');
      }
      pVX *= 0.9;
      requestAnimationFrame(tick);
    })();
  }

  /* work samples tilt toward the pointer */
  if (fine && !reduce) {
    $$('.s').forEach(function (fig) {
      var img = $('img', fig);
      fig.addEventListener('pointermove', function (e) {
        var r = fig.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = 'perspective(900px) rotateY(' + (x * 14).toFixed(2) + 'deg) rotateX(' + (-y * 14).toFixed(2) + 'deg) scale(1.04)';
      });
      fig.addEventListener('pointerleave', function () { img.style.transform = ''; });
    });
    /* buttons lean toward the pointer */
    $$('.magnet').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px) rotate(-2deg)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* stickers and tags give a little jiggle when tapped */
  $$('.sticker, .tag, .pills li, .langs li').forEach(function (el) {
    el.addEventListener('pointerdown', function (e) { el.classList.remove('jig'); void el.offsetWidth; el.classList.add('jig'); });
  });

  /* lightbox */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var zs = $$('[data-zoom]'), cur = -1, last = null;
  function open(i) {
    cur = i; var el = zs[i]; if (!el) return;
    last = document.activeElement;
    lbImg.src = el.getAttribute('src'); lbImg.alt = el.getAttribute('alt') || '';
    lbCap.textContent = el.getAttribute('data-cap') || '';
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function close() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; cur = -1;
    if (last && last.focus) last.focus();
  }
  function step(d) { if (cur >= 0) open((cur + d + zs.length) % zs.length); }
  zs.forEach(function (el, i) {
    el.tabIndex = 0; el.setAttribute('role', 'button');
    el.addEventListener('click', function () { open(i); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__figure')) close(); });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    $('#lbNext').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    document.addEventListener('keydown', function (e) {
      if (cur < 0) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') {
        var f = $$('button', lb), first = f[0], lastB = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastB.focus(); }
        else if (!e.shiftKey && document.activeElement === lastB) { e.preventDefault(); first.focus(); }
      }
    });
  }
})();
