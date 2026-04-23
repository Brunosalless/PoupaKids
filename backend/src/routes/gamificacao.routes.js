'use strict';

const { Router } = require('express');
const controller = require('../controllers/gamificacao.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { pontosSchema } = require('../validators/gamificacao.validator');

const router = Router();
router.use(authMiddleware);

router.get('/:usuarioId', controller.obter);
router.post('/:usuarioId/pontos', validate(pontosSchema), controller.adicionarPontos);

module.exports = router;
