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
        <Text className="mb-2 text-base font-bold text-text">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#A78BFA"
        className={`min-h-[52px] rounded-2xl border-2 px-4 py-3 text-base bg-surface text-text ${
          error ? 'border-danger' : 'border-primary-light'
        }`}
        style={style}
        accessibilityLabel={label}
        {...rest}
      />
      {error ? (
        <Text className="mt-1 text-xs font-semibold text-danger" accessibilityLiveRegion="polite">
          ⚠️ {error}
        </Text>
      ) : null}
    </View>
  ),
);

Input.displayName = 'Input';
