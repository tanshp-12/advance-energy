// Stats Page Logic for Advance Energy Drink Admin Panel
// Handles fetching and displaying stats for a selected date

document.addEventListener('DOMContentLoaded', function() {
  const statsDateInput = document.getElementById('statsDate');
  const statsSummary = document.getElementById('statsSummary');
  const statsDetailsTable = document.getElementById('statsDetailsTable').querySelector('tbody');
  const statsNoData = document.getElementById('statsNoData');

  // Set default date to today
  const today = new Date();
  statsDateInput.value = today.toISOString().slice(0, 10);

  function fetchAndRenderStats(dateStr) {
    statsSummary.innerHTML = '';
    statsDetailsTable.innerHTML = '<tr><td colspan="6" class="table-loading">Loading...</td></tr>';
    statsNoData.style.display = 'none';

    // Fetch orders for the selected date
    database.ref('orders').once('value').then(snap => {
      const orders = snap.val() || {};
      const selectedDate = new Date(dateStr);
      let totalOrders = 0, completedOrders = 0, pendingOrders = 0, totalRevenue = 0;
      let details = [];
      Object.entries(orders).forEach(([id, o]) => {
        if (!o.date) return;
        const orderDate = new Date(o.date);
        if (
          orderDate.getFullYear() === selectedDate.getFullYear() &&
          orderDate.getMonth() === selectedDate.getMonth() &&
          orderDate.getDate() === selectedDate.getDate()
        ) {
          totalOrders++;
          if (o.status === 'completed') completedOrders++;
          else pendingOrders++;
          totalRevenue += Number(o.total) || 0;
          details.push({
            id,
            name: o.name || 'N/A',
            status: o.status || 'pending',
            payment: o.payment || 'N/A',
            total: o.total || 0,
            time: o.date ? (new Date(o.date)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''
          });
        }
      });
      // Render summary cards
      statsSummary.innerHTML = `
        <div class="stats-summary-card">
          <div class="stats-summary-title">Total Orders</div>
          <div class="stats-summary-value">${totalOrders}</div>
          <div class="stats-summary-desc">Orders placed on this day</div>
        </div>
        <div class="stats-summary-card">
          <div class="stats-summary-title">Completed Orders</div>
          <div class="stats-summary-value">${completedOrders}</div>
          <div class="stats-summary-desc">Orders marked as completed</div>
        </div>
        <div class="stats-summary-card">
          <div class="stats-summary-title">Pending Orders</div>
          <div class="stats-summary-value">${pendingOrders}</div>
          <div class="stats-summary-desc">Orders still pending</div>
        </div>
        <div class="stats-summary-card">
          <div class="stats-summary-title">Total Revenue</div>
          <div class="stats-summary-value">₹${totalRevenue.toLocaleString()}</div>
          <div class="stats-summary-desc">Total sales for this day</div>
        </div>
      `;
      // Render details table
      if (details.length === 0) {
        statsDetailsTable.innerHTML = '';
        statsNoData.style.display = 'block';
      } else {
        statsDetailsTable.innerHTML = details.map(d => `
          <tr>
            <td>#${d.id}</td>
            <td>${d.name}</td>
            <td><span class="badge ${d.status === 'completed' ? 'badge-success' : 'badge-warning'}">${d.status.charAt(0).toUpperCase() + d.status.slice(1)}</span></td>
            <td>${d.payment}</td>
            <td>₹${d.total}</td>
            <td>${d.time}</td>
          </tr>
        `).join('');
        statsNoData.style.display = 'none';
      }
    }).catch(() => {
      statsSummary.innerHTML = '<div class="stats-no-data">Failed to load stats.</div>';
      statsDetailsTable.innerHTML = '';
      statsNoData.style.display = 'block';
    });
  }

  // Initial load
  fetchAndRenderStats(statsDateInput.value);

  // On date change
  statsDateInput.addEventListener('change', function() {
    fetchAndRenderStats(this.value);
  });
}); 