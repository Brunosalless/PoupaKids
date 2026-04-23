'use strict';

const { Router } = require('express');
const controller = require('../controllers/transacoes.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { criarSchema } = require('../validators/transacao.validator');

const router = Router();
router.use(authMiddleware);

router.post('/', validate(criarSchema), controller.criar);
router.get('/:contaId', controller.listar);

module.exports = router;
