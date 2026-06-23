(() => {
  "use strict";

  const header = document.getElementById("header");
  const onScroll = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const revealTargets = document.querySelectorAll(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window) {
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    revealTargets.forEach((el) => revealIO.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in"));
  }

  setTimeout(() => {
    const fab = document.getElementById("fab");
    if (!fab) return;
    fab.classList.add("expanded");
    setTimeout(() => fab.classList.remove("expanded"), 3200);
  }, 4000);

  const tilt = document.querySelector(".hero-tilt");
  if (
    tilt &&
    matchMedia("(hover:hover)").matches &&
    !matchMedia("(prefers-reduced-motion:reduce)").matches
  ) {
    const visual = document.querySelector(".hero-visual");
    visual.addEventListener("mousemove", (e) => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(1200px) rotateY(${-3 + x * 6}deg) rotateX(${1 - y * 6}deg) translateY(${y * -4}px)`;
    });
    visual.addEventListener("mouseleave", () => {
      tilt.style.transform = "";
    });
  }

  const track = document.getElementById("track");
  if (track) {
    const slides = track.children;
    const total = slides.length;
    const dotsEl = document.getElementById("dots");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    let perView = 2,
      idx = 0,
      timer;

    const pages = () => Math.ceil(total / perView);
    const buildDots = () => {
      dotsEl.innerHTML = "";
      for (let i = 0; i < pages(); i++) {
        const b = document.createElement("button");
        b.className = "dot" + (i === 0 ? " active" : "");
        b.setAttribute("aria-label", `Página ${i + 1}`);
        b.addEventListener("click", () => go(i));
        dotsEl.appendChild(b);
      }
    };
    const update = () => {
      const slideW = slides[0].getBoundingClientRect().width;
      const gap = 24;
      track.style.transform = `translateX(-${idx * perView * (slideW + gap)}px)`;
      [...dotsEl.children].forEach((d, i) =>
        d.classList.toggle("active", i === idx),
      );
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === pages() - 1;
    };
    const go = (n) => {
      idx = Math.max(0, Math.min(pages() - 1, n));
      update();
      resetAuto();
    };
    const next = () => {
      idx = (idx + 1) % pages();
      update();
    };
    const resetAuto = () => {
      clearInterval(timer);
      timer = setInterval(next, 6000);
    };

    prevBtn.addEventListener("click", () => go(idx - 1));
    nextBtn.addEventListener("click", () => go(idx + 1));

    let startX = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
    });

    const init = () => {
      perView = innerWidth < 900 ? 1 : 2;
      buildDots();
      update();
      resetAuto();
    };
    init();
    let rT;
    addEventListener("resize", () => {
      clearTimeout(rT);
      rT = setTimeout(init, 150);
    });
  }

  // ─── Consentimento de cookies + mapa ───────────────────────────────────────
  // O Google Maps (/ccm/collect) também dispara cookies de terceiros,
  // então bloqueamos o mapa até que o usuário aceite.

  const mapCard = document.getElementById("mapCard");

  function setupMap() {
    if (!mapCard) return;
    const loadMap = () => {
      if (mapCard.dataset.loaded) return;
      mapCard.dataset.loaded = "1";
      const iframe = document.createElement("iframe");
      iframe.className = "map-iframe";
      iframe.loading = "lazy";
      iframe.title = "Mapa interativo da loja ProBox Colchões";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.src =
        "https://www.google.com/maps?q=" +
        encodeURIComponent(
          mapCard.dataset.mapsQuery || "Probox Colchoes Ipiranga",
        ) +
        "&output=embed";
      iframe.addEventListener(
        "load",
        () => mapCard.classList.add("is-loaded"),
        { once: true },
      );
      mapCard.appendChild(iframe);
    };

    const onInteract = () => {
      loadMap();
      mapCard.removeEventListener("click", onInteract);
      mapCard.removeEventListener("touchstart", onInteract);
    };
    mapCard.addEventListener("click", onInteract);
    mapCard.addEventListener("touchstart", onInteract, { passive: true });
    mapCard.style.cursor = "pointer";
  }

  function loadGtag() {
    const s = document.createElement("script");
    s.src = "https://www.googletagmanager.com/gtag/js?id=AW-875465851";
    s.async = true;
    document.head.appendChild(s);
    s.onload = function () {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "AW-875465851");
    };
  }

  function onConsentGranted() {
    loadGtag();
    setupMap();
  }

  if (localStorage.getItem("cookie_consent")) {
    onConsentGranted();
  } else {
    if (mapCard) {
      mapCard.style.cursor = "pointer";
      const preConsentClick = (e) => {
        if (localStorage.getItem("cookie_consent")) {
          preConsentClick && mapCard.removeEventListener("click", preConsentClick);
          setupMap();
          return;
        }
        e.preventDefault();
        window.open("https://maps.app.goo.gl/v3QY3RYrEEmf3Dbu6", "_blank", "noopener");
      };
      mapCard.addEventListener("click", preConsentClick);
    }

    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.innerHTML = `
      <p>Usamos cookies para anúncios e analytics. Ao continuar, você concorda com nossa política de privacidade.</p>
      <button id="accept-cookies">Aceitar</button>
    `;
    banner.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;z-index:9999;
      background:#1a377c;color:#fff;padding:16px 24px;
      display:flex;align-items:center;justify-content:space-between;
      gap:16px;font-size:14px;font-family:inherit;
    `;
    banner.querySelector("button").style.cssText = `
      background:#1ea0e1;color:#fff;border:none;
      padding:10px 20px;border-radius:999px;
      font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit;
    `;
    document.body.appendChild(banner);

    document.getElementById("accept-cookies").addEventListener("click", () => {
      localStorage.setItem("cookie_consent", "1");
      banner.remove();
      if (mapCard) {
        const clone = mapCard.cloneNode(true);
        mapCard.parentNode.replaceChild(clone, mapCard);
        const freshCard = document.getElementById("mapCard");
        if (freshCard) {
          freshCard.style.cursor = "pointer";
          const freshLoad = () => {
            if (freshCard.dataset.loaded) return;
            freshCard.dataset.loaded = "1";
            const iframe = document.createElement("iframe");
            iframe.className = "map-iframe";
            iframe.loading = "lazy";
            iframe.title = "Mapa interativo da loja ProBox Colchões";
            iframe.referrerPolicy = "no-referrer-when-downgrade";
            iframe.src =
              "https://www.google.com/maps?q=" +
              encodeURIComponent(freshCard.dataset.mapsQuery || "Probox Colchoes Ipiranga") +
              "&output=embed";
            iframe.addEventListener("load", () => freshCard.classList.add("is-loaded"), { once: true });
            freshCard.appendChild(iframe);
          };
          freshCard.addEventListener("click", freshLoad);
          freshCard.addEventListener("touchstart", freshLoad, { passive: true });
        }
      }
      onConsentGranted();
    });
  }
})();
