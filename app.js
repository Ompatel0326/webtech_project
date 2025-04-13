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
firebase.initializeApp({
    apiKey: "AIzaSyAHRbmM4c4dGBEyhnLUKeYKvQ8PzGiLRHE",
    authDomain: "webtechprotfolio.firebaseapp.com",
    projectId: "webtechprotfolio",
    storageBucket: "webtechprotfolio.appspot.com",
    messagingSenderId: "982055173674",
    appId: "1:982055173674:web:ab32e58071a8c91020cd53",
    measurementId: "G-4654MZB1C0"
});

const auth = firebase.auth();

function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            showDashboard(result.user);
        })
        .catch((error) => console.error(error));
}

function showDashboard(user) {
    document.getElementById('dashboard').classList.remove('hidden');
    updateCharts(user.uid);
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

// Firebase Authentication Handlers
document.getElementById('login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'index.html';
    } catch (error) {
        alert('Login Error: ' + error.message);
    }
});

document.getElementById('register')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;

    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        await result.user.updateProfile({ displayName: name });
        window.location.href = 'index.html';
    } catch (error) {
        alert('Registration Error: ' + error.message);
    }
});

function googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            alert('Google Sign-in Error: ' + error.message);
        });
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
        const data = await response.json();

        // Update existing charts with real data
        // ...existing chart initialization code...
    } catch (error) {
        console.error('Failed to load portfolio data:', error);
    }
}

// Authentication State Observer
auth.onAuthStateChanged(user => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardSection = document.getElementById('dashboard');

    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        dashboardSection?.classList.remove('hidden');
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        dashboardSection?.classList.add('hidden');
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
