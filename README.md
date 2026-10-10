# Folioryn — Multi-User Portfolio Builder & Publishing Platform

**Your Identity. Your Portfolio. Your Story.**

Folioryn is a modern, high-performance multi-user portfolio builder and personal publishing platform designed for students, developers, designers, freelancers, and professionals.

## Core Platform Overview & Architecture
- **Framework & Bundler:** Vite 6 Multi-Page Application (MPA)
- **Frontend Stack:** Semantic HTML5, Vanilla CSS3 Design System (`#080909`), Vanilla JavaScript (ES Modules)
- **Multi-User Architecture:** User-scoped namespaces (`profilefolio_user_{userId}_*`) with client-side session management and Supabase data access layer parity.
- **Design Aesthetic:** Focused monochromatic developer-tool design system (`#080909`, `#101111`, `#141515`, `#EDE8E1` warm white, `#A8A39D`, `#292A2A`).
- **Deployment Platform:** [Vercel](https://vercel.com/) (configured with multi-page entry points via `vercel.json`)

---

## Features Implemented

1. **Responsive Navigation & Hero Section:**
   - Sticky glassmorphism header with active scroll-spy navigation.
   - Accessible mobile drawer menu with keyboard navigation (ESC key support, focus trap).
   - High-impact hero section with introductory biography, social channel links, and quick CTAs.
2. **About Me & Academic Timeline:**
   - Detailed background narrative, core engineering philosophy, and quick-facts overview.
   - Academic education timeline highlighting B.Tech in CSE at SRM University (2023–2027) with coursework.
3. **Categorized Skills Matrix:**
   - Four distinct skill domains: Frontend Engineering, Backend & Systems, DevOps & Workflow, and Core Engineering.
4. **Projects Showcase with Live Search & Filtering:**
   - Data-driven project cards populated from `public/data/projects.json`.
   - Real-time search query filtering across titles, descriptions, and technology tags.
   - Category filtering pills (`All`, `Web`, `Backend`, `Tools`, `Security`).
   - GitHub source links and live demo buttons with graceful empty-state handling.
5. **Resume / CV Download:**
   - Integrated downloadable PDF document located at `public/assets/resume/SSRNovX_Resume.pdf`.
   - Prominent download triggers in the hero header, about section, and projects banner.
6. **JSON-Powered Engineering Blog & Modal Article Reader:**
   - Structured articles defined in `public/data/blog.json`.
   - Real-time search by keyword and topic filter pills (`Frontend`, `Backend`, `Architecture`, `Engineering`).
   - Accessible full-screen article reader modal with deep-linking support (`#blog/<slug>`), keyboard ESC dismiss, and backdrop dismissal.
7. **Interactive Contact Form with Validation & Integration Options:**
   - Client-side validation for Name (min 2 chars), Email (regex pattern), Subject, and Message (min 10 chars).
   - Real-time inline feedback alerts and accessible status banners.
   - Configurable service integration in `js/contact.js`:
     - **Simulation Mode (Default):** Ready for out-of-the-box local testing and organizer evaluation without requiring third-party API keys.
     - **Formspree:** Set `provider: 'formspree'` and provide your endpoint URL.
     - **EmailJS:** Set `provider: 'emailjs'` and provide your Service ID, Template ID, and Public Key.
8. **Accessibility & SEO Standards:**
   - Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
   - Skip to main content link for keyboard users.
   - Comprehensive OpenGraph and Twitter card metadata.
9. **Branded 404 Error Page:**
   - Custom `404.html` maintaining the site's dark/light design system with quick links back to homepage sections.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended, tested on Node v24)
- npm (v9 or higher)

### Installation
```bash
git clone https://github.com/ssrnov/portfolio-and-blog.git
cd portfolio-and-blog
npm install
```

### Local Development Server
Starts the Vite dev server with Hot Module Replacement (HMR) at `http://localhost:5173`:
```bash
npm run dev
```

### Production Build
Creates an optimized production bundle inside the `dist/` directory:
```bash
npm run build
```

### Production Preview
Locally serves the production build:
```bash
npm run preview
```

---

## Directory Structure

```text
portfolio-and-blog/
├── index.html              # Main application entry document with SEO metadata
├── 404.html                # Branded custom 404 error page
├── vite.config.js          # Multi-page Vite configuration (index + 404)
├── package.json            # Scripts and dependencies
├── vercel.json             # Vercel deployment routing configuration
├── .gitignore              # Ignored files (dist, node_modules, secrets)
├── README.md               # Repository documentation
├── css/
│   ├── variables.css       # Design tokens, typography, dark/light theme variables
│   ├── main.css            # Reset, layout standards, header, footer, animations
│   └── components.css     # Modular component styles (Hero, About, Skills, Projects, Blog, Contact, Modal)
├── js/
│   ├── main.js             # Main coordinator (theme, mobile menu, scroll spy, initializers)
│   ├── data.js             # Projects & blog data service with resilient fallbacks
│   ├── projects.js         # Projects search, category filters, and card rendering
│   ├── blog.js             # Blog engine, tag filters, search, and article reader modal
│   └── contact.js          # Contact form validation and service dispatch handler
└── public/
    ├── data/
    │   ├── projects.json   # Structured portfolio projects dataset
    │   └── blog.json       # Structured technical articles dataset
    └── assets/
        └── resume/
            └── SSRNovX_Resume.pdf # Valid downloadable resume document
```
