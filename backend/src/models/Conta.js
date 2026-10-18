const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const decimal = (campo) => ({
  type: DataTypes.DECIMAL(10, 2),
  allowNull: false,
  defaultValue: 0,
  get() { return Number(this.getDataValue(campo) || 0); },
});

// Tabela Contas — 1:1 com Usuarios. mesada_referencia (AAAA-MM) adicionada na Fase 02 (RN07).
const Conta = sequelize.define('Conta', {
  id_conta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  saldo: { ...decimal('saldo'), validate: { min: 0 } },
  limite_mesada: decimal('limite_mesada'),
  mesada_referencia: { type: DataTypes.STRING(7) },
}, { tableName: 'Contas', timestamps: false });

module.exports = Conta;
