// PingMe AI — Memory Core
// Memory UI + Storage + Explicit Save Command Only

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

  function getLatestUserMessage() {
    const messages = getUserMessageElements();

    return messages.length
      ? messages[messages.length - 1]
      : null;
  }

  /* =========================
     COMMAND DETECTION
  ========================= */

  function looksLikeMemoryCommand(text) {
    const value = normalizeText(text).toLowerCase();

    if (!value) return false;

    const patterns = [
      /মনে রাখ/,
      /মনে রেখ/,
      /মেমোরিতে সেভ/,
      /মেমোরিতে রাখ/,
      /মেমরিতে সেভ/,
      /মেমরিতে রাখ/,
      /সেভ করে রাখ/,
      /সেভ করে রাখো/,
      /সেভ করো/,
      /সেভ রাখো/,
      /এটা মনে রাখ/,
      /এই কথাটা মনে রাখ/,
      /এই তথ্যটা মনে রাখ/,

      /remember this/,
      /remember that/,
      /save this to memory/,
      /save this/,
      /keep this in memory/,
      /store this in memory/,
      /add this to memory/
    ];

    return patterns.some(pattern => pattern.test(value));
  }

  function extractMemoryFromCommand(text) {
    let value = normalizeText(text);

    if (!value) return "";

    const commandPatterns = [
      /^মনে রাখো[\s:,-]*/i,
      /^মনে রাখিস[\s:,-]*/i,
      /^মনে রাখবে[\s:,-]*/i,
      /^মনে রেখো[\s:,-]*/i,
      /^মেমোরিতে সেভ করো[\s:,-]*/i,
      /^মেমোরিতে রাখো[\s:,-]*/i,
      /^মেমরিতে সেভ করো[\s:,-]*/i,
      /^মেমরিতে রাখো[\s:,-]*/i,
      /^সেভ করে রাখো[\s:,-]*/i,
      /^সেভ করো[\s:,-]*/i,
      /^সেভ রাখো[\s:,-]*/i,

      /^remember this[\s:,-]*/i,
      /^remember that[\s:,-]*/i,
      /^save this to memory[\s:,-]*/i,
      /^save this[\s:,-]*/i,
      /^keep this in memory[\s:,-]*/i,
      /^store this in memory[\s:,-]*/i,
      /^add this to memory[\s:,-]*/i
    ];

    for (const pattern of commandPatterns) {
      value = value.replace(pattern, "").trim();
    }

    return value;
  }

  /* =========================
     MEMORY UPDATED ROW
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

    const existing = userMessageElement.parentElement?.querySelector(
      ".pingme-memory-updated-row"
    );

    if (existing) return;

    const row = createMemoryUpdatedSystemRow();

    if (userMessageElement.parentNode) {
      userMessageElement.parentNode.insertBefore(
        row,
        userMessageElement.nextSibling
      );
    } else {
      const chatArea = document.getElementById("chatArea");

      if (chatArea) {
        chatArea.appendChild(row);
      }
    }
  }

  function emitMemoryUpdated(memory, updated, userMessageElement) {
    memoryState.updatedAt = Date.now();
    persistMemoryState();

    try {
      window.dispatchEvent(
        new CustomEvent(EVENTS.UPDATED, {
          detail: {
            memory,
            updated: !!updated
          }
        })
      );
    } catch (error) {
      console.warn(
        "PingMe Memory event failed:",
        error
      );
    }

    showMemoryUpdatedImmediately(
      userMessageElement || getLatestUserMessage()
    );
  }

  /* =========================
     INTERNAL SAVE
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

    const existingIndex = memoryState.memories.findIndex(
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
        options.source || memory.source || "user-command";

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
          options.source || "user-command"
      };

      memoryState.memories.push(memory);
    }

    memoryState.updatedAt = now;

    persistMemoryState();

    emitMemoryUpdated(
      memory,
      updated,
      options.userMessageElement
    );

    return memory;
  }

  /* =========================
     EXPLICIT COMMAND PROCESSOR
  ========================= */

  function processPossibleMemoryCommand(
    text,
    userMessageElement
  ) {
    const value = normalizeText(text);

    // IMPORTANT:
    // Ordinary messages NEVER enter Memory.
    if (!looksLikeMemoryCommand(value)) {
      return null;
    }

    const memoryText =
      extractMemoryFromCommand(value);

    // "সেভ করো" / "মনে রাখো" alone must not
    // save the command itself.
    if (!memoryText) {
      return null;
    }

    return saveMemory(memoryText, {
      source: "user-command",
      userMessageElement
    });
  }

  /* =========================
     PUBLIC MEMORY API
  ========================= */

  function pingMeRemember(text, options = {}) {
    const value = normalizeText(text);

    /*
      IMPORTANT SECURITY GUARD

      External calls such as:

      PingMeMemory.save("hello")

      can no longer automatically save
      ordinary text.

      Only an explicit memory command
      is allowed through the public save API.
    */

    if (!looksLikeMemoryCommand(value)) {
      return null;
    }

    const memoryText =
      extractMemoryFromCommand(value);

    if (!memoryText) {
      return null;
    }

    return saveMemory(memoryText, {
      ...options,
      source: options.source || "user-command"
    });
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
    memoryState.memories[index].updatedAt =
      Date.now();

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
     MEMORY SUMMARY UI
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
      return;
    }

    if (
      typeof window.openMemorySummary ===
      "function" &&
      window.openMemorySummary !==
        openMemorySummary
    ) {
      window.openMemorySummary();
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
     DOM OBSERVER
  ========================= */

  function isThinkingMessage(element) {
    if (!element) return false;

    const text = normalizeText(
      element.innerText ||
      element.textContent ||
      ""
    ).toLowerCase();

    return (
      element.classList.contains("thinking") ||
      element.classList.contains("loading") ||
      text === "thinking..." ||
      text === "thinking"
    );
  }

  function processUserMessageElement(element) {
    if (!element) return;

    if (
      element.dataset.pingmeMemoryProcessed ===
      "true"
    ) {
      return;
    }

    element.dataset.pingmeMemoryProcessed =
      "true";

    const text =
      getMessageTextFromElement(element);

    if (!text) return;

    // Never process thinking/loading rows.
    if (isThinkingMessage(element)) return;

    /*
      This is the only automatic DOM entry point.

      It first checks for an explicit memory
      command, so normal conversation is ignored.
    */
    if (!looksLikeMemoryCommand(text)) {
      return;
    }

    processPossibleMemoryCommand(
      text,
      element
    );
  }

  function startMemoryObserver() {
    if (!document.body) return;

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
              (
                element.matches(
                  "[data-role='user'], " +
                  "[data-message-role='user'], " +
                  ".user-message, " +
                  ".message-user, " +
                  ".message-row.user"
                )
              )
            ) {
              processUserMessageElement(
                element
              );
            }

            const nestedUsers =
              element.querySelectorAll
                ? element.querySelectorAll(
                    "[data-role='user'], " +
                    "[data-message-role='user'], " +
                    ".user-message, " +
                    ".message-user, " +
                    ".message-row.user"
                  )
                : [];

            nestedUsers.forEach(
              processUserMessageElement
            );
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
