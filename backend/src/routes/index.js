'use strict';

const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/usuarios', require('./usuarios.routes'));
router.use('/contas', require('./contas.routes'));
router.use('/transacoes', require('./transacoes.routes'));
router.use('/metas', require('./metas.routes'));
router.use('/gamificacao', require('./gamificacao.routes'));
router.use('/conteudos', require('./conteudos.routes'));
router.use('/responsavel', require('./responsavel.routes'));

router.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

module.exports = router;
