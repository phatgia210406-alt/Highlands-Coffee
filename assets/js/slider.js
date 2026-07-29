// Banner Slider functionality
document.addEventListener('DOMContentLoaded', function() {
  const slides = [
    {
      image: '/assets/images/slider_1.webp',
      alt: 'Trà Sen Vàng - Sen Bùi Kem Mịn',
      title: 'Trà Sen Vàng - Sen Bùi Kem Mịn'
    },
    {
      image: '/assets/images/slider_2.webp',
      alt: 'Matcha Di - Khuấy Động Ngày Mới',
      title: 'Matcha Di - Khuấy Động Ngày Mới'
    },
    {
      image: '/assets/images/slider_3.webp',
      alt: 'Phindi Kem Sữa - Ngọt Ngào Đậm Đà',
      title: 'Phindi Kem Sữa - Ngọt Ngào Đậm Đà'
    }
  ];

  const container = document.querySelector('.hero-banner-container');
  if (!container) return;

  const imgEl = container.querySelector('.hero-banner-img');
  const dotsContainer = container.querySelector('.banner-dots');
  const prevBtn = container.querySelector('.banner-arrow-btn.prev');
  const nextBtn = container.querySelector('.banner-arrow-btn.next');

  if (!imgEl) return;

  let currentIndex = 0;
  let autoplayTimer = null;

  // Set transition for smooth fade
  imgEl.style.transition = 'opacity 0.4s ease-in-out';

  function updateSlide(index, immediate = false) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    if (immediate) {
      imgEl.src = slides[currentIndex].image;
      imgEl.alt = slides[currentIndex].alt;
      imgEl.style.opacity = '1';
    } else {
      // Fade out
      imgEl.style.opacity = '0.2';
      setTimeout(() => {
        imgEl.src = slides[currentIndex].image;
        imgEl.alt = slides[currentIndex].alt;
        imgEl.style.opacity = '1';
      }, 200);
    }

    // Update dots active state
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.banner-dot');
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  // Build dots dynamically based on slides count
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = `banner-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${idx + 1}`);
      dot.addEventListener('click', () => {
        updateSlide(idx);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateSlide(currentIndex - 1);
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateSlide(currentIndex + 1);
      resetAutoplay();
    });
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      updateSlide(currentIndex + 1);
    }, 4000); // Change slide every 4 seconds
  }

  function resetAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    startAutoplay();
  }

  container.addEventListener('mouseenter', () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
  });

  container.addEventListener('mouseleave', () => {
    startAutoplay();
  });

  // Initialize
  updateSlide(0, true);
  startAutoplay();
});

