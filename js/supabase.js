/**
 * SSRNovX — Supabase Client & Data Access Layer
 * Provides unified authentication, session listeners, and CRUD queries
 * with seamless local mock fallback when credentials are not yet configured.
 */

import { createClient } from '@supabase/supabase-js';

// Environment Variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
// 1. Mock Local Storage Database (Fallback when offline/unconfigured)
// ==============================================================================
const MOCK_STORAGE_KEY = 'ssrnovx_mock_session';
const MOCK_USER_PROFILE = {
  id: 'usr_mock_sunny_9921',
  email: 'sunny@ssrnovx.dev',
  username: 'sunny',
  display_name: 'Sunny / SSRNovX',
  headline: 'Staff Systems & Frontend Architect',
  bio: 'Engineering scalable distributed architectures, zero-dependency high-performance web systems, and developer platforms.',
  location: 'India (IST / UTC+5:30)',
  avatar_url: '',
  github_handle: 'ssrnov',
  twitter_handle: 'ssrnov',
  linkedin_url: 'https://linkedin.com',
  website_url: 'https://ssrnovx.dev',
  theme_preference: 'dark',
};

// ==============================================================================
// 2. Authentication Services
// ==============================================================================
export const authService = {
  /**
   * Register with Email & Password
   */
  async signUp(email, password, { username, fullName }) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_name: username,
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      return data;
    }

    // Mock fallback
    const mockUser = {
      ...MOCK_USER_PROFILE,
      email,
      username: username || 'user_' + Math.floor(Math.random() * 1000),
      display_name: fullName || 'New Developer',
    };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
    return { user: mockUser, session: { access_token: 'mock_jwt_token', user: mockUser } };
  },

  /**
   * Login with Email & Password
   */
  async signInWithPassword(email, password) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    }

    // Mock fallback
    const mockUser = { ...MOCK_USER_PROFILE, email };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
    return { user: mockUser, session: { access_token: 'mock_jwt_token', user: mockUser } };
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

    // Mock OAuth redirect simulation
    const mockUser = { ...MOCK_USER_PROFILE, github_handle: 'ssrnov' };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
    window.location.href = '/dashboard/';
    return { user: mockUser };
  },

  /**
   * Log out current session
   */
  async signOut() {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    localStorage.removeItem(MOCK_STORAGE_KEY);
    window.location.href = '/login/';
  },

  /**
   * Get Current Session
   */
  async getSession() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    }

    const stored = localStorage.getItem(MOCK_STORAGE_KEY);
    return stored ? { access_token: 'mock_token', user: JSON.parse(stored) } : null;
  },

  /**
   * Get Active User
   */
  async getUser() {
    if (isSupabaseConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    }

    const stored = localStorage.getItem(MOCK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Listen to Auth Changes
   */
  onAuthStateChange(callback) {
    if (isSupabaseConfigured && supabase) {
      return supabase.auth.onAuthStateChange(callback);
    }

    // Mock session check
    const stored = localStorage.getItem(MOCK_STORAGE_KEY);
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
    return MOCK_USER_PROFILE;
  },

  async getProfileByUsername(username) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      if (error) throw error;
      return data;
    }
    return { ...MOCK_USER_PROFILE, username };
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
    return { ...MOCK_USER_PROFILE, ...updates };
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
    return {
      id: 'port_mock_1',
      user_id: userId,
      title: 'Sunny / SSRNovX Portfolio',
      slug: 'sunny',
      template_id: 'minimal',
      is_published: true,
      seo_title: 'Sunny — Developer Portfolio',
      seo_description: 'Staff Systems & Frontend Architect',
    };
  },

  async getPortfolioBySlug(slug) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*, profiles(*), projects(*), skills(*), experiences(*), education(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) throw error;
      return data;
    }
    return {
      slug,
      title: 'Sunny / SSRNovX',
      template_id: 'minimal',
      is_published: true,
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
    return { success: true, timestamp: new Date().toISOString() };
  },
};
