// This service is the boundary between React state and Supabase. It knows table
// names and database columns, while screens and the provider use app-level data.
import type { Lesson } from '../features/learning/lesson.types';
import { supabase } from '../lib/supabase';
import type { Settings } from '../state/learnLoop.types';
import type { ThemeMode } from '../theme/theme';

type LessonRow = Lesson & { sort_order: number };
type LessonStateRow = { lesson_id: string; progress: number; bookmarked: boolean };
type PreferencesRow = {
  theme: ThemeMode;
  notifications: boolean;
  reduced_motion: boolean;
};

// A snapshot contains everything the provider needs after application startup.
export type LearnLoopSnapshot = {
  lessons: Lesson[];
  progress: Record<string, number>;
  bookmarks: Record<string, boolean>;
  settings: Settings;
};

// Loads the database rows and converts them into shapes that the React UI uses.
// userId selects private rows; defaultSettings initializes a first-time user.
export async function loadLearnLoopSnapshot(
  userId: string,
  defaultSettings: Settings,
): Promise<LearnLoopSnapshot> {
  // The queries are independent, so Promise.all runs them concurrently.
  const [lessonsResult, stateResult, preferencesResult] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, title, topic, duration, difficulty, summary, takeaways, checkpoint, sort_order')
      .order('sort_order'),
    supabase
      .from('user_lesson_state')
      .select('lesson_id, progress, bookmarked')
      .eq('user_id', userId),
    supabase
      .from('user_preferences')
      .select('theme, notifications, reduced_motion')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (lessonsResult.error) throw lessonsResult.error;
  if (stateResult.error) throw stateResult.error;
  if (preferencesResult.error) throw preferencesResult.error;

  const lessonRows = (lessonsResult.data ?? []) as LessonRow[];
  const stateRows = (stateResult.data ?? []) as LessonStateRow[];
  let preferenceRow = preferencesResult.data as PreferencesRow | null;

  // Create the user's one-to-one preferences row on their first launch.
  if (!preferenceRow) {
    const { data: createdPreferences, error: createPreferencesError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        theme: defaultSettings.theme,
        notifications: defaultSettings.notifications,
        reduced_motion: defaultSettings.reducedMotion,
      })
      .select('theme, notifications, reduced_motion')
      .single();

    if (createPreferencesError) throw createPreferencesError;
    preferenceRow = createdPreferences as PreferencesRow;
  }

  const progress: Record<string, number> = {};
  const bookmarks: Record<string, boolean> = {};
  // Convert an array of database rows into dictionaries keyed by lesson ID.
  for (const row of stateRows) {
    progress[row.lesson_id] = row.progress;
    bookmarks[row.lesson_id] = row.bookmarked;
  }

  return {
    // map creates a new array. Destructuring removes the database-only
    // sort_order column before each lesson reaches the UI.
    lessons: lessonRows.map(({ sort_order: _sortOrder, ...lesson }) => lesson),
    progress,
    bookmarks,
    settings: {
      theme: preferenceRow.theme,
      notifications: preferenceRow.notifications,
      reducedMotion: preferenceRow.reduced_motion,
    },
  };
}

// Persists the complete progress-and-bookmark state for one lesson. Keeping
// both values together matches the shape of the user_lesson_state table.
export async function saveLessonState(
  userId: string,
  lessonId: string,
  progress: number,
  bookmarked: boolean,
) {
  // Upsert inserts a missing row or updates the existing composite-key row.
  const { error } = await supabase.from('user_lesson_state').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      progress,
      bookmarked,
    },
    { onConflict: 'user_id,lesson_id' },
  );

  if (error) throw error;
}

// Persists all preferences for one user. This async function resolves after a
// successful write and throws when Supabase returns an error.
export async function saveSettings(userId: string, settings: Settings) {
  const { error } = await supabase.from('user_preferences').upsert(
    {
      user_id: userId,
      theme: settings.theme,
      notifications: settings.notifications,
      reduced_motion: settings.reducedMotion,
    },
    { onConflict: 'user_id' },
  );

  if (error) throw error;
}
