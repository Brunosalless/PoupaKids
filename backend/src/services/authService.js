// Autenticação (RF10): responsáveis entram com e-mail/senha; crianças com apelido/PIN.
// Senhas e PINs são armazenados com hash bcrypt; o acesso é concedido via JWT.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { Responsavel, Usuario } = require('../models');

const JWT_SECRET = () => process.env.JWT_SECRET || 'poupakids-dev-secret-troque-em-producao';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '8h';
const BCRYPT_ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 10;

const somenteDigitos = (s) => String(s || '').replace(/\D/g, '');
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

function formatarCpf(cpf) {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) throw new AppError('CPF inválido: informe 11 dígitos.', 422, 'VALIDACAO');
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function gerarToken(perfil, id, nome) {
  return jwt.sign({ perfil, nome }, JWT_SECRET(), { subject: String(id), expiresIn: JWT_EXPIRES });
}

function verificarToken(token) {
  const p = jwt.verify(token, JWT_SECRET());
  return { perfil: p.perfil, id: Number(p.sub), nome: p.nome };
}

async function registrarResponsavel(dados = {}) {
  const nome = String(dados.nome || '').trim();
  const email = String(dados.email || '').trim().toLowerCase();
  const senha = String(dados.senha || '');
  if (nome.length < 3) throw new AppError('Informe o nome completo do responsável.', 422, 'VALIDACAO');
  if (!emailValido(email)) throw new AppError('E-mail inválido.', 422, 'VALIDACAO');
  if (senha.length < 6) throw new AppError('A senha deve ter pelo menos 6 caracteres.', 422, 'VALIDACAO');
  const cpf = formatarCpf(dados.cpf);

  if (await Responsavel.findOne({ where: { email } })) throw new AppError('Já existe um responsável com este e-mail.', 409, 'DUPLICADO');
  if (await Responsavel.findOne({ where: { cpf } })) throw new AppError('Já existe um responsável com este CPF.', 409, 'DUPLICADO');

  const responsavel = await Responsavel.create({
    nome, email, cpf,
    telefone: dados.telefone ? String(dados.telefone).trim() : null,
    endereco: dados.endereco ? String(dados.endereco).trim() : null,
    senha_hash: await bcrypt.hash(senha, BCRYPT_ROUNDS),
  });
  return { token: gerarToken('RESPONSAVEL', responsavel.id_responsavel, responsavel.nome), perfil: 'RESPONSAVEL', usuario: responsavel };
}

async function login(email, senha) {
  const r = await Responsavel.findOne({ where: { email: String(email || '').trim().toLowerCase() } });
  if (!r || !(await bcrypt.compare(String(senha || ''), r.senha_hash))) {
    throw new AppError('E-mail ou senha incorretos.', 401, 'CREDENCIAIS');
  }
  return { token: gerarToken('RESPONSAVEL', r.id_responsavel, r.nome), perfil: 'RESPONSAVEL', usuario: r };
}

async function loginCrianca(apelido, pin) {
  const u = await Usuario.findOne({ where: { apelido: String(apelido || '').trim().toLowerCase() } });
  if (!u || !(await bcrypt.compare(String(pin || ''), u.pin_hash))) {
    throw new AppError('Apelido ou PIN incorretos.', 401, 'CREDENCIAIS');
  }
  return { token: gerarToken('CRIANCA', u.id_usuario, u.nome), perfil: 'CRIANCA', usuario: u };
}

async function me(auth) {
  const usuario = auth.perfil === 'RESPONSAVEL'
    ? await Responsavel.findByPk(auth.id)
    : await Usuario.findByPk(auth.id, { include: ['conta', 'gamificacao'] });
  if (!usuario) throw new AppError('Sessão inválida.', 401, 'SESSAO');
  return { perfil: auth.perfil, usuario };
}

module.exports = { registrarResponsavel, login, loginCrianca, me, gerarToken, verificarToken, formatarCpf, BCRYPT_ROUNDS };
