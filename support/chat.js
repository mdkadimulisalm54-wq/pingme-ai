// ==========================================================
// PINGME AI — CHAT SUPPORT
// Message UI • History • Animated SVG Sparkle Loader
// ==========================================================

(() => {
    "use strict";

    if (window.__pingmeChatSupportLoaded) return;
    window.__pingmeChatSupportLoaded = true;

    const STYLE_ID = "pingme-chat-support-style";
    const ACTIVE_CHAT_KEY = "pingme_active_chat_id";
    const CURRENT_CHAT_KEY = "pingme_current_chat_id";
    const LOADER_ID = "pingmeAiLoaderRow";

    // ======================================================
    // STYLES
    // ======================================================

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

            .pingme-loader-row {
                display: flex;
                align-items: center;
                min-height: 42px;
                margin: 6px 0;
            }

            .pingme-ai-loader {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 5px 2px;
                animation: pingmeSparkleRotate 2.4s linear infinite;
                filter: drop-shadow(0 0 5px rgba(130,100,255,.18));
            }

            .pingme-ai-loader svg {
                display: block;
                width: 100%;
                height: 100%;
                overflow: visible;
                animation: pingmeSparklePulse 1.15s ease-in-out infinite alternate;
            }

            .pingme-ai-loader svg path {
                transform-origin: center;
            }

            .thinking {
                display: none !important;
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

            @keyframes pingmeSparkleRotate {
                to {
                    transform: rotate(360deg);
                }
            }

            @keyframes pingmeSparklePulse {
                from {
                    transform: scale(.8);
                }
                to {
                    transform: scale(1.08);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .user-message,
                .ai-message,
                .pingme-ai-loader,
                .pingme-ai-loader svg {
                    animation: none !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // ======================================================
    // HISTORY SUPPORT
    // ======================================================

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

            if (chat && chat.id) {
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
            ".pingme-message-actions, .pingme-ai-loader, button"
        ).forEach(element => element.remove());

        return String(
            clone.innerText || clone.textContent || ""
        ).trim();
    }

    // Legacy message support only.
    // Main script.js saves its own messages directly.
    function saveLegacyMessage(node) {
        if (
            !node ||
            node.dataset.historySaved === "true"
        ) {
            return;
        }

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
            } else if (
                typeof history.addMessage === "function"
            ) {
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

        node.querySelectorAll?.(
            ".user-message, .ai-message"
        ).forEach(saveLegacyMessage);
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

    // ======================================================
    // SVG SPARKLE LOADER
    // ======================================================

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

        const message = document.createElement("div");
        message.className = "message thinking-message";

        const loader = document.createElement("div");
        loader.className = "pingme-ai-loader";
        loader.setAttribute("role", "status");
        loader.setAttribute("aria-label", "PingMe is thinking");

        loader.innerHTML = `
            <svg viewBox="0 0 48 48" aria-hidden="true">
                <defs>
                    <linearGradient
                        id="pingmeSparkleGradient"
                        x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#4285F4"/>
                        <stop offset="48%" stop-color="#9B72CB"/>
                        <stop offset="100%" stop-color="#D96570"/>
                    </linearGradient>
                    <linearGradient
                        id="pingmeSparkleSmallGradient"
                        x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#67B7FF"/>
                        <stop offset="100%" stop-color="#A78BFA"/>
                    </linearGradient>
                </defs>

                <path
                    fill="url(#pingmeSparkleGradient)"
                    d="M24 1 C27 15 33 21 47 24
                       C33 27 27 33 24 47
                       C21 33 15 27 1 24
                       C15 21 21 15 24 1Z"/>

                <path
                    fill="url(#pingmeSparkleSmallGradient)"
                    d="M40 1 C41 5 43 7 47 8
                       C43 9 41 11 40 15
                       C39 11 37 9 33 8
                       C37 7 39 5 40 1Z"/>
            </svg>
        `;

        message.appendChild(loader);
        row.appendChild(message);
        area.appendChild(row);

        area.scrollTop = area.scrollHeight;

        return row;
    }

    function showLoader() {
        addLoader();

        const area = document.getElementById("chatArea");

        if (area) {
            area.scrollTop = area.scrollHeight;
        }

        const thinking = document.getElementById("thinking");

        if (thinking) {
            thinking.classList.remove("show");
        }
    }

    function hideLoader() {
        document.getElementById(LOADER_ID)?.remove();
    }

    // Shared loader API for script.js.
    window.PingMeLoader = {
        show: showLoader,
        hide: hideLoader
    };

    document.addEventListener("pingme:ai:start", showLoader);
    document.addEventListener("pingme:ai:complete", hideLoader);
    document.addEventListener("pingme:ai:error", hideLoader);

    // ======================================================
    // LEGACY THINKING ELEMENT
    // ======================================================

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

    // ======================================================
    // STARTUP
    // ======================================================

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