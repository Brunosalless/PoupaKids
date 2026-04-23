import React from 'react';
import { Text, View } from 'react-native';

interface BadgeProps {
  nome: string;
  descricao?: string;
  icone?: string;
  unlocked?: boolean;
}

export function Badge({ nome, descricao, icone = '🏆', unlocked = true }: BadgeProps): JSX.Element {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Conquista ${nome}${unlocked ? '' : ' bloqueada'}`}
      className={`items-center rounded-3xl p-4 ${unlocked ? 'bg-accent' : 'bg-slate-200'}`}
      style={{
        shadowColor: unlocked ? '#FBBF24' : '#000',
        shadowOpacity: unlocked ? 0.4 : 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: unlocked ? 5 : 1,
      }}
    >
      <View
        className={`w-20 h-20 rounded-full items-center justify-center mb-2 ${unlocked ? 'bg-white' : 'bg-slate-100'}`}
      >
        <Text style={{ fontSize: 44, opacity: unlocked ? 1 : 0.3 }}>{icone}</Text>
      </View>
      <Text
        className={`text-center text-sm font-extrabold ${unlocked ? 'text-text' : 'text-text-muted'}`}
        numberOfLines={1}
      >
        {nome}
      </Text>
      {descricao ? (
        <Text
          className={`mt-1 text-center text-xs ${unlocked ? 'text-text' : 'text-text-muted'}`}
          numberOfLines={2}
        >
          {descricao}
        </Text>
      ) : null}
    </View>
  );
}
