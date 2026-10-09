import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
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
        templates: resolve(__dirname, 'templates/index.html'),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
        dashboardBuilder: resolve(__dirname, 'dashboard/builder/index.html'),
        dashboardProjects: resolve(__dirname, 'dashboard/projects/index.html'),
        dashboardResume: resolve(__dirname, 'dashboard/resume/index.html'),
        dashboardSettings: resolve(__dirname, 'dashboard/settings/index.html'),
        dashboardBlog: resolve(__dirname, 'dashboard/blog/index.html'),
        publicPortfolio: resolve(__dirname, 'u/sunny/index.html'),
        multiTenantPortfolio: resolve(__dirname, 'u/index.html'),
      },
    },
  },
});
