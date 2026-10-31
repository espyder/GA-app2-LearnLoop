// These types define the public API offered by LearnLoopProvider. Screens can
// depend on this contract without knowing how Supabase persistence works.
import type { Lesson } from '../features/learning/lesson.types';
import type { ThemeMode } from '../theme/theme';

export type Settings = {
  theme: ThemeMode;
  notifications: boolean;
  reducedMotion: boolean;
};

export type LearnLoopContextValue = {
  lessons: Lesson[];
  // Records provide fast lookup by lesson ID instead of repeatedly searching.
  progress: Record<string, number>;
  bookmarks: Record<string, boolean>;
  settings: Settings;
  colors: typeof import('../theme/theme').palette;
  completedCount: number;
  loading: boolean;
  error: string | null;
  retry: () => void;
  toggleBookmark: (lessonId: string) => void;
  setProgress: (lessonId: string, value: number) => void;
  setSetting: <Key extends keyof Settings>(key: Key, value: Settings[Key]) => void;
};
