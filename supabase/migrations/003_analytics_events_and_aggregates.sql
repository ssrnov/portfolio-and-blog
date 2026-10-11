-- ==============================================================================
-- Migration 003: Advanced Portfolio & Project-Level Analytics Engine
-- ==============================================================================

-- 1. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  portfolio_slug TEXT NOT NULL,
  project_id TEXT,
  project_title TEXT,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'portfolio_view',
      'project_view',
      'github_click',
      'demo_click',
      'resume_download',
      'contact_submit'
    )
  ),
  referrer TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Performance Indexes for Fast Date-Range & Project Aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_portfolio_created 
  ON public.analytics_events(portfolio_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_project_created 
  ON public.analytics_events(portfolio_slug, project_id, created_at DESC)
  WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_type_created 
  ON public.analytics_events(portfolio_slug, event_type, created_at DESC);

-- 3. Row-Level Security (RLS) Policies
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 3.1 Public Ingestion Policy: Anyone can record telemetry events
DROP POLICY IF EXISTS "Public can record analytics events" ON public.analytics_events;
CREATE POLICY "Public can record analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- 3.2 Owner Read Policy: Only the portfolio owner can view their own analytics
DROP POLICY IF EXISTS "Owners can view their portfolio analytics" ON public.analytics_events;
CREATE POLICY "Owners can view their portfolio analytics"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.slug = analytics_events.portfolio_slug
        AND p.user_id = auth.uid()
    )
  );

-- 3.3 Owner Delete Policy: Owners can purge or reset their analytics
DROP POLICY IF EXISTS "Owners can delete their portfolio analytics" ON public.analytics_events;
CREATE POLICY "Owners can delete their portfolio analytics"
  ON public.analytics_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.slug = analytics_events.portfolio_slug
        AND p.user_id = auth.uid()
    )
  );
