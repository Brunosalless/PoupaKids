'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usuarios', {
      id_usuario: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: { type: Sequelize.STRING(100), allowNull: false },
      data_nascimento: { type: Sequelize.DATEONLY, allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      senha_hash: { type: Sequelize.STRING(255), allowNull: false },
      cpf: { type: Sequelize.STRING(14), allowNull: true, unique: true },
      id_responsavel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Responsaveis', key: 'id_responsavel' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.sequelize.query(`
      CREATE TRIGGER valida_idade
      BEFORE INSERT ON Usuarios
      FOR EACH ROW
      BEGIN
        IF TIMESTAMPDIFF(YEAR, NEW.data_nascimento, CURDATE()) >= 18 THEN
          SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Idade do usuário deve ser menor que 18';
        END IF;
      END;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS valida_idade;');
    await queryInterface.dropTable('Usuarios');
  },
};
