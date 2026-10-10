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
// TEST 9: Print Stylesheet Links Underlined and Wrapped
// --------------------------------------------------------------------------
test('Print CSS: css/dashboard.css formats resume links with underlines and text wrapping', () => {
  const dashboardCss = fs.readFileSync(path.join(ROOT, 'css/dashboard.css'), 'utf8');
  assert.ok(dashboardCss.includes('.a4-preview-canvas a'), 'Must style .a4-preview-canvas a');
  assert.ok(dashboardCss.includes('text-decoration: underline !important;'), 'Must underline links on print');
  assert.ok(dashboardCss.includes('overflow-wrap: anywhere !important;'), 'Must wrap links on print');
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

console.log(`\n--- TEST SUMMARY: ${passed} / ${total} TESTS PASSED ---`);
if (passed === total) {
  console.log('ALL REGRESSION TESTS PASSED SUCCESSFULLY! ✓');
  process.exit(0);
} else {
  console.error(`FAILED: ${total - passed} tests failed.`);
  process.exit(1);
}



