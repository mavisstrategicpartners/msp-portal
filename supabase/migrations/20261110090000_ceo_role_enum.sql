-- Formalise the CEO as an explicit role grant. Kept in its own migration
-- because a new enum value must be committed before it can be used.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ceo';
