/**
 * BuildLab — Multi-User Profile, Education, Skills, Experience & Publishing Data Engine
 * TechSpace BuildLab B04
 * Provides unified CRUD operations with Supabase integration and robust localStorage fallback.
 */

import { supabase, isSupabaseConfigured } from './supabase.js';

// Default initial state for new users or offline demonstrations
const DEFAULT_PROFILE = {
  fullName: "Sunny",
  username: "sunny",
  headline: "Full-Stack Software Engineer & Systems Builder",
  bio: "Architecting scalable web applications, distributed backend pipelines, and minimalist user interfaces. Passionate about native web standards, clean architecture, and performance engineering.",
  location: "Bangalore, India",
  email: "sunny@techspace.buildlab.dev",
  portfolioUrl: "https://buildlab.dev/u/sunny",
  githubUrl: "https://github.com/ssrnov",
  linkedinUrl: "https://linkedin.com/in/ssrnov",
  twitterUrl: "https://x.com/ssrnov",
  availability: "Open to opportunities",
  theme: "dark"
};

const DEFAULT_EDUCATION = [
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

const DEFAULT_SKILLS = [
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

const DEFAULT_EXPERIENCES = [
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

const DEFAULT_CERTIFICATIONS = [
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

const DEFAULT_PUBLISH_SETTINGS = {
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

const DEFAULT_ANALYTICS = {
  totalViews: 342,
  uniqueReferrers: 128,
  projectClicks: 84,
  resumeDownloads: 41,
  referrers: [
    { source: "github.com", count: 142 },
    { source: "linkedin.com", count: 98 },
    { source: "Direct / QR Code", count: 64 },
    { source: "twitter.com / x.com", count: 28 },
    { source: "Other", count: 10 }
  ],
  devices: {
    desktop: 68,
    mobile: 27,
    tablet: 5
  },
  recentEvents: [
    { event: "Portfolio View", path: "/u/sunny", time: "Just now", country: "India" },
    { event: "Resume Download", path: "/u/sunny#resume", time: "18m ago", country: "United States" },
    { event: "Project Click", path: "/projects", time: "1h ago", country: "Germany" },
    { event: "Portfolio View", path: "/u/sunny", time: "3h ago", country: "United Kingdom" }
  ]
};

// ==========================================
// Profile CRUD
// ==========================================
export function getProfile() {
  try {
    const raw = localStorage.getItem('buildlab_profile');
    return raw ? JSON.parse(raw) : { ...DEFAULT_PROFILE };
  } catch (e) {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(data) {
  const current = getProfile();
  const updated = { ...current, ...data };
  localStorage.setItem('buildlab_profile', JSON.stringify(updated));
  return updated;
}

// ==========================================
// Education CRUD
// ==========================================
export function getEducation() {
  try {
    const raw = localStorage.getItem('buildlab_education');
    return raw ? JSON.parse(raw) : [...DEFAULT_EDUCATION];
  } catch (e) {
    return [...DEFAULT_EDUCATION];
  }
}

export function saveEducation(list) {
  localStorage.setItem('buildlab_education', JSON.stringify(list));
  return list;
}

export function addEducationItem(item) {
  const list = getEducation();
  const newItem = {
    id: 'edu-' + Date.now(),
    ...item
  };
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
    const raw = localStorage.getItem('buildlab_skills');
    return raw ? JSON.parse(raw) : [...DEFAULT_SKILLS];
  } catch (e) {
    return [...DEFAULT_SKILLS];
  }
}

export function saveSkills(list) {
  localStorage.setItem('buildlab_skills', JSON.stringify(list));
  return list;
}

export function addSkillItem(item) {
  const list = getSkills();
  const newItem = {
    id: 'sk-' + Date.now(),
    ...item
  };
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
    const raw = localStorage.getItem('buildlab_experiences');
    return raw ? JSON.parse(raw) : [...DEFAULT_EXPERIENCES];
  } catch (e) {
    return [...DEFAULT_EXPERIENCES];
  }
}

export function saveExperiences(list) {
  localStorage.setItem('buildlab_experiences', JSON.stringify(list));
  return list;
}

export function addExperienceItem(item) {
  const list = getExperiences();
  const newItem = {
    id: 'exp-' + Date.now(),
    ...item
  };
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
    const raw = localStorage.getItem('buildlab_certifications');
    return raw ? JSON.parse(raw) : [...DEFAULT_CERTIFICATIONS];
  } catch (e) {
    return [...DEFAULT_CERTIFICATIONS];
  }
}

export function saveCertifications(list) {
  localStorage.setItem('buildlab_certifications', JSON.stringify(list));
  return list;
}

export function addCertificationItem(item) {
  const list = getCertifications();
  const newItem = {
    id: 'cert-' + Date.now(),
    ...item
  };
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
// Publishing & Privacy Settings
// ==========================================
export function getPublishSettings() {
  try {
    const raw = localStorage.getItem('buildlab_publish_settings');
    return raw ? JSON.parse(raw) : { ...DEFAULT_PUBLISH_SETTINGS };
  } catch (e) {
    return { ...DEFAULT_PUBLISH_SETTINGS };
  }
}

export function savePublishSettings(settings) {
  const current = getPublishSettings();
  const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
  localStorage.setItem('buildlab_publish_settings', JSON.stringify(updated));
  return updated;
}

// ==========================================
// Privacy-Conscious Analytics Engine
// ==========================================
export function getAnalytics() {
  try {
    const raw = localStorage.getItem('buildlab_analytics');
    return raw ? JSON.parse(raw) : { ...DEFAULT_ANALYTICS };
  } catch (e) {
    return { ...DEFAULT_ANALYTICS };
  }
}

export function recordPageView(path = window.location.pathname) {
  const analytics = getAnalytics();
  analytics.totalViews = (analytics.totalViews || 0) + 1;
  
  // Track referrer domain if available
  const ref = document.referrer ? new URL(document.referrer).hostname : "Direct / Bookmarks";
  let matchedRef = analytics.referrers.find(r => r.source.includes(ref) || ref.includes(r.source));
  if (matchedRef) {
    matchedRef.count++;
  } else {
    analytics.referrers.push({ source: ref, count: 1 });
  }

  // Prepend recent event
  analytics.recentEvents.unshift({
    event: "Portfolio View",
    path: path,
    time: "Just now",
    country: "Active Session"
  });
  if (analytics.recentEvents.length > 10) analytics.recentEvents.pop();

  localStorage.setItem('buildlab_analytics', JSON.stringify(analytics));
  return analytics;
}
