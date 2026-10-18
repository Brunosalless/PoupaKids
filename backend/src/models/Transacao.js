const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tabela Transacoes. Fase 02: id_conta_destino (FK) substitui o uso de "categoria" como conta
// destino; id_objetivo vincula guardas no cofrinho; novos tipos 'Mesada' e 'Poupança'.
const TIPOS = ['Depósito', 'Saque', 'Transferência', 'Mesada', 'Poupança'];

const Transacao = sequelize.define('Transacao', {
  id_transacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_conta: { type: DataTypes.INTEGER, allowNull: false },
  tipo_transacao: { type: DataTypes.ENUM(...TIPOS), allowNull: false },
  valor: {
    type: DataTypes.DECIMAL(10, 2), allowNull: false,
    get() { return Number(this.getDataValue('valor')); },
  },
  categoria: { type: DataTypes.STRING(50) },
  id_conta_destino: { type: DataTypes.INTEGER },
  id_objetivo: { type: DataTypes.INTEGER },
  data_transacao: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'Transacoes', timestamps: false });

Transacao.TIPOS = TIPOS;
module.exports = Transacao;
