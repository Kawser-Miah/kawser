/*
  Kawser Miah Portfolio — JS (vanilla)
  Terminal / developer-themed UI, data-driven from ./data/*.json.
  - Ambient background + cursor sticker trail (decorative)
  - Sticky/hiding header, scroll progress, active nav, mobile nav
  - Dark/light theme toggle (data-theme attribute, localStorage "site-theme", default light)
  - Hero: role typewriter, animated stat counters
  - Reveal-on-scroll
  - Skills / Experience / Education / Projects / Blog loaders
  - Accessible project details modal with focus trap
  - Contact form (POSTs to the portfolio API) + Firebase/gtag analytics hooks
  - Terminal AI-assistant chat widget (AI mode → portfolio API /chat, RAG)
*/
(function () {
  'use strict';

  /* ============================================================
     Portfolio backend API (FastAPI — contact + RAG chat only)
     ============================================================ */
  var API_BASE = 'https://api.kawser.me/api/v1';

  // fetch() with an abort-based timeout so a hung request can't leave the UI stuck.
  function apiFetch(path, body, timeoutMs) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeoutMs || 20000);
    return fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    }).finally(function () { clearTimeout(timer); });
  }

  /* ============================================================
     Ambient background + cursor sticker trail
     ============================================================ */
  var STICKERS = {
    flutter: '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M14.3 2 3.9 12.4l3.2 3.2L20.7 2h-6.4zM14.3 11 8.7 16.6l5.6 5.4h6.4L15 16.6 20.7 11h-6.4z"/></svg>',
    dart: '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M6.9 3 3 6.9v9.2L9.6 22h8.5l-3.2-3.2H10L6 14.9V6.9zm2 .6 12 12.1V22L8.9 10.9z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>',
    vscode: '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M17 2 8.5 10 4.5 7 2 8.2l3.4 3.8L2 15.8 4.5 17l4-3 8.5 8 5-2.2V4.2zm0 5.3v9.4L11 12z"/></svg>',
    android: '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M6 9h12v7a1 1 0 0 1-1 1h-1v3a1 1 0 0 1-2 0v-3h-2v3a1 1 0 0 1-2 0v-3H8a1 1 0 0 1-1-1V9zm-2.5 0A1.5 1.5 0 0 1 5 10.5v4a1.5 1.5 0 0 1-3 0v-4A1.5 1.5 0 0 1 3.5 9zm17 0a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-3 0v-4A1.5 1.5 0 0 1 20.5 9zM8.5 3l1 1.8A6.4 6.4 0 0 1 12 4.3c.9 0 1.7.2 2.5.5L15.5 3l.6.4-1 1.7A5.7 5.7 0 0 1 18 8H6a5.7 5.7 0 0 1 2.9-2.9L7.9 3.4zM9.5 6.5a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2zm5 0a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2z"/></svg>',
    firebase: '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M5 18 8 3l2 3.6L11.6 4 19 18l-7 4zm3.3-1.7L12 8l-1.3-2.3z"/></svg>',
    python: '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M11.9 2c-2.3 0-3.9.9-3.9 3v2h4v.6H6c-2.1 0-3 1.5-3 3.9s.9 3.9 3 3.9h1.3v-2.2c0-1.7 1.4-3.1 3.1-3.1h3.8c1.4 0 2.5-1.1 2.5-2.5V5c0-1.9-1.6-3-3.7-3zm-2.2 2.3a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zM12.1 22c2.3 0 3.9-.9 3.9-3v-2h-4v-.6H18c2.1 0 3-1.5 3-3.9s-.9-3.9-3-3.9h-1.3v2.2c0 1.7-1.4 3.1-3.1 3.1H9.8c-1.4 0-2.5 1.1-2.5 2.5V19c0 1.9 1.6 3 3.7 3zm2.2-2.3a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z"/></svg>',
    docker: '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M3 11h3v3H3zm4 0h3v3H7zm4 0h3v3h-3zm4 0h3v3h-3zm-8-4h3v3H7zm4 0h3v3h-3zm0-4h3v3h-3z"/><path d="M22 12c-.5-.4-1.6-.5-2.4-.3-.1-.9-.6-1.6-1.4-2.2l-.4-.3-.3.4c-.5.7-.6 1.9-.1 2.7-.6.3-1.6.4-2.9.4H1.5c-.1 1.5.2 3 1 4.3 1 1.4 2.6 2.1 4.7 2.1 4.6 0 8-2.1 9.6-6 .6 0 2 0 2.7-1.4 0-.1.3-.5.4-1.6z"/></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%"><rect x="2" y="3" width="20" height="18" rx="2"/><polyline points="7 9 10 12 7 15"/><line x1="13" y1="15" x2="17" y2="15"/></svg>',
    kotlin: '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M3 3h18L12 12l9 9H3z"/></svg>',
    java: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%"><path d="M4 12h12v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M16 13h1.5a2 2 0 1 1 0 4H16"/><path d="M9 3c1.5 1.2-1 2.4 0 4M12.5 3c1.5 1.2-1 2.4 0 4"/><line x1="5" y1="22" x2="15" y2="22"/></svg>',
    rust: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="100%" height="100%"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>'
  };

  var BG_OBJECTS = [
    { logo: 'flutter', top: '14%', left: '78%', size: '52px', color: 'var(--blue)', opacity: 0.18, dur: '24s', delay: '-2s' },
    { logo: 'github', top: '70%', left: '12%', size: '50px', color: 'var(--green)', opacity: 0.16, dur: '27s', delay: '-6s' },
    { logo: 'vscode', top: '30%', left: '8%', size: '48px', color: 'var(--blue)', opacity: 0.16, dur: '22s', delay: '-9s' },
    { logo: 'android', top: '82%', left: '72%', size: '50px', color: 'var(--green)', opacity: 0.17, dur: '25s', delay: '-3s' },
    { logo: 'dart', top: '50%', left: '88%', size: '44px', color: 'var(--blue)', opacity: 0.16, dur: '21s', delay: '-7s' },
    { logo: 'firebase', top: '6%', left: '40%', size: '44px', color: 'var(--orange)', opacity: 0.16, dur: '23s', delay: '-1s' },
    { logo: 'python', top: '60%', left: '60%', size: '46px', color: 'var(--green)', opacity: 0.15, dur: '28s', delay: '-5s' },
    { logo: 'docker', top: '40%', left: '48%', size: '48px', color: 'var(--blue)', opacity: 0.14, dur: '26s', delay: '-8s' },
    { logo: 'terminal', top: '90%', left: '38%', size: '44px', color: 'var(--orange)', opacity: 0.15, dur: '20s', delay: '-4s' },
    { logo: 'dart', top: '22%', left: '26%', size: '42px', color: 'var(--blue)', opacity: 0.15, dur: '23s', delay: '-11s' },
    { logo: 'kotlin', top: '56%', left: '30%', size: '44px', color: 'var(--orange)', opacity: 0.16, dur: '24s', delay: '-2s' },
    { logo: 'java', top: '12%', left: '62%', size: '46px', color: 'var(--green)', opacity: 0.15, dur: '27s', delay: '-6s' },
    { logo: 'rust', top: '76%', left: '52%', size: '46px', color: 'var(--orange)', opacity: 0.15, dur: '25s', delay: '-9s' },
    { glyph: 'Ktor', top: '36%', left: '68%', size: '1.5rem', color: 'var(--blue)', opacity: 0.14, dur: '22s', delay: '-3s' },
    { glyph: 'C', top: '64%', left: '82%', size: '2.6rem', color: 'var(--green)', opacity: 0.14, dur: '19s', delay: '-7s' },
    { glyph: 'TS', top: '46%', left: '4%', size: '2rem', color: 'var(--orange)', opacity: 0.13, dur: '26s', delay: '-5s' },
    { glyph: 'AI', top: '18%', left: '48%', size: '2rem', color: 'var(--blue)', opacity: 0.14, dur: '21s', delay: '-8s' },
    { glyph: 'ML', top: '86%', left: '18%', size: '2rem', color: 'var(--green)', opacity: 0.14, dur: '24s', delay: '-1s' },
    { glyph: '{ }', top: '12%', left: '6%', size: '2.6rem', color: 'var(--blue)', opacity: 0.14, dur: '19s', delay: '0s' },
    { glyph: '</>', top: '24%', left: '84%', size: '3rem', color: 'var(--green)', opacity: 0.13, dur: '23s', delay: '-4s' },
    { glyph: '=>', top: '58%', left: '10%', size: '2.4rem', color: 'var(--orange)', opacity: 0.13, dur: '21s', delay: '-8s' },
    { glyph: ';', top: '72%', left: '90%', size: '3.4rem', color: 'var(--blue)', opacity: 0.12, dur: '17s', delay: '-2s' },
    { glyph: '()', top: '84%', left: '22%', size: '2.6rem', color: 'var(--green)', opacity: 0.13, dur: '25s', delay: '-6s' },
    { glyph: '[ ]', top: '40%', left: '78%', size: '2.4rem', color: 'var(--orange)', opacity: 0.12, dur: '22s', delay: '-10s' },
    { glyph: '#', top: '8%', left: '52%', size: '2.2rem', color: 'var(--green)', opacity: 0.11, dur: '20s', delay: '-3s' },
    { glyph: '0x1F', top: '90%', left: '62%', size: '1.7rem', color: 'var(--blue)', opacity: 0.11, dur: '24s', delay: '-7s' },
    { glyph: '//', top: '48%', left: '44%', size: '2.2rem', color: 'var(--orange)', opacity: 0.10, dur: '18s', delay: '-5s' },
    { shape: 'round', top: '18%', left: '34%', size: '44px', color: 'var(--blue)', opacity: 0.16, dur: '26s', delay: '-2s' },
    { shape: 'circle', top: '66%', left: '50%', size: '30px', color: 'var(--green)', opacity: 0.16, dur: '20s', delay: '-9s' },
    { shape: 'square', top: '34%', left: '18%', size: '26px', color: 'var(--orange)', opacity: 0.16, dur: '23s', delay: '-4s' },
    { shape: 'circle', top: '80%', left: '80%', size: '38px', color: 'var(--blue)', opacity: 0.14, dur: '28s', delay: '-1s' }
  ];

  function initBgFx() {
    var host = document.getElementById('bgFx');
    if (!host) return;
    BG_OBJECTS.forEach(function (o) {
      var el = document.createElement('span');
      el.style.top = o.top;
      el.style.left = o.left;
      el.style.color = o.color;
      el.style.opacity = o.opacity;
      el.style.setProperty('--dur', o.dur);
      el.style.setProperty('--delay', o.delay);
      if (o.logo) {
        el.className = 'bg-icon';
        el.style.width = o.size;
        el.style.height = o.size;
        el.innerHTML = STICKERS[o.logo] || '';
      } else if (o.shape) {
        el.className = 'bg-shape';
        el.style.width = o.size;
        el.style.height = o.size;
        el.style.borderRadius = o.shape === 'circle' ? '50%' : (o.shape === 'round' ? '8px' : '0');
      } else {
        el.className = 'bg-obj';
        el.style.fontSize = o.size;
        el.textContent = o.glyph;
      }
      host.appendChild(el);
    });
  }

  function initCursorTrail() {
    var host = document.getElementById('cursorTrail');
    if (!host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    var keys = Object.keys(STICKERS);
    var colors = ['var(--blue)', 'var(--green)', 'var(--orange)'];
    var last = { x: 0, y: 0, t: 0 };
    window.addEventListener('mousemove', function (e) {
      var now = performance.now();
      var dist = Math.hypot(e.clientX - last.x, e.clientY - last.y);
      if (now - last.t < 28 || dist < 10) return;
      last = { x: e.clientX, y: e.clientY, t: now };
      var angle = Math.random() * Math.PI * 2;
      var throwDist = 45 + Math.random() * 75;
      var dx = Math.cos(angle) * throwDist;
      var dy = Math.sin(angle) * throwDist + 34;
      var rot = Math.random() * 200 - 100;
      var size = 20 + Math.random() * 16;
      var key = keys[Math.floor(Math.random() * keys.length)];
      var color = colors[Math.floor(Math.random() * colors.length)];
      var el = document.createElement('span');
      el.className = 'cursor-fling';
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.color = color;
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
      el.style.setProperty('--rot', rot + 'deg');
      el.innerHTML = STICKERS[key];
      host.appendChild(el);
      window.setTimeout(function () { el.remove(); }, 750);
    });
  }

  initBgFx();
  initCursorTrail();

  /* ============================================================
     Header, scroll progress, nav, mobile nav
     ============================================================ */
  var header = document.getElementById('header');
  var backToTop = document.getElementById('backToTop');
  var navToggle = document.querySelector('.nav-toggle');
  var navMobilePanel = document.getElementById('navMobilePanel');
  var navLinks = document.querySelectorAll('.nav-link');
  var SECTION_IDS = ['hero', 'about', 'skills', 'experience', 'education', 'projects', 'achievements', 'blog', 'contact'];
  var sections = SECTION_IDS.map(function (id) { return document.getElementById(id); });

  var scrollProgress = document.getElementById('scroll-progress');
  var lastScrollY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-sticky', y > 40);
      header.classList.toggle('is-hidden', y > lastScrollY + 4 && y > 120);
    }
    lastScrollY = y;
    if (backToTop) backToTop.classList.toggle('visible', y > 600);
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && navMobilePanel) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMobilePanel.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navMobilePanel.querySelectorAll('.nav-link, a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMobilePanel.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!navMobilePanel.contains(e.target) && !navToggle.contains(e.target) && navMobilePanel.classList.contains('is-open')) {
        navMobilePanel.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var linkMap = new Map();
  navLinks.forEach(function (a) {
    var id = a.getAttribute('data-link');
    if (!linkMap.has(id)) linkMap.set(id, []);
    linkMap.get(id).push(a);
  });
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var id = entry.target.id;
      var links = linkMap.get(id);
      if (entry.isIntersecting && links) {
        navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        links.forEach(function (a) { a.setAttribute('aria-current', 'true'); });
      }
    });
  }, { rootMargin: '-50% 0px -45% 0px', threshold: 0.01 });
  sections.forEach(function (sec) { if (sec) sectionObserver.observe(sec); });

  /* ============================================================
     Reveal on scroll
     ============================================================ */
  var revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  var REVEAL_SELECTOR = '.reveal,.reveal-left,.reveal-right,.reveal-scale';
  function observeReveals(root) {
    root = root || document;
    var els = Array.prototype.slice.call(root.querySelectorAll(REVEAL_SELECTOR));
    if (root.nodeType === 1 && typeof root.matches === 'function' && root.matches(REVEAL_SELECTOR)) {
      els.push(root);
    }
    els.forEach(function (el) {
      if (!el.classList.contains('is-visible')) revealObserver.observe(el);
    });
  }
  observeReveals(document);

  /* ============================================================
     Theme toggle — data-theme attribute, localStorage "site-theme", default light
     ============================================================ */
  (function () {
    var THEME_KEY = 'site-theme';
    var html = document.documentElement;
    var toggle = document.getElementById('theme-toggle');
    var metaLight = document.querySelector('meta[name="theme-color"][media*="light"]');
    var metaDark = document.querySelector('meta[name="theme-color"][media*="dark"]');

    function getPreferredTheme() {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      return 'light';
    }
    function applyTheme(theme) {
      var color = theme === 'dark' ? '#0A0E1A' : '#2563EB';
      if (metaLight) metaLight.setAttribute('content', color);
      if (metaDark) metaDark.setAttribute('content', color);
      if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        if (toggle) toggle.setAttribute('aria-pressed', 'true');
      } else {
        html.removeAttribute('data-theme');
        if (toggle) toggle.setAttribute('aria-pressed', 'false');
      }
    }
    function toggleTheme() {
      var isDark = html.getAttribute('data-theme') === 'dark';
      var next = isDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    }
    applyTheme(getPreferredTheme());
    if (toggle) {
      toggle.addEventListener('click', toggleTheme);
      toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
      });
    }
  })();

  /* ============================================================
     Hero: years-of-experience calc, role typewriter, animated stats
     ============================================================ */
  var yearsExpEl = document.getElementById('years-exp-value');
  var yearsExpFinalText = null;
  if (yearsExpEl && yearsExpEl.dataset.start) {
    var start = new Date(yearsExpEl.dataset.start);
    var diffYears = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    var rounded = Math.floor(diffYears * 2) / 2;
    var display = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
    yearsExpFinalText = display + '+';
  }

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ROLES = ['Flutter Developer', 'Mobile App Engineer', 'Clean Architecture Dev', 'Real-time Systems Builder'];
  (function typewriter() {
    var el = document.getElementById('typewriter-role');
    if (!el) return;
    if (prefersReduced) { el.textContent = '"' + ROLES[0] + '"'; return; }
    var wi = 0, ci = 0, deleting = false;
    function tick() {
      var word = ROLES[wi];
      var delay = deleting ? 38 : (ci === word.length ? 1700 : 75);
      if (!deleting) {
        if (ci < word.length) { ci++; }
        else { deleting = true; }
      } else {
        if (ci > 0) { ci--; }
        else { deleting = false; wi = (wi + 1) % ROLES.length; }
      }
      el.textContent = '"' + word.slice(0, ci) + '"';
      setTimeout(tick, delay);
    }
    setTimeout(tick, 75);
  })();

  function animateCounter(el, target, opts) {
    opts = opts || {};
    var suffix = opts.suffix || '';
    var duration = opts.duration || 1100;
    if (prefersReduced) { el.textContent = target + suffix; return; }
    var t0 = performance.now();
    function frame(now) {
      var p = Math.min((now - t0) / duration, 1);
      var n = Math.round((1 - Math.pow(1 - p, 3)) * target);
      el.textContent = n + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else if (opts.finalText) el.textContent = opts.finalText;
    }
    requestAnimationFrame(frame);
  }

  var heroStatsEl = document.getElementById('heroStats');
  var statsGo = false;
  var pendingAppsCount = null;
  function runStatCounters() {
    if (statsGo) return;
    statsGo = true;
    var yearsTarget = yearsExpFinalText ? parseFloat(yearsExpFinalText) : 1;
    if (yearsExpEl) animateCounter(yearsExpEl, Math.ceil(yearsTarget), { finalText: yearsExpFinalText || (yearsTarget + '+') });
    var storeEl = document.getElementById('store-apps-value');
    if (storeEl) animateCounter(storeEl, 2, {});
    var appsEl = document.getElementById('apps-built-value');
    if (appsEl) {
      if (pendingAppsCount != null) {
        animateCounter(appsEl, pendingAppsCount, { finalText: pendingAppsCount + '+' });
      }
    }
  }
  if (heroStatsEl) {
    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) runStatCounters(); });
    }, { threshold: 0.3 });
    statsObserver.observe(heroStatsEl);
  }

  // Headshot zoom (click/tap/keyboard) — same feature as before, now on the orbit photo
  var heroVisual = document.getElementById('heroVisual');
  var orbitPhoto = heroVisual ? heroVisual.querySelector('.orbit-photo') : null;
  var orbitPhotoImg = orbitPhoto ? orbitPhoto.querySelector('img') : null;
  if (orbitPhoto && orbitPhotoImg) {
    orbitPhotoImg.setAttribute('tabindex', '0');
    orbitPhotoImg.setAttribute('role', 'button');
    orbitPhotoImg.setAttribute('aria-pressed', 'false');
    var toggleZoom = function () {
      var zoomed = orbitPhoto.classList.toggle('is-zoomed');
      orbitPhotoImg.setAttribute('aria-pressed', zoomed ? 'true' : 'false');
    };
    orbitPhotoImg.addEventListener('click', toggleZoom);
    orbitPhotoImg.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleZoom(); }
    });
  }

  // Email copy functionality (Shift+Click to copy)
  var contactEmail = document.querySelector('.contact-email-link');
  if (contactEmail) {
    contactEmail.addEventListener('click', function (e) {
      var email = contactEmail.textContent.trim();
      if (navigator.clipboard && e.shiftKey) {
        e.preventDefault();
        navigator.clipboard.writeText(email).then(function () {
          var original = contactEmail.textContent;
          contactEmail.textContent = '✓ Copied!';
          setTimeout(function () { contactEmail.textContent = original; }, 2000);
        }).catch(function () {});
      }
    });
  }

  /* ============================================================
     Data-driven sections
     ============================================================ */
  function projectLang(tech) {
    var t = (tech || []).map(function (s) { return String(s).toLowerCase(); });
    if (t.some(function (s) { return s.indexOf('python') !== -1 || s.indexOf('fastapi') !== -1; }) &&
        !t.some(function (s) { return s.indexOf('flutter') !== -1 || s.indexOf('dart') !== -1; })) {
      return 'Python';
    }
    return 'Dart';
  }
  var LANG_COLOR = { Dart: '#00B4D8', Python: '#3572A5' };

  var ICON_EXTERNAL = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>';
  var ICON_GITHUB = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.35-1.77-1.35-1.77-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.48-1.33-5.48-5.9 0-1.3.47-2.36 1.24-3.19-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.22a11.4 11.4 0 0 1 6 0c2.3-1.54 3.3-1.22 3.3-1.22.66 1.65.25 2.87.12 3.17.77.83 1.24 1.89 1.24 3.19 0 4.58-2.81 5.6-5.49 5.9.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .5Z"/></svg>';

  /* 3D mouse-tilt wrapper (mirrors the TS Tilt3D component) */
  function initTilt(el, intensity) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      el.style.transform = 'perspective(700px) rotateY(' + (x * intensity) + 'deg) rotateX(' + (-y * intensity) + 'deg) translateZ(12px)';
      el.style.boxShadow = dark
        ? (-x * 24) + 'px ' + (y * 24) + 'px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(96,165,250,0.1)'
        : (-x * 12) + 'px ' + (y * 12) + 'px 24px rgba(0,0,0,0.12)';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateZ(0)';
      el.style.boxShadow = '';
    });
  }
  function wrapInTilt(inner, intensity) {
    var wrap = document.createElement('div');
    wrap.className = 'tilt-card';
    wrap.appendChild(inner);
    initTilt(wrap, intensity);
    return wrap;
  }

  function renderPhoneFrame(thumbnail, name, size) {
    var sizeClass = size === 'lg' ? ' lg' : '';
    var img = thumbnail ? '<img src="' + thumbnail + '" alt="' + name + ' app screenshot" loading="lazy">' : '';
    return (
      '<div class="phone-frame' + sizeClass + '">' +
        '<span class="phone-btn-l" aria-hidden="true"></span>' +
        '<span class="phone-btn-r" aria-hidden="true"></span>' +
        '<div class="phone-screen">' +
          '<div class="phone-statusbar" aria-hidden="true"><b>9:41</b><span>▂▄▆ ✦</span></div>' +
          '<span class="phone-notch" aria-hidden="true"></span>' +
          img +
          '<span class="phone-home-ind" aria-hidden="true"></span>' +
        '</div>' +
      '</div>'
    );
  }

  /* ── Skills ── */
  var skillsGrid = document.getElementById('skills-grid');
  function renderSkills(skills) {
    if (!skillsGrid) return;
    skillsGrid.innerHTML = '';
    skills.forEach(function (skill) {
      var li = document.createElement('li');
      li.className = 'skill-chip';
      li.innerHTML = '<img src="' + skill.icon + '" alt="" width="15" height="15" aria-hidden="true">' + skill.name;
      skillsGrid.appendChild(li);
    });
  }
  fetch('./data/skills.json').then(function (r) { return r.json(); }).then(renderSkills).catch(function () {
    if (skillsGrid) skillsGrid.innerHTML = '<li>Failed to load skills.</li>';
  });

  /* ── Experience ── */
  var experienceList = document.getElementById('experience-list');
  function renderExperience(list) {
    if (!experienceList) return;
    experienceList.innerHTML = '';
    list.forEach(function (exp, i) {
      var li = document.createElement('li');
      li.className = 'exp-entry reveal' + (i % 6 ? ' d' + ((i % 6) + 1) : '');
      var roleBadge = (exp.title.split(' ')[0] || '').toUpperCase();
      var bulletsHtml = (exp.responsibilities || []).map(function (r) {
        return '<div class="exp-bullet"><span class="arrow">→</span><span>' + r + '</span></div>';
      }).join('');
      li.innerHTML =
        '<div class="exp-meta">' +
          '<span class="exp-date">' + exp.startDate + ' — ' + exp.endDate + '</span>' +
          '<div class="exp-role-badge"><span>' + roleBadge + '</span></div>' +
        '</div>' +
        '<div>' +
          '<p class="exp-title">' + exp.title + '</p>' +
          '<p class="exp-company">@ ' + exp.company + '</p>' +
          '<div class="exp-bullets">' + bulletsHtml + '</div>' +
        '</div>';
      experienceList.appendChild(li);
      observeReveals(li);
    });
  }
  fetch('./data/experience.json').then(function (r) { return r.json(); }).then(renderExperience).catch(function () {
    if (experienceList) experienceList.innerHTML = '<li>Failed to load experience.</li>';
  });

  /* ── Education ── */
  var educationList = document.getElementById('education-list');
  var GRAD_CAP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
  function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); }
  function renderEducation(list) {
    if (!educationList) return;
    educationList.innerHTML = '';
    list.forEach(function (edu, i) {
      var isGUB = /green university/i.test(edu.school || '');
      var li = document.createElement('li');
      li.className = 'reveal-scale' + (i % 6 ? ' d' + ((i % 6) + 1) : '');
      var badgeInner = isGUB
        ? '<div class="sheen"></div>' +
          '<div class="mono-crest"><svg viewBox="0 0 60 70"><path d="M30 2 L58 14 L58 38 C58 54 30 68 30 68 C30 68 2 54 2 38 L2 14 Z" fill="white"/></svg></div>' +
          '<span class="gub-text">GUB</span><span class="gub-est">EST. 2003</span>'
        : '<div class="sheen"></div><span class="edu-badge-cap">' + GRAD_CAP_ICON + '</span>';
      var badgeHtml = '<div class="edu-badge' + (isGUB ? ' is-gub' : '') + '">' +
        '<div class="edu-badge-core">' + badgeInner + '</div></div>';
      var eduCard = document.createElement('div');
      eduCard.className = 'edu-card';
      eduCard.innerHTML =
        '<div class="edu-card-tab"><span>' + slugify(edu.school) + '.dart</span></div>' +
        '<div class="edu-card-body">' +
          badgeHtml +
          '<div class="edu-info">' +
            '<h3 class="edu-degree">' + edu.school + '</h3>' +
            '<p class="edu-school">' + edu.degree + '</p>' +
            '<div class="edu-meta-row">' +
              '<span class="edu-date">' + edu.startDate + ' — ' + edu.endDate + '</span>' +
              (edu.notes ? '<span class="edu-notes">' + edu.notes + '</span>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      li.appendChild(wrapInTilt(eduCard, 7));
      educationList.appendChild(li);
      observeReveals(li);
    });
  }
  fetch('./data/education.json').then(function (r) { return r.json(); }).then(renderEducation).catch(function () {
    if (educationList) educationList.innerHTML = '<li>Failed to load education.</li>';
  });

  /* ── Projects ── */
  var projectsGrid = document.getElementById('projects-grid');
  var CARD_TAG_LIMIT = 4;

  function renderProjects(list) {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';
    list.forEach(function (p, i) {
      var lang = projectLang(p.tech);
      var color = LANG_COLOR[lang];
      var card = document.createElement('article');
      card.className = 'project-card';
      card.style.setProperty('--project-accent', color);
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', p.title + ' — open details');

      var visibleTech = p.tech ? p.tech.slice(0, CARD_TAG_LIMIT) : [];
      var hiddenCount = p.tech ? Math.max(0, p.tech.length - CARD_TAG_LIMIT) : 0;
      var tagsHtml = p.tech && p.tech.length
        ? visibleTech.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') +
          (hiddenCount > 0 ? '<span class="tag tag-more">+' + hiddenCount + ' more</span>' : '')
        : '<span class="tag">Technology: N/A</span>';

      var actionsHtml = '';
      if (p.live) actionsHtml += '<a class="project-action-btn project-action-demo" href="' + p.live + '" target="_blank" rel="noopener noreferrer">' + ICON_EXTERNAL + ' Live Demo</a>';
      if (p.repo) actionsHtml += '<a class="project-action-btn project-action-repo" href="' + p.repo + '" target="_blank" rel="noopener noreferrer">' + ICON_GITHUB + ' Source Code</a>';

      card.innerHTML =
        '<div class="project-stage">' +
          '<span class="stage-tag-left">~/apps/' + lang.toLowerCase() + '</span>' +
          '<span class="stage-tag-right"><span class="lang-dot"></span>' + lang + '</span>' +
          renderPhoneFrame(p.thumbnail, p.title) +
        '</div>' +
        '<div class="project-body">' +
          '<p class="project-title">kawser / ' + p.id + '</p>' +
          '<p class="project-summary">' + p.short + '</p>' +
          '<div class="project-tags">' + tagsHtml + '</div>' +
        '</div>' +
        (actionsHtml ? '<div class="project-actions">' + actionsHtml + '</div>' : '');

      card.addEventListener('click', function (e) { if (!e.target.closest('a')) openProjectModal(p, card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProjectModal(p, card); }
      });

      var outer = document.createElement('div');
      outer.className = 'reveal d' + ((i % 3) + 1);
      outer.appendChild(wrapInTilt(card, 11));
      projectsGrid.appendChild(outer);
      observeReveals(outer);
    });
  }

  var appsBuiltEl = document.getElementById('apps-built-value');
  var bubbleAppsShipped = document.getElementById('bubbleAppsShipped');
  fetch('./data/projects.json').then(function (r) { return r.json(); }).then(function (data) {
    renderProjects(data);
    pendingAppsCount = data.length;
    if (appsBuiltEl && !statsGo) appsBuiltEl.textContent = data.length + '+';
    if (bubbleAppsShipped) bubbleAppsShipped.textContent = data.length + '+ apps shipped';
  }).catch(function () {
    if (projectsGrid) projectsGrid.innerHTML = '<p>Failed to load projects.</p>';
  });

  /* ── Blog ── */
  var blogGrid = document.getElementById('blog-grid');
  function renderBlog(posts) {
    if (!blogGrid) return;
    blogGrid.innerHTML = '';
    posts.forEach(function (post, i) {
      var domain = '';
      try { domain = new URL(post.url).hostname; } catch (e) {}
      var dateText = post.published ? new Date(post.published).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '';
      var a = document.createElement('a');
      a.className = 'blog-card reveal d' + (i + 1);
      a.href = post.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', post.title + ' — open on external site');
      a.innerHTML =
        '<div class="blog-card-head">' +
          (domain ? '<span class="chip chip-purple">' + domain + '</span>' : '<span></span>') +
        '</div>' +
        '<p class="blog-card-title">' + post.title + '</p>' +
        '<div class="blog-card-foot">' +
          '<span class="blog-card-date">' + dateText + '</span>' +
          '<span class="blog-card-read">read →</span>' +
        '</div>';
      blogGrid.appendChild(a);
      observeReveals(a);
    });
  }
  fetch('./data/blog.json').then(function (r) { return r.json(); }).then(renderBlog).catch(function () {
    if (blogGrid) blogGrid.innerHTML = '<p>Failed to load blog posts.</p>';
  });

  /* ============================================================
     Project details modal (accessible, focus-trapped)
     ============================================================ */
  var modal = document.getElementById('project-modal');
  var pdCloseBtn = document.getElementById('pd-close-btn');
  var lastFocused = null;
  var modalKeydownHandler = null;

  function getFocusable(root) {
    return root.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  }

  function openProjectModal(project, invoker) {
    if (!modal) return;
    lastFocused = invoker || document.activeElement;
    var lang = projectLang(project.tech);
    var color = LANG_COLOR[lang];

    document.getElementById('pd-name').textContent = 'kawser / ' + project.id + '.md';
    document.getElementById('pd-title').textContent = project.title;
    document.getElementById('pd-desc').innerHTML = project.description || project.short || '';
    document.getElementById('pd-lang').textContent = lang;
    document.getElementById('pd-phone').innerHTML = renderPhoneFrame(project.thumbnail, project.title, 'lg');
    document.getElementById('pd-stage').style.setProperty('--project-accent', color);

    var featurePoints = Array.isArray(project.features)
      ? project.features.map(function (p) { return typeof p === 'string' ? p.trim() : ''; }).filter(function (p) { return p.length > 0; })
      : [];
    var featuresSection = document.getElementById('pd-features-section');
    var featuresHost = document.getElementById('pd-features');
    var hasFeatures = featurePoints.length > 0;
    featuresSection.classList.toggle('hidden', !hasFeatures);
    featuresHost.innerHTML = hasFeatures
      ? featurePoints.map(function (f, fi) {
          var delay = (0.28 + fi * 0.06).toFixed(2);
          return '<div class="pd-feature-row" style="animation-delay:' + delay + 's"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg><span>' + f + '</span></div>';
        }).join('')
      : '';

    document.getElementById('pd-tech').innerHTML = (project.tech || []).map(function (t) {
      return '<span class="pd-chip">' + t + '</span>';
    }).join('');

    var linksHost = document.getElementById('pd-links');
    var linksHtml = '';
    if (project.live) linksHtml += '<a class="pd-btn pd-btn-primary" href="' + project.live + '" target="_blank" rel="noopener noreferrer">' + ICON_EXTERNAL + ' Live Demo</a>';
    if (project.repo) linksHtml += '<a class="pd-btn pd-btn-ghost" href="' + project.repo + '" target="_blank" rel="noopener noreferrer">' + ICON_GITHUB + ' Source Code</a>';
    linksHost.innerHTML = linksHtml;

    // Restart the .pd-sec entrance animation on every open (the modal is a
    // persistent element, not remounted, so the keyframe would otherwise
    // only ever play once).
    modal.querySelectorAll('.pd-sec').forEach(function (el) {
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    });

    modal.classList.remove('hidden');
    document.body.classList.add('no-scroll');

    // The modal is a persistent node — reset every scrollable region to the top
    // so a new project never opens mid-way down from the previous one.
    modal.scrollTop = 0;
    var pdDetails = modal.querySelector('.pd-details');
    if (pdDetails) pdDetails.scrollTop = 0;

    var modalContent = modal.querySelector('.pd-panel');
    var focusables = getFocusable(modalContent);
    (focusables[0] || pdCloseBtn || modalContent).focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') { e.preventDefault(); closeProjectModal(); }
      if (e.key === 'Tab') {
        var focusEls = getFocusable(modalContent);
        if (!focusEls.length) return;
        var first = focusEls[0];
        var last = focusEls[focusEls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    modalKeydownHandler = onKeyDown;
    modal.addEventListener('keydown', modalKeydownHandler);

    modal.addEventListener('click', onOverlayClick, { once: true });
    pdCloseBtn.addEventListener('click', onCloseClick, { once: true });
  }
  function onOverlayClick(e) { if (e.target === modal) closeProjectModal(); }
  function onCloseClick() { closeProjectModal(); }

  function closeProjectModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.classList.remove('no-scroll');
    if (modalKeydownHandler) { modal.removeEventListener('keydown', modalKeydownHandler); modalKeydownHandler = null; }
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  /* ============================================================
     Contact form — POSTs to API_BASE + '/contact'
     ============================================================ */
  var form = document.getElementById('contact-form');
  if (form) {
    var CONTACT_EMAIL = 'kawsermiah.cse@gmail.com';
    var mailtoLink = '<a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>';
    var statusEl = document.getElementById('form-status');
    var submitBtn = form.querySelector('.form-submit-btn');
    var nameInput = document.getElementById('contact-name');
    var emailInput = document.getElementById('contact-email');
    var msgInput = document.getElementById('contact-message');
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var sending = false;

    function setStatus(html, kind) {
      if (!statusEl) return;
      statusEl.classList.remove('is-success', 'is-error');
      if (kind) statusEl.classList.add(kind);
      statusEl.innerHTML = html;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      var name = (nameInput.value || '').trim();
      var email = (emailInput.value || '').trim();
      var message = (msgInput.value || '').trim();

      // Mirror the backend's Pydantic rules so obvious mistakes never leave the page.
      if (name.length < 2 || name.length > 100) {
        setStatus('Please enter your name (2–100 characters).', 'is-error'); nameInput.focus(); return;
      }
      if (!EMAIL_RE.test(email)) {
        setStatus('Please enter a valid email address.', 'is-error'); emailInput.focus(); return;
      }
      if (message.length < 10 || message.length > 5000) {
        setStatus('Your message should be 10–5000 characters.', 'is-error'); msgInput.focus(); return;
      }

      sending = true;
      submitBtn.disabled = true;
      var restoreLabel = submitBtn.innerHTML;
      submitBtn.textContent = 'sending…';
      setStatus('Sending your message…', null);

      apiFetch('/contact', { name: name, email: email, message: message }, 20000)
        .then(function (r) {
          if (r.ok) {
            form.reset();
            setStatus('Message sent — thanks! I’ll get back to you within 24–48 hours.', 'is-success');
          } else if (r.status === 422) {
            var first = r.data && r.data.errors && r.data.errors[0];
            setStatus(first && first.msg ? first.msg : 'Please check the form and try again.', 'is-error');
          } else if (r.status === 429) {
            setStatus('Too many messages sent from here recently. Please try later, or email me at ' + mailtoLink + '.', 'is-error');
          } else {
            setStatus('The server had a problem sending that. Please email me directly at ' + mailtoLink + '.', 'is-error');
          }
        })
        .catch(function () {
          setStatus('Couldn’t reach the server. Please email me directly at ' + mailtoLink + '.', 'is-error');
        })
        .finally(function () {
          sending = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = restoreLabel;
        });
    });
  }

  // Analytics: Download CV (kept identical to previous behavior/selector)
  var cvLinks = document.querySelectorAll('[data-analytics="download-cv"]');
  cvLinks.forEach(function (a) {
    a.addEventListener('click', function () {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'download', { event_category: 'Resume', event_label: 'Kawser Miah - Resume.pdf' });
      }
    });
  });

  // Footer year
  var footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  // Reduced Motion Support
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduced-motion');
    }
  } catch (e) {}

  /* ============================================================
     Terminal AI-assistant chatbot.
     Slash commands are canned (see COMMANDS). AI mode sends the
     question to API_BASE + '/chat' (RAG over the portfolio docs).
     ============================================================ */
  (function () {
    var COMMANDS = [
      { cmd: '/about', desc: 'Who is Kawser?', answer: 'Kawser Miah — Flutter developer building production-grade Android & iOS apps that are fast, scalable, and built to last. Trainee Flutter Developer @ Join Venture AI; pursuing a B.Sc. in CSE at Green University of Bangladesh. 11+ apps built, 2 on the stores.\nClean Architecture with Bloc & Riverpod, real-time WebSocket features, geohash geolocation matching, offline-first data layers — plus Python/FastAPI backends with ML (TensorFlow CNN inference, RAG pipelines). Top 50 finalist of 242 teams at HackTheAI 2025.' },
      { cmd: '/skills', desc: 'Tech stack', answer: 'Mobile: Flutter · Dart · Kotlin · Clean Architecture · Bloc · Riverpod · Freezed\nBackend: FastAPI · Python · RESTful APIs · Firebase · Supabase\nData: SQLite · MySQL\nML/AI: TensorFlow · CNN image classification · RAG pipelines\nTooling: Git · GitHub Actions CI/CD · Postman · VS Code · Android Studio' },
      { cmd: '/experience', desc: 'Work history', answer: 'Trainee Flutter Developer @ Join Venture AI (Jul 2026 — present)\n→ Mili — Grab/Gojek-style marketplace, 9 service verticals, Maps-integrated booking flows\n→ Real-time live bidding, driver tracking & in-app chat over a custom WebSocket layer\n→ Coach Hub — two-sided coaching marketplace with a full booking lifecycle engine\n→ Clean Architecture, code-gen Riverpod, Freezed, GetIt/Injectable, GoRouter\n\nFlutter App Developer @ eBooster / Coseries (Jun 2024 — Nov 2025)\n→ Gamification modules, quiz systems & reading-progress tracking\n→ SQLite (Floor) + SharedPreferences data migration\n→ Flutter Bloc + Clean Architecture' },
      { cmd: '/projects', desc: 'Featured work', answer: '• Mili (Join Venture AI) — Uber/Grab-style marketplace, WebSocket bidding + live GPS tracking\n• Electrician Apprentice Hours — hour logging with 6 NEC calculators + LLM voice input\n• Blood Setu — real-time geohash donor matching, live chat with presence\n• Farmer Assistance Backend — FastAPI + TensorFlow CNN disease detection, ML price forecasting\n• Secure File Vault — custom Snake Matrix XOR + RSA encrypted storage\n• DeenHub — all-in-one Islamic app, 35k+ Hadith offline\nType /projects on the site to see all 11.' },
      { cmd: '/education', desc: 'Academic background', answer: 'B.Sc. in Computer Science & Engineering — Green University of Bangladesh (Sep 2022 — Sep 2026)\nHigher Secondary Certificate (HSC) — Adhyapak Abdul Majid College (2019 — 2021)\nDean\'s Merit Award (Fall 2025) · Vice Chancellor\'s Merit Award (Spring 2024).' },
      { cmd: '/achievements', desc: 'Awards & rankings', answer: '🏆 HackTheAI 2025 — Ranked 14th of 242 teams (Top 50 Finalist)\n🎖 Dean\'s Merit Award — Fall 2025 · Green University of Bangladesh\n🎖 Vice Chancellor\'s Merit Award — Spring 2024 · Green University of Bangladesh' },
      { cmd: '/contact', desc: 'Get in touch', answer: 'Email: kawsermiah.cse@gmail.com (replies within 24–48 hrs)\nGitHub: github.com/Kawser-Miah\nLinkedIn: linkedin.com/in/kawser-miah\nOpen to Flutter / mobile roles, freelance contracts & collaborations.' },
      { cmd: '/help', desc: 'List all commands', answer: '' },
      { cmd: '/clear', desc: 'Clear the terminal', answer: '' }
    ];

    var fab = document.getElementById('chatFab');
    var panel = document.getElementById('chatPanel');
    var scrollEl = document.getElementById('chatScroll');
    var paletteEl = document.getElementById('chatPalette');
    var input = document.getElementById('chatInput');
    var sendBtn = document.getElementById('chatSendBtn');
    var closeBtn = document.getElementById('chatCloseBtn');
    var aiToggleBtn = document.getElementById('aiModeToggle');
    var promptGlyph = document.getElementById('chatPromptGlyph');
    if (!fab || !panel) return;

    var msgs = [
      { id: 0, role: 'sys', text: 'kawser-cli v1.0 — type / for commands, or toggle AI mode to ask anything.' },
      { id: 1, role: 'b', text: "Hey! I'm Kawser's terminal assistant. Try /about, /skills, or /projects." }
    ];
    var chatOpen = false;
    var aiMode = false;
    var typing = false;
    var awaitingAI = false;
    var selCmd = 0;

    function renderMsgs() {
      scrollEl.innerHTML = msgs.map(function (m) {
        if (m.role === 'u') {
          return '<div class="chat-msg role-u"><span class="prompt">visitor@kawser:~$</span><span class="text"></span></div>'.replace('<span class="text"></span>', '<span class="text">' + escapeHtml(m.text) + '</span>');
        } else if (m.role === 'sys') {
          return '<div class="chat-msg role-sys"><span class="text">' + escapeHtml(m.text) + '</span></div>';
        }
        var body = m.md ? mdLite(m.text) : escapeHtml(m.text);
        return '<div class="chat-msg role-b"><span class="arrow">→</span><span class="text">' + body + '</span></div>';
      }).join('');
      if (typing) {
        scrollEl.innerHTML += '<div class="chat-typing"><span class="arrow">→</span>' +
          '<span class="dot-typing" style="animation-delay:0s"></span>' +
          '<span class="dot-typing" style="animation-delay:0.2s"></span>' +
          '<span class="dot-typing" style="animation-delay:0.4s"></span></div>';
      }
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    // Minimal, safe Markdown for AI answers: everything is HTML-escaped first,
    // then only **bold**, `code`, and "- " bullets are re-introduced. Newlines
    // are left as-is (the .text bubble is white-space: pre-wrap).
    function mdLite(s) {
      return escapeHtml(s)
        .replace(/^\s{0,3}#{1,6}\s+/gm, '')
        .replace(/^(\s*)[-*]\s+/gm, '$1• ')
        .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
        .replace(/`([^`\n]+)`/g, '<code>$1</code>');
    }

    function renderPalette() {
      var val = input.value;
      var list = val.startsWith('/')
        ? COMMANDS.filter(function (c) { return c.cmd.indexOf(val.split(/\s+/)[0].toLowerCase()) === 0; })
        : [];
      if (!list.length) { paletteEl.classList.add('hidden'); paletteEl.innerHTML = ''; return; }
      paletteEl.classList.remove('hidden');
      paletteEl.innerHTML = list.map(function (c, i) {
        return '<button type="button" class="chat-palette-item' + (i === selCmd ? ' is-active' : '') + '" data-cmd="' + c.cmd + '">' +
          '<span class="cmd">' + c.cmd + '</span><span class="desc">' + c.desc + '</span></button>';
      }).join('');
      paletteEl.querySelectorAll('.chat-palette-item').forEach(function (btn, i) {
        btn.addEventListener('mousedown', function (e) { e.preventDefault(); runInput(btn.getAttribute('data-cmd')); });
        btn.addEventListener('mouseenter', function () { selCmd = i; renderPalette(); });
      });
      // Keep the highlighted item visible when navigating the (scrollable) list with the arrow keys.
      var activeItem = paletteEl.querySelector('.chat-palette-item.is-active');
      if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
      return list;
    }

    function runInput(raw) {
      var text = raw.trim();
      if (!text) return;
      input.value = '';
      selCmd = 0;
      renderPalette();

      if (text.charAt(0) === '/') {
        var name = text.split(/\s+/)[0].toLowerCase();
        msgs.push({ id: Date.now(), role: 'u', text: text });
        renderMsgs();

        if (name === '/clear') {
          msgs = [{ id: Date.now(), role: 'sys', text: 'terminal cleared.' }];
          renderMsgs();
          return;
        }
        if (name === '/help') {
          var list = COMMANDS.map(function (c) { return (c.cmd + '              ').slice(0, 14) + ' ' + c.desc; }).join('\n');
          msgs.push({ id: Date.now() + 1, role: 'sys', text: 'available commands:\n' + list + '\n\nTip: toggle AI mode (top-right) to ask free-form questions.' });
          renderMsgs();
          return;
        }
        var match = COMMANDS.filter(function (c) { return c.cmd === name; })[0];
        typing = true;
        renderMsgs();
        setTimeout(function () {
          typing = false;
          msgs.push(match
            ? { id: Date.now() + 1, role: 'b', text: match.answer }
            : { id: Date.now() + 1, role: 'sys', text: 'command not found: ' + name + '\ntype /help to see available commands.' });
          renderMsgs();
        }, 350 + Math.random() * 300);
        return;
      }

      if (awaitingAI) return;
      msgs.push({ id: Date.now(), role: 'u', text: text });
      if (!aiMode) {
        msgs.push({ id: Date.now() + 1, role: 'sys', text: 'command mode: type / to see commands, or switch on AI mode (top-right) to ask anything.' });
        renderMsgs();
        return;
      }
      askAI(text);
    }

    function askAI(question) {
      awaitingAI = true;
      typing = true;
      renderMsgs();
      var finish = function (text, role) {
        typing = false;
        awaitingAI = false;
        msgs.push({ id: Date.now() + 1, role: role || 'b', text: text, md: !role });
        renderMsgs();
      };
      apiFetch('/chat', { question: question }, 35000)
        .then(function (r) {
          if (r.ok && r.data && r.data.answer) { finish(r.data.answer); return; }
          if (r.status === 429) { finish('I’m getting a lot of questions right now — give it a minute and try again.', 'sys'); return; }
          if (r.status === 422) { finish('That question was a little too short or too long — try rephrasing it.', 'sys'); return; }
          finish('The assistant hit an error. Try again, or use the slash commands — /about, /skills, /projects.', 'sys');
        })
        .catch(function () {
          finish('Couldn’t reach the assistant. Try again in a moment, or use /about, /skills, /projects.', 'sys');
        });
    }

    function send() { runInput(input.value); }

    fab.addEventListener('click', function () {
      chatOpen = !chatOpen;
      panel.classList.toggle('hidden', !chatOpen);
      fab.classList.toggle('is-open', chatOpen);
      fab.setAttribute('aria-label', chatOpen ? 'Close AI assistant' : 'Open AI assistant');
      var dot = fab.querySelector('.chat-fab-dot');
      if (dot) dot.style.display = chatOpen ? 'none' : '';
      if (chatOpen) { renderMsgs(); input.focus(); }
    });
    closeBtn.addEventListener('click', function () { fab.click(); });

    aiToggleBtn.addEventListener('click', function () {
      aiMode = !aiMode;
      aiToggleBtn.classList.toggle('is-on', aiMode);
      aiToggleBtn.innerHTML = '<span class="ai-dot"></span>AI ' + (aiMode ? 'ON' : 'OFF');
      promptGlyph.textContent = aiMode ? 'ai>' : '$';
      promptGlyph.classList.toggle('ai-mode', aiMode);
      sendBtn.classList.toggle('ai-mode', aiMode);
      input.placeholder = aiMode ? 'ask me anything…' : 'type / for commands…';
    });

    input.addEventListener('input', function () { selCmd = 0; renderPalette(); });
    input.addEventListener('keydown', function (e) {
      var list = renderPalette() || [];
      if (list.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        selCmd = (selCmd + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length;
        renderPalette();
      } else if (list.length && e.key === 'Tab') {
        e.preventDefault();
        input.value = list[selCmd].cmd + ' ';
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (list.length && input.value.trim() !== list[selCmd].cmd) runInput(list[selCmd].cmd);
        else send();
      }
    });
    sendBtn.addEventListener('click', send);

    renderMsgs();
  })();
})();
