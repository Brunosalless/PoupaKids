import React, { forwardRef } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  testID?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, style, ...rest }, ref) => (
    <View className="mb-4">
      {label ? (
        <Text className="mb-1 text-sm font-semibold text-text">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#94A3B8"
        className={`min-h-[48px] rounded-xl border px-4 py-3 text-base bg-surface ${
          error ? 'border-danger' : 'border-border'
        }`}
        style={style}
        accessibilityLabel={label}
        {...rest}
      />
      {error ? (
        <Text className="mt-1 text-xs text-danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  ),
);

Input.displayName = 'Input';
