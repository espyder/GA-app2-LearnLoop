# LearnLoop

LearnLoop is a React Native learning app built with Expo. The app lets users browse a set of lessons, track their progress, bookmark important content, and switch between light and dark themes.

## Features

- Learn screen with lesson cards
- Lesson detail screen with incremental checkpoint progress
- Bookmark support for saved lessons
- Progress tracking across the app
- Theme switching between light and midnight modes
- Shared app state using React Context
- Supabase-backed lessons, progress, bookmarks, and preferences
- Email/password registration, login, persistent sessions, and logout
- Validated authentication form with field-level feedback
- Per-user Row Level Security

## Tech Stack

- React Native
- Expo
- TypeScript
- React Navigation
- React Context
- Supabase

## Project Structure

This section is maintained whenever application files or folders are added,
moved, renamed, or removed.

- `src/App.tsx` - global provider composition
- `src/features/auth/` - registration and login interface
- `src/navigation/` - React Navigation setup and navigation types
- `src/features/learning/` - lesson screens, learning components, and lesson types
- `src/features/settings/` - settings feature UI
- `src/state/` - authentication and learning-data providers
- `src/services/` - authentication and Supabase data operations
- `src/lib/` - configured third-party clients
- `src/theme/` - color palettes and theme types
- `supabase/` - repeatable SQL seed files for the hosted database
- `docs/` - architecture and Supabase documentation
- `submission/` - private instructor handoff files; excluded from Git
- `.env.example` - safe template for local Supabase configuration
- `index.ts` - Expo application entry point

## Run locally

1. Clone the repository and enter the project:

   ```powershell
   git clone https://github.com/espyder/GA-app2-LearnLoop.git
   cd GA-app2-LearnLoop
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Copy `.env.example` to `.env.local`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Add the Supabase project URL and publishable key supplied with the
   submission. Never add a `service_role` key to the mobile application.

5. Start Expo with a cleared Metro cache:

   ```powershell
   npx expo start --clear
   ```

6. Open the app in Expo Go, an Android/iOS simulator, or press `w` for web.

The hosted LearnLoop project already contains the expanded six-lesson dataset.
When connecting the app to a different Supabase project, run
`supabase/seed_lessons.sql` in that project's SQL Editor.

## Instructor access guide

No shared password is committed to the repository. The instructor can create a
separate assessment account using an email address they control:

1. Follow **Run locally** above and open the app.
2. Select **Register** on the authentication screen.
3. Enter a valid email and a password containing at least six characters.
4. If Supabase asks for email confirmation, open the confirmation email and then
   return to the app to sign in.
5. The session remains stored after restarting the app.

Recommended assessment walkthrough:

1. Try submitting empty fields, an invalid email, a short password, and
   mismatched passwords to see client-side validation.
2. Register or sign in and confirm that the Learn, Progress, and Settings tabs
   still work.
3. Open a lesson and complete several checkpoints. Each lesson has six steps,
   and every action updates the visible percentage.
4. Bookmark a lesson and change the theme in Settings.
5. Restart the app and verify that the session, progress, bookmark, and settings
   are restored from Supabase.
6. Open Settings and select **Log out**. The private navigator should be replaced
   by the authentication screen.

### Arbeidskrav 2 requirement map

| Requirement | LearnLoop implementation |
| --- | --- |
| Supabase authentication | Registration, login, persisted session, and logout |
| CRUD | Lessons are read; progress, bookmarks, and preferences are inserted or updated with `upsert` |
| `useEffect` data loading | `LearnLoopProvider` loads the signed-in user's Supabase snapshot when it mounts |
| Validated form | Auth form checks required fields, email format, password length, and matching passwords |
| Existing navigation and styling | The original stack, tabs, screens, themes, and reusable components remain in use |

### Access troubleshooting

- **Missing environment variables:** confirm `.env.local` contains both
  `EXPO_PUBLIC_` values, then restart Expo with `--clear`.
- **Registration does not open the app:** check the inbox for a Supabase email
  confirmation, then sign in.
- **No lessons appear:** confirm the app is connected to the supplied LearnLoop
  project, or apply `supabase/seed_lessons.sql` to the selected project.
- **Network error:** verify internet access and confirm the Supabase project is
  active.

## Instructor note

- Repository: https://github.com/espyder/GA-app2-LearnLoop
- Video explanation: https://youtu.be/Utiv9mXKBQ0
- Supabase project URL and publishable key: delivered separately with the
  submission so local configuration is not committed to source control

## Notes

This project is designed as a learning app prototype and demonstrates:
- screen-based navigation
- shared app state with context
- styled reusable components
- a simple progress tracking flow

## Backend documentation

The living database, authentication, RLS, and Supabase integration documentation
is maintained in [docs/SUPABASE.md](docs/SUPABASE.md).
