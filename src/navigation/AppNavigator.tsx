// AppNavigator owns the navigation hierarchy and the full-screen loading/error
// states shown before Supabase data is ready.
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import HomeScreen from '../features/learning/screens/HomeScreen';
import LessonScreen from '../features/learning/screens/LessonScreen';
import ProgressScreen from '../features/learning/screens/ProgressScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import { useLearnLoop } from '../state/LearnLoopProvider';
import type { HomeStackParamList, RootTabParamList } from './navigation.types';

const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

// The nested stack allows Home to open a Lesson while both remain inside the
// Learn bottom tab.
function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, settings, loading, error, retry } = useLearnLoop();

  if (loading) {
    return (
      <View style={[styles.statusScreen, { backgroundColor: colors.surface }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.statusTitle, { color: colors.text }]}>Loading LearnLoop</Text>
        <Text style={[styles.statusMessage, { color: colors.muted }]}>Connecting to your learning data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.statusScreen, { backgroundColor: colors.surface }]}>
        <Ionicons name="cloud-offline-outline" color={colors.primary} size={38} />
        <Text style={[styles.statusTitle, { color: colors.text }]}>Could not load LearnLoop</Text>
        <Text style={[styles.statusMessage, { color: colors.muted }]}>{error}</Text>
        <Pressable onPress={retry} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  statusScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
  },
  statusMessage: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 420,
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
