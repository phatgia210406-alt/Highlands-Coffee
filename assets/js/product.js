// Highlands Coffee Product JS (Danh mục & Chi tiết sản phẩm)

/**
 * Hàm chuyển hướng sang trang Chi tiết sản phẩm (Yêu cầu 2 & 14)
 * Lưu thông tin sản phẩm đã click vào localStorage và URL parameter
 */
function goToProductDetail(product) {
  if (typeof product === 'string') {
    try {
      product = JSON.parse(product);
    } catch (e) {
      console.error('Invalid product json', e);
      return;
    }
  }
  // Lưu sản phẩm đã chọn vào localStorage
  localStorage.setItem('selectedProduct', JSON.stringify(product));
  
  const catVal = product.category || product.categoryName || '';
  // Chuyển hướng sang trang /pages/product-detail.html
  const targetUrl = `/pages/product-detail.html?id=${encodeURIComponent(product.id || '')}&name=${encodeURIComponent(product.name || '')}&price=${product.price || 0}&image=${encodeURIComponent(product.image || '')}&category=${encodeURIComponent(catVal)}`;
  window.location.href = targetUrl;
}
window.goToProductDetail = goToProductDetail;

document.addEventListener('DOMContentLoaded', function () {
  // Xử lý nạp danh sách sản phẩm ở trang danh mục (Category Product Grid)
  const gridContainer = document.getElementById('categoryProductGrid');
  if (gridContainer) {
    const categoryFile = gridContainer.getAttribute('data-json') || '/data/tea.json';
    let productsData = [];

    fetch(categoryFile)
      .then(res => res.json())
      .then(data => {
        productsData = data;
        renderProducts(productsData);
      })
      .catch(err => {
        console.error('Error loading product data:', err);
      });

    // Binding các nút sắp xếp (Sort Buttons)
    const sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        sortBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const sortType = this.getAttribute('data-sort');
        let sortedList = [...productsData];

        if (sortType === 'name-asc') {
          sortedList.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        } else if (sortType === 'name-desc') {
          sortedList.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
        } else if (sortType === 'price-asc') {
          sortedList.sort((a, b) => a.price - b.price);
        } else if (sortType === 'price-desc') {
          sortedList.sort((a, b) => b.price - a.price);
        }

        renderProducts(sortedList);
      });
    });
  }

  // Xử lý nếu đang ở trang chi tiết sản phẩm
  if (document.getElementById('productTitle')) {
    loadSelectedProductData();
    renderProductInfo();
  }
});

function renderProducts(list) {
  const container = document.getElementById('categoryProductGrid');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Không tìm thấy sản phẩm nào</div>';
    return;
  }

  let html = '';
  list.forEach(item => {
    let badgeHtml = '';

    const priceFormatted = item.price.toLocaleString('vi-VN') + 'đ';
    let priceHtml = `<span class="cat-product-price">${priceFormatted}</span>`;
    if (item.oldPrice) {
      const oldPriceFormatted = item.oldPrice.toLocaleString('vi-VN') + 'đ';
      priceHtml = `
        <div class="d-flex align-items-baseline gap-1 flex-wrap">
          <span class="cat-product-price">${priceFormatted}</span>
          <span class="text-muted text-decoration-line-through ms-1" style="font-size: 11px; font-weight: 400; color: #888;">${oldPriceFormatted}</span>
        </div>
      `;
    }

    // Chuẩn hóa JSON cho thuộc tính inline onclick
    const itemEscaped = JSON.stringify(item).replace(/"/g, '&quot;');

    // Từng card sản phẩm: Khi click vào card HOẶC bấm nút (+) đều chuyển sang trang chi tiết (Yêu cầu 1, 2, 14)
    html += `
      <div class="cat-product-card product-card-item" style="cursor: pointer;" onclick="goToProductDetail(${itemEscaped})" data-title="${item.name.toLowerCase()}">
        <div class="cat-product-img-wrapper">
          <img src="${item.image}" alt="${item.name}" class="cat-product-img" loading="lazy">
          ${badgeHtml}
        </div>
        <div class="cat-product-body">
          <span class="cat-product-brand">HIGHLANDS COFFEE</span>
          <h3 class="cat-product-title">${item.name}</h3>
          <div class="cat-product-footer">
            ${priceHtml}
            <button onclick="event.stopPropagation(); goToProductDetail(${itemEscaped})" class="btn-add-plus-red" title="Xem chi tiết & chọn mua">+</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/* ================================================================
   LOGIC CHO TRANG CHI TIẾT SẢN PHẨM (MẪU HIGH LANDS COFFEE)
   ================================================================ */

// Object lưu dữ liệu sản phẩm mặc định (Chỉ lưu giá gốc Size S)
function getInitialProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get("id");
  const nameParam = urlParams.get("name");
  const priceParam = urlParams.get("price");
  const imageParam = urlParams.get("image");
  const categoryParam = urlParams.get("category") || urlParams.get("categoryName");

  const savedProductJson = localStorage.getItem("selectedProduct");
  let savedProduct = null;
  if (savedProductJson) {
    try {
      savedProduct = JSON.parse(savedProductJson);
    } catch (err) {}
  }

  if (nameParam && priceParam) {
    const catVal = categoryParam ? decodeURIComponent(categoryParam) : "Trà";
    const prodId = idParam || (savedProduct ? savedProduct.id : "prod-custom");
    let imagesArr = savedProduct && (savedProduct.id === prodId || savedProduct.name === decodeURIComponent(nameParam)) ? savedProduct.images : null;

    return {
      id: prodId,
      name: decodeURIComponent(nameParam),
      price: parseInt(priceParam, 10) || 45000,
      image: imageParam ? decodeURIComponent(imageParam) : (savedProduct ? savedProduct.image : "https://lh3.googleusercontent.com/aida-public/AB6AXuCCiMUe0pv3ROcZXbFrKgrUr0NHG5qKTsini7K7NMrQPPWynslpu1EjG6bloj8DmAnrWXlRPx3Ix24THj_q4iOvxWt2w_xn3GDxL07DBnZLHmJLvHc6xcVGq6aXHRZp_0kxT-W5vZr2nq4LuNG28tSGyKgu5mogcqbi_Y5fVj2YKgBUJUi7jhsqkxQreVaBIsH-tzRfpfSO6tvUDA7kxX39UrrOh3yK_v_SZccCUexjGTW0acK7dXkhSShvTtTK2kWZ6bY"),
      images: imagesArr,
      sku: (savedProduct && savedProduct.sku) || ("00DT" + Math.floor(10 + Math.random() * 90)),
      category: catVal,
      categoryName: catVal
    };
  } else if (savedProduct && savedProduct.name && savedProduct.price) {
    return {
      id: savedProduct.id || "prod-saved",
      name: savedProduct.name,
      price: parseInt(savedProduct.price, 10) || 45000,
      image: savedProduct.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCCiMUe0pv3ROcZXbFrKgrUr0NHG5qKTsini7K7NMrQPPWynslpu1EjG6bloj8DmAnrWXlRPx3Ix24THj_q4iOvxWt2w_xn3GDxL07DBnZLHmJLvHc6xcVGq6aXHRZp_0kxT-W5vZr2nq4LuNG28tSGyKgu5mogcqbi_Y5fVj2YKgBUJUi7jhsqkxQreVaBIsH-tzRfpfSO6tvUDA7kxX39UrrOh3yK_v_SZccCUexjGTW0acK7dXkhSShvTtTK2kWZ6bY",
      images: savedProduct.images || null,
      sku: savedProduct.sku || ("00DT" + Math.floor(10 + Math.random() * 90)),
      category: savedProduct.category || savedProduct.categoryName || "Trà",
      categoryName: savedProduct.categoryName || savedProduct.category || "Trà"
    };
  }

  return {
    id: "tra-3",
    name: "Trà Thạch Đào",
    price: 45000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCiMUe0pv3ROcZXbFrKgrUr0NHG5qKTsini7K7NMrQPPWynslpu1EjG6bloj8DmAnrWXlRPx3Ix24THj_q4iOvxWt2w_xn3GDxL07DBnZLHmJLvHc6xcVGq6aXHRZp_0kxT-W5vZr2nq4LuNG28tSGyKgu5mogcqbi_Y5fVj2YKgBUJUi7jhsqkxQreVaBIsH-tzRfpfSO6tvUDA7kxX39UrrOh3yK_v_SZccCUexjGTW0acK7dXkhSShvTtTK2kWZ6bY",
    sku: "00DT29",
    category: "Trà",
    categoryName: "Trà"
  };
}

let currentProduct = getInitialProduct();

let currentSize = "S";     // Mặc định chọn Size S
let currentQuantity = 1;   // Mặc định số lượng = 1

function getCategoryUrl(category) {
  if (!category) return "/index.html";
  const cat = String(category).toLowerCase().trim();
  if (cat.includes("bánh") || cat.includes("banh") || cat.includes("cake")) return "/pages/cake.html";
  if (cat.includes("cà phê đóng gói") || cat.includes("packaged")) return "/pages/packaged-coffee.html";
  if (cat.includes("cà phê") || cat.includes("coffee") || cat.includes("ca-phe")) return "/pages/coffee.html";
  if (cat.includes("phindi")) return "/pages/phindi.html";
  if (cat.includes("freeze")) return "/pages/freeze.html";
  if (cat.includes("trà") || cat.includes("tea") || cat.includes("tra")) return "/pages/tea.html";
  if (cat.includes("phụ kiện") || cat.includes("accessories") || cat.includes("phu-kien")) return "/pages/accessories.html";
  if (cat.includes("bankrista")) return "/pages/bankrista.html";
  return "/index.html";
}

function getCategoryDisplayName(product) {
  if (!product) return "CAKE - BEST SELLER";
  const cat = String(product.categoryName || product.category || "").toLowerCase().trim();
  const id = String(product.id || "").toLowerCase();

  if (
    cat.includes("bánh") ||
    cat.includes("banh") ||
    cat.includes("cake") ||
    id.startsWith("bm-") ||
    id.startsWith("bmq-") ||
    id.startsWith("bk-") ||
    id.startsWith("bn-")
  ) {
    return "CAKE - BEST SELLER";
  }
  if (cat.includes("cà phê đóng gói") || cat.includes("packaged")) return "Cà Phê Đóng Gói";
  if (cat.includes("cà phê") || cat.includes("coffee") || cat.includes("ca-phe") || id.startsWith("cp-")) return "Cà Phê";
  if (cat.includes("phindi") || id.startsWith("pd-")) return "PhinDi";
  if (cat.includes("freeze") || id.startsWith("fz-")) return "Freeze";
  if (cat.includes("trà") || cat.includes("tea") || cat.includes("tra") || id.startsWith("tr-")) return "Trà";
  if (cat.includes("phụ kiện") || cat.includes("accessories") || cat.includes("phu-kien") || id.startsWith("pk-")) return "Phụ Kiện";
  if (cat.includes("bankrista")) return "Bankrista Thịnh Vượng";
  if (cat.includes("thức uống") || cat.includes("other") || id.startsWith("other-")) return "Thức Uống Khác";
  return product.categoryName || product.category || "Trà";
}

function checkHasSizeOptions(product) {
  if (!product) return true;
  const cat = String(product.categoryName || product.category || "").toLowerCase();
  const id = String(product.id || "").toLowerCase();

  if (id.startsWith("bmq-") || id.startsWith("bn-") || id.startsWith("cpdg-") || id.startsWith("pk-") || id.startsWith("br-")) {
    return false;
  }

  if (
    cat.includes("bánh") ||
    cat.includes("banh") ||
    cat.includes("cake") ||
    cat.includes("đóng gói") ||
    cat.includes("packaged") ||
    cat.includes("phụ kiện") ||
    cat.includes("phu-kien") ||
    cat.includes("bankrista")
  ) {
    return false;
  }

  return true;
}

let currentSliderIndex = 0;
let isSliderAnimating = false;

/**
 * Kiểm tra sản phẩm có thuộc 4 danh mục mục tiêu hay không:
 * ✔ Cà Phê
 * ✔ Trà
 * ✔ Freeze
 * ✔ PhinDi
 */
function isTargetCategory(product) {
  if (!product) return false;
  const cat = String(product.categoryName || product.category || "").toLowerCase().trim();
  const id = String(product.id || "").toLowerCase().trim();

  // Loại trừ các danh mục không thuộc phạm vi
  if (cat.includes("đóng gói") || cat.includes("packaged") || id.startsWith("cpdg-")) return false;
  if (cat.includes("bánh") || cat.includes("cake") || id.startsWith("bm-") || id.startsWith("bmq-") || id.startsWith("bn-") || id.startsWith("mc-")) return false;
  if (cat.includes("phụ kiện") || cat.includes("accessories") || id.startsWith("pk-")) return false;
  if (cat.includes("bankrista") || cat.includes("quà") || cat.includes("gift")) return false;

  // Kiểm tra 5 danh mục được phép
  if (cat.includes("cà phê") || cat === "coffee" || cat === "ca-phe" || id.startsWith("cp-")) return true;
  if (cat.includes("trà") || cat === "tea" || cat === "tra" || id.startsWith("tra-") || id.startsWith("tr-")) return true;
  if (cat.includes("freeze") || id.startsWith("fr-") || id.startsWith("fz-")) return true;
  if (cat.includes("phindi") || id.startsWith("pd-")) return true;
  if (cat.includes("thức uống khác") || cat.includes("drinks") || id.startsWith("other-") || cat.includes("khác")) return true;

  return false;
}

/**
 * Đảm bảo các sản phẩm thuộc danh mục mục tiêu có mảng images (2 ảnh)
 */
function ensureProductImagesForTargetCategory(product) {
  if (!product || !isTargetCategory(product)) return;

  const id = String(product.id || "").toLowerCase().trim();
  const name = String(product.name || "").toLowerCase().trim();
  if (id === "cp-1" || name.includes("phin sữa đá") || name.includes("phin sua da")) {
    product.images = [product.image || "/assets/images/phinsuada.webp", "/assets/images/phin-sua-da1.webp"];
    return;
  }
  if (id === "cp-4" || id === "cp-15" || name.includes("latte đá") || name.includes("latte da") || name.includes("bạc xỉu nóng") || name.includes("bac xiu nong")) {
    product.images = [product.image || "/assets/images/bac-xiu-nong.webp"];
    return;
  }

  if (product.images && Array.isArray(product.images) && product.images.length > 1) return;

  let img1 = product.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCCiMUe0pv3ROcZXbFrKgrUr0NHG5qKTsini7K7NMrQPPWynslpu1EjG6bloj8DmAnrWXlRPx3Ix24THj_q4iOvxWt2w_xn3GDxL07DBnZLHmJLvHc6xcVGq6aXHRZp_0kxT-W5vZr2nq4LuNG28tSGyKgu5mogcqbi_Y5fVj2YKgBUJUi7jhsqkxQreVaBIsH-tzRfpfSO6tvUDA7kxX39UrrOh3yK_v_SZccCUexjGTW0acK7dXkhSShvTtTK2kWZ6bY";
  let img2 = "";

  const cat = String(product.categoryName || product.category || "").toLowerCase().trim();

  if (img1.includes(".webp")) {
    img2 = img1.replace(".webp", "-2.webp");
  } else if (cat.includes("cà phê") || id.startsWith("cp-")) {
    img2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuCCiMUe0pv3ROcZXbFrKgrUr0NHG5qKTsini7K7NMrQPPWynslpu1EjG6bloj8DmAnrWXlRPx3Ix24THj_q4iOvxWt2w_xn3GDxL07DBnZLHmJLvHc6xcVGq6aXHRZp_0kxT-W5vZr2nq4LuNG28tSGyKgu5mogcqbi_Y5fVj2YKgBUJUi7jhsqkxQreVaBIsH-tzRfpfSO6tvUDA7kxX39UrrOh3yK_v_SZccCUexjGTW0acK7dXkhSShvTtTK2kWZ6bY";
  } else if (cat.includes("trà") || id.startsWith("tra-")) {
    img2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuAnbC6oUn4QyrJHCDLoRAi5hbRW8YqRfXHFDLYrAPmkiyijRSWhLj23UCGyTfuQUse0SejoAbG8XN2Pm9f4WLg_1sEBiKryuSCZztB--uIwJhD7IEmkBZ91c7EIZBeyoI5tejI3qODVJmFPJQrYSDX7dsppU_AjeHFk3K7wK4M1non3yd7qEVm5xM2UaiJYjEHzZhyo4E7AGrOk7snQaeSydROy63ntADS2ZKnj0syhjvjmr5YnXk2LXWw5d2d_6tzZ7PM";
  } else if (cat.includes("freeze") || id.startsWith("fr-")) {
    img2 = "/assets/images/freeze_chocolate.jpg";
  } else if (cat.includes("phindi") || id.startsWith("pd-")) {
    img2 = "/assets/images/phindi_kem_sua.jpg";
  } else if (cat.includes("thức uống khác") || id.startsWith("other-")) {
    img2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuAnbC6oUn4QyrJHCDLoRAi5hbRW8YqRfXHFDLYrAPmkiyijRSWhLj23UCGyTfuQUse0SejoAbG8XN2Pm9f4WLg_1sEBiKryuSCZztB--uIwJhD7IEmkBZ91c7EIZBeyoI5tejI3qODVJmFPJQrYSDX7dsppU_AjeHFk3K7wK4M1non3yd7qEVm5xM2UaiJYjEHzZhyo4E7AGrOk7snQaeSydROy63ntADS2ZKnj0syhjvjmr5YnXk2LXWw5d2d_6tzZ7PM";
  } else {
    img2 = img1;
  }

  if (img1 === img2) {
    img2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuAnbC6oUn4QyrJHCDLoRAi5hbRW8YqRfXHFDLYrAPmkiyijRSWhLj23UCGyTfuQUse0SejoAbG8XN2Pm9f4WLg_1sEBiKryuSCZztB--uIwJhD7IEmkBZ91c7EIZBeyoI5tejI3qODVJmFPJQrYSDX7dsppU_AjeHFk3K7wK4M1non3yd7qEVm5xM2UaiJYjEHzZhyo4E7AGrOk7snQaeSydROy63ntADS2ZKnj0syhjvjmr5YnXk2LXWw5d2d_6tzZ7PM";
  }

  product.images = [img1, img2];
}

/**
 * Cập nhật trạng thái ẩn/hiện của hai nút ◀ ▶
 * - Hình 1 (index 0): Chỉ hiện nút ▶ bên phải, ẩn nút ◀ bên trái
 * - Hình 2 (index 1): Chỉ hiện nút ◀ bên trái, ẩn nút ▶ bên phải
 */
function updateSliderButtonsVisibility(index, totalCount) {
  const prevBtn = document.getElementById("sliderPrevBtn");
  const nextBtn = document.getElementById("sliderNextBtn");

  if (prevBtn) {
    if (index > 0) {
      prevBtn.classList.remove("d-none");
    } else {
      prevBtn.classList.add("d-none");
    }
  }

  if (nextBtn) {
    if (index < totalCount - 1) {
      nextBtn.classList.remove("d-none");
    } else {
      nextBtn.classList.add("d-none");
    }
  }
}

/**
 * Component Slider dùng chung cho trang Chi tiết sản phẩm
 */
function setupProductImageSlider(product) {
  const prevBtn = document.getElementById("sliderPrevBtn");
  const nextBtn = document.getElementById("sliderNextBtn");
  const mainImg = document.getElementById("productImage");
  const thumbsWrapper = document.getElementById("productThumbnailsWrapper");
  const dotsWrapper = document.getElementById("sliderDotsWrapper");

  const isTarget = isTargetCategory(product);
  const hasMultipleImages = isTarget && product.images && Array.isArray(product.images) && product.images.length > 1;

  currentSliderIndex = 0;

  if (!hasMultipleImages) {
    if (prevBtn) prevBtn.classList.add("d-none");
    if (nextBtn) nextBtn.classList.add("d-none");
    if (dotsWrapper) {
      dotsWrapper.classList.add("d-none");
      dotsWrapper.innerHTML = "";
    }

    if (mainImg) {
      mainImg.src = product.image || (product.images && product.images[0]) || "";
    }

    if (thumbsWrapper) {
      thumbsWrapper.style.display = "none";
    }
    return;
  }

  const images = product.images;

  // Cập nhật trạng thái hiển thị nút bấm ban đầu (Chỉ hiện nút bên phải ở hình thứ 1)
  updateSliderButtonsVisibility(0, images.length);

  if (mainImg) {
    mainImg.src = images[0];
  }

  // Cập nhật danh sách Dots (Chấm tròn chuyển ảnh)
  if (dotsWrapper) {
    dotsWrapper.classList.remove("d-none");
    dotsWrapper.innerHTML = images.map((_, index) => `
      <span class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Xem ảnh ${index + 1}"></span>
    `).join("");

    const dotElems = dotsWrapper.querySelectorAll(".slider-dot");
    dotElems.forEach(dot => {
      dot.onclick = function () {
        const idx = parseInt(this.getAttribute("data-index"), 10);
        switchSliderImage(idx, images);
      };
    });
  }

  if (thumbsWrapper) {
    thumbsWrapper.style.display = "flex";
    thumbsWrapper.innerHTML = images.map((imgUrl, index) => `
      <img src="${imgUrl}" alt="Thumbnail ${index + 1}" class="product-thumb ${index === 0 ? 'active' : ''}" data-index="${index}">
    `).join("");

    const thumbElems = thumbsWrapper.querySelectorAll(".product-thumb");
    thumbElems.forEach(thumb => {
      thumb.onclick = function () {
        const idx = parseInt(this.getAttribute("data-index"), 10);
        switchSliderImage(idx, images);
      };
    });
  }

  if (prevBtn) {
    prevBtn.onclick = function (e) {
      e.preventDefault();
      if (currentSliderIndex > 0) {
        switchSliderImage(currentSliderIndex - 1, images);
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = function (e) {
      e.preventDefault();
      if (currentSliderIndex < images.length - 1) {
        switchSliderImage(currentSliderIndex + 1, images);
      }
    };
  }
}

function switchSliderImage(targetIndex, images) {
  if (isSliderAnimating || targetIndex === currentSliderIndex) return;
  const mainImg = document.getElementById("productImage");
  if (!mainImg) return;

  isSliderAnimating = true;
  currentSliderIndex = targetIndex;

  // Cập nhật ngay trạng thái ẩn/hiện hai nút ◀ ▶ theo vị trí ảnh mới
  updateSliderButtonsVisibility(currentSliderIndex, images.length);

  mainImg.classList.add("slider-fading");

  setTimeout(() => {
    mainImg.src = images[currentSliderIndex];

    const thumbsWrapper = document.getElementById("productThumbnailsWrapper");
    if (thumbsWrapper) {
      const thumbElems = thumbsWrapper.querySelectorAll(".product-thumb");
      thumbElems.forEach((thumb, idx) => {
        if (idx === currentSliderIndex) {
          thumb.classList.add("active");
        } else {
          thumb.classList.remove("active");
        }
      });
    }

    const dotsWrapper = document.getElementById("sliderDotsWrapper");
    if (dotsWrapper) {
      const dotElems = dotsWrapper.querySelectorAll(".slider-dot");
      dotElems.forEach((dot, idx) => {
        if (idx === currentSliderIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }

    setTimeout(() => {
      mainImg.classList.remove("slider-fading");
      isSliderAnimating = false;
    }, 150);
  }, 150);
}

function loadSelectedProductData() {
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get("id");
  const nameParam = urlParams.get("name");
  const priceParam = urlParams.get("price");
  const imageParam = urlParams.get("image");
  const categoryParam = urlParams.get("category") || urlParams.get("categoryName");

  const savedProductJson = localStorage.getItem("selectedProduct");
  let savedProduct = null;
  if (savedProductJson) {
    try {
      savedProduct = JSON.parse(savedProductJson);
    } catch (err) {
      console.error("Lỗi khi đọc sản phẩm từ localStorage:", err);
    }
  }

  if (nameParam && priceParam) {
    const catVal = categoryParam ? decodeURIComponent(categoryParam) : "Trà";
    const prodId = idParam || (savedProduct ? savedProduct.id : "prod-custom");
    let imagesArr = savedProduct && (savedProduct.id === prodId || savedProduct.name === decodeURIComponent(nameParam)) ? savedProduct.images : null;

    currentProduct = {
      id: prodId,
      name: decodeURIComponent(nameParam),
      price: parseInt(priceParam, 10) || 45000,
      image: imageParam ? decodeURIComponent(imageParam) : (savedProduct ? savedProduct.image : currentProduct.image),
      images: imagesArr,
      sku: (savedProduct && savedProduct.sku) || ("00DT" + Math.floor(10 + Math.random() * 90)),
      category: catVal,
      categoryName: catVal
    };
  } else if (savedProduct && savedProduct.name && savedProduct.price) {
    currentProduct = {
      id: savedProduct.id || "prod-saved",
      name: savedProduct.name,
      price: parseInt(savedProduct.price, 10) || 45000,
      image: savedProduct.image || currentProduct.image,
      images: savedProduct.images || null,
      sku: savedProduct.sku || ("00DT" + Math.floor(10 + Math.random() * 90)),
      category: savedProduct.category || savedProduct.categoryName || "Trà",
      categoryName: savedProduct.categoryName || savedProduct.category || "Trà"
    };
  }

  ensureProductImagesForTargetCategory(currentProduct);
}

function renderProductInfo() {
  const titleElem = document.getElementById("productTitle");
  const skuElem = document.getElementById("productSku");
  const breadcrumbElem = document.getElementById("breadcrumbProductTitle");
  const breadcrumbCatLink = document.getElementById("breadcrumbCategoryLink");

  if (titleElem) titleElem.innerText = currentProduct.name;
  if (skuElem) skuElem.innerText = currentProduct.sku || "00DT29";
  if (breadcrumbElem) breadcrumbElem.innerText = currentProduct.name;

  if (breadcrumbCatLink) {
    const catName = getCategoryDisplayName(currentProduct);
    breadcrumbCatLink.innerText = catName;
    breadcrumbCatLink.href = getCategoryUrl(currentProduct.category || currentProduct.categoryName);
  }

  setupProductImageSlider(currentProduct);

  const hasSize = checkHasSizeOptions(currentProduct);
  const sizeWrapper = document.getElementById("sizeSelectorWrapper");
  if (sizeWrapper) {
    sizeWrapper.style.display = hasSize ? "block" : "none";
  }

  currentSize = hasSize ? "S" : "";
  currentQuantity = 1;

  updateSizeButtonsUI();
  updateQuantityDisplayUI();
  updatePrice();

  const detailContainer = document.getElementById("productDetailContainer") || document.querySelector(".product-detail-container");
  if (detailContainer) {
    detailContainer.style.opacity = "1";
  }
}

/**
 * Hàm 1: updatePrice()
 * Cập nhật giá theo quy tắc size (chỉ áp dụng cho đồ uống có size)
 */
function updatePrice() {
  let calculatedPrice = currentProduct.price;

  if (checkHasSizeOptions(currentProduct)) {
    if (currentSize === "M") {
      calculatedPrice = currentProduct.price + 10000;
    } else if (currentSize === "L") {
      calculatedPrice = currentProduct.price + 20000;
    }
  }

  const formattedPrice = calculatedPrice.toLocaleString("vi-VN") + "đ";

  const priceElem = document.getElementById("productPrice");
  if (priceElem) {
    priceElem.innerText = formattedPrice;
  }

  return calculatedPrice;
}

/**
 * Hàm 2: changeSize(size)
 * Thay đổi size được chọn (S, M, L) và cập nhật lại giá tiền
 */
function changeSize(size) {
  if (!checkHasSizeOptions(currentProduct)) return;
  if (size !== "S" && size !== "M" && size !== "L") return;

  currentSize = size;
  updateSizeButtonsUI();
  updatePrice();
}

function updateSizeButtonsUI() {
  const sizeBtns = document.querySelectorAll(".size-btn-circle");
  sizeBtns.forEach(btn => {
    const btnSize = btn.getAttribute("data-size");
    if (btnSize === currentSize) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

/**
 * Hàm 3: increaseQuantity()
 */
function increaseQuantity() {
  currentQuantity += 1;
  updateQuantityDisplayUI();
}

/**
 * Hàm 4: decreaseQuantity()
 */
function decreaseQuantity() {
  if (currentQuantity > 1) {
    currentQuantity -= 1;
    updateQuantityDisplayUI();
  }
}

function updateQuantityDisplayUI() {
  const qtyElem = document.getElementById("quantityValue");
  if (qtyElem) {
    qtyElem.innerText = currentQuantity;
  }
}

/**
 * Hàm 5: addToCart()
 * Thêm sản phẩm vào giỏ hàng và log đúng định dạng ra Console (Yêu cầu 7)
 */
function addToCart() {
  const finalPrice = updatePrice();
  const formattedPrice = finalPrice.toLocaleString("vi-VN") + "đ";
  const hasSize = checkHasSizeOptions(currentProduct);

  // In ra Console
  console.log(`Tên: ${currentProduct.name}`);
  if (hasSize && currentSize) {
    console.log(`Size: ${currentSize}`);
  }
  console.log(`Giá: ${formattedPrice}`);
  console.log(`Số lượng: ${currentQuantity}`);

  const itemId = hasSize && currentSize ? `${currentProduct.id}-${currentSize}` : currentProduct.id;

  const itemToAdd = {
    id: itemId,
    productId: currentProduct.id,
    name: currentProduct.name,
    size: hasSize ? currentSize : "",
    price: finalPrice,
    image: currentProduct.image,
    quantity: currentQuantity
  };

  if (typeof addToCartGlobal === "function") {
    addToCartGlobal(itemToAdd);
  } else {
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem("cart") || "[]");
    } catch (e) {
      cart = [];
    }
    const existingIndex = cart.findIndex(i => i.id === itemToAdd.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += currentQuantity;
    } else {
      cart.push(itemToAdd);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateCartBadge === "function") {
      updateCartBadge();
    }
  }

  const sizeText = hasSize && currentSize ? ` (Size ${currentSize})` : "";
  if (typeof showToast === "function") {
    showToast(`Đã thêm ${currentQuantity} x ${currentProduct.name}${sizeText} vào giỏ hàng!`);
  } else {
    alert(`Đã thêm ${currentQuantity} x ${currentProduct.name}${sizeText} - Giá: ${formattedPrice} vào giỏ hàng!`);
  }
}

function buyNow() {
  addToCart();
  window.location.href = "/pages/checkout.html";
}

function copyVoucherCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    if (typeof showToast === 'function') {
      showToast(`Đã sao chép mã ${code}!`);
    } else {
      alert(`Đã sao chép mã ${code}!`);
    }
  }).catch(() => {
    if (typeof showToast === 'function') {
      showToast(`Đã sao chép mã ${code}!`);
    }
  });
}

// Window scope exports
window.updatePrice = updatePrice;
window.changeSize = changeSize;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.buyNow = buyNow;
window.copyVoucherCode = copyVoucherCode;
