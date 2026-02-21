const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
const siteHeader = document.querySelector('.site-header');
const form = document.getElementById('lead-form-v2');
const message = document.getElementById('form-message-v2');
const year = document.getElementById('year-v2');
const regionSelects = Array.from(document.querySelectorAll('[data-region-select]'));
const regionNote = document.getElementById('region-note');

const THEME_KEY = 'invicta-theme-v2';
const REGION_KEY = 'invicta-region-v2';

const REGION_CONFIG = {
  NZ: { label: 'New Zealand', currency: 'NZD', locale: 'en-NZ', setup: 145 },
  CA: { label: 'Canada', currency: 'CAD', locale: 'en-CA', setup: 125 },
  US: { label: 'United States', currency: 'USD', locale: 'en-US', setup: 89 },
  AU: { label: 'Australia', currency: 'AUD', locale: 'en-AU', setup: 129 },
  EU: { label: 'Europe', currency: 'EUR', locale: 'en-IE', setup: 75 },
  GB: { label: 'United Kingdom', currency: 'GBP', locale: 'en-GB', setup: 66 }
};

const REGION_FLAGS = {
  NZ: '🇳🇿',
  CA: '🇨🇦',
  US: '🇺🇸',
  AU: '🇦🇺',
  EU: '🇪🇺',
  GB: '🇬🇧'
};

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
};

const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
};

applyTheme(getInitialTheme());

year.textContent = new Date().getFullYear();

const detectRegion = () => {
  const saved = localStorage.getItem(REGION_KEY);
  if (saved && REGION_CONFIG[saved]) return saved;
  return 'NZ';
};

const formatMoney = (amount, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);

const applyRegionPrices = (regionCode) => {
  const config = REGION_CONFIG[regionCode] || REGION_CONFIG.US;
  const setup = config.setup;
  const monthly = Math.max(1, Math.round((setup / 145) * 5));
  const shopify = Math.max(1, Math.round((setup / 145) * 299));

  const values = {
    'setup-inline': formatMoney(setup, config.locale, config.currency),
    'setup-full': `${formatMoney(setup, config.locale, config.currency)} ${config.currency}`,
    'monthly-inline': formatMoney(monthly, config.locale, config.currency),
    'monthly-full': `${formatMoney(monthly, config.locale, config.currency)}/mo`,
    'shopify-full': `${formatMoney(shopify, config.locale, config.currency)} ${config.currency}`
  };

  document.querySelectorAll('[data-price]').forEach((el) => {
    const key = el.getAttribute('data-price');
    if (!key || !values[key]) return;
    el.textContent = values[key];
  });

  regionSelects.forEach((select) => {
    select.value = regionCode;
  });
  if (regionNote) regionNote.textContent = `Prices shown in ${config.label} (${config.currency}).`;
  localStorage.setItem(REGION_KEY, regionCode);
};

if (regionSelects.length) {
  regionSelects.forEach((select) => {
    const flagOnly = select.classList.contains('region-flag-select');

    Object.entries(REGION_CONFIG).forEach(([code, config]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = flagOnly ? REGION_FLAGS[code] || code : `${config.label} (${config.currency})`;
      select.appendChild(option);
    });

    select.addEventListener('change', (event) => {
      applyRegionPrices(event.target.value);
    });
  });

  const initialRegion = detectRegion();
  applyRegionPrices(initialRegion);
} else {
  applyRegionPrices(detectRegion());
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

if (navToggle && mainNav) {
  const closeNav = () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 840) closeNav();
  });
}

if (form && message) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      message.textContent = 'Please complete all fields before sending your message.';
      return;
    }

    const data = new FormData(form);
    const name = data.get('name');
    const email = data.get('email');
    const business = data.get('business');
    const details = data.get('details');

    const subject = encodeURIComponent(`New website enquiry from ${business}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nBusiness: ${business}\n\nWhat they do:\n${details}`);

    message.textContent = 'Thanks. Your email app is opening so you can send your enquiry.';
    window.location.href = `mailto:hello@yourdomain.co.nz?subject=${subject}&body=${body}`;
  });
}

const revealElements = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

if (window.lucide) {
  window.lucide.createIcons();
}

const runHeroProofSequence = async () => {
  const heroProof = document.querySelector('.hero-proof');
  const items = document.querySelectorAll('.hero-proof .proof-item');
  if (!heroProof || !items.length) return;

  if (window.customElements && typeof window.customElements.whenDefined === 'function') {
    try {
      await window.customElements.whenDefined('dotlottie-wc');
    } catch (error) {
      // continue with fallback behavior
    }
  }

  const playLottieOnce = (check) => {
    if (!check) return;

    const tryPlay = () => {
      const player = check.dotLottie;

      if (player) {
        try {
          if (typeof player.setLoop === 'function') player.setLoop(false);
          if (typeof player.stop === 'function') player.stop();
          if (typeof player.setFrame === 'function') player.setFrame(0);
          if (typeof player.play === 'function') player.play();
          return true;
        } catch (error) {
          return false;
        }
      }

      if (typeof check.play === 'function') {
        try {
          check.play();
          return true;
        } catch (error) {
          return false;
        }
      }

      return false;
    };

    if (tryPlay()) return;

    let attempts = 0;
    const maxAttempts = 48;
    const retry = () => {
      attempts += 1;
      if (tryPlay() || attempts >= maxAttempts) return;
      window.setTimeout(retry, 80);
    };
    retry();

    check.addEventListener(
      'ready',
      () => {
        tryPlay();
      },
      { once: true }
    );
  };

  // Ensure lottie instances stay idle until each row is revealed.
  items.forEach((item) => {
    const check = item.querySelector('.check-lottie');
    if (!check) return;

    const setupPlayer = () => {
      const player = check.dotLottie;
      if (!player) return;

      try {
        if (typeof player.setLoop === 'function') player.setLoop(false);
        if (typeof player.stop === 'function') player.stop();
      } catch (error) {
        // no-op fallback
      }
    };

    if (check.dotLottie) {
      setupPlayer();
    } else {
      check.addEventListener('ready', setupPlayer, { once: true });
    }
  });

  if (reduceMotion) {
    items.forEach((item) => {
      const check = item.querySelector('.check-lottie');
      item.classList.add('is-check-visible', 'is-text-visible');
      playLottieOnce(check);
    });
    return;
  }

  const startDelayMs = 300;
  const rowGapMs = 820;
  const textDelayMs = 320;

  let sequenceStarted = false;
  const startSequence = () => {
    if (sequenceStarted) return;
    sequenceStarted = true;

    items.forEach((item, index) => {
      const check = item.querySelector('.check-lottie');

      setTimeout(() => {
        item.classList.add('is-check-visible');
        playLottieOnce(check);

        setTimeout(() => {
          item.classList.add('is-text-visible');
        }, textDelayMs);
      }, startDelayMs + index * rowGapMs);
    });
  };

  if (heroProof.classList.contains('is-visible')) {
    startSequence();
    return;
  }

  if ('IntersectionObserver' in window) {
    const heroProofObserver = new IntersectionObserver(
      (entries, obs) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        startSequence();
        obs.disconnect();
      },
      { threshold: 0.35 }
    );
    heroProofObserver.observe(heroProof);
  } else {
    startSequence();
  }
};

runHeroProofSequence();

const initOurWorkSwipe = () => {
  const container = document.querySelector('.our-work-menu.menu');
  const track = container?.querySelector('.menu--wrapper');
  const cards = track ? Array.from(track.querySelectorAll('.menu--item')) : [];
  if (!container || !track || !cards.length) return;

  cards.forEach((card) => {
    const clone = card.cloneNode(true);
    track.appendChild(clone);
  });

  let isDragging = false;
  let isHovered = false;
  let startX = 0;
  let totalDragged = 0;
  let currentTranslate = 0;
  let animationID;
  let originalWidth = 0;
  const speed = 1.5;

  function calculateWidth() {
    const allCards = track.querySelectorAll('.menu--item');
    originalWidth = allCards[cards.length].offsetLeft - allCards[0].offsetLeft;
  }

  function animate() {
    if (!isDragging && !isHovered) {
      currentTranslate -= speed;
    }

    if (currentTranslate <= -originalWidth) {
      currentTranslate += originalWidth;
    }
    if (currentTranslate > 0) {
      currentTranslate -= originalWidth;
    }

    track.style.transform = `translateX(${currentTranslate}px)`;
    animationID = requestAnimationFrame(animate);
  }

  container.addEventListener('pointerdown', (event) => {
    isDragging = true;
    container.classList.add('active', 'is-dragging');
    startX = event.clientX;
    totalDragged = 0;
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
    container.classList.remove('active', 'is-dragging');
  });

  window.addEventListener('pointermove', (event) => {
    if (!isDragging) return;

    const currentPosition = event.clientX;
    const distanceMoved = currentPosition - startX;
    totalDragged += Math.abs(distanceMoved);

    currentTranslate += distanceMoved;
    startX = currentPosition;
  });

  container.addEventListener('mouseenter', () => {
    isHovered = true;
  });

  container.addEventListener('mouseleave', () => {
    isHovered = false;
    isDragging = false;
    container.classList.remove('active', 'is-dragging');
  });

  container.addEventListener('dragstart', (event) => event.preventDefault());

  container.addEventListener('click', (event) => {
    if (totalDragged > 10) {
      event.preventDefault();
    }
  });

  window.addEventListener('load', () => {
    calculateWidth();
    animate();
  });

  window.addEventListener('resize', calculateWidth);

  if (document.readyState === 'complete') {
    calculateWidth();
    if (!animationID) animate();
  }
};

initOurWorkSwipe();

const enableCardTilt = () => {
  if (reduceMotion) return;

  const cards = document.querySelectorAll(
    '.hero-proof, .metric, .problem-copy, .compare-card, .setup-box, .plan-card, .about-grid > article, .about-visual, .contact-wrap > article, .contact-form, .steps li'
  );

  cards.forEach((card) => {
    card.classList.add('tilt-card');

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 8;
      const rotateX = (0.5 - py) * 8;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
};

enableCardTilt();

const initNavIndicator = () => {
  const navList = document.querySelector('.nav-list');
  const brandLink = document.querySelector('.brand[href="#top"]');
  const ourWorkSection = document.getElementById('our-work');
  const get149Section = document.getElementById('get-149');
  if (!navList) return;

  const navLinks = Array.from(navList.querySelectorAll('a[href^="#"]'));
  if (!navLinks.length) return;

  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  navList.appendChild(indicator);

  const linkById = new Map(
    navLinks.map((link) => [link.getAttribute('href')?.replace('#', ''), link])
  );

  const targets = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)
    .sort((a, b) => a.offsetTop - b.offsetTop);

  let lastActiveHref = '';
  let lastTopState = null;
  let clickDelayLockUntil = 0;
  const clickMoveDelayMs = 140;

  const setActive = (activeLink, isTopSection = false, force = false) => {
    const nextHref = activeLink?.getAttribute('href') || '';
    if (!force && lastTopState === isTopSection && lastActiveHref === nextHref) return;
    lastTopState = isTopSection;
    lastActiveHref = nextHref;

    if (isTopSection) {
      navLinks.forEach((link) => link.classList.remove('is-active'));
      if (brandLink) brandLink.classList.add('is-active-home');
      indicator.style.opacity = '0';
      return;
    }

    if (!activeLink) return;

    navLinks.forEach((link) => link.classList.toggle('is-active', link === activeLink));
    if (brandLink) brandLink.classList.remove('is-active-home');

    const navRect = navList.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    indicator.style.width = `${linkRect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.opacity = '1';
  };

  const getCurrentSection = () => {
    const checkpoint = window.scrollY + window.innerHeight * 0.35;
    let current = targets[0];

    targets.forEach((section) => {
      if (section.offsetTop <= checkpoint) current = section;
    });

    return current;
  };

  const syncFromScroll = () => {
    if (performance.now() < clickDelayLockUntil) return;

    const current = getCurrentSection();
    const activeLink = (current && linkById.get(current.id)) || navLinks[0];
    const headerOffset = siteHeader?.offsetHeight || 90;
    const scrollTop = window.scrollY + headerOffset;
    const preOurWorkTrigger = get149Section
      ? get149Section.offsetTop + get149Section.offsetHeight - 140
      : (ourWorkSection?.offsetTop || 0);

    if (ourWorkSection && scrollTop >= preOurWorkTrigger && scrollTop < ourWorkSection.offsetTop) {
      const ourWorkLink = linkById.get('our-work') || activeLink;
      setActive(ourWorkLink, false);
      return;
    }

    const isTopSection = ourWorkSection
      ? scrollTop < ourWorkSection.offsetTop
      : window.scrollY < 80;
    setActive(activeLink, isTopSection);
  };

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        syncFromScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      clickDelayLockUntil = performance.now() + clickMoveDelayMs;
      window.setTimeout(() => {
        setActive(link, false, true);
      }, clickMoveDelayMs);
    });
  });

  if (brandLink) {
    brandLink.addEventListener('click', () => {
      navLinks.forEach((link) => link.classList.remove('is-active'));
      brandLink.classList.add('is-active-home');
      indicator.style.opacity = '0';
    });
  }

  window.addEventListener('resize', () => {
    const current = getCurrentSection();
    const activeLink = (current && linkById.get(current.id)) || navLinks[0];
    const headerOffset = siteHeader?.offsetHeight || 90;
    const scrollTop = window.scrollY + headerOffset;
    const preOurWorkTrigger = get149Section
      ? get149Section.offsetTop + get149Section.offsetHeight - 140
      : (ourWorkSection?.offsetTop || 0);

    if (ourWorkSection && scrollTop >= preOurWorkTrigger && scrollTop < ourWorkSection.offsetTop) {
      const ourWorkLink = linkById.get('our-work') || activeLink;
      setActive(ourWorkLink, false, true);
      return;
    }

    const isTopSection = ourWorkSection
      ? scrollTop < ourWorkSection.offsetTop
      : window.scrollY < 80;
    setActive(activeLink, isTopSection, true);
  });
  syncFromScroll();
};

initNavIndicator();

const initHeaderAutoHide = () => {
  if (!siteHeader) return;

  let lastY = window.scrollY;
  let ticking = false;
  const mobileQuery = window.matchMedia('(max-width: 840px)');
  const topLock = 36;
  const hideStart = 140;
  const delta = 4;

  const showHeader = () => siteHeader.classList.remove('is-hidden');
  const hideHeader = () => siteHeader.classList.add('is-hidden');

  const syncHeader = () => {
    if (!mobileQuery.matches) {
      showHeader();
      lastY = window.scrollY;
      return;
    }

    const y = window.scrollY;
    const navIsOpen = mainNav?.classList.contains('is-open');

    if (navIsOpen || y <= topLock) {
      showHeader();
      lastY = y;
      return;
    }

    if (y > lastY + delta && y > hideStart) {
      hideHeader();
    } else if (y < lastY - delta) {
      showHeader();
    }

    lastY = y;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        syncHeader();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    showHeader();
    lastY = window.scrollY;
    syncHeader();
  });

  syncHeader();
};

initHeaderAutoHide();
