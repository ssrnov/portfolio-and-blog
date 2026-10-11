/**
 * Folioryn — Theme System Test Suite
 * Validates requirements for the 3-theme architecture:
 * 1. Dark Theme tokens (Premium Obsidian + Emerald)
 * 2. Light Theme tokens (Warm Ivory + Forest Green)
 * 3. Night Theme tokens (Preserved original Folioryn warm stone monochrome)
 * 4. Theme switching logic, persistence, and default behavior
 * 5. Anti-FOUC head loader scripts across all HTML files
 * 6. Theme selector UI elements in Settings and Header
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import {
  THEMES,
  THEME_LIST,
  DEFAULT_THEME,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  THEME_METADATA,
  isValidTheme
} from '../js/theme.js';

const ROOT = path.resolve('.');

console.log('--- RUNNING FOLIORYN THEME SYSTEM TESTS ---');
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
// TEST 1: Default Theme & Available Themes
// --------------------------------------------------------------------------
test('Theme Defaults: Exactly 3 themes defined, default is dark', () => {
  assert.strictEqual(DEFAULT_THEME, 'dark', 'Default theme must be dark for first-time visitors');
  assert.deepStrictEqual(THEME_LIST, ['dark', 'light', 'night'], 'Must support exactly dark, light, night');
  assert.strictEqual(isValidTheme('dark'), true);
  assert.strictEqual(isValidTheme('light'), true);
  assert.strictEqual(isValidTheme('night'), true);
  assert.strictEqual(isValidTheme('solar'), false);
  assert.strictEqual(isValidTheme(null), false);
});

// --------------------------------------------------------------------------
// TEST 2: Dark Theme — Premium Obsidian Design Tokens
// --------------------------------------------------------------------------
test('Dark Theme: css/variables.css defines exact Premium Obsidian tokens', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css/variables.css'), 'utf8');
  assert.ok(css.includes('[data-theme="dark"]'), 'Must include [data-theme="dark"] block');

  // Verify all required tokens from specification
  const requiredTokens = [
    '#050706', // Main background
    '#101512', // Card background
    '#171D19', // Elevated surface
    '#1C2920', // Hover/selected surface
    '#13251B', // Accent-tinted surface
    '#F4F7F4', // Primary text/headings
    '#B8C3BB', // Body text
    '#929F95', // Muted text
    '#26352B', // Default border
    '#35463A', // Strong border
    '#8FE0AE', // Primary accent
    '#A6EABD', // Accent hover
    '#73CB96', // Accent pressed
    '#6EE7A0', // Success
    '#F4C76B', // Warning
    '#FF8585', // Error
    '#8FC7FF', // Information
    '#092014'  // Primary button text
  ];

  requiredTokens.forEach(hex => {
    assert.ok(
      css.includes(hex),
      `Dark theme must include color ${hex}`
    );
  });
});

// --------------------------------------------------------------------------
// TEST 3: Light Theme — Ivory + Forest Green Design Tokens
// --------------------------------------------------------------------------
test('Light Theme: css/variables.css defines exact Ivory + Forest Green tokens', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css/variables.css'), 'utf8');
  assert.ok(css.includes('[data-theme="light"]'), 'Must include [data-theme="light"] block');

  const requiredTokens = [
    '#F7F5EF', // Main background
    '#FFFFFF', // Card background
    '#EFEEE6', // Secondary surface
    '#E8EEE7', // Selected/accent surface
    '#E5E2D8', // Default border
    '#CFCFC4', // Strong border
    '#20372D', // Primary text/headings
    '#41483F', // Body text
    '#555B54', // Secondary descriptions
    '#62685F', // Muted text
    '#6B7168', // Placeholder text
    '#315C46', // Primary accent
    '#264A38', // Accent hover
    '#203D2F', // Accent pressed
    '#71866D', // Decorative botanical accent
    '#267347', // Success
    '#855A12', // Warning
    '#B42318', // Error
    '#315D83'  // Information
  ];

  requiredTokens.forEach(hex => {
    assert.ok(
      css.includes(hex),
      `Light theme must include color ${hex}`
    );
  });
});

// --------------------------------------------------------------------------
// TEST 4: Night Theme — Preserves Original Website Appearance
// --------------------------------------------------------------------------
test('Night Theme: Preserves authentic original warm stone monochrome tokens', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css/variables.css'), 'utf8');
  assert.ok(css.includes('[data-theme="night"]'), 'Must include [data-theme="night"] block');

  const requiredTokens = [
    '#080909', // Main background
    '#101111', // Card background
    '#141515', // Elevated surface
    '#191A1A', // Hover/selected surface
    '#D1CCC2', // Soft warm stone text
    '#98938A', // Secondary text
    '#726E67', // Muted text
    '#292A2A', // Default border
    '#454545', // Strong border
    '#D6D1C7', // Primary accent
    '#C5C0B6', // Accent hover
    '#B0ABA1'  // Accent pressed
  ];

  requiredTokens.forEach(hex => {
    assert.ok(
      css.includes(hex),
      `Night theme must preserve original color ${hex}`
    );
  });
});

// --------------------------------------------------------------------------
// TEST 5: Centralized Theme Manager Module Exports & Metadata
// --------------------------------------------------------------------------
test('Theme Manager Module: js/theme.js exports metadata with swatches and icons', () => {
  assert.ok(THEME_METADATA.dark, 'Must provide dark theme metadata');
  assert.ok(THEME_METADATA.light, 'Must provide light theme metadata');
  assert.ok(THEME_METADATA.night, 'Must provide night theme metadata');

  assert.strictEqual(THEME_METADATA.dark.swatch.accent, '#8FE0AE');
  assert.strictEqual(THEME_METADATA.light.swatch.accent, '#315C46');
  assert.strictEqual(THEME_METADATA.night.swatch.accent, '#D6D1C7');

  assert.ok(THEME_METADATA.dark.iconSvg.includes('icon-moon'));
  assert.ok(THEME_METADATA.light.iconSvg.includes('icon-sun'));
  assert.ok(THEME_METADATA.night.iconSvg.includes('icon-star'));
});

// --------------------------------------------------------------------------
// TEST 6: Settings Page Theme Selector Integration
// --------------------------------------------------------------------------
test('Settings UI: dashboard/settings/index.html includes theme selector section', () => {
  const html = fs.readFileSync(path.join(ROOT, 'dashboard/settings/index.html'), 'utf8');
  assert.ok(html.includes('id="theme-selector-container"'), 'Settings HTML must provide theme-selector-container');
  assert.ok(html.includes('Interface Theme'), 'Settings HTML must have Interface Theme title');

  const settingsJs = fs.readFileSync(path.join(ROOT, 'js/settings.js'), 'utf8');
  assert.ok(settingsJs.includes('renderThemeSettingsSelector'), 'js/settings.js must call renderThemeSettingsSelector');
});

// --------------------------------------------------------------------------
// TEST 7: Anti-FOUC Synchronous Head Script
// --------------------------------------------------------------------------
test('Anti-FOUC: HTML pages contain synchronous head loader defaulting to dark', () => {
  const samplePages = [
    'index.html',
    'templates/demo.html',
    'dashboard/index.html',
    'dashboard/settings/index.html',
    'dashboard/analytics/index.html',
    'u/index.html',
    'blog/index.html',
    'login/index.html'
  ];

  samplePages.forEach(p => {
    const content = fs.readFileSync(path.join(ROOT, p), 'utf8');
    assert.ok(
      content.includes("localStorage.getItem('folioryn_theme') || localStorage.getItem('theme')"),
      `${p} must include theme storage check`
    );
    assert.ok(
      content.includes("document.documentElement.setAttribute('data-theme', theme)"),
      `${p} must set data-theme dynamically before body renders`
    );
  });
});

// --------------------------------------------------------------------------
// TEST 8: Main Navigation & Toggle Buttons
// --------------------------------------------------------------------------
test('Navigation: #theme-toggle button exists in global navbars & topbars', () => {
  const pagesWithToggle = [
    'index.html',
    'templates/demo.html',
    'dashboard/settings/index.html',
    'dashboard/analytics/index.html',
    'dashboard/builder/index.html',
    'dashboard/index.html',
    'u/index.html',
    'explore/index.html'
  ];

  pagesWithToggle.forEach(p => {
    const content = fs.readFileSync(path.join(ROOT, p), 'utf8');
    assert.ok(
      content.includes('id="theme-toggle"'),
      `${p} must include #theme-toggle button`
    );
  });
});

// --------------------------------------------------------------------------
// TEST 9: CSS Dropdown & Settings Card Styles
// --------------------------------------------------------------------------
test('Theme CSS: components.css & main.css style dropdown and preview cards', () => {
  const compCss = fs.readFileSync(path.join(ROOT, 'css/components.css'), 'utf8');
  const mainCss = fs.readFileSync(path.join(ROOT, 'css/main.css'), 'utf8');

  assert.ok(compCss.includes('.theme-dropdown-menu'), 'components.css must define .theme-dropdown-menu');
  assert.ok(compCss.includes('.theme-options-grid'), 'components.css must define .theme-options-grid');
  assert.ok(compCss.includes('.theme-option-card'), 'components.css must define .theme-option-card');
  assert.ok(compCss.includes('.theme-card-preview'), 'components.css must define .theme-card-preview');

  assert.ok(mainCss.includes('[data-theme="dark"] .theme-toggle-btn .icon-moon'), 'main.css must style dark moon icon');
  assert.ok(mainCss.includes('[data-theme="light"] .theme-toggle-btn .icon-sun'), 'main.css must style light sun icon');
  assert.ok(mainCss.includes('[data-theme="night"] .theme-toggle-btn .icon-star'), 'main.css must style night star icon');
});

// --------------------------------------------------------------------------
// TEST 10: Theme Transition Sequence & Cyclic Rotation
// --------------------------------------------------------------------------
test('Transitions: Dark -> Light -> Night -> Dark cyclic sequence is correct', () => {
  const sequence = ['dark', 'light', 'night'];
  sequence.forEach((current, idx) => {
    const nextExpected = sequence[(idx + 1) % sequence.length];
    const nextIdx = (THEME_LIST.indexOf(current) + 1) % THEME_LIST.length;
    assert.strictEqual(THEME_LIST[nextIdx], nextExpected, `${current} must cycle to ${nextExpected}`);
  });
});

// --------------------------------------------------------------------------
// TEST 11: Accessible Role & State Attributes
// --------------------------------------------------------------------------
test('Accessibility: Theme selectors declare WCAG AA radiogroup & radio semantics', () => {
  const themeJs = fs.readFileSync(path.join(ROOT, 'js/theme.js'), 'utf8');
  assert.ok(themeJs.includes('role="radiogroup"'), 'Theme settings container must declare role="radiogroup"');
  assert.ok(themeJs.includes('role="radio"'), 'Theme option cards must declare role="radio"');
  assert.ok(themeJs.includes('aria-checked'), 'Theme option cards must declare aria-checked state');
  assert.ok(themeJs.includes('tabindex="0"'), 'Theme cards must support keyboard tab navigation');
  assert.ok(themeJs.includes("setAttribute('role', 'menu')") || themeJs.includes('role="menu"'), 'Compact dropdown menu must declare role="menu"');
  assert.ok(themeJs.includes('role="menuitemradio"'), 'Dropdown items must declare role="menuitemradio"');
});

console.log(`\n--- THEME TEST SUMMARY: ${passed} / ${total} TESTS PASSED ---`);
if (passed === total) {
  console.log('ALL THEME TESTS PASSED SUCCESSFULLY! ✓\n');
} else {
  process.exit(1);
}
