'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Gamificacao extends Model {
    static associate(models) {
      Gamificacao.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario',
      });
    }
  }

  Gamificacao.init(
    {
      id_gamificacao: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      nivel: { type: DataTypes.INTEGER, defaultValue: 1 },
      pontos: { type: DataTypes.INTEGER, defaultValue: 0 },
      atualizado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Gamificacao',
      tableName: 'Gamificacao',
      timestamps: false,
    },
  );

  return Gamificacao;
};
