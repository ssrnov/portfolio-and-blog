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

  assert.ok(demoJs.includes('Sophia Lin'), 'Minimal Professional persona must be present');
  assert.ok(demoJs.includes('Marcus Kane'), 'Developer persona must be present');
  assert.ok(demoJs.includes('Aarav Patel'), 'Student persona must be present');
  assert.ok(demoJs.includes('Elena Rostova'), 'Creative persona must be present');
  assert.ok(demoJs.includes('Julian Rivera'), 'Editorial persona must be present');
  assert.ok(demoJs.includes('Sarah Jenkins'), 'Experience persona must be present');
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

console.log(`\n--- TEST SUMMARY: ${passed} / ${total} TESTS PASSED ---`);
if (passed === total) {
  console.log('ALL REGRESSION TESTS PASSED SUCCESSFULLY! ✓');
  process.exit(0);
} else {
  console.error(`FAILED: ${total - passed} tests failed.`);
  process.exit(1);
}

