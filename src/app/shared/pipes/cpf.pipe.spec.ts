import { CpfPipe } from './cpf.pipe';

describe('CpfPipe', () => {
  let pipe: CpfPipe;

  beforeEach(() => {
    pipe = new CpfPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform valid CPF', () => {
    it('should format valid CPF with all digits', () => {
      const result = pipe.transform('12345678901');
      expect(result).toBe('123.456.789-01');
    });

    it('should format valid CPF with dots and dashes', () => {
      const result = pipe.transform('123.456.789-01');
      expect(result).toBe('123.456.789-01');
    });

    it('should format valid CPF with only dots', () => {
      const result = pipe.transform('123.456.789.01');
      expect(result).toBe('123.456.789-01');
    });

    it('should format valid CPF with mixed formatting', () => {
      const result = pipe.transform('123-456-789-01');
      expect(result).toBe('123.456.789-01');
    });

    it('should format valid CPF with spaces', () => {
      const result = pipe.transform('123 456 789 01');
      expect(result).toBe('123.456.789-01');
    });

    it('should format valid CPF with mixed separators', () => {
      const result = pipe.transform('123.456-789 01');
      expect(result).toBe('123.456.789-01');
    });

    it('should format valid CPF starting with zero', () => {
      const result = pipe.transform('01234567890');
      expect(result).toBe('012.345.678-90');
    });

    it('should format valid CPF with all same digits', () => {
      const result = pipe.transform('11111111111');
      expect(result).toBe('111.111.111-11');
    });

    it('should format valid CPF with all zeros', () => {
      const result = pipe.transform('00000000000');
      expect(result).toBe('000.000.000-00');
    });
  });

  describe('transform invalid CPF', () => {
    it('should return null for empty string', () => {
      const result = pipe.transform('');
      expect(result).toBeNull();
    });

    it('should return null for CPF with less than 11 digits', () => {
      const result = pipe.transform('12345678');
      expect(result).toBeNull();
    });

    it('should return null for CPF with more than 11 digits', () => {
      const result = pipe.transform('123456789012');
      expect(result).toBeNull();
    });

    it('should return null for CPF with only letters', () => {
      const result = pipe.transform('abcdefghijk');
      expect(result).toBeNull();
    });

    it('should return null for CPF with mixed letters and numbers', () => {
      const result = pipe.transform('123abc456789');
      expect(result).toBeNull();
    });

    it('should return null for CPF with only special characters', () => {
      const result = pipe.transform('!@#$%^&*()');
      expect(result).toBeNull();
    });

    it('should return null for incomplete CPF with dots and dashes', () => {
      const result = pipe.transform('123.456-78');
      expect(result).toBeNull();
    });

    it('should return null for malformed CPF with extra numbers', () => {
      const result = pipe.transform('1234567890123');
      expect(result).toBeNull();
    });
  });

  describe('transform edge cases', () => {
    it('should handle null value', () => {
      const result = pipe.transform(null as any);
      expect(result).toBeNull();
    });

    it('should handle undefined value', () => {
      const result = pipe.transform(undefined as any);
      expect(result).toBeNull();
    });

    it('should handle string with only spaces', () => {
      const result = pipe.transform('           ');
      expect(result).toBeNull();
    });

    it('should handle string with tabs and newlines', () => {
      const result = pipe.transform('123\t456\n789\t01');
      expect(result).toBe('123.456.789-01');
    });

    it('should handle very long string with valid CPF pattern', () => {
      const result = pipe.transform('...123...456...789...01...');
      expect(result).toBe('123.456.789-01');
    });
  });

  describe('transform real-world scenarios', () => {
    it('should format CPF from form input with user formatting', () => {
      const result = pipe.transform('123.456.789-01');
      expect(result).toBe('123.456.789-01');
    });

    it('should format CPF from API response without formatting', () => {
      const result = pipe.transform('98765432100');
      expect(result).toBe('987.654.321-00');
    });

    it('should handle CPF with inconsistent formatting', () => {
      const result = pipe.transform('123-456.789 01');
      expect(result).toBe('123.456.789-01');
    });
  });

  describe('transform immutability', () => {
    it('should not modify the original input', () => {
      const input = '12345678901';
      const result = pipe.transform(input);
      expect(input).toBe('12345678901');
      expect(result).toBe('123.456.789-01');
    });

    it('should produce consistent results for same input', () => {
      const input = '123.456.789-01';
      const result1 = pipe.transform(input);
      const result2 = pipe.transform(input);
      expect(result1).toBe(result2);
    });
  });
});
