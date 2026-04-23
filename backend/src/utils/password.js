'use strict';

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/** Gera hash bcrypt da senha em texto plano. */
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Compara senha em texto com o hash armazenado. */
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };
