const conteudoService = require('../services/conteudoService');

module.exports = {
  listar: async (req, res) => res.json(await conteudoService.listar(req.auth, { nivel: req.query.nivel, id_usuario: req.query.id_usuario })),
  concluir: async (req, res) => res.json(await conteudoService.concluir(req.auth, req.params.id)),
};
