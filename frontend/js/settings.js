// Expense Tracker Settings Page Manager

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Layout
    initLayout('settings');
    
    // Fetch profile and populate form
    loadSettingsData();
    
    // Handle form submit
    document.getElementById('budget-form').addEventListener('submit', handleBudgetSubmit);
});

// Load Settings Data
async function loadSettingsData() {
    try {
        const profile = await api.get('/users/profile');
        
        document.getElementById('settings-name').value = profile.name;
        document.getElementById('settings-email').value = profile.email;
        document.getElementById('settings-budget').value = profile.monthlyBudget || 0;
    } catch (err) {
        showToast('Failed to load settings data', 'error');
    }
}

// Budget Form Submit Handler
async function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const monthlyBudget = parseFloat(document.getElementById('settings-budget').value);
    
    if (isNaN(monthlyBudget) || monthlyBudget < 0) {
        showToast('Please enter a valid budget amount', 'error');
        return;
    }
    
    try {
        const response = await api.put('/users/budget', { monthlyBudget });
        
        // Update user storage cache
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            user.monthlyBudget = response.monthlyBudget;
            localStorage.setItem('user', JSON.stringify(user));
        }
        
        showToast('Budget configured successfully', 'success');
    } catch (err) {
        showToast(err.message || 'Failed to update budget limit', 'error');
    }
}
