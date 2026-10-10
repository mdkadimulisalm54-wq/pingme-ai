/* ==========================================================
   PINGME AI — COMPLETE CHAT SUPPORT & MAIN SCRIPT
   Animated Green Loader • Typing & Input Handlers • History Compatibility
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
       CHAT STYLES & GREEN LOADER ANIMATION
       ====================================================== */

    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
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

            /* User message bubble */
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

            /* AI message */
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
                background: #10a37f;
                animation: pingmeCursorBlink .8s steps(2, start) infinite;
            }

            /* Legacy message compatibility */
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
               ANIMATED GREEN LOADER (PULSE CIRCLE)
               ================================================= */

            #chatArea .pingme-loader-row {
                display: flex !important;
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                min-height: 38px;
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
                gap: 10px;
                width: auto;
                min-width: 0;
                height: auto;
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

            /* Green Pulse Loader Circle */
            #chatArea .pingme-ai-loader {
                position: relative;
                display: flex !important;
                align-items: center;
                justify-content: center;
                flex: 0 0 26px;
                width: 26px;
                height: 26px;
                overflow: visible;
                border-radius: 50%;
                background-color: #10a37f;
                box-shadow: 0 0 0 rgba(16, 163, 127, 0.4);
                animation: pingmeGreenPulse 1.4s infinite ease-in-out;
            }

            @keyframes pingmeGreenPulse {
                0% {
                    transform: scale(0.92);
                    box-shadow: 0 0 0 0 rgba(16, 163, 127, 0.7);
                }
                70% {
                    transform: scale(1.12);
                    box-shadow: 0 0 0 8px rgba(16, 163, 127, 0);
                }
                100% {
                    transform: scale(0.92);
                    box-shadow: 0 0 0 0 rgba(16, 163, 127, 0);
                }
            }

            /* Animated English status */
            #chatArea .pingme-loader-status {
                display: inline-flex !important;
                align-items: center;
                flex-wrap: wrap;
                min-width: 0;
                color: #929da8;
                font-family: inherit;
                font-size: 13px;
                font-weight: 400;
                line-height: 1.5;
                letter-spacing: .1px;
                white-space: pre-wrap;
            }

            #chatArea .pingme-loader-status span {
                display: inline-block;
                animation: pingmeTextWave 1.5s ease-in-out infinite;
                animation-delay: calc(var(--i) * 35ms);
            }

            /* Hide old indicator */
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

            /* Input sizing */
            #messageInput {
                box-sizing: border-box;
                min-width: 0;
                max-width: 100%;
                max-height: 120px;
                overflow-y: auto;
                resize: none;
            }

            /* Animations */
            @keyframes pingmeTextWave {
                0%, 70%, 100% {
                    opacity: .65;
                    transform: translateY(0);
                }
                35% {
                    opacity: 1;
                    transform: translateY(-1px);
                }
            }

            @keyframes pingmeCursorBlink {
                to { visibility: hidden; }
            }

            @keyframes pingmeLoaderEnter {
                from {
                    opacity: 0;
                    transform: translateY(3px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes pingmeMessageEnter {
                from {
                    opacity: 0;
                    transform: translateY(5px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #chatArea .pingme-ai-loader,
                #chatArea .pingme-loader-status span {
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
            ".pingme-ai-loader, .pingme-loader-status, button"
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
       LOADER API (GREEN PULSE CIRCLE)
       ====================================================== */
    function addLoader(label = "Thinking...") {
        const area = document.getElementById("chatArea");
        if (!area) return null;

        let row = document.getElementById(LOADER_ID);

        if (!row) {
            row = document.createElement("div");
            row.id = LOADER_ID;
            row.className = "message-row ai pingme-loader-row";
            row.setAttribute("role", "status");

            const message = document.createElement("div");
            message.className = "message thinking-message";

            const loader = document.createElement("div");
            loader.className = "pingme-ai-loader";

            const status = document.createElement("span");
            status.className = "pingme-loader-status";

            message.append(loader, status);
            row.appendChild(message);
            area.appendChild(row);
        } else if (row.parentElement !== area) {
            area.appendChild(row);
        }

        const status = row.querySelector(".pingme-loader-status");
        const text = String(label || "Thinking...");

        if (status && status.dataset.label !== text) {
            status.replaceChildren();

            [...text].forEach((character, index) => {
                const letter = document.createElement("span");

                letter.textContent =
                    character === " " ? "\u00a0" : character;

                letter.style.setProperty("--i", index);
                status.appendChild(letter);
            });

            status.dataset.label = text;
            row.setAttribute("aria-label", text);
        }

        return row;
    }

    function showLoader(label = "Thinking...") {
        const area = document.getElementById("chatArea");
        const row = addLoader(label);

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
       USER INPUT, SEND & BUTTON HANDLERS (ORIGINAL LOGIC)
       ====================================================== */

    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");
    const settingsBtn = document.getElementById("settingsBtn");
    const menuBtn = document.getElementById("menuBtn");
    const micBtn = document.getElementById("micBtn");

    if (sendBtn) {
        sendBtn.addEventListener("click", event => {
            event.preventDefault();
            if (typeof sendMessage === "function") {
                sendMessage();
            }
        });
    }

    if (messageInput) {
        messageInput.addEventListener("keydown", event => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (typeof sendMessage === "function") {
                    sendMessage();
                }
            }
        });

        messageInput.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 120) + "px";
        });
    }

    document.querySelectorAll(".suggestion-item").forEach(button => {
        button.addEventListener("click", function () {
            if (!messageInput) return;
            const text = this.querySelector(".text");

            messageInput.value = text
                ? text.textContent.trim()
                : this.textContent.trim();

            messageInput.focus();
            messageInput.dispatchEvent(new Event("input"));
        });
    });

    if (settingsBtn) {
        settingsBtn.addEventListener("click", function () {
            alert("PingMe AI Settings পরে যোগ করা হবে।");
        });
    }

    if (menuBtn) {
        menuBtn.addEventListener("click", function () {
            alert("History পরে যোগ করা হবে।");
        });
    }

    if (micBtn) {
        micBtn.addEventListener("click", function () {
            alert("Voice feature পরে যোগ করা হবে।");
        });
    }

    /* ======================================================
       STARTUP
       ====================================================== */

    connectChatArea();

    if (typeof loadCurrentHistoryChat === "function") {
        loadCurrentHistoryChat();
    }

    console.log("PingMe AI is ready.");
    console.log("Nickname: PingMe");
    console.log("Company: PingMe AI");
    console.log("PingMe Chat Support Connected");
})();
