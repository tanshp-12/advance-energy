// settings.js

// Firebase is already initialized via firebase-init.js
const db = firebase.database();

// Get current admin email from localStorage
const currentAdminEmail = localStorage.getItem('adminEmail');
if (!currentAdminEmail) {
  alert('No admin logged in!');
  window.location.href = 'login.html';
}

// DOM elements
const adminNameDisplay = document.getElementById('adminNameDisplay');
const userTypeBadge = document.getElementById('userTypeBadge');
const lastLoginDisplay = document.getElementById('lastLoginDisplay');
const profileForm = document.getElementById('profileDetailsForm');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePhone = document.getElementById('profilePhone');
const profileAddress = document.getElementById('profileAddress');
const profileType = document.getElementById('profileType');
const profileLastLogin = document.getElementById('profileLastLogin');

// Company info (static for now, can be made dynamic)
document.getElementById('companyEmail').textContent = 'info@advance.com';
document.getElementById('companyAddress').textContent = '123, Main Street, City';
document.getElementById('companyPhone').textContent = '+91 12345 67890';
document.getElementById('companyTelecom').textContent = '1800-000-000';

// Find the admin node by email and fetch details
let adminNodeKey = null;
function fetchAdminDetails() {
  db.ref('admins').orderByChild('email').equalTo(currentAdminEmail).once('value', function(snapshot) {
    if (snapshot.exists()) {
      snapshot.forEach(function(child) {
        adminNodeKey = child.key;
        const admin = child.val();
        // Populate UI
        adminNameDisplay.textContent = admin.name || 'Admin';
        userTypeBadge.textContent = admin.userType || 'Admin';
        lastLoginDisplay.textContent = admin.lastlogin || '--';
        profileName.value = admin.name || '';
        profileEmail.value = admin.email || '';
        profilePhone.value = admin.phone || '';
        profileAddress.value = admin.address || '';
        profileType.value = admin.userType || 'Admin';
        profileLastLogin.value = admin.lastlogin || '--';
      });
    } else {
      // No admin found
      alert('Admin details not found!');
    }
  });
}
fetchAdminDetails();

// Save/update profile
document.getElementById('profileDetailsForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!adminNodeKey) {
    alert('Cannot update: admin node not found.');
    return;
  }
  const updatedProfile = {
    name: profileName.value,
    email: profileEmail.value,
    phone: profilePhone.value,
    address: profileAddress.value,
    userType: profileType.value || 'Admin',
    lastlogin: new Date().toLocaleString(),
    password: '' // Do not update password here
  };
  db.ref('admins/' + adminNodeKey).update(updatedProfile).then(() => {
    alert('Profile updated!');
    fetchAdminDetails();
  }).catch(err => {
    alert('Error updating profile: ' + err.message);
  });
});

// Log out
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('adminEmail');
    window.location.href = 'login.html';
  });
} 