// Google Maps Integration
function initMap() {
    const location = { lat: 40.7128, lng: -74.0060 }; // New York coordinates
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: location
    });
    new google.maps.Marker({ position: location, map: map });
}

// Firebase Configuration and Initialization
const firebaseConfig = {
    apiKey: "AIzaSyAHRbmM4c4dGBEyhnLUKeYKvQ8PzGiLRHE",
    authDomain: "webtechprotfolio.firebaseapp.com",
    projectId: "webtechprotfolio",
    storageBucket: "webtechprotfolio.appspot.com",
    messagingSenderId: "982055173674",
    appId: "1:982055173674:web:ab32e58071a8c91020cd53",
    measurementId: "G-4654MZB1C0"
};

// Initialize Firebase only if it hasn't been initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);

    // Initialize Firestore with settings
    const db = firebase.firestore();
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });

    // Enable offline persistence
    db.enablePersistence({ synchronizeTabs: true })
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                showNotification('Multiple tabs open, offline mode limited', 'warning');
            } else if (err.code == 'unimplemented') {
                showNotification('Offline mode not available', 'warning');
            }
        });

    // Monitor connection state
    firebase.firestore().enableNetwork().then(() => {
        showNotification('Connected to server', 'success');
    }).catch(() => {
        showNotification('Working offline', 'warning');
    });
}

const auth = firebase.auth();
const db = firebase.firestore();

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

// Updated Login Form Handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        if (userCredential.user) {
            const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                localStorage.setItem('userName', userData.fullName);
                showNotification(`Welcome back, ${userData.fullName}!`, 'success');

                // Update navbar immediately
                const userNameDisplay = document.getElementById('userNameDisplay');
                const loginBtn = document.getElementById('loginBtn');
                const logoutBtn = document.getElementById('logoutBtn');

                if (userNameDisplay) {
                    userNameDisplay.textContent = userData.fullName;
                    userNameDisplay.style.display = 'block';
                }
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'block';
            }
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    } catch (error) {
        showNotification(getErrorMessage(error.code), 'error');
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('#email').value;
    const password = e.target.querySelector('#password').value;
    const confirmPassword = e.target.querySelector('#confirmPassword').value;
    const fullName = e.target.querySelector('#fullName').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        // Store additional user data in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            fullName: fullName,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showNotification('Registration successful!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
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

// Contact Form Handler
document.getElementById('contactForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;

    try {
        // Store message in Firestore
        await db.collection('contact_messages').add({
            name: name,
            email: email,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        showNotification('Message sent successfully!', 'success');
        form.reset();
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message. Please try again.', 'error');
    }
});

// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
navToggle?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Dashboard Charts
let portfolioChartInstance = null;
let performanceChartInstance = null;

function initCharts() {
    const portfolioChart = document.getElementById('portfolioChart');
    const performanceChart = document.getElementById('performanceChart');

    // Only initialize charts if elements exist
    if (portfolioChart && performanceChart) {
        // Destroy existing chart instances if they exist
        if (portfolioChartInstance) portfolioChartInstance.destroy();
        if (performanceChartInstance) performanceChartInstance.destroy();

        const portfolioCtx = portfolioChart.getContext('2d');
        const performanceCtx = performanceChart.getContext('2d');

        portfolioChartInstance = new Chart(portfolioCtx, {
            type: 'pie',
            data: {
                labels: ['Stocks', 'Bonds', 'Real Estate', 'Cash'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f']
                }]
            }
        });

        performanceChartInstance = new Chart(performanceCtx, {
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
}

// Update Charts with Real Data
async function updateCharts(userId) {
    try {
        const response = await fetch(`/api/portfolio/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (portfolioChartInstance) {
            portfolioChartInstance.data.datasets[0].data = data.portfolioData;
            portfolioChartInstance.update();
        }

        if (performanceChartInstance) {
            performanceChartInstance.data.datasets[0].data = data.performanceData;
            performanceChartInstance.update();
        }
    } catch (error) {
        console.error('Failed to load portfolio data:', error);
        showNotification('Error loading portfolio data', 'error');
    }
}

// Notification Dismissal
function closeNotification() {
    document.getElementById('systemNotification').style.display = 'none';
}

// Show Dashboard Function
function showDashboard(user) {
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.classList.remove('hidden');
        initCharts();

        // Fetch and display user data
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const userNameDisplay = document.getElementById('userNameDisplay');
                if (userNameDisplay) {
                    userNameDisplay.textContent = `Welcome, ${userData.fullName}`;
                    userNameDisplay.style.display = 'block';
                    // Store user name in localStorage for persistence
                    localStorage.setItem('userName', userData.fullName);
                }
            }
        }).catch((error) => {
            console.error('Error fetching user data:', error);
            showNotification('Error loading user data', 'error');
        });
    }
}

// Updated Authentication State Observer
auth.onAuthStateChanged(user => {
    try {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const dashboardSection = document.getElementById('dashboard');
        const userNameDisplay = document.getElementById('userNameDisplay');

        if (user) {
            // Get user data from Firestore
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    // Update navbar elements
                    if (loginBtn) loginBtn.style.display = 'none';
                    if (logoutBtn) logoutBtn.style.display = 'block';
                    if (userNameDisplay) {
                        userNameDisplay.textContent = userData.fullName; // Show only the name without "Welcome"
                        userNameDisplay.style.display = 'block';
                    }
                    if (dashboardSection) dashboardSection.classList.remove('hidden');
                }
            });
        } else {
            // User is signed out
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userNameDisplay) userNameDisplay.style.display = 'none';
            if (dashboardSection) dashboardSection.classList.add('hidden');
            localStorage.removeItem('userName'); // Clear stored user data
        }
    } catch (error) {
        console.error('Auth state handling error:', error);
        showNotification('Error updating authentication state', 'error');
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
    // Check if user is logged in and on dashboard page
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection && !dashboardSection.classList.contains('hidden')) {
        initCharts();
    }

    // Check authentication state
    auth.onAuthStateChanged(user => {
        if (user) {
            showDashboard(user);
        }
    });
});
