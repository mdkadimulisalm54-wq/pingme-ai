/* =========================================================
   PingMe AI — Header Menu Features
   Share • Pin • Project • Files • Find • Home • Archive • Delete
   ========================================================= */

(() => {

    "use strict";

    const STORAGE = {
        pinned: "pingme_pinned_chats",
        projects: "pingme_projects",
        archived: "pingme_archived_chats",
        home: "pingme_home_chats"
    };

    let activeChatId = null;


    /* =====================================================
       CURRENT CHAT
       ===================================================== */

    function getChatId() {

        if (activeChatId) return activeChatId;

        const stored =
            localStorage.getItem("pingme_current_chat_id");

        if (stored) {
            activeChatId = stored;
            return stored;
        }

        activeChatId =
            "chat_" + Date.now();

        localStorage.setItem(
            "pingme_current_chat_id",
            activeChatId
        );

        return activeChatId;
    }


    function getChatTitle() {

        const input =
            document.getElementById("chatInput");

        const history =
            getHistory();

        if (
            history.length &&
            history[0]?.parts?.[0]?.text
        ) {
            return history[0].parts[0].text
                .trim()
                .slice(0, 60);
        }

        if (
            input &&
            input.value.trim()
        ) {
            return input.value.trim()
                .slice(0, 60);
        }

        return "PingMe AI Chat";
    }


    function getHistory() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "pingme_conversation_history"
                ) || "[]"
            );

        } catch {

            return [];

        }
    }


    /* =====================================================
       HELPERS
       ===================================================== */

    function readArray(key) {

        try {

            const data =
                JSON.parse(
                    localStorage.getItem(key) || "[]"
                );

            return Array.isArray(data)
                ? data
                : [];

        } catch {

            return [];

        }
    }


    function saveArray(key, data) {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );
    }


    function chatRecord(extra = {}) {

        return {
            id: getChatId(),
            title: getChatTitle(),
            updatedAt: Date.now(),
            ...extra
        };
    }


    function notify(name, detail = {}) {

        document.dispatchEvent(
            new CustomEvent(name, {
                detail
            })
        );
    }


    /* =====================================================
       SHARE
       ===================================================== */

    async function shareChat() {

        const title =
            getChatTitle();

        const history =
            getHistory();

        const text =
            history.map(item => {

                const role =
                    item.role === "model"
                        ? "PingMe AI"
                        : "You";

                const message =
                    item.parts?.[0]?.text || "";

                return `${role}: ${message}`;

            }).join("\n\n");

        const shareData = {
            title:
                title || "PingMe AI Chat",
            text:
                text || "PingMe AI conversation"
        };


        try {

            if (navigator.share) {

                await navigator.share(
                    shareData
                );

            } else if (navigator.clipboard) {

                await navigator.clipboard.writeText(
                    text
                );

                alert(
                    "Chat copied to clipboard."
                );

            } else {

                alert(
                    "Sharing is not supported on this device."
                );
            }

        } catch (error) {

            if (
                error?.name !== "AbortError"
            ) {
                console.error(
                    "PingMe Share:",
                    error
                );
            }
        }

        notify(
            "pingme-chat-shared",
            {
                chatId: getChatId()
            }
        );
    }


    /* =====================================================
       PIN
       ===================================================== */

    function pinChat() {

        const id =
            getChatId();

        const list =
            readArray(STORAGE.pinned);

        const index =
            list.findIndex(
                item => item.id === id
            );

        let pinned;

        if (index >= 0) {

            list.splice(index, 1);
            pinned = false;

        } else {

            list.unshift(
                chatRecord({
                    pinned: true
                })
            );

            pinned = true;
        }

        saveArray(
            STORAGE.pinned,
            list
        );

        notify(
            "pingme-chat-pin-changed",
            {
                chatId: id,
                pinned
            }
        );

        alert(
            pinned
                ? "Chat pinned."
                : "Chat unpinned."
        );
    }


    /* =====================================================
       ADD TO PROJECT
       ===================================================== */

    function addToProject() {

        const id =
            getChatId();

        const projects =
            readArray(STORAGE.projects);

        const name =
            prompt("Enter project name:");

        if (
            !name ||
            !name.trim()
        ) {
            return;
        }

        const projectName =
            name.trim();

        let project =
            projects.find(
                item =>
                    item.name === projectName
            );

        if (!project) {

            project = {
                id:
                    "project_" + Date.now(),
                name:
                    projectName,
                chats: []
            };

            projects.push(project);
        }

        if (
            !project.chats.includes(id)
        ) {
            project.chats.push(id);
        }

        saveArray(
            STORAGE.projects,
            projects
        );

        notify(
            "pingme-chat-added-to-project",
            {
                chatId: id,
                projectId: project.id,
                projectName
            }
        );

        alert(
            `"${projectName}"-এ chat যোগ হয়েছে।`
        );
    }


    /* =====================================================
       UPLOADED FILES
       ===================================================== */

    function showUploadedFiles() {

        const files =
            window.pingmeSelectedFiles ||
            window.pingmeAttachments ||
            window.selectedFiles ||
            [];

        document.dispatchEvent(
            new CustomEvent(
                "pingme-open-uploaded-files",
                {
                    detail: {
                        chatId: getChatId(),
                        files
                    }
                }
            )
        );

        if (files.length) {

            alert(
                `${files.length}টি uploaded file পাওয়া গেছে।`
            );

            return;
        }

        const preview =
            document.getElementById(
                "pingme-attachments-preview"
            );

        if (preview) {

            preview.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            return;
        }

        alert(
            "এই chat-এ কোনো uploaded file পাওয়া যায়নি।"
        );
    }


    /* =====================================================
       FIND IN CHAT
       ===================================================== */

    function findInChat() {

        const query =
            prompt("Find in chat:");

        if (
            !query ||
            !query.trim()
        ) {
            return;
        }

        const search =
            query.trim().toLowerCase();

        const history =
            getHistory();

        const results =
            history.filter(item => {

                const text =
                    item.parts?.[0]?.text || "";

                return text
                    .toLowerCase()
                    .includes(search);

            });

        notify(
            "pingme-find-in-chat",
            {
                query,
                results
            }
        );

        if (!results.length) {

            alert(
                `"${query}" পাওয়া যায়নি।`
            );

            return;
        }

        const chatArea =
            document.getElementById("chatArea");

        if (!chatArea) return;

        let found = false;

        for (
            const element of chatArea.children
        ) {

            if (
                element.textContent
                    ?.toLowerCase()
                    .includes(search)
            ) {

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                element.style.outline =
                    "2px solid #1a73e8";

                element.style.borderRadius =
                    "10px";

                found = true;

                setTimeout(() => {
                    element.style.outline = "";
                }, 1800);

                break;
            }
        }

        if (!found) {

            alert(
                `${results.length}টি result পাওয়া গেছে।`
            );
        }
    }


    /* =====================================================
       ADD TO HOME
       ===================================================== */

    async function addToHome() {

        const id =
            getChatId();

        const list =
            readArray(STORAGE.home);

        const exists =
            list.some(
                item => item.id === id
            );

        if (!exists) {

            list.unshift(
                chatRecord({
                    addedToHome: true
                })
            );

            saveArray(
                STORAGE.home,
                list
            );
        }

        if (
            window.pingmeDeferredInstallPrompt
        ) {

            try {

                await window
                    .pingmeDeferredInstallPrompt
                    .prompt();

                await window
                    .pingmeDeferredInstallPrompt
                    .userChoice;

                window.pingmeDeferredInstallPrompt =
                    null;

            } catch (error) {

                console.error(
                    "PingMe Home:",
                    error
                );
            }

        } else {

            alert(
                "Chatটি Home-এর জন্য যোগ করা হয়েছে।"
            );
        }

        notify(
            "pingme-chat-added-to-home",
            {
                chatId: id
            }
        );
    }


    /* =====================================================
       ARCHIVE
       ===================================================== */

    function archiveChat() {

        const id =
            getChatId();

        const archived =
            readArray(STORAGE.archived);

        const already =
            archived.some(
                item => item.id === id
            );

        if (!already) {

            archived.unshift(
                chatRecord({
                    archived: true
                })
            );

            saveArray(
                STORAGE.archived,
                archived
            );
        }

        notify(
            "pingme-chat-archived",
            {
                chatId: id
            }
        );

        if (
            typeof window.archiveChat ===
            "function"
        ) {

            try {

                window.archiveChat(id);

            } catch (error) {

                console.error(
                    "PingMe archiveChat:",
                    error
                );
            }
        }

        alert("Chat archived.");
    }


    /* =====================================================
       DELETE
       ===================================================== */

    function deleteChat() {

        const id =
            getChatId();

        const confirmed =
            confirm(
                "এই chat delete করতে চাস?"
            );

        if (!confirmed) return;

        localStorage.removeItem(
            "pingme_conversation_history"
        );

        localStorage.removeItem(
            "pingme_current_chat_id"
        );

        activeChatId = null;

        if (
            typeof window.pingmeResetChat ===
            "function"
        ) {

            try {

                window.pingmeResetChat();

            } catch (error) {

                console.error(
                    "PingMe reset:",
                    error
                );
            }
        }

        const chatArea =
            document.getElementById("chatArea");

        if (chatArea) {

            chatArea
                .querySelectorAll(
                    ".user-message, .ai-message, .ai-error"
                )
                .forEach(
                    element =>
                        element.remove()
                );
        }

        const welcome =
            document.getElementById("welcome");

        if (welcome) {
            welcome.style.display = "flex";
        }

        const firstBar =
            document.getElementById("firstBar");

        const secondBar =
            document.getElementById("secondBar");

        if (firstBar) {
            firstBar.style.display = "flex";
        }

        if (secondBar) {
            secondBar.style.display = "none";
        }

        const input =
            document.getElementById("chatInput");

        if (input) {
            input.value = "";
        }

        const sendButton =
            document.getElementById("sendButton");

        if (sendButton) {
            sendButton.classList.remove("active");
        }

        notify(
            "pingme-chat-deleted",
            {
                chatId: id
            }
        );

        alert("Chat deleted.");
    }


    /* =====================================================
       ACTION ROUTER
       ===================================================== */

    function handleAction(action) {

        switch (action) {

            case "share":
                shareChat();
                break;

            case "pin":
                pinChat();
                break;

            case "add-to-project":
                addToProject();
                break;

            case "uploaded-files":
                showUploadedFiles();
                break;

            case "find-in-chat":
                findInChat();
                break;

            case "add-to-home":
                addToHome();
                break;

            case "archive":
                archiveChat();
                break;

            case "delete":
                deleteChat();
                break;
        }
    }


    /* =====================================================
       CONNECT TO HEADER MORE MENU
       ===================================================== */

    function connectHeaderMenuActions() {

        const menu =
            document.getElementById(
                "pingme-header-more-menu"
            );

        if (!menu) return false;

        if (
            menu.dataset
                .pingmeFeaturesConnected === "true"
        ) {
            return true;
        }

        menu.dataset
            .pingmeFeaturesConnected = "true";

        menu.addEventListener(
            "pingme-menu-action",
            function (event) {

                const action =
                    event.detail?.action;

                if (!action) return;

                handleAction(action);
            }
        );

        return true;
    }


    /* =====================================================
       WAIT FOR MENU CREATION
       ===================================================== */

    function watchHeaderMenu() {

        if (
            connectHeaderMenuActions()
        ) {
            return;
        }

        const observer =
            new MutationObserver(() => {

                if (
                    connectHeaderMenuActions()
                ) {
                    observer.disconnect();
                }

            });

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.PingMeHeaderMenu = {

        share: shareChat,
        pin: pinChat,
        project: addToProject,
        files: showUploadedFiles,
        find: findInChat,
        home: addToHome,
        archive: archiveChat,
        delete: deleteChat,
        getChatId: getChatId

    };


    /* =====================================================
       START
       ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            watchHeaderMenu,
            { once: true }
        );

    } else {

        watchHeaderMenu();
    }


    console.log(
        "PingMe Header Menu Features Connected"
    );

})();
