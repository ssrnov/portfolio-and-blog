/**
 * ProfileFolio — Multi-User Profile, Education, Skills, Experience & Publishing Data Engine
 * Provides user-scoped CRUD operations with Supabase integration and robust localStorage fallback.
 */

import { supabase, isSupabaseConfigured, MOCK_USER_PROFILE } from './supabase.js';

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
  isPublished: true,
  publicSlug: "sunny",
  templateId: "minimal-professional",
  publishedAt: "2026-10-09T18:00:00.000Z",
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
  const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
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
// Privacy-Conscious Analytics Engine
// ==========================================
export function getAnalytics() {
  try {
    const user = getActiveUser();
    const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
    const scopedKey = `profilefolio_user_${uid}_analytics`;
    const raw = localStorage.getItem(scopedKey);
    if (raw) return JSON.parse(raw);

    if (user?.username === 'sunny' || uid === 'usr_mock_sunny_9921') {
      const legacy = localStorage.getItem('profilefolio_analytics') || localStorage.getItem('buildlab_analytics');
      if (legacy) return JSON.parse(legacy);
    }

    return { ...DEFAULT_ANALYTICS };
  } catch (e) {
    return { ...DEFAULT_ANALYTICS };
  }
}

export function recordPageView(path = window.location.pathname) {
  const analytics = getAnalytics();
  analytics.totalViews = (analytics.totalViews || 0) + 1;
  
  const ref = document.referrer ? new URL(document.referrer).hostname : "Direct / Bookmarks";
  let matchedRef = analytics.referrers.find(r => r.source.includes(ref) || ref.includes(r.source));
  if (matchedRef) {
    matchedRef.count++;
  } else {
    analytics.referrers.push({ source: ref, count: 1 });
  }

  analytics.recentEvents.unshift({
    event: "Portfolio View",
    path: path,
    time: "Just now",
    country: "Active Session"
  });
  if (analytics.recentEvents.length > 10) analytics.recentEvents.pop();

  const user = getActiveUser();
  const uid = user?.id || (user?.username === 'sunny' ? 'usr_mock_sunny_9921' : 'usr_default');
  const scopedKey = `profilefolio_user_${uid}_analytics`;
  localStorage.setItem(scopedKey, JSON.stringify(analytics));
  return analytics;
}

// ==========================================
// Profile Completion Calculator
// ==========================================
export function calculateProfileCompletion() {
  const profile = getProfile();
  const education = getEducation();
  const skills = getSkills();
  const projects = getProjects();
  const experiences = getExperiences();

  let score = 0;
  if (profile.fullName && profile.username) score += 20;
  if (profile.headline && profile.bio && profile.bio.length > 15) score += 20;
  if (education.length > 0) score += 15;
  if (skills.length > 0) score += 15;
  if (projects.length > 0) score += 20;
  if (experiences.length > 0) score += 10;

  return Math.min(score, 100);
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

  // Lookup in local users registry
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
      publishSettings: rawPub ? JSON.parse(rawPub) : { isPublished: true, templateId: "minimal-professional", publicSlug: matched.username }
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

