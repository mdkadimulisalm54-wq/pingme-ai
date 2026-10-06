// PingMe AI — Recent Support
// Recent Chats + History Integration

(() => {
    "use strict";


    /* =========================================================
       CONFIG
       ========================================================= */

    const SELECTORS = {
        recent: [
            "#recent",
            "#recentChats",
            "#recentChatList",
            ".recent-chats",
            ".recent-chat-list",
            ".recent-list"
        ],

        chat: [
            "#chat",
            "#chatList",
            ".chat-list"
        ]
    };


    /* =========================================================
       STATE
       ========================================================= */

    let initialized = false;
    let currentList = null;


    /* =========================================================
       HISTORY
       ========================================================= */

    function getHistory() {

        return (
            window.PingMeHistory &&
            typeof window.PingMeHistory === "object"
        )
            ? window.PingMeHistory
            : null;

    }


    /* =========================================================
       FIND CONTAINER
       ========================================================= */

    function findContainer() {

        for (const selector of SELECTORS.recent) {

            const element =
                document.querySelector(selector);

            if (element) {
                return element;
            }

        }


        /*
         * Try to find the visible Recent section by text.
         */

        const elements =
            document.querySelectorAll(
                "section, div, aside, nav"
            );


        for (const element of elements) {

            const text =
                String(
                    element.textContent || ""
                )
                    .trim()
                    .toLowerCase();


            if (
                text === "recent" ||
                text.includes("your recent chats will appear here")
            ) {

                return element;

            }

        }


        return null;

    }


    /* =========================================================
       FIND LIST INSIDE CONTAINER
       ========================================================= */

    function findList(container) {

        if (!container) {
            return null;
        }


        const existing =
            container.querySelector(
                ".recent-chat-list, .recent-chats, .recent-list, #recentChats, #recentChatList"
            );


        if (existing) {
            return existing;
        }


        return container;

    }


    /* =========================================================
       FORMAT DATE
       ========================================================= */

    function formatDate(timestamp) {

        if (!timestamp) {
            return "";
        }


        const date =
            new Date(timestamp);


        if (Number.isNaN(date.getTime())) {
            return "";
        }


        const now =
            new Date();


        const sameDay =
            date.toDateString() ===
            now.toDateString();


        if (sameDay) {

            return date.toLocaleTimeString(
                [],
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

        }


        const yesterday =
            new Date(now);


        yesterday.setDate(
            yesterday.getDate() - 1
        );


        if (
            date.toDateString() ===
            yesterday.toDateString()
        ) {

            return "Yesterday";

        }


        return date.toLocaleDateString(
            [],
            {
                day: "numeric",
                month: "short"
            }
        );

    }


    /* =========================================================
       CLEAN TITLE
       ========================================================= */

    function cleanTitle(title) {

        const value =
            String(title || "")
                .replace(/\s+/g, " ")
                .trim();


        if (!value) {
            return "New Chat";
        }


        if (value.length > 55) {

            return (
                value.substring(0, 55)
                + "..."
            );

        }


        return value;

    }


    /* =========================================================
       ESCAPE HTML
       ========================================================= */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================================================
       EMPTY STATE
       ========================================================= */

    function renderEmpty(list) {

        if (!list) {
            return;
        }


        list.innerHTML = `

            <div class="pingme-recent-empty">

                <div class="pingme-recent-empty-icon">
                    💬
                </div>

                <div class="pingme-recent-empty-title">
                    No recent chats
                </div>

                <div class="pingme-recent-empty-text">
                    Your recent chats will appear here.
                </div>

            </div>

        `;

    }


    /* =========================================================
       CHAT ITEM
       ========================================================= */

    function createChatItem(chat) {

        const item =
            document.createElement("button");


        item.type = "button";

        item.className =
            "pingme-recent-item";


        item.dataset.chatId =
            chat.id;


        const title =
            cleanTitle(chat.title);


        const date =
            formatDate(
                chat.updatedAt ||
                chat.createdAt
            );


        item.innerHTML = `

            <span class="pingme-recent-icon">
                <span>💬</span>
            </span>

            <span class="pingme-recent-content">

                <span class="pingme-recent-title">
                    ${escapeHTML(title)}
                </span>

                <span class="pingme-recent-date">
                    ${escapeHTML(date)}
                </span>

            </span>

        `;


        item.addEventListener(
            "click",
            () => {

                openChat(
                    chat.id
                );

            }
        );


        return item;

    }


    /* =========================================================
       OPEN CHAT
       ========================================================= */

    function openChat(chatId) {

        if (!chatId) {
            return;
        }


        /*
         * Store active chat for Chat Support.
         */

        try {

            localStorage.setItem(
                "pingme_active_chat_id",
                chatId
            );

        } catch (error) {

            console.warn(
                "Recent Support: Could not save active chat.",
                error
            );

        }


        /*
         * Notify the rest of PingMe.
         */

        window.dispatchEvent(
            new CustomEvent(
                "pingme:recent:open",
                {
                    detail: {
                        chatId
                    }
                }
            )
        );


        window.dispatchEvent(
            new CustomEvent(
                "pingme:history:open",
                {
                    detail: {
                        chatId
                    }
                }
            )
        );


        /*
         * If another Chat/History controller already
         * provides an open function, use it.
         */

        if (
            window.PingMeHistoryUI &&
            typeof window.PingMeHistoryUI.openChat ===
            "function"
        ) {

            window.PingMeHistoryUI.openChat(
                chatId
            );

            return;

        }


        if (
            window.PingMeChat &&
            typeof window.PingMeChat.openChat ===
            "function"
        ) {

            window.PingMeChat.openChat(
                chatId
            );

            return;

        }

    }


    /* =========================================================
       RENDER RECENT CHATS
       ========================================================= */

    function render() {

        const history =
            getHistory();


        if (!history) {

            console.warn(
                "Recent Support: History Support.js not found."
            );

            return;

        }


        const container =
            findContainer();


        if (!container) {

            return;

        }


        const list =
            findList(container);


        if (!list) {
            return;
        }


        currentList =
            list;


        let chats = [];


        try {

            chats =
                history.getRecentChats(
                    20
                ) || [];

        } catch (error) {

            console.error(
                "Recent Support: Could not read history.",
                error
            );

            return;

        }


        list.innerHTML = "";


        if (!chats.length) {

            renderEmpty(
                list
            );

            return;

        }


        for (const chat of chats) {

            if (!chat || !chat.id) {
                continue;
            }


            list.appendChild(
                createChatItem(
                    chat
                )
            );

        }

    }


    /* =========================================================
       STYLE
       ========================================================= */

    function injectStyle() {

        if (
            document.getElementById(
                "pingme-recent-support-style"
            )
        ) {

            return;

        }


        const style =
            document.createElement("style");


        style.id =
            "pingme-recent-support-style";


        style.textContent = `

            .pingme-recent-item {

                width: 100%;
                display: flex;
                align-items: center;
                gap: 11px;

                border: 0;
                outline: none;

                background: transparent;

                padding: 10px 12px;

                border-radius: 12px;

                cursor: pointer;

                text-align: left;

                transition:
                    background .18s ease,
                    transform .18s ease;

                color: inherit;

                font: inherit;

            }


            .pingme-recent-item:hover {

                background:
                    rgba(0, 0, 0, 0.05);

            }


            .pingme-recent-item:active {

                transform:
                    scale(.98);

            }


            .pingme-recent-icon {

                width: 34px;
                height: 34px;

                min-width: 34px;

                display: flex;
                align-items: center;
                justify-content: center;

                border-radius: 10px;

                background:
                    rgba(26, 115, 232, .10);

            }


            .pingme-recent-content {

                min-width: 0;

                flex: 1;

                display: flex;
                flex-direction: column;

                gap: 2px;

            }


            .pingme-recent-title {

                display: block;

                overflow: hidden;

                white-space: nowrap;

                text-overflow: ellipsis;

                font-size: 14px;

                font-weight: 500;

            }


            .pingme-recent-date {

                display: block;

                font-size: 11px;

                opacity: .55;

            }


            .pingme-recent-empty {

                padding: 28px 16px;

                text-align: center;

                opacity: .7;

            }


            .pingme-recent-empty-icon {

                font-size: 30px;

                margin-bottom: 8px;

            }


            .pingme-recent-empty-title {

                font-size: 14px;

                font-weight: 600;

                margin-bottom: 4px;

            }


            .pingme-recent-empty-text {

                font-size: 12px;

                line-height: 1.5;

            }


            @media (
                prefers-reduced-motion: reduce
            ) {

                .pingme-recent-item {

                    transition: none;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =========================================================
       HISTORY EVENTS
       ========================================================= */

    function connectHistoryEvents() {

        const events = [

            "created",
            "updated",
            "messageAdded",
            "messageDeleted",
            "renamed",
            "deleted",
            "cleared",
            "imported"

        ];


        for (const eventName of events) {

            window.addEventListener(
                "pingme:history:" + eventName,
                () => {

                    render();

                }
            );

        }

    }


    /* =========================================================
       GLOBAL REFRESH EVENT
       ========================================================= */

    function connectRecentEvents() {

        window.addEventListener(
            "pingme:recent:refresh",
            () => {

                render();

            }
        );

    }


    /* =========================================================
       WAIT FOR HISTORY
       ========================================================= */

    function waitForHistory() {

        if (getHistory()) {

            initialize();

            return;

        }


        let attempts = 0;


        const timer =
            setInterval(
                () => {

                    attempts++;


                    if (getHistory()) {

                        clearInterval(
                            timer
                        );

                        initialize();

                        return;

                    }


                    if (attempts >= 50) {

                        clearInterval(
                            timer
                        );

                        console.warn(
                            "Recent Support: History Support.js was not detected."
                        );

                    }

                },
                100
            );

    }


    /* =========================================================
       INITIALIZE
       ========================================================= */

    function initialize() {

        if (initialized) {
            return;
        }


        initialized = true;


        injectStyle();

        connectHistoryEvents();

        connectRecentEvents();

        render();


        /*
         * The Recent section may be rendered dynamically
         * by another part of the application.
         * Retry a few times without adding duplicate logic.
         */

        let retries = 0;


        const retryTimer =
            setInterval(
                () => {

                    retries++;

                    render();


                    if (retries >= 20) {

                        clearInterval(
                            retryTimer
                        );

                    }

                },
                250
            );


        console.log(
            "Recent Support Connected"
        );

    }


    /* =========================================================
       PUBLIC API
       ========================================================= */

    window.PingMeRecent = {

        refresh: render,

        getCurrentList: () => currentList,

        openChat,

        getChats: () => {

            const history =
                getHistory();

            if (!history) {
                return [];
            }

            return history.getRecentChats(
                20
            ) || [];

        }

    };


    /* =========================================================
       START
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            waitForHistory,
            {
                once: true
            }
        );

    } else {

        waitForHistory();

    }


})();