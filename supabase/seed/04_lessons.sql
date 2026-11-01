-- Run this file in Supabase Dashboard > SQL Editor.
-- Run after schema/ and security/ scripts.
-- It expands the original lessons and adds three new lessons. Existing IDs are
-- updated in place, so user progress and bookmarks keep their foreign keys.
--
-- This is seed data: starter content inserted into an otherwise empty table.
-- Each parenthesized group below is one lesson row. Its values must follow the
-- same order as the column names in this INSERT statement.

insert into public.lessons (
  -- Stable text key used by navigation and by user_lesson_state.lesson_id.
  id,
  -- Human-readable lesson name shown on lesson cards and the lesson screen.
  title,
  -- Short category used to group or label the lesson.
  topic,
  -- Display text estimating how long the lesson takes.
  duration,
  -- Controlled text value: Beginner or Intermediate (checked by the table).
  difficulty,
  -- Longer description displayed before the lesson details.
  summary,
  -- Complete teaching material rendered by LessonMarkdown in the app.
  content_markdown,
  -- PostgreSQL text array containing the individual learning checkpoints.
  takeaways,
  -- Final task the learner should be able to complete.
  checkpoint,
  -- Integer that controls the order in which lessons appear.
  sort_order
)
values
  -- Lesson 1: introductory React concepts.
  (
    'react-fundamentals',
    'React Fundamentals',
    'Frontend',
    '24 min',
    'Beginner',
    'Build a clear mental model for components, props, state, events, and composition so your interfaces stay easy to change.',
    $lesson$
## Components are reusable interface pieces

A React component is a function that returns part of the interface. Give each component one clear responsibility. A lesson card can display a lesson, while a progress bar can focus only on progress.

```tsx
type LessonCardProps = {
  title: string;
  progress: number;
};

function LessonCard({ title, progress }: LessonCardProps) {
  return <Text>{title}: {progress}%</Text>;
}
```

### Props move data into a component

Props are read-only inputs supplied by a parent. They let the same component render different information without copying its JSX.

- The parent owns the data.
- The child describes the props it needs.
- A prop change causes React to render the child again.

### State remembers changing values

Use state for information that changes while the user interacts with the screen. Calling the setter asks React to render again with the new value.

```tsx
const [bookmarked, setBookmarked] = useState(false);

<Pressable onPress={() => setBookmarked(!bookmarked)}>
  <Text>{bookmarked ? 'Saved' : 'Save lesson'}</Text>
</Pressable>
```

## Put the pieces together

Keep data in the closest shared parent, pass it down with props, and send user actions upward through callback props. Small focused components are easier to understand, test, and reuse.
$lesson$,
    -- This eighth value maps to public.lessons.takeaways.
    -- ARRAY creates a PostgreSQL array, and ::text[] declares that every item
    -- in the array is text. Each item is one learning takeaway for this lesson.
    array[
      'Identify the responsibility of a React component',
      'Pass typed data from parent to child with props',
      'Store changing interface values with useState',
      'Respond to button presses with event handlers',
      'Compose small components into a complete screen'
    ]::text[],
    -- The next value is public.lessons.checkpoint, not part of the array.
    'Build a reusable lesson card from props',
    1
  ),
  -- Lesson 2: TypeScript concepts used throughout this codebase.
  (
    'typescript-essentials',
    'TypeScript Essentials',
    'Syntax',
    '22 min',
    'Beginner',
    'Use practical TypeScript types to make everyday JavaScript safer and make editor errors easier to understand.',
    $lesson$
## TypeScript checks values before the app runs

TypeScript adds static types to JavaScript. The editor can warn you when a value has the wrong shape, a property is missing, or a function receives an unsupported argument.

### Let inference handle obvious values

TypeScript can infer simple types, so you do not need to annotate every variable.

```ts
const lessonCount = 6;
const courseName = 'LearnLoop';
```

Both variables already have useful inferred types.

### Describe object shapes

A type alias documents the fields an object must contain. Optional fields use a question mark.

```ts
type LessonSummary = {
  id: string;
  title: string;
  progress?: number;
};
```

### Use unions for controlled choices

A union prevents unexpected strings from entering the app.

```ts
type Difficulty = 'Beginner' | 'Intermediate';
```

- Prefer inference for obvious local values.
- Add types at component props, service responses, and function boundaries.
- Narrow unknown data before reading its properties.

## Read errors as guidance

When TypeScript marks a line red, compare the value you supplied with the shape the function expects. The error usually identifies the missing field or incompatible type.
$lesson$,
    array[
      'Recognize when TypeScript can infer a value type',
      'Describe object shapes with type aliases',
      'Use unions for a controlled list of values',
      'Type component props and callback parameters',
      'Narrow unknown values before reading their properties'
    ]::text[],
    'Create a typed form value and validation result',
    2
  ),
  -- Lesson 3: usability and accessibility practices.
  (
    'accessibility-basics',
    'Accessibility Basics',
    'UX',
    '20 min',
    'Intermediate',
    'Design interfaces that work for more people by using clear labels, readable contrast, helpful feedback, and comfortable touch targets.',
    $lesson$
## Accessibility is part of the interface

An accessible screen communicates purpose, state, and results without relying on color or visual position alone. Start with clear text and predictable controls before adding extra accessibility properties.

### Give controls meaningful names

Icon-only buttons need labels that describe their action. A screen reader should announce “Bookmark lesson,” not only “button.”

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Bookmark lesson"
  onPress={toggleBookmark}
>
  <Ionicons name="bookmark-outline" size={24} />
</Pressable>
```

### Communicate changing state

Loading, validation errors, and successful saves need visible text. Do not use only red, green, or an icon to communicate the result.

- Keep text contrast strong in both themes.
- Make touch targets comfortable and separated.
- Use headings and consistent reading order.
- Allow text to wrap instead of fixing component heights.

## Test beyond appearance

Navigate the screen with a keyboard on web and a screen reader on a device. Confirm every interactive control has a useful name and that focus follows the same logical order as the content.
$lesson$,
    array[
      'Use meaningful text for interactive controls',
      'Keep text and controls visually readable',
      'Provide feedback for loading, success, and errors',
      'Make touch targets large enough to use comfortably',
      'Check a screen with keyboard and screen-reader navigation'
    ]::text[],
    'Audit the authentication form for accessible feedback',
    3
  ),
  -- Lesson 4: typed movement between the app's screens.
  (
    'react-native-navigation',
    'Navigation in React Native',
    'Mobile',
    '26 min',
    'Intermediate',
    'Learn how stack and tab navigators work together and how typed route parameters move data safely between screens.',
    $lesson$
## Navigators describe how screens relate

A stack places screens on top of one another. Opening a lesson pushes LessonScreen above the lesson list, and going back removes it. Tabs keep the app's main areas available at the same level.

### Type every route and parameter

The parameter list is the contract between the screen that navigates and the screen that receives the route.

```ts
export type HomeStackParamList = {
  Home: undefined;
  Lesson: { lessonId: string };
};
```

HomeScreen sends the stable Supabase lesson ID:

```ts
navigation.navigate('Lesson', { lessonId: lesson.id });
```

LessonScreen reads the same typed value:

```ts
const lesson = lessons.find(
  (item) => item.id === route.params.lessonId,
);
```

### Keep navigation responsibilities separate

- The tab navigator controls Learn, Progress, and Settings.
- The home stack controls HomeScreen and LessonScreen.
- The authentication gate decides whether the private navigator can mount.

## Trace the data, not only the screen

Navigation passes the lesson ID rather than copying a full lesson object. The destination uses that ID to find the newest lesson data from shared state.
$lesson$,
    array[
      'Explain the difference between stack and tab navigation',
      'Define route names in a TypeScript parameter list',
      'Navigate to a screen with a lesson ID parameter',
      'Read typed route parameters on the destination screen',
      'Keep authentication outside the private app navigator'
    ]::text[],
    'Trace the route from HomeScreen to LessonScreen',
    4
  ),
  -- Lesson 5: how React Native, Supabase, authentication, and RLS connect.
  (
    'supabase-data-flow',
    'Supabase Data Flow',
    'Backend',
    '28 min',
    'Intermediate',
    'Follow data from a React effect through the Supabase client, Row Level Security, React state, and finally the rendered interface.',
    $lesson$
## One request passes through several layers

LearnLoop keeps database code out of its screens. The provider starts the load, the service queries Supabase, and React state gives the result to the interface.

```ts
const { data, error } = await supabase
  .from('lessons')
  .select('id, title, summary, content_markdown')
  .order('sort_order');
```

### useEffect starts the initial load

After authentication supplies a user ID, an effect requests the lesson catalog, that user's progress, and that user's preferences. The effect does not render data itself; it updates state when the request finishes.

### Select reads and upsert writes

`select` retrieves rows. `upsert` inserts a missing row or updates the row identified by its conflict key. LearnLoop uses the combined user and lesson IDs for progress.

```ts
await supabase.from('user_lesson_state').upsert(
  { user_id: userId, lesson_id: lessonId, progress },
  { onConflict: 'user_id,lesson_id' },
);
```

### RLS protects rows on the server

- Shared lessons are readable by app users.
- Progress and preferences must match `auth.uid()`.
- The publishable key identifies the project but does not bypass policies.

## Follow the full loop

A button updates React state immediately, the service persists the change, Supabase checks RLS, and a later app launch reads the stored row back into the interface.
$lesson$,
    array[
      'Create one shared Supabase client',
      'Load database rows inside a useEffect workflow',
      'Read rows with select and filters',
      'Create or update user state with upsert',
      'Protect user-owned rows with auth.uid and RLS'
    ]::text[],
    'Verify that two accounts cannot read each other progress',
    5
  ),
  -- Lesson 6: controlled inputs and validation in the authentication form.
  (
    'forms-and-validation',
    'Forms and Validation',
    'UX',
    '24 min',
    'Beginner',
    'Build a controlled React Native form that validates required fields and gives the user clear feedback before sending a request.',
    $lesson$
## Controlled inputs keep form data in React state

A controlled TextInput receives its value from state and calls a setter whenever the user types. React therefore owns the current form value.

```tsx
const [email, setEmail] = useState('');

<TextInput
  value={email}
  onChangeText={setEmail}
  autoCapitalize="none"
  keyboardType="email-address"
/>
```

### Normalize before validating

Trim surrounding spaces and convert email addresses to lowercase before sending them. Validate the normalized value so the user sees a useful message before a network request begins.

```ts
const normalizedEmail = email.trim().toLowerCase();

if (!normalizedEmail.includes('@')) {
  setEmailError('Enter a valid email address.');
  return;
}
```

### Keep client and server errors separate

Client validation handles required fields, email shape, password length, and matching confirmation. Supabase can still reject a valid-looking request, so display its returned message in a form-level error area.

- Show the error near the related field.
- Disable repeated submissions while loading.
- Keep entered values when a request fails.
- Clear an error when the user corrects that field.

## Test the unhappy paths

Try empty input, an invalid email, short and mismatched passwords, an existing account, and a disconnected network. A strong form guides recovery instead of only handling success.
$lesson$,
    array[
      'Store each TextInput value in component state',
      'Normalize email input before submission',
      'Validate required fields and email format',
      'Display field-specific and server error messages',
      'Disable repeated submissions while a request is loading'
    ]::text[],
    'Test registration with empty, invalid, and valid values',
    6
  )
-- `on conflict` turns this INSERT into an UPSERT. If an `id` already exists,
-- PostgreSQL updates that lesson instead of creating a duplicate row.
on conflict (id) do update
set
  -- `excluded` means the new row that the INSERT tried to add.
  title = excluded.title,
  topic = excluded.topic,
  duration = excluded.duration,
  difficulty = excluded.difficulty,
  summary = excluded.summary,
  content_markdown = excluded.content_markdown,
  takeaways = excluded.takeaways,
  checkpoint = excluded.checkpoint,
  sort_order = excluded.sort_order;
