'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Assina um JWT com o payload do usuário/responsável.
 * @param {{ id: number, tipo: 'usuario'|'responsavel', email: string }} payload
 * @returns {string}
 */
function signToken(payload) {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

/**
 * Verifica um token JWT e devolve o payload decodificado.
 * @param {string} token
 */
function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret);
}

module.exports = { signToken, verifyToken };
