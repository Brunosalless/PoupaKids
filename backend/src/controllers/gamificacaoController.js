const gamificacaoService = require('../services/gamificacaoService');
const painelService = require('../services/painelService');

module.exports = {
  obter: async (req, res) => res.json(await gamificacaoService.obter(req.auth, req.params.id_usuario)),
  painel: async (req, res) => res.json(await painelService.resumoResponsavel(req.auth)),
};
