// Fetch products from Firebase
function fetchProducts(callback) {
  database.ref('products').once('value').then(snapshot => {
    const products = snapshot.val() || {};
    callback(products);
  });
}
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '{}');
}
function renderOrderSummary() {
  fetchProducts(function(products) {
    const cart = getCart();
    const summary = document.getElementById('order-summary');
    let total = 0;
    let html = '<ul class="list-group list-group-flush">';
    for (const id in cart) {
      const product = products[id];
      if (!product) continue;
      const qty = cart[id];
      const subtotal = qty * product.price;
      total += subtotal;
      html += `<li class='list-group-item bg-transparent text-white d-flex justify-content-between align-items-center'>
        <span><img src='${product.img}' alt='${product.name}' style='width:32px;' class='me-2 rounded'>${product.name} x ${qty}</span>
        <span>₹${subtotal}</span>
      </li>`;
    }
    html += '</ul>';
    summary.innerHTML = html;
    document.getElementById('order-total').textContent = `₹${total}`;
  });
}
document.addEventListener('DOMContentLoaded', renderOrderSummary);

document.getElementById('checkout-form').addEventListener('submit', function(e) {
  e.preventDefault();
  fetchProducts(function(products) {
    const cart = getCart();
    let total = 0;
    for (const id in cart) {
      const product = products[id];
      if (!product) continue;
      total += (cart[id] || 0) * product.price;
    }
    if (total === 0) {
      alert('Your cart is empty!');
      return;
    }
    const order = {
      id: 'ADV' + Math.floor(Math.random()*900000+100000),
      items: Object.entries(cart).filter(([id, qty]) => qty > 0 && products[id]).map(([id, qty]) => {
        const p = products[id];
        return { id, name: p.name, price: p.price, qty };
      }),
      total,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      payment: document.getElementById('payment').value,
      date: new Date().toLocaleString(),
      status: 'pending'
    };
    // Store order in Firebase
    database.ref('orders').push(order)
      .then(() => {
        localStorage.setItem('lastOrder', JSON.stringify(order));
        localStorage.removeItem('cart');
        window.location.href = 'order-success.html';
      })
      .catch(err => {
        alert('Order could not be placed. Please try again.');
        console.error(err);
      });
  });
}); 