import { useCallback, useEffect, useState } from 'react';
import { transacoesService, extractApiMessage } from '../services';
import type { TipoTransacao, Transacao } from '../types';

export function useTransacoes(contaId: number | null, tipo?: TipoTransacao) {
  const [data, setData] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!contaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await transacoesService.listar(contaId, 1, tipo);
      setData(res.data);
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  }, [contaId, tipo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
