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
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: focused ? 30 : 24, transform: [{ translateY: focused ? -2 : 0 }] }}>
      {emoji}
    </Text>
  );
}

export function AppTabs(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
          borderTopWidth: 0,
          backgroundColor: colors.surface,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
          elevation: 10,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: icon('🏠'), title: 'Início' }} />
      <Tab.Screen name="Cofrinho" component={CofrinhoScreen} options={{ tabBarIcon: icon('🐷') }} />
      <Tab.Screen name="Metas" component={MetasScreen} options={{ tabBarIcon: icon('🎯') }} />
      <Tab.Screen name="Conquistas" component={ConquistasScreen} options={{ tabBarIcon: icon('🏆') }} />
      <Tab.Screen name="Historico" component={HistoricoScreen} options={{ tabBarIcon: icon('📜'), title: 'Histórico' }} />
    </Tab.Navigator>
  );
}
