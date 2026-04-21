class Dashboard {
    constructor() {
        this.isSidebarOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedCredentials();
    }

    setupEventListeners() {
        // Hamburger menu
        document.getElementById('hamburger').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Click outside to close sidebar on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && this.isSidebarOpen) {
                const sidebar = document.querySelector('.sidebar');
                const hamburger = document.getElementById('hamburger');
                if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                    this.toggleSidebar();
                }
            }
        });

        // Admin link click to show modal
        document.getElementById('adminLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal();
        });

        // Close modal
        document.querySelector('.close').addEventListener('click', () => {
            this.hideModal();
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('loginModal');
            if (e.target === modal) {
                this.hideModal();
            }
        });

        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.getElementById('togglePassword');
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            toggleIcon.classList.toggle('fa-eye', type === 'password');
            toggleIcon.classList.toggle('fa-eye-slash', type === 'text');
        });

        // Login form submit
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    loadSavedCredentials() {
        const username = localStorage.getItem('adminUsername');
        const rememberMe = localStorage.getItem('rememberMe');
        if (username && rememberMe === 'true') {
            document.getElementById('username').value = username;
            document.getElementById('rememberMe').checked = true;
        }
    }

    validateForm(username, password) {
        let isValid = true;
        const usernameError = document.getElementById('usernameError');
        const passwordError = document.getElementById('passwordError');

        usernameError.textContent = '';
        passwordError.textContent = '';

        if (username.length < 4) {
            usernameError.textContent = 'Username must be at least 4 characters';
            isValid = false;
        }

        if (password.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            isValid = false;
        }

        return isValid;
    }

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginButton = document.getElementById('loginButton');

        if (!this.validateForm(username, password)) {
            return;
        }

        // Show loading state
        loginButton.classList.add('loading');
        loginButton.disabled = true;

        // Simulate storing to "database" and basic authentication
        // For demo: accept admin/admin123 (replace with backend API in production)
        setTimeout(() => {
            if (username === 'admin' && password === 'admin123') {
                if (rememberMe) {
                    localStorage.setItem('adminUsername', username);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('adminUsername');
                    localStorage.removeItem('rememberMe');
                }
                localStorage.setItem('adminPassword', password); // Store for demo; use secure methods in production

                this.showToast('Login successful! Redirecting to Admin Panel...', 'success');
                this.hideModal();
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showToast('Invalid username or password', 'error');
            }

            loginButton.classList.remove('loading');
            loginButton.disabled = false;
        }, 1000); // Simulate network delay
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const hamburger = document.getElementById('hamburger');
        this.isSidebarOpen = !this.isSidebarOpen;
        sidebar.classList.toggle('open', this.isSidebarOpen);
        hamburger.classList.toggle('active', this.isSidebarOpen);
    }

    showModal() {
        document.getElementById('loginModal').style.display = 'block';
    }

    hideModal() {
        document.getElementById('loginModal').style.display = 'none';
        // Clear error messages and reset form
        document.getElementById('usernameError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('loginForm').reset();
        document.getElementById('password').type = 'password';
        document.getElementById('togglePassword').classList.add('fa-eye');
        document.getElementById('togglePassword').classList.remove('fa-eye-slash');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.querySelector('.toast-message');
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.className = `toast ${type}`;
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});