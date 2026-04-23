import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, SaldoCard } from '@components/index';
import { useAuth } from '@store/AuthContext';
import { useFinance } from '@store/FinanceContext';
import { mensagemDoDia } from '@utils/mensagens';

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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
      >
        <Text className="text-2xl font-bold text-text mb-1">Olá, {user?.nome?.split(' ')[0] || 'amigo'}!</Text>
        <Text className="text-sm text-text-muted mb-4">{mensagemDoDia()}</Text>

        <SaldoCard saldo={saldo} />

        <View className="flex-row mt-4">
          <Card style={{ flex: 1, marginRight: 8 }}>
            <Text className="text-xs text-text-muted">Nível</Text>
            <Text className="text-3xl font-bold text-primary">{nivel}</Text>
          </Card>
          <Card style={{ flex: 1, marginLeft: 8 }}>
            <Text className="text-xs text-text-muted">Pontos</Text>
            <Text className="text-3xl font-bold text-accent">{pontos}</Text>
          </Card>
        </View>

        <View className="mt-6 gap-3">
          <Button title="Abrir cofrinho 🐷" onPress={() => nav.navigate('Cofrinho')} />
          <Button title="Minhas metas 🎯" variant="secondary" onPress={() => nav.navigate('Metas')} />
          <Button title="Conquistas 🏆" variant="secondary" onPress={() => nav.navigate('Conquistas')} />
          <Button title="Histórico 📜" variant="ghost" onPress={() => nav.navigate('Historico')} />
          <Button title="Sair" variant="danger" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
