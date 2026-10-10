-- ==============================================================================
-- Migration 002: Draft Mode, Tokenized Previews, and Inbound Message Delivery
-- ==============================================================================

-- 1. Tri-State Publishing & Secure Tokenized Previews on Portfolios
ALTER TABLE public.portfolios 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'unpublished')),
  ADD COLUMN IF NOT EXISTS preview_token TEXT,
  ADD COLUMN IF NOT EXISTS preview_token_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_portfolios_preview_token ON public.portfolios(preview_token);

-- 2. Enhanced RLS Policy for Draft Mode & Tokenized Previews
DROP POLICY IF EXISTS "Published portfolios are publicly viewable" ON public.portfolios;

CREATE POLICY "Published portfolios are publicly viewable"
  ON public.portfolios FOR SELECT
  USING (
    (is_published = true AND status = 'published') 
    OR auth.uid() = user_id
    OR (
      preview_token IS NOT NULL 
      AND preview_token_expires_at > now()
    )
  );

-- 3. Inbound Contact Messages Delivery Enhancements
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Index for fast user message queries by recipient portfolio
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);
