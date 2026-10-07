/* Alvina Varughese — interactions. Everything here is progressive enhancement:
   the page reads fully without it. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  /* paint washes breathe only while they're on screen */
  if ('IntersectionObserver' in window && !reduce) {
    var live = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('live', e.isIntersecting); });
    }, { rootMargin: '200px 0px' });
    $$('.paint, .case__wash').forEach(function (el) { live.observe(el); });
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

  /* gentle reveal for below-the-fold blocks only */
  if ('IntersectionObserver' in window && !reduce) {
    var targets = $$('.delivered .stat, .story__text, .deliver__list li, .role, .case__body, .case__cover, .shelf .s, .writing, .about__cols, .tools__groups > div');
    var vh = window.innerHeight;
    targets.forEach(function (el) { if (el.getBoundingClientRect().top > vh * 0.95) el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
    setTimeout(function () { $$('.reveal').forEach(function (el) { el.classList.add('in'); }); }, 4000);
  }

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
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
    });
  }
})();
