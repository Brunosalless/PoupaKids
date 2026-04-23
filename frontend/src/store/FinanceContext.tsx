import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { contasService, gamificacaoService } from '../services';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  saldo: number;
  idConta: number | null;
  pontos: number;
  nivel: number;
  proximoNivel: number;
  refreshSaldo: () => Promise<void>;
  refreshGamificacao: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const { user, tipo } = useAuth();
  const [saldo, setSaldo] = useState(0);
  const [idConta, setIdConta] = useState<number | null>(null);
  const [pontos, setPontos] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [proximoNivel, setProximoNivel] = useState(100);

  const refreshSaldo = useCallback(async () => {
    if (!user || tipo !== 'usuario' || !user.id_usuario) return;
    const conta = await contasService.obterPorUsuario(user.id_usuario);
    setSaldo(parseFloat(String(conta.saldo)));
    setIdConta(conta.id_conta);
  }, [user, tipo]);

  const refreshGamificacao = useCallback(async () => {
    if (!user || tipo !== 'usuario' || !user.id_usuario) return;
    const g = await gamificacaoService.obter(user.id_usuario);
    setPontos(g.pontos);
    setNivel(g.nivel);
    setProximoNivel(g.proximoNivel);
  }, [user, tipo]);

  const value = useMemo(
    () => ({
      saldo,
      idConta,
      pontos,
      nivel,
      proximoNivel,
      refreshSaldo,
      refreshGamificacao,
    }),
    [saldo, idConta, pontos, nivel, proximoNivel, refreshSaldo, refreshGamificacao],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextType {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance deve ser usado dentro de FinanceProvider');
  return ctx;
}
