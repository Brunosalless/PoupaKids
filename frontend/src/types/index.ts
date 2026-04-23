export type UserType = 'usuario' | 'responsavel';

export interface User {
  id_usuario?: number;
  id_responsavel?: number;
  nome: string;
  email: string;
  data_nascimento?: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  id_responsavel_fk?: number;
}

export interface Conta {
  id_conta: number;
  id_usuario: number;
  saldo: number | string;
  limite_mesada: number | string;
}

export type TipoTransacao = 'Deposito' | 'Saque' | 'Transferencia';

export interface Transacao {
  id_transacao: number;
  id_conta: number;
  tipo_transacao: TipoTransacao;
  valor: number | string;
  categoria?: string;
  descricao?: string;
  id_conta_destino?: number;
  data_transacao: string;
}

export type StatusMeta = 'ativa' | 'concluida' | 'cancelada';

export interface Meta {
  id_meta: number;
  id_usuario: number;
  descricao: string;
  valor_meta: number | string;
  valor_atual: number | string;
  status: StatusMeta;
  data_criacao: string;
}

export interface Conquista {
  id_conquista: number;
  id_usuario: number;
  nome: string;
  descricao?: string;
  icone?: string;
  desbloqueada_em: string;
}

export interface GamificacaoResumo {
  nivel: number;
  pontos: number;
  proximoNivel: number;
  conquistas: Conquista[];
}

export interface Conteudo {
  id_conteudo: number;
  titulo: string;
  descricao?: string;
  nivel: 'Iniciante' | 'Intermediario' | 'Avancado';
  url_recurso?: string;
}

export interface RegisterData {
  tipo: UserType;
  nome: string;
  email: string;
  senha: string;
  data_nascimento?: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  id_responsavel?: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
