import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Expense } from '../types/models';
import {
  csvQuote,
  expensesToCsv,
  exportExpensesToCsv,
  downloadCsv,
} from './csvUtils';

const sampleExpenses: Expense[] = [
  {
    id: '1',
    name: 'Premium Kibble',
    category: 'Food',
    amount: 25.5,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Cat Tree',
    category: 'Furniture',
    amount: 149.99,
    createdAt: '2026-02-20T14:00:00Z',
  },
  {
    id: '3',
    name: 'Collar, with bell',
    category: 'Accessory',
    amount: 9.99,
    createdAt: '2026-03-10T09:00:00Z',
  },
  {
    id: '4',
    name: 'He said "meow"',
    category: 'Food',
    amount: 5.0,
    createdAt: '2026-04-01T08:00:00Z',
  },
];

describe('csvUtils', () => {
  describe('csvQuote', () => {
    it('should return a plain value unchanged when no quoting is needed', () => {
      expect(csvQuote('Normal Value')).toBe('Normal Value');
    });

    it('should wrap a value in double quotes when it contains a comma', () => {
      expect(csvQuote('Hello, World')).toBe('"Hello, World"');
    });

    it('should wrap in double quotes and escape existing double quotes', () => {
      expect(csvQuote('He said "meow"')).toBe('"He said ""meow"""');
    });

    it('should wrap in double quotes when the value contains a newline', () => {
      expect(csvQuote('Line1\nLine2')).toBe('"Line1\nLine2"');
    });

    it('should not wrap an empty string', () => {
      expect(csvQuote('')).toBe('');
    });
  });

  describe('expensesToCsv', () => {
    it('should produce a CSV with a header row and one data row per expense', () => {
      const csv = expensesToCsv(sampleExpenses);
      const lines = csv.split('\r\n');
      // header + 4 data rows
      expect(lines).toHaveLength(5);
      expect(lines[0]).toBe('Name,Category,Amount,Date');
    });

    it('should correctly quote fields containing commas', () => {
      const csv = expensesToCsv(sampleExpenses);
      expect(csv).toContain('"Collar, with bell"');
    });

    it('should correctly escape double quotes inside field values', () => {
      const csv = expensesToCsv(sampleExpenses);
      expect(csv).toContain('"He said ""meow"""');
    });

    it('should produce only a header row for an empty expense list', () => {
      const csv = expensesToCsv([]);
      expect(csv.trim()).toBe('Name,Category,Amount,Date');
    });
  });

  describe('downloadCsv', () => {
    let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let appendChildSpy: ReturnType<typeof vi.spyOn>;
    let removeChildSpy: ReturnType<typeof vi.spyOn>;
    let clickSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      createObjectURLSpy = vi
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:test-url');
      revokeObjectURLSpy = vi
        .spyOn(URL, 'revokeObjectURL')
        .mockImplementation(() => {});
      clickSpy = vi.fn();

      const mockAnchor = {
        href: '',
        setAttribute: vi.fn(),
        click: clickSpy,
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => mockAnchor);
      removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => mockAnchor);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create an object URL, click the link, and revoke the URL', () => {
      downloadCsv('col1,col2\r\nval1,val2', 'test.csv');
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      expect(removeChildSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('exportExpensesToCsv', () => {
    beforeEach(() => {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const mockAnchor = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
      } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockAnchor,
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockAnchor,
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should trigger a download without throwing', () => {
      expect(() => exportExpensesToCsv(sampleExpenses)).not.toThrow();
    });

    it('should trigger a download with a CSV-formatted filename containing the current date', () => {
      const setAttributeSpy = vi.fn();
      const mockAnchor = {
        href: '',
        setAttribute: setAttributeSpy,
        click: vi.fn(),
      } as unknown as HTMLAnchorElement;
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

      exportExpensesToCsv(sampleExpenses);

      // The filename should match "cat-expenses-YYYY-MM-DD.csv"
      const call = setAttributeSpy.mock.calls.find(
        ([attr]) => attr === 'download',
      );
      expect(call).toBeDefined();
      expect(call![1]).toMatch(/^cat-expenses-\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });
});
