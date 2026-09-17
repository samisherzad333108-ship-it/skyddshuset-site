let products = [];
let cart = [];
let currentModalProduct = null;
let qty = 1;

// Load external HTML components
async function loadComponent(elementId, filePath) {
  try {
    const response = await fetch(filePath);
    const html = await response.text();
    const targetEl = document.getElementById(elementId);
    if (targetEl) targetEl.innerHTML = html;
  } catch (error) {
    console.error(`Failed to load ${filePath}:`, error);
  }
}

// Fetch products from JSON file
async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    products = await response.json();
    renderProducts('all');
  } catch (error) {
    console.error("Failed to load products:", error);
  }
}

// Render product cards or empty state message
function renderProducts(cat = 'all', query = '') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  let filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
  if (query.trim() !== '') {
    filtered = filtered.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-2 text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <i class="fa-solid fa-box-open text-3xl text-gray-300 mb-2"></i>
        <p class="text-xs text-gray-500 font-medium">Inga produkter hittades.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <a href="product.html?id=${p.id}" class="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition active:scale-95 flex flex-col justify-between">
      <div>
        <div class="h-28 bg-gray-50 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
          <img src="${p.img}" alt="${p.title}" class="h-full w-full object-cover" />
        </div>
        <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">${p.badge || 'Produkt'}</span>
        <h3 class="font-bold text-xs text-slate-800 line-clamp-2 mt-0.5">${p.title}</h3>
      </div>
      <div class="mt-2 flex items-center justify-between">
        <div>
          <span class="font-extrabold text-sm text-slate-900">${p.price} kr</span>
          ${p.oldPrice ? `<span class="text-[10px] text-gray-400 line-through ml-1">${p.oldPrice} kr</span>` : ''}
        </div>
        <span class="bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold">Visa</span>
      </div>
    </a>
  `).join('');
}

function handleSearch() {
  const query = document.getElementById('search-input')?.value || '';
  renderProducts('all', query);
}

function filterCategory(cat) {
  const content = document.getElementById('content-area');
  if (content) {
    content.classList.add('opacity-0', 'translate-y-2');
  }
  
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.className = "cat-btn bg-white text-gray-700 border border-gray-200 px-5 py-2 rounded-full text-xs font-semibold shadow-sm";
  });
  const selectedBtn = document.getElementById(`btn-${cat}`);
  if (selectedBtn) {
    selectedBtn.className = "cat-btn bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-sm";
  }

  setTimeout(() => {
    renderProducts(cat);
    if (content) {
      content.classList.remove('opacity-0', 'translate-y-2');
    }
  }, 200);
}

function toggleMenu(open) {
  const drawer = document.getElementById('side-drawer');
  const box = document.getElementById('drawer-menu-box');
  if (!drawer || !box) return;
  if (open) {
    drawer.classList.remove('hidden');
    setTimeout(() => {
      drawer.classList.remove('opacity-0');
      box.classList.remove('-translate-x-full');
    }, 10);
  } else {
    box.classList.add('-translate-x-full');
    drawer.classList.add('opacity-0');
    setTimeout(() => drawer.classList.add('hidden'), 300);
  }
}

function openProductModal(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;
  currentModalProduct = p;
  qty = 1;
  const qtyEl = document.getElementById('qty-val');
  if (qtyEl) qtyEl.innerText = qty;

  document.getElementById('modal-img').src = p.img;
  document.getElementById('modal-cat').innerText = p.badge || 'Produkt';
  document.getElementById('modal-title').innerText = p.title;
  document.getElementById('modal-sku').innerText = `SKU: ${p.sku || 'N/A'}`;
  document.getElementById('modal-price').innerText = `${p.price},00 kr`;
  document.getElementById('modal-desc').innerText = p.desc || '';
  
  const oldPriceEl = document.getElementById('modal-old-price');
  const badgeEl = document.getElementById('modal-badge');
  if (p.oldPrice) {
    oldPriceEl.innerText = `${p.oldPrice},00 kr`;
    oldPriceEl.classList.remove('hidden');
    badgeEl.classList.remove('hidden');
  } else {
    oldPriceEl.classList.add('hidden');
    badgeEl.classList.add('hidden');
  }

  const modal = document.getElementById('product-modal');
  const box = document.getElementById('modal-box');
  if (modal && box) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      box.classList.remove('translate-y-full');
    }, 10);
  }
}

function closeProductModal(e) {
  if (e && e.target !== document.getElementById('product-modal')) return;
  const modal = document.getElementById('product-modal');
  const box = document.getElementById('modal-box');
  if (modal && box) {
    box.classList.add('translate-y-full');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 250);
  }
}

function updateQty(change) {
  qty = Math.max(1, qty + change);
  const qtyEl = document.getElementById('qty-val');
  if (qtyEl) qtyEl.innerText = qty;
}

function toggleCart(open) {
  const drawer = document.getElementById('cart-drawer');
  const box = document.getElementById('cart-box');
  if (!drawer || !box) return;
  if (open) {
    drawer.classList.remove('hidden');
    setTimeout(() => {
      drawer.classList.remove('opacity-0');
      box.classList.remove('translate-x-full');
    }, 10);
  } else {
    box.classList.add('translate-x-full');
    drawer.classList.add('opacity-0');
    setTimeout(() => drawer.classList.add('hidden'), 300);
  }
}

function addToCart() {
  if (!currentModalProduct) return;
  for (let i = 0; i < qty; i++) {
    cart.push(currentModalProduct);
  }
  
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.innerText = cart.length;
  
  const container = document.getElementById('cart-items');
  if (container) {
    document.getElementById('empty-cart-msg')?.remove();
    
    const itemEl = document.createElement('div');
    itemEl.className = "flex justify-between items-center bg-gray-50 p-3 rounded-xl border text-xs";
    itemEl.innerHTML = `
      <div>
        <p class="font-bold text-slate-800">${currentModalProduct.title} (x${qty})</p>
        <p class="text-[10px] text-gray-500">${currentModalProduct.badge || ''}</p>
      </div>
      <span class="font-extrabold text-blue-600">${currentModalProduct.price * qty} kr</span>
    `;
    container.appendChild(itemEl);
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.innerText = `${total} kr`;

  closeProductModal();
  toggleCart(true);
}

// Initialize layout components and products
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadComponent('announcement-wrapper', 'components/announcement.html'),
    loadComponent('header-wrapper', 'components/header.html'),
    loadComponent('menu-wrapper', 'components/menu-drawer.html'),
    loadComponent('hero-wrapper', 'components/hero-banner.html'),
    loadComponent('modal-wrapper', 'components/product-modal.html'),
    loadComponent('cart-wrapper', 'components/cart-drawer.html')
  ]);
  
  loadProducts();
});
