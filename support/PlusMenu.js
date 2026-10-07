/* =========================================================
   PingMe AI — Plus Menu
   ---------------------------------------------------------
   + Button → Premium Attachment / Tools Menu
   Options:
   1. Photos
   2. Files
   3. Documents
   4. Plugins
   5. Think harder

   Everything lives in this single support file.
   ========================================================= */

(() => {
  "use strict";

  const MENU_ID = "pingme-plus-menu";
  const STYLE_ID = "pingme-plus-menu-style";

  let menu = null;
  let outsideHandler = null;

  /* =========================================================
     SVG ICONS
  ========================================================= */

  const ICONS = {
    photos: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="4.5" width="17" height="15"
          rx="2.5"></rect>
        <circle cx="8.5" cy="9" r="1.5"></circle>
        <path d="M4.5 17l4.5-4.5 3.2 3.1 2.2-2.2 5.1 4.1"></path>
      </svg>
    `,

    files: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 3.8h9l5 5v11.4H5z"></path>
        <path d="M14 3.8v5h5"></path>
        <path d="M8 13h8"></path>
        <path d="M8 16.5h6"></path>
      </svg>
    `,

    documents: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.8h8.5L19 8.3v12H6z"></path>
        <path d="M14.5 3.8v4.5H19"></path>
        <path d="M9 12h6"></path>
        <path d="M9 15.5h6"></path>
        <path d="M9 9h2.5"></path>
      </svg>
    `,

    plugins: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.2 3.8a3.2 3.2 0 0 0 0 6.4H9v3.2H6.8a3.2 3.2 0 1 0 0 6.4A3.2 3.2 0 0 0 10 16.6v-.8h4v.8a3.2 3.2 0 1 0 6.4 0 3.2 3.2 0 0 0-6.4 0v.8h-4v-4h.8a3.2 3.2 0 1 0 0-6.4z"></path>
      </svg>
    `,

    think: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18h6"></path>
        <path d="M10 21h4"></path>
        <path d="M8.2 14.8A6.2 6.2 0 1 1 16 15c-.9.8-1.5 1.7-1.7 3H9.7c-.2-1.3-.6-2.2-1.5-3.2z"></path>
        <path d="M12 6.5v4"></path>
        <path d="M9.9 8.5l2.1 2 2.1-2"></path>
      </svg>
    `,

    close: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12"></path>
        <path d="M18 6L6 18"></path>
      </svg>
    `
  };

  /* =========================================================
     MENU DATA
  ========================================================= */

  const ITEMS = [
    {
      id: "photos",
      title: "Photos",
      subtitle: "Add photos",
      icon: ICONS.photos
    },
    {
      id: "files",
      title: "Files",
      subtitle: "Add files",
      icon: ICONS.files
    },
    {
      id: "documents",
      title: "Documents",
      subtitle: "Add documents",
      icon: ICONS.documents
    },
    {
      id: "plugins",
      title: "Plugins",
      subtitle: "Use connected tools",
      icon: ICONS.plugins
    },
    {
      id: "think",
      title: "Think harder",
      subtitle: "Use deeper reasoning",
      icon: ICONS.think
    }
  ];

  /* =========================================================
     STYLES
  ========================================================= */

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");

    style.id = STYLE_ID;

    style.textContent = `
      #${MENU_ID} {
        position: fixed;
        z-index: 999990;
        width: min(330px, calc(100vw - 24px));
        padding: 9px;
        background: rgba(255,255,255,.98);
        border: 1px solid rgba(0,0,0,.07);
        border-radius: 20px;
        box-shadow:
          0 20px 55px rgba(0,0,0,.16),
          0 4px 14px rgba(0,0,0,.07);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);

        opacity: 0;
        transform:
          translateY(8px)
          scale(.97);
        transform-origin: bottom left;
        pointer-events: none;

        transition:
          opacity .18s ease,
          transform .18s cubic-bezier(.2,.8,.2,1);
      }

      #${MENU_ID}.open {
        opacity: 1;
        transform:
          translateY(0)
          scale(1);
        pointer-events: auto;
      }

      .pingme-plus-menu-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .pingme-plus-item {
        width: 100%;
        min-height: 58px;
        border: 0;
        border-radius: 15px;
        padding: 7px 9px;
        background: transparent;
        color: #161616;

        display: flex;
        align-items: center;
        gap: 12px;

        cursor: pointer;
        text-align: left;
        font: inherit;

        -webkit-tap-highlight-color: transparent;

        transition:
          background .14s ease,
          transform .12s ease;
      }

      .pingme-plus-item:hover {
        background: #f5f7fa;
      }

      .pingme-plus-item:active {
        background: #edf0f4;
        transform: scale(.985);
      }

      .pingme-plus-icon {
        width: 42px;
        height: 42px;
        min-width: 42px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 13px;
        background: #f2f4f7;
        color: #181818;
      }

      .pingme-plus-icon svg {
        width: 22px;
        height: 22px;

        fill: none;
        stroke: currentColor;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .pingme-plus-content {
        min-width: 0;
        flex: 1;
      }

      .pingme-plus-title {
        font-size: 14.5px;
        line-height: 20px;
        font-weight: 650;
        letter-spacing: -.05px;
      }

      .pingme-plus-subtitle {
        margin-top: 1px;
        font-size: 11.5px;
        line-height: 17px;
        color: #858585;
      }

      .pingme-plus-close {
        display: none;
      }

      @media (max-width: 600px) {
        #${MENU_ID} {
          width: calc(100vw - 22px);
          padding: 8px;
          border-radius: 19px;
        }

        .pingme-plus-item {
          min-height: 56px;
        }

        .pingme-plus-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${MENU_ID},
        .pingme-plus-item {
          transition: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     FIND PLUS BUTTON
  ========================================================= */

  function findPlusButton() {
    const selectors = [
      "#plusButton",
      '[data-action="plus"]',
      '[aria-label="Plus"]',
      '[aria-label="Add"]',
      ".plus-button",
      ".plusButton"
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);

      if (element) return element;
    }

    return null;
  }

  /* =========================================================
     BUILD MENU
  ========================================================= */

  function createMenu() {
    if (menu) return menu;

    injectStyles();

    menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Add options");

    const list = document.createElement("div");
    list.className = "pingme-plus-menu-list";

    ITEMS.forEach((item) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "pingme-plus-item";
      button.setAttribute("role", "menuitem");
      button.dataset.plusAction = item.id;

      button.innerHTML = `
        <span class="pingme-plus-icon">
          ${item.icon}
        </span>

        <span class="pingme-plus-content">
          <span class="pingme-plus-title">
            ${item.title}
          </span>

          <span class="pingme-plus-subtitle">
            ${item.subtitle}
          </span>
        </span>
      `;

      button.addEventListener("click", () => {
        handleAction(item.id);
      });

      list.appendChild(button);
    });

    menu.appendChild(list);
    document.body.appendChild(menu);

    return menu;
  }

  /* =========================================================
     POSITION MENU
  ========================================================= */

  function positionMenu(button) {
    if (!menu || !button) return;

    const rect = button.getBoundingClientRect();

    const menuWidth = Math.min(
      330,
      window.innerWidth - 24
    );

    const gap = 9;

    let left = rect.left;
    let bottom = window.innerHeight - rect.top + gap;

    if (
      left + menuWidth >
      window.innerWidth - 12
    ) {
      left =
        window.innerWidth -
        menuWidth -
        12;
    }

    if (left < 12) {
      left = 12;
    }

    menu.style.width = `${menuWidth}px`;
    menu.style.left = `${left}px`;
    menu.style.bottom = `${bottom}px`;
    menu.style.top = "auto";
  }

  /* =========================================================
     OPEN
  ========================================================= */

  function openMenu() {
    const button = findPlusButton();

    if (!button) {
      console.warn(
        "PingMe Plus Menu: #plusButton not found."
      );
      return;
    }

    const panel = createMenu();

    positionMenu(button);

    requestAnimationFrame(() => {
      panel.classList.add("open");
    });

    button.setAttribute(
      "aria-expanded",
      "true"
    );

    outsideHandler = (event) => {
      if (
        panel.contains(event.target) ||
        button.contains(event.target)
      ) {
        return;
      }

      closeMenu();
    };

    setTimeout(() => {
      document.addEventListener(
        "pointerdown",
        outsideHandler
      );
    }, 0);
  }

  /* =========================================================
     CLOSE
  ========================================================= */

  function closeMenu() {
    if (!menu) return;

    menu.classList.remove("open");

    const button = findPlusButton();

    if (button) {
      button.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    if (outsideHandler) {
      document.removeEventListener(
        "pointerdown",
        outsideHandler
      );

      outsideHandler = null;
    }
  }

  /* =========================================================
     ACTIONS
  ========================================================= */

  function handleAction(action) {
    closeMenu();

    switch (action) {

      case "photos":
        openPhotos();
        break;

      case "files":
        openFiles();
        break;

      case "documents":
        openDocuments();
        break;

      case "plugins":
        openPlugins();
        break;

      case "think":
        enableThinkHarder();
        break;

      default:
        break;
    }
  }

  /* =========================================================
     PHOTOS
  ========================================================= */

  function openPhotos() {
    const input = getFileInput(
      "pingme-photo-input",
      "image/*",
      true
    );

    input.click();
  }

  /* =========================================================
     FILES
  ========================================================= */

  function openFiles() {
    const input = getFileInput(
      "pingme-file-input",
      "*/*",
      true
    );

    input.click();
  }

  /* =========================================================
     DOCUMENTS
  ========================================================= */

  function openDocuments() {
    const input = getFileInput(
      "pingme-document-input",
      ".pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.ppt,.pptx",
      true
    );

    input.click();
  }

  /* =========================================================
     HIDDEN FILE INPUT
  ========================================================= */

  function getFileInput(
    id,
    accept,
    multiple
  ) {
    let input =
      document.getElementById(id);

    if (input) return input;

    input = document.createElement("input");

    input.type = "file";
    input.id = id;
    input.accept = accept;
    input.multiple = multiple;

    input.style.display = "none";

    input.addEventListener(
      "change",
      () => {
        const files =
          Array.from(input.files || []);

        if (!files.length) return;

        window.dispatchEvent(
          new CustomEvent(
            "pingme:plus-files-selected",
            {
              detail: {
                type: id,
                files
              }
            }
          )
        );

        /*
         * Existing file/image support can listen
         * to this event without modifying this menu.
         */
      }
    );

    document.body.appendChild(input);

    return input;
  }

  /* =========================================================
     PLUGINS
  ========================================================= */

  function openPlugins() {
    window.dispatchEvent(
      new CustomEvent(
        "pingme:plus-plugins"
      )
    );

    if (
      window.PingMePlugins &&
      typeof window.PingMePlugins.open === "function"
    ) {
      window.PingMePlugins.open();
    }
  }

  /* =========================================================
     THINK HARDER
  ========================================================= */

  function enableThinkHarder() {
    window.dispatchEvent(
      new CustomEvent(
        "pingme:think-harder",
        {
          detail: {
            enabled: true
          }
        }
      )
    );

    /*
     * If the existing model/AI system supports a
     * thinking mode, it can listen to this event.
     */
    localStorage.setItem(
      "pingme_think_harder",
      "true"
    );
  }

  /* =========================================================
     BUTTON EVENTS
  ========================================================= */

  function setupButton() {
    const button = findPlusButton();

    if (!button) {
      setTimeout(setupButton, 500);
      return;
    }

    button.setAttribute(
      "aria-haspopup",
      "menu"
    );

    button.setAttribute(
      "aria-expanded",
      "false"
    );

    if (button.dataset.pingmePlusReady === "true") {
      return;
    }

    button.dataset.pingmePlusReady = "true";

    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (
          menu &&
          menu.classList.contains("open")
        ) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    );
  }

  /* =========================================================
     RESIZE / SCROLL
  ========================================================= */

  function handleViewportChange() {
    if (
      menu &&
      menu.classList.contains("open")
    ) {
      const button = findPlusButton();

      if (button) {
        positionMenu(button);
      }
    }
  }

  /* =========================================================
     INITIALIZE
  ========================================================= */

  function initialize() {
    injectStyles();
    createMenu();
    setupButton();

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );
  }

  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.PingMePlusMenu = {
    open: openMenu,
    close: closeMenu,
    toggle: () => {
      if (
        menu &&
        menu.classList.contains("open")
      ) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  };

  initialize();

})();