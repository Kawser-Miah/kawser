(() => {
  'use strict';

  const MIN_DURATION_SEC = 1;
  const MAX_DURATION_SEC = 900;
  const VISIBILITY_THRESHOLD = 0.4;

  const track = (name, params) => {
    if (typeof window.trackEvent === 'function') {
      try { window.trackEvent(name, params); } catch (_) {}
    }
  };

  // Firebase event names: letters, digits, underscores; must start with a letter; max 40 chars.
  const safeName = (id) => String(id).toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30);

  const init = () => {
    const sections = document.querySelectorAll('main section[id]');
    const seenSections = new Set();
    const ratios = new Map();
    let activeSection = null;
    let activeStart = 0;
    let pageVisible = !document.hidden;

    const flushActive = (reason) => {
      if (!activeSection) return;
      const elapsedSec = (performance.now() - activeStart) / 1000;
      const duration = Math.min(Math.round(elapsedSec), MAX_DURATION_SEC);
      if (duration >= MIN_DURATION_SEC) {
        track('section_time_spent', {
          section_id: activeSection,
          duration_seconds: duration,
          end_reason: reason || 'switch'
        });
        track('time_' + safeName(activeSection), {
          duration_seconds: duration,
          end_reason: reason || 'switch'
        });
      }
      activeSection = null;
    };

    const refreshActive = () => {
      if (!pageVisible) return;
      let bestId = null;
      let bestRatio = 0;
      ratios.forEach((ratio, id) => {
        if (ratio >= VISIBILITY_THRESHOLD && ratio > bestRatio) {
          bestId = id;
          bestRatio = ratio;
        }
      });
      if (bestId !== activeSection) {
        flushActive('switch');
        if (bestId) {
          activeSection = bestId;
          activeStart = performance.now();
        }
      }
    };

    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.intersectionRatio);
          if (entry.isIntersecting && entry.intersectionRatio >= VISIBILITY_THRESHOLD
              && !seenSections.has(entry.target.id)) {
            seenSections.add(entry.target.id);
            track('section_view', { section_id: entry.target.id });
            track('view_' + safeName(entry.target.id));
          }
        });
        refreshActive();
      }, { threshold: [0, 0.25, 0.4, 0.6, 0.8, 1] });
      sections.forEach((s) => observer.observe(s));
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        flushActive('hidden');
        pageVisible = false;
      } else {
        pageVisible = true;
        refreshActive();
      }
    });

    window.addEventListener('pagehide', () => flushActive('pagehide'));

    document.addEventListener('click', (event) => {
      const tagged = event.target.closest('[data-analytics]');
      if (tagged) {
        track('cv_download', { location: tagged.dataset.analytics });
      }

      const projectCard = event.target.closest('.project-card');
      if (projectCard) {
        const title = projectCard.querySelector('h3, .project-title, [class*="title"]');
        const titleText = title ? title.textContent.trim().slice(0, 100) : 'unknown';
        track('project_click', { project_title: titleText });
        track('project_' + safeName(titleText), { project_title: titleText });
      }

      const link = event.target.closest('a[href]');
      if (link) {
        try {
          const url = new URL(link.getAttribute('href'), location.href);
          const isExternal = url.host && url.host !== location.host && /^https?:$/.test(url.protocol);
          if (isExternal) {
            track('external_link_click', {
              link_url: url.href,
              link_host: url.host,
              link_text: (link.textContent || link.getAttribute('aria-label') || '').trim().slice(0, 60)
            });
          }
          if (url.protocol === 'mailto:') {
            track('email_click', { email: url.pathname });
          }
        } catch (_) { /* ignore malformed hrefs */ }
      }
    });

    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', () => {
        track('contact_submit');
      });
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') || 'unknown';
        track('theme_toggle', { from_theme: theme });
      });
    }
  };

  if (typeof window.trackEvent === 'function') {
    init();
  } else {
    window.addEventListener('firebase-analytics-ready', init, { once: true });
    setTimeout(() => {
      if (typeof window.trackEvent === 'function' && !window.__analyticsInited) {
        window.__analyticsInited = true;
        init();
      }
    }, 4000);
  }
})();
