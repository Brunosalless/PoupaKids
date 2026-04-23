'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const senha = await bcrypt.hash('Kids@123', 10);
    const now = new Date();

    const [responsaveis] = await queryInterface.sequelize.query(
      'SELECT id_responsavel, email FROM Responsaveis;',
    );
    const carlos = responsaveis.find((r) => r.email === 'carlos.silva@poupakids.com');
    const maria = responsaveis.find((r) => r.email === 'maria.souza@poupakids.com');

    await queryInterface.bulkInsert('Usuarios', [
      {
        nome: 'Joãozinho Silva',
        data_nascimento: '2015-04-10',
        email: 'joaozinho@poupakids.com',
        senha_hash: senha,
        cpf: null,
        id_responsavel: carlos.id_responsavel,
        created_at: now,
      },
      {
        nome: 'Aninha Souza',
        data_nascimento: '2016-09-22',
        email: 'aninha@poupakids.com',
        senha_hash: senha,
        cpf: null,
        id_responsavel: maria.id_responsavel,
        created_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Usuarios', null, {});
  },
};
