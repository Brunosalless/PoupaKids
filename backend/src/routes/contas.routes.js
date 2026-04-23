'use strict';

const { Router } = require('express');
const controller = require('../controllers/contas.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();
router.use(authMiddleware);

router.get('/usuario/:idUsuario', controller.obterPorUsuario);
router.get('/:id', controller.obter);

module.exports = router;
