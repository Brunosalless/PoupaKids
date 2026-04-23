import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CofrinhoScreen } from '../CofrinhoScreen';

jest.mock('@store/FinanceContext', () => ({
  useFinance: () => ({
    saldo: 150.5,
    idConta: 1,
    refreshSaldo: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('@services/index', () => ({
  transacoesService: { criar: jest.fn() },
  extractApiMessage: () => 'erro',
}));

describe('CofrinhoScreen', () => {
  it('exibe saldo e botão de depósito', () => {
    const { getByText, getByTestId } = render(<CofrinhoScreen />);
    expect(getByText(/Meu cofrinho/i)).toBeTruthy();
    expect(getByTestId('btn-depositar')).toBeTruthy();
  });

  it('abre modal ao tocar em Depositar', () => {
    const { getByTestId, queryByText } = render(<CofrinhoScreen />);
    fireEvent.press(getByTestId('btn-depositar'));
    expect(queryByText(/Depositar no cofrinho/i)).toBeTruthy();
  });
});
