// Registro central dos models e relacionamentos (espelha a Parte 18 do documento).
const { sequelize } = require('../config/database');
const Responsavel = require('./Responsavel');
const Usuario = require('./Usuario');
const Conta = require('./Conta');
const Transacao = require('./Transacao');
const Objetivo = require('./Objetivo');
const Gamificacao = require('./Gamificacao');
const ConteudoEducativo = require('./ConteudoEducativo');
const ProgressoConteudo = require('./ProgressoConteudo');

// 1:N Responsáveis → Usuários
Responsavel.hasMany(Usuario, { foreignKey: 'id_responsavel', as: 'filhos' });
Usuario.belongsTo(Responsavel, { foreignKey: 'id_responsavel', as: 'responsavel' });

// 1:1 Usuários → Contas
Usuario.hasOne(Conta, { foreignKey: 'id_usuario', as: 'conta', onDelete: 'CASCADE' });
Conta.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// 1:N Contas → Transações (origem) e N:1 Transações → Conta destino
Conta.hasMany(Transacao, { foreignKey: 'id_conta', as: 'transacoes' });
Transacao.belongsTo(Conta, { foreignKey: 'id_conta', as: 'conta' });
Transacao.belongsTo(Conta, { foreignKey: 'id_conta_destino', as: 'contaDestino' });

// 1:N Usuários → Objetivos; Transação de poupança → Objetivo
Usuario.hasMany(Objetivo, { foreignKey: 'id_usuario', as: 'objetivos', onDelete: 'CASCADE' });
Objetivo.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Transacao.belongsTo(Objetivo, { foreignKey: 'id_objetivo', as: 'objetivo' });

// 1:1 Usuários → Gamificação
Usuario.hasOne(Gamificacao, { foreignKey: 'id_usuario', as: 'gamificacao', onDelete: 'CASCADE' });
Gamificacao.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// N:N Usuários ↔ Conteúdos (via ProgressoConteudo)
Usuario.belongsToMany(ConteudoEducativo, { through: ProgressoConteudo, foreignKey: 'id_usuario', otherKey: 'id_conteudo', as: 'conteudosConcluidos' });
ConteudoEducativo.belongsToMany(Usuario, { through: ProgressoConteudo, foreignKey: 'id_conteudo', otherKey: 'id_usuario', as: 'concluidoPor' });

module.exports = {
  sequelize, Responsavel, Usuario, Conta, Transacao, Objetivo, Gamificacao, ConteudoEducativo, ProgressoConteudo,
};
