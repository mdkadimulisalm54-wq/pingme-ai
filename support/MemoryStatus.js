/* =========================================================
   PingMe AI — Memory Status
   ---------------------------------------------------------
   কাজ:
   1. Memory সত্যি update হলে "Memory updated" row দেখানো
   2. Row-টি সর্বশেষ user message-এর উপরে রাখা
   3. Row-তে চাপ দিলে Memory Summary / Lobby খোলা
   4. কোনো সাধারণ message-এ নিজে থেকে Memory Updated দেখানো নয়
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "pingme_ai_memory_core_v2";
  const ROW_CLASS = "pingme-memory-status-row";
  const CHECK_INTERVAL = 700;

  let lastKnownUpdatedAt = null;
  let initialized = false;
  let checkTimer = null;

  /* =========================================================
     STYLE
  ========================================================= */

  function injectStyles() {
    if (document.getElementById("pingme-memory-status-style")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "pingme-memory-status-style";

    style.textContent = `
      .${ROW_CLASS} {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        box-sizing: border-box;
        margin: 8px 0 6px;
        padding: 0 14px;
        animation: pingmeMemoryStatusIn .22s ease-out;
      }

      .pingme-memory-status-button {
        appearance: none;
        border: 0;
        outline: 0;
        background: transparent;
        padding: 4px 0;
        margin: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: inherit;
        font: inherit;
        cursor: pointer;
        text-align: left;
        -webkit-tap-highlight-color: transparent;
      }

      .pingme-memory-status-button:hover
      .pingme-memory-status-label {
        opacity: .82;
      }

      .pingme-memory-status-icon {
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 20px;
        opacity: .78;
      }

      .pingme-memory-status-icon svg {
        width: 20px;
        height: 20px;
        display: block;
      }

      .pingme-memory-status-label {
        font-size: 13px;
        line-height: 20px;
        font-weight: 500;
        letter-spacing: .01em;
        opacity: .72;
        transition: opacity .16s ease;
      }

      @keyframes pingmeMemoryStatusIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 600px) {
        .${ROW_CLASS} {
          padding-left: 10px;
          padding-right: 10px;
        }

        .pingme-memory-status-label {
          font-size: 12.5px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     MEMORY STATE
  ========================================================= */

  function readMemoryState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return null;
      }

      const data = JSON.parse(raw);

      if (!data || typeof data !== "object") {
        return null;
      }

      return data;
    } catch (error) {
      console.warn(
        "PingMe Memory Status: unable to read memory state.",
        error
      );

      return null;
    }
  }

  /* =========================================================
     USER MESSAGE FINDER
  ========================================================= */

  function findLatestUserMessage() {
    const selectors = [
      ".message-row.user",
      ".user-message",
      '[data-role="user"]',
      '[data-message-role="user"]',
      '[data-role="user-message"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);

      if (elements.length) {
        return elements[elements.length - 1];
      }
    }

    return null;
  }

  /* =========================================================
     BOOK ICON
  ========================================================= */

  function createBookIcon() {
    const wrapper = document.createElement("span");

    wrapper.className = "pingme-memory-status-icon";
    wrapper.setAttribute("aria-hidden", "true");

    wrapper.innerHTML = `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.5 5.5C5.8 4.4 8.3 4.5 11.2 6.1V19.2C8.4 17.7 5.9 17.6 3.5 18.7V5.5Z"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20.5 5.5C18.2 4.4 15.7 4.5 12.8 6.1V19.2C15.6 17.7 18.1 17.6 20.5 18.7V5.5Z"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 6.3V19.1"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    `;

    return wrapper;
  }

  /* =========================================================
     OPEN MEMORY SUMMARY
  ========================================================= */

  function openMemorySummary() {
    if (
      window.PingMeMemorySummary &&
      typeof window.PingMeMemorySummary.open === "function"
    ) {
      window.PingMeMemorySummary.open();
      return;
    }

    window.dispatchEvent(
      new CustomEvent("pingme:memory-open")
    );
  }

  /* =========================================================
     CREATE STATUS ROW
  ========================================================= */

  function createStatusRow() {
    const existing = document.querySelector(
      `.${ROW_CLASS}`
    );

    if (existing) {
      return existing;
    }

    const userMessage = findLatestUserMessage();

    if (!userMessage || !userMessage.parentNode) {
      return null;
    }

    const row = document.createElement("div");

    row.className = ROW_CLASS;
    row.setAttribute(
      "data-memory-status",
      "updated"
    );

    const button = document.createElement("button");

    button.type = "button";
    button.className = "pingme-memory-status-button";
    button.setAttribute(
      "aria-label",
      "Open Memory Summary"
    );

    button.appendChild(createBookIcon());

    const label = document.createElement("span");

    label.className = "pingme-memory-status-label";
    label.textContent = "Memory updated";

    button.appendChild(label);
    row.appendChild(button);

    button.addEventListener(
      "click",
      openMemorySummary
    );

    /*
     * সবচেয়ে গুরুত্বপূর্ণ:
     * Status row সবসময় user message-এর উপরে থাকবে।
     */
    userMessage.parentNode.insertBefore(
      row,
      userMessage
    );

    return row;
  }

  /* =========================================================
     REMOVE OLD STATUS ROW
  ========================================================= */

  function removeStatusRow() {
    const rows = document.querySelectorAll(
      `.${ROW_CLASS}`
    );

    rows.forEach((row) => {
      row.remove();
    });
  }

  /* =========================================================
     CHECK MEMORY UPDATE
  ========================================================= */

  function checkMemoryUpdate() {
    const state = readMemoryState();

    if (!state) {
      return;
    }

    const updatedAt =
      state.updatedAt || null;

    if (!updatedAt) {
      return;
    }

    /*
     * প্রথমবার load হওয়ার সময় পুরোনো Memory-এর জন্য
     * নতুন status row দেখানো হবে না।
     */
    if (!initialized) {
      lastKnownUpdatedAt = updatedAt;
      initialized = true;
      return;
    }

    /*
     * updatedAt পরিবর্তন মানে Memory system নতুন করে
     * Memory save/update করেছে।
     */
    if (
      updatedAt !== lastKnownUpdatedAt
    ) {
      lastKnownUpdatedAt = updatedAt;

      /*
       * পুরোনো status থাকলে সরিয়ে নতুনটি বসানো হবে।
       */
      removeStatusRow();

      createStatusRow();
    }
  }

  /* =========================================================
     STORAGE EVENT
  ========================================================= */

  function handleStorage(event) {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    checkMemoryUpdate();
  }

  /* =========================================================
     DOM OBSERVER
  ========================================================= */

  function observeMessages() {
    if (!document.body) {
      return;
    }

    const observer =
      new MutationObserver(() => {
        /*
         * Memory update হওয়ার মুহূর্তে user message
         * DOM-এ আসতে সামান্য সময় লাগতে পারে।
         */
        if (
          lastKnownUpdatedAt !== null &&
          !document.querySelector(
            `.${ROW_CLASS}`
          )
        ) {
          const state = readMemoryState();

          if (
            state &&
            state.updatedAt === lastKnownUpdatedAt
          ) {
            createStatusRow();
          }
        }
      });

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );
  }

  /* =========================================================
     INITIALIZE
  ========================================================= */

  function initialize() {
    if (
      document.readyState === "loading"
    ) {
      document.addEventListener(
        "DOMContentLoaded",
        initialize,
        { once: true }
      );

      return;
    }

    injectStyles();

    /*
     * প্রথমবারের পুরোনো Memory update ignore করা হবে।
     */
    checkMemoryUpdate();

    window.addEventListener(
      "storage",
      handleStorage
    );

    observeMessages();

    /*
     * একই tab-এ localStorage পরিবর্তন হলে browser
     * সাধারণত storage event দেয় না।
     *
     * তাই ছোট interval দিয়ে শুধু Memory state check
     * করা হচ্ছে। অন্য কোনো message নিজে থেকে save
     * হচ্ছে না।
     */
    checkTimer = window.setInterval(
      checkMemoryUpdate,
      CHECK_INTERVAL
    );
  }

  /* =========================================================
     PUBLIC API
  ========================================================= */

  window.PingMeMemoryStatus = {
    show: createStatusRow,
    hide: removeStatusRow,
    openSummary: openMemorySummary,
    check: checkMemoryUpdate
  };

  initialize();

})();