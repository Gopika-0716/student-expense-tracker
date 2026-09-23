/**
 * Student Expense Tracker - Vanilla JavaScript
 * 
 * Beginner-friendly, modular, clean implementation using:
 * - State (arrays, objects)
 * - Array methods: filter(), map(), reduce(), sort()
 * - Browser LocalStorage
 * - DOM manipulation & Event listeners
 * - Form validation
 */

// ==========================================================================
// 1. Constants & Configuration
// ==========================================================================
const STORAGE_KEYS = {
  EXPENSES: 'student_expense_tracker_expenses',
  BUDGET: 'student_expense_tracker_budget'
};

const CATEGORIES = {
  Food: { label: 'Food', icon: '🍔', colorClass: 'cat-food', bgClass: 'cat-bg-food', badgeClass: 'badge-food' },
  Transport: { label: 'Transport', icon: '🚌', colorClass: 'cat-transport', bgClass: 'cat-bg-transport', badgeClass: 'badge-transport' },
  Education: { label: 'Education', icon: '📚', colorClass: 'cat-education', bgClass: 'cat-bg-education', badgeClass: 'badge-education' },
  Entertainment: { label: 'Entertainment', icon: '🎬', colorClass: 'cat-entertainment', bgClass: 'cat-bg-entertainment', badgeClass: 'badge-entertainment' },
  Shopping: { label: 'Shopping', icon: '🛍️', colorClass: 'cat-shopping', bgClass: 'cat-bg-shopping', badgeClass: 'badge-shopping' },
  Other: { label: 'Other', icon: '💡', colorClass: 'cat-other', bgClass: 'cat-bg-other', badgeClass: 'badge-other' }
};

// ==========================================================================
// 2. Application State
// ==========================================================================
let state = {
  expenses: [],               // Array of expense objects: { id, amount, category, description, date }
  monthlyBudget: 0,           // Number: user-defined monthly budget
  searchQuery: '',            // String: active search query
  categoryFilter: 'All',      // String: active category filter ('All' or specific category)
  sortBy: 'date-desc',        // String: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
  editingId: null,            // String or null: id of expense currently being edited
  pendingDeleteId: null       // String or null: id of expense awaiting deletion confirmation
};

// ==========================================================================
// 3. DOM Element References
// ==========================================================================
const elements = {
  // Header
  currentDateDisplay: document.getElementById('current-date-display'),

  // Budget Alert
  budgetAlert: document.getElementById('budget-alert'),
  alertTitle: document.getElementById('alert-title'),
  alertMessage: document.getElementById('alert-message'),
  alertIcon: document.getElementById('alert-icon'),

  // Dashboard Stats
  totalExpensesVal: document.getElementById('total-expenses-val'),
  monthlyBudgetVal: document.getElementById('monthly-budget-val'),
  remainingBudgetVal: document.getElementById('remaining-budget-val'),
  transactionsCountVal: document.getElementById('transactions-count-val'),
  budgetProgressText: document.getElementById('budget-progress-text'),
  openBudgetBtn: document.getElementById('open-budget-btn'),
  remainingIcon: document.getElementById('remaining-icon'),

  // Budget Setup
  toggleBudgetBtn: document.getElementById('toggle-budget-form-btn'),
  budgetForm: document.getElementById('budget-form'),
  budgetInput: document.getElementById('budget-input'),
  cancelBudgetBtn: document.getElementById('cancel-budget-btn'),
  budgetFeedback: document.getElementById('budget-feedback'),
  budgetPercentVal: document.getElementById('budget-percent-val'),
  budgetProgressFill: document.getElementById('budget-progress-fill'),

  // Expense Form
  expenseForm: document.getElementById('expense-form'),
  formHeading: document.getElementById('form-heading'),
  formActionText: document.getElementById('form-action-text'),
  formActionIcon: document.getElementById('form-action-icon'),
  formModeBadge: document.getElementById('form-mode-badge'),
  editNotice: document.getElementById('edit-notice'),
  expenseIdInput: document.getElementById('expense-id'),
  expenseDescInput: document.getElementById('expense-desc'),
  expenseAmountInput: document.getElementById('expense-amount'),
  expenseCategorySelect: document.getElementById('expense-category'),
  expenseDateInput: document.getElementById('expense-date'),
  submitExpenseBtn: document.getElementById('submit-expense-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),

  // Validation Error Spans
  descError: document.getElementById('desc-error'),
  amountError: document.getElementById('amount-error'),
  categoryError: document.getElementById('category-error'),
  dateError: document.getElementById('date-error'),

  // Controls (Search, Filter, Sort)
  searchInput: document.getElementById('search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  filterCategorySelect: document.getElementById('filter-category'),
  sortSelect: document.getElementById('sort-select'),
  activeFiltersBar: document.getElementById('active-filters-bar'),
  activeFilterTags: document.getElementById('active-filter-tags'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),

  // Expense List & Empty State
  expenseList: document.getElementById('expense-list'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-title'),
  emptyDesc: document.getElementById('empty-desc'),
  expenseCountSummary: document.getElementById('expense-count-summary'),
  clearAllBtn: document.getElementById('clear-all-btn'),

  // Spending Analysis
  analysisBars: document.getElementById('analysis-bars'),
  analysisEmpty: document.getElementById('analysis-empty'),

  // Delete Modal
  deleteModal: document.getElementById('delete-modal'),
  confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
  cancelDeleteBtn: document.getElementById('cancel-delete-btn'),
  modalExpensePreview: document.getElementById('modal-expense-preview'),

  // Clear All Modal
  clearAllModal: document.getElementById('clear-all-modal'),
  confirmClearAllBtn: document.getElementById('confirm-clear-all-btn'),
  cancelClearAllBtn: document.getElementById('cancel-clear-all-btn'),

  // Toast
  toast: document.getElementById('toast'),
  toastIcon: document.getElementById('toast-icon'),
  toastMessage: document.getElementById('toast-message')
};

// ==========================================================================
// 4. Helper Utilities (Currency, Date, Unique ID, Toast)
// ==========================================================================

/**
 * Format a number as a currency string ($XX.XX)
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num);
}

/**
 * Format an ISO date string (YYYY-MM-DD) into a human readable string (e.g. Sep 24, 2026)
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, monthIndex, day);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return dateString;
}

/**
 * Generate a unique ID for each expense
 * @returns {string}
 */
function generateId() {
  return 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Get today's date formatted as YYYY-MM-DD for date inputs
 * @returns {string}
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Show a floating toast notification
 * @param {string} message
 * @param {'success' | 'danger' | 'warning' | 'info'} type
 */
let toastTimeoutId = null;
function showToast(message, type = 'success') {
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  const icons = {
    success: '✅',
    danger: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  elements.toastIcon.textContent = icons[type] || 'ℹ️';
  elements.toastMessage.textContent = message;

  // Reset classes
  elements.toast.className = 'toast';
  elements.toast.classList.add(`toast-${type}`);
  elements.toast.classList.remove('hidden');

  toastTimeoutId = setTimeout(() => {
    elements.toast.classList.add('hidden');
    toastTimeoutId = null;
  }, 3200);
}

// ==========================================================================
// 5. LocalStorage Management
// ==========================================================================

/**
 * Load expenses and budget from browser LocalStorage
 */
function loadFromStorage() {
  try {
    const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (storedExpenses) {
      const parsed = JSON.parse(storedExpenses);
      if (Array.isArray(parsed)) {
        state.expenses = parsed;
      }
    }

    const storedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (storedBudget !== null) {
      const parsedBudget = parseFloat(storedBudget);
      if (!isNaN(parsedBudget) && parsedBudget >= 0) {
        state.monthlyBudget = parsedBudget;
      }
    }
  } catch (error) {
    console.error('Failed to load data from LocalStorage:', error);
    showToast('Could not load saved data. Starting fresh.', 'warning');
  }
}

/**
 * Save current expenses array to LocalStorage
 */
function saveExpensesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(state.expenses));
  } catch (error) {
    console.error('Failed to save expenses to LocalStorage:', error);
    showToast('Failed to save expenses to storage.', 'danger');
  }
}

/**
 * Save monthly budget to LocalStorage
 */
function saveBudgetToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, state.monthlyBudget.toString());
  } catch (error) {
    console.error('Failed to save budget to LocalStorage:', error);
    showToast('Failed to save budget to storage.', 'danger');
  }
}

// ==========================================================================
// 6. Calculation Helpers (Array methods: reduce, map, filter, sort)
// ==========================================================================

/**
 * Calculate total expenses amount using reduce()
 * @returns {number}
 */
function calculateTotalExpenses() {
  return state.expenses.reduce((total, expense) => total + Number(expense.amount), 0);
}

/**
 * Calculate spending totals grouped by category using reduce()
 * @returns {Object.<string, number>}
 */
function calculateCategoryTotals() {
  // Initialize with 0 for all known categories
  const totals = Object.keys(CATEGORIES).reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {});

  // Sum up expenses
  state.expenses.forEach(expense => {
    if (totals[expense.category] !== undefined) {
      totals[expense.category] += Number(expense.amount);
    } else {
      totals.Other += Number(expense.amount);
    }
  });

  return totals;
}

/**
 * Filter and sort expenses according to active search, category, and sort controls
 * Demonstrates filter() and sort()
 * @returns {Array}
 */
function getFilteredAndSortedExpenses() {
  let result = [...state.expenses];

  // 1. Search filter: search in description and category (case-insensitive)
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.trim().toLowerCase();
    result = result.filter(item => {
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      return matchDesc || matchCat;
    });
  }

  // 2. Category filter
  if (state.categoryFilter !== 'All') {
    result = result.filter(item => item.category === state.categoryFilter);
  }

  // 3. Sorting
  result.sort((a, b) => {
    if (state.sortBy === 'date-desc') {
      return new Date(b.date) - new Date(a.date);
    } else if (state.sortBy === 'date-asc') {
      return new Date(a.date) - new Date(b.date);
    } else if (state.sortBy === 'amount-desc') {
      return Number(b.amount) - Number(a.amount);
    } else if (state.sortBy === 'amount-asc') {
      return Number(a.amount) - Number(b.amount);
    }
    return 0;
  });

  return result;
}

// ==========================================================================
// 7. Rendering Functions (DOM Updates)
// ==========================================================================

/**
 * Update the Dashboard summary cards and Budget Progress Bar
 */
function renderDashboard() {
  const total = calculateTotalExpenses();
  const budget = state.monthlyBudget;
  const remaining = budget - total;
  const count = state.expenses.length;

  // Update card values
  elements.totalExpensesVal.textContent = formatCurrency(total);
  elements.monthlyBudgetVal.textContent = formatCurrency(budget);
  elements.remainingBudgetVal.textContent = formatCurrency(remaining);
  elements.transactionsCountVal.textContent = count.toString();

  // Clear button visibility
  if (count > 0) {
    elements.clearAllBtn.classList.remove('hidden');
  } else {
    elements.clearAllBtn.classList.add('hidden');
  }

  // Remaining budget card styling
  if (budget <= 0) {
    elements.remainingBudgetVal.className = 'stat-value';
    elements.budgetProgressText.textContent = 'Set your monthly budget';
    elements.remainingIcon.textContent = '⚖️';
    elements.remainingIcon.className = 'stat-icon icon-info';
    elements.budgetPercentVal.textContent = '0%';
    elements.budgetProgressFill.style.width = '0%';
    elements.budgetProgressFill.className = 'progress-fill';
    elements.budgetAlert.classList.add('hidden');
    return;
  }

  // Calculate percentage of budget used
  const percentUsed = Math.round((total / budget) * 100);
  elements.budgetPercentVal.textContent = `${percentUsed}% used`;

  // Clamp bar visual width to 100% max
  const barWidth = Math.min(percentUsed, 100);
  elements.budgetProgressFill.style.width = `${barWidth}%`;

  // Budget status and alert logic
  if (total > budget) {
    // Exceeded Budget
    const overage = total - budget;
    elements.remainingBudgetVal.className = 'stat-value danger';
    elements.budgetProgressText.textContent = `Exceeded by ${formatCurrency(overage)}`;
    elements.remainingIcon.textContent = '🚨';
    elements.remainingIcon.className = 'stat-icon icon-danger';

    elements.budgetProgressFill.className = 'progress-fill danger';

    // Show warning banner
    elements.budgetAlert.classList.remove('hidden', 'warning');
    elements.alertIcon.textContent = '🚨';
    elements.alertTitle.textContent = 'Budget Exceeded:';
    elements.alertMessage.textContent = `You have exceeded your $${budget.toFixed(2)} budget by ${formatCurrency(overage)}! Consider cutting back on discretionary spending.`;
  } else if (percentUsed >= 80) {
    // Near Budget Limit (80% - 100%)
    elements.remainingBudgetVal.className = 'stat-value';
    elements.budgetProgressText.textContent = `${formatCurrency(remaining)} left (${100 - percentUsed}% remaining)`;
    elements.remainingIcon.textContent = '⚠️';
    elements.remainingIcon.className = 'stat-icon icon-warning';

    elements.budgetProgressFill.className = 'progress-fill warning';

    // Show cautionary warning banner
    elements.budgetAlert.classList.remove('hidden');
    elements.budgetAlert.classList.add('warning');
    elements.alertIcon.textContent = '⚠️';
    elements.alertTitle.textContent = 'Budget Caution:';
    elements.alertMessage.textContent = `You have used ${percentUsed}% of your monthly budget. Only ${formatCurrency(remaining)} remains.`;
  } else {
    // Healthy Budget (<80%)
    elements.remainingBudgetVal.className = 'stat-value success';
    elements.budgetProgressText.textContent = `${formatCurrency(remaining)} left (${100 - percentUsed}% remaining)`;
    elements.remainingIcon.textContent = '✅';
    elements.remainingIcon.className = 'stat-icon icon-success';

    elements.budgetProgressFill.className = 'progress-fill';
    elements.budgetAlert.classList.add('hidden');
  }
}

/**
 * Render the spending breakdown by category (CSS/SVG bars)
 */
function renderSpendingAnalysis() {
  const total = calculateTotalExpenses();
  const categoryTotals = calculateCategoryTotals();

  elements.analysisBars.innerHTML = '';

  if (total <= 0) {
    elements.analysisEmpty.classList.remove('hidden');
    return;
  }

  elements.analysisEmpty.classList.add('hidden');

  // Sort categories by amount descending
  const sortedCategories = Object.keys(CATEGORIES).sort((a, b) => {
    return categoryTotals[b] - categoryTotals[a];
  });

  sortedCategories.forEach(categoryName => {
    const amount = categoryTotals[categoryName];
    if (amount <= 0) return; // Only display categories with spending

    const percentage = ((amount / total) * 100).toFixed(1);
    const categoryInfo = CATEGORIES[categoryName] || CATEGORIES.Other;

    const barItem = document.createElement('div');
    barItem.className = 'category-bar-item';
    barItem.innerHTML = `
      <div class="category-info-row">
        <span class="category-name-tag">
          <span>${categoryInfo.icon}</span>
          <span class="${categoryInfo.colorClass}">${categoryInfo.label}</span>
        </span>
        <span class="category-amount-tag">
          <strong>${formatCurrency(amount)}</strong> (${percentage}%)
        </span>
      </div>
      <div class="category-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentage}">
        <div class="category-fill ${categoryInfo.bgClass}" style="width: ${percentage}%"></div>
      </div>
    `;

    elements.analysisBars.appendChild(barItem);
  });
}

/**
 * Render the filtered & sorted list of expenses
 */
function renderExpenseList() {
  const filteredList = getFilteredAndSortedExpenses();
  const totalCount = state.expenses.length;
  const filteredCount = filteredList.length;

  // Update summary header
  if (totalCount === 0) {
    elements.expenseCountSummary.textContent = 'No expenses recorded yet';
  } else if (filteredCount === totalCount) {
    elements.expenseCountSummary.textContent = `Showing all ${totalCount} expense${totalCount === 1 ? '' : 's'}`;
  } else {
    elements.expenseCountSummary.textContent = `Showing ${filteredCount} of ${totalCount} expenses`;
  }

  // Active filters banner
  updateActiveFiltersBar();

  // Clear current list
  elements.expenseList.innerHTML = '';

  if (filteredCount === 0) {
    elements.emptyState.classList.remove('hidden');
    if (totalCount > 0) {
      elements.emptyTitle.textContent = 'No matching expenses';
      elements.emptyDesc.textContent = 'No expenses match your active search or category filter. Try clearing filters.';
    } else {
      elements.emptyTitle.textContent = 'No expenses recorded yet';
      elements.emptyDesc.textContent = 'Add your first expense using the form on the left to start taking control of your student budget!';
    }
    return;
  }

  elements.emptyState.classList.add('hidden');

  // Render each expense item
  filteredList.forEach(expense => {
    const categoryInfo = CATEGORIES[expense.category] || CATEGORIES.Other;
    const formattedDate = formatDate(expense.date);
    const formattedAmount = formatCurrency(expense.amount);

    const li = document.createElement('li');
    li.className = 'expense-item';
    li.id = `item-${expense.id}`;

    li.innerHTML = `
      <div class="expense-item-left">
        <div class="expense-category-badge ${categoryInfo.badgeClass}" title="${categoryInfo.label}">
          ${categoryInfo.icon}
        </div>
        <div class="expense-details">
          <span class="expense-title" title="${escapeHtml(expense.description)}">${escapeHtml(expense.description)}</span>
          <div class="expense-meta">
            <span class="meta-category-name ${categoryInfo.colorClass}">${categoryInfo.label}</span>
            <span class="meta-dot">&bull;</span>
            <span class="meta-date">${formattedDate}</span>
          </div>
        </div>
      </div>
      <div class="expense-item-right">
        <span class="expense-amount-display">${formattedAmount}</span>
        <div class="item-actions">
          <button 
            type="button" 
            class="btn-icon btn-edit" 
            data-id="${expense.id}" 
            title="Edit Expense" 
            aria-label="Edit expense: ${escapeHtml(expense.description)}"
          >
            ✏️
          </button>
          <button 
            type="button" 
            class="btn-icon btn-delete" 
            data-id="${expense.id}" 
            title="Delete Expense" 
            aria-label="Delete expense: ${escapeHtml(expense.description)}"
          >
            🗑️
          </button>
        </div>
      </div>
    `;

    elements.expenseList.appendChild(li);
  });
}

/**
 * Update the active filter tags row
 */
function updateActiveFiltersBar() {
  const hasSearch = state.searchQuery.trim() !== '';
  const hasCategory = state.categoryFilter !== 'All';

  if (!hasSearch && !hasCategory) {
    elements.activeFiltersBar.classList.add('hidden');
    return;
  }

  elements.activeFiltersBar.classList.remove('hidden');
  let tagsHtml = '';

  if (hasSearch) {
    tagsHtml += `<span class="filter-tag">Search: "${escapeHtml(state.searchQuery)}"</span> `;
  }
  if (hasCategory) {
    tagsHtml += `<span class="filter-tag">Category: ${escapeHtml(state.categoryFilter)}</span> `;
  }

  elements.activeFilterTags.innerHTML = tagsHtml;
}

/**
 * Master render function that updates all views
 */
function renderAll() {
  renderDashboard();
  renderSpendingAnalysis();
  renderExpenseList();
}

/**
 * Basic HTML sanitizer to avoid script injection in text nodes
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// 8. Form Validation & Handling (Add & Edit)
// ==========================================================================

/**
 * Clear all inline form error messages
 */
function clearFormErrors() {
  elements.descError.textContent = '';
  elements.amountError.textContent = '';
  elements.categoryError.textContent = '';
  elements.dateError.textContent = '';

  elements.expenseDescInput.classList.remove('invalid');
  elements.expenseAmountInput.classList.remove('invalid');
  elements.expenseCategorySelect.classList.remove('invalid');
  elements.expenseDateInput.classList.remove('invalid');
}

/**
 * Validate expense form inputs according to rules:
 * - Amount must be greater than 0
 * - Category is required
 * - Description is required
 * - Date is required
 * @returns {boolean} True if valid, false otherwise
 */
function validateExpenseForm(description, amount, category, date) {
  let isValid = true;
  clearFormErrors();

  if (!description || description.trim() === '') {
    elements.descError.textContent = 'Description is required.';
    elements.expenseDescInput.classList.add('invalid');
    isValid = false;
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    elements.amountError.textContent = 'Amount must be greater than $0.00.';
    elements.expenseAmountInput.classList.add('invalid');
    isValid = false;
  }

  if (!category || category === '') {
    elements.categoryError.textContent = 'Please choose a category.';
    elements.expenseCategorySelect.classList.add('invalid');
    isValid = false;
  }

  if (!date || date.trim() === '') {
    elements.dateError.textContent = 'Please select a valid date.';
    elements.expenseDateInput.classList.add('invalid');
    isValid = false;
  }

  return isValid;
}

/**
 * Reset the expense form back to initial default "Add" mode
 */
function resetExpenseForm() {
  state.editingId = null;
  elements.expenseForm.reset();
  elements.expenseIdInput.value = '';
  elements.expenseDateInput.value = getTodayDateString();

  clearFormErrors();

  // Reset UI elements back to "Add"
  elements.formActionIcon.textContent = '➕';
  elements.formActionText.textContent = 'Add New Expense';
  elements.formModeBadge.textContent = 'New';
  elements.submitExpenseBtn.innerHTML = '<span>Add Expense</span>';
  elements.cancelEditBtn.classList.add('hidden');
  elements.editNotice.classList.add('hidden');
}

/**
 * Populate the form with an existing expense for editing
 * @param {string} expenseId
 */
function startEditingExpense(expenseId) {
  const expense = state.expenses.find(item => item.id === expenseId);
  if (!expense) return;

  state.editingId = expense.id;

  // Populate form fields
  elements.expenseIdInput.value = expense.id;
  elements.expenseDescInput.value = expense.description;
  elements.expenseAmountInput.value = expense.amount;
  elements.expenseCategorySelect.value = expense.category;
  elements.expenseDateInput.value = expense.date;

  clearFormErrors();

  // Update UI to edit mode
  elements.formActionIcon.textContent = '✏️';
  elements.formActionText.textContent = 'Edit Expense';
  elements.formModeBadge.textContent = 'Editing';
  elements.submitExpenseBtn.innerHTML = '<span>Update Expense</span>';
  elements.cancelEditBtn.classList.remove('hidden');
  elements.editNotice.classList.remove('hidden');

  // Scroll to form smoothly for mobile/tablet convenience
  elements.expenseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  elements.expenseDescInput.focus();
}

/**
 * Handle submission of the expense form (both Add and Edit)
 */
function handleExpenseSubmit(event) {
  event.preventDefault();

  const description = elements.expenseDescInput.value.trim();
  const amountStr = elements.expenseAmountInput.value;
  const category = elements.expenseCategorySelect.value;
  const date = elements.expenseDateInput.value;

  // Validate form
  if (!validateExpenseForm(description, amountStr, category, date)) {
    return;
  }

  const amount = parseFloat(parseFloat(amountStr).toFixed(2));

  if (state.editingId) {
    // -------------------------------------------------------------
    // Update existing expense
    // -------------------------------------------------------------
    const index = state.expenses.findIndex(item => item.id === state.editingId);
    if (index !== -1) {
      state.expenses[index] = {
        ...state.expenses[index],
        description,
        amount,
        category,
        date
      };

      saveExpensesToStorage();
      renderAll();
      showToast('Expense updated successfully!', 'success');
      resetExpenseForm();
    }
  } else {
    // -------------------------------------------------------------
    // Add new expense
    // -------------------------------------------------------------
    const newExpense = {
      id: generateId(),
      description,
      amount,
      category,
      date
    };

    // Prepend to array so newest entry is top of default view
    state.expenses.unshift(newExpense);

    saveExpensesToStorage();
    renderAll();
    showToast('Expense added successfully!', 'success');
    resetExpenseForm();
  }
}

// ==========================================================================
// 9. Deletion Management (Single & Clear All with Confirmation)
// ==========================================================================

/**
 * Open the deletion confirmation modal
 * @param {string} expenseId
 */
function openDeleteModal(expenseId) {
  const expense = state.expenses.find(item => item.id === expenseId);
  if (!expense) return;

  state.pendingDeleteId = expenseId;

  // Show preview of expense in modal
  elements.modalExpensePreview.innerHTML = `
    <strong>${escapeHtml(expense.description)}</strong><br>
    Category: ${expense.category} &bull; Date: ${formatDate(expense.date)} &bull; 
    Amount: <strong>${formatCurrency(expense.amount)}</strong>
  `;

  elements.deleteModal.classList.remove('hidden');
}

/**
 * Close deletion modal
 */
function closeDeleteModal() {
  state.pendingDeleteId = null;
  elements.deleteModal.classList.add('hidden');
}

/**
 * Execute deletion after confirmation
 */
function confirmDeleteExpense() {
  if (!state.pendingDeleteId) return;

  const idToDelete = state.pendingDeleteId;
  const targetExpense = state.expenses.find(item => item.id === idToDelete);
  const desc = targetExpense ? targetExpense.description : 'Expense';

  // If we are currently editing this item, cancel editing
  if (state.editingId === idToDelete) {
    resetExpenseForm();
  }

  // Remove using filter()
  state.expenses = state.expenses.filter(item => item.id !== idToDelete);

  saveExpensesToStorage();
  closeDeleteModal();
  renderAll();

  showToast(`"${desc}" deleted.`, 'danger');
}

/**
 * Open clear all modal
 */
function openClearAllModal() {
  if (state.expenses.length === 0) return;
  elements.clearAllModal.classList.remove('hidden');
}

/**
 * Close clear all modal
 */
function closeClearAllModal() {
  elements.clearAllModal.classList.add('hidden');
}

/**
 * Clear all expenses
 */
function confirmClearAll() {
  state.expenses = [];
  if (state.editingId) {
    resetExpenseForm();
  }
  saveExpensesToStorage();
  closeClearAllModal();
  renderAll();
  showToast('All expenses cleared.', 'info');
}

// ==========================================================================
// 10. Budget Setup & Management
// ==========================================================================

/**
 * Toggle the budget form visibility
 */
function toggleBudgetForm(show) {
  const shouldShow = show !== undefined ? show : elements.budgetForm.classList.contains('hidden');
  if (shouldShow) {
    elements.budgetForm.classList.remove('hidden');
    elements.budgetInput.value = state.monthlyBudget > 0 ? state.monthlyBudget : '';
    elements.toggleBudgetBtn.textContent = 'Close';
    elements.budgetInput.focus();
  } else {
    elements.budgetForm.classList.add('hidden');
    elements.toggleBudgetBtn.textContent = 'Configure Budget';
    elements.budgetFeedback.classList.add('hidden');
  }
}

/**
 * Handle budget form submission
 */
function handleBudgetSubmit(event) {
  event.preventDefault();
  const value = parseFloat(elements.budgetInput.value);

  if (isNaN(value) || value < 0) {
    elements.budgetFeedback.textContent = 'Please enter a valid positive budget amount.';
    elements.budgetFeedback.style.color = 'var(--color-danger)';
    elements.budgetFeedback.classList.remove('hidden');
    return;
  }

  state.monthlyBudget = parseFloat(value.toFixed(2));
  saveBudgetToStorage();
  renderDashboard();

  elements.budgetFeedback.textContent = 'Budget updated successfully!';
  elements.budgetFeedback.style.color = 'var(--color-success)';
  elements.budgetFeedback.classList.remove('hidden');

  showToast(`Monthly budget set to ${formatCurrency(state.monthlyBudget)}`, 'success');

  setTimeout(() => {
    toggleBudgetForm(false);
  }, 1200);
}

// ==========================================================================
// 11. Search, Filter, & Sorting Handlers
// ==========================================================================

function handleSearchInput(e) {
  state.searchQuery = e.target.value;
  if (state.searchQuery.trim() !== '') {
    elements.clearSearchBtn.classList.remove('hidden');
  } else {
    elements.clearSearchBtn.classList.add('hidden');
  }
  renderExpenseList();
}

function handleClearSearch() {
  state.searchQuery = '';
  elements.searchInput.value = '';
  elements.clearSearchBtn.classList.add('hidden');
  renderExpenseList();
  elements.searchInput.focus();
}

function handleCategoryFilterChange(e) {
  state.categoryFilter = e.target.value;
  renderExpenseList();
}

function handleSortChange(e) {
  state.sortBy = e.target.value;
  renderExpenseList();
}

function handleResetFilters() {
  state.searchQuery = '';
  state.categoryFilter = 'All';
  elements.searchInput.value = '';
  elements.clearSearchBtn.classList.add('hidden');
  elements.filterCategorySelect.value = 'All';
  renderExpenseList();
  showToast('Filters reset', 'info');
}

// ==========================================================================
// 12. Event Delegation for Expense Items (Edit & Delete)
// ==========================================================================

function handleExpenseListClick(event) {
  const editBtn = event.target.closest('.btn-edit');
  const deleteBtn = event.target.closest('.btn-delete');

  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    startEditingExpense(id);
  } else if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    openDeleteModal(id);
  }
}

// ==========================================================================
// 13. Initialization & Event Listeners
// ==========================================================================

function initApp() {
  // Set current date in header
  const today = new Date();
  elements.currentDateDisplay.textContent = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Set default date in expense form
  elements.expenseDateInput.value = getTodayDateString();

  // Load persisted data from LocalStorage
  loadFromStorage();

  // Setup Event Listeners

  // Expense Form
  elements.expenseForm.addEventListener('submit', handleExpenseSubmit);
  elements.cancelEditBtn.addEventListener('click', resetExpenseForm);

  // Clear validation styling as user types
  elements.expenseDescInput.addEventListener('input', () => {
    elements.descError.textContent = '';
    elements.expenseDescInput.classList.remove('invalid');
  });
  elements.expenseAmountInput.addEventListener('input', () => {
    elements.amountError.textContent = '';
    elements.expenseAmountInput.classList.remove('invalid');
  });
  elements.expenseCategorySelect.addEventListener('change', () => {
    elements.categoryError.textContent = '';
    elements.expenseCategorySelect.classList.remove('invalid');
  });
  elements.expenseDateInput.addEventListener('change', () => {
    elements.dateError.textContent = '';
    elements.expenseDateInput.classList.remove('invalid');
  });

  // Budget Setup
  elements.toggleBudgetBtn.addEventListener('click', () => toggleBudgetForm());
  elements.openBudgetBtn.addEventListener('click', () => toggleBudgetForm(true));
  elements.budgetForm.addEventListener('submit', handleBudgetSubmit);
  elements.cancelBudgetBtn.addEventListener('click', () => toggleBudgetForm(false));

  // Controls (Search, Filter, Sort)
  elements.searchInput.addEventListener('input', handleSearchInput);
  elements.clearSearchBtn.addEventListener('click', handleClearSearch);
  elements.filterCategorySelect.addEventListener('change', handleCategoryFilterChange);
  elements.sortSelect.addEventListener('change', handleSortChange);
  elements.resetFiltersBtn.addEventListener('click', handleResetFilters);

  // Expense List delegation (Edit & Delete)
  elements.expenseList.addEventListener('click', handleExpenseListClick);

  // Clear All
  elements.clearAllBtn.addEventListener('click', openClearAllModal);
  elements.confirmClearAllBtn.addEventListener('click', confirmClearAll);
  elements.cancelClearAllBtn.addEventListener('click', closeClearAllModal);

  // Delete Modal Confirmation
  elements.confirmDeleteBtn.addEventListener('click', confirmDeleteExpense);
  elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  // Close modals on clicking outside / backdrop
  window.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) closeDeleteModal();
    if (e.target === elements.clearAllModal) closeClearAllModal();
  });

  // Escape key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!elements.deleteModal.classList.contains('hidden')) closeDeleteModal();
      if (!elements.clearAllModal.classList.contains('hidden')) closeClearAllModal();
    }
  });

  // Initial rendering of dashboard, analysis, and list
  renderAll();
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
