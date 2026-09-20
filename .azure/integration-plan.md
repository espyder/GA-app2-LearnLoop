# Integration Plan

## Backend
- Project folder: none (offline-only app)
- Run command: n/a
- Port: n/a
- Build command: n/a
- Health endpoint: n/a

## Frontend
- Project folder: `./`
- Build command: `npm exec -- expo export --platform web`
- Dev command: `npm run web`
- API seam: not applicable in the current scaffold; app is intentionally offline-first and local-state based.
- Mock files to delete: none; no mock client or preview state layer exists yet.

## API routes
- Home dashboard: mobile route `/`
- Lesson detail: mobile route `/lesson/:id`
- Settings: mobile route `/settings`
- No HTTP API layer exists in this build.

## Database
- Type: none; local/offline-first storage only
- Migration tool: n/a
- Migration directory: n/a
- Connection env vars: n/a
- Seed data: none; do not create seed data

## Shared types
- Shared package: n/a
- Import alias: n/a

## Services
- Essential: local lesson state, progress tracking, bookmarks, settings persistence
- Enhancement: theme preferences, accessibility options, notifications toggles

## Verification checklist
- Confirm the app boots in Expo web mode
- Validate the three core screens are present and usable
- Ensure local state persists without any cloud dependency
- Verify no backend or database wiring is required for this offline-first iteration

## Integration results

- Database migrations: Not applicable; this project has no SQL/PostgreSQL database or migration tool.
- Backend smoke test: Not applicable; this project has no backend or HTTP API.
- Frontend live-data wiring: Not applicable; the app is intentionally offline-first and has no mock API layer.
- End-to-end frontend/backend verification: Not applicable; no backend service exists to run alongside the frontend.
- Frontend verification: Passed. `npm exec -- expo export --platform web` bundled `index.ts` with Expo SDK 57 and wrote the `dist/` web output.
- TypeScript verification: Passed with `tsc --noEmit`.
- Web support: Added the required `react-dom` and `react-native-web` dependencies for Expo web.
- Seed data: None created.
