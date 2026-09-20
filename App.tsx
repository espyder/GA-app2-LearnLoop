import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LearnLoopProvider, useLearnLoop } from './context/LearnLoopContext';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';

// This type describes the screens inside the stack that lives under the Learn tab.
export type HomeStackParamList = {
  Home: undefined;
  Lesson: { lessonId: string };
};

// These are the main bottom tabs across the whole app.
export type RootTabParamList = {
  Learn: undefined;
  Progress: undefined;
  Settings: undefined;
};

// A stack lets us move between Home and Lesson screens inside the Learn tab.
const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
    </Stack.Navigator>
  );
}

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
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
          tabBarIcon: ({ color, size, focused }) => {
            // Pick a different icon depending on which tab is selected.
            const iconName =
              route.name === 'Learn'
                ? focused ? 'book' : 'book-outline'
                : route.name === 'Progress'
                  ? focused ? 'trending-up' : 'trending-up-outline'
                  : focused ? 'settings' : 'settings-outline';

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
