const usuarioService = require('../services/usuarioService');

module.exports = {
  criar: async (req, res) => res.status(201).json(await usuarioService.criarUsuario(req.auth, req.body)),
  listar: async (req, res) => res.json(await usuarioService.listarUsuarios(req.auth)),
  buscar: async (req, res) => res.json(await usuarioService.buscarUsuario(req.auth, req.params.id)),
  definirMesada: async (req, res) => res.json(await usuarioService.definirMesada(req.auth, req.params.id, req.body?.limite_mesada)),
  pagarMesada: async (req, res) => res.status(201).json(await usuarioService.pagarMesada(req.auth, req.params.id)),
};
