import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  AccessibilityProps,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends AccessibilityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  testID?: string;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: 'bg-primary', text: 'text-white' },
  secondary: { bg: 'bg-secondary', text: 'text-white' },
  ghost: { bg: 'bg-transparent', text: 'text-primary', border: 'border border-primary' },
  danger: { bg: 'bg-danger', text: 'text-white' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  testID,
  accessibilityLabel,
}: ButtonProps): JSX.Element {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled }}
      className={`min-h-[48px] rounded-2xl px-6 py-3 flex-row items-center justify-center ${styles.bg} ${styles.border || ''} ${isDisabled ? 'opacity-60' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text className={`text-base font-bold ${styles.text}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
