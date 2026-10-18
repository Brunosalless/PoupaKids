const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tabela ProgressoConteudo (nova na Fase 02): registra quais conteúdos cada criança concluiu.
// A chave única (id_usuario, id_conteudo) garante que os pontos são concedidos uma única vez (RN10).
const ProgressoConteudo = sequelize.define('ProgressoConteudo', {
  id_progresso: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  id_conteudo: { type: DataTypes.INTEGER, allowNull: false },
  concluido_em: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'ProgressoConteudo',
  timestamps: false,
  indexes: [{ unique: true, fields: ['id_usuario', 'id_conteudo'] }],
});

module.exports = ProgressoConteudo;
