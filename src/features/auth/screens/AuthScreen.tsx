// AuthScreen is the assignment's validated form. It supports both account
// creation and login while keeping all validation feedback beside the inputs.
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signInWithEmail, signUpWithEmail } from '../../../services/auth.service';
import { palette } from '../../../theme/theme';

type AuthMode = 'signIn' | 'signUp';
type FieldErrors = Partial<Record<'email' | 'password' | 'confirmPassword', string>>;

// Validates all fields before Supabase is contacted. Returning an object lets
// the screen show a separate, useful message below each invalid field.
function validateForm(
  mode: AuthMode,
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must contain at least 6 characters.';
  }

  if (mode === 'signUp' && confirmPassword !== password) {
    errors.confirmPassword = 'The passwords do not match.';
  }

  return errors;
}

// Safely converts Supabase or JavaScript errors into text for the form banner.
function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Authentication failed. Please try again.';
}

// Renders the sign-in/sign-up form and sends validated values to the auth
// service. AuthProvider will replace this screen after a session is created.
export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const signingUp = mode === 'signUp';

  // Validates locally, then calls the correct Supabase action for the selected
  // mode. A successful login is handled automatically by AuthProvider.
  async function handleSubmit() {
    const errors = validateForm(mode, email, password, confirmPassword);
    setFieldErrors(errors);
    setFormError(null);
    setMessage(null);

    if (Object.keys(errors).length > 0) return;

    const normalizedEmail = email.trim().toLowerCase();
    setSubmitting(true);

    try {
      if (signingUp) {
        const result = await signUpWithEmail(normalizedEmail, password);

        if (result.emailConfirmationRequired) {
          setMessage('Account created. Check your email, confirm the account, then sign in.');
          setMode('signIn');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        await signInWithEmail(normalizedEmail, password);
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  // Switches form mode and clears feedback that belongs to the previous mode.
  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setFieldErrors({});
    setFormError(null);
    setMessage(null);
    setConfirmPassword('');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safe}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandMark}>
            <Text style={styles.brandLetter}>L</Text>
          </View>
          <Text style={styles.eyebrow}>LEARNLOOP</Text>
          <Text style={styles.title}>{signingUp ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={styles.subtitle}>
            {signingUp
              ? 'Save your progress and continue learning on your next visit.'
              : 'Sign in to continue your learning path.'}
          </Text>

          <View style={styles.modeTabs}>
            {(['signIn', 'signUp'] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => changeMode(item)}
                style={[styles.modeTab, mode === item && styles.modeTabActive]}
              >
                <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>
                  {item === 'signIn' ? 'Sign in' : 'Register'}
                </Text>
              </Pressable>
            ))}
          </View>

          {message ? <Text style={styles.successBanner}>{message}</Text> : null}
          {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={palette.muted}
            style={[styles.input, fieldErrors.email && styles.inputError]}
            value={email}
          />
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            editable={!submitting}
            onChangeText={setPassword}
            onSubmitEditing={signingUp ? undefined : handleSubmit}
            placeholder="At least 6 characters"
            placeholderTextColor={palette.muted}
            secureTextEntry
            style={[styles.input, fieldErrors.password && styles.inputError]}
            value={password}
          />
          {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

          {signingUp ? (
            <>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                autoCapitalize="none"
                editable={!submitting}
                onChangeText={setConfirmPassword}
                onSubmitEditing={handleSubmit}
                placeholder="Repeat your password"
                placeholderTextColor={palette.muted}
                secureTextEntry
                style={[styles.input, fieldErrors.confirmPassword && styles.inputError]}
                value={confirmPassword}
              />
              {fieldErrors.confirmPassword ? (
                <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
              ) : null}
            </>
          ) : null}

          <Pressable
            disabled={submitting}
            onPress={handleSubmit}
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>{signingUp ? 'Create account' : 'Sign in'}</Text>
            )}
          </Pressable>

          <Text style={styles.privacyText}>
            Your account keeps lesson progress, bookmarks, and preferences private.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.surface, flex: 1 },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: 480,
    padding: 24,
    width: '100%',
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.primary,
    borderRadius: 18,
    height: 58,
    justifyContent: 'center',
    marginBottom: 18,
    width: 58,
  },
  brandLetter: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  eyebrow: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
    textAlign: 'center',
  },
  modeTabs: {
    backgroundColor: palette.primarySoft,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 22,
    marginTop: 26,
    padding: 4,
  },
  modeTab: { alignItems: 'center', borderRadius: 9, flex: 1, paddingVertical: 11 },
  modeTabActive: { backgroundColor: '#FFFFFF' },
  modeText: { color: palette.muted, fontSize: 14, fontWeight: '700' },
  modeTextActive: { color: palette.primary },
  label: { color: palette.text, fontSize: 13, fontWeight: '700', marginBottom: 7, marginTop: 15 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: palette.border,
    borderRadius: 10,
    borderWidth: 1,
    color: palette.text,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: '#DC2626' },
  fieldError: { color: '#B91C1C', fontSize: 12, marginTop: 5 },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 9,
    color: '#991B1B',
    fontSize: 13,
    lineHeight: 19,
    padding: 12,
  },
  successBanner: {
    backgroundColor: '#DCFCE7',
    borderRadius: 9,
    color: '#166534',
    fontSize: 13,
    lineHeight: 19,
    padding: 12,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 52,
  },
  buttonDisabled: { opacity: 0.65 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  privacyText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
    textAlign: 'center',
  },
});
