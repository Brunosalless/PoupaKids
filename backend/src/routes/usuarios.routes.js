'use strict';

const { Router } = require('express');
const controller = require('../controllers/usuarios.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { atualizarSchema } = require('../validators/usuario.validator');

const router = Router();
router.use(authMiddleware);

router.get('/:id', controller.obter);
router.put('/:id', validate(atualizarSchema), controller.atualizar);
router.delete('/:id', controller.remover);

module.exports = router;
