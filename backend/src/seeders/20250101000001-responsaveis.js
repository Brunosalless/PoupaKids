'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const senha = await bcrypt.hash('Senha@123', 10);
    const now = new Date();

    await queryInterface.bulkInsert('Responsaveis', [
      {
        nome: 'Carlos Silva',
        cpf: '123.456.789-00',
        email: 'carlos.silva@poupakids.com',
        senha_hash: senha,
        telefone: '(11) 91234-5678',
        endereco: 'Rua das Flores, 100 — São Paulo/SP',
        created_at: now,
        updated_at: now,
      },
      {
        nome: 'Maria Souza',
        cpf: '987.654.321-00',
        email: 'maria.souza@poupakids.com',
        senha_hash: senha,
        telefone: '(11) 99876-5432',
        endereco: 'Av. Brasil, 200 — Rio de Janeiro/RJ',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Responsaveis', null, {});
  },
};
