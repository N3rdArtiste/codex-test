import {
  createIcons,
  Menu,
  SunMoon,
  Sparkles,
  MonitorSmartphone,
  Gauge,
  Server,
  SearchCheck,
  Megaphone,
  Send,
  LifeBuoy,
  Rocket,
  AppWindow,
  ArrowUp,
  Sun
} from 'lucide';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import Alpine from 'alpinejs';
import collapse from '@alpinejs/collapse';
Alpine.plugin(collapse);
Alpine.start();

const lucideIcons = { Menu, SunMoon, Sun, Sparkles, MonitorSmartphone, Gauge, Server, SearchCheck, Megaphone, Send, LifeBuoy, Rocket, AppWindow, ArrowUp };

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

const THEME_KEY = 'websiteplus-theme-v2';
const REGION_KEY = 'websiteplus-region-v2';

const REGION_CONFIG = {
  NZ: { label: 'New Zealand', currency: 'NZD', locale: 'en-NZ', monthly: 20, shopify: 299 },
  CA: { label: 'Canada', currency: 'CAD', locale: 'en-CA', monthly: 16, shopify: 258 },
  US: { label: 'United States', currency: 'USD', locale: 'en-US', monthly: 12, shopify: 183 },
  AU: { label: 'Australia', currency: 'AUD', locale: 'en-AU', monthly: 18, shopify: 266 },
  EU: { label: 'Europe', currency: 'EUR', locale: 'en-IE', monthly: 10, shopify: 154 },
  GB: { label: 'United Kingdom', currency: 'GBP', locale: 'en-GB', monthly: 9, shopify: 136 }
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

const updateThemeToggleIcon = (theme) => {
  if (!themeToggle) return;
  const iconName = theme === 'dark' ? 'sun' : 'sun-moon';
  themeToggle.innerHTML = `<i data-lucide="${iconName}"></i>`;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  createIcons({ icons: lucideIcons });
};

const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
};

applyTheme(getInitialTheme());
updateThemeToggleIcon(root.getAttribute('data-theme') || 'dark');

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
  const monthly = config.monthly;
  const shopify = config.shopify;

  const values = {
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
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    updateThemeToggleIcon(next);
  });
}

const syncAnchorOffset = () => {
  if (!siteHeader) return;
  const isMobile = window.matchMedia('(max-width: 910px)').matches;
  const headerHeight = siteHeader.offsetHeight || 78;
  const extraOffset = isMobile ? 20 : 12;
  root.style.setProperty('--anchor-offset', `${headerHeight + extraOffset}px`);
};

syncAnchorOffset();
window.addEventListener('resize', syncAnchorOffset);

if (navToggle && mainNav) {
  const closeNav = () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    window.requestAnimationFrame(syncAnchorOffset);
    window.setTimeout(syncAnchorOffset, 340);
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    window.requestAnimationFrame(syncAnchorOffset);
    window.setTimeout(syncAnchorOffset, 340);
  });

  mainNav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 910) closeNav();
  });
}

if (form && message) {
  const launchConfetti = async () => {
    if (reduceMotion) return;

    const { confetti } = await import('@tsparticles/confetti');
    confetti({
      particleCount: 180,
      spread: 110,
      startVelocity: 22,
      gravity: 0.9,
      decay: 0.94,
      scalar: 1,
      ticks: 260,
      zIndex: 9999,
      disableForReducedMotion: true
    });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      message.textContent = 'Please complete all fields before sending your message.';
      return;
    }

    launchConfetti();
    message.textContent = 'Thanks, we will contact you shortly.';
    form.reset();
  });
}

const revealElements = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stepsList = document.querySelector('.steps');
const stepRevealCards = stepsList ? Array.from(stepsList.querySelectorAll('li.reveal')) : [];
let stepsFlowShown = false;

const showStepsFlowWhenReady = () => {
  if (!stepsList || !stepRevealCards.length || stepsFlowShown) return;
  const allVisible = stepRevealCards.every((card) => card.classList.contains('is-visible'));
  if (!allVisible) return;

  const revealDelay = reduceMotion ? 60 : 620;
  stepsFlowShown = true;
  window.setTimeout(() => {
    stepsList.classList.add('is-flow-visible');
  }, revealDelay);
};

if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (stepRevealCards.includes(entry.target)) {
            showStepsFlowWhenReady();
          }
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('is-visible'));
  showStepsFlowWhenReady();
}

createIcons({ icons: lucideIcons });

const runHeroProofSequence = () => {
  const heroProof = document.querySelector('.hero-proof');
  const items = Array.from(document.querySelectorAll('.hero-proof .proof-item'));
  if (!heroProof || !items.length) return;

  const proofRows = items.map((item) => {
    const canvas = item.querySelector('.check-lottie');
    if (!(canvas instanceof HTMLCanvasElement)) return { item, player: null };

    const src = canvas.getAttribute('data-src');
    if (!src) return { item, player: null };

    try {
      const player = new DotLottie({
        canvas,
        src,
        loop: false,
        autoplay: false
      });
      return { item, player };
    } catch (error) {
      return { item, player: null };
    }
  });

  const playCheck = (player) => {
    if (!player || reduceMotion) return;

    const start = () => {
      if (!player.isLoaded) return;
      try {
        player.stop();
        player.setFrame(0);
        player.play();
      } catch (error) {
        // no-op
      }
    };

    if (player.isLoaded) {
      start();
      return;
    }

    const onLoad = () => {
      start();
      player.removeEventListener('load', onLoad);
    };

    player.addEventListener('load', onLoad);
  };

  let sequenceStarted = false;
  let safetyKickoffId = null;
  const timerIds = [];

  const revealItem = (row) => {
    const { item, player } = row;
    item.classList.add('is-check-visible', 'is-text-visible');
    playCheck(player);
  };

  if (reduceMotion) {
    proofRows.forEach(revealItem);
    return;
  }

  const initialDelayMs = 220;
  const staggerMs = 260;

  const startSequence = () => {
    if (sequenceStarted) return;
    sequenceStarted = true;
    if (safetyKickoffId) {
      window.clearTimeout(safetyKickoffId);
      safetyKickoffId = null;
    }

    proofRows.forEach((row, index) => {
      const timeoutId = window.setTimeout(() => {
        revealItem(row);
      }, initialDelayMs + index * staggerMs);
      timerIds.push(timeoutId);
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
      { threshold: 0.3 }
    );
    heroProofObserver.observe(heroProof);
    // Fallback: start anyway in case observer timing misses on fast/restore loads.
    safetyKickoffId = window.setTimeout(startSequence, 1200);
  } else {
    startSequence();
  }

  window.addEventListener('beforeunload', () => {
    timerIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
  });
};

runHeroProofSequence();

const initCoreVitalsAnimation = () => {
  const widgets = document.querySelectorAll('[data-core-vitals]');
  if (!widgets.length) return;

  const animateRing = (ring, target, delay = 0) => {
    const valueEl = ring.querySelector('.vital-value');
    const duration = 1200;
    const startAt = performance.now() + delay;

    const step = (now) => {
      if (now < startAt) {
        requestAnimationFrame(step);
        return;
      }

      const elapsed = now - startAt;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      ring.style.setProperty('--score', String(current));
      if (valueEl) valueEl.textContent = String(current);

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const runWidget = (widget) => {
    if (widget.dataset.animated === 'true') return;
    widget.dataset.animated = 'true';

    const rings = Array.from(widget.querySelectorAll('.vital-ring'));
    rings.forEach((ring, index) => {
      const target = Number(ring.getAttribute('data-target') || '100');
      if (reduceMotion) {
        ring.style.setProperty('--score', String(target));
        const valueEl = ring.querySelector('.vital-value');
        if (valueEl) valueEl.textContent = String(target);
        return;
      }
      animateRing(ring, target, index * 120);
    });
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const vitalsObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runWidget(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );
    widgets.forEach((widget) => vitalsObserver.observe(widget));
  } else {
    widgets.forEach(runWidget);
  }
};

initCoreVitalsAnimation();

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
    '.hero-proof, .metric, .problem-copy, .compare-card, .setup-box, .plan-card, .about-grid > article, .about-visual, .contact-wrap > article, .contact-form, .steps li, .creative-card'
  );

  cards.forEach((card) => {
    card.classList.add('tilt-card');

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 8;
      const rotateX = (0.5 - py) * 8;

      card.classList.add('is-tilting');
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.transform = '';
    });
  });
};

enableCardTilt();

const initNavIndicator = () => {
  const navList = document.querySelector('.nav-list');
  const brandLink = document.querySelector('.brand[href="#top"]');
  const ourWorkSection = document.getElementById('our-work');
  const whySection = document.getElementById('why-choose-us');
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
    const preOurWorkTrigger = whySection
      ? whySection.offsetTop + whySection.offsetHeight - 140
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
    const preOurWorkTrigger = whySection
      ? whySection.offsetTop + whySection.offsetHeight - 140
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
  const mobileQuery = window.matchMedia('(max-width: 910px)');
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
