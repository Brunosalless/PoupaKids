const authService = require('../services/authService');

module.exports = {
  registrar: async (req, res) => res.status(201).json(await authService.registrarResponsavel(req.body)),
  login: async (req, res) => res.json(await authService.login(req.body?.email, req.body?.senha)),
  loginCrianca: async (req, res) => res.json(await authService.loginCrianca(req.body?.apelido, req.body?.pin)),
  me: async (req, res) => res.json(await authService.me(req.auth)),
};
