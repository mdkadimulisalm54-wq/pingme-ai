// ==========================================================
// PingMe AI — History Support
// ==========================================================

(function () {

    "use strict";


    /* ========================================================
       STORAGE
       ======================================================== */

    const STORAGE_KEY =
        "pingme_chat_history";

    const VERSION_KEY =
        "pingme_history_version";

    const CURRENT_VERSION =
        1;


    /* ========================================================
       INTERNAL STATE
       ======================================================== */

    let historyData = [];

    let initialized = false;


    /* ========================================================
       INITIALIZE
       ======================================================== */

    function init() {

        if (initialized) {
            return;
        }

        load();

        initialized = true;

        console.log(
            "PingMe AI — History Support Ready"
        );

    }


    /* ========================================================
       LOAD HISTORY
       ======================================================== */

    function load() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!saved) {

                historyData = [];

                save();

                return historyData;

            }


            const parsed =
                JSON.parse(saved);


            if (
                !Array.isArray(parsed)
            ) {

                historyData = [];

                save();

                return historyData;

            }


            historyData =
                parsed.map(
                    normalizeConversation
                );


            return historyData;

        } catch (error) {

            console.error(
                "PingMe AI — History Load Error:",
                error
            );

            historyData = [];

            return historyData;

        }

    }


    /* ========================================================
       SAVE HISTORY
       ======================================================== */

    function save() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    historyData
                )
            );


            localStorage.setItem(
                VERSION_KEY,
                String(
                    CURRENT_VERSION
                )
            );


            return true;

        } catch (error) {

            console.error(
                "PingMe AI — History Save Error:",
                error
            );

            return false;

        }

    }


    /* ========================================================
       NORMALIZE CONVERSATION
       ======================================================== */

    function normalizeConversation(
        conversation
    ) {

        const item =
            conversation &&
            typeof conversation === "object"
                ? conversation
                : {};


        return {

            id:
                item.id ||
                createId(
                    "chat"
                ),

            title:
                item.title ||
                "New Chat",

            createdAt:
                item.createdAt ||
                new Date().toISOString(),

            updatedAt:
                item.updatedAt ||
                item.createdAt ||
                new Date().toISOString(),

            messages:
                Array.isArray(
                    item.messages
                )
                    ? item.messages.map(
                        normalizeMessage
                    )
                    : []

        };

    }


    /* ========================================================
       NORMALIZE MESSAGE
       ======================================================== */

    function normalizeMessage(
        message
    ) {

        const item =
            message &&
            typeof message === "object"
                ? message
                : {};


        return {

            id:
                item.id ||
                createId(
                    "msg"
                ),

            role:
                item.role ||
                "user",

            content:
                typeof item.content === "string"
                    ? item.content
                    : "",

            createdAt:
                item.createdAt ||
                new Date().toISOString(),

            type:
                item.type ||
                "text",

            metadata:
                item.metadata &&
                typeof item.metadata === "object"
                    ? item.metadata
                    : {}

        };

    }


    /* ========================================================
       CREATE ID
       ======================================================== */

    function createId(
        prefix
    ) {

        return (
            prefix +
            "_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );

    }


    /* ========================================================
       CREATE NEW CHAT
       ======================================================== */

    function createChat(
        title
    ) {

        init();


        const now =
            new Date().toISOString();


        const conversation = {

            id:
                createId(
                    "chat"
                ),

            title:
                cleanTitle(
                    title ||
                    "New Chat"
                ),

            createdAt:
                now,

            updatedAt:
                now,

            messages:
                []

        };


        historyData.unshift(
            conversation
        );


        save();


        emit(
            "chatCreated",
            conversation
        );


        return clone(
            conversation
        );

    }


    /* ========================================================
       GET CHAT
       ======================================================== */

    function getChat(
        chatId
    ) {

        init();


        const chat =
            historyData.find(
                function (item) {

                    return (
                        item.id ===
                        chatId
                    );

                }
            );


        return chat
            ? clone(chat)
            : null;

    }


    /* ========================================================
       GET ALL CHATS
       ======================================================== */

    function getChats() {

        init();


        return clone(
            historyData
        );

    }


    /* ========================================================
       GET RECENT CHATS
       ======================================================== */

    function getRecentChats(
        limit
    ) {

        init();


        const amount =
            Number(limit) > 0
                ? Number(limit)
                : 20;


        return clone(
            historyData
                .slice()
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                b.updatedAt
                            ) -
                            new Date(
                                a.updatedAt
                            )
                        );

                    }
                )
                .slice(
                    0,
                    amount
                )
        );

    }


    /* ========================================================
       ADD MESSAGE
       ======================================================== */

    function addMessage(
        chatId,
        message
    ) {

        init();


        let chat =
            historyData.find(
                function (item) {

                    return (
                        item.id ===
                        chatId
                    );

                }
            );


        /*
         * যদি chat আগে তৈরি না হয়ে থাকে,
         * তাহলে automatically নতুন chat তৈরি হবে।
         */

        if (!chat) {

            chat =
                createChat(
                    "New Chat"
                );


            chat =
                historyData.find(
                    function (item) {

                        return (
                            item.id ===
                            chat.id
                        );

                    }
                );

        }


        const normalized =
            normalizeMessage(
                message
            );


        chat.messages.push(
            normalized
        );


        chat.updatedAt =
            normalized.createdAt;


        /*
         * প্রথম user message থেকে
         * chat-এর title তৈরি করা হবে।
         */

        if (
            chat.title ===
            "New Chat" &&
            normalized.role ===
            "user" &&
            normalized.content
        ) {

            chat.title =
                createTitle(
                    normalized.content
                );

        }


        /*
         * সবচেয়ে নতুন chat উপরে থাকবে।
         */

        moveChatToTop(
            chat.id
        );


        save();


        emit(
            "messageAdded",
            {
                chat:
                    clone(chat),

                message:
                    clone(normalized)
            }
        );


        return clone(
            normalized
        );

    }


    /* ========================================================
       ADD USER MESSAGE
       ======================================================== */

    function addUserMessage(
        chatId,
        content,
        metadata
    ) {

        return addMessage(
            chatId,
            {

                role:
                    "user",

                content:
                    content,

                type:
                    "text",

                metadata:
                    metadata || {}

            }
        );

    }


    /* ========================================================
       ADD ASSISTANT MESSAGE
       ======================================================== */

    function addAssistantMessage(
        chatId,
        content,
        metadata
    ) {

        return addMessage(
            chatId,
            {

                role:
                    "assistant",

                content:
                    content,

                type:
                    "text",

                metadata:
                    metadata || {}

            }
        );

    }


    /* ========================================================
       UPDATE CHAT TITLE
       ======================================================== */

    function renameChat(
        chatId,
        title
    ) {

        init();


        const chat =
            historyData.find(
                function (item) {

                    return (
                        item.id ===
                        chatId
                    );

                }
            );


        if (!chat) {

            return false;

        }


        const newTitle =
            cleanTitle(
                title
            );


        if (!newTitle) {

            return false;

        }


        chat.title =
            newTitle;


        chat.updatedAt =
            new Date().toISOString();


        save();


        emit(
            "chatRenamed",
            clone(chat)
        );


        return true;

    }


    /* ========================================================
       DELETE CHAT
       ======================================================== */

    function deleteChat(
        chatId
    ) {

        init();


        const index =
            historyData.findIndex(
                function (item) {

                    return (
                        item.id ===
                        chatId
                    );

                }
            );


        if (index === -1) {

            return false;

        }


        const deleted =
            historyData.splice(
                index,
                1
            )[0];


        save();


        emit(
            "chatDeleted",
            clone(deleted)
        );


        return true;

    }


    /* ========================================================
       CLEAR ALL HISTORY
       ======================================================== */

    function clearAll() {

        init();


        const previous =
            clone(
                historyData
            );


        historyData = [];


        save();


        emit(
            "historyCleared",
            previous
        );


        return true;

    }


    /* ========================================================
       SEARCH HISTORY
       ======================================================== */

    function search(
        query
    ) {

        init();


        const text =
            String(
                query || ""
            )
                .trim()
                .toLowerCase();


        if (!text) {

            return [];

        }


        const results = [];


        historyData.forEach(
            function (chat) {

                const titleMatch =
                    chat.title
                        .toLowerCase()
                        .includes(text);


                chat.messages.forEach(
                    function (message) {

                        const content =
                            String(
                                message.content ||
                                ""
                            );


                        if (
                            titleMatch ||
                            content
                                .toLowerCase()
                                .includes(text)
                        ) {

                            results.push({

                                chatId:
                                    chat.id,

                                chatTitle:
                                    chat.title,

                                messageId:
                                    message.id,

                                role:
                                    message.role,

                                content:
                                    content,

                                createdAt:
                                    message.createdAt

                            });

                        }

                    }
                );

            }
        );


        return results;

    }


    /* ========================================================
       GET MESSAGES
       ======================================================== */

    function getMessages(
        chatId
    ) {

        init();


        const chat =
            historyData.find(
                function (item) {

                    return (
                        item.id ===
                        chatId
                    );

                }
            );


        if (!chat) {

            return [];

        }


        return clone(
            chat.messages
        );

    }


    /* ========================================================
       DELETE MESSAGE
       ======================================================== */

    function deleteMessage(
        chatId,
        messageId
    ) {

        init();


        const chat =
            historyData.find(
                function (item) {

                    return (
                        item.id ===
                        chatId
                    );

                }
            );


        if (!chat) {

            return false;

        }


        const index =
            chat.messages.findIndex(
                function (message) {

                    return (
                        message.id ===
                        messageId
                    );

                }
            );


        if (index === -1) {

            return false;

        }


        chat.messages.splice(
            index,
            1
        );


        chat.updatedAt =
            new Date().toISOString();


        save();


        emit(
            "messageDeleted",
            {
                chatId:
                    chatId,

                messageId:
                    messageId
            }
        );


        return true;

    }


    /* ========================================================
       MOVE CHAT TO TOP
       ======================================================== */

    function moveChatToTop(
        chatId
    ) {

        const index =
            historyData.findIndex(
                function (item) {

                    return (
                        item.id ===
                        chatId
                    );

                }
            );


        if (index <= 0) {

            return;

        }


        const chat =
            historyData.splice(
                index,
                1
            )[0];


        historyData.unshift(
            chat
        );

    }


    /* ========================================================
       CREATE CHAT TITLE
       ======================================================== */

    function createTitle(
        content
    ) {

        const text =
            String(
                content || ""
            )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        if (!text) {

            return "New Chat";

        }


        if (
            text.length <= 45
        ) {

            return text;

        }


        return (
            text.slice(
                0,
                45
            ).trim() +
            "..."
        );

    }


    /* ========================================================
       CLEAN TITLE
       ======================================================== */

    function cleanTitle(
        title
    ) {

        return String(
            title || ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .slice(
                0,
                100
            );

    }


    /* ========================================================
       CLONE DATA
       ======================================================== */

    function clone(
        data
    ) {

        try {

            return JSON.parse(
                JSON.stringify(
                    data
                )
            );

        } catch (_) {

            return data;

        }

    }


    /* ========================================================
       EVENT SYSTEM
       ======================================================== */

    function emit(
        eventName,
        detail
    ) {

        try {

            window.dispatchEvent(
                new CustomEvent(
                    "pingme:history:" +
                    eventName,
                    {
                        detail:
                            detail
                    }
                )
            );

        } catch (error) {

            console.error(
                "PingMe AI — History Event Error:",
                error
            );

        }

    }


    /* ========================================================
       IMPORT HISTORY
       ======================================================== */

    function importHistory(
        data
    ) {

        if (
            !Array.isArray(data)
        ) {

            return false;

        }


        historyData =
            data.map(
                normalizeConversation
            );


        save();


        emit(
            "historyImported",
            clone(historyData)
        );


        return true;

    }


    /* ========================================================
       EXPORT HISTORY
       ======================================================== */

    function exportHistory() {

        init();


        return {

            version:
                CURRENT_VERSION,

            exportedAt:
                new Date().toISOString(),

            chats:
                clone(
                    historyData
                )

        };

    }


    /* ========================================================
       GET STATISTICS
       ======================================================== */

    function getStats() {

        init();


        let messageCount =
            0;


        historyData.forEach(
            function (chat) {

                messageCount +=
                    chat.messages.length;

            }
        );


        return {

            chats:
                historyData.length,

            messages:
                messageCount

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PingMeHistory = {

        init:

            init,

        createChat:

            createChat,

        getChat:

            getChat,

        getChats:

            getChats,

        getRecentChats:

            getRecentChats,

        addMessage:

            addMessage,

        addUserMessage:

            addUserMessage,

        addAssistantMessage:

            addAssistantMessage,

        getMessages:

            getMessages,

        renameChat:

            renameChat,

        deleteChat:

            deleteChat,

        deleteMessage:

            deleteMessage,

        clearAll:

            clearAll,

        search:

            search,

        import:

            importHistory,

        export:

            exportHistory,

        getStats:

            getStats

    };


    /* ========================================================
       START
       ======================================================== */

    init();


})();