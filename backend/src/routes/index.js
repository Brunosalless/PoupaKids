// Definição dos endpoints REST, agrupados por recurso. Todas as rotas, exceto /health e /auth
// (registro/login), exigem o token JWT (middleware autenticar).
const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const h = require('../utils/asyncHandler');
const { autenticar, exigirPerfil } = require('../middlewares/autenticar');
const auth = require('../controllers/authController');
const usuarios = require('../controllers/usuarioController');
const transacoes = require('../controllers/transacaoController');
const objetivos = require('../controllers/objetivoController');
const conteudos = require('../controllers/conteudoController');
const gamificacao = require('../controllers/gamificacaoController');

const router = Router();
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000, limit: process.env.NODE_ENV === 'test' ? 1000 : 30,
  standardHeaders: 'draft-7', legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Aguarde alguns minutos.', codigo: 'LIMITE_TENTATIVAS' },
});

router.get('/health', (_req, res) => res.json({ status: 'ok', servico: 'poupakids-api', versao: '2.1.0' }));

// Autenticação
router.post('/auth/registrar', limiteLogin, h(auth.registrar));
router.post('/auth/login', limiteLogin, h(auth.login));
router.post('/auth/login-crianca', limiteLogin, h(auth.loginCrianca));
router.get('/auth/me', autenticar, h(auth.me));

// Usuários (crianças)
router.get('/usuarios', autenticar, exigirPerfil('RESPONSAVEL'), h(usuarios.listar));
router.post('/usuarios', autenticar, exigirPerfil('RESPONSAVEL'), h(usuarios.criar));
router.get('/usuarios/:id', autenticar, h(usuarios.buscar));
router.patch('/usuarios/:id/mesada', autenticar, exigirPerfil('RESPONSAVEL'), h(usuarios.definirMesada));
router.post('/usuarios/:id/mesada/pagar', autenticar, exigirPerfil('RESPONSAVEL'), h(usuarios.pagarMesada));

// Transações
router.post('/transacoes', autenticar, h(transacoes.registrar));
router.get('/transacoes/conta/:id_conta', autenticar, h(transacoes.listarPorConta));

// Objetivos (metas / cofrinhos)
router.post('/objetivos', autenticar, h(objetivos.criar));
router.get('/objetivos/usuario/:id_usuario', autenticar, h(objetivos.listar));
router.patch('/objetivos/:id/adicionar', autenticar, h(objetivos.adicionar));

// Educação financeira
router.get('/conteudos', autenticar, h(conteudos.listar));
router.post('/conteudos/:id/concluir', autenticar, exigirPerfil('CRIANCA'), h(conteudos.concluir));

// Gamificação e painel
router.get('/gamificacao/:id_usuario', autenticar, h(gamificacao.obter));
router.get('/painel/responsavel', autenticar, exigirPerfil('RESPONSAVEL'), h(gamificacao.painel));

module.exports = router;
