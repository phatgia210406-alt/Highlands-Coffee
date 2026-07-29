// Highlands Coffee Main Application JS
document.addEventListener('DOMContentLoaded', function () {
  console.log('Highlands Coffee App Initialized');

  // Load cart count from localStorage
  updateCartBadge();
  
  // Check and update auth state in header
  initAuthState();

  // Category menu toggle
  const categoryBtn = document.getElementById('categoryMenuBtn');
  const categoryDropdown = document.getElementById('categoryDropdown');
  if (categoryBtn && categoryDropdown) {
    categoryBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      categoryDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function (e) {
      if (!categoryDropdown.contains(e.target) && !categoryBtn.contains(e.target)) {
        categoryDropdown.classList.remove('show');
      }
    });
  }

  // Cart Drawer toggle
  const cartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');

  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartBackdrop) cartBackdrop.classList.add('show');
    renderCartDrawerItems();
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartBackdrop) cartBackdrop.classList.remove('show');
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = '/pages/cart.html';
    });
  }
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  // Search input binding & Placeholder Typing Animation
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    const fullText = 'Xin chào, bạn cần gì hôm nay?';
    let charIndex = 0;
    let isDeleting = false;
    let typingTimeout = null;

    function typePlaceholder() {
      if (document.activeElement === searchInput || searchInput.value.length > 0) {
        typingTimeout = setTimeout(typePlaceholder, 1000);
        return;
      }

      if (isDeleting) {
        charIndex--;
        searchInput.setAttribute('placeholder', fullText.substring(0, charIndex));
        if (charIndex === 0) {
          isDeleting = false;
          typingTimeout = setTimeout(typePlaceholder, 400);
          return;
        }
        typingTimeout = setTimeout(typePlaceholder, 40);
      } else {
        charIndex++;
        searchInput.setAttribute('placeholder', fullText.substring(0, charIndex));
        if (charIndex === fullText.length) {
          isDeleting = true;
          typingTimeout = setTimeout(typePlaceholder, 2500);
          return;
        }
        typingTimeout = setTimeout(typePlaceholder, 90);
      }
    }

    setTimeout(typePlaceholder, 300);

    searchInput.addEventListener('focus', function () {
      clearTimeout(typingTimeout);
      if (searchInput.value.length === 0) {
        searchInput.setAttribute('placeholder', fullText);
      }
    });

    searchInput.addEventListener('blur', function () {
      if (searchInput.value.length === 0) {
        charIndex = 0;
        isDeleting = false;
        typePlaceholder();
      }
    });

    searchInput.addEventListener('input', function (e) {
      const query = e.target.value.toLowerCase().trim();
      filterProductsBySearch(query);
    });
  }
});

// Helper: Get cart from localStorage (checking both 'highlands_cart' and 'cart')
function getCart() {
  try {
    const highlandsCart = localStorage.getItem('highlands_cart');
    if (highlandsCart) return JSON.parse(highlandsCart);
    const legacyCart = localStorage.getItem('cart');
    if (legacyCart) return JSON.parse(legacyCart);
  } catch (e) {
    console.error('Error parsing cart from localStorage', e);
  }
  return [];
}

// Helper: Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('highlands_cart', JSON.stringify(cart));
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  window.dispatchEvent(new Event('cartUpdated'));
}

// Helper: Add product to cart
function addToCartGlobal(product, addQty) {
  if (!product) return;
  const qtyToAdd = typeof addQty === 'number' && addQty > 0 ? addQty : (product.quantity || 1);
  const cart = getCart();
  
  // Unique item ID based on productId and size (e.g., phin-sua-da-S)
  const itemId = product.id || (product.productId ? (product.size ? `${product.productId}-${product.size}` : product.productId) : 'prod-' + Date.now());
  const existing = cart.find(item => item.id === itemId);

  if (existing) {
    existing.quantity += qtyToAdd;
  } else {
    cart.push({
      id: itemId,
      productId: product.productId || product.id || itemId,
      name: product.name || 'Sản phẩm Highlands',
      size: product.size || '',
      price: typeof product.price === 'number' ? product.price : (parseInt(product.price, 10) || 0),
      image: product.image || '/assets/images/placeholder.jpg?v=2',
      quantity: qtyToAdd
    });
  }
  saveCart(cart);
}

// Helper: Remove product from cart
function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
}

// Update Cart Badge count everywhere on page
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const badges = document.querySelectorAll('#cartBadgeCount, .cart-count-badge');
  badges.forEach(badge => {
    badge.textContent = count;
  });
}

// Export functions to global window scope
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCartGlobal = addToCartGlobal;
window.removeFromCart = removeFromCart;
window.updateCartBadge = updateCartBadge;

// Render Cart Drawer
function renderCartDrawerItems() {
  const container = document.getElementById('cartDrawerList');
  const totalEl = document.getElementById('cartDrawerTotal');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<div class="text-center py-5 text-muted">Giỏ hàng của bạn đang trống</div>';
    if (totalEl) totalEl.textContent = '0đ';
    return;
  }

  let total = 0;
  let html = '';

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `
      <div class="d-flex align-items-center gap-3 py-2 border-bottom">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
        <div class="flex-grow-1 min-w-0">
          <div class="fw-bold text-truncate" style="font-size: 14px;">${item.name}</div>
          <div class="text-danger fw-bold" style="font-size: 13px;">${item.price.toLocaleString('vi-VN')}đ</div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button onclick="changeQuantity('${item.id}', -1)" class="btn btn-sm btn-outline-secondary px-2 py-0">-</button>
          <span class="fw-bold" style="font-size: 13px;">${item.quantity}</span>
          <button onclick="changeQuantity('${item.id}', 1)" class="btn btn-sm btn-outline-secondary px-2 py-0">+</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalEl) totalEl.textContent = `${total.toLocaleString('vi-VN')}đ`;
}

// Change item quantity
function changeQuantity(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }
  saveCart(cart);
  renderCartDrawerItems();
}

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: #90091c; color: white; padding: 12px 20px; border-radius: 10px; font-weight: bold; font-size: 13px; z-index: 2000; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: all 0.3s; opacity: 0; transform: translateY(10px);';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2500);
}

// Global Filter Products function for search
function filterProductsBySearch(query) {
  const cards = document.querySelectorAll('.product-card-item');
  cards.forEach(card => {
    const title = card.getAttribute('data-title') || '';
    if (title.toLowerCase().includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Global Go To Product Detail function
function goToProductDetail(product) {
  if (!product) return;
  if (typeof product === 'string') {
    try {
      product = JSON.parse(product);
    } catch (e) {
      console.error('Invalid product json', e);
      return;
    }
  }
  localStorage.setItem('selectedProduct', JSON.stringify(product));
  
  const catVal = product.category || product.categoryName || '';
  const targetUrl = `/pages/product-detail.html?id=${encodeURIComponent(product.id || '')}&name=${encodeURIComponent(product.name || '')}&price=${product.price || 0}&image=${encodeURIComponent(product.image || '')}&category=${encodeURIComponent(catVal)}`;
  window.location.href = targetUrl;
}
window.goToProductDetail = goToProductDetail;

// ==========================================
// Auth State Management & Header UI Sync
// ==========================================
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser') || localStorage.getItem('highlands_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

function initAuthState() {
  const currentUser = getCurrentUser();
  const accountLinks = document.querySelectorAll('a[href*="profile.html"], a[href*="login.html"]');

  accountLinks.forEach(link => {
    if (link.querySelector('span.material-symbols-outlined') && link.querySelector('.lh-sm')) {
      const textContainer = link.querySelector('.lh-sm');
      if (currentUser) {
        link.href = '/pages/profile.html';
        const displayName = currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser.name || 'Thành viên');
        textContainer.innerHTML = `
          <div style="font-weight: 400; color: #111;">Xin chào</div>
          <div style="font-size: 12px; font-weight: 700; color: #b81c24; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayName}</div>
        `;
      } else {
        link.href = '/login.html';
        textContainer.innerHTML = `
          <div style="font-weight: 400; color: #111;">Tài khoản</div>
          <div style="font-size: 12px; font-weight: 400; color: #111;">Đăng nhập</div>
        `;
      }
    }
  });

  // Attach click listener to logout buttons across all pages
  const logoutBtns = document.querySelectorAll('#logoutBtn, .logout-btn, [data-action="logout"]');
  logoutBtns.forEach(btn => {
    btn.onclick = handleLogout;
  });
}

function handleLogout(e) {
  if (e) e.preventDefault();
  localStorage.removeItem('currentUser');
  localStorage.removeItem('highlands_user');
  localStorage.removeItem('user');
  localStorage.removeItem('user_session');
  alert('Đăng xuất thành công!');
  window.location.href = '/index.html';
}

window.getCurrentUser = getCurrentUser;
window.initAuthState = initAuthState;
window.handleLogout = handleLogout;





