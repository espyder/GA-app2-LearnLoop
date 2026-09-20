import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Lesson } from '../data/lessons';
import ProgressBar from './ProgressBar';

type Props = { lesson: Lesson; progress: number; bookmarked: boolean; onPress: () => void };

export default function LessonCard({ lesson, progress, bookmarked, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topLine}>
        <Text style={styles.topic}>{lesson.topic.toUpperCase()}</Text>
        <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={19} color={bookmarked ? '#7C3AED' : '#94A3B8'} />
      </View>

      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.summary} numberOfLines={2}>{lesson.summary}</Text>

      <View style={styles.meta}>
        <Text style={styles.metaText}>{lesson.duration}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.metaText}>{lesson.difficulty}</Text>
      </View>

      <View style={styles.progressRow}>
        <ProgressBar value={progress} />
        <Text style={styles.progress}>{progress}%</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderColor: '#D9E2EC', borderWidth: 1, borderRadius: 12, padding: 17, marginBottom: 12, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  pressed: { opacity: 0.78 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topic: { color: '#2F6FED', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#0F172A', fontSize: 18, fontWeight: '800', marginTop: 9 },
  summary: { color: '#64748B', fontSize: 13, lineHeight: 19, marginTop: 7 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  metaText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  dot: { color: '#CBD5E1', marginHorizontal: 7 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  progress: { color: '#64748B', fontSize: 12, fontWeight: '700', width: 32 },
});