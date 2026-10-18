const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tabela Responsaveis — pais/tutores. senha_hash adicionado na Fase 02 (autenticação).
const Responsavel = sequelize.define('Responsavel', {
  id_responsavel: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  telefone: { type: DataTypes.STRING(20) },
  endereco: { type: DataTypes.STRING(200) },
  senha_hash: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'Responsaveis', timestamps: false });

Responsavel.prototype.toJSON = function () {
  const v = { ...this.get() };
  delete v.senha_hash;
  return v;
};

module.exports = Responsavel;
