function renderOrderDetails() {
  const order = JSON.parse(localStorage.getItem('lastOrder') || 'null');
  const details = document.getElementById('order-details');
  if (!order) {
    details.innerHTML = '<div class="alert alert-danger">No order found.</div>';
    return;
  }
  let html = `<div class='mb-2'><b>Order ID:</b> <span class='text-danger'>${order.id}</span></div>`;
  html += `<div class='mb-2'><b>Date:</b> ${order.date}</div>`;
  html += `<div class='mb-2'><b>Name:</b> ${order.name}</div>`;
  html += `<div class='mb-2'><b>Email:</b> ${order.email}</div>`;
  html += `<div class='mb-2'><b>Phone:</b> ${order.phone}</div>`;
  html += `<div class='mb-2'><b>Address:</b> ${order.address}</div>`;
  html += `<div class='mb-2'><b>Payment:</b> ${order.payment}</div>`;
  html += `<div class='mb-2'><b>Items:</b><ul class='mb-2'>`;
  order.items.forEach(item => {
    html += `<li>${item.name} x ${item.qty} <span class='text-white-50'>(₹${item.price} each)</span></li>`;
  });
  html += `</ul></div>`;
  html += `<div class='mb-2'><b>Total:</b> <span class='text-danger'>₹${order.total}</span></div>`;
  details.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
  renderOrderDetails();
  // Simple confetti animation
  for (let i = 0; i < 30; i++) {
    const conf = document.createElement('div');
    conf.style.position = 'fixed';
    conf.style.left = Math.random()*100 + 'vw';
    conf.style.top = '-40px';
    conf.style.width = '12px';
    conf.style.height = '12px';
    conf.style.background = `hsl(${Math.random()*360},90%,60%)`;
    conf.style.opacity = 0.7;
    conf.style.borderRadius = '3px';
    conf.style.zIndex = 9999;
    conf.style.transition = 'transform 2.2s cubic-bezier(.77,0,.18,1), opacity 2.2s';
    document.body.appendChild(conf);
    setTimeout(() => {
      conf.style.transform = `translateY(${window.innerHeight+60}px) rotate(${Math.random()*360}deg)`;
      conf.style.opacity = 0;
    }, 50);
    setTimeout(() => conf.remove(), 2500);
  }
}); 