// =======================================
// Menú mobile + año automático en footer
// =======================================
(function () {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-menu-panel]");
  const yearEl = document.querySelector("[data-year]");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Cierra el menú al clickear un link (mobile)
  panel.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    panel.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
})();

// =========================================================
// Staff Carousel — auto-slide 1 card cada 3s (loop infinito)
// =========================================================
(function () {
  const track = document.querySelector("[data-staff-track]");
  if (!track) return;

  const viewport = track.closest(".staff-carousel__viewport");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let intervalId = null;
  let isPaused = false;
  let isAnimating = false;

  function getStepPx() {
    const first = track.children[0];
    if (!first) return 0;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;

    const rect = first.getBoundingClientRect();
    return rect.width + gap;
  }

  function slideOnce() {
    if (reduceMotion.matches) return;
    if (isPaused || isAnimating) return;

    const step = getStepPx();
    if (!step) return;

    isAnimating = true;
    track.classList.add("is-animating");
    track.style.transform = `translateX(-${step}px)`;

    const onTransitionEnd = (e) => {
      if (e.propertyName !== "transform") return;
      track.removeEventListener("transitionend", onTransitionEnd);

      track.classList.remove("is-animating");
      track.style.transition = "none";
      track.style.transform = "translateX(0)";

      const first = track.children[0];
      if (first) track.appendChild(first);

      void track.offsetWidth; // reflow
      track.style.transition = "";

      isAnimating = false;
    };

    track.addEventListener("transitionend", onTransitionEnd);
  }

  function start() {
    stop();
    if (reduceMotion.matches) return;
    intervalId = window.setInterval(slideOnce, 3000);
  }

  function stop() {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
  }

  function pause() { isPaused = true; }
  function resume() { isPaused = false; }

  if (viewport) {
    viewport.addEventListener("mouseenter", pause);
    viewport.addEventListener("mouseleave", resume);
    viewport.addEventListener("focusin", pause);
    viewport.addEventListener("focusout", resume);
  }

  window.addEventListener("resize", () => {
    if (!isAnimating) return;
    track.classList.remove("is-animating");
    track.style.transform = "translateX(0)";
    isAnimating = false;
  });

  reduceMotion.addEventListener?.("change", () => {
    if (reduceMotion.matches) stop();
    else start();
  });

  start();
})();

// =========================================================
// Testimonial Carousel — auto-slide 1 card cada 3s (loop infinito)
// =========================================================
(function () {
  const track = document.querySelector("[data-testimonial-track]");
  if (!track) return;

  const viewport = track.closest(".testimonial-carousel__viewport");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isDesktop = window.matchMedia("(min-width: 961px)");

  let intervalId = null;
  let isPaused = false;
  let isAnimating = false;

  function getStepPx() {
    const first = track.children[0];
    if (!first) return 0;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;

    const rect = first.getBoundingClientRect();
    return rect.width + gap;
  }

  function slideOnce() {
    if (reduceMotion.matches) return;
    if (isDesktop.matches) return;
    if (isPaused || isAnimating) return;

    const step = getStepPx();
    if (!step) return;

    isAnimating = true;
    track.classList.add("is-animating");
    track.style.transform = `translateX(-${step}px)`;

    const onTransitionEnd = (e) => {
      if (e.propertyName !== "transform") return;
      track.removeEventListener("transitionend", onTransitionEnd);

      track.classList.remove("is-animating");
      track.style.transition = "none";
      track.style.transform = "translateX(0)";

      const first = track.children[0];
      if (first) track.appendChild(first);

      void track.offsetWidth; // reflow
      track.style.transition = "";

      isAnimating = false;
    };

    track.addEventListener("transitionend", onTransitionEnd);
  }

  function start() {
    stop();
    if (reduceMotion.matches) return;
    if (isDesktop.matches) return;
    intervalId = window.setInterval(slideOnce, 3000);
  }

  function stop() {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
  }

  function pause() { isPaused = true; }
  function resume() { isPaused = false; }

  if (viewport) {
    viewport.addEventListener("mouseenter", pause);
    viewport.addEventListener("mouseleave", resume);
    viewport.addEventListener("focusin", pause);
    viewport.addEventListener("focusout", resume);
  }

  window.addEventListener("resize", () => {
    if (!isAnimating) return;
    track.classList.remove("is-animating");
    track.style.transform = "translateX(0)";
    isAnimating = false;
  });

  reduceMotion.addEventListener?.("change", () => {
    if (reduceMotion.matches) stop();
    else start();
  });

  isDesktop.addEventListener("change", () => {
    if (isDesktop.matches) stop();
    else start();
  });

  start();
})();

// =======================================
// Cursos expandibles (una abierta a la vez)
// =======================================
(function () {
  const grid = document.querySelector("[data-courses]");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll("[data-course]"));
  let openIndex = -1;

  function setOpen(index) {
    openIndex = index;
    cards.forEach((card, i) => {
      const isOpen = i === index;
      card.classList.toggle("is-open", isOpen);
      const expand = card.querySelector(".course-expand");
      if (expand) expand.setAttribute("aria-hidden", String(!isOpen));
      const tag = card.querySelector(".tag");
      if (tag) {
        if (!tag.dataset.defaultLabel) {
          tag.dataset.defaultLabel = tag.textContent.trim() || "Ver más";
        }
        tag.textContent = isOpen ? "Ver menos" : tag.dataset.defaultLabel;
      }
    });
  }

  cards.forEach((card) => {
    const courseMain = card.querySelector(".course-main");
    
    courseMain.addEventListener("click", (e) => {
      // No abre si clickeas en un botón de opciones
      if (e.target.closest(".course-options button")) return;

      const index = cards.indexOf(card);
      setOpen(openIndex === index ? -1 : index);
    });

    const buttons = card.querySelectorAll(".course-options button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const level = btn.dataset.level;
        const course = card.querySelector("h3")?.textContent?.trim() || "curso";

        console.log("Curso:", course, "Edad:", level);
      });
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(-1);
  });
})();

// =======================================
// Cards expandibles de la sección dark
// =======================================
(function () {
  const section = document.querySelector(".section--dark");
  if (!section) return;

  const cards = Array.from(section.querySelectorAll(".grid-eq .card"));
  if (!cards.length) return;

  function closeCard(card) {
    card.classList.remove("is-open");
  }

  function openCard(card) {
    card.classList.add("is-open");
  }

  function closeAllExcept(current) {
    cards.forEach((c) => {
      if (c !== current) closeCard(c);
    });
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const isOpen = card.classList.contains("is-open");

      if (isOpen) {
        closeCard(card);
      } else {
        closeAllExcept(card);
        openCard(card);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cards.forEach(closeCard);
  });
})();

// =======================================
// Carrusel automático de testimonios
// =======================================
(function () {
  const grid = document.querySelector(".section--video .grid-3");
  if (!grid) return;

  const originalCards = Array.from(grid.querySelectorAll(".card"));
  if (originalCards.length <= 1) return;

  function cloneAll(list) {
    return list.map((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add("is-clone");
      return clone;
    });
  }

  const beforeClones = cloneAll(originalCards);
  const afterClones = cloneAll(originalCards);
  beforeClones.forEach((clone) => grid.insertBefore(clone, originalCards[0]));
  afterClones.forEach((clone) => grid.appendChild(clone));

  const cards = Array.from(grid.querySelectorAll(".card"));
  const total = originalCards.length;
  let currentIndex = total;

  function scrollToCard(index, behavior = "smooth") {
    const card = cards[index];
    if (!card) return;

    const targetLeft = card.offsetLeft - (grid.clientWidth - card.offsetWidth) / 2;
    if (behavior === "auto") {
      grid.style.scrollBehavior = "auto";
      grid.scrollLeft = targetLeft;
      grid.style.scrollBehavior = "";
      return;
    }
    grid.scrollTo({ left: targetLeft, behavior: "smooth" });
  }

  function nextCard() {
    currentIndex += 1;
    scrollToCard(currentIndex);
    window.setTimeout(() => {
      if (currentIndex >= total * 2) {
        currentIndex = total;
        scrollToCard(currentIndex, "auto");
      }
    }, 350);
  }

  // Auto-play continuo sin interrupción
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!reduceMotion.matches) {
    window.setInterval(nextCard, 3000);
  }

  scrollToCard(currentIndex, "auto");
  window.addEventListener("resize", () => scrollToCard(currentIndex, "auto"));

  // Prevenir scroll manual
  grid.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
  grid.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  grid.addEventListener(
    "mousemove",
    (e) => {
      if (e.buttons > 0) e.preventDefault();
    },
    { passive: false }
  );
})();

// Solo en home: fuerza iniciar arriba
if (document.querySelector("main.home")) {
  window.history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
}

// =======================================
// Envío de formulario de contacto
// =======================================
(function () {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const statusEl = document.querySelector('[data-contact-status]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Mostrar estado de envío
    statusEl.style.display = 'block';
    statusEl.textContent = 'Enviando...';
    statusEl.style.backgroundColor = '#f0f0f0';
    statusEl.style.color = '#666';

    try {
      // Cambiar por tu URL de Apps Script aquí
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgwVNqhUzLCTwCGjteez5l4JY7nb8haF1HtYYUz8BLhgwPIo7xaQ3ORblhAZyFeDDcHw/exec';

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });

      // Con no-cors no podemos leer la respuesta, pero el envío se completó
      statusEl.textContent = '¡Gracias! Tu consulta fue enviada con éxito. Te contactaremos en breve.';
      statusEl.style.backgroundColor = '#e8f5e9';
      statusEl.style.color = '#2e7d32';

      // Limpiar formulario
      form.reset();

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
    } catch (error) {
      statusEl.textContent = 'Error al enviar. Intenta de nuevo o escribe a info@accionmusical.com.ar';
      statusEl.style.backgroundColor = '#ffebee';
      statusEl.style.color = '#c62828';
    }
  });
})();

// Cargar FAQ bot dinámicamente (resuelve ruta relativo según el script actual)
(function(){
  const current = document.currentScript || (function(){ const s = document.querySelectorAll('script'); return s[s.length-1]; })();
  const src = current && current.getAttribute('src') || '';
  const base = src.replace(/script\.js(\?.*)?$/,'');
  const faqSrc = base + 'faq-bot.js';
  const loader = document.createElement('script');
  loader.src = faqSrc;
  loader.defer = true;
  document.body.appendChild(loader);
})();

