'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Meta extends Model {
    static associate(models) {
      Meta.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario',
      });
    }
  }

  Meta.init(
    {
      id_meta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: { type: DataTypes.INTEGER, allowNull: false },
      descricao: { type: DataTypes.STRING(150), allowNull: false },
      valor_meta: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      valor_atual: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      status: {
        type: DataTypes.ENUM('ativa', 'concluida', 'cancelada'),
        defaultValue: 'ativa',
      },
      data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Meta',
      tableName: 'Metas',
      timestamps: false,
    },
  );

  return Meta;
};
