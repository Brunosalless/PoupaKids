// Conexão única com o banco de dados (BancoKids), reaproveitada por todos os models.
// MySQL é o banco oficial do projeto. SQLite pode ser usado para demonstração local
// (DB_DIALECT=sqlite) ou testes automatizados (NODE_ENV=test → SQLite em memória).
require('dotenv').config({ quiet: true });
const { Sequelize } = require('sequelize');

const isTest = process.env.NODE_ENV === 'test';
const dialect = isTest ? 'sqlite' : (process.env.DB_DIALECT || 'mysql');

let sequelize;

if (dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: isTest ? ':memory:' : (process.env.DB_STORAGE || './bancokids.sqlite'),
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'BancoKids',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
      timezone: '-03:00',
      define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
    }
  );
}

module.exports = { sequelize, dialect };
