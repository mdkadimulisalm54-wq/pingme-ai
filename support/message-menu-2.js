/* =========================================================
   PingMe AI — Message Menu 2
   Three-Dot Popup UI
   UI ONLY — Feature actions will be connected later
   ========================================================= */

(() => {
    "use strict";

    const STYLE_ID = "pingme-message-menu-2-style";
    const MENU_ID = "pingme-message-menu-2";

    /* =====================================================
       ICONS — SVG ONLY
       ===================================================== */

    const ICONS = {

        share: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 16V4"/>
                <path d="M7 9l5-5 5 5"/>
                <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>
            </svg>
        `,

        pin: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 4h6"/>
                <path d="M8 4v6l-2 3h12l-2-3V4"/>
                <path d="M12 13v7"/>
            </svg>
        `,

        project: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h6l2 2h8v10H4z"/>
                <path d="M4 7V5h6l2 2"/>
            </svg>
        `,

        files: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3h8l4 4v14H6z"/>
                <path d="M14 3v5h5"/>
                <path d="M9 13h6"/>
                <path d="M9 17h6"/>
            </svg>
        `,

        search: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8"/>
                <path d="M16 16l5 5"/>
            </svg>
        `,

        home: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 11.5L12 4l9 7.5"/>
                <path d="M5 10.5V20h14v-9.5"/>
                <path d="M9 20v-5h6v5"/>
            </svg>
        `,

        archive: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16v13H4z"/>
                <path d="M3 4h18v3H3z"/>
                <path d="M9 12h6"/>
            </svg>
        `,

        trash: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16"/>
                <path d="M9 7V4h6v3"/>
                <path d="M6 7l1 14h10l1-14"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
            </svg>
        `,

        chevron: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7"/>
            </svg>
        `
    };

    /* =====================================================
       MENU ITEMS
       ===================================================== */

    const ITEMS = [
        {
            id: "share",
            label: "Share",
            icon: ICONS.share
        },
        {
            id: "pin",
            label: "Pin",
            icon: ICONS.pin
        },
        {
            id: "project",
            label: "Add to project",
            icon: ICONS.project,
            arrow: true
        },
        {
            id: "files",
            label: "Uploaded files",
            icon: ICONS.files
        },
        {
            id: "search",
            label: "Find in chat",
            icon: ICONS.search
        },
        {
            id: "home",
            label: "Add to home",
            icon: ICONS.home
        },
        {
            id: "archive",
            label: "Archive",
            icon: ICONS.archive
        },
        {
            id: "delete",
            label: "Delete",
            icon: ICONS.trash,
            danger: true
        }
    ];

    /* =====================================================
       STYLES
       ===================================================== */

    function addStyles() {

        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            #${MENU_ID} {
                position: fixed !important;
                z-index: 2147483647 !important;

                width: 236px !important;
                max-width: calc(100vw - 24px) !important;

                box-sizing: border-box !important;
                padding: 6px !important;

                background: #ffffff !important;
                border: 1px solid rgba(0,0,0,.08) !important;
                border-radius: 13px !important;

                box-shadow:
                    0 10px 30px rgba(0,0,0,.14),
                    0 2px 8px rgba(0,0,0,.08) !important;

                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    Roboto,
                    Arial,
                    sans-serif !important;

                color: #202124 !important;

                opacity: 0;
                transform: scale(.96);
                transform-origin: top right;

                pointer-events: none;

                transition:
                    opacity .12s ease,
                    transform .12s ease;
            }

            #${MENU_ID}.show {
                opacity: 1;
                transform: scale(1);
                pointer-events: auto;
            }

            #${MENU_ID} * {
                box-sizing: border-box !important;
            }

            .pm-menu-2-item {
                width: 100% !important;
                height: 40px !important;

                display: flex !important;
                align-items: center !important;

                border: 0 !important;
                outline: 0 !important;

                background: transparent !important;
                border-radius: 9px !important;

                padding: 0 10px !important;
                margin: 0 !important;

                cursor: pointer !important;

                color: #202124 !important;
                font-size: 14px !important;
                font-weight: 400 !important;

                text-align: left !important;

                -webkit-tap-highlight-color: transparent !important;
            }

            .pm-menu-2-item:hover {
                background: #f3f4f6 !important;
            }

            .pm-menu-2-item:active {
                background: #e9eaec !important;
            }

            .pm-menu-2-icon {
                width: 20px !important;
                height: 20px !important;

                flex: 0 0 20px !important;

                display: flex !important;
                align-items: center !important;
                justify-content: center !important;

                margin-right: 12px !important;
            }

            .pm-menu-2-icon svg {
                width: 18px !important;
                height: 18px !important;

                display: block !important;

                fill: none !important;
                stroke: currentColor !important;
                stroke-width: 1.8 !important;
                stroke-linecap: round !important;
                stroke-linejoin: round !important;
            }

            .pm-menu-2-label {
                flex: 1 1 auto !important;
                min-width: 0 !important;

                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }

            .pm-menu-2-arrow {
                width: 16px !important;
                height: 16px !important;

                flex: 0 0 16px !important;

                display: flex !important;
                align-items: center !important;
                justify-content: center !important;

                margin-left: 8px !important;
                opacity: .7 !important;
            }

            .pm-menu-2-arrow svg {
                width: 15px !important;
                height: 15px !important;

                fill: none !important;
                stroke: currentColor !important;
                stroke-width: 1.8 !important;
                stroke-linecap: round !important;
                stroke-linejoin: round !important;
            }

            .pm-menu-2-item.danger {
                color: #d93025 !important;
            }

            .pm-menu-2-item.danger:hover {
                background: #fff1f0 !important;
            }

            @media (max-width: 480px) {

                #${MENU_ID} {
                    width: 226px !important;
                    border-radius: 12px !important;
                    padding: 5px !important;
                }

                .pm-menu-2-item {
                    height: 39px !important;
                    font-size: 14px !important;
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

            const button = document.createElement("button");

            button.type = "button";
            button.className =
                "pm-menu-2-item" +
                (item.danger ? " danger" : "");

            button.dataset.menuAction = item.id;
            button.setAttribute("role", "menuitem");

            button.innerHTML = `
                <span class="pm-menu-2-icon">
                    ${item.icon}
                </span>

                <span class="pm-menu-2-label">
                    ${item.label}
                </span>

                ${
                    item.arrow
                        ? `
                            <span class="pm-menu-2-arrow">
                                ${ICONS.chevron}
                            </span>
                        `
                        : ""
                }
            `;

            button.addEventListener("click", event => {
                event.stopPropagation();

                /*
                 * UI only for now.
                 * Actual feature actions will be connected
                 * from the future functionality support file.
                 */

                document.dispatchEvent(
                    new CustomEvent("pingme:message-menu-action", {
                        detail: {
                            action: item.id,
                            label: item.label
                        }
                    })
                );

                if (item.id !== "project") {
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

    function positionMenu(button) {

        const menu = createMenu();

        menu.classList.remove("show");

        const rect = button.getBoundingClientRect();

        const menuWidth = Math.min(
            236,
            window.innerWidth - 24
        );

        const menuHeight = Math.min(
            menu.scrollHeight || 350,
            window.innerHeight - 24
        );

        let left = rect.right - menuWidth;
        let top = rect.bottom + 7;

        if (left < 12) {
            left = 12;
        }

        if (left + menuWidth > window.innerWidth - 12) {
            left = window.innerWidth - menuWidth - 12;
        }

        if (top + menuHeight > window.innerHeight - 12) {
            top = rect.top - menuHeight - 7;
        }

        if (top < 12) {
            top = 12;
        }

        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;

        requestAnimationFrame(() => {
            menu.classList.add("show");
        });
    }

    /* =====================================================
       SHOW / HIDE
       ===================================================== */

    let activeButton = null;

    function showMenu(button) {

        addStyles();

        const menu = createMenu();

        activeButton = button;

        positionMenu(button);

        menu.setAttribute("aria-hidden", "false");
    }

    function hideMenu() {

        const menu = document.getElementById(MENU_ID);

        if (!menu) return;

        menu.classList.remove("show");
        menu.setAttribute("aria-hidden", "true");

        activeButton = null;
    }

    function toggleMenu(button) {

        const menu = document.getElementById(MENU_ID);

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
       FIND EXISTING THREE-DOT BUTTON
       ===================================================== */

    function isThreeDotButton(element) {

        if (!element || element === document.body) {
            return false;
        }

        const text = (
            element.getAttribute("aria-label") ||
            element.getAttribute("title") ||
            element.dataset?.action ||
            element.textContent ||
            ""
        ).trim().toLowerCase();

        if (!text) return false;

        return (
            text === "⋮" ||
            text === "•••" ||
            text.includes("more options") ||
            text.includes("more") ||
            text.includes("message menu")
        );
    }

    /* =====================================================
       EXISTING 3-DOT CLICK
       ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const target = event.target.closest(
                "button,[role='button'],[aria-label],[title]"
            );

            if (!target) return;

            if (!isThreeDotButton(target)) return;

            /*
             * Existing three-dot system remains untouched.
             * We only add our popup UI beside it.
             */

            setTimeout(() => {
                toggleMenu(target);
            }, 0);
        },
        false
    );

    /* =====================================================
       CLOSE OUTSIDE
       ===================================================== */

    document.addEventListener("click", event => {

        const menu = document.getElementById(MENU_ID);

        if (!menu || !menu.classList.contains("show")) {
            return;
        }

        if (
            menu.contains(event.target) ||
            event.target.closest(
                "button,[role='button'],[aria-label],[title]"
            ) === activeButton
        ) {
            return;
        }

        hideMenu();

    });

    /* =====================================================
       ESCAPE
       ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            hideMenu();
        }

    });

    /* =====================================================
       RESIZE / SCROLL
       ===================================================== */

    window.addEventListener("resize", () => {

        if (activeButton) {
            positionMenu(activeButton);
        }

    });

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
       INITIALIZE
       ===================================================== */

    addStyles();
    createMenu();

    console.log("PingMe Message Menu 2 UI Connected");

})();
