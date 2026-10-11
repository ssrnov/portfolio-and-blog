/**
 * Folioryn — Production Regression Test Suite
 * Validates all 9 core requirements:
 * 1. Vercel routing & /u/:username direct navigation rewrites
 * 2. GitHub login removal & GitHub repository sync preservation
 * 3. Public homepage marketing presentation & template showcase
 * 4. 6-template gallery & isolated interactive demos
 * 5. Resume PDF generator clickable project repository & demo links
 * 6. Public portfolio slug lookup, 404 states, and draft visibility gates
 * 7. Supabase database schema, RLS policies, and storage documentation
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

const ROOT = path.resolve('.');

console.log('--- RUNNING FOLIORYN PRODUCTION REGRESSION TESTS ---');
let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL] ${name}:`, err.message);
  }
}

// --------------------------------------------------------------------------
// TEST 1: Vercel Routing Configuration
// --------------------------------------------------------------------------
test('Vercel routing: vercel.json contains complete rewrites for /u/:username and /templates/demo', () => {
  const vercelPath = path.join(ROOT, 'vercel.json');
  assert.ok(fs.existsSync(vercelPath), 'vercel.json must exist');
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

  assert.ok(Array.isArray(vercel.rewrites), 'rewrites array must exist');
  
  const sources = vercel.rewrites.map(r => r.source);
  assert.ok(sources.includes('/templates/demo') || sources.includes('/templates/demo/'), 'Must rewrite /templates/demo');
  assert.ok(sources.includes('/u/:username'), 'Must rewrite /u/:username');
  assert.ok(sources.includes('/u/:username/'), 'Must rewrite /u/:username/');
  assert.ok(sources.includes('/u/:username/resume'), 'Must rewrite /u/:username/resume');

  const uRewrite = vercel.rewrites.find(r => r.source === '/u/:username');
  assert.strictEqual(uRewrite.destination, '/u/index.html', 'Destination must be /u/index.html');
});

// --------------------------------------------------------------------------
// TEST 2: Vite Configuration Rollup Inputs
// --------------------------------------------------------------------------
test('Vite config: rollupOptions includes templatesDemo and public routes', () => {
  const viteConfigPath = path.join(ROOT, 'vite.config.js');
  const content = fs.readFileSync(viteConfigPath, 'utf8');
  assert.ok(content.includes('templatesDemo:'), 'Must include templatesDemo input');
  assert.ok(content.includes('templates/demo.html'), 'Must point to templates/demo.html');
  assert.ok(content.includes('multiTenantPortfolio:'), 'Must include multiTenantPortfolio input');
});

// --------------------------------------------------------------------------
// TEST 3: Auth Cleanup (No GitHub OAuth login, email/password preserved)
// --------------------------------------------------------------------------
test('Auth screens: GitHub login button removed from login/index.html and signup/index.html', () => {
  const loginHtml = fs.readFileSync(path.join(ROOT, 'login/index.html'), 'utf8');
  assert.ok(!loginHtml.includes('id="github-oauth-btn"'), 'GitHub OAuth button must be removed from login');
  assert.ok(!loginHtml.includes('Continue with GitHub'), 'GitHub login text must be removed from login');
  assert.ok(loginHtml.includes('type="email"'), 'Email input must remain in login');
  assert.ok(loginHtml.includes('type="password"'), 'Password input must remain in login');

  const signupHtml = fs.readFileSync(path.join(ROOT, 'signup/index.html'), 'utf8');
  assert.ok(!signupHtml.includes('Continue with GitHub'), 'GitHub login text must not be in signup');
  assert.ok(signupHtml.includes('Create Your Account'), 'Signup form must remain functional');
});

// --------------------------------------------------------------------------
// TEST 4: GitHub Project Import/Sync Preserved
// --------------------------------------------------------------------------
test('GitHub project sync: js/projects-sync.js retains repository import and sync features', () => {
  const syncJs = fs.readFileSync(path.join(ROOT, 'js/projects-sync.js'), 'utf8');
  assert.ok(syncJs.includes('loadGitHubRepositories'), 'loadGitHubRepositories must be preserved');
  assert.ok(syncJs.includes('extractGitHubUsername'), 'extractGitHubUsername must be preserved');
  assert.ok(syncJs.includes('api.github.com/users/'), 'GitHub API integration must remain intact');
});

// --------------------------------------------------------------------------
// TEST 5: Public Homepage Showcases Templates, Not Hardcoded Demo User
// --------------------------------------------------------------------------
test('Public homepage: index.html showcases platform templates and hero CTAs', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('YOUR IDENTITY. YOUR PORTFOLIO. YOUR STORY.'), 'Hero must display platform headline');
  assert.ok(indexHtml.includes('Build Your Portfolio'), 'Primary CTA must be Build Your Portfolio');
  assert.ok(indexHtml.includes('Explore Templates'), 'Secondary CTA must be Explore Templates');
  assert.ok(!indexHtml.includes('Sunny &bull; @sunny'), 'Hero must not hardcode Sunny as main user');
  assert.ok(indexHtml.includes('6 Distinct Design Archetypes'), 'Hero composition must showcase templates');
});

// --------------------------------------------------------------------------
// TEST 6: 6-Template Showroom & Isolated Working Demos
// --------------------------------------------------------------------------
test('6-Template Showroom: js/template-demo.js has 6 complete fictional datasets', () => {
  const demoJs = fs.readFileSync(path.join(ROOT, 'js/template-demo.js'), 'utf8');
  
  const expectedTemplates = [
    'minimal-professional',
    'developer-portfolio',
    'student-portfolio',
    'creative-portfolio',
    'editorial-portfolio',
    'experience-focused'
  ];

  expectedTemplates.forEach(t => {
    assert.ok(demoJs.includes(`'${t}':`), `Template dataset for ${t} must exist`);
  });

  assert.ok(demoJs.includes('Sunny Singh'), 'Flagship Minimal Professional persona (Sunny Singh) must be present');
  assert.ok(demoJs.includes('Aditya Sharma'), 'Developer persona (Aditya Sharma) must be present');
  assert.ok(demoJs.includes('Vineet Verma'), 'Student persona (Vineet Verma) must be present');
  assert.ok(demoJs.includes('Aayush Kashyap'), 'Creative persona (Aayush Kashyap) must be present');
  assert.ok(demoJs.includes('Kabir Mehra'), 'Editorial persona (Kabir Mehra) must be present');
  assert.ok(demoJs.includes('Ritu Sen'), 'Experience persona (Ritu Sen) must be present');
  assert.ok(demoJs.includes('handleUseTemplate'), 'Must include handleUseTemplate handler');
});

// --------------------------------------------------------------------------
// TEST 7: Template Gallery Card Links
// --------------------------------------------------------------------------
test('Template Gallery: templates/index.html links to /templates/demo.html?template=<id>', () => {
  const galleryHtml = fs.readFileSync(path.join(ROOT, 'templates/index.html'), 'utf8');
  assert.ok(galleryHtml.includes('/templates/demo.html?template=minimal-professional'), 'Minimal demo link');
  assert.ok(galleryHtml.includes('/templates/demo.html?template=developer-portfolio'), 'Developer demo link');
  assert.ok(galleryHtml.includes('/templates/demo.html?template=student-portfolio'), 'Student demo link');
  assert.ok(galleryHtml.includes('/templates/demo.html?template=creative-portfolio'), 'Creative demo link');
  assert.ok(galleryHtml.includes('/templates/demo.html?template=editorial-portfolio'), 'Editorial demo link');
  assert.ok(galleryHtml.includes('/templates/demo.html?template=experience-focused'), 'Experience demo link');
  assert.ok(!galleryHtml.includes('/u/sunny?template='), 'Must not point demo previews to /u/sunny');
});

// --------------------------------------------------------------------------
// TEST 8: Resume PDF Generator Clickable Project URLs
// --------------------------------------------------------------------------
test('Resume PDF: js/dashboard-resume.js renders semantic clickable <a> tags for projects and contact', () => {
  const resumeJs = fs.readFileSync(path.join(ROOT, 'js/dashboard-resume.js'), 'utf8');
  assert.ok(resumeJs.includes('<a href="${escapeHtml(repoUrl'), 'Must render clickable repo <a> tag');
  assert.ok(resumeJs.includes('<a href="${escapeHtml(liveUrl'), 'Must render clickable live demo <a> tag');
  assert.ok(resumeJs.includes('Repository:'), 'Must label Repository URL');
  assert.ok(resumeJs.includes('Live Demo:'), 'Must label Live Demo URL');
  assert.ok(resumeJs.includes('mailto:'), 'Must render mailto: anchor for email');
  assert.ok(resumeJs.includes('tel:'), 'Must render tel: anchor for phone');
  assert.ok(resumeJs.includes('overflow-wrap: anywhere;'), 'Must prevent long URLs from clipping');
});

// --------------------------------------------------------------------------
// TEST 9: Print Stylesheet Links Underlined and Wrapped & Docks Strictly Suppressed
// --------------------------------------------------------------------------
test('Print CSS: css/dashboard.css formats resume links with underlines and text wrapping', () => {
  const dashboardCss = fs.readFileSync(path.join(ROOT, 'css/dashboard.css'), 'utf8');
  const mobileCss = fs.readFileSync(path.join(ROOT, 'css/mobile.css'), 'utf8');
  const resumeJs = fs.readFileSync(path.join(ROOT, 'js/dashboard-resume.js'), 'utf8');

  assert.ok(dashboardCss.includes('.a4-preview-canvas a'), 'Must style .a4-preview-canvas a');
  assert.ok(dashboardCss.includes('text-decoration: underline !important;'), 'Must underline links on print');
  assert.ok(dashboardCss.includes('overflow-wrap: anywhere !important;'), 'Must wrap links on print');

  // Verify suppression of mobile bottom navigation dock in print styles
  assert.ok(dashboardCss.includes('.mobile-bottom-nav'), 'dashboard.css must hide .mobile-bottom-nav in print styles');
  assert.ok(mobileCss.includes('.mobile-bottom-nav'), 'mobile.css must hide .mobile-bottom-nav in @media print');
  assert.ok(resumeJs.includes('triggerCleanPdfPrint'), 'dashboard-resume.js must implement clean PDF print trigger');
  assert.ok(resumeJs.includes("bottomNav.style.setProperty('display', 'none'"), 'dashboard-resume.js must hide mobile bottom dock before print');
});


// --------------------------------------------------------------------------
// TEST 10: Public Portfolio Slug Lookup and Gating
// --------------------------------------------------------------------------
test('Public Portfolio: js/public-portfolio.js handles username lookup, draft gates, and branded 404', () => {
  const pubJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  assert.ok(pubJs.includes('extractUsernameSlug'), 'Must contain slug extractor');
  assert.ok(pubJs.includes('renderNotFoundState'), 'Must contain branded 404 handler');
  assert.ok(pubJs.includes('renderPrivatePortfolioState'), 'Must contain private draft gate handler');
  assert.ok(pubJs.includes('isCurrentSessionOwner'), 'Must verify owner session for unpublished drafts');
});

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// TEST 11: Database Schema & RLS Policies
// --------------------------------------------------------------------------
test('Database Schema: supabase/schema.sql and sql/schema.sql contain complete table schemas & RLS', () => {
  const schemaPath = path.join(ROOT, 'supabase/schema.sql');
  assert.ok(fs.existsSync(schemaPath), 'supabase/schema.sql must exist');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  
  const tables = ['profiles', 'portfolios', 'projects', 'experiences', 'education', 'skills', 'blog_posts'];
  tables.forEach(table => {
    assert.ok(sql.includes(`CREATE TABLE IF NOT EXISTS public.${table}`), `Table ${table} must be defined`);
  });

  assert.ok(sql.includes('ENABLE ROW LEVEL SECURITY;'), 'RLS must be enabled');
  assert.ok(sql.includes('storage.buckets'), 'Storage bucket configuration must exist');
});

// --------------------------------------------------------------------------
// TEST 12: Desktop Navbar Actions Isolation (No Duplicate Buttons)
// --------------------------------------------------------------------------
test('Desktop Navbar: .mobile-drawer-actions is strictly hidden on desktop to prevent duplicate buttons', () => {
  const mobileCss = fs.readFileSync(path.join(ROOT, 'css/mobile.css'), 'utf8');
  const mainCss = fs.readFileSync(path.join(ROOT, 'css/main.css'), 'utf8');

  // Verify desktop section hides .mobile-drawer-actions
  const mobileDesktopPart = mobileCss.split('@media')[0];
  assert.ok(
    mobileDesktopPart.includes('.mobile-drawer-actions') && mobileDesktopPart.includes('display: none !important'),
    'css/mobile.css must enforce display: none !important on .mobile-drawer-actions in desktop scope'
  );

  assert.ok(
    mainCss.includes('.mobile-drawer-actions') && mainCss.includes('display: none !important'),
    'css/main.css must enforce display: none !important on .mobile-drawer-actions in desktop scope'
  );
});

// --------------------------------------------------------------------------
// TEST 13: Dashboard Route Protection — Strict Login Requirement (No Entry Without Auth)
// --------------------------------------------------------------------------
test('Dashboard Route Protection: unauthenticated entry strictly blocked & redirected to login', () => {
  const mainJs = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');
  const dashboardJs = fs.readFileSync(path.join(ROOT, 'js/dashboard.js'), 'utf8');
  const authJs = fs.readFileSync(path.join(ROOT, 'js/auth.js'), 'utf8');

  // 1. Verify checkDashboardAuth in js/main.js redirects to login
  assert.ok(mainJs.includes('checkDashboardAuth'), 'checkDashboardAuth must be defined');
  assert.ok(mainJs.includes("window.location.replace(`/login/?redirect="), 'checkDashboardAuth must redirect unauthenticated users to login');
  assert.ok(!mainJs.includes("usr_mock_sunny_9921"), 'checkDashboardAuth must NOT auto-bootstrap mock sunny session when unauthenticated');

  // 2. Verify dashboard overview controller guards entry
  assert.ok(dashboardJs.includes('if (!activeUser)'), 'dashboard.js must guard against unauthenticated users');
  assert.ok(dashboardJs.includes("window.location.replace(`/login/?redirect="), 'dashboard.js must redirect unauthenticated users');

  // 3. Verify auth controller handles auth=required notice
  assert.ok(authJs.includes("auth === 'required'") || authJs.includes("urlParams.get('auth') === 'required'"), 'auth.js must display notice for required auth');

  // 4. Verify all 11 dashboard pages have synchronous head auth guard
  const dashboardPages = [
    'dashboard/index.html',
    'dashboard/analytics/index.html',
    'dashboard/blog/index.html',
    'dashboard/builder/index.html',
    'dashboard/education/index.html',
    'dashboard/experience/index.html',
    'dashboard/projects/index.html',
    'dashboard/publish/index.html',
    'dashboard/resume/index.html',
    'dashboard/settings/index.html',
    'dashboard/skills/index.html'
  ];

  dashboardPages.forEach(page => {
    const pagePath = path.join(ROOT, page);
    assert.ok(fs.existsSync(pagePath), `${page} must exist`);
    const html = fs.readFileSync(pagePath, 'utf8');
    assert.ok(
      html.includes("window.location.replace('/login/?redirect="),
      `${page} must include synchronous head auth guard redirecting to login`
    );
  });
});

// --------------------------------------------------------------------------
// TEST 14: Onboarding & Project Sync Isolation (No Hardcoded Usernames)
// --------------------------------------------------------------------------
test('Onboarding & Project Sync: ob-github-handle is blank by default without hardcoded username', () => {
  const obHtml = fs.readFileSync(path.join(ROOT, 'onboarding/index.html'), 'utf8');
  const obJs = fs.readFileSync(path.join(ROOT, 'js/onboarding.js'), 'utf8');
  const syncJs = fs.readFileSync(path.join(ROOT, 'js/projects-sync.js'), 'utf8');

  // 1. Verify onboarding/index.html does not prefill ssrnov in github handle input
  assert.ok(!obHtml.includes('id="ob-github-handle" class="form-input" placeholder="ssrnov"'), 'ob-github-handle must not have ssrnov placeholder');
  assert.ok(!obHtml.includes('id="ob-github-handle" class="form-input" placeholder="username" style="border: none; border-radius: 0;" value="ssrnov"'), 'ob-github-handle must not have ssrnov value');
  assert.ok(obHtml.includes('id="ob-github-handle" class="form-input" placeholder="username" style="border: none; border-radius: 0;" value=""'), 'ob-github-handle must have empty value');

  // 2. Verify js/onboarding.js initializes github handle to empty string
  assert.ok(obJs.includes("if (elGithub) elGithub.value = '';"), 'js/onboarding.js must reset elGithub.value to empty string');

  // 3. Verify js/projects-sync.js does not fallback to hardcoded ssrnov
  assert.ok(!syncJs.includes("currentGitHubUser = 'ssrnov'"), 'js/projects-sync.js must not force ssrnov as default github user');
});

// --------------------------------------------------------------------------
// TEST 15: Single Active Session Enforcement & Dual-Method Password Recovery
// --------------------------------------------------------------------------
test('Auth Architecture: Single active session enforcement & dual-method password recovery (Security Question OR DOB)', async () => {
  const loginHtml = fs.readFileSync(path.join(ROOT, 'login/index.html'), 'utf8');
  const signupHtml = fs.readFileSync(path.join(ROOT, 'signup/index.html'), 'utf8');
  const authJs = fs.readFileSync(path.join(ROOT, 'js/auth.js'), 'utf8');
  const supabaseJs = fs.readFileSync(path.join(ROOT, 'js/supabase.js'), 'utf8');

  // 1. Verify Active Session Gate elements exist in login and signup HTML
  assert.ok(loginHtml.includes('id="active-session-gate"'), 'login/index.html must include #active-session-gate');
  assert.ok(loginHtml.includes('id="active-session-logout-btn"'), 'login/index.html must include logout button to switch accounts');
  assert.ok(signupHtml.includes('id="active-session-gate"'), 'signup/index.html must include #active-session-gate');
  assert.ok(signupHtml.includes('id="active-session-logout-btn"'), 'signup/index.html must include logout button to switch accounts');

  // 2. Verify Signup Form collects Date of Birth and Security Question/Answer
  assert.ok(signupHtml.includes('id="signup-dob"'), 'signup/index.html must include #signup-dob');
  assert.ok(signupHtml.includes('id="signup-security-question"'), 'signup/index.html must include #signup-security-question');
  assert.ok(signupHtml.includes('id="signup-security-answer"'), 'signup/index.html must include #signup-security-answer');

  // 3. Verify Login Form contains Forgot Password Modal with Security Question & DOB tabs
  assert.ok(loginHtml.includes('id="forgot-password-modal"'), 'login/index.html must include #forgot-password-modal dialog');
  assert.ok(loginHtml.includes('id="tab-recovery-question"'), 'login/index.html must include Security Question tab');
  assert.ok(loginHtml.includes('id="tab-recovery-dob"'), 'login/index.html must include Date of Birth tab');
  assert.ok(loginHtml.includes('id="recovery-new-password"'), 'login/index.html must include new password input for recovery');

  // 4. Verify Single Session Enforcement in js/supabase.js and js/auth.js
  assert.ok(supabaseJs.includes('Enforce single active session restriction'), 'supabase.js must enforce single active session in signUp/signIn');
  assert.ok(authJs.includes("document.getElementById('active-session-gate')"), 'auth.js must control #active-session-gate visibility');

  // 5. Verify Dual Recovery Engine functions exist in js/supabase.js
  assert.ok(supabaseJs.includes('getUserSecurityDetails'), 'supabase.js must define getUserSecurityDetails');
  assert.ok(supabaseJs.includes('verifySecurityQuestion'), 'supabase.js must define verifySecurityQuestion');
  assert.ok(supabaseJs.includes('verifyDateOfBirth'), 'supabase.js must define verifyDateOfBirth');
  assert.ok(supabaseJs.includes('resetPasswordWithVerification'), 'supabase.js must define resetPasswordWithVerification');
});

// --------------------------------------------------------------------------
// TEST 16: Feature 1 — Autosave Engine (Debounce, Sequencing & Navigation Guard)
// --------------------------------------------------------------------------
test('Feature 1: Autosave Engine (800ms debounce, monotonic sequencing, unsaved/saving/saved/failed states, beforeunload guard)', () => {
  const builderJs = fs.readFileSync(path.join(ROOT, 'js/builder.js'), 'utf8');
  const builderHtml = fs.readFileSync(path.join(ROOT, 'dashboard/builder/index.html'), 'utf8');

  assert.ok(builderJs.includes('saveSequenceCounter'), 'builder.js must track monotonic request sequences');
  assert.ok(builderJs.includes('latestResolvedSequence'), 'builder.js must drop older out-of-order saves');
  assert.ok(builderJs.includes('setSaveStatus'), 'builder.js must manage explicit autosave states');
  assert.ok(builderJs.includes("statusText.textContent = 'Unsaved changes'"), 'builder.js must handle unsaved changes state');
  assert.ok(builderJs.includes("statusText.textContent = 'Saving changes...'"), 'builder.js must handle saving changes state');
  assert.ok(builderJs.includes("statusText.textContent = 'All changes saved'"), 'builder.js must handle saved state');
  assert.ok(builderJs.includes("statusText.textContent = 'Save failed'"), 'builder.js must handle save failure state');
  assert.ok(builderJs.includes('800'), 'builder.js must debounce autosave in 700-1000ms range (800ms)');
  assert.ok(builderJs.includes("window.addEventListener('beforeunload'"), 'builder.js must guard against dirty navigation before save');
  assert.ok(builderHtml.includes('id="save-retry-btn"'), 'dashboard/builder/index.html must include retry save button');
});

// --------------------------------------------------------------------------
// TEST 17: Feature 2 — Undo and Redo History Engine
// --------------------------------------------------------------------------
test('Feature 2: Undo and Redo History Engine (50-state bounded stack, keyboard shortcuts, grouping & accessible header controls)', () => {
  const builderJs = fs.readFileSync(path.join(ROOT, 'js/builder.js'), 'utf8');
  const builderHtml = fs.readFileSync(path.join(ROOT, 'dashboard/builder/index.html'), 'utf8');

  assert.ok(builderJs.includes('undoStack = []'), 'builder.js must maintain undoStack');
  assert.ok(builderJs.includes('redoStack = []'), 'builder.js must maintain redoStack');
  assert.ok(builderJs.includes('MAX_HISTORY = 50'), 'builder.js must bound history to 50 entries');
  assert.ok(builderJs.includes('recordTypingSnapshot'), 'builder.js must group rapid typing into discrete history entries');
  assert.ok(builderJs.includes('handleUndo'), 'builder.js must implement handleUndo');
  assert.ok(builderJs.includes('handleRedo'), 'builder.js must implement handleRedo');
  assert.ok(builderJs.includes("key === 'z'"), 'builder.js must support Ctrl+Z / Cmd+Z for undo');
  assert.ok(builderJs.includes("e.shiftKey"), 'builder.js must support Ctrl+Shift+Z / Cmd+Shift+Z for redo');
  assert.ok(builderHtml.includes('id="undo-btn"'), 'dashboard/builder/index.html must include accessible #undo-btn');
  assert.ok(builderHtml.includes('id="redo-btn"'), 'dashboard/builder/index.html must include accessible #redo-btn');
});

// --------------------------------------------------------------------------
// TEST 18: Feature 3 — Draft Mode & Tokenized Private Preview
// --------------------------------------------------------------------------
test('Feature 3: Draft Mode and Tokenized Private Preview (Tri-state, 24-hr token generator, banner, robots gate)', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const publicPortfolioJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');

  assert.ok(profileDataJs.includes('generatePreviewToken'), 'profile-data.js must export generatePreviewToken');
  assert.ok(profileDataJs.includes('verifyPreviewToken'), 'profile-data.js must export verifyPreviewToken');
  assert.ok(profileDataJs.includes('revokePreviewToken'), 'profile-data.js must export revokePreviewToken');
  assert.ok(publicPortfolioJs.includes('renderDraftPreviewBanner'), 'public-portfolio.js must render draft preview banner for authorized viewers');
  assert.ok(publicPortfolioJs.includes("robotsEl.content = 'noindex, nofollow'"), 'public-portfolio.js must set noindex, nofollow on drafts and previews');
  assert.ok(publicPortfolioJs.includes('renderPrivatePortfolioState'), 'public-portfolio.js must block public visitors from accessing unpublished drafts');
});

// --------------------------------------------------------------------------
// TEST 19: Feature 4 — One-Click Portfolio Duplicate
// --------------------------------------------------------------------------
test('Feature 4: One-Click Portfolio Duplicate (Deep cloning, unique slug collision avoidance, draft default)', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const dashboardJs = fs.readFileSync(path.join(ROOT, 'js/dashboard.js'), 'utf8');
  const settingsHtml = fs.readFileSync(path.join(ROOT, 'dashboard/settings/index.html'), 'utf8');

  assert.ok(profileDataJs.includes('export function duplicatePortfolio'), 'profile-data.js must export duplicatePortfolio');
  assert.ok(profileDataJs.includes('candidateSlug = `${baseSlug}-copy`'), 'profile-data.js must generate unique copy slug');
  assert.ok(profileDataJs.includes("status: 'draft'"), 'profile-data.js must initialize duplicate in Draft mode');
  assert.ok(profileDataJs.includes('isPublished: false'), 'profile-data.js must set isPublished: false on duplicate');
  assert.ok(dashboardJs.includes('setupDuplicatePortfolio'), 'dashboard.js must bind duplicate portfolio action');
  assert.ok(settingsHtml.includes('id="duplicate-settings-btn"'), 'dashboard/settings/index.html must include duplicate portfolio button');
});

// --------------------------------------------------------------------------
// TEST 20: Feature 5 — SEO Canonical & Social Metadata, sitemap.xml, robots.txt
// --------------------------------------------------------------------------
test('Feature 5: SEO and Social Metadata (Dynamic Open Graph tags, canonical links, public sitemap.xml & robots.txt)', () => {
  const publicJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  const sitemapPath = path.join(ROOT, 'public/sitemap.xml');
  const robotsPath = path.join(ROOT, 'public/robots.txt');

  assert.ok(publicJs.includes('updateSocialMetadata'), 'public-portfolio.js must inject social metadata');
  assert.ok(publicJs.includes('rel="canonical"'), 'public-portfolio.js must inject canonical link');
  assert.ok(publicJs.includes('og:title'), 'public-portfolio.js must inject Open Graph og:title');
  assert.ok(publicJs.includes('twitter:card'), 'public-portfolio.js must inject Twitter card tags');

  assert.ok(fs.existsSync(sitemapPath), 'public/sitemap.xml must exist');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  assert.ok(sitemap.includes('<urlset'), 'sitemap.xml must be valid XML urlset');
  assert.ok(!sitemap.includes('/dashboard/'), 'sitemap.xml must strictly exclude dashboard routes');
  assert.ok(!sitemap.includes('preview'), 'sitemap.xml must exclude preview links');
  assert.ok(sitemap.includes('/u/sunny'), 'sitemap.xml must include published canonical portfolios');

  assert.ok(fs.existsSync(robotsPath), 'public/robots.txt must exist');
  const robots = fs.readFileSync(robotsPath, 'utf8');
  assert.ok(robots.includes('Disallow: /dashboard/'), 'robots.txt must disallow dashboard');
  assert.ok(robots.includes('Disallow: /*preview*'), 'robots.txt must disallow preview tokens');
  assert.ok(robots.includes('Sitemap: https://folioryn.dev/sitemap.xml'), 'robots.txt must declare sitemap location');
});

// --------------------------------------------------------------------------
// TEST 21: Feature 6 — Contact Form with Honeypot & Rate Limiting
// --------------------------------------------------------------------------
test('Feature 6: Contact Form & Message Delivery (Honeypot spam filter, rate-limiting, recipient inbox storage & deletion)', () => {
  const publicHtml = fs.readFileSync(path.join(ROOT, 'u/index.html'), 'utf8');
  const publicJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const settingsHtml = fs.readFileSync(path.join(ROOT, 'dashboard/settings/index.html'), 'utf8');

  assert.ok(publicHtml.includes('id="contact-hp"'), 'u/index.html must include hidden honeypot input');
  assert.ok(publicJs.includes('Honeypot triggered'), 'public-portfolio.js must verify honeypot field is empty');
  assert.ok(publicJs.includes('folioryn_contact_submissions_tracker'), 'public-portfolio.js must enforce submission rate limiting');
  assert.ok(publicJs.includes('delivery_status: \'delivered\''), 'public-portfolio.js must tag message delivery status');

  assert.ok(profileDataJs.includes('getContactMessages'), 'profile-data.js must export getContactMessages');
  assert.ok(profileDataJs.includes('deleteContactMessage'), 'profile-data.js must export deleteContactMessage');
  assert.ok(profileDataJs.includes('markContactMessageRead'), 'profile-data.js must export markContactMessageRead');
  assert.ok(settingsHtml.includes('id="contact-messages-list"'), 'dashboard/settings/index.html must include contact messages inbox viewer');
});

// --------------------------------------------------------------------------
// TEST 22: Feature 7 — Social Sharing & Web Share API
// --------------------------------------------------------------------------
test('Feature 7: Social Sharing and Share Cards (Web Share API, clipboard fallback, toast notification, draft warning)', () => {
  const publicHtml = fs.readFileSync(path.join(ROOT, 'u/index.html'), 'utf8');
  const publicJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  const publishJs = fs.readFileSync(path.join(ROOT, 'js/dashboard-publish.js'), 'utf8');

  assert.ok(publicHtml.includes('id="share-portfolio-btn"'), 'u/index.html must provide #share-portfolio-btn');
  assert.ok(publicJs.includes('navigator.share'), 'public-portfolio.js must integrate native Web Share API');
  assert.ok(publicJs.includes('navigator.clipboard.writeText'), 'public-portfolio.js must provide clipboard fallback');
  assert.ok(publicJs.includes('This portfolio is currently saved as an unpublished draft'), 'public-portfolio.js must warn when sharing draft');
  assert.ok(publishJs.includes('shareLinkedIn'), 'dashboard-publish.js must generate dynamic social share links');
});

// --------------------------------------------------------------------------
// TEST 23: Feature 8 — Profile Completion Suggestions
// --------------------------------------------------------------------------
test('Feature 8: Profile Completion Suggestions (Real non-empty data calculation, actionable suggestions with direct jump links)', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const dashboardJs = fs.readFileSync(path.join(ROOT, 'js/dashboard.js'), 'utf8');

  assert.ok(profileDataJs.includes('getProfileCompletionDetails'), 'profile-data.js must export getProfileCompletionDetails');
  assert.ok(profileDataJs.includes('calculateProfileCompletion'), 'profile-data.js must export calculateProfileCompletion');
  assert.ok(profileDataJs.includes('/dashboard/builder/'), 'profile-data.js must include direct section jump links');
  assert.ok(profileDataJs.includes('/dashboard/projects/'), 'profile-data.js must link projects suggestion');
  assert.ok(profileDataJs.includes('/dashboard/skills/'), 'profile-data.js must link skills suggestion');
  assert.ok(dashboardJs.includes('completionDetails.suggestions.map'), 'dashboard.js must render actionable checklist suggestions dynamically');
});

// --------------------------------------------------------------------------
// TEST 24: Feature 9 — Profile Data Import and Export
// --------------------------------------------------------------------------
test('Feature 9: Profile Data Import and Export (folioryn_backup_v1 schema validation, preview summary modal, merge/replace strategy, rollback safety)', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const settingsHtml = fs.readFileSync(path.join(ROOT, 'dashboard/settings/index.html'), 'utf8');
  const sampleJsonPath = path.join(ROOT, 'public/sample-folioryn-export.json');

  assert.ok(profileDataJs.includes('exportProfileData'), 'profile-data.js must export exportProfileData');
  assert.ok(profileDataJs.includes('validateImportData'), 'profile-data.js must export validateImportData');
  assert.ok(profileDataJs.includes('importProfileData'), 'profile-data.js must export importProfileData');
  assert.ok(profileDataJs.includes('rollbackLastImport'), 'profile-data.js must export rollbackLastImport');
  assert.ok(profileDataJs.includes('folioryn_backup_v1'), 'profile-data.js must enforce folioryn_backup_v1 schema version');

  assert.ok(settingsHtml.includes('id="import-preview-modal"'), 'dashboard/settings/index.html must include #import-preview-modal dialog');
  assert.ok(settingsHtml.includes('id="rollback-import-btn"'), 'dashboard/settings/index.html must provide rollback button');
  assert.ok(settingsHtml.includes('value="merge"'), 'dashboard/settings/index.html must provide merge strategy option');
  assert.ok(settingsHtml.includes('value="replace"'), 'dashboard/settings/index.html must provide replace strategy option');

  assert.ok(fs.existsSync(sampleJsonPath), 'public/sample-folioryn-export.json must exist');
  const sample = JSON.parse(fs.readFileSync(sampleJsonPath, 'utf8'));
  assert.strictEqual(sample.schemaVersion, 'folioryn_backup_v1', 'Sample backup must match schemaVersion');
  assert.ok(sample.profile && sample.projects && sample.skills, 'Sample backup must contain complete fictional dataset');
});

// --------------------------------------------------------------------------
// TEST 25: Feature 10 & Design Token Quality — Eye-Friendly Warm Tones & Accessibility
// --------------------------------------------------------------------------
test('Feature 10 & Design Token Quality: Warm eye-friendly text palette (--text-primary: #D1CCC2), landmarks, focus-visible', () => {
  const variablesCss = fs.readFileSync(path.join(ROOT, 'css/variables.css'), 'utf8');
  const mainCss = fs.readFileSync(path.join(ROOT, 'css/main.css'), 'utf8');

  // Verify softened eye-friendly warm stone text color (addressing user eye strain request)
  assert.ok(variablesCss.includes('--text-primary: #D1CCC2;'), 'variables.css must set --text-primary to soft warm stone #D1CCC2');
  assert.ok(!variablesCss.includes('--text-primary: #FFFFFF;'), 'variables.css must not use harsh piercing pitch-white');
  assert.ok(variablesCss.includes('--text-secondary: #98938A;'), 'variables.css must set soft secondary text tone');

  // Verify focus ring styling for WCAG keyboard accessibility
  assert.ok(mainCss.includes(':focus-visible'), 'main.css must style :focus-visible for accessibility');
  assert.ok(mainCss.includes('@media (prefers-reduced-motion: reduce)'), 'main.css must support prefers-reduced-motion');
});

// --------------------------------------------------------------------------
// TEST 26: Analytics Date Comparison Engine & Boundaries
// --------------------------------------------------------------------------
test('Feature: Analytics Date Comparison Engine (7d, 30d, 90d, custom, inclusive end boundaries & equal preceding period)', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  assert.ok(profileDataJs.includes('getDateRangeBoundaries'), 'profile-data.js must export getDateRangeBoundaries');
  assert.ok(profileDataJs.includes('calculatePeriodMetrics'), 'profile-data.js must export calculatePeriodMetrics');
  assert.ok(profileDataJs.includes('comparePeriods'), 'profile-data.js must export comparePeriods');
  assert.ok(profileDataJs.includes('23, 59, 59, 999'), 'Date comparison engine must treat end date as inclusive (23:59:59.999)');

  // Verify UI controls in dashboard/analytics/index.html
  const analyticsHtml = fs.readFileSync(path.join(ROOT, 'dashboard/analytics/index.html'), 'utf8');
  assert.ok(analyticsHtml.includes('data-preset="7d"'), 'analytics HTML must have 7d preset');
  assert.ok(analyticsHtml.includes('data-preset="30d"'), 'analytics HTML must have 30d preset');
  assert.ok(analyticsHtml.includes('data-preset="90d"'), 'analytics HTML must have 90d preset');
  assert.ok(analyticsHtml.includes('data-preset="custom"'), 'analytics HTML must have custom preset');
  assert.ok(analyticsHtml.includes('id="custom-start-date"'), 'analytics HTML must have custom start date input');
  assert.ok(analyticsHtml.includes('id="custom-end-date"'), 'analytics HTML must have custom end date input');
  assert.ok(analyticsHtml.includes('id="comparison-banner"'), 'analytics HTML must display comparison range banner');
});

// --------------------------------------------------------------------------
// TEST 27: Zero-Safe Percentage Math & Trend Indicators
// --------------------------------------------------------------------------
test('Feature: Zero-Safe Percentage Math (prevent divide-by-zero, handle zero previous value, correct trends)', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  assert.ok(profileDataJs.includes('compareMetric'), 'profile-data.js must export compareMetric');

  // Verify logic guard against NaN/Infinity
  assert.ok(profileDataJs.includes('if (previous === 0)'), 'compareMetric must guard against previous value of zero');
  assert.ok(profileDataJs.includes("text: '0%'"), 'compareMetric must return 0% when both current and previous are 0');

  // Check CSS styling for trend badges
  const dashboardCss = fs.readFileSync(path.join(ROOT, 'css/dashboard.css'), 'utf8');
  assert.ok(dashboardCss.includes('.trend-badge.trend-up'), 'dashboard.css must style trend-up badge');
  assert.ok(dashboardCss.includes('.trend-badge.trend-down'), 'dashboard.css must style trend-down badge');
  assert.ok(dashboardCss.includes('.trend-badge.trend-neutral'), 'dashboard.css must style trend-neutral badge');
});

// --------------------------------------------------------------------------
// TEST 28: Project-Level Analytics & Interaction Rate
// --------------------------------------------------------------------------
test('Feature: Project-Level Analytics (performance table, drill-down panel, interaction rate formula & sorting)', () => {
  const analyticsHtml = fs.readFileSync(path.join(ROOT, 'dashboard/analytics/index.html'), 'utf8');
  const dashboardAnalyticsJs = fs.readFileSync(path.join(ROOT, 'js/dashboard-analytics.js'), 'utf8');

  // Check table & drilldown panel
  assert.ok(analyticsHtml.includes('id="project-performance-table"'), 'analytics HTML must have project performance table');
  assert.ok(analyticsHtml.includes('id="project-detail-panel"'), 'analytics HTML must have project detail drilldown panel');
  assert.ok(analyticsHtml.includes('id="project-search-input"'), 'analytics HTML must have live project search');
  assert.ok(analyticsHtml.includes('id="project-sort-select"'), 'analytics HTML must have project sort select');

  // Check interaction rate formula documentation
  assert.ok(analyticsHtml.includes('Interaction Rate:'), 'analytics HTML must define Interaction Rate');
  assert.ok(analyticsHtml.includes('(Total Project Clicks + Detail Views) / (Portfolio Page Views)'), 'analytics HTML must display interaction rate formula');

  // Check controller handling
  assert.ok(dashboardAnalyticsJs.includes('openProjectDetailPanel'), 'dashboard-analytics.js must implement openProjectDetailPanel');
  assert.ok(dashboardAnalyticsJs.includes('renderProjectPerformanceTable'), 'dashboard-analytics.js must render performance table');
});

// --------------------------------------------------------------------------
// TEST 29: Reliable Analytics Event Collection & Privacy Instrumentation
// --------------------------------------------------------------------------
test('Feature: Reliable Analytics Event Collection (public portfolio instrumentation, preview & owner exclusion, honeypot tracking)', () => {
  const publicPortfolioJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');

  // Verify event types whitelist
  assert.ok(profileDataJs.includes("'portfolio_view'"), 'profile-data.js must support portfolio_view');
  assert.ok(profileDataJs.includes("'project_view'"), 'profile-data.js must support project_view');
  assert.ok(profileDataJs.includes("'github_click'"), 'profile-data.js must support github_click');
  assert.ok(profileDataJs.includes("'demo_click'"), 'profile-data.js must support demo_click');
  assert.ok(profileDataJs.includes("'resume_download'"), 'profile-data.js must support resume_download');
  assert.ok(profileDataJs.includes("'contact_submit'"), 'profile-data.js must support contact_submit');

  // Verify preview exclusion in public-portfolio.js
  assert.ok(publicPortfolioJs.includes('if (isPublished && !isAuthorizedPreview && !isOwnerSession)'), 'public-portfolio.js must strictly exclude private previews and owner sessions from public telemetry');
  assert.ok(publicPortfolioJs.includes('trackPublicPortfolioTelemetry'), 'public-portfolio.js must call trackPublicPortfolioTelemetry');
  assert.ok(publicPortfolioJs.includes('track-github-btn'), 'public-portfolio.js must track github repo clicks');
  assert.ok(publicPortfolioJs.includes('track-demo-btn'), 'public-portfolio.js must track live demo clicks');
});

// --------------------------------------------------------------------------
// TEST 30: Supabase Database Migration 003 & RLS Policies
// --------------------------------------------------------------------------
test('Feature: Supabase Database Migration 003 & Security (analytics_events schema, indexes & RLS)', () => {
  const migration003Path = path.join(ROOT, 'supabase/migrations/003_analytics_events_and_aggregates.sql');
  const schemaSql = fs.readFileSync(path.join(ROOT, 'supabase/schema.sql'), 'utf8');

  assert.ok(fs.existsSync(migration003Path), '003_analytics_events_and_aggregates.sql must exist');
  const migrationSql = fs.readFileSync(migration003Path, 'utf8');

  // Verify table definition
  assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.analytics_events'), 'Migration must create analytics_events table');
  assert.ok(migrationSql.includes('event_type TEXT NOT NULL CHECK'), 'Migration must enforce event_type check constraint');

  // Verify performance indexes
  assert.ok(migrationSql.includes('idx_analytics_portfolio_created'), 'Migration must create portfolio_slug created_at index');
  assert.ok(migrationSql.includes('idx_analytics_project_created'), 'Migration must create project_id index');

  // Verify RLS policies
  assert.ok(migrationSql.includes('ENABLE ROW LEVEL SECURITY'), 'Migration must enable RLS');
  assert.ok(migrationSql.includes('CREATE POLICY "Public can record analytics events"'), 'Migration must allow public insert');
  assert.ok(migrationSql.includes('CREATE POLICY "Owners can view their portfolio analytics"'), 'Migration must restrict select to portfolio owner');

  // Verify master schema.sql sync
  assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.analytics_events'), 'supabase/schema.sql must include analytics_events');
  assert.ok(schemaSql.includes('CREATE POLICY "Owners can view their portfolio analytics"'), 'supabase/schema.sql must include owner RLS policy');
});

// --------------------------------------------------------------------------
// TEST 31: Portfolio Builder — Editor Pane Layout & Field Visibility
// --------------------------------------------------------------------------
test('Portfolio Builder: Editor Pane flex-shrink prevention, all 4 sections & fields visibility, and interactive accordions', () => {
  const dashCss = fs.readFileSync(path.join(ROOT, 'css/dashboard.css'), 'utf8');
  const builderHtml = fs.readFileSync(path.join(ROOT, 'dashboard/builder/index.html'), 'utf8');
  const builderJs = fs.readFileSync(path.join(ROOT, 'js/builder.js'), 'utf8');

  // Verify CSS fixes flex-shrink bug and sets smooth scroll
  assert.ok(dashCss.includes('.builder-editor-pane > *'), 'css/dashboard.css must target direct children of .builder-editor-pane');
  assert.ok(dashCss.includes('flex-shrink: 0'), 'css/dashboard.css must prevent flex-shrink squishing');
  assert.ok(dashCss.includes('overflow-y: auto'), 'css/dashboard.css must enable vertical scrolling');
  assert.ok(dashCss.includes('.editor-section.is-collapsed'), 'css/dashboard.css must support collapsible accordion states');

  // Verify all fields are present in HTML
  assert.ok(builderHtml.includes('id="template-select"'), 'Template selector must exist');
  assert.ok(builderHtml.includes('id="input-display-name"'), 'Full Name input must exist');
  assert.ok(builderHtml.includes('id="input-headline"'), 'Professional Headline input must exist');
  assert.ok(builderHtml.includes('id="input-bio"'), 'Bio Summary textarea must exist');
  assert.ok(builderHtml.includes('id="input-location"'), 'Location input must exist');
  assert.ok(builderHtml.includes('id="input-skills-frontend"'), 'Frontend Engineering skills input must exist');
  assert.ok(builderHtml.includes('id="input-skills-backend"'), 'Backend & Systems skills input must exist');
  assert.ok(builderHtml.includes('id="input-github-url"'), 'GitHub Profile URL input must exist');
  assert.ok(builderHtml.includes('id="input-contact-email"'), 'Public Inquiries Email input must exist');
  assert.ok(builderHtml.includes('builder-project-card'), 'Project items must use .builder-project-card');

  // Verify JS binds accordions and preserves event propagation
  assert.ok(builderJs.includes('bindSectionAccordions'), 'builder.js must define bindSectionAccordions');
  assert.ok(builderJs.includes("section.classList.toggle('is-collapsed')"), 'builder.js must toggle .is-collapsed state');
});

// --------------------------------------------------------------------------
// TEST 32: Public Portfolio — /u/ssrnov & Active Session Dynamic Resolution
// --------------------------------------------------------------------------
test('Public Portfolio: /u/ssrnov and active session dynamic resolution without 404', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const pubJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  const supabaseJs = fs.readFileSync(path.join(ROOT, 'js/supabase.js'), 'utf8');

  // Verify profile-data.js checks active user and resolves ssrnov alias
  assert.ok(profileDataJs.includes("cleanSlug === 'sunny' || cleanSlug === 'ssrnov'"), 'profile-data.js must resolve ssrnov and sunny aliases');
  assert.ok(profileDataJs.includes('isMatchActive'), 'profile-data.js must check active profile session match');

  // Verify public-portfolio.js owner matching recognizes ssrnov
  assert.ok(pubJs.includes("targetUser === 'sunny' || targetUser === 'ssrnov'"), 'public-portfolio.js must recognize ssrnov session ownership');

  // Verify supabase.js implements getProfileByUsername without throwing TypeError
  assert.ok(supabaseJs.includes('getProfileByUsername(username)'), 'supabase.js must define getProfileByUsername');
  assert.ok(supabaseJs.includes("clean === 'sunny' || clean === 'ssrnov'"), 'supabase.js must handle sunny and ssrnov in getProfileByUsername');
});

// --------------------------------------------------------------------------
// TEST 33: Inbound Contact Messages Delivery & Dashboard Inbox
// --------------------------------------------------------------------------
test('Feature: Inbound Contact Messages Delivery & Dashboard Inbox (multi-key sync, read status, live storage)', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const pubJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  const dashHtml = fs.readFileSync(path.join(ROOT, 'dashboard/index.html'), 'utf8');
  const dashJs = fs.readFileSync(path.join(ROOT, 'js/dashboard.js'), 'utf8');

  // Verify dashboard HTML contains inbound messages section & list
  assert.ok(dashHtml.includes('id="dashboard-inbound-messages-section"'), 'dashboard/index.html must have inbound messages section');
  assert.ok(dashHtml.includes('id="dashboard-inbound-messages-list"'), 'dashboard/index.html must have inbound messages list container');
  assert.ok(dashHtml.includes('id="dashboard-inbound-unread-badge"'), 'dashboard/index.html must have unread message count badge');
  assert.ok(dashHtml.includes('id="dashboard-refresh-messages-btn"'), 'dashboard/index.html must have refresh messages button');

  // Verify public contact form persists across inboxes
  assert.ok(pubJs.includes('keysToSave.add'), 'public-portfolio.js must save submitted messages into recipient inboxes');
  assert.ok(pubJs.includes('profilefolio_contact_messages'), 'public-portfolio.js must update global fallback inbox');

  // Verify profile-data.js deduplication and sorting
  assert.ok(profileDataJs.includes('allMessagesMap'), 'profile-data.js must deduplicate messages by ID');
  assert.ok(profileDataJs.includes('b.created_at'), 'profile-data.js must sort messages descending by creation timestamp');

  // Verify dashboard.js populates inbound messages and handles live storage sync
  assert.ok(dashJs.includes('populateInboundMessages'), 'dashboard.js must define populateInboundMessages');
  assert.ok(dashJs.includes('setupInboundMessages'), 'dashboard.js must define setupInboundMessages');
  assert.ok(dashJs.includes("window.addEventListener('storage'"), 'dashboard.js must listen for real-time storage events');
});

// --------------------------------------------------------------------------
// TEST 34: Public Portfolio Blog Articles Section
// --------------------------------------------------------------------------
test('Feature: Public Portfolio Blog Articles Section (desktop nav, cards grid, reading time, tags)', () => {
  const uHtml = fs.readFileSync(path.join(ROOT, 'u/index.html'), 'utf8');
  const sunnyHtml = fs.readFileSync(path.join(ROOT, 'u/sunny/index.html'), 'utf8');
  const pubJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');

  // Check section and containers in u/index.html and u/sunny/index.html
  assert.ok(uHtml.includes('id="blog"'), 'u/index.html must contain #blog section');
  assert.ok(uHtml.includes('id="portfolio-articles-container"'), 'u/index.html must contain #portfolio-articles-container');
  assert.ok(uHtml.includes('href="#blog"'), 'u/index.html must link to #blog in navigation');

  assert.ok(sunnyHtml.includes('id="blog"'), 'u/sunny/index.html must contain #blog section');
  assert.ok(sunnyHtml.includes('id="portfolio-articles-container"'), 'u/sunny/index.html must contain #portfolio-articles-container');
  assert.ok(sunnyHtml.includes('href="#blog"'), 'u/sunny/index.html must link to #blog in navigation');

  // Check JS rendering logic
  assert.ok(pubJs.includes('renderArticlesSection'), 'public-portfolio.js must define renderArticlesSection');
  assert.ok(pubJs.includes('article-portfolio-card'), 'public-portfolio.js must style article cards');
  assert.ok(pubJs.includes('readingTime'), 'public-portfolio.js must display reading time');
});

// --------------------------------------------------------------------------
// TEST 35: 3D Perspective Tilt, Specular Lighting & Animations Across Pages
// --------------------------------------------------------------------------
test('Feature: 3D Perspective Tilt, Specular Lighting & Animations Across Pages', () => {
  const compCss = fs.readFileSync(path.join(ROOT, 'css/components.css'), 'utf8');
  const mainJs = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');

  // Check 3D CSS transforms and variables
  assert.ok(compCss.includes('transform-style: preserve-3d'), 'components.css must define preserve-3d transform style');
  assert.ok(compCss.includes('perspective(var(--perspective-default))'), 'components.css must apply 3D perspective to interactive cards');
  assert.ok(compCss.includes('rotateX(var(--rot-x'), 'components.css must support dynamic rotateX');
  assert.ok(compCss.includes('rotateY(var(--rot-y'), 'components.css must support dynamic rotateY');
  assert.ok(compCss.includes('translateZ(8px)'), 'components.css must lift cards on Z-axis');
  assert.ok(compCss.includes('radial-gradient'), 'components.css must implement specular glare highlight');
  assert.ok(compCss.includes('.floating-orb-3d'), 'components.css must define ambient 3D floating orbs');
  assert.ok(compCss.includes('prefers-reduced-motion: reduce'), 'components.css must include reduced-motion accessibility guard');

  // Check JS 3D tilt engine
  assert.ok(mainJs.includes('initInteractive3D'), 'main.js must define and call initInteractive3D');
  assert.ok(mainJs.includes('--rot-x'), 'main.js must calculate and set --rot-x');
  assert.ok(mainJs.includes('--rot-y'), 'main.js must calculate and set --rot-y');
  assert.ok(mainJs.includes('pointermove'), 'main.js must track pointer position for 3D perspective');
});

// --------------------------------------------------------------------------
// TEST 36: Dynamic User Identity & Credential Decoupling
// --------------------------------------------------------------------------
test('User Identity Decoupling: Dynamic contact email and credentials without hardcoded creator defaults', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const contactHtml = fs.readFileSync(path.join(ROOT, 'contact/index.html'), 'utf8');
  const contactJs = fs.readFileSync(path.join(ROOT, 'js/contact.js'), 'utf8');
  const builderHtml = fs.readFileSync(path.join(ROOT, 'dashboard/builder/index.html'), 'utf8');
  const resumeHtml = fs.readFileSync(path.join(ROOT, 'dashboard/resume/index.html'), 'utf8');
  const sunnyHtml = fs.readFileSync(path.join(ROOT, 'u/sunny/index.html'), 'utf8');
  const signupHtml = fs.readFileSync(path.join(ROOT, 'signup/index.html'), 'utf8');
  const supabaseJs = fs.readFileSync(path.join(ROOT, 'js/supabase.js'), 'utf8');

  // 1. DEFAULT_PROFILE must not contain hardcoded personal contact info
  assert.ok(profileDataJs.includes('email: ""'), 'DEFAULT_PROFILE must have blank email default');
  assert.ok(profileDataJs.includes('githubUrl: ""'), 'DEFAULT_PROFILE must have blank githubUrl default');
  assert.ok(!profileDataJs.includes('email: "sunny@profilefolio.dev"'), 'DEFAULT_PROFILE must not force sunny@profilefolio.dev');
  assert.ok(!profileDataJs.includes('githubUrl: "https://github.com/ssrnov"'), 'DEFAULT_PROFILE must not force github.com/ssrnov');

  // 2. contact/index.html must not hardcode personal emails
  assert.ok(!contactHtml.includes('mailto:contact@ssrnovx.dev'), 'contact/index.html must not hardcode contact@ssrnovx.dev');
  assert.ok(!contactHtml.includes('github.com/ssrnov'), 'contact/index.html must not hardcode github.com/ssrnov');
  assert.ok(contactHtml.includes('id="contact-email-link"'), 'contact/index.html must have dynamic email link ID');

  // 3. dashboard/builder/index.html must not prefill ssrnov credentials
  assert.ok(!builderHtml.includes('value="https://github.com/ssrnov"'), 'builder must not prefill ssrnov github URL');
  assert.ok(!builderHtml.includes('value="contact@ssrnovx.dev"'), 'builder must not prefill contact@ssrnovx.dev');

  // 4. dashboard/resume/index.html must not prefill contact@ssrnovx.dev
  assert.ok(!resumeHtml.includes('value="contact@ssrnovx.dev"'), 'resume must not prefill contact@ssrnovx.dev');

  // 5. u/sunny/index.html must not hardcode contact@ssrnovx.dev or ssrnov github
  assert.ok(!sunnyHtml.includes('mailto:contact@ssrnovx.dev'), 'public portfolio must not hardcode contact@ssrnovx.dev');
  assert.ok(!sunnyHtml.includes('https://github.com/ssrnov'), 'public portfolio must not hardcode https://github.com/ssrnov');

  // 6. signup/index.html must prompt for user credentials
  assert.ok(signupHtml.includes('id="signup-github"'), 'signup form must include GitHub username prompt');

  // 7. js/contact.js must dynamically hydrate profile and active user
  assert.ok(contactJs.includes('getProfile') && contactJs.includes('getActiveUser'), 'contact.js must import getProfile and getActiveUser');
  assert.ok(contactJs.includes('contact-email-link'), 'contact.js must dynamically set contact-email-link');

  // 8. MOCK_USER_PROFILE must have blank social handles
  assert.ok(supabaseJs.includes("github_handle: ''"), 'MOCK_USER_PROFILE must have empty github_handle default');
});

// --------------------------------------------------------------------------
// TEST 37: Direct Signup Dashboard Redirection & Plain PNG Portrait Upload Guidance
// --------------------------------------------------------------------------
test('Direct Signup & Plain PNG Portrait: /dashboard/ direct landing and explicit PNG background guidance', () => {
  const authJs = fs.readFileSync(path.join(ROOT, 'js/auth.js'), 'utf8');
  const builderHtml = fs.readFileSync(path.join(ROOT, 'dashboard/builder/index.html'), 'utf8');
  const settingsHtml = fs.readFileSync(path.join(ROOT, 'dashboard/settings/index.html'), 'utf8');
  const builderJs = fs.readFileSync(path.join(ROOT, 'js/builder.js'), 'utf8');
  const settingsJs = fs.readFileSync(path.join(ROOT, 'js/settings.js'), 'utf8');
  const previewListenerJs = fs.readFileSync(path.join(ROOT, 'js/preview-listener.js'), 'utf8');
  const publicPortfolioJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  const uHtml = fs.readFileSync(path.join(ROOT, 'u/index.html'), 'utf8');

  // 1. Verify signup redirects directly to /dashboard/ and NOT /onboarding/
  assert.ok(authJs.includes("window.location.href = '/dashboard/';"), 'auth.js must redirect to /dashboard/ upon successful signup');
  assert.ok(!authJs.includes("window.location.href = `/onboarding/"), 'auth.js must not redirect to /onboarding/');

  // 2. Verify Builder UI has portrait upload and plain PNG background guidance
  assert.ok(builderHtml.includes('id="builder-avatar-file-input"'), 'builder/index.html must include avatar file input');
  assert.ok(builderHtml.includes('id="builder-avatar-upload-btn"'), 'builder/index.html must include avatar upload button');
  assert.ok(builderHtml.includes('Recommended: Plain PNG'), 'builder/index.html must recommend plain PNG');
  assert.ok(builderHtml.includes('plain or transparent background'), 'builder/index.html must prompt for plain or transparent background');

  // 3. Verify Settings UI has portrait upload and plain PNG background guidance
  assert.ok(settingsHtml.includes('id="settings-avatar-file-input"'), 'settings/index.html must include avatar file input');
  assert.ok(settingsHtml.includes('id="settings-avatar-upload-btn"'), 'settings/index.html must include avatar upload button');
  assert.ok(settingsHtml.includes('Recommended: Plain PNG'), 'settings/index.html must recommend plain PNG');
  assert.ok(settingsHtml.includes('plain or transparent background'), 'settings/index.html must prompt for plain or transparent background');

  // 4. Verify builder.js manages avatarUrl and updates preview
  assert.ok(builderJs.includes('avatarUrl:'), 'builder.js must manage avatarUrl in state');
  assert.ok(builderJs.includes('updateBuilderAvatarUI'), 'builder.js must define updateBuilderAvatarUI');
  assert.ok(builderJs.includes('builder-avatar-file-input'), 'builder.js must bind file input change');

  // 5. Verify settings.js persists avatarUrl in saveProfile
  assert.ok(settingsJs.includes('settings-avatar-file-input'), 'settings.js must bind avatar file input');
  assert.ok(settingsJs.includes('avatarUrl: currentAvatarUrl'), 'settings.js must save avatarUrl');

  // 6. Verify preview-listener.js and public-portfolio.js render avatar_img
  assert.ok(previewListenerJs.includes('[data-builder-target="avatar_img"]'), 'preview-listener.js must update avatar_img target');
  assert.ok(publicPortfolioJs.includes('[data-builder-target="avatar_img"]'), 'public-portfolio.js must hydrate avatar_img target');

  // 7. Verify u/index.html has hero avatar card frame
  assert.ok(uHtml.includes('data-builder-target="avatar_img"'), 'u/index.html must include avatar_img target');
  assert.ok(uHtml.includes('hero-avatar-frame'), 'u/index.html must include hero-avatar-frame container');
});

// --------------------------------------------------------------------------
// TEST 38: Smooth Button Switching & Interaction Animation System
// --------------------------------------------------------------------------
test('Button Interaction & Animation System: segmented sliding pills, standard click states, and theme transitions', () => {
  const varsCss = fs.readFileSync(path.join(ROOT, 'css/variables.css'), 'utf8');
  const mainCss = fs.readFileSync(path.join(ROOT, 'css/main.css'), 'utf8');
  const compCss = fs.readFileSync(path.join(ROOT, 'css/components.css'), 'utf8');
  const dashCss = fs.readFileSync(path.join(ROOT, 'css/dashboard.css'), 'utf8');
  const btnJs = fs.readFileSync(path.join(ROOT, 'js/button-interactions.js'), 'utf8');
  const themeJs = fs.readFileSync(path.join(ROOT, 'js/theme.js'), 'utf8');
  const mainJs = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');
  const demoJs = fs.readFileSync(path.join(ROOT, 'js/template-demo.js'), 'utf8');
  const analyticsJs = fs.readFileSync(path.join(ROOT, 'js/dashboard-analytics.js'), 'utf8');
  const builderJs = fs.readFileSync(path.join(ROOT, 'js/builder.js'), 'utf8');
  const authJs = fs.readFileSync(path.join(ROOT, 'js/auth.js'), 'utf8');
  const loginHtml = fs.readFileSync(path.join(ROOT, 'login/index.html'), 'utf8');

  // 1. Animation & Timing Design Tokens
  assert.ok(varsCss.includes('--ease-spring:'), 'variables.css must define --ease-spring token');
  assert.ok(varsCss.includes('--transition-btn:'), 'variables.css must define --transition-btn token');
  assert.ok(varsCss.includes('--transition-switch:'), 'variables.css must define --transition-switch token');
  assert.ok(varsCss.includes('--theme-transition-duration:'), 'variables.css must define --theme-transition-duration token');

  // 2. Sliding Indicator Pill System
  assert.ok(compCss.includes('.segmented-slider-pill'), 'components.css must define .segmented-slider-pill');
  assert.ok(compCss.includes('.preset-group.has-slider .preset-btn'), 'components.css must style preset buttons with slider transparency');
  assert.ok(compCss.includes('.builder-viewport-controls.has-slider .viewport-btn'), 'components.css must style viewport buttons with slider transparency');
  assert.ok(compCss.includes('.demo-switcher-tabs.has-slider .demo-switch-btn'), 'components.css must style demo switch buttons with slider transparency');
  assert.ok(compCss.includes('.tab-pane-transition'), 'components.css must define .tab-pane-transition');

  // 3. Button Click Interactions (Hover, Press, Focus, Loading, Success, Disabled)
  assert.ok(mainCss.includes('.btn:hover:not(:disabled)'), 'main.css must define subtle hover lift for buttons');
  assert.ok(mainCss.includes('transform: translateY(0) scale(0.975)'), 'main.css must define micro scale-down press effect');
  assert.ok(mainCss.includes('.btn:focus-visible'), 'main.css must provide visible keyboard focus ring');
  assert.ok(mainCss.includes('.btn.is-loading'), 'main.css must define restrained is-loading state');
  assert.ok(mainCss.includes('.btn.is-success'), 'main.css must define is-success state transition');
  assert.ok(mainCss.includes('.btn:disabled'), 'main.css must declare proper disabled styles');

  // 4. Smooth 3-Theme Switching
  assert.ok(mainCss.includes('html.theme-transitioning'), 'main.css must define global html.theme-transitioning class');
  assert.ok(mainCss.includes('@keyframes iconRotateIn'), 'main.css must animate theme toggle icon with iconRotateIn');
  assert.ok(themeJs.includes('triggerThemeTransition'), 'theme.js must define triggerThemeTransition');
  assert.ok(compCss.includes('.theme-radio-inner'), 'components.css must define .theme-radio-inner');

  // 5. JavaScript Coordinator & Double-click Protection
  assert.ok(btnJs.includes('initSegmentedControl'), 'button-interactions.js must export initSegmentedControl');
  assert.ok(btnJs.includes('initButtonDoubleTapProtection'), 'button-interactions.js must protect against double-click submissions');
  assert.ok(btnJs.includes('setButtonLoading'), 'button-interactions.js must export setButtonLoading');
  assert.ok(btnJs.includes('setButtonSuccess'), 'button-interactions.js must export setButtonSuccess');
  assert.ok(mainJs.includes('initButtonInteractions'), 'main.js must import and initialize button interactions');

  // 6. Targeted Segmented Controls Integration
  assert.ok(loginHtml.includes('auth-tab-group'), 'login/index.html must have auth-tab-group class');
  assert.ok(authJs.includes('tab-pane-transition'), 'auth.js must apply tab-pane-transition when toggling tabs');
  assert.ok(analyticsJs.includes('updateSegmentedSlider'), 'dashboard-analytics.js must update segmented slider');
  assert.ok(builderJs.includes('updateSegmentedSlider'), 'builder.js must update segmented slider');
  assert.ok(demoJs.includes('updateSegmentedSlider'), 'template-demo.js must update segmented slider');
  assert.ok(demoJs.includes('tab-pane-transition'), 'template-demo.js must crossfade demo canvas');

  // 7. Reduced Motion Accessibility
  assert.ok(mainCss.includes('prefers-reduced-motion: reduce'), 'main.css must respect prefers-reduced-motion');
  assert.ok(compCss.includes('prefers-reduced-motion: reduce'), 'components.css must respect prefers-reduced-motion');
  assert.ok(btnJs.includes('prefersReducedMotion'), 'button-interactions.js must guard against reduced motion');
});

// =============================================================================
// TEST 39: Cinematic, Three-Theme-Aware Website Intro Animation Verification
// =============================================================================
test('39. Cinematic, Three-Theme-Aware Intro Animation Verification', () => {
  const varsCss = fs.readFileSync(path.join(ROOT, 'css/variables.css'), 'utf8');
  const compCss = fs.readFileSync(path.join(ROOT, 'css/components.css'), 'utf8');
  const introCss = fs.readFileSync(path.join(ROOT, 'css/intro.css'), 'utf8');
  const introJs = fs.readFileSync(path.join(ROOT, 'js/cinematic-intro.js'), 'utf8');
  const mainJs = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');

  // 1. Dark Theme (Premium Obsidian) exact tokens
  assert.ok(varsCss.includes('--intro-bg: #050706'), 'Dark theme must define --intro-bg: #050706');
  assert.ok(varsCss.includes('--intro-surface: #101512'), 'Dark theme must define --intro-surface: #101512');
  assert.ok(varsCss.includes('--intro-atmosphere: #13251B'), 'Dark theme must define --intro-atmosphere: #13251B');
  assert.ok(varsCss.includes('--intro-selected: #1C2920'), 'Dark theme must define --intro-selected: #1C2920');
  assert.ok(varsCss.includes('--intro-accent: #8FE0AE'), 'Dark theme must define --intro-accent: #8FE0AE');
  assert.ok(varsCss.includes('--intro-accent-hover: #A6EABD'), 'Dark theme must define --intro-accent-hover: #A6EABD');
  assert.ok(varsCss.includes('--intro-accent-pressed: #73CB96'), 'Dark theme must define --intro-accent-pressed: #73CB96');
  assert.ok(varsCss.includes('--intro-accent-secondary: #315C46'), 'Dark theme must define --intro-accent-secondary: #315C46');
  assert.ok(varsCss.includes('--intro-logo-text: #F4F7F4'), 'Dark theme must define --intro-logo-text: #F4F7F4');
  assert.ok(varsCss.includes('--intro-tagline: #B8C3BB'), 'Dark theme must define --intro-tagline: #B8C3BB');
  assert.ok(varsCss.includes('--intro-muted: #929F95'), 'Dark theme must define --intro-muted: #929F95');
  assert.ok(varsCss.includes('--intro-lines: #26352B'), 'Dark theme must define --intro-lines: #26352B');
  assert.ok(varsCss.includes('--intro-border-strong: #35463A'), 'Dark theme must define --intro-border-strong: #35463A');

  // 2. Light Theme (Ivory + Forest Green) exact tokens
  assert.ok(varsCss.includes('--intro-bg: #F7F5EF'), 'Light theme must define --intro-bg: #F7F5EF');
  assert.ok(varsCss.includes('--intro-surface: #FFFFFF'), 'Light theme must define --intro-surface: #FFFFFF');
  assert.ok(varsCss.includes('--intro-surface-secondary: #EFEEE6'), 'Light theme must define --intro-surface-secondary: #EFEEE6');
  assert.ok(varsCss.includes('--intro-selected: #E8EEE7'), 'Light theme must define --intro-selected: #E8EEE7');
  assert.ok(varsCss.includes('--intro-logo-text: #20372D'), 'Light theme must define --intro-logo-text: #20372D');
  assert.ok(varsCss.includes('--intro-body: #41483F'), 'Light theme must define --intro-body: #41483F');
  assert.ok(varsCss.includes('--intro-tagline: #555B54'), 'Light theme must define --intro-tagline: #555B54');
  assert.ok(varsCss.includes('--intro-muted: #62685F'), 'Light theme must define --intro-muted: #62685F');
  assert.ok(varsCss.includes('--intro-accent: #315C46'), 'Light theme must define --intro-accent: #315C46');
  assert.ok(varsCss.includes('--intro-accent-hover: #264A38'), 'Light theme must define --intro-accent-hover: #264A38');
  assert.ok(varsCss.includes('--intro-accent-pressed: #203D2F'), 'Light theme must define --intro-accent-pressed: #203D2F');
  assert.ok(varsCss.includes('--intro-accent-botanical: #71866D'), 'Light theme must define --intro-accent-botanical: #71866D');
  assert.ok(varsCss.includes('--intro-lines: #E5E2D8'), 'Light theme must define --intro-lines: #E5E2D8');
  assert.ok(varsCss.includes('--intro-border-strong: #CFCFC4'), 'Light theme must define --intro-border-strong: #CFCFC4');
  assert.ok(varsCss.includes('--intro-lighting-soft: rgba(113, 134, 109, 0.12)'), 'Light theme must define --intro-lighting-soft');

  // 3. Night Theme (Preserved warm stone monochrome)
  assert.ok(varsCss.includes('--intro-bg: #080909'), 'Night theme must preserve --intro-bg: #080909');
  assert.ok(varsCss.includes('--intro-surface: #141515'), 'Night theme must preserve --intro-surface: #141515');
  assert.ok(varsCss.includes('--intro-accent: #D6D1C7'), 'Night theme must preserve --intro-accent: #D6D1C7');
  assert.ok(varsCss.includes('--intro-logo-text: #D1CCC2'), 'Night theme must preserve --intro-logo-text: #D1CCC2');
  assert.ok(varsCss.includes('--intro-tagline: #98938A'), 'Night theme must preserve --intro-tagline: #98938A');

  // 4. CSS Import and Overlay Architecture
  assert.ok(compCss.includes("@import './intro.css';"), 'components.css must import intro.css');
  assert.ok(introCss.includes('#folioryn-cinematic-intro'), 'intro.css must define #folioryn-cinematic-intro overlay');
  assert.ok(introCss.includes('.intro-canvas-grid'), 'intro.css must define .intro-canvas-grid');
  assert.ok(introCss.includes('.intro-atmosphere-glow'), 'intro.css must define .intro-atmosphere-glow');
  assert.ok(introCss.includes('.intro-emblem-container'), 'intro.css must define .intro-emblem-container');
  assert.ok(introCss.includes('.intro-path-frame'), 'intro.css must define .intro-path-frame');
  assert.ok(introCss.includes('.intro-path-folio'), 'intro.css must define .intro-path-folio');
  assert.ok(introCss.includes('.intro-path-spine'), 'intro.css must define .intro-path-spine');
  assert.ok(introCss.includes('.intro-path-facet'), 'intro.css must define .intro-path-facet');
  assert.ok(introCss.includes('.intro-light-beam'), 'intro.css must define .intro-light-beam');
  assert.ok(introCss.includes('.intro-wordmark'), 'intro.css must define .intro-wordmark');
  assert.ok(introCss.includes('.intro-tagline'), 'intro.css must define .intro-tagline');
  assert.ok(introCss.includes('.intro-revealing'), 'intro.css must define .intro-revealing seamless transition');
  assert.ok(introCss.includes('.intro-skip-btn'), 'intro.css must define .intro-skip-btn');
  assert.ok(introCss.includes('prefers-reduced-motion: reduce'), 'intro.css must respect prefers-reduced-motion');

  // 5. JavaScript Orchestrator Architecture
  assert.ok(introJs.includes('export function shouldPlayIntro'), 'cinematic-intro.js must export shouldPlayIntro');
  assert.ok(introJs.includes('export function createIntroDOM'), 'cinematic-intro.js must export createIntroDOM');
  assert.ok(introJs.includes('export function playCinematicIntro'), 'cinematic-intro.js must export playCinematicIntro');
  assert.ok(introJs.includes('export function initCinematicIntro'), 'cinematic-intro.js must export initCinematicIntro');
  assert.ok(introJs.includes('folioryn_intro_seen'), 'cinematic-intro.js must track intro seen in sessionStorage');
  assert.ok(introJs.includes('INTRO_SAFETY_TIMEOUT_MS'), 'cinematic-intro.js must implement safety timeout');
  assert.ok(introJs.includes('prefers-reduced-motion'), 'cinematic-intro.js must check prefers-reduced-motion');
  assert.ok(introJs.includes('folioryn:theme-changed'), 'cinematic-intro.js must handle live theme changes');
  assert.ok(introJs.includes('window.FoliorynIntro'), 'cinematic-intro.js must expose FoliorynIntro on window');

  // 6. Integration in main.js
  assert.ok(mainJs.includes("import { initCinematicIntro } from './cinematic-intro.js';"), 'main.js must import initCinematicIntro');
  assert.ok(mainJs.includes('initCinematicIntro();'), 'main.js must call initCinematicIntro on DOMContentLoaded');
});

// =============================================================================
// TEST 40: Direct ATS Resume PDF Download and Public Resume Route Verification
// =============================================================================
test('40. Direct ATS Resume PDF Download and Public Resume Route Verification', () => {
  const resumeGenJs = fs.readFileSync(path.join(ROOT, 'js/resume-pdf-generator.js'), 'utf8');
  const pubPortJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  const pubResumeJs = fs.readFileSync(path.join(ROOT, 'js/public-resume.js'), 'utf8');
  const pubResumeHtml = fs.readFileSync(path.join(ROOT, 'u/resume.html'), 'utf8');
  const ssrnovHtml = fs.readFileSync(path.join(ROOT, 'u/ssrnov/index.html'), 'utf8');
  const sunnyHtml = fs.readFileSync(path.join(ROOT, 'u/sunny/index.html'), 'utf8');
  const vercelJson = fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8');
  const viteConfig = fs.readFileSync(path.join(ROOT, 'vite.config.js'), 'utf8');

  // 1. Client-side Vector PDF Generator
  assert.ok(resumeGenJs.includes('export class SimplePdfBuilder'), 'resume-pdf-generator.js must export SimplePdfBuilder');
  assert.ok(resumeGenJs.includes('export function generateAtsResumePdf'), 'resume-pdf-generator.js must export generateAtsResumePdf');
  assert.ok(resumeGenJs.includes('export function downloadAtsResumePdf'), 'resume-pdf-generator.js must export downloadAtsResumePdf');
  assert.ok(resumeGenJs.includes('%PDF-1.4'), 'resume-pdf-generator.js must output standard PDF-1.4 format');
  assert.ok(resumeGenJs.includes('application/pdf'), 'resume-pdf-generator.js must construct PDF Blob');

  // 2. Public Portfolio Direct Download Binding (Prevents sending public visitors to dashboard)
  assert.ok(pubPortJs.includes("import { downloadAtsResumePdf } from './resume-pdf-generator.js';"), 'public-portfolio.js must import downloadAtsResumePdf');
  assert.ok(pubPortJs.includes('bindPublicResumeDownload'), 'public-portfolio.js must define bindPublicResumeDownload');
  assert.ok(pubPortJs.includes('downloadAtsResumePdf(userData, username);'), 'public-portfolio.js must call downloadAtsResumePdf on click');
  assert.ok(pubPortJs.includes('owner-resume-dashboard-link'), 'public-portfolio.js must show owner dashboard link ONLY for owner session');

  // 3. Public Portfolio HTML Links
  assert.ok(ssrnovHtml.includes('data-action="download-resume"'), 'u/ssrnov/index.html must have data-action="download-resume"');
  assert.ok(!ssrnovHtml.includes('href="/dashboard/resume"'), 'u/ssrnov/index.html must NOT link public visitors to /dashboard/resume');
  assert.ok(sunnyHtml.includes('data-action="download-resume"'), 'u/sunny/index.html must have data-action="download-resume"');
  assert.ok(!sunnyHtml.includes('href="/dashboard/resume"'), 'u/sunny/index.html must NOT link public visitors to /dashboard/resume');

  // 4. Public Resume Viewer Page
  assert.ok(pubResumeHtml.includes('public-download-pdf-btn'), 'u/resume.html must have direct download PDF button');
  assert.ok(pubResumeHtml.includes('public-print-pdf-btn'), 'u/resume.html must have print button');
  assert.ok(pubResumeHtml.includes('owner-edit-resume-btn'), 'u/resume.html must have owner edit button');
  assert.ok(!pubResumeHtml.includes("window.location.replace('/login/"), 'u/resume.html must NOT force login redirect on public visitors');
  assert.ok(pubResumeJs.includes('downloadAtsResumePdf'), 'public-resume.js must integrate downloadAtsResumePdf');

  // 5. Routing Rewrites
  const vercel = JSON.parse(vercelJson);
  const resumeRewrite = vercel.rewrites.find(r => r.source === '/u/:username/resume');
  assert.ok(resumeRewrite, 'vercel.json must have rewrite for /u/:username/resume');
  assert.strictEqual(resumeRewrite.destination, '/u/resume.html', 'vercel.json rewrite must point to public /u/resume.html instead of dashboard');
});

// --------------------------------------------------------------------------
// TEST 41: Cross-Device Portrait Image Visibility & User Name Display Under Portrait
// --------------------------------------------------------------------------
test('Cross-Device Portrait Image & Name Display: global avatar sync and user name caption beneath portrait', () => {
  const ssrnovHtml = fs.readFileSync(path.join(ROOT, 'u/ssrnov/index.html'), 'utf8');
  const sunnyHtml = fs.readFileSync(path.join(ROOT, 'u/sunny/index.html'), 'utf8');
  const uHtml = fs.readFileSync(path.join(ROOT, 'u/index.html'), 'utf8');
  const compCss = fs.readFileSync(path.join(ROOT, 'css/components.css'), 'utf8');
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const pubPortJs = fs.readFileSync(path.join(ROOT, 'js/public-portfolio.js'), 'utf8');
  const builderHtml = fs.readFileSync(path.join(ROOT, 'dashboard/builder/index.html'), 'utf8');
  const settingsHtml = fs.readFileSync(path.join(ROOT, 'dashboard/settings/index.html'), 'utf8');

  // 1. User Name directly beneath portrait hero avatar
  assert.ok(compCss.includes('.hero-avatar-caption'), 'components.css must define .hero-avatar-caption');
  assert.ok(compCss.includes('.hero-avatar-name'), 'components.css must define .hero-avatar-name');
  assert.ok(ssrnovHtml.includes('class="hero-avatar-caption"'), 'u/ssrnov/index.html must include hero-avatar-caption');
  assert.ok(ssrnovHtml.includes('data-builder-target="display_name" class="hero-avatar-name"'), 'u/ssrnov/index.html must render user name inside caption');
  assert.ok(sunnyHtml.includes('class="hero-avatar-caption"'), 'u/sunny/index.html must include hero-avatar-caption');
  assert.ok(uHtml.includes('class="hero-avatar-caption"'), 'u/index.html must include hero-avatar-caption');

  // 2. Cross-device portrait image resolution for ssrnov (accessible from any device without local storage)
  assert.ok(ssrnovHtml.includes('src="https://github.com/ssrnov.png"'), 'u/ssrnov/index.html must have live public avatar src');
  assert.ok(profileDataJs.includes('https://github.com/ssrnov.png'), 'js/profile-data.js must provide fallback cross-device avatar');

  // 3. Dynamic resolution in public-portfolio.js
  assert.ok(pubPortJs.includes('dbPort.profiles?.avatar_url'), 'public-portfolio.js must map avatar_url from Supabase');
  assert.ok(pubPortJs.includes('https://github.com/'), 'public-portfolio.js must provide cross-device github avatar resolution fallback');

  // 4. Builder & Settings cross-device GitHub avatar button
  assert.ok(builderHtml.includes('builder-avatar-github-btn'), 'builder/index.html must have builder-avatar-github-btn');
  assert.ok(settingsHtml.includes('settings-avatar-github-btn'), 'settings/index.html must have settings-avatar-github-btn');
});

// --------------------------------------------------------------------------
// TEST 42: Universal Edit Functionality Across Dashboard Modules
// --------------------------------------------------------------------------
test('Universal Edit Functionality: Education, Experience, Certifications, Skills, and Projects', () => {
  const profileDataJs = fs.readFileSync(path.join(ROOT, 'js/profile-data.js'), 'utf8');
  const eduHtml = fs.readFileSync(path.join(ROOT, 'dashboard/education/index.html'), 'utf8');
  const eduJs = fs.readFileSync(path.join(ROOT, 'js/dashboard-education.js'), 'utf8');
  const expHtml = fs.readFileSync(path.join(ROOT, 'dashboard/experience/index.html'), 'utf8');
  const expJs = fs.readFileSync(path.join(ROOT, 'js/dashboard-experience.js'), 'utf8');
  const skillHtml = fs.readFileSync(path.join(ROOT, 'dashboard/skills/index.html'), 'utf8');
  const skillJs = fs.readFileSync(path.join(ROOT, 'js/dashboard-skills.js'), 'utf8');
  const projHtml = fs.readFileSync(path.join(ROOT, 'dashboard/projects/index.html'), 'utf8');
  const projJs = fs.readFileSync(path.join(ROOT, 'js/projects-sync.js'), 'utf8');

  // 1. Data Store Updates
  assert.ok(profileDataJs.includes('export function updateEducationItem('), 'profile-data.js must export updateEducationItem');
  assert.ok(profileDataJs.includes('export function updateExperienceItem('), 'profile-data.js must export updateExperienceItem');
  assert.ok(profileDataJs.includes('export function updateCertificationItem('), 'profile-data.js must export updateCertificationItem');
  assert.ok(profileDataJs.includes('export function updateSkillItem('), 'profile-data.js must export updateSkillItem');

  // 2. Education Module
  assert.ok(eduHtml.includes('id="edu-edit-id"'), 'dashboard/education/index.html must have edu-edit-id');
  assert.ok(eduHtml.includes('id="edu-dialog-title"'), 'dashboard/education/index.html must have edu-dialog-title');
  assert.ok(eduHtml.includes('id="edu-submit-btn"'), 'dashboard/education/index.html must have edu-submit-btn');
  assert.ok(eduJs.includes('edit-edu-btn'), 'dashboard-education.js must render edit-edu-btn on education cards');
  assert.ok(eduJs.includes('openEducationDialogForEdit'), 'dashboard-education.js must implement openEducationDialogForEdit');
  assert.ok(eduJs.includes('updateEducationItem(editId,'), 'dashboard-education.js must invoke updateEducationItem on submit');

  // 3. Experience & Certifications Module
  assert.ok(expHtml.includes('id="exp-edit-id"'), 'dashboard/experience/index.html must have exp-edit-id');
  assert.ok(expHtml.includes('id="exp-dialog-title"'), 'dashboard/experience/index.html must have exp-dialog-title');
  assert.ok(expHtml.includes('id="cert-edit-id"'), 'dashboard/experience/index.html must have cert-edit-id');
  assert.ok(expHtml.includes('id="cert-dialog-title"'), 'dashboard/experience/index.html must have cert-dialog-title');
  assert.ok(expJs.includes('edit-exp-btn'), 'dashboard-experience.js must render edit-exp-btn');
  assert.ok(expJs.includes('openExperienceDialogForEdit'), 'dashboard-experience.js must implement openExperienceDialogForEdit');
  assert.ok(expJs.includes('updateExperienceItem(editId,'), 'dashboard-experience.js must invoke updateExperienceItem');
  assert.ok(expJs.includes('edit-cert-btn'), 'dashboard-experience.js must render edit-cert-btn');
  assert.ok(expJs.includes('openCertificationDialogForEdit'), 'dashboard-experience.js must implement openCertificationDialogForEdit');
  assert.ok(expJs.includes('updateCertificationItem(editId,'), 'dashboard-experience.js must invoke updateCertificationItem');

  // 4. Skills Module
  assert.ok(skillHtml.includes('id="skill-edit-id"'), 'dashboard/skills/index.html must have skill-edit-id');
  assert.ok(skillHtml.includes('id="skill-form-title"'), 'dashboard/skills/index.html must have skill-form-title');
  assert.ok(skillHtml.includes('id="skill-cancel-edit-btn"'), 'dashboard/skills/index.html must have skill-cancel-edit-btn');
  assert.ok(skillJs.includes('edit-skill-btn'), 'dashboard-skills.js must render edit-skill-btn on chips');
  assert.ok(skillJs.includes('startEditingSkill'), 'dashboard-skills.js must implement startEditingSkill');
  assert.ok(skillJs.includes('updateSkillItem(editId,'), 'dashboard-skills.js must invoke updateSkillItem');

  // 5. Projects Module
  assert.ok(projHtml.includes('id="edit-project-dialog"'), 'dashboard/projects/index.html must have edit-project-dialog');
  assert.ok(projHtml.includes('id="edit-proj-id"'), 'dashboard/projects/index.html must have edit-proj-id');
  assert.ok(projJs.includes('edit-proj-btn'), 'projects-sync.js must render edit-proj-btn');
  assert.ok(projJs.includes('openEditProjectDialog'), 'projects-sync.js must implement openEditProjectDialog');
});

console.log(`\n--- TEST SUMMARY: ${passed} / ${total} TESTS PASSED ---`);
if (passed === total) {
  console.log('ALL REGRESSION TESTS PASSED SUCCESSFULLY! ✓');
  process.exit(0);
} else {
  console.error(`FAILED: ${total - passed} tests failed.`);
  process.exit(1);
}





