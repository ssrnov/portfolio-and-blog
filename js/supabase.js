/**
 * ProfileFolio — Supabase Client & Multi-User Data Access Layer
 * Provides unified authentication, session listeners, and CRUD queries
 * with seamless multi-user local mock fallback when credentials are not yet configured.
 */

import { createClient } from '@supabase/supabase-js';

// Environment Variables from Vite (safe in browser & test runtimes)
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

// Check if valid credentials exist
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-public-api-key')
);

// Initialize Supabase Client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// ==============================================================================
// 1. Multi-User Local Storage Registry & Fallback Database
// ==============================================================================
const SESSION_STORAGE_KEY = 'profilefolio_session';
const USERS_REGISTRY_KEY = 'profilefolio_users';

export const MOCK_USER_PROFILE = {
  id: 'usr_mock_sunny_9921',
  email: 'sunny@profilefolio.dev',
  username: 'sunny',
  display_name: 'Sunny',
  headline: 'Staff Systems & Frontend Architect',
  bio: 'Engineering scalable distributed architectures, zero-dependency high-performance web systems, and developer platforms.',
  location: 'Bangalore, India (IST / UTC+5:30)',
  avatar_url: '',
  github_handle: 'ssrnov',
  twitter_handle: 'ssrnov',
  linkedin_url: 'https://linkedin.com/in/ssrnov',
  website_url: 'https://profilefolio.dev/u/sunny',
  theme_preference: 'dark',
};

// Helper: Get registered local users
function getLocalUsers() {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    const users = raw ? JSON.parse(raw) : [];
    // Ensure default sunny user exists in registry
    if (!users.some(u => u.username === 'sunny')) {
      users.unshift({ ...MOCK_USER_PROFILE });
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
    }
    return users;
  } catch (e) {
    return [{ ...MOCK_USER_PROFILE }];
  }
}

// Helper: Save user to local registry
function saveLocalUser(user) {
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.id === user.id || u.username === user.username);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
}

/**
 * Cryptographic SHA-256 password hasher using Web Crypto API.
 * Never stores or transmits plaintext passwords.
 */
export async function hashPassword(password, salt = 'folioryn_v1_salt') {
  const cryptoObj = (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) 
    ? globalThis.crypto.subtle 
    : (typeof window !== 'undefined' && window.crypto?.subtle ? window.crypto.subtle : null);

  if (cryptoObj) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode((password || '') + ':' + salt);
      const hashBuffer = await cryptoObj.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  let hash = 0;
  const str = (password || '') + ':' + salt;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

// ==============================================================================
// 2. Authentication Services
// ==============================================================================
export const authService = {
  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username) {
    const clean = (username || '').trim().toLowerCase();
    if (!clean || clean.length < 3) return false;
    const users = getLocalUsers();
    return !users.some(u => u.username && u.username.toLowerCase() === clean);
  },

  /**
   * Register with Email & Password
   */
  async signUp(email, password, { username, fullName }) {
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            user_name: cleanUsername,
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      return data;
    }

    // Multi-User Local Mock Engine
    const users = getLocalUsers();
    const existing = users.find(u => u.username === cleanUsername || u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this username or email already exists.');
    }

    const passwordHash = await hashPassword(password);
    const userId = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newUser = {
      id: userId,
      email: cleanEmail,
      username: cleanUsername,
      display_name: fullName || cleanUsername,
      password_hash: passwordHash, // Stored as salted SHA-256 hash, NEVER plaintext
      headline: 'Full-Stack Software Engineer & Builder',
      bio: 'Architecting scalable web applications, distributed backend pipelines, and minimalist user interfaces.',
      location: 'India',
      avatar_url: '',
      github_handle: '',
      twitter_handle: '',
      linkedin_url: '',
      website_url: `https://folioryn.dev/u/${cleanUsername}`,
      theme_preference: 'dark',
      created_at: new Date().toISOString(),
    };

    saveLocalUser(newUser);

    // Seed user-scoped profile and publishing settings
    const initialProfile = {
      fullName: newUser.display_name,
      displayName: newUser.display_name,
      username: newUser.username,
      headline: newUser.headline,
      bio: newUser.bio,
      location: newUser.location,
      email: newUser.email,
      phone: '',
      organization: '',
      availability: 'Open to opportunities',
      portfolioUrl: `https://folioryn.dev/u/${newUser.username}`,
      githubUrl: '',
      linkedinUrl: '',
      twitterUrl: '',
      websiteUrl: `https://folioryn.dev/u/${newUser.username}`,
      theme: 'dark'
    };
    localStorage.setItem(`profilefolio_user_${userId}_profile`, JSON.stringify(initialProfile));
    localStorage.setItem(`profilefolio_user_${userId}_publish`, JSON.stringify({
      isPublished: true,
      publicSlug: newUser.username,
      templateId: 'minimal-professional',
      publishedAt: new Date().toISOString()
    }));

    const session = {
      access_token: 'mock_jwt_' + userId,
      user: newUser,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem('ssrnovx_mock_session', JSON.stringify(newUser));
    localStorage.setItem('profilefolio_active_user', JSON.stringify(newUser));

    return { user: newUser, session };
  },

  /**
   * Login with Email & Password
   */
  async signInWithPassword(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;
      return data;
    }

    // Multi-User Local Mock Engine
    const users = getLocalUsers();
    // Allow login by email or username
    let matchedUser = users.find(u => 
      u.email.toLowerCase() === cleanEmail || 
      u.username.toLowerCase() === cleanEmail
    );

    // If logging in as demo/sunny
    if (!matchedUser && (cleanEmail === 'sunny' || cleanEmail.includes('sunny'))) {
      matchedUser = { ...MOCK_USER_PROFILE };
      saveLocalUser(matchedUser);
    }

    if (!matchedUser) {
      // If user isn't in registry yet, bootstrap them
      const bootstrapName = cleanEmail.split('@')[0];
      matchedUser = {
        id: 'usr_' + Date.now(),
        email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@profilefolio.dev`,
        username: bootstrapName.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        display_name: bootstrapName.charAt(0).toUpperCase() + bootstrapName.slice(1),
        headline: 'Developer & Systems Engineer',
        bio: 'Building scalable modern software platforms.',
        location: '',
        github_handle: '',
        theme_preference: 'dark',
        created_at: new Date().toISOString()
      };
      saveLocalUser(matchedUser);
    }

    if (matchedUser && matchedUser.password_hash) {
      const inputHash = await hashPassword(password);
      if (inputHash !== matchedUser.password_hash) {
        throw new Error('Invalid email or password. Please try again.');
      }
    }

    const session = {
      access_token: 'mock_jwt_' + matchedUser.id,
      user: matchedUser,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(matchedUser));
    localStorage.setItem('ssrnovx_mock_session', JSON.stringify(matchedUser));
    localStorage.setItem('profilefolio_active_user', JSON.stringify(matchedUser));

    return { user: matchedUser, session };
  },

  /**
   * Password Reset Request
   */
  async resetPasswordForEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login/?reset=true`,
      });
      if (error) throw error;
      return data;
    }

    // Mock reset confirmation
    return { success: true, email: cleanEmail, message: 'Password reset link sent.' };
  },

  /**
   * Login via GitHub OAuth Provider
   */
  async signInWithOAuth(provider = 'github') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard/`,
        },
      });
      if (error) throw error;
      return data;
    }

    // Mock OAuth simulation
    const mockUser = { ...MOCK_USER_PROFILE, github_handle: 'ssrnov' };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(mockUser));
    localStorage.setItem('ssrnovx_mock_session', JSON.stringify(mockUser));
    window.location.href = '/dashboard/';
    return { user: mockUser };
  },

  /**
   * Log out current session
   */
  async signOut() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('ssrnovx_mock_session');
    localStorage.removeItem('buildlab_session');
    localStorage.removeItem('profilefolio_active_user');
    window.location.href = '/login/';
  },

  /**
   * Get Current Session
   */
  async getSession() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session) return data.session;
    }

    const stored = localStorage.getItem(SESSION_STORAGE_KEY) || 
                   localStorage.getItem('ssrnovx_mock_session') ||
                   localStorage.getItem('profilefolio_active_user');
    return stored ? { access_token: 'mock_jwt_token', user: JSON.parse(stored) } : null;
  },

  /**
   * Get Active User
   */
  async getUser() {
    if (isSupabaseConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) return user;
    }

    const session = await this.getSession();
    return session?.user || null;
  },

  /**
   * Listen to Auth Changes
   */
  onAuthStateChange(callback) {
    if (isSupabaseConfigured && supabase) {
      return supabase.auth.onAuthStateChange(callback);
    }

    const stored = localStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem('ssrnovx_mock_session');
    callback(stored ? 'SIGNED_IN' : 'SIGNED_OUT', stored ? { user: JSON.parse(stored) } : null);
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};

// ==============================================================================
// 3. Profile Services
// ==============================================================================
export const profileService = {
  async getProfile(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    }
    const users = getLocalUsers();
    const found = users.find(u => u.id === userId);
    return found || MOCK_USER_PROFILE;
  },

  async getProfileByUsername(username) {
    const cleanUsername = (username || '').trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .single();
      if (error) throw error;
      return data;
    }

    const users = getLocalUsers();
    const found = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (found) return found;
    if (cleanUsername === 'sunny') return { ...MOCK_USER_PROFILE };
    return null;
  },

  async updateProfile(userId, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const users = getLocalUsers();
    const idx = users.findIndex(u => u.id === userId);
    let updated;
    if (idx !== -1) {
      updated = { ...users[idx], ...updates };
      users[idx] = updated;
    } else {
      updated = { ...MOCK_USER_PROFILE, ...updates, id: userId };
      users.push(updated);
    }
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));

    // Update active session if it matches
    const active = await authService.getUser();
    if (active && active.id === userId) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
    }

    return updated;
  },
};

// ==============================================================================
// 4. Portfolio Services
// ==============================================================================
export const portfolioService = {
  async getUserPortfolio(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*, projects(*), skills(*), experiences(*), education(*)')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    }

    const user = await profileService.getProfile(userId);
    const slug = user?.username || 'sunny';
    
    // Check user-scoped publish settings
    const rawSettings = localStorage.getItem(`profilefolio_user_${userId}_publish`) || 
                        localStorage.getItem('profilefolio_publish_settings');
    const settings = rawSettings ? JSON.parse(rawSettings) : { isPublished: true, templateId: 'minimal-professional' };

    return {
      id: 'port_' + (userId || 'mock_1'),
      user_id: userId,
      title: `${user?.display_name || 'Developer'} Portfolio`,
      slug,
      template_id: settings.templateId || 'minimal-professional',
      is_published: settings.isPublished !== false,
      seo_title: `${user?.display_name || 'Developer'} — Folioryn`,
      seo_description: user?.headline || 'Developer Portfolio',
    };
  },

  async getPortfolioBySlug(slug) {
    const cleanSlug = (slug || '').trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*, profiles(*), projects(*), skills(*), experiences(*), education(*)')
        .eq('slug', cleanSlug)
        .single();
      if (error) throw error;
      return data;
    }

    // Local Multi-User Lookup
    const user = await profileService.getProfileByUsername(cleanSlug);
    if (!user) {
      if (cleanSlug === 'sunny') {
        return {
          slug: 'sunny',
          title: 'Sunny / SSRNovX',
          template_id: 'minimal-professional',
          is_published: true,
          profiles: { ...MOCK_USER_PROFILE }
        };
      }
      return null;
    }

    const rawSettings = localStorage.getItem(`profilefolio_user_${user.id}_publish`) ||
                        localStorage.getItem('profilefolio_publish_settings');
    const settings = rawSettings ? JSON.parse(rawSettings) : { isPublished: true, templateId: 'minimal-professional' };

    return {
      slug: user.username,
      title: `${user.display_name} — Portfolio`,
      template_id: settings.templateId || 'minimal-professional',
      is_published: settings.isPublished !== false,
      profiles: user
    };
  },

  async updatePortfolio(portfolioId, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', portfolioId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return { id: portfolioId, ...updates };
  },
};

// ==============================================================================
// 5. Projects Services
// ==============================================================================
export const projectService = {
  async getProjects(portfolioId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    }
    return [];
  },

  async createProject(projectData) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return { id: 'proj_' + Date.now(), ...projectData };
  },

  async updateProject(projectId, updates) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return { id: projectId, ...updates };
  },

  async deleteProject(projectId) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      if (error) throw error;
      return true;
    }
    return true;
  },
};

// ==============================================================================
// 6. Contact & Message Service
// ==============================================================================
export const contactService = {
  async submitMessage(portfolioId, { senderName, senderEmail, subject, message }) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([
          {
            portfolio_id: portfolioId,
            sender_name: senderName,
            sender_email: senderEmail,
            subject: subject || 'Portfolio Inquiry',
            message,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // Real local persistence for contact inquiries
    try {
      const raw = localStorage.getItem('profilefolio_contact_messages');
      const messages = raw ? JSON.parse(raw) : [];
      const newMsg = {
        id: 'msg_' + Date.now(),
        portfolio_id: portfolioId || 'global',
        sender_name: senderName,
        sender_email: senderEmail,
        subject: subject || 'Portfolio Inquiry',
        message,
        received_at: new Date().toISOString()
      };
      messages.unshift(newMsg);
      localStorage.setItem('profilefolio_contact_messages', JSON.stringify(messages));
      return { success: true, message: newMsg };
    } catch (e) {
      return { success: true, timestamp: new Date().toISOString() };
    }
  },
};
