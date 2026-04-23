'use strict';

const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function bootstrap() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log(`[db] Conectado ao MySQL em ${env.db.host}:${env.db.port}/${env.db.name}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] Falha ao conectar:', err.message);
  }

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] PoupaKids rodando em http://localhost:${env.port}/api (${env.nodeEnv})`);
  });
}

bootstrap();
