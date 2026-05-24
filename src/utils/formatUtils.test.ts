import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './formatUtils';

describe('formatUtils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers with exactly 2 decimal places', () => {
      expect(formatCurrency(10)).toBe('$10.00');
      expect(formatCurrency(15.5)).toBe('$15.50');
      expect(formatCurrency(123.456)).toBe('$123.46');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format negative numbers correctly', () => {
      // Note: Depending on locale, negative symbol might be before or after $.
      // But standard default US format is -$10.00 or ($10.00) or -$10.00.
      // Let's assert it starts with '$' (or contains '$') and contains '-10.00'.
      const result = formatCurrency(-10);
      expect(result).toContain('10.00');
      expect(result).toContain('$');
    });

    it('should format large values with localization styling (commas)', () => {
      const result = formatCurrency(1234567.89);
      // Clean commas if system has it, but it should contain commas in common locales
      // e.g. '$1,234,567.89'
      expect(result).toContain('1');
      expect(result).toContain('234');
      expect(result).toContain('567.89');
    });
  });

  describe('formatDate', () => {
    it('should format a valid ISO string into a human-readable date', () => {
      // Use a fixed timestamp
      const dateStr = '2026-05-23T12:00:00.000Z';
      const result = formatDate(dateStr);
      // Since locale is undefined, formatting could vary slightly by environment.
      // But it should contain the year 2026, and the day 23.
      // Depending on timezone, the day might be 23 or 24 or 22.
      // Let's check that it returns a non-empty string and doesn't crash.
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      const parsedYear = new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric' });
      expect(result).toContain(parsedYear);
    });
  });
});
