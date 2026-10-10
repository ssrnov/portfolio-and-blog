import { resolve } from 'path';
import { defineConfig } from 'vite';

function foliorynRouterPlugin() {
  return {
    name: 'folioryn-router-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';

          // 1. Rewrite /u/:slug (except /u/sunny and assets) to /u/index.html?u=:slug
          if (pathname.startsWith('/u/') && pathname !== '/u/sunny' && !pathname.includes('.')) {
            const slug = pathname.replace('/u/', '');
            if (slug && slug !== 'index.html') {
              req.url = `/u/index.html?u=${encodeURIComponent(slug)}` + (urlObj.search ? '&' + urlObj.search.slice(1) : '');
              return next();
            }
          }

          // 2. Rewrite root routes without trailing slashes
          const routes = ['about', 'projects', 'blog', 'contact', 'login', 'signup', 'onboarding', 'templates', 'dashboard', 'features', 'explore', 'privacy', 'terms'];
          const matched = routes.find(r => pathname === `/${r}`);
          if (matched) {
            req.url = `/${matched}/index.html` + urlObj.search;
            return next();
          }

          if (pathname === '/templates/demo') {
            req.url = '/templates/demo.html' + urlObj.search;
            return next();
          }

          // 3. Rewrite dashboard subroutes without trailing slashes
          if (pathname.startsWith('/dashboard/')) {
            const sub = pathname.replace('/dashboard/', '');
            const subs = ['builder', 'projects', 'resume', 'settings', 'blog', 'education', 'skills', 'experience', 'publish', 'analytics'];
            if (subs.includes(sub)) {
              req.url = `/dashboard/${sub}/index.html` + urlObj.search;
              return next();
            }
          }
        } catch {
          // Pass-through on malformed URL
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [foliorynRouterPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about/index.html'),
        projects: resolve(__dirname, 'projects/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogArticle: resolve(__dirname, 'blog/sample-article/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        notFound: resolve(__dirname, '404.html'),
        login: resolve(__dirname, 'login/index.html'),
        signup: resolve(__dirname, 'signup/index.html'),
        onboarding: resolve(__dirname, 'onboarding/index.html'),
        templates: resolve(__dirname, 'templates/index.html'),
        templatesDemo: resolve(__dirname, 'templates/demo.html'),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
        dashboardBuilder: resolve(__dirname, 'dashboard/builder/index.html'),
        dashboardProjects: resolve(__dirname, 'dashboard/projects/index.html'),
        dashboardResume: resolve(__dirname, 'dashboard/resume/index.html'),
        dashboardSettings: resolve(__dirname, 'dashboard/settings/index.html'),
        dashboardBlog: resolve(__dirname, 'dashboard/blog/index.html'),
        publicPortfolio: resolve(__dirname, 'u/sunny/index.html'),
        multiTenantPortfolio: resolve(__dirname, 'u/index.html'),
        features: resolve(__dirname, 'features/index.html'),
        explore: resolve(__dirname, 'explore/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        dashboardEducation: resolve(__dirname, 'dashboard/education/index.html'),
        dashboardSkills: resolve(__dirname, 'dashboard/skills/index.html'),
        dashboardExperience: resolve(__dirname, 'dashboard/experience/index.html'),
        dashboardPublish: resolve(__dirname, 'dashboard/publish/index.html'),
        dashboardAnalytics: resolve(__dirname, 'dashboard/analytics/index.html'),
      },
    },
  },
});
