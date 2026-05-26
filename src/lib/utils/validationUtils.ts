/**
 * Form validation utilities — Single Responsibility Principle.
 * Validation logic is extracted from components into pure functions.
 */

import type { ExpenseFormData } from '../types/models';
import { VALIDATION } from '../constants/app';

/**
 * Map of field names to their validation error messages.
 * Undefined means no error for that field.
 */
export interface ValidationErrors {
  name?: string;
  category?: string;
  amount?: string;
}

/**
 * Validates expense form data and returns any errors found.
 * Returns an empty-ish object (no truthy values) when valid.
 */
export const validateExpenseForm = (
  data: Partial<ExpenseFormData>,
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Name validation
  const trimmedName = (data.name ?? '').trim();
  if (trimmedName.length < VALIDATION.NAME_MIN_LENGTH) {
    errors.name = 'Item name is required.';
  } else if (trimmedName.length > VALIDATION.NAME_MAX_LENGTH) {
    errors.name = `Item name must be ${VALIDATION.NAME_MAX_LENGTH} characters or fewer.`;
  }

  // Category validation
  if (!data.category) {
    errors.category = 'Please select a category.';
  }

  // Amount validation
  if (data.amount === undefined || data.amount === null) {
    errors.amount = 'Amount is required.';
  } else if (isNaN(Number(data.amount))) {
    errors.amount = 'Amount must be a valid number.';
  } else if (Number(data.amount) < VALIDATION.AMOUNT_MIN) {
    errors.amount = `Amount must be at least ${VALIDATION.AMOUNT_MIN}.`;
  } else if (Number(data.amount) > VALIDATION.AMOUNT_MAX) {
    errors.amount = `Amount must be no more than ${VALIDATION.AMOUNT_MAX.toLocaleString()}.`;
  }

  return errors;
};

/**
 * Returns true if the validation errors object contains any errors.
 */
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.values(errors).some(Boolean);
};
