/* =========================================================
   PINGME AI — SIDE MENU / DRAWER
   Complete A-Z Menu System
   ========================================================= */

(function () {

    "use strict";

    /* =========================================================
       1. BASIC SETUP
       ========================================================= */

    const menuButton =
        document.getElementById("menuButton");

    const menuButtonChat =
        document.getElementById("menuButtonChat");

    if (!menuButton && !menuButtonChat) {

        console.warn(
            "PingMe AI — menu buttons not found."
        );

        return;
    }

    let drawer = null;
    let overlay = null;
    let searchInput = null;

    /* =========================================================
       2. CREATE SIDE MENU
       ========================================================= */

    function createMenu() {

        if (drawer) return;

        overlay =
            document.createElement("div");

        overlay.id =
            "pingmeMenuOverlay";

        overlay.className =
            "pingme-menu-overlay";

        drawer =
            document.createElement("aside");

        drawer.id =
            "pingmeSideDrawer";

        drawer.className =
            "pingme-side-drawer";

        drawer.setAttribute(
            "aria-hidden",
            "true"
        );

        drawer.innerHTML = `

            <div class="pingme-menu-header">

                <div class="pingme-brand">

                    <div class="pingme-brand-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div class="pingme-brand-name">
                        PingMe AI
                    </div>

                </div>

                <button
                    type="button"
                    class="pingme-menu-close"
                    id="pingmeMenuClose"
                    aria-label="Close menu"
                >
                    ×
                </button>

            </div>


            <div class="pingme-menu-search">

                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        cx="11"
                        cy="11"
                        r="7"
                    ></circle>

                    <path
                        d="M16.5 16.5L21 21"
                    ></path>
                </svg>

                <input
                    type="search"
                    id="pingmeMenuSearch"
                    placeholder="Search"
                    autocomplete="off"
                >

            </div>


            <!-- =================================================
                 MODELS
                 ================================================= -->

            <div class="pingme-model-section">

                <button
                    type="button"
                    class="pingme-model-button"
                    id="pingmeModelButton"
                >

                    <span class="pingme-model-icon">

                        <svg viewBox="0 0 24 24">

                            <path
                                d="M12 3v18"
                            ></path>

                            <path
                                d="M5 8h14"
                            ></path>

                            <path
                                d="M7 8l-3 6h6L7 8Z"
                            ></path>

                            <path
                                d="M17 8l-3 6h6l-3-6Z"
                            ></path>

                        </svg>

                    </span>

                    <span class="pingme-model-label">
                        Models
                    </span>

                    <span class="pingme-model-arrow">
                        ›
                    </span>

                </button>

            </div>


            <!-- =================================================
                 MAIN MENU
                 ================================================= -->

            <nav
                class="pingme-menu-main"
                id="pingmeMenuMain"
            >

                <button
                    type="button"
                    class="pingme-menu-item"
                    data-menu-action="images"
                >

                    <span class="pingme-menu-item-icon">

                        <svg viewBox="0 0 24 24">

                            <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="3"
                            ></rect>

                            <circle
                                cx="8.5"
                                cy="8.5"
                                r="1.5"
                            ></circle>

                            <path
                                d="M21 15l-5-5L6 20"
                            ></path>

                        </svg>

                    </span>

                    <span>Images</span>

                </button>


                <button
                    type="button"
                    class="pingme-menu-item"
                    data-menu-action="library"
                >

                    <span class="pingme-menu-item-icon">

                        <svg viewBox="0 0 24 24">

                            <path
                                d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"
                            ></path>

                            <path
                                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                            ></path>

                        </svg>

                    </span>

                    <span>Library</span>

                </button>


                <button
                    type="button"
                    class="pingme-menu-item"
                    data-menu-action="projects"
                >

                    <span class="pingme-menu-item-icon">

                        <svg viewBox="0 0 24 24">

                            <path
                                d="M3 7h7l2 2h9v10H3z"
                            ></path>

                            <path
                                d="M3 7V5h7l2 2"
                            ></path>

                        </svg>

                    </span>

                    <span>Projects</span>

                </button>


                <button
                    type="button"
                    class="pingme-menu-item"
                    data-menu-action="remote"
                >

                    <span class="pingme-menu-item-icon">

                        <svg viewBox="0 0 24 24">

                            <rect
                                x="4"
                                y="5"
                                width="16"
                                height="11"
                                rx="2"
                            ></rect>

                            <path
                                d="M8 20h8"
                            ></path>

                            <path
                                d="M12 16v4"
                            ></path>

                        </svg>

                    </span>

                    <span>Remote</span>

                </button>


                <button
                    type="button"
                    class="pingme-menu-item"
                    data-menu-action="scheduled"
                >

                    <span class="pingme-menu-item-icon">

                        <svg viewBox="0 0 24 24">

                            <circle
                                cx="12"
                                cy="12"
                                r="8.5"
                            ></circle>

                            <path
                                d="M12 7v5l3 2"
                            ></path>

                        </svg>

                    </span>

                    <span>Scheduled</span>

                </button>


                <button
                    type="button"
                    class="pingme-menu-item"
                    data-menu-action="plugins"
                >

                    <span class="pingme-menu-item-icon">

                        <svg viewBox="0 0 24 24">

                            <path d="M8 3v5"></path>
                            <path d="M16 3v5"></path>

                            <path
                                d="M5 8h14v5a7 7 0 0 1-14 0V8Z"
                            ></path>

                            <path d="M8 21h8"></path>
                            <path d="M12 15v6"></path>

                        </svg>

                    </span>

                    <span>Plugins</span>

                </button>

            </nav>


            <!-- =================================================
                 CHAT
                 ================================================= -->

            <div class="pingme-menu-chat-section">

                <button
                    type="button"
                    class="pingme-chat-button"
                    id="pingmeNewChatButton"
                >

                    <span class="pingme-chat-button-icon">

                        <svg viewBox="0 0 24 24">

                            <path
                                d="M12 20a8 8 0 1 0-8-8c0 1.4.36 2.72 1 3.9L4 20l4.1-1c1.18.64 2.5 1 3.9 1Z"
                            ></path>

                            <path d="M12 8v8"></path>
                            <path d="M8 12h8"></path>

                        </svg>

                    </span>

                    <span>Chat</span>

                </button>

            </div>


            <!-- =================================================
                 HISTORY
                 ================================================= -->

            <div class="pingme-history-section">

                <div class="pingme-section-title">
                    Recent
                </div>

                <div
                    class="pingme-history-list"
                    id="pingmeHistoryList"
                ></div>

            </div>


            <!-- =================================================
                 ACCOUNT
                 ================================================= -->

            <div class="pingme-account-area">

                <button
                    type="button"
                    class="pingme-account-button"
                    id="pingmeAccountButton"
                >

                    <div
                        class="pingme-account-avatar"
                        id="pingmeAccountAvatar"
                    >
                        <span id="pingmeAccountInitial">
                            P
                        </span>
                    </div>

                    <div class="pingme-account-info">

                        <div
                            class="pingme-account-name"
                            id="pingmeAccountName"
                        >
                            PingMe User
                        </div>

                        <div
                            class="pingme-account-email"
                            id="pingmeAccountEmail"
                        >
                            Not signed in
                        </div>

                    </div>

                    <div class="pingme-account-arrow">
                        ›
                    </div>

                </button>

            </div>

        `;

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        createModelPopup();

        addStyles();
        setupEvents();
        loadUserAccount();
        loadHistory();

    }


    /* =========================================================
       3. MODEL POPUP
       ========================================================= */

    function createModelPopup() {

        const popup =
            document.createElement("div");

        popup.id =
            "pingmeModelPopup";

        popup.className =
            "pingme-model-popup";

        popup.innerHTML = `

            <div class="pingme-model-popup-box">

                <div class="pingme-model-popup-header">
                    <span>Select Model</span>

                    <button
                        type="button"
                        id="pingmeModelClose"
                    >
                        ×
                    </button>
                </div>

                <button
                    type="button"
                    class="pingme-model-option"
                    data-model="gemini-3.8-flash"
                >
                    <span>PingMe Plus</span>
                </button>

                <button
                    type="button"
                    class="pingme-model-option"
                    data-model="gemini-3.6-flash"
                >
                    <span>PingMe Turbo</span>
                </button>

                <button
                    type="button"
                    class="pingme-model-option"
                    data-model="gemini-3.5-flash-lite"
                >
                    <span>PingMe Pro</span>
                </button>

                <button
                    type="button"
                    class="pingme-model-option"
                    data-model="openai"
                >
                    <span>PingMe Ultra</span>
                    <small>Not active yet</small>
                </button>

            </div>

        `;

        document.body.appendChild(popup);

        setupModelPopup();

    }


    function setupModelPopup() {

        const button =
            document.getElementById(
                "pingmeModelButton"
            );

        const popup =
            document.getElementById(
                "pingmeModelPopup"
            );

        const close =
            document.getElementById(
                "pingmeModelClose"
            );

        if (!button || !popup) return;


        button.addEventListener(
            "click",
            function () {

                popup.classList.add("show");

                updateSelectedModel();

            }
        );


        if (close) {

            close.addEventListener(
                "click",
                function () {

                    popup.classList.remove("show");

                }
            );

        }


        popup.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === popup
                ) {

                    popup.classList.remove(
                        "show"
                    );

                }

            }
        );


        const options =
            popup.querySelectorAll(
                ".pingme-model-option"
            );


        options.forEach(
            function (option) {

                option.addEventListener(
                    "click",
                    function () {

                        const model =
                            option.dataset.model;

                        selectModel(model);

                        popup.classList.remove(
                            "show"
                        );

                    }
                );

            }
        );

    }


    function getCurrentModel() {

        const modelSelect =
            document.getElementById(
                "modelSelect"
            );

        if (
            modelSelect &&
            modelSelect.value
        ) {

            return modelSelect.value;

        }


        try {

            const saved =
                localStorage.getItem(
                    "pingme_selected_model"
                );

            if (saved) return saved;

        } catch (error) {}

        return "gemini-3.8-flash";

    }


    function selectModel(model) {

        try {

            localStorage.setItem(
                "pingme_selected_model",
                model
            );

        } catch (error) {}


        const modelSelect =
            document.getElementById(
                "modelSelect"
            );


        if (modelSelect) {

            modelSelect.value =
                model;

            modelSelect.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles: true
                    }
                )
            );

        }


        updateSelectedModel();

    }


    function updateSelectedModel() {

        const model =
            getCurrentModel();


        const options =
            document.querySelectorAll(
                ".pingme-model-option"
            );


        options.forEach(
            function (option) {

                option.classList.toggle(
                    "selected",
                    option.dataset.model === model
                );

            }
        );

    }


    /* =========================================================
       4. OPEN MENU
       ========================================================= */

    function openMenu() {

        if (!drawer) {
            createMenu();
        }

        requestAnimationFrame(
            function () {

                drawer.classList.add("open");
                overlay.classList.add("show");

                drawer.setAttribute(
                    "aria-hidden",
                    "false"
                );

                document.body.classList.add(
                    "pingme-menu-open"
                );

            }
        );

    }


    /* =========================================================
       5. CLOSE MENU
       ========================================================= */

    function closeMenu() {

        if (!drawer) return;

        drawer.classList.remove("open");
        overlay.classList.remove("show");

        drawer.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "pingme-menu-open"
        );

    }


    /* =========================================================
       6. TOGGLE MENU
       ========================================================= */

    function toggleMenu() {

        if (!drawer) {

            openMenu();

            return;

        }

        if (
            drawer.classList.contains("open")
        ) {

            closeMenu();

        } else {

            openMenu();

        }

    }


    /* =========================================================
       7. USER ACCOUNT
       ========================================================= */

    function loadUserAccount() {

        const nameElement =
            document.getElementById(
                "pingmeAccountName"
            );

        const emailElement =
            document.getElementById(
                "pingmeAccountEmail"
            );

        const avatarElement =
            document.getElementById(
                "pingmeAccountAvatar"
            );

        const initialElement =
            document.getElementById(
                "pingmeAccountInitial"
            );

        if (
            !nameElement ||
            !emailElement ||
            !avatarElement ||
            !initialElement
        ) {

            return;

        }

        let user = null;

        try {

            if (
                typeof getAuthUser ===
                "function"
            ) {

                user =
                    getAuthUser();

            }

        } catch (error) {

            console.warn(
                "PingMe AI — Unable to read auth user.",
                error
            );

        }


        if (!user) {

            nameElement.textContent =
                "PingMe User";

            emailElement.textContent =
                "Not signed in";

            initialElement.textContent =
                "P";

            return;

        }


        const email =
            user.email ||
            user.mail ||
            "Signed-in user";


        const displayName =
            user.displayName ||
            user.name ||
            email.split("@")[0] ||
            "PingMe User";


        nameElement.textContent =
            displayName;

        emailElement.textContent =
            email;


        const photo =
            user.photoURL ||
            user.photo ||
            user.avatar ||
            user.profileImage;


        if (photo) {

            avatarElement.innerHTML = "";

            const image =
                document.createElement(
                    "img"
                );

            image.src = photo;
            image.alt = displayName;
            image.referrerPolicy =
                "no-referrer";


            image.onerror =
                function () {

                    avatarElement.innerHTML =
                        "";

                    initialElement.textContent =
                        getInitial(
                            displayName
                        );

                    avatarElement.appendChild(
                        initialElement
                    );

                };


            avatarElement.appendChild(
                image
            );

        } else {

            initialElement.textContent =
                getInitial(
                    displayName
                );

        }

    }


    /* =========================================================
       8. GET USER INITIAL
       ========================================================= */

    function getInitial(name) {

        if (!name) {
            return "P";
        }

        return name
            .trim()
            .charAt(0)
            .toUpperCase();

    }


    /* =========================================================
       9. SEARCH
       ========================================================= */

    function setupSearch() {

        searchInput =
            document.getElementById(
                "pingmeMenuSearch"
            );

        if (!searchInput) return;


        searchInput.addEventListener(
            "input",
            function () {

                const query =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                const items =
                    document.querySelectorAll(
                        ".pingme-menu-item"
                    );


                items.forEach(
                    function (item) {

                        const text =
                            item.textContent
                                .trim()
                                .toLowerCase();


                        if (
                            !query ||
                            text.includes(query)
                        ) {

                            item.style.display =
                                "flex";

                        } else {

                            item.style.display =
                                "none";

                        }

                    }
                );

            }
        );

    }


    /* =========================================================
       10. MENU ACTIONS
       ========================================================= */

    function setupMenuActions() {

        const items =
            document.querySelectorAll(
                ".pingme-menu-item"
            );


        items.forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    function () {

                        const action =
                            item.dataset.menuAction;

                        handleMenuAction(
                            action
                        );

                    }
                );

            }
        );

    }


    /* =========================================================
       11. HANDLE MENU ACTION
       ========================================================= */

    function handleMenuAction(action) {

        switch (action) {

            case "images":

                closeMenu();

                if (
                    typeof window.PingMeImages !==
                    "undefined" &&
                    typeof window.PingMeImages.open ===
                    "function"
                ) {

                    window.PingMeImages.open();

                }

                break;


            case "library":

                showMenuNotice("Library");

                break;


            case "projects":

                showMenuNotice("Projects");

                break;


            case "remote":

                showMenuNotice("Remote");

                break;


            case "scheduled":

                showMenuNotice("Scheduled");

                break;


            case "plugins":

                showMenuNotice("Plugins");

                break;


            default:

                break;

        }

    }


    /* =========================================================
       12. MENU NOTICE
       ========================================================= */

    function showMenuNotice(title) {

        console.log(
            "PingMe AI — " +
            title +
            " selected."
        );

    }


    /* =========================================================
       13. NEW CHAT
       ========================================================= */

    function setupNewChat() {

        const button =
            document.getElementById(
                "pingmeNewChatButton"
            );

        if (!button) return;


        button.addEventListener(
            "click",
            function () {

                closeMenu();


                const input =
                    document.getElementById(
                        "chatInput"
                    );


                if (input) {

                    input.value = "";

                    input.dispatchEvent(
                        new Event(
                            "input",
                            {
                                bubbles: true
                            }
                        )
                    );

                }


                const chatArea =
                    document.getElementById(
                        "chatArea"
                    );


                if (chatArea) {

                    chatArea.innerHTML = "";

                }


                const welcome =
                    document.getElementById(
                        "welcome"
                    );


                if (welcome) {

                    welcome.style.display = "";

                }

            }
        );

    }


    /* =========================================================
       14. HISTORY
       ========================================================= */

    const PINGME_HISTORY_KEY =
        "pingme_chat_history";


    function getChatHistory() {

        try {

            const saved =
                localStorage.getItem(
                    PINGME_HISTORY_KEY
                );


            if (!saved) {

                return [];

            }


            const history =
                JSON.parse(saved);


            return Array.isArray(history)
                ? history
                : [];


        } catch (error) {

            console.error(
                "PingMe History Load Error:",
                error
            );

            return [];

        }

    }


    function saveChatHistory(history) {

        try {

            localStorage.setItem(
                PINGME_HISTORY_KEY,
                JSON.stringify(history)
            );

            return true;


        } catch (error) {

            console.error(
                "PingMe History Save Error:",
                error
            );

            return false;

        }

    }


    function addChatToHistory(chat) {

        if (!chat) {

            return false;

        }


        const history =
            getChatHistory();


        history.push({

            ...chat,

            timestamp:
                Date.now()

        });


        const saved =
            saveChatHistory(history);


        loadHistory();


        if (
            typeof window.PingMeMenu !==
            "undefined" &&
            typeof window.PingMeMenu
                .refreshHistory ===
            "function"
        ) {

            window.PingMeMenu.refreshHistory();

        }


        return saved;

    }


    function clearChatHistory() {

        try {

            localStorage.removeItem(
                PINGME_HISTORY_KEY
            );

            loadHistory();

            return true;


        } catch (error) {

            console.error(
                "PingMe History Clear Error:",
                error
            );

            return false;

        }

    }


    function getLatestChat() {

        const history =
            getChatHistory();


        if (!history.length) {

            return null;

        }


        return history[
            history.length - 1
        ];

    }


    function openHistoryItem(item) {

        if (!item) {

            return;

        }


        const input =
            document.getElementById(
                "chatInput"
            );


        const text =
            typeof item === "string"
                ? item
                : (
                    item.text ||
                    item.message ||
                    ""
                );


        if (
            input &&
            text
        ) {

            input.value =
                text;


            input.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles: true
                    }
                )
            );


            input.focus();

        }


        closeMenu();

    }


    function loadHistory() {

        const list =
            document.getElementById(
                "pingmeHistoryList"
            );


        if (!list) {

            return;

        }


        list.innerHTML = "";


        const history =
            getChatHistory();


        if (
            !Array.isArray(history) ||
            history.length === 0
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "pingme-history-empty";


            empty.textContent =
                "Your recent chats will appear here.";


            list.appendChild(empty);

            return;

        }


        history
            .slice()
            .reverse()
            .slice(0, 20)
            .forEach(
                function (item) {

                    const title =
                        typeof item === "string"
                            ? item
                            : (
                                item.text ||
                                item.title ||
                                item.name ||
                                item.message ||
                                "New chat"
                            );


                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "pingme-history-item";


                    button.textContent =
                        title;


                    button.title =
                        title;


                    button.addEventListener(
                        "click",
                        function () {

                            openHistoryItem(
                                item
                            );

                        }
                    );


                    list.appendChild(
                        button
                    );

                }
            );

    }


    function setupHistoryAPI() {

        window.addChatToHistory =
            addChatToHistory;

        window.getChatHistory =
            getChatHistory;

        window.saveChatHistory =
            saveChatHistory;

        window.clearChatHistory =
            clearChatHistory;

        window.getLatestChat =
            getLatestChat;

    }


    /* =========================================================
       15. ACCOUNT BUTTON
       ========================================================= */

    function setupAccountButton() {

        const button =
            document.getElementById(
                "pingmeAccountButton"
            );


        if (!button) return;


        button.addEventListener(
            "click",
            function () {

                console.log(
                    "PingMe AI — Account selected."
                );

            }
        );

    }


    /* =========================================================
       16. KEYBOARD
       ========================================================= */

    function setupKeyboard() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    drawer &&
                    drawer.classList.contains("open")
                ) {

                    closeMenu();

                }

            }
        );

    }


    /* =========================================================
       17. EVENTS
       ========================================================= */

    function setupEvents() {

        if (menuButton) {

            menuButton.addEventListener(
                "click",
                function () {

                    toggleMenu();

                }
            );

        }


        if (menuButtonChat) {

            menuButtonChat.addEventListener(
                "click",
                function () {

                    toggleMenu();

                }
            );

        }


        const closeButton =
            document.getElementById(
                "pingmeMenuClose"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeMenu
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeMenu
            );

        }


        setupSearch();
        setupMenuActions();
        setupNewChat();
        setupAccountButton();
        setupKeyboard();

    }


    /* =========================================================
       18. COMPLETE CSS
       ========================================================= */

    function addStyles() {

        if (
            document.getElementById(
                "pingmeMenuStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "pingmeMenuStyles";


        style.textContent = `

            .pingme-menu-overlay {

                position: fixed;
                inset: 0;

                background:
                    rgba(0,0,0,.28);

                opacity: 0;
                visibility: hidden;
                pointer-events: none;

                transition:
                    opacity .22s ease,
                    visibility .22s ease;

                z-index: 9998;

            }


            .pingme-menu-overlay.show {

                opacity: 1;
                visibility: visible;
                pointer-events: auto;

            }


            .pingme-side-drawer {

                position: fixed;

                top: 0;
                left: 0;

                width:
                    min(340px,86vw);

                height: 100dvh;

                background: #fff;
                color: #171717;

                border-right:
                    1px solid
                    rgba(0,0,0,.08);

                box-shadow:
                    12px 0 35px
                    rgba(0,0,0,.12);

                transform:
                    translateX(-105%);

                transition:
                    transform .28s
                    cubic-bezier(
                        .22,.61,.36,1
                    );

                z-index: 9999;

                display: flex;
                flex-direction: column;

                overflow: hidden;

                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    Roboto,
                    Arial,
                    sans-serif;

            }


            .pingme-side-drawer.open {

                transform:
                    translateX(0);

            }


            .pingme-menu-header {

                min-height: 64px;

                display: flex;

                align-items: center;
                justify-content: space-between;

                padding:
                    12px 14px 8px 18px;

                flex-shrink: 0;

            }


            .pingme-brand {

                display: flex;
                align-items: center;
                gap: 10px;

                min-width: 0;

            }


            .pingme-brand-icon {

                width: 32px;
                height: 32px;

                border-radius: 10px;

                display: flex;
                align-items: center;
                justify-content: center;

                gap: 2px;

                background: #111;

                flex-shrink: 0;

            }


            .pingme-brand-icon span {

                display: block;

                width: 3px;
                height: 13px;

                border-radius: 5px;

                background: #fff;

            }


            .pingme-brand-icon span:nth-child(1) {
                height: 8px;
            }


            .pingme-brand-icon span:nth-child(3) {
                height: 17px;
            }


            .pingme-brand-name {

                font-size: 17px;
                font-weight: 700;

                letter-spacing: -.25px;

                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;

            }


            .pingme-menu-close {

                width: 38px;
                height: 38px;

                border: 0;
                background: transparent;

                border-radius: 12px;

                font-size: 28px;
                line-height: 1;

                color: #555;

                cursor: pointer;

                display: flex;
                align-items: center;
                justify-content: center;

                flex-shrink: 0;

            }


            .pingme-menu-close:active {
                background: #f0f0f0;
            }


            .pingme-menu-search {

                margin:
                    5px 14px 8px;

                height: 44px;

                border-radius: 13px;

                background: #f3f3f3;

                display: flex;
                align-items: center;

                padding: 0 13px;

                gap: 9px;

                flex-shrink: 0;

            }


            .pingme-menu-search svg {

                width: 19px;
                height: 19px;

                fill: none;

                stroke: #777;

                stroke-width: 1.8;

                flex-shrink: 0;

            }


            .pingme-menu-search input {

                border: 0;
                outline: 0;

                background: transparent;

                width: 100%;
                height: 100%;

                font-size: 15px;

                color: #181818;

            }


            .pingme-menu-search input::placeholder {
                color: #888;
            }


            /* =================================================
               MODELS BUTTON
               ================================================= */

            .pingme-model-section {

                padding:
                    0 9px 4px;

                flex-shrink: 0;

            }


            .pingme-model-button {

                width: 100%;

                min-height: 46px;

                border: 0;

                background: transparent;

                border-radius: 12px;

                display: flex;

                align-items: center;

                gap: 13px;

                padding: 0 11px;

                color: #202020;

                font-size: 15px;

                font-weight: 500;

                text-align: left;

                cursor: pointer;

            }


            .pingme-model-button:hover {
                background: #f2f2f2;
            }


            .pingme-model-button:active {
                background: #e9e9e9;
            }


            .pingme-model-icon {

                width: 24px;
                height: 24px;

                display: flex;
                align-items: center;
                justify-content: center;

                flex-shrink: 0;

            }


            .pingme-model-icon svg {

                width: 20px;
                height: 20px;

                fill: none;

                stroke: currentColor;

                stroke-width: 1.8;

                stroke-linecap: round;
                stroke-linejoin: round;

            }


            .pingme-model-label {
                flex: 1;
            }


            .pingme-model-arrow {

                font-size: 24px;

                color: #999;

                line-height: 1;

            }


            /* =================================================
               MODEL POPUP
               ================================================= */

            .pingme-model-popup {

                position: fixed;

                inset: 0;

                z-index: 10001;

                display: flex;

                align-items: center;
                justify-content: center;

                padding: 20px;

                background:
                    rgba(0,0,0,.22);

                opacity: 0;
                visibility: hidden;
                pointer-events: none;

                transition:
                    opacity .2s ease,
                    visibility .2s ease;

            }


            .pingme-model-popup.show {

                opacity: 1;
                visibility: visible;
                pointer-events: auto;

            }


            .pingme-model-popup-box {

                width:
                    min(330px,90vw);

                background: #fff;

                border-radius: 20px;

                padding: 8px;

                box-shadow:
                    0 18px 55px
                    rgba(0,0,0,.18);

                transform:
                    translateY(8px)
                    scale(.97);

                transition:
                    transform .2s ease;

            }


            .pingme-model-popup.show
            .pingme-model-popup-box {

                transform:
                    translateY(0)
                    scale(1);

            }


            .pingme-model-popup-header {

                min-height: 48px;

                padding:
                    0 10px 0 13px;

                display: flex;

                align-items: center;
                justify-content: space-between;

                font-size: 16px;

                font-weight: 700;

            }


            .pingme-model-popup-header button {

                width: 34px;
                height: 34px;

                border: 0;

                border-radius: 10px;

                background: transparent;

                font-size: 23px;

                color: #777;

                cursor: pointer;

            }


            .pingme-model-option {

                width: 100%;

                min-height: 52px;

                border: 0;

                border-radius: 13px;

                background: transparent;

                display: flex;

                align-items: center;

                justify-content: space-between;

                padding:
                    0 13px;

                font-size: 15px;

                font-weight: 500;

                color: #202020;

                text-align: left;

                cursor: pointer;

            }


            .pingme-model-option:hover {
                background: #f3f3f3;
            }


            .pingme-model-option.selected {

                background:
                    linear-gradient(
                        135deg,
                        #f1f7ff,
                        #eaf3ff
                    );

                color: #1769d2;

                font-weight: 600;

            }


            .pingme-model-option small {

                font-size: 10px;

                color: #999;

                font-weight: 500;

            }


            /* =================================================
               MAIN MENU
               ================================================= */

            .pingme-menu-main {

                padding: 0 9px;

                flex-shrink: 0;

            }


            .pingme-menu-item {

                width: 100%;

                min-height: 46px;

                border: 0;

                background: transparent;

                border-radius: 12px;

                display: flex;

                align-items: center;

                gap: 13px;

                padding: 0 11px;

                color: #202020;

                font-size: 15px;

                font-weight: 500;

                text-align: left;

                cursor: pointer;

                transition:
                    background .15s ease;

            }


            .pingme-menu-item:hover {
                background: #f2f2f2;
            }


            .pingme-menu-item:active {
                background: #e9e9e9;
            }


            .pingme-menu-item-icon {

                width: 24px;
                height: 24px;

                display: flex;

                align-items: center;
                justify-content: center;

                flex-shrink: 0;

            }


            .pingme-menu-item-icon svg {

                width: 20px;
                height: 20px;

                fill: none;

                stroke: currentColor;

                stroke-width: 1.8;

                stroke-linecap: round;
                stroke-linejoin: round;

            }


            /* =================================================
               CHAT
               ================================================= */

            .pingme-menu-chat-section {

                padding:
                    9px 9px 4px;

            }


            .pingme-chat-button {

                width: 100%;

                height: 46px;

                border: 0;

                border-radius: 12px;

                background: #f1f1f1;

                color: #181818;

                display: flex;

                align-items: center;

                gap: 13px;

                padding: 0 12px;

                font-size: 15px;

                font-weight: 600;

                cursor: pointer;

            }


            .pingme-chat-button:active {
                background: #e5e5e5;
            }


            .pingme-chat-button-icon {

                width: 24px;
                height: 24px;

                display: flex;

                align-items: center;
                justify-content: center;

            }


            .pingme-chat-button-icon svg {

                width: 20px;
                height: 20px;

                fill: none;

                stroke: currentColor;

                stroke-width: 1.8;

                stroke-linecap: round;
                stroke-linejoin: round;

            }


            /* =================================================
               HISTORY
               ================================================= */

            .pingme-history-section {

                flex: 1;

                min-height: 0;

                overflow-y: auto;

                padding:
                    10px 9px 12px;

            }


            .pingme-history-section::-webkit-scrollbar {
                width: 4px;
            }


            .pingme-history-section::-webkit-scrollbar-thumb {

                background:
                    rgba(0,0,0,.16);

                border-radius: 10px;

            }


            .pingme-section-title {

                padding:
                    5px 11px 8px;

                font-size: 12px;

                font-weight: 600;

                color: #858585;

            }


            .pingme-history-empty {

                padding:
                    13px 11px;

                color: #999;

                font-size: 13px;

                line-height: 1.45;

            }


            .pingme-history-item {

                width: 100%;

                min-height: 42px;

                border: 0;

                background: transparent;

                border-radius: 10px;

                padding:
                    8px 11px;

                text-align: left;

                font-size: 13px;

                color: #454545;

                white-space: nowrap;

                overflow: hidden;

                text-overflow: ellipsis;

                cursor: pointer;

            }


            .pingme-history-item:hover {
                background: #f3f3f3;
            }


            /* =================================================
               ACCOUNT
               ================================================= */

            .pingme-account-area {

                border-top:
                    1px solid
                    rgba(0,0,0,.07);

                padding: 10px;

                flex-shrink: 0;

                background: #fff;

            }


            .pingme-account-button {

                width: 100%;

                border: 0;

                background: transparent;

                border-radius: 13px;

                display: flex;

                align-items: center;

                gap: 10px;

                padding: 8px;

                text-align: left;

                cursor: pointer;

            }


            .pingme-account-button:hover {
                background: #f3f3f3;
            }


            .pingme-account-avatar {

                width: 38px;
                height: 38px;

                border-radius: 50%;

                overflow: hidden;

                background: #171717;

                color: #fff;

                display: flex;

                align-items: center;
                justify-content: center;

                font-size: 15px;

                font-weight: 700;

                flex-shrink: 0;

            }


            .pingme-account-avatar img {

                width: 100%;
                height: 100%;

                object-fit: cover;

                display: block;

            }


            .pingme-account-info {

                min-width: 0;

                flex: 1;

            }


            .pingme-account-name {

                font-size: 14px;

                font-weight: 600;

                color: #202020;

                white-space: nowrap;

                overflow: hidden;

                text-overflow: ellipsis;

            }


            .pingme-account-email {

                margin-top: 2px;

                font-size: 11px;

                color: #858585;

                white-space: nowrap;

                overflow: hidden;

                text-overflow: ellipsis;

            }


            .pingme-account-arrow {

                font-size: 25px;

                line-height: 1;

                color: #999;

                flex-shrink: 0;

            }


            body.pingme-menu-open {
                overflow: hidden;
            }


            @media (max-width: 480px) {

                .pingme-side-drawer {

                    width:
                        min(330px,88vw);

                }


                .pingme-menu-header {
                    padding-left: 16px;
                }

            }

        `;


        document.head.appendChild(style);

    }


    /* =========================================================
       19. INITIALIZE
       ========================================================= */

    setupHistoryAPI();

    createMenu();


    /* =========================================================
       20. PUBLIC API
       ========================================================= */

    window.PingMeMenu = {

        open:
            openMenu,

        close:
            closeMenu,

        toggle:
            toggleMenu,

        refreshAccount:
            loadUserAccount,

        refreshHistory:
            loadHistory,

        addHistory:
            addChatToHistory,

        getHistory:
            getChatHistory,

        saveHistory:
            saveChatHistory,

        clearHistory:
            clearChatHistory,

        getLatestHistory:
            getLatestChat,

        openHistory:
            openHistoryItem

    };


    /* =========================================================
       21. READY
       ========================================================= */

    console.log(
        "PingMe AI — Side Menu Ready"
    );

})();
