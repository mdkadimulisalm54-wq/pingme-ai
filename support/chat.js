
/* ==========================================================
   PINGME AI — CHAT SUPPORT
   Sky Loader • Message UI • History Compatibility
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
       CHAT STYLES
       ====================================================== */

    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            /* Keep messages inside the chat area */
            #chatArea .message-row {
                box-sizing: border-box;
                min-width: 0;
                max-width: 100%;
            }

            #chatArea .message-row.user {
                display: flex;
                justify-content: flex-end;
                width: 100%;
            }

            #chatArea .message-row.ai {
                display: flex;
                justify-content: flex-start;
                width: 100%;
            }

            #chatArea .message-row.user .message-box {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                width: fit-content;
                max-width: min(84%, 680px);
                min-width: 0;
                box-sizing: border-box;
            }

            #chatArea .message-row.ai .message-box {
                width: 100%;
                max-width: 100%;
                min-width: 0;
                box-sizing: border-box;
            }

            #chatArea .message-row .message {
                box-sizing: border-box;
                min-width: 0;
                max-width: 100%;
                overflow-wrap: anywhere;
                word-break: normal;
                white-space: pre-wrap;
                line-height: 1.65;
            }

            /* User bubble: white, sky blue and soft mint */
            #chatArea .message-row.user .message {
                display: block;
                width: fit-content;
                max-width: 100%;
                padding: 10px 14px;
                border: 1px solid #cceaff;
                border-radius: 19px 19px 5px 19px;
                background: linear-gradient(
                    135deg,
                    #ffffff 0%,
                    #edf8ff 58%,
                    #eafaf5 100%
                );
                color: #213b4a;
                box-shadow: 0 2px 9px rgba(92, 173, 214, .09);
                animation: pingmeMessageEnter .24s ease-out both;
            }

            /* AI answer */
            #chatArea .message-row.ai .message {
                color: inherit;
                overflow-wrap: anywhere;
            }

            /* Typewriter cursor */
            #chatArea .message.typing-active::after {
                content: "";
                display: inline-block;
                width: 2px;
                height: 1em;
                margin-left: 2px;
                vertical-align: -2px;
                border-radius: 2px;
                background: #82cfff;
                animation: pingmeCursorBlink .8s steps(2, start) infinite;
            }

            /* Legacy message classes: preserve compatibility */
            .user-message {
                display: block;
                width: fit-content;
                max-width: 84%;
                margin: 10px 0 10px auto !important;
                padding: 10px 14px !important;
                border: 1px solid #cceaff !important;
                border-radius: 19px 19px 5px 19px !important;
                background: linear-gradient(
                    135deg, #ffffff, #edf8ff 58%, #eafaf5
                ) !important;
                color: #213b4a !important;
                box-shadow: 0 2px 9px rgba(92, 173, 214, .09);
                line-height: 1.5;
                white-space: pre-wrap;
                overflow-wrap: anywhere;
                animation: pingmeMessageEnter .24s ease-out both;
            }

            .ai-message {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
                margin: 14px 0 !important;
                padding: 12px 0 !important;
                border-radius: 12px;
                color: inherit !important;
                line-height: 1.65;
                overflow-wrap: anywhere;
                animation: pingmeMessageEnter .24s ease-out both;
            }

            .ai-message h3 {
                margin: 8px 0 6px !important;
            }

            /* =================================================
               NEW SKY LOADER
               ================================================= */

            #chatArea .pingme-loader-row {
                display: flex !important;
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                min-height: 48px;
                margin: 8px 0 12px;
                padding: 0;
                visibility: visible !important;
                opacity: 1 !important;
                animation: pingmeLoaderEnter .25s ease-out both;
            }

            #chatArea .pingme-loader-row .thinking-message {
                display: flex !important;
                align-items: center;
                justify-content: flex-start;
                width: 44px;
                min-width: 44px;
                height: 44px;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                border-radius: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
                overflow: visible;
                visibility: visible !important;
                opacity: 1 !important;
            }

            #chatArea .pingme-ai-loader {
                position: relative;
                display: flex !important;
                align-items: center;
                justify-content: center;
                flex: 0 0 38px;
                width: 38px;
                height: 38px;
                overflow: visible;
                border-radius: 50%;
                background: radial-gradient(
                    circle,
                    rgba(167, 225, 255, .28) 0%,
                    rgba(192, 255, 231, .16) 48%,
                    transparent 74%
                );
                filter: drop-shadow(0 0 5px rgba(126, 209, 255, .18));
                animation: pingmeSkyFloat 1.8s ease-in-out infinite;
            }

            #chatArea .pingme-loader-orbit {
                position: absolute;
                inset: 2px;
                box-sizing: border-box;
                border: 2px solid transparent;
                border-top-color: #7dcfff;
                border-right-color: #b7f2df;
                border-bottom-color: #ffffff;
                border-left-color: #c5eaff;
                border-radius: 50%;
                animation: pingmeSkySpin 1.15s linear infinite;
            }

            #chatArea .pingme-loader-orbit::before {
                content: "";
                position: absolute;
                inset: 5px;
                box-sizing: border-box;
                border: 1.5px solid rgba(130, 211, 255, .58);
                border-radius: 50%;
                animation: pingmeSkyInnerSpin 2s linear infinite;
            }

            #chatArea .pingme-loader-orbit::after {
                content: "";
                position: absolute;
                top: -3px;
                left: 50%;
                width: 6px;
                height: 6px;
                border: 1px solid #ffffff;
                border-radius: 50%;
                background: #8bd7ff;
                box-shadow: 0 0 8px rgba(116, 207, 255, .7);
                transform: translateX(-50%);
            }

            #chatArea .pingme-loader-dots,
            #chatArea .pingme-loader-core {
                position: relative;
                z-index: 1;
                display: block !important;
                flex: 0 0 10px;
                width: 10px;
                height: 10px;
                min-width: 10px;
                min-height: 10px;
                padding: 0;
                border: 2px solid rgba(255, 255, 255, .9);
                border-radius: 50%;
                background: linear-gradient(135deg, #9cddff, #b8f2df) !important;
                box-shadow:
                    0 0 7px rgba(125, 207, 255, .55),
                    0 0 13px rgba(163, 238, 218, .25);
                animation: pingmeSkyPulse .8s ease-in-out infinite alternate;
                visibility: visible !important;
                opacity: 1 !important;
            }

            #chatArea .pingme-loader-dots span,
            #chatArea .pingme-loader-core span {
                display: none !important;
            }

            /* Hide the old separate indicator; keep the new loader */
            #thinking {
                display: none !important;
            }

            /* Copy and link actions */
            #chatArea .message-actions,
            #chatArea .pingme-message-actions {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 8px;
                margin-top: 10px;
            }

            #chatArea .message-action-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            #chatArea .message-action-btn svg {
                width: 15px;
                height: 15px;
                fill: none;
                stroke: currentColor;
                stroke-width: 1.7;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            /* Input stays inside its own box as it grows */
            #messageInput {
                box-sizing: border-box;
                min-width: 0;
                max-width: 100%;
                max-height: 120px;
                overflow-y: auto;
                resize: none;
            }

            @keyframes pingmeSkySpin {
                to { transform: rotate(360deg); }
            }

            @keyframes pingmeSkyInnerSpin {
                to { transform: rotate(-360deg); }
            }

            @keyframes pingmeSkyFloat {
                0%, 100% { transform: translateY(0) scale(.97); }
                50% { transform: translateY(-3px) scale(1.04); }
            }

            @keyframes pingmeSkyPulse {
                from { transform: scale(.72); opacity: .68; }
                to { transform: scale(1.08); opacity: 1; }
            }

            @keyframes pingmeCursorBlink {
                to { visibility: hidden; }
            }

            @keyframes pingmeLoaderEnter {
                from { opacity: 0; transform: translateY(4px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes pingmeMessageEnter {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @media (prefers-reduced-motion: reduce) {
                #chatArea .pingme-ai-loader,
                #chatArea .pingme-loader-orbit,
                #chatArea .pingme-loader-orbit::before,
                #chatArea .pingme-loader-dots,
                #chatArea .pingme-loader-core {
                    animation-duration: 2.5s;
                }

                #chatArea .message.typing-active::after {
                    animation: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* ======================================================
       HISTORY SUPPORT — LEGACY COMPATIBILITY
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
       LOADER API
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
        if (thinking) thinking.classList.remove("show");

        if (area && row) {
            area.scrollTop = area.scrollHeight;
        }
    }

    function hideLoader() {
        document.getElementById(LOADER_ID)?.remove();
        document.getElementById("pingmeFallbackLoader")?.remove();

        const thinking = document.getElementById("thinking");
        if (thinking) thinking.classList.remove("show");
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
