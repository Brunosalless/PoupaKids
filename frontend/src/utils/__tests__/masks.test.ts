import {
  maskCPF,
  maskPhone,
  maskDate,
  brDateToISO,
  isValidCPF,
  isValidPhone,
  isValidBRDate,
  onlyDigits,
} from '../masks';

describe('masks', () => {
  describe('maskCPF', () => {
    it('formata progressivamente', () => {
      expect(maskCPF('123')).toBe('123');
      expect(maskCPF('1234')).toBe('123.4');
      expect(maskCPF('1234567')).toBe('123.456.7');
      expect(maskCPF('12345678900')).toBe('123.456.789-00');
    });

    it('trunca em 11 dígitos', () => {
      expect(maskCPF('123456789001234')).toBe('123.456.789-00');
    });

    it('ignora caracteres não numéricos', () => {
      expect(maskCPF('abc123.def456')).toBe('123.456');
    });
  });

  describe('maskPhone', () => {
    it('formata celular (11 dígitos)', () => {
      expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
    });

    it('formata fixo (10 dígitos)', () => {
      expect(maskPhone('1123456789')).toBe('(11) 2345-6789');
    });
  });

  describe('maskDate', () => {
    it('formata DD/MM/AAAA', () => {
      expect(maskDate('01012020')).toBe('01/01/2020');
      expect(maskDate('1')).toBe('1');
      expect(maskDate('12')).toBe('12');
      expect(maskDate('123')).toBe('12/3');
    });
  });

  describe('brDateToISO', () => {
    it('converte data BR para ISO', () => {
      expect(brDateToISO('15/04/2016')).toBe('2016-04-15');
    });

    it('retorna vazio para data incompleta', () => {
      expect(brDateToISO('15/04')).toBe('');
    });

    it('retorna vazio para data impossível', () => {
      expect(brDateToISO('32/01/2020')).toBe('');
    });
  });

  describe('isValidCPF', () => {
    it('aceita CPF válido', () => {
      expect(isValidCPF('529.982.247-25')).toBe(true);
    });

    it('rejeita CPF com todos os dígitos iguais', () => {
      expect(isValidCPF('111.111.111-11')).toBe(false);
    });

    it('rejeita CPF com menos de 11 dígitos', () => {
      expect(isValidCPF('123')).toBe(false);
    });

    it('rejeita dígitos verificadores errados', () => {
      expect(isValidCPF('123.456.789-00')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('aceita fixo e celular', () => {
      expect(isValidPhone('(11) 2345-6789')).toBe(true);
      expect(isValidPhone('(11) 98765-4321')).toBe(true);
    });

    it('rejeita tamanhos incorretos', () => {
      expect(isValidPhone('123')).toBe(false);
    });
  });

  describe('isValidBRDate', () => {
    it('aceita data válida', () => {
      expect(isValidBRDate('15/04/2016')).toBe(true);
    });

    it('rejeita data no futuro', () => {
      expect(isValidBRDate('01/01/2999')).toBe(false);
    });

    it('rejeita data inválida', () => {
      expect(isValidBRDate('32/01/2020')).toBe(false);
    });
  });

  describe('onlyDigits', () => {
    it('remove todos os não-dígitos', () => {
      expect(onlyDigits('(11) 98765-4321')).toBe('11987654321');
    });
  });
});
