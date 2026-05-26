/**
 * Formatting utilities — pure display logic.
 */

/**
 * Formats a number as a currency string.
 * Uses the user's locale for number formatting with exactly 2 decimal places.
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats an ISO date string into a short, human-readable format.
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
