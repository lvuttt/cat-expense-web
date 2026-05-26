/**
 * csvUtils — Pure CSV export utilities.
 *
 * Single Responsibility: converts expense data to a properly escaped CSV string
 * and triggers a browser file download.
 *
 * CSV escaping rules (RFC 4180):
 *   - Fields containing commas, double quotes, or newlines are wrapped in double quotes.
 *   - Double quotes inside quoted fields are escaped by doubling them ("").
 */

import type { Expense } from '../types/models';
import { formatCurrency, formatDate } from './formatUtils';

/**
 * Wraps a field in double quotes and escapes any existing double quotes.
 * Applied conditionally — only when the field value requires quoting.
 */
export const csvQuote = (value: string): string => {
  const needsQuoting =
    value.includes('"') || value.includes(',') || value.includes('\n');
  if (!needsQuoting) return value;
  return `"${value.replace(/"/g, '""')}"`;
};

/**
 * Converts an array of Expense objects to a complete CSV string.
 * Includes a header row and one data row per expense.
 */
export const expensesToCsv = (expenses: Expense[]): string => {
  const headers = ['Name', 'Category', 'Amount', 'Date'];
  const rows = expenses.map((e) => [
    csvQuote(e.name),
    csvQuote(e.category),
    csvQuote(formatCurrency(e.amount)),
    csvQuote(formatDate(e.createdAt)),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
};

/**
 * Triggers a browser file download for the CSV content.
 * Creates and auto-clicks a temporary anchor element.
 */
export const downloadCsv = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Main entry point: converts expenses to CSV and initiates download.
 * Generates a timestamped filename.
 */
export const exportExpensesToCsv = (expenses: Expense[]): void => {
  const csv = expensesToCsv(expenses);
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  downloadCsv(csv, `cat-expenses-${date}.csv`);
};
