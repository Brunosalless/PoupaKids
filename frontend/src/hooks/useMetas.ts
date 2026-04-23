import { useCallback, useEffect, useState } from 'react';
import { metasService, extractApiMessage } from '../services';
import type { Meta } from '../types';

export function useMetas(usuarioId: number | null | undefined) {
  const [data, setData] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!usuarioId) return;
    setLoading(true);
    setError(null);
    try {
      const metas = await metasService.listar(usuarioId);
      setData(metas);
    } catch (e) {
      setError(extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
