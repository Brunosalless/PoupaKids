const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tabela EducacaoFinanceira (entidade de conteúdos educativos). "pontos" adicionado na Fase 02.
const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];

const ConteudoEducativo = sequelize.define('ConteudoEducativo', {
  id_conteudo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(100), allowNull: false },
  descricao: { type: DataTypes.TEXT },
  nivel: { type: DataTypes.ENUM(...NIVEIS), allowNull: false, defaultValue: 'Iniciante' },
  pontos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
}, { tableName: 'EducacaoFinanceira', timestamps: false });

ConteudoEducativo.NIVEIS = NIVEIS;
module.exports = ConteudoEducativo;
