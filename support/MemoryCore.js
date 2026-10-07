// PingMe AI — Memory Summary
// Complete Memory Summary / Lobby
// Professional UI — No Emoji / No External Library

(() => {
  "use strict";

  const STORAGE_KEY = "pingme_ai_memory_core_v2";
  const ROW_SELECTOR = ".pingme-memory-updated-row";

  let overlay = null;
  let menu = null;

  /* =========================================================
     ICONS — CLEAN VECTOR STYLE
  ========================================================= */

  const ICONS = {
    back: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
      </svg>
    `,

    more: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
        <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"></circle>
      </svg>
    `,

    book: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 5.5C5.8 4.4 8.3 4.5 11.2 6.1V19.2C8.4 17.7 5.9 17.6 3.5 18.7V5.5Z"></path>
        <path d="M20.5 5.5C18.2 4.4 15.7 4.5 12.8 6.1V19.2C15.6 17.7 18.1 17.6 20.5 18.7V5.5Z"></path>
        <path d="M12 6.2V19.1"></path>
      </svg>
    `,

    refresh: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 11a8 8 0 0 0-14.7-4L3 10"></path>
        <path d="M3 4v6h6"></path>
        <path d="M4 13a8 8 0 0 0 14.7 4L21 14"></path>
        <path d="M21 20v-6h-6"></path>
      </svg>
    `,

    trash: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M6 7l1 13h10l1-13"></path>
        <path d="M9 7V4h6v3"></path>
      </svg>
    `,

    clock: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5"></circle>
        <path d="M12 7v5l3 2"></path>
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
     STYLE
  ========================================================= */

  const STYLE_ID = "pingme-memory-summary-style";

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      .pingme-memory-summary-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #ffffff;
        color: #111111;
        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          Helvetica,
          Arial,
          sans-serif;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .pingme-memory-summary-header {
        height: 88px;
        min-height: 88px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 18px;
        border-bottom: 1px solid #eeeeee;
        background: rgba(255,255,255,.97);
      }

      .pingme-memory-summary-header-side {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pingme-memory-summary-title-wrap {
        flex: 1;
        text-align: center;
        min-width: 0;
      }

      .pingme-memory-summary-title {
        font-size: 21px;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -0.3px;
      }

      .pingme-memory-summary-updated {
        margin-top: 5px;
        font-size: 14px;
        color: #777777;
      }

      .pingme-memory-summary-icon-btn {
        width: 48px;
        height: 48px;
        border: 0;
        border-radius: 50%;
        background: #f5f5f5;
        color: #111111;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .pingme-memory-summary-icon-btn:active {
        transform: scale(.96);
        background: #ebebeb;
      }

      .pingme-memory-summary-icon-btn svg {
        width: 25px;
        height: 25px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .pingme-memory-summary-body {
        flex: 1;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 30px 24px 110px;
      }

      .pingme-memory-summary-intro {
        max-width: 760px;
        margin: 0 auto 28px;
      }

      .pingme-memory-summary-section-title {
        margin: 0 0 10px;
        font-size: 24px;
        font-weight: 750;
        letter-spacing: -0.4px;
      }

      .pingme-memory-summary-section-text {
        margin: 0;
        color: #555555;
        font-size: 15px;
        line-height: 1.65;
      }

      .pingme-memory-summary-list {
        max-width: 760px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .pingme-memory-card {
        border: 1px solid #e8e8e8;
        border-radius: 18px;
        padding: 17px 18px;
        background: #ffffff;
        box-shadow: 0 1px 3px rgba(0,0,0,.04);
      }

      .pingme-memory-card-top {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .pingme-memory-card-icon {
        width: 36px;
        height: 36px;
        min-width: 36px;
        border-radius: 10px;
        background: #f3f3f3;
        color: #222222;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pingme-memory-card-icon svg {
        width: 21px;
        height: 21px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .pingme-memory-card-text {
        flex: 1;
        min-width: 0;
        font-size: 16px;
        line-height: 1.55;
        color: #171717;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .pingme-memory-card-time {
        margin-top: 12px;
        padding-left: 48px;
        display: flex;
        align-items: center;
        gap: 6px;
        color: #8a8a8a;
        font-size: 12px;
      }

      .pingme-memory-card-time svg {
        width: 14px;
        height: 14px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .pingme-memory-empty {
        max-width: 500px;
        margin: 70px auto 0;
        text-align: center;
        color: #777777;
      }

      .pingme-memory-empty-icon {
        width: 62px;
        height: 62px;
        margin: 0 auto 16px;
        border-radius: 18px;
        background: #f4f4f4;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333333;
      }

      .pingme-memory-empty-icon svg {
        width: 32px;
        height: 32px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .pingme-memory-empty-title {
        font-size: 18px;
        font-weight: 650;
        color: #222222;
        margin-bottom: 7px;
      }

      .pingme-memory-empty-text {
        font-size: 14px;
        line-height: 1.5;
      }

      .pingme-memory-menu {
        position: fixed;
        z-index: 1000001;
        top: 72px;
        right: 16px;
        width: 190px;
        padding: 7px;
        background: #ffffff;
        border: 1px solid #e7e7e7;
        border-radius: 15px;
        box-shadow:
          0 12px 35px rgba(0,0,0,.14),
          0 2px 8px rgba(0,0,0,.06);
      }

      .pingme-memory-menu[hidden] {
        display: none;
      }

      .pingme-memory-menu-item {
        width: 100%;
        min-height: 45px;
        border: 0;
        background: transparent;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 0 12px;
        color: #171717;
        font-size: 14px;
        text-align: left;
        cursor: pointer;
      }

      .pingme-memory-menu-item:hover {
        background: #f5f5f5;
      }

      .pingme-memory-menu-item:active {
        background: #ededed;
      }

      .pingme-memory-menu-item svg {
        width: 19px;
        height: 19px;
        flex: 0 0 19px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .pingme-memory-menu-item.delete {
        color: #b42318;
      }

      @media (max-width: 600px) {
        .pingme-memory-summary-header {
          height: 82px;
          min-height: 82px;
          padding: 10px 12px;
        }

        .pingme-memory-summary-header-side {
          width: 46px;
          height: 46px;
        }

        .pingme-memory-summary-icon-btn {
          width: 46px;
          height: 46px;
        }

        .pingme-memory-summary-title {
          font-size: 20px;
        }

        .pingme-memory-summary-body {
          padding: 25px 18px 100px;
        }

        .pingme-memory-summary-section-title {
          font-size: 22px;
        }

        .pingme-memory-card {
          border-radius: 16px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     STORAGE
  ========================================================= */

  function readMemoryState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return {
          enabled: true,
          memories: [],
          updatedAt: null
        };
      }

      const parsed = JSON.parse(raw);

      return {
        enabled: parsed?.enabled !== false,
        memories: Array.isArray(parsed?.memories)
          ? parsed.memories
          : [],
        updatedAt: parsed?.updatedAt || null
      };
    } catch (error) {
      console.warn("PingMe Memory Summary load failed:", error);

      return {
        enabled: true,
        memories: [],
        updatedAt: null
      };
    }
  }

  function writeMemoryState(state) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );
      return true;
    } catch (error) {
      console.warn("PingMe Memory Summary save failed:", error);
      return false;
    }
  }

  /* =========================================================
     DATE / TIME
  ========================================================= */

  function formatDate(value) {
    if (!value) return "Updated just now";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Updated just now";
    }

    const now = new Date();

    const sameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (sameDay) {
      return `Updated today at ${date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      })}`;
    }

    return `Updated ${date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric"
    })}`;
  }

  function formatMemoryTime(value) {
    if (!value) return "Saved recently";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Saved recently";
    }

    return `Saved ${date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric"
    })} at ${date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    })}`;
  }

  /* =========================================================
     SAFE TEXT
  ========================================================= */

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =========================================================
     BUILD SCREEN
  ========================================================= */

  function createOverlay() {
    injectStyles();

    overlay = document.createElement("div");

    overlay.className = "pingme-memory-summary-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Memory summary");

    overlay.innerHTML = `
      <header class="pingme-memory-summary-header">

        <div class="pingme-memory-summary-header-side">
          <button
            type="button"
            class="pingme-memory-summary-icon-btn"
            data-memory-action="back"
            aria-label="Back"
          >
            ${ICONS.back}
          </button>
        </div>

        <div class="pingme-memory-summary-title-wrap">
          <div class="pingme-memory-summary-title">
            Memory summary
          </div>

          <div
            class="pingme-memory-summary-updated"
            data-memory-updated
          >
            Updated just now
          </div>
        </div>

        <div class="pingme-memory-summary-header-side">
          <button
            type="button"
            class="pingme-memory-summary-icon-btn"
            data-memory-action="menu"
            aria-label="Memory options"
            aria-expanded="false"
          >
            ${ICONS.more}
          </button>
        </div>

      </header>

      <main class="pingme-memory-summary-body">
        <section class="pingme-memory-summary-intro">
          <h1 class="pingme-memory-summary-section-title">
            Saved memories
          </h1>

          <p class="pingme-memory-summary-section-text">
            These are the memories PingMe has saved from your explicit
            memory requests.
          </p>
        </section>

        <section
          class="pingme-memory-summary-list"
          data-memory-list
        ></section>
      </main>
    `;

    document.body.appendChild(overlay);

    renderMemories();
  }

  /* =========================================================
     RENDER MEMORIES
  ========================================================= */

  function renderMemories() {
    if (!overlay) return;

    const state = readMemoryState();

    const updated = overlay.querySelector(
      "[data-memory-updated]"
    );

    const list = overlay.querySelector(
      "[data-memory-list]"
    );

    if (updated) {
      updated.textContent = formatDate(state.updatedAt);
    }

    if (!list) return;

    const memories = [...state.memories].reverse();

    if (!memories.length) {
      list.innerHTML = `
        <div class="pingme-memory-empty">

          <div class="pingme-memory-empty-icon">
            ${ICONS.book}
          </div>

          <div class="pingme-memory-empty-title">
            No saved memories
          </div>

          <div class="pingme-memory-empty-text">
            When you explicitly ask PingMe to remember something,
            it will appear here.
          </div>

        </div>
      `;

      return;
    }

    list.innerHTML = memories.map((memory) => {
      const text =
        typeof memory === "string"
          ? memory
          : memory?.text || memory?.content || "";

      const time =
        typeof memory === "string"
          ? null
          : memory?.savedAt ||
            memory?.createdAt ||
            memory?.updatedAt ||
            null;

      return `
        <article class="pingme-memory-card">

          <div class="pingme-memory-card-top">

            <div class="pingme-memory-card-icon">
              ${ICONS.book}
            </div>

            <div class="pingme-memory-card-text">
              ${escapeHTML(text)}
            </div>

          </div>

          <div class="pingme-memory-card-time">
            ${ICONS.clock}
            <span>${escapeHTML(formatMemoryTime(time))}</span>
          </div>

        </article>
      `;
    }).join("");
  }

  /* =========================================================
     MENU
  ========================================================= */

  function closeMenu() {
    if (!menu) return;

    menu.remove();
    menu = null;

    const button = overlay?.querySelector(
      '[data-memory-action="menu"]'
    );

    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
  }

  function openMenu() {
    if (!overlay) return;

    if (menu) {
      closeMenu();
      return;
    }

    const button = overlay.querySelector(
      '[data-memory-action="menu"]'
    );

    if (button) {
      button.setAttribute("aria-expanded", "true");
    }

    menu = document.createElement("div");

    menu.className = "pingme-memory-menu";

    menu.innerHTML = `
      <button
        type="button"
        class="pingme-memory-menu-item"
        data-menu-action="refresh"
      >
        ${ICONS.refresh}
        <span>Refresh</span>
      </button>

      <button
        type="button"
        class="pingme-memory-menu-item delete"
        data-menu-action="delete"
      >
        ${ICONS.trash}
        <span>Delete</span>
      </button>
    `;

    document.body.appendChild(menu);

    menu.addEventListener("click", handleMenuClick);
  }

  /* =========================================================
     REFRESH
  ========================================================= */

  function refreshSummary() {
    closeMenu();
    renderMemories();
  }

  /* =========================================================
     DELETE
  ========================================================= */

  function deleteAllMemories() {
    closeMenu();

    const state = readMemoryState();

    if (!state.memories.length) {
      renderMemories();
      return;
    }

    const confirmed = window.confirm(
      "Delete all saved memories from PingMe?"
    );

    if (!confirmed) return;

    state.memories = [];
    state.updatedAt = null;

    writeMemoryState(state);

    renderMemories();

    window.dispatchEvent(
      new CustomEvent("pingme:memory-deleted", {
        detail: {
          deletedAll: true
        }
      })
    );
  }

  /* =========================================================
     MENU EVENTS
  ========================================================= */

  function handleMenuClick(event) {
    const actionButton =
      event.target.closest("[data-menu-action]");

    if (!actionButton) return;

    const action =
      actionButton.getAttribute("data-menu-action");

    if (action === "refresh") {
      refreshSummary();
      return;
    }

    if (action === "delete") {
      deleteAllMemories();
    }
  }

  /* =========================================================
     BACK
  ========================================================= */

  function closeSummary() {
    closeMenu();

    if (overlay) {
      overlay.remove();
      overlay = null;
    }

    document.body.style.overflow = "";

    window.dispatchEvent(
      new CustomEvent("pingme:memory-summary-closed")
    );
  }

  /* =========================================================
     SCREEN EVENTS
  ========================================================= */

  function handleOverlayClick(event) {
    const actionButton =
      event.target.closest("[data-memory-action]");

    if (!actionButton) return;

    const action =
      actionButton.getAttribute("data-memory-action");

    if (action === "back") {
      closeSummary();
      return;
    }

    if (action === "menu") {
      openMenu();
    }
  }

  /* =========================================================
     MEMORY UPDATED ROW
     Clicking the existing Memory Updated row opens summary.
  ========================================================= */

  function handleMemoryRowClick(event) {
    const row =
      event.target.closest(ROW_SELECTOR);

    if (!row) return;

    openSummary();
  }

  /* =========================================================
     OPEN SUMMARY
  ========================================================= */

  function openSummary() {
    if (overlay) {
      renderMemories();
      return;
    }

    createOverlay();

    document.body.style.overflow = "hidden";

    window.dispatchEvent(
      new CustomEvent("pingme:memory-summary-opened")
    );
  }

  /* =========================================================
     KEYBOARD
  ========================================================= */

  function handleKeydown(event) {
    if (!overlay) return;

    if (event.key === "Escape") {
      if (menu) {
        closeMenu();
      } else {
        closeSummary();
      }
    }
  }

  /* =========================================================
     INITIALIZE
  ========================================================= */

  function initialize() {
    document.addEventListener(
      "click",
      handleMemoryRowClick
    );

    document.addEventListener(
      "keydown",
      handleKeydown
    );

    document.addEventListener(
      "click",
      (event) => {
        if (!menu) return;

        const clickedInsideMenu =
          event.target.closest(".pingme-memory-menu");

        const clickedMenuButton =
          event.target.closest(
            '[data-memory-action="menu"]'
          );

        if (!clickedInsideMenu && !clickedMenuButton) {
          closeMenu();
        }
      }
    );

    window.addEventListener(
      "pingme:memory-open",
      openSummary
    );
  }

  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.PingMeMemorySummary = {
    open: openSummary,
    close: closeSummary,
    refresh: refreshSummary,
    render: renderMemories
  };

  initialize();

})();
