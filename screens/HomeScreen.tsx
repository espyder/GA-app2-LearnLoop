import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeStackParamList } from '../App';
import { lessons } from '../data/lessons';
import { useLearnLoop } from '../context/LearnLoopContext';
import LessonCard from '../components/LessonCard';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  // Read shared app state like progress and theme colors.
  const { colors, progress, bookmarks, completedCount } = useLearnLoop();

  // Use screen width to keep the layout readable on different devices.
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 760);

  // Pick the next lesson that is started but not finished.
  const activeLesson =
    lessons.find((lesson) => progress[lesson.id] > 0 && progress[lesson.id] < 100) ?? lessons[0];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            {/* Hardcoded date text: this is placeholder UI, not a live calendar value. */}
            <Text style={[styles.eyebrow, { color: colors.primary }]}>MONDAY, SEPTEMBER 20</Text>
            <Text style={[styles.heading, { color: colors.text }]}>Keep the loop going.</Text>
          </View>

          <View style={[styles.streak, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="flame" color="#F59E0B" size={18} />
            {/* Placeholder streak value: not calculated from user activity yet. */}
            <Text style={[styles.streakText, { color: colors.text }]}>4 day streak</Text>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>UP NEXT</Text>
            <Text style={styles.heroTitle}>{activeLesson.title}</Text>
            <Text style={styles.heroMeta}>
              {activeLesson.duration} · {progress[activeLesson.id] ?? 0}% complete
            </Text>
          </View>

          <View style={styles.playButton}>
            <Ionicons name="play" color={colors.primary} size={20} />
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>Completed</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{completedCount}</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>Lessons</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{lessons.length}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your learning path</Text>
          <Text style={[styles.count, { color: colors.muted }]}>
            {completedCount}/{lessons.length} complete
          </Text>
        </View>

        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            progress={progress[lesson.id] ?? 0}
            bookmarked={Boolean(bookmarks[lesson.id])}
            onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
    gap: 12,
  },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  heading: { fontSize: 28, fontWeight: '800', marginTop: 7, letterSpacing: -0.4 },
  streak: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  streakText: { fontSize: 12, fontWeight: '700' },
  hero: {
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 150,
    overflow: 'hidden',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  heroCopy: { flex: 1, justifyContent: 'center' },
  heroLabel: { color: '#C9D8FF', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: '#FFFFFF', fontSize: 23, fontWeight: '800', marginTop: 14, lineHeight: 30 },
  heroMeta: { color: '#DBE6FF', fontSize: 13, marginTop: 7 },
  playButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    height: 46,
    justifyContent: 'center',
    marginLeft: 12,
    marginTop: 18,
    width: 46,
  },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  summaryValue: { fontSize: 26, fontWeight: '800', marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '800' },
  count: { fontSize: 12, fontWeight: '700' },
});