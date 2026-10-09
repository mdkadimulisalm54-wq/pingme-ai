// PingMe AI — Chat Support
// Message UI + History + Gemini-Style Loading Orb

(() => {
    "use strict";

    if (window.__pingmeChatSupportLoaded) return;
    window.__pingmeChatSupportLoaded = true;

    const STYLE_ID = "pingme-chat-support-style";
    const ACTIVE_CHAT_KEY = "pingme_active_chat_id";

    /* =====================================================
       STYLES
       ===================================================== */

    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            .user-message {
                display: block;
                width: fit-content;
                max-width: 84%;
                margin: 10px 0 10px auto !important;
                padding: 10px 14px !important;
                border-radius: 18px 18px 6px 18px !important;
                background: linear-gradient(135deg,#eef5ff,#d8e9ff) !important;
                color: #202124 !important;
                box-shadow: 0 4px 14px rgba(70,120,180,.12);
                line-height: 1.5;
                white-space: pre-wrap;
                overflow-wrap: anywhere;
                animation: pingmeUserIn .35s ease both;
            }

            .ai-message {
                width: 100%;
                margin: 14px 0 !important;
                padding: 12px 14px !important;
                border-radius: 18px 18px 18px 6px;
                background: #f7f8fc;
                color: #202124 !important;
                line-height: 1.6;
                overflow-wrap: anywhere;
                animation: pingmeAIIn .4s ease both;
            }

            .ai-message h3 { margin: 8px 0 6px !important; }

            @keyframes pingmeUserIn {
                from { opacity: 0; transform: translateY(8px) scale(.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes pingmeAIIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .pingme-ai-loader {
                width: 23px;
                height: 23px;
                margin: 12px 0;
                border-radius: 50%;
                position: relative;
                display: none;
                background: conic-gradient(
                    from 0deg,
                    #4285f4,
                    #9b72cb,
                    #d96570,
                    #4285f4
                );
                animation: pingmeOrbSpin 1.15s linear infinite;
            }

            .pingme-ai-loader::before {
                content: "";
                position: absolute;
                inset: 3px;
                border-radius: 50%;
                background: var(--pingme-loader-inner, #fff);
            }

            .pingme-ai-loader.show { display: block; }

            @keyframes pingmeOrbSpin {
                to { transform: rotate(360deg); }
            }

            .thinking { display: none !important; }

            @media (prefers-reduced-motion: reduce) {
                .user-message, .ai-message, .pingme-ai-loader {
                    animation-duration: 0s !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       HISTORY
       ===================================================== */

    let activeChatId = null;
    let historyObserver = null;

    function getHistory() {
        return window.PingMeHistory || null;
    }

    function getActiveChatId() {
        if (activeChatId) return activeChatId;

        try {
            activeChatId = localStorage.getItem(ACTIVE_CHAT_KEY);
        } catch (_) {}

        return activeChatId;
    }

    function setActiveChatId(id) {
        if (!id) return;

        activeChatId = id;

        try {
            localStorage.setItem(ACTIVE_CHAT_KEY, id);
        } catch (_) {}
    }

    function makeTitle(text) {
        const clean = String(text || "").replace(/\s+/g, " ").trim();
        return clean ? clean.slice(0, 45) : "New Chat";
    }

    function ensureChat(firstMessage = "") {
        const history = getHistory();
        if (!history) return null;

        const id = getActiveChatId();

        if (id && typeof history.getChat === "function") {
            if (history.getChat(id)) return id;
        }

        if (typeof history.createChat !== "function") return null;

        try {
            const chat = history.createChat(makeTitle(firstMessage));

            if (chat && chat.id) {
                setActiveChatId(chat.id);
                return chat.id;
            }
        } catch (error) {
            console.error("PingMe History: Could not create chat.", error);
        }

        return null;
    }

    function messageText(node) {
        if (!node) return "";

        const clone = node.cloneNode(true);

        clone.querySelectorAll(
            ".pingme-message-actions, .pingme-ai-loader, button"
        ).forEach(el => el.remove());

        return String(clone.innerText || clone.textContent || "").trim();
    }

    function saveMessage(node) {
        const history = getHistory();
        if (!history || !node || node.dataset.historySaved === "true") return;

        const isUser = node.classList.contains("user-message");
        const isAI = node.classList.contains("ai-message");
        if (!isUser && !isAI) return;

        const content = messageText(node);
        if (!content) return;

        const chatId = ensureChat(isUser ? content : "");
        if (!chatId) return;

        try {
            if (isUser && typeof history.addUserMessage === "function") {
                history.addUserMessage(chatId, content);
            } else if (isAI && typeof history.addAssistantMessage === "function") {
                history.addAssistantMessage(chatId, content);
            } else if (typeof history.addMessage === "function") {
                history.addMessage(chatId, {
                    role: isUser ? "user" : "assistant",
                    content,
                    text: content,
                    timestamp: Date.now()
                });
            } else {
                return;
            }

            node.dataset.historySaved = "true";
        } catch (error) {
            console.error("PingMe History: Could not save message.", error);
        }
    }

    /* =====================================================
       MESSAGE WATCHER
       ===================================================== */

    function processNode(node) {
        if (!node || node.nodeType !== 1) return;

        if (node.matches(".user-message, .ai-message")) {
            saveMessage(node);
        }

        node.querySelectorAll?.(".user-message, .ai-message").forEach(saveMessage);
    }

    function connectChatArea() {
        const area = document.getElementById("chatArea");
        if (!area || area.dataset.pingmeHistoryObserver === "true") return;

        area.dataset.pingmeHistoryObserver = "true";

        historyObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(processNode);

                // Catch text/content updates without saving duplicates.
                const target = mutation.target?.nodeType === 1
                    ? mutation.target.closest(".user-message, .ai-message")
                    : mutation.target?.parentElement?.closest(".user-message, .ai-message");

                if (target && target.dataset.historySaved !== "true") {
                    saveMessage(target);
                }
            });
        });

        historyObserver.observe(area, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    /* =====================================================
       ROTATING AI INDICATOR
       ===================================================== */

    function addLoader() {
        const area = document.getElementById("chatArea");
        if (!area || document.getElementById("pingmeAiLoader")) return;

        const loader = document.createElement("div");
        loader.id = "pingmeAiLoader";
        loader.className = "pingme-ai-loader";
        loader.setAttribute("role", "status");
        loader.setAttribute("aria-label", "AI is responding");

        area.appendChild(loader);
        updateLoaderColor();
    }

    function updateLoaderColor() {
        const loader = document.getElementById("pingmeAiLoader");
        const area = document.getElementById("chatArea");
        if (!loader || !area) return;

        const dark = document.documentElement.classList.contains("dark") ||
            document.body.classList.contains("dark") ||
            document.documentElement.dataset.theme === "dark";

        loader.style.setProperty("--pingme-loader-inner", dark ? "#181818" : "#fff");
    }

    function showLoader() {
        addLoader();

        const loader = document.getElementById("pingmeAiLoader");
        if (loader) {
            loader.classList.add("show");

            const area = document.getElementById("chatArea");
            if (area && loader.parentElement !== area) area.appendChild(loader);
        }

        const thinking = document.getElementById("thinking");
        if (thinking) thinking.classList.remove("show");

        updateLoaderColor();
    }

    function hideLoader() {
        document.getElementById("pingmeAiLoader")?.classList.remove("show");
    }

    // Other support files can control the loader without changing AI logic.
    window.PingMeLoader = {
        show: showLoader,
        hide: hideLoader
    };

    document.addEventListener("pingme:ai:start", showLoader);
    document.addEventListener("pingme:ai:complete", hideLoader);
    document.addEventListener("pingme:ai:error", hideLoader);

    /* =====================================================
       THINKING ELEMENT WATCHER
       ===================================================== */

    const thinking = document.getElementById("thinking");

    if (thinking) {
        new MutationObserver(() => {
            if (thinking.classList.contains("show")) {
                showLoader();
                thinking.classList.remove("show");
            }
        }).observe(thinking, {
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    /* =====================================================
       STARTUP
       ===================================================== */

    connectChatArea();

    // If History Support loads after this file, connect when ready.
    window.addEventListener("load", () => {
        connectChatArea();
        if (getHistory()) {
            console.log("PingMe Chat Support: History connected.");
        } else {
            console.warn("PingMe Chat Support: History Support not found.");
        }
    });

    console.log("PingMe Chat Support Connected");
})();