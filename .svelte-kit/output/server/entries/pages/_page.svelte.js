import { K as derived, F as attr_class, J as clsx, z as attr, N as ensure_array_like, Q as stringify, G as attr_style } from "../../chunks/index.js";
import "clsx";
import { e as escape_html } from "../../chunks/escaping.js";
import { o as onDestroy } from "../../chunks/index-server.js";
const CATEGORIES = ["Food", "Furniture", "Accessory"];
const CATEGORY_CONFIG = {
  Food: {
    label: "Food",
    emoji: "🍕",
    cssClass: "food"
  },
  Furniture: {
    label: "Furniture",
    emoji: "🛋️",
    cssClass: "furniture"
  },
  Accessory: {
    label: "Accessory",
    emoji: "✨",
    cssClass: "accessory"
  }
};
const STORAGE_KEY = "cat-expense-data";
const CAT_FACT_API_URL = "https://catfact.ninja/fact";
const FALLBACK_CAT_FACT = "Cats sleep for about 13–16 hours a day, making them one of the sleepiest animals! 😴";
const CAT_FACT_CACHE_KEY = "cat-fact-cache";
const CAT_FACT_CACHE_MAX = 10;
class LocalStorageService {
  key;
  constructor(key) {
    this.key = key;
  }
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.error(
        `[StorageService] Failed to load data for key "${this.key}":`,
        error
      );
      return null;
    }
  }
  save(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.error(
        `[StorageService] Failed to save data for key "${this.key}":`,
        error
      );
    }
  }
  clear() {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error(
        `[StorageService] Failed to clear key "${this.key}":`,
        error
      );
    }
  }
}
function calculateTotal(expenses) {
  const totalCents = expenses.reduce(
    (sum, expense) => sum + Math.round(expense.amount * 100),
    0
  );
  return totalCents / 100;
}
function sumByCategory(expenses) {
  const sums = /* @__PURE__ */ new Map();
  for (const expense of expenses) {
    const currentCents = Math.round((sums.get(expense.category) ?? 0) * 100);
    const addCents = Math.round(expense.amount * 100);
    sums.set(expense.category, (currentCents + addCents) / 100);
  }
  return sums;
}
function getTopSpendingCategories(expenses) {
  if (expenses.length === 0) return /* @__PURE__ */ new Set();
  const categorySums = sumByCategory(expenses);
  const maxAmount = Math.max(...categorySums.values());
  const topCategories = /* @__PURE__ */ new Set();
  for (const [category, amount] of categorySums) {
    if (amount === maxAmount) {
      topCategories.add(category);
    }
  }
  return topCategories;
}
function isInTopCategory(expense, topCategories) {
  return topCategories.has(expense.category);
}
function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function createExpense(formData) {
  return {
    id: generateId(),
    name: formData.name.trim(),
    category: formData.category,
    amount: Number(formData.amount.toFixed(2)),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function duplicateExpenseItem(expense) {
  return {
    ...expense,
    id: generateId(),
    name: expense.name,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
const createExpenses = (storage) => {
  let expenses = [];
  expenses = storage.load() ?? [];
  const topCategories = derived(() => getTopSpendingCategories(expenses));
  const totalAmount = derived(() => calculateTotal(expenses));
  function addExpense(formData) {
    const newExpense = createExpense(formData);
    expenses = [...expenses, newExpense];
  }
  function updateExpense(id, formData) {
    expenses = expenses.map((expense) => expense.id === id ? {
      ...expense,
      name: formData.name.trim(),
      category: formData.category,
      amount: Number(formData.amount.toFixed(2))
    } : expense);
  }
  function deleteExpenses(ids) {
    expenses = expenses.filter((expense) => !ids.has(expense.id));
  }
  function duplicateExpense(id) {
    const target = expenses.find((expense) => expense.id === id);
    if (!target) return;
    expenses = [...expenses, duplicateExpenseItem(target)];
  }
  return {
    get expenses() {
      return expenses;
    },
    set expenses(val) {
      expenses = val;
    },
    get topCategories() {
      return topCategories();
    },
    get totalAmount() {
      return totalAmount();
    },
    addExpense,
    updateExpense,
    deleteExpenses,
    duplicateExpense
  };
};
const SvelteSet = globalThis.Set;
const createSelection = (getItemIds) => {
  const selectedIds = new SvelteSet();
  const selectedCount = derived(() => {
    const ids = getItemIds();
    return ids.filter((id) => selectedIds.has(id)).length;
  });
  const isAllSelected = derived(() => {
    const ids = getItemIds();
    return ids.length > 0 && ids.every((id) => selectedIds.has(id));
  });
  const isSomeSelected = derived(() => {
    const ids = getItemIds();
    return ids.some((id) => selectedIds.has(id));
  });
  function isSelected(id) {
    return selectedIds.has(id);
  }
  function toggle(id) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }
  }
  function toggleAll() {
    const ids = getItemIds();
    if (isAllSelected()) {
      selectedIds.clear();
    } else {
      for (const id of ids) {
        selectedIds.add(id);
      }
    }
  }
  function clearSelection() {
    selectedIds.clear();
  }
  return {
    get selectedIds() {
      return selectedIds;
    },
    get selectedCount() {
      return selectedCount();
    },
    get isAllSelected() {
      return isAllSelected();
    },
    get isSomeSelected() {
      return isSomeSelected();
    },
    isSelected,
    toggle,
    toggleAll,
    clearSelection
  };
};
const SORT_STRATEGIES = {
  name: (a, b) => a.name.localeCompare(b.name),
  category: (a, b) => a.category.localeCompare(b.category),
  amount: (a, b) => a.amount - b.amount
};
function sortExpenses(expenses, config) {
  const compareFn = SORT_STRATEGIES[config.field];
  const sorted = [...expenses].sort(compareFn);
  return config.direction === "desc" ? sorted.reverse() : sorted;
}
function toggleSortDirection(current) {
  return current === "asc" ? "desc" : "asc";
}
const createSort = (defaultField = "name") => {
  let sortConfig = { field: defaultField, direction: "asc" };
  function handleSort(field) {
    if (sortConfig.field === field) {
      sortConfig = { field, direction: toggleSortDirection(sortConfig.direction) };
    } else {
      sortConfig = { field, direction: "asc" };
    }
  }
  return {
    get sortConfig() {
      return sortConfig;
    },
    handleSort
  };
};
function formatCurrency(amount) {
  return `$${amount.toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
function Header($$renderer) {
  $$renderer.push(`<header class="header svelte-1elxaub" id="app-header"><div class="header__logo svelte-1elxaub" aria-hidden="true">🐱</div> <h1 class="header__title svelte-1elxaub">Cat Expense</h1> <p class="header__subtitle svelte-1elxaub">Track your feline friend's expenses with purr-fection</p></header>`);
}
function ActionBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      selectedCount,
      isDeleteDisabled,
      isExportDisabled
    } = $$props;
    let deleteButtonClasses = derived(() => [
      "action-bar__button",
      "action-bar__button--danger",
      isDeleteDisabled ? "action-bar__button--disabled" : ""
    ].filter(Boolean).join(" "));
    let exportButtonClasses = derived(() => [
      "action-bar__button",
      "action-bar__button--secondary",
      isExportDisabled ? "action-bar__button--disabled" : ""
    ].filter(Boolean).join(" "));
    $$renderer2.push(`<div class="action-bar svelte-q6aptv" id="action-bar" role="toolbar" aria-label="Expense actions"><button id="add-expense-button" class="action-bar__button action-bar__button--primary svelte-q6aptv" type="button"><span class="action-bar__button-icon svelte-q6aptv" aria-hidden="true">+</span> Add Expense</button> <button id="delete-expense-button"${attr_class(clsx(deleteButtonClasses()), "svelte-q6aptv")}${attr("disabled", isDeleteDisabled, true)} type="button"${attr("aria-label", `Delete ${selectedCount} selected expense${selectedCount !== 1 ? "s" : ""}`)}><span class="action-bar__button-icon svelte-q6aptv" aria-hidden="true">🗑️</span> Delete Expense `);
    if (selectedCount > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="action-bar__badge svelte-q6aptv" aria-hidden="true">${escape_html(selectedCount)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></button> <button id="export-csv-button"${attr_class(clsx(exportButtonClasses()), "svelte-q6aptv")}${attr("disabled", isExportDisabled, true)} type="button" aria-label="Export all expenses as CSV"><span class="action-bar__button-icon svelte-q6aptv" aria-hidden="true">⬇</span> Export CSV</button></div>`);
  });
}
function SpendingChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { expenses, topCategories } = $$props;
    let categoryTotals = derived(() => sumByCategory(expenses));
    let grandTotalCents = derived(() => [...categoryTotals().values()].reduce((sum, v) => sum + Math.round(v * 100), 0));
    let grandTotal = derived(() => grandTotalCents() / 100);
    let rows = derived(() => CATEGORIES.map((cat) => ({
      category: cat,
      total: categoryTotals().get(cat) ?? 0,
      pct: grandTotal() > 0 ? (categoryTotals().get(cat) ?? 0) / grandTotal() * 100 : 0,
      isTop: topCategories.has(cat),
      meta: CATEGORY_CONFIG[cat]
    })).filter((r) => r.total > 0));
    if (expenses.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<section class="spending-chart svelte-67tjbc" aria-label="Spending by category" id="spending-chart"><h2 class="spending-chart__title svelte-67tjbc"><span aria-hidden="true">📊</span> Spending Breakdown</h2> <div class="spending-chart__bars svelte-67tjbc" role="list"><!--[-->`);
      const each_array = ensure_array_like(rows());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let { category, total, pct, isTop, meta } = each_array[$$index];
        $$renderer2.push(`<div${attr_class(`spending-chart__row ${isTop ? "spending-chart__row--top" : ""}`, "svelte-67tjbc")} role="listitem"><div class="spending-chart__label svelte-67tjbc"><span class="spending-chart__emoji svelte-67tjbc" aria-hidden="true">${escape_html(meta.emoji)}</span> <span class="spending-chart__category-name svelte-67tjbc">${escape_html(meta.label)}</span> `);
        if (isTop) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="spending-chart__top-badge svelte-67tjbc" aria-label="Top spending category">👑</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="spending-chart__track svelte-67tjbc" role="progressbar"${attr("aria-label", `${meta.label} spending`)}${attr("aria-valuenow", Math.round(pct))} aria-valuemin="0" aria-valuemax="100"><div${attr_class(`spending-chart__fill spending-chart__fill--${stringify(meta.cssClass)}`, "svelte-67tjbc")}${attr_style(`width: ${stringify(pct)}%`)}></div></div> <div class="spending-chart__amount svelte-67tjbc"><span class="spending-chart__total svelte-67tjbc">${escape_html(formatCurrency(total))}</span> <span class="spending-chart__pct svelte-67tjbc">${escape_html(Math.round(pct))}%</span></div></div>`);
      }
      $$renderer2.push(`<!--]--></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
const createVirtualList = (getItems, rowHeight, buffer = 5) => {
  let container = null;
  let scrollTop = 0;
  let clientHeight = 400;
  const visibleItems = derived(() => {
    const items = getItems();
    if (items.length === 0) {
      return [];
    }
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const endIndex = Math.min(items.length, Math.ceil((scrollTop + clientHeight) / rowHeight) + buffer);
    return items.slice(startIndex, endIndex).map((item, index) => ({ item, originalIndex: startIndex + index }));
  });
  const totalHeight = derived(() => getItems().length * rowHeight);
  return {
    get container() {
      return container;
    },
    set container(val) {
      container = val;
    },
    get visibleItems() {
      return visibleItems();
    },
    get totalHeight() {
      return totalHeight();
    }
  };
};
function ExpenseRow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      expense,
      isHighlighted,
      isSelected
    } = $$props;
    let categoryMeta = derived(() => CATEGORY_CONFIG[expense.category]);
    let rowClasses = derived(() => [
      "expense-row",
      isHighlighted ? "expense-row--highlighted" : "",
      isSelected ? "expense-row--selected" : ""
    ].filter(Boolean).join(" "));
    let badgeClass = derived(() => `expense-row__category-badge expense-row__category-badge--${categoryMeta().cssClass}`);
    $$renderer2.push(`<div${attr_class(clsx(rowClasses()), "svelte-qp83ik")} role="row"${attr("aria-selected", isSelected)}${attr("data-expense-id", expense.id)}><div class="expense-row__cell expense-row__cell--checkbox svelte-qp83ik" role="cell"><input class="expense-row__checkbox svelte-qp83ik" type="checkbox"${attr("checked", isSelected, true)}${attr("aria-label", `Select ${expense.name}`)}${attr("id", `select-${expense.id}`)}/></div> <div class="expense-row__cell expense-row__cell--name svelte-qp83ik" role="cell"${attr("data-tooltip", void 0)}><span class="expense-row__name-text svelte-qp83ik">${escape_html(expense.name)}</span></div> <div class="expense-row__cell expense-row__cell--category svelte-qp83ik" role="cell"><span${attr_class(clsx(badgeClass()), "svelte-qp83ik")}><span aria-hidden="true">${escape_html(categoryMeta().emoji)}</span> ${escape_html(categoryMeta().label)}</span></div> <div class="expense-row__cell expense-row__cell--amount svelte-qp83ik" role="cell">${escape_html(formatCurrency(expense.amount))}</div>  <div class="expense-row__cell expense-row__cell--actions svelte-qp83ik" role="cell"><button class="expense-row__action-button expense-row__action-button--edit svelte-qp83ik" type="button"${attr("aria-label", `Edit ${expense.name}`)} data-tooltip="Edit"><span class="expense-row__action-icon svelte-qp83ik"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="expense-row__svg-icon svelte-qp83ik" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg></span></button> <button class="expense-row__action-button expense-row__action-button--duplicate svelte-qp83ik" type="button"${attr("aria-label", `Duplicate ${expense.name}`)} data-tooltip="Duplicate"><span class="expense-row__action-icon svelte-qp83ik"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="expense-row__svg-icon svelte-qp83ik" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></span></button></div></div>`);
  });
}
function ExpenseTable($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      expenses,
      topCategories,
      sortConfig,
      isAllSelected,
      isSelected
    } = $$props;
    const ROW_HEIGHT = 48;
    const SORTABLE_COLUMNS = [
      { field: "name", label: "Item Name", className: "" },
      { field: "category", label: "Category", className: "" },
      {
        field: "amount",
        label: "Amount",
        className: "expense-table__header-cell--amount"
      }
    ];
    let hasExpenses = derived(() => expenses.length > 0);
    let virtualList = createVirtualList(() => expenses, ROW_HEIGHT);
    $$renderer2.push(`<div class="expense-table svelte-1q6qyt8" id="expense-table" role="table" aria-label="Expense list"><div class="expense-table__header svelte-1q6qyt8" role="row"><div class="expense-table__header-cell expense-table__header-cell--checkbox svelte-1q6qyt8" role="columnheader"><input class="expense-table__checkbox svelte-1q6qyt8" type="checkbox"${attr("checked", isAllSelected, true)}${attr("aria-label", isAllSelected ? "Deselect all expenses" : "Select all expenses")} id="select-all-checkbox"${attr("disabled", !hasExpenses(), true)}/></div> <!--[-->`);
    const each_array = ensure_array_like(SORTABLE_COLUMNS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let { field, label, className } = each_array[$$index];
      const isSorted = sortConfig.field === field;
      $$renderer2.push(`<button${attr_class(`expense-table__header-cell expense-table__header-cell--sortable ${isSorted ? "expense-table__header-cell--sorted" : ""} ${stringify(className)}`, "svelte-1q6qyt8")} type="button" role="columnheader"${attr("aria-sort", isSorted ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none")}>${escape_html(label)} `);
      if (isSorted) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span${attr_class(`expense-table__sort-icon ${sortConfig.direction === "desc" ? "expense-table__sort-icon--desc" : ""}`, "svelte-1q6qyt8")} aria-hidden="true">▲</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--> <div class="expense-table__header-cell expense-table__header-cell--actions svelte-1q6qyt8" role="columnheader">Actions</div></div> <div class="expense-table__body svelte-1q6qyt8" role="rowgroup"><div class="expense-table__inner svelte-1q6qyt8"${attr_style(`position: relative; height: ${hasExpenses() ? `${virtualList.totalHeight}px` : "auto"};`)}>`);
    if (hasExpenses()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(virtualList.visibleItems);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let { item: expense, originalIndex } = each_array_1[$$index_1];
        $$renderer2.push(`<div class="expense-table__row-wrapper svelte-1q6qyt8"${attr_style(`top: ${stringify(originalIndex * ROW_HEIGHT)}px;`)}>`);
        ExpenseRow($$renderer2, {
          expense,
          isHighlighted: isInTopCategory(expense, topCategories),
          isSelected: isSelected(expense.id)
        });
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="expense-table__empty svelte-1q6qyt8" role="row"><span class="expense-table__empty-icon svelte-1q6qyt8" aria-hidden="true">😺</span> <p class="expense-table__empty-title svelte-1q6qyt8">No expenses yet</p> <p class="expense-table__empty-text svelte-1q6qyt8">Click "Add Expense" to start tracking your cat's spending!</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
function getCachedFacts() {
  try {
    const raw = localStorage.getItem(CAT_FACT_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}
function cacheFact(fact) {
  try {
    const current = getCachedFacts();
    if (current.includes(fact)) return;
    const updated = [...current, fact].slice(-CAT_FACT_CACHE_MAX);
    localStorage.setItem(CAT_FACT_CACHE_KEY, JSON.stringify(updated));
  } catch {
  }
}
async function fetchCatFact(signal) {
  const response = await fetch(CAT_FACT_API_URL, { signal });
  if (!response.ok) {
    throw new Error(`Cat fact API returned HTTP ${response.status}`);
  }
  const data = await response.json();
  cacheFact(data.fact);
  return data.fact;
}
const getOfflineFact = () => {
  const cached = getCachedFacts();
  if (cached.length === 0) return FALLBACK_CAT_FACT;
  const idx = Math.floor(Math.random() * cached.length);
  return cached[idx];
};
const createCatFact = () => {
  let fact = FALLBACK_CAT_FACT;
  let isLoading = false;
  let error = null;
  let abortController = null;
  function refetch() {
    abortController?.abort();
    const controller = new AbortController();
    abortController = controller;
    isLoading = true;
    error = null;
    fetchCatFact(controller.signal).then((newFact) => {
      if (!controller.signal.aborted) {
        fact = newFact;
        isLoading = false;
      }
    }).catch((err) => {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : "Failed to fetch cat fact";
      console.warn("[createCatFact] API error, using offline fallback:", message);
      fact = getOfflineFact();
      error = message;
      isLoading = false;
    });
  }
  onDestroy(() => {
    abortController?.abort();
  });
  return {
    get fact() {
      return fact;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    refetch
  };
};
function ExpenseDialog($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    createCatFact();
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const expenseStorage = new LocalStorageService(STORAGE_KEY);
    const expensesState = createExpenses(expenseStorage);
    const sortState = createSort("name");
    const sortedExpenses = derived(() => sortExpenses(expensesState.expenses, sortState.sortConfig));
    const expenseIds = derived(() => sortedExpenses().map((e) => e.id));
    const selectionState = createSelection(() => expenseIds());
    $$renderer2.push(`<div class="app"><div class="app__container">`);
    Header($$renderer2);
    $$renderer2.push(`<!----> <main class="app__main" id="main-content">`);
    ActionBar($$renderer2, {
      selectedCount: selectionState.selectedCount,
      isDeleteDisabled: selectionState.selectedCount === 0,
      isExportDisabled: expensesState.expenses.length === 0
    });
    $$renderer2.push(`<!----> `);
    SpendingChart($$renderer2, {
      expenses: expensesState.expenses,
      topCategories: expensesState.topCategories
    });
    $$renderer2.push(`<!----> `);
    ExpenseTable($$renderer2, {
      expenses: sortedExpenses(),
      topCategories: expensesState.topCategories,
      sortConfig: sortState.sortConfig,
      isAllSelected: selectionState.isAllSelected,
      isSomeSelected: selectionState.isSomeSelected,
      isSelected: selectionState.isSelected
    });
    $$renderer2.push(`<!----></main> <footer class="app__footer">Made with <span class="app__footer-heart" aria-label="love">❤️</span> for cats
      everywhere</footer></div> `);
    ExpenseDialog($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  _page as default
};
