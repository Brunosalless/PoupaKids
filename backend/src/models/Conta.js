'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Conta extends Model {
    static associate(models) {
      Conta.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario',
      });
      Conta.hasMany(models.Transacao, {
        foreignKey: 'id_conta',
        as: 'transacoes',
      });
    }
  }

  Conta.init(
    {
      id_conta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      saldo: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      limite_mesada: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Conta',
      tableName: 'Contas',
      timestamps: false,
    },
  );

  return Conta;
};
