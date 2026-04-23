'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Transacao extends Model {
    static associate(models) {
      Transacao.belongsTo(models.Conta, {
        foreignKey: 'id_conta',
        as: 'conta',
      });
      Transacao.belongsTo(models.Conta, {
        foreignKey: 'id_conta_destino',
        as: 'contaDestino',
      });
    }
  }

  Transacao.init(
    {
      id_transacao: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_conta: { type: DataTypes.INTEGER, allowNull: false },
      tipo_transacao: {
        type: DataTypes.ENUM('Deposito', 'Saque', 'Transferencia'),
        allowNull: false,
      },
      valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      categoria: { type: DataTypes.STRING(50), allowNull: true },
      descricao: { type: DataTypes.STRING(200), allowNull: true },
      id_conta_destino: { type: DataTypes.INTEGER, allowNull: true },
      data_transacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Transacao',
      tableName: 'Transacoes',
      timestamps: false,
    },
  );

  return Transacao;
};
