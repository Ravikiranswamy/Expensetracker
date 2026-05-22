// Expense Tracker Session & Layout Orchestration

// Check authentication state
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    const isAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');
    
    if (!token || !user) {
        if (!isAuthPage) {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    if (isAuthPage) {
        window.location.href = 'dashboard.html';
        return true;
    }
    
    return JSON.parse(user);
}

// Global Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 800);
}

// Toast notification helper
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    let icon = '';
    if (type === 'success') {
        icon = '<svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
        icon = '<svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    } else {
        icon = '<svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${icon} <span>${message}</span>`;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);

    // Auto dismiss
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Render dynamic sidebar
function initLayout(activePage) {
    const user = checkAuth();
    if (!user) return;

    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = `
            <aside class="sidebar" id="app-sidebar">
                <div class="logo-container">
                    <div class="logo-icon">ET</div>
                    <div class="logo-brand">
                        <div class="logo-text">ExpenseTracker</div>
                    </div>
                </div>
                <ul class="nav-links">
                    <li class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
                        <a href="dashboard.html">
                            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
                            Dashboard
                        </a>
                    </li>
                    <li class="nav-item ${activePage === 'expenses' ? 'active' : ''}">
                        <a href="expenses.html">
                            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                            Expenses
                        </a>
                    </li>
                    <li class="nav-item ${activePage === 'income' ? 'active' : ''}">
                        <a href="income.html">
                            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                            Income
                        </a>
                    </li>
                    <li class="nav-item ${activePage === 'settings' ? 'active' : ''}">
                        <a href="settings.html">
                            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                            Settings
                        </a>
                    </li>
                </ul>
                <div class="user-profile-section">
                    <div class="user-info">
                        <div class="user-avatar" id="sidebar-avatar">${user.name.charAt(0)}</div>
                        <div class="user-details">
                            <div class="user-name" id="sidebar-name">${user.name}</div>
                            <div class="user-email" id="sidebar-email">${user.email}</div>
                        </div>
                    </div>
                    <button class="logout-btn" id="logout-button">
                        <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Log out
                    </button>
                </div>
            </aside>
        `;
        
        // Add logout button event listener
        document.getElementById('logout-button').addEventListener('click', logout);
    }

    // Render mobile nav header
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobile-nav-header';
    mobileHeader.innerHTML = `
        <button class="mobile-menu-btn" id="mobile-menu-toggle">
            <svg style="width: 1.5rem; height: 1.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="logo-brand" style="flex-grow: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding-left: 0.5rem;">
            <div class="logo-text" style="font-size: 1.1rem; line-height: 1.1;">ExpenseTracker</div>
        </div>
        <div class="user-avatar" style="width: 2rem; height: 2rem; font-size: 0.8rem;">${user.name.charAt(0)}</div>
    `;
    
    document.body.prepend(mobileHeader);

    // Set up toggle listener for mobile sidebar
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('app-sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Initialize theme state and toggler globally
    initTheme();

}

// Global Theme Management
function initTheme() {
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    
    if (isDark) {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }
    
    updateGlobalThemeIcon(isDark);
    
    const themeToggleBtn = document.getElementById('dark-theme-toggle');
    if (themeToggleBtn) {
        // Clone the button to discard any previous event listeners
        const newToggleBtn = themeToggleBtn.cloneNode(true);
        themeToggleBtn.parentNode.replaceChild(newToggleBtn, themeToggleBtn);
        
        newToggleBtn.addEventListener('click', () => {
            const currentDark = body.classList.toggle('dark');
            localStorage.setItem('theme', currentDark ? 'dark' : 'light');
            updateGlobalThemeIcon(currentDark);
            
            // Dispatch global event so charts or other components can respond
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark: currentDark } }));
            
            showToast(`Switched to ${currentDark ? 'Dark' : 'Light'} Mode`, 'info');
        });
    }
}

function updateGlobalThemeIcon(isDark) {
    const toggleBtn = document.getElementById('dark-theme-toggle');
    if (!toggleBtn) return;
    
    if (isDark) {
        // Sun icon (for switching to light mode)
        toggleBtn.innerHTML = `<svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    } else {
        // Moon icon (for switching to dark mode)
        toggleBtn.innerHTML = `<svg style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
}
