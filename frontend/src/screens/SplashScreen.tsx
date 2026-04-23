import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { LoadingSpinner } from '@components/index';

export function SplashScreen(): JSX.Element {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounce]);

  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Animated.Text style={{ fontSize: 100, transform: [{ translateY }] }}>🐷</Animated.Text>
      <Text className="text-4xl font-extrabold text-primary mt-2">PoupaKids</Text>
      <Text className="text-sm text-text-muted mt-1">Educação Financeira Gamificada</Text>
      <View className="mt-8">
        <LoadingSpinner label="Preparando o cofrinho..." />
      </View>
    </View>
  );
}
