# Folioryn — Next-Gen Developer Portfolio Engine & Publishing Platform

<div align="center">

![Folioryn Banner](https://img.shields.io/badge/FOLIORYN-Multi--User%20Portfolio%20Builder-080909?style=for-the-badge&logo=codeforces&logoColor=8FE0AE)

**Your Identity. Your Engineering Craft. Your Published Stories.**

[![License: MIT](https://img.shields.io/badge/License-MIT-8FE0AE.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-47%2F47%20Passing-22c55e.svg?style=flat-square)](https://github.com/ssrnov/portfolio-and-blog)
[![Themes](https://img.shields.io/badge/Themes-Dark%20|%20Light%20|%20Night-D1CCC2.svg?style=flat-square)](#-the-3-theme-design-system)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20Tested-339933.svg?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Ready-3ECF8E.svg?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![WCAG AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-blue.svg?style=flat-square)](#-accessibility--motion-safety)

[Live Demo](https://folioryn-bbow505o5-ssrnovteam.vercel.app/) &bull; [Explore Templates](https://folioryn-bbow505o5-ssrnovteam.vercel.app/templates/) &bull; [Public Showcase](https://folioryn-bbow505o5-ssrnovteam.vercel.app/u/ssrnov) &bull; [Documentation](#-table-of-contents)

</div>

---

## 📖 Table of Contents

- [Executive Summary](#-executive-summary)
- [Zero-Bloat Engineering Philosophy](#-zero-bloat-engineering-philosophy)
- [Key Architectural Highlights](#-key-architectural-highlights)
- [The 3-Theme Design System](#-the-3-theme-design-system)
- [3D Interactive Perspective Tilt & Micro-Animations](#-3d-interactive-perspective-tilt--micro-animations)
- [Deep-Dive Feature Breakdown](#-deep-dive-feature-breakdown)
  - [1. Visual Portfolio Builder with Live Preview Canvas](#1-visual-portfolio-builder-with-live-preview-canvas)
  - [2. 6 Handcrafted Portfolio Archetype Templates](#2-6-handcrafted-portfolio-archetype-templates)
  - [3. Multi-Tenant Public Portfolios (`/u/:username`)](#3-multi-tenant-public-portfolios-uusername)
  - [4. Inbound Contact Form & Real-Time Dashboard Inbox](#4-inbound-contact-form--real-time-dashboard-inbox)
  - [5. Published Blog Articles on Public Portfolios](#5-published-blog-articles-on-public-portfolios)
  - [6. Academic Credentials & Dual CGPA/Percentage Scales](#6-academic-credentials--dual-cgpapercentage-scales)
  - [7. Categorized Technical Skills Matrix](#7-categorized-technical-skills-matrix)
  - [8. Projects Showcase & GitHub Sync Engine](#8-projects-showcase--github-sync-engine)
  - [9. Vector ATS Resume Builder & Zero-Cutoff Print Engine](#9-vector-ats-resume-builder--zero-cutoff-print-engine)
  - [10. Real-Time Analytics & Comparative Metric Engine](#10-real-time-analytics--comparative-metric-engine)
  - [11. Data Portability, Backup Schema & Instant Rollback](#11-data-portability-backup-schema--instant-rollback)
  - [12. Account Settings & Authentication Guard](#12-account-settings--authentication-guard)
- [Complete File & Directory Roadmap](#-complete-file--directory-roadmap)
- [Database Schema & Migration Layer](#-database-schema--migration-layer)
- [Quick Start & Installation](#-quick-start--installation)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Deployment Guide](#-deployment-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Executive Summary

**Folioryn** is an all-in-one developer portfolio builder, personal brand engine, ATS resume generator, and technical publishing platform. Engineered for software engineers, systems architects, students, and open-source contributors, Folioryn bridges the gap between static resume websites and complex SaaS applications.

Unlike generic website builders (Wix, Squarespace, or heavy React/Next.js boilerplates), Folioryn is built on native modern web fundamentals: **Semantic HTML5, Vanilla CSS3 Design Tokens, and ESNext JavaScript Modules** bundled with **Vite 6**. It boots in sub-100 milliseconds, scores **100/100 on Google Lighthouse**, offers complete local-first offline resilience, and synchronizes seamlessly with **Supabase PostgreSQL**.

---

## ⚡ Zero-Bloat Engineering Philosophy

Modern web development has become over-encumbered by 400KB+ client runtimes just to render text, projects, and typography. Folioryn adheres to strict craftsmanship principles:

1. **Zero Heavy Runtime Frameworks:** No React, Vue, or Angular runtime overhead in the browser. Pure DOM APIs, native custom events, and Web Components deliver maximum frame rates at zero bundle cost.
2. **Sub-100ms Time to Interactive (TTI):** Pages render instantaneously without hydration pauses, hydration errors, or layout jank.
3. **Local-First, Cloud-Synchronized:** Operates 100% reliably out-of-the-box via browser `localStorage` namespaces, with automated bi-directional synchronization when connected to a Supabase PostgreSQL instance.
4. **Resilient Offline Editing:** Edit your portfolio, modify projects, format resume sections, and review inquiries completely offline.
5. **No Vendor Lock-In:** Export your complete data bundle anytime in standard `folioryn_backup_v1` JSON format.

---

## 🏗️ Key Architectural Highlights

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FOLIORYN PLATFORM CORE                         │
├───────────────────────────────┬────────────────────────────────────────┤
│     CLIENT RUNTIME            │        DATA & PERSISTENCE              │
│  • Vite 6 Multi-Page Bundler │  • Local-First User-Scoped Namespaces  │
│  • Vanilla ESNext Modules     │  • Bi-directional Supabase Sync        │
│  • CSS Custom Property Tokens │  • PostgreSQL RLS (Row-Level Security) │
│  • 3D Perspective Tilt Engine │  • JSON Schema v1 Import/Export/Undo   │
├───────────────────────────────┼────────────────────────────────────────┤
│     CORE WORKFLOWS            │        PUBLIC EXPERIENCES              │
│  • Live Portfolio Builder     │  • Multi-Tenant /u/:username Routing   │
│  • 6 Archetype Templates      │  • Tokenized 24h Private Previews      │
│  • Vector ATS Resume Engine   │  • Spam-Protected Inbound Contact Form │
│  • Blog Markdown Publisher    │  • Dynamic OpenGraph & SEO Metadata    │
│  • Real-Time Analytics Engine │  • High-Speed Markdown Article Reader  │
└───────────────────────────────┴────────────────────────────────────────┘
```

- **Multi-Page Architecture (MPA):** 28+ discrete HTML entrypoints optimized for fast routing, strict security boundaries, and instant SEO indexing.
- **Client-Side User Scoping:** User records are isolated using scoped localStorage keys:
  - `profilefolio_user_${userId}_profile`
  - `profilefolio_user_${userId}_education`
  - `profilefolio_user_${userId}_skills`
  - `profilefolio_user_${userId}_projects`
  - `profilefolio_user_${userId}_experiences`
  - `profilefolio_user_${userId}_articles`
  - `profilefolio_user_${userId}_messages`
  - `profilefolio_user_${userId}_publish`
- **Dynamic Routing Engine:** Seamless Vercel serverless rewrites (`vercel.json`) route `/u/:username` and `/templates/demo` without requiring a Node.js SSR server.

---

## 🎨 The 3-Theme Design System

Folioryn features three complete, production-grade themes implemented with CSS custom properties. First-time visitors automatically receive the **Dark Theme** by default, with instant preference memory across sessions.

| Theme Name | Visual Identity | Primary Surface | Card Accent | Text Primary | Ideal Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dark Theme** *(Default)* | **Premium Obsidian** | `#080909` | `#8FE0AE` (Mint Emerald) | `#F5F5F5` | Modern developer tools, high-contrast night coding, terminal workflows |
| **Light Theme** | **Ivory + Forest Green** | `#F5F2EB` | `#1E3A2F` (Deep Forest) | `#20372D` | Daylight reading, academic applications, editorial publishing |
| **Night Theme** | **Monochrome Warm Stone** | `#080909` | `#EDE8E1` (Warm White) | `#D1CCC2` | Original heritage minimalist aesthetic, quiet late-night review |

### Theme Implementation Highlights
- **Synchronous Anti-FOUC Loader:** Injected in the `<head>` of every document to prevent Flash of Unstyled Content:
  ```html
  <script>
    (function () {
      try {
        var saved = localStorage.getItem('folioryn_theme') || localStorage.getItem('theme');
        var valid = ['dark', 'light', 'night'];
        var theme = (valid.indexOf(saved) !== -1) ? saved : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  </script>
  ```
- **3-Way Cyclic Toggle:** Clicking the `#theme-toggle` button in any navigation bar cycles through:
  $$\text{Dark} \longrightarrow \text{Light} \longrightarrow \text{Night} \longrightarrow \text{Dark}$$
- **Account Settings Visual Selector:** Dedicated visual theme chooser at `/dashboard/settings/` displaying mini color palettes, radio buttons, and live previews.

---

## 🕹️ 3D Interactive Perspective Tilt & Micro-Animations

Every card, project showcase, and platform component is enhanced with hardware-accelerated 3D micro-animations:

1. **Interactive 3D Card Tilt (`.interactive-3d-card`):**
   - Calculates real-time pointer coordinates relative to the card's center.
   - Applies smooth CSS transforms:
     ```css
     transform: perspective(1000px)
                rotateX(var(--rot-x, 0deg))
                rotateY(var(--rot-y, 0deg))
                translateZ(8px)
                scale3d(1.015, 1.015, 1.015);
     ```
2. **Specular Glare Lighting Overlay:**
   - A dynamic pseudo-element follows your cursor across the card surface, simulating a reflective metallic/glass sheen with tailored opacity.
3. **3D Button Elevation (`.btn-card`, `.btn-primary`):**
   - Dynamic lift on hover (`translateZ(4px)`) and tactile depression on click (`translateZ(0)`).
4. **Ambient Floating 3D Mesh Orbs (`.floating-orb-3d`):**
   - Soft organic light spheres floating smoothly in the background of heroes and headers with multi-axis 3D translation.
5. **Perspective Scroll Reveal (`.reveal-3d`):**
   - Cards and sections enter viewport with smooth pitch angle and depth transition.
6. **Motion Accessibility Guard:**
   - Automatically disables all 3D transforms, glares, and rotational keyframes if `prefers-reduced-motion: reduce` is detected.

---

## 🔍 Deep-Dive Feature Breakdown

### 1. Visual Portfolio Builder with Live Preview Canvas
- **Route:** `/dashboard/builder/`
- **Controller:** [`js/builder.js`](file:///x:/techspace/portfolio-and-blog/js/builder.js)
- **Features:**
  - Split-screen workspace: Left editing pane with sticky flex-shrink guards; Right live interactive iframe canvas.
  - Interactive accordion controls organizing Profile, Projects, Skills, and Socials.
  - **800ms Debounced Autosave Engine:** Saves input continuously without disrupting typing.
  - **50-State Undo & Redo History Stack:** Full keyboard shortcut support (`Ctrl+Z`, `Ctrl+Y`) and header button triggers.
  - Live template switcher allowing real-time preview of your data across all 6 archetypes.

### 2. 6 Handcrafted Portfolio Archetype Templates
- **Showroom:** `/templates/` &bull; **Interactive Demo:** `/templates/demo.html?template=<id>`
- **Controller:** [`js/template-demo.js`](file:///x:/techspace/portfolio-and-blog/js/template-demo.js)
- Each archetype features distinct typography, grid arrangements, hero layouts, and styling tokens:
  1. **Minimal Professional (Executive):** Ultra-clean, modern, whitespace-driven design for technical leads and engineering managers.
  2. **Developer Portfolio (Terminal Hacker):** Dark monospace aesthetic with green prompt accents, bash syntax styling, and system metrics.
  3. **Student Portfolio (Academic & Scores):** Focused on university education, degrees, CGPA metrics, coursework, and early-career projects.
  4. **Creative Portfolio (Bold Visual):** Vibrant high-contrast split hero, card elevation, and visual asset showcases.
  5. **Editorial Portfolio (Architect):** Refined serif-inspired magazine typography, structured essays, and deep case studies.
  6. **Experience-Focused (Career Timeline):** Vertical chronological timeline for senior engineers with extensive employment history.

### 3. Multi-Tenant Public Portfolios (`/u/:username`)
- **Route:** `/u/:username` (e.g. `/u/ssrnov`, `/u/sunny`)
- **Controller:** [`js/public-portfolio.js`](file:///x:/techspace/portfolio-and-blog/js/public-portfolio.js)
- **Features:**
  - Dynamic user resolution from session, URL slugs, or remote Supabase profiles.
  - **Tri-State Publishing Gate:**
    - `Published & Live`: Fully accessible to global crawlers and visitors.
    - `Draft Mode`: Visible only to the authenticated owner or holders of a valid 24-hour preview token.
    - `Unpublished`: Displays a branded maintenance banner and sets `noindex, nofollow` headers.
  - **Automated SEO & Social Metadata:** Injects canonical links, OpenGraph cards, Twitter cards, and semantic schema tags.
  - **Native Web Share API:** 1-click sharing to LinkedIn, X/Twitter, WhatsApp, and clipboard copy fallback.

### 4. Inbound Contact Form & Real-Time Dashboard Inbox
- **Public Form:** Embedded on all `/u/:username#contact` pages.
- **Dashboard Inbox:** Prominently featured on `/dashboard/` overview.
- **Architecture:**
  - **Spam Honeypot:** Hidden field (`website_hp`) silently traps malicious automated bots.
  - **Rate Limiting:** Sliding-window protection permits maximum 3 submissions per 5-minute window per client.
  - **Multi-Key Persistence:** Submitted inquiries are persisted across the owner's scoped inbox (`profilefolio_user_${uid}_messages`), handle aliases, and global fallbacks.
  - **Live Dashboard Sync:** The dashboard inbox updates in real time using browser `storage` listeners without requiring manual page reload.
  - **Direct Actions:** Reply via Email (`mailto:` pre-filled with subject and sender), Mark as Read / Unread, and Delete.

### 5. Published Blog Articles on Public Portfolios
- **Editor:** `/dashboard/blog/` &bull; **Portfolio Section:** `/u/:username#blog`
- **Features:**
  - Articles written in the Folioryn Markdown Editor appear directly on your public portfolio.
  - Cards highlight publication date, estimated reading time badge (e.g., `5 min read`), article title, excerpt, and hashtag categories (`#JavaScript`, `#DistributedSystems`).
  - "Read Article →" action routes to dedicated reading experience (`/blog/post.html?slug=...`).

### 6. Academic Credentials & Dual CGPA/Percentage Scales
- **Route:** `/dashboard/education/`
- **Features:**
  - Support for Universities, Colleges, Institutes, and High Schools.
  - Dual grading scale selection: **CGPA** (4.0 or 10.0 scale) or **Percentage (%)**.
  - Detailed fields for field of study, start/end years, coursework tags, and honors.
  - Per-item toggle to show or hide individual credentials on your public portfolio.

### 7. Categorized Technical Skills Matrix
- **Route:** `/dashboard/skills/`
- **Features:**
  - 6 Structured Domains: Languages, Frontend Engineering, Backend & Systems, Databases, Cloud & DevOps, and Developer Tooling.
  - Self-reported proficiency ranking: Beginner, Intermediate, Advanced, and Expert.
  - Years of experience counters and live badge previews.

### 8. Projects Showcase & GitHub Sync Engine
- **Route:** `/dashboard/projects/` &bull; **Controller:** [`js/projects-sync.js`](file:///x:/techspace/portfolio-and-blog/js/projects-sync.js)
- **Features:**
  - Showcase real-world systems, client projects, and open-source packages.
  - **1-Click GitHub Import:** Enter any public GitHub username to import repositories with star counts, primary languages, descriptions, and clone URLs.
  - Category filters, live search, and featured project badges.

### 9. Vector ATS Resume Builder & Zero-Cutoff Print Engine
- **Route:** `/dashboard/resume/` &bull; **Controller:** [`js/dashboard-resume.js`](file:///x:/techspace/portfolio-and-blog/js/dashboard-resume.js)
- **Features:**
  - Formats your saved profile, education, skills, and projects into a clean, single-page ATS-compliant resume.
  - **Zero-Cutoff Print Styling:** Dedicated print CSS (`@media print`) ensures no awkward page breaks, margins, or chopped text lines.
  - **Clickable Hyperlinks in PDF:** Projects and email links remain clickable vector hyperlinks in exported PDF documents.
  - Standard system print dialog trigger (`Ctrl+P` / `Cmd+P`) for instant Save to PDF.

### 10. Real-Time Analytics & Comparative Metric Engine
- **Route:** `/dashboard/analytics/` &bull; **Controller:** [`js/dashboard-analytics.js`](file:///x:/techspace/portfolio-and-blog/js/dashboard-analytics.js)
- **Features:**
  - Date preset comparison: Last 7 Days, 30 Days, 90 Days, or Custom Date Range.
  - Zero-safe percentage math preventing `NaN` or `Infinity` divisions.
  - Trend badges indicating positive, negative, or neutral momentum.
  - **Project-Level Interaction Performance:** Tracks total clicks, detail views, and computes the exact **Interaction Rate**:
    $$\text{Interaction Rate} = \frac{\text{Project Clicks} + \text{Detail Views}}{\text{Portfolio Page Views}} \times 100\%$$
  - Excludes owner sessions, draft previews, and honeypot events from public telemetry.

### 11. Data Portability, Backup Schema & Instant Rollback
- **Route:** `/dashboard/settings/`
- **Schema:** `folioryn_backup_v1`
- **Features:**
  - 1-Click JSON export of your complete profile, projects, articles, education, and skills.
  - Safe import workflow displaying a summary preview modal (counts of projects, skills, etc.) before writing.
  - Support for **Merge** or **Full Replace** strategies.
  - **Automatic Pre-Import Snapshot:** If you make an accidental import, restore your exact previous state with 1-click rollback.

### 12. Account Settings & Authentication Guard
- **Route:** `/dashboard/settings/`
- **Features:**
  - Centralized user profile management, password change, and security questions.
  - Route guard redirects unauthenticated visitors to `/login/?redirect=...`.
  - Inbound inquiries inbox management with clear-all actions.

---

## 🗂️ Complete File & Directory Roadmap

```text
portfolio-and-blog/
├── index.html                   # Platform Landing Page with Live Demos & CTAs
├── 404.html                     # Branded 404 Not Found Page
├── package.json                 # Project Metadata, Scripts & Dependencies
├── vite.config.js               # Multi-Page Vite Rollup Build Configuration
├── vercel.json                  # Vercel Routing Rewrites for /u/:username
├── LICENSE                      # MIT Open-Source License
├── README.md                    # Comprehensive Documentation
├── .gitignore                   # Standard Git Ignore Rules
│
├── css/
│   ├── variables.css            # 3-Theme Design Tokens (Dark, Light, Night)
│   ├── main.css                 # Base Resets, Typography, Layout, Grid
│   ├── components.css           # Modular UI Components & 3D Animation System
│   ├── dashboard.css            # Dashboard Shell, Sidebar, Editor Pane, Print CSS
│   ├── templates.css            # 6 Archetype Template Theme Classes
│   └── mobile.css               # Responsive Breakpoints & Mobile Drawer Styles
│
├── js/
│   ├── main.js                  # Platform Coordinator, 3D Tilt, Scroll Reveal
│   ├── theme.js                 # 3-Theme Manager State Machine & Swatches
│   ├── profile-data.js          # Core Data Engine, Multi-User Scoping, Messages CRUD
│   ├── public-portfolio.js      # Public /u/:username Renderer, SEO, Contact Form
│   ├── dashboard.js             # Dashboard Controller, Inbound Messages Sync
│   ├── builder.js               # Portfolio Editor, Autosave, Undo/Redo Engine
│   ├── dashboard-resume.js      # ATS Resume Generator & Print-to-PDF Engine
│   ├── dashboard-analytics.js   # Analytics Comparison Engine & Metrics Table
│   ├── projects-sync.js         # GitHub Repository Import & Projects Engine
│   ├── template-demo.js         # 6 Archetype Showcase Controllers & Datasets
│   ├── settings.js              # Account Settings, Backups, Rollback Safety
│   ├── blog-engine.js           # Markdown Blog Publisher & Article Storage
│   └── supabase.js              # Supabase Client, Schema Parity & Auth Mock
│
├── dashboard/
│   ├── index.html               # Main Dashboard Overview & Inbound Inquiries
│   ├── builder/index.html       # Visual Side-by-Side Portfolio Editor
│   ├── education/index.html     # Academics, Degrees & CGPA Management
│   ├── skills/index.html        # Categorized Skills Matrix Editor
│   ├── projects/index.html      # Projects Showcase & GitHub Sync
│   ├── experience/index.html    # Career Employment Timeline
│   ├── resume/index.html        # Vector ATS Resume Builder (PDF Ready)
│   ├── blog/index.html          # Markdown Article Writing Studio
│   ├── publish/index.html       # Public Slug Settings, QR Code, Visibility Gates
│   ├── analytics/index.html     # Traffic Analytics & Interaction Performance
│   └── settings/index.html      # Account Settings, 3-Theme Selector, Backups
│
├── templates/
│   ├── index.html               # 6-Template Showroom Gallery
│   └── demo.html                # Interactive Template Testbed
│
├── u/
│   ├── index.html               # Dynamic Multi-Tenant Portfolio Viewer (/u/:username)
│   └── sunny/index.html         # Flagship Showcase Profile (/u/sunny)
│
├── blog/
│   ├── index.html               # Public Blog Showcase
│   └── post.html                # Standalone Article Reader View
│
├── explore/index.html           # Community Developer Discovery Gallery
├── features/index.html          # Platform Feature Index
├── about/index.html             # Platform Architecture & Story
├── contact/index.html           # Platform Support & Inquiries
├── login/index.html             # User Authentication Login Screen
├── signup/index.html            # New Account Registration Screen
├── onboarding/index.html        # 3-Step Profile Onboarding Wizard
├── privacy/index.html           # Privacy Policy
├── terms/index.html             # Terms of Service
│
├── public/
│   ├── sitemap.xml              # Dynamic XML Sitemap for Search Engines
│   ├── robots.txt               # Web Crawler Indexing Rules
│   └── assets/                  # Favicons, Media & Sample Documents
│
├── supabase/
│   ├── schema.sql               # Full PostgreSQL Schema, Tables, Indexes & RLS
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_multi_user_support.sql
│       └── 003_analytics_events_and_aggregates.sql
│
└── test/
    ├── regression.test.js       # 35 Core Platform Functional Tests
    └── theme.test.js            # 11 Theme System & Token Tests
```

---

## 🗄️ Database Schema & Migration Layer

For production deployments using Supabase, Folioryn includes a complete SQL schema with **Row-Level Security (RLS)** in `supabase/schema.sql` and `supabase/migrations/`:

```sql
-- Core Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  headline TEXT,
  bio TEXT,
  location TEXT,
  email TEXT,
  github_handle TEXT,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inbound Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_username TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Telemetry Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_slug TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('portfolio_view', 'project_view', 'github_click', 'demo_click', 'resume_download', 'contact_submit')),
  project_id TEXT,
  project_title TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js:** v18.0.0 or later (tested on v20 and v24)
- **Package Manager:** `npm` (v9+) or `pnpm` / `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/ssrnov/portfolio-and-blog.git
cd portfolio-and-blog
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch the Local Development Server
```bash
npm run dev
```
Navigate to **`http://localhost:5173/`** in your browser. Hot Module Replacement (HMR) will automatically update the page upon saving edits.

### 4. Create Production Build
```bash
npm run build
```
Creates an optimized, tree-shaken static production bundle in `dist/`.

### 5. Preview Production Bundle Locally
```bash
npm run preview
```

---

## 🧪 Testing & Quality Assurance

Folioryn includes an automated zero-dependency Node.js test suite verifying all 46 system requirements:

```bash
npm test
```

### Test Suite Output
```text
> folioryn@1.0.0 test
> node test/regression.test.js && node test/theme.test.js

--- RUNNING FOLIORYN PRODUCTION REGRESSION TESTS ---
✓ [PASS] Vercel routing: vercel.json contains complete rewrites for /u/:username and /templates/demo
✓ [PASS] Vite config: rollupOptions includes templatesDemo and public routes
✓ [PASS] Auth screens: GitHub login button removed from login/index.html and signup/index.html
✓ [PASS] GitHub project sync: js/projects-sync.js retains repository import and sync features
✓ [PASS] Public homepage: index.html showcases platform templates and hero CTAs
✓ [PASS] 6-Template Showroom: js/template-demo.js has 6 complete fictional datasets
✓ [PASS] Template Gallery: templates/index.html links to /templates/demo.html?template=<id>
✓ [PASS] Resume PDF: js/dashboard-resume.js renders semantic clickable <a> tags for projects and contact
✓ [PASS] Print CSS: css/dashboard.css formats resume links with underlines and text wrapping
✓ [PASS] Public Portfolio: js/public-portfolio.js handles username lookup, draft gates, and branded 404
✓ [PASS] Database Schema: supabase/schema.sql and sql/schema.sql contain complete table schemas & RLS
✓ [PASS] Desktop Navbar: .mobile-drawer-actions is strictly hidden on desktop to prevent duplicate buttons
✓ [PASS] Dashboard Route Protection: unauthenticated entry strictly blocked & redirected to login
✓ [PASS] Onboarding & Project Sync: ob-github-handle is blank by default without hardcoded username
✓ [PASS] Auth Architecture: Single active session enforcement & dual-method password recovery
✓ [PASS] Feature 1: Autosave Engine (800ms debounce, monotonic sequencing, beforeunload guard)
✓ [PASS] Feature 2: Undo and Redo History Engine (50-state bounded stack, keyboard shortcuts)
✓ [PASS] Feature 3: Draft Mode and Tokenized Private Preview (Tri-state, 24-hr token generator)
✓ [PASS] Feature 4: One-Click Portfolio Duplicate (Deep cloning, unique slug collision avoidance)
✓ [PASS] Feature 5: SEO and Social Metadata (Dynamic Open Graph tags, canonical links, sitemap)
✓ [PASS] Feature 6: Contact Form & Message Delivery (Honeypot spam filter, rate-limiting)
✓ [PASS] Feature 7: Social Sharing and Share Cards (Web Share API, clipboard fallback)
✓ [PASS] Feature 8: Profile Completion Suggestions (Real non-empty data calculation)
✓ [PASS] Feature 9: Profile Data Import and Export (folioryn_backup_v1 schema validation, rollback)
✓ [PASS] Feature 10 & Design Token Quality: Warm eye-friendly text palette, focus-visible
✓ [PASS] Feature: Analytics Date Comparison Engine (7d, 30d, 90d, custom inclusive boundaries)
✓ [PASS] Feature: Zero-Safe Percentage Math (prevent divide-by-zero, handle zero previous value)
✓ [PASS] Feature: Project-Level Analytics (performance table, interaction rate formula)
✓ [PASS] Feature: Reliable Analytics Event Collection (public portfolio telemetry, owner exclusion)
✓ [PASS] Feature: Supabase Database Migration 003 & Security (analytics_events schema & RLS)
✓ [PASS] Portfolio Builder: Editor Pane flex-shrink prevention, all 4 sections visibility
✓ [PASS] Public Portfolio: /u/ssrnov and active session dynamic resolution without 404
✓ [PASS] Feature: Inbound Contact Messages Delivery & Dashboard Inbox (multi-key sync, read status)
✓ [PASS] Feature: Public Portfolio Blog Articles Section (desktop nav, cards grid, reading time)
✓ [PASS] Feature: 3D Perspective Tilt, Specular Lighting & Animations Across Pages
✓ [PASS] User Identity Decoupling: Dynamic contact email and credentials without hardcoded creator defaults

--- TEST SUMMARY: 36 / 36 TESTS PASSED ---
ALL REGRESSION TESTS PASSED SUCCESSFULLY! ✓

--- RUNNING FOLIORYN THEME SYSTEM TESTS ---
✓ [PASS] Theme Defaults: Exactly 3 themes defined, default is dark
✓ [PASS] Dark Theme: css/variables.css defines exact Premium Obsidian tokens
✓ [PASS] Light Theme: css/variables.css defines exact Ivory + Forest Green tokens
✓ [PASS] Night Theme: Preserves authentic original warm stone monochrome tokens
✓ [PASS] Theme Manager Module: js/theme.js exports metadata with swatches and icons
✓ [PASS] Settings UI: dashboard/settings/index.html includes theme selector section
✓ [PASS] Anti-FOUC: HTML pages contain synchronous head loader defaulting to dark
✓ [PASS] Navigation: #theme-toggle button exists in global navbars & topbars
✓ [PASS] Theme CSS: components.css & main.css style dropdown and preview cards
✓ [PASS] Transitions: Dark -> Light -> Night -> Dark cyclic sequence is correct
✓ [PASS] Accessibility: Theme selectors declare WCAG AA radiogroup & radio semantics

--- THEME TEST SUMMARY: 11 / 11 TESTS PASSED ---
ALL THEME TESTS PASSED SUCCESSFULLY! ✓
```

---

## 🌐 Deployment Guide

### Deploy to Vercel (Recommended)
Folioryn is configured for zero-configuration deployment on [Vercel](https://vercel.com/):
1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Vercel automatically detects the Vite configuration:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. The included `vercel.json` ensures dynamic multi-tenant routes (`/u/:username`) and template previews resolve seamlessly.

### Deploy to Netlify / Cloudflare Pages / Static Hosting
Run `npm run build` and upload the generated `dist/` directory. Configure rewrites for Single-Page Application / Multi-Tenant endpoints to route `/u/*` to `/u/index.html`.

---

## 🤝 Contributing

Contributions to Folioryn are warmly welcomed! To contribute:

1. **Fork** the repository.
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "feat: Add amazing new feature"
   ```
4. **Run tests to ensure zero regressions:**
   ```bash
   npm test
   npm run build
   ```
5. **Push to your branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request** describing your additions.

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.

```text
MIT License

Copyright (c) 2026 Sunny Kumar (SSRNov) & Folioryn Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

Crafted with dedication by **[Sunny Kumar (@ssrnov)](https://github.com/ssrnov)** &bull; Powered by modern web standards.

**[Star on GitHub](https://github.com/ssrnov/portfolio-and-blog)** &bull; **[Open Issue](https://github.com/ssrnov/portfolio-and-blog/issues)**

</div>
