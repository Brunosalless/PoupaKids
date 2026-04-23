import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PainelResponsavelScreen } from '@screens/index';
import type { ResponsavelStackParamList } from './types';

const Stack = createNativeStackNavigator<ResponsavelStackParamList>();

export function ResponsavelStack(): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Painel" component={PainelResponsavelScreen} />
    </Stack.Navigator>
  );
}
