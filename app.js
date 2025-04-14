// Google Maps Integration
function initMap() {
    const location = { lat: 40.7128, lng: -74.0060 }; // New York coordinates
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: location
    });
    new google.maps.Marker({ position: location, map: map });
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAHRbmM4c4dGBEyhnLUKeYKvQ8PzGiLRHE",
    authDomain: "webtechprotfolio.firebaseapp.com",
    projectId: "webtechprotfolio",
    storageBucket: "webtechprotfolio.appspot.com",
    messagingSenderId: "982055173674",
    appId: "1:982055173674:web:ab32e58071a8c91020cd53",
    measurementId: "G-4654MZB1C0"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Updated Login/Register Functions
function showRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm && registerForm) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm && registerForm) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
}

// Updated Form Event Listeners
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        if (userCredential.user) {
            showNotification('Login successful!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    } catch (error) {
        showNotification(getErrorMessage(error.code), 'error');
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    const confirmPassword = e.target.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        if (userCredential.user) {
            showNotification('Registration successful!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    } catch (error) {
        showNotification(getErrorMessage(error.code), 'error');
    }
});

// Error Message Handler
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        default:
            return 'An error occurred. Please try again.';
    }
}

// Enhanced Notification System
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Login Page Functions
function register() {
    document.getElementById('login').style.left = '-400px';
    document.getElementById('register').style.left = '50px';
    document.getElementById('btn').style.left = '110px';
}

function login() {
    document.getElementById('login').style.left = '50px';
    document.getElementById('register').style.left = '450px';
    document.getElementById('btn').style.left = '0';
}

function loginTab() {
    document.getElementById('loginForm').style.left = '0';
    document.getElementById('registerForm').style.left = '450px';
    document.getElementById('btn').style.left = '0';
}

function registerTab() {
    document.getElementById('loginForm').style.left = '-450px';
    document.getElementById('registerForm').style.left = '0';
    document.getElementById('btn').style.left = '110px';
}

// Enhanced Form Handling
document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Message sent successfully!');
            form.reset();
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        alert('Error sending message: ' + error.message);
    }
});

// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
navToggle?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Dashboard Charts
function initCharts() {
    const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');

    new Chart(portfolioCtx, {
        type: 'pie',
        data: {
            labels: ['Stocks', 'Bonds', 'Real Estate', 'Cash'],
            datasets: [{
                data: [40, 30, 20, 10],
                backgroundColor: ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f']
            }]
        }
    });

    new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Portfolio Performance',
                data: [10, 15, 13, 18, 20, 22],
                borderColor: '#2ecc71'
            }]
        }
    });
}

// Update Charts with Real Data
async function updateCharts(userId) {
    try {
        const response = await fetch(`/api/portfolio/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Update portfolio chart
        const portfolioChart = Chart.getChart('portfolioChart');
        if (portfolioChart) {
            portfolioChart.data.datasets[0].data = data.portfolioData;
            portfolioChart.update();
        }

        // Update performance chart
        const performanceChart = Chart.getChart('performanceChart');
        if (performanceChart) {
            performanceChart.data.datasets[0].data = data.performanceData;
            performanceChart.update();
        }
    } catch (error) {
        console.error('Failed to load portfolio data:', error);
        document.getElementById('systemNotification').innerHTML =
            `Error loading portfolio data. Please try again later. (${error.message})`;
        document.getElementById('systemNotification').style.display = 'block';
    }
}

// Notification Dismissal
function closeNotification() {
    document.getElementById('systemNotification').style.display = 'none';
}

// Authentication State Observer with enhanced error handling
auth.onAuthStateChanged(user => {
    try {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const dashboardSection = document.getElementById('dashboard');

        if (!loginBtn || !logoutBtn) {
            throw new Error('Required UI elements not found');
        }

        if (user) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            dashboardSection?.classList.remove('hidden');
            updateCharts(user.uid).catch(console.error);
        } else {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            dashboardSection?.classList.add('hidden');
        }
    } catch (error) {
        console.error('Auth state handling error:', error);
        document.getElementById('systemNotification').innerHTML =
            `Authentication error. Please refresh the page. (${error.message})`;
        document.getElementById('systemNotification').style.display = 'block';
    }
});

// Logout Function
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout Error:', error);
    });
}

// Initialize features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCharts();

    // Check authentication state
    auth.onAuthStateChanged(user => {
        if (user) {
            showDashboard(user);
        }
    });
});
