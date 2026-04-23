import React from 'react';
import { Input } from './Input';
import { maskCPF, maskPhone, maskDate } from '@utils/masks';
import type { TextInputProps } from 'react-native';

type MaskKind = 'cpf' | 'phone' | 'date';

interface MaskedInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label?: string;
  error?: string;
  mask: MaskKind;
  value: string;
  onChangeText: (masked: string) => void;
  testID?: string;
}

const MASK_FNS: Record<MaskKind, (v: string) => string> = {
  cpf: maskCPF,
  phone: maskPhone,
  date: maskDate,
};

const PLACEHOLDER: Record<MaskKind, string> = {
  cpf: '000.000.000-00',
  phone: '(00) 00000-0000',
  date: 'DD/MM/AAAA',
};

const MAX_LENGTH: Record<MaskKind, number> = {
  cpf: 14,
  phone: 15,
  date: 10,
};

export function MaskedInput({
  mask,
  value,
  onChangeText,
  placeholder,
  ...rest
}: MaskedInputProps): JSX.Element {
  const apply = MASK_FNS[mask];

  const handleChange = (raw: string) => {
    onChangeText(apply(raw));
  };

  return (
    <Input
      value={value}
      onChangeText={handleChange}
      placeholder={placeholder ?? PLACEHOLDER[mask]}
      keyboardType="number-pad"
      maxLength={MAX_LENGTH[mask]}
      {...rest}
    />
  );
}
