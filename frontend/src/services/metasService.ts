import { api } from './api';
import type { Meta } from '../types';

export const metasService = {
  async listar(usuarioId: number): Promise<Meta[]> {
    const { data } = await api.get<Meta[]>(`/metas/${usuarioId}`);
    return data;
  },

  async criar(payload: {
    id_usuario: number;
    descricao: string;
    valor_meta: number;
  }): Promise<Meta> {
    const { data } = await api.post<Meta>('/metas', payload);
    return data;
  },

  async atualizar(id: number, payload: Partial<Meta>): Promise<Meta> {
    const { data } = await api.put<Meta>(`/metas/${id}`, payload);
    return data;
  },

  async remover(id: number): Promise<void> {
    await api.delete(`/metas/${id}`);
  },
};
