// Expense Tracker API Fetch Client with Automatic Offline Demo Mode Fallback

const API_BASE_URL = 'http://localhost:8080/api';

// Check if running in mock mode or if hosted on GitHub Pages
let useMock = localStorage.getItem('use_mock_api') === 'true' || 
              window.location.hostname.endsWith('github.io');

// Mock Client-Side Database Orchestration
const MOCK_DB = {
    getUsers() {
        return JSON.parse(localStorage.getItem('mock_users') || '[]');
    },
    saveUsers(users) {
        localStorage.setItem('mock_users', JSON.stringify(users));
    },
    getExpenses(userId) {
        const key = `mock_expenses_${userId}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    },
    saveExpenses(userId, expenses) {
        localStorage.setItem(`mock_expenses_${userId}`, JSON.stringify(expenses));
    },
    getIncome(userId) {
        const key = `mock_income_${userId}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    },
    saveIncome(userId, income) {
        localStorage.setItem(`mock_income_${userId}`, JSON.stringify(income));
    }
};

// Seed initial mock data for demo users
function seedMockData(userId) {
    const expensesKey = `mock_expenses_${userId}`;
    const incomeKey = `mock_income_${userId}`;
    
    if (!localStorage.getItem(expensesKey)) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        
        const initialExpenses = [
            { id: 1, userId, amount: 12500, category: 'Bills', description: 'Monthly Apartment Rent', date: `${yyyy}-${mm}-01`, paymentMethod: 'Bank Transfer' },
            { id: 2, userId, amount: 3200, category: 'Food', description: 'Supermarket Groceries', date: `${yyyy}-${mm}-04`, paymentMethod: 'Debit Card' },
            { id: 3, userId, amount: 2400, category: 'Bills', description: 'Electricity & Wi-Fi bills', date: `${yyyy}-${mm}-08`, paymentMethod: 'Mobile Wallet' },
            { id: 4, userId, amount: 1200, category: 'Travel', description: 'Fuel Refill', date: `${yyyy}-${mm}-10`, paymentMethod: 'Credit Card' },
            { id: 5, userId, amount: 1850, category: 'Entertainment', description: 'Dinner & Movie with friends', date: `${yyyy}-${mm}-14`, paymentMethod: 'Cash' },
            { id: 6, userId, amount: 950, category: 'Health', description: 'Pharmacy prescriptions', date: `${yyyy}-${mm}-18`, paymentMethod: 'Mobile Wallet' },
            { id: 7, userId, amount: 1500, category: 'Shopping', description: 'New clothes purchase', date: `${yyyy}-${mm}-20`, paymentMethod: 'Credit Card' }
        ];
        localStorage.setItem(expensesKey, JSON.stringify(initialExpenses));
    }
    
    if (!localStorage.getItem(incomeKey)) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        
        const initialIncome = [
            { id: 1, userId, amount: 50000, source: 'Salary', description: 'Monthly Payroll Transfer', date: `${yyyy}-${mm}-01` },
            { id: 2, userId, amount: 15000, source: 'Freelance', description: 'UI/UX Design Contract Work', date: `${yyyy}-${mm}-15` }
        ];
        localStorage.setItem(incomeKey, JSON.stringify(initialIncome));
    }
}

// Local Session Mock handlers
function mockLogin(email, password) {
    let users = MOCK_DB.getUsers();
    let user = users.find(u => u.email === email);
    
    // Seed default guest user if it doesn't exist
    if (!user && email === 'demo@example.com') {
        user = {
            id: 999,
            name: 'Demo Guest',
            email: 'demo@example.com',
            password: 'password',
            monthlyBudget: 25000
        };
        users.push(user);
        MOCK_DB.saveUsers(users);
    }
    
    // Auto-create user on the fly if running in Demo Mode for a smoother experience
    if (!user) {
        user = {
            id: Date.now(),
            name: email.split('@')[0].toUpperCase(),
            email: email,
            password: password,
            monthlyBudget: 20000
        };
        users.push(user);
        MOCK_DB.saveUsers(users);
    } else if (user.password !== password) {
        throw new Error('Invalid email or password in Demo Mode');
    }
    
    if (user.id === 999) {
        seedMockData(user.id);
    }
    
    return {
        token: 'mock-jwt-token-for-user-' + user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget
    };
}

function mockRegister(name, email, password) {
    let users = MOCK_DB.getUsers();
    if (users.some(u => u.email === email)) {
        throw new Error('Email already registered in Demo Mode');
    }
    
    const user = {
        id: Date.now(),
        name,
        email,
        password,
        monthlyBudget: 0
    };
    users.push(user);
    MOCK_DB.saveUsers(users);
    
    if (user.id === 999) {
        seedMockData(user.id);
    }
    
    return {
        token: 'mock-jwt-token-for-user-' + user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget
    };
}

// Router for mock API endpoints
function mockRequest(endpoint, method, body, userId) {
    // 1. GET /expenses
    if (endpoint === '/expenses' && method === 'GET') {
        return MOCK_DB.getExpenses(userId);
    }
    
    // 2. POST /expenses
    if (endpoint === '/expenses' && method === 'POST') {
        let expenses = MOCK_DB.getExpenses(userId);
        const newExpense = {
            id: Date.now(),
            userId,
            amount: parseFloat(body.amount),
            category: body.category,
            description: body.description,
            date: body.date,
            paymentMethod: body.paymentMethod
        };
        expenses.push(newExpense);
        MOCK_DB.saveExpenses(userId, expenses);
        return newExpense;
    }
    
    // 3. PUT /expenses/:id
    if (endpoint.startsWith('/expenses/') && method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        let expenses = MOCK_DB.getExpenses(userId);
        const idx = expenses.findIndex(e => e.id === id);
        if (idx !== -1) {
            expenses[idx] = {
                ...expenses[idx],
                amount: parseFloat(body.amount),
                category: body.category,
                description: body.description,
                date: body.date,
                paymentMethod: body.paymentMethod
            };
            MOCK_DB.saveExpenses(userId, expenses);
            return expenses[idx];
        }
        throw new Error('Expense not found');
    }
    
    // 4. DELETE /expenses/:id
    if (endpoint.startsWith('/expenses/') && method === 'DELETE') {
        const id = parseInt(endpoint.split('/').pop());
        let expenses = MOCK_DB.getExpenses(userId);
        expenses = expenses.filter(e => e.id !== id);
        MOCK_DB.saveExpenses(userId, expenses);
        return null;
    }
    
    // 5. GET /income
    if (endpoint === '/income' && method === 'GET') {
        return MOCK_DB.getIncome(userId);
    }
    
    // 6. POST /income
    if (endpoint === '/income' && method === 'POST') {
        let income = MOCK_DB.getIncome(userId);
        const newIncome = {
            id: Date.now(),
            userId,
            amount: parseFloat(body.amount),
            source: body.source,
            description: body.description,
            date: body.date
        };
        income.push(newIncome);
        MOCK_DB.saveIncome(userId, income);
        return newIncome;
    }
    
    // 7. PUT /income/:id
    if (endpoint.startsWith('/income/') && method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        let income = MOCK_DB.getIncome(userId);
        const idx = income.findIndex(i => i.id === id);
        if (idx !== -1) {
            income[idx] = {
                ...income[idx],
                amount: parseFloat(body.amount),
                source: body.source,
                description: body.description,
                date: body.date
            };
            MOCK_DB.saveIncome(userId, income);
            return income[idx];
        }
        throw new Error('Income not found');
    }
    
    // 8. DELETE /income/:id
    if (endpoint.startsWith('/income/') && method === 'DELETE') {
        const id = parseInt(endpoint.split('/').pop());
        let income = MOCK_DB.getIncome(userId);
        income = income.filter(i => i.id !== id);
        MOCK_DB.saveIncome(userId, income);
        return null;
    }
    
    // 9. GET /users/profile
    if (endpoint === '/users/profile' && method === 'GET') {
        let users = MOCK_DB.getUsers();
        let user = users.find(u => u.id === userId);
        if (user) {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                monthlyBudget: user.monthlyBudget
            };
        }
        throw new Error('Profile not found');
    }
    
    // 10. PUT /users/budget
    if (endpoint === '/users/budget' && method === 'PUT') {
        let users = MOCK_DB.getUsers();
        let userIdx = users.findIndex(u => u.id === userId);
        if (userIdx !== -1) {
            users[userIdx].monthlyBudget = parseFloat(body.monthlyBudget);
            MOCK_DB.saveUsers(users);
            return {
                id: users[userIdx].id,
                name: users[userIdx].name,
                email: users[userIdx].email,
                monthlyBudget: users[userIdx].monthlyBudget
            };
        }
        throw new Error('Profile not found');
    }
    
    // 11. GET /dashboard/summary
    if (endpoint === '/dashboard/summary' && method === 'GET') {
        const expenses = MOCK_DB.getExpenses(userId);
        const income = MOCK_DB.getIncome(userId);
        
        let totalIncome = 0;
        let totalExpenses = 0;
        let monthlyExpenses = 0;
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        expenses.forEach(e => {
            totalExpenses += e.amount;
            const eDate = new Date(e.date + 'T00:00:00');
            if (eDate.getFullYear() === currentYear && eDate.getMonth() === currentMonth) {
                monthlyExpenses += e.amount;
            }
        });
        
        income.forEach(i => {
            totalIncome += i.amount;
        });
        
        const remainingBalance = totalIncome - totalExpenses;
        
        let users = MOCK_DB.getUsers();
        let user = users.find(u => u.id === userId);
        const monthlyBudget = user ? user.monthlyBudget : 0;
        
        // Merge recent transactions
        let txs = [];
        expenses.forEach(e => {
            txs.push({
                id: e.id,
                date: e.date,
                description: e.description,
                categoryOrSource: e.category,
                type: 'EXPENSE',
                amount: e.amount
            });
        });
        income.forEach(i => {
            txs.push({
                id: i.id,
                date: i.date,
                description: i.description,
                categoryOrSource: i.source,
                type: 'INCOME',
                amount: i.amount
            });
        });
        
        txs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return {
            totalIncome,
            totalExpenses,
            remainingBalance,
            monthlyExpenses,
            monthlyBudget,
            recentTransactions: txs.slice(0, 5)
        };
    }
    
    throw new Error('Endpoint not implemented in mock API');
}

const api = {
    async request(endpoint, options = {}) {
        // If in mock mode, bypass real network calls and route to local simulation
        if (useMock) {
            await new Promise(resolve => setTimeout(resolve, 200)); // Simulating network latency
            const body = options.body ? JSON.parse(options.body) : null;
            
            if (endpoint === '/auth/login') {
                return mockLogin(body.email, body.password);
            }
            if (endpoint === '/auth/register') {
                return mockRegister(body.name, body.email, body.password);
            }
            
            const cachedUser = JSON.parse(localStorage.getItem('user'));
            const userId = cachedUser ? cachedUser.id : null;
            if (!userId) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html')) {
                    window.location.href = 'login.html';
                }
                throw new Error('Unauthorized');
            }
            
            return mockRequest(endpoint, options.method || 'GET', body, userId);
        }
        
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers,
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html')) {
                    window.location.href = 'login.html';
                }
                throw new Error('Unauthorized');
            }
            
            if (response.status === 244 || response.status === 204) {
                return null;
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Something went wrong';
                throw new Error(errorMessage);
            }
            
            return data;
        } catch (error) {
            // Check if it's a network error (server offline/unreachable)
            const isNetworkError = error instanceof TypeError || 
                                   error.message.includes('Failed to fetch') || 
                                   error.message.includes('NetworkError') || 
                                   error.message.includes('fetch');
                                   
            if (isNetworkError && !useMock) {
                console.warn("Backend server offline. Switching to client-side Demo Mode.");
                useMock = true;
                localStorage.setItem('use_mock_api', 'true');
                
                if (typeof showToast === 'function') {
                    showToast('Backend offline. Switched to Demo Mode.', 'info');
                }
                
                // Retry request using Mock Mode
                return this.request(endpoint, options);
            }
            
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    },
    
    get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers });
    },
    
    post(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers
        });
    },
    
    put(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers
        });
    },
    
    delete(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'DELETE', headers });
    }
};
