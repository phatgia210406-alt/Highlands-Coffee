/**
 * ==========================================================================
 * HIGHLANDS COFFEE - SMART REALTIME SEARCH & QUICK VIEW CONTROLLER
 * ==========================================================================
 * Realtime accent-insensitive search engine with live dropdown suggestions
 * and full product options modal (Size, Topping, Quantity, Cart/Buy Now).
 */

(function () {
  'use strict';

  // Global Product Cache
  let allProducts = [];
  let isProductsLoaded = false;
  let currentSearchQuery = '';
  let currentViewMode = 'list'; // 'list' or 'grid'

  // Accent Removal Helper Function
  function removeVietnameseTones(str) {
    if (!str) return '';
    str = String(str).toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return str.trim();
  }

  // Debounce Utility
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait || 200);
    };
  }

  // Format Currency
  function formatMoney(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(amount, 10) || 0;
    return num.toLocaleString('vi-VN') + 'đ';
  }

  // Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Fetch all products on initial load
  async function loadProductsData() {
    if (isProductsLoaded && allProducts.length > 0) return;

    try {
      const res = await fetch('/data/all-products.json');
      if (res.ok) {
        allProducts = await res.json();
        isProductsLoaded = true;
        return;
      }
    } catch (e) {
      console.warn('Fallback loading separate JSON files');
    }

    // Fallback: Fetch individual JSON files if needed
    const files = [
      '/data/coffee.json',
      '/data/tea.json',
      '/data/freeze.json',
      '/data/phindi.json',
      '/data/cake.json',
      '/data/banh-mi-que.json',
      '/data/matcha.json',
      '/data/drinks.json',
      '/data/accessories.json',
      '/data/packaged-coffee.json',
      '/data/mooncake.json'
    ];

    const seenIds = new Set();
    const fetchedLists = await Promise.allSettled(
      files.map(f => fetch(f).then(r => r.json()))
    );

    fetchedLists.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        result.value.forEach(item => {
          if (item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            allProducts.push(item);
          }
        });
      }
    });

    isProductsLoaded = true;
  }

  // Search Filter Engine
  function searchProducts(query) {
    if (!query) return [];
    const qNorm = removeVietnameseTones(query);
    if (!qNorm) return [];

    const words = qNorm.split(/\s+/).filter(Boolean);

    // Synonym Mapping for Broad Search
    let categorySynonyms = '';
    if (qNorm.includes('ca phe') || qNorm.includes('coffee') || qNorm === 'ca') {
      categorySynonyms += ' coffee ca phe phin espresso cappuccino americano latte macchiato bac xiu';
    }
    if (qNorm.includes('tra') || qNorm.includes('tea')) {
      categorySynonyms += ' tra tea sen peach lychee lemon';
    }
    if (qNorm.includes('freeze') || qNorm.includes('friz')) {
      categorySynonyms += ' freeze icecream cookies cream chocolate';
    }
    if (qNorm.includes('banh') || qNorm.includes('cake') || qNorm.includes('bread')) {
      categorySynonyms += ' banh cake bread tiramisu mousse croissant';
    }

    return allProducts.filter(p => {
      const nameNorm = removeVietnameseTones(p.name);
      const catNorm = removeVietnameseTones(p.category || p.categoryName || '');
      const descNorm = removeVietnameseTones(p.description || '');

      const fullSearchText = `${nameNorm} ${catNorm} ${descNorm} ${categorySynonyms}`;

      // Check if all query words exist in product searchable text
      return words.every(w => fullSearchText.includes(w));
    });
  }

  // Initialize Search Inputs across DOM
  function initSearchInputs() {
    const inputs = document.querySelectorAll('#searchInput, .search-box input');
    if (!inputs || inputs.length === 0) return;

    inputs.forEach(input => {
      // Ensure input parent has search-box container
      const container = input.closest('.search-box') || input.parentElement;
      if (!container.classList.contains('search-box')) {
        container.classList.add('search-box');
      }

      // Check or create dropdown container
      let dropdown = container.querySelector('.search-dropdown');
      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        container.appendChild(dropdown);
      }

      // Debounced Input Listener (~200ms)
      const handleInput = debounce(function (e) {
        const val = e.target.value.trim();
        currentSearchQuery = val;
        if (!val) {
          dropdown.classList.remove('show');
          dropdown.innerHTML = '';
          return;
        }

        renderSearchResults(val, dropdown);
      }, 200);

      input.addEventListener('input', handleInput);
      input.addEventListener('focus', function () {
        if (input.value.trim()) {
          renderSearchResults(input.value.trim(), dropdown);
        }
      });
    });

    // Close search dropdown on click outside
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-box')) {
        document.querySelectorAll('.search-dropdown').forEach(d => {
          d.classList.remove('show');
        });
      }
    });

    // Close search dropdown on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.search-dropdown').forEach(d => {
          d.classList.remove('show');
        });
      }
    });
  }

  // Render Search Dropdown Results
  function renderSearchResults(query, dropdownEl) {
    if (!dropdownEl) return;

    const results = searchProducts(query);
    dropdownEl.classList.add('show');

    const displayCount = results.length;

    let html = `
      <div class="search-header">
        <div class="search-title">
          Kết quả tìm kiếm cho <strong>"${escapeHtml(query)}"</strong> (${displayCount})
        </div>
      </div>
    `;

    if (displayCount === 0) {
      html += `
        <div class="search-no-results text-center py-4">
          <div class="fw-bold text-dark mb-1" style="font-size: 15px;">Không tìm thấy kết quả</div>
          <div class="text-secondary small mb-3">Gợi ý tìm kiếm:</div>
          <div class="d-flex flex-wrap justify-content-center gap-2">
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 search-chip-btn" data-query="Cà Phê">Coffee</button>
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 search-chip-btn" data-query="Trà">Tea</button>
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 search-chip-btn" data-query="Freeze">Freeze</button>
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 search-chip-btn" data-query="Bánh">Cake</button>
          </div>
        </div>
      `;
    } else {
      html += `<div class="search-results-list">`;
      results.forEach(item => {
        const catName = item.categoryName || item.category || 'Highlands';
        const imgUrl = item.image || '/assets/images/placeholder.jpg?v=2';
        const itemJson = escapeHtml(JSON.stringify(item));

        html += `
          <div class="search-item" data-product="${itemJson}">
            <img src="${imgUrl}" alt="${escapeHtml(item.name)}" class="search-item-img" onerror="this.src='/assets/images/placeholder.jpg?v=2'">
            <div class="search-item-info">
              <div class="search-item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
              <div class="d-flex align-items-center justify-content-between gap-2">
                <div class="search-item-price">${formatMoney(item.price)}</div>
                <span class="search-item-cat">${escapeHtml(catName)}</span>
              </div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    dropdownEl.innerHTML = html;

    // Attach Event Handlers
    // 1. Click Chip Suggestion
    dropdownEl.querySelectorAll('.search-chip-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const targetQ = this.getAttribute('data-query');
        const input = dropdownEl.closest('.search-box').querySelector('input');
        if (input) {
          input.value = targetQ;
          renderSearchResults(targetQ, dropdownEl);
        }
      });
    });

    // 2. Click Product Item -> Open Quick View Modal!
    dropdownEl.querySelectorAll('.search-item').forEach(itemEl => {
      itemEl.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropdownEl.classList.remove('show');

        try {
          const product = JSON.parse(this.getAttribute('data-product'));
          if (typeof window.goToProductDetail === 'function') {
            window.goToProductDetail(product);
          } else {
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            const catVal = product.category || product.categoryName || '';
            const targetUrl = `/pages/product-detail.html?id=${encodeURIComponent(product.id || '')}&name=${encodeURIComponent(product.name || '')}&price=${product.price || 0}&image=${encodeURIComponent(product.image || '')}&category=${encodeURIComponent(catVal)}`;
            window.location.href = targetUrl;
          }
        } catch (err) {
          console.error('Error parsing product JSON', err);
        }
      });
    });
  }

  // ==========================================================================
  // QUICK VIEW MODAL (Size, Topping, Quantity, Add to Cart, Buy Now)
  // ==========================================================================
  function openProductQuickViewModal(product) {
    if (!product) return;

    let backdrop = document.getElementById('searchProductModalBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'searchProductModalBackdrop';
      backdrop.className = 'search-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const basePrice = typeof product.price === 'number' ? product.price : parseInt(product.price, 10) || 0;
    const catName = product.categoryName || product.category || 'Highlands Coffee';
    const isDrink = !/bánh|bread|cake|phụ kiện|tumbler|ly|gói/i.test(catName + ' ' + product.name);

    let selectedSizePrice = 0;
    let selectedSizeName = 'S';
    let selectedToppings = [];
    let currentQty = 1;

    function renderModalContent() {
      const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
      const unitPrice = basePrice + selectedSizePrice + toppingTotal;
      const totalPrice = unitPrice * currentQty;

      backdrop.innerHTML = `
        <div class="search-modal-card">
          <button type="button" class="search-modal-close" id="closeQuickViewModalBtn">&times;</button>
          
          <div class="row g-4 align-items-center">
            <!-- Product Image -->
            <div class="col-12 col-md-5 text-center">
              <div class="p-3 bg-light rounded-4 border">
                <img src="${product.image || '/assets/images/placeholder.jpg?v=2'}" 
                     alt="${escapeHtml(product.name)}" 
                     class="img-fluid rounded-3" 
                     style="max-height: 280px; object-fit: contain;"
                     onerror="this.src='/assets/images/placeholder.jpg?v=2'">
              </div>
            </div>

            <!-- Product Controls -->
            <div class="col-12 col-md-7">
              <div class="badge bg-danger-subtle text-danger fw-bold px-3 py-1 rounded-pill mb-2" style="font-size: 12px;">
                ${escapeHtml(catName)}
              </div>
              <h4 class="fw-bold text-dark mb-2" style="font-size: 22px;">${escapeHtml(product.name)}</h4>
              <p class="text-secondary small mb-3">${escapeHtml(product.description || 'Sản phẩm thơm ngon đặc trưng từ thương hiệu Highlands Coffee®.')}</p>

              <div class="d-flex align-items-baseline gap-2 mb-4">
                <span class="fs-3 fw-bold text-danger">${formatMoney(totalPrice)}</span>
                ${basePrice !== unitPrice ? `<span class="text-muted small">(Đã gồm tùy chọn)</span>` : ''}
              </div>

              ${isDrink ? `
                <!-- Size Selector -->
                <div class="mb-3">
                  <label class="form-label fw-bold text-dark mb-2" style="font-size: 13.5px;">Kích thước (Size):</label>
                  <div class="option-pill-group">
                    <div class="option-pill ${selectedSizeName === 'S' ? 'active' : ''}" data-size="S" data-add="0">Size S (+0đ)</div>
                    <div class="option-pill ${selectedSizeName === 'M' ? 'active' : ''}" data-size="M" data-add="10000">Size M (+10.000đ)</div>
                    <div class="option-pill ${selectedSizeName === 'L' ? 'active' : ''}" data-size="L" data-add="16000">Size L (+16.000đ)</div>
                  </div>
                </div>

                <!-- Topping Selector -->
                <div class="mb-4">
                  <label class="form-label fw-bold text-dark mb-2" style="font-size: 13.5px;">Thêm Topping (Tùy chọn):</label>
                  <div class="option-pill-group">
                    <div class="option-pill topping-pill ${selectedToppings.some(t => t.id === 'top-1') ? 'active' : ''}" data-top-id="top-1" data-top-name="Thạch Giòn" data-top-price="10000">+ Thạch Giòn (+10.000đ)</div>
                    <div class="option-pill topping-pill ${selectedToppings.some(t => t.id === 'top-2') ? 'active' : ''}" data-top-id="top-2" data-top-name="Thạch Đào" data-top-price="10000">+ Thạch Đào (+10.000đ)</div>
                    <div class="option-pill topping-pill ${selectedToppings.some(t => t.id === 'top-3') ? 'active' : ''}" data-top-id="top-3" data-top-name="Kem Sữa" data-top-price="10000">+ Kem Sữa (+10.000đ)</div>
                    <div class="option-pill topping-pill ${selectedToppings.some(t => t.id === 'top-4') ? 'active' : ''}" data-top-id="top-4" data-top-name="Hạt Sen" data-top-price="10000">+ Hạt Sen (+10.000đ)</div>
                  </div>
                </div>
              ` : ''}

              <!-- Quantity & Actions -->
              <div class="d-flex align-items-center gap-3 mb-4">
                <label class="fw-bold text-dark mb-0" style="font-size: 13.5px;">Số lượng:</label>
                <div class="d-flex align-items-center gap-1">
                  <button type="button" class="qty-btn" id="modalQtyMinus">-</button>
                  <input type="number" class="qty-input" id="modalQtyVal" value="${currentQty}" min="1" readonly>
                  <button type="button" class="qty-btn" id="modalQtyPlus">+</button>
                </div>
              </div>

              <div class="row g-2">
                <div class="col-6">
                  <button type="button" class="btn btn-danger w-100 py-2.5 fw-bold rounded-3 text-uppercase" id="modalAddToCartBtn" style="font-size: 14px; background-color: #b81c24;">
                    Thêm vào giỏ
                  </button>
                </div>
                <div class="col-6">
                  <button type="button" class="btn btn-outline-danger w-100 py-2.5 fw-bold rounded-3 text-uppercase" id="modalBuyNowBtn" style="font-size: 14px;">
                    Mua ngay
                  </button>
                </div>
              </div>

              <div class="text-center mt-3">
                <a href="/pages/product-detail.html?id=${encodeURIComponent(product.id || '')}&name=${encodeURIComponent(product.name || '')}&price=${basePrice}&image=${encodeURIComponent(product.image || '')}&category=${encodeURIComponent(catName)}" 
                   class="text-decoration-none small text-secondary fw-semibold">
                  Xem trang chi tiết đầy đủ &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      `;

      // Event Binding inside Modal
      backdrop.querySelector('#closeQuickViewModalBtn').onclick = closeModal;
      backdrop.onclick = function (e) {
        if (e.target === backdrop) closeModal();
      };

      // Size binding
      backdrop.querySelectorAll('[data-size]').forEach(el => {
        el.onclick = function () {
          selectedSizeName = this.getAttribute('data-size');
          selectedSizePrice = parseInt(this.getAttribute('data-add'), 10) || 0;
          renderModalContent();
        };
      });

      // Topping binding
      backdrop.querySelectorAll('.topping-pill').forEach(el => {
        el.onclick = function () {
          const topId = this.getAttribute('data-top-id');
          const topName = this.getAttribute('data-top-name');
          const topPrice = parseInt(this.getAttribute('data-top-price'), 10) || 0;

          const idx = selectedToppings.findIndex(t => t.id === topId);
          if (idx > -1) {
            selectedToppings.splice(idx, 1);
          } else {
            selectedToppings.push({ id: topId, name: topName, price: topPrice });
          }
          renderModalContent();
        };
      });

      // Quantity binding
      const qtyMinus = backdrop.querySelector('#modalQtyMinus');
      const qtyPlus = backdrop.querySelector('#modalQtyPlus');
      if (qtyMinus) {
        qtyMinus.onclick = function () {
          if (currentQty > 1) {
            currentQty--;
            renderModalContent();
          }
        };
      }
      if (qtyPlus) {
        qtyPlus.onclick = function () {
          currentQty++;
          renderModalContent();
        };
      }

      // Add to Cart action
      const addCartBtn = backdrop.querySelector('#modalAddToCartBtn');
      if (addCartBtn) {
        addCartBtn.onclick = function () {
          executeAddToCart(false);
        };
      }

      // Buy Now action
      const buyNowBtn = backdrop.querySelector('#modalBuyNowBtn');
      if (buyNowBtn) {
        buyNowBtn.onclick = function () {
          executeAddToCart(true);
        };
      }
    }

    function closeModal() {
      backdrop.classList.remove('active');
    }

    function executeAddToCart(redirectCheckout = false) {
      const toppingText = selectedToppings.length > 0 ? ` (${selectedToppings.map(t => t.name).join(', ')})` : '';
      const finalName = `${product.name} [Size ${selectedSizeName}]${toppingText}`;
      const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
      const unitPrice = basePrice + selectedSizePrice + toppingTotal;

      const cartItem = {
        id: `${product.id || 'prod'}-${selectedSizeName}-${selectedToppings.map(t => t.id).join('-')}`,
        productId: product.id || 'prod',
        name: finalName,
        size: selectedSizeName,
        price: unitPrice,
        image: product.image || '/assets/images/placeholder.jpg?v=2',
        quantity: currentQty
      };

      if (typeof window.addToCartGlobal === 'function') {
        window.addToCartGlobal(cartItem, currentQty);
      } else {
        // Fallback local cart storage
        try {
          const cart = JSON.parse(localStorage.getItem('highlands_cart') || '[]');
          const exist = cart.find(i => i.id === cartItem.id);
          if (exist) {
            exist.quantity += currentQty;
          } else {
            cart.push(cartItem);
          }
          localStorage.setItem('highlands_cart', JSON.stringify(cart));
          localStorage.setItem('cart', JSON.stringify(cart));
        } catch (e) {
          console.error(e);
        }
      }

      closeModal();

      if (redirectCheckout) {
        window.location.href = '/pages/checkout.html';
      } else {
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
      }
    }

    renderModalContent();
    backdrop.classList.add('active');
  }

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', async function () {
    await loadProductsData();
    initSearchInputs();
  });

  // Export functions to window
  window.searchProducts = searchProducts;
  window.openProductQuickViewModal = openProductQuickViewModal;
  window.removeVietnameseTones = removeVietnameseTones;

})();
