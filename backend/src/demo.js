// Modo demonstração: roda a API + frontend sem MySQL e sem .env.
// Usa SQLite (arquivo backend/bancokids.sqlite) e cria os dados de teste na primeira execução.
const path = require('path');
const fs = require('fs');

process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = process.env.DB_STORAGE || path.resolve(__dirname, '../bancokids.sqlite');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'poupakids-demo-secret';

(async () => {
  const novo = !fs.existsSync(process.env.DB_STORAGE) || process.argv.includes('--reset');
  if (novo) {
    const seed = require('./database/seed');
    await seed();
  }
  require('./server');
})().catch((e) => { console.error('Falha no modo demonstração:', e); process.exit(1); });
