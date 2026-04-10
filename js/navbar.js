/**
 * navbar.js — Lógica compartida del navbar
 * Marca el link activo según la página actual y gestiona el menú hamburger en mobile.
 */

(function () {
  'use strict';

  function initNavbar() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    // Marcar el link activo
    const links = nav.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';

    links.forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const linkFile = href.split('/').pop();

      const isHome = (linkFile === 'index.html' || linkFile === '') &&
                     (currentFile === 'index.html' || currentFile === '');
      const isMatch = linkFile !== '' && linkFile !== 'index.html' && currentFile === linkFile;

      if (isHome || isMatch) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });

    // Hamburger — toggle .nav-open en el nav
    const hamburger = nav.querySelector('.nav-hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', function () {
        const isOpen = nav.classList.toggle('nav-open');
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      });

      // Cerrar el menú al hacer click en un link
      links.forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('nav-open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
