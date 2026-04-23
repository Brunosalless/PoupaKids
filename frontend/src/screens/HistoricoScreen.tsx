import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, LoadingSpinner } from '@components/index';
import { useFinance } from '@store/FinanceContext';
import { useTransacoes } from '@hooks/useTransacoes';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDateTime } from '@utils/formatDate';
import type { TipoTransacao } from '../types';

const TIPOS: Array<{ label: string; value?: TipoTransacao }> = [
  { label: 'Todos' },
  { label: 'Depósitos', value: 'Deposito' },
  { label: 'Saques', value: 'Saque' },
  { label: 'Transferências', value: 'Transferencia' },
];

const ICONS: Record<TipoTransacao, { icon: string; color: string }> = {
  Deposito: { icon: '↓', color: 'text-secondary' },
  Saque: { icon: '↑', color: 'text-danger' },
  Transferencia: { icon: '↔', color: 'text-primary' },
};

export function HistoricoScreen(): JSX.Element {
  const { idConta } = useFinance();
  const [filtro, setFiltro] = useState<TipoTransacao | undefined>(undefined);
  const { data, loading, error, refresh } = useTransacoes(idConta, filtro);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold text-text mb-2">Histórico</Text>
        <View className="flex-row gap-2">
          {TIPOS.map((t) => (
            <Pressable
              key={t.label}
              onPress={() => setFiltro(t.value)}
              className={`px-3 py-2 rounded-full ${filtro === t.value ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <Text className={filtro === t.value ? 'text-white text-xs' : 'text-text text-xs'}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Text className="text-danger text-center">{error}</Text>
      ) : data.length === 0 ? (
        <EmptyState
          title="Nenhuma transação"
          description="Quando você fizer operações elas aparecerão aqui."
          icon="📜"
          ctaLabel="Atualizar"
          onCtaPress={refresh}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(t) => String(t.id_transacao)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const meta = ICONS[item.tipo_transacao];
            return (
              <Card style={{ marginBottom: 8 }}>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text style={{ fontSize: 24 }} className={`mr-2 ${meta.color}`}>
                      {meta.icon}
                    </Text>
                    <View>
                      <Text className="font-bold text-text">{item.tipo_transacao}</Text>
                      <Text className="text-xs text-text-muted">
                        {formatDateTime(item.data_transacao)}
                      </Text>
                      {item.descricao ? (
                        <Text className="text-xs text-text-muted">{item.descricao}</Text>
                      ) : null}
                    </View>
                  </View>
                  <Text className={`font-bold ${meta.color}`}>
                    {formatCurrency(item.valor)}
                  </Text>
                </View>
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
