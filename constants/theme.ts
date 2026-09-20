export const palette = {
  primary: '#2F6FED',
  primarySoft: '#E7EEFF',
  accent: '#7C3AED',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#D9E2EC',
  success: '#16805B',
  warning: '#B45309',
};

export const midnightPalette = {
  ...palette,
  surface: '#101827',
  card: '#182235',
  text: '#F8FAFC',
  muted: '#A8B4C7',
  border: '#2C3B54',
  primarySoft: '#203663',
};

export type ThemeMode = 'light' | 'midnight';
