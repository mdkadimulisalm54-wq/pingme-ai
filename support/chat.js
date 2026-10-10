
/* ==========================================================
   PINGME AI — CHAT SUPPORT
   History • Floating Loader • Typewriter
   ========================================================== */

(() => {
    "use strict";

    if (window.__pingmeChatSupportLoaded) return;
    window.__pingmeChatSupportLoaded = true;

    const STYLE_ID = "pingme-chat-support-style";
    const LOADER_ID = "pingmeAiLoaderRow";
    const ACTIVE_CHAT_KEY = "pingme_active_chat_id";
    const CURRENT_CHAT_KEY = "pingme_current_chat_id";

    /* ===================== STYLES ===================== */

    const oldStyle = document.getElementById(STYLE_ID);
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        .pingme-loader-row {
            display:flex;
            align-items:center;
            min-height:46px;
            margin:8px 0;
        }

        .pingme-loader-row .thinking-message {
            display:flex;
            align-items:center;
            width:48px;
            height:46px;
            margin:0;
            padding:0;
            background:transparent;
            overflow:visible;
        }

        .pingme-ai-loader {
            position:relative;
            width:34px;
            height:34px;
            display:flex;
            align-items:center;
            justify-content:center;
            flex-shrink:0;
            animation:pingmeOrbFloat 1.2s ease-in-out infinite;
        }

        .pingme-loader-orbit {
            position:absolute;
            inset:2px;
            border:2px solid rgba(34,197,94,.25);
            border-radius:50%;
            background:rgba(34,197,94,.04);
            box-sizing:border-box;
        }

        .pingme-loader-orbit::before {
            content:"";
            position:absolute;
            inset:4px;
            border:2px solid #22c55e;
            border-radius:50%;
            box-shadow:0 0 8px rgba(34,197,94,.2);
        }

        .pingme-loader-dots {
            width:9px;
            height:9px;
            border-radius:50%;
            background:#22c55e;
            box-shadow:0 0 9px rgba(34,197,94,.35);
            position:relative;
            z-index:1;
        }

        .pingme-typewriter-message {
            white-space:pre-wrap !important;
            overflow-wrap:anywhere;
        }

        .thinking {
            display:none !important;
        }

        @keyframes pingmeOrbFloat {
            0%,100% { transform:translateY(0) scale(.96); }
            50% { transform:translateY(-5px) scale(1.04); }
        }

        @media(prefers-reduced-motion:reduce) {
            .pingme-ai-loader { animation:none !important; }
        }
    `;
    document.head.appendChild(style);

    /* ===================== HISTORY ===================== */

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

            if (chat?.id) {
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
            } else if (
                isAI && typeof history.addAssistantMessage === "function"
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
            console.error("PingMe History: Could not save message.", error);
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
        if (!area || area.dataset.pingmeHistoryObserver === "true") return;

        area.dataset.pingmeHistoryObserver = "true";

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(processNode);

                const target = mutation.target?.nodeType === 1
                    ? mutation.target.closest(".user-message, .ai-message")
                    : mutation.target?.parentElement?.closest(
                        ".user-message, .ai-message"
                    );

                if (target) saveLegacyMessage(target);
            });
        });

        observer.observe(area, {
            childList:true,
            subtree:true,
            characterData:true
        });
    }

    /* ===================== LOADER ===================== */

    function showLoader() {
        const area = document.getElementById("chatArea");
        if (!area) return;

        document.getElementById("pingmeFallbackLoader")?.remove();

        let row = document.getElementById(LOADER_ID);

        if (!row) {
            row = document.createElement("div");
            row.id = LOADER_ID;
            row.className = "message-row ai pingme-loader-row";

            const message = document.createElement("div");
            message.className = "message thinking-message";

            const loader = document.createElement("div");
            loader.className = "pingme-ai-loader";
            loader.setAttribute("role", "status");
            loader.setAttribute("aria-label", "PingMe is preparing a response");

            const orbit = document.createElement("div");
            orbit.className = "pingme-loader-orbit";

            const core = document.createElement("div");
            core.className = "pingme-loader-dots";

            loader.append(orbit, core);
            message.appendChild(loader);
            row.appendChild(message);
        }

        if (row.parentElement !== area) area.appendChild(row);

        const thinking = document.getElementById("thinking");
        if (thinking) thinking.classList.remove("show");

        area.scrollTop = area.scrollHeight;
    }

    function hideLoader() {
        document.getElementById(LOADER_ID)?.remove();
        document.getElementById("pingmeFallbackLoader")?.remove();

        const thinking = document.getElementById("thinking");
        if (thinking) thinking.classList.remove("show");
    }

    /* ===================== TYPEWRITER ===================== */

    async function typeResponse(message, answer) {
        if (!message) return;

        const text = String(answer ?? "");
        message.classList.add("pingme-typewriter-message");
        message.textContent = "";

        const textNode = document.createTextNode("");
        message.appendChild(textNode);

        const area = document.getElementById("chatArea");

        for (let i = 0; i < text.length; i++) {
            textNode.data = text.slice(0, i + 1);

            if (area) area.scrollTop = area.scrollHeight;

            const char = text[i];
            let delay = 22;

            if (char === "\n") delay = 45;
            else if (/[.!?।]/.test(char)) delay = 95;
            else if (char === "," || char === ";") delay = 40;

            await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (area) area.scrollTop = area.scrollHeight;
    }

    window.PingMeLoader = {
        show: showLoader,
        hide: hideLoader
    };

    window.PingMeChatUI = {
        showLoader,
        hideLoader,
        typeResponse
    };

    document.addEventListener("pingme:ai:start", showLoader);
    document.addEventListener("pingme:ai:complete", hideLoader);
    document.addEventListener("pingme:ai:error", hideLoader);

    /* ===================== STARTUP ===================== */

    connectChatArea();

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
