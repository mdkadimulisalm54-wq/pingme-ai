/*
 * PingMe AI — Message Actions
 * File: support/MessageActions.js
 *
 * Includes:
 * - Copy
 * - Like
 * - Dislike
 * - Read Aloud
 * - Three-dot menu
 * - Branch in new chat
 * - Retry
 * - Search the web
 *
 * Architecture:
 * All functionality lives in this Support JS file.
 */

(function () {
    "use strict";

    /* =========================================================
       CONFIG
    ========================================================= */

    const CONFIG = {
        rootClass: "pingme-message-actions-root",
        actionBarClass: "pingme-message-actions",
        menuClass: "pingme-message-actions-menu",
        processedClass: "pingme-message-actions-ready",

        assistantSelectors: [
            "[data-role='assistant']",
            "[data-message-role='assistant']",
            ".assistant-message",
            ".ai-message",
            ".message-assistant",
            "[data-author='assistant']",
            "[data-sender='assistant']",
            ".bot-message"
        ],

        textSelectors: [
            "[data-message-content]",
            ".message-content",
            ".assistant-content",
            ".ai-content",
            ".message-text",
            ".response-content"
        ]
    };


    /* =========================================================
       SVG ICONS
    ========================================================= */

    const ICONS = {

        copy: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="8" y="8" width="11" height="11"
                    rx="2" fill="none"
                    stroke="currentColor"
                    stroke-width="2"/>
                <path d="M16 8V6a2 2 0 0 0-2-2H6
                    a2 2 0 0 0-2 2v8
                    a2 2 0 0 0 2 2h2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>
            </svg>
        `,

        like: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 10v10H4
                    a2 2 0 0 1-2-2v-6
                    a2 2 0 0 1 2-2h3Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"/>
                <path d="M7 20h9
                    a3 3 0 0 0 2.9-2.25l1.2-5
                    A2.2 2.2 0 0 0 18.96 10H15
                    l.55-3.15
                    A2.35 2.35 0 0 0 13.24 4
                    L7 10"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"/>
            </svg>
        `,

        dislike: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 14V4H4
                    a2 2 0 0 0-2 2v6
                    a2 2 0 0 0 2 2h3Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"/>
                <path d="M7 4h9
                    a3 3 0 0 1 2.9 2.25l1.2 5
                    A2.2 2.2 0 0 1 18.96 14H15
                    l.55 3.15
                    A2.35 2.35 0 0 1 13.24 20
                    L7 14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"/>
            </svg>
        `,

        volume: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5l-5 4H4Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"/>
                <path d="M16 9a5 5 0 0 1 0 6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>
                <path d="M18.5 6.5a9 9 0 0 1 0 11"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>
            </svg>
        `,

        more: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="5" r="1.7" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.7" fill="currentColor"/>
                <circle cx="12" cy="19" r="1.7" fill="currentColor"/>
            </svg>
        `,

        branch: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17V7
                    a3 3 0 0 1 3-3h7"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>
                <path d="M14 7h3V4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
                <path d="M7 17h4
                    a3 3 0 0 0 3-3v-2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>
            </svg>
        `,

        retry: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11a8 8 0 0 0-14.9-3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>
                <path d="M4 4v5h5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
                <path d="M4 13a8 8 0 0 0 14.9 3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"/>
                <path d="M20 20v-5h-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
        `,

        web: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"/>
                <path d="M3 12h18M12 3
                    c3 3 3 15 0 18M12 3
                    c-3 3-3 15 0 18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"/>
            </svg>
        `
    };


    /* =========================================================
       CSS
    ========================================================= */

    function injectStyles() {

        if (document.getElementById("pingme-message-actions-style")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "pingme-message-actions-style";

        style.textContent = `

            .${CONFIG.rootClass} {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
                margin-top: 8px;
                padding: 0 4px;
                box-sizing: border-box;
                z-index: 5;
            }

            .${CONFIG.actionBarClass} {
                display: flex;
                align-items: center;
                gap: 7px;
                min-height: 34px;
            }

            .pingme-message-action-button {
                width: 34px;
                height: 34px;
                padding: 0;
                margin: 0;
                border: 0;
                background: transparent;
                color: #8a8a8a;
                border-radius: 9px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
                transition:
                    background-color .16s ease,
                    color .16s ease,
                    transform .12s ease;
            }

            .pingme-message-action-button:hover {
                background: rgba(0, 0, 0, .055);
                color: #222;
            }

            .pingme-message-action-button:active {
                transform: scale(.92);
            }

            .pingme-message-action-button svg {
                width: 21px;
                height: 21px;
                display: block;
            }

            .pingme-message-action-button.pingme-liked {
                color: #1683ff;
                background: rgba(22, 131, 255, .09);
            }

            .pingme-message-action-button.pingme-disliked {
                color: #d64545;
                background: rgba(214, 69, 69, .09);
            }

            .pingme-message-action-button.pingme-speaking {
                color: #1683ff;
            }

            .${CONFIG.menuClass} {
                position: absolute;
                left: 0;
                bottom: 43px;
                width: min(285px, calc(100vw - 32px));
                padding: 9px;
                background: #fff;
                border: 1px solid rgba(0,0,0,.07);
                border-radius: 20px;
                box-shadow:
                    0 14px 40px rgba(0,0,0,.14),
                    0 3px 10px rgba(0,0,0,.07);
                display: none;
                z-index: 99999;
                box-sizing: border-box;
            }

            .${CONFIG.menuClass}.pingme-open {
                display: block;
                animation: pingmeMessageMenuIn .15s ease-out;
            }

            @keyframes pingmeMessageMenuIn {
                from {
                    opacity: 0;
                    transform: translateY(5px) scale(.98);
                }

                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .pingme-message-menu-row {
                width: 100%;
                min-height: 55px;
                border: 0;
                background: transparent;
                border-radius: 13px;
                padding: 9px 11px;
                display: flex;
                align-items: center;
                gap: 15px;
                color: #151515;
                font-size: 16px;
                text-align: left;
                cursor: pointer;
                box-sizing: border-box;
                -webkit-tap-highlight-color: transparent;
            }

            .pingme-message-menu-row:hover {
                background: rgba(0,0,0,.055);
            }

            .pingme-message-menu-row:active {
                background: rgba(0,0,0,.09);
            }

            .pingme-message-menu-row svg {
                width: 25px;
                height: 25px;
                flex: 0 0 25px;
            }

            .pingme-message-menu-divider {
                height: 1px;
                width: calc(100% - 18px);
                margin: 2px auto;
                background: rgba(0,0,0,.09);
            }

            .pingme-message-menu-label {
                flex: 1;
                line-height: 1.25;
            }

            @media (max-width: 600px) {

                .${CONFIG.actionBarClass} {
                    gap: 5px;
                }

                .pingme-message-action-button {
                    width: 33px;
                    height: 33px;
                }

                .pingme-message-action-button svg {
                    width: 20px;
                    height: 20px;
                }

                .${CONFIG.menuClass} {
                    width: min(285px, calc(100vw - 28px));
                    border-radius: 19px;
                }
            }

        `;

        document.head.appendChild(style);
    }


    /* =========================================================
       HELPERS
    ========================================================= */

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getMessageText(messageElement) {

        if (!messageElement) {
            return "";
        }

        for (const selector of CONFIG.textSelectors) {

            const content = messageElement.querySelector(selector);

            if (content) {

                const text = content.innerText ||
                    content.textContent ||
                    "";

                if (text.trim()) {
                    return text.trim();
                }
            }
        }

        const clone = messageElement.cloneNode(true);

        clone.querySelectorAll(
            `.${CONFIG.rootClass}, script, style`
        ).forEach(function (element) {
            element.remove();
        });

        return (
            clone.innerText ||
            clone.textContent ||
            ""
        ).trim();
    }


    function findAssistantMessages() {

        const found = new Set();

        CONFIG.assistantSelectors.forEach(function (selector) {

            document.querySelectorAll(selector)
                .forEach(function (element) {
                    found.add(element);
                });

        });

        return Array.from(found);
    }


    function createButton(icon, label, className) {

        const button = document.createElement("button");

        button.type = "button";

        button.className =
            "pingme-message-action-button " +
            (className || "");

        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);

        button.innerHTML = icon;

        return button;
    }


    /* =========================================================
       COPY
    ========================================================= */

    async function copyMessage(messageElement, button) {

        const text = getMessageText(messageElement);

        if (!text) {
            return;
        }

        try {

            await navigator.clipboard.writeText(text);

            button.classList.add("pingme-copied");

            const oldTitle = button.title;

            button.title = "Copied";

            setTimeout(function () {
                button.classList.remove("pingme-copied");
                button.title = oldTitle;
            }, 1200);

        } catch (error) {

            const textarea =
                document.createElement("textarea");

            textarea.value = text;

            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.select();

            try {
                document.execCommand("copy");
            } catch (copyError) {
                console.warn(
                    "PingMe MessageActions: Copy failed",
                    copyError
                );
            }

            textarea.remove();
        }
    }


    /* =========================================================
       LIKE / DISLIKE
    ========================================================= */

    function handleLike(button, dislikeButton, messageElement) {

        const active = button.classList.contains(
            "pingme-liked"
        );

        button.classList.toggle(
            "pingme-liked",
            !active
        );

        if (!active) {

            dislikeButton.classList.remove(
                "pingme-disliked"
            );
        }

        messageElement.dispatchEvent(
            new CustomEvent(
                "pingme:message-feedback",
                {
                    bubbles: true,
                    detail: {
                        type: !active ? "like" : "none",
                        message: getMessageText(messageElement)
                    }
                }
            )
        );
    }


    function handleDislike(button, likeButton, messageElement) {

        const active = button.classList.contains(
            "pingme-disliked"
        );

        button.classList.toggle(
            "pingme-disliked",
            !active
        );

        if (!active) {

            likeButton.classList.remove(
                "pingme-liked"
            );
        }

        messageElement.dispatchEvent(
            new CustomEvent(
                "pingme:message-feedback",
                {
                    bubbles: true,
                    detail: {
                        type: !active ? "dislike" : "none",
                        message: getMessageText(messageElement)
                    }
                }
            )
        );
    }


    /* =========================================================
       READ ALOUD
    ========================================================= */

    function stopSpeaking(button) {

        if (
            "speechSynthesis" in window
        ) {
            window.speechSynthesis.cancel();
        }

        button.classList.remove(
            "pingme-speaking"
        );

        button.title = "Read aloud";
    }


    function readMessage(button, messageElement) {

        if (!("speechSynthesis" in window)) {
            return;
        }

        if (
            window.speechSynthesis.speaking
        ) {

            stopSpeaking(button);

            return;
        }

        const text = getMessageText(messageElement);

        if (!text) {
            return;
        }

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang =
            document.documentElement.lang ||
            "bn-BD";

        utterance.rate = 1;
        utterance.pitch = 1;

        button.classList.add(
            "pingme-speaking"
        );

        button.title = "Stop reading";

        utterance.onend = function () {
            stopSpeaking(button);
        };

        utterance.onerror = function () {
            stopSpeaking(button);
        };

        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(
            utterance
        );
    }


    /* =========================================================
       THREE DOT MENU
    ========================================================= */

    function closeAllMenus() {

        document.querySelectorAll(
            "." + CONFIG.menuClass
        ).forEach(function (menu) {

            menu.classList.remove(
                "pingme-open"
            );

        });
    }


    function createMenu(messageElement) {

        const menu =
            document.createElement("div");

        menu.className =
            CONFIG.menuClass;

        menu.innerHTML = `

            <button
                type="button"
                class="pingme-message-menu-row"
                data-action="branch"
            >
                ${ICONS.branch}
                <span class="pingme-message-menu-label">
                    Branch in new chat
                </span>
            </button>

            <div class="pingme-message-menu-divider"></div>

            <button
                type="button"
                class="pingme-message-menu-row"
                data-action="retry"
            >
                ${ICONS.retry}
                <span class="pingme-message-menu-label">
                    Retry
                </span>
            </button>

            <div class="pingme-message-menu-divider"></div>

            <button
                type="button"
                class="pingme-message-menu-row"
                data-action="web"
            >
                ${ICONS.web}
                <span class="pingme-message-menu-label">
                    Search the web
                </span>
            </button>

        `;


        menu.addEventListener(
            "click",
            function (event) {

                const row =
                    event.target.closest(
                        ".pingme-message-menu-row"
                    );

                if (!row) {
                    return;
                }

                const action =
                    row.dataset.action;

                closeAllMenus();

                if (action === "branch") {
                    branchMessage(messageElement);
                }

                if (action === "retry") {
                    retryMessage(messageElement);
                }

                if (action === "web") {
                    searchMessageOnWeb(messageElement);
                }
            }
        );


        return menu;
    }


    function toggleMenu(menu) {

        const wasOpen =
            menu.classList.contains(
                "pingme-open"
            );

        closeAllMenus();

        if (!wasOpen) {

            menu.classList.add(
                "pingme-open"
            );
        }
    }


    /* =========================================================
       BRANCH
    ========================================================= */

    function branchMessage(messageElement) {

        const text =
            getMessageText(messageElement);

        const event =
            new CustomEvent(
                "pingme:branch-message",
                {
                    bubbles: true,
                    detail: {
                        message: text,
                        sourceElement: messageElement
                    }
                }
            );

        document.dispatchEvent(event);

        if (
            typeof window.branchInNewChat ===
            "function"
        ) {

            window.branchInNewChat(
                text,
                messageElement
            );

            return;
        }

        if (
            typeof window.createNewChatFromMessage ===
            "function"
        ) {

            window.createNewChatFromMessage(
                text,
                messageElement
            );

            return;
        }

        console.info(
            "PingMe AI — Branch requested:",
            text
        );
    }


    /* =========================================================
       RETRY
    ========================================================= */

    function retryMessage(messageElement) {

        const text =
            getMessageText(messageElement);

        const event =
            new CustomEvent(
                "pingme:retry-message",
                {
                    bubbles: true,
                    detail: {
                        message: text,
                        sourceElement: messageElement
                    }
                }
            );

        document.dispatchEvent(event);

        if (
            typeof window.retryMessage ===
            "function" &&
            window.retryMessage !== retryMessage
        ) {

            window.retryMessage(
                messageElement
            );

            return;
        }

        if (
            typeof window.retryLastMessage ===
            "function"
        ) {

            window.retryLastMessage();

            return;
        }

        if (
            typeof window.regenerateResponse ===
            "function"
        ) {

            window.regenerateResponse(
                messageElement
            );

            return;
        }

        console.info(
            "PingMe AI — Retry requested:",
            text
        );
    }


    /* =========================================================
       SEARCH WEB
    ========================================================= */

    function searchMessageOnWeb(messageElement) {

        const text =
            getMessageText(messageElement);

        if (!text) {
            return;
        }

        const url =
            "https://www.google.com/search?q=" +
            encodeURIComponent(text);

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    }


    /* =========================================================
       CREATE ACTION BAR
    ========================================================= */

    function attachActions(messageElement) {

        if (!messageElement) {
            return;
        }

        if (
            messageElement.classList.contains(
                CONFIG.processedClass
            )
        ) {
            return;
        }

        if (
            messageElement.querySelector(
                "." + CONFIG.rootClass
            )
        ) {

            messageElement.classList.add(
                CONFIG.processedClass
            );

            return;
        }

        const text =
            getMessageText(messageElement);

        if (!text) {
            return;
        }


        /* Root */

        const root =
            document.createElement("div");

        root.className =
            CONFIG.rootClass;


        /* Action bar */

        const bar =
            document.createElement("div");

        bar.className =
            CONFIG.actionBarClass;


        /* Copy */

        const copyButton =
            createButton(
                ICONS.copy,
                "Copy"
            );

        copyButton.addEventListener(
            "click",
            function () {
                copyMessage(
                    messageElement,
                    copyButton
                );
            }
        );


        /* Like */

        const likeButton =
            createButton(
                ICONS.like,
                "Like"
            );


        /* Dislike */

        const dislikeButton =
            createButton(
                ICONS.dislike,
                "Dislike"
            );


        likeButton.addEventListener(
            "click",
            function () {
                handleLike(
                    likeButton,
                    dislikeButton,
                    messageElement
                );
            }
        );


        dislikeButton.addEventListener(
            "click",
            function () {
                handleDislike(
                    dislikeButton,
                    likeButton,
                    messageElement
                );
            }
        );


        /* Read aloud */

        const readButton =
            createButton(
                ICONS.volume,
                "Read aloud"
            );

        readButton.addEventListener(
            "click",
            function () {
                readMessage(
                    readButton,
                    messageElement
                );
            }
        );


        /* Three dots */

        const moreButton =
            createButton(
                ICONS.more,
                "More"
            );

        const menu =
            createMenu(messageElement);

        moreButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleMenu(menu);
            }
        );


        /* Add buttons */

        bar.appendChild(copyButton);
        bar.appendChild(likeButton);
        bar.appendChild(dislikeButton);
        bar.appendChild(readButton);
        bar.appendChild(moreButton);


        root.appendChild(bar);
        root.appendChild(menu);


        /*
         * Put the action bar after the assistant message.
         */

        messageElement.appendChild(root);

        messageElement.classList.add(
            CONFIG.processedClass
        );
    }


    /* =========================================================
       SCAN
    ========================================================= */

    function scanMessages() {

        findAssistantMessages()
            .forEach(function (message) {
                attachActions(message);
            });
    }


    /* =========================================================
       OUTSIDE CLICK
    ========================================================= */

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target.closest(
                    "." + CONFIG.rootClass
                )
            ) {
                return;
            }

            closeAllMenus();
        }
    );


    /* =========================================================
       ESC KEY
    ========================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeAllMenus();
            }
        }
    );


    /* =========================================================
       OBSERVER
    ========================================================= */

    function startObserver() {

        if (!document.body) {
            return;
        }

        const observer =
            new MutationObserver(
                function () {

                    scanMessages();

                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

        window.PingMeMessageActionsObserver =
            observer;
    }


    /* =========================================================
       PUBLIC API
    ========================================================= */

    window.PingMeMessageActions = {

        scan: scanMessages,

        attach: attachActions,

        closeMenus: closeAllMenus,

        copy: copyMessage,

        readAloud: readMessage,

        like: handleLike,

        dislike: handleDislike,

        branch: branchMessage,

        retry: retryMessage,

        searchWeb: searchMessageOnWeb
    };


    /* =========================================================
       INITIALIZE
    ========================================================= */

    function initialize() {

        injectStyles();

        scanMessages();

        startObserver();

        console.log(
            "PingMe AI — Message Actions Connected"
        );
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();
    }

})();
