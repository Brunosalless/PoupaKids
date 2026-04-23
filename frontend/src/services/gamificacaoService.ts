import { api } from './api';
import type { GamificacaoResumo } from '../types';

export const gamificacaoService = {
  async obter(usuarioId: number): Promise<GamificacaoResumo> {
    const { data } = await api.get<GamificacaoResumo>(`/gamificacao/${usuarioId}`);
    return data;
  },

  async adicionarPontos(
    usuarioId: number,
    pontos: number,
  ): Promise<{ nivel: number; pontos: number }> {
    const { data } = await api.post(`/gamificacao/${usuarioId}/pontos`, { pontos });
    return data;
  },
};
