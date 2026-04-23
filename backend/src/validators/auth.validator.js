'use strict';

const Joi = require('joi');

const registerSchema = Joi.object({
  tipo: Joi.string().valid('usuario', 'responsavel').required(),
  nome: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().max(100).required(),
  senha: Joi.string().min(6).max(100).required(),
  data_nascimento: Joi.date().iso().when('tipo', {
    is: 'usuario',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  cpf: Joi.string().max(14).when('tipo', {
    is: 'responsavel',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  telefone: Joi.string().max(20).optional(),
  endereco: Joi.string().max(200).optional(),
  id_responsavel: Joi.number().integer().when('tipo', {
    is: 'usuario',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().required(),
  tipo: Joi.string().valid('usuario', 'responsavel').required(),
});

module.exports = { registerSchema, loginSchema };
