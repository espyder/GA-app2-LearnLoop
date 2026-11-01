-- LearnLoop database functions and triggers
-- Run after schema/01_tables.sql.

-- Keep updated_at accurate whenever a user-owned row changes.
-- A trigger function is database code that PostgreSQL runs automatically.
create or replace function public.set_updated_at()
-- "returns trigger" means this function is designed for a table trigger rather
-- than being called by the mobile application.
returns trigger
language plpgsql
-- security invoker runs with the permissions of the user making the update.
security invoker
-- An empty search path prevents an unexpected schema from changing which
-- database objects the function resolves.
set search_path = ''
as $$
begin
  -- NEW is PostgreSQL's name for the row that is about to be stored.
  new.updated_at = now();
  return new;
end;
$$;

-- Dropping first makes the script safe to run again without duplicate triggers.
drop trigger if exists set_user_lesson_state_updated_at
  on public.user_lesson_state;

-- BEFORE UPDATE runs before PostgreSQL saves a changed lesson-state row.
-- FOR EACH ROW means it runs separately for every updated row.
create trigger set_user_lesson_state_updated_at
before update on public.user_lesson_state
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_preferences_updated_at
  on public.user_preferences;

-- Preferences use the same function, so both private tables maintain matching
-- updated_at behavior without duplicating function code.
create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();
