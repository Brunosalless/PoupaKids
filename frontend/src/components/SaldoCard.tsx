import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { formatCurrency } from '@utils/formatCurrency';
import { Card } from './Card';

interface SaldoCardProps {
  saldo: number | string;
  label?: string;
}

export function SaldoCard({ saldo, label = 'Saldo do cofrinho' }: SaldoCardProps): JSX.Element {
  const target = typeof saldo === 'string' ? parseFloat(saldo) : saldo;
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const steps = 18;
    const start = display;
    const diff = target - start;
    if (diff === 0) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      const next = start + (diff * i) / steps;
      setDisplay(i >= steps ? target : next);
      if (i >= steps) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <Card>
      <View className="items-center py-4">
        <Text className="text-sm text-text-muted">{label}</Text>
        <View className="flex-row items-center mt-2">
          <Text style={{ fontSize: 32 }} className="mr-2">
            🐷
          </Text>
          <Text className="text-4xl font-bold text-primary" accessibilityLabel={`Saldo ${formatCurrency(display)}`}>
            {formatCurrency(display)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
