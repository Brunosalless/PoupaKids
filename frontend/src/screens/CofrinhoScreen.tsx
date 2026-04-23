import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, SaldoCard, TransactionForm } from '@components/index';
import { useFinance } from '@store/FinanceContext';
import { transacoesService, extractApiMessage } from '@services/index';
import type { TipoTransacao } from '../types';

export function CofrinhoScreen(): JSX.Element {
  const { saldo, idConta, refreshSaldo } = useFinance();
  const [modalTipo, setModalTipo] = useState<TipoTransacao | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshSaldo();
  }, [refreshSaldo]);

  const submit = async (data: { valor: number; descricao?: string; id_conta_destino?: number }) => {
    if (!idConta || !modalTipo) return;
    setLoading(true);
    try {
      await transacoesService.criar({
        id_conta: idConta,
        tipo_transacao: modalTipo,
        valor: data.valor,
        descricao: data.descricao,
        id_conta_destino: data.id_conta_destino,
      });
      await refreshSaldo();
      setModalTipo(null);
      Alert.alert('Sucesso!', 'Operação registrada no cofrinho. 🎉');
    } catch (e) {
      Alert.alert('Não foi possível', extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-text mb-4">Meu cofrinho</Text>

        <SaldoCard saldo={saldo} />

        <Card style={{ marginTop: 16 }}>
          <Text className="text-sm text-text-muted mb-3">O que você quer fazer?</Text>
          <View className="gap-3">
            <Button title="Depositar 💰" onPress={() => setModalTipo('Deposito')} testID="btn-depositar" />
            <Button title="Sacar 💸" variant="secondary" onPress={() => setModalTipo('Saque')} />
            <Button title="Transferir 🔁" variant="ghost" onPress={() => setModalTipo('Transferencia')} />
          </View>
        </Card>

        <Modal visible={!!modalTipo} animationType="slide" transparent onRequestClose={() => setModalTipo(null)}>
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-surface rounded-t-3xl p-6">
              {modalTipo && (
                <TransactionForm tipo={modalTipo} loading={loading} onSubmit={submit} />
              )}
              <View className="mt-3">
                <Button title="Cancelar" variant="ghost" onPress={() => setModalTipo(null)} />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
