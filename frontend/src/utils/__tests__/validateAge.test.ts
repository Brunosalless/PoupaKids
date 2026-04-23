import { validateAge, calcularIdade } from '../validateAge';

describe('validateAge', () => {
  it('retorna true para criança de 10 anos', () => {
    const ano = new Date().getFullYear() - 10;
    expect(validateAge(`${ano}-01-01`)).toBe(true);
  });

  it('retorna false para maior de 18', () => {
    const ano = new Date().getFullYear() - 25;
    expect(validateAge(`${ano}-01-01`)).toBe(false);
  });

  it('retorna false para data inválida', () => {
    expect(validateAge('data-invalida')).toBe(false);
  });

  it('calcularIdade retorna idade correta', () => {
    const ano = new Date().getFullYear() - 8;
    expect(calcularIdade(`${ano}-01-01`)).toBeGreaterThanOrEqual(7);
    expect(calcularIdade(`${ano}-01-01`)).toBeLessThanOrEqual(8);
  });
});
