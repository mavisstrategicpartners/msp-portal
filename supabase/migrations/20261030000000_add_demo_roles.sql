-- supabase/migrations/20261030000000_add_demo_roles.sql
-- Add demo-specific role values to the app_role enum

-- Adding new enum values must be done in separate statements

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance_administration';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales';

-- No data migration needed; the demo accounts will be assigned these roles via the setup script.
