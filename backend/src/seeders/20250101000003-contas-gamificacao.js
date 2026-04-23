'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [usuarios] = await queryInterface.sequelize.query(
      'SELECT id_usuario, email FROM Usuarios;',
    );

    const contas = usuarios.map((u) => ({
      id_usuario: u.id_usuario,
      saldo: 50.0,
      limite_mesada: 100.0,
      created_at: now,
    }));

    const gamificacao = usuarios.map((u) => ({
      id_usuario: u.id_usuario,
      nivel: 1,
      pontos: 0,
      atualizado_em: now,
    }));

    await queryInterface.bulkInsert('Contas', contas);
    await queryInterface.bulkInsert('Gamificacao', gamificacao);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Gamificacao', null, {});
    await queryInterface.bulkDelete('Contas', null, {});
  },
};
