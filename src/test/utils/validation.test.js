import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateRequired,
  sanitizeInput,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('rejects invalid email', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('requires email to be provided', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates password with minimum length', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
    });

    it('rejects password that is too short', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
    });

    it('requires password to be provided', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateName', () => {
    it('validates correct name', () => {
      const result = validateName('John Doe');
      expect(result.isValid).toBe(true);
    });

    it('rejects name that is too short', () => {
      const result = validateName('A');
      expect(result.isValid).toBe(false);
    });

    it('requires name to be provided', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('sanitizes HTML tags', () => {
      const result = sanitizeInput('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('handles non-string input', () => {
      const result = sanitizeInput(123);
      expect(result).toBe(123);
    });
  });
});
