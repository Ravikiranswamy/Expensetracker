// Expense Tracker API Fetch Client

const API_BASE_URL = 'http://localhost:8080/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        // Setup headers
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
            
            // Handle HTTP errors
            if (response.status === 401) {
                // If unauthorized, clear token and user data and redirect to login
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
