/* =========================================================
   Alvina Varughese — portfolio interactions
   ========================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- preloader ---------- */
  window.addEventListener('load', function () {
    var pre = $('#preloader');
    if (!pre) return;
    setTimeout(function () { pre.classList.add('done'); }, reduce ? 100 : 1500);
  });
  // safety: never trap the user behind the loader
  setTimeout(function () { var p = $('#preloader'); if (p) p.classList.add('done'); }, 3500);

  /* ---------- year ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- scroll reveal ---------- */
  var rises = $$('[data-rise]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    rises.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rises.forEach(function (el) { el.classList.add('in'); }); }, 3200);
  } else {
    rises.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- scroll progress + nav state + back-to-top ---------- */
  var prog = $('#scrollProgress span');
  var nav = $('#nav');
  var toTop = $('#toTop');
  function onScroll() {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', st > 20);
    if (toTop) toTop.classList.toggle('show', st > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- active nav link ---------- */
  var navLinks = $$('.nav__links a[data-nav]');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- mobile nav ---------- */
  var toggle = $('#navToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------- count-up stats ---------- */
  var counted = false;
  function runCount() {
    if (counted) return; counted = true;
    $$('.stat__num').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target + suffix; return; }
      var start = null, dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var statsEl = $('.stats');
  if (statsEl && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { runCount(); so.disconnect(); } });
    }, { threshold: 0.4 });
    so.observe(statsEl);
  } else { runCount(); }

  /* ---------- petals ---------- */
  if (!reduce) {
    var petalWrap = $('#petals');
    var colors = ['#edb9cb', '#ecc79a', '#e6a6b8', '#e3b9c9', '#d98ca3'];
    if (petalWrap) {
      for (var i = 0; i < 9; i++) {
        var p = document.createElement('span');
        p.className = 'petal';
        var size = 8 + Math.random() * 8;
        p.style.left = Math.random() * 100 + '%';
        p.style.width = size + 'px'; p.style.height = size + 'px';
        p.style.background = colors[i % colors.length];
        p.style.animationDuration = (12 + Math.random() * 8) + 's';
        p.style.animationDelay = (Math.random() * 12) + 's';
        petalWrap.appendChild(p);
      }
    }
  }

  /* ---------- custom cursor ---------- */
  if (!isTouch && !reduce) {
    var cur = $('#cursor');
    if (cur) {
      document.body.classList.add('has-cursor');
      var cx = window.innerWidth / 2, cy = window.innerHeight / 2, rx = cx, ry = cy;
      window.addEventListener('mousemove', function (e) {
        cx = e.clientX; cy = e.clientY; cur.style.opacity = '1';
      });
      (function loop() {
        rx += (cx - rx) * 0.2; ry += (cy - ry) * 0.2;
        cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
        var ring = cur.querySelector('.cursor__ring');
        if (ring) ring.style.transform = 'translate(' + (rx - cx - 17) + 'px,' + (ry - cy - 17) + 'px)';
        requestAnimationFrame(loop);
      })();
      var hoverSel = 'a, button, [data-zoom], .chip, .magnetic';
      document.addEventListener('mouseover', function (e) { if (e.target.closest(hoverSel)) cur.classList.add('is-hover'); });
      document.addEventListener('mouseout', function (e) { if (e.target.closest(hoverSel)) cur.classList.remove('is-hover'); });
      window.addEventListener('mouseleave', function () { cur.style.opacity = '0'; });
    }
  }

  /* ---------- magnetic buttons ---------- */
  if (!isTouch && !reduce) {
    $$('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + mx * 0.25 + 'px,' + my * 0.35 + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- hero parallax ---------- */
  if (!isTouch && !reduce) {
    var collage = $('.hero__collage');
    var layers = $$('.parallax');
    if (collage && layers.length) {
      collage.addEventListener('mousemove', function (e) {
        var r = collage.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) / r.width;
        var my = (e.clientY - r.top - r.height / 2) / r.height;
        layers.forEach(function (l) {
          var d = parseFloat(l.getAttribute('data-depth')) || 0.06;
          l.style.transform = 'translate(' + (mx * d * 100) + 'px,' + (my * d * 100) + 'px)';
        });
      });
      collage.addEventListener('mouseleave', function () { layers.forEach(function (l) { l.style.transform = ''; }); });
    }
  }

  /* ---------- drag-to-scroll carousels + slide counter ---------- */
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
    // prevent lightbox opening after a drag
    strip.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);

    // counter
    var card = strip.closest('.card');
    var counter = card && card.querySelector('[data-strip-count]');
    if (counter) {
      var imgs = $$('img', strip);
      var update = function () {
        var idx = Math.round(strip.scrollLeft / (strip.scrollWidth / imgs.length)) + 1;
        counter.textContent = Math.min(idx, imgs.length) + ' / ' + imgs.length;
      };
      update();
      strip.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    }
  });

  /* ---------- lightbox with prev/next ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var zoomEls = $$('[data-zoom]');
  var current = -1;
  function openLB(idx) {
    current = idx;
    var el = zoomEls[idx]; if (!el) return;
    var src = el.getAttribute('src');
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', el.getAttribute('alt') || '');
    lbCap.textContent = el.getAttribute('data-cap') || el.getAttribute('alt') || '';
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLB() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; current = -1; }
  function step(dir) { if (current < 0) return; var n = (current + dir + zoomEls.length) % zoomEls.length; openLB(n); }
  zoomEls.forEach(function (el, i) { el.addEventListener('click', function () { openLB(i); }); });
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

  /* ---------- placeholder social links ---------- */
  $$('[data-placeholder]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      a.setAttribute('title', 'Add the real link in index.html');
    });
  });
})();
