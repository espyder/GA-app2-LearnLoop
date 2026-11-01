// LessonMarkdown converts the lesson's stored Markdown string into native
// React Native Text and View elements. It deliberately supports a small,
// predictable subset that is sufficient for LearnLoop lesson content.
import { StyleSheet, Text, View } from 'react-native';

// A discriminated union lists every block the parser can produce. The `type`
// field lets TypeScript narrow each block to the fields needed for rendering.
type MarkdownBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'code'; language: string; code: string };

type LessonColors = {
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primarySoft: string;
};

type Props = {
  markdown: string;
  colors: LessonColors;
};

// Parses Markdown line by line. Keeping this function pure means the same input
// always returns the same blocks, which makes its behavior easier to test and
// keeps string-processing details outside the JSX renderer.
export function parseLessonMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  // Move through the source once. Each branch advances index past the lines it
  // consumes, so headings, paragraphs, lists, and code remain in source order.
  while (index < lines.length) {
    const trimmedLine = lines[index].trim();

    // Empty lines separate Markdown blocks and do not render visible content.
    if (!trimmedLine) {
      index += 1;
      continue;
    }

    // Three backticks begin a fenced code block. Characters after the opening
    // fence, such as "tsx", are stored as an optional language label.
    if (trimmedLine.startsWith('```')) {
      const language = trimmedLine.slice(3).trim();
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }

      // Skip the closing fence when it exists. An unfinished block still
      // renders its collected code instead of crashing the lesson screen.
      if (index < lines.length) index += 1;
      blocks.push({ type: 'code', language, code: codeLines.join('\n') });
      continue;
    }

    // LearnLoop supports level-two and level-three headings. The match length
    // determines which visual heading size the renderer uses.
    const headingMatch = trimmedLine.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 2 | 3,
        text: headingMatch[2],
      });
      index += 1;
      continue;
    }

    // Consecutive lines beginning with "- " become one bullet-list block.
    if (trimmedLine.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().slice(2).trim());
        index += 1;
      }
      blocks.push({ type: 'bullets', items });
      continue;
    }

    // Any remaining consecutive text becomes a paragraph. Joining wrapped
    // source lines with spaces prevents hard line breaks in the rendered copy.
    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const candidate = lines[index].trim();
      const beginsNewBlock =
        !candidate ||
        candidate.startsWith('```') ||
        candidate.startsWith('- ') ||
        /^(#{2,3})\s+/.test(candidate);

      if (beginsNewBlock) break;
      paragraphLines.push(candidate);
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
  }

  return blocks;
}

// Renders the parsed blocks with the active LearnLoop color palette. The
// function returns nothing for empty content so older lesson rows remain safe.
export default function LessonMarkdown({ markdown, colors }: Props) {
  if (!markdown.trim()) return null;

  const blocks = parseLessonMarkdown(markdown);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionLabel, { color: colors.primary }]}>LESSON CONTENT</Text>
      {blocks.map((block, index) => {
        // The source order is stable, so the index is a suitable key for these
        // read-only blocks even when two paragraphs contain identical text.
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          return (
            <Text
              key={key}
              style={[
                block.level === 2 ? styles.headingTwo : styles.headingThree,
                { color: colors.text },
              ]}
            >
              {block.text}
            </Text>
          );
        }

        if (block.type === 'bullets') {
          return (
            <View key={key} style={styles.bulletList}>
              {block.items.map((item, itemIndex) => (
                <View key={`${key}-${itemIndex}`} style={styles.bulletRow}>
                  <Text style={[styles.bulletMarker, { color: colors.primary }]}>•</Text>
                  <Text style={[styles.body, styles.bulletText, { color: colors.text }]}>{item}</Text>
                </View>
              ))}
            </View>
          );
        }

        if (block.type === 'code') {
          return (
            <View
              key={key}
              style={[styles.codeCard, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
            >
              {block.language ? (
                <Text style={[styles.codeLanguage, { color: colors.primary }]}>{block.language}</Text>
              ) : null}
              <Text selectable style={[styles.code, { color: colors.text }]}>
                {block.code}
              </Text>
            </View>
          );
        }

        return (
          <Text key={key} style={[styles.body, { color: colors.text }]}>
            {block.text}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 31,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headingTwo: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 29,
    marginTop: 22,
  },
  headingThree: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    marginTop: 19,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 10,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  bulletMarker: {
    fontSize: 18,
    lineHeight: 24,
    marginRight: 9,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
  },
  codeCard: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  codeLanguage: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 9,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
});
