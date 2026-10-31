# LearnLoop Supabase architecture

This is the living source of truth for LearnLoop's Supabase database,
authentication, authorization, and client integration. Update it whenever the
schema, policies, authentication flow, or synchronization behavior changes.

Last updated: 2026-10-31

## Current status

- The Supabase project has been created.
- `lessons`, `user_lesson_state`, and `user_preferences` have been created.
- Row Level Security (RLS) and the initial policies have been applied.
- The three original LearnLoop lessons have been seeded.
- Anonymous authentication has been enabled.
- The Expo client dependencies have been installed.
- `src/lib/supabase.ts` initializes the client and persists its session locally.
- `.env.local` contains the project URL and publishable key and is ignored by Git.
- `LearnLoopProvider` restores or creates an anonymous session and loads all app
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

The app uses anonymous Supabase users initially. This provides a real user ID
without requiring a login screen. Anonymous users use the `authenticated`
Postgres role, so user-owned tables must always check `auth.uid()` in RLS.

Anonymous sessions are installation-specific. If the user clears application
data, signs out, or changes device, they cannot recover the account unless an
email, phone, or OAuth identity is linked later.

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

1. Call `supabase.auth.getSession()`.
2. If a session exists, reuse it.
3. Otherwise call `supabase.auth.signInAnonymously()`.
4. Use `session.user.id` for user-owned reads and writes.
5. Load lesson state and preferences after authentication completes.

Future account support should link an identity to the existing anonymous user
instead of creating an unrelated user, so existing progress is retained.

Anonymous authentication can be abused to create many accounts. Before public
release, configure CAPTCHA or Turnstile and review Supabase Auth rate limits.

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

`src/state/LearnLoopProvider.tsx` remains the UI-facing state layer. Database
and authentication operations are isolated in
`src/services/learnLoop.service.ts`. Together they currently:

1. Establishes or restores the anonymous session.
2. Fetches lessons ordered by `sort_order`.
3. Fetches the current user's lesson state and preferences.
4. Creates the default preferences row when a new user does not have one.
5. Exposes lessons, user state, loading, errors, and retry behavior.
6. Keeps progress, bookmark, and setting changes optimistic in React state.
7. Persists each change with a Supabase upsert.
8. Rolls back an optimistic value when its database write fails.
9. Reloads authoritative server data when the user chooses `Try again`.

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

- A new installation receives an anonymous authenticated session.
- Signed-out public access can read `lessons` only.
- A user can read and upsert their own lesson state.
- A user cannot read or write another user's lesson state.
- A user can read and upsert their own preferences.
- Progress remains after restarting the app.
- Bookmarks remain after restarting the app.
- Theme and settings remain after restarting the app.
- Missing network connectivity produces a useful state instead of a crash.
- No service-role key exists in the repository or application bundle.

## Change log

### 2026-10-31

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
