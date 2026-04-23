import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from '@components/index';
import { useAuth } from '@store/AuthContext';
import { extractApiMessage } from '@services/api';
import type { AuthStackParamList } from '@navigation/types';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function LoginScreen(): JSX.Element {
  const { login } = useAuth();
  const [isResponsavel, setIsResponsavel] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', senha: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.senha, isResponsavel ? 'responsavel' : 'usuario');
    } catch (e) {
      Alert.alert('Erro ao entrar', extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 60, textAlign: 'center' }}>🐷</Text>
        <Text className="text-3xl font-bold text-primary text-center mb-2">PoupaKids</Text>
        <Text className="text-sm text-text-muted text-center mb-8">
          Bem-vindo de volta!
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="voce@exemplo.com"
              error={errors.email?.message}
              testID="input-email"
            />
          )}
        />

        <Controller
          control={control}
          name="senha"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Senha"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Sua senha"
              error={errors.senha?.message}
              testID="input-senha"
            />
          )}
        />

        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-sm text-text">Sou responsável</Text>
          <Switch
            value={isResponsavel}
            onValueChange={setIsResponsavel}
            accessibilityLabel="Alternar entre criança e responsável"
          />
        </View>

        <Button title="Entrar" onPress={onSubmit} loading={loading} testID="btn-login" />

        <View className="items-center mt-6">
          <Text className="text-sm text-text-muted">Ainda não tem conta?</Text>
          <Button
            title="Criar conta"
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
