import { api } from './api';
import type { Conta } from '../types';

export const contasService = {
  async obter(id: number): Promise<Conta> {
    const { data } = await api.get<Conta>(`/contas/${id}`);
    return data;
  },

  async obterPorUsuario(idUsuario: number): Promise<Conta> {
    const { data } = await api.get<Conta>(`/contas/usuario/${idUsuario}`);
    return data;
  },
};
