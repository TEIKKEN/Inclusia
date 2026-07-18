(() => {
  const section = document.querySelector(".if-about-section");
  if (!section) return;

  const tabs = Array.from(section.querySelectorAll(".if-about-tab"));
  const indicator = section.querySelector(".if-about-indicator");
  const progress = section.querySelector(".if-about-progress");
  const progressFill = section.querySelector(".if-about-progress-fill");
  const progressText = section.querySelector(".if-about-progress-text");
  const panelsWrap = section.querySelector(".if-about-panels");

  const panels = {
    hoy: section.querySelector('[data-panel="hoy"]'),
    futuro: section.querySelector('[data-panel="futuro"]')
  };

  function shouldReduceMotion() {
    const rootPreference = document.documentElement.dataset.reduceMotion;
    if (rootPreference === "true" || rootPreference === "false") {
      return rootPreference === "true";
    }

    try {
      const savedPreference = localStorage.getItem("inclusiaReduceMotion");
      if (savedPreference === "true" || savedPreference === "false") {
        return savedPreference === "true";
      }
    } catch {
      // Fall back to the operating system preference.
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  const hasGsap = typeof window.gsap !== "undefined";

  let active = "hoy";
  let busy = false;

  function panelNodes(panel) {
    return panel ? panel.querySelectorAll("[data-anim]") : [];
  }

  function measurePanelHeight(panel) {
    if (!panel) return 0;

    const wasHidden = panel.hidden;
    const snapshot = {
      position: panel.style.position,
      visibility: panel.style.visibility,
      pointerEvents: panel.style.pointerEvents,
      display: panel.style.display,
      inset: panel.style.inset,
      width: panel.style.width
    };

    if (wasHidden) {
      panel.hidden = false;
      panel.style.position = "absolute";
      panel.style.visibility = "hidden";
      panel.style.pointerEvents = "none";
      panel.style.display = "block";
      panel.style.inset = "0";
      panel.style.width = "100%";
    }

    const height = panel.offsetHeight;

    if (wasHidden) {
      panel.hidden = true;
      panel.style.position = snapshot.position;
      panel.style.visibility = snapshot.visibility;
      panel.style.pointerEvents = snapshot.pointerEvents;
      panel.style.display = snapshot.display;
      panel.style.inset = snapshot.inset;
      panel.style.width = snapshot.width;
    }

    return height;
  }

  function moveIndicator(targetTab, immediate = false) {
    if (!targetTab || !indicator) return;

    const x = targetTab.offsetLeft;
    const width = targetTab.offsetWidth;

    if (immediate || shouldReduceMotion() || !hasGsap) {
      indicator.style.transform = `translateX(${x}px)`;
      indicator.style.width = `${width}px`;
      return;
    }

    window.gsap.to(indicator, {
      x,
      width,
      duration: 0.52,
      ease: "power2.inOut"
    });
  }

  function updateState(next, immediate = false) {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === next;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    const activeTab = tabs.find((tab) => tab.dataset.tab === next);
    moveIndicator(activeTab, immediate);

    const val = next === "hoy" ? 46 : 92;
    progress.setAttribute("aria-valuenow", String(val));
    progressText.textContent = next === "hoy" ? "Enfoque activo: Hoy" : "Enfoque activo: Futuro";

    section.classList.toggle("is-future", next === "futuro");

    if (shouldReduceMotion() || !hasGsap || immediate) {
      progressFill.style.width = `${val}%`;
      return;
    }

    window.gsap.to(progressFill, {
      width: `${val}%`,
      duration: 0.52,
      ease: "power2.inOut"
    });
  }

  function switchPanel(next) {
    if (busy || next === active || !panels[next]) return;

    const currentPanel = panels[active];
    const nextPanel = panels[next];
    const currentItems = panelNodes(currentPanel);
    const nextItems = panelNodes(nextPanel);
    const currentHeight = currentPanel.offsetHeight;
    const nextHeight = measurePanelHeight(nextPanel);

    busy = true;

    const endSwitch = () => {
      active = next;
      panelsWrap.style.height = "";
      busy = false;
    };

    if (shouldReduceMotion() || !hasGsap) {
      currentPanel.hidden = true;
      currentPanel.classList.remove("is-visible");
      nextPanel.hidden = false;
      nextPanel.classList.add("is-visible");
      updateState(next, true);
      endSwitch();
      return;
    }

    panelsWrap.style.height = `${currentHeight}px`;

    nextPanel.hidden = false;
    nextPanel.classList.add("is-visible");
    nextPanel.style.position = "absolute";
    nextPanel.style.inset = "0";
    nextPanel.style.width = "100%";
    nextPanel.style.pointerEvents = "none";

    window.gsap.set(nextPanel, {
      autoAlpha: 0,
      y: 12,
      scale: 0.98,
      filter: "blur(8px)"
    });

    window.gsap.set(nextItems, {
      autoAlpha: 0,
      y: 12,
      filter: "blur(6px)"
    });

    const tl = window.gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        currentPanel.hidden = true;
        currentPanel.classList.remove("is-visible");
        nextPanel.style.position = "";
        nextPanel.style.inset = "";
        nextPanel.style.width = "";
        nextPanel.style.pointerEvents = "";
        window.gsap.set([currentPanel, nextPanel], { clearProps: "opacity,transform,filter,visibility" });
        window.gsap.set([...currentItems, ...nextItems], { clearProps: "opacity,transform,filter,visibility" });
        endSwitch();
      }
    });

    tl.to(
      panelsWrap,
      {
        height: nextHeight,
        duration: 0.7
      },
      0.04
    )
      .to(
        currentItems,
        {
          autoAlpha: 0,
          y: -10,
          filter: "blur(6px)",
          duration: 0.36,
          stagger: 0.045
        },
        0
      )
      .to(
        currentPanel,
        {
          autoAlpha: 0,
          y: -8,
          scale: 0.985,
          filter: "blur(8px)",
          duration: 0.44
        },
        0
      )
      .to(
        nextPanel,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.58
        },
        0.22
      )
      .to(
        nextItems,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.52,
          stagger: 0.07
        },
        0.3
      );

    updateState(next);
  }

  function handleTab(tab) {
    if (!tab) return;
    const next = tab.dataset.tab;
    switchPanel(next);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => handleTab(tab));

    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const dir = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + dir + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
      }

      if (event.key === "Home") {
        event.preventDefault();
        tabs[0].focus();
      }

      if (event.key === "End") {
        event.preventDefault();
        tabs[tabs.length - 1].focus();
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleTab(tab);
      }
    });
  });

  if (shouldReduceMotion() || !hasGsap) {
    updateState(active, true);
    return;
  }

  const introTargets = [
    ".if-about-kicker",
    ".if-about-subtitle",
    ".if-about-controls"
  ];

  window.gsap.set(introTargets, { autoAlpha: 0, y: 16, scale: 0.985 });

  const initialNodes = panelNodes(panels[active]);
  window.gsap.set(initialNodes, { autoAlpha: 0, y: 16, scale: 0.98, filter: "blur(6px)" });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        window.gsap
          .timeline()
          .to(introTargets, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out"
          })
          .to(
            initialNodes,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.58,
              stagger: 0.08,
              ease: "power3.out"
            },
            "-=0.32"
          );

        obs.unobserve(section);
      });
    },
    { threshold: 0.28 }
  );

  observer.observe(section);

  const hoverTargets = Array.from(section.querySelectorAll(".if-about-tab, .if-about-note"));
  hoverTargets.forEach((node) => {
    node.addEventListener("mouseenter", () => {
      window.gsap.to(node, { y: -2, duration: 0.24, ease: "power2.inOut" });
    });

    node.addEventListener("mouseleave", () => {
      window.gsap.to(node, { y: 0, duration: 0.24, ease: "power2.inOut" });
    });

    node.addEventListener("focus", () => {
      window.gsap.to(node, { y: -1, duration: 0.2, ease: "power2.inOut" });
    });

    node.addEventListener("blur", () => {
      window.gsap.to(node, { y: 0, duration: 0.2, ease: "power2.inOut" });
    });
  });

  window.addEventListener("resize", () => {
    updateState(active, true);
  });

  updateState(active, true);
})();
