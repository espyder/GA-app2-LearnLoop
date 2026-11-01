-- LearnLoop privileges and Row Level Security policies
-- Run after the files in schema/.
--
-- Row Level Security (RLS) protects individual database rows. PostgreSQL first
-- checks whether a role has permission to perform an operation (GRANT), then
-- checks the matching RLS policy to decide which rows that role may use.

-- Turn on row-by-row security for all tables exposed through Supabase.
alter table public.lessons enable row level security;
alter table public.user_lesson_state enable row level security;
alter table public.user_preferences enable row level security;

-- Start from least privilege, then grant only what the Expo client needs.
-- `anon` is a visitor without a session. `authenticated` is a signed-in user.
revoke all on table public.lessons from anon, authenticated;
revoke all on table public.user_lesson_state from anon, authenticated;
revoke all on table public.user_preferences from anon, authenticated;

-- Lesson content is public read-only data, so both roles may SELECT it.
grant select on table public.lessons to anon, authenticated;

-- Progress and bookmarks are user-owned data. A signed-in user needs all four
-- CRUD operations: SELECT, INSERT, UPDATE, and DELETE.
grant select, insert, update, delete
  on table public.user_lesson_state to authenticated;

-- Preferences can be read, created, and edited. The app does not delete them.
grant select, insert, update
  on table public.user_preferences to authenticated;

-- Shared lesson content is readable before and after login. Client roles do not
-- receive insert, update, or delete privileges for this table.
-- Dropping a policy first makes this script safe to run again after an edit.
drop policy if exists "Lessons are readable by everyone"
  on public.lessons;

create policy "Lessons are readable by everyone"
on public.lessons
for select
to anon, authenticated
-- `using (true)` means every lesson row passes this SELECT policy.
using (true);

-- A signed-in user can only read and change their own lesson-state rows.
-- `auth.uid()` returns the UUID from the current user's Supabase access token.
-- Comparing it with `user_id` ensures one account cannot access another
-- account's progress or bookmarks.
drop policy if exists "Users can read own lesson state"
  on public.user_lesson_state;
drop policy if exists "Users can insert own lesson state"
  on public.user_lesson_state;
drop policy if exists "Users can update own lesson state"
  on public.user_lesson_state;
drop policy if exists "Users can delete own lesson state"
  on public.user_lesson_state;

create policy "Users can read own lesson state"
on public.user_lesson_state
for select
to authenticated
-- USING controls which existing rows the user can see or target.
using ((select auth.uid()) = user_id);

create policy "Users can insert own lesson state"
on public.user_lesson_state
for insert
to authenticated
-- WITH CHECK validates the data in a new row before PostgreSQL saves it.
with check ((select auth.uid()) = user_id);

create policy "Users can update own lesson state"
on public.user_lesson_state
for update
to authenticated
-- The old row must belong to the user...
using ((select auth.uid()) = user_id)
-- ...and the updated row must still belong to the same user.
with check ((select auth.uid()) = user_id);

create policy "Users can delete own lesson state"
on public.user_lesson_state
for delete
to authenticated
-- Only a row owned by the signed-in user can be deleted.
using ((select auth.uid()) = user_id);

-- Preferences have one row per user. The app reads, creates, and updates it.
-- These policies use the same ownership test as the lesson-state policies.
drop policy if exists "Users can read own preferences"
  on public.user_preferences;
drop policy if exists "Users can insert own preferences"
  on public.user_preferences;
drop policy if exists "Users can update own preferences"
  on public.user_preferences;

create policy "Users can read own preferences"
on public.user_preferences
for select
to authenticated
-- Only return the preference row whose user_id matches the current account.
using ((select auth.uid()) = user_id);

create policy "Users can insert own preferences"
on public.user_preferences
for insert
to authenticated
-- Prevent a user from creating preferences for somebody else's UUID.
with check ((select auth.uid()) = user_id);

create policy "Users can update own preferences"
on public.user_preferences
for update
to authenticated
-- The current row must belong to the signed-in user...
using ((select auth.uid()) = user_id)
-- ...and its user_id cannot be changed to another account.
with check ((select auth.uid()) = user_id);
