import React, { useEffect, useRef, useState } from 'react';
import { Text, View, Animated } from 'react-native';
import { formatCurrency } from '@utils/formatCurrency';

interface SaldoCardProps {
  saldo: number | string;
  label?: string;
}

export function SaldoCard({ saldo, label = 'Meu cofrinho' }: SaldoCardProps): JSX.Element {
  const target = typeof saldo === 'string' ? parseFloat(saldo) : saldo;
  const [display, setDisplay] = useState(target);
  const bounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const steps = 18;
    const start = display;
    const diff = target - start;
    if (diff !== 0) {
      let i = 0;
      const interval = setInterval(() => {
        i += 1;
        const next = start + (diff * i) / steps;
        setDisplay(i >= steps ? target : next);
        if (i >= steps) clearInterval(interval);
      }, 22);

      Animated.sequence([
        Animated.timing(bounce, { toValue: 1.12, duration: 150, useNativeDriver: true }),
        Animated.spring(bounce, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();

      return () => clearInterval(interval);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <View
      className="rounded-[32px] p-6 bg-primary"
      style={{
        shadowColor: '#7C3AED',
        shadowOpacity: 0.35,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }}
    >
      <View className="items-center">
        <Text className="text-sm font-bold text-white/80 mb-1 tracking-widest uppercase">
          {label}
        </Text>
        <Animated.Text style={{ fontSize: 80, transform: [{ scale: bounce }] }}>
          🐷
        </Animated.Text>
        <Text
          className="text-5xl font-extrabold text-white mt-2"
          accessibilityLabel={`Saldo ${formatCurrency(display)}`}
        >
          {formatCurrency(display)}
        </Text>
        <Text className="text-xs text-white/70 mt-2">Você está indo muito bem! 🌟</Text>
      </View>
    </View>
  );
}
