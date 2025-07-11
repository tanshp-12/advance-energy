// Sidebar active state
const navLinks = document.querySelectorAll('.sidebar-nav a');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// Responsive sidebar toggle (for mobile, if you want to add a hamburger menu in the future)
// You can expand this as needed for more interactivity.

// Card hover animation is handled by CSS for performance.

// Fetch and update dashboard stats and recent orders from Firebase
function updateDashboardStats() {
  // Stat elements
  const statValues = document.querySelectorAll('.stat-card .stat-value');
  statValues.forEach(el => el.innerHTML = '<span class="stat-loading"></span>');

  // Orders
  const table = document.querySelector('.dashboard-table tbody');
  table.innerHTML = '<tr><td colspan="5" class="table-loading">Loading...</td></tr>';

  // Fetch orders
  database.ref('orders').once('value').then(snap => {
    const orders = snap.val() || {};
    statValues[0].textContent = Object.keys(orders).length;
    // Recent orders table
    table.innerHTML = '';
    const orderArr = Object.values(orders).map((o, i) => ({...o, _id: Object.keys(orders)[i]}));
    orderArr.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    if (orderArr.length === 0) {
      table.innerHTML = '<tr><td colspan="5" class="table-loading">No orders found</td></tr>';
    } else {
      orderArr.slice(0, 3).forEach(order => {
        const status = order.status === 'completed' ? 'Completed' : 'Pending';
        const badge = `<span class="badge ${status === 'Completed' ? 'badge-success' : 'badge-warning'}">${status}</span>`;
        let actions = `<button class="add-product-btn" style="padding:0.3em 1em;font-size:0.98em;" onclick="viewOrder('${order._id}')">View</button>`;
        if (status === 'Pending') {
          actions += `<button class="add-product-btn" style="background:#43a047;padding:0.3em 1em;font-size:0.98em;margin-left:0.5em;" onclick="markCompleted('${order._id}')">Mark as Completed</button>`;
        }
        table.innerHTML += `<tr>
          <td>#${order._id || ''}</td>
          <td>${order.name || 'N/A'}</td>
          <td>${order.date || ''}</td>
          <td>${badge}</td>
          <td>₹${order.total || ''}</td>
          <td>${actions}</td>
        </tr>`;
      });
    }
  }).catch(() => {
    statValues[0].textContent = '—';
    table.innerHTML = '<tr><td colspan="5" class="table-loading">Failed to load orders</td></tr>';
  });
  // Products
  database.ref('products').once('value').then(snap => {
    const products = snap.val() || {};
    statValues[1].textContent = Object.keys(products).length;
  }).catch(() => { statValues[1].textContent = '—'; });
  // Gallery
  database.ref('gallery').once('value').then(snap => {
    const gallery = snap.val() || {};
    statValues[2].textContent = Object.keys(gallery).length;
  }).catch(() => { statValues[2].textContent = '—'; });
  // Users (optional)
  database.ref('users').once('value').then(snap => {
    const users = snap.val() || {};
    statValues[3].textContent = Object.keys(users).length;
  }).catch(() => {
    statValues[3].textContent = '—';
  });
}
document.addEventListener('DOMContentLoaded', updateDashboardStats);

const orderModalBg = document.getElementById('orderModalBg');
const orderModal = document.getElementById('orderModal');
const orderModalContent = document.getElementById('orderModalContent');
const closeOrderModal = document.getElementById('closeOrderModal');

function showOrderModal(order, id) {
  let itemsHtml = '';
  if (order.items && Array.isArray(order.items)) {
    itemsHtml = `<ul style='padding-left:1.2em;'>` + order.items.map(item =>
      `<li><b>${item.name}</b> x ${item.qty} @ ₹${item.price} = ₹${item.qty * item.price}</li>`
    ).join('') + `</ul>`;
  }
  orderModalContent.innerHTML = `
    <h3>Order #${id}</h3>
    <div style='margin-bottom:0.7em;'><b>Status:</b> <span class="badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}">${order.status === 'completed' ? 'Completed' : 'Pending'}</span></div>
    <div><b>Customer:</b> ${order.name || 'N/A'}</div>
    <div><b>Email:</b> ${order.email || ''}</div>
    <div><b>Phone:</b> ${order.phone || ''}</div>
    <div><b>Address:</b> ${order.address || ''}</div>
    <div><b>Date:</b> ${order.date || ''}</div>
    <div><b>Payment:</b> ${order.payment || ''}</div>
    <div><b>Items:</b> ${itemsHtml}</div>
    <div><b>Total:</b> ₹${order.total || ''}</div>
  `;
  orderModalBg.style.display = 'block';
  orderModal.style.display = 'block';
}
function closeOrderModalFn() {
  orderModalBg.style.display = 'none';
  orderModal.style.display = 'none';
}
if (closeOrderModal) closeOrderModal.onclick = closeOrderModalFn;
if (orderModalBg) orderModalBg.onclick = closeOrderModalFn;

window.viewOrder = function(id) {
  database.ref('orders/' + id).once('value').then(snap => {
    const o = snap.val();
    if (o) showOrderModal(o, id);
  });
};
window.markCompleted = function(id) {
  if (!confirm('Mark this order as completed?')) return;
  database.ref('orders/' + id + '/status').set('completed').then(updateDashboardStats);
};

// Hamburger menu functionality
window.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');
  const dashboardWrapper = document.querySelector('.dashboard-wrapper');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      sidebar.classList.toggle('open');
    });
    // Close sidebar when clicking outside
    dashboardWrapper.addEventListener('click', function(e) {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
        sidebar.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
    // Close sidebar on nav link click
    sidebar.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        sidebar.classList.remove('open');
        hamburger.classList.remove('active');
      });
    });
  }
}); 