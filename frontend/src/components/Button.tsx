import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  AccessibilityProps,
} from 'react-native';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'pink'
  | 'cyan'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends AccessibilityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  testID?: string;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string; shadow: string }> = {
  primary: { bg: 'bg-primary', text: 'text-white', shadow: 'shadow-primary' },
  secondary: { bg: 'bg-secondary', text: 'text-white', shadow: 'shadow-secondary' },
  accent: { bg: 'bg-accent', text: 'text-text', shadow: 'shadow-accent' },
  pink: { bg: 'bg-pink', text: 'text-white', shadow: 'shadow-pink' },
  cyan: { bg: 'bg-cyan', text: 'text-white', shadow: 'shadow-cyan' },
  ghost: { bg: 'bg-transparent', text: 'text-primary', border: 'border-2 border-primary', shadow: '' },
  danger: { bg: 'bg-danger', text: 'text-white', shadow: 'shadow-danger' },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-4 py-2',
  md: 'min-h-[48px] px-6 py-3',
  lg: 'min-h-[56px] px-7 py-4',
  xl: 'min-h-[64px] px-8 py-5',
};

const textSizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
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
      style={({ pressed }) => ({
        transform: [{ scale: pressed && !isDisabled ? 0.96 : 1 }],
        shadowColor: '#000',
        shadowOpacity: variant === 'ghost' ? 0 : 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: variant === 'ghost' ? 0 : 4,
      })}
      className={`${sizeStyles[size]} rounded-3xl flex-row items-center justify-center ${styles.bg} ${styles.border || ''} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-60' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' || variant === 'accent' ? '#7C3AED' : '#fff'} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text className={`font-bold tracking-wide ${styles.text} ${textSizeStyles[size]}`}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
