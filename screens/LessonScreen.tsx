import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeStackParamList } from '../App';
import { lessons } from '../data/lessons';
import { useLearnLoop } from '../context/LearnLoopContext';
import ProgressBar from '../components/ProgressBar';

type Props = NativeStackScreenProps<HomeStackParamList, 'Lesson'>;

export default function LessonScreen({ navigation, route }: Props) {
  // Pull shared data from the app context: current progress, bookmark status, and theme colors.
  const { colors, progress, bookmarks, toggleBookmark, setProgress } = useLearnLoop();

  // Find the lesson that matches the id passed from the home screen.
  const lesson = lessons.find((item) => item.id === route.params.lessonId) ?? lessons[0];
  const lessonProgress = progress[lesson.id] ?? 0;
  const complete = lessonProgress >= 100;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.toolbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => toggleBookmark(lesson.id)} hitSlop={12}>
            <Ionicons name={bookmarks[lesson.id] ? 'bookmark' : 'bookmark-outline'} size={23} color={bookmarks[lesson.id] ? colors.accent : colors.muted} />
          </Pressable>
        </View>

        <Text style={[styles.topic, { color: colors.primary }]}>{lesson.topic.toUpperCase()} · {lesson.difficulty.toUpperCase()}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>
        <Text style={[styles.summary, { color: colors.muted }]}>{lesson.summary}</Text>

        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>Your progress</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>{lessonProgress}%</Text>
          </View>
          <ProgressBar value={lessonProgress} />
          <Text style={[styles.checkpoint, { color: colors.muted }]}>Next checkpoint: {lesson.checkpoint}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>What you will learn</Text>
        {lesson.takeaways.map((takeaway) => (
          <View key={takeaway} style={styles.takeaway}>
            <View style={[styles.check, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="checkmark" color={colors.primary} size={14} />
            </View>
            <Text style={[styles.takeawayText, { color: colors.text }]}>{takeaway}</Text>
          </View>
        ))}

        <Pressable
          onPress={() => setProgress(lesson.id, complete ? 0 : 100)}
          style={[styles.action, { backgroundColor: complete ? colors.card : colors.primary, borderColor: colors.primary }]}
        >
          <Ionicons name={complete ? 'refresh' : 'checkmark-circle'} size={19} color={complete ? colors.primary : '#FFFFFF'} />
          <Text style={[styles.actionText, { color: complete ? colors.primary : '#FFFFFF' }]}>
            {complete ? 'Restart lesson' : 'Mark as complete'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { maxWidth: 760, alignSelf: 'center', padding: 20, width: '100%', paddingBottom: 40 }, toolbar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 34 }, topic: { fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }, title: { fontSize: 32, fontWeight: '800', marginTop: 11 }, summary: { fontSize: 16, lineHeight: 24, marginTop: 12 }, progressCard: { borderRadius: 12, borderWidth: 1, marginTop: 27, padding: 17 }, progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }, progressLabel: { fontSize: 14, fontWeight: '800' }, progressValue: { fontSize: 14, fontWeight: '800' }, checkpoint: { fontSize: 12, marginTop: 11 }, sectionTitle: { fontSize: 19, fontWeight: '800', marginTop: 31, marginBottom: 16 }, takeaway: { alignItems: 'center', flexDirection: 'row', marginBottom: 15 }, check: { alignItems: 'center', borderRadius: 20, height: 28, justifyContent: 'center', marginRight: 11, width: 28 }, takeawayText: { flex: 1, fontSize: 15, lineHeight: 21 }, action: { alignItems: 'center', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 28, minHeight: 52 }, actionText: { fontSize: 15, fontWeight: '800' },
});