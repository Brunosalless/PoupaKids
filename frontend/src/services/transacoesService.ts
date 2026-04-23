import { api } from './api';
import type { TipoTransacao, Transacao } from '../types';

interface CriarPayload {
  id_conta: number;
  tipo_transacao: TipoTransacao;
  valor: number;
  categoria?: string;
  descricao?: string;
  id_conta_destino?: number;
}

interface HistoricoResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Transacao[];
}

export const transacoesService = {
  async criar(payload: CriarPayload): Promise<{ transacao: Transacao; saldo: string | number }> {
    const { data } = await api.post('/transacoes', payload);
    return data;
  },

  async listar(contaId: number, page = 1, tipo?: TipoTransacao): Promise<HistoricoResponse> {
    const { data } = await api.get<HistoricoResponse>(`/transacoes/${contaId}`, {
      params: { page, limit: 20, tipo },
    });
    return data;
  },
};
