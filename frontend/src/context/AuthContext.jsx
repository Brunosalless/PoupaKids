import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthAPI, registrarAoExpirarSessao, tokenStorage } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null); // { perfil, usuario }
  const [carregando, setCarregando] = useState(true);

  const sair = useCallback(() => { tokenStorage.clear(); setSessao(null); }, []);

  useEffect(() => {
    registrarAoExpirarSessao(sair);
    if (!tokenStorage.get()) { setCarregando(false); return; }
    AuthAPI.me().then(setSessao).catch(sair).finally(() => setCarregando(false));
  }, [sair]);

  const entrar = useCallback((resp) => {
    tokenStorage.set(resp.token);
    setSessao({ perfil: resp.perfil, usuario: resp.usuario });
  }, []);

  const valor = useMemo(() => ({ sessao, carregando, entrar, sair }), [sessao, carregando, entrar, sair]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
