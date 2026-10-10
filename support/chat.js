/* ==========================================================
   PINGME AI — CHAT SUPPORT
   Message UI • History • Floating Circular AI Loader
   ========================================================== */

(() => {
    "use strict";

    if (window.__pingmeChatSupportLoaded) return;
    window.__pingmeChatSupportLoaded = true;

    const STYLE_ID = "pingme-chat-support-style";
    const ACTIVE_CHAT_KEY = "pingme_active_chat_id";
    const CURRENT_CHAT_KEY = "pingme_current_chat_id";
    const LOADER_ID = "pingmeAiLoaderRow";

    /* ======================================================
       STYLES
       ====================================================== */

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
                animation: pingmeUserIn .3s ease both;
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
                animation: pingmeAIIn .3s ease both;
            }

            .ai-message h3 {
                margin: 8px 0 6px !important;
            }

            /* FLOATING CIRCULAR LOADER */

            .pingme-loader-row {
                display: flex !important;
                align-items: center;
                min-height: 46px;
                margin: 8px 0;
                padding: 0;
                visibility: visible !important;
                opacity: 1 !important;
            }

            .pingme-loader-row .thinking-message {
                display: flex !important;
                align-items: center;
                justify-content: flex-start;
                width: 48px;
                min-width: 48px;
                height: 46px;
                margin: 0 !important;
                padding: 0 !important;
                border: 0;
                border-radius: 0;
                background: transparent !important;
                box-shadow: none;
                overflow: visible;
                visibility: visible !important;
                opacity: 1 !important;
            }

            .pingme-ai-loader {
                position: relative;
                width: 34px;
                height: 34px;
                min-width: 34px;
                display: flex !important;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                overflow: visible;
                visibility: visible !important;
                opacity: 1 !important;
                animation: pingmeOrbFloat 1.25s ease-in-out infinite;
            }

            .pingme-loader-orbit {
                position: absolute;
                inset: 2px;
                border: 2px solid rgba(34,197,94,.22);
                border-radius: 50%;
                box-sizing: border-box;
                background: rgba(34,197,94,.035);
                animation: pingmeOrbitPulse 1.6s ease-in-out infinite;
            }

            .pingme-loader-orbit::before {
                content: "";
                position: absolute;
                inset: 4px;
                border-radius: 50%;
                border: 2px solid #22c55e;
                box-shadow: 0 0 8px rgba(34,197,94,.18);
            }

            .pingme-loader-dots,
            .pingme-loader-core {
                position: relative;
                z-index: 1;
                display: block !important;
                width: 9px;
                height: 9px;
                min-width: 9px;
                min-height: 9px;
                padding: 0;
                border: 0;
                border-radius: 50%;
                background: #22c55e !important;
                box-shadow: 0 0 9px rgba(34,197,94,.35);
                animation: pingmeDotPulse .7s ease-in-out infinite alternate;
                visibility: visible !important;
                opacity: 1;
            }

            .pingme-loader-dots span,
            .pingme-loader-core span {
                display: none !important;
            }

            /* Hide only the old standalone thinking indicator. */
            #thinking {
                display: none !important;
            }

            .message-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }

            .message-action-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .message-action-btn svg {
                width: 15px;
                height: 15px;
                fill: none;
                stroke: currentColor;
                stroke-width: 1.7;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            @keyframes pingmeOrbFloat {
                0%, 100% {
                    transform: translateY(0) scale(.96);
                }
                50% {
                    transform: translateY(-5px) scale(1.04);
                }
            }

            @keyframes pingmeDotPulse {
                from {
                    transform: scale(.7);
                    opacity: .65;
                }
                to {
                    transform: scale(1.2);
                    opacity: 1;
                }
            }

            @keyframes pingmeOrbitPulse {
                0%, 100% {
                    opacity: .65;
                    transform: scale(.96);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.04);
                }
            }

            @keyframes pingmeUserIn {
                from {
                    opacity: 0;
                    transform: translateY(6px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes pingmeAIIn {
                from {
                    opacity: 0;
                    transform: translateY(7px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* ======================================================
       HISTORY SUPPORT
       ====================================================== */

    let activeChatId = null;

    function getHistory() {
        return window.PingMeHistory || null;
    }

    function getActiveChatId() {
        if (activeChatId) return activeChatId;

        try {
            activeChatId =
                localStorage.getItem(CURRENT_CHAT_KEY) ||
                localStorage.getItem(ACTIVE_CHAT_KEY);
        } catch (_) {}

        return activeChatId;
    }

    function setActiveChatId(id) {
        if (!id) return;

        activeChatId = id;

        try {
            localStorage.setItem(ACTIVE_CHAT_KEY, id);
            localStorage.setItem(CURRENT_CHAT_KEY, id);
        } catch (_) {}
    }

    function makeTitle(text) {
        const clean = String(text || "")
            .replace(/\s+/g, " ")
            .trim();

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

            if (chat?.id) {
                setActiveChatId(chat.id);
                return chat.id;
            }
        } catch (error) {
            console.error(
                "PingMe History: Could not create chat.",
                error
            );
        }

        return null;
    }

    function messageText(node) {
        if (!node) return "";

        const clone = node.cloneNode(true);

        clone.querySelectorAll(
            ".pingme-message-actions, .message-actions, " +
            ".pingme-ai-loader, button"
        ).forEach(element => element.remove());

        return String(
            clone.innerText || clone.textContent || ""
        ).trim();
    }

    function saveLegacyMessage(node) {
        if (!node || node.dataset.historySaved === "true") return;

        const isUser = node.classList.contains("user-message");
        const isAI = node.classList.contains("ai-message");

        if (!isUser && !isAI) return;

        const content = messageText(node);
        if (!content) return;

        const history = getHistory();
        if (!history) return;

        const chatId = ensureChat(isUser ? content : "");
        if (!chatId) return;

        try {
            if (
                isUser &&
                typeof history.addUserMessage === "function"
            ) {
                history.addUserMessage(chatId, content);
            } else if (
                isAI &&
                typeof history.addAssistantMessage === "function"
            ) {
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
            console.error(
                "PingMe History: Could not save message.",
                error
            );
        }
    }

    function processNode(node) {
        if (!node || node.nodeType !== 1) return;

        if (node.matches(".user-message, .ai-message")) {
            saveLegacyMessage(node);
        }

        node.querySelectorAll?.(".user-message, .ai-message")
            .forEach(saveLegacyMessage);
    }

    function connectChatArea() {
        const area = document.getElementById("chatArea");

        if (!area || area.dataset.pingmeHistoryObserver === "true") {
            return;
        }

        area.dataset.pingmeHistoryObserver = "true";

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(processNode);

                const target = mutation.target?.nodeType === 1
                    ? mutation.target.closest(
                        ".user-message, .ai-message"
                    )
                    : mutation.target?.parentElement?.closest(
                        ".user-message, .ai-message"
                    );

                if (target) saveLegacyMessage(target);
            });
        });

        observer.observe(area, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    /* ======================================================
       LOADER
       ====================================================== */

    function addLoader() {
        const area = document.getElementById("chatArea");
        if (!area) return null;

        let row = document.getElementById(LOADER_ID);

        if (row) {
            if (row.parentElement !== area) {
                area.appendChild(row);
            }

            return row;
        }

        row = document.createElement("div");
        row.id = LOADER_ID;
        row.className = "message-row ai pingme-loader-row";
        row.setAttribute("role", "status");
        row.setAttribute(
            "aria-label",
            "PingMe is preparing a response"
        );

        const message = document.createElement("div");
        message.className = "message thinking-message";

        const loader = document.createElement("div");
        loader.className = "pingme-ai-loader";

        const orbit = document.createElement("div");
        orbit.className = "pingme-loader-orbit";

        const core = document.createElement("div");
        core.className = "pingme-loader-dots";

        loader.append(orbit, core);
        message.appendChild(loader);
        row.appendChild(message);
        area.appendChild(row);

        return row;
    }

    function showLoader() {
        const area = document.getElementById("chatArea");
        const row = addLoader();

        const thinking = document.getElementById("thinking");

        if (thinking) {
            thinking.classList.remove("show");
        }

        if (area && row) {
            area.scrollTop = area.scrollHeight;
        }
    }

    function hideLoader() {
        document.getElementById(LOADER_ID)?.remove();
        document.getElementById("pingmeFallbackLoader")?.remove();

        const thinking = document.getElementById("thinking");

        if (thinking) {
            thinking.classList.remove("show");
        }
    }

    window.PingMeLoader = {
        show: showLoader,
        hide: hideLoader
    };

    document.addEventListener("pingme:ai:start", showLoader);
    document.addEventListener("pingme:ai:complete", hideLoader);
    document.addEventListener("pingme:ai:error", hideLoader);

    /* ======================================================
       STARTUP
       ====================================================== */

    connectChatArea();

    window.addEventListener("load", () => {
        connectChatArea();

        if (getHistory()) {
            console.log("PingMe Chat Support: History connected.");
        } else {
            console.warn(
                "PingMe Chat Support: History Support not found."
            );
        }
    });

    console.log("PingMe Chat Support Connected");
})();