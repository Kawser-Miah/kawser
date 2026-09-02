# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static personal portfolio website — pure HTML, CSS, and vanilla JavaScript with no build tools, no frameworks, and no backend. All dynamic content is loaded from JSON files at runtime via `fetch()`.

The UI is a **terminal / developer-themed** design (mono-font chrome, terminal windows, code-syntax coloring, an orbiting hero visual, a floating AI-assistant chat widget) ported from a React/TypeScript reference design (kept in `Portfolio Redesign Request/`, a separate Vite scaffold — not part of the deployed site, useful only as a visual reference; `npm install && npm run dev` there boots the original design for comparison). The port intentionally reused the reference design's visuals/animations 1:1 wherever possible, but **all content comes from this repo's own `data/*.json` and hardcoded facts** — the reference design's own placeholder content (fictional project names, fake stats) was never carried over, with one deliberate exception: the chatbot's canned answers were kept verbatim from the reference design, fictional project names included.

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
| Skills | `data/skills.json` | `renderSkills()` → flat chip cloud in a single terminal window |
| Experience | `data/experience.json` | `renderExperience()` → one entry per job inside a shared terminal window |
| Education | `data/education.json` | `renderEducation()` → one card per entry; every entry gets the same animated crest badge (`.edu-badge` — green gradient medallion + orbiting dashed rings + pulse), Green University's shows `GUB` / `EST. 2003` lettering (`.is-gub`), every other school shows a white grad-cap glyph (`.edu-badge-cap`) |
| Projects | `data/projects.json` | `renderProjects()` → phone-mockup cards + `.pd-*` details modal |
| Blog | `data/blog.json` | `renderBlog()` |

**Achievements** (HackTheAI 2025, Dean's/VC Merit Awards) are hardcoded directly in `index.html` (`#achievements`), not JSON-driven — same as before the redesign.

**3D tilt cards:** every project card and education card is wrapped in an extra `.tilt-card` div (`reveal` wrapper → `.tilt-card` → the actual `.project-card`/`.edu-card`). `initTilt()`/`wrapInTilt()` in `js/main.js` attach real mousemove-driven `perspective/rotateY/rotateX/translateZ` + directional box-shadow, reset on `mouseleave` — this is JS-driven, not a CSS `:hover` effect, and reads the current theme (`document.documentElement.getAttribute('data-theme')`) on every move to pick the light/dark shadow formula.

**Project modal:** clicking a project card calls `openProjectModal(project, invoker)`, which populates the persistent `#project-modal` (`.pd-*` classes) — title, `description` (raw HTML via `innerHTML`, same as before), a features checklist (hidden entirely if `features` is `null`/empty), tech chips, and live/repo buttons (each hidden individually if the field is empty). Because the modal is a persistent DOM node (not remounted like the React reference), its `.pd-sec` entrance animation is manually restarted on every open via a `style.animation = 'none'; void el.offsetHeight; style.animation = ''` reflow trick — don't remove that or the stagger-in will only ever play once per page load.

**Project card accent/language:** `data/projects.json` has no `lang`/`color` fields. `projectLang(tech)` in `main.js` derives `Dart` or `Python` from the `tech` array, and `LANG_COLOR` maps that to a fixed accent hex (`#00B4D8` / `#3572A5`, GitHub's real language colors) used for the card's `--project-accent` CSS variable, the phone-stage glow, and the modal glow. GitHub stars/forks/a "year completed" badge from the reference design were deliberately dropped — this repo has no such data and it isn't tracked.

**Header:** three-column flex layout (`logo` | `.nav-list` | `.nav-controls`) with `justify-content: space-between`, matching the reference design's actual layout (not a two-column "everything bunched right" layout). Nav items are exactly `about, skills, experience, projects, achievements, contact` (Education and Blog are intentionally not linked from the nav — same omission as the reference design; those sections are still reachable by scrolling). The header button is `hire_me()` linking to `#contact` (not a CV download). **Quirk kept intentionally:** the hamburger toggle is visible at every viewport width, not just on mobile — this reproduces a real bug in the reference source (`className="md:hidden"` combined with a conflicting inline `style={{ display: "flex" }}` that always wins), confirmed by actually running the reference app. Clicking it always opens the same 6-link panel (+ its own `hire_me()`) regardless of screen width; the icon swaps between a hamburger and an X via `.nav-toggle.is-open`.

**CV links:** there is no header CV button. The hero has `view_cv()` (`data-analytics="view-cv-hero"`, `target="_blank"`, no `download` attribute — opens the PDF in a new tab). The Contact section has the only actual download link (`resume.pdf`, `data-analytics="download-cv-contact"`, has `download`). Both fire `window.gtag('event','download',...)` via the generic `[data-analytics="download-cv"]` listener in `main.js` — note that selector is an **exact-match** on the literal string `"download-cv"`, which none of the real attribute values equal (`view-cv-hero`, `download-cv-contact`), so that gtag call never actually fires. This is a preexisting quirk from before the redesign — preserved as-is rather than "fixed" as part of a UI-only change.

**Ambient decoration:** `initBgFx()`/`initCursorTrail()` in `main.js` populate `#bgFx` (a fixed, `z-index:-1` layer of floating dev-glyphs/logos/shapes behind the page) and `#cursorTrail` (SVG dev-logo stickers flung from the pointer on `mousemove`, throttled, self-removing after 750ms). Both are pure decoration with no data dependency; the cursor trail is disabled under `prefers-reduced-motion` and on coarse-pointer (touch) devices.

**Hero orbit visual:** the profile photo (`assets/images/headshot.png`) sits inside three concentric rings (`.orbit-ring.r1/r2/r3`) that each rotate via CSS animation at a different speed/direction (18s CW / 30s CCW / 50s CW). Six tech-initial dots (`.orbit-dot`) are nested **inside** their respective ring so the ring's rotation carries them around the circle, each with its own counter-rotation animation (`counterCW`/`counterCCW`, same duration as its parent ring, opposite direction) so the label stays upright while still orbiting — don't move the dots back out to be siblings of the rings, that silently turns them static.

**Theme system:** unchanged mechanism — dark/light toggle stores preference in `localStorage` under the key `site-theme`. The default is `light` (no `data-theme` attribute on `<html>`). Dark mode is activated by setting `data-theme="dark"` on `<html>`. Colors live as CSS custom properties in `css/style.css`: `:root { … }` is the light palette, `:root[data-theme="dark"]` overrides for dark. `getPreferredTheme()` (`js/main.js`) resolves order: saved `localStorage` value → else `light`; it does **not** check `prefers-color-scheme` for the initial choice.

**Two JS files, distinct concerns (unchanged):**
- `js/main.js` — all rendering, UI behavior, and interactions: the table above, plus ambient bg/cursor trail, header/scroll/nav behavior, theme toggle, hero typewriter + animated stat counters, tilt cards, reveal-on-scroll, the project modal, the contact form, and the terminal AI-assistant chat widget (`#chatFab`/`#chatPanel`). Self-invoking IIFE; no exports.
- `js/analytics.js` — a separate Firebase-analytics layer that instruments the *already-rendered* page, untouched by the redesign. It depends on a global `window.trackEvent(name, params)` (defined inline in `index.html` after Firebase init) and does not run until that exists. It tracks section views/time-spent (via `main section[id]` — this still picks up every current section id automatically), project-card clicks (via `.closest('.project-card')`, which still resolves correctly even though a project card is now nested two levels deep inside `.reveal` → `.tilt-card`), external-link/`mailto:` clicks, CV-related clicks (`[data-analytics]`, generic — see the CV links note above), theme toggles, and contact submits.

**Reveal-on-scroll:** `observeReveals(root)` in `main.js` must check whether `root` **itself** matches `.reveal,.reveal-left,.reveal-right,.reveal-scale` (not just `root.querySelectorAll(...)`, which only finds descendants) — dynamically-created cards (experience entries, education cards, project cards, blog cards) carry the reveal class on themselves, and `querySelectorAll` alone leaves them permanently at `opacity:0`. This was a real bug found and fixed during the port; don't reintroduce the descendants-only version.

**Chatbot:** the floating terminal AI-assistant widget (`#chatFab`/`#chatPanel`) was kept **verbatim** from the reference design at the user's explicit request, canned answers included — its slash commands (`/about`, `/skills`, `/projects`, etc.) and free-text "AI mode" replies reference the reference design's fictional project names (`live-bidding-app`, `gps-fleet-tracker`, etc.), which do **not** match this repo's real `data/projects.json`. This is a known, intentional exception to the "no fabricated content" rule elsewhere in the site — do not "fix" it to match real data without asking first.

Note there are **two** analytics paths: `main.js` fires `window.gtag` (Google Analytics) for CV downloads, while `analytics.js` fires `window.trackEvent` (Firebase). Both may be active.

## Data File Schemas

### `data/projects.json`
```json
{
  "id": "kebab-case-id",
  "title": "Project Title",
  "short": "One-line summary shown on the card",
  "description": "HTML string rendered via innerHTML in the modal",
  "features": ["Feature detail (shown as a checklist item), or null to hide the section", "..."],
  "tech": ["Flutter", "Dart", "..."],
  "thumbnail": "./assets/images/project-name.webp",
  "live": "https://... or empty string",
  "repo": "https://github.com/... or empty string"
}
```
`features` can be `null` — the features section is hidden automatically.
`description` supports full HTML (headings, lists, inline styles, etc.) — for the three projects that ship rich multi-section descriptions (`mili`, `electrician-apprentice-hours`, `blood-setu`), the inline styles use CSS custom properties (`var(--fg)`, `var(--blue)`, `color-mix(in srgb, var(--blue) 14%, var(--bg-2))`, etc.) instead of hardcoded hex, specifically so they adapt to the dark/light theme. Keep new rich descriptions on that same convention rather than hardcoded colors.

### `data/skills.json`
```json
{ "name": "Flutter", "icon": "https://cdn.jsdelivr.net/..." }
```
Rendered as a flat chip cloud (icon + name) inside a single terminal window — there is no category/tier grouping, because the data itself carries none; don't invent one.

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

- **Fonts:** `JetBrains Mono` for all UI chrome/labels/terminal text, `Inter` for body prose (project descriptions, about paragraphs).
- **Accent tokens** (CSS custom properties, defined once on `:root` for light and re-defined on `:root[data-theme="dark"]` — see `css/style.css` for exact hex values): `--blue`, `--green`, `--orange`, `--purple`, `--cyan`, `--yellow`, `--red`, plus `--gub-green` (fixed, doesn't change with theme — used for the Green University badge/education styling) and the neutral scale `--bg`/`--bg-2`/`--bg-3`/`--surface`/`--border`/`--border-2`/`--fg`/`--fg-2`/`--muted`.
- **Container max-width:** `1080px` (was `1100px` pre-redesign), padding `24px`.
- **Terminal window chrome:** every "window" (skills, experience, achievements, contact form, project modal) reuses the same `.term-window`/`.term-titlebar`/`.term-dots` pattern — three colored traffic-light dots + a filename label.
- **Border-radius:** small and consistent (`4px`–`10px` depending on component) — no single global `--radius` token like the pre-redesign teal theme had.

CSS is organized in `css/style.css` in this section order: Global → Accessibility → Tokens/Theme → Header/Nav → Buttons → Background FX → Hero → About → Skills → Experience → Education → Projects → Achievements → Blog → Contact → Footer → Modal → Chatbot → Reveal animations → Utilities → Responsive → Reduced motion.

## Key Behaviors to Know

- **Contact form:** no backend is wired up (unchanged from before the redesign). On submit it prevents default and shows a status message directing the visitor to email `kawsermiah.cse@gmail.com` directly, styled as a terminal-style `new_message.dart` form.
- **Email copy:** Shift+Click on the contact email (`.contact-email-link`) copies it to clipboard; a normal click opens `mailto:`.
- **Reveal animations:** sections/cards with `.reveal`/`.reveal-left`/`.reveal-right`/`.reveal-scale` fade in via `IntersectionObserver` when they enter the viewport — see the `observeReveals` note above for the one non-obvious gotcha.
- **Headshot zoom:** click/Enter/Space on the hero orbit photo (`.orbit-photo img`) toggles `.is-zoomed`, scaling it up in place.
- **Active nav + scroll progress:** an `IntersectionObserver` sets `aria-current` on the in-view section's nav link; a `#scroll-progress` bar width tracks scroll position; the header gains `.is-sticky` past a scroll threshold and `.is-hidden` when scrolling down past 120px (reappears on scroll-up).
- **Animated stat counters:** the hero's `yrs_exp`/`store_apps`/`apps_built` numbers count up from 0 via `animateCounter()` once `#heroStats` scrolls into view (gated on `prefers-reduced-motion`, which shows the final value immediately instead). The fourth stat (`Top 50` / `HackTheAI '25`) is intentionally **static text, not a counter** — don't "fix" it into a number, that was a deliberate revert back to the pre-redesign site's actual copy.
- **Reduced motion:** `window.matchMedia('(prefers-reduced-motion: reduce)')` adds `.reduced-motion` to `<html>` and short-circuits the hero typewriter and the cursor-trail sticker effect; a global CSS media query also collapses all animation/transition durations to near-zero.
