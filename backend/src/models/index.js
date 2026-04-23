'use strict';

const sequelize = require('../config/sequelize');

const Responsavel = require('./Responsavel')(sequelize);
const Usuario = require('./Usuario')(sequelize);
const Conta = require('./Conta')(sequelize);
const Transacao = require('./Transacao')(sequelize);
const Meta = require('./Meta')(sequelize);
const Gamificacao = require('./Gamificacao')(sequelize);
const Conquista = require('./Conquista')(sequelize);
const Conteudo = require('./Conteudo')(sequelize);

const models = {
  Responsavel,
  Usuario,
  Conta,
  Transacao,
  Meta,
  Gamificacao,
  Conquista,
  Conteudo,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
