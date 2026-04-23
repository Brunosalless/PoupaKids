export const colors = {
  primary: '#2E75B6',
  secondary: '#7ED957',
  accent: '#FFD166',
  danger: '#FF6B6B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#64748B',
  border: '#E2E8F0',
} as const;

export type ColorKey = keyof typeof colors;
