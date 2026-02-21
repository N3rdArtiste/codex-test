const revealElements = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('[data-counter]');
const tiltCards = document.querySelectorAll('[data-tilt]');
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const galleryImages = Array.from(document.querySelectorAll('.gallery-image'));
const imageModal = document.querySelector('#image-modal');
const imageModalImg = imageModal ? imageModal.querySelector('.image-modal__img') : null;
const imageModalCaption = imageModal ? imageModal.querySelector('.image-modal__caption') : null;
const imageModalPrev = imageModal ? imageModal.querySelector('[data-modal-prev]') : null;
const imageModalNext = imageModal ? imageModal.querySelector('[data-modal-next]') : null;
const imageModalCloseButtons = imageModal ? imageModal.querySelectorAll('[data-modal-close]') : [];

let activeImageIndex = 0;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealElements.forEach((el) => revealObserver.observe(el));

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.counter);
    const valueEl = el.querySelector('.value');
    if (!valueEl) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 70));

    const tick = () => {
      current += step;
      if (current >= target) {
        valueEl.textContent = `${target}${target === 98 ? '%' : '+'}`;
        return;
      }
      valueEl.textContent = `${current}`;
      requestAnimationFrame(tick);
    };

    tick();
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });
counters.forEach((counter) => counterObserver.observe(counter));

tiltCards.forEach((card) => {
  const dampen = 16;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId = null;

  const animateTilt = () => {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    card.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(10px)`;
    if (Math.abs(targetX - currentX) < 0.02 && Math.abs(targetY - currentY) < 0.02) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(animateTilt);
  };

  const queueTilt = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(animateTilt);
  };

  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    targetX = (centerY - y) / dampen;
    targetY = (x - centerX) / dampen;
    queueTilt();
  });

  card.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    queueTilt();
  });
});

const closeMenu = () => {
  document.body.classList.remove('menu-open');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
};

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('menu-open')) return;
    if (nav.contains(event.target) || menuToggle.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 840) closeMenu();
  });
}

anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    const header = document.querySelector('.site-header');
    const headerOffset = header ? header.offsetHeight + 12 : 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
    closeMenu();
  });
});

const renderModalImage = (index) => {
  if (!imageModalImg || !imageModalCaption || galleryImages.length === 0) return;
  const wrappedIndex = (index + galleryImages.length) % galleryImages.length;
  activeImageIndex = wrappedIndex;
  const selected = galleryImages[wrappedIndex];
  imageModalImg.src = selected.src;
  imageModalImg.alt = selected.alt;
  imageModalCaption.textContent = selected.alt;
};

const openImageModal = (index) => {
  if (!imageModal) return;
  renderModalImage(index);
  imageModal.classList.add('is-open');
  imageModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeImageModal = () => {
  if (!imageModal) return;
  imageModal.classList.remove('is-open');
  imageModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

if (galleryImages.length > 0 && imageModal) {
  galleryImages.forEach((img, index) => {
    img.addEventListener('click', () => openImageModal(index));
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImageModal(index);
      }
    });
  });

  if (imageModalPrev) imageModalPrev.addEventListener('click', () => renderModalImage(activeImageIndex - 1));
  if (imageModalNext) imageModalNext.addEventListener('click', () => renderModalImage(activeImageIndex + 1));

  imageModalCloseButtons.forEach((button) => button.addEventListener('click', closeImageModal));

  document.addEventListener('keydown', (event) => {
    if (!imageModal.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeImageModal();
    if (event.key === 'ArrowLeft') renderModalImage(activeImageIndex - 1);
    if (event.key === 'ArrowRight') renderModalImage(activeImageIndex + 1);
  });
}
