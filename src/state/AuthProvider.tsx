// AuthProvider owns only session state. Keeping authentication separate from
// learning data prevents Supabase queries from running before a user logs in.
import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Older LearnLoop versions created anonymous sessions. They must not unlock the
// private app because this assignment requires a registered login account.
function isAnonymousSession(session: Session | null) {
  return Boolean(session?.user.is_anonymous);
}

// Restores the persisted session at startup and listens for later sign-in,
// sign-up, token refresh, and sign-out events from the shared Supabase client.
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Reads the session stored by Expo SQLite when the application launches.
    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (isAnonymousSession(data.session)) {
        await supabase.auth.signOut();
        if (!active) return;
        setSession(null);
        setLoading(false);
        return;
      }

      setSession(error ? null : data.session);
      setLoading(false);
    }

    void restoreSession();

    // Supabase calls this listener whenever authentication state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(isAnonymousSession(nextSession) ? null : nextSession);
      setLoading(false);
    });

    // Unsubscribe when the provider unmounts so an old listener cannot update it.
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Memoizing the object avoids notifying consumers when neither field changed.
  const value = useMemo(() => ({ session, loading }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Gives components a typed session and catches incorrect use outside provider.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
