const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');

// Show login form (for admin panel, register is disabled)
window.showLoginForm = function() {
    if (loginForm) {
        loginForm.style.display = 'block';
        loginError.textContent = '';
    }
};

// Show register form (disabled for admin panel)
window.showRegisterForm = function() {
    // Register is disabled in admin panel - only admin can login
    return;
};

// Login form handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await api.post('/auth/login', { username, password });
            
            // Check if user is admin
            if (response.role !== 'Admin' && username.toLowerCase() !== 'admin') {
                // Not admin, redirect to user dashboard
                api.setToken(response.token);
                localStorage.setItem('userFullName', response.fullName);
                localStorage.setItem('userRole', response.role);
                localStorage.setItem('username', response.username);
                window.location.href = '/user';
                return;
            }
            
            // Admin user - proceed with admin panel
            api.setToken(response.token);
            
            // Store user info
            localStorage.setItem('userFullName', response.fullName);
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('username', response.username);
            
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
            let errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
            try {
                if (error.message) {
                    // Try to extract message from error response
                    const match = error.message.match(/message["\s]*:["\s]*([^"}\]]+)/);
                    if (match) {
                        errorMessage = match[1];
                    }
                }
            } catch (e) {
                console.error('Error parsing error message:', e);
            }
            loginError.textContent = errorMessage;
            console.error('Login error:', error);
        }
    });
}

// Register form handler
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerError.textContent = '';
        registerSuccess.textContent = '';

        const fullName = document.getElementById('regFullName').value;
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            registerError.textContent = 'Mật khẩu xác nhận không khớp';
            return;
        }

        // Validate password length
        if (password.length < 6) {
            registerError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                fullName,
                username,
                email,
                password
            });

            if (response.success) {
                registerSuccess.textContent = 'Đăng ký thành công! Đang chuyển hướng...';
                
                // Auto login after successful registration
                api.setToken(response.token);
                localStorage.setItem('userFullName', response.fullName);
                localStorage.setItem('userRole', 'User');
                
                // Show main app after short delay
                setTimeout(() => {
                    loginScreen.classList.add('hidden');
                    mainApp.classList.remove('hidden');
                    document.getElementById('userFullName').textContent = response.fullName;
                    
                    if (window.loadDashboard) {
                        window.loadDashboard();
                    }
                }, 1500);
            } else {
                registerError.textContent = response.message || 'Đăng ký thất bại';
            }
        } catch (error) {
            // Error message is already formatted by api.js
            registerError.textContent = error.message || 'Có lỗi xảy ra khi đăng ký';
            console.error('Register error:', error);
        }
    });
}

// Check if user is already logged in (only for admin panel)
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    
    if (token) {
        // Check if user is admin - if not, redirect to user dashboard
        if (role !== 'Admin' && username?.toLowerCase() !== 'admin') {
            window.location.href = '/user';
            return;
        }
        
        // Admin user - show admin panel
        api.setToken(token);
        if (loginScreen && mainApp) {
            loginScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            document.getElementById('userFullName').textContent = localStorage.getItem('userFullName') || 'Admin';
            
            if (window.loadDashboard) {
                window.loadDashboard();
            }
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

