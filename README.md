# Developer Portfolio — Kawser Miah

Personal portfolio website for **Kawser Miah**, a Flutter / Mobile Application Developer.

🔗 **Live:** https://kawser.me/
📧 **Email:** kawsermiah.cse@gmail.com
🐙 **GitHub:** https://github.com/Kawser-Miah
🔗 **LinkedIn:** https://www.linkedin.com/in/kawser-miah/

---

## Overview

A static site built with **plain HTML, CSS, and vanilla JavaScript** — no frameworks,
no build tools, no backend. Every content section is rendered at runtime from JSON
files under `data/`, so updating the site is usually just editing JSON.

---

## Project structure

```
.
├── index.html              # single page — all sections
├── privacy.html            # privacy policy
├── css/
│   └── style.css           # all styles (design tokens + light/dark themes)
├── js/
│   ├── main.js             # rendering, nav, modal, theme toggle, typewriter, etc.
│   └── analytics.js        # Firebase Analytics instrumentation layer
├── data/
│   ├── projects.json
│   ├── blog.json
│   ├── skills.json
│   ├── education.json
│   └── experience.json
├── assets/
│   ├── images/             # headshot, company logos, project thumbnails (.webp)
│   └── resume/             # CV PDF
├── CNAME                   # custom domain (kawser.me)
├── robots.txt · sitemap.xml
└── .github/workflows/deploy.yml
```

---

## Development

No build step. Serve the folder and open it:

```bash
python3 -m http.server 8080
# or
npx serve .
```

- **JSON changes** show up on a normal refresh.
- **JS / CSS changes** need a hard refresh (Ctrl+Shift+R) to bypass cache.

---

## How it works

`js/main.js` runs as a single IIFE. On load it `fetch()`es each JSON file and renders
the matching section into the DOM:

| Section      | Data file             | Render function      |
| ------------ | --------------------- | -------------------- |
| Projects     | `data/projects.json`  | `renderProjects()`   |
| Blog         | `data/blog.json`      | `renderBlog()`       |
| Skills       | `data/skills.json`    | `renderSkills()`     |
| Education    | `data/education.json` | `renderEducation()`  |
| Experience   | `data/experience.json`| `renderExperience()` |

The **Achievements** section is currently hard-coded in `index.html` (not data-driven).

Other behavior in `main.js`: sticky header + scroll-progress bar, `IntersectionObserver`
scroll-reveal animations, active-nav highlighting, mobile nav toggle, hero typewriter
effect, headshot zoom, project modal with focus trap, Shift+Click-to-copy email, and
the dark/light theme toggle.

### Theme

Dark/light toggle stored in `localStorage` under `site-theme`. Default is **light**
(no `data-theme` on `<html>`); dark mode sets `data-theme="dark"`. There is **no**
OS `prefers-color-scheme` detection for theme — first-time visitors always get light.
Colors are CSS custom properties in `css/style.css` (`:root` light, `:root[data-theme="dark"]` dark).

### Analytics

`index.html` initializes Firebase Analytics (GA4) inline and exposes
`window.trackEvent(name, params)`. `js/analytics.js` waits for that helper, then
instruments the rendered page with `IntersectionObserver` + a delegated click listener:
section views, time-per-section, project-card clicks, external-link / `mailto:` clicks,
CV downloads (`[data-analytics]`), theme toggles, and contact submits. `Do Not Track`
is respected (collection is disabled).

Adding a new tracked interaction usually means editing `analytics.js`, not `main.js`.

### Contact form

No backend. On submit it shows a message asking the visitor to email
`kawsermiah.cse@gmail.com` directly.

---

## Data schemas

### `data/projects.json`

```json
{
  "id": "kebab-case-id",
  "title": "Project Title",
  "short": "One-line summary shown on the card",
  "description": "HTML string — rendered via innerHTML in the modal",
  "features": ["Shown as <li> items", "..."],
  "tech": ["Flutter", "Dart", "..."],
  "thumbnail": "./assets/images/project-name.webp",
  "live": "https://...  or  \"\"",
  "repo": "https://github.com/...  or  \"\""
}
```

`features` may be `null` — the features block is hidden automatically.
`description` supports full HTML.

### `data/skills.json`

```json
{ "name": "Flutter", "icon": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" }
```

### `data/blog.json`

```json
{ "title": "...", "summary": "...", "url": "https://...", "published": "YYYY-MM-DD" }
```

### `data/education.json`

```json
{ "degree": "...", "school": "...", "startDate": "2022", "endDate": "2026", "notes": "" }
```

### `data/experience.json`

```json
{
  "title": "...",
  "company": "...",
  "startDate": "June 2024",
  "endDate": "Present",
  "logo": "./assets/images/logo-company.png",
  "responsibilities": ["...", "..."]
}
```

---

## Updating projects

1. Edit `data/projects.json`.
2. Add or change an entry (see schema above).
3. Save and refresh — the cards re-render automatically. No HTML changes needed.

---

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys on every push to `main`:
it publishes the repo root to the `gh-pages` branch via
[`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages).
GitHub Pages serves `gh-pages` at the `kawser.me` custom domain (`CNAME`).

---

## License

Personal project. Design, code, and content may not be reused without permission.
