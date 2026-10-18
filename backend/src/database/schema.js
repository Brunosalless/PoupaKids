// Criação/ajuste do schema a partir dos models.
// No MySQL, remove a trigger legada atualiza_saldo (Fase 0): o saldo agora é atualizado pelo
// transacaoService; manter a trigger faria cada depósito ser creditado em dobro.
// As restrições estruturais de integridade ficam no banco como CHECK constraints.
const { sequelize, dialect } = require('../config/database');
require('../models');

const CHECKS = [
  ['Contas', 'chk_contas_saldo', 'saldo >= 0'],
  ['Usuarios', 'chk_usuarios_idade', 'idade > 0 AND idade < 18'],
  ['Objetivos', 'chk_objetivos_valor', 'valor_atual >= 0 AND valor_atual <= valor_meta'],
  ['Transacoes', 'chk_transacoes_valor', 'valor > 0'],
];

// No MySQL, cria a base BancoKids se ela ainda não existir (Sequelize não cria o database sozinho).
async function garantirBanco() {
  if (dialect !== 'mysql') return;
  const mysql = require('mysql2/promise');
  const cfg = sequelize.config;
  const conn = await mysql.createConnection({ host: cfg.host, port: cfg.port, user: cfg.username, password: cfg.password || '' });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

async function garantirSchema({ force = false } = {}) {
  await garantirBanco();
  const alter = process.env.DB_SYNC === 'alter';
  await sequelize.sync({ force, alter });

  if (dialect === 'mysql') {
    await sequelize.query('DROP TRIGGER IF EXISTS atualiza_saldo');
    for (const [tabela, nome, expr] of CHECKS) {
      try {
        await sequelize.query(`ALTER TABLE ${tabela} ADD CONSTRAINT ${nome} CHECK (${expr})`);
      } catch (e) {
        // já existe (ER_CHECK_CONSTRAINT_DUP_NAME) — segue
        if (!/Duplicate|already exists|3822/i.test(e.message)) console.warn(`[schema] ${nome}: ${e.message}`);
      }
    }
  }
}

module.exports = { garantirSchema };
