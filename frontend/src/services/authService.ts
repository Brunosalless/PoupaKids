import { api } from './api';
import type { RegisterData, User, UserType } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, senha: string, tipo: UserType): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, senha, tipo });
    return data;
  },

  async register(payload: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },
};
