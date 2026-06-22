(function () {
  const body = document.body;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (navToggle && nav) {
    const navToggleLabel = navToggle.querySelector(".sr-only");
    navToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      if (navToggleLabel) navToggleLabel.textContent = isOpen ? "Close menu" : "Open menu";
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Header scroll state + scroll progress ---------- */
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector(".scroll-progress");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : "0");
    }
    ticking = false;
  }

  let ticking = false;
  function requestScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScroll();

  /* ---------- Staggered scroll reveals ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  // Auto-assign a stagger delay to reveals that share a parent.
  const groups = new Map();
  revealItems.forEach((item) => {
    if (item.style.getPropertyValue("--delay")) return;
    const parent = item.parentElement;
    const index = groups.get(parent) || 0;
    groups.set(parent, index + 1);
    if (index > 0) item.style.setProperty("--delay", `${Math.min(index * 80, 360)}ms`);
  });

  if ("IntersectionObserver" in window && !prefersReduced) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- Gentle hero parallax ---------- */
  const parallaxImg = document.querySelector(".media-frame img");

  if (parallaxImg && !prefersReduced && window.innerWidth > 760) {
    let raf = 0;
    const update = () => {
      const frame = parallaxImg.closest(".media-frame");
      const rect = frame.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) / window.innerHeight;
      const shift = Math.max(-14, Math.min(14, offset * -20));
      parallaxImg.style.setProperty("--py", `${shift.toFixed(2)}px`);
      raf = 0;
    };
    const onParallax = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onParallax, { passive: true });
    window.addEventListener("resize", onParallax, { passive: true });
    update();
  }

  /* ---------- Blog filtering ---------- */
  const filterButtons = document.querySelectorAll("[data-filter]");
  const topicSections = document.querySelectorAll("[data-topic]");
  const postCards = document.querySelectorAll("[data-category]");

  function applyFilter(filter) {
    filterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === filter);
    });

    topicSections.forEach((section) => {
      section.classList.toggle("is-hidden", filter !== "all" && section.dataset.topic !== filter);
    });

    postCards.forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.filter);
    });
  });

  /* ---------- Deep-link to a filtered topic ---------- */
  if (window.location.hash) {
    const hashTarget = window.location.hash.slice(1);
    const matchedButton = document.querySelector(`[data-filter="${hashTarget}"]`);
    if (matchedButton) {
      applyFilter(matchedButton.dataset.filter);
      const targetSection = document.getElementById(hashTarget);
      if (targetSection) {
        targetSection.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
        requestAnimationFrame(() => targetSection.scrollIntoView({ block: "start" }));
      }
    }
  }
})();
