// Cliente HTTP único da aplicação. Toda comunicação com o backend passa por aqui:
// - baseURL relativa (/api): mesma origem em produção; proxy do Vite em desenvolvimento;
// - interceptor de requisição: anexa o JWT (Authorization: Bearer <token>);
// - interceptor de resposta: normaliza erros { erro, codigo } e encerra a sessão em 401.
import axios from 'axios';

const TOKEN_KEY = 'poupakids.token';

export const tokenStorage = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* modo privado */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* modo privado */ } },
};

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 10000 });

let aoExpirarSessao = () => {};
export const registrarAoExpirarSessao = (fn) => { aoExpirarSessao = fn; };

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error.response?.status;
    const mensagem = error.response?.data?.erro
      || (error.code === 'ECONNABORTED' ? 'O servidor demorou para responder.' : 'Não foi possível conectar ao servidor.');
    if (status === 401 && !error.config?.url?.startsWith('/auth/login')) aoExpirarSessao();
    return Promise.reject(Object.assign(new Error(mensagem), { status, codigo: error.response?.data?.codigo }));
  },
);

// Funções por recurso — espelham os endpoints documentados na seção 22.2
export const AuthAPI = {
  registrar: (dados) => api.post('/auth/registrar', dados).then((r) => r.data),
  login: (email, senha) => api.post('/auth/login', { email, senha }).then((r) => r.data),
  loginCrianca: (apelido, pin) => api.post('/auth/login-crianca', { apelido, pin }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};
export const UsuariosAPI = {
  listar: () => api.get('/usuarios').then((r) => r.data),
  buscar: (id) => api.get(`/usuarios/${id}`).then((r) => r.data),
  criar: (dados) => api.post('/usuarios', dados).then((r) => r.data),
  definirMesada: (id, limite_mesada) => api.patch(`/usuarios/${id}/mesada`, { limite_mesada }).then((r) => r.data),
  pagarMesada: (id) => api.post(`/usuarios/${id}/mesada/pagar`).then((r) => r.data),
};
export const TransacoesAPI = {
  registrar: (dados) => api.post('/transacoes', dados).then((r) => r.data),
  listar: (idConta) => api.get(`/transacoes/conta/${idConta}`).then((r) => r.data),
};
export const ObjetivosAPI = {
  listar: (idUsuario) => api.get(`/objetivos/usuario/${idUsuario}`).then((r) => r.data),
  criar: (dados) => api.post('/objetivos', dados).then((r) => r.data),
  adicionar: (id, valor) => api.patch(`/objetivos/${id}/adicionar`, { valor }).then((r) => r.data),
};
export const ConteudosAPI = {
  listar: (params) => api.get('/conteudos', { params }).then((r) => r.data),
  concluir: (id) => api.post(`/conteudos/${id}/concluir`).then((r) => r.data),
};
export const GamificacaoAPI = {
  obter: (idUsuario) => api.get(`/gamificacao/${idUsuario}`).then((r) => r.data),
};
export const PainelAPI = {
  responsavel: () => api.get('/painel/responsavel').then((r) => r.data),
};

export default api;
