// This file defines the lesson content for the app.
// Each object is one learning item the user can open from the Home screen.
export type Lesson = {
  id: string;
  title: string;
  topic: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate';
  summary: string;
  takeaways: string[];
  checkpoint: string;
};

export const lessons: Lesson[] = [
  {
    id: 'react-fundamentals',
    title: 'React Fundamentals',
    topic: 'Frontend',
    duration: '12 min',
    difficulty: 'Beginner',
    summary: 'Build a clear mental model for components, props, and state so your interfaces stay easy to change.',
    takeaways: ['Components describe reusable UI', 'Props flow data into a component', 'State stores values that change over time'],
    checkpoint: 'Component composition',
  },
  {
    id: 'typescript-essentials',
    title: 'TypeScript Essentials',
    topic: 'Syntax',
    duration: '9 min',
    difficulty: 'Beginner',
    summary: 'Use practical types to make everyday JavaScript safer without slowing down your creative flow.',
    takeaways: ['Infer types when the value is obvious', 'Use unions for controlled variation', 'Model domain data with type aliases'],
    checkpoint: 'Union types',
  },
  {
    id: 'accessibility-basics',
    title: 'Accessibility Basics',
    topic: 'UX',
    duration: '15 min',
    difficulty: 'Intermediate',
    summary: 'Design interfaces that work for more people by starting with semantic structure and visible focus.',
    takeaways: ['Prefer semantic controls', 'Keep contrast and focus visible', 'Give interactive elements useful labels'],
    checkpoint: 'Keyboard navigation',
  },
];