import React, { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Card,
  EmptyState,
  Input,
  LoadingSpinner,
  ProgressBar,
} from '@components/index';
import { useAuth } from '@store/AuthContext';
import { useMetas } from '@hooks/useMetas';
import { metasService, extractApiMessage } from '@services/index';
import { formatCurrency } from '@utils/formatCurrency';
import type { Meta } from '../types';

const schema = z.object({
  descricao: z.string().min(2, 'Descrição obrigatória'),
  valor_meta: z
    .string()
    .refine((v) => Number(v.replace(',', '.')) > 0, { message: 'Valor inválido' }),
});

export function MetasScreen(): JSX.Element {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useMetas(user?.id_usuario);
  const [open, setOpen] = useState(false);
  const [savingMeta, setSavingMeta] = useState<Meta | null>(null);
  const [addValor, setAddValor] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { descricao: '', valor_meta: '' },
  });

  const criar = handleSubmit(async (values) => {
    if (!user?.id_usuario) return;
    try {
      await metasService.criar({
        id_usuario: user.id_usuario,
        descricao: values.descricao,
        valor_meta: Number(values.valor_meta.replace(',', '.')),
      });
      reset();
      setOpen(false);
      refresh();
    } catch (e) {
      Alert.alert('Erro', extractApiMessage(e));
    }
  });

  const salvarEconomia = async () => {
    if (!savingMeta) return;
    const inc = Number(addValor.replace(',', '.'));
    if (!inc || inc <= 0) return;
    try {
      await metasService.atualizar(savingMeta.id_meta, {
        valor_atual: Number(savingMeta.valor_atual) + inc,
      });
      setSavingMeta(null);
      setAddValor('');
      refresh();
    } catch (e) {
      Alert.alert('Erro', extractApiMessage(e));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4">
        <Text className="text-2xl font-bold text-text">Minhas metas 🎯</Text>
        <Button title="+ Nova" onPress={() => setOpen(true)} />
      </View>

      {error ? (
        <Text className="text-danger text-center mb-2">{error}</Text>
      ) : null}

      {data.length === 0 ? (
        <EmptyState
          title="Você ainda não tem metas"
          description="Crie uma meta para começar a poupar com propósito!"
          icon="🎯"
          ctaLabel="Criar primeira meta"
          onCtaPress={() => setOpen(true)}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(m) => String(m.id_meta)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const progresso = Number(item.valor_atual) / Number(item.valor_meta);
            return (
              <Pressable onPress={() => setSavingMeta(item)}>
                <Card style={{ marginBottom: 12 }}>
                  <Text className="font-bold text-text">{item.descricao}</Text>
                  <Text className="text-xs text-text-muted mb-2">
                    {formatCurrency(item.valor_atual)} de {formatCurrency(item.valor_meta)} ·{' '}
                    {item.status}
                  </Text>
                  <ProgressBar progress={progresso} />
                </Card>
              </Pressable>
            );
          }}
        />
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-surface rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-4">Nova meta</Text>
            <Controller
              control={control}
              name="descricao"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input label="Descrição" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.descricao?.message} />
              )}
            />
            <Controller
              control={control}
              name="valor_meta"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Valor da meta (R$)"
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.valor_meta?.message}
                />
              )}
            />
            <Button title="Criar meta" onPress={criar} loading={isSubmitting} />
            <View className="mt-2">
              <Button title="Cancelar" variant="ghost" onPress={() => setOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!savingMeta} transparent animationType="slide" onRequestClose={() => setSavingMeta(null)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-surface rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-2">Adicionar à meta</Text>
            <Text className="text-sm text-text-muted mb-4">{savingMeta?.descricao}</Text>
            <Input
              label="Quanto economizar (R$)"
              keyboardType="decimal-pad"
              value={addValor}
              onChangeText={setAddValor}
            />
            <Button title="Adicionar" onPress={salvarEconomia} />
            <View className="mt-2">
              <Button title="Fechar" variant="ghost" onPress={() => setSavingMeta(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
