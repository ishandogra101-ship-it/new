/* =========================================================
   Alvina Varughese — portfolio interactions (editorial)
   ========================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* reveal on scroll */
  var rises = $$('[data-rise]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    rises.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rises.forEach(function (el) { el.classList.add('in'); }); }, 2800);
  } else { rises.forEach(function (el) { el.classList.add('in'); }); }

  /* progress + nav state + back-to-top */
  var prog = $('#progress span'), nav = $('#nav'), toTop = $('#toTop');
  function onScroll() {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', st > 12);
    if (toTop) toTop.classList.toggle('show', st > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* active nav link */
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

  /* mobile nav */
  var toggle = $('#navToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; });
    });
  }

  /* count-up metrics */
  var counted = false;
  function runCount() {
    if (counted) return; counted = true;
    $$('.metric__n[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target + suffix; return; }
      var start = null, dur = 1300;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var growthEl = $('.figures');
  if (growthEl && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { runCount(); so.disconnect(); } });
    }, { threshold: 0.35 });
    so.observe(growthEl);
  } else { runCount(); }

  /* drag-to-scroll strips */
  $$('[data-strip]').forEach(function (strip) {
    var down = false, startX, scrollLeft, moved = false;
    strip.addEventListener('mousedown', function (e) { down = true; moved = false; strip.classList.add('dragging'); startX = e.pageX - strip.offsetLeft; scrollLeft = strip.scrollLeft; });
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

  /* lightbox */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var zoomEls = $$('[data-zoom]'), current = -1;
  function openLB(i) {
    current = i; var el = zoomEls[i]; if (!el) return;
    lbImg.setAttribute('src', el.getAttribute('src'));
    lbImg.setAttribute('alt', el.getAttribute('alt') || '');
    lbCap.textContent = el.getAttribute('data-cap') || el.getAttribute('alt') || '';
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
  }
  function closeLB() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; current = -1; }
  function step(d) { if (current < 0) return; openLB((current + d + zoomEls.length) % zoomEls.length); }
  zoomEls.forEach(function (el, i) { el.addEventListener('click', function () { openLB(i); }); });
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__figure')) closeLB(); });
    $('#lbClose').addEventListener('click', closeLB);
    $('#lbPrev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    $('#lbNext').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
    });
  }

  /* placeholder links */
  $$('[data-placeholder]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
})();
