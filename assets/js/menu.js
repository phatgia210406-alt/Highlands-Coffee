/**
 * ==========================================================================
 * HIGHLANDS COFFEE - CATEGORY MENU CONTROLLER
 * ==========================================================================
 * Điều khiển 2 trạng thái hiển thị của Danh mục sản phẩm:
 * 1. Trang chủ (.is-homepage): Sidebar hiển thị cố định bên trái banner.
 * 2. Trang con (.is-inner-page): Sidebar ẩn, Nút header kích hoạt menu dropdown xổ xuống khi hover / click.
 */

document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;
  const currentPath = window.location.pathname;

  // ------------------------------------------------------------------------
  // 1. TỰ ĐỘNG XÁC ĐỊNH LOẠI TRANG (HOMEPAGE HOẶC INNER PAGE)
  // ------------------------------------------------------------------------
  const isHomepage = 
    currentPath === '/' || 
    currentPath === '/index.html' || 
    currentPath.endsWith('/index.html') || 
    body.classList.contains('is-homepage');

  if (isHomepage) {
    body.classList.add('is-homepage');
    body.classList.remove('is-inner-page');
  } else {
    body.classList.add('is-inner-page');
    body.classList.remove('is-homepage');
  }

  // ------------------------------------------------------------------------
  // 1.5. ĐỒNG BỘ DANH MỤC SẢN PHẨM (8 CATEGORIES CHUẨN)
  // ------------------------------------------------------------------------
  const dropdownMenu = document.getElementById('categoryDropdownMenu');
  if (dropdownMenu) {
    const categories = [
      { name: 'Cà Phê', path: '/pages/coffee.html', icon: 'coffee', iconClass: 'cat-icon-coffee' },
      { name: 'Trà', path: '/pages/tea.html', icon: 'emoji_food_beverage', iconClass: 'cat-icon-tea' },
      { name: 'Freeze', path: '/pages/freeze.html', icon: 'icecream', iconClass: 'cat-icon-freeze' },
      { name: 'PhinĐI', path: '/pages/phindi.html', icon: 'coffee_maker', iconClass: 'cat-icon-phindi' },
      { name: 'Bánh Mì Que', path: '/pages/banh-mi-que.html', icon: 'bakery_dining', iconClass: 'cat-icon-banhmi' },
      { name: 'Bánh Ngọt', path: '/pages/cake.html', icon: 'cake', iconClass: 'cat-icon-cake' },
      { name: 'Thức Uống Khác', path: '/pages/drinks.html', icon: 'local_bar', iconClass: 'cat-icon-drinks' },
      { name: 'MatchaĐI', path: '/pages/matcha.html', icon: 'eco', iconClass: 'cat-icon-matcha' }
    ];

    const isCurrentPage = (path) => {
      // Decode URL encoding (like %20 to spaces) to accurately match
      const decodedCurrent = decodeURIComponent(currentPath);
      const decodedPath = decodeURIComponent(path);
      return decodedCurrent === decodedPath || decodedCurrent.endsWith(decodedPath);
    };

    dropdownMenu.innerHTML = categories.map(cat => {
      const activeClass = isCurrentPage(cat.path) ? 'active' : '';
      return `
        <a href="${cat.path}" class="dropdown-cat-item ${activeClass}">
          <span class="material-symbols-outlined cat-icon ${cat.iconClass}">${cat.icon}</span>
          <span>${cat.name}</span>
        </a>
      `;
    }).join('');
  }

  // ------------------------------------------------------------------------
  // 1.8. ĐỒNG BỘ CHIỀU CAO MENU DANH MỤC VỚI CHIỀU CAO BANNER TRÊN TRANG CHỦ
  // ------------------------------------------------------------------------
  function syncHeights() {
    if (!body.classList.contains('is-homepage')) return;
    const banner = document.querySelector('.hero-banner-container');
    const menu = document.getElementById('categoryDropdownMenu');
    const trigger = document.querySelector('.category-header-white-box');
    if (banner && menu && trigger && window.innerWidth >= 992) {
      const bannerRect = banner.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const desiredHeight = bannerRect.bottom - triggerRect.bottom;
      if (desiredHeight > 100) {
        menu.style.setProperty('height', `${desiredHeight}px`, 'important');
      }
    } else if (menu) {
      menu.style.removeProperty('height');
    }
  }

  // Chạy ngay khi tải và khi thay đổi kích thước cửa sổ / zoom
  syncHeights();
  window.addEventListener('resize', syncHeights);

  // Đảm bảo đồng bộ chính xác khi hình ảnh trong banner tải xong
  const bannerImg = document.querySelector('.hero-banner-img');
  if (bannerImg) {
    bannerImg.addEventListener('load', syncHeights);
  }

  // ------------------------------------------------------------------------
  // 2. TƯƠNG TÁC HOVER & CLICK CHO MENU DROPDOWN
  // ------------------------------------------------------------------------
  const menuWrapper = document.querySelector('.category-menu-wrapper');
  const triggerBtn = document.querySelector('.category-header-white-box');

  if (menuWrapper && triggerBtn) {
    // Thêm hỗ trợ Click / Touch (cho thiết bị di động & tablet)
    triggerBtn.addEventListener('click', function (e) {
      if (body.classList.contains('is-inner-page') || window.innerWidth < 992) {
        // Nếu click trên trang con hoặc trên mobile/tablet, toggle trạng thái mở/đóng menu
        e.preventDefault();
        menuWrapper.classList.toggle('is-open');
        const isExpanded = menuWrapper.classList.contains('is-open');
        triggerBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      }
    });

    // Tự động đóng dropdown khi con trỏ di chuột ra khỏi khung (trên Desktop)
    menuWrapper.addEventListener('mouseleave', function () {
      if (body.classList.contains('is-inner-page') || window.innerWidth < 992) {
        menuWrapper.classList.remove('is-open');
        triggerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Đóng dropdown khi nhấp chuột ra ngoài vùng menu
    document.addEventListener('click', function (e) {
      if (menuWrapper && !menuWrapper.contains(e.target)) {
        menuWrapper.classList.remove('is-open');
        triggerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Đóng dropdown khi người dùng bấm phím ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        menuWrapper.classList.remove('is-open');
        triggerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

