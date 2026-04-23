import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = '#7ED957',
  trackColor = '#E2E8F0',
  height = 12,
}: ProgressBarProps): JSX.Element {
  const clamped = Math.max(0, Math.min(progress, 1));
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(clamped, { duration: 600 });
  }, [clamped, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
    backgroundColor: color,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 1, now: clamped }}
      style={{
        height,
        backgroundColor: trackColor,
        borderRadius: height,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Animated.View style={[{ height: '100%', borderRadius: height }, animatedStyle]} />
    </View>
  );
}
