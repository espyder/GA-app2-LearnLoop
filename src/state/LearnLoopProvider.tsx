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

// Owns the app's shared state, loads its initial Supabase snapshot, and exposes
// actions that keep the interface and database synchronized.
export function LearnLoopProvider({
  children,
  userId,
}: PropsWithChildren<{ userId: string }>) {
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
  const userIdRef = useRef<string | null>(userId);
  const progressRef = useRef(progress);
  const bookmarksRef = useRef(bookmarks);
  const settingsRef = useRef(settings);

  // This effect callback runs after progress changes and copies the newest
  // render value into the ref used by asynchronous actions.
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // This effect callback performs the same synchronization for bookmarks.
  useEffect(() => {
    bookmarksRef.current = bookmarks;
  }, [bookmarks]);

  // This effect callback performs the same synchronization for settings.
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // This effect is the startup/loading workflow. Effects are used for work that
  // talks to systems outside React, such as a database or authentication API.
  useEffect(() => {
    // An async request might finish after this provider has unmounted. The flag
    // prevents us from updating state on a component that no longer exists.
    let active = true;

    // Runs the authentication and initial database-loading sequence. It is an
    // inner async function because a useEffect callback must not return a Promise.
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // AuthGate supplies the authenticated account ID. The service receives
        // it for RLS-protected queries and returns application-friendly values.
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

    // React calls this cleanup function before the effect reruns or the provider
    // unmounts. It tells the pending load to ignore a late response.
    return () => {
      active = false;
    };
  }, [reloadVersion, userId]);

  // This helper handles the database part shared by progress and bookmarks.
  // useCallback keeps the function identity stable between renders.
  const persistLessonState = useCallback(
    // Returns true after a successful save and false after handling a failure,
    // allowing the caller to decide whether an optimistic update must roll back.
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

  // Creates a stable action that immediately flips one bookmark and then asks
  // Supabase to persist it.
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
        // This Promise callback receives the helper's success boolean after the
        // database request settles.
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

  // Creates a stable action that updates one lesson percentage optimistically.
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
        // This Promise callback restores the previous percentage only when the
        // save failed and no newer update has replaced this one.
        if (!saved && progressRef.current[lessonId] === next) {
          const rolledBack = { ...progressRef.current, [lessonId]: previous };
          progressRef.current = rolledBack;
          setProgressState(rolledBack);
        }
      });
    },
    [persistLessonState],
  );

  // Creates a type-safe action for changing and saving any Settings property.
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
        // This success callback clears any older write error.
        .then(() => {
          setError(null);
        })
        // This failure callback displays the error and conditionally rolls back.
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

  // Starts the loading effect again. React passes the latest state value into
  // the functional setter callback, avoiding dependence on an older render.
  const retry = useCallback(() => {
    setReloadVersion((current) => current + 1);
  }, []);

  // useMemo avoids creating a brand-new context object on unrelated renders.
  // Context consumers rerender when this value's identity changes, so stable
  // identities help avoid unnecessary screen work.
  const value = useMemo<LearnLoopContextValue>(
    // This factory builds the public object consumed by screens. React reruns it
    // only when one of the dependencies below changes.
    () => ({
      lessons,
      progress,
      bookmarks,
      settings,
      colors: settings.theme === 'midnight' ? midnightPalette : palette,
      // completedCount is derived data: it can be calculated from existing state,
      // so storing another independent state value would risk inconsistencies.
      completedCount: lessons.filter(
        // filter calls this predicate once per lesson and keeps completed ones.
        (lesson) => progress[lesson.id] >= 100,
      ).length,
      loading,
      error,
      retry,
      toggleBookmark,
      setProgress,
      setSetting,
    }),
    [bookmarks, error, lessons, loading, progress, retry, setProgress, setSetting, settings, toggleBookmark],
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
