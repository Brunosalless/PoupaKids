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
      <View className="w-32 h-32 rounded-full bg-primary-light/30 items-center justify-center mb-4">
        <Text style={{ fontSize: 72 }}>{icon}</Text>
      </View>
      <Text className="text-xl font-extrabold text-text mt-2 text-center">{title}</Text>
      {description ? (
        <Text className="text-base text-text-muted mt-2 text-center leading-6">
          {description}
        </Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <View className="mt-6 w-full max-w-xs">
          <Button title={ctaLabel} onPress={onCtaPress} variant="primary" size="lg" />
        </View>
      ) : null}
    </View>
  );
}
