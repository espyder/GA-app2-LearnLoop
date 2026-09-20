import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { lessons } from '../data/lessons';
import { midnightPalette, palette, ThemeMode } from '../constants/theme';

// This is the app's saved user settings.
type Settings = {
  theme: ThemeMode;
  notifications: boolean;
  reducedMotion: boolean;
};

// This describes the data that all screens can access from the app context.
type LearnLoopContextValue = {
  progress: Record<string, number>;
  bookmarks: Record<string, boolean>;
  settings: Settings;
  colors: typeof palette;
  completedCount: number;
  toggleBookmark: (lessonId: string) => void;
  setProgress: (lessonId: string, value: number) => void;
  setSetting: <Key extends keyof Settings>(key: Key, value: Settings[Key]) => void;
};

// Demo data used when the app starts.
// These numbers are placeholder values, not real saved progress from a database or API.
const initialProgress: Record<string, number> = {
  'react-fundamentals': 68,
  'typescript-essentials': 24,
  'accessibility-basics': 0,
};

// Demo bookmark state.
// This is a sample saved-item value so the UI shows a bookmarked lesson at startup.
const initialBookmarks: Record<string, boolean> = {
  'accessibility-basics': true,
};

const Context = createContext<LearnLoopContextValue | undefined>(undefined);

export function LearnLoopProvider({ children }: PropsWithChildren) {
  // State is where the app stores changing data while the user uses it.
  const [progress, setProgressState] = useState(initialProgress);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [settings, setSettings] = useState<Settings>({ theme: 'light', notifications: true, reducedMotion: true });

  // This object is shared with every screen that calls useLearnLoop().
  const value = useMemo<LearnLoopContextValue>(() => ({
    progress,
    bookmarks,
    settings,
    colors: settings.theme === 'midnight' ? midnightPalette : palette,
    completedCount: lessons.filter((lesson) => progress[lesson.id] >= 100).length,
    toggleBookmark: (lessonId) => setBookmarks((current) => ({ ...current, [lessonId]: !current[lessonId] })),
    setProgress: (lessonId, value) => setProgressState((current) => ({ ...current, [lessonId]: Math.min(100, Math.max(0, value)) })),
    setSetting: (key, value) => setSettings((current) => ({ ...current, [key]: value })),
  }), [bookmarks, progress, settings]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLearnLoop() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useLearnLoop must be used inside LearnLoopProvider');
  }
  return context;
}