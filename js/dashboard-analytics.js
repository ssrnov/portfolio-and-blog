/**
 * Folioryn — Advanced Portfolio & Project Analytics Controller
 * Features:
 * - Project-level telemetry: Detail views, GitHub clicks, demo clicks, interaction rates
 * - Analytics date comparison: 7d, 30d, 90d, custom date boundaries with equal previous period comparison
 * - Zero-safe percentage change calculation
 * - Responsive vector SVG trend charts with tooltips and accessible text table summaries
 * - Project performance table with live search, sorting, and deleted project handling
 * - Project detail drill-down panel with defined interaction rate formula
 * - Privacy-respecting referrer and device breakdown
 */

import {
  getProfile,
  getProjects,
  getAnalyticsEvents,
  getDateRangeBoundaries,
  calculatePeriodMetrics,
  comparePeriods
} from './profile-data.js';

// Application State
const state = {
  preset: '30d',
  customStart: null,
  customEnd: null,
  selectedProjectId: 'all',
  searchQuery: '',
  sortField: 'interactions',
  sortOrder: 'desc',
  activeDrilldownProjectId: null,
  events: [],
  projects: [],
  boundaries: null,
  currentMetrics: null,
  previousMetrics: null,
  comparison: null,
  isLoading: false,
  error: null
};

document.addEventListener('DOMContentLoaded', () => {
  initAnalyticsDashboard();
});

function initAnalyticsDashboard() {
  const profile = getProfile();
  const username = profile?.username || 'sunny';
  
  // Set user snippet in sidebar if available
  const userSnippetName = document.querySelector('.user-info-text h4');
  const userSnippetSlug = document.querySelector('.user-info-text p');
  if (userSnippetName) userSnippetName.textContent = profile?.fullName || username;
  if (userSnippetSlug) userSnippetSlug.textContent = `/u/${username}`;

  // Timezone indicator
  const tzIndicator = document.getElementById('tz-indicator');
  if (tzIndicator) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      tzIndicator.textContent = `Timezone: ${tz || 'Local'}`;
    } catch (e) {}
  }

  // Load projects list
  state.projects = getProjects();
  populateProjectFilterDropdown(state.projects);

  // Setup event listeners
  bindControls();

  // Load and render analytics
  refreshAnalytics(username);
}

function bindControls() {
  const profile = getProfile();
  const username = profile?.username || 'sunny';

  // Preset Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const preset = btn.getAttribute('data-preset');
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const customBox = document.getElementById('custom-date-container');
      if (preset === 'custom') {
        if (customBox) customBox.style.display = 'flex';
        // Initialize custom date pickers with default 30d range
        const now = new Date();
        const start30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        const startInput = document.getElementById('custom-start-date');
        const endInput = document.getElementById('custom-end-date');
        if (startInput && !startInput.value) startInput.value = start30.toISOString().slice(0, 10);
        if (endInput && !endInput.value) endInput.value = now.toISOString().slice(0, 10);
      } else {
        if (customBox) customBox.style.display = 'none';
        state.preset = preset;
        state.customStart = null;
        state.customEnd = null;
        refreshAnalytics(username);
      }
    });
  });

  // Apply Custom Date Range
  const applyCustomBtn = document.getElementById('apply-custom-date-btn');
  if (applyCustomBtn) {
    applyCustomBtn.addEventListener('click', () => {
      const startVal = document.getElementById('custom-start-date')?.value;
      const endVal = document.getElementById('custom-end-date')?.value;

      if (!startVal || !endVal) {
        showStatusNotice('Please choose both a start and an end date.', 'error');
        return;
      }

      if (new Date(endVal) < new Date(startVal)) {
        showStatusNotice('End date cannot be earlier than start date.', 'error');
        return;
      }

      state.preset = 'custom';
      state.customStart = startVal;
      state.customEnd = endVal;
      refreshAnalytics(username);
    });
  }

  // Project Filter Dropdown
  const projSelect = document.getElementById('project-filter-select');
  if (projSelect) {
    projSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      state.selectedProjectId = val;
      if (val !== 'all') {
        openProjectDetailPanel(val);
      } else {
        closeProjectDetailPanel();
      }
      refreshAnalytics(username);
    });
  }

  // Table Search Input (with debounce)
  const searchInput = document.getElementById('project-search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = (e.target.value || '').trim().toLowerCase();
        renderProjectPerformanceTable();
      }, 150);
    });
  }

  // Table Sort Dropdown
  const sortSelect = document.getElementById('project-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const [field, order] = e.target.value.split('-');
      state.sortField = field;
      state.sortOrder = order || 'desc';
      renderProjectPerformanceTable();
    });
  }

  // Table Header Click Sorts
  document.querySelectorAll('#project-performance-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const sortKey = th.getAttribute('data-sort');
      if (state.sortField === sortKey) {
        state.sortOrder = state.sortOrder === 'desc' ? 'asc' : 'desc';
      } else {
        state.sortField = sortKey;
        state.sortOrder = 'desc';
      }
      // Update sort dropdown UI
      if (sortSelect) {
        const matchingOpt = `${state.sortField}-${state.sortOrder}`;
        if (sortSelect.querySelector(`option[value="${matchingOpt}"]`)) {
          sortSelect.value = matchingOpt;
        }
      }
      renderProjectPerformanceTable();
    });
  });

  // Project Detail Panel Close Button
  const closeDetailBtn = document.getElementById('proj-detail-close-btn');
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', () => {
      closeProjectDetailPanel();
      if (projSelect) projSelect.value = 'all';
      state.selectedProjectId = 'all';
      refreshAnalytics(username);
    });
  }

  // Retry Button
  const retryBtn = document.getElementById('analytics-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      const errBanner = document.getElementById('analytics-error-banner');
      if (errBanner) errBanner.style.display = 'none';
      refreshAnalytics(username);
    });
  }
}

function populateProjectFilterDropdown(projects) {
  const select = document.getElementById('project-filter-select');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="all">All Projects &amp; Overview</option>';

  if (Array.isArray(projects)) {
    projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.title;
      select.appendChild(opt);
    });
  }

  if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
    select.value = currentVal;
  }
}

function refreshAnalytics(username) {
  try {
    // 1. Calculate Date Boundaries
    state.boundaries = getDateRangeBoundaries(state.preset, state.customStart, state.customEnd);
    
    // Update comparison banner labels
    const curLabelEl = document.getElementById('current-range-label');
    const prevLabelEl = document.getElementById('prev-range-label');
    if (curLabelEl) curLabelEl.textContent = state.boundaries.current.label;
    if (prevLabelEl) prevLabelEl.textContent = state.boundaries.previous.label;

    // 2. Fetch Raw Events
    state.events = getAnalyticsEvents(username);

    // 3. Compute Metrics for Current and Previous Equal Periods
    const filterId = state.selectedProjectId !== 'all' ? state.selectedProjectId : null;
    state.currentMetrics = calculatePeriodMetrics(
      state.events,
      state.boundaries.current.start,
      state.boundaries.current.end,
      filterId
    );

    state.previousMetrics = calculatePeriodMetrics(
      state.events,
      state.boundaries.previous.start,
      state.boundaries.previous.end,
      filterId
    );

    // 4. Compute Period Comparisons (with Zero-Safe Division)
    state.comparison = comparePeriods(state.currentMetrics, state.previousMetrics);

    // 5. Render All UI Views Synchronously
    renderOverviewCards();
    renderInteractiveTrendChart();
    renderProjectPerformanceTable();
    renderReferrersAndDevices();
    renderActivityFeed();

    // 6. If project drill-down is open, refresh drill-down panel
    if (state.activeDrilldownProjectId) {
      renderProjectDetailPanel(state.activeDrilldownProjectId);
    }

  } catch (err) {
    console.error('Analytics aggregation error:', err);
    const errBanner = document.getElementById('analytics-error-banner');
    const errText = document.getElementById('analytics-error-text');
    if (errBanner) errBanner.style.display = 'block';
    if (errText) errText.textContent = `Error calculating metrics: ${err.message || 'Unexpected failure'}`;
  }
}

function renderOverviewCards() {
  const m = state.currentMetrics;
  const c = state.comparison;
  if (!m || !c) return;

  const cards = [
    {
      valId: 'metric-portfolio-views',
      badgeId: 'badge-portfolio-views',
      prevId: 'prev-portfolio-views',
      current: m.portfolioViews,
      cmp: c.portfolioViews,
      label: 'Portfolio views'
    },
    {
      valId: 'metric-project-views',
      badgeId: 'badge-project-views',
      prevId: 'prev-project-views',
      current: m.projectViews,
      cmp: c.projectViews,
      label: 'Project views'
    },
    {
      valId: 'metric-github-clicks',
      badgeId: 'badge-github-clicks',
      prevId: 'prev-github-clicks',
      current: m.githubClicks,
      cmp: c.githubClicks,
      label: 'GitHub clicks'
    },
    {
      valId: 'metric-demo-clicks',
      badgeId: 'badge-demo-clicks',
      prevId: 'prev-demo-clicks',
      current: m.demoClicks,
      cmp: c.demoClicks,
      label: 'Demo clicks'
    },
    {
      valId: 'metric-resume-downloads',
      badgeId: 'badge-resume-downloads',
      prevId: 'prev-resume-downloads',
      current: m.resumeDownloads,
      cmp: c.resumeDownloads,
      label: 'Resume downloads'
    },
    {
      valId: 'metric-contact-submits',
      badgeId: 'badge-contact-submits',
      prevId: 'prev-contact-submits',
      current: m.contactSubmissions,
      cmp: c.contactSubmissions,
      label: 'Contact inquiries'
    }
  ];

  cards.forEach(({ valId, badgeId, prevId, current, cmp }) => {
    const valEl = document.getElementById(valId);
    const badgeEl = document.getElementById(badgeId);
    const prevEl = document.getElementById(prevId);

    if (valEl) valEl.textContent = Number(current).toLocaleString();
    
    if (badgeEl && cmp) {
      badgeEl.className = `trend-badge trend-${cmp.trend}`;
      const arrow = cmp.trend === 'up' ? '&uarr; ' : (cmp.trend === 'down' ? '&darr; ' : '');
      badgeEl.innerHTML = `${arrow}${cmp.text}`;
    }

    if (prevEl && cmp) {
      const prevVal = Number(current - cmp.diff);
      prevEl.textContent = `Previous period: ${prevVal.toLocaleString()} (${cmp.diff >= 0 ? '+' : ''}${cmp.diff})`;
    }
  });
}

function renderInteractiveTrendChart() {
  const container = document.getElementById('chart-container');
  if (!container) return;

  const timeline = state.currentMetrics?.timeline || [];

  // Update chart headline if filtering by project
  const headline = document.getElementById('chart-headline');
  const subhead = document.getElementById('chart-subhead');
  if (headline) {
    if (state.selectedProjectId !== 'all') {
      const p = state.projects.find(x => x.id === state.selectedProjectId);
      headline.textContent = `Project Activity: ${p ? p.title : state.selectedProjectId}`;
      if (subhead) subhead.textContent = `Showing views and clicks across ${state.boundaries.current.label}`;
    } else {
      headline.textContent = 'Visitor Traffic & Project Interactions Over Time';
      if (subhead) subhead.textContent = `Daily activity points for ${state.boundaries.current.label}`;
    }
  }

  // Handle empty state
  if (timeline.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 24px; border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary);">
        <p style="font-weight: 700; color: var(--text-primary); font-size: var(--text-sm); margin: 0 0 4px 0;">No telemetry activity recorded in this period</p>
        <p style="font-size: var(--text-xs); color: var(--text-muted); margin: 0;">
          Select a broader date range or share your public link to track visitor interactions.
        </p>
      </div>
    `;
    return;
  }

  // Build SVG Chart
  const width = 800;
  const height = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Find max value across all points (min 5 for reasonable scale)
  const maxVal = Math.max(
    5,
    ...timeline.map(d => Math.max(d.portfolioViews || 0, d.projectViews || 0, d.interactions || 0))
  );

  const nPoints = timeline.length;
  const xStep = nPoints > 1 ? chartW / (nPoints - 1) : chartW / 2;

  const getY = (val) => padTop + chartH - ((val / maxVal) * chartH);
  const getX = (idx) => padLeft + (nPoints > 1 ? idx * xStep : chartW / 2);

  // Generate paths
  const viewsPoints = timeline.map((d, i) => `${getX(i)},${getY(d.portfolioViews || 0)}`).join(' ');
  const projViewsPoints = timeline.map((d, i) => `${getX(i)},${getY(d.projectViews || 0)}`).join(' ');
  const interPoints = timeline.map((d, i) => `${getX(i)},${getY(d.interactions || 0)}`).join(' ');

  // Gridlines & Y-labels (4 lines)
  let gridLinesSvg = '';
  for (let step = 0; step <= 4; step++) {
    const val = Math.round((maxVal / 4) * step);
    const y = getY(val);
    gridLinesSvg += `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="2,2" />
      <text x="${padLeft - 8}" y="${y + 4}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="end">${val}</text>
    `;
  }

  // X-axis date labels (show ~5 to 7 labels)
  const labelInterval = Math.max(1, Math.floor(nPoints / 6));
  let xLabelsSvg = '';
  timeline.forEach((d, i) => {
    if (i % labelInterval === 0 || i === nPoints - 1) {
      const x = getX(i);
      const dateParts = d.date.split('-');
      const label = `${dateParts[1]}/${dateParts[2]}`;
      xLabelsSvg += `
        <text x="${x}" y="${height - 10}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${label}</text>
      `;
    }
  });

  // Interactive Hover Markers
  let hoverDotsSvg = '';
  timeline.forEach((d, i) => {
    const x = getX(i);
    const yV = getY(d.portfolioViews || 0);
    const yPV = getY(d.projectViews || 0);
    const yI = getY(d.interactions || 0);

    hoverDotsSvg += `
      <g class="chart-point-group" tabindex="0" role="button" aria-label="${d.date}: ${d.portfolioViews} portfolio views, ${d.projectViews} project views, ${d.interactions} interactions">
        <circle cx="${x}" cy="${yV}" r="4" fill="var(--accent-primary)" stroke="var(--bg-surface)" stroke-width="2">
          <title>${d.date}: ${d.portfolioViews} Portfolio Views</title>
        </circle>
        <circle cx="${x}" cy="${yPV}" r="3.5" fill="#38bdf8" stroke="var(--bg-surface)" stroke-width="2">
          <title>${d.date}: ${d.projectViews} Project Views</title>
        </circle>
        <circle cx="${x}" cy="${yI}" r="3.5" fill="#22c55e" stroke="var(--bg-surface)" stroke-width="2">
          <title>${d.date}: ${d.interactions} Interactions</title>
        </circle>
      </g>
    `;
  });

  // Screen reader table summary for WCAG 2.2 AA accessibility
  const srTableRows = timeline.map(d => `
    <tr>
      <th scope="row">${d.date}</th>
      <td>${d.portfolioViews}</td>
      <td>${d.projectViews}</td>
      <td>${d.interactions}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Line chart of portfolio views and project interactions over time">
      ${gridLinesSvg}
      <polyline fill="none" stroke="var(--accent-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${viewsPoints}" />
      <polyline fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${projViewsPoints}" />
      <polyline fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${interPoints}" />
      ${xLabelsSvg}
      ${hoverDotsSvg}
    </svg>
    <table class="sr-only" aria-label="Data summary for visitor traffic chart">
      <caption>Daily Telemetry Points</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Portfolio Views</th>
          <th scope="col">Project Views</th>
          <th scope="col">Interactions</th>
        </tr>
      </thead>
      <tbody>
        ${srTableRows}
      </tbody>
    </table>
  `;
}

function renderProjectPerformanceTable() {
  const tbody = document.getElementById('project-table-tbody');
  if (!tbody) return;

  const currentStats = state.currentMetrics?.projectStats || {};
  const prevStats = state.previousMetrics?.projectStats || {};

  // Build unified project rows from user projects + historical recorded projects
  const rowsMap = new Map();

  // 1. Add active projects
  (state.projects || []).forEach(p => {
    rowsMap.set(String(p.id), {
      id: String(p.id),
      title: p.title || 'Untitled Project',
      category: p.category || 'Software',
      isDeleted: false,
      curViews: 0,
      curGithub: 0,
      curDemo: 0,
      curInteractions: 0,
      prevInteractions: 0
    });
  });

  // 2. Populate stats from current period
  Object.values(currentStats).forEach(s => {
    const pid = String(s.projectId);
    if (!rowsMap.has(pid)) {
      rowsMap.set(pid, {
        id: pid,
        title: s.projectTitle || `Historical Project (${pid})`,
        category: 'Archived',
        isDeleted: true,
        curViews: 0,
        curGithub: 0,
        curDemo: 0,
        curInteractions: 0,
        prevInteractions: 0
      });
    }
    const item = rowsMap.get(pid);
    item.curViews = s.views || 0;
    item.curGithub = s.githubClicks || 0;
    item.curDemo = s.demoClicks || 0;
    item.curInteractions = s.interactions || 0;
  });

  // 3. Populate stats from previous period
  Object.values(prevStats).forEach(s => {
    const pid = String(s.projectId);
    if (!rowsMap.has(pid)) {
      rowsMap.set(pid, {
        id: pid,
        title: s.projectTitle || `Historical Project (${pid})`,
        category: 'Archived',
        isDeleted: true,
        curViews: 0,
        curGithub: 0,
        curDemo: 0,
        curInteractions: 0,
        prevInteractions: 0
      });
    }
    const item = rowsMap.get(pid);
    item.prevInteractions = s.interactions || 0;
  });

  let rows = Array.from(rowsMap.values());

  // Filter by search query
  if (state.searchQuery) {
    rows = rows.filter(r => r.title.toLowerCase().includes(state.searchQuery));
  }

  // Sort rows
  rows.sort((a, b) => {
    let diff = 0;
    if (state.sortField === 'views') diff = a.curViews - b.curViews;
    else if (state.sortField === 'github') diff = a.curGithub - b.curGithub;
    else if (state.sortField === 'demo') diff = a.curDemo - b.curDemo;
    else if (state.sortField === 'title') return state.sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    else diff = a.curInteractions - b.curInteractions; // default 'interactions'

    return state.sortOrder === 'desc' ? -diff : diff;
  });

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: var(--text-secondary);">No projects found</p>
          <span style="font-size: 11px;">Create projects in the Projects section or adjust your search filter.</span>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const cmp = compareMetric(r.curInteractions, r.prevInteractions);
    const arrow = cmp.trend === 'up' ? '&uarr; ' : (cmp.trend === 'down' ? '&darr; ' : '');
    const badgeHtml = `<span class="trend-badge trend-${cmp.trend}" style="font-size: 10px;">${arrow}${cmp.text}</span>`;
    const deletedBadge = r.isDeleted ? `<span class="badge" style="font-size: 9px; margin-left: 4px; background: rgba(244, 63, 94, 0.15); color: #f43f5e;">Archived</span>` : '';

    return `
      <tr data-project-id="${escapeHtml(r.id)}">
        <td class="proj-name-cell">
          <div style="font-weight: 700; color: var(--text-primary);">${escapeHtml(r.title)} ${deletedBadge}</div>
          <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted);">${escapeHtml(r.category)}</span>
        </td>
        <td class="num-cell">${r.curViews.toLocaleString()}</td>
        <td class="num-cell">${r.curGithub.toLocaleString()}</td>
        <td class="num-cell">${r.curDemo.toLocaleString()}</td>
        <td class="num-cell" style="color: var(--accent-primary);">${r.curInteractions.toLocaleString()}</td>
        <td>${badgeHtml}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button type="button" class="btn btn-secondary btn-card row-drilldown-btn" data-id="${escapeHtml(r.id)}" style="font-size: 11px; padding: 4px 10px;">
            Drilldown &rarr;
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Bind drilldown buttons in table rows
  tbody.querySelectorAll('.row-drilldown-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-id');
      if (pid) {
        const select = document.getElementById('project-filter-select');
        if (select && select.querySelector(`option[value="${pid}"]`)) {
          select.value = pid;
          state.selectedProjectId = pid;
        }
        openProjectDetailPanel(pid);
        const profile = getProfile();
        refreshAnalytics(profile?.username || 'sunny');
      }
    });
  });
}

function openProjectDetailPanel(projectId) {
  state.activeDrilldownProjectId = projectId;
  const panel = document.getElementById('project-detail-panel');
  if (panel) {
    panel.style.display = 'block';
    renderProjectDetailPanel(projectId);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function closeProjectDetailPanel() {
  state.activeDrilldownProjectId = null;
  const panel = document.getElementById('project-detail-panel');
  if (panel) panel.style.display = 'none';
}

function renderProjectDetailPanel(projectId) {
  const p = state.projects.find(x => String(x.id) === String(projectId));
  const stats = state.currentMetrics?.projectStats?.[String(projectId)] || {
    views: 0,
    githubClicks: 0,
    demoClicks: 0,
    interactions: 0
  };
  const prevStats = state.previousMetrics?.projectStats?.[String(projectId)] || {
    views: 0,
    githubClicks: 0,
    demoClicks: 0,
    interactions: 0
  };

  const titleEl = document.getElementById('proj-detail-title');
  const badgeEl = document.getElementById('proj-detail-badge');
  const editLink = document.getElementById('proj-detail-edit-link');

  if (titleEl) titleEl.textContent = p ? p.title : `Project ${projectId}`;
  if (badgeEl) badgeEl.textContent = p?.category ? `${p.category} Project` : 'Project Analytics';
  if (editLink) editLink.href = `/dashboard/projects/`;

  // Views
  const viewsEl = document.getElementById('proj-metric-views');
  const prevViewsEl = document.getElementById('proj-prev-views');
  if (viewsEl) viewsEl.textContent = stats.views.toLocaleString();
  if (prevViewsEl) prevViewsEl.textContent = `Prev: ${prevStats.views.toLocaleString()}`;

  // GitHub Clicks
  const ghEl = document.getElementById('proj-metric-github');
  const prevGhEl = document.getElementById('proj-prev-github');
  if (ghEl) ghEl.textContent = stats.githubClicks.toLocaleString();
  if (prevGhEl) prevGhEl.textContent = `Prev: ${prevStats.githubClicks.toLocaleString()}`;

  // Demo Clicks
  const demoEl = document.getElementById('proj-metric-demo');
  const prevDemoEl = document.getElementById('proj-prev-demo');
  if (demoEl) demoEl.textContent = stats.demoClicks.toLocaleString();
  if (prevDemoEl) prevDemoEl.textContent = `Prev: ${prevStats.demoClicks.toLocaleString()}`;

  // Interaction Rate: (Total Interactions / Total Portfolio Views) * 100%
  const portViews = state.currentMetrics?.portfolioViews || 1;
  const rate = Math.round((stats.interactions / portViews) * 1000) / 10;
  const rateEl = document.getElementById('proj-metric-rate');
  if (rateEl) rateEl.textContent = `${rate}%`;
}

function renderReferrersAndDevices() {
  const referrers = state.currentMetrics?.referrers || [];
  const container = document.getElementById('referrers-list-container');
  const profile = getProfile();
  const username = profile?.username || 'sunny';

  if (container) {
    if (referrers.length > 0) {
      const total = referrers.reduce((acc, r) => acc + r.count, 0) || 1;
      container.innerHTML = referrers.map(r => {
        const pct = Math.round((r.count / total) * 100);
        return `
          <div style="margin-bottom: var(--space-3);">
            <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 4px;">
              <span style="font-family: var(--font-mono); color: var(--text-primary); font-weight: 600;">${escapeHtml(r.source)}</span>
              <span style="color: var(--text-secondary);">${r.count.toLocaleString()} (${pct}%)</span>
            </div>
            <div style="height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: var(--accent-primary); border-radius: 3px;"></div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary);">
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0 0 4px 0;">No external referrers in this period.</p>
          <span style="font-size: 11px; color: var(--text-muted);">Share your link <code>folioryn.dev/u/${escapeHtml(username)}</code> to collect referrer sources.</span>
        </div>
      `;
    }
  }

  // Devices
  const dev = state.currentMetrics?.devices || { desktop: 0, mobile: 0, tablet: 0 };
  const totalDev = (dev.desktop + dev.mobile + dev.tablet) || 1;

  const dPct = Math.round((dev.desktop / totalDev) * 100);
  const mPct = Math.round((dev.mobile / totalDev) * 100);
  const tPct = Math.round((dev.tablet / totalDev) * 100);

  const dEl = document.getElementById('dev-desktop-pct');
  const mEl = document.getElementById('dev-mobile-pct');
  const tEl = document.getElementById('dev-tablet-pct');

  if (dEl) dEl.textContent = `${dPct}%`;
  if (mEl) mEl.textContent = `${mPct}%`;
  if (tEl) tEl.textContent = `${tPct}%`;
}

function renderActivityFeed() {
  const container = document.getElementById('recent-events-container');
  if (!container) return;

  const events = (state.events || []).slice(0, 8);

  if (events.length > 0) {
    container.innerHTML = events.map(evt => {
      const eventName = (evt.event_type || 'view').replace(/_/g, ' ').toUpperCase();
      const pathLabel = evt.project_title || evt.portfolio_slug || 'Portfolio';
      const timeStr = new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const refStr = evt.referrer || 'Direct';

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); font-size: var(--text-xs);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="pulsing-dot" style="width: 6px; height: 6px; background: var(--accent-primary); border-radius: 50%;"></span>
            <strong style="color: var(--text-primary); font-family: var(--font-mono); font-size: 11px;">${escapeHtml(eventName)}</strong>
            <span style="color: var(--text-secondary); font-size: 11px;">${escapeHtml(pathLabel)}</span>
          </div>
          <div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 11px;">
            ${escapeHtml(refStr)} &bull; ${timeStr}
          </div>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary);">
        <p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0;">No visitor events recorded yet.</p>
      </div>
    `;
  }
}

function showStatusNotice(message, type = 'info') {
  const el = document.getElementById('analytics-status-msg');
  if (!el) return;
  el.style.display = 'block';
  el.style.color = type === 'error' ? '#f43f5e' : 'var(--accent-primary)';
  el.style.fontSize = '12px';
  el.style.fontWeight = '600';
  el.textContent = message;
  setTimeout(() => {
    el.style.display = 'none';
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
