import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
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
      Alert.alert('Oops! 😅', extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="items-center mb-8">
          <View
            className="w-32 h-32 rounded-full bg-primary items-center justify-center mb-3"
            style={{
              shadowColor: '#7C3AED',
              shadowOpacity: 0.4,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            }}
          >
            <Text style={{ fontSize: 72 }}>🐷</Text>
          </View>
          <Text className="text-4xl font-extrabold text-primary">PoupaKids</Text>
          <Text className="text-base text-text-muted mt-1">Olá de novo, amiguinho! 👋</Text>
        </View>

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
              label="🔒  Senha"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Sua senha secreta"
              error={errors.senha?.message}
              testID="input-senha"
            />
          )}
        />

        <Pressable
          onPress={() => setIsResponsavel((v) => !v)}
          className={`flex-row items-center justify-between rounded-2xl p-4 mb-4 border-2 ${
            isResponsavel ? 'border-primary bg-primary-light/20' : 'border-primary-light bg-surface'
          }`}
          accessibilityRole="switch"
          accessibilityState={{ checked: isResponsavel }}
        >
          <Text className="text-base font-semibold text-text">
            {isResponsavel ? '👨‍👩‍👧 Sou responsável' : '🧒 Sou criança'}
          </Text>
          <Text className="text-xs text-primary font-bold">tocar para trocar</Text>
        </Pressable>

        <Button
          title="Entrar 🚀"
          onPress={onSubmit}
          loading={loading}
          size="lg"
          testID="btn-login"
        />

        <View className="items-center mt-8">
          <Text className="text-sm text-text-muted mb-2">Primeira vez por aqui?</Text>
          <Button
            title="Criar minha conta 🎉"
            variant="accent"
            onPress={() => navigation.navigate('Register')}
            size="md"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
