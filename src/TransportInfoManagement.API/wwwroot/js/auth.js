const loginForm = document.getElementById('loginForm');
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const loginError = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await api.post('/auth/login', { username, password });
            api.setToken(response.token);
            
            // Store user info
            localStorage.setItem('userFullName', response.fullName);
            localStorage.setItem('userRole', response.role);
            
            // Show main app
            loginScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            
            // Update user info display
            document.getElementById('userFullName').textContent = response.fullName;
            
            // Load dashboard
            if (window.loadDashboard) {
                window.loadDashboard();
            }
        } catch (error) {
            loginError.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng';
            console.error('Login error:', error);
        }
    });
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        api.setToken(token);
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        document.getElementById('userFullName').textContent = localStorage.getItem('userFullName') || 'User';
        
        if (window.loadDashboard) {
            window.loadDashboard();
        }
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    api.clearToken();
    localStorage.clear();
    loginScreen.classList.remove('hidden');
    mainApp.classList.add('hidden');
});

