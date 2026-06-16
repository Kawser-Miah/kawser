# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static personal portfolio website — pure HTML, CSS, and vanilla JavaScript with no build tools, no frameworks, and no backend. All dynamic content is loaded from JSON files at runtime via `fetch()`.

**Live site:** https://kawser-miah.github.io/kawser/
**Deployed via:** GitHub Actions → GitHub Pages (`gh-pages` branch). Every push to `main` triggers automatic deployment (`.github/workflows/deploy.yml`).

## Development

No build step. Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 8080
# or
npx serve .
```

JSON data changes are visible immediately on refresh. JS/CSS changes require a hard refresh (Ctrl+Shift+R).

## Architecture

All content is data-driven. `js/main.js` fetches each JSON file and renders the corresponding section via `innerHTML`/`createElement`. The render functions follow this pattern:

| Section | Data file | Render function |
|---|---|---|
| Projects | `data/projects.json` | `renderProjects()` → project cards + modal |
| Blog | `data/blog.json` | `renderBlog()` |
| Skills | `data/skills.json` | `renderSkills()` |
| Education | `data/education.json` | `renderEducation()` |
| Experience | `data/experience.json` | `renderExperience()` |

**Project modal:** Clicking a project card calls `openModal(project, invoker)`. The modal uses `desc.innerHTML` (not `textContent`) so the `description` field in `projects.json` can contain raw HTML for rich formatting. Features list and tech tags are rendered separately from the description.

**Theme system:** Dark/light toggle stores preference in `localStorage` under the key `site-theme`. The default is `light` (no `data-theme` attribute on `<html>`). Dark mode is activated by setting `data-theme="dark"` on `<html>`. All theme colors are CSS custom properties in `css/style.css`.

## Data File Schemas

### `data/projects.json`
```json
{
  "id": "kebab-case-id",
  "title": "Project Title",
  "short": "One-line summary shown on the card",
  "description": "HTML string rendered via innerHTML in the modal",
  "features": ["Feature detail (shown as <li> items)", "..."],
  "tech": ["Flutter", "Dart", "..."],
  "thumbnail": "./assets/images/project-name.webp",
  "live": "https://... or empty string",
  "repo": "https://github.com/... or empty string"
}
```
`features` can be `null` — the features section is hidden automatically.
`description` supports full HTML (headings, lists, inline styles, etc.).

### `data/skills.json`
```json
{ "name": "Flutter", "icon": "https://cdn.jsdelivr.net/..." }
```

### `data/blog.json`
```json
{ "title": "...", "summary": "...", "url": "https://...", "published": "YYYY-MM-DD" }
```

### `data/education.json`
```json
{ "degree": "...", "school": "...", "startDate": "...", "endDate": "...", "notes": "optional" }
```

### `data/experience.json`
```json
{ "title": "...", "company": "...", "startDate": "...", "endDate": "...", "responsibilities": ["..."] }
```

## Design System

- **Accent:** `#0f766e` (teal), **Accent-2:** `#0891b2` (cyan)
- **Font:** Inter (400/600/700/800)
- **Border-radius:** `14px` (`--radius`)
- **Container max-width:** `1100px`, padding `24px` (mobile: `16px`)
- **Section padding:** `72px` vertical (mobile: `48px`)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`

CSS is organized in `css/style.css` in this section order: Global → Accessibility → Header/Nav → Buttons → Social Links → Hero → About → Skills → Projects → Education → Modal → Contact → Footer → Reveal animations → Utilities → Responsive → Reduced motion.

## Key Behaviors to Know

- **Email copy:** Shift+Click on the contact email copies to clipboard; normal click opens `mailto:`.
- **Reveal animations:** Sections with class `.reveal` become visible (`.is-visible`) when they enter the viewport via `IntersectionObserver`. Skills badges stagger at 70ms intervals.
- **Modal focus trap:** `openModal()` traps Tab/Shift-Tab inside the modal and restores focus to the invoking card on close.
- **CV download:** Tracked via `data-analytics="download-cv"` attribute → fires a `gtag` event.
- **Reduced motion:** `window.matchMedia('(prefers-reduced-motion: reduce)')` adds `.reduced-motion` to `<html>` and skips the typewriter animation.
