// Lesson is the domain model shared by learning screens and components. Keeping
// it beside the feature makes the feature's expected data shape easy to find.
export type Lesson = {
  id: string;
  title: string;
  topic: string;
  duration: string;
  // A string union prevents unsupported difficulty values at compile time.
  difficulty: 'Beginner' | 'Intermediate';
  summary: string;
  takeaways: string[];
  checkpoint: string;
};
