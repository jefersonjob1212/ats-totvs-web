import { TelefonePipe } from './telefone.pipe';

describe('TelefonePipe', () => {
  let pipe: TelefonePipe;

  beforeEach(() => {
    pipe = new TelefonePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform valid phone numbers with 10 digits', () => {
    it('should format phone with 10 digits (landline)', () => {
      const result = pipe.transform('1133334444');
      expect(result).toBe('(11) 3333-4444');
    });

    it('should format phone with dots and dashes', () => {
      const result = pipe.transform('(11) 3333-4444');
      expect(result).toBe('(11) 3333-4444');
    });

    it('should format phone with spaces', () => {
      const result = pipe.transform('11 3333 4444');
      expect(result).toBe('(11) 3333-4444');
    });

    it('should format phone with mixed separators', () => {
      const result = pipe.transform('11-3333.4444');
      expect(result).toBe('(11) 3333-4444');
    });

    it('should format phone starting with zero area code', () => {
      const result = pipe.transform('0133334444');
      expect(result).toBe('(01) 3333-4444');
    });

    it('should format phone with all same digits (10 digits)', () => {
      const result = pipe.transform('1111111111');
      expect(result).toBe('(11) 1111-1111');
    });

    it('should format phone with all zeros (10 digits)', () => {
      const result = pipe.transform('0000000000');
      expect(result).toBe('(00) 0000-0000');
    });

    it('should format phone from API without formatting', () => {
      const result = pipe.transform('2133334444');
      expect(result).toBe('(21) 3333-4444');
    });
  });

  describe('transform valid phone numbers with 11 digits (mobile)', () => {
    it('should format phone with 11 digits (mobile)', () => {
      const result = pipe.transform('11999994444');
      expect(result).toBe('(11) 99999-4444');
    });

    it('should format mobile phone with dots and dashes', () => {
      const result = pipe.transform('(11) 99999-4444');
      expect(result).toBe('(11) 99999-4444');
    });

    it('should format mobile phone with spaces', () => {
      const result = pipe.transform('11 99999 4444');
      expect(result).toBe('(11) 99999-4444');
    });

    it('should format mobile phone with mixed separators', () => {
      const result = pipe.transform('11-99999.4444');
      expect(result).toBe('(11) 99999-4444');
    });

    it('should format mobile phone starting with zero area code', () => {
      const result = pipe.transform('01999994444');
      expect(result).toBe('(01) 99999-4444');
    });

    it('should format mobile phone with all same digits (11 digits)', () => {
      const result = pipe.transform('11111111111');
      expect(result).toBe('(11) 11111-1111');
    });

    it('should format mobile phone from API without formatting', () => {
      const result = pipe.transform('21987654321');
      expect(result).toBe('(21) 98765-4321');
    });
  });

  describe('transform invalid phone numbers', () => {
    it('should return null for empty string', () => {
      const result = pipe.transform('');
      expect(result).toBeNull();
    });

    it('should return null for phone with less than 10 digits', () => {
      const result = pipe.transform('1133334');
      expect(result).toBeNull();
    });

    it('should return null for phone with 9 digits', () => {
      const result = pipe.transform('113333444');
      expect(result).toBeNull();
    });

    it('should return null for phone with 12 digits', () => {
      const result = pipe.transform('119999944441');
      expect(result).toBeNull();
    });

    it('should return null for phone with more than 11 digits', () => {
      const result = pipe.transform('119999944441234');
      expect(result).toBeNull();
    });

    it('should return null for phone with only letters', () => {
      const result = pipe.transform('abcdefghijk');
      expect(result).toBeNull();
    });

    it('should return null for phone with mixed letters and numbers', () => {
      const result = pipe.transform('abc11999994def');
      expect(result).toBeNull();
    });

    it('should return null for phone with only special characters', () => {
      const result = pipe.transform('!@#$%^&*()');
      expect(result).toBeNull();
    });

    it('should return null for incomplete phone with dashes', () => {
      const result = pipe.transform('(11) 3333');
      expect(result).toBeNull();
    });

    it('should return null for phone formatted incorrectly', () => {
      const result = pipe.transform('113-333-4');
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
      const result = pipe.transform('11\t9999\n94444');
      expect(result).toBe('(11) 99999-4444');
    });

    it('should handle very long string with valid phone pattern', () => {
      const result = pipe.transform('...11...99999...4444...');
      expect(result).toBe('(11) 99999-4444');
    });

    it('should extract phone from string with extra numbers (10 digits pattern)', () => {
      const result = pipe.transform('Tel: 1133334444 ext 123');
      // Removes all non-digits: Tel1133334444ext123 -> 1133334444123 (13 digits) -> null
      expect(result).toBeNull();
    });
  });

  describe('transform real-world scenarios', () => {
    it('should format phone from form input with user formatting', () => {
      const result = pipe.transform('(11) 3333-4444');
      expect(result).toBe('(11) 3333-4444');
    });

    it('should format phone from API response without formatting', () => {
      const result = pipe.transform('1133334444');
      expect(result).toBe('(11) 3333-4444');
    });

    it('should format mobile phone from API response without formatting', () => {
      const result = pipe.transform('11999994444');
      expect(result).toBe('(11) 99999-4444');
    });

    it('should handle phone with inconsistent formatting', () => {
      const result = pipe.transform('11-3333.4444');
      expect(result).toBe('(11) 3333-4444');
    });

    it('should format São Paulo landline', () => {
      const result = pipe.transform('1138879999');
      expect(result).toBe('(11) 3887-9999');
    });

    it('should format São Paulo mobile', () => {
      const result = pipe.transform('11987654321');
      expect(result).toBe('(11) 98765-4321');
    });

    it('should format Rio de Janeiro landline', () => {
      const result = pipe.transform('2133334444');
      expect(result).toBe('(21) 3333-4444');
    });

    it('should format Rio de Janeiro mobile', () => {
      const result = pipe.transform('21987654321');
      expect(result).toBe('(21) 98765-4321');
    });

    it('should format Belo Horizonte landline', () => {
      const result = pipe.transform('3133334444');
      expect(result).toBe('(31) 3333-4444');
    });

    it('should format Brasília mobile', () => {
      const result = pipe.transform('61999887766');
      expect(result).toBe('(61) 99988-7766');
    });
  });

  describe('transform immutability', () => {
    it('should not modify the original input', () => {
      const input = '1133334444';
      const result = pipe.transform(input);
      expect(input).toBe('1133334444');
      expect(result).toBe('(11) 3333-4444');
    });

    it('should produce consistent results for same input', () => {
      const input = '11999994444';
      const result1 = pipe.transform(input);
      const result2 = pipe.transform(input);
      expect(result1).toBe(result2);
    });

    it('should produce consistent results for formatted input', () => {
      const input = '(11) 99999-4444';
      const result1 = pipe.transform(input);
      const result2 = pipe.transform(input);
      expect(result1).toBe(result2);
    });
  });

  describe('transform boundary cases', () => {
    it('should handle phone with exactly 10 digits', () => {
      const result = pipe.transform('1234567890');
      expect(result).toBe('(12) 3456-7890');
    });

    it('should handle phone with exactly 11 digits', () => {
      const result = pipe.transform('12345678901');
      expect(result).toBe('(12) 34567-8901');
    });

    it('should format phone with maximum valid area code', () => {
      const result = pipe.transform('9933334444');
      expect(result).toBe('(99) 3333-4444');
    });

    it('should format mobile phone with maximum valid area code', () => {
      const result = pipe.transform('99999994444');
      expect(result).toBe('(99) 99999-4444');
    });
  });
});
