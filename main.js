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
  const btnFontIncrease = document.getElementById('btn-font-increase');
  const btnFontDecrease = document.getElementById('btn-font-decrease');
  const fontDisplay     = document.getElementById('font-size-display');
  const btnDark     = document.getElementById('btn-darkmode');
  const body        = document.body;

  // Claves de almacenamiento
  const STORAGE_KEYS = {
    fontSize:  'macondo_font_size_px',
    darkMode:  'macondo_dark_mode',
  };

  /* -- Tamaño de fuente progresivo -- */
  const FONT_MIN    = 12;   // px mínimo
  const FONT_MAX    = 28;   // px máximo
  const FONT_STEP   = 2;    // px por clic
  const FONT_DEFAULT = 16;  // px base

  let currentFontSize = FONT_DEFAULT;

  function applyFontSize(px) {
    currentFontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, px));
    document.documentElement.style.fontSize = currentFontSize + 'px';
    const pct = Math.round((currentFontSize / FONT_DEFAULT) * 100);
    fontDisplay.textContent = pct + '%';
    btnFontDecrease.disabled = currentFontSize <= FONT_MIN;
    btnFontIncrease.disabled = currentFontSize >= FONT_MAX;
    localStorage.setItem(STORAGE_KEYS.fontSize, String(currentFontSize));
  }

  btnFontIncrease.addEventListener('click', () => applyFontSize(currentFontSize + FONT_STEP));
  btnFontDecrease.addEventListener('click', () => applyFontSize(currentFontSize - FONT_STEP));

  /* -- Abrir / cerrar panel -- */
  function togglePanel() {
  const isOpen = a11yOptions.hidden === false;

  if (isOpen) {
    a11yOptions.hidden = true;

    a11yToggle.setAttribute('aria-expanded', 'false');
    a11yToggle.setAttribute(
      'aria-label',
      'Abrir panel de accesibilidad'
    );

    document
      .getElementById('a11y-panel')
      .setAttribute('aria-expanded', 'false');

    document.body.classList.remove('a11y-open');

  } else {
    a11yOptions.hidden = false;

    a11yToggle.setAttribute('aria-expanded', 'true');
    a11yToggle.setAttribute(
      'aria-label',
      'Cerrar panel de accesibilidad'
    );

    document
      .getElementById('a11y-panel')
      .setAttribute('aria-expanded', 'true');

    document.body.classList.add('a11y-open');

    btnFontIncrease.focus();
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


  /* -- Modo oscuro -- */
  function applyDarkMode(active) {
    body.classList.toggle('dark-mode', active);
    btnDark.setAttribute('aria-pressed', String(active));
  }

  btnDark.addEventListener('click', () => {
    const nowActive = !body.classList.contains('dark-mode');
    applyDarkMode(nowActive);
    localStorage.setItem(STORAGE_KEYS.darkMode, String(nowActive));
  });


  /* -- Restaurar preferencias al cargar -- */
  function restorePreferences() {
    const savedFont = parseInt(localStorage.getItem(STORAGE_KEYS.fontSize), 10);
    const darkMode  = localStorage.getItem(STORAGE_KEYS.darkMode) === 'true';

    if (savedFont && savedFont !== FONT_DEFAULT) applyFontSize(savedFont);
    if (darkMode) applyDarkMode(true);
  }

  restorePreferences();


  /* --------------------------------------------------
     NAVEGACIÓN CON TECLADO — tarjetas de producto
     El <article class="card"> recibe tabindex="0" y
     responde a Enter/Espacio con feedback visual.
  -------------------------------------------------- */
  const productCards = document.querySelectorAll('.card[tabindex="0"]');

  productCards.forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.add('card--activated');
        setTimeout(() => card.classList.remove('card--activated'), 400);
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

/* --------------------------------------------------
   BOTÓN VOLVER ARRIBA
-------------------------------------------------- */

const backToTopBtn = document.getElementById('back-to-top');

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
/* ============================
   CARRUSELES DE PASTELES — INFINITO
============================ */

document
  .querySelectorAll('.cake-carousel-wrapper')
  .forEach(wrapper => {

    const carousel = wrapper.querySelector('.cake-carousel');
    const nextBtn  = wrapper.querySelector('.next-btn');
    const prevBtn  = wrapper.querySelector('.prev-btn');

    if (!carousel || !nextBtn || !prevBtn) return;

    // 1. Clonar todas las tarjetas al inicio y al final
    const origCards = Array.from(carousel.querySelectorAll('.card'));
    const total = origCards.length;

    // Clonar al final
    origCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      carousel.appendChild(clone);
    });

    // Clonar al inicio
    origCards.slice().reverse().forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      carousel.prepend(clone);
    });

    // 2. Función para obtener el ancho de una tarjeta + gap
    function cardStep() {
      const card = carousel.querySelector('.card');
      const gap = parseFloat(getComputedStyle(carousel).gap) || 24;
      return card.offsetWidth + gap;
    }

    // 3. Posicionar el scroll al inicio de las tarjetas originales (después de los clones del inicio)
    function init() {
      carousel.style.scrollBehavior = 'auto';
      carousel.scrollLeft = cardStep() * total;
      carousel.style.scrollBehavior = '';
    }

    init();
    window.addEventListener('resize', init);

    // 4. Avanzar / retroceder
    let isScrolling = false;

    function step(direction) {
      if (isScrolling) return;
      isScrolling = true;

      const move = cardStep() * direction;
      carousel.style.scrollBehavior = 'smooth';
      carousel.scrollLeft += move;

      // Tras la transición, revisar si hay que saltar
      setTimeout(() => {
        carousel.style.scrollBehavior = 'auto';

        const maxReal  = cardStep() * (total * 2); // inicio de clones finales
        const minReal  = cardStep() * total;        // inicio de originales

        if (carousel.scrollLeft >= maxReal) {
          carousel.scrollLeft -= cardStep() * total;
        } else if (carousel.scrollLeft < minReal - cardStep() * (total - 1) - 1) {
          carousel.scrollLeft += cardStep() * total;
        }

        carousel.style.scrollBehavior = '';
        isScrolling = false;
      }, 400); // mismo tiempo que la transición CSS smooth (~300-400 ms)
    }

    nextBtn.addEventListener('click', () => step(1));
    prevBtn.addEventListener('click', () => step(-1));
});

})();