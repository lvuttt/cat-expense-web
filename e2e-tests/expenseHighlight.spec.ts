import { test, expect, Page } from '@playwright/test';

test.describe('Cat Expense Tracker — Top Category Highlighting', () => {
  test.beforeEach(async ({ page }) => {
    // Auto-accept all confirmation dialogs
    page.on('dialog', async (dialog) => {
      if (dialog.type() === 'confirm') {
        await dialog.accept();
      }
    });

    // Navigate to the app
    await page.goto('/');
    // Clear localStorage to ensure a clean slate
    await page.evaluate(() => localStorage.clear());
    // Reload to apply cleared state
    await page.reload();
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

  test('should highlight the highest spending category, handle ties, and update dynamically', async ({
    page,
  }) => {
    await expect(page.locator('.expense-table__empty')).toBeVisible();

    // 1. Add first expense: Food ($10.00)
    await addExpense(page, 'Tuna Cans', '🍕 Food', '10.00');
    const tunaRow = page.locator('.expense-row', { hasText: 'Tuna Cans' });
    await expect(tunaRow).toHaveClass(/expense-row--highlighted/);

    // 2. Add second expense: Accessory ($10.00) - Tie!
    await addExpense(page, 'Laser Toy', '✨ Accessory', '10.00');
    const laserRow = page.locator('.expense-row', { hasText: 'Laser Toy' });
    await expect(tunaRow).toHaveClass(/expense-row--highlighted/);
    await expect(laserRow).toHaveClass(/expense-row--highlighted/);

    // 3. Add third expense: Furniture ($25.00)
    await addExpense(page, 'Scratching Post', '🛋️ Furniture', '25.00');
    const postRow = page.locator('.expense-row', {
      hasText: 'Scratching Post',
    });
    await expect(postRow).toHaveClass(/expense-row--highlighted/);
    await expect(tunaRow).not.toHaveClass(/expense-row--highlighted/);
    await expect(laserRow).not.toHaveClass(/expense-row--highlighted/);

    // 4. Add fourth expense: Food ($20.00) - Food total is $30, Accessory is $10, Furniture is $25.
    await addExpense(page, 'Salmon Treat', '🍕 Food', '20.00');
    const salmonRow = page.locator('.expense-row', { hasText: 'Salmon Treat' });
    await expect(tunaRow).toHaveClass(/expense-row--highlighted/);
    await expect(salmonRow).toHaveClass(/expense-row--highlighted/);
    await expect(postRow).not.toHaveClass(/expense-row--highlighted/);
    await expect(laserRow).not.toHaveClass(/expense-row--highlighted/);
  });

  test('should handle equal spending on 2 or 3 categories and verify highlighting', async ({
    page,
  }) => {
    // 1. Add first expense: Food ($15.00)
    await addExpense(page, 'Cat Food', '🍕 Food', '15.00');
    const foodRow = page.locator('.expense-row', { hasText: 'Cat Food' });
    await expect(foodRow).toHaveClass(/expense-row--highlighted/);

    // 2. Add second expense: Accessory ($15.00) - Tie between 2 categories
    await addExpense(page, 'Cat Bell', '✨ Accessory', '15.00');
    const accessoryRow = page.locator('.expense-row', { hasText: 'Cat Bell' });
    await expect(foodRow).toHaveClass(/expense-row--highlighted/);
    await expect(accessoryRow).toHaveClass(/expense-row--highlighted/);

    // 3. Add third expense: Furniture ($15.00) - Tie between 3 categories
    await addExpense(page, 'Cat Tree', '🛋️ Furniture', '15.00');
    const furnitureRow = page.locator('.expense-row', { hasText: 'Cat Tree' });
    await expect(foodRow).toHaveClass(/expense-row--highlighted/);
    await expect(accessoryRow).toHaveClass(/expense-row--highlighted/);
    await expect(furnitureRow).toHaveClass(/expense-row--highlighted/);
  });

  test('should show inline validation errors for invalid fields and clear them on correction', async ({
    page,
  }) => {
    await page.click('id=add-expense-button');

    // Submit blank form
    await page.click('id=dialog-submit-button');

    // Verify error messages
    await expect(page.locator('id=expense-name-error')).toHaveText(
      /Item name is required/,
    );
    await expect(page.locator('id=expense-category-error')).toHaveText(
      /Please select a category/,
    );
    await expect(page.locator('id=expense-amount-error')).toHaveText(
      /Amount is required/,
    );

    // Correct Name field
    await page.fill('id=expense-name', 'Treats');
    await expect(page.locator('id=expense-name-error')).toBeHidden();

    // Select category
    await page.selectOption('id=expense-category', { label: '🍕 Food' });
    await expect(page.locator('id=expense-category-error')).toBeHidden();

    // Fill invalid amount
    await page.fill('id=expense-amount', '0');
    await expect(page.locator('id=expense-amount-error')).toHaveText(
      /Amount must be at least 0.01/,
    );

    // Fill valid amount
    await page.fill('id=expense-amount', '10.50');
    await expect(page.locator('id=expense-amount-error')).toBeHidden();

    // Submit
    await page.click('id=dialog-submit-button');
    await expect(page.locator('id=expense-dialog')).toBeHidden();

    // Verify row appeared
    const row = page.locator('.expense-row', { hasText: 'Treats' });
    await expect(row).toBeVisible();
  });

  test('should support editing and updating existing expenses', async ({
    page,
  }) => {
    await addExpense(page, 'Cat Kibble', '🍕 Food', '15.00');
    const row = page.locator('.expense-row', { hasText: 'Cat Kibble' });
    await expect(row).toBeVisible();

    // Click Edit button
    await row.locator('.expense-row__action-button--edit').click();
    await expect(page.locator('id=expense-dialog')).toBeVisible();

    // Verify values are prefilled
    await expect(page.locator('id=expense-name')).toHaveValue('Cat Kibble');
    await expect(page.locator('id=expense-category')).toHaveValue('Food');
    await expect(page.locator('id=expense-amount')).toHaveValue('15');

    // Update values
    await page.fill('id=expense-name', 'Fancy Kibble');
    await page.fill('id=expense-amount', '25.50');
    await page.click('id=dialog-submit-button');
    await expect(page.locator('id=expense-dialog')).toBeHidden();

    // Verify updated values in row
    const updatedRow = page.locator('.expense-row', {
      hasText: 'Fancy Kibble',
    });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow.locator('.expense-row__cell--amount')).toHaveText(
      '$25.50',
    );
    await expect(
      page.locator('.expense-row', { hasText: 'Cat Kibble' }),
    ).toBeHidden();
  });

  test('should support duplicating expenses', async ({ page }) => {
    await addExpense(page, 'Play Feather', '✨ Accessory', '12.00');
    const row = page.locator('.expense-row', { hasText: 'Play Feather' });
    await expect(row).toBeVisible();

    // Click Duplicate button
    await row.locator('.expense-row__action-button--duplicate').click();

    // Verify clone exists
    const rows = page.locator('.expense-row', { hasText: 'Play Feather' });
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0).locator('.expense-row__cell--amount')).toHaveText(
      '$12.00',
    );
    await expect(rows.nth(1).locator('.expense-row__cell--amount')).toHaveText(
      '$12.00',
    );
  });

  test('should support checking/unchecking all and deleting multiple items', async ({
    page,
  }) => {
    await addExpense(page, 'Kibble', '🍕 Food', '10.00');
    await addExpense(page, 'Tower', '🛋️ Furniture', '40.00');
    await addExpense(page, 'Collar', '✨ Accessory', '5.00');

    const selectAllCheckbox = page.locator('id=select-all-checkbox');
    const deleteButton = page.locator('id=delete-expense-button');

    // Initially select all is unchecked, delete is disabled
    await expect(selectAllCheckbox).not.toBeChecked();
    await expect(deleteButton).toBeDisabled();

    // Click Select All
    await selectAllCheckbox.click();
    await expect(selectAllCheckbox).toBeChecked();
    await expect(deleteButton).toBeEnabled();
    await expect(deleteButton.locator('.action-bar__badge')).toHaveText('3');

    // Uncheck one item manually
    await page
      .locator(
        'id=select-' +
          (await page
            .locator('.expense-row')
            .nth(0)
            .getAttribute('data-expense-id')),
      )
      .click();
    await expect(selectAllCheckbox).not.toBeChecked();
    await expect(deleteButton.locator('.action-bar__badge')).toHaveText('2');

    // Delete selected items
    await deleteButton.click();

    // Verify remaining count
    await expect(page.locator('.expense-row')).toHaveCount(1);
  });

  test('should support sorting by item name, category, and amount', async ({
    page,
  }) => {
    await addExpense(page, 'Cat Collar', '✨ Accessory', '20.00');
    await addExpense(page, 'Scratching Post', '🛋️ Furniture', '50.00');
    await addExpense(page, 'Tuna Can', '🍕 Food', '5.00');

    const getRowNames = async () => {
      return await page.locator('.expense-row__cell--name').allTextContents();
    };

    // 1. Verify default Item Name Ascending sort on load
    let names = await getRowNames();
    expect(names).toEqual(['Cat Collar', 'Scratching Post', 'Tuna Can']);

    // Sort by Item Name Descending (click once)
    await page.click('.expense-table__header-cell:has-text("Item Name")');
    names = await getRowNames();
    expect(names).toEqual(['Tuna Can', 'Scratching Post', 'Cat Collar']);

    // Sort by Item Name Ascending (click again)
    await page.click('.expense-table__header-cell:has-text("Item Name")');
    names = await getRowNames();
    expect(names).toEqual(['Cat Collar', 'Scratching Post', 'Tuna Can']);

    // 2. Sort by Amount Ascending (click amount column header)
    await page.click('.expense-table__header-cell:has-text("Amount")');
    names = await getRowNames();
    expect(names).toEqual(['Tuna Can', 'Cat Collar', 'Scratching Post']);

    // Sort by Amount Descending (click again)
    await page.click('.expense-table__header-cell:has-text("Amount")');
    names = await getRowNames();
    expect(names).toEqual(['Scratching Post', 'Cat Collar', 'Tuna Can']);
  });

  test('should auto-focus the name field on opening the dialog', async ({
    page,
  }) => {
    await page.click('id=add-expense-button');
    const nameInput = page.locator('id=expense-name');
    await expect(nameInput).toBeFocused();
  });

  test('should handle dialog cancellation for both add and edit modes', async ({
    page,
  }) => {
    // Add mode cancellation
    await page.click('id=add-expense-button');
    await page.fill('id=expense-name', 'Cancelled Item');
    await page.click('id=dialog-close-button');
    await expect(page.locator('id=expense-dialog')).toBeHidden();
    await expect(
      page.locator('.expense-row', { hasText: 'Cancelled Item' }),
    ).toBeHidden();

    // Edit mode cancellation
    await addExpense(page, 'Original Item', '🍕 Food', '12.00');
    const row = page.locator('.expense-row', { hasText: 'Original Item' });
    await row.locator('.expense-row__action-button--edit').click();
    await page.fill('id=expense-name', 'Edited Item');
    await page.click('id=dialog-close-button');
    await expect(page.locator('id=expense-dialog')).toBeHidden();
    await expect(
      page.locator('.expense-row', { hasText: 'Original Item' }),
    ).toBeVisible();
    await expect(
      page.locator('.expense-row', { hasText: 'Edited Item' }),
    ).toBeHidden();
  });

  test('should display fetched cat facts inside the dialog', async ({
    page,
  }) => {
    await page.click('id=add-expense-button');
    const factText = page.locator('.cat-fact-panel__text');
    await expect(factText).toBeVisible();
    await expect(factText).not.toBeEmpty();
  });

  test('should shift highlights back to remaining top category when top category item is deleted', async ({
    page,
  }) => {
    await addExpense(page, 'Tuna Cans', '🍕 Food', '10.00');
    await addExpense(page, 'Laser Toy', '✨ Accessory', '15.00');

    const tunaRow = page.locator('.expense-row', { hasText: 'Tuna Cans' });
    const laserRow = page.locator('.expense-row', { hasText: 'Laser Toy' });

    await expect(laserRow).toHaveClass(/expense-row--highlighted/);
    await expect(tunaRow).not.toHaveClass(/expense-row--highlighted/);

    // Delete Accessory item
    await page
      .locator('id=select-' + (await laserRow.getAttribute('data-expense-id')))
      .click();
    await page.click('id=delete-expense-button');

    // Highlighting shifts to Food
    await expect(tunaRow).toHaveClass(/expense-row--highlighted/);
  });

  test('should support multiple duplications with identical names', async ({
    page,
  }) => {
    await addExpense(page, 'Toy', '✨ Accessory', '5.00');
    const rows = page.locator('.expense-row', { hasText: 'Toy' });
    await expect(rows).toHaveCount(1);

    // Duplicate once
    await rows
      .first()
      .locator('.expense-row__action-button--duplicate')
      .click();
    await expect(rows).toHaveCount(2);

    // Duplicate again
    await rows
      .first()
      .locator('.expense-row__action-button--duplicate')
      .click();
    await expect(rows).toHaveCount(3);
  });

  test('should support checking and unchecking all items via header checkbox', async ({
    page,
  }) => {
    await addExpense(page, 'A', '🍕 Food', '5.00');
    await addExpense(page, 'B', '🍕 Food', '5.00');

    const selectAllCheckbox = page.locator('id=select-all-checkbox');
    const deleteButton = page.locator('id=delete-expense-button');

    // Check all
    await selectAllCheckbox.click();
    await expect(selectAllCheckbox).toBeChecked();
    await expect(deleteButton.locator('.action-bar__badge')).toHaveText('2');

    // Uncheck all
    await selectAllCheckbox.click();
    await expect(selectAllCheckbox).not.toBeChecked();
    await expect(deleteButton).toBeDisabled();
  });

  test('should support partial/indeterminate selection states when checking items manually', async ({
    page,
  }) => {
    await addExpense(page, 'Item A', '🍕 Food', '5.00');
    await expect(
      page.locator('.expense-row', { hasText: 'Item A' }),
    ).toBeVisible();

    await addExpense(page, 'Item B', '🛋️ Furniture', '10.00');
    await expect(
      page.locator('.expense-row', { hasText: 'Item B' }),
    ).toBeVisible();

    await addExpense(page, 'Item C', '✨ Accessory', '15.00');
    await expect(
      page.locator('.expense-row', { hasText: 'Item C' }),
    ).toBeVisible();

    const selectAllCheckbox = page.locator('id=select-all-checkbox');

    const rowA = page.locator('.expense-row', { hasText: 'Item A' });
    const rowB = page.locator('.expense-row', { hasText: 'Item B' });
    const rowC = page.locator('.expense-row', { hasText: 'Item C' });

    const idA = await rowA.getAttribute('data-expense-id');
    const idB = await rowB.getAttribute('data-expense-id');
    const idC = await rowC.getAttribute('data-expense-id');

    // 1. Initially unchecked and not indeterminate
    await expect(selectAllCheckbox).not.toBeChecked();
    await expect(selectAllCheckbox).toHaveJSProperty('indeterminate', false);

    // 2. Check 1 of 3: should be indeterminate, unchecked
    await page.locator(`id=select-${idA}`).click();
    await expect(selectAllCheckbox).not.toBeChecked();
    await expect(selectAllCheckbox).toHaveJSProperty('indeterminate', true);

    // 3. Check 2 of 3: should still be indeterminate, unchecked
    await page.locator(`id=select-${idB}`).click();
    await expect(selectAllCheckbox).not.toBeChecked();
    await expect(selectAllCheckbox).toHaveJSProperty('indeterminate', true);

    // 4. Check 3 of 3: should be checked, not indeterminate
    await page.locator(`id=select-${idC}`).click();
    await expect(selectAllCheckbox).toBeChecked();
    await expect(selectAllCheckbox).toHaveJSProperty('indeterminate', false);

    // 5. Uncheck 1 item: should return to indeterminate, unchecked
    await page.locator(`id=select-${idA}`).click();
    await expect(selectAllCheckbox).not.toBeChecked();
    await expect(selectAllCheckbox).toHaveJSProperty('indeterminate', true);
  });

  test('should validate name max length, zero amount, and huge amount boundary values', async ({
    page,
  }) => {
    await page.click('id=add-expense-button');

    // 1. Name max length validation (>100 chars)
    const longName = 'a'.repeat(101);
    await page.fill('id=expense-name', longName);
    await page.selectOption('id=expense-category', { label: '🍕 Food' });
    await page.fill('id=expense-amount', '10');
    await page.click('id=dialog-submit-button');
    await expect(page.locator('id=expense-name-error')).toHaveText(
      /Item name must be 100 characters or fewer/,
    );

    // 2. Zero amount validation
    await page.fill('id=expense-name', 'Valid Name');
    await page.fill('id=expense-amount', '0.00');
    await page.click('id=dialog-submit-button');
    await expect(page.locator('id=expense-amount-error')).toHaveText(
      /Amount must be at least 0.01/,
    );

    // 3. Huge amount validation
    await page.fill('id=expense-amount', '1000000.00');
    await page.click('id=dialog-submit-button');
    await expect(page.locator('id=expense-amount-error')).toHaveText(
      /Amount must be no more than 999,999.99/,
    );
  });

  test('should show fallback cat facts when offline', async ({ page }) => {
    // Block the catfact.ninja endpoint to trigger offline fallback
    await page.route('https://catfact.ninja/fact', (route) => route.abort());

    await page.click('id=add-expense-button');

    const factText = page.locator('.cat-fact-panel__text');
    await expect(factText).toHaveText(/sleep for about 13–16 hours/);
  });

  test('should persist expenses on reload and recover gracefully from corrupted localStorage data', async ({
    page,
  }) => {
    await addExpense(page, 'Kibble', '🍕 Food', '10.00');
    await page.reload();
    await expect(
      page.locator('.expense-row', { hasText: 'Kibble' }),
    ).toBeVisible();

    await page.evaluate(() =>
      localStorage.setItem('cat-expense-data', 'corrupted-non-json-string'),
    );
    await page.reload();

    await expect(page.locator('.expense-table__empty')).toBeVisible();
    await expect(page.locator('.expense-row')).toHaveCount(0);
  });

  test('should handle rapid dialog toggling without exceptions', async ({
    page,
  }) => {
    const dialog = page.locator('id=expense-dialog');

    for (let i = 0; i < 5; i++) {
      await page.click('id=add-expense-button');
      await expect(dialog).toBeVisible();
      await page.click('id=dialog-close-button');
      await expect(dialog).toBeHidden();
    }
  });
});
