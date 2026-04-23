export const colors = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  secondary: '#22C55E',
  secondaryLight: '#86EFAC',
  accent: '#FBBF24',
  accentLight: '#FDE68A',
  pink: '#EC4899',
  pinkLight: '#F9A8D4',
  cyan: '#06B6D4',
  cyanLight: '#67E8F9',
  orange: '#FB923C',
  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  background: '#FAF5FF',
  surface: '#FFFFFF',
  text: '#1E1B4B',
  textMuted: '#6B7280',
  border: '#E9D5FF',
} as const;

export type ColorKey = keyof typeof colors;
