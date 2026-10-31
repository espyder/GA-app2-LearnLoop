// This is the root React component. It composes app-wide providers around the
// navigator; feature UI belongs deeper in the tree rather than in this file.
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './navigation/AppNavigator';
import { LearnLoopProvider } from './state/LearnLoopProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <LearnLoopProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </LearnLoopProvider>
    </SafeAreaProvider>
  );
}
