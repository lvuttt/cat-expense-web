/**
 * ExpenseDialog — Modal dialog for adding/editing expenses.
 *
 * SRP: handles dialog rendering and form UI.
 * Delegates validation to validationUtils (no business logic here).
 * Delegates cat fact fetching to useCatFact hook.
 * Uses discriminated union DialogMode for type-safe add/edit handling.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ExpenseFormData, Category, DialogMode } from '../../types';
import { CATEGORIES, CATEGORY_CONFIG } from '../../constants';
import { useCatFact } from '../../hooks/useCatFact';
import {
  validateExpenseForm,
  hasErrors,
  type ValidationErrors,
} from '../../utils/validationUtils';
import './ExpenseDialog.css';

interface ExpenseDialogProps {
  readonly isOpen: boolean;
  readonly mode: DialogMode;
  readonly onClose: () => void;
  readonly onSubmit: (data: ExpenseFormData) => void;
}

/** Extracts initial form values based on dialog mode. */
function getInitialValues(mode: DialogMode): {
  name: string;
  category: Category | '';
  amount: string;
} {
  if (mode.type === 'edit') {
    return {
      name: mode.expense.name,
      category: mode.expense.category,
      amount: String(mode.expense.amount),
    };
  }
  return { name: '', category: '', amount: '' };
}

export function ExpenseDialog({
  isOpen,
  mode,
  onClose,
  onSubmit,
}: ExpenseDialogProps) {
  const { fact, isLoading: isFactLoading, refetch: refetchFact } = useCatFact();

  const initialValues = getInitialValues(mode);
  const [name, setName] = useState(initialValues.name);
  const [category, setCategory] = useState<Category | ''>(initialValues.category);
  const [amount, setAmount] = useState(initialValues.amount);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [viewportStyle, setViewportStyle] = useState<React.CSSProperties>({});
  const [contentMaxHeight, setContentMaxHeight] = useState<string>('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Monitor visual viewport height on mobile to shrink dialog overlay and content when keyboard is active
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const visualViewport = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!isOpen || !visualViewport) {
      setViewportStyle({});
      setContentMaxHeight('');
      return;
    }

    const handleResize = () => {
      // On mobile viewports (< 500px wide)
      if (window.innerWidth < 500) {
        setViewportStyle({
          position: 'fixed',
          top: `${visualViewport.offsetTop}px`,
          left: `${visualViewport.offsetLeft}px`,
          height: `${visualViewport.height}px`,
          width: `${visualViewport.width}px`,
          alignItems: 'flex-end',
          padding: 0,
        });
        // Limit dialog content height to viewport height minus top gap
        setContentMaxHeight(`${visualViewport.height - 16}px`);
      } else {
        setViewportStyle({});
        setContentMaxHeight('');
      }
    };

    visualViewport.addEventListener('resize', handleResize);
    visualViewport.addEventListener('scroll', handleResize);

    handleResize();

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Reset form state when dialog opens or mode changes
  useEffect(() => {
    if (isOpen) {
      const values = getInitialValues(mode);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(values.name);
      setCategory(values.category);
      setAmount(values.amount);
      setErrors({});
      setHasSubmitted(false);
      refetchFact();

      // Focus the first input after mount
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    }
  }, [isOpen, mode, refetchFact]);

  // Close on Escape and trap Tab focus within the dialog
  useEffect(() => {
    if (!isOpen) return;

    const FOCUSABLE_SELECTOR =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && contentRef.current) {
        const focusable = Array.from(
          contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => !el.hasAttribute('disabled'));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: wrap backward from first to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: wrap forward from last to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      // Close only if clicking the overlay itself, not the content
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setHasSubmitted(true);

      const formData: Partial<ExpenseFormData> = {
        name: name.trim(),
        category: category || undefined,
        amount: amount ? Number(amount) : undefined,
      };

      const validationErrors = validateExpenseForm(formData);

      if (hasErrors(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      onSubmit({
        name: name.trim(),
        category: category as Category,
        amount: Number(amount),
      });
    },
    [name, category, amount, onSubmit],
  );

  // Live validation after first submit attempt
  useEffect(() => {
    if (!hasSubmitted) return;

    const formData: Partial<ExpenseFormData> = {
      name: name.trim(),
      category: category || undefined,
      amount: amount ? Number(amount) : undefined,
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors(validateExpenseForm(formData));
  }, [name, category, amount, hasSubmitted]);

  if (!isOpen) return null;

  const isEditMode = mode.type === 'edit';
  const title = isEditMode ? 'Edit Expense' : 'Add Expense';
  const submitLabel = isEditMode ? 'Update' : 'Submit';

  const catFactClasses = [
    'expense-dialog__cat-fact',
    isFactLoading ? 'expense-dialog__cat-fact--loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="expense-dialog__overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      id="expense-dialog"
      style={viewportStyle}
    >
      <div
        className="expense-dialog__content"
        ref={contentRef}
        style={contentMaxHeight ? { maxHeight: contentMaxHeight } : undefined}
      >
        {/* Header */}
        <div className="expense-dialog__header">
          <h2 className="expense-dialog__title">{title}</h2>
          <button
            className="expense-dialog__close"
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            id="dialog-close-button"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body containing form and fact panel */}
        <div className="expense-dialog__body">
          {/* Form */}
          <form
            className="expense-dialog__form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Item Name */}
            <div
              className={`expense-dialog__field ${errors.name ? 'expense-dialog__field--error' : ''
                }`}
            >
              <label
                className="expense-dialog__label expense-dialog__label--required"
                htmlFor="expense-name"
              >
                Item Name
              </label>
              <input
                className="expense-dialog__input"
                id="expense-name"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Premium Cat Food"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'expense-name-error' : undefined}
                autoComplete="off"
              />
              {errors.name && (
                <p className="expense-dialog__error-message" id="expense-name-error" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div
              className={`expense-dialog__field ${errors.category ? 'expense-dialog__field--error' : ''
                }`}
            >
              <label
                className="expense-dialog__label expense-dialog__label--required"
                htmlFor="expense-category"
              >
                Category
              </label>
              <select
                className="expense-dialog__select"
                id="expense-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                aria-invalid={!!errors.category}
                aria-describedby={
                  errors.category ? 'expense-category-error' : undefined
                }
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p
                  className="expense-dialog__error-message"
                  id="expense-category-error"
                  role="alert"
                >
                  {errors.category}
                </p>
              )}
            </div>

            {/* Amount */}
            <div
              className={`expense-dialog__field ${errors.amount ? 'expense-dialog__field--error' : ''
                }`}
            >
              <label
                className="expense-dialog__label expense-dialog__label--required"
                htmlFor="expense-amount"
              >
                Amount ($)
              </label>
              <input
                className="expense-dialog__input"
                id="expense-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow: empty string, digits, optional single decimal, max 2 decimal places
                  // Silently ignore anything that doesn't match
                  if (/^\d*\.?\d{0,2}$/.test(val)) {
                    setAmount(val);
                  }
                }}
                placeholder="0.00"
                aria-invalid={!!errors.amount}
                aria-describedby={
                  errors.amount ? 'expense-amount-error' : undefined
                }
              />
              {errors.amount && (
                <p
                  className="expense-dialog__error-message"
                  id="expense-amount-error"
                  role="alert"
                >
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="expense-dialog__actions">
              <button
                className="expense-dialog__submit"
                type="submit"
                id="dialog-submit-button"
              >
                {submitLabel}
              </button>
            </div>
          </form>

          {/* Cat Fact Panel */}
          <div className={catFactClasses} aria-live="polite">
            <div className="expense-dialog__cat-fact-icon-wrapper">
              <span className="expense-dialog__cat-fact-icon" aria-hidden="true">
                🐾
              </span>
            </div>
            <div className="expense-dialog__cat-fact-header">
              <h3 className="expense-dialog__cat-fact-title">Random cat fact</h3>
              <button
                className={`expense-dialog__cat-fact-refresh${isFactLoading ? ' expense-dialog__cat-fact-refresh--spinning' : ''}`}
                type="button"
                onClick={refetchFact}
                disabled={isFactLoading}
                aria-label="Refresh cat fact"
                id="dialog-refresh-fact-button"
              >
                ↻
              </button>
            </div>
            <p className="expense-dialog__cat-fact-text">
              {isFactLoading ? 'Loading a purr-fect fact...' : fact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
