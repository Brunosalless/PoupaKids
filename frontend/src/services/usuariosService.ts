import { api } from './api';
import type { User } from '../types';

export const usuariosService = {
  async obter(id: number): Promise<User> {
    const { data } = await api.get<User>(`/usuarios/${id}`);
    return data;
  },

  async atualizar(id: number, payload: Partial<User>): Promise<User> {
    const { data } = await api.put<User>(`/usuarios/${id}`, payload);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};
