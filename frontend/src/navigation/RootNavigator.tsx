import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@store/AuthContext';
import { SplashScreen } from '@screens/SplashScreen';
import { AuthStack } from './AuthStack';
import { AppTabs } from './AppTabs';
import { ResponsavelStack } from './ResponsavelStack';

export function RootNavigator(): JSX.Element {
  const { token, tipo, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {!token ? (
        <AuthStack />
      ) : tipo === 'responsavel' ? (
        <ResponsavelStack />
      ) : (
        <AppTabs />
      )}
    </NavigationContainer>
  );
}
