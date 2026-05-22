// Expense Tracker Dashboard Orchestrator

let categoryChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Layout (Checks authentication and renders sidebar/mobile header)
    initLayout('dashboard');
    
    // 2. Set active Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = `Today is ${new Date().toLocaleDateString('en-US', dateOptions)}`;
    
    // 3. Setup Theme Toggler Listener (for chart color adjustments)
    document.addEventListener('themeChanged', (e) => {
        if (categoryChartInstance) {
            const textPrimaryColor = e.detail.isDark ? '#f9fafb' : '#0f172a';
            categoryChartInstance.options.plugins.legend.labels.color = textPrimaryColor;
            categoryChartInstance.update();
        }
    });

    // 4. Fetch and render Dashboard Metrics & Charts
    await loadDashboardData();
});

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Fetch dashboard data
async function loadDashboardData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // Set username greeting
    document.getElementById('welcome-username').innerText = `Hello, ${user.name}`;
    
    try {
        const summary = await api.get('/dashboard/summary');
        const expenses = await api.get('/expenses');
        
        // Render core counters
        document.getElementById('total-income').innerText = formatCurrency(summary.totalIncome);
        document.getElementById('total-expenses').innerText = formatCurrency(summary.totalExpenses);
        
        const balanceEl = document.getElementById('remaining-balance');
        balanceEl.innerText = formatCurrency(summary.remainingBalance);
        
        // Balance coloring helper
        if (summary.remainingBalance < 0) {
            balanceEl.style.color = 'var(--danger)';
        } else {
            balanceEl.style.color = 'inherit';
        }
        
        // Render Monthly Budget Metrics
        const budgetLimit = summary.monthlyBudget || 0;
        document.getElementById('monthly-budget').innerText = formatCurrency(budgetLimit);
        
        const progressFill = document.getElementById('budget-progress-fill');
        const helperText = document.getElementById('budget-helper-text');
        const warningBanner = document.getElementById('budget-warning-banner');
        
        if (budgetLimit > 0) {
            const monthlyExpenses = summary.monthlyExpenses || 0;
            let percent = (monthlyExpenses / budgetLimit) * 100;
            
            // Cap visual percent at 100%
            const visualPercent = Math.min(percent, 100);
            progressFill.style.width = `${visualPercent}%`;
            
            // Progress Bar Color mapping
            progressFill.className = 'budget-progress-fill'; // Reset classes
            if (percent >= 100) {
                progressFill.classList.add('danger');
                helperText.innerText = `${formatCurrency(monthlyExpenses - budgetLimit)} over your ${formatCurrency(budgetLimit)} limit`;
                
                // Show budget warning banner
                warningBanner.style.display = 'flex';
                document.getElementById('budget-warning-text').innerText = `Warning: You have exceeded your monthly spending budget by ${formatCurrency(monthlyExpenses - budgetLimit)}!`;
            } else if (percent >= 80) {
                progressFill.classList.add('warning');
                helperText.innerText = `${formatCurrency(budgetLimit - monthlyExpenses)} remaining of ${formatCurrency(budgetLimit)} limit`;
                warningBanner.style.display = 'none';
            } else {
                progressFill.style.backgroundColor = 'var(--success)';
                helperText.innerText = `${formatCurrency(budgetLimit - monthlyExpenses)} remaining of ${formatCurrency(budgetLimit)} limit`;
                warningBanner.style.display = 'none';
            }
        } else {
            progressFill.style.width = '0%';
            helperText.innerText = 'No budget limit configured';
            warningBanner.style.display = 'none';
        }
        
        // Render Recent Transactions
        const tbody = document.getElementById('recent-transactions-body');
        tbody.innerHTML = '';
        
        if (!summary.recentTransactions || summary.recentTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                        No transactions recorded this month. Add an expense or income to start.
                    </td>
                </tr>
            `;
        } else {
            summary.recentTransactions.forEach(tx => {
                const row = document.createElement('tr');
                
                const formattedDate = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                
                const isIncome = tx.type === 'INCOME';
                const typeBadge = `<span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">${tx.type.toLowerCase()}</span>`;
                const amountClass = isIncome ? 'amount-income' : 'amount-expense';
                const amountPrefix = isIncome ? '+' : '-';
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td style="font-weight: 500;">${escapeHTML(tx.description || 'N/A')}</td>
                    <td>${escapeHTML(tx.categoryOrSource)}</td>
                    <td>${typeBadge}</td>
                    <td class="${amountClass}">${amountPrefix}${formatCurrency(tx.amount)}</td>
                `;
                
                tbody.appendChild(row);
            });
        }
        
        // 5. Render charts & insights
        renderCategoryChart(expenses);
        generateInsights(summary, expenses);
        
    } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
        showToast('Failed to load financial records', 'error');
    }
}

// Render the category doughnut chart using Chart.js
function renderCategoryChart(expenses) {
    const canvas = document.getElementById('category-chart');
    const noDataEl = document.getElementById('no-chart-data');
    if (!canvas) return;
    
    if (!expenses || expenses.length === 0) {
        canvas.style.display = 'none';
        noDataEl.style.display = 'block';
        return;
    }
    
    canvas.style.display = 'block';
    noDataEl.style.display = 'none';
    
    // Aggregate by category
    const categoryTotals = {};
    expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    if (labels.length === 0) {
        canvas.style.display = 'none';
        noDataEl.style.display = 'block';
        return;
    }
    
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }
    
    const isDark = document.body.classList.contains('dark');
    const textPrimaryColor = isDark ? '#f9fafb' : '#0f172a';
    
    const colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#ef4444', // red
        '#f59e0b', // amber
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#f97316'  // orange
    ];
    
    categoryChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: isDark ? 2 : 1,
                borderColor: isDark ? '#1f2937' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textPrimaryColor,
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        boxWidth: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// Generate rule-based financial advice insights
function generateInsights(summary, expenses) {
    const textEl = document.getElementById('ai-suggestion-text');
    if (!textEl) return;
    
    const totalIncome = summary.totalIncome || 0;
    const totalExpenses = summary.totalExpenses || 0;
    const monthlyExpenses = summary.monthlyExpenses || 0;
    const budgetLimit = summary.monthlyBudget || 0;
    
    let insights = [];
    
    // 1. Balance warning
    if (totalExpenses > totalIncome && totalIncome > 0) {
        insights.push("<strong>Overspending Risk</strong>: Your total expenses exceed your total income. Consider reviewing non-essential categories to rebalance your cash flow.");
    }
    
    // 2. Budget threshold alerts
    if (budgetLimit > 0) {
        const percent = (monthlyExpenses / budgetLimit) * 100;
        if (percent >= 100) {
            insights.push(`<strong>Limit Exceeded</strong>: You are <strong>${formatCurrency(monthlyExpenses - budgetLimit)}</strong> over your set limit of ${formatCurrency(budgetLimit)}. Tighten spending to recover.`);
        } else if (percent >= 85) {
            insights.push(`<strong>High Utilization</strong>: You have used <strong>${percent.toFixed(0)}%</strong> of your budget. Delay any luxury purchases to stay under limit.`);
        } else if (percent >= 50) {
            insights.push(`<strong>Mid-Month Check</strong>: You've used <strong>${percent.toFixed(0)}%</strong> of your budget. You have <strong>${formatCurrency(budgetLimit - monthlyExpenses)}</strong> left to spend.`);
        } else {
            insights.push("<strong>On Track</strong>: Your monthly spending is well within budget limits. Keep up the good work to achieve your savings goal!");
        }
    } else {
        insights.push("<strong>Setup Alert</strong>: Set a Monthly Budget limit in Settings to unlock real-time budget progress bar tracking and alerts.");
    }
    
    // 3. Highest spending category spotlight
    if (expenses && expenses.length > 0) {
        const categoryTotals = {};
        expenses.forEach(e => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
        });
        
        let highestCategory = "";
        let highestAmount = 0;
        for (const cat in categoryTotals) {
            if (categoryTotals[cat] > highestAmount) {
                highestAmount = categoryTotals[cat];
                highestCategory = cat;
            }
        }
        
        if (highestCategory && highestAmount > 0) {
            insights.push(`<strong>Top Category</strong>: You have spent <strong>${formatCurrency(highestAmount)}</strong> on <strong>${highestCategory}</strong>, making it your highest category. Consider reducing micro-transactions here.`);
        }
    }
    
    // Combine list of insights
    if (insights.length === 0) {
        textEl.innerHTML = "Add expenses or income transactions to receive dynamic financial suggestions.";
    } else {
        textEl.innerHTML = insights.map(ins => `• ${ins}`).join("<br><br>");
    }
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
