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
                // Store user data in localStorage
                localStorage.setItem('userName', userData.fullName);
                localStorage.setItem('userEmail', userData.email);
                localStorage.setItem('userId', userCredential.user.uid);

                updateUserDisplay(userData);
                showNotification(`Welcome back, ${userData.fullName}!`, 'success');
            }
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    } catch (error) {
        showNotification(getErrorMessage(error.code), 'error');
    }
});

// New function to update user display
function updateUserDisplay(userData) {
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

// Updated Show User Profile Modal
function closeModal() {
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.remove();
    }
}

function showUserProfile(userData) {
    if (!userData) return;
    closeModal();

    try {
        const joinDate = userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'N/A';
        const lastLogin = auth.currentUser?.metadata.lastSignInTime
            ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleDateString()
            : 'N/A';

        const modalHtml = `
            <div class="modal-overlay" id="userProfileModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">User Profile</h3>
                        <button class="modal-close" onclick="closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="user-detail">
                            <strong>Name:</strong> <span id="modalUserName">${userData.fullName || 'N/A'}</span>
                        </div>
                        <div class="user-detail">
                            <strong>Email:</strong> <span id="modalUserEmail">${userData.email || 'N/A'}</span>
                        </div>
                        <div class="user-detail">
                            <strong>Member Since:</strong> <span>${joinDate}</span>
                        </div>
                        <div class="user-detail">
                            <strong>Last Login:</strong> <span>${lastLogin}</span>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn primary" onclick="showChangePasswordModal()">Change Password</button>
                        <button class="modal-btn secondary" onclick="showEditProfileModal('${userData.fullName}')">Edit Profile</button>
                        <button class="modal-btn danger" onclick="logout()">Logout</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('userProfileModal');
        modal.style.display = 'flex';

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    } catch (error) {
        console.error('Error showing profile:', error);
        showNotification('Error displaying profile', 'error');
    }
}

// Add Edit Profile Function
function showEditProfileModal() {
    const user = auth.currentUser;
    if (!user) return;

    const currentModal = document.getElementById('userProfileModal');
    const userName = document.getElementById('modalUserName').textContent;

    const editModalHtml = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Edit Profile</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="editFullName" value="${userName}" class="form-control">
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn primary" onclick="updateProfile()">Save Changes</button>
                <button class="modal-btn secondary" onclick="showUserProfile()">Cancel</button>
            </div>
        </div>
    `;

    if (currentModal) {
        currentModal.innerHTML = editModalHtml;
    }
}

// Add Update Profile Function
async function updateProfile() {
    const user = auth.currentUser;
    if (!user) return;

    const newName = document.getElementById('editFullName').value;

    try {
        await db.collection('users').doc(user.uid).update({
            fullName: newName,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update display name in authentication
        await user.updateProfile({
            displayName: newName
        });

        // Update localStorage
        localStorage.setItem('userName', newName);

        // Update UI
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = newName;
        }

        showNotification('Profile updated successfully!', 'success');

        // Refresh user profile modal
        const userData = (await db.collection('users').doc(user.uid).get()).data();
        showUserProfile(userData);
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile', 'error');
    }
}

// Update click handler for username
document.addEventListener('click', function (e) {
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay && userNameDisplay.contains(e.target)) {
        const user = auth.currentUser;
        if (user) {
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        userData.uid = user.uid; // Add user ID to userData
                        showUserProfile(userData);
                    } else {
                        throw new Error('User profile not found');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user profile:', error);
                    showNotification('Error loading profile: ' + error.message, 'error');
                });
        } else {
            showNotification('Please log in to view profile', 'error');
        }
    }
});

// Updated Authentication State Observer
auth.onAuthStateChanged(user => {
    try {
        if (user) {
            // First try to get data from localStorage for immediate display
            const cachedName = localStorage.getItem('userName');
            if (cachedName) {
                updateUserDisplay({ fullName: cachedName });
            }

            // Then fetch fresh data from Firestore
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        updateUserDisplay(userData);
                        // Update cache
                        localStorage.setItem('userName', userData.fullName);
                        localStorage.setItem('userEmail', userData.email);
                        localStorage.setItem('userId', user.uid);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error);
                    showNotification('Error loading user data', 'error');
                });
        } else {
            // Clear all user data on logout
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');

            const loginBtn = document.getElementById('loginBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            const userNameDisplay = document.getElementById('userNameDisplay');
            const dashboardSection = document.getElementById('dashboard');

            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userNameDisplay) userNameDisplay.style.display = 'none';
            if (dashboardSection) dashboardSection.classList.add('hidden');
        }
    } catch (error) {
        console.error('Auth state handling error:', error);
        showNotification('Error updating authentication state', 'error');
    }
});

// Add Change Password Function
function showChangePasswordModal() {
    closeModal(); // Close the profile modal first

    const modalHtml = `
        <div class="modal-overlay" id="passwordModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Change Password</h3>
                    <button class="modal-close" onclick="closePasswordModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Current Password</label>
                        <input type="password" id="currentPassword" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" id="newPassword" class="form-control" required>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn primary" onclick="updatePassword()">Update Password</button>
                    <button class="modal-btn secondary" onclick="closePasswordModal()">Cancel</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('passwordModal');
    modal.style.display = 'flex';
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.remove();
    }
}

async function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const user = auth.currentUser;

    if (!user || !currentPassword || !newPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        // Get user email
        const userEmail = user.email;

        // Create credential
        const credential = firebase.auth.EmailAuthProvider.credential(
            userEmail,
            currentPassword
        );

        // Re-authenticate user
        await user.reauthenticateWithCredential(credential);

        // Update password
        await user.updatePassword(newPassword);

        showNotification('Password updated successfully!', 'success');
        closePasswordModal();

        // Show profile modal again
        const userData = (await db.collection('users').doc(user.uid).get()).data();
        showUserProfile(userData);
    } catch (error) {
        console.error('Error updating password:', error);
        if (error.code === 'auth/wrong-password') {
            showNotification('Current password is incorrect', 'error');
        } else {
            showNotification('Error updating password: ' + error.message, 'error');
        }
    }
}

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
