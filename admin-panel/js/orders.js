// Orders management for admin panel
const ordersList = document.getElementById('orders-list');
const orderModalBg = document.getElementById('orderModalBg');
const orderModal = document.getElementById('orderModal');
const orderModalContent = document.getElementById('orderModalContent');
const closeOrderModal = document.getElementById('closeOrderModal');
const orderSearchInput = document.getElementById('orderSearchInput');
const orderStatusFilter = document.getElementById('orderStatusFilter');
const orderPaymentFilter = document.getElementById('orderPaymentFilter');
const orderSearchBtn = document.getElementById('orderSearchBtn');
const orderStartDate = document.getElementById('orderStartDate');
const orderEndDate = document.getElementById('orderEndDate');
const orderClearFiltersBtn = document.getElementById('orderClearFiltersBtn');

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
closeOrderModal.onclick = closeOrderModalFn;
orderModalBg.onclick = closeOrderModalFn;

let allOrdersCache = {};

function parseDateString(dateStr) {
  // Returns a Date object or null
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

function renderOrders(filter = {}) {
  ordersList.innerHTML = '<tr><td colspan="6" class="table-loading">Loading...</td></tr>';
  database.ref('orders').once('value').then(snap => {
    const orders = snap.val() || {};
    allOrdersCache = orders;
    let filtered = Object.entries(orders);
    // Filter by status
    if (filter.status) {
      filtered = filtered.filter(([id, o]) => (o.status || 'pending').toLowerCase() === filter.status.toLowerCase());
    }
    // Filter by payment type
    if (filter.payment) {
      filtered = filtered.filter(([id, o]) => (o.payment || '').toLowerCase() === filter.payment.toLowerCase());
    }
    // Filter by date range
    const startDate = parseDateString(filter.startDate);
    const endDate = parseDateString(filter.endDate);
    if (startDate || endDate) {
      filtered = filtered.filter(([id, o]) => {
        const orderDate = o.date ? new Date(o.date) : null;
        if (!orderDate || isNaN(orderDate.getTime())) return false;
        if (startDate && orderDate < startDate) return false;
        if (endDate) {
          // Include the end date fully
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23,59,59,999);
          if (orderDate > endOfDay) return false;
        }
        return true;
      });
    }
    // Search by customer/order ID
    if (filter.query) {
      const q = filter.query.toLowerCase();
      filtered = filtered.filter(([id, o]) => (o.name || '').toLowerCase().includes(q) || id.toLowerCase().includes(q));
    }
    if (filtered.length === 0) {
      ordersList.innerHTML = '<tr><td colspan="6" class="table-loading">No orders found</td></tr>';
      return;
    }
    ordersList.innerHTML = '';
    filtered.reverse().forEach(([id, o]) => {
      const status = o.status === 'completed' ? 'Completed' : 'Pending';
      const badge = `<span class="badge ${status === 'Completed' ? 'badge-success' : 'badge-warning'}">${status}</span>`;
      ordersList.innerHTML += `
        <tr>
          <td>#${id}</td>
          <td>${o.name || 'N/A'}</td>
          <td>${o.date || ''}</td>
          <td>${badge}</td>
          <td>₹${o.total || ''}</td>
          <td>
            <button class="add-product-btn" style="padding:0.3em 1em;font-size:0.98em;" onclick="viewOrder('${id}')">View</button>
            ${status === 'Pending' ? `<button class="add-product-btn" style="background:#43a047;padding:0.3em 1em;font-size:0.98em;margin-left:0.5em;" onclick="markCompleted('${id}')">Mark as Completed</button>` : ''}
            <button class="add-product-btn" style="background:#e53935;padding:0.3em 1em;font-size:0.98em;margin-left:0.5em;" onclick="deleteOrder('${id}')">Delete</button>
          </td>
        </tr>
      `;
    });
  }).catch(() => {
    ordersList.innerHTML = '<tr><td colspan="6" class="table-loading">Failed to load orders</td></tr>';
  });
}
orderSearchBtn.onclick = function() {
  renderOrders({
    query: orderSearchInput.value.trim(),
    status: orderStatusFilter.value,
    payment: orderPaymentFilter.value,
    startDate: orderStartDate.value,
    endDate: orderEndDate.value
  });
};
orderStatusFilter.onchange = orderSearchBtn.onclick;
orderPaymentFilter.onchange = orderSearchBtn.onclick;
orderStartDate.onchange = orderSearchBtn.onclick;
orderEndDate.onchange = orderSearchBtn.onclick;
orderSearchInput.onkeyup = function(e) { if (e.key === 'Enter') orderSearchBtn.onclick(); };
orderClearFiltersBtn.onclick = function() {
  orderSearchInput.value = '';
  orderStatusFilter.value = '';
  orderPaymentFilter.value = '';
  orderStartDate.value = '';
  orderEndDate.value = '';
  renderOrders();
};
window.viewOrder = function(id) {
  database.ref('orders/' + id).once('value').then(snap => {
    const o = snap.val();
    if (o) showOrderModal(o, id);
  });
};
window.markCompleted = function(id) {
  if (!confirm('Mark this order as completed?')) return;
  database.ref('orders/' + id + '/status').set('completed').then(() => renderOrders({ query: orderSearchInput.value.trim(), status: orderStatusFilter.value, payment: orderPaymentFilter.value, startDate: orderStartDate.value, endDate: orderEndDate.value }));
};
window.deleteOrder = function(id) {
  if (!confirm('Are you sure you want to delete this order?')) return;
  database.ref('orders/' + id).remove().then(() => renderOrders({ query: orderSearchInput.value.trim(), status: orderStatusFilter.value, payment: orderPaymentFilter.value, startDate: orderStartDate.value, endDate: orderEndDate.value }));
};
// Initial load
renderOrders(); 