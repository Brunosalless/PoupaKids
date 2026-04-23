import React from 'react';
import { View, ViewProps } from 'react-native';

type CardTone = 'default' | 'primary' | 'secondary' | 'accent' | 'pink' | 'cyan';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  tone?: CardTone;
}

const toneStyles: Record<CardTone, string> = {
  default: 'bg-surface',
  primary: 'bg-primary-light/30 border-2 border-primary-light',
  secondary: 'bg-secondary-light/40 border-2 border-secondary-light',
  accent: 'bg-accent-light border-2 border-accent',
  pink: 'bg-pink-light/40 border-2 border-pink-light',
  cyan: 'bg-cyan-light/40 border-2 border-cyan-light',
};

export function Card({ children, tone = 'default', style, ...rest }: CardProps): JSX.Element {
  return (
    <View
      className={`rounded-3xl p-5 ${toneStyles[tone]}`}
      style={[
        {
          shadowColor: '#7C3AED',
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
