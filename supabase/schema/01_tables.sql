-- LearnLoop tables, constraints, and indexes
-- Run first in Supabase Dashboard > SQL Editor for a new project.
--
-- Data types used in this file:
-- text        = a variable-length string, such as a title or lesson ID
-- text[]      = an array containing multiple text strings
-- uuid        = a globally unique ID; Supabase Auth uses UUIDs for users
-- integer     = a whole number, such as progress or display order
-- boolean     = true or false
-- timestamptz = a date and time stored with timezone awareness

-- Shared lesson content. These rows are the same for every user.
create table if not exists public.lessons (
  -- A stable text slug such as 'react-fundamentals'. Primary key means that
  -- every lesson must have a unique ID and the ID cannot be null.
  id text primary key,

  -- Required display strings shown on lesson cards and the detail screen.
  title text not null,
  topic text not null,
  duration text not null,

  -- Only the two listed strings are accepted by this check constraint.
  difficulty text not null
    constraint lessons_difficulty_check
    check (difficulty in ('Beginner', 'Intermediate')),

  -- summary is the introduction. takeaways stores several checkpoint strings
  -- in one PostgreSQL text array. An empty array is the default.
  summary text not null,
  takeaways text[] not null default '{}',

  -- The final practice task and the number controlling list order.
  checkpoint text not null,
  sort_order integer not null default 0,

  -- now() records when Supabase inserts the lesson.
  created_at timestamptz not null default now()
);

-- Private progress and bookmark data. One row represents one user's state for
-- one lesson; therefore the primary key combines user_id and lesson_id.
create table if not exists public.user_lesson_state (
  -- user_id points to the Supabase Auth user. Deleting the Auth account also
  -- deletes its lesson-state rows because of on delete cascade.
  user_id uuid not null references auth.users(id) on delete cascade,

  -- lesson_id points to lessons.id. Deleting a lesson removes its state rows.
  lesson_id text not null references public.lessons(id) on delete cascade,

  -- Progress is a whole-number percentage. The check rejects values below 0
  -- or above 100 at the database level.
  progress integer not null default 0
    constraint user_lesson_state_progress_check
    check (progress between 0 and 100),

  -- A boolean records whether this user saved the lesson.
  bookmarked boolean not null default false,

  -- The trigger in the next SQL file refreshes this timestamp on every update.
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Private app preferences. user_id is the primary key, so each account can
-- have exactly one preferences row.
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- theme is text, but the check limits it to values supported by the app.
  theme text not null default 'light'
    constraint user_preferences_theme_check
    check (theme in ('light', 'midnight')),

  -- These true/false values map to switches on SettingsScreen.
  notifications boolean not null default true,
  reduced_motion boolean not null default true,
  updated_at timestamptz not null default now()
);

-- An index is a database lookup structure. This one makes ordering lessons by
-- sort_order more efficient without changing the stored rows.
create index if not exists lessons_sort_order_index
  on public.lessons(sort_order);

-- This index helps database operations that start from a lesson ID rather than
-- from the composite primary key's first column, user_id.
create index if not exists user_lesson_state_lesson_id_index
  on public.user_lesson_state(lesson_id);
