import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { lessons } from '../data/lessons';
import { useLearnLoop } from '../context/LearnLoopContext';

export default function ProgressScreen() {
  // Read progress information from the shared context so this screen reflects the user's study state.
  const { colors, progress, bookmarks, completedCount } = useLearnLoop();

  // Find lessons that started but are not finished yet.
  const activeLessons = lessons.filter((lesson) => (progress[lesson.id] ?? 0) > 0 && (progress[lesson.id] ?? 0) < 100);

  // Count how many lessons are saved as bookmarks.
  const totalBookmarked = Object.values(bookmarks).filter(Boolean).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>STUDY SNAPSHOT</Text>
        <Text style={[styles.title, { color: colors.text }]}>Progress</Text>

        <View style={styles.summaryRow}>
          <StatCard label="Completed" value={`${completedCount}`} accent={colors.primary} colors={colors} />
          <StatCard label="In progress" value={`${activeLessons.length}`} accent="#F59E0B" colors={colors} />
          <StatCard label="Saved" value={`${totalBookmarked}`} accent="#7C3AED" colors={colors} />
        </View>

        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>Current momentum</Text>
          {lessons.map((lesson) => {
            const value = progress[lesson.id] ?? 0;
            return (
              <View key={lesson.id} style={styles.lessonRow}>
                <View style={styles.lessonText}>
                  <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>
                  <Text style={[styles.lessonMeta, { color: colors.muted }]}>{value}% complete</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${value}%`, backgroundColor: value >= 100 ? colors.primary : colors.accent },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Small card used to display a single progress stat.
function StatCard({
  label,
  value,
  accent,
  colors,
}: {
  label: string;
  value: string;
  accent: string;
  colors: typeof import('../constants/theme').palette;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons
        name={label === 'Completed' ? 'checkmark-circle' : label === 'In progress' ? 'time' : 'bookmark'}
        size={18}
        color={accent}
      />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { maxWidth: 760, alignSelf: 'center', width: '100%', padding: 20, paddingBottom: 40 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { fontSize: 32, fontWeight: '800', marginTop: 9 },
  summaryRow: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14 },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 10 },
  statLabel: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  panel: { borderRadius: 14, borderWidth: 1, padding: 16 },
  panelTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  lessonRow: { marginBottom: 16 },
  lessonText: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  lessonTitle: { fontSize: 14, fontWeight: '700' },
  lessonMeta: { fontSize: 12, fontWeight: '600' },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
});
