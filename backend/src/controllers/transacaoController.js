const transacaoService = require('../services/transacaoService');

module.exports = {
  registrar: async (req, res) => res.status(201).json(await transacaoService.registrarTransacao(req.auth, req.body)),
  listarPorConta: async (req, res) => res.json(await transacaoService.listarPorConta(req.auth, req.params.id_conta, { limite: req.query.limite })),
};
