/* =========================================================
   Alvina Varughese — interactions
   Motion is here to support composition, not to announce itself.
   ========================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* The display face carries the layout at very large sizes. If it fails to
     load (blocked network, offline), the substitute is much wider and the
     headline would spill past the page, so measure and let CSS step it down.
     document.fonts.check() is not usable here: it reports true for a family
     that was never declared. */
  function faceLoaded(name) {
    var c = document.createElement('canvas').getContext('2d');
    var probe = 'MMMMWWWWmmmmiiii';
    c.font = '100px monospace';
    var base = c.measureText(probe).width;
    c.font = '100px "' + name + '", monospace';
    return Math.abs(c.measureText(probe).width - base) > 0.5;
  }
  function checkDisplayFace() {
    document.documentElement.classList.toggle('no-anton', !faceLoaded('Anton'));
  }
  checkDisplayFace();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(checkDisplayFace).catch(function () {});
  }

  /* ---- section reveal ---- */
  var rises = $$('[data-rise]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    rises.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rises.forEach(function (el) { el.classList.add('in'); }); }, 2800);
  } else { rises.forEach(function (el) { el.classList.add('in'); }); }

  /* ---- image reveal: a short wipe, staggered within its own group ----
     Anything already on screen at load is shown straight away; the cover is
     never gated on a reveal. Only imagery further down the page waits. */
  if ('IntersectionObserver' in window && !reduce) {
    var groups = $$('.sp01__wall, .sp04__row, .sp03__stack, .club, .about');
    groups.forEach(function (g) {
      $$('img, figure', g).forEach(function (el, i) {
        el.classList.add('wipe');
        el.style.setProperty('--d', (i * 70) + 'ms');
      });
    });
    var wipes = $$('.wipe');
    var vh = window.innerHeight;
    wipes.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('wipe--in');
    });
    var wo = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('wipe--in'); wo.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    wipes.forEach(function (el) { if (!el.classList.contains('wipe--in')) wo.observe(el); });
    setTimeout(function () { wipes.forEach(function (el) { el.classList.add('wipe--in'); }); }, 1800);
  }

  /* ---- progress, nav state, back to top ---- */
  var prog = $('#progress span'), nav = $('#nav'), toTop = $('#toTop');
  function onScroll() {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', st > 12);
    if (toTop) toTop.classList.toggle('show', st > 800);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---- active section in nav ---- */
  var navLinks = $$('.nav__links a[data-nav]');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- mobile nav ---- */
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

  /* ---- figures count up ----
     The real value is already in the HTML (so no-JS / reduced-motion shows it
     correctly, never "0"). We only animate up from 0 when motion is allowed. */
  var counted = false;
  function runCount() {
    if (counted) return; counted = true;
    if (reduce) return;
    $$('.fig__n[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var start = null, dur = 1200;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var band = $('.figs');
  if (band && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { runCount(); so.disconnect(); } });
    }, { threshold: 0.3 });
    so.observe(band);
  } else { runCount(); }

  /* ---- drag to scroll the carousels ---- */
  $$('[data-strip]').forEach(function (strip) {
    var down = false, startX, scrollLeft, moved = false;
    strip.addEventListener('mousedown', function (e) {
      down = true; moved = false; strip.classList.add('dragging');
      startX = e.pageX - strip.offsetLeft; scrollLeft = strip.scrollLeft;
    });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('dragging'); });
    strip.addEventListener('mouseleave', function () { down = false; strip.classList.remove('dragging'); });
    strip.addEventListener('mousemove', function (e) {
      if (!down) return; e.preventDefault();
      var x = e.pageX - strip.offsetLeft;
      if (Math.abs(x - startX) > 4) moved = true;
      strip.scrollLeft = scrollLeft - (x - startX);
    });
    strip.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  });

  /* ---- lightbox ---- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var zoomEls = $$('[data-zoom]'), current = -1, lastFocus = null;
  function openLB(i) {
    current = i; var el = zoomEls[i]; if (!el) return;
    lastFocus = document.activeElement;
    lbImg.setAttribute('src', el.getAttribute('src'));
    lbImg.setAttribute('alt', el.getAttribute('alt') || '');
    lbCap.textContent = el.getAttribute('data-cap') || el.getAttribute('alt') || '';
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function closeLB() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; current = -1;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(d) { if (current < 0) return; openLB((current + d + zoomEls.length) % zoomEls.length); }
  zoomEls.forEach(function (el, i) {
    el.addEventListener('click', function () { openLB(i); });
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(i); }
    });
  });
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__figure')) closeLB(); });
    $('#lbClose').addEventListener('click', closeLB);
    $('#lbPrev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    $('#lbNext').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    });
  }

  /* ---- placeholder links stay inert until real URLs are added ---- */
  $$('[data-placeholder]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
})();
