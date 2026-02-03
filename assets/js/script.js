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

// =======================================
// Cursos expandibles (una abierta a la vez)
// =======================================
(function () {
  const grid = document.querySelector("[data-courses]");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll("[data-course]"));

  function closeCard(card) {
    card.classList.remove("is-open");
    const expand = card.querySelector(".course-expand");
    if (expand) expand.setAttribute("aria-hidden", "true");
  }

  function openCard(card) {
    card.classList.add("is-open");
    const expand = card.querySelector(".course-expand");
    if (expand) expand.setAttribute("aria-hidden", "false");
  }

  function closeAllExcept(current) {
    cards.forEach((c) => {
      if (c !== current) closeCard(c);
    });
  }

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".course-options button")) return;

      const isOpen = card.classList.contains("is-open");
      if (isOpen) {
        closeCard(card);
      } else {
        closeAllExcept(card);
        openCard(card);
      }
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
    if (e.key === "Escape") cards.forEach(closeCard);
  });
})();
