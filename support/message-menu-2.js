/* =========================================================
   PingMe AI — Message Menu 2
   Existing More / Three-Dot Popup
   UI ONLY — Actions will be connected later
   ========================================================= */

(() => {
    "use strict";

    const MENU_ID = "pingme-message-menu-2";
    const MORE_SELECTOR = ".pingme-message-actions button[aria-label='More']";

    const ICONS = {

        share: `
            <svg viewBox="0 0 24 24">
                <path d="M12 15V3m0 0L7 8m5-5 5 5"/>
                <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
            </svg>
        `,

        pin: `
            <svg viewBox="0 0 24 24">
                <path d="M9 4h6"/>
                <path d="M8 4v6l-2 3h12l-2-3V4"/>
                <path d="M12 13v7"/>
            </svg>
        `,

        project: `
            <svg viewBox="0 0 24 24">
                <path d="M4 7h6l2 2h8v10H4z"/>
                <path d="M4 7V5h6l2 2"/>
            </svg>
        `,

        files: `
            <svg viewBox="0 0 24 24">
                <path d="M6 3h8l4 4v14H6z"/>
                <path d="M14 3v5h5"/>
                <path d="M9 13h6"/>
                <path d="M9 17h6"/>
            </svg>
        `,

        search: `
            <svg viewBox="0 0 24 24">
                <circle cx="10.8" cy="10.8" r="6.8"/>
                <path d="M16 16l5 5"/>
            </svg>
        `,

        home: `
            <svg viewBox="0 0 24 24">
                <path d="M3 11.5L12 4l9 7.5"/>
                <path d="M5 10.5V20h14v-9.5"/>
                <path d="M9 20v-5h6v5"/>
            </svg>
        `,

        archive: `
            <svg viewBox="0 0 24 24">
                <path d="M4 7h16v13H4z"/>
                <path d="M3 4h18v3H3z"/>
                <path d="M9 12h6"/>
            </svg>
        `,

        trash: `
            <svg viewBox="0 0 24 24">
                <path d="M4 7h16"/>
                <path d="M9 7V4h6v3"/>
                <path d="M6 7l1 14h10l1-14"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
            </svg>
        `,

        chevron: `
            <svg viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7"/>
            </svg>
        `
    };

    const ITEMS = [
        ["share", "Share", false],
        ["pin", "Pin", false],
        ["project", "Add to project", true],
        ["files", "Uploaded files", false],
        ["search", "Find in chat", false],
        ["home", "Add to home", false],
        ["archive", "Archive", false],
        ["trash", "Delete", false, true]
    ];

    /* =====================================================
       STYLE
       ===================================================== */

    function addStyles() {

        if (document.getElementById(
            "pingme-message-menu-2-style"
        )) return;

        const style = document.createElement("style");

        style.id = "pingme-message-menu-2-style";

        style.textContent = `

            #${MENU_ID}{
                position:fixed !important;
                z-index:2147483647 !important;

                width:228px !important;
                max-width:calc(100vw - 20px) !important;

                padding:6px !important;

                background:#fff !important;
                color:#202124 !important;

                border:1px solid rgba(0,0,0,.08) !important;
                border-radius:13px !important;

                box-shadow:
                    0 10px 28px rgba(0,0,0,.14),
                    0 2px 7px rgba(0,0,0,.07) !important;

                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    Roboto,
                    Arial,
                    sans-serif !important;

                opacity:0;
                transform:scale(.96);
                transform-origin:top right;

                pointer-events:none;

                transition:
                    opacity .12s ease,
                    transform .12s ease;
            }

            #${MENU_ID}.show{
                opacity:1;
                transform:scale(1);
                pointer-events:auto;
            }

            #${MENU_ID} *{
                box-sizing:border-box !important;
            }

            #${MENU_ID} .pm-menu-item{
                width:100% !important;
                height:39px !important;

                display:flex !important;
                align-items:center !important;

                padding:0 9px !important;
                margin:0 !important;

                border:0 !important;
                border-radius:8px !important;
                outline:0 !important;

                background:transparent !important;
                color:#202124 !important;

                font-size:14px !important;
                font-weight:400 !important;

                text-align:left !important;
                cursor:pointer !important;

                -webkit-tap-highlight-color:transparent !important;
            }

            #${MENU_ID} .pm-menu-item:hover{
                background:#f3f4f6 !important;
            }

            #${MENU_ID} .pm-menu-item:active{
                background:#e9eaec !important;
            }

            #${MENU_ID} .pm-menu-icon{
                width:20px !important;
                height:20px !important;

                flex:0 0 20px !important;

                display:flex !important;
                align-items:center !important;
                justify-content:center !important;

                margin-right:11px !important;
            }

            #${MENU_ID} .pm-menu-icon svg{
                width:18px !important;
                height:18px !important;

                fill:none !important;
                stroke:currentColor !important;
                stroke-width:1.8 !important;
                stroke-linecap:round !important;
                stroke-linejoin:round !important;
            }

            #${MENU_ID} .pm-menu-label{
                flex:1 !important;
                min-width:0 !important;

                white-space:nowrap !important;
                overflow:hidden !important;
                text-overflow:ellipsis !important;
            }

            #${MENU_ID} .pm-menu-arrow{
                width:16px !important;
                height:16px !important;

                display:flex !important;
                align-items:center !important;
                justify-content:center !important;

                margin-left:8px !important;
                opacity:.7 !important;
            }

            #${MENU_ID} .pm-menu-arrow svg{
                width:15px !important;
                height:15px !important;

                fill:none !important;
                stroke:currentColor !important;
                stroke-width:1.8 !important;
                stroke-linecap:round !important;
                stroke-linejoin:round !important;
            }

            #${MENU_ID} .danger{
                color:#d93025 !important;
            }

            #${MENU_ID} .danger:hover{
                background:#fff1f0 !important;
            }

            @media(max-width:480px){

                #${MENU_ID}{
                    width:224px !important;
                    padding:5px !important;
                    border-radius:12px !important;
                }

                #${MENU_ID} .pm-menu-item{
                    height:38px !important;
                    font-size:14px !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       CREATE MENU
       ===================================================== */

    function createMenu() {

        let menu = document.getElementById(MENU_ID);

        if (menu) return menu;

        menu = document.createElement("div");

        menu.id = MENU_ID;
        menu.setAttribute("role", "menu");

        ITEMS.forEach(item => {

            const [
                id,
                label,
                arrow,
                danger
            ] = item;

            const button =
                document.createElement("button");

            button.type = "button";
            button.className =
                "pm-menu-item" +
                (danger ? " danger" : "");

            button.dataset.menuAction = id;

            button.innerHTML = `

                <span class="pm-menu-icon">
                    ${ICONS[id]}
                </span>

                <span class="pm-menu-label">
                    ${label}
                </span>

                ${
                    arrow
                        ? `
                            <span class="pm-menu-arrow">
                                ${ICONS.chevron}
                            </span>
                        `
                        : ""
                }
            `;

            button.addEventListener("click", e => {

                e.stopPropagation();

                /*
                 * UI ONLY.
                 * Actual actions will be connected later.
                 */

                document.dispatchEvent(
                    new CustomEvent(
                        "pingme:message-menu-action",
                        {
                            detail:{
                                action:id,
                                label
                            }
                        }
                    )
                );

                if (id !== "project") {
                    hideMenu();
                }
            });

            menu.appendChild(button);
        });

        document.body.appendChild(menu);

        return menu;
    }

    /* =====================================================
       POSITION
       ===================================================== */

    let activeButton = null;

    function positionMenu(button) {

        const menu = createMenu();

        const rect =
            button.getBoundingClientRect();

        menu.classList.remove("show");

        const width =
            Math.min(
                228,
                window.innerWidth - 20
            );

        const height =
            menu.offsetHeight || 330;

        let left =
            rect.right - width;

        let top =
            rect.bottom + 6;

        if (left < 10)
            left = 10;

        if (
            left + width >
            window.innerWidth - 10
        ) {
            left =
                window.innerWidth -
                width -
                10;
        }

        if (
            top + height >
            window.innerHeight - 10
        ) {
            top =
                rect.top -
                height -
                6;
        }

        if (top < 10)
            top = 10;

        menu.style.left =
            `${left}px`;

        menu.style.top =
            `${top}px`;

        requestAnimationFrame(() => {
            menu.classList.add("show");
        });
    }

    /* =====================================================
       SHOW / HIDE
       ===================================================== */

    function showMenu(button) {

        addStyles();

        activeButton = button;

        createMenu();

        positionMenu(button);
    }

    function hideMenu() {

        const menu =
            document.getElementById(MENU_ID);

        if (!menu) return;

        menu.classList.remove("show");

        activeButton = null;
    }

    function toggleMenu(button) {

        const menu =
            document.getElementById(MENU_ID);

        if (
            menu &&
            menu.classList.contains("show") &&
            activeButton === button
        ) {
            hideMenu();
            return;
        }

        showMenu(button);
    }

    /* =====================================================
       EXISTING MESSAGE ACTIONS — MORE BUTTON
       ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    MORE_SELECTOR
                );

            if (!button) return;

            /*
             * Do not stop propagation.
             * MessageActions.js remains untouched.
             */

            setTimeout(() => {
                toggleMenu(button);
            }, 0);

        },
        true
    );

    /* =====================================================
       OUTSIDE CLICK
       ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const menu =
                document.getElementById(MENU_ID);

            if (
                !menu ||
                !menu.classList.contains("show")
            ) {
                return;
            }

            if (menu.contains(event.target))
                return;

            if (
                event.target.closest(
                    MORE_SELECTOR
                ) === activeButton
            ) {
                return;
            }

            hideMenu();

        }
    );

    /* =====================================================
       ESCAPE
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                hideMenu();
            }

        }
    );

    /* =====================================================
       RESIZE / SCROLL
       ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (activeButton) {
                positionMenu(activeButton);
            }

        }
    );

    window.addEventListener(
        "scroll",
        () => {

            if (activeButton) {
                positionMenu(activeButton);
            }

        },
        true
    );

    /* =====================================================
       INIT
       ===================================================== */

    addStyles();
    createMenu();

    console.log(
        "PingMe Message Menu 2 UI Connected"
    );

})();
