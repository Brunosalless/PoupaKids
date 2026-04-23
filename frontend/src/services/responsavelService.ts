import { api } from './api';

export const responsavelService = {
  async listarFilhos(idResponsavel: number) {
    const { data } = await api.get(`/responsavel/${idResponsavel}/filhos`);
    return data;
  },

  async resumoFilho(idResponsavel: number, idFilho: number) {
    const { data } = await api.get(`/responsavel/${idResponsavel}/filho/${idFilho}/resumo`);
    return data;
  },
};
