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
      className={`items-center rounded-2xl p-4 ${unlocked ? 'bg-accent/30' : 'bg-slate-200'}`}
    >
      <Text style={{ fontSize: 40, opacity: unlocked ? 1 : 0.4 }}>{icone}</Text>
      <Text
        className={`mt-2 text-center text-sm font-bold ${
          unlocked ? 'text-text' : 'text-text-muted'
        }`}
        numberOfLines={1}
      >
        {nome}
      </Text>
      {descricao ? (
        <Text className="mt-1 text-center text-xs text-text-muted" numberOfLines={2}>
          {descricao}
        </Text>
      ) : null}
    </View>
  );
}
