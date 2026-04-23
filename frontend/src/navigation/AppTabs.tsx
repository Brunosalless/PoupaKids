import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeScreen,
  CofrinhoScreen,
  MetasScreen,
  ConquistasScreen,
  HistoricoScreen,
} from '@screens/index';
import type { AppTabParamList } from './types';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<AppTabParamList>();

function icon(emoji: string) {
  return () => <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export function AppTabs(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: icon('🏠') }} />
      <Tab.Screen name="Cofrinho" component={CofrinhoScreen} options={{ tabBarIcon: icon('🐷') }} />
      <Tab.Screen name="Metas" component={MetasScreen} options={{ tabBarIcon: icon('🎯') }} />
      <Tab.Screen name="Conquistas" component={ConquistasScreen} options={{ tabBarIcon: icon('🏆') }} />
      <Tab.Screen name="Historico" component={HistoricoScreen} options={{ tabBarIcon: icon('📜') }} />
    </Tab.Navigator>
  );
}
