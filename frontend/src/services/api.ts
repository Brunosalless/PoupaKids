import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  token: '@poupakids:token',
  user: '@poupakids:user',
};

const BASE_URL =
  (typeof process !== 'undefined' && process.env?.API_BASE_URL) ||
  'http://localhost:3000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

type OnUnauthorized = () => void | Promise<void>;
let onUnauthorized: OnUnauthorized | null = null;

export function registerOnUnauthorized(handler: OnUnauthorized): void {
  onUnauthorized = handler;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
      if (onUnauthorized) await onUnauthorized();
    }
    return Promise.reject(error);
  },
);

/** Extrai a mensagem amigável de um AxiosError (padrão da API). */
export function extractApiMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string } } | undefined;
    return data?.error?.message || error.message || 'Erro inesperado';
  }
  return (error as Error)?.message || 'Erro inesperado';
}
