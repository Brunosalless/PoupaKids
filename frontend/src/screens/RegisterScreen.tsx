import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@components/index';
import { useAuth } from '@store/AuthContext';
import { extractApiMessage } from '@services/api';
import { validateAge } from '@utils/validateAge';

const baseSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

const criancaSchema = baseSchema.extend({
  data_nascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD')
    .refine((v) => validateAge(v), {
      message: 'Crianças devem ter menos de 18 anos',
    }),
  id_responsavel: z.string().min(1, 'Informe o ID do responsável'),
});

const responsavelSchema = baseSchema.extend({
  cpf: z.string().min(11, 'CPF inválido'),
  telefone: z.string().optional(),
});

export function RegisterScreen(): JSX.Element {
  const { register } = useAuth();
  const [tipo, setTipo] = useState<'usuario' | 'responsavel'>('usuario');
  const [loading, setLoading] = useState(false);
  const schema = tipo === 'usuario' ? criancaSchema : responsavelSchema;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof criancaSchema> & z.infer<typeof responsavelSchema>>({
    resolver: zodResolver(schema as z.ZodTypeAny),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      data_nascimento: '',
      id_responsavel: '',
      cpf: '',
      telefone: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const payload =
        tipo === 'usuario'
          ? {
              tipo,
              nome: values.nome,
              email: values.email,
              senha: values.senha,
              data_nascimento: values.data_nascimento,
              id_responsavel: Number(values.id_responsavel),
            }
          : {
              tipo,
              nome: values.nome,
              email: values.email,
              senha: values.senha,
              cpf: values.cpf,
              telefone: values.telefone,
            };
      await register(payload);
    } catch (e) {
      Alert.alert('Erro ao cadastrar', extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-2xl font-bold text-text mb-4">Criar conta</Text>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm text-text">Sou responsável</Text>
          <Switch
            value={tipo === 'responsavel'}
            onValueChange={(v) => setTipo(v ? 'responsavel' : 'usuario')}
          />
        </View>

        <Controller
          control={control}
          name="nome"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Nome completo" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.nome?.message} />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="E-mail" autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
          )}
        />

        <Controller
          control={control}
          name="senha"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Senha" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={errors.senha?.message} />
          )}
        />

        {tipo === 'usuario' ? (
          <>
            <Controller
              control={control}
              name="data_nascimento"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input label="Data de nascimento (AAAA-MM-DD)" value={value} onChangeText={onChange} onBlur={onBlur} placeholder="2016-05-10" error={errors.data_nascimento?.message} />
              )}
            />
            <Controller
              control={control}
              name="id_responsavel"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input label="ID do responsável" keyboardType="number-pad" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.id_responsavel?.message} />
              )}
            />
          </>
        ) : (
          <>
            <Controller
              control={control}
              name="cpf"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input label="CPF" value={value} onChangeText={onChange} onBlur={onBlur} placeholder="000.000.000-00" error={errors.cpf?.message} />
              )}
            />
            <Controller
              control={control}
              name="telefone"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input label="Telefone" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
              )}
            />
          </>
        )}

        <Button title="Cadastrar" onPress={onSubmit} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}
