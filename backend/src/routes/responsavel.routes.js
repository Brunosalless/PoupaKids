'use strict';

const { Router } = require('express');
const controller = require('../controllers/responsavel.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const responsavelOnly = require('../middlewares/responsavelOnly');

const router = Router();
router.use(authMiddleware, responsavelOnly);

router.get('/:id/filhos', controller.listarFilhos);
router.get('/:id/filho/:idFilho/resumo', controller.resumoFilho);

module.exports = router;
