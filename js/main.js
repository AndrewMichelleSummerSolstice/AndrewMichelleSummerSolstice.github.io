/* =========================================================
   main.js — Shared utilities: nav toggle, scroll effects,
             reveal animations, back-to-top
   ========================================================= */

(function () {
  'use strict';

  /* ---- Navigation ---- */
  const nav       = document.querySelector('.site-nav');
  const toggle    = document.querySelector('.site-nav__toggle');
  const mobileNav = document.querySelector('.site-nav__mobile');

  // Highlight the active page link
  function setActiveLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav__links a, .site-nav__mobile a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // Hamburger toggle
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        toggle.classList.remove('open');
        mobileNav.classList.remove('open');
      }
    });
  }

  // Scroll: shadow + back-to-top visibility
  const backToTop = document.querySelector('.back-to-top');

  function handleScroll() {
    const scrolled = window.scrollY > 20;
    if (nav) nav.classList.toggle('scrolled', scrolled);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Scroll Reveal Animation ---- */
  function initReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach((el, i) => {
      // Stagger delay for sibling groups
      if (el.dataset.delay) {
        el.style.transitionDelay = el.dataset.delay;
      }
      observer.observe(el);
    });
  }

  /* ---- Theme Toggle ---- */
  const SUN  = '\u2600\uFE0F'; // ☀️
  const MOON = '\uD83C\uDF19'; // 🌙

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme, btn) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (btn) {
      const icon = btn.querySelector('.theme-toggle__icon');
      const label = btn.querySelector('.theme-toggle__label');
      if (icon)  icon.textContent  = theme === 'dark' ? SUN : MOON;
      if (label) label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
      const tip = theme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
      btn.setAttribute('aria-label', tip);
      btn.title = tip;
    }
  }

  function initThemeToggle() {
    const navInner  = document.querySelector('.site-nav__inner');
    const hamburger = document.querySelector('.site-nav__toggle');
    if (!navInner) return;

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.innerHTML =
      '<span class="theme-toggle__icon" aria-hidden="true"></span>' +
      '<span class="theme-toggle__label"></span>';

    if (hamburger && hamburger.parentNode === navInner) {
      navInner.insertBefore(btn, hamburger);
    } else {
      navInner.appendChild(btn);
    }

    applyTheme(currentTheme(), btn);

    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', next); } catch (e) {}
      applyTheme(next, btn);
    });
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', () => {
    setActiveLink();
    initReveal();
    initThemeToggle();
  });
})();
