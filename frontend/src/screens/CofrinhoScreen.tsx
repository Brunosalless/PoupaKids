import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SaldoCard, TransactionForm } from '@components/index';
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
      Alert.alert('Tudo certo! 🎉', 'Sua operação foi registrada no cofrinho. Continue assim! 💪');
    } catch (e) {
      Alert.alert('Não deu certo 😅', extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="items-center mb-4">
          <Text className="text-3xl font-extrabold text-primary">Meu Cofrinho 🐷</Text>
          <Text className="text-sm text-text-muted mt-1">
            Cuidar do dinheiro é coisa de gente esperta!
          </Text>
        </View>

        <SaldoCard saldo={saldo} />

        <Text className="text-lg font-extrabold text-text mt-6 mb-3">O que você quer fazer?</Text>

        <View className="gap-3">
          <Button
            title="💰  Depositar"
            variant="secondary"
            size="xl"
            onPress={() => setModalTipo('Deposito')}
            testID="btn-depositar"
          />
          <Button
            title="💸  Sacar"
            variant="accent"
            size="xl"
            onPress={() => setModalTipo('Saque')}
          />
          <Button
            title="🔁  Transferir"
            variant="cyan"
            size="xl"
            onPress={() => setModalTipo('Transferencia')}
          />
        </View>

        <View className="bg-primary-light/30 rounded-3xl p-4 mt-6 flex-row items-center">
          <Text style={{ fontSize: 30 }} className="mr-3">🌟</Text>
          <Text className="text-sm text-text flex-1 leading-5">
            Cada moedinha que você guarda te deixa mais perto dos seus sonhos!
          </Text>
        </View>

        <Modal
          visible={!!modalTipo}
          animationType="slide"
          transparent
          onRequestClose={() => setModalTipo(null)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-surface rounded-t-[36px] p-6">
              <View className="items-center mb-2">
                <View className="w-12 h-1.5 bg-primary-light rounded-full" />
              </View>
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
