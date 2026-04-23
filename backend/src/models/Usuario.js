'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.belongsTo(models.Responsavel, {
        foreignKey: 'id_responsavel',
        as: 'responsavel',
      });
      Usuario.hasOne(models.Conta, { foreignKey: 'id_usuario', as: 'conta' });
      Usuario.hasOne(models.Gamificacao, {
        foreignKey: 'id_usuario',
        as: 'gamificacao',
      });
      Usuario.hasMany(models.Meta, { foreignKey: 'id_usuario', as: 'metas' });
      Usuario.hasMany(models.Conquista, {
        foreignKey: 'id_usuario',
        as: 'conquistas',
      });
    }
  }

  Usuario.init(
    {
      id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: { type: DataTypes.STRING(100), allowNull: false },
      data_nascimento: { type: DataTypes.DATEONLY, allowNull: false },
      email: { type: DataTypes.STRING(100), allowNull: true, unique: true },
      senha_hash: { type: DataTypes.STRING(255), allowNull: false },
      cpf: { type: DataTypes.STRING(14), allowNull: true, unique: true },
      id_responsavel: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Usuario',
      tableName: 'Usuarios',
      timestamps: false,
      defaultScope: { attributes: { exclude: ['senha_hash'] } },
      scopes: { withSenha: { attributes: { include: ['senha_hash'] } } },
    },
  );

  return Usuario;
};
