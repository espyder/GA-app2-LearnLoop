// This service keeps Supabase authentication calls outside the screens. The
// UI collects validated input, while these functions perform the network work.
import { supabase } from '../lib/supabase';

export type SignUpResult = {
  emailConfirmationRequired: boolean;
};

// Logs in an existing account with the normalized email and password supplied
// by AuthScreen. Supabase throws no exception itself, so we throw its error.
export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw error;
}

// Creates an email/password account. When email confirmation is enabled,
// Supabase returns a user but no session until the confirmation link is opened.
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw error;

  return { emailConfirmationRequired: !data.session };
}

// Ends the current Supabase session. AuthProvider observes this change and the
// app automatically returns to AuthScreen.
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}
