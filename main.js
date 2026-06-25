/* ============================
   CAFÉ MACONDO — main.js
   Accesibilidad + Carrusel + Panel flotante
   ============================ */

(function () {
  'use strict';

  /* --------------------------------------------------
     CARRUSEL
  -------------------------------------------------- */
  const slides    = document.querySelectorAll('.carousel-slide');
  const dots      = document.querySelectorAll('.dot');
  const btnPrev   = document.querySelector('.carousel-prev');
  const btnNext   = document.querySelector('.carousel-next');
  let current     = 0;
  let carouselTimer;
  const INTERVAL  = 5000;

  function goTo(index) {
    // Quitar estado activo al slide y dot actuales
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-pressed', 'false');

    // Calcular nuevo índice con wrap-around
    current = (index + slides.length) % slides.length;

    // Activar el nuevo slide y dot
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-pressed', 'true');

    // Anunciar cambio a lectores de pantalla
    const liveRegion = document.querySelector('.carousel');
    if (liveRegion) {
      liveRegion.setAttribute(
        'aria-label',
        `Imagen ${current + 1} de ${slides.length}: galería de Café Macondo`
      );
    }
  }

  function nextSlide() {
    goTo(current + 1);
  }

  function prevSlide() {
    goTo(current - 1);
  }

  function startCarouselTimer() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(nextSlide, INTERVAL);
  }

  // Clicks en los dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      startCarouselTimer();
    });

    // Soporte de teclado: Enter y Espacio ya lo maneja el navegador en <button>
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(i + 1);
        // Mover foco al siguiente dot
        const next = dots[(i + 1) % dots.length];
        next.focus();
        startCarouselTimer();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(i - 1);
        const prev = dots[(i - 1 + dots.length) % dots.length];
        prev.focus();
        startCarouselTimer();
      }
    });
  });

  // Botones anterior / siguiente
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      prevSlide();
      startCarouselTimer();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      nextSlide();
      startCarouselTimer();
    });
  }

  // Pausar carrusel cuando el usuario enfoca el área (accesibilidad)
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('focusin', () => clearInterval(carouselTimer));
    heroSection.addEventListener('focusout', () => startCarouselTimer());
    heroSection.addEventListener('mouseenter', () => clearInterval(carouselTimer));
    heroSection.addEventListener('mouseleave', () => startCarouselTimer());
  }

  startCarouselTimer();


  /* --------------------------------------------------
     PANEL DE ACCESIBILIDAD — localStorage
  -------------------------------------------------- */
  const a11yToggle  = document.getElementById('a11y-toggle');
  const a11yOptions = document.getElementById('a11y-options');
  const btnContrast = document.getElementById('btn-contrast');
  const btnFontSize = document.getElementById('btn-fontsize');
  const btnDark     = document.getElementById('btn-darkmode');
  const body        = document.body;

  // Claves de almacenamiento
  const STORAGE_KEYS = {
    contrast:  'macondo_high_contrast',
    fontSize:  'macondo_large_font',
    darkMode:  'macondo_dark_mode',
  };

  /* -- Abrir / cerrar panel -- */
  function togglePanel() {
    const isOpen = a11yOptions.hidden === false;

    if (isOpen) {
      a11yOptions.hidden = true;
      a11yToggle.setAttribute('aria-expanded', 'false');
      a11yToggle.setAttribute('aria-label', 'Abrir panel de accesibilidad');
      document.getElementById('a11y-panel').setAttribute('aria-expanded', 'false');
    } else {
      a11yOptions.hidden = false;
      a11yToggle.setAttribute('aria-expanded', 'true');
      a11yToggle.setAttribute('aria-label', 'Cerrar panel de accesibilidad');
      document.getElementById('a11y-panel').setAttribute('aria-expanded', 'true');
      // Mover foco al primer botón de opción
      btnContrast.focus();
    }
  }

  // Cerrar panel al presionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !a11yOptions.hidden) {
      togglePanel();
      a11yToggle.focus();
    }
  });

  // Cerrar panel al hacer clic fuera de él
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('a11y-panel');
    if (!panel.contains(e.target) && !a11yOptions.hidden) {
      togglePanel();
    }
  });

  a11yToggle.addEventListener('click', togglePanel);


  /* -- Alto contraste -- */
  function applyContrast(active) {
    body.classList.toggle('high-contrast', active);
    btnContrast.setAttribute('aria-pressed', String(active));
    // Alto contraste y modo oscuro son mutuamente excluyentes
    if (active) {
      applyDarkMode(false);
      localStorage.setItem(STORAGE_KEYS.darkMode, 'false');
      btnDark.setAttribute('aria-pressed', 'false');
    }
  }

  btnContrast.addEventListener('click', () => {
    const nowActive = !body.classList.contains('high-contrast');
    applyContrast(nowActive);
    localStorage.setItem(STORAGE_KEYS.contrast, String(nowActive));
  });


  /* -- Tamaño de fuente -- */
  function applyFontSize(active) {
    body.classList.toggle('large-font', active);
    btnFontSize.setAttribute('aria-pressed', String(active));
  }

  btnFontSize.addEventListener('click', () => {
    const nowActive = !body.classList.contains('large-font');
    applyFontSize(nowActive);
    localStorage.setItem(STORAGE_KEYS.fontSize, String(nowActive));
  });


  /* -- Modo oscuro -- */
  function applyDarkMode(active) {
    body.classList.toggle('dark-mode', active);
    btnDark.setAttribute('aria-pressed', String(active));
    // Modo oscuro y alto contraste son mutuamente excluyentes
    if (active) {
      applyContrast(false);
      localStorage.setItem(STORAGE_KEYS.contrast, 'false');
      btnContrast.setAttribute('aria-pressed', 'false');
    }
  }

  btnDark.addEventListener('click', () => {
    const nowActive = !body.classList.contains('dark-mode');
    applyDarkMode(nowActive);
    localStorage.setItem(STORAGE_KEYS.darkMode, String(nowActive));
  });


  /* -- Restaurar preferencias al cargar -- */
  function restorePreferences() {
    const contrast  = localStorage.getItem(STORAGE_KEYS.contrast)  === 'true';
    const fontSize  = localStorage.getItem(STORAGE_KEYS.fontSize)  === 'true';
    const darkMode  = localStorage.getItem(STORAGE_KEYS.darkMode)  === 'true';

    if (contrast) applyContrast(true);
    if (fontSize) applyFontSize(true);
    // Solo aplicar oscuro si no hay alto contraste activo
    if (darkMode && !contrast) applyDarkMode(true);
  }

  restorePreferences();


  /* --------------------------------------------------
     NAVEGACIÓN CON TECLADO — imágenes de producto
     Las imágenes con tabindex="0" deben poder
     "activarse" con Enter o Espacio (abrir modal/lightbox
     o simplemente dar feedback de foco visual ya manejado
     por CSS).
  -------------------------------------------------- */
  const productImages = document.querySelectorAll('.card img[tabindex="0"]');

  productImages.forEach((img) => {
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // En este proyecto las imágenes no tienen acción especial,
        // pero el Enter/Espacio deja focus visible y podría usarse
        // para abrir un lightbox en el futuro.
        img.style.outline = '4px solid var(--color-secondary)';
        setTimeout(() => { img.style.outline = ''; }, 600);
      }
    });
  });


  /* --------------------------------------------------
     LOGO — soporte teclado (tabindex="0" en el img)
  -------------------------------------------------- */
  const logo = document.querySelector('.logo[tabindex="0"]');
  if (logo) {
    logo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

})();
