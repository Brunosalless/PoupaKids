'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Conteudos', {
      id_conteudo: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      titulo: { type: Sequelize.STRING(100), allowNull: false },
      descricao: { type: Sequelize.TEXT, allowNull: true },
      nivel: {
        type: Sequelize.ENUM('Iniciante', 'Intermediario', 'Avancado'),
        allowNull: false,
      },
      url_recurso: { type: Sequelize.STRING(255), allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Conteudos');
  },
};
