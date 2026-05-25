import type { CategoryMeta } from '../types';

/**
 * Immutable array of all available expense categories.
 * This is the single source of truth — the Category type is derived from it.
 * To add a new category: add it here + add its config entry in CATEGORY_CONFIG.
 * Open/Closed Principle: no component logic needs to change.
 */
export const CATEGORIES = ['Food', 'Furniture', 'Accessory'] as const;

/**
 * Display metadata for each category.
 * Maps category values to their labels, emoji icons, and CSS class modifiers.
 */
export const CATEGORY_CONFIG: Record<
  (typeof CATEGORIES)[number],
  CategoryMeta
> = {
  Food: {
    label: 'Food',
    emoji: '🍕',
    cssClass: 'food',
  },
  Furniture: {
    label: 'Furniture',
    emoji: '🛋️',
    cssClass: 'furniture',
  },
  Accessory: {
    label: 'Accessory',
    emoji: '✨',
    cssClass: 'accessory',
  },
} as const;
