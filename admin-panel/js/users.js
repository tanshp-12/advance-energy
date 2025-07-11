// Users CRUD for admin panel
const usersList = document.getElementById('users-list');
const userModalBg = document.getElementById('userModalBg');
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('userForm');
const openAddUserModal = document.getElementById('openAddUserModal');
const closeUserModal = document.getElementById('closeUserModal');
const userModalTitle = document.getElementById('userModalTitle');
const saveUserBtn = document.getElementById('saveUserBtn');
const userSearchInput = document.getElementById('userSearchInput');
const userRoleFilter = document.getElementById('userRoleFilter');
const userSearchBtn = document.getElementById('userSearchBtn');

let editingUserId = null;

function showUserModal(edit = false, user = {}) {
  userModalBg.style.display = 'block';
  userModal.style.display = 'block';
  userForm.reset();
  userModalTitle.textContent = edit ? 'Edit User' : 'Add User';
  editingUserId = edit ? user.id : null;
  document.getElementById('userId').value = user.id || '';
  document.getElementById('userName').value = user.name || '';
  document.getElementById('userEmail').value = user.email || '';
  document.getElementById('userRole').value = user.role || '';
}
function closeUserModalFn() {
  userModalBg.style.display = 'none';
  userModal.style.display = 'none';
  editingUserId = null;
}
openAddUserModal.onclick = () => showUserModal(false);
closeUserModal.onclick = closeUserModalFn;
userModalBg.onclick = closeUserModalFn;

let allUsersCache = {};

function renderUsers(filter = {}) {
  usersList.innerHTML = '<tr><td colspan="4" class="table-loading">Loading...</td></tr>';
  database.ref('users').once('value').then(snap => {
    const users = snap.val() || {};
    allUsersCache = users;
    let filtered = Object.entries(users);
    // Filter by role
    if (filter.role) {
      filtered = filtered.filter(([id, u]) => (u.role || '').toLowerCase() === filter.role.toLowerCase());
    }
    // Search by name/email
    if (filter.query) {
      const q = filter.query.toLowerCase();
      filtered = filtered.filter(([id, u]) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
    }
    if (filtered.length === 0) {
      usersList.innerHTML = '<tr><td colspan="4" class="table-loading">No users found in Firebase</td></tr>';
      return;
    }
    usersList.innerHTML = '';
    filtered.forEach(([id, u]) => {
      usersList.innerHTML += `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>
            <button class="add-product-btn" style="padding:0.3em 1em;font-size:0.98em;" onclick="editUser('${id}')">Edit</button>
            <button class="add-product-btn" style="background:#e53935;padding:0.3em 1em;font-size:0.98em;margin-left:0.5em;" onclick="deleteUser('${id}')">Delete</button>
          </td>
        </tr>
      `;
    });
  }).catch(() => {
    usersList.innerHTML = '<tr><td colspan="4" class="table-loading">Failed to load users</td></tr>';
  });
}
userSearchBtn.onclick = function() {
  renderUsers({
    query: userSearchInput.value.trim(),
    role: userRoleFilter.value
  });
};
userRoleFilter.onchange = userSearchBtn.onclick;
userSearchInput.onkeyup = function(e) { if (e.key === 'Enter') userSearchBtn.onclick(); };
window.editUser = function(id) {
  database.ref('users/' + id).once('value').then(snap => {
    const u = snap.val();
    if (u) showUserModal(true, { ...u, id });
  });
};
window.deleteUser = function(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  database.ref('users/' + id).remove().then(() => renderUsers({ query: userSearchInput.value.trim(), role: userRoleFilter.value }));
};
userForm.onsubmit = function(e) {
  e.preventDefault();
  saveUserBtn.disabled = true;
  const id = document.getElementById('userId').value || database.ref().child('users').push().key;
  const user = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    role: document.getElementById('userRole').value
  };
  const password = document.getElementById('userPassword').value;
  if (password) user.password = password;
  database.ref('users/' + id).set(user).then(() => {
    closeUserModalFn();
    renderUsers({ query: userSearchInput.value.trim(), role: userRoleFilter.value });
    saveUserBtn.disabled = false;
  }).catch(() => {
    alert('Failed to save user.');
    saveUserBtn.disabled = false;
  });
};
// Initial load
renderUsers(); 