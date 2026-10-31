// React Navigation parameter lists describe every valid route. undefined means
// a route accepts no parameters; Lesson requires a lessonId string.
export type HomeStackParamList = {
  Home: undefined;
  Lesson: { lessonId: string };
};

export type RootTabParamList = {
  Learn: undefined;
  Progress: undefined;
  Settings: undefined;
};
