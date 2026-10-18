const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tabela Objetivos (metas de poupança / "cofrinhos"). status e concluido_em adicionados na Fase 02.
const Objetivo = sequelize.define('Objetivo', {
  id_objetivo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  descricao: { type: DataTypes.STRING(150), allowNull: false },
  valor_meta: {
    type: DataTypes.DECIMAL(10, 2), allowNull: false,
    get() { return Number(this.getDataValue('valor_meta')); },
  },
  valor_atual: {
    type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0,
    get() { return Number(this.getDataValue('valor_atual') || 0); },
  },
  status: { type: DataTypes.ENUM('Em andamento', 'Concluído'), allowNull: false, defaultValue: 'Em andamento' },
  concluido_em: { type: DataTypes.DATE },
}, { tableName: 'Objetivos', timestamps: false });

module.exports = Objetivo;
