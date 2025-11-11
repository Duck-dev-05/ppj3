// Login Page Handler
const loginForm = document.getElementById('loginForm');
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
            localStorage.setItem('username', response.username);
            
            // Redirect based on role
            if (response.role === 'Admin' || username.toLowerCase() === 'admin') {
                // Admin redirect to admin panel
                window.location.href = '/admin';
            } else {
                // Regular user redirect to homepage (public website)
                window.location.href = '/';
            }
        } catch (error) {
            let errorMessage = 'Incorrect username or password';
            try {
                if (error.message) {
                    // Try to extract message from error response
                    const match = error.message.match(/message["\s]*:["\s]*([^"}\]]+)/);
                    if (match) {
                        errorMessage = match[1];
                    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                        errorMessage = 'Incorrect username or password';
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

