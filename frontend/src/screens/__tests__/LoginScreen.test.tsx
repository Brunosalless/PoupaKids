import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';

jest.mock('@store/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn().mockResolvedValue(undefined) }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

describe('LoginScreen', () => {
  it('renderiza título e formulário', () => {
    const { getByText, getByTestId } = render(<LoginScreen />);
    expect(getByText('PoupaKids')).toBeTruthy();
    expect(getByTestId('input-email')).toBeTruthy();
    expect(getByTestId('input-senha')).toBeTruthy();
    expect(getByTestId('btn-login')).toBeTruthy();
  });

  it('valida campos obrigatórios ao submeter', async () => {
    const { getByTestId, findByText } = render(<LoginScreen />);
    fireEvent.press(getByTestId('btn-login'));
    await waitFor(async () => {
      expect(await findByText(/E-mail inválido/i)).toBeTruthy();
    });
  });
});
