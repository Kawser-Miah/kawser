/*
  Kawser Ahmed Portfolio — JS (vanilla)
  - Smooth scroll & active nav
  - Sticky header state
  - Section & skills reveal (IntersectionObserver)
  - Typewriter effect (lightweight)
  - Projects loader + accessible modal with focus trap
  - Contact form submit via Formspree
  - Back-to-top toggle
  - Analytics: download CV event
*/
(function(){
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = ['home','about','education','skills','experience','projects','achievements','blog','contact'].map(id => document.getElementById(id));
  const backToTop = document.getElementById('backToTop');
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksAll = document.querySelectorAll('.nav-list .nav-link');

  // Sticky header shadow toggle
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('is-sticky'); else header.classList.remove('is-sticky');
    if (backToTop) {
      if (window.scrollY > 600) backToTop.classList.add('visible'); else backToTop.classList.remove('visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close after clicking a link
    navLinksAll.forEach(link => link.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }));
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && e.target !== navToggle && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Active nav link via IntersectionObserver
  const linkMap = new Map(Array.from(navLinks).map(a => [a.getAttribute('data-link'), a]));
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = linkMap.get(id);
      if (entry.isIntersecting && link) {
        // Clear others
        navLinks.forEach(a => a.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-50% 0px -45% 0px', threshold: 0.01 });
  sections.forEach(sec => sec && sectionObserver.observe(sec));

  // Reveal on scroll for sections
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  // Typewriter effect for hero tagline
  const typeEl = document.getElementById('typewriter');
  if (typeEl) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const text = typeEl.getAttribute('data-text') || '';
    if (prefersReduced) {
      typeEl.textContent = text;
    } else {
      let i = 0;
      const speed = 24; // ms per char
      const type = () => {
        typeEl.textContent = text.slice(0, i++);
        if (i <= text.length) requestAnimationFrame(() => setTimeout(type, speed));
      };
      type();
    }
  }

  // Headshot zoom (click/tap/keyboard)
  const heroVisual = document.getElementById('heroVisual');
  const heroImg = heroVisual ? heroVisual.querySelector('img') : null;
  if (heroVisual && heroImg) {
    const toggleZoom = () => {
      const zoomed = heroVisual.classList.toggle('is-zoomed');
      heroImg.setAttribute('aria-pressed', zoomed ? 'true' : 'false');
    };
    heroImg.addEventListener('click', toggleZoom);
    heroImg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleZoom();
      }
    });
  }

  // Email copy functionality (Shift+Click to copy)
  const contactEmail = document.querySelector('.contact-email a');
  if (contactEmail) {
    contactEmail.addEventListener('click', (e) => {
      const email = contactEmail.textContent.trim();
      // Shift+Click to copy email instead of opening mailto
      if (navigator.clipboard && e.shiftKey) {
        e.preventDefault();
        navigator.clipboard.writeText(email).then(() => {
          const originalText = contactEmail.textContent;
          contactEmail.textContent = '✓ Copied!';
          setTimeout(() => { contactEmail.textContent = originalText; }, 2000);
        }).catch(() => {
          // Silently fail - default mailto will work
        });
      }
    });
  }

  // Projects: fetch and render
  const projectsGrid = document.getElementById('projects-grid');
  let projectsData = [];
  function renderProjects(list) {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';
    list.forEach(p => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${p.title} — open details`);
      const techBadges = p.tech && p.tech.length > 0 
        ? p.tech.map(t => `<span class='tag' aria-hidden="true">${t}</span>`).join('') 
        : `<span class='tag' aria-hidden="true">Technology: N/A</span>`;
      const techList = p.tech && p.tech.length > 0 ? p.tech.join(', ') : 'N/A';
      
      card.innerHTML = `
        <div class="project-media"><img src="${p.thumbnail}" alt="Thumbnail for ${p.title}" loading="lazy"></div>
        <div class="project-body">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-summary">${p.short}</p>
          <div class="project-tags">
            <span class="sr-only">Technologies used: ${techList}</span>
            ${techBadges}
          </div>
          <div class="project-actions">
            ${p.live ? `<a class="btn btn-secondary" href="${p.live}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ''}
            <a class="btn btn-primary" href="${p.repo}" target="_blank" rel="noopener noreferrer">Source Code</a>
          </div>
        </div>`;
      card.addEventListener('click', () => openModal(p, card));
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p, card); } });
      projectsGrid.appendChild(card);
    });
  }
  fetch('./data/projects.json').then(r => r.json()).then(data => { projectsData = data; renderProjects(data); }).catch(() => {
    if (projectsGrid) projectsGrid.innerHTML = '<p>Failed to load projects.</p>';
  });

  // Blog: fetch and render
  const blogGrid = document.getElementById('blog-grid');
  function renderBlog(posts) {
    if (!blogGrid) return;
    blogGrid.innerHTML = '';
    posts.forEach(post => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${post.title} — open on external site`);
      const targetUrl = post.url;
      const domain = (() => { try { return new URL(targetUrl).hostname; } catch { return ''; } })();
      card.innerHTML = `
        <div class="project-body">
          <h3 class="project-title">${post.title}</h3>
          <p class="project-summary">${post.summary || ''}</p>
          <div class="project-tags">
            ${post.published ? `<span class='tag'>${new Date(post.published).toLocaleDateString()}</span>` : ''}
            ${domain ? `<span class='tag'>${domain}</span>` : ''}
          </div>
          <div class="project-actions">
            <a class="btn btn-primary" href="${targetUrl}" target="_blank" rel="noopener noreferrer">Read Post</a>
          </div>
        </div>`;
      const open = () => window.open(targetUrl, '_blank', 'noopener');
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      blogGrid.appendChild(card);
    });
  }
  fetch('./data/blog.json').then(r => r.json()).then(renderBlog).catch(() => {
    if (blogGrid) blogGrid.innerHTML = '<p>Failed to load blog posts.</p>';
  });

  // Skills: fetch and render
  const skillsGrid = document.getElementById('skills-grid');
  function renderSkills(skills) {
    if (!skillsGrid) return;
    skillsGrid.innerHTML = '';
    skills.forEach(skill => {
      const li = document.createElement('li');
      li.className = 'skill-badge';
      li.setAttribute('tabindex', '0');
      li.innerHTML = `<span aria-hidden="true">${skill.icon}</span> ${skill.name}`;
      skillsGrid.appendChild(li);
    });
    // Skills progressive reveal (after render)
    setupSkillsReveal();
  }
  fetch('./data/skills.json').then(r => r.json()).then(renderSkills).catch(() => {
    if (skillsGrid) skillsGrid.innerHTML = '<p>Failed to load skills.</p>';
  });

  // Skills progressive reveal setup
  function setupSkillsReveal() {
    const skills = document.querySelectorAll('.skill-badge');
    const skillsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const badges = Array.from(skills);
          badges.forEach((badge, i) => {
            setTimeout(() => badge.classList.add('is-visible'), i * 70);
          });
          obs.disconnect();
        }
      });
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.2 });
    const skillsSection = document.getElementById('skills');
    if (skillsSection) skillsObserver.observe(skillsSection);
  }

  // Education: fetch and render
  const educationList = document.getElementById('education-list');
  function renderEducation(educationData) {
    if (!educationList) return;
    educationList.innerHTML = '';
    educationData.forEach(edu => {
      const li = document.createElement('li');
      li.className = 'education-item';
      const dateRange = `${edu.startDate} – ${edu.endDate}`;
      li.innerHTML = `
        <article class="education-card" aria-label="${edu.degree}">
          <div class="education-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <div class="education-content">
            <h3 class="education-degree">${edu.degree}</h3>
            <p class="education-school">${edu.school}</p>
            <p class="education-date">${dateRange}</p>
            ${edu.notes ? `<p class="education-notes">${edu.notes}</p>` : ''}
          </div>
        </article>`;
      educationList.appendChild(li);
    });
  }
  fetch('./data/education.json').then(r => r.json()).then(renderEducation).catch(() => {
    if (educationList) educationList.innerHTML = '<p>Failed to load education.</p>';
  });

  // Experience: fetch and render
  const experienceList = document.getElementById('experience-list');
  function renderExperience(experienceData) {
    if (!experienceList) return;
    experienceList.innerHTML = '';
    experienceData.forEach(exp => {
      const li = document.createElement('li');
      li.className = 'education-item';
      const dateRange = `${exp.startDate} – ${exp.endDate}`;
      const responsibilitiesHTML = exp.responsibilities.map(r => `<li>${r}</li>`).join('');
      li.innerHTML = `
        <article class="education-card" aria-label="${exp.title} at ${exp.company}">
          <div class="education-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
          </div>
          <div class="education-content">
            <h3 class="education-degree">${exp.title} — ${exp.company}</h3>
            <p class="education-date">${dateRange}</p>
            <ul class="experience-details">
              ${responsibilitiesHTML}
            </ul>
          </div>
        </article>`;
      experienceList.appendChild(li);
    });
  }
  fetch('./data/experience.json').then(r => r.json()).then(renderExperience).catch(() => {
    if (experienceList) experienceList.innerHTML = '<p>Failed to load experience.</p>';
  });

  // Accessible Modal with focus trap
  const modal = document.getElementById('project-modal');
  const modalOverlay = modal?.querySelector('.modal-overlay');
  const modalContent = modal?.querySelector('.modal-content');
  const modalClose = modal?.querySelector('.modal-close');
  let lastFocused = null;
  let modalKeydownHandler = null;

  function getFocusable(root) {
    return root.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  }

  function openModal(project, invoker) {
    if (!modal) return;
    lastFocused = invoker || document.activeElement;
    const title = modal.querySelector('#modal-title');
    const desc = modal.querySelector('#modal-desc');
    const tech = modal.querySelector('.modal-tech');
    const media = modal.querySelector('.modal-media');
    const links = modal.querySelector('.modal-links');

    title.textContent = project.title;
    desc.textContent = project.description;
    tech.innerHTML = project.tech.map(t => `<span class="tag">${t}</span>`).join('');
    media.innerHTML = `<img src="${project.thumbnail}" alt="Screenshot of ${project.title}" loading="lazy">`;
    links.innerHTML = `${project.live ? `<a class='btn btn-secondary' href='${project.live}' target='_blank' rel='noopener noreferrer'>Live Demo</a>` : ''}
                      <a class='btn btn-primary' href='${project.repo}' target='_blank' rel='noopener noreferrer'>Source Code</a>`;

    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.classList.add('no-scroll');

    // Move focus inside
    const focusables = getFocusable(modalContent);
    (focusables[0] || modalClose || modalContent).focus();

    // Trap focus
    function onKeyDown(e) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
      if (e.key === 'Tab') {
        const focusEls = getFocusable(modalContent);
        if (!focusEls.length) return;
        const first = focusEls[0];
        const last = focusEls[focusEls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    modalKeydownHandler = onKeyDown;
    modal.addEventListener('keydown', modalKeydownHandler);

    // Close handlers - use event delegation for overlay
    const onOverlayClick = (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    };
    const onCloseClick = () => closeModal();
    
    modalOverlay?.addEventListener('click', onOverlayClick, { once: true });
    modalClose?.addEventListener('click', onCloseClick, { once: true });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(() => { modal.classList.add('hidden'); document.body.classList.remove('no-scroll'); }, 200);
    if (modalKeydownHandler) {
      modal.removeEventListener('keydown', modalKeydownHandler);
      modalKeydownHandler = null;
    }
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // Contact form submit
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('form-status');
      // Detect placeholder Formspree ID
      if (form.action.includes('{your-id}')) {
        status.textContent = 'Form not configured. Please replace the Formspree ID in the form action.';
        status.style.color = '#b91c1c'; // red-700
        return;
      }
      status.style.color = '';
      status.textContent = 'Sending...';
      const data = new FormData(form);
      try {
        const res = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          status.textContent = 'Thanks! Your message has been sent.';
          form.reset();
        } else {
          // Try to parse JSON error if provided by Formspree
          try {
            const payload = await res.json();
            if (payload && payload.errors && payload.errors.length) {
              status.textContent = payload.errors.map(err => err.message).join(' ');
            } else {
              status.textContent = 'Oops, there was an error. Please try again later.';
            }
          } catch (_) {
            status.textContent = 'Oops, there was an error. Please try again later.';
          }
          status.style.color = '#b91c1c';
        }
      } catch (err) {
        status.textContent = 'Network error. If running locally, start a server (e.g., “npx http-server .”) and try again.';
        status.style.color = '#b91c1c';
      }
    });
  }

  // Back to top
  backToTop?.addEventListener('click', (e) => {
    // default anchor works with smooth behavior via CSS
  });

  // Analytics: Download CV
  const cvLinks = document.querySelectorAll('[data-analytics="download-cv"]');
  cvLinks.forEach(a => a.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'download', { 'event_category': 'Resume', 'event_label': 'Kawser Miah - Resume.pdf' });
    }
  }));
})();
