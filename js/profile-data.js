/**
 * ProfileFolio — Multi-User Profile, Education, Skills, Experience & Publishing Data Engine
 * Provides user-scoped CRUD operations with Supabase integration and robust localStorage fallback.
 */

import { supabase, isSupabaseConfigured, MOCK_USER_PROFILE, analyticsService } from './supabase.js';

// Default initial state for default/demo user "sunny"
export const DEFAULT_PROFILE = {
  fullName: "Sunny",
  username: "sunny",
  headline: "Full-Stack Software Engineer & Systems Builder",
  bio: "Architecting scalable web applications, distributed backend pipelines, and minimalist user interfaces. Passionate about native web standards, clean architecture, and performance engineering.",
  location: "Bangalore, India",
  email: "sunny@profilefolio.dev",
  portfolioUrl: "https://profilefolio.dev/u/sunny",
  githubUrl: "https://github.com/ssrnov",
  linkedinUrl: "https://linkedin.com/in/ssrnov",
  twitterUrl: "https://x.com/ssrnov",
  availability: "Open to opportunities",
  theme: "dark"
};

export const DEFAULT_EDUCATION = [
  {
    id: "edu-1",
    institution: "SRM Institute of Science and Technology",
    institutionType: "university",
    qualification: "Bachelor of Technology (B.Tech)",
    fieldOfStudy: "Computer Science & Engineering",
    startDate: "2022-08",
    endDate: "2026-05",
    currentlyStudying: true,
    gradeType: "CGPA",
    gradeValue: "9.24",
    gradeScale: "10.0",
    coursework: "Data Structures, Algorithms, Distributed Systems, Database Management, Operating Systems, Web Technologies",
    achievements: "Dean's Merit List &bull; Core Technical Member at TechSpace BuildLab",
    displayOnPortfolio: true
  },
  {
    id: "edu-2",
    institution: "Delhi Public School",
    institutionType: "school",
    qualification: "Senior Secondary (Class XII)",
    fieldOfStudy: "Science (PCM + Computer Science)",
    startDate: "2020-04",
    endDate: "2022-03",
    currentlyStudying: false,
    gradeType: "Percentage",
    gradeValue: "96.4",
    gradeScale: "100",
    coursework: "Physics, Chemistry, Mathematics, Python Programming, English",
    achievements: "First in Computer Science &bull; National Science Olympiad Qualifier",
    displayOnPortfolio: true
  }
];

export const DEFAULT_SKILLS = [
  { id: "sk-1", name: "JavaScript (ESNext)", category: "languages", proficiency: "Expert", years: "4" },
  { id: "sk-2", name: "TypeScript", category: "languages", proficiency: "Advanced", years: "3" },
  { id: "sk-3", name: "Python", category: "languages", proficiency: "Advanced", years: "3" },
  { id: "sk-4", name: "HTML5 & CSS3", category: "frontend", proficiency: "Expert", years: "4" },
  { id: "sk-5", name: "Vite & Modern Tooling", category: "frontend", proficiency: "Advanced", years: "2" },
  { id: "sk-6", name: "Node.js & Express", category: "backend", proficiency: "Expert", years: "3" },
  { id: "sk-7", name: "PostgreSQL & Supabase", category: "databases", proficiency: "Advanced", years: "2" },
  { id: "sk-8", name: "Redis", category: "databases", proficiency: "Intermediate", years: "1" },
  { id: "sk-9", name: "Docker & Linux", category: "cloud", proficiency: "Intermediate", years: "2" },
  { id: "sk-10", name: "Git & GitHub Actions", category: "tools", proficiency: "Advanced", years: "4" }
];

export const DEFAULT_EXPERIENCES = [
  {
    id: "exp-1",
    organization: "TechSpace BuildLab",
    role: "Full-Stack Engineering Fellow",
    startDate: "2025-08",
    endDate: "",
    currentlyActive: true,
    location: "Hybrid",
    description: "Architected multi-tenant portfolio platform, responsive design system tokens, and client-side encryption modules.",
    displayOnPortfolio: true
  },
  {
    id: "exp-2",
    organization: "Open Source Contributor",
    role: "Core Contributor",
    startDate: "2024-01",
    endDate: "",
    currentlyActive: true,
    location: "Remote",
    description: "Authored developer tooling, documentation, and performance patches for modern web ecosystem projects.",
    displayOnPortfolio: true
  }
];

export const DEFAULT_CERTIFICATIONS = [
  {
    id: "cert-1",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    issueDate: "2025-04",
    credentialUrl: "https://aws.amazon.com/verification",
    displayOnPortfolio: true
  },
  {
    id: "cert-2",
    title: "Full Stack Web Engineering Certification",
    issuer: "TechSpace BuildLab",
    issueDate: "2026-01",
    credentialUrl: "https://buildlab.dev/verify",
    displayOnPortfolio: true
  }
];

export const DEFAULT_PROJECTS = [
  {
    id: "proj_1",
    title: "Distributed Task Queue & Worker Engine",
    description: "Fault-tolerant asynchronous task runner with priority queueing, worker pool concurrency control, and dead-letter retries.",
    category: "Backend",
    tags: ["Redis", "Node.js", "Concurrency"],
    repo_url: "https://github.com/ssrnov",
    live_url: "",
    stars_count: 42,
    featured: true
  },
  {
    id: "proj_2",
    title: "Real-Time Cloud Observability Dashboard",
    description: "Zero-dependency cloud observability visualizer streaming live metrics via WebSockets with canvas charts at 60fps.",
    category: "Web",
    tags: ["JavaScript", "WebSockets", "Canvas"],
    repo_url: "https://github.com/ssrnov",
    live_url: "https://ssrnovx.dev",
    stars_count: 28,
    featured: true
  },
  {
    id: "proj_3",
    title: "Client-Side Cryptographic Vault",
    description: "End-to-end encrypted secret store executing in-browser via Web Crypto API with AES-256-GCM encryption.",
    category: "Security",
    tags: ["Web Crypto", "AES-256", "Security"],
    repo_url: "https://github.com/ssrnov",
    live_url: "",
    stars_count: 19,
    featured: false
  }
];

export const DEFAULT_PUBLISH_SETTINGS = {
  status: "published",
  isPublished: true,
  publicSlug: "sunny",
  templateId: "minimal-professional",
  publishedAt: "2026-10-09T18:00:00.000Z",
  previewToken: null,
  previewTokenExpiresAt: null,
  sectionVisibility: {
    hero: true,
    about: true,
    education: true,
    skills: true,
    projects: true,
    experience: true,
    certifications: true,
    blog: true,
    contact: true
  }
};

export const DEFAULT_ANALYTICS = {
  totalViews: 0,
  uniqueReferrers: 0,
  projectClicks: 0,
  resumeDownloads: 0,
  referrers: [],
  devices: { desktop: 0, mobile: 0, tablet: 0 },
  recentEvents: []
};

// ==========================================
// User Context Resolution
// ==========================================
export function getActiveUser() {
  try {
    const raw = localStorage.getItem('profilefolio_session') || 
                localStorage.getItem('profilefolio_active_user') ||
                localStorage.getItem('ssrnovx_mock_session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function getActiveUserId() {
  const user = getActiveUser();
  if (user?.id) return user.id;
  if (user?.username === 'sunny') return 'usr_mock_sunny_9921';
  return null;
}

export function isDemoSunnySession() {
  const user = getActiveUser();
  return !user || user.username === 'sunny' || user.id === 'usr_mock_sunny_9921';
}

function userKey(resource) {
  const uid = getActiveUserId();
  if (!uid || uid === 'usr_mock_sunny_9921') {
    return `profilefolio_${resource}`;
  }
  return `profilefolio_user_${uid}_${resource}`;
}

// ==========================================
// Profile CRUD
// ==========================================
export function getProfile() {
  try {
    const user = getActiveUser();
    
    // If no session exists at all (public visitor mode), return demo profile
    if (!user) {
      return { ...DEFAULT_PROFILE };
    }

    const uid = user.id || 'usr_mock_sunny_9921';
    const isSunny = user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

    // 1. Check user-scoped key
    const scopedKey = `profilefolio_user_${uid}_profile`;
    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw) {
      return JSON.parse(scopedRaw);
    }

    // 2. If sunny, allow legacy fallbacks
    if (isSunny) {
      const legacyRaw = localStorage.getItem('profilefolio_profile') || 
                        localStorage.getItem('buildlab_profile') ||
                        localStorage.getItem('profilefolio_user_profile');
      if (legacyRaw) return JSON.parse(legacyRaw);
      return { ...DEFAULT_PROFILE };
    }

    // 3. For any other registered user: NEVER fall back to Sunny's data!
    // Initialize profile from their specific user session
    const initialProfile = {
      fullName: user.display_name || user.username || "User",
      username: user.username || "user",
      headline: user.headline || "Software Engineer & Builder",
      bio: user.bio || "Building software applications with modern web standards.",
      location: user.location || "",
      email: user.email || "",
      phone: user.phone || "",
      portfolioUrl: `https://folioryn.dev/u/${user.username}`,
      githubUrl: user.github_handle ? (user.github_handle.startsWith('http') ? user.github_handle : `https://github.com/${user.github_handle}`) : "",
      linkedinUrl: user.linkedin_url || "",
      twitterUrl: user.twitter_handle ? (user.twitter_handle.startsWith('http') ? user.twitter_handle : `https://x.com/${user.twitter_handle}`) : "",
      availability: "Open to opportunities",
      theme: "dark"
    };

    localStorage.setItem(scopedKey, JSON.stringify(initialProfile));
    return initialProfile;
  } catch (e) {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(data) {
  const current = getProfile();
  const updated = { ...current, ...data };
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const isSunny = !user || user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

  // Save to user-scoped key
  const scopedKey = `profilefolio_user_${uid}_profile`;
  localStorage.setItem(scopedKey, JSON.stringify(updated));

  if (isSunny) {
    localStorage.setItem('profilefolio_profile', JSON.stringify(updated));
    localStorage.setItem('buildlab_profile', JSON.stringify(updated));
  }

  // Update active session in memory & localStorage
  if (user) {
    user.display_name = updated.fullName || user.display_name;
    user.headline = updated.headline || user.headline;
    user.bio = updated.bio || user.bio;
    user.location = updated.location || user.location;
    if (updated.username) user.username = updated.username;
    if (updated.email) user.email = updated.email;
    if (updated.phone) user.phone = updated.phone;
    if (updated.githubUrl) {
      user.github_handle = updated.githubUrl.includes('github.com/')
        ? updated.githubUrl.split('github.com/')[1].replace(/\/+$/, '')
        : updated.githubUrl;
    }
    if (updated.linkedinUrl) user.linkedin_url = updated.linkedinUrl;
    if (updated.twitterUrl) user.twitter_handle = updated.twitterUrl;

    localStorage.setItem('profilefolio_session', JSON.stringify(user));
    localStorage.setItem('profilefolio_active_user', JSON.stringify(user));
    localStorage.setItem('ssrnovx_mock_session', JSON.stringify(user));

    // Synchronize user in multi-user registry
    try {
      const rawUsers = localStorage.getItem('profilefolio_users');
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        const idx = users.findIndex(u => u.id === uid || u.username === user.username);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...user };
          localStorage.setItem('profilefolio_users', JSON.stringify(users));
        }
      }
    } catch (e) {
      console.warn('Sync users registry on saveProfile:', e);
    }
  }

  return updated;
}

// ==========================================
// Education CRUD
// ==========================================
export function getEducation() {
  try {
    const user = getActiveUser();
    if (!user) return [...DEFAULT_EDUCATION];

    const uid = user.id || 'usr_mock_sunny_9921';
    const isSunny = user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

    const scopedKey = `profilefolio_user_${uid}_education`;
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(`profilefolio_education_${uid}`);
    if (raw) return JSON.parse(raw);

    if (isSunny) {
      const legacyRaw = localStorage.getItem('buildlab_education') || localStorage.getItem('profilefolio_education');
      if (legacyRaw) return JSON.parse(legacyRaw);
      return [...DEFAULT_EDUCATION];
    }

    // New user starts with clean empty list
    return [];
  } catch (e) {
    return [];
  }
}

export function saveEducation(list) {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const isSunny = !user || user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

  const scopedKey = `profilefolio_user_${uid}_education`;
  localStorage.setItem(scopedKey, JSON.stringify(list));
  localStorage.setItem(`profilefolio_education_${uid}`, JSON.stringify(list));

  if (isSunny) {
    localStorage.setItem('profilefolio_education', JSON.stringify(list));
    localStorage.setItem('buildlab_education', JSON.stringify(list));
  }
  return list;
}

export function addEducationItem(item) {
  const list = getEducation();
  const newItem = { id: 'edu-' + Date.now(), ...item };
  list.unshift(newItem);
  saveEducation(list);
  return newItem;
}

export function deleteEducationItem(id) {
  const list = getEducation().filter(item => item.id !== id);
  saveEducation(list);
  return list;
}

// ==========================================
// Skills CRUD
// ==========================================
export function getSkills() {
  try {
    const user = getActiveUser();
    if (!user) return [...DEFAULT_SKILLS];

    const uid = user.id || 'usr_mock_sunny_9921';
    const isSunny = user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

    const scopedKey = `profilefolio_user_${uid}_skills`;
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(`profilefolio_skills_${uid}`);
    if (raw) return JSON.parse(raw);

    if (isSunny) {
      const legacyRaw = localStorage.getItem('buildlab_skills') || localStorage.getItem('profilefolio_skills');
      if (legacyRaw) return JSON.parse(legacyRaw);
      return [...DEFAULT_SKILLS];
    }

    // New user starts with clean empty list
    return [];
  } catch (e) {
    return [];
  }
}

export function saveSkills(list) {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const isSunny = !user || user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

  const scopedKey = `profilefolio_user_${uid}_skills`;
  localStorage.setItem(scopedKey, JSON.stringify(list));
  localStorage.setItem(`profilefolio_skills_${uid}`, JSON.stringify(list));

  if (isSunny) {
    localStorage.setItem('profilefolio_skills', JSON.stringify(list));
    localStorage.setItem('buildlab_skills', JSON.stringify(list));
  }
  return list;
}

export function addSkillItem(item) {
  const list = getSkills();
  const newItem = { id: 'sk-' + Date.now(), ...item };
  list.push(newItem);
  saveSkills(list);
  return newItem;
}

export function deleteSkillItem(id) {
  const list = getSkills().filter(item => item.id !== id);
  saveSkills(list);
  return list;
}

// ==========================================
// Experiences & Certifications CRUD
// ==========================================
export function getExperiences() {
  try {
    const user = getActiveUser();
    if (!user) return [...DEFAULT_EXPERIENCES];

    const uid = user.id || 'usr_mock_sunny_9921';
    const isSunny = user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

    const scopedKey = `profilefolio_user_${uid}_experiences`;
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(`profilefolio_experiences_${uid}`);
    if (raw) return JSON.parse(raw);

    if (isSunny) {
      const legacyRaw = localStorage.getItem('buildlab_experiences') || localStorage.getItem('profilefolio_experiences');
      if (legacyRaw) return JSON.parse(legacyRaw);
      return [...DEFAULT_EXPERIENCES];
    }

    return [];
  } catch (e) {
    return [];
  }
}

export function saveExperiences(list) {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const isSunny = !user || user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

  const scopedKey = `profilefolio_user_${uid}_experiences`;
  localStorage.setItem(scopedKey, JSON.stringify(list));
  localStorage.setItem(`profilefolio_experiences_${uid}`, JSON.stringify(list));

  if (isSunny) {
    localStorage.setItem('profilefolio_experiences', JSON.stringify(list));
    localStorage.setItem('buildlab_experiences', JSON.stringify(list));
  }
  return list;
}

export function addExperienceItem(item) {
  const list = getExperiences();
  const newItem = { id: 'exp-' + Date.now(), ...item };
  list.unshift(newItem);
  saveExperiences(list);
  return newItem;
}

export function deleteExperienceItem(id) {
  const list = getExperiences().filter(item => item.id !== id);
  saveExperiences(list);
  return list;
}

export function getCertifications() {
  try {
    const user = getActiveUser();
    if (!user) return [...DEFAULT_CERTIFICATIONS];

    const uid = user.id || 'usr_mock_sunny_9921';
    const isSunny = user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

    const scopedKey = `profilefolio_user_${uid}_certifications`;
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(`profilefolio_certifications_${uid}`);
    if (raw) return JSON.parse(raw);

    if (isSunny) {
      const legacyRaw = localStorage.getItem('buildlab_certifications') || localStorage.getItem('profilefolio_certifications');
      if (legacyRaw) return JSON.parse(legacyRaw);
      return [...DEFAULT_CERTIFICATIONS];
    }

    return [];
  } catch (e) {
    return [];
  }
}

export function saveCertifications(list) {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const isSunny = !user || user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

  const scopedKey = `profilefolio_user_${uid}_certifications`;
  localStorage.setItem(scopedKey, JSON.stringify(list));
  localStorage.setItem(`profilefolio_certifications_${uid}`, JSON.stringify(list));

  if (isSunny) {
    localStorage.setItem('profilefolio_certifications', JSON.stringify(list));
    localStorage.setItem('buildlab_certifications', JSON.stringify(list));
  }
  return list;
}

export function addCertificationItem(item) {
  const list = getCertifications();
  const newItem = { id: 'cert-' + Date.now(), ...item };
  list.push(newItem);
  saveCertifications(list);
  return newItem;
}

export function deleteCertificationItem(id) {
  const list = getCertifications().filter(item => item.id !== id);
  saveCertifications(list);
  return list;
}

// ==========================================
// Projects CRUD
// ==========================================
export function getProjects() {
  try {
    const user = getActiveUser();
    if (!user) return [...DEFAULT_PROJECTS];

    const uid = user.id || 'usr_mock_sunny_9921';
    const isSunny = user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

    const scopedKey = `profilefolio_user_${uid}_projects`;
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(`profilefolio_projects_${uid}`);
    if (raw) return JSON.parse(raw);

    if (isSunny) {
      const legacyRaw = localStorage.getItem('profilefolio_projects') || 
                        localStorage.getItem('ssrnovx_active_projects') ||
                        localStorage.getItem('buildlab_projects');
      if (legacyRaw) return JSON.parse(legacyRaw);
      return [...DEFAULT_PROJECTS];
    }

    // New user starts with clean empty project list!
    return [];
  } catch (e) {
    return [];
  }
}

export function saveProjects(list) {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const isSunny = !user || user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

  const scopedKey = `profilefolio_user_${uid}_projects`;
  localStorage.setItem(scopedKey, JSON.stringify(list));
  localStorage.setItem(`profilefolio_projects_${uid}`, JSON.stringify(list));

  if (isSunny) {
    localStorage.setItem('profilefolio_projects', JSON.stringify(list));
    localStorage.setItem('ssrnovx_active_projects', JSON.stringify(list));
    localStorage.setItem('buildlab_projects', JSON.stringify(list));
  }
  return list;
}

export function addProjectItem(item) {
  const list = getProjects();
  const newItem = { id: 'proj_' + Date.now(), ...item };
  list.unshift(newItem);
  saveProjects(list);
  return newItem;
}

export function updateProjectItem(id, updates) {
  const list = getProjects();
  const idx = list.findIndex(p => p.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    saveProjects(list);
    return list[idx];
  }
  return null;
}

export function deleteProjectItem(id) {
  const list = getProjects().filter(p => p.id !== id);
  saveProjects(list);
  return list;
}

// ==========================================
// Publishing & Privacy Settings
// ==========================================
export function getPublishSettings() {
  try {
    const user = getActiveUser();
    if (!user) return { ...DEFAULT_PUBLISH_SETTINGS };

    const uid = user.id || 'usr_mock_sunny_9921';
    const isSunny = user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

    const scopedKey = `profilefolio_user_${uid}_publish`;
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(`profilefolio_publish_settings_${uid}`);
    if (raw) return JSON.parse(raw);

    if (isSunny) {
      const legacyRaw = localStorage.getItem('profilefolio_publish_settings') || 
                        localStorage.getItem('buildlab_publish_settings');
      if (legacyRaw) return JSON.parse(legacyRaw);
      return { ...DEFAULT_PUBLISH_SETTINGS };
    }

    // Default publish settings for this specific user
    const userSettings = {
      isPublished: true,
      publicSlug: user.username || 'user',
      templateId: 'minimal-professional',
      publishedAt: new Date().toISOString(),
      sectionVisibility: {
        hero: true,
        about: true,
        education: true,
        skills: true,
        projects: true,
        experience: true,
        certifications: true,
        blog: true,
        contact: true
      }
    };
    localStorage.setItem(scopedKey, JSON.stringify(userSettings));
    return userSettings;
  } catch (e) {
    return { ...DEFAULT_PUBLISH_SETTINGS };
  }
}

export function savePublishSettings(settings) {
  const current = getPublishSettings();
  let status = settings.status || current.status || (settings.isPublished !== false ? 'published' : 'draft');
  if (settings.isPublished !== undefined && !settings.status) {
    status = settings.isPublished ? 'published' : 'unpublished';
  }
  const isPublished = status === 'published';

  const updated = {
    ...current,
    ...settings,
    status,
    isPublished,
    updatedAt: new Date().toISOString()
  };
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const isSunny = !user || user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

  const scopedKey = `profilefolio_user_${uid}_publish`;
  localStorage.setItem(scopedKey, JSON.stringify(updated));
  localStorage.setItem(`profilefolio_publish_settings_${uid}`, JSON.stringify(updated));

  if (isSunny) {
    localStorage.setItem('profilefolio_publish_settings', JSON.stringify(updated));
    localStorage.setItem('buildlab_publish_settings', JSON.stringify(updated));
  }
  return updated;
}

// ==========================================
// Privacy-Conscious & Project-Level Analytics Engine
// ==========================================
export const VALID_ANALYTICS_EVENT_TYPES = [
  'portfolio_view',
  'project_view',
  'github_click',
  'demo_click',
  'resume_download',
  'contact_submit'
];

/**
 * Sanitizes referrer URL to only domain/host, preventing PII leak.
 */
export function sanitizeReferrerDomain(rawRef) {
  if (!rawRef) return 'Direct / Bookmarks';
  try {
    const url = new URL(rawRef);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host.includes('github.com')) return 'GitHub';
    if (host.includes('linkedin.com')) return 'LinkedIn';
    if (host.includes('google.com') || host.includes('google.')) return 'Google Search';
    if (host.includes('twitter.com') || host.includes('x.com') || host.includes('t.co')) return 'X / Twitter';
    if (host.includes('reddit.com')) return 'Reddit';
    if (host.includes('folioryn.dev') || host.includes('localhost') || host.includes('127.0.0.1')) return 'Direct / Folioryn';
    return host;
  } catch (e) {
    return 'Direct / Bookmarks';
  }
}

/**
 * Detects device category in a privacy-respecting way.
 */
export function getDeviceCategory() {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Records a privacy-respecting analytics event.
 */
export function trackAnalyticsEvent({
  username,
  eventType,
  projectId = null,
  projectTitle = null,
  referrer = null,
  deviceType = null,
  timestamp = null
}) {
  if (!username || !eventType) return null;
  const cleanSlug = username.toLowerCase();

  // Validate event type
  if (!VALID_ANALYTICS_EVENT_TYPES.includes(eventType)) {
    console.warn(`[Analytics] Ignored invalid event type: ${eventType}`);
    return null;
  }

  const cleanReferrer = sanitizeReferrerDomain(referrer || (typeof document !== 'undefined' ? document.referrer : ''));
  const cleanDevice = deviceType || getDeviceCategory();
  const eventTime = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

  const eventRecord = {
    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    portfolio_slug: cleanSlug,
    project_id: projectId ? String(projectId) : null,
    project_title: projectTitle || null,
    event_type: eventType,
    referrer: cleanReferrer,
    device_type: cleanDevice,
    created_at: eventTime
  };

  // 1. Local Storage multi-tenant event log
  try {
    const storageKey = `profilefolio_events_${cleanSlug}`;
    const raw = localStorage.getItem(storageKey);
    const events = raw ? JSON.parse(raw) : [];
    events.unshift(eventRecord);
    if (events.length > 5000) events.length = 5000;
    localStorage.setItem(storageKey, JSON.stringify(events));
  } catch (e) {
    console.warn('Local analytics storage exception:', e);
  }

  // 2. Forward to Supabase service if connected
  try {
    if (analyticsService && typeof analyticsService.trackEvent === 'function') {
      analyticsService.trackEvent({
        portfolioSlug: cleanSlug,
        projectId,
        projectTitle,
        eventType,
        referrer: cleanReferrer,
        deviceType: cleanDevice
      }).catch(err => console.warn('Remote analytics error:', err));
    }
  } catch (e) {}

  return eventRecord;
}

/**
 * Seeds authentic multi-week telemetry for demonstration accounts.
 */
export function seedBaselineAnalyticsIfEmpty(username) {
  const cleanSlug = username.toLowerCase();
  const events = [];
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const projects = [
    { id: 'proj_1', title: 'Distributed Task Queue & Worker Engine' },
    { id: 'proj_2', title: 'Real-Time Cloud Observability Dashboard' },
    { id: 'proj_3', title: 'High-Throughput Raft Consensus Engine' }
  ];

  const referrers = ['GitHub', 'LinkedIn', 'Google Search', 'X / Twitter', 'Direct / Bookmarks'];
  const devices = ['desktop', 'desktop', 'desktop', 'mobile', 'tablet'];

  // Seed across last 30 days
  for (let day = 29; day >= 0; day--) {
    const dayBaseTime = now - (day * oneDayMs);
    // Baseline between 6 and 22 portfolio views per day
    const viewsCount = Math.floor(8 + (Math.sin(day) * 4) + ((30 - day) * 0.4));
    
    for (let v = 0; v < viewsCount; v++) {
      const evtTime = new Date(dayBaseTime + Math.floor(Math.random() * (oneDayMs - 1000))).toISOString();
      const ref = referrers[Math.floor(Math.random() * referrers.length)];
      const dev = devices[Math.floor(Math.random() * devices.length)];
      
      events.push({
        id: `seed_${day}_v_${v}`,
        portfolio_slug: cleanSlug,
        event_type: 'portfolio_view',
        referrer: ref,
        device_type: dev,
        created_at: evtTime
      });

      // Fraction of views interact with projects
      if (Math.random() < 0.45) {
        const proj = projects[Math.floor(Math.random() * projects.length)];
        events.push({
          id: `seed_${day}_pv_${v}`,
          portfolio_slug: cleanSlug,
          project_id: proj.id,
          project_title: proj.title,
          event_type: 'project_view',
          referrer: ref,
          device_type: dev,
          created_at: evtTime
        });

        if (Math.random() < 0.35) {
          events.push({
            id: `seed_${day}_gh_${v}`,
            portfolio_slug: cleanSlug,
            project_id: proj.id,
            project_title: proj.title,
            event_type: 'github_click',
            referrer: ref,
            device_type: dev,
            created_at: evtTime
          });
        }

        if (Math.random() < 0.25) {
          events.push({
            id: `seed_${day}_demo_${v}`,
            portfolio_slug: cleanSlug,
            project_id: proj.id,
            project_title: proj.title,
            event_type: 'demo_click',
            referrer: ref,
            device_type: dev,
            created_at: evtTime
          });
        }
      }

      // Occasional resume downloads
      if (Math.random() < 0.08) {
        events.push({
          id: `seed_${day}_res_${v}`,
          portfolio_slug: cleanSlug,
          event_type: 'resume_download',
          referrer: ref,
          device_type: dev,
          created_at: evtTime
        });
      }

      // Occasional contact submissions
      if (Math.random() < 0.03) {
        events.push({
          id: `seed_${day}_cnt_${v}`,
          portfolio_slug: cleanSlug,
          event_type: 'contact_submit',
          referrer: ref,
          device_type: dev,
          created_at: evtTime
        });
      }
    }
  }

  // Save to localStorage
  try {
    localStorage.setItem(`profilefolio_events_${cleanSlug}`, JSON.stringify(events));
  } catch (e) {}
  return events;
}

/**
 * Retrieves all raw events for a portfolio owner.
 * If user is sunny or demo and storage is empty, seeds authentic baseline history.
 */
export function getAnalyticsEvents(username) {
  if (!username) return [];
  const cleanSlug = username.toLowerCase();
  const storageKey = `profilefolio_events_${cleanSlug}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // If sunny/demo profile and no events exist yet, seed a rich 30-day realistic baseline
  if (cleanSlug === 'sunny') {
    return seedBaselineAnalyticsIfEmpty(cleanSlug);
  }

  return [];
}

/**
 * Calculates date boundaries for a selected preset or custom range.
 * End dates are inclusive (through 23:59:59.999).
 * Previous period has identical duration immediately preceding the current start.
 */
export function getDateRangeBoundaries(preset = '30d', customStart = null, customEnd = null) {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  let currentStart, currentEnd;
  let durationDays;

  if (preset === '7d') {
    durationDays = 7;
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    currentEnd = todayEnd;
  } else if (preset === '90d') {
    durationDays = 90;
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89, 0, 0, 0, 0);
    currentEnd = todayEnd;
  } else if (preset === 'custom' && customStart && customEnd) {
    const s = new Date(customStart);
    const e = new Date(customEnd);
    currentStart = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
    currentEnd = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
    
    // Guard against inverted dates
    if (currentEnd.getTime() < currentStart.getTime()) {
      currentEnd = new Date(currentStart.getTime() + (24 * 60 * 60 * 1000 - 1));
    }
    durationDays = Math.max(1, Math.round((currentEnd.getTime() - currentStart.getTime()) / (24 * 60 * 60 * 1000)));
  } else {
    // Default 30 days
    durationDays = 30;
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
    currentEnd = todayEnd;
  }

  // Previous period: identical duration immediately prior to currentStart
  const prevEnd = new Date(currentStart.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - (durationDays * 24 * 60 * 60 * 1000) + 1);

  const formatDateLabel = (d) => {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return {
    preset,
    durationDays,
    current: {
      start: currentStart.toISOString(),
      end: currentEnd.toISOString(),
      startDateObj: currentStart,
      endDateObj: currentEnd,
      label: `${formatDateLabel(currentStart)} – ${formatDateLabel(currentEnd)}`
    },
    previous: {
      start: prevStart.toISOString(),
      end: prevEnd.toISOString(),
      startDateObj: prevStart,
      endDateObj: prevEnd,
      label: `${formatDateLabel(prevStart)} – ${formatDateLabel(prevEnd)}`
    }
  };
}

/**
 * Aggregates metric counts and project breakdowns for a given date range.
 */
export function calculatePeriodMetrics(events, startIso, endIso, filterProjectId = null) {
  const startMs = new Date(startIso).getTime();
  const endMs = new Date(endIso).getTime();

  // Filter events in range
  const inRange = events.filter(e => {
    const t = new Date(e.created_at).getTime();
    if (t < startMs || t > endMs) return false;
    if (filterProjectId && e.project_id && String(e.project_id) !== String(filterProjectId)) {
      return false;
    }
    return true;
  });

  let portfolioViews = 0;
  let projectViews = 0;
  let githubClicks = 0;
  let demoClicks = 0;
  let resumeDownloads = 0;
  let contactSubmissions = 0;

  const referrerCounts = {};
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0, other: 0 };
  const dailyBuckets = {};
  const projectStats = {};

  inRange.forEach(evt => {
    // Types
    if (evt.event_type === 'portfolio_view') portfolioViews++;
    else if (evt.event_type === 'project_view') projectViews++;
    else if (evt.event_type === 'github_click') githubClicks++;
    else if (evt.event_type === 'demo_click') demoClicks++;
    else if (evt.event_type === 'resume_download') resumeDownloads++;
    else if (evt.event_type === 'contact_submit') contactSubmissions++;

    // Referrers
    const ref = evt.referrer || 'Direct / Bookmarks';
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;

    // Devices
    const dev = evt.device_type || 'desktop';
    if (deviceCounts[dev] !== undefined) deviceCounts[dev]++;
    else deviceCounts.other++;

    // Daily bucket
    const dayKey = evt.created_at.slice(0, 10);
    if (!dailyBuckets[dayKey]) {
      dailyBuckets[dayKey] = {
        date: dayKey,
        portfolioViews: 0,
        projectViews: 0,
        githubClicks: 0,
        demoClicks: 0,
        interactions: 0
      };
    }
    if (evt.event_type === 'portfolio_view') dailyBuckets[dayKey].portfolioViews++;
    if (evt.event_type === 'project_view') {
      dailyBuckets[dayKey].projectViews++;
      dailyBuckets[dayKey].interactions++;
    }
    if (evt.event_type === 'github_click' || evt.event_type === 'demo_click') {
      if (evt.event_type === 'github_click') dailyBuckets[dayKey].githubClicks++;
      if (evt.event_type === 'demo_click') dailyBuckets[dayKey].demoClicks++;
      dailyBuckets[dayKey].interactions++;
    }

    // Project breakdown
    if (evt.project_id) {
      const pid = String(evt.project_id);
      if (!projectStats[pid]) {
        projectStats[pid] = {
          projectId: pid,
          projectTitle: evt.project_title || pid,
          views: 0,
          githubClicks: 0,
          demoClicks: 0,
          interactions: 0,
          referrers: {},
          devices: { desktop: 0, mobile: 0, tablet: 0 }
        };
      }
      if (evt.event_type === 'project_view') {
        projectStats[pid].views++;
        projectStats[pid].interactions++;
      } else if (evt.event_type === 'github_click') {
        projectStats[pid].githubClicks++;
        projectStats[pid].interactions++;
      } else if (evt.event_type === 'demo_click') {
        projectStats[pid].demoClicks++;
        projectStats[pid].interactions++;
      }
      const pRef = evt.referrer || 'Direct / Bookmarks';
      projectStats[pid].referrers[pRef] = (projectStats[pid].referrers[pRef] || 0) + 1;
      const pDev = evt.device_type || 'desktop';
      if (projectStats[pid].devices[pDev] !== undefined) projectStats[pid].devices[pDev]++;
    }
  });

  const totalInteractions = githubClicks + demoClicks + projectViews;
  
  // Interaction rate = (Total Interactions / Portfolio Views) * 100%
  const interactionRate = portfolioViews > 0 
    ? Math.round((totalInteractions / portfolioViews) * 1000) / 10 
    : 0;

  // Format Referrers list
  const referrers = Object.entries(referrerCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Format Timeline sorted by date
  const timeline = Object.values(dailyBuckets).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalEvents: inRange.length,
    portfolioViews,
    projectViews,
    githubClicks,
    demoClicks,
    resumeDownloads,
    contactSubmissions,
    totalInteractions,
    interactionRate,
    referrers,
    devices: deviceCounts,
    timeline,
    projectStats
  };
}

/**
 * Computes difference and percentage change between current and previous periods.
 * Handles previous zero values cleanly without division by zero.
 */
export function compareMetric(currentVal = 0, prevVal = 0) {
  const current = Number(currentVal) || 0;
  const previous = Number(prevVal) || 0;
  const diff = current - previous;

  if (previous === 0) {
    if (current === 0) {
      return { diff: 0, percent: 0, text: '0%', trend: 'neutral' };
    }
    return { diff: current, percent: 100, text: `+${current} (New)`, trend: 'up' };
  }

  const pct = Math.round(((current - previous) / previous) * 100);
  const trend = pct > 0 ? 'up' : (pct < 0 ? 'down' : 'neutral');
  const text = `${pct > 0 ? '+' : ''}${pct}%`;

  return { diff, percent: pct, text, trend };
}

/**
 * Compares full metrics payloads.
 */
export function comparePeriods(currentMetrics, previousMetrics) {
  return {
    portfolioViews: compareMetric(currentMetrics.portfolioViews, previousMetrics.portfolioViews),
    projectViews: compareMetric(currentMetrics.projectViews, previousMetrics.projectViews),
    githubClicks: compareMetric(currentMetrics.githubClicks, previousMetrics.githubClicks),
    demoClicks: compareMetric(currentMetrics.demoClicks, previousMetrics.demoClicks),
    resumeDownloads: compareMetric(currentMetrics.resumeDownloads, previousMetrics.resumeDownloads),
    contactSubmissions: compareMetric(currentMetrics.contactSubmissions, previousMetrics.contactSubmissions),
    totalInteractions: compareMetric(currentMetrics.totalInteractions, previousMetrics.totalInteractions),
    interactionRate: compareMetric(currentMetrics.interactionRate, previousMetrics.interactionRate)
  };
}

/**
 * Backwards compatibility helper for getAnalytics.
 */
export function getAnalytics() {
  try {
    const user = getActiveUser();
    const username = user?.username || 'sunny';
    const bounds = getDateRangeBoundaries('30d');
    const events = getAnalyticsEvents(username);
    const metrics = calculatePeriodMetrics(events, bounds.current.start, bounds.current.end);
    
    const totalViews = metrics.portfolioViews;
    const projectClicks = metrics.githubClicks + metrics.demoClicks;
    const resumeDownloads = metrics.resumeDownloads;
    const uniqueReferrers = metrics.referrers.length;

    const totalDev = (metrics.devices.desktop + metrics.devices.mobile + metrics.devices.tablet) || 1;
    const devPct = {
      desktop: Math.round((metrics.devices.desktop / totalDev) * 100),
      mobile: Math.round((metrics.devices.mobile / totalDev) * 100),
      tablet: Math.round((metrics.devices.tablet / totalDev) * 100)
    };

    const recentEvents = events.slice(0, 8).map(e => ({
      event: e.event_type.replace(/_/g, ' ').toUpperCase(),
      path: e.project_title || (e.event_type === 'portfolio_view' ? '/u/' + username : e.event_type),
      time: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      country: e.referrer || 'Active Visitor'
    }));

    return {
      totalViews,
      uniqueReferrers,
      projectClicks,
      resumeDownloads,
      referrers: metrics.referrers.slice(0, 5),
      devices: devPct,
      recentEvents
    };
  } catch (e) {
    return { ...DEFAULT_ANALYTICS };
  }
}

export function recordPageView(path = window.location.pathname) {
  const user = getActiveUser();
  const username = user?.username || 'sunny';
  return trackAnalyticsEvent({
    username,
    eventType: 'portfolio_view',
    referrer: typeof document !== 'undefined' ? document.referrer : null
  });
}

// ==========================================
// Profile Completion Calculator & Suggestions (Feature 8)
// ==========================================
export function getProfileCompletionDetails() {
  const profile = getProfile();
  const education = getEducation();
  const skills = getSkills();
  const projects = getProjects();
  const experiences = getExperiences();

  const suggestions = [
    {
      id: 'bio',
      title: 'Add a profile summary / bio (>15 characters)',
      category: 'Profile',
      link: '/dashboard/builder/',
      done: !!(profile.headline && profile.bio && profile.bio.trim().length > 15)
    },
    {
      id: 'projects',
      title: 'Add at least 2 featured projects',
      category: 'Portfolio',
      link: '/dashboard/projects/',
      done: projects.filter(p => p.title && p.title.trim().length > 0).length >= 2
    },
    {
      id: 'skills',
      title: 'Add at least 3 technical skills',
      category: 'Competencies',
      link: '/dashboard/skills/',
      done: skills.filter(s => s.name && s.name.trim().length > 0).length >= 3
    },
    {
      id: 'education',
      title: 'Add university or education history',
      category: 'Academic',
      link: '/dashboard/education/',
      done: education.filter(e => e.institution && e.institution.trim().length > 0).length > 0
    },
    {
      id: 'experience',
      title: 'Add work experience or internship achievements',
      category: 'Career',
      link: '/dashboard/experience/',
      done: experiences.filter(x => x.organization && x.organization.trim().length > 0).length > 0
    },
    {
      id: 'social',
      title: 'Connect GitHub or professional profile link',
      category: 'Integrations',
      link: '/dashboard/settings/',
      done: !!(profile.githubUrl || profile.linkedinUrl || profile.websiteUrl)
    },
    {
      id: 'email',
      title: 'Provide a primary inquiries contact email',
      category: 'Contact',
      link: '/dashboard/settings/',
      done: !!(profile.email && profile.email.includes('@'))
    }
  ];

  const completedCount = suggestions.filter(s => s.done).length;
  const percentage = Math.round((completedCount / suggestions.length) * 100);

  return {
    percentage,
    completedCount,
    totalCount: suggestions.length,
    suggestions
  };
}

export function calculateProfileCompletion() {
  return getProfileCompletionDetails().percentage;
}

// ==========================================
// Feature 3: Tokenized Private Preview Helpers
// ==========================================
export function generatePreviewToken(slug) {
  const currentSettings = getPublishSettings();
  const token = 'prev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24-hr expiry
  const cleanSlug = slug || currentSettings.publicSlug || 'user';

  savePublishSettings({
    previewToken: token,
    previewTokenExpiresAt: expiresAt
  });

  return {
    token,
    expiresAt,
    previewUrl: `/u/${encodeURIComponent(cleanSlug)}?preview_token=${encodeURIComponent(token)}`
  };
}

export function verifyPreviewToken(slug, token) {
  if (!slug || !token) return false;
  const userData = getUserDataBySlug(slug);
  if (!userData || !userData.publishSettings) return false;

  const settings = userData.publishSettings;
  if (!settings.previewToken || settings.previewToken !== token) return false;
  if (settings.previewTokenExpiresAt && new Date(settings.previewTokenExpiresAt).getTime() < Date.now()) {
    return false; // Token has expired
  }
  return true;
}

export function revokePreviewToken() {
  savePublishSettings({
    previewToken: null,
    previewTokenExpiresAt: null
  });
  return true;
}

// ==========================================
// Feature 4: One-Click Portfolio Duplicate
// ==========================================
export function duplicatePortfolio(customTitle = '') {
  const user = getActiveUser();
  if (!user) {
    throw new Error('Authentication required to duplicate a portfolio.');
  }

  const currentProfile = getProfile();
  const baseSlug = (currentProfile.username || user.username || 'portfolio').toLowerCase();

  // Find a unique slug with collision avoidance
  let candidateSlug = `${baseSlug}-copy`;
  let counter = 1;
  const rawUsers = localStorage.getItem('profilefolio_users');
  const existingUsers = rawUsers ? JSON.parse(rawUsers) : [];

  while (
    candidateSlug === 'sunny' ||
    existingUsers.some(u => (u.username || '').toLowerCase() === candidateSlug) ||
    localStorage.getItem(`profilefolio_clone_${candidateSlug}_bundle`)
  ) {
    counter++;
    candidateSlug = `${baseSlug}-copy-${counter}`;
  }

  const duplicateId = 'port_clone_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const clonedTitle = customTitle || `${currentProfile.fullName || 'User'} (Copy)`;

  // Deep clone data with newly assigned IDs
  const clonedProfile = {
    ...currentProfile,
    username: candidateSlug,
    fullName: clonedTitle,
    displayName: clonedTitle,
    portfolioUrl: `https://folioryn.dev/u/${candidateSlug}`
  };

  const clonedEducation = getEducation().map(e => ({
    ...e,
    id: 'edu_clone_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5)
  }));

  const clonedSkills = getSkills().map(s => ({
    ...s,
    id: 'sk_clone_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5)
  }));

  const clonedExperiences = getExperiences().map(x => ({
    ...x,
    id: 'exp_clone_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5)
  }));

  const clonedCertifications = getCertifications().map(c => ({
    ...c,
    id: 'cert_clone_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5)
  }));

  const clonedProjects = getProjects().map(p => ({
    ...p,
    id: 'proj_clone_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5)
  }));

  // Duplicate is Draft by default
  const clonedPublish = {
    ...getPublishSettings(),
    status: 'draft',
    isPublished: false,
    publicSlug: candidateSlug,
    publishedAt: null
  };

  // Register in user's cloned portfolios registry
  const uid = user.id || (user.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const userCopiesKey = `profilefolio_user_${uid}_clones`;
  const existingCopies = JSON.parse(localStorage.getItem(userCopiesKey) || '[]');
  const copyRecord = {
    id: duplicateId,
    slug: candidateSlug,
    title: clonedTitle,
    createdAt: new Date().toISOString(),
    status: 'draft',
    profile: clonedProfile,
    education: clonedEducation,
    skills: clonedSkills,
    experiences: clonedExperiences,
    certifications: clonedCertifications,
    projects: clonedProjects,
    publishSettings: clonedPublish
  };
  existingCopies.unshift(copyRecord);
  localStorage.setItem(userCopiesKey, JSON.stringify(existingCopies));

  // Also make it immediately discoverable in multi-tenant resolver
  localStorage.setItem(`profilefolio_clone_${candidateSlug}_bundle`, JSON.stringify(copyRecord));

  return {
    success: true,
    duplicateId,
    slug: candidateSlug,
    title: clonedTitle,
    status: 'draft',
    createdAt: copyRecord.createdAt
  };
}

export function getUserClones() {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  try {
    const raw = localStorage.getItem(`profilefolio_user_${uid}_clones`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// ==========================================
// Multi-Tenant Cross-User Lookup Helper
// ==========================================
export function getUserDataBySlug(slug) {
  const cleanSlug = (slug || '').trim().toLowerCase();
  
  if (cleanSlug === 'sunny') {
    return {
      profile: { ...DEFAULT_PROFILE },
      education: [...DEFAULT_EDUCATION],
      skills: [...DEFAULT_SKILLS],
      experiences: [...DEFAULT_EXPERIENCES],
      certifications: [...DEFAULT_CERTIFICATIONS],
      projects: [...DEFAULT_PROJECTS],
      articles: [...DEFAULT_BLOG_ARTICLES],
      publishSettings: { ...DEFAULT_PUBLISH_SETTINGS }
    };
  }

  // 1. Check if it's a cloned portfolio bundle
  try {
    const rawClone = localStorage.getItem(`profilefolio_clone_${cleanSlug}_bundle`);
    if (rawClone) {
      const bundle = JSON.parse(rawClone);
      return {
        profile: bundle.profile,
        education: bundle.education || [],
        skills: bundle.skills || [],
        experiences: bundle.experiences || [],
        certifications: bundle.certifications || [],
        projects: bundle.projects || [],
        articles: bundle.articles || [],
        publishSettings: bundle.publishSettings || { status: 'draft', isPublished: false, templateId: "minimal-professional", publicSlug: cleanSlug }
      };
    }
  } catch (e) {}

  // 2. Lookup in local users registry
  try {
    const rawUsers = localStorage.getItem('profilefolio_users');
    const users = rawUsers ? JSON.parse(rawUsers) : [];
    const matched = users.find(u => (u.username || '').toLowerCase() === cleanSlug);
    if (!matched) return null;

    const uid = matched.id;
    const rawProfile = localStorage.getItem(`profilefolio_user_${uid}_profile`);
    const rawEdu = localStorage.getItem(`profilefolio_user_${uid}_education`) || localStorage.getItem(`profilefolio_education_${uid}`);
    const rawSkills = localStorage.getItem(`profilefolio_user_${uid}_skills`) || localStorage.getItem(`profilefolio_skills_${uid}`);
    const rawExp = localStorage.getItem(`profilefolio_user_${uid}_experiences`) || localStorage.getItem(`profilefolio_experiences_${uid}`);
    const rawCert = localStorage.getItem(`profilefolio_user_${uid}_certifications`) || localStorage.getItem(`profilefolio_certifications_${uid}`);
    const rawProj = localStorage.getItem(`profilefolio_user_${uid}_projects`) || localStorage.getItem(`profilefolio_projects_${uid}`);
    const rawPub = localStorage.getItem(`profilefolio_user_${uid}_publish`) || localStorage.getItem(`profilefolio_publish_settings_${uid}`);
    const rawArticles = localStorage.getItem(`profilefolio_user_${uid}_articles`);

    return {
      profile: rawProfile ? JSON.parse(rawProfile) : {
        fullName: matched.display_name || matched.username,
        username: matched.username,
        headline: matched.headline || "Software Engineer & Builder",
        bio: matched.bio || "Building software applications with modern web standards.",
        location: matched.location || "",
        email: matched.email || "",
        phone: matched.phone || "",
        portfolioUrl: `https://folioryn.dev/u/${matched.username}`,
        githubUrl: matched.github_handle ? (matched.github_handle.startsWith('http') ? matched.github_handle : `https://github.com/${matched.github_handle}`) : ""
      },
      education: rawEdu ? JSON.parse(rawEdu) : [],
      skills: rawSkills ? JSON.parse(rawSkills) : [],
      experiences: rawExp ? JSON.parse(rawExp) : [],
      certifications: rawCert ? JSON.parse(rawCert) : [],
      projects: rawProj ? JSON.parse(rawProj) : [],
      articles: rawArticles ? JSON.parse(rawArticles) : [],
      publishSettings: rawPub ? JSON.parse(rawPub) : { status: 'published', isPublished: true, templateId: "minimal-professional", publicSlug: matched.username }
    };
  } catch (e) {
    return null;
  }
}

// ==========================================
// User-Scoped Blog Articles CRUD
// ==========================================
export const DEFAULT_BLOG_ARTICLES = [
  {
    id: 'post_1',
    title: 'Zero-Dependency Vanilla JavaScript in 2026',
    slug: 'zero-dependency-vanilla-javascript',
    tags: 'JavaScript, Architecture, Web Standards',
    excerpt: 'Why native browser APIs and modular ES modules are outperforming bloated single-page framework runtimes.',
    content: `# Zero-Dependency Vanilla JavaScript in 2026\n\nModern browsers have evolved into extraordinary application runtimes. With native **Web Components**, custom events, CSS variables, and fetch streams, the need for 300KB runtime frameworks has vanished for high-speed developer platforms.\n\n## 1. Native Reactivity Without Virtual DOM\n\nBy leveraging standard DOM events and \`postMessage\`, we achieve zero-latency bidirectional synchronization with negligible memory footprint.\n\n\`\`\`javascript\nwindow.addEventListener('message', (event) => {\n  if (event.data?.type === 'UPDATE') {\n    applyChanges(event.data.payload);\n  }\n});\n\`\`\`\n\n> The fastest code is the code the browser already knows how to run natively.\n\n## 2. Production Performance Metrics\n\n- Zero hydration delay (Time to Interactive under 100ms)\n- 100/100 Lighthouse Performance scores\n- Universal compatibility across modern mobile and desktop browsers`,
    isPublished: true,
    updatedAt: new Date().toISOString(),
  }
];

export function getBlogArticles() {
  try {
    const user = getActiveUser();
    if (!user) return [...DEFAULT_BLOG_ARTICLES];

    const uid = user.id || 'usr_mock_sunny_9921';
    const isSunny = user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

    const scopedKey = `profilefolio_user_${uid}_articles`;
    const scopedRaw = localStorage.getItem(scopedKey);
    if (scopedRaw) return JSON.parse(scopedRaw);

    if (isSunny) {
      const legacyRaw = localStorage.getItem('profilefolio_blog_articles') || localStorage.getItem('ssrnovx_blog_articles');
      if (legacyRaw) return JSON.parse(legacyRaw);
      return [...DEFAULT_BLOG_ARTICLES];
    }

    return [];
  } catch (e) {
    return [];
  }
}

export function saveBlogArticles(articles) {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const isSunny = !user || user.username === 'sunny' || uid === 'usr_mock_sunny_9921';

  const scopedKey = `profilefolio_user_${uid}_articles`;
  localStorage.setItem(scopedKey, JSON.stringify(articles));

  if (isSunny) {
    localStorage.setItem('profilefolio_blog_articles', JSON.stringify(articles));
    localStorage.setItem('ssrnovx_blog_articles', JSON.stringify(articles));
  }

  return articles;
}

// ==========================================
// Feature 9: Profile Data Import & Export Engine
// ==========================================
export function exportProfileData() {
  const profile = getProfile();
  const user = getActiveUser();

  // Strip sensitive credentials, passwords, tokens, and private inbox messages
  const sanitizedProfile = { ...profile };
  delete sanitizedProfile.password;
  delete sanitizedProfile.password_hash;
  delete sanitizedProfile.security_question;
  delete sanitizedProfile.security_answer;

  const exportBundle = {
    schemaVersion: "folioryn_backup_v1",
    exportedAt: new Date().toISOString(),
    ownerUsername: profile.username || user?.username || 'user',
    profile: sanitizedProfile,
    education: getEducation(),
    skills: getSkills(),
    experiences: getExperiences(),
    certifications: getCertifications(),
    projects: getProjects(),
    articles: getBlogArticles(),
    publishSettings: getPublishSettings()
  };

  return exportBundle;
}

export function validateImportData(bundle) {
  const errors = [];
  if (!bundle || typeof bundle !== 'object') {
    return { valid: false, errors: ['Invalid JSON format: root must be an object.'] };
  }

  if (bundle.schemaVersion !== 'folioryn_backup_v1') {
    errors.push(`Unsupported or missing schemaVersion: expected "folioryn_backup_v1", received "${bundle.schemaVersion || 'none'}".`);
  }

  if (!bundle.profile || typeof bundle.profile !== 'object') {
    errors.push('Missing or invalid "profile" object in backup data.');
  }

  if (bundle.education && !Array.isArray(bundle.education)) {
    errors.push('"education" field must be an array.');
  }

  if (bundle.skills && !Array.isArray(bundle.skills)) {
    errors.push('"skills" field must be an array.');
  }

  if (bundle.projects && !Array.isArray(bundle.projects)) {
    errors.push('"projects" field must be an array.');
  }

  if (bundle.experiences && !Array.isArray(bundle.experiences)) {
    errors.push('"experiences" field must be an array.');
  }

  const summary = {
    profileName: bundle.profile?.fullName || bundle.profile?.displayName || 'Unknown',
    projectCount: Array.isArray(bundle.projects) ? bundle.projects.length : 0,
    skillCount: Array.isArray(bundle.skills) ? bundle.skills.length : 0,
    educationCount: Array.isArray(bundle.education) ? bundle.education.length : 0,
    experienceCount: Array.isArray(bundle.experiences) ? bundle.experiences.length : 0,
    articleCount: Array.isArray(bundle.articles) ? bundle.articles.length : 0
  };

  return {
    valid: errors.length === 0,
    errors,
    summary
  };
}

export function importProfileData(bundle, strategy = 'merge') {
  const validation = validateImportData(bundle);
  if (!validation.valid) {
    throw new Error(`Import validation failed:\n- ${validation.errors.join('\n- ')}`);
  }

  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');

  // 1. Safety Rollback Snapshot before applying changes
  const rollbackSnapshot = {
    timestamp: new Date().toISOString(),
    profile: getProfile(),
    education: getEducation(),
    skills: getSkills(),
    experiences: getExperiences(),
    certifications: getCertifications(),
    projects: getProjects(),
    articles: getBlogArticles(),
    publishSettings: getPublishSettings()
  };
  localStorage.setItem(`folioryn_import_rollback_${uid}`, JSON.stringify(rollbackSnapshot));

  // 2. Apply import with user ownership enforcement
  if (strategy === 'replace') {
    if (bundle.profile) {
      saveProfile({
        ...bundle.profile,
        username: user?.username || bundle.profile.username || 'user',
        email: user?.email || bundle.profile.email || ''
      });
    }
    if (Array.isArray(bundle.education)) saveEducation(bundle.education);
    if (Array.isArray(bundle.skills)) saveSkills(bundle.skills);
    if (Array.isArray(bundle.experiences)) saveExperiences(bundle.experiences);
    if (Array.isArray(bundle.certifications)) saveCertifications(bundle.certifications);
    if (Array.isArray(bundle.projects)) saveProjects(bundle.projects);
    if (Array.isArray(bundle.articles)) saveBlogArticles(bundle.articles);
    if (bundle.publishSettings) savePublishSettings(bundle.publishSettings);
  } else {
    // Merge strategy: update profile fields and append non-duplicate records
    if (bundle.profile) {
      const currentProf = getProfile();
      saveProfile({
        ...currentProf,
        ...bundle.profile,
        username: currentProf.username || user?.username,
        email: currentProf.email || user?.email
      });
    }

    if (Array.isArray(bundle.education)) {
      const currentEdu = getEducation();
      const existingInstitutions = new Set(currentEdu.map(e => (e.institution || '').toLowerCase()));
      const toAdd = bundle.education.filter(e => !existingInstitutions.has((e.institution || '').toLowerCase()));
      saveEducation([...currentEdu, ...toAdd]);
    }

    if (Array.isArray(bundle.skills)) {
      const currentSkills = getSkills();
      const existingNames = new Set(currentSkills.map(s => (s.name || '').toLowerCase()));
      const toAdd = bundle.skills.filter(s => !existingNames.has((s.name || '').toLowerCase()));
      saveSkills([...currentSkills, ...toAdd]);
    }

    if (Array.isArray(bundle.projects)) {
      const currentProjects = getProjects();
      const existingTitles = new Set(currentProjects.map(p => (p.title || '').toLowerCase()));
      const toAdd = bundle.projects.filter(p => !existingTitles.has((p.title || '').toLowerCase()));
      saveProjects([...currentProjects, ...toAdd]);
    }

    if (Array.isArray(bundle.experiences)) {
      const currentExp = getExperiences();
      const existingOrgs = new Set(currentExp.map(x => (x.organization || '').toLowerCase()));
      const toAdd = bundle.experiences.filter(x => !existingOrgs.has((x.organization || '').toLowerCase()));
      saveExperiences([...currentExp, ...toAdd]);
    }
  }

  return {
    success: true,
    strategy,
    appliedAt: new Date().toISOString(),
    summary: validation.summary
  };
}

export function rollbackLastImport() {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const raw = localStorage.getItem(`folioryn_import_rollback_${uid}`);
  if (!raw) return false;

  try {
    const snapshot = JSON.parse(raw);
    if (snapshot.profile) saveProfile(snapshot.profile);
    if (snapshot.education) saveEducation(snapshot.education);
    if (snapshot.skills) saveSkills(snapshot.skills);
    if (snapshot.experiences) saveExperiences(snapshot.experiences);
    if (snapshot.certifications) saveCertifications(snapshot.certifications);
    if (snapshot.projects) saveProjects(snapshot.projects);
    if (snapshot.articles) saveBlogArticles(snapshot.articles);
    if (snapshot.publishSettings) savePublishSettings(snapshot.publishSettings);
    localStorage.removeItem(`folioryn_import_rollback_${uid}`);
    return true;
  } catch (e) {
    console.error('Rollback failed:', e);
    return false;
  }
}

// ==========================================
// Feature 6: Inbound Contact Messages Storage & Management
// ==========================================
export function getContactMessages() {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const scopedKey = `profilefolio_user_${uid}_messages`;
  try {
    const raw = localStorage.getItem(scopedKey);
    if (raw) return JSON.parse(raw);

    // Fallback for Sunny
    if (user?.username === 'sunny' || uid === 'usr_mock_sunny_9921') {
      const legacyRaw = localStorage.getItem('profilefolio_contact_messages');
      if (legacyRaw) return JSON.parse(legacyRaw);
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveContactMessages(messages) {
  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const scopedKey = `profilefolio_user_${uid}_messages`;
  localStorage.setItem(scopedKey, JSON.stringify(messages));
  if (user?.username === 'sunny' || uid === 'usr_mock_sunny_9921') {
    localStorage.setItem('profilefolio_contact_messages', JSON.stringify(messages));
  }
  return messages;
}

export function deleteContactMessage(messageId) {
  const messages = getContactMessages().filter(m => m.id !== messageId);
  saveContactMessages(messages);
  return messages;
}

export function markContactMessageRead(messageId, isRead = true) {
  const messages = getContactMessages().map(m => {
    if (m.id === messageId) return { ...m, is_read: isRead };
    return m;
  });
  saveContactMessages(messages);
  return messages;
}

export function clearAllContactMessages() {
  saveContactMessages([]);
  return [];
}


