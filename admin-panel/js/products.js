// Product CRUD for admin panel
const productsList = document.getElementById('products-list');
const productModalBg = document.getElementById('productModalBg');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const openAddProductModal = document.getElementById('openAddProductModal');
const closeProductModal = document.getElementById('closeProductModal');
const modalTitle = document.getElementById('modalTitle');
const saveProductBtn = document.getElementById('saveProductBtn');

let editingProductId = null;

function showModal(edit = false, product = {}) {
  productModalBg.style.display = 'block';
  productModal.style.display = 'block';
  modalTitle.textContent = edit ? 'Edit Product' : 'Add Product';
  productForm.reset();
  editingProductId = edit ? product.id : null;
  document.getElementById('productId').value = product.id || '';
  document.getElementById('productName').value = product.name || '';
  document.getElementById('productPrice').value = product.price || '';
  document.getElementById('productDesc').value = product.desc || '';
  document.getElementById('productImg').value = product.img || '';
  document.getElementById('productBadge').value = product.badge || '';
}
function closeModal() {
  productModalBg.style.display = 'none';
  productModal.style.display = 'none';
  editingProductId = null;
}
openAddProductModal.onclick = () => showModal(false);
closeProductModal.onclick = closeModal;
productModalBg.onclick = closeModal;

function renderProducts() {
  productsList.innerHTML = '<tr><td colspan="6" class="table-loading">Loading...</td></tr>';
  database.ref('products').once('value').then(snap => {
    const products = snap.val() || {};
    if (Object.keys(products).length === 0) {
      productsList.innerHTML = '<tr><td colspan="6" class="table-loading">No products found</td></tr>';
      return;
    }
    productsList.innerHTML = '';
    Object.entries(products).forEach(([id, p]) => {
      productsList.innerHTML += `
        <tr>
          <td>${p.name}</td>
          <td>₹${p.price}</td>
          <td>${p.desc}</td>
          <td><img src="${p.img}" alt="${p.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;"></td>
          <td>${p.badge || ''}</td>
          <td>
            <button class="add-product-btn" style="padding:0.3em 1em;font-size:0.98em;" onclick="editProduct('${id}')">Edit</button>
            <button class="add-product-btn" style="background:#e53935;padding:0.3em 1em;font-size:0.98em;margin-left:0.5em;" onclick="deleteProduct('${id}')">Delete</button>
          </td>
        </tr>
      `;
    });
  }).catch(() => {
    productsList.innerHTML = '<tr><td colspan="6" class="table-loading">Failed to load products</td></tr>';
  });
}
window.editProduct = function(id) {
  database.ref('products/' + id).once('value').then(snap => {
    const p = snap.val();
    if (p) showModal(true, { ...p, id });
  });
};
window.deleteProduct = function(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  database.ref('products/' + id).remove().then(renderProducts);
};
productForm.onsubmit = function(e) {
  e.preventDefault();
  saveProductBtn.disabled = true;
  const id = document.getElementById('productId').value || database.ref().child('products').push().key;
  const product = {
    name: document.getElementById('productName').value,
    price: parseFloat(document.getElementById('productPrice').value),
    desc: document.getElementById('productDesc').value,
    img: document.getElementById('productImg').value,
    badge: document.getElementById('productBadge').value
  };
  database.ref('products/' + id).set(product).then(() => {
    closeModal();
    renderProducts();
    saveProductBtn.disabled = false;
  }).catch(() => {
    alert('Failed to save product.');
    saveProductBtn.disabled = false;
  });
};
// Initial load
renderProducts(); 