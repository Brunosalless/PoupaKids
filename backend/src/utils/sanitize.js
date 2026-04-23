'use strict';

/**
 * Remove o campo senha_hash (e quaisquer sensíveis) de um objeto Sequelize
 * ou plain object antes de enviar na resposta.
 */
function sanitizeUser(user) {
  if (!user) return null;
  const plain = typeof user.get === 'function' ? user.get({ plain: true }) : { ...user };
  delete plain.senha_hash;
  return plain;
}

module.exports = { sanitizeUser };
