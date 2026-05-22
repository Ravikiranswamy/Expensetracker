// Expense Tracker Expenses Page Manager

let expensesList = [];
let filteredExpenses = [];
let currentPage = 1;
const pageSize = 10;
let sortField = 'date';
let sortDirection = 'desc';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Layout
    initLayout('expenses');
    
    // Set default date to today in form
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    
    // Bind Event Listeners
    document.getElementById('open-add-modal-btn').addEventListener('click', () => openModal());
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);
    document.getElementById('expense-form').addEventListener('submit', handleFormSubmit);
    
    // Filters & Search
    document.getElementById('search-input').addEventListener('input', () => {
        currentPage = 1;
        applyFiltersAndSort();
    });
    document.getElementById('filter-category').addEventListener('change', () => {
        currentPage = 1;
        applyFiltersAndSort();
    });
    document.getElementById('filter-payment').addEventListener('change', () => {
        currentPage = 1;
        applyFiltersAndSort();
    });
    
    // Export CSV
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
    
    // Pagination
    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderExpenses();
        }
    });
    document.getElementById('next-page-btn').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredExpenses.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderExpenses();
        }
    });
    
    // Sorting Headers
    setupSorting();
    
    // Fetch records
    fetchExpenses();
});

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Fetch Expenses
async function fetchExpenses() {
    try {
        const data = await api.get('/expenses');
        expensesList = data;
        applyFiltersAndSort();
    } catch (err) {
        showToast('Failed to load expenses', 'error');
    }
}

// Setup sorting listeners
function setupSorting() {
    const headers = [
        { id: 'sort-date', field: 'date' },
        { id: 'sort-desc', field: 'description' },
        { id: 'sort-category', field: 'category' },
        { id: 'sort-payment', field: 'paymentMethod' },
        { id: 'sort-amount', field: 'amount' }
    ];
    
    headers.forEach(header => {
        const el = document.getElementById(header.id);
        if (el) {
            el.addEventListener('click', () => {
                if (sortField === header.field) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortField = header.field;
                    sortDirection = (header.field === 'date' || header.field === 'amount') ? 'desc' : 'asc';
                }
                applyFiltersAndSort();
            });
        }
    });
}

// Update the sort indicators in table headers
function updateSortIndicators() {
    const headers = [
        { id: 'sort-date', field: 'date' },
        { id: 'sort-desc', field: 'description' },
        { id: 'sort-category', field: 'category' },
        { id: 'sort-payment', field: 'paymentMethod' },
        { id: 'sort-amount', field: 'amount' }
    ];
    
    headers.forEach(header => {
        const el = document.getElementById(header.id);
        if (el) {
            const indicator = el.querySelector('.sort-indicator');
            if (indicator) {
                if (sortField === header.field) {
                    indicator.innerText = sortDirection === 'asc' ? '▲' : '▼';
                    el.style.color = 'var(--primary)';
                } else {
                    indicator.innerText = '↕';
                    el.style.color = '';
                }
            }
        }
    });
}

// Apply filter input values and sorting rules
function applyFiltersAndSort() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
    const selectedCategory = document.getElementById('filter-category').value;
    const selectedPayment = document.getElementById('filter-payment').value;
    
    // Filter
    filteredExpenses = expensesList.filter(expense => {
        const descMatch = (expense.description || '').toLowerCase().includes(searchQuery);
        const catMatch = !selectedCategory || expense.category === selectedCategory;
        const payMatch = !selectedPayment || expense.paymentMethod === selectedPayment;
        return descMatch && catMatch && payMatch;
    });
    
    // Sort
    filteredExpenses.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        
        // Handle null/undefined values
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';
        
        if (sortField === 'amount') {
            return sortDirection === 'asc' ? valA - valB : valB - valA;
        } else if (sortField === 'date') {
            return sortDirection === 'asc' 
                ? new Date(valA) - new Date(valB) 
                : new Date(valB) - new Date(valA);
        } else {
            // String sorting
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortDirection === 'asc' 
                ? strA.localeCompare(strB) 
                : strB.localeCompare(strA);
        }
    });
    
    // Reset page if out of bounds
    const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    updateSortIndicators();
    renderExpenses();
}

// Render Expenses Table
function renderExpenses() {
    const tbody = document.getElementById('expenses-table-body');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredExpenses.length);
    const paginatedItems = filteredExpenses.slice(startIndex, endIndex);
    
    if (paginatedItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    No expenses found matching the criteria.
                </td>
            </tr>
        `;
        document.getElementById('pagination-info').innerText = 'Showing 0 to 0 of 0 entries';
        document.getElementById('prev-page-btn').disabled = true;
        document.getElementById('next-page-btn').disabled = true;
        return;
    }
    
    paginatedItems.forEach(expense => {
        const row = document.createElement('tr');
        
        const formattedDate = new Date(expense.date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td style="font-weight: 500;">${escapeHTML(expense.description || 'N/A')}</td>
            <td><span class="badge badge-expense" style="opacity: 0.85;">${escapeHTML(expense.category)}</span></td>
            <td>${escapeHTML(expense.paymentMethod)}</td>
            <td class="amount-expense">-${formatCurrency(expense.amount)}</td>
            <td style="text-align: right; white-space: nowrap;">
                <button class="btn btn-secondary btn-sm" onclick="editExpense(${expense.id})" style="margin-right: 0.5rem;">
                    Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">
                    Delete
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update pagination details
    document.getElementById('pagination-info').innerText = `Showing ${startIndex + 1} to ${endIndex} of ${filteredExpenses.length} entries`;
    document.getElementById('prev-page-btn').disabled = currentPage === 1;
    document.getElementById('next-page-btn').disabled = currentPage >= Math.ceil(filteredExpenses.length / pageSize);
}

// Open Modal
function openModal(expense = null) {
    const modal = document.getElementById('expense-modal');
    const form = document.getElementById('expense-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('expense-id').value = '';
    
    if (expense) {
        title.innerText = 'Edit Expense';
        document.getElementById('expense-id').value = expense.id;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-payment-method').value = expense.paymentMethod;
        document.getElementById('expense-date').value = expense.date;
        document.getElementById('expense-description').value = expense.description || '';
    } else {
        title.innerText = 'Add New Expense';
    }
    
    modal.classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('expense-modal').classList.remove('active');
}

// Edit Expense (Fetch detail and open)
function editExpense(id) {
    const expense = expensesList.find(e => e.id === id);
    if (expense) {
        openModal(expense);
    }
}

// Delete Expense
async function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            await api.delete(`/expenses/${id}`);
            showToast('Expense deleted successfully', 'success');
            fetchExpenses();
        } catch (err) {
            showToast(err.message || 'Failed to delete expense', 'error');
        }
    }
}

// Form Submit Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('expense-id').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const paymentMethod = document.getElementById('expense-payment-method').value;
    const date = document.getElementById('expense-date').value;
    const description = document.getElementById('expense-description').value.trim();
    
    const payload = { amount, category, paymentMethod, date, description };
    
    try {
        if (id) {
            await api.put(`/expenses/${id}`, payload);
            showToast('Expense updated successfully', 'success');
        } else {
            await api.post('/expenses', payload);
            showToast('Expense recorded successfully', 'success');
        }
        closeModal();
        fetchExpenses();
    } catch (err) {
        showToast(err.message || 'Failed to save expense', 'error');
    }
}

// Export filtered expenses list to CSV
function exportToCSV() {
    if (filteredExpenses.length === 0) {
        showToast('No expenses available to export', 'error');
        return;
    }
    const headers = ['Date', 'Description', 'Category', 'Payment Method', 'Amount'];
    const rows = filteredExpenses.map(expense => [
        expense.date,
        expense.description || '',
        expense.category,
        expense.paymentMethod,
        expense.amount
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully', 'success');
}

// Simple HTML escaping to avoid XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
