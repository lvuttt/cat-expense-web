import { test, expect, Page } from '@playwright/test';

test.describe('Cat Expense Tracker — Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure a clean slate
    await page.evaluate(() => localStorage.clear());
    // Reload to apply cleared state
    await page.reload();

    // Intercept cat fact API to return a fixed fact for visual consistency
    await page.route('https://catfact.ninja/fact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fact: 'Mocked cat fact for visual regression testing consistency.',
          length: 57,
        }),
      });
    });
  });

  // Helper: Add an expense
  const addExpense = async (
    page: Page,
    name: string,
    category: string,
    amount: string,
  ) => {
    await page.click('id=add-expense-button');
    const nameInput = page.locator('id=expense-name');
    await expect(nameInput).toBeFocused();
    await nameInput.fill(name);
    await page.selectOption('id=expense-category', { label: category });
    await page.fill('id=expense-amount', amount);
    await page.click('id=dialog-submit-button');
    await expect(page.locator('id=expense-dialog')).toBeHidden();
  };

  test('visual screenshots of landing page, table, and dialog', async ({
    page,
  }) => {
    // 1. Landing Page (Empty State)
    await expect(page.locator('.expense-table__empty')).toBeVisible();
    await expect(page).toHaveScreenshot('landing-page-empty.png');

    // 2. Open Add Expense Dialog (Desktop side-by-side view)
    await page.click('id=add-expense-button');
    await expect(page.locator('id=expense-dialog')).toBeVisible();
    // Wait for cat fact animation to stabilize (loading states/fact fetch)
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('add-dialog-desktop.png');

    // Close dialog
    await page.click('.expense-dialog__close');
    await expect(page.locator('id=expense-dialog')).toBeHidden();

    // 3. Add expenses and view populated table (Desktop view)
    await addExpense(page, 'Premium Tuna Can', '🍕 Food', '12.50');
    await addExpense(page, 'Scratching Post', '🛋️ Furniture', '45.00');
    await addExpense(page, 'Catnip Toys', '✨ Accessory', '8.99');

    // Wait for animations to finish
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('populated-table-desktop.png');
  });

  test('visual screenshots of mobile layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // 1. Mobile Landing Page (Empty State)
    await expect(page.locator('.expense-table__empty')).toBeVisible();
    await expect(page).toHaveScreenshot('landing-page-empty-mobile.png');

    // 2. Open Add Expense Dialog (Mobile stacked view)
    await page.click('id=add-expense-button');
    await expect(page.locator('id=expense-dialog')).toBeVisible();
    // Wait for cat fact animation/fetch to stabilize
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('add-dialog-mobile.png');

    // Close dialog
    await page.click('.expense-dialog__close');
    await expect(page.locator('id=expense-dialog')).toBeHidden();

    // 3. Add expenses and view populated table (Mobile view)
    await addExpense(page, 'Premium Tuna Can', '🍕 Food', '12.50');
    await addExpense(page, 'Scratching Post', '🛋️ Furniture', '45.00');

    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('populated-table-mobile.png');
  });
});
