# SSRNovX — Personal Portfolio & Blog

Personal developer portfolio and engineering blog for **SSRNovX**, built as part of **TechSpace BuildLab B04**.

## Tech Stack
- **Core:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Tooling & Bundler:** [Vite](https://vitejs.dev/)
- **Styling:** Custom CSS Design System with CSS Custom Properties (Predominantly black-and-white monochrome aesthetic, dark/light theme support)
- **Deployment Target:** [Vercel](https://vercel.com/)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended, tested on Node v24)
- npm (v9 or higher)

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/ssrnov/portfolio-and-blog.git
cd portfolio-and-blog
npm install
```

### Local Development
To start the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser at the local server URL displayed in your terminal (typically `http://localhost:5173`).

### Production Build
To create an optimized production build in the `dist/` directory:
```bash
npm run build
```

### Local Production Preview
To preview the generated production build locally:
```bash
npm run preview
```

---

## Project Structure

```text
portfolio-and-blog/
├── css/
│   ├── main.css            # Base styles, reset, layout, and homepage styles
│   └── variables.css       # Design tokens, typography, dark/light theme variables
├── js/
│   └── main.js             # JavaScript entry point (theme switcher, mobile navigation)
├── index.html              # Main HTML5 entry document with SEO metadata
├── package.json            # Project manifest with Vite scripts & devDependencies
├── vercel.json             # Vercel deployment configuration
├── .gitignore              # Ignored files (node_modules, dist, environment secrets)
└── README.md               # Project documentation and guide
```

---

## Phase Roadmap
- **Phase 1: Project Foundation** *(Current)* — Vite setup, semantic HTML5 shell, monochrome design system, theme switcher.
- **Phase 2: About, Education & Skills** — Background narrative, credentials timeline, interactive skills matrix.
- **Phase 3: Projects Gallery & Resume** — Dynamic project showcase with tag filtering and downloadable CV.
- **Phase 4: Engineering Blog** — JSON-powered article feed with search and topic tags.
- **Phase 5: Contact & Integrations** — Accessible contact form with service dispatch and social links.
- **Phase 6: Polish & Deployment** — Custom 404 page, performance optimization, and Vercel release.
