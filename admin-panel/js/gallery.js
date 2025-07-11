// Gallery CRUD for admin panel
const galleryList = document.getElementById('gallery-list');
const galleryModalBg = document.getElementById('galleryModalBg');
const galleryModal = document.getElementById('galleryModal');
const galleryForm = document.getElementById('galleryForm');
const openAddGalleryModal = document.getElementById('openAddGalleryModal');
const closeGalleryModal = document.getElementById('closeGalleryModal');
const saveGalleryBtn = document.getElementById('saveGalleryBtn');

function showGalleryModal() {
  galleryModalBg.style.display = 'block';
  galleryModal.style.display = 'block';
  galleryForm.reset();
}
function closeGalleryModalFn() {
  galleryModalBg.style.display = 'none';
  galleryModal.style.display = 'none';
}
openAddGalleryModal.onclick = showGalleryModal;
closeGalleryModal.onclick = closeGalleryModalFn;
galleryModalBg.onclick = closeGalleryModalFn;

galleryForm.onsubmit = function(e) {
  e.preventDefault();
  saveGalleryBtn.disabled = true;
  const url = document.getElementById('galleryImgUrl').value;
  const id = database.ref().child('gallery').push().key;
  database.ref('gallery/' + id).set(url).then(() => {
    closeGalleryModalFn();
    renderGallery();
    saveGalleryBtn.disabled = false;
  }).catch(() => {
    alert('Failed to save image.');
    saveGalleryBtn.disabled = false;
  });
};

function renderGallery() {
  galleryList.innerHTML = '<div class="table-loading">Loading...</div>';
  database.ref('gallery').once('value').then(snap => {
    const gallery = snap.val() || {};
    if (Object.keys(gallery).length === 0) {
      galleryList.innerHTML = '<div class="table-loading">No images found</div>';
      return;
    }
    galleryList.innerHTML = '';
    Object.entries(gallery).forEach(([id, url]) => {
      galleryList.innerHTML += `
        <div style="display:inline-block;margin:0.5em;vertical-align:top;">
          <div style="position:relative;display:inline-block;">
            <img src="${url}" alt="Gallery" style="width:120px;height:120px;object-fit:cover;border-radius:1rem;box-shadow:0 2px 8px #e5393533;">
            <button onclick="deleteGalleryImg('${id}')" style="position:absolute;top:6px;right:6px;background:#e53935;color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:1.1em;box-shadow:0 1px 4px #e5393533;">&times;</button>
          </div>
        </div>
      `;
    });
  }).catch(() => {
    galleryList.innerHTML = '<div class="table-loading">Failed to load images</div>';
  });
}
window.deleteGalleryImg = function(id) {
  if (!confirm('Are you sure you want to delete this image?')) return;
  database.ref('gallery/' + id).remove().then(renderGallery);
};
// Initial load
renderGallery(); 