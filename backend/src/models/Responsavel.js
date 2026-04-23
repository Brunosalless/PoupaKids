'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Responsavel extends Model {
    static associate(models) {
      Responsavel.hasMany(models.Usuario, {
        foreignKey: 'id_responsavel',
        as: 'filhos',
      });
    }
  }

  Responsavel.init(
    {
      id_responsavel: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: { type: DataTypes.STRING(100), allowNull: false },
      cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
      email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      senha_hash: { type: DataTypes.STRING(255), allowNull: false },
      telefone: { type: DataTypes.STRING(20), allowNull: true },
      endereco: { type: DataTypes.STRING(200), allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Responsavel',
      tableName: 'Responsaveis',
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ['senha_hash'] },
      },
      scopes: {
        withSenha: { attributes: { include: ['senha_hash'] } },
      },
    },
  );

  return Responsavel;
};
