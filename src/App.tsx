// This is the root React component. It composes app-wide providers around the
// navigator; feature UI belongs deeper in the tree rather than in this file.
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthScreen from './features/auth/screens/AuthScreen';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider, useAuth } from './state/AuthProvider';
import { LearnLoopProvider } from './state/LearnLoopProvider';
import { palette } from './theme/theme';

// Chooses the public authentication form or the private learning app from the
// restored Supabase session. LearnLoopProvider only mounts for a real account.
function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={palette.primary} size="large" />
        <Text style={styles.loadingText}>Restoring your session...</Text>
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <LearnLoopProvider userId={session.user.id}>
      <AppNavigator />
    </LearnLoopProvider>
  );
}

// Builds the top-level component tree. SafeAreaProvider handles device notches,
// LearnLoopProvider supplies shared data, and AppNavigator chooses the screen.
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: palette.muted, fontSize: 14, marginTop: 14 },
});
