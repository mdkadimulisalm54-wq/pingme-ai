// PingMe AI — MemoryCore
// ============================================================
// Complete Memory System
//
// DESIGN:
// - Memory updated is a separate system row.
// - It appears ABOVE the related AI message.
// - It is NOT appended inside the AI message.
// - Clicking it opens Memory Summary.
// - Memory Summary shows exactly what was saved.
// - All Memory logic lives in this file.
//
// HTML only needs to load this Support file.
// ============================================================

(function () {

    "use strict";

    // ========================================================
    // CONFIG
    // ========================================================

    const STORAGE_KEY =
        "pingme_ai_memory_core_v2";

    const MEMORY_EVENT =
        "pingme:memory-updated";

    const MEMORY_OPEN_EVENT =
        "pingme:memory-open";

    const MEMORY_MAX_ITEMS = 500;

    let memoryState = {
        enabled: true,
        memories: [],
        updatedAt: null
    };

    let memoryOverlay = null;
    let memoryPanel = null;
    let aboutMenu = null;
    let isInitialized = false;

    // Memory waiting for the next AI message.
    let pendingMemoryForAssistant = null;


    // ========================================================
    // ID
    // ========================================================

    function createMemoryId() {

        return (
            "mem_" +
            Date.now().toString(36) +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );
    }


    // ========================================================
    // DATE
    // ========================================================

    function getNowISO() {

        return new Date().toISOString();
    }


    // ========================================================
    // HTML ESCAPE
    // ========================================================

    function escapeHTML(value) {

        return String(
            value == null ? "" : value
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ========================================================
    // NORMALIZE TEXT
    // ========================================================

    function normalizeMemoryText(text) {

        return String(text || "")
            .replace(/\s+/g, " ")
            .trim();
    }


    // ========================================================
    // LOAD STATE
    // ========================================================

    function loadMemoryState() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {

                memoryState = {
                    enabled: true,
                    memories: [],
                    updatedAt: null
                };

                return memoryState;
            }

            const parsed =
                JSON.parse(raw);

            memoryState = {

                enabled:
                    parsed &&
                    typeof parsed.enabled ===
                        "boolean"
                        ? parsed.enabled
                        : true,

                memories:
                    parsed &&
                    Array.isArray(
                        parsed.memories
                    )
                        ? parsed.memories
                        : [],

                updatedAt:
                    parsed &&
                    parsed.updatedAt
                        ? parsed.updatedAt
                        : null
            };

            return memoryState;

        } catch (error) {

            console.error(
                "PingMe AI — Memory load error:",
                error
            );

            memoryState = {
                enabled: true,
                memories: [],
                updatedAt: null
            };

            return memoryState;
        }
    }


    // ========================================================
    // SAVE STATE
    // ========================================================

    function persistMemoryState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    memoryState
                )
            );

            return true;

        } catch (error) {

            console.error(
                "PingMe AI — Memory save error:",
                error
            );

            return false;
        }
    }


    // ========================================================
    // FIND DUPLICATE
    // ========================================================

    function findExistingMemory(text) {

        const normalized =
            normalizeMemoryText(
                text
            ).toLowerCase();

        return (
            memoryState.memories.find(
                function (memory) {

                    return (
                        normalizeMemoryText(
                            memory.text
                        ).toLowerCase() ===
                        normalized
                    );
                }
            ) || null
        );
    }


    // ========================================================
    // SAVE MEMORY
    // ========================================================

    function saveMemory(
        text,
        options
    ) {

        options = options || {};

        if (!memoryState.enabled) {

            return {
                success: false,
                reason: "memory-disabled",
                memory: null
            };
        }

        const cleanText =
            normalizeMemoryText(
                text
            );

        if (!cleanText) {

            return {
                success: false,
                reason: "empty-memory",
                memory: null
            };
        }

        const existing =
            findExistingMemory(
                cleanText
            );

        // ----------------------------------------------------
        // UPDATE EXISTING MEMORY
        // ----------------------------------------------------

        if (existing) {

            existing.updatedAt =
                getNowISO();

            if (options.source) {
                existing.source =
                    options.source;
            }

            memoryState.updatedAt =
                existing.updatedAt;

            persistMemoryState();

            emitMemoryUpdated(
                existing,
                true
            );

            return {
                success: true,
                updated: true,
                memory: existing
            };
        }


        // ----------------------------------------------------
        // CREATE NEW MEMORY
        // ----------------------------------------------------

        const now =
            getNowISO();

        const memory = {

            id:
                createMemoryId(),

            text:
                cleanText,

            createdAt:
                now,

            updatedAt:
                now,

            source:
                options.source ||
                "user",

            category:
                options.category ||
                "general",

            pinned:
                Boolean(
                    options.pinned
                )
        };


        memoryState.memories.unshift(
            memory
        );


        if (
            memoryState.memories.length >
            MEMORY_MAX_ITEMS
        ) {

            memoryState.memories =
                memoryState.memories.slice(
                    0,
                    MEMORY_MAX_ITEMS
                );
        }


        memoryState.updatedAt =
            now;


        persistMemoryState();


        emitMemoryUpdated(
            memory,
            false
        );


        return {
            success: true,
            updated: false,
            memory: memory
        };
    }


    // ========================================================
    // UPDATE MEMORY
    // ========================================================

    function updateMemory(
        id,
        text
    ) {

        if (!memoryState.enabled) {

            return {
                success: false,
                reason: "memory-disabled"
            };
        }

        const memory =
            memoryState.memories.find(
                function (item) {

                    return item.id === id;
                }
            );

        if (!memory) {

            return {
                success: false,
                reason: "memory-not-found"
            };
        }

        const cleanText =
            normalizeMemoryText(
                text
            );

        if (!cleanText) {

            return {
                success: false,
                reason: "empty-memory"
            };
        }

        memory.text =
            cleanText;

        memory.updatedAt =
            getNowISO();

        memoryState.updatedAt =
            memory.updatedAt;

        persistMemoryState();

        emitMemoryUpdated(
            memory,
            true
        );

        return {
            success: true,
            memory: memory
        };
    }


    // ========================================================
    // GET MEMORIES
    // ========================================================

    function getMemories() {

        return memoryState.memories.map(
            function (memory) {

                return Object.assign(
                    {},
                    memory
                );
            }
        );
    }


    // ========================================================
    // GET ONE MEMORY
    // ========================================================

    function getMemory(id) {

        return (
            memoryState.memories.find(
                function (memory) {

                    return memory.id === id;
                }
            ) || null
        );
    }


    // ========================================================
    // DELETE MEMORY
    // ========================================================

    function deleteMemory(id) {

        const before =
            memoryState.memories.length;

        memoryState.memories =
            memoryState.memories.filter(
                function (memory) {

                    return memory.id !== id;
                }
            );

        const deleted =
            before !==
            memoryState.memories.length;

        if (deleted) {

            memoryState.updatedAt =
                getNowISO();

            persistMemoryState();
        }

        renderMemorySummary();

        return deleted;
    }


    // ========================================================
    // CLEAR ALL
    // ========================================================

    function clearAllMemories() {

        memoryState.memories = [];

        memoryState.updatedAt =
            getNowISO();

        persistMemoryState();

        renderMemorySummary();

        return true;
    }


    // ========================================================
    // ENABLE / DISABLE
    // ========================================================

    function setMemoryEnabled(
        enabled
    ) {

        memoryState.enabled =
            Boolean(enabled);

        memoryState.updatedAt =
            getNowISO();

        persistMemoryState();

        renderMemorySummary();

        return memoryState.enabled;
    }


    function isMemoryEnabled() {

        return Boolean(
            memoryState.enabled
        );
    }


    // ========================================================
    // BOOK ICON
    // ========================================================

    function getMemoryBookIcon() {

        return `
            <span
                class="pingme-memory-book-icon"
                aria-hidden="true"
            >

                <svg
                    viewBox="0 0 32 32"
                    width="19"
                    height="19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >

                    <path
                        d="
                            M5.5 7
                            C8.6 5.8 11.9 6.2 15.5 8.5
                            V25
                            C11.9 23.1 8.5 22.6 5.5 23.7
                            Z
                        "
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linejoin="round"
                    />

                    <path
                        d="
                            M26.5 7
                            C23.4 5.8 20.1 6.2 16.5 8.5
                            V25
                            C20.1 23.1 23.5 22.6 26.5 23.7
                            Z
                        "
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linejoin="round"
                    />

                    <path
                        d="
                            M15.5 8.5
                            C14 7.7 12.7 7.1 11.2 6.9
                        "
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                    />

                    <path
                        d="
                            M16.5 8.5
                            C18 7.7 19.3 7.1 20.8 6.9
                        "
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                    />

                </svg>

            </span>
        `;
    }


    // ========================================================
    // MEMORY UPDATED SYSTEM ROW
    //
    // IMPORTANT:
    // This is NOT inside the AI message.
    // It is a separate row ABOVE the AI message.
    // ========================================================

    function createMemoryUpdatedSystemRow(
        memory
    ) {

        const row =
            document.createElement(
                "button"
            );

        row.type = "button";

        row.className =
            "pingme-memory-updated-row";

        row.setAttribute(
            "aria-label",
            "Memory updated"
        );

        row.dataset.memoryId =
            memory && memory.id
                ? memory.id
                : "";

        row.innerHTML = `

            ${getMemoryBookIcon()}

            <span
                class="pingme-memory-updated-text"
            >
                Memory updated
            </span>

        `;


        row.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                openMemorySummary();
            }
        );


        return row;
    }


    // ========================================================
    // ASSISTANT MESSAGE SELECTOR
    // ========================================================

    function getAssistantMessageSelectors() {

        return [

            "[data-role='assistant']",

            "[data-message-role='assistant']",

            ".assistant-message",

            ".ai-message",

            ".pingme-ai-message",

            ".message.assistant",

            ".message.ai",

            ".message-assistant",

            "[class*='assistant-message']",

            "[class*='ai-message']"
        ];
    }


    // ========================================================
    // FIND LATEST ASSISTANT MESSAGE
    // ========================================================

    function findLatestAssistantMessage() {

        const selectors =
            getAssistantMessageSelectors();

        for (
            let i = 0;
            i < selectors.length;
            i++
        ) {

            const elements =
                document.querySelectorAll(
                    selectors[i]
                );

            if (
                elements &&
                elements.length
            ) {

                return elements[
                    elements.length - 1
                ];
            }
        }

        return null;
    }


    // ========================================================
    // INSERT SYSTEM ROW ABOVE AI MESSAGE
    // ========================================================

    function placeMemoryUpdatedAboveAssistant(
        memory,
        assistantMessage
    ) {

        if (
            !memory ||
            !assistantMessage ||
            !assistantMessage.parentNode
        ) {

            return false;
        }


        // ----------------------------------------------------
        // Prevent duplicate row for same memory/message
        // ----------------------------------------------------

        const existingRows =
            assistantMessage.parentNode
                .querySelectorAll(
                    ".pingme-memory-updated-row"
                );


        for (
            let i = 0;
            i < existingRows.length;
            i++
        ) {

            if (
                existingRows[i]
                    .dataset.memoryId ===
                memory.id
            ) {

                return true;
            }
        }


        // ----------------------------------------------------
        // Create separate system row
        // ----------------------------------------------------

        const row =
            createMemoryUpdatedSystemRow(
                memory
            );


        // ----------------------------------------------------
        // Put it directly ABOVE AI message
        // ----------------------------------------------------

        assistantMessage.parentNode.insertBefore(
            row,
            assistantMessage
        );


        return true;
    }


    // ========================================================
    // PLACE PENDING INDICATOR
    // ========================================================

    function attachPendingMemoryIndicator() {

        if (
            !pendingMemoryForAssistant
        ) {

            return;
        }

        const assistantMessage =
            findLatestAssistantMessage();

        if (!assistantMessage) {

            return;
        }

        const placed =
            placeMemoryUpdatedAboveAssistant(
                pendingMemoryForAssistant,
                assistantMessage
            );

        if (placed) {

            pendingMemoryForAssistant =
                null;
        }
    }


    // ========================================================
    // EMIT MEMORY UPDATED
    // ========================================================

    function emitMemoryUpdated(
        memory,
        updated
    ) {

        try {

            window.dispatchEvent(
                new CustomEvent(
                    MEMORY_EVENT,
                    {
                        detail: {
                            memory: memory,
                            updated:
                                Boolean(
                                    updated
                                )
                        }
                    }
                )
            );

        } catch (error) {

            console.warn(
                "PingMe AI — Memory event error:",
                error
            );
        }


        // ----------------------------------------------------
        // Do NOT append to AI message.
        // Wait for the assistant response and place the row
        // above it.
        // ----------------------------------------------------

        pendingMemoryForAssistant =
            memory;


        attachPendingMemoryIndicator();
    }


    // ========================================================
    // MEMORY SUMMARY UI
    // ========================================================

    function createMemoryUI() {

        if (
            document.getElementById(
                "pingmeMemoryOverlay"
            )
        ) {

            memoryOverlay =
                document.getElementById(
                    "pingmeMemoryOverlay"
                );

            memoryPanel =
                document.getElementById(
                    "pingmeMemoryPanel"
                );

            return;
        }


        memoryOverlay =
            document.createElement(
                "div"
            );

        memoryOverlay.id =
            "pingmeMemoryOverlay";

        memoryOverlay.className =
            "pingme-memory-overlay";


        memoryOverlay.innerHTML = `

            <div
                id="pingmeMemoryPanel"
                class="pingme-memory-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Memory summary"
            >

                <header
                    class="pingme-memory-header"
                >

                    <button
                        type="button"
                        class="pingme-memory-back"
                        id="pingmeMemoryBack"
                        aria-label="Back"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="none"
                        >

                            <path
                                d="M15 5L8 12L15 19"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />

                        </svg>

                    </button>


                    <div
                        class="pingme-memory-title-area"
                    >

                        <h1>
                            Memory summary
                        </h1>

                        <span
                            id="pingmeMemoryUpdatedAt"
                        >
                            Updated just now
                        </span>

                    </div>


                    <button
                        type="button"
                        class="pingme-memory-more"
                        id="pingmeMemoryMore"
                        aria-label="More"
                    >

                        <span></span>
                        <span></span>
                        <span></span>

                    </button>

                </header>


                <main
                    class="pingme-memory-content"
                    id="pingmeMemoryContent"
                ></main>

            </div>
        `;


        document.body.appendChild(
            memoryOverlay
        );


        memoryPanel =
            document.getElementById(
                "pingmeMemoryPanel"
            );


        const backButton =
            document.getElementById(
                "pingmeMemoryBack"
            );


        if (backButton) {

            backButton.addEventListener(
                "click",
                closeMemorySummary
            );
        }


        const moreButton =
            document.getElementById(
                "pingmeMemoryMore"
            );


        if (moreButton) {

            moreButton.addEventListener(
                "click",
                toggleAboutMemoryMenu
            );
        }


        memoryOverlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    memoryOverlay
                ) {

                    closeMemorySummary();
                }
            }
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                        "Escape" &&
                    memoryOverlay &&
                    memoryOverlay.classList.contains(
                        "show"
                    )
                ) {

                    closeMemorySummary();
                }
            }
        );
    }


    // ========================================================
    // RENDER MEMORY SUMMARY
    // ========================================================

    function renderMemorySummary() {

        const content =
            document.getElementById(
                "pingmeMemoryContent"
            );

        if (!content) {
            return;
        }


        const memories =
            memoryState.memories;


        const updatedElement =
            document.getElementById(
                "pingmeMemoryUpdatedAt"
            );


        if (updatedElement) {

            updatedElement.textContent =
                formatUpdatedTime(
                    memoryState.updatedAt
                );
        }


        content.innerHTML = `

            <section
                class="pingme-memory-overview"
            >

                <h2>
                    Overview
                </h2>

                <p>
                    PingMe AI remembers information
                    you explicitly ask it to remember.
                    You can review or remove saved
                    memories at any time.
                </p>

            </section>


            <section
                class="pingme-memory-status"
            >

                <div
                    class="pingme-memory-status-icon"
                >
                    ${getMemoryBookIcon()}
                </div>


                <div>

                    <strong>
                        Memory is
                        ${
                            memoryState.enabled
                                ? "on"
                                : "off"
                        }
                    </strong>

                    <span>
                        ${
                            memoryState.enabled
                                ? "PingMe AI can save information you ask it to remember."
                                : "PingMe AI will not save new memories."
                        }
                    </span>

                </div>

            </section>


            <section
                class="pingme-memory-list-section"
            >

                <div
                    class="pingme-memory-section-title"
                >

                    <h2>
                        Saved memories
                    </h2>

                    <span>
                        ${memories.length}
                    </span>

                </div>


                <div
                    class="pingme-memory-list"
                    id="pingmeMemoryList"
                >

                    ${
                        memories.length
                            ? memories
                                .map(
                                    renderMemoryItem
                                )
                                .join("")
                            : `
                                <div
                                    class="pingme-memory-empty"
                                >

                                    <div
                                        class="pingme-memory-empty-icon"
                                    >
                                        ${getMemoryBookIcon()}
                                    </div>

                                    <strong>
                                        No saved memories yet
                                    </strong>

                                    <span>
                                        Tell PingMe AI
                                        something you want
                                        it to remember.
                                    </span>

                                </div>
                            `
                    }

                </div>

            </section>
        `;


        bindMemoryItemActions();
    }


    // ========================================================
    // MEMORY ITEM
    // ========================================================

    function renderMemoryItem(
        memory
    ) {

        return `

            <article
                class="pingme-memory-item"
                data-memory-id="${escapeHTML(
                    memory.id
                )}"
            >

                <div
                    class="pingme-memory-item-icon"
                >
                    ${getMemoryBookIcon()}
                </div>


                <div
                    class="pingme-memory-item-body"
                >

                    <div
                        class="pingme-memory-item-text"
                    >
                        ${escapeHTML(
                            memory.text
                        )}
                    </div>


                    <div
                        class="pingme-memory-item-date"
                    >
                        ${formatMemoryDate(
                            memory.updatedAt ||
                            memory.createdAt
                        )}
                    </div>

                </div>


                <button
                    type="button"
                    class="pingme-memory-item-delete"
                    data-delete-memory="${escapeHTML(
                        memory.id
                    )}"
                    aria-label="Delete memory"
                >
                    ×
                </button>

            </article>
        `;
    }


    // ========================================================
    // MEMORY ITEM ACTIONS
    // ========================================================

    function bindMemoryItemActions() {

        const buttons =
            document.querySelectorAll(
                "[data-delete-memory]"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();


                        const id =
                            button.dataset
                                .deleteMemory;


                        deleteMemory(id);

                    }
                );

            }
        );
    }


    // ========================================================
    // ABOUT MEMORY MENU
    // ========================================================

    function createAboutMemoryMenu() {

        if (
            document.getElementById(
                "pingmeAboutMemoryMenu"
            )
        ) {

            aboutMenu =
                document.getElementById(
                    "pingmeAboutMemoryMenu"
                );

            return;
        }


        aboutMenu =
            document.createElement(
                "div"
            );


        aboutMenu.id =
            "pingmeAboutMemoryMenu";


        aboutMenu.className =
            "pingme-about-memory-menu";


        aboutMenu.innerHTML = `

            <div
                class="pingme-about-memory-title"
            >

                <span
                    class="pingme-about-info-icon"
                >
                    i
                </span>

                <strong>
                    About memory
                </strong>

            </div>


            <button
                type="button"
                id="pingmeRefreshMemory"
                class="pingme-about-memory-action"
            >

                <span
                    class="pingme-refresh-icon"
                >
                    ↻
                </span>

                <span>
                    Refresh summary
                </span>

            </button>


            <button
                type="button"
                id="pingmeDeleteTurnOffMemory"
                class="pingme-about-memory-action danger"
            >

                <span
                    class="pingme-trash-icon"
                >

                    <svg
                        viewBox="0 0 24 24"
                        width="23"
                        height="23"
                        fill="none"
                    >

                        <path
                            d="M4 7H20"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />

                        <path
                            d="M9 7V4H15V7"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linejoin="round"
                        />

                        <path
                            d="M7 7L8 20H16L17 7"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linejoin="round"
                        />

                        <path
                            d="M10 11V16"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />

                        <path
                            d="M14 11V16"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />

                    </svg>

                </span>

                <span>
                    Delete and turn off memory
                </span>

            </button>
        `;


        document.body.appendChild(
            aboutMenu
        );


        const refreshButton =
            document.getElementById(
                "pingmeRefreshMemory"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                function () {

                    closeAboutMemoryMenu();

                    loadMemoryState();

                    renderMemorySummary();

                }
            );
        }


        const deleteButton =
            document.getElementById(
                "pingmeDeleteTurnOffMemory"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function () {

                    closeAboutMemoryMenu();

                    deleteAndTurnOffMemory();

                }
            );
        }


        document.addEventListener(
            "click",
            function (event) {

                if (
                    !aboutMenu ||
                    !aboutMenu.classList.contains(
                        "show"
                    )
                ) {

                    return;
                }


                const moreButton =
                    document.getElementById(
                        "pingmeMemoryMore"
                    );


                if (
                    event.target ===
                        aboutMenu ||
                    aboutMenu.contains(
                        event.target
                    ) ||
                    (
                        moreButton &&
                        moreButton.contains(
                            event.target
                        )
                    )
                ) {

                    return;
                }


                closeAboutMemoryMenu();

            }
        );
    }


    // ========================================================
    // ABOUT MENU TOGGLE
    // ========================================================

    function toggleAboutMemoryMenu(
        event
    ) {

        if (event) {

            event.preventDefault();
            event.stopPropagation();
        }


        createAboutMemoryMenu();


        if (!aboutMenu) {
            return;
        }


        aboutMenu.classList.toggle(
            "show"
        );
    }


    // ========================================================
    // CLOSE ABOUT MENU
    // ========================================================

    function closeAboutMemoryMenu() {

        if (!aboutMenu) {
            return;
        }


        aboutMenu.classList.remove(
            "show"
        );
    }


    // ========================================================
    // DELETE + TURN OFF
    // ========================================================

    function deleteAndTurnOffMemory() {

        const confirmed =
            window.confirm(
                "Delete all saved memories and turn off memory?"
            );


        if (!confirmed) {
            return;
        }


        memoryState.memories = [];

        memoryState.enabled = false;

        memoryState.updatedAt =
            getNowISO();


        persistMemoryState();

        renderMemorySummary();
    }


    // ========================================================
    // OPEN SUMMARY
    // ========================================================

    function openMemorySummary() {

        createMemoryUI();

        createAboutMemoryMenu();

        loadMemoryState();

        renderMemorySummary();


        if (memoryOverlay) {

            memoryOverlay.classList.add(
                "show"
            );

            document.body.classList.add(
                "pingme-memory-open"
            );
        }


        window.dispatchEvent(
            new CustomEvent(
                MEMORY_OPEN_EVENT
            )
        );
    }


    // ========================================================
    // CLOSE SUMMARY
    // ========================================================

    function closeMemorySummary() {

        closeAboutMemoryMenu();


        if (!memoryOverlay) {
            return;
        }


        memoryOverlay.classList.remove(
            "show"
        );


        document.body.classList.remove(
            "pingme-memory-open"
        );
    }


    // ========================================================
    // UPDATED TIME
    // ========================================================

    function formatUpdatedTime(
        iso
    ) {

        if (!iso) {

            return "Updated just now";
        }


        const date =
            new Date(iso);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Updated just now";
        }


        return (
            "Updated " +
            formatRelativeTime(
                date
            )
        );
    }


    // ========================================================
    // RELATIVE TIME
    // ========================================================

    function formatRelativeTime(
        date
    ) {

        const seconds =
            Math.floor(
                (
                    Date.now() -
                    date.getTime()
                ) / 1000
            );


        if (seconds < 10) {

            return "just now";
        }


        if (seconds < 60) {

            return (
                seconds +
                " seconds ago"
            );
        }


        const minutes =
            Math.floor(
                seconds / 60
            );


        if (minutes < 60) {

            return (
                minutes +
                (
                    minutes === 1
                        ? " minute ago"
                        : " minutes ago"
                )
            );
        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {

            return (
                hours +
                (
                    hours === 1
                        ? " hour ago"
                        : " hours ago"
                )
            );
        }


        const days =
            Math.floor(
                hours / 24
            );


        return (
            days +
            (
                days === 1
                    ? " day ago"
                    : " days ago"
            )
        );
    }


    // ========================================================
    // MEMORY DATE
    // ========================================================

    function formatMemoryDate(
        iso
    ) {

        if (!iso) {
            return "";
        }


        const date =
            new Date(iso);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";
        }


        try {

            return date.toLocaleString(
                undefined,
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

        } catch (error) {

            return date.toString();
        }
    }


    // ========================================================
    // MEMORY COMMAND DETECTION
    // ========================================================

    function looksLikeMemoryCommand(
        text
    ) {

        const value =
            normalizeMemoryText(
                text
            ).toLowerCase();


        if (!value) {
            return false;
        }


        const patterns = [

            /মনে রাখ/,
            /মনে রেখ/,
            /মেমোরিতে সেভ/,
            /মেমোরিতে রাখ/,
            /মেমরিতে সেভ/,
            /মেমরিতে রাখ/,
            /সেভ করে রাখ/,
            /এটা মনে রাখিস/,
            /এটা মনে রাখো/,
            /এটা মনে রাখবে/,
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


        return patterns.some(
            function (pattern) {

                return pattern.test(
                    value
                );
            }
        );
    }


    // ========================================================
    // EXTRACT MEMORY
    // ========================================================

    function extractMemoryFromCommand(
        text
    ) {

        const original =
            normalizeMemoryText(
                text
            );


        if (!original) {
            return "";
        }


        let result =
            original;


        const replacements = [

            /^.*?এটা মনে রাখ(?:িস|ো|বে)?[,:]?\s*/i,

            /^.*?এই কথাটা মনে রাখ[,:]?\s*/i,

            /^.*?এই তথ্যটা মনে রাখ[,:]?\s*/i,

            /^.*?মেমোরিতে সেভ করে রাখ[,:]?\s*/i,

            /^.*?মেমোরিতে সেভ কর[,:]?\s*/i,

            /^.*?মেমোরিতে রাখ[,:]?\s*/i,

            /^.*?মেমরিতে সেভ করে রাখ[,:]?\s*/i,

            /^.*?সেভ করে রাখ[,:]?\s*/i,

            /^.*?remember this[,:]?\s*/i,

            /^.*?remember that[,:]?\s*/i,

            /^.*?save this to memory[,:]?\s*/i,

            /^.*?save this[,:]?\s*/i,

            /^.*?keep this in memory[,:]?\s*/i,

            /^.*?store this in memory[,:]?\s*/i,

            /^.*?add this to memory[,:]?\s*/i

        ];


        replacements.some(
            function (pattern) {

                const cleaned =
                    result.replace(
                        pattern,
                        ""
                    );


                if (
                    cleaned !==
                    result
                ) {

                    result =
                        cleaned.trim();

                    return true;
                }


                return false;
            }
        );


        return (
            result ||
            original
        );
    }


    // ========================================================
    // PROCESS MEMORY COMMAND
    // ========================================================

    function processPossibleMemoryCommand(
        text
    ) {

        if (
            !isMemoryEnabled()
        ) {

            return null;
        }


        if (
            !looksLikeMemoryCommand(
                text
            )
        ) {

            return null;
        }


        const memoryText =
            extractMemoryFromCommand(
                text
            );


        if (!memoryText) {
            return null;
        }


        return saveMemory(
            memoryText,
            {
                source:
                    "user-command"
            }
        );
    }


    // ========================================================
    // PUBLIC API
    // ========================================================

    function pingMeRemember(
        text,
        options
    ) {

        return saveMemory(
            text,
            options
        );
    }


    function pingMeForget(
        id
    ) {

        return deleteMemory(
            id
        );
    }


    function pingMeForgetAll() {

        return clearAllMemories();
    }


    function pingMeMemorySummary() {

        return getMemories();
    }


    window.PingMeMemory = {

        save:
            pingMeRemember,

        remember:
            pingMeRemember,

        update:
            updateMemory,

        get:
            getMemories,

        getOne:
            getMemory,

        delete:
            pingMeForget,

        clear:
            pingMeForgetAll,

        enabled:
            isMemoryEnabled,

        setEnabled:
            setMemoryEnabled,

        open:
            openMemorySummary,

        close:
            closeMemorySummary,

        refresh:
            function () {

                loadMemoryState();

                renderMemorySummary();
            },

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
        pingMeForget;


    window.openPingMeMemory =
        openMemorySummary;


    window.closePingMeMemory =
        closeMemorySummary;


    window.isPingMeMemoryEnabled =
        isMemoryEnabled;


    window.setPingMeMemoryEnabled =
        setMemoryEnabled;


    // ========================================================
    // MESSAGE TEXT
    // ========================================================

    function getMessageTextFromElement(
        element
    ) {

        if (!element) {
            return "";
        }


        return normalizeMemoryText(
            element.innerText ||
            element.textContent ||
            ""
        );
    }


    // ========================================================
    // MESSAGE ROLE
    // ========================================================

    function detectMessageRole(
        element
    ) {

        if (!element) {
            return "";
        }


        const role =
            (
                element.getAttribute(
                    "data-role"
                ) ||
                element.getAttribute(
                    "data-message-role"
                ) ||
                ""
            ).toLowerCase();


        if (role === "user") {
            return "user";
        }


        if (
            role === "assistant" ||
            role === "ai"
        ) {

            return "assistant";
        }


        const className =
            String(
                element.className ||
                ""
            ).toLowerCase();


        if (
            className.includes(
                "user-message"
            ) ||
            className.includes(
                "message-user"
            )
        ) {

            return "user";
        }


        if (
            className.includes(
                "assistant-message"
            ) ||
            className.includes(
                "ai-message"
            ) ||
            className.includes(
                "message-assistant"
            )
        ) {

            return "assistant";
        }


        return "";
    }


    // ========================================================
    // SCAN ADDED NODE
    // ========================================================

    function scanAddedNode(
        node
    ) {

        if (
            !node ||
            node.nodeType !== 1
        ) {

            return;
        }


        const role =
            detectMessageRole(
                node
            );


        // ----------------------------------------------------
        // USER MESSAGE
        // ----------------------------------------------------

        if (role === "user") {

            const text =
                getMessageTextFromElement(
                    node
                );


            if (
                text &&
                looksLikeMemoryCommand(
                    text
                )
            ) {

                processPossibleMemoryCommand(
                    text
                );
            }


            return;
        }


        // ----------------------------------------------------
        // ASSISTANT MESSAGE
        // ----------------------------------------------------

        if (
            role === "assistant"
        ) {

            attachPendingMemoryIndicator();

            return;
        }


        // ----------------------------------------------------
        // NESTED USER MESSAGES
        // ----------------------------------------------------

        if (
            node.querySelectorAll
        ) {

            const userCandidates =
                node.querySelectorAll(
                    [
                        "[data-role='user']",
                        "[data-message-role='user']",
                        ".user-message",
                        ".message-user"
                    ].join(",")
                );


            userCandidates.forEach(
                function (element) {

                    const text =
                        getMessageTextFromElement(
                            element
                        );


                    if (
                        text &&
                        looksLikeMemoryCommand(
                            text
                        )
                    ) {

                        processPossibleMemoryCommand(
                            text
                        );
                    }
                }
            );


            // ------------------------------------------------
            // Nested assistant messages
            // ------------------------------------------------

            const assistantCandidates =
                node.querySelectorAll(
                    [
                        "[data-role='assistant']",
                        "[data-message-role='assistant']",
                        ".assistant-message",
                        ".ai-message",
                        ".message-assistant"
                    ].join(",")
                );


            if (
                assistantCandidates.length
            ) {

                attachPendingMemoryIndicator();
            }
        }
    }


    // ========================================================
    // MESSAGE OBSERVER
    // ========================================================

    function startMessageObserver() {

        if (
            !document.body ||
            typeof MutationObserver ===
                "undefined"
        ) {

            return;
        }


        const observer =
            new MutationObserver(
                function (mutations) {

                    mutations.forEach(
                        function (mutation) {

                            mutation.addedNodes
                                .forEach(
                                    function (node) {

                                        scanAddedNode(
                                            node
                                        );

                                    }
                                );
                        }
                    );


                    // Assistant message can be added
                    // after memory was saved.
                    attachPendingMemoryIndicator();

                }
            );


        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }


    // ========================================================
    // STYLES
    // ========================================================

    function addStyles() {

        if (
            document.getElementById(
                "pingmeMemoryCoreStyles"
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "pingmeMemoryCoreStyles";


        style.textContent = `

            /* ==================================================
               MEMORY UPDATED SYSTEM ROW
               ================================================== */

            .pingme-memory-updated-row {

                display: flex;
                align-items: center;

                width: fit-content;

                margin:
                    7px
                    0
                    6px;

                padding:
                    2px
                    0;

                border: 0;

                background:
                    transparent;

                color:
                    rgba(80,80,80,.78);

                font-family:
                    inherit;

                font-size:
                    13px;

                line-height:
                    1.25;

                font-weight:
                    450;

                cursor:
                    pointer;

                text-align:
                    left;

                opacity:
                    .92;

                transition:
                    opacity .18s ease,
                    color .18s ease,
                    transform .18s ease;
            }


            .pingme-memory-updated-row:hover {

                color:
                    rgba(40,40,40,.95);

                opacity:
                    1;
            }


            .pingme-memory-updated-row:active {

                transform:
                    scale(.985);
            }


            .pingme-memory-book-icon {

                display:
                    inline-flex;

                align-items:
                    center;

                justify-content:
                    center;

                flex:
                    0 0 auto;

                color:
                    currentColor;
            }


            .pingme-memory-updated-row
            .pingme-memory-book-icon {

                margin-right:
                    6px;
            }


            .pingme-memory-book-icon svg {

                display:
                    block;
            }


            /* ==================================================
               MEMORY OVERLAY
               ================================================== */

            .pingme-memory-overlay {

                position:
                    fixed;

                inset:
                    0;

                z-index:
                    999999;

                display:
                    flex;

                align-items:
                    stretch;

                justify-content:
                    center;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .98
                    );

                opacity:
                    0;

                visibility:
                    hidden;

                pointer-events:
                    none;

                transition:
                    opacity .2s ease,
                    visibility .2s ease;
            }


            .pingme-memory-overlay.show {

                opacity:
                    1;

                visibility:
                    visible;

                pointer-events:
                    auto;
            }


            /* ==================================================
               MEMORY PANEL
               ================================================== */

            .pingme-memory-panel {

                position:
                    relative;

                width:
                    min(
                        100%,
                        720px
                    );

                height:
                    100%;

                display:
                    flex;

                flex-direction:
                    column;

                background:
                    #fff;

                color:
                    #171717;

                overflow:
                    hidden;

                font-family:
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;
            }


            /* ==================================================
               HEADER
               ================================================== */

            .pingme-memory-header {

                position:
                    relative;

                display:
                    grid;

                grid-template-columns:
                    48px
                    1fr
                    48px;

                align-items:
                    center;

                min-height:
                    82px;

                padding:
                    10px
                    18px;

                border-bottom:
                    1px solid
                    rgba(
                        0,
                        0,
                        0,
                        .06
                    );

                background:
                    #fff;
            }


            .pingme-memory-back,
            .pingme-memory-more {

                width:
                    48px;

                height:
                    48px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border:
                    0;

                border-radius:
                    50%;

                background:
                    transparent;

                color:
                    #111;

                cursor:
                    pointer;
            }


            .pingme-memory-back:hover,
            .pingme-memory-more:hover {

                background:
                    rgba(
                        0,
                        0,
                        0,
                        .055
                    );
            }


            .pingme-memory-title-area {

                min-width:
                    0;

                text-align:
                    center;
            }


            .pingme-memory-title-area h1 {

                margin:
                    0;

                font-size:
                    21px;

                line-height:
                    1.25;

                font-weight:
                    700;
            }


            .pingme-memory-title-area span {

                display:
                    block;

                margin-top:
                    4px;

                color:
                    #777;

                font-size:
                    13px;
            }


            .pingme-memory-more {

                flex-direction:
                    column;

                gap:
                    3px;
            }


            .pingme-memory-more span {

                width:
                    4px;

                height:
                    4px;

                border-radius:
                    50%;

                background:
                    currentColor;
            }


            /* ==================================================
               CONTENT
               ================================================== */

            .pingme-memory-content {

                flex:
                    1;

                overflow-y:
                    auto;

                padding:
                    30px
                    24px
                    60px;

                -webkit-overflow-scrolling:
                    touch;
            }


            .pingme-memory-content::-webkit-scrollbar {

                width:
                    6px;
            }


            .pingme-memory-content::-webkit-scrollbar-thumb {

                border-radius:
                    10px;

                background:
                    rgba(
                        0,
                        0,
                        0,
                        .16
                    );
            }


            /* ==================================================
               OVERVIEW
               ================================================== */

            .pingme-memory-overview {

                margin-bottom:
                    28px;
            }


            .pingme-memory-overview h2 {

                margin:
                    0
                    0
                    10px;

                font-size:
                    28px;

                line-height:
                    1.15;

                font-weight:
                    750;

                letter-spacing:
                    -.5px;
            }


            .pingme-memory-overview p {

                margin:
                    0;

                color:
                    #333;

                font-size:
                    17px;

                line-height:
                    1.7;
            }


            /* ==================================================
               STATUS
               ================================================== */

            .pingme-memory-status {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    15px;

                margin-bottom:
                    30px;

                padding:
                    17px;

                border-radius:
                    18px;

                background:
                    #f6f6f6;
            }


            .pingme-memory-status-icon {

                width:
                    46px;

                height:
                    46px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    14px;

                background:
                    #fff;

                color:
                    #555;
            }


            .pingme-memory-status-icon
            .pingme-memory-book-icon svg {

                width:
                    27px;

                height:
                    27px;
            }


            .pingme-memory-status strong {

                display:
                    block;

                margin-bottom:
                    3px;

                font-size:
                    16px;
            }


            .pingme-memory-status span {

                display:
                    block;

                color:
                    #777;

                font-size:
                    13px;

                line-height:
                    1.45;
            }


            /* ==================================================
               MEMORY LIST
               ================================================== */

            .pingme-memory-list-section {

                margin-top:
                    12px;
            }


            .pingme-memory-section-title {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    space-between;

                margin-bottom:
                    12px;
            }


            .pingme-memory-section-title h2 {

                margin:
                    0;

                font-size:
                    21px;
            }


            .pingme-memory-section-title span {

                min-width:
                    28px;

                height:
                    28px;

                display:
                    inline-flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    50%;

                background:
                    #f1f1f1;

                color:
                    #666;

                font-size:
                    13px;
            }


            .pingme-memory-list {

                display:
                    flex;

                flex-direction:
                    column;

                gap:
                    10px;
            }


            .pingme-memory-item {

                position:
                    relative;

                display:
                    flex;

                align-items:
                    flex-start;

                gap:
                    13px;

                padding:
                    15px;

                border:
                    1px solid
                    rgba(
                        0,
                        0,
                        0,
                        .08
                    );

                border-radius:
                    17px;

                background:
                    #fff;
            }


            .pingme-memory-item-icon {

                flex:
                    0 0 auto;

                width:
                    34px;

                height:
                    34px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    10px;

                background:
                    #f5f5f5;

                color:
                    #555;
            }


            .pingme-memory-item-icon
            .pingme-memory-book-icon svg {

                width:
                    22px;

                height:
                    22px;
            }


            .pingme-memory-item-body {

                min-width:
                    0;

                flex:
                    1;

                padding-right:
                    30px;
            }


            .pingme-memory-item-text {

                color:
                    #202020;

                font-size:
                    15px;

                line-height:
                    1.55;

                word-break:
                    break-word;
            }


            .pingme-memory-item-date {

                margin-top:
                    6px;

                color:
                    #8a8a8a;

                font-size:
                    12px;
            }


            .pingme-memory-item-delete {

                position:
                    absolute;

                top:
                    9px;

                right:
                    9px;

                width:
                    30px;

                height:
                    30px;

                border:
                    0;

                border-radius:
                    50%;

                background:
                    transparent;

                color:
                    #999;

                font-size:
                    23px;

                line-height:
                    1;

                cursor:
                    pointer;
            }


            .pingme-memory-item-delete:hover {

                background:
                    rgba(
                        0,
                        0,
                        0,
                        .06
                    );

                color:
                    #333;
            }


            /* ==================================================
               EMPTY
               ================================================== */

            .pingme-memory-empty {

                display:
                    flex;

                flex-direction:
                    column;

                align-items:
                    center;

                justify-content:
                    center;

                padding:
                    55px
                    25px;

                text-align:
                    center;

                color:
                    #777;
            }


            .pingme-memory-empty-icon {

                width:
                    64px;

                height:
                    64px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                margin-bottom:
                    15px;

                border-radius:
                    18px;

                background:
                    #f5f5f5;

                color:
                    #777;
            }


            .pingme-memory-empty-icon
            .pingme-memory-book-icon svg {

                width:
                    34px;

                height:
                    34px;
            }


            .pingme-memory-empty strong {

                color:
                    #333;

                font-size:
                    16px;
            }


            .pingme-memory-empty span {

                max-width:
                    340px;

                margin-top:
                    6px;

                font-size:
                    14px;

                line-height:
                    1.5;
            }


            /* ==================================================
               ABOUT MEMORY MENU
               ================================================== */

            .pingme-about-memory-menu {

                position:
                    fixed;

                top:
                    76px;

                right:
                    18px;

                z-index:
                    1000001;

                width:
                    min(
                        340px,
                        calc(
                            100vw - 36px
                        )
                    );

                padding:
                    17px 0 10px;

                border-radius:
                    25px;

                background:
                    #fff;

                box-shadow:
                    0 18px 55px
                    rgba(
                        0,
                        0,
                        0,
                        .16
                    ),
                    0 2px 10px
                    rgba(
                        0,
                        0,
                        0,
                        .06
                    );

                opacity:
                    0;

                visibility:
                    hidden;

                transform:
                    translateY(-7px)
                    scale(.98);

                pointer-events:
                    none;

                transition:
                    opacity .18s ease,
                    visibility .18s ease,
                    transform .18s ease;
            }


            .pingme-about-memory-menu.show {

                opacity:
                    1;

                visibility:
                    visible;

                transform:
                    translateY(0)
                    scale(1);

                pointer-events:
                    auto;
            }


            .pingme-about-memory-title {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    15px;

                padding:
                    0
                    24px
                    17px;

                font-size:
                    19px;
            }


            .pingme-about-info-icon {

                width:
                    32px;

                height:
                    32px;

                display:
                    inline-flex;

                align-items:
                    center;

                justify-content:
                    center;

                border:
                    2px solid
                    currentColor;

                border-radius:
                    50%;

                font-size:
                    19px;

                font-weight:
                    600;
            }


            .pingme-about-memory-action {

                width:
                    100%;

                display:
                    flex;

                align-items:
                    center;

                gap:
                    18px;

                min-height:
                    76px;

                padding:
                    12px
                    24px;

                border:
                    0;

                background:
                    transparent;

                color:
                    #aaa;

                text-align:
                    left;

                font-family:
                    inherit;

                font-size:
                    17px;

                cursor:
                    pointer;
            }


            .pingme-about-memory-action:hover {

                background:
                    rgba(
                        0,
                        0,
                        0,
                        .035
                    );
            }


            .pingme-about-memory-action.danger {

                color:
                    #b12c2c;
            }


            .pingme-refresh-icon {

                width:
                    32px;

                font-size:
                    38px;

                font-weight:
                    300;

                line-height:
                    1;
            }


            .pingme-trash-icon {

                width:
                    32px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;
            }


            /* ==================================================
               MOBILE
               ================================================== */

            @media (
                max-width: 600px
            ) {

                .pingme-memory-header {

                    min-height:
                        76px;

                    padding:
                        8px
                        10px;
                }


                .pingme-memory-content {

                    padding:
                        25px
                        18px
                        45px;
                }


                .pingme-memory-overview h2 {

                    font-size:
                        27px;
                }


                .pingme-memory-overview p {

                    font-size:
                        16px;
                }


                .pingme-about-memory-menu {

                    top:
                        68px;

                    right:
                        12px;

                    width:
                        calc(
                            100vw - 24px
                        );

                    border-radius:
                        24px;
                }

            }


            /* ==================================================
               BODY LOCK
               ================================================== */

            body.pingme-memory-open {

                overflow:
                    hidden;
            }

        `;


        document.head.appendChild(
            style
        );
    }


    // ========================================================
    // INITIALIZE
    // ========================================================

    function initializeMemoryCore() {

        if (isInitialized) {
            return;
        }


        isInitialized = true;


        loadMemoryState();

        addStyles();

        createMemoryUI();

        createAboutMemoryMenu();

        startMessageObserver();


        setTimeout(
            function () {

                attachPendingMemoryIndicator();

            },
            300
        );


        console.log(
            "PingMe AI — MemoryCore Connected"
        );
    }


    // ========================================================
    // DOM READY
    // ========================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeMemoryCore
        );

    } else {

        initializeMemoryCore();

    }

})();
