import { describe, it, expect } from 'vitest';
import { validateExpenseForm, hasErrors } from './validationUtils';
import { VALIDATION } from '../constants';

describe('validationUtils', () => {
  describe('validateExpenseForm', () => {
    it('should pass with valid data', () => {
      const data = {
        name: 'Tuna Cans',
        category: 'Food' as const,
        amount: 15.5,
      };
      const errors = validateExpenseForm(data);
      expect(errors).toEqual({});
      expect(hasErrors(errors)).toBe(false);
    });

    it('should catch invalid item names', () => {
      // Empty name
      expect(
        validateExpenseForm({ name: '', category: 'Food' as const, amount: 10 })
          .name,
      ).toBe('Item name is required.');
      // Spaces only
      expect(
        validateExpenseForm({
          name: '   ',
          category: 'Food' as const,
          amount: 10,
        }).name,
      ).toBe('Item name is required.');
      // Too long name
      const longName = 'a'.repeat(VALIDATION.NAME_MAX_LENGTH + 1);
      expect(
        validateExpenseForm({
          name: longName,
          category: 'Food' as const,
          amount: 10,
        }).name,
      ).toBe(
        `Item name must be ${VALIDATION.NAME_MAX_LENGTH} characters or fewer.`,
      );
    });

    it('should catch missing category', () => {
      expect(validateExpenseForm({ name: 'Tuna', amount: 10 }).category).toBe(
        'Please select a category.',
      );
    });

    it('should catch invalid amounts', () => {
      // Missing amount
      expect(
        validateExpenseForm({ name: 'Tuna', category: 'Food' as const }).amount,
      ).toBe('Amount is required.');
      // Less than minimum
      expect(
        validateExpenseForm({
          name: 'Tuna',
          category: 'Food' as const,
          amount: VALIDATION.AMOUNT_MIN - 0.01,
        }).amount,
      ).toBe(`Amount must be at least ${VALIDATION.AMOUNT_MIN}.`);
      // Greater than maximum
      expect(
        validateExpenseForm({
          name: 'Tuna',
          category: 'Food' as const,
          amount: VALIDATION.AMOUNT_MAX + 1,
        }).amount,
      ).toBe(
        `Amount must be no more than ${VALIDATION.AMOUNT_MAX.toLocaleString()}.`,
      );
    });
  });

  describe('hasErrors', () => {
    it('should return true if any field has a truthy value', () => {
      expect(hasErrors({ name: 'Required' })).toBe(true);
      expect(hasErrors({ category: 'Required' })).toBe(true);
      expect(hasErrors({ amount: 'Required' })).toBe(true);
    });

    it('should return false if all fields are empty', () => {
      expect(hasErrors({})).toBe(false);
      expect(
        hasErrors({ name: undefined, category: undefined, amount: undefined }),
      ).toBe(false);
      expect(hasErrors({ name: '', category: '', amount: '' })).toBe(false);
    });
  });
});
