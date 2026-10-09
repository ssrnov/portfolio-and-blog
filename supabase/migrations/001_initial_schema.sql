-- ==============================================================================
-- SSRNovX Multi-User SaaS Platform — Initial Database Schema & RLS Policies
-- Compatible with Supabase PostgreSQL (Postgres 15+)
-- ==============================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. Helper Functions & Triggers for Timestamps
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. Core Tables
-- ==============================================================================

-- 2.1 Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  github_handle TEXT,
  github_access_token TEXT,
  twitter_handle TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  theme_preference TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2.2 Portfolios
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Developer Portfolio',
  slug TEXT UNIQUE NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'minimal', -- 'minimal', 'terminal', 'editorial'
  is_published BOOLEAN NOT NULL DEFAULT false,
  custom_domain TEXT UNIQUE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON public.portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);

CREATE TRIGGER set_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2.3 Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Web',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  repo_url TEXT,
  live_url TEXT,
  thumbnail_url TEXT,
  stars_count INT DEFAULT 0,
  forks_count INT DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  github_repo_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_portfolio_id ON public.projects(portfolio_id);

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2.4 Professional Experiences
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description_bullets TEXT[] DEFAULT ARRAY[]::TEXT[],
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_portfolio_id ON public.experiences(portfolio_id);

-- 2.5 Education
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  grade_or_highlights TEXT,
  coursework TEXT[] DEFAULT ARRAY[]::TEXT[],
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_education_portfolio_id ON public.education(portfolio_id);

-- 2.6 Technical Skills
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'Frontend', 'Backend', 'DevOps', 'Databases', 'Core'
  name TEXT NOT NULL,
  proficiency_level INT DEFAULT 5, -- 1 to 5 scale
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_portfolio_id ON public.skills(portfolio_id);

-- 2.7 ATS Resume Configurations
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Engineering Resume',
  summary TEXT,
  selected_project_ids UUID[] DEFAULT ARRAY[]::UUID[],
  template_style TEXT NOT NULL DEFAULT 'ats-clean',
  pdf_storage_path TEXT,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);

CREATE TRIGGER set_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2.8 Engineering Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content_markdown TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  reading_time_minutes INT DEFAULT 3,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_post_slug UNIQUE(user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON public.blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2.9 Inbound Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_portfolio_id ON public.contact_messages(portfolio_id);

-- ==============================================================================
-- 3. Row-Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 3.1 Profiles RLS
-- Anyone can view public profile info
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3.2 Portfolios RLS
-- Anyone can read published portfolios
CREATE POLICY "Published portfolios are publicly viewable"
  ON public.portfolios FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- 3.3 Projects RLS
CREATE POLICY "Projects viewable if portfolio published or owned"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = projects.portfolio_id
        AND (p.is_published = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage projects in their portfolios"
  ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = projects.portfolio_id
        AND p.user_id = auth.uid()
    )
  );

-- 3.4 Experiences RLS
CREATE POLICY "Experiences viewable if portfolio published or owned"
  ON public.experiences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = experiences.portfolio_id
        AND (p.is_published = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage experiences in their portfolios"
  ON public.experiences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = experiences.portfolio_id
        AND p.user_id = auth.uid()
    )
  );

-- 3.5 Education RLS
CREATE POLICY "Education viewable if portfolio published or owned"
  ON public.education FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = education.portfolio_id
        AND (p.is_published = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage education in their portfolios"
  ON public.education FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = education.portfolio_id
        AND p.user_id = auth.uid()
    )
  );

-- 3.6 Skills RLS
CREATE POLICY "Skills viewable if portfolio published or owned"
  ON public.skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = skills.portfolio_id
        AND (p.is_published = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage skills in their portfolios"
  ON public.skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = skills.portfolio_id
        AND p.user_id = auth.uid()
    )
  );

-- 3.7 Resumes RLS
CREATE POLICY "Users can manage their own resumes"
  ON public.resumes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view resume if user profile exists"
  ON public.resumes FOR SELECT
  USING (true);

-- 3.8 Blog Posts RLS
CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Authors can manage their own blog posts"
  ON public.blog_posts FOR ALL
  USING (auth.uid() = user_id);

-- 3.9 Contact Messages RLS
-- Anyone can send a contact message
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Only portfolio owner can read messages
CREATE POLICY "Portfolio owners can view and manage their messages"
  ON public.contact_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = contact_messages.portfolio_id
        AND p.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 4. Auth Sign Up Trigger: Automatic Profile & Default Portfolio Creation
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  clean_username TEXT;
  user_full_name TEXT;
  avatar_val TEXT;
BEGIN
  -- Extract username from metadata or email prefix
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  base_username := COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'preferred_username', split_part(NEW.email, '@', 1));
  
  -- Clean username: alphanumeric, lowercase, dashes only
  clean_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g'));
  IF clean_username = '' THEN
    clean_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = clean_username) LOOP
    clean_username := clean_username || '_' || floor(random() * 900 + 100)::text;
  END LOOP;

  avatar_val := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL);

  -- 1. Create Profile
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    headline,
    avatar_url,
    github_handle
  ) VALUES (
    NEW.id,
    clean_username,
    user_full_name,
    'Software Engineer & Developer',
    avatar_val,
    NEW.raw_user_meta_data->>'user_name'
  );

  -- 2. Create Initial Default Portfolio
  INSERT INTO public.portfolios (
    user_id,
    title,
    slug,
    template_id,
    is_published,
    seo_title,
    seo_description
  ) VALUES (
    NEW.id,
    user_full_name || ' — Portfolio',
    clean_username,
    'minimal',
    true,
    user_full_name || ' | Developer Portfolio',
    'Personal portfolio and projects built with SSRNovX.'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
