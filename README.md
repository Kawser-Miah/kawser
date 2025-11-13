# Kawser Ahmed — Portfolio (HTML/CSS/JS)

A clean, responsive single-page portfolio for Kawser Ahmed. Built with semantic HTML5, modern CSS, and vanilla JavaScript. It includes smooth navigation, project modals, Formspree contact form, downloadable CV, and analytics placeholders.

## Features
- Minimal, professional design with elegant micro-animations
- Sticky navigation with active section highlighting
- Hero typewriter effect (respects `prefers-reduced-motion`)
- Skills grid with progressive reveal
- Projects loaded from `data/projects.json`
 - Blog posts loaded from `data/blog.json`
- Accessible project modal (focus trap, Esc/overlay close)
- Contact form (Formspree placeholder) + success/error messaging
- Downloadable CV with analytics event
- SEO meta tags, Open Graph/Twitter cards, JSON-LD Person schema
- robots.txt and sitemap.xml
- Optional GitHub Actions workflow for GitHub Pages

## Getting started

### Prerequisites
- No build step required. Any static server or directly opening `index.html` works.

### Run locally
- Option 1: Open the file directly
  - Open `index.html` in your browser
- Option 2: Use a tiny static server
  - Using Node.js:
    ```bash
    npx http-server -p 5173 .
    ```
  - Then visit http://localhost:5173

### Replace placeholders (TODOs)
- Images in `assets/images/`:
  - `headshot.png`, `og-image.webp`, and project images (`project-*.webp`)
- Resume file: `assets/resume/Kawser Miah - Resume.pdf`
- Social links in `index.html` (GitHub, LinkedIn, Twitter)
- Formspree ID in the contact form action attribute: `https://formspree.io/f/{your-id}`
- Google Analytics ID (`G-XXXXXXX`) or remove analytics snippet entirely
- Canonical URL and sitemap URL (`kawser.dev`) if your domain differs

## Data model
`data/projects.json` contains an array of projects with:
```json
{
  "id": "string",
  "title": "string",
  "short": "1-2 line summary",
  "description": "longer description",
  "tech": ["Tech", "Tags"],
  "thumbnail": "/assets/images/project-name.webp",
  "live": "https://... (optional)",
  "repo": "https://github.com/..."
}
```

`data/blog.json` contains an array of blog entries with:
```json
{
  "title": "string",
  "summary": "short description",
  "url": "https://external-blog-post",
  "published": "YYYY-MM-DD"
}
```

## Performance and accessibility
- Images use WebP placeholders and `loading="lazy"`
- Animations use opacity/transform; reduced motion respected
- Focus-visible outlines and keyboard-accessible components
- External JS is deferred

## Minify for production (optional)
You can minify CSS/JS before deploying. Example using npx (no install):
```bash
# Minify CSS
npx cssnano css/style.css css/style.min.css
# Minify JS
npx terser js/main.js -o js/main.min.js --compress --mangle
```
Then update `index.html` to load the `.min` files. Alternatively use any static host’s built-in optimizations.

## Deployment

### Netlify
1. Push this project to a GitHub repository
2. In Netlify, "Add new site" → "Import an existing project"
3. Pick your repo; Build command: none; Publish directory: `/` (root)
4. Or drag & drop the folder onto app.netlify.com

### GitHub Pages (gh-pages branch)
- Simple option: use the included workflow
- Or manually:
  1. Create a `gh-pages` branch
  2. Copy the site contents to that branch and push
  3. In repo Settings → Pages, select `gh-pages` as the source

### GitHub Actions workflow
A workflow is included in `.github/workflows/deploy.yml` that publishes to `gh-pages` on push to `main`.

## Recommended Git workflow
- Create a branch for your first commit:
  - `feature/initial-setup`
- Commit message suggestions:
  - `chore: initial site structure and assets`
  - `feat: add hero, about, skills, projects sections`
  - `feat: add modal component and contact form`
  - `chore: add resume download and analytics placeholder`

## QA checklist
- [ ] Keyboard navigation (Tab through header, open/close modal with Enter/Esc)
- [ ] Modal closes on overlay click and Esc; focus returns to invoking element
- [ ] Contact form submits to Formspree test endpoint and shows success
- [ ] Resume download links trigger download and analytics event
- [ ] Responsive across 320px–1366px

## License
This project is provided as a template. Replace content with your own. Images are placeholders.
# kawser
