# LearnLoop Supabase

This is the living source of truth for LearnLoop's Supabase database,
authentication, authorization, and client integration. Update it whenever the
schema, policies, authentication flow, or synchronization behavior changes.

Last updated: 2026-11-01

## Current status

- The Supabase project has been created.
- `lessons`, `user_lesson_state`, and `user_preferences` have been created.
- Row Level Security (RLS) and the initial policies have been applied.
- The catalog contains six seeded lessons with six checkpoints each.
- Email/password authentication is implemented with registration and login.
- The Expo client dependencies have been installed.
- `src/lib/supabase.ts` initializes the client and persists its session locally.
- `.env.local` contains the project URL and publishable key and is ignored by Git.
- `AuthProvider` restores the persisted session and listens for auth changes.
- `LearnLoopProvider` mounts only for a signed-in account and loads that user's
  data from Supabase.
- Progress, bookmarks, and preferences use optimistic updates followed by
  RLS-protected database upserts.
- The local lesson array has been removed. Loading, empty, missing-lesson, and
  connection-error states are handled in the UI.

## Architecture

| Area | Source of truth | Access |
| --- | --- | --- |
| Lesson content | `public.lessons` | Public read; dashboard/backend write |
| Progress | `public.user_lesson_state.progress` | Current user only |
| Bookmarks | `public.user_lesson_state.bookmarked` | Current user only |
| Theme and preferences | `public.user_preferences` | Current user only |
| Identity and sessions | Supabase Auth | Managed by Supabase |

The app uses recoverable email/password accounts. `AuthProvider` restores the
locally persisted session, while `AuthScreen` provides validated registration
and login forms. Once a session exists, `session.user.id` is passed into
`LearnLoopProvider` for all user-owned queries.

## Database schema

### `public.lessons`

Shared learning content displayed to every user.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` | Primary key; stable slug used by navigation |
| `title` | `text` | Required |
| `topic` | `text` | Required |
| `duration` | `text` | Display value such as `12 min` |
| `difficulty` | `text` | `Beginner` or `Intermediate` |
| `summary` | `text` | Lesson introduction |
| `takeaways` | `text[]` | Lesson takeaway list |
| `checkpoint` | `text` | Next checkpoint label |
| `sort_order` | `integer` | Controls display order |
| `created_at` | `timestamptz` | Defaults to `now()` |

The client should query lessons in this order:

```ts
supabase.from('lessons').select('*').order('sort_order');
```

Each seeded lesson contains five takeaway checkpoints and one final practice
task. Completing one checkpoint stores approximately 17 percent more progress
in `user_lesson_state`. Run the numbered scripts in `supabase/` in order to
create the schema, apply RLS, and upsert all six lessons without changing
existing lesson IDs or breaking saved user state.

### `public.user_lesson_state`

One row per user and lesson, combining progress and bookmark state.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | References `auth.users`; part of primary key |
| `lesson_id` | `text` | References `lessons`; part of primary key |
| `progress` | `integer` | Restricted to `0` through `100` |
| `bookmarked` | `boolean` | Defaults to `false` |
| `updated_at` | `timestamptz` | Maintained by a database trigger |

The composite primary key is `(user_id, lesson_id)`. Client writes should use
an upsert with `user_id,lesson_id` as the conflict target.

### `public.user_preferences`

One row per user containing app-wide settings.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | Primary key; references `auth.users` |
| `theme` | `text` | `light` or `midnight` |
| `notifications` | `boolean` | Defaults to `true` |
| `reduced_motion` | `boolean` | Defaults to `true` |
| `updated_at` | `timestamptz` | Maintained by a database trigger |

## SQL source files

The complete reproducible database setup is grouped by object type under
`supabase/`. For a new Supabase project, open **SQL Editor** in the Supabase
Dashboard and run these files in numeric order:

1. `schema/01_tables.sql` creates tables, constraints, and indexes.
2. `schema/02_functions_and_triggers.sql` maintains `updated_at` values.
3. `security/03_rls_policies.sql` applies grants and ownership policies.
4. `seed/04_lessons.sql` upserts the shared lesson catalog.

```text
supabase/
|-- schema/    tables, constraints, indexes, functions, and triggers
|-- security/  privileges and Row Level Security policies
|-- seed/      shared application data
`-- README.md  database, authentication, and integration documentation
```

All scripts are safe to rerun for the canonical LearnLoop setup. The seed uses
`on conflict (id) do update`, so stable lesson IDs and existing user progress
references are preserved.

## Dashboard-only configuration

SQL does not configure the hosted email provider. In Supabase Dashboard:

1. Open **Authentication > Providers**.
2. Enable **Email**.
3. Choose whether sign-up requires email confirmation.
4. Add redirect URLs if the project later handles confirmation links inside a
   native production build.

The Expo client must use only the project URL and publishable key. Never place a
secret key, legacy `service_role` key, or database password in the application.

## Authorization and RLS

RLS is enabled on all three public tables.

### Lessons

- `anon` and `authenticated` may select lessons.
- Client roles cannot insert, update, or delete lessons.
- Lesson management should happen through the Supabase dashboard or a trusted
  backend using server-side credentials.

### User lesson state

- Only `authenticated` users receive table privileges.
- Select, insert, update, and delete policies require
  `(select auth.uid()) = user_id`.
- A user cannot read or modify another user's progress or bookmarks.

### User preferences

- Only `authenticated` users receive table privileges.
- Select, insert, and update policies require
  `(select auth.uid()) = user_id`.
- A user cannot read or modify another user's settings.

Never place the Supabase `service_role` key in this application. It bypasses
RLS. The Expo app must use only the publishable key.

## Authentication flow

At application startup:

1. `AuthProvider` calls `supabase.auth.getSession()`.
2. If no session exists, `AuthScreen` displays registration and login.
3. Registration uses `supabase.auth.signUp({ email, password })`.
4. Login uses `supabase.auth.signInWithPassword({ email, password })`.
5. `onAuthStateChange` publishes the new session to the app.
6. `AuthGate` mounts `LearnLoopProvider` with `session.user.id`.
7. The provider loads lesson state and preferences inside `useEffect`.
8. Logout calls `supabase.auth.signOut()` and returns to `AuthScreen`.

If Confirm Email is enabled in the Supabase dashboard, registration creates the
account without an immediate session. The form tells the user to confirm the
email and then sign in.

## Expo client configuration

The client is initialized in `src/lib/supabase.ts` with:

- `react-native-url-polyfill`
- Expo SQLite-backed `localStorage`
- automatic access-token refresh
- persistent sessions
- URL session detection disabled for React Native

Local configuration lives in `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=<project URL>
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```

Both values are embedded in the client bundle. The publishable key is safe to
embed only because RLS controls data access. Do not record its actual value in
documentation, screenshots, commits, or issue descriptions.

Restart Expo after changing environment variables:

```powershell
npx expo start --clear
```

## Client integration

`src/state/AuthProvider.tsx` owns session state. Authentication operations are in
`src/services/auth.service.ts`. `src/state/LearnLoopProvider.tsx` remains the
UI-facing learning-data layer, and database operations live in
`src/services/learnLoop.service.ts`. Together they currently:

1. Restore a persisted email/password session.
2. Display the validated auth form while signed out.
3. Fetch lessons ordered by `sort_order` after login.
4. Fetch the current user's lesson state and preferences.
5. Create the default preferences row when a new user does not have one.
6. Expose lessons, user state, loading, errors, and retry behavior.
7. Advance progress one lesson checkpoint at a time.
8. Keep progress, bookmark, and setting changes optimistic in React state.
9. Persist each change with a Supabase upsert and roll back failed writes.
10. End the session from Settings and return to the auth form.

The screens do not import lesson content directly. The shared `Lesson` type
lives beside the learning feature in
`src/features/learning/lesson.types.ts`.

## Offline behavior

Supabase does not automatically provide offline database synchronization. The
Settings screen now describes the data as synced online and no longer promises
offline availability.

Before release, either:

- cache lessons and user state locally and implement a retry/sync queue; or
- change the Settings screen copy so it does not promise offline availability.

When conflict resolution is added, compare `updated_at` values and document
whether the newest server value, newest device value, or a merge wins.

## Verification checklist

- Registration rejects empty fields, invalid email, short passwords, and
  mismatched password confirmation before making a request.
- A new account can register, confirm email when required, and log in.
- A saved session is restored after restarting the app.
- Logging out returns the user to the authentication screen.
- Signed-out users cannot enter the private app navigator.
- A user can read and upsert their own lesson state.
- A user cannot read or write another user's lesson state.
- A user can read and upsert their own preferences.
- Progress remains after restarting the app.
- Bookmarks remain after restarting the app.
- Theme and settings remain after restarting the app.
- Missing network connectivity produces a useful state instead of a crash.
- No service-role key exists in the repository or application bundle.
- Each seeded lesson advances through six persisted checkpoints.

## Change log

### 2026-11-01

- Added complete, ordered SQL files for schema, triggers, grants, RLS policies,
  and lesson seed data under `supabase/`.
- Grouped SQL by schema, security, and seed database object types.
- Consolidated the Supabase setup and architecture documentation into this
  single README.

### 2026-10-31

- Replaced automatic anonymous authentication with email/password registration,
  login, persistent sessions, and logout.
- Added field-level validation to the authentication form.
- Added `AuthProvider` and an authentication gate before private navigation.
- Changed lesson completion from a binary toggle to checkpoint-based progress.
- Added a repeatable seed script with six expanded lessons.
- Applied the expanded lesson seed to the hosted Supabase project.
- Reorganized application code under `src/` by responsibility and feature.
- Separated navigation from provider composition.
- Extracted authentication and Supabase CRUD from React state into
  `src/services/learnLoop.service.ts`.
- Co-located learning screens, components, and lesson types.

### 2026-10-26

- Created the initial three-table schema.
- Added RLS grants and user-ownership policies.
- Seeded the original LearnLoop lessons.
- Enabled anonymous authentication.
- Added the Expo Supabase client and persistent session dependencies.
- Configured local Supabase environment variables.
- Replaced the local lesson array and demo user state with Supabase reads.
- Added optimistic Supabase writes for progress, bookmarks, and preferences.
- Added loading, connection-error, retry, empty-database, and missing-lesson UI.
- Removed the hard-coded streak and offline-storage claims from the interface.
- Replaced the placeholder Home screen date with the current date.
- Added automatic creation of the default preferences row for new users.
