require('dotenv').config({ quiet: true });
const app = require('./app');
const { sequelize, dialect } = require('./config/database');
const { garantirSchema } = require('./database/schema');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('Defina JWT_SECRET no .env antes de iniciar em produção.');
  process.exit(1);
}

const PORT = Number(process.env.PORT || 3333);
const temFrontend = require('fs').existsSync(require('path').resolve(__dirname, '../../frontend/dist/index.html'));

(async () => {
  try {
    await garantirSchema();
    await sequelize.authenticate();
    app.listen(PORT, () => {
      console.log(`\nPoupaKids rodando (banco: ${dialect})`);
      console.log(`  API REST:  http://localhost:${PORT}/api`);
      if (temFrontend) {
        console.log(`  Frontend:  http://localhost:${PORT}   <-- abra este endereço no navegador`);
      } else {
        console.log('  Frontend:  ainda não compilado. Na pasta raiz, rode "npm run build"');
        console.log('             (ou use "npm run dev:web" e abra http://localhost:5173).');
      }
      console.log('');
    }).on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`\nA porta ${PORT} já está em uso — provavelmente o PoupaKids já está rodando em outro terminal.`);
        console.error(`Feche o outro terminal (Ctrl+C) ou defina outra porta, ex.: PORT=3334 no backend/.env.\n`);
      } else console.error('Falha ao abrir a porta:', e.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('Falha ao iniciar a API:', err.message);
    if (dialect === 'mysql') {
      console.error('\nO MySQL recusou a conexão. Duas saídas:');
      console.error('  1) Sem MySQL: na pasta raiz rode  npm run demo  (usa SQLite, não precisa de .env).');
      console.error('  2) Com MySQL: em backend/.env preencha DB_USER e DB_PASS com o usuário/senha do seu MySQL');
      console.error('     (a base BancoKids é criada automaticamente) e rode  npm run seed  e  npm start.\n');
    }
    process.exit(1);
  }
})();
