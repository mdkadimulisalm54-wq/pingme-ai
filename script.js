/* ==========================================================
   PINGME AI — COMPLETE CHAT SUPPORT & ANIMATION SCRIPT
   Green Pulse Loader • Smooth Typing Effect • History Compatibility
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
       CHAT STYLES, GREEN LOADER & TYPING ANIMATION
       ====================================================== */

    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            #chatArea .message-row, .chat-area .message-row {
                box-sizing: border-box;
                min-width: 0;
                max-width: 100%;
                margin-bottom: 14px;
                display: flex;
                width: 100%;
            }

            #chatArea .message-row.user, .chat-area .message-row.user {
                justify-content: flex-end;
            }

            #chatArea .message-row.ai, .chat-area .message-row.ai {
                justify-content: flex-start;
            }

            /* User message bubble */
            .user-message, #chatArea .message-row.user .message {
                display: block;
                width: fit-content;
                max-width: 84%;
                padding: 10px 14px;
                border: 1px solid #cceaff;
                border-radius: 19px 19px 5px 19px;
                background: linear-gradient(135deg, #ffffff 0%, #edf8ff 58%, #eafaf5 100%);
                color: #213b4a;
                box-shadow: 0 2px 9px rgba(92, 173, 214, .09);
                line-height: 1.5;
                white-space: pre-wrap;
                overflow-wrap: anywhere;
                animation: pingmeMessageEnter .24s ease-out both;
            }

            /* AI message styling */
            .ai-message, #chatArea .message-row.ai .message {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
                padding: 4px 0;
                color: inherit;
                line-height: 1.65;
                overflow-wrap: anywhere;
                animation: pingmeMessageEnter .24s ease-out both;
            }

            /* Typewriter cursor effect */
            .ai-message.typing-active::after, 
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

            /* =================================================
               GREEN PULSE LOADER (AI THINKING ANIMATION)
               ================================================= */

            .pingme-loader-row {
                display: flex !important;
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                min-height: 38px;
                margin: 8px 0 12px;
                padding: 0;
                animation: pingmeLoaderEnter .25s ease-out both;
            }

            .pingme-loader-row .thinking-message {
                display: flex !important;
                align-items: center;
                justify-content: flex-start;
                gap: 12px;
                background: transparent !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
            }

            /* সবুজ রঙের অ্যানিমেটেড আপ-ডাউন পাল্স বৃত্ত */
            .pingme-ai-loader {
                position: relative;
                display: flex !important;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background-color: #10a37f;
                box-shadow: 0 0 0 rgba(16, 163, 127, 0.4);
                animation: pingmeGreenPulse 1.4s infinite ease-in-out;
            }

            @keyframes pingmeGreenPulse {
                0% {
                    transform: scale(0.9);
                    box-shadow: 0 0 0 0 rgba(16, 163, 127, 0.7);
                }
                50% {
                    transform: scale(1.15); /* আপ-ডাউন বা বড়-ছোট হওয়ার ইফেক্ট */
                    box-shadow: 0 0 0 8px rgba(16, 163, 127, 0);
                }
                100% {
                    transform: scale(0.9);
                    box-shadow: 0 0 0 0 rgba(16, 163, 127, 0);
                }
            }

            .pingme-loader-status {
                color: #929da8;
                font-size: 13px;
                font-family: inherit;
            }

            /* পুরানো ইন্ডিকেটর হাইড করার জন্য */
            #thinking {
                display: none !important;
            }

            #messageInput {
                box-sizing: border-box;
                min-width: 0;
                max-width: 100%;
                max-height: 120px;
                overflow-y: auto;
                resize: none;
            }

            @keyframes pingmeCursorBlink {
                to { visibility: hidden; }
            }

            @keyframes pingmeLoaderEnter {
                from { opacity: 0; transform: translateY(3px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes pingmeMessageEnter {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;

        document.head.appendChild(style);
    }

    /* ======================================================
       HISTORY & CHAT AREA OBSERVER
       ====================================================== */

    let activeChatId = null;

    function getHistory() {
        return window.PingMeHistory || null;
    }

    function getActiveChatId() {
        if (activeChatId) return activeChatId;
        try {
            activeChatId = localStorage.getItem(CURRENT_CHAT_KEY) || localStorage.getItem(ACTIVE_CHAT_KEY);
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
        const clean = String(text || "").replace(/\s+/g, " ").trim();
        return clean ? clean.slice(0, 45) : "New Chat";
    }

    function ensureChat(firstMessage = "") {
        const history = getHistory();
        if (!history) return null;
        const id = getActiveChatId();
        if (id && typeof history.getChat === "function" && history.getChat(id)) return id;
        if (typeof history.createChat !== "function") return null;
        try {
            const chat = history.createChat(makeTitle(firstMessage));
            if (chat?.id) {
                setActiveChatId(chat.id);
                return chat.id;
            }
        } catch (error) {
            console.error("PingMe History Error:", error);
        }
        return null;
    }

    function messageText(node) {
        if (!node) return "";
        const clone = node.cloneNode(true);
        clone.querySelectorAll(".pingme-message-actions, .message-actions, .pingme-ai-loader, .pingme-loader-status, button").forEach(el => el.remove());
        return String(clone.innerText || clone.textContent || "").trim();
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
            if (isUser && typeof history.addUserMessage === "function") {
                history.addUserMessage(chatId, content);
            } else if (isAI && typeof history.addAssistantMessage === "function") {
                history.addAssistantMessage(chatId, content);
            } else if (typeof history.addMessage === "function") {
                history.addMessage(chatId, { role: isUser ? "user" : "assistant", content, timestamp: Date.now() });
            }
            node.dataset.historySaved = "true";
        } catch (error) {
            console.error("Save message error:", error);
        }
    }

    function connectChatArea() {
        const area = document.getElementById("chatArea") || document.querySelector(".chat-area");
        if (!area || area.dataset.pingmeHistoryObserver === "true") return;
        area.dataset.pingmeHistoryObserver = "true";

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.matches(".user-message, .ai-message")) saveLegacyMessage(node);
                        node.querySelectorAll?.(".user-message, .ai-message").forEach(saveLegacyMessage);
                    }
                });
            });
        });

        observer.observe(area, { childList: true, subtree: true });
    }

    /* ======================================================
       GREEN PULSE LOADER API
       ====================================================== */

    function showLoader(label = "Thinking...") {
        const area = document.getElementById("chatArea") || document.querySelector(".chat-area");
        if (!area) return;

        hideLoader(); // পুরোনো লোডার থাকলে সরিয়ে ফেলা

        const row = document.createElement("div");
        row.id = LOADER_ID;
        row.className = "message-row ai pingme-loader-row";

        const message = document.createElement("div");
        message.className = "message thinking-message";

        const loader = document.createElement("div");
        loader.className = "pingme-ai-loader"; // সবুজ বৃত্ত অ্যানিমেশন

        const status = document.createElement("span");
        status.className = "pingme-loader-status";
        status.textContent = label;

        message.append(loader, status);
        row.appendChild(message);
        area.appendChild(row);
        area.scrollTop = area.scrollHeight;
    }

    function hideLoader() {
        document.getElementById(LOADER_ID)?.remove();
    }

    window.PingMeLoader = {
        show: showLoader,
        hide: hideLoader
    };

    document.addEventListener("pingme:ai:start", () => showLoader());
    document.addEventListener("pingme:ai:complete", hideLoader);
    document.addEventListener("pingme:ai:error", hideLoader);

    /* ======================================================
       INPUT & BUTTON HANDLERS
       ====================================================== */

    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");

    if (sendBtn) {
        sendBtn.addEventListener("click", event => {
            event.preventDefault();
            if (typeof sendMessage === "function") sendMessage();
        });
    }

    if (messageInput) {
        messageInput.addEventListener("keydown", event => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (typeof sendMessage === "function") sendMessage();
            }
        });

        messageInput.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 120) + "px";
        });
    }

    /* ======================================================
       INITIALIZE
       ====================================================== */

    connectChatArea();
    if (typeof loadCurrentHistoryChat === "function") loadCurrentHistoryChat();

    console.log("PingMe Chat Support & Animations Connected Successfully.");
})();
