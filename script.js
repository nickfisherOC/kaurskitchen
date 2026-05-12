/* =============================================
   Kaur's Kitchen — Main Script
   ============================================= */

/* -----------------------------------------------
   OPEN / CLOSED STATUS
   Operating hours (visitor's local time):
     Mon–Fri : 10:00 AM – 8:30 PM
     Sat–Sun : 11:00 AM – 8:30 PM
     Closed  : Last Tuesday of every month
   ----------------------------------------------- */

function isLastTuesdayOfMonth(date) {
  // Returns true if `date` is the last Tuesday of its month
  if (date.getDay() !== 2) return false; // Not a Tuesday

  const nextWeek = new Date(date);
  nextWeek.setDate(date.getDate() + 7);
  return nextWeek.getMonth() !== date.getMonth();
}

function getTodayHoursText(dayOfWeek) {
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return 'Today: 10:00 AM – 8:30 PM';
  }
  return 'Today: 11:00 AM – 8:30 PM';
}

function getOpenTimeText(dayOfWeek) {
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return 'Opens at 10:00 AM';
  }
  return 'Opens at 11:00 AM';
}

function getRestaurantStatus() {
  const now  = new Date();
  const day  = now.getDay();                          // 0=Sun … 6=Sat
  const mins = now.getHours() * 60 + now.getMinutes(); // current time in minutes

  // --- Last Tuesday closure ---
  if (isLastTuesdayOfMonth(now)) {
    return {
      state:   'closed-today',
      label:   'Closed Today',
      detail:  'Monthly rest day — see you tomorrow!',
    };
  }

  // --- Determine open window ---
  const openMin  = (day >= 1 && day <= 5) ? 10 * 60 : 11 * 60; // 10:00 or 11:00
  const closeMin = 20 * 60 + 30;                                 // 8:30 PM = 20:30

  if (mins >= openMin && mins < closeMin) {
    // Calculate closing-soon warning (within 30 min of close)
    const minsLeft = closeMin - mins;
    const detail   = minsLeft <= 30
      ? `Closing soon · ${getTodayHoursText(day)}`
      : getTodayHoursText(day);

    return {
      state:  'open',
      label:  'Open Now',
      detail,
    };
  }

  // Closed (before or after hours)
  const detail = mins < openMin
    ? `${getOpenTimeText(day)} · ${getTodayHoursText(day)}`
    : `Closed for today · ${getTodayHoursText(day)}`;

  return {
    state:  'closed',
    label:  'Closed Now',
    detail,
  };
}

/**
 * Renders status into every element matching [data-status-badge]
 * and every [data-status-label], [data-status-detail] pair.
 */
function renderStatus() {
  const { state, label, detail } = getRestaurantStatus();

  // --- Hero / light badges ---
  document.querySelectorAll('[data-status-badge]').forEach((el) => {
    const dot = el.querySelector('[data-status-dot]');
    const lbl = el.querySelector('[data-status-label]');

    el.classList.remove('is-open', 'is-closed', 'is-closed-today');
    el.classList.add(`is-${state}`);

    if (lbl) lbl.textContent = label;
  });

  // --- Contact page large label ---
  document.querySelectorAll('[data-status-heading]').forEach((el) => {
    el.textContent = label;
    el.className = el.className.replace(/is-\S+/g, '').trim();
    el.classList.add(`is-${state}`);
  });

  // --- Detail / hours text ---
  document.querySelectorAll('[data-status-detail]').forEach((el) => {
    el.textContent = detail;
  });
}

/* -----------------------------------------------
   STICKY NAVIGATION — add shadow on scroll
   ----------------------------------------------- */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* -----------------------------------------------
   MOBILE HAMBURGER MENU
   ----------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile-menu');
  const nav        = document.querySelector('.nav');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav?.contains(e.target) && !mobileMenu.contains(e.target)) {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* -----------------------------------------------
   SCROLL FADE-IN ANIMATION
   ----------------------------------------------- */
function initScrollAnimations() {
  const targets = document.querySelectorAll('.fade-up');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* -----------------------------------------------
   HERO IMAGE LOADED — trigger subtle zoom-out
   ----------------------------------------------- */
function initHeroAnimation() {
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero__bg img');
  if (!hero || !heroImg) return;

  if (heroImg.complete) {
    hero.classList.add('is-loaded');
  } else {
    heroImg.addEventListener('load', () => hero.classList.add('is-loaded'));
  }
}

/* -----------------------------------------------
   ACTIVE NAV LINK
   ----------------------------------------------- */
function initActiveNavLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });
}

/* -----------------------------------------------
   SMOOTH SCROLL for hash links
   ----------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const navHeight = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height'), 10) || 76;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* -----------------------------------------------
   BOOT
   ----------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderStatus();
  initNav();
  initMobileMenu();
  initScrollAnimations();
  initHeroAnimation();
  initActiveNavLink();
  initSmoothScroll();
});
