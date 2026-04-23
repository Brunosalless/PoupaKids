'use strict';

require('../setup');

const authMiddleware = require('../../src/middlewares/authMiddleware');
const { signToken } = require('../../src/utils/jwt');

describe('authMiddleware', () => {
  it('injeta req.user quando token é válido', () => {
    const token = signToken({ id: 1, tipo: 'usuario', email: 'a@a.com' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    authMiddleware(req, {}, next);

    expect(req.user).toEqual(expect.objectContaining({ id: 1, tipo: 'usuario' }));
    expect(next).toHaveBeenCalledWith();
  });

  it('rejeita quando header ausente', () => {
    const req = { headers: {} };
    const next = jest.fn();
    authMiddleware(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('rejeita token inválido', () => {
    const req = { headers: { authorization: 'Bearer xpto' } };
    const next = jest.fn();
    authMiddleware(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});
