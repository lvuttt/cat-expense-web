import { a as bind_props, f as attr, i as attr_style, l as stringify, m as escape_html, o as derived, p as clsx, r as attr_class, s as ensure_array_like, t as onDestroy } from "../../chunks/index-server.js";
//#region src/lib/constants/categories.ts
/**
* Immutable array of all available expense categories.
* This is the single source of truth — the Category type is derived from it.
* To add a new category: add it here + add its config entry in CATEGORY_CONFIG.
* Open/Closed Principle: no component logic needs to change.
*/
var CATEGORIES = [
	"Food",
	"Furniture",
	"Accessory"
];
/**
* Display metadata for each category.
* Maps category values to their labels, emoji icons, and CSS class modifiers.
*/
var CATEGORY_CONFIG = {
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
//#endregion
//#region src/lib/constants/index.ts
/**
* Application-wide constants.
* All magic strings and numbers are extracted here to avoid duplication
* and enable easy modification.
*/
/** LocalStorage key for persisting expenses. */
var STORAGE_KEY = "cat-expense-data";
/** Cat Facts API endpoint — returns a random cat fact. */
var CAT_FACT_API_URL = "https://catfact.ninja/fact";
/** Fallback cat fact displayed when the API is unavailable (offline tolerance). */
var FALLBACK_CAT_FACT = "Cats sleep for about 13–16 hours a day, making them one of the sleepiest animals! 😴";
/** LocalStorage key for persisting the cat fact offline cache. */
var CAT_FACT_CACHE_KEY = "cat-fact-cache";
//#endregion
//#region src/lib/services/storageService.ts
/**
* LocalStorage-based implementation of IStorageService.
* Handles JSON serialization/deserialization with error recovery.
*/
var LocalStorageService = class {
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
			console.error(`[StorageService] Failed to load data for key "${this.key}":`, error);
			return null;
		}
	}
	save(data) {
		try {
			localStorage.setItem(this.key, JSON.stringify(data));
		} catch (error) {
			console.error(`[StorageService] Failed to save data for key "${this.key}":`, error);
		}
	}
	clear() {
		try {
			localStorage.removeItem(this.key);
		} catch (error) {
			console.error(`[StorageService] Failed to clear key "${this.key}":`, error);
		}
	}
};
//#endregion
//#region src/lib/utils/expenseUtils.ts
/**
* Calculates the total amount across all expenses.
* Uses fixed-point arithmetic to avoid floating point drift.
*/
function calculateTotal(expenses) {
	return expenses.reduce((sum, expense) => sum + Math.round(expense.amount * 100), 0) / 100;
}
/**
* Groups expenses by category and sums their amounts.
* Returns a Map of category → total amount.
*/
function sumByCategory(expenses) {
	const sums = /* @__PURE__ */ new Map();
	for (const expense of expenses) {
		const currentCents = Math.round((sums.get(expense.category) ?? 0) * 100);
		const addCents = Math.round(expense.amount * 100);
		sums.set(expense.category, (currentCents + addCents) / 100);
	}
	return sums;
}
/**
* Returns the set of categories with the highest total spending.
* Handles ties — multiple categories can be "top" if they share the max amount.
* Returns an empty set if there are no expenses.
*/
function getTopSpendingCategories(expenses) {
	if (expenses.length === 0) return /* @__PURE__ */ new Set();
	const categorySums = sumByCategory(expenses);
	const maxAmount = Math.max(...categorySums.values());
	const topCategories = /* @__PURE__ */ new Set();
	for (const [category, amount] of categorySums) if (amount === maxAmount) topCategories.add(category);
	return topCategories;
}
/**
* Checks if an expense belongs to a top-spending category.
*/
function isInTopCategory(expense, topCategories) {
	return topCategories.has(expense.category);
}
/**
* Generates a unique identifier.
* Uses crypto.randomUUID() when available (secure contexts/localhost).
* Falls back to a pseudorandom algorithm on non-secure contexts (e.g. mobile over HTTP).
*/
function generateId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
/**
* Creates a new Expense entity from form data.
* Assigns a unique ID and creation timestamp.
*/
function createExpense(formData) {
	return {
		id: generateId(),
		name: formData.name.trim(),
		category: formData.category,
		amount: Number(formData.amount.toFixed(2)),
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
/**
* Creates a duplicate of an existing expense.
* Generates a new ID and keeps the name identical.
*/
function duplicateExpenseItem(expense) {
	return {
		...expense,
		id: generateId(),
		name: expense.name,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
//#endregion
//#region src/lib/state/expenses.svelte.ts
var createExpenses = (storage) => {
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
globalThis.Date;
var SvelteSet = globalThis.Set;
globalThis.Map;
globalThis.URL;
globalThis.URLSearchParams;
//#endregion
//#region src/lib/state/selection.svelte.ts
var createSelection = (getItemIds) => {
	const selectedIds = new SvelteSet();
	const selectedCount = derived(() => {
		return getItemIds().filter((id) => selectedIds.has(id)).length;
	});
	const isAllSelected = derived(() => {
		const ids = getItemIds();
		return ids.length > 0 && ids.every((id) => selectedIds.has(id));
	});
	const isSomeSelected = derived(() => {
		return getItemIds().some((id) => selectedIds.has(id));
	});
	function isSelected(id) {
		return selectedIds.has(id);
	}
	function toggle(id) {
		if (selectedIds.has(id)) selectedIds.delete(id);
		else selectedIds.add(id);
	}
	function toggleAll() {
		const ids = getItemIds();
		if (isAllSelected()) selectedIds.clear();
		else for (const id of ids) selectedIds.add(id);
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
//#endregion
//#region src/lib/utils/sortUtils.ts
/**
* Strategy map — each sort field maps to its comparison function.
* Extend this record to support new sortable fields.
*/
var SORT_STRATEGIES = {
	name: (a, b) => a.name.localeCompare(b.name),
	category: (a, b) => a.category.localeCompare(b.category),
	amount: (a, b) => a.amount - b.amount
};
/**
* Sorts an array of expenses according to the given configuration.
* Returns a new sorted array — does NOT mutate the input.
*/
function sortExpenses(expenses, config) {
	const compareFn = SORT_STRATEGIES[config.field];
	const sorted = [...expenses].sort(compareFn);
	return config.direction === "desc" ? sorted.reverse() : sorted;
}
/**
* Toggles sort direction between ascending and descending.
*/
function toggleSortDirection(current) {
	return current === "asc" ? "desc" : "asc";
}
//#endregion
//#region src/lib/state/sort.svelte.ts
var createSort = (defaultField = "name") => {
	let sortConfig = {
		field: defaultField,
		direction: "asc"
	};
	function handleSort(field) {
		if (sortConfig.field === field) sortConfig = {
			field,
			direction: toggleSortDirection(sortConfig.direction)
		};
		else sortConfig = {
			field,
			direction: "asc"
		};
	}
	return {
		get sortConfig() {
			return sortConfig;
		},
		handleSort
	};
};
//#endregion
//#region src/lib/utils/formatUtils.ts
/**
* Formatting utilities — pure display logic.
*/
/**
* Formats a number as a currency string.
* Uses the user's locale for number formatting with exactly 2 decimal places.
*/
function formatCurrency(amount) {
	return `$${amount.toLocaleString(void 0, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
/**
* Formats an ISO date string into a short, human-readable format.
*/
function formatDate(isoString) {
	return new Date(isoString).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
//#endregion
//#region src/lib/utils/csvUtils.ts
/**
* Wraps a field in double quotes and escapes any existing double quotes.
* Applied conditionally — only when the field value requires quoting.
*/
function csvQuote(value) {
	if (!(value.includes("\"") || value.includes(",") || value.includes("\n"))) return value;
	return `"${value.replace(/"/g, "\"\"")}"`;
}
/**
* Converts an array of Expense objects to a complete CSV string.
* Includes a header row and one data row per expense.
*/
function expensesToCsv(expenses) {
	const headers = [
		"Name",
		"Category",
		"Amount",
		"Date"
	];
	const rows = expenses.map((e) => [
		csvQuote(e.name),
		csvQuote(e.category),
		csvQuote(formatCurrency(e.amount)),
		csvQuote(formatDate(e.createdAt))
	]);
	return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}
/**
* Triggers a browser file download for the CSV content.
* Creates and auto-clicks a temporary anchor element.
*/
function downloadCsv(content, filename) {
	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
/**
* Main entry point: converts expenses to CSV and initiates download.
* Generates a timestamped filename.
*/
function exportExpensesToCsv(expenses) {
	downloadCsv(expensesToCsv(expenses), `cat-expenses-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
}
//#endregion
//#region src/lib/components/Header.svelte
function Header($$renderer) {
	$$renderer.push(`<header class="header svelte-1elxaub" id="app-header"><div class="header__logo svelte-1elxaub" aria-hidden="true">🐱</div> <h1 class="header__title svelte-1elxaub">Cat Expense</h1> <p class="header__subtitle svelte-1elxaub">Track your feline friend's expenses with purr-fection</p></header>`);
}
//#endregion
//#region src/lib/components/ActionBar.svelte
function ActionBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onAddClick, onDeleteClick, onExportClick, selectedCount, isDeleteDisabled, isExportDisabled } = $$props;
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
		$$renderer.push(`<div class="action-bar svelte-q6aptv" id="action-bar" role="toolbar" aria-label="Expense actions"><button id="add-expense-button" class="action-bar__button action-bar__button--primary svelte-q6aptv" type="button"><span class="action-bar__button-icon svelte-q6aptv" aria-hidden="true">+</span> Add Expense</button> <button id="delete-expense-button"${attr_class(clsx(deleteButtonClasses()), "svelte-q6aptv")}${attr("disabled", isDeleteDisabled, true)} type="button"${attr("aria-label", `Delete ${selectedCount} selected expense${selectedCount !== 1 ? "s" : ""}`)}><span class="action-bar__button-icon svelte-q6aptv" aria-hidden="true">🗑️</span> Delete Expense `);
		if (selectedCount > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="action-bar__badge svelte-q6aptv" aria-hidden="true">${escape_html(selectedCount)}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></button> <button id="export-csv-button"${attr_class(clsx(exportButtonClasses()), "svelte-q6aptv")}${attr("disabled", isExportDisabled, true)} type="button" aria-label="Export all expenses as CSV"><span class="action-bar__button-icon svelte-q6aptv" aria-hidden="true">⬇</span> Export CSV</button></div>`);
	});
}
//#endregion
//#region src/lib/components/SpendingChart.svelte
function SpendingChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="spending-chart svelte-67tjbc" aria-label="Spending by category" id="spending-chart"><h2 class="spending-chart__title svelte-67tjbc"><span aria-hidden="true">📊</span> Spending Breakdown</h2> <div class="spending-chart__bars svelte-67tjbc" role="list"><!--[-->`);
			const each_array = ensure_array_like(rows());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { category, total, pct, isTop, meta } = each_array[$$index];
				$$renderer.push(`<div${attr_class(`spending-chart__row ${isTop ? "spending-chart__row--top" : ""}`, "svelte-67tjbc")} role="listitem"><div class="spending-chart__label svelte-67tjbc"><span class="spending-chart__emoji svelte-67tjbc" aria-hidden="true">${escape_html(meta.emoji)}</span> <span class="spending-chart__category-name svelte-67tjbc">${escape_html(meta.label)}</span> `);
				if (isTop) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="spending-chart__top-badge svelte-67tjbc" aria-label="Top spending category">👑</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="spending-chart__track svelte-67tjbc" role="progressbar"${attr("aria-label", `${meta.label} spending`)}${attr("aria-valuenow", Math.round(pct))} aria-valuemin="0" aria-valuemax="100"><div${attr_class(`spending-chart__fill spending-chart__fill--${stringify(meta.cssClass)}`, "svelte-67tjbc")}${attr_style(`width: ${stringify(pct)}%`)}></div></div> <div class="spending-chart__amount svelte-67tjbc"><span class="spending-chart__total svelte-67tjbc">${escape_html(formatCurrency(total))}</span> <span class="spending-chart__pct svelte-67tjbc">${escape_html(Math.round(pct))}%</span></div></div>`);
			}
			$$renderer.push(`<!--]--></div></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/state/virtualList.svelte.ts
var createVirtualList = (getItems, rowHeight, buffer = 5) => {
	let container = null;
	let scrollTop = 0;
	const visibleItems = derived(() => {
		const items = getItems();
		if (items.length === 0) return [];
		const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
		const endIndex = Math.min(items.length, Math.ceil(400 / rowHeight) + buffer);
		return items.slice(startIndex, endIndex).map((item, index) => ({
			item,
			originalIndex: startIndex + index
		}));
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
//#endregion
//#region src/lib/components/ExpenseRow.svelte
function ExpenseRow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { expense, isHighlighted, isSelected, onToggleSelect, onEdit, onDuplicate } = $$props;
		let categoryMeta = derived(() => CATEGORY_CONFIG[expense.category]);
		let rowClasses = derived(() => [
			"expense-row",
			isHighlighted ? "expense-row--highlighted" : "",
			isSelected ? "expense-row--selected" : ""
		].filter(Boolean).join(" "));
		let badgeClass = derived(() => `expense-row__category-badge expense-row__category-badge--${categoryMeta().cssClass}`);
		$$renderer.push(`<div${attr_class(clsx(rowClasses()), "svelte-qp83ik")} role="row"${attr("aria-selected", isSelected)}${attr("data-expense-id", expense.id)}><div class="expense-row__cell expense-row__cell--checkbox svelte-qp83ik" role="cell"><input class="expense-row__checkbox svelte-qp83ik" type="checkbox"${attr("checked", isSelected, true)}${attr("aria-label", `Select ${expense.name}`)}${attr("id", `select-${expense.id}`)}/></div> <div class="expense-row__cell expense-row__cell--name svelte-qp83ik" role="cell"${attr("data-tooltip", void 0)}><span class="expense-row__name-text svelte-qp83ik">${escape_html(expense.name)}</span></div> <div class="expense-row__cell expense-row__cell--category svelte-qp83ik" role="cell"><span${attr_class(clsx(badgeClass()), "svelte-qp83ik")}><span aria-hidden="true">${escape_html(categoryMeta().emoji)}</span> ${escape_html(categoryMeta().label)}</span></div> <div class="expense-row__cell expense-row__cell--amount svelte-qp83ik" role="cell">${escape_html(formatCurrency(expense.amount))}</div>  <div class="expense-row__cell expense-row__cell--actions svelte-qp83ik" role="cell"><button class="expense-row__action-button expense-row__action-button--edit svelte-qp83ik" type="button"${attr("aria-label", `Edit ${expense.name}`)} data-tooltip="Edit"><span class="expense-row__action-icon svelte-qp83ik"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="expense-row__svg-icon svelte-qp83ik" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg></span></button> <button class="expense-row__action-button expense-row__action-button--duplicate svelte-qp83ik" type="button"${attr("aria-label", `Duplicate ${expense.name}`)} data-tooltip="Duplicate"><span class="expense-row__action-icon svelte-qp83ik"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="expense-row__svg-icon svelte-qp83ik" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></span></button></div></div>`);
	});
}
//#endregion
//#region src/lib/components/ExpenseTable.svelte
function ExpenseTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { expenses, topCategories, sortConfig, onSort, isAllSelected, isSomeSelected, onToggleAll, isSelected, onToggleSelect, onEdit, onDuplicate } = $$props;
		const ROW_HEIGHT = 48;
		const SORTABLE_COLUMNS = [
			{
				field: "name",
				label: "Item Name",
				className: ""
			},
			{
				field: "category",
				label: "Category",
				className: ""
			},
			{
				field: "amount",
				label: "Amount",
				className: "expense-table__header-cell--amount"
			}
		];
		let hasExpenses = derived(() => expenses.length > 0);
		let virtualList = createVirtualList(() => expenses, ROW_HEIGHT);
		$$renderer.push(`<div class="expense-table svelte-1q6qyt8" id="expense-table" role="table" aria-label="Expense list"><div class="expense-table__header svelte-1q6qyt8" role="row"><div class="expense-table__header-cell expense-table__header-cell--checkbox svelte-1q6qyt8" role="columnheader"><input class="expense-table__checkbox svelte-1q6qyt8" type="checkbox"${attr("checked", isAllSelected, true)}${attr("aria-label", isAllSelected ? "Deselect all expenses" : "Select all expenses")} id="select-all-checkbox"${attr("disabled", !hasExpenses(), true)}/></div> <!--[-->`);
		const each_array = ensure_array_like(SORTABLE_COLUMNS);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { field, label, className } = each_array[$$index];
			const isSorted = sortConfig.field === field;
			$$renderer.push(`<button${attr_class(`expense-table__header-cell expense-table__header-cell--sortable ${isSorted ? "expense-table__header-cell--sorted" : ""} ${stringify(className)}`, "svelte-1q6qyt8")} type="button" role="columnheader"${attr("aria-sort", isSorted ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none")}>${escape_html(label)} `);
			if (isSorted) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span${attr_class(`expense-table__sort-icon ${sortConfig.direction === "desc" ? "expense-table__sort-icon--desc" : ""}`, "svelte-1q6qyt8")} aria-hidden="true">▲</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></button>`);
		}
		$$renderer.push(`<!--]--> <div class="expense-table__header-cell expense-table__header-cell--actions svelte-1q6qyt8" role="columnheader">Actions</div></div> <div class="expense-table__body svelte-1q6qyt8" role="rowgroup"><div class="expense-table__inner svelte-1q6qyt8"${attr_style(`position: relative; height: ${hasExpenses() ? `${virtualList.totalHeight}px` : "auto"};`)}>`);
		if (hasExpenses()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(virtualList.visibleItems);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let { item: expense, originalIndex } = each_array_1[$$index_1];
				$$renderer.push(`<div class="expense-table__row-wrapper svelte-1q6qyt8"${attr_style(`top: ${stringify(originalIndex * ROW_HEIGHT)}px;`)}>`);
				ExpenseRow($$renderer, {
					expense,
					isHighlighted: isInTopCategory(expense, topCategories),
					isSelected: isSelected(expense.id),
					onToggleSelect,
					onEdit,
					onDuplicate
				});
				$$renderer.push(`<!----></div>`);
			}
			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="expense-table__empty svelte-1q6qyt8" role="row"><span class="expense-table__empty-icon svelte-1q6qyt8" aria-hidden="true">😺</span> <p class="expense-table__empty-title svelte-1q6qyt8">No expenses yet</p> <p class="expense-table__empty-text svelte-1q6qyt8">Click "Add Expense" to start tracking your cat's spending!</p></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div>`);
	});
}
//#endregion
//#region src/lib/services/catFactService.ts
/**
* Cat Facts API service — Single Responsibility Principle.
*
* Sole responsibility: fetching random cat facts from the external API.
* Returns the fact string on success, throws on failure.
* AbortSignal support enables proper cleanup on component unmount.
*
* Offline cache: successfully fetched facts are stored in localStorage
* (up to CAT_FACT_CACHE_MAX entries) so that callers can display a
* previously-seen fact when the network is unavailable.
*/
/**
* Returns the current array of cached cat facts stored in localStorage.
* Returns an empty array if the cache is empty or corrupt.
*/
function getCachedFacts() {
	try {
		const raw = localStorage.getItem(CAT_FACT_CACHE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) return parsed;
		return [];
	} catch {
		return [];
	}
}
/**
* Adds a fact to the localStorage cache. Keeps only the most recent
* CAT_FACT_CACHE_MAX facts to avoid unbounded growth.
* Deduplicates — already-cached facts are not re-added.
*/
function cacheFact(fact) {
	try {
		const current = getCachedFacts();
		if (current.includes(fact)) return;
		const updated = [...current, fact].slice(-10);
		localStorage.setItem(CAT_FACT_CACHE_KEY, JSON.stringify(updated));
	} catch {}
}
/**
* Fetches a random cat fact from the Cat Facts API and caches it.
*
* @param signal - Optional AbortSignal for cancellation
* @returns The cat fact string
* @throws Error if the request fails or response is invalid
*/
async function fetchCatFact(signal) {
	const response = await fetch(CAT_FACT_API_URL, { signal });
	if (!response.ok) throw new Error(`Cat fact API returned HTTP ${response.status}`);
	const data = await response.json();
	cacheFact(data.fact);
	return data.fact;
}
//#endregion
//#region src/lib/state/catFact.svelte.ts
var getOfflineFact = () => {
	const cached = getCachedFacts();
	if (cached.length === 0) return FALLBACK_CAT_FACT;
	return cached[Math.floor(Math.random() * cached.length)];
};
var createCatFact = () => {
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
//#endregion
//#region src/lib/components/CatFactPanel.svelte
function CatFactPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { fact, isLoading, onRefetch } = $$props;
		let catFactClasses = derived(() => ["expense-dialog__cat-fact", isLoading ? "expense-dialog__cat-fact--loading" : ""].filter(Boolean).join(" "));
		$$renderer.push(`<div${attr_class(clsx(catFactClasses()))} aria-live="polite"><div class="expense-dialog__cat-fact-icon-wrapper"><span class="expense-dialog__cat-fact-icon" aria-hidden="true">🐾</span></div> <div class="expense-dialog__cat-fact-header"><h3 class="expense-dialog__cat-fact-title">Random cat fact</h3> <button${attr_class(`expense-dialog__cat-fact-refresh ${isLoading ? "expense-dialog__cat-fact-refresh--spinning" : ""}`)} type="button"${attr("disabled", isLoading, true)} aria-label="Refresh cat fact" id="dialog-refresh-fact-button">↻</button></div> <p class="expense-dialog__cat-fact-text">${escape_html(isLoading ? "Loading a purr-fect fact..." : fact)}</p></div>`);
	});
}
//#endregion
//#region src/lib/components/ExpenseForm.svelte
function ExpenseForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { mode, onSubmit, nameInputRef = void 0 } = $$props;
		function getInitialValues(mode) {
			if (mode.type === "edit") return {
				name: mode.expense.name,
				category: mode.expense.category,
				amount: String(mode.expense.amount)
			};
			return {
				name: "",
				category: "",
				amount: ""
			};
		}
		const initialValues = getInitialValues(mode);
		let name = initialValues.name;
		let category = initialValues.category;
		let amount = initialValues.amount;
		let errors = {};
		const isEditMode = derived(() => mode.type === "edit");
		const submitLabel = derived(() => isEditMode() ? "Update" : "Submit");
		$$renderer.push(`<form class="expense-dialog__form" novalidate=""><div${attr_class(`expense-dialog__field ${errors.name ? "expense-dialog__field--error" : ""}`)}><label class="expense-dialog__label expense-dialog__label--required" for="expense-name">Item Name</label> <input class="expense-dialog__input" id="expense-name" type="text"${attr("value", name)} placeholder="e.g., Premium Cat Food"${attr("aria-invalid", !!errors.name)}${attr("aria-describedby", errors.name ? "expense-name-error" : void 0)} autocomplete="off"/> `);
		if (errors.name) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="expense-dialog__error-message" id="expense-name-error" role="alert">${escape_html(errors.name)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div${attr_class(`expense-dialog__field ${errors.category ? "expense-dialog__field--error" : ""}`)}><label class="expense-dialog__label expense-dialog__label--required" for="expense-category">Category</label> `);
		$$renderer.select({
			class: "expense-dialog__select",
			id: "expense-category",
			value: category,
			"aria-invalid": !!errors.category,
			"aria-describedby": errors.category ? "expense-category-error" : void 0
		}, ($$renderer) => {
			$$renderer.option({
				value: "",
				disabled: true
			}, ($$renderer) => {
				$$renderer.push(`Select a category`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(CATEGORIES);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let cat = each_array[$$index];
				$$renderer.option({ value: cat }, ($$renderer) => {
					$$renderer.push(`${escape_html(CATEGORY_CONFIG[cat].emoji)} ${escape_html(CATEGORY_CONFIG[cat].label)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(` `);
		if (errors.category) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="expense-dialog__error-message" id="expense-category-error" role="alert">${escape_html(errors.category)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div${attr_class(`expense-dialog__field ${errors.amount ? "expense-dialog__field--error" : ""}`)}><label class="expense-dialog__label expense-dialog__label--required" for="expense-amount">Amount ($)</label> <input class="expense-dialog__input" id="expense-amount" type="text" inputmode="decimal"${attr("value", amount)} placeholder="0.00"${attr("aria-invalid", !!errors.amount)}${attr("aria-describedby", errors.amount ? "expense-amount-error" : void 0)}/> `);
		if (errors.amount) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="expense-dialog__error-message" id="expense-amount-error" role="alert">${escape_html(errors.amount)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="expense-dialog__actions"><button class="expense-dialog__submit" type="submit" id="dialog-submit-button">${escape_html(submitLabel())}</button></div></form>`);
		bind_props($$props, { nameInputRef });
	});
}
//#endregion
//#region src/lib/components/ExpenseDialog.svelte
function ExpenseDialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isOpen, mode, onClose, onSubmit } = $$props;
		const catFactState = createCatFact();
		let nameInputEl = null;
		let viewportStyle = "";
		let contentMaxHeight = "";
		const isEditMode = derived(() => mode.type === "edit");
		const title = derived(() => isEditMode() ? "Edit Expense" : "Add Expense");
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (isOpen) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="expense-dialog__overlay svelte-61jj9g" role="dialog" aria-modal="true"${attr("aria-label", title())} id="expense-dialog"${attr_style(viewportStyle)}><div class="expense-dialog__content svelte-61jj9g"${attr_style(contentMaxHeight)}><div class="expense-dialog__header svelte-61jj9g"><h2 class="expense-dialog__title svelte-61jj9g">${escape_html(title())}</h2> <button class="expense-dialog__close svelte-61jj9g" type="button" aria-label="Close dialog" id="dialog-close-button">✕</button></div> <div class="expense-dialog__body svelte-61jj9g">`);
				ExpenseForm($$renderer, {
					mode,
					onSubmit,
					get nameInputRef() {
						return nameInputEl;
					},
					set nameInputRef($$value) {
						nameInputEl = $$value;
						$$settled = false;
					}
				});
				$$renderer.push(`<!----> `);
				CatFactPanel($$renderer, {
					fact: catFactState.fact,
					isLoading: catFactState.isLoading,
					onRefetch: catFactState.refetch
				});
				$$renderer.push(`<!----></div></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const expensesState = createExpenses(new LocalStorageService(STORAGE_KEY));
		const sortState = createSort("name");
		const sortedExpenses = derived(() => sortExpenses(expensesState.expenses, sortState.sortConfig));
		const expenseIds = derived(() => sortedExpenses().map((e) => e.id));
		const selectionState = createSelection(() => expenseIds());
		let isDialogOpen = false;
		let dialogMode = { type: "add" };
		function handleAddClick() {
			dialogMode = { type: "add" };
			isDialogOpen = true;
		}
		function handleEditClick(expense) {
			dialogMode = {
				type: "edit",
				expense
			};
			isDialogOpen = true;
		}
		function handleDialogClose() {
			isDialogOpen = false;
		}
		function handleDialogSubmit(formData) {
			if (dialogMode.type === "edit") expensesState.updateExpense(dialogMode.expense.id, formData);
			else expensesState.addExpense(formData);
			isDialogOpen = false;
		}
		function handleDeleteClick() {
			if (selectionState.selectedCount === 0) return;
			const idsToDelete = new Set(expenseIds().filter((id) => selectionState.isSelected(id)));
			expensesState.deleteExpenses(idsToDelete);
			selectionState.clearSelection();
		}
		function handleExportClick() {
			exportExpensesToCsv(sortedExpenses());
		}
		$$renderer.push(`<div class="app"><div class="app__container">`);
		Header($$renderer, {});
		$$renderer.push(`<!----> <main class="app__main" id="main-content">`);
		ActionBar($$renderer, {
			onAddClick: handleAddClick,
			onDeleteClick: handleDeleteClick,
			onExportClick: handleExportClick,
			selectedCount: selectionState.selectedCount,
			isDeleteDisabled: selectionState.selectedCount === 0,
			isExportDisabled: expensesState.expenses.length === 0
		});
		$$renderer.push(`<!----> `);
		SpendingChart($$renderer, {
			expenses: expensesState.expenses,
			topCategories: expensesState.topCategories
		});
		$$renderer.push(`<!----> `);
		ExpenseTable($$renderer, {
			expenses: sortedExpenses(),
			topCategories: expensesState.topCategories,
			sortConfig: sortState.sortConfig,
			onSort: sortState.handleSort,
			isAllSelected: selectionState.isAllSelected,
			isSomeSelected: selectionState.isSomeSelected,
			onToggleAll: selectionState.toggleAll,
			isSelected: selectionState.isSelected,
			onToggleSelect: selectionState.toggle,
			onEdit: handleEditClick,
			onDuplicate: expensesState.duplicateExpense
		});
		$$renderer.push(`<!----></main> <footer class="app__footer">Made with <span class="app__footer-heart" aria-label="love">❤️</span> for cats everywhere</footer></div> `);
		ExpenseDialog($$renderer, {
			isOpen: isDialogOpen,
			mode: dialogMode,
			onClose: handleDialogClose,
			onSubmit: handleDialogSubmit
		});
		$$renderer.push(`<!----></div>`);
	});
}
//#endregion
export { _page as default };
