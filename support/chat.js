// ==========================================================
// PINGME AI — CHAT SUPPORT
// Message UI • History • Four-Corner Glow Loader
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

        /* LOADER ROW */  

        .pingme-loader-row {  
            display: flex;  
            align-items: center;  
            min-height: 42px;  
            margin: 6px 0;  
        }  

        .pingme-loader-row .thinking-message {  
            display: flex;  
            align-items: center;  
            justify-content: flex-start;  
            width: 70px;  
            height: 54px;  
            margin: 0;  
            padding: 0;  
            background: transparent;  
            overflow: visible;  
        }  

        .pingme-ai-loader {  
            position: relative;  
            width: 42px;  
            height: 42px;  
            display: flex;  
            align-items: center;  
            justify-content: center;  
            flex-shrink: 0;  
            isolation: isolate;  
        }  

        /* Four soft rounded corners — not circular */  

        .pingme-loader-orbit {  
            position: absolute;  
            inset: 3px;  
            box-sizing: border-box;  
            border: 2px solid transparent;  
            border-top-color: #9bc0ff;  
            border-right-color: #b4a2ff;  
            border-bottom-color: #c7d7ff;  
            border-left-color: #a9b8ff;  
            border-radius: 10px;  
            filter:  
                drop-shadow(0 0 2px rgba(116,157,255,.42))  
                drop-shadow(0 0 5px rgba(167,139,250,.24));  
            animation: pingmeOrbitSpin 2.8s linear infinite;  
            will-change: transform;  
        }  

        .pingme-loader-orbit::before {  
            content: "";  
            position: absolute;  
            inset: -3px;  
            box-sizing: border-box;  
            border: 1px solid transparent;  
            border-top-color: rgba(115,157,255,.38);  
            border-right-color: rgba(177,154,255,.2);  
            border-radius: 12px;  
        }  

        /* Keep the three dots still while the outline moves */  

        .pingme-loader-dots {  
            position: relative;  
            z-index: 1;  
            display: flex;  
            align-items: center;  
            justify-content: center;  
            gap: 4px;  
        }  

        .pingme-loader-dots span {  
            display: block;  
            width: 4px;  
            height: 4px;  
            flex-shrink: 0;  
            border-radius: 50%;  
            background: #252525;  
            animation: pingmeDotPulse 1.05s ease-in-out infinite;  
        }  

        .pingme-loader-dots span:nth-child(2) {  
            animation-delay: .15s;  
        }  

        .pingme-loader-dots span:nth-child(3) {  
            animation-delay: .3s;  
        }  

        .thinking {  
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

        @keyframes pingmeOrbitSpin {  
            from { transform: rotate(0deg); }  
            to { transform: rotate(360deg); }  
        }  

        @keyframes pingmeDotPulse {  
            0%, 60%, 100% {  
                opacity: .5;  
                transform: scale(.85);  
            }  
            30% {  
                opacity: 1;  
                transform: scale(1.12);  
            }  
        }  

        @media (prefers-reduced-motion: reduce) {  
            .pingme-loader-orbit,  
            .pingme-loader-dots span {  
                animation: none !important;  
            }  
        }  
    `;  

    document.head.appendChild(style);  
}  

// ======================================================  
// HISTORY SUPPORT — PRESERVED  
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

function saveLegacyMessage(node) {  
    if (!node || node.dataset.historySaved === "true") {  
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
// FOUR-CORNER GLOW LOADER  
// ======================================================  

function addLoader() {  
    const area = document.getElementById("chatArea");  
    if (!area) return null;  

    let row = document.getElementById(LOADER_ID);  

    if (row) {  
        if (row.parentElement !== area) area.appendChild(row);  
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

    const orbit = document.createElement("div");  
    orbit.className = "pingme-loader-orbit";  

    const dots = document.createElement("div");  
    dots.className = "pingme-loader-dots";  
    dots.innerHTML = "<span></span><span></span><span></span>";  

    loader.append(orbit, dots);  
    message.appendChild(loader);  
    row.appendChild(message);  
    area.appendChild(row);  

    area.scrollTop = area.scrollHeight;  
    return row;  
}  

function showLoader() {  
    const row = addLoader();  

    const area = document.getElementById("chatArea");  
    if (area && row) area.scrollTop = area.scrollHeight;  

    const thinking = document.getElementById("thinking");  
    if (thinking) thinking.classList.remove("show");  
}  

function hideLoader() {  
    const row = document.getElementById(LOADER_ID);  

    if (row) {  
        row.querySelectorAll("*").forEach(element => {  
            element.style.animation = "none";  
        });  

        row.remove();  
    }  

    // Also clear the old loader if present.  
    const oldThinking = document.getElementById("thinking");  
    if (oldThinking) oldThinking.classList.remove("show");  
}  

// API used by script.js  
window.PingMeLoader = {  
    show: showLoader,  
    hide: hideLoader  
};  

document.addEventListener("pingme:ai:start", showLoader);  
document.addEventListener("pingme:ai:complete", hideLoader);  
document.addEventListener("pingme:ai:error", hideLoader);  

// ======================================================  
// LEGACY THINKING ELEMENT — PRESERVED  
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