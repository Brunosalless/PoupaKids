import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export function EmptyState({
  title,
  description,
  icon = '🐷',
  ctaLabel,
  onCtaPress,
}: EmptyStateProps): JSX.Element {
  return (
    <View className="items-center justify-center py-12 px-6">
      <Text style={{ fontSize: 64 }}>{icon}</Text>
      <Text className="text-lg font-bold text-text mt-4 text-center">{title}</Text>
      {description ? (
        <Text className="text-sm text-text-muted mt-2 text-center">{description}</Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <View className="mt-4">
          <Button title={ctaLabel} onPress={onCtaPress} />
        </View>
      ) : null}
    </View>
  );
}
