// PingMe AI — Memory Core
// Explicit Memory Save + Memory Updated Row

(() => {
  "use strict";

  const STORAGE_KEY = "pingme_ai_memory_core_v2";

  const EVENTS = {
    UPDATED: "pingme:memory-updated",
    OPEN: "pingme:memory-open"
  };

  let memoryState = {
    enabled: true,
    memories: [],
    updatedAt: null
  };

  /* =========================
     STORAGE
  ========================= */

  function loadMemoryState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object") {
        memoryState = {
          enabled: parsed.enabled !== false,
          memories: Array.isArray(parsed.memories)
            ? parsed.memories
            : [],
          updatedAt: parsed.updatedAt || null
        };
      }
    } catch (error) {
      console.warn("PingMe Memory load failed:", error);
    }
  }

  function persistMemoryState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(memoryState)
      );
    } catch (error) {
      console.warn("PingMe Memory save failed:", error);
    }
  }

  /* =========================
     HELPERS
  ========================= */

  function normalizeText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getUserMessageElements() {
    return Array.from(
      document.querySelectorAll(
        "[data-role='user'], " +
        "[data-message-role='user'], " +
        ".user-message, " +
        ".message-user, " +
        ".message-row.user"
      )
    );
  }

  function getMessageTextFromElement(element) {
    if (!element) return "";

    return normalizeText(
      element.innerText ||
      element.textContent ||
      ""
    );
  }

  /* =========================
     EXPLICIT MEMORY COMMAND
  ========================= */

  function looksLikeMemoryCommand(text) {
    const value = normalizeText(text).toLowerCase();

    if (!value) return false;

    const patterns = [
      // বাংলা
      /\u09ae\u09a8\u09c7\s*\u09b0\u09be\u0996/,              // মনে রাখ
      /\u09ae\u09a8\u09c7\s*\u09b0\u09c7\u0996/,              // মনে রেখ
      /\u09ae\u09c7\u09ae\u09cb\u09b0\u09bf\u09a4\u09c7\s*\u09b8\u09c7\u09ad/, // মেমোরিতে সেভ
      /\u09ae\u09c7\u09ae\u09cb\u09b0\u09bf\u09a4\u09c7\s*\u09b0\u09be\u0996/, // মেমোরিতে রাখ
      /\u09ae\u09c7\u09ae\u09b0\u09bf\u09a4\u09c7\s*\u09b8\u09c7\u09ad/,      // মেমরিতে সেভ
      /\u09ae\u09c7\u09ae\u09b0\u09bf\u09a4\u09c7\s*\u09b0\u09be\u0996/,      // মেমরিতে রাখ
      /\u09b8\u09c7\u09ad\s*\u0995\u09b0\u09cb/,                  // সেভ করো
      /\u09b8\u09c7\u09ad\s*\u0995\u09b0\u09c7\s*\u09b0\u09be\u0996/,       // সেভ করে রাখ
      /\u09b8\u09c7\u09ad\s*\u09b0\u09be\u0996\u09cb/,             // সেভ রাখো
      /\u098f\u099f\u09be\s*\u09ae\u09a8\u09c7\s*\u09b0\u09be\u0996/,       // এটা মনে রাখ
      /\u098f\u0987\s*\u0995\u09a5\u09be\s*\u09ae\u09a8\u09c7\s*\u09b0\u09be\u0996/, // এই কথাটা মনে রাখ
      /\u098f\u0987\s*\u09a4\u09a5\u09cd\u09af\s*\u09ae\u09a8\u09c7\s*\u09b0\u09be\u0996/, // এই তথ্য মনে রাখ

      // English
      /remember\s+this/,
      /remember\s+that/,
      /save\s+this\s+to\s+memory/,
      /save\s+this/,
      /keep\s+this\s+in\s+memory/,
      /store\s+this\s+in\s+memory/,
      /add\s+this\s+to\s+memory/
    ];

    return patterns.some(pattern => pattern.test(value));
  }

  function extractMemoryFromCommand(text) {
    let value = normalizeText(text);

    if (!value) return "";

    const commandPatterns = [
      // বাংলা
      /^\u09ae\u09a8\u09c7\s*\u09b0\u09be\u0996\u09cb[\s:,-]*/i,
      /^\u09ae\u09a8\u09c7\s*\u09b0\u09be\u0996\u09bf\u09b8[\s:,-]*/i,
      /^\u09ae\u09a8\u09c7\s*\u09b0\u09be\u0996\u09ac\u09c7[\s:,-]*/i,
      /^\u09ae\u09a8\u09c7\s*\u09b0\u09c7\u0996\u09cb[\s:,-]*/i,

      /^\u09ae\u09c7\u09ae\u09cb\u09b0\u09bf\u09a4\u09c7\s*\u09b8\u09c7\u09ad\s*\u0995\u09b0\u09cb[\s:,-]*/i,
      /^\u09ae\u09c7\u09ae\u09cb\u09b0\u09bf\u09a4\u09c7\s*\u09b0\u09be\u0996\u09cb[\s:,-]*/i,
      /^\u09ae\u09c7\u09ae\u09b0\u09bf\u09a4\u09c7\s*\u09b8\u09c7\u09ad[\s:,-]*/i,
      /^\u09ae\u09c7\u09ae\u09b0\u09bf\u09a4\u09c7\s*\u09b0\u09be\u0996[\s:,-]*/i,

      /^\u09ae\u09c7\u09ae\u09b0\u09bf\u09a4\u09c7\s*\u09b8\u09c7\u09ad\s*\u0995\u09b0\u09cb[\s:,-]*/i,
      /^\u09ae\u09c7\u09ae\u09b0\u09bf\u09a4\u09c7\s*\u09b0\u09be\u0996[\s:,-]*/i,

      /^\u09b8\u09c7\u09ad\s*\u0995\u09b0\u09c7\s*\u09b0\u09be\u0996\u09cb[\s:,-]*/i,
      /^\u09b8\u09c7\u09ad\s*\u0995\u09b0\u09cb[\s:,-]*/i,
      /^\u09b8\u09c7\u09ad\s*\u09b0\u09be\u0996\u09cb[\s:,-]*/i,

      // English
      /^remember\s+this[\s:,-]*/i,
      /^remember\s+that[\s:,-]*/i,
      /^save\s+this\s+to\s+memory[\s:,-]*/i,
      /^save\s+this[\s:,-]*/i,
      /^keep\s+this\s+in\s+memory[\s:,-]*/i,
      /^store\s+this\s+in\s+memory[\s:,-]*/i,
      /^add\s+this\s+to\s+memory[\s:,-]*/i
    ];

    for (const pattern of commandPatterns) {
      value = value.replace(pattern, "").trim();
    }

    return value;
  }

  /* =========================
     MEMORY UPDATED ROW
     APPEARS ABOVE USER MESSAGE
  ========================= */

  function createMemoryUpdatedSystemRow() {
    const row = document.createElement("button");

    row.type = "button";
    row.className = "pingme-memory-updated-row";

    row.innerHTML = `
      <span class="pingme-memory-updated-icon">📖</span>
      <span class="pingme-memory-updated-text">
        Memory updated
      </span>
    `;

    row.addEventListener("click", () => {
      openMemorySummary();
    });

    return row;
  }

  function showMemoryUpdatedImmediately(userMessageElement) {
    if (!userMessageElement) return;

    const parent = userMessageElement.parentElement;

    if (parent) {
      const existing = parent.querySelector(
        ".pingme-memory-updated-row"
      );

      if (existing) return;
    }

    const row = createMemoryUpdatedSystemRow();

    if (userMessageElement.parentNode) {
      userMessageElement.parentNode.insertBefore(
        row,
        userMessageElement
      );
    }
  }

  /* =========================
     SAVE MEMORY
  ========================= */

  function saveMemory(text, options = {}) {
    const value = normalizeText(text);

    if (!memoryState.enabled) {
      return null;
    }

    if (!value) {
      return null;
    }

    const now = Date.now();

    const existingIndex =
      memoryState.memories.findIndex(
        item =>
          normalizeText(item.text).toLowerCase() ===
          value.toLowerCase()
      );

    let memory;
    let updated = false;

    if (existingIndex !== -1) {
      memory = memoryState.memories[existingIndex];

      memory.updatedAt = now;

      memory.source =
        options.source ||
        memory.source ||
        "user-command";

      updated = true;
    } else {
      memory = {
        id:
          "memory_" +
          now +
          "_" +
          Math.random()
            .toString(36)
            .slice(2, 8),

        text: value,

        createdAt: now,
        updatedAt: now,

        source:
          options.source ||
          "user-command"
      };

      memoryState.memories.push(memory);
    }

    memoryState.updatedAt = now;

    persistMemoryState();

    try {
      window.dispatchEvent(
        new CustomEvent(EVENTS.UPDATED, {
          detail: {
            memory,
            updated
          }
        })
      );
    } catch (error) {
      console.warn(
        "PingMe Memory event failed:",
        error
      );
    }

    // 📖 Memory updated user message-এর উপরে দেখাবে
    showMemoryUpdatedImmediately(
      options.userMessageElement
    );

    return memory;
  }

  /* =========================
     COMMAND PROCESSOR
  ========================= */

  function processPossibleMemoryCommand(
    text,
    userMessageElement
  ) {
    const value = normalizeText(text);

    if (!value) return null;

    // সাধারণ মেসেজ কখনো Memory-তে যাবে না
    if (!looksLikeMemoryCommand(value)) {
      return null;
    }

    const memoryText =
      extractMemoryFromCommand(value);

    // শুধু command থাকলে save করবে না
    if (!memoryText) {
      return null;
    }

    return saveMemory(memoryText, {
      source: "user-command",
      userMessageElement
    });
  }

  /* =========================
     PUBLIC API
  ========================= */

  function pingMeRemember(text, options = {}) {
    return processPossibleMemoryCommand(
      text,
      options.userMessageElement
    );
  }

  function getMemories() {
    return [...memoryState.memories];
  }

  function getMemory(id) {
    return (
      memoryState.memories.find(
        item => item.id === id
      ) || null
    );
  }

  function updateMemory(id, text) {
    const index =
      memoryState.memories.findIndex(
        item => item.id === id
      );

    if (index === -1) return null;

    const value = normalizeText(text);

    if (!value) return null;

    memoryState.memories[index].text = value;
    memoryState.memories[index].updatedAt = Date.now();
    memoryState.updatedAt = Date.now();

    persistMemoryState();

    return memoryState.memories[index];
  }

  function deleteMemory(id) {
    const index =
      memoryState.memories.findIndex(
        item => item.id === id
      );

    if (index === -1) return false;

    memoryState.memories.splice(index, 1);

    memoryState.updatedAt = Date.now();

    persistMemoryState();

    return true;
  }

  function clearMemories() {
    memoryState.memories = [];
    memoryState.updatedAt = Date.now();

    persistMemoryState();

    return true;
  }

  function isMemoryEnabled() {
    return memoryState.enabled;
  }

  function setMemoryEnabled(enabled) {
    memoryState.enabled = !!enabled;

    persistMemoryState();

    return memoryState.enabled;
  }

  /* =========================
     MEMORY SUMMARY CONNECTION
     ========================= */

  function openMemorySummary() {
    try {
      window.dispatchEvent(
        new CustomEvent(EVENTS.OPEN)
      );
    } catch (error) {
      console.warn(
        "PingMe Memory open event failed:",
        error
      );
    }

    if (
      typeof window.openPingMeMemorySummary ===
      "function"
    ) {
      window.openPingMeMemorySummary();
    }
  }

  function closeMemorySummary() {
    if (
      typeof window.closePingMeMemorySummary ===
      "function"
    ) {
      window.closePingMeMemorySummary();
    }
  }

  function refreshMemorySummary() {
    if (
      typeof window.refreshPingMeMemorySummary ===
      "function"
    ) {
      window.refreshPingMeMemorySummary();
    }

    return getMemories();
  }

  /* =========================
     USER MESSAGE PROCESSOR
  ========================= */

  function processUserMessageElement(element) {
    if (!element) return;

    if (
      element.dataset.pingmeMemoryProcessed ===
      "true"
    ) {
      return;
    }

    const text =
      getMessageTextFromElement(element);

    if (!text) return;

    // সাধারণ message হলে শুধু ignore করবে
    if (!looksLikeMemoryCommand(text)) {
      element.dataset.pingmeMemoryProcessed = "true";
      return;
    }

    // explicit command হলে save করবে
    element.dataset.pingmeMemoryProcessed = "true";

    processPossibleMemoryCommand(
      text,
      element
    );
  }

  /* =========================
     DOM OBSERVER
  ========================= */

  function startMemoryObserver() {
    if (!document.body) return;

    if (window.__pingmeMemoryObserver) {
      try {
        window.__pingmeMemoryObserver.disconnect();
      } catch (error) {}
    }

    const observer =
      new MutationObserver(mutations => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (
              node.nodeType !==
              Node.ELEMENT_NODE
            ) {
              continue;
            }

            const element = node;

            if (
              element.matches &&
              element.matches(
                "[data-role='user'], " +
                "[data-message-role='user'], " +
                ".user-message, " +
                ".message-user, " +
                ".message-row.user"
              )
            ) {
              processUserMessageElement(element);
            }

            if (element.querySelectorAll) {
              const nestedUsers =
                element.querySelectorAll(
                  "[data-role='user'], " +
                  "[data-message-role='user'], " +
                  ".user-message, " +
                  ".message-user, " +
                  ".message-row.user"
                );

              nestedUsers.forEach(
                processUserMessageElement
              );
            }
          }
        }
      });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.__pingmeMemoryObserver =
      observer;
  }

  /* =========================
     GLOBAL API
  ========================= */

  window.PingMeMemory = {
    save: pingMeRemember,
    remember: pingMeRemember,

    update: updateMemory,

    get: getMemories,
    getOne: getMemory,

    delete: deleteMemory,
    clear: clearMemories,

    enabled: isMemoryEnabled,
    setEnabled: setMemoryEnabled,

    open: openMemorySummary,
    close: closeMemorySummary,
    refresh: refreshMemorySummary,

    processCommand:
      processPossibleMemoryCommand
  };

  window.savePingMeMemory =
    pingMeRemember;

  window.rememberPingMe =
    pingMeRemember;

  window.getPingMeMemories =
    getMemories;

  window.deletePingMeMemory =
    deleteMemory;

  window.openPingMeMemory =
    openMemorySummary;

  window.closePingMeMemory =
    closeMemorySummary;

  window.isPingMeMemoryEnabled =
    isMemoryEnabled;

  window.setPingMeMemoryEnabled =
    setMemoryEnabled;

  /* =========================
     START
  ========================= */

  loadMemoryState();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startMemoryObserver,
      { once: true }
    );
  } else {
    startMemoryObserver();
  }

})();