'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transacoes', {
      id_transacao: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_conta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Contas', key: 'id_conta' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tipo_transacao: {
        type: Sequelize.ENUM('Deposito', 'Saque', 'Transferencia'),
        allowNull: false,
      },
      valor: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      categoria: { type: Sequelize.STRING(50), allowNull: true },
      descricao: { type: Sequelize.STRING(200), allowNull: true },
      id_conta_destino: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Contas', key: 'id_conta' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      data_transacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.sequelize.query(
      'ALTER TABLE Transacoes ADD CONSTRAINT chk_valor_positivo CHECK (valor > 0);',
    );

    await queryInterface.sequelize.query(`
      CREATE TRIGGER atualiza_saldo
      AFTER INSERT ON Transacoes
      FOR EACH ROW
      BEGIN
        IF NEW.tipo_transacao = 'Deposito' THEN
          UPDATE Contas SET saldo = saldo + NEW.valor WHERE id_conta = NEW.id_conta;
        ELSEIF NEW.tipo_transacao = 'Saque' THEN
          UPDATE Contas SET saldo = saldo - NEW.valor WHERE id_conta = NEW.id_conta;
        ELSEIF NEW.tipo_transacao = 'Transferencia' THEN
          UPDATE Contas SET saldo = saldo - NEW.valor WHERE id_conta = NEW.id_conta;
          UPDATE Contas SET saldo = saldo + NEW.valor WHERE id_conta = NEW.id_conta_destino;
        END IF;
      END;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS atualiza_saldo;');
    await queryInterface.dropTable('Transacoes');
  },
};
