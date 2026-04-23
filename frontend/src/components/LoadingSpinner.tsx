import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'small' | 'large';
}

export function LoadingSpinner({
  label = 'Carregando...',
  size = 'large',
}: LoadingSpinnerProps): JSX.Element {
  return (
    <View className="items-center justify-center py-8" accessibilityLiveRegion="polite">
      <ActivityIndicator size={size} color={colors.primary} />
      {label ? <Text className="mt-2 text-sm text-text-muted">{label}</Text> : null}
    </View>
  );
}
