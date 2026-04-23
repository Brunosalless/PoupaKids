import React from 'react';
import { Text, View } from 'react-native';
import { LoadingSpinner } from '@components/index';

export function SplashScreen(): JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text style={{ fontSize: 80 }}>🐷</Text>
      <Text className="text-3xl font-bold text-primary mt-2">PoupaKids</Text>
      <Text className="text-sm text-text-muted mt-1">
        Educação Financeira Gamificada
      </Text>
      <View className="mt-6">
        <LoadingSpinner label="Preparando o cofrinho..." />
      </View>
    </View>
  );
}
