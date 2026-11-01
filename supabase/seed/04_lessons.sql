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
    -- This seventh value maps to public.lessons.takeaways.
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
  takeaways = excluded.takeaways,
  checkpoint = excluded.checkpoint,
  sort_order = excluded.sort_order;
