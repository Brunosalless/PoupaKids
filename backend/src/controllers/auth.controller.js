'use strict';

const { Responsavel, Usuario, Conta, Gamificacao, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { sanitizeUser } = require('../utils/sanitize');

function calcIdade(dataNascimento) {
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade -= 1;
  return idade;
}

async function register(req, res, next) {
  const { tipo, nome, email, senha } = req.body;
  try {
    const senha_hash = await hashPassword(senha);

    if (tipo === 'responsavel') {
      const { cpf, telefone, endereco } = req.body;
      const existe = await Responsavel.scope('withSenha').findOne({ where: { email } });
      if (existe) throw ApiError.conflict('E-mail já cadastrado');

      const novo = await Responsavel.create({
        nome, cpf, email, senha_hash, telefone, endereco,
      });
      const token = signToken({ id: novo.id_responsavel, tipo: 'responsavel', email });
      return res.status(201).json({ token, user: sanitizeUser(novo) });
    }

    // tipo === 'usuario'
    const { data_nascimento, id_responsavel, cpf } = req.body;
    if (calcIdade(data_nascimento) >= 18) {
      throw ApiError.badRequest('Idade do usuário deve ser menor que 18');
    }

    const existe = await Usuario.scope('withSenha').findOne({ where: { email } });
    if (existe) throw ApiError.conflict('E-mail já cadastrado');

    const resp = await Responsavel.findByPk(id_responsavel);
    if (!resp) throw ApiError.badRequest('Responsável informado não existe');

    const user = await sequelize.transaction(async (t) => {
      const criado = await Usuario.create(
        { nome, email, senha_hash, data_nascimento, cpf, id_responsavel },
        { transaction: t },
      );
      await Conta.create(
        { id_usuario: criado.id_usuario, saldo: 0, limite_mesada: 0 },
        { transaction: t },
      );
      await Gamificacao.create(
        { id_usuario: criado.id_usuario, nivel: 1, pontos: 0 },
        { transaction: t },
      );
      return criado;
    });

    const token = signToken({ id: user.id_usuario, tipo: 'usuario', email });
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  const { email, senha, tipo } = req.body;
  try {
    const Model = tipo === 'responsavel' ? Responsavel : Usuario;
    const user = await Model.scope('withSenha').findOne({ where: { email } });
    if (!user) throw ApiError.unauthorized('Credenciais inválidas');

    const ok = await comparePassword(senha, user.senha_hash);
    if (!ok) throw ApiError.unauthorized('Credenciais inválidas');

    const id = tipo === 'responsavel' ? user.id_responsavel : user.id_usuario;
    const token = signToken({ id, tipo, email });
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };
