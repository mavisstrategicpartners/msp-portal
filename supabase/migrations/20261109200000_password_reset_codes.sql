-- =====================================================================
-- MSP PORTAL — PASSWORD RESET VERIFICATION CODES
-- =====================================================================
-- Server-side store for the Forgot Password flow (src/lib/password-reset.server.ts).
-- Codes and reset tokens are stored only as HMAC-SHA256 hashes. The table
-- has RLS enabled and NO policies, so browsers (anon / authenticated) can
-- never read or write it; only the server's service-role key can.
-- Safe to apply: creates new objects only, changes no existing data.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                   text NOT NULL,                 -- lower-cased address as typed
  user_id                 uuid NULL,                     -- NULL when no active account matches (kept for uniform rate limiting)
  code_hash               text NOT NULL,                 -- HMAC of email + 6-digit code
  expires_at              timestamptz NOT NULL,          -- code expiry (10 minutes)
  attempts                integer NOT NULL DEFAULT 0,    -- wrong guesses against this code
  verified_at             timestamptz NULL,              -- code accepted (code can't be used again)
  reset_token_hash        text NULL,                     -- HMAC of the one-time token issued after verification
  reset_token_expires_at  timestamptz NULL,
  completed_at            timestamptz NULL,              -- password changed with this request
  invalidated_at          timestamptz NULL,              -- superseded by a newer code, or locked out
  request_ip              text NULL,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_reset_requests_email_created_idx
  ON public.password_reset_requests (email, created_at DESC);
CREATE INDEX IF NOT EXISTS password_reset_requests_ip_created_idx
  ON public.password_reset_requests (request_ip, created_at DESC);
CREATE INDEX IF NOT EXISTS password_reset_requests_token_idx
  ON public.password_reset_requests (reset_token_hash) WHERE reset_token_hash IS NOT NULL;

ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.password_reset_requests FROM anon, authenticated;
GRANT ALL ON public.password_reset_requests TO service_role;

-- Sign a user out everywhere after a password reset (server-only).
CREATE OR REPLACE FUNCTION public.revoke_user_sessions(_user_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth, public AS $$
BEGIN
  DELETE FROM auth.sessions WHERE user_id = _user_id;          -- refresh tokens cascade
END $$;

REVOKE EXECUTE ON FUNCTION public.revoke_user_sessions(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_user_sessions(uuid) TO service_role;

-- Housekeeping: requests older than 30 days carry no value.
CREATE OR REPLACE FUNCTION public.purge_old_password_reset_requests() RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.password_reset_requests WHERE created_at < now() - interval '30 days';
$$;
REVOKE EXECUTE ON FUNCTION public.purge_old_password_reset_requests() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_password_reset_requests() TO service_role;
