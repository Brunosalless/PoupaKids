import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Card, EmptyState, LoadingSpinner, ProgressBar } from '@components/index';
import { useAuth } from '@store/AuthContext';
import { responsavelService, extractApiMessage } from '@services/index';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDateTime } from '@utils/formatDate';

interface Filho {
  id_usuario: number;
  nome: string;
  email?: string;
  conta?: { id_conta: number; saldo: number | string };
  gamificacao?: { nivel: number; pontos: number };
}

export function PainelResponsavelScreen(): JSX.Element {
  const { user } = useAuth();
  const [filhos, setFilhos] = useState<Filho[]>([]);
  const [selecionado, setSelecionado] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user?.id_responsavel) return;
    setLoading(true);
    try {
      const data = await responsavelService.listarFilhos(user.id_responsavel);
      setFilhos(data);
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrir = async (idFilho: number) => {
    if (!user?.id_responsavel) return;
    try {
      const d = await responsavelService.resumoFilho(user.id_responsavel, idFilho);
      setSelecionado(d);
    } catch (e) {
      setError(extractApiMessage(e));
    }
  };

  if (loading) return <LoadingSpinner />;

  if (selecionado) {
    const transacoes = selecionado.ultimasTransacoes || [];
    const chartData = {
      labels: transacoes.slice().reverse().map((_: any, i: number) => `T${i + 1}`),
      datasets: [
        {
          data:
            transacoes.length > 0
              ? transacoes.slice().reverse().map((t: any) => Number(t.valor))
              : [0],
        },
      ],
    };

    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Pressable onPress={() => setSelecionado(null)}>
            <Text className="text-primary mb-2">← Voltar</Text>
          </Pressable>

          <Text className="text-2xl font-bold text-text mb-4">
            {selecionado.usuario.nome}
          </Text>

          <Card style={{ marginBottom: 12 }}>
            <Text className="text-xs text-text-muted">Saldo atual</Text>
            <Text className="text-3xl font-bold text-primary">
              {formatCurrency(selecionado.saldo)}
            </Text>
          </Card>

          <Card style={{ marginBottom: 12 }}>
            <Text className="text-xs text-text-muted">Gamificação</Text>
            <Text className="text-lg text-text">
              Nível {selecionado.gamificacao?.nivel} · {selecionado.gamificacao?.pontos} pontos
            </Text>
          </Card>

          {transacoes.length > 0 && (
            <Card style={{ marginBottom: 12 }}>
              <Text className="text-sm font-bold mb-2">Últimas transações</Text>
              <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 64}
                height={180}
                chartConfig={{
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: () => '#2E75B6',
                  labelColor: () => '#64748B',
                  decimalPlaces: 0,
                }}
                bezier
                style={{ borderRadius: 12 }}
              />
            </Card>
          )}

          <Text className="text-lg font-bold text-text mt-2 mb-2">Metas</Text>
          {selecionado.metas?.length ? (
            selecionado.metas.map((m: any) => (
              <Card key={m.id_meta} style={{ marginBottom: 8 }}>
                <Text className="font-bold text-text">{m.descricao}</Text>
                <Text className="text-xs text-text-muted mb-2">
                  {formatCurrency(m.valor_atual)} de {formatCurrency(m.valor_meta)}
                </Text>
                <ProgressBar progress={Number(m.valor_atual) / Number(m.valor_meta)} />
              </Card>
            ))
          ) : (
            <Text className="text-text-muted">Sem metas ativas.</Text>
          )}

          <Text className="text-lg font-bold text-text mt-4 mb-2">Últimas transações</Text>
          {transacoes.length === 0 ? (
            <Text className="text-text-muted">Nenhuma transação recente.</Text>
          ) : (
            transacoes.map((t: any) => (
              <Card key={t.id_transacao} style={{ marginBottom: 8 }}>
                <Text className="font-bold">{t.tipo_transacao} · {formatCurrency(t.valor)}</Text>
                <Text className="text-xs text-text-muted">{formatDateTime(t.data_transacao)}</Text>
              </Card>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="text-2xl font-bold text-text p-4">Meus filhos 👨‍👩‍👧‍👦</Text>
      {error ? <Text className="text-danger px-4">{error}</Text> : null}
      {filhos.length === 0 ? (
        <EmptyState
          title="Nenhuma criança vinculada"
          description="Peça para seu(sua) filho(a) se cadastrar informando seu ID como responsável."
          icon="👶"
        />
      ) : (
        <FlatList
          data={filhos}
          keyExtractor={(f) => String(f.id_usuario)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => abrir(item.id_usuario)}>
              <Card style={{ marginBottom: 8 }}>
                <Text className="font-bold text-text">{item.nome}</Text>
                <Text className="text-xs text-text-muted">
                  Saldo: {formatCurrency(item.conta?.saldo || 0)} · Nível {item.gamificacao?.nivel || 1}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
