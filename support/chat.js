// PingMe AI — Chat Support
// Message UI + Smooth Animations + History Connection

(() => {
    "use strict";

    /* =========================================================
       MESSAGE UI STYLE
       ========================================================= */

    const style = document.createElement("style");

    style.textContent = `

        /* =====================================================
           USER MESSAGE
           ===================================================== */

        .user-message {
            display: block;
            width: fit-content;
            max-width: 80%;
            margin: 10px 0 10px auto !important;
            padding: 10px 14px !important;

            border-radius: 18px 18px 6px 18px !important;

            background:
                linear-gradient(
                    135deg,
                    #ffffff 0%,
                    #f7faff 45%,
                    #eaf3ff 100%
                ) !important;

            color: #202124 !important;

            box-shadow:
                0 4px 14px rgba(70, 120, 180, 0.12);

            line-height: 1.5;

            white-space: pre-wrap;
            overflow-wrap: anywhere;
            word-break: break-word;

            animation:
                pingmeUserIn
                0.38s
                cubic-bezier(.2,.8,.2,1)
                both;

            transform-origin: bottom right;
        }


        @keyframes pingmeUserIn {

            from {
                opacity: 0;
                transform:
                    translateY(12px)
                    scale(0.92);
            }

            to {
                opacity: 1;
                transform:
                    translateY(0)
                    scale(1);
            }

        }


        /* =====================================================
           AI MESSAGE
           ===================================================== */

        .ai-message {
            width: 100%;
            margin: 14px 0 !important;
            padding: 12px 14px !important;

            border-radius: 18px 18px 18px 6px;

            background:
                #f7f8fc;

            color: #202124 !important;

            line-height: 1.6;

            box-shadow:
                0 3px 12px rgba(0,0,0,0.05);

            animation:
                pingmeAIIn
                0.45s
                cubic-bezier(.2,.8,.2,1)
                both;

            transform-origin: bottom left;
        }


        @keyframes pingmeAIIn {

            from {
                opacity: 0;
                transform:
                    translateY(14px)
                    scale(0.97);
            }

            to {
                opacity: 1;
                transform:
                    translateY(0)
                    scale(1);
            }

        }


        /* =====================================================
           AI HEADINGS
           ===================================================== */

        .ai-message h3 {
            margin: 8px 0 6px !important;
        }


        /* =====================================================
           AI ERROR
           ===================================================== */

        .ai-error {
            animation:
                pingmeErrorIn
                0.4s
                ease both;
        }


        @keyframes pingmeErrorIn {

            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }

        }


        /* =====================================================
           THINKING
           ===================================================== */

        .thinking.show {
            animation:
                pingmeThinkingIn
                0.3s
                ease both;
        }


        @keyframes pingmeThinkingIn {

            from {
                opacity: 0;
                transform: translateY(6px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }

        }


        /* =====================================================
           THINKING DOTS
           ===================================================== */

        .thinking span {
            display: inline-flex;
            align-items: center;
        }


        .thinking span::after {
            content: "";
            display: inline-block;
            width: 18px;
            overflow: hidden;
            text-align: left;

            animation:
                pingmeDots
                1.2s
                steps(4, end)
                infinite;
        }


        @keyframes pingmeDots {

            0% {
                content: "";
            }

            25% {
                content: ".";
            }

            50% {
                content: "..";
            }

            75% {
                content: "...";
            }

            100% {
                content: "";
            }

        }


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 480px) {

            .user-message {
                display: block;
                width: fit-content;
                max-width: 84%;
                padding: 10px 14px !important;
            }

            .ai-message {
                padding: 11px 12px !important;
            }

        }


        /* =====================================================
           REDUCED MOTION
           ===================================================== */

        @media (prefers-reduced-motion: reduce) {

            .user-message,
            .ai-message,
            .ai-error,
            .thinking.show {
                animation: none;
            }

            .thinking span::after {
                animation: none;
                content: "...";
            }

        }

    `;

    document.head.appendChild(style);


    /* =========================================================
       HISTORY CONNECTION
       ========================================================= */

    const ACTIVE_CHAT_KEY =
        "pingme_active_chat_id";

    let activeChatId = null;


    function getHistory() {

        if (
            window.PingMeHistory &&
            typeof window.PingMeHistory === "object"
        ) {
            return window.PingMeHistory;
        }

        return null;
    }


    function getActiveChatId() {

        if (activeChatId) {
            return activeChatId;
        }

        try {

            const savedId =
                localStorage.getItem(
                    ACTIVE_CHAT_KEY
                );

            if (savedId) {
                activeChatId = savedId;
                return activeChatId;
            }

        } catch (error) {

            console.warn(
                "PingMe: Could not read active chat ID.",
                error
            );

        }

        return null;
    }


    function setActiveChatId(chatId) {

        if (!chatId) {
            return;
        }

        activeChatId = chatId;

        try {

            localStorage.setItem(
                ACTIVE_CHAT_KEY,
                chatId
            );

        } catch (error) {

            console.warn(
                "PingMe: Could not save active chat ID.",
                error
            );

        }

    }


    function ensureActiveChat(firstMessage = "") {

        const history =
            getHistory();

        if (!history) {
            return null;
        }

        const existingId =
            getActiveChatId();

        if (existingId) {

            const existingChat =
                history.getChat(
                    existingId
                );

            if (existingChat) {
                return existingId;
            }

        }

        try {

            const title =
                createChatTitle(
                    firstMessage
                );

            const newChat =
                history.createChat(
                    title
                );

            if (
                newChat &&
                newChat.id
            ) {

                setActiveChatId(
                    newChat.id
                );

                return newChat.id;
            }

        } catch (error) {

            console.error(
                "PingMe: Could not create history chat.",
                error
            );

        }

        return null;
    }


    function createChatTitle(text) {

        const clean =
            String(text || "")
                .replace(/\s+/g, " ")
                .trim();

        if (!clean) {
            return "New Chat";
        }

        if (clean.length <= 45) {
            return clean;
        }

        return (
            clean.substring(0, 45)
            + "..."
        );

    }


    function getMessageText(node) {

        if (!node) {
            return "";
        }

        return String(
            node.textContent || ""
        )
            .replace(/\s+/g, " ")
            .trim();

    }


    function saveMessageToHistory(node) {

        const history =
            getHistory();

        if (!history || !node) {
            return;
        }

        if (
            node.dataset &&
            node.dataset.historySaved === "true"
        ) {
            return;
        }

        let role = null;

        if (
            node.classList.contains(
                "user-message"
            )
        ) {

            role = "user";

        } else if (
            node.classList.contains(
                "ai-message"
            )
        ) {

            role = "assistant";

        }

        if (!role) {
            return;
        }

        const content =
            getMessageText(node);

        if (!content) {
            return;
        }

        const chatId =
            ensureActiveChat(
                role === "user"
                    ? content
                    : ""
            );

        if (!chatId) {
            return;
        }

        try {

            if (
                role === "user" &&
                typeof history.addUserMessage === "function"
            ) {

                history.addUserMessage(
                    chatId,
                    content
                );

            } else if (
                role === "assistant" &&
                typeof history.addAssistantMessage === "function"
            ) {

                history.addAssistantMessage(
                    chatId,
                    content
                );

            } else if (
                typeof history.addMessage === "function"
            ) {

                history.addMessage(
                    chatId,
                    role,
                    content
                );

            }

            node.dataset.historySaved =
                "true";

        } catch (error) {

            console.error(
                "PingMe: Could not save message to history.",
                error
            );

        }

    }


    /* =========================================================
       MESSAGE OBSERVER
       ========================================================= */

    const chatArea =
        document.getElementById("chatArea");


    if (chatArea) {

        const observer =
            new MutationObserver(
                (mutations) => {

                    for (
                        const mutation
                        of mutations
                    ) {

                        for (
                            const node
                            of mutation.addedNodes
                        ) {

                            if (
                                node.nodeType !== 1
                            ) {
                                continue;
                            }


                            /* ---------------------------------
                               USER MESSAGE
                               --------------------------------- */

                            if (
                                node.classList.contains(
                                    "user-message"
                                )
                            ) {

                                node.style.animation =
                                    "none";

                                node.offsetHeight;

                                node.style.animation =
                                    "pingmeUserIn 0.38s cubic-bezier(.2,.8,.2,1) both";

                                saveMessageToHistory(
                                    node
                                );

                            }


                            /* ---------------------------------
                               AI MESSAGE
                               --------------------------------- */

                            if (
                                node.classList.contains(
                                    "ai-message"
                                )
                            ) {

                                node.style.animation =
                                    "none";

                                node.offsetHeight;

                                node.style.animation =
                                    "pingmeAIIn 0.45s cubic-bezier(.2,.8,.2,1) both";

                                saveMessageToHistory(
                                    node
                                );

                            }


                            /* ---------------------------------
                               AI ERROR
                               --------------------------------- */

                            if (
                                node.classList.contains(
                                    "ai-error"
                                )
                            ) {

                                node.style.animation =
                                    "none";

                                node.offsetHeight;

                                node.style.animation =
                                    "pingmeErrorIn 0.4s ease both";

                            }

                        }

                    }

                }
            );


        observer.observe(
            chatArea,
            {
                childList: true
            }
        );

    }


    /* =========================================================
       KEEP THINKING AT BOTTOM
       ========================================================= */

    const thinking =
        document.getElementById("thinking");


    if (thinking) {

        const thinkingObserver =
            new MutationObserver(() => {

                if (
                    thinking.classList.contains(
                        "show"
                    )
                ) {

                    const chatArea =
                        document.getElementById(
                            "chatArea"
                        );

                    if (chatArea) {

                        chatArea.appendChild(
                            thinking
                        );

                    }

                }

            });


        thinkingObserver.observe(
            thinking,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );

    }


    /* =========================================================
       HISTORY READY CHECK
       ========================================================= */

    if (
        window.PingMeHistory
    ) {

        console.log(
            "Chat Support: History Connected"
        );

    } else {

        console.warn(
            "Chat Support: History Support not found. Make sure History Support.js is loaded."
        );

    }


    /* =========================================================
       CONNECTED
       ========================================================= */

    console.log(
        "Chat Support UI Connected"
    );

})();