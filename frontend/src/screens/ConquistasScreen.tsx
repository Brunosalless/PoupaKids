import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Card, EmptyState, LoadingSpinner, ProgressBar } from '@components/index';
import { useAuth } from '@store/AuthContext';
import { gamificacaoService, extractApiMessage } from '@services/index';
import type { GamificacaoResumo } from '../types';

export function ConquistasScreen(): JSX.Element {
  const { user } = useAuth();
  const [gami, setGami] = useState<GamificacaoResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id_usuario) return;
    setLoading(true);
    try {
      const res = await gamificacaoService.obter(user.id_usuario);
      setGami(res);
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Text className="text-danger text-center mt-8">{error}</Text>
      </SafeAreaView>
    );
  }

  const progresso =
    gami && gami.proximoNivel > 0 ? gami.pontos / gami.proximoNivel : 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4">
        <Card>
          <Text className="text-xs text-text-muted">Nível atual</Text>
          <Text className="text-4xl font-bold text-primary">{gami?.nivel}</Text>
          <Text className="text-xs text-text-muted mt-2">
            {gami?.pontos} / {gami?.proximoNivel} pontos para o próximo nível
          </Text>
          <View className="mt-2">
            <ProgressBar progress={progresso} color="#FFD166" />
          </View>
        </Card>
      </View>

      <Text className="text-xl font-bold text-text px-4 mb-2">Conquistas 🏆</Text>

      {gami?.conquistas?.length ? (
        <FlatList
          data={gami.conquistas}
          keyExtractor={(c) => String(c.id_conquista)}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <Badge nome={item.nome} descricao={item.descricao} icone={item.icone} unlocked />
            </View>
          )}
        />
      ) : (
        <EmptyState
          title="Sem conquistas ainda"
          description="Continue poupando para desbloquear suas primeiras medalhas!"
          icon="🏅"
        />
      )}
    </SafeAreaView>
  );
}
