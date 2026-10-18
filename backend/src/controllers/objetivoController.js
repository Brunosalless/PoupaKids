const objetivoService = require('../services/objetivoService');

module.exports = {
  criar: async (req, res) => res.status(201).json(await objetivoService.criarObjetivo(req.auth, req.body)),
  listar: async (req, res) => res.json(await objetivoService.listarObjetivos(req.auth, req.params.id_usuario)),
  adicionar: async (req, res) => res.json(await objetivoService.adicionarValorObjetivo(req.auth, req.params.id, req.body?.valor)),
};
