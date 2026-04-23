import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, registerOnUnauthorized, STORAGE_KEYS } from '../services';
import type { RegisterData, User, UserType } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  tipo: UserType | null;
  isLoading: boolean;
  login: (email: string, senha: string, tipo: UserType) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tipo, setTipo] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
    setUser(null);
    setToken(null);
    setTipo(null);
  }, []);

  useEffect(() => {
    registerOnUnauthorized(clearSession);
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.token),
          AsyncStorage.getItem(STORAGE_KEYS.user),
        ]);
        if (t && u) {
          const parsed = JSON.parse(u) as { user: User; tipo: UserType };
          setToken(t);
          setUser(parsed.user);
          setTipo(parsed.tipo);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clearSession]);

  const persist = async (tk: string, usr: User, t: UserType) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.token, tk],
      [STORAGE_KEYS.user, JSON.stringify({ user: usr, tipo: t })],
    ]);
    setToken(tk);
    setUser(usr);
    setTipo(t);
  };

  const login = useCallback(async (email: string, senha: string, t: UserType) => {
    const res = await authService.login(email, senha, t);
    await persist(res.token, res.user, t);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await authService.register(data);
    await persist(res.token, res.user, data.tipo);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, token, tipo, isLoading, login, register, logout }),
    [user, token, tipo, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
