// Aplicação Express: middlewares globais, rotas /api e, em produção,
// os arquivos estáticos do frontend (frontend/dist) servidos na mesma origem.
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler, naoEncontrado } = require('./middlewares/errorHandler');

const app = express();

const origens = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: origens, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '100kb' }));
app.disable('x-powered-by');

app.use('/api', routes);
app.use('/api', naoEncontrado);

const dist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(errorHandler);

module.exports = app;
