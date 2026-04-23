import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text, View } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import type { TipoTransacao } from '../types';

const schema = z.object({
  valor: z.string().refine((v) => Number(v.replace(',', '.')) > 0, {
    message: 'Valor deve ser maior que zero',
  }),
  descricao: z.string().max(200).optional(),
  id_conta_destino: z.string().optional(),
});

export type TransactionFormData = {
  valor: number;
  descricao?: string;
  id_conta_destino?: number;
};

interface TransactionFormProps {
  tipo: TipoTransacao;
  onSubmit: (data: TransactionFormData) => void | Promise<void>;
  loading?: boolean;
}

export function TransactionForm({ tipo, onSubmit, loading }: TransactionFormProps): JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { valor: '', descricao: '', id_conta_destino: '' },
  });

  const submit = handleSubmit((values) => {
    const payload: TransactionFormData = {
      valor: Number(values.valor.replace(',', '.')),
      descricao: values.descricao,
    };
    if (tipo === 'Transferencia' && values.id_conta_destino) {
      payload.id_conta_destino = Number(values.id_conta_destino);
    }
    return onSubmit(payload);
  });

  return (
    <View>
      <Text className="text-xl font-bold text-text mb-4">
        {tipo === 'Deposito' && 'Depositar no cofrinho'}
        {tipo === 'Saque' && 'Sacar do cofrinho'}
        {tipo === 'Transferencia' && 'Transferir para outra conta'}
      </Text>

      <Controller
        control={control}
        name="valor"
        render={({ field: { onChange, value, onBlur } }) => (
          <Input
            label="Valor (R$)"
            keyboardType="decimal-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="0,00"
            error={errors.valor?.message}
          />
        )}
      />

      {tipo === 'Transferencia' && (
        <Controller
          control={control}
          name="id_conta_destino"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Conta destino (ID)"
              keyboardType="number-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Número da conta"
              error={errors.id_conta_destino?.message}
            />
          )}
        />
      )}

      <Controller
        control={control}
        name="descricao"
        render={({ field: { onChange, value, onBlur } }) => (
          <Input
            label="Descrição (opcional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Ex.: Mesada da semana"
          />
        )}
      />

      <Button title="Confirmar" onPress={submit} loading={loading} />
    </View>
  );
}
