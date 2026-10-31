// LessonScreen reads a lesson ID from the navigation route, finds that lesson
// in shared state, and exposes bookmark and completion actions to the learner.
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeStackParamList } from '../../../navigation/navigation.types';
import { useLearnLoop } from '../../../state/LearnLoopProvider';
import ProgressBar from '../components/ProgressBar';

// Selecting 'Lesson' here makes route.params.lessonId type-safe.
type Props = NativeStackScreenProps<HomeStackParamList, 'Lesson'>;

// Displays the lesson selected on HomeScreen and connects the screen's buttons
// to navigation and shared LearnLoop actions.
export default function LessonScreen({ navigation, route }: Props) {
  // This screen gets the current app state from the shared context.
  // It needs the lesson progress, bookmark status, and the theme colors so it can render correctly.
  const { colors, lessons, progress, bookmarks, toggleBookmark, setProgress } = useLearnLoop();

  // route.params.lessonId was sent from the Home screen when the user tapped a lesson card.
  // This finds the exact lesson object from the lesson list so the right content appears on screen.
  // find invokes the predicate for each item until its ID matches the route parameter.
  const lesson = lessons.find((item) => item.id === route.params.lessonId);

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.missingLesson}>
          <Ionicons name="alert-circle-outline" size={34} color={colors.primary} />
          <Text style={[styles.missingTitle, { color: colors.text }]}>Lesson not found</Text>
          {/* This event callback returns to the previous screen when pressed. */}
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: colors.primary }]}>Back to lessons</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Capture the ID after the missing-lesson guard. Event functions can safely
  // keep this string even if they run later than the render that created them.
  const lessonId = lesson.id;

  // Look up this lesson's progress value. If it does not exist yet, default to 0.
  const lessonProgress = progress[lessonId] ?? 0;

  // A lesson is considered complete when the progress reaches 100%.
  const complete = lessonProgress >= 100;

  // The takeaway list plus the final practice task form the complete sequence.
  // Translating the saved percentage into a count shows completed checkpoints.
  const lessonSteps = [...lesson.takeaways, lesson.checkpoint];
  const totalSteps = lessonSteps.length;
  const completedSteps = complete
    ? totalSteps
    : Math.floor((lessonProgress / 100) * totalSteps);
  const nextCheckpoint = lessonSteps[completedSteps] ?? lesson.checkpoint;

  // Advances exactly one checkpoint and converts the result to a percentage
  // that the existing Supabase progress column can continue storing.
  function advanceLesson() {
    if (complete) {
      setProgress(lessonId, 0);
      return;
    }

    const nextCompletedSteps = Math.min(totalSteps, completedSteps + 1);
    setProgress(lessonId, Math.round((nextCompletedSteps / totalSteps) * 100));
  }

  // Lets a learner revisit a checkpoint. Selecting an unfinished row completes
  // through that row; selecting a completed row resets progress to before it.
  function selectCheckpoint(index: number) {
    const nextCompletedSteps = index < completedSteps ? index : index + 1;
    setProgress(lessonId, Math.round((nextCompletedSteps / totalSteps) * 100));
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top bar: back button on the left and bookmark button on the right. */}
        <View style={styles.toolbar}>
          {/* This callback asks the stack navigator to show its previous screen. */}
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          {/* This callback captures the current lesson ID and toggles its saved state. */}
          <Pressable onPress={() => toggleBookmark(lessonId)} hitSlop={12}>
            <Ionicons
              name={bookmarks[lessonId] ? 'bookmark' : 'bookmark-outline'}
              size={23}
              color={bookmarks[lessonId] ? colors.accent : colors.muted}
            />
          </Pressable>
        </View>

        {/* Header area for the selected lesson: topic, title, and short description. */}
        <Text style={[styles.topic, { color: colors.primary }]}>{lesson.topic.toUpperCase()} · {lesson.difficulty.toUpperCase()}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>
        <Text style={[styles.summary, { color: colors.muted }]}>{lesson.summary}</Text>

        {/* Progress box: shows how far the learner has gone in this lesson. */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>Your progress</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>{lessonProgress}%</Text>
          </View>
          <ProgressBar value={lessonProgress} />
          <Text style={[styles.checkpoint, { color: colors.muted }]}>
            {complete ? 'All checkpoints completed' : `Next: ${nextCheckpoint}`}
          </Text>
        </View>

        {/* Each takeaway and the final practice are interactive checkpoints. */}
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Lesson checkpoints</Text>
          <Text style={[styles.stepCount, { color: colors.muted }]}>
            {completedSteps}/{totalSteps}
          </Text>
        </View>
        {lessonSteps.map((takeaway, index) => {
          const stepComplete = index < completedSteps;
          const currentStep = index === completedSteps && !complete;
          const finalPractice = index === lessonSteps.length - 1;

          return (
            <Pressable
              key={takeaway}
              onPress={() => selectCheckpoint(index)}
              style={[
                styles.takeaway,
                {
                  backgroundColor: stepComplete ? colors.primarySoft : colors.card,
                  borderColor: currentStep || stepComplete ? colors.primary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.check,
                  { backgroundColor: stepComplete ? colors.primary : colors.primarySoft },
                ]}
              >
                <Ionicons
                  name={stepComplete ? 'checkmark' : 'ellipse-outline'}
                  color={stepComplete ? '#FFFFFF' : colors.primary}
                  size={14}
                />
              </View>
              <View style={styles.takeawayCopy}>
                <Text style={[styles.stepLabel, { color: colors.muted }]}>
                  {finalPractice ? 'FINAL PRACTICE' : `STEP ${index + 1}`}
                </Text>
                <Text style={[styles.takeawayText, { color: colors.text }]}>{takeaway}</Text>
              </View>
            </Pressable>
          );
        })}

        {/* The action now completes one checkpoint at a time for realistic progress. */}
        <Pressable
          onPress={advanceLesson}
          style={[styles.action, { backgroundColor: complete ? colors.card : colors.primary, borderColor: colors.primary }]}
        >
          <Ionicons name={complete ? 'refresh' : 'arrow-forward-circle'} size={19} color={complete ? colors.primary : '#FFFFFF'} />
          <Text style={[styles.actionText, { color: complete ? colors.primary : '#FFFFFF' }]}>
            {complete ? 'Restart lesson' : `Complete step ${completedSteps + 1} of ${totalSteps}`}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 34,
  },
  topic: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 11,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  progressCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 27,
    padding: 17,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  checkpoint: {
    fontSize: 12,
    marginTop: 11,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  sectionHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 31,
  },
  stepCount: { fontSize: 12, fontWeight: '700' },
  takeaway: {
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 15,
    padding: 13,
  },
  check: {
    alignItems: 'center',
    borderRadius: 20,
    height: 28,
    justifyContent: 'center',
    marginRight: 11,
    width: 28,
  },
  takeawayCopy: { flex: 1 },
  stepLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  takeawayText: {
    fontSize: 15,
    lineHeight: 21,
  },
  action: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 28,
    minHeight: 52,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '800',
  },
  missingLesson: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 16,
  },
});
