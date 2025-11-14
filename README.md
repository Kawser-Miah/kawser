# 🚀 Developer Portfolio Website – Kawser Miah

A modern, fully responsive, dark-mode enabled portfolio website showcasing my work as a **Flutter & Mobile Application Developer**.

🔗 **Live Website:** https://kawser-miah.github.io/kawser/  
📧 **Email:** kawsermiah.cse@gmail.com  
🐙 **GitHub:** https://github.com/Kawser-Miah  

---

## 📌 Overview

This platform serves as my official developer portfolio.  
It displays my mobile apps, technical skills, resume, APK downloads, and professional identity.

The site is built using **pure HTML, CSS, and JavaScript**, with dynamic project loading via JSON.  
It is fast, lightweight, and extremely easy to maintain.

---

## 🧩 Features

### ✔ Fully Responsive UI  
- Optimized for mobile, tablet, and desktop  
- Clean grid layout  
- Animated hamburger navigation  

### ✔ Dark Mode  
- System theme detection  
- Manual toggle  
- Smooth transitions  
- LocalStorage persistence  

### ✔ Dynamic Project Cards  
- Data loaded from `/data/projects.json`  
- Every project includes:
  - Thumbnail  
  - Description  
  - Tech stack  
  - Live demo / APK download  
  - GitHub Repo  

### ✔ APK & CV Download System  
- Same-origin instant downloads  
- Cross-origin blob fallback  
- Identical experience for both APK and CV  

### ✔ Accessibility  
- ARIA attributes  
- Keyboard navigation  
- Focus-visible styles  
- Reduced motion support  

### ✔ SEO Optimized  
- OpenGraph tags  
- Meta description  
- JSON-LD Person schema  
- Lazy loading  

---

## 🛠️ Tech Stack

- **HTML5**  
- **CSS3**  
- **JavaScript (ES6)**  
- **JSON data**  
- No frameworks, no backend  

---

## 📂 Folder Structure

```
root/
│── index.html
│── style.css
│── main.js
│── README.md
│── /assets
│     ├── /images
│     ├── /icons
│     ├── /apk
│     └── /resume
└── /data
      └── projects.json
```

---

## 🧱 Project Data System

All projects are defined inside:

```
/data/projects.json
```

Example structure:

```json
{
  "name": "DeenHub",
  "thumbnail": "/assets/images/deenhub-banner.png",
  "description": "An all-in-one Islamic lifestyle mobile application.",
  "tech": ["Flutter", "Dart", "Firebase"],
  "live": "/assets/apk/deenhub-v1.apk",
  "repo": "https://github.com/Kawser-Miah/DeenHub"
}
```

The website auto-renders cards based on this JSON.  
No HTML editing is required.

---

## 📥 APK Download System

### Behavior:
- If `.apk` → download  
- If URL → open in new tab  
- If `.pdf` → trigger CV download  

Example button:

```html
<a class="btn btn-secondary btn-download-apk" data-apk="/assets/apk/app.apk">
  Download APK
</a>
```

Handled by JavaScript:

```js
async function forceDownloadFile(url, filename) { ... }
```

---

## 📄 CV Download System

CVs use the *same system* as APK downloads:

```html
<a class="btn btn-primary btn-download-cv"
   data-cv="/assets/resume/Kawser-Miah-Resume.pdf">
   Download CV
</a>
```

JavaScript ensures a guaranteed download regardless of domain.

---

## 🌗 Dark Mode System

Dark mode works using:

- CSS Custom Properties  
- `[data-theme="dark"]` attribute  
- System theme detection  
- LocalStorage saving  
- Fully themed UI elements  

Dark mode affects:
- Cards  
- Text  
- Buttons  
- Background  
- Navbar  
- Shadows  

---

## 🚀 Deployment

This is a static site.  
Deploy anywhere:

### Recommended:
- Netlify  
- GitHub Pages  
- Vercel  
- Cloudflare Pages  

No backend or build tools required.

---

## 🧰 Updating Projects

1. Open:
   ```
   /data/projects.json
   ```
2. Add/edit project entries  
3. Save  
4. Refresh the site  

Instant update — no coding required.

---

## 🧑‍💻 About Me

**Name:** Kawser Miah  
**Role:** Mobile Application Developer  

**Skills:**  
- Flutter  
- Dart  
- Firebase  
- Kotlin  
- Ktor  
- MySQL  
- Git  
- Python  

I specialize in building scalable mobile apps with clean architecture and modern UI principles.

---

## 📬 Contact

📧 **Email:** kawsermiah.cse@gmail.com  
🌐 **Portfolio:** https://kawser-miah.github.io/kawser/  
🐙 **GitHub:** https://github.com/Kawser-Miah  
🔗 **LinkedIn:** https://www.linkedin.com/in/kawser-miah/ 

---

## 📜 License

This portfolio, including all design, code, layout, and content, is personal and may not be copied without permission.
