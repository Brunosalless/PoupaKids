const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tabela Usuarios — crianças. apelido + pin_hash adicionados na Fase 02 (login da criança).
const Usuario = sequelize.define('Usuario', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  idade: { type: DataTypes.INTEGER, allowNull: false },
  cpf: { type: DataTypes.STRING(14), unique: true },
  apelido: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  pin_hash: { type: DataTypes.STRING(100), allowNull: false },
  id_responsavel: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'Usuarios', timestamps: false });

Usuario.prototype.toJSON = function () {
  const v = { ...this.get() };
  delete v.pin_hash;
  return v;
};

module.exports = Usuario;
