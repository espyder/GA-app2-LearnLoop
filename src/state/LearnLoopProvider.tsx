// LearnLoopProvider coordinates React state with the Supabase service. It gives
// every screen one shared source for lessons, progress, bookmarks, and settings.
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { Lesson } from '../features/learning/lesson.types';
import {
  getOrCreateUserId,
  loadLearnLoopSnapshot,
  saveLessonState,
  saveSettings,
} from '../services/learnLoop.service';
import { midnightPalette, palette } from '../theme/theme';
import type { LearnLoopContextValue, Settings } from './learnLoop.types';

// This file is the app's shared data layer.
//
// A screen should not need to know how authentication, database queries, or
// persistence work. It asks this context for data and calls actions such as
// setProgress(). Keeping those responsibilities here makes the screens simpler.

// Defaults are still needed for the brief period before Supabase responds and
// for creating a preference row the first time a user opens the app.
const defaultSettings: Settings = {
  theme: 'light',
  notifications: true,
  reducedMotion: true,
};

// JavaScript allows anything to be thrown, so a caught value has the safe type
// "unknown". This helper checks its shape before reading .message.
function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Could not load LearnLoop data.';
}

// undefined is the initial value on purpose. It lets useLearnLoop() detect when
// a component is accidentally rendered outside LearnLoopProvider.
const Context = createContext<LearnLoopContextValue | undefined>(undefined);

export function LearnLoopProvider({ children }: PropsWithChildren) {
  // useState stores values that affect rendering. Calling a setter schedules a
  // new render so every subscribed screen receives the latest value.
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgressState] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // retry() increments this number. Because it appears in the loading effect's
  // dependency array, changing it runs the Supabase loading process again.
  const [reloadVersion, setReloadVersion] = useState(0);

  // Refs hold mutable values without causing a render. Async callbacks can read
  // .current and receive the newest value instead of a value captured by an old
  // render (a problem commonly called a "stale closure").
  const userIdRef = useRef<string | null>(null);
  const progressRef = useRef(progress);
  const bookmarksRef = useRef(bookmarks);
  const settingsRef = useRef(settings);

  // Keep each ref synchronized with its matching piece of React state.
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    bookmarksRef.current = bookmarks;
  }, [bookmarks]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // This effect is the startup/loading workflow. Effects are used for work that
  // talks to systems outside React, such as a database or authentication API.
  useEffect(() => {
    // An async request might finish after this provider has unmounted. The flag
    // prevents us from updating state on a component that no longer exists.
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // The service owns authentication and database details. The provider
        // receives application-friendly values and puts them into React state.
        const userId = await getOrCreateUserId();
        userIdRef.current = userId;
        const snapshot = await loadLearnLoopSnapshot(userId, defaultSettings);

        if (!active) return;

        // Update refs immediately as well as state. State updates are scheduled,
        // while refs change synchronously and are safe for the next async action.
        progressRef.current = snapshot.progress;
        bookmarksRef.current = snapshot.bookmarks;
        settingsRef.current = snapshot.settings;
        setLessons(snapshot.lessons);
        setProgressState(snapshot.progress);
        setBookmarks(snapshot.bookmarks);
        setSettings(snapshot.settings);
      } catch (caughtError) {
        // One error state lets AppNavigator display its retry screen consistently.
        if (active) {
          setError(getErrorMessage(caughtError));
        }
      } finally {
        // finally runs after either success or failure.
        if (active) setLoading(false);
      }
    }

    // Effects cannot themselves be async. Calling the inner function with void
    // intentionally starts the Promise while showing that it is not awaited here.
    void loadData();

    // React calls this cleanup before the effect reruns or the provider unmounts.
    return () => {
      active = false;
    };
  }, [reloadVersion]);

  // This helper handles the database part shared by progress and bookmarks.
  // useCallback keeps the function identity stable between renders.
  const persistLessonState = useCallback(
    async (lessonId: string, changes: { progress?: number; bookmarked?: boolean }) => {
      const userId = userIdRef.current;
      if (!userId) {
        setError('No authenticated Supabase user is available.');
        return false;
      }

      try {
        await saveLessonState(
          userId,
          lessonId,
          changes.progress ?? progressRef.current[lessonId] ?? 0,
          changes.bookmarked ?? bookmarksRef.current[lessonId] ?? false,
        );
      } catch (writeError) {
        setError(getErrorMessage(writeError));
        return false;
      }

      setError(null);
      return true;
    },
    [],
  );

  const toggleBookmark = useCallback(
    (lessonId: string) => {
      // Save the old value so it can be restored if the network request fails.
      const previous = Boolean(bookmarksRef.current[lessonId]);
      const next = !previous;
      const nextBookmarks = { ...bookmarksRef.current, [lessonId]: next };

      bookmarksRef.current = nextBookmarks;
      setBookmarks(nextBookmarks);

      // This is an optimistic update: the UI changes immediately instead of
      // waiting for the network, which makes the app feel responsive.
      void persistLessonState(lessonId, { bookmarked: next }).then((saved) => {
        // Only roll back if this value is still the one we attempted to save.
        // Without the check, a slow failed request could overwrite a newer click.
        if (!saved && bookmarksRef.current[lessonId] === next) {
          const rolledBack = { ...bookmarksRef.current, [lessonId]: previous };
          bookmarksRef.current = rolledBack;
          setBookmarks(rolledBack);
        }
      });
    },
    [persistLessonState],
  );

  const setProgress = useCallback(
    (lessonId: string, value: number) => {
      const previous = progressRef.current[lessonId] ?? 0;
      // Clamp the supplied number to the valid database range of 0 through 100.
      const next = Math.min(100, Math.max(0, value));
      const nextProgress = { ...progressRef.current, [lessonId]: next };

      progressRef.current = nextProgress;
      setProgressState(nextProgress);

      // Progress uses the same optimistic-update and guarded-rollback pattern as
      // bookmarks.
      void persistLessonState(lessonId, { progress: next }).then((saved) => {
        if (!saved && progressRef.current[lessonId] === next) {
          const rolledBack = { ...progressRef.current, [lessonId]: previous };
          progressRef.current = rolledBack;
          setProgressState(rolledBack);
        }
      });
    },
    [persistLessonState],
  );

  const setSetting = useCallback(
    // The generic connects the key and value types. For example, "theme" only
    // accepts ThemeMode, while "notifications" only accepts a boolean.
    <Key extends keyof Settings>(key: Key, settingValue: Settings[Key]) => {
      const userId = userIdRef.current;
      if (!userId) {
        setError('No authenticated Supabase user is available.');
        return;
      }

      const previous = settingsRef.current;
      const next = { ...previous, [key]: settingValue };
      settingsRef.current = next;
      setSettings(next);

      void saveSettings(userId, next)
        .then(() => setError(null))
        .catch((writeError: unknown) => {
          setError(getErrorMessage(writeError));

          // Object identity tells us whether another setting change happened
          // while this request was running. Do not undo a newer change.
          if (settingsRef.current === next) {
            settingsRef.current = previous;
            setSettings(previous);
          }
        });
    },
    [],
  );

  // useMemo avoids creating a brand-new context object on unrelated renders.
  // Context consumers rerender when this value's identity changes, so stable
  // identities help avoid unnecessary screen work.
  const value = useMemo<LearnLoopContextValue>(
    () => ({
      lessons,
      progress,
      bookmarks,
      settings,
      colors: settings.theme === 'midnight' ? midnightPalette : palette,
      // completedCount is derived data: it can be calculated from existing state,
      // so storing another independent state value would risk inconsistencies.
      completedCount: lessons.filter((lesson) => progress[lesson.id] >= 100).length,
      loading,
      error,
      retry: () => setReloadVersion((current) => current + 1),
      toggleBookmark,
      setProgress,
      setSetting,
    }),
    [bookmarks, error, lessons, loading, progress, setProgress, setSetting, settings, toggleBookmark],
  );

  // Every descendant can now access value without passing props through each
  // intermediate component (often called "prop drilling").
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

// A custom hook gives screens one clean API and produces a helpful error when
// the provider is missing, instead of returning undefined throughout the app.
export function useLearnLoop() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useLearnLoop must be used inside LearnLoopProvider');
  }
  return context;
}
