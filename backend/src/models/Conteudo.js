'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Conteudo extends Model {
    static associate() {
      /* sem associações */
    }
  }

  Conteudo.init(
    {
      id_conteudo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      titulo: { type: DataTypes.STRING(100), allowNull: false },
      descricao: { type: DataTypes.TEXT, allowNull: true },
      nivel: {
        type: DataTypes.ENUM('Iniciante', 'Intermediario', 'Avancado'),
        allowNull: false,
      },
      url_recurso: { type: DataTypes.STRING(255), allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Conteudo',
      tableName: 'Conteudos',
      timestamps: false,
    },
  );

  return Conteudo;
};
