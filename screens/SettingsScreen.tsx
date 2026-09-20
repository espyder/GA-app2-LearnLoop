import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLearnLoop } from '../context/LearnLoopContext';

export default function SettingsScreen() {
  // Pull the shared settings and theme values from the app context.
  const { colors, settings, setSetting } = useLearnLoop();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>LEARNLOOP</Text>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Shape your study space around the way you learn best.</Text>

        <Text style={[styles.section, { color: colors.text }]}>Preferences</Text>
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* These toggles update the saved settings state. */}
          {/* The theme setting is the only one that currently changes app behavior. */}
          <SettingRow
            icon="notifications-outline"
            title="Study reminders"
            description="Get a gentle nudge for your next session."
            value={settings.notifications}
            onValueChange={(value) => setSetting('notifications', value)}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="eye-outline"
            title="Reduced motion"
            description="Keep transitions calm and focused."
            value={settings.reducedMotion}
            onValueChange={(value) => setSetting('reducedMotion', value)}
            colors={colors}
          />
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Appearance</Text>
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.preferenceTitle, { color: colors.text }]}>Theme</Text>
          <View style={styles.themeOptions}>
            {(['light', 'midnight'] as const).map((mode) => (
              <Text
                key={mode}
                onPress={() => setSetting('theme', mode)}
                style={[
                  styles.themeOption,
                  {
                    color: settings.theme === mode ? colors.primary : colors.muted,
                    backgroundColor: settings.theme === mode ? colors.primarySoft : 'transparent',
                    borderColor: settings.theme === mode ? colors.primary : colors.border,
                  },
                ]}
              >
                {mode === 'light' ? 'Light' : 'Midnight'}
              </Text>
            ))}
          </View>
        </View>

        <View style={[styles.offline, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="cloud-offline-outline" size={22} color={colors.primary} />
          <View style={styles.offlineCopy}>
            <Text style={[styles.preferenceTitle, { color: colors.text }]}>Always available offline</Text>
            <Text style={[styles.offlineText, { color: colors.muted }]}>Your lessons and progress live on this device.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable row for a settings toggle.
function SettingRow({
  icon,
  title,
  description,
  value,
  onValueChange,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: typeof import('../constants/theme').palette;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={styles.rowCopy}>
        <Text style={[styles.preferenceTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowDescription, { color: colors.muted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    maxWidth: 760,
    alignSelf: 'center',
    padding: 20,
    width: '100%',
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 9,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 9,
  },
  section: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 30,
  },
  panel: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 77,
  },
  rowCopy: {
    flex: 1,
    marginHorizontal: 13,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rowDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  divider: {
    height: 1,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 16,
    marginTop: 13,
  },
  themeOption: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offline: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginTop: 24,
    padding: 16,
  },
  offlineCopy: {
    flex: 1,
    marginLeft: 12,
  },
  offlineText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});