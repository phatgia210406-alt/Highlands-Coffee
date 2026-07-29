/**
 * product.js - Xử lý logic trang Chi Tiết Sản Phẩm (Highlands Coffee)
 * Sử dụng Vanilla JavaScript thuần (không dùng jQuery)
 */

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

// Biến lưu trạng thái hiện tại của Size và Số lượng
let currentSize = "S";     // Mặc định chọn Size S
let currentQuantity = 1;   // Mặc định số lượng = 1

/**
 * Lấy URL tương ứng theo danh mục sản phẩm
 */
function getCategoryUrl(category) {
  if (!category) return "/index.html";
  const cat = String(category).toLowerCase().trim();
  if (cat.includes("cà phê đóng gói") || cat.includes("packaged")) return "/pages/packaged-coffee.html";
  if (cat.includes("cà phê") || cat.includes("coffee") || cat.includes("ca-phe")) return "/pages/coffee.html";
  if (cat.includes("phindi")) return "/pages/phindi.html";
  if (cat.includes("freeze")) return "/pages/freeze.html";
  if (cat.includes("trà") || cat.includes("tea") || cat.includes("tra")) return "/pages/tea.html";
  if (cat.includes("bánh mì") || cat.includes("banh-mi")) return "/pages/banh-mi-que.html";
  if (cat.includes("bánh ngọt") || cat.includes("cake") || cat.includes("banh-ngot")) return "/pages/cake.html";
  if (cat.includes("phụ kiện") || cat.includes("accessories") || cat.includes("phu-kien")) return "/pages/accessories.html";
  if (cat.includes("bankrista")) return "/pages/bankrista.html";
  return "/index.html";
}

/**
 * Lấy tên danh mục hiển thị chuẩn xác từ Object sản phẩm
 */
function getCategoryDisplayName(product) {
  if (product.categoryName && product.categoryName !== "Tea - Freeze") {
    return product.categoryName;
  }
  if (product.category) {
    const cat = String(product.category).toLowerCase().trim();
    if (cat === "ca-phe" || cat === "cà phê") return "Cà Phê";
    if (cat === "phindi") return "PhinDi";
    if (cat === "freeze") return "Freeze";
    if (cat === "tra" || cat === "trà") return "Trà";
    if (cat === "banh-mi-que" || cat === "bánh mì que") return "Bánh Mì Que";
    if (cat === "cake" || cat === "bánh ngọt") return "Bánh Ngọt";
    if (cat === "packaged-coffee" || cat === "cà phê đóng gói") return "Cà Phê Đóng Gói";
    if (cat === "phu-kien" || cat === "phụ kiện") return "Phụ Kiện";
    if (cat === "bankrista" || cat === "bankrista thịnh vượng") return "Bankrista Thịnh Vượng";
    return product.category;
  }
  return "Trà";
}

/**
 * Kiểm tra sản phẩm có tùy chọn kích thước (Size) hay không.
 * Các món bánh (Bánh Mì Que, Bánh Ngọt), cà phê đóng gói, phụ kiện... không có size.
 */
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

// Tự động chạy khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", function () {
  loadSelectedProductData();
  renderProductInfo();
});

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
    // Ẩn hoàn toàn hai nút ◀ ▶ và dots đối với các danh mục khác hoặc sản phẩm chỉ có 1 ảnh
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

  // Đối với các danh mục mục tiêu có nhiều ảnh:
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

  // Cập nhật danh sách Thumbnails
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

  // Lắng nghe sự kiện bấm nút ◀ ▶
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

/**
 * Chuyển đổi ảnh với hiệu ứng fade smooth (300ms - 500ms)
 */
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

/**
 * Hàm đọc thông tin sản phẩm được truyền từ trang danh sách
 * Hỗ trợ nhận thông tin qua URL Parameter hoặc localStorage
 */
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

/**
 * Hiển thị dữ liệu sản phẩm lên giao diện HTML
 */
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

  // Khởi tạo slider ảnh cho sản phẩm
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

  // Xóa style chống nhấp nháy giao diện (FOUC)
  const foucStyle = document.getElementById("fouc-prevention");
  if (foucStyle) {
    foucStyle.remove();
  }

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

  // Định dạng hiển thị tiền Việt Nam (ví dụ: 45.000đ, 55.000đ, 65.000đ)
  const formattedPrice = calculatedPrice.toLocaleString("vi-VN") + "đ";

  // Cập nhật lên phần tử HTML hiển thị giá
  const priceElem = document.getElementById("productPrice");
  if (priceElem) {
    priceElem.innerText = formattedPrice;
  }

  return calculatedPrice;
}

/**
 * Hàm 2: changeSize(size)
 * Thay đổi size được chọn (S, M, L) và tự động tính lại giá
 * Theo Yêu cầu 6: Nút đang chọn màu đỏ, hai size còn lại màu trắng, chỉ chọn 1 size
 */
function changeSize(size) {
  if (!checkHasSizeOptions(currentProduct)) return;
  if (size !== "S" && size !== "M" && size !== "L") return;

  currentSize = size;

  // Cập nhật giao diện nút size
  updateSizeButtonsUI();

  // Cập nhật giá sản phẩm lập tức bằng JavaScript
  updatePrice();
}

/**
 * Cập nhật trạng thái active cho nút Size (Nút đang chọn có màu đỏ, 2 nút còn lại màu trắng)
 */
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
 * Tăng số lượng lên 1
 */
function increaseQuantity() {
  currentQuantity += 1;
  updateQuantityDisplayUI();
}

/**
 * Hàm 4: decreaseQuantity()
 * Giảm số lượng (Không được nhỏ hơn 1 theo Yêu cầu 5)
 */
function decreaseQuantity() {
  if (currentQuantity > 1) {
    currentQuantity -= 1;
    updateQuantityDisplayUI();
  }
}

/**
 * Cập nhật số lượng trên giao diện HTML
 */
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

  // In thông tin ra Console
  console.log(`Tên: ${currentProduct.name}`);
  if (hasSize && currentSize) {
    console.log(`Size: ${currentSize}`);
  }
  console.log(`Giá: ${formattedPrice}`);
  console.log(`Số lượng: ${currentQuantity}`);

  const itemId = hasSize && currentSize ? `${currentProduct.id}-${currentSize}` : currentProduct.id;

  // Thêm vào giỏ hàng thực tế trong ứng dụng (Cart Drawer)
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

  // Thông báo phản hồi cho người dùng
  if (typeof showToast === "function") {
    showToast(`Đã thêm ${currentQuantity} x ${currentProduct.name}${sizeText} vào giỏ hàng!`);
  } else {
    alert(`Đã thêm ${currentQuantity} x ${currentProduct.name}${sizeText} - Giá: ${formattedPrice} vào giỏ hàng!`);
  }
}

/**
 * Hàm xử lý khi bấm nút "MUA NGAY"
 */
function buyNow() {
  addToCart();
  window.location.href = "/pages/checkout.html";
}

// Chuyển các hàm ra Window Scope để gọi trực tiếp từ HTML onclick
window.updatePrice = updatePrice;
window.changeSize = changeSize;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.buyNow = buyNow;
