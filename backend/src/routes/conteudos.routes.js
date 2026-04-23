'use strict';

const { Router } = require('express');
const controller = require('../controllers/conteudos.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();
router.use(authMiddleware);

router.get('/', controller.listar);

module.exports = router;
