# LearnLoop

LearnLoop is a React Native learning app built with Expo. The app lets users browse a set of lessons, track their progress, bookmark important content, and switch between light and dark themes.

## Features

- Learn screen with lesson cards
- Lesson detail screen with progress and takeaways
- Bookmark support for saved lessons
- Progress tracking across the app
- Theme switching between light and midnight modes
- Shared app state using React Context
- Supabase-backed lessons, progress, bookmarks, and preferences
- Anonymous authentication with per-user Row Level Security

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
- `src/navigation/` - React Navigation setup and navigation types
- `src/features/learning/` - lesson screens, learning components, and lesson types
- `src/features/settings/` - settings feature UI
- `src/state/` - shared React state and the LearnLoop provider
- `src/services/` - authentication and Supabase data operations
- `src/lib/` - configured third-party clients
- `src/theme/` - color palettes and theme types
- `docs/` - architecture and Supabase documentation
- `index.ts` - Expo application entry point

## Run locally

1. Install dependencies:
   npm install

2. Start the app:
   npx expo start

3. Open the app in Expo Go or run it in a simulator/emulator.

## Instructor note

A short video explanation is attached with this project submission.

The code is also available in the project repository for review and cloning.

Repository link:
https://github.com/espyder/GA-app2-LearnLoop

## Notes

This project is designed as a learning app prototype and demonstrates:
- screen-based navigation
- shared app state with context
- styled reusable components
- a simple progress tracking flow

## Backend documentation

The living database, authentication, RLS, and Supabase integration documentation
is maintained in [docs/SUPABASE.md](docs/SUPABASE.md).
