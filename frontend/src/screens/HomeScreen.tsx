import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, SaldoCard } from '@components/index';
import { useAuth } from '@store/AuthContext';
import { useFinance } from '@store/FinanceContext';
import { mensagemDoDia } from '@utils/mensagens';

interface AtalhoProps {
  emoji: string;
  label: string;
  tone: 'secondary' | 'accent' | 'pink' | 'cyan';
  onPress: () => void;
}

function Atalho({ emoji, label, tone, onPress }: AtalhoProps): JSX.Element {
  const bg = {
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    pink: 'bg-pink',
    cyan: 'bg-cyan',
  }[tone];
  const text = tone === 'accent' ? 'text-text' : 'text-white';

  return (
    <Pressable
      onPress={onPress}
      className={`${bg} rounded-3xl p-4 items-center justify-center flex-1 mx-1`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
        minHeight: 110,
      }}
    >
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
      <Text className={`${text} font-bold text-sm mt-1 text-center`}>{label}</Text>
    </Pressable>
  );
}

export function HomeScreen(): JSX.Element {
  const { user, logout } = useAuth();
  const { saldo, pontos, nivel, refreshSaldo, refreshGamificacao } = useFinance();
  const nav = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await Promise.all([refreshSaldo(), refreshGamificacao()]);
  }, [refreshSaldo, refreshGamificacao]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const primeiroNome = user?.nome?.split(' ')[0] || 'amiguinho';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="flex-row items-center mb-4">
          <View className="w-14 h-14 rounded-full bg-accent items-center justify-center mr-3">
            <Text style={{ fontSize: 30 }}>👋</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-text-muted">Olá,</Text>
            <Text className="text-2xl font-extrabold text-text">{primeiroNome}!</Text>
          </View>
        </View>

        <Card tone="primary" style={{ marginBottom: 16 }}>
          <Text className="text-sm text-text leading-6">💬 {mensagemDoDia()}</Text>
        </Card>

        <SaldoCard saldo={saldo} />

        <View className="flex-row mt-4 -mx-1">
          <View
            className="flex-1 mx-1 rounded-3xl p-4 bg-accent"
            style={{
              shadowColor: '#FBBF24',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Text className="text-xs font-bold text-text/70 uppercase">🏆 Nível</Text>
            <Text className="text-4xl font-extrabold text-text">{nivel}</Text>
          </View>
          <View
            className="flex-1 mx-1 rounded-3xl p-4 bg-pink"
            style={{
              shadowColor: '#EC4899',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Text className="text-xs font-bold text-white/80 uppercase">⭐ Pontos</Text>
            <Text className="text-4xl font-extrabold text-white">{pontos}</Text>
          </View>
        </View>

        <Text className="text-lg font-extrabold text-text mt-6 mb-3">O que vamos fazer? ✨</Text>

        <View className="flex-row mb-3 -mx-1">
          <Atalho emoji="🐷" label="Cofrinho" tone="secondary" onPress={() => nav.navigate('Cofrinho')} />
          <Atalho emoji="🎯" label="Metas" tone="pink" onPress={() => nav.navigate('Metas')} />
        </View>
        <View className="flex-row mb-3 -mx-1">
          <Atalho emoji="🏆" label="Conquistas" tone="accent" onPress={() => nav.navigate('Conquistas')} />
          <Atalho emoji="📜" label="Histórico" tone="cyan" onPress={() => nav.navigate('Historico')} />
        </View>

        <View className="mt-4">
          <Button title="Sair 👋" variant="ghost" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
