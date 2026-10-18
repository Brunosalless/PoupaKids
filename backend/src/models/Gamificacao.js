const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tabela Gamificacao — 1:1 com Usuarios. "conquistas" guarda um array JSON de códigos.
const Gamificacao = sequelize.define('Gamificacao', {
  id_gamificacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  nivel: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  pontos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  conquistas: {
    type: DataTypes.TEXT,
    get() {
      const raw = this.getDataValue('conquistas');
      try { return raw ? JSON.parse(raw) : []; } catch { return []; }
    },
    set(lista) { this.setDataValue('conquistas', JSON.stringify(lista || [])); },
  },
}, { tableName: 'Gamificacao', timestamps: false });

module.exports = Gamificacao;
