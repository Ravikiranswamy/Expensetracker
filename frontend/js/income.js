// Expense Tracker Income Page Manager

let incomeList = [];
let filteredIncome = [];
let currentPage = 1;
const pageSize = 10;
let sortField = 'date';
let sortDirection = 'desc';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Layout
    initLayout('income');
    
    // Set default date to today in form
    document.getElementById('income-date').value = new Date().toISOString().split('T')[0];
    
    // Bind Event Listeners
    document.getElementById('open-add-modal-btn').addEventListener('click', () => openModal());
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);
    document.getElementById('income-form').addEventListener('submit', handleFormSubmit);
    
    // Search
    document.getElementById('search-input').addEventListener('input', () => {
        currentPage = 1;
        applyFiltersAndSort();
    });
    
    // Export CSV
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
    
    // Pagination
    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderIncome();
        }
    });
    document.getElementById('next-page-btn').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredIncome.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderIncome();
        }
    });
    
    // Sorting Headers
    setupSorting();
    
    // Fetch records
    fetchIncome();
});

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Fetch Income
async function fetchIncome() {
    try {
        const data = await api.get('/income');
        incomeList = data;
        applyFiltersAndSort();
    } catch (err) {
        showToast('Failed to load income records', 'error');
    }
}

// Setup sorting listeners
function setupSorting() {
    const headers = [
        { id: 'sort-date', field: 'date' },
        { id: 'sort-desc', field: 'description' },
        { id: 'sort-source', field: 'source' },
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
        { id: 'sort-source', field: 'source' },
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
    
    // Filter
    filteredIncome = incomeList.filter(income => {
        const descMatch = (income.description || '').toLowerCase().includes(searchQuery);
        const srcMatch = (income.source || '').toLowerCase().includes(searchQuery);
        return descMatch || srcMatch;
    });
    
    // Sort
    filteredIncome.sort((a, b) => {
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
    const totalPages = Math.max(1, Math.ceil(filteredIncome.length / pageSize));
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    updateSortIndicators();
    renderIncome();
}

// Render Income Table
function renderIncome() {
    const tbody = document.getElementById('income-table-body');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredIncome.length);
    const paginatedItems = filteredIncome.slice(startIndex, endIndex);
    
    if (paginatedItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    No income records found matching the criteria.
                </td>
            </tr>
        `;
        document.getElementById('pagination-info').innerText = 'Showing 0 to 0 of 0 entries';
        document.getElementById('prev-page-btn').disabled = true;
        document.getElementById('next-page-btn').disabled = true;
        return;
    }
    
    paginatedItems.forEach(income => {
        const row = document.createElement('tr');
        
        const formattedDate = new Date(income.date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td style="font-weight: 500;">${escapeHTML(income.description || 'N/A')}</td>
            <td><span class="badge badge-income" style="opacity: 0.85;">${escapeHTML(income.source)}</span></td>
            <td class="amount-income">+${formatCurrency(income.amount)}</td>
            <td style="text-align: right; white-space: nowrap;">
                <button class="btn btn-secondary btn-sm" onclick="editIncome(${income.id})" style="margin-right: 0.5rem;">
                    Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteIncome(${income.id})">
                    Delete
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update pagination details
    document.getElementById('pagination-info').innerText = `Showing ${startIndex + 1} to ${endIndex} of ${filteredIncome.length} entries`;
    document.getElementById('prev-page-btn').disabled = currentPage === 1;
    document.getElementById('next-page-btn').disabled = currentPage >= Math.ceil(filteredIncome.length / pageSize);
}

// Open Modal
function openModal(income = null) {
    const modal = document.getElementById('income-modal');
    const form = document.getElementById('income-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    document.getElementById('income-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('income-id').value = '';
    
    if (income) {
        title.innerText = 'Edit Income';
        document.getElementById('income-id').value = income.id;
        document.getElementById('income-amount').value = income.amount;
        document.getElementById('income-source').value = income.source;
        document.getElementById('income-date').value = income.date;
        document.getElementById('income-description').value = income.description || '';
    } else {
        title.innerText = 'Add New Income';
    }
    
    modal.classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('income-modal').classList.remove('active');
}

// Edit Income (Fetch detail and open)
function editIncome(id) {
    const income = incomeList.find(i => i.id === id);
    if (income) {
        openModal(income);
    }
}

// Delete Income
async function deleteIncome(id) {
    if (confirm('Are you sure you want to delete this income record?')) {
        try {
            await api.delete(`/income/${id}`);
            showToast('Income record deleted successfully', 'success');
            fetchIncome();
        } catch (err) {
            showToast(err.message || 'Failed to delete income', 'error');
        }
    }
}

// Form Submit Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('income-id').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const source = document.getElementById('income-source').value.trim();
    const date = document.getElementById('income-date').value;
    const description = document.getElementById('income-description').value.trim();
    
    const payload = { amount, source, date, description };
    
    try {
        if (id) {
            await api.put(`/income/${id}`, payload);
            showToast('Income updated successfully', 'success');
        } else {
            await api.post('/income', payload);
            showToast('Income recorded successfully', 'success');
        }
        closeModal();
        fetchIncome();
    } catch (err) {
        showToast(err.message || 'Failed to save income', 'error');
    }
}

// Export filtered income list to CSV
function exportToCSV() {
    if (filteredIncome.length === 0) {
        showToast('No income records available to export', 'error');
        return;
    }
    const headers = ['Date', 'Description', 'Source', 'Amount'];
    const rows = filteredIncome.map(income => [
        income.date,
        income.description || '',
        income.source,
        income.amount
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `income_export_${new Date().toISOString().split('T')[0]}.csv`);
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
