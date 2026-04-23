'use strict';

const { Router } = require('express');
const controller = require('../controllers/metas.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { criarSchema, atualizarSchema } = require('../validators/meta.validator');

const router = Router();
router.use(authMiddleware);

router.get('/:usuarioId', controller.listar);
router.post('/', validate(criarSchema), controller.criar);
router.put('/:id', validate(atualizarSchema), controller.atualizar);
router.delete('/:id', controller.remover);

module.exports = router;
