'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Conquista extends Model {
    static associate(models) {
      Conquista.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario',
      });
    }
  }

  Conquista.init(
    {
      id_conquista: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: { type: DataTypes.INTEGER, allowNull: false },
      nome: { type: DataTypes.STRING(100), allowNull: false },
      descricao: { type: DataTypes.STRING(200), allowNull: true },
      icone: { type: DataTypes.STRING(100), allowNull: true },
      desbloqueada_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Conquista',
      tableName: 'Conquistas',
      timestamps: false,
    },
  );

  return Conquista;
};
