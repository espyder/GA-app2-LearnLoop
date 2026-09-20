import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LearnLoopProvider, useLearnLoop } from './context/LearnLoopContext';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';

// This type defines the screens inside the stack under the Learn tab.
// The Lesson screen needs a lessonId so it knows which lesson to show.
export type HomeStackParamList = {
  Home: undefined;
  Lesson: { lessonId: string };
};

// These are the main app tabs shown across the bottom navigation.
export type RootTabParamList = {
  Learn: undefined;
  Progress: undefined;
  Settings: undefined;
};

// The Learn stack holds the Home and Lesson screens, so the user can drill into a lesson.
const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

// This nested stack keeps the lesson detail flow inside the Learn tab.
function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
    </Stack.Navigator>
  );
}

// This is the main navigation shell for the app.
// It reads the current theme and settings from the shared context so the UI matches the user's selections.
function AppNavigation() {
  const { colors, settings } = useLearnLoop();

  return (
    <NavigationContainer theme={settings.theme === 'midnight' ? DarkTheme : DefaultTheme}>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 68,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
          },
          tabBarIcon: ({ color, size, focused }) => {
            const iconName =
              route.name === 'Learn'
                ? focused
                  ? 'book'
                  : 'book-outline'
                : route.name === 'Progress'
                  ? focused
                    ? 'trending-up'
                    : 'trending-up-outline'
                  : focused
                    ? 'settings'
                    : 'settings-outline';

            return <Ionicons name={iconName} color={color} size={size} />;
          },
        })}
      >
        <Tabs.Screen name="Learn" component={LearnStack} options={{ title: 'Learn' }} />
        <Tabs.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
        <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

// App bootstraps the providers and navigation.
// The context provider wraps the app so every screen can access shared progress, bookmarks, and settings.
export default function App() {
  return (
    <SafeAreaProvider>
      <LearnLoopProvider>
        {/* All screen components live under this provider so they can share app data. */}
        <AppNavigation />
        <StatusBar style="auto" />
      </LearnLoopProvider>
    </SafeAreaProvider>
  );
}
