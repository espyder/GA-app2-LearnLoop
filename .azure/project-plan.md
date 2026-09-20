# Project Plan

**Status**: Integrated
**Created**: 2026-09-20
**Mode**: NEW
**Execution Mode**: auto

---

## 1. Project Overview

**Goal**: Build LearnLoop, an offline-first Expo TypeScript learning app that keeps lessons, progress, and bookmarks available without any cloud dependency. The project is designed so that every module is independently testable.

**App Type**: Static + API

**API Login**: No

**Mode**: NEW

**Deployment Plan**: No deployment plan found

---

## 2. Frontend — Mobile App

| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript |
| **Framework** | Expo + React Native + React Navigation |
| **Package Manager** | npm |
| **Test Runner** | Vitest |
| **Mocking Library** | vi.mock |
| **Test Command** | npm test |

---

## 3. Services Required

| Azure Service | Role in App | Environment Variable | Default Value (Local) | Classification |
|---------------|------------|---------------------|----------------------|----------------|
| N/A | Local lesson content, bookmarks, and completion progress are kept in app state and on-device storage | — | — | Not required |

---

## 4. Prerequisites

### Run

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| Node.js | Frontend | ❓ | — |
| npm | Frontend | ❓ | — |
| Expo CLI | Frontend | ❓ | — |
| Android Studio / Xcode tooling | Frontend | ❓ | — |

### Debug

| Tool | Service(s) | Installed | Version |
|------|------------|-----------|---------|
| VS Code JavaScript Debugger | Frontend | ❓ | — |
| React Native Tools | Frontend | ❓ | — |
| Expo Tools | Frontend | ❓ | — |

> Inform the user to double-check all ❓ tools are installed before proceeding.

---

## 5. Project Structure

```text
LearnLoop/
├─ App.tsx
├─ app.json
├─ index.ts
├─ package.json
├─ tsconfig.json
├─ assets/
│  └─ images/
├─ components/
│  ├─ ...
├─ constants/
│  └─ theme.ts
├─ hooks/
│  └─ use-color-scheme.ts
├─ screens/
│  ├─ HomeScreen.tsx
│  ├─ LessonScreen.tsx
│  ├─ SettingsScreen.tsx
├─ data/
│  └─ lessons.ts
├─ README.md
└─ AGENTS.md
```

---

## 6. Design System & UI

**Component Library**: Fluent UI v9
**Style Direction**: Modern and approachable, with a calm learning-first aesthetic, subtle shadow depth, rounded 4px corners, and clean card layouts that emphasize readability and fast scanning.
**Typography**: Inter, system-ui

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#2F6FED` | Primary actions, active lesson states, and main navigation emphasis |
| `accent` | `#7C3AED` | Feature highlights, streak badges, and emphasis on completed or recommended content |
| `surface` | `#F8FAFC` | Page and card backgrounds for lessons, home tiles, and settings panels |
| `text` | `#0F172A` | Body text for lesson content, headings, and settings labels |
| `muted` | `#64748B` | Secondary text, metadata, timestamps, and soft captions |
| `border` | `#D9E2EC` | Dividers, card outlines, and form/input boundaries |

### Pages

| Page | Route | Purpose | Layout |
|------|-------|---------|--------|
| Home | `/` | Overview of today's learning journey, streaks, and lesson picks | `header + card-list + actions` |
| Lesson Detail | `/lesson/:id` | Focused lesson reading with key takeaways and progress updates | `split(header|main)` |
| Settings | `/settings` | Personalization controls for notifications, theme, and accessibility | `form + card-list` |

### Sample Content

```text
Home — lesson:
| Title | Topic | Time | Status |
| React Fundamentals | Frontend | 12 min | Ready |
| TypeScript Essentials | Syntax | 9 min | In progress |
| Accessibility Basics | UX | 15 min | Saved |

Lesson Detail — lesson: React Fundamentals · Difficulty: Beginner · Progress: 68% · Next checkpoint: Hooks
Settings — theme: Light · notifications: Enabled · reduced motion: On
```

---

## 7. Route Definitions

| # | Method | Path | Description | Request Body | Response Body | Status Codes |
|---|--------|------|-------------|-------------|--------------|-------------|
| 1 | NAV | `/` | Home dashboard showing lesson cards, streaks, and quick-access modules | — | `{ lessons, streak, completedCount }` | 200 |
| 2 | NAV | `/lesson/:id` | Lesson detail screen with notes and progress tracking | — | `{ lesson, progress, bookmarkState }` | 200, 404 |
| 3 | NAV | `/settings` | App settings and personalization page | — | `{ theme, notifications, accessibilityOptions }` | 200 |

---

## 8. Next Steps

1. Run **azure-project-scaffold** to execute this plan
2. Run **azure-project-integrate** to wire the frontend to live data, smoke-test the backend, and create the migrations
3. Run **azure-debug-plan** → **azure-debug-generate** for Docker emulators and VS Code debugging
4. Run the **azure-deploy** agent when ready; it uses **azure-app-onboard** for architecture, cost estimation, IaC generation, provisioning, and health verification
