import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, MaskedInput } from '@components/index';
import { useAuth } from '@store/AuthContext';
import { extractApiMessage } from '@services/api';
import { validateAge } from '@utils/validateAge';
import {
  brDateToISO,
  isValidBRDate,
  isValidCPF,
  isValidPhone,
  onlyDigits,
} from '@utils/masks';

const baseShape = {
  nome: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha precisa de pelo menos 6 letras'),
};

const criancaSchema = z.object({
  ...baseShape,
  data_nascimento: z
    .string()
    .refine(isValidBRDate, { message: 'Data inválida (use DD/MM/AAAA)' })
    .refine((v) => validateAge(brDateToISO(v)), {
      message: 'Crianças devem ter menos de 18 anos',
    }),
  id_responsavel: z
    .string()
    .refine((v) => Number(v) > 0, { message: 'Informe o ID do responsável' }),
});

const responsavelSchema = z.object({
  ...baseShape,
  cpf: z.string().refine(isValidCPF, { message: 'CPF inválido' }),
  telefone: z
    .string()
    .optional()
    .refine((v) => !v || isValidPhone(v), { message: 'Telefone inválido' }),
});

type Tipo = 'usuario' | 'responsavel';

export function RegisterScreen(): JSX.Element {
  const { register } = useAuth();
  const [tipo, setTipo] = useState<Tipo>('usuario');
  const [loading, setLoading] = useState(false);

  const schema = tipo === 'usuario' ? criancaSchema : responsavelSchema;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
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

  const trocarTipo = (t: Tipo) => {
    setTipo(t);
    reset();
  };

  const onSubmit = handleSubmit(async (values: any) => {
    setLoading(true);
    try {
      const payload =
        tipo === 'usuario'
          ? {
              tipo,
              nome: values.nome,
              email: values.email,
              senha: values.senha,
              data_nascimento: brDateToISO(values.data_nascimento),
              id_responsavel: Number(values.id_responsavel),
            }
          : {
              tipo,
              nome: values.nome,
              email: values.email,
              senha: values.senha,
              cpf: onlyDigits(values.cpf),
              telefone: values.telefone ? onlyDigits(values.telefone) : undefined,
            };
      await register(payload as any);
    } catch (e) {
      Alert.alert('Não deu desta vez 😅', extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="items-center mb-6">
          <Text style={{ fontSize: 60 }}>{tipo === 'usuario' ? '🧒' : '👨‍👩‍👧'}</Text>
          <Text className="text-3xl font-extrabold text-primary mt-2">Criar conta</Text>
          <Text className="text-sm text-text-muted mt-1">
            Vamos começar sua aventura de poupar! 💰
          </Text>
        </View>

        <View className="flex-row mb-5 bg-primary-light/20 rounded-full p-1">
          <Pressable
            onPress={() => trocarTipo('usuario')}
            className={`flex-1 py-3 rounded-full items-center ${tipo === 'usuario' ? 'bg-primary' : ''}`}
          >
            <Text className={`font-bold ${tipo === 'usuario' ? 'text-white' : 'text-primary'}`}>
              🧒 Sou criança
            </Text>
          </Pressable>
          <Pressable
            onPress={() => trocarTipo('responsavel')}
            className={`flex-1 py-3 rounded-full items-center ${tipo === 'responsavel' ? 'bg-primary' : ''}`}
          >
            <Text className={`font-bold ${tipo === 'responsavel' ? 'text-white' : 'text-primary'}`}>
              👨‍👩‍👧 Sou responsável
            </Text>
          </Pressable>
        </View>

        <Controller
          control={control}
          name="nome"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="😃  Nome completo"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Como te chamam?"
              error={errors.nome?.message as string}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="✉️  E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="voce@exemplo.com"
              error={errors.email?.message as string}
            />
          )}
        />

        <Controller
          control={control}
          name="senha"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="🔒  Senha secreta"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Pelo menos 6 letrinhas"
              error={errors.senha?.message as string}
            />
          )}
        />

        {tipo === 'usuario' ? (
          <>
            <Controller
              control={control}
              name="data_nascimento"
              render={({ field: { onChange, value, onBlur } }) => (
                <MaskedInput
                  mask="date"
                  label="🎂  Data de nascimento"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.data_nascimento?.message as string}
                />
              )}
            />
            <Controller
              control={control}
              name="id_responsavel"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="👨‍👩‍👧  ID do responsável"
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ex.: 1"
                  error={errors.id_responsavel?.message as string}
                />
              )}
            />
            <View className="bg-accent-light rounded-2xl p-3 mb-4">
              <Text className="text-xs text-text">
                💡 Peça o ID ao seu responsável — é o número da conta dele(a) no PoupaKids.
              </Text>
            </View>
          </>
        ) : (
          <>
            <Controller
              control={control}
              name="cpf"
              render={({ field: { onChange, value, onBlur } }) => (
                <MaskedInput
                  mask="cpf"
                  label="🆔  CPF"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.cpf?.message as string}
                />
              )}
            />
            <Controller
              control={control}
              name="telefone"
              render={({ field: { onChange, value, onBlur } }) => (
                <MaskedInput
                  mask="phone"
                  label="📱  Telefone (opcional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.telefone?.message as string}
                />
              )}
            />
          </>
        )}

        <View className="mt-2">
          <Button title="Criar minha conta 🎉" onPress={onSubmit} loading={loading} size="lg" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
