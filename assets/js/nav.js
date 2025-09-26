import { computeBasePath } from './utils.js';

export const initNavigation = (active = '') => {
  const navbar = document.querySelector('.navbar');
  const navInner = document.querySelector('.navbar-inner');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');

  const updateActive = () => {
    navLinks.forEach((link) => {
      const target = link.getAttribute('data-link');
      link.classList.toggle('active', target === active);
    });
  };

  updateActive();

  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 32) {
      navbar.classList.add('shrink');
    } else {
      navbar.classList.remove('shrink');
    }
  };

  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && navInner) {
    toggle.addEventListener('click', () => {
      navInner.classList.toggle('open');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navInner?.classList.remove('open');
    });
  });
};

export const initSmoothAnchors = () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        event.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
};

export const resolveAssetPath = (path) => {
  const base = computeBasePath();
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path;
  if (!base || base === '.' || base === './') {
    return path;
  }
  return `${base.replace(/\/$/, '')}/${path}`;
};
