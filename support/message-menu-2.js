/* =========================================================
   PingMe AI — Header More Menu
   Share • Pin • Project • Files • Find • Home • Archive • Delete
   ========================================================= */

(() => {

    "use strict";

    const STYLE_ID = "pingme-header-more-style";
    const MENU_ID = "pingme-header-more-menu";

    /* =====================================================
       ICONS
       ===================================================== */

    const icons = {

        share: `
            <svg viewBox="0 0 24 24" width="19" height="19"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="2.5"/>
                <circle cx="6" cy="12" r="2.5"/>
                <circle cx="18" cy="19" r="2.5"/>
                <path d="M8.2 10.8l7.6-4.5"/>
                <path d="M8.2 13.2l7.6 4.5"/>
            </svg>`,

        pin: `
            <svg viewBox="0 0 24 24" width="19" height="19"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 17v5"/>
                <path d="M7 4h10"/>
                <path d="M8 4l1 7-3 3h12l-3-3 1-7"/>
            </svg>`,

        project: `
            <svg viewBox="0 0 24 24" width="19" height="19"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z"/>
            </svg>`,

        files: `
            <svg viewBox="0 0 24 24" width="19" height="19"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h8l4 4v14H6z"/>
                <path d="M14 3v5h5"/>
                <path d="M9 13h6"/>
                <path d="M9 17h6"/>
            </svg>`,

        search: `
            <svg viewBox="0 0 24 24" width="19" height="19"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round">
                <circle cx="10.8" cy="10.8" r="6.8"/>
                <path d="M16 16l5 5"/>
            </svg>`,

        home: `
            <svg viewBox="0 0 24 24" width="19" height="19"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11.5L12 4l9 7.5"/>
                <path d="M5.5 10.5V20h13v-9.5"/>
                <path d="M9.5 20v-5h5v5"/>
            </svg>`,

        archive: `
            <svg viewBox="0 0 24 24" width="19" height="19"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 7h16"/>
                <path d="M6 7l1 14h10l1-14"/>
                <path d="M5 3h14l1 4H4z"/>
                <path d="M9 11h6"/>
            </svg>`,

        delete: `
            <svg viewBox="0 0 24 24" width="19" height="19"
                 fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 7h16"/>
                <path d="M9 7V4h6v3"/>
                <path d="M7 7l1 14h8l1-14"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
            </svg>`,

        chevron: `
            <svg viewBox="0 0 24 24" width="16" height="16"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 6l6 6-6 6"/>
            </svg>`
    };


    /* =====================================================
       STYLE
       ===================================================== */

    function addStyles() {

        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");

        style.id = STYLE_ID;

        style.textContent = `
            #${MENU_ID} {
                position: fixed;
                z-index: 99999;
                width: 228px;
                padding: 7px;
                background: #fff;
                border: 1px solid #e8e8e8;
                border-radius: 16px;
                box-shadow:
                    0 10px 30px rgba(0,0,0,.13),
                    0 2px 8px rgba(0,0,0,.06);
                display: none;
                overflow: hidden;
                font-family: Arial, sans-serif;
            }

            #${MENU_ID}.show {
                display: block;
                animation: pingmeMoreIn .13s ease-out;
            }

            @keyframes pingmeMoreIn {
                from {
                    opacity: 0;
                    transform: translateY(-5px) scale(.98);
                }

                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            #${MENU_ID} .pingme-more-item {
                width: 100%;
                min-height: 43px;
                border: 0;
                background: transparent;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 0 11px;
                color: #202124;
                font-size: 14px;
                text-align: left;
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
            }

            #${MENU_ID} .pingme-more-item:active {
                background: #f1f3f4;
            }

            #${MENU_ID} .pingme-more-icon {
                width: 20px;
                height: 20px;
                flex: 0 0 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #303134;
            }

            #${MENU_ID} .pingme-more-label {
                flex: 1;
                white-space: nowrap;
            }

            #${MENU_ID} .pingme-more-chevron {
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #777;
            }

            #${MENU_ID} .pingme-delete {
                color: #d93025;
            }

            #${MENU_ID} .pingme-delete .pingme-more-icon {
                color: #d93025;
            }
        `;

        document.head.appendChild(style);
    }


    /* =====================================================
       CREATE MENU
       ===================================================== */

    function createMenu() {

        if (document.getElementById(MENU_ID)) {
            return document.getElementById(MENU_ID);
        }

        const menu = document.createElement("div");

        menu.id = MENU_ID;

        const items = [

            ["share", "Share"],
            ["pin", "Pin"],
            ["project", "Add to project", true],
            ["files", "Uploaded files"],
            ["search", "Find in chat"],
            ["home", "Add to home"],
            ["archive", "Archive"],
            ["delete", "Delete", false, true]

        ];

        items.forEach(item => {

            const [
                icon,
                label,
                arrow,
                danger
            ] = item;

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "pingme-more-item" +
                (danger ? " pingme-delete" : "");

            button.dataset.action = label
                .toLowerCase()
                .replace(/\s+/g, "-");

            button.innerHTML = `
                <span class="pingme-more-icon">
                    ${icons[icon]}
                </span>

                <span class="pingme-more-label">
                    ${label}
                </span>

                ${
                    arrow
                    ? `<span class="pingme-more-chevron">
                           ${icons.chevron}
                       </span>`
                    : ""
                }
            `;

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    menu.dispatchEvent(
                        new CustomEvent(
                            "pingme-menu-action",
                            {
                                detail: {
                                    action:
                                        button.dataset.action
                                }
                            }
                        )
                    );

                    closeMenu();
                }
            );

            menu.appendChild(button);
        });

        document.body.appendChild(menu);

        return menu;
    }


    /* =====================================================
       FIND HEADER THREE-DOT BUTTON
       ===================================================== */

    function getHeaderMoreButton() {

        const secondBar =
            document.getElementById("secondBar");

        if (!secondBar) return null;

        const rightButton =
            secondBar.querySelector(
                ".pill.right"
            );

        if (!rightButton) return null;

        const svgs =
            rightButton.querySelectorAll("svg");

        if (svgs.length < 2) return null;

        return rightButton;
    }


    /* =====================================================
       POSITION
       ===================================================== */

    function positionMenu(button, menu) {

        const rect =
            button.getBoundingClientRect();

        const width =
            menu.offsetWidth;

        const height =
            menu.offsetHeight;

        let left =
            rect.right - width;

        let top =
            rect.bottom + 8;

        const margin = 8;

        if (left < margin) {
            left = margin;
        }

        if (
            left + width >
            window.innerWidth - margin
        ) {
            left =
                window.innerWidth -
                width -
                margin;
        }

        if (
            top + height >
            window.innerHeight - margin
        ) {
            top =
                rect.top -
                height -
                8;
        }

        menu.style.left =
            `${left}px`;

        menu.style.top =
            `${top}px`;
    }


    /* =====================================================
       OPEN / CLOSE
       ===================================================== */

    function openMenu(button) {

        const menu =
            createMenu();

        menu.classList.add("show");

        positionMenu(
            button,
            menu
        );
    }


    function closeMenu() {

        const menu =
            document.getElementById(MENU_ID);

        if (menu) {
            menu.classList.remove("show");
        }
    }


    /* =====================================================
       CONNECT
       ===================================================== */

    function connect() {

        const button =
            getHeaderMoreButton();

        if (!button) return false;

        if (
            button.dataset.pingmeMoreConnected === "true"
        ) {
            return true;
        }

        button.dataset.pingmeMoreConnected =
            "true";

        /*
         * Capture phase ব্যবহার করা হয়েছে যাতে
         * অন্য কোনো পুরোনো click handler থাকলেও
         * এই header menu ঠিকভাবে কাজ করে।
         */
        button.addEventListener(
            "click",
            function (event) {

                const target =
                    event.target;

                const svg =
                    target.closest
                    ? target.closest("svg")
                    : null;

                const svgs =
                    button.querySelectorAll("svg");

                /*
                 * শুধু দ্বিতীয় SVG = three-dot
                 */
                if (
                    !svg ||
                    svg !== svgs[1]
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                const menu =
                    document.getElementById(
                        MENU_ID
                    );

                if (
                    menu &&
                    menu.classList.contains("show")
                ) {

                    closeMenu();

                } else {

                    openMenu(button);

                }

            },
            true
        );

        return true;
    }


    /* =====================================================
       OUTSIDE CLICK
       ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const menu =
                document.getElementById(MENU_ID);

            if (!menu) return;

            const button =
                getHeaderMoreButton();

            if (
                menu.contains(event.target) ||
                button?.contains(event.target)
            ) {
                return;
            }

            closeMenu();
        }
    );


    /* =====================================================
       ESCAPE
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeMenu();
            }

        }
    );


    /* =====================================================
       RESIZE / SCROLL
       ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            const menu =
                document.getElementById(MENU_ID);

            const button =
                getHeaderMoreButton();

            if (
                menu &&
                menu.classList.contains("show") &&
                button
            ) {
                positionMenu(
                    button,
                    menu
                );
            }

        }
    );


    window.addEventListener(
        "scroll",
        closeMenu,
        true
    );


    /* =====================================================
       START
       ===================================================== */

    function init() {

        addStyles();

        if (connect()) return;

        const observer =
            new MutationObserver(
                function () {

                    if (connect()) {
                        observer.disconnect();
                    }

                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );

    } else {

        init();

    }

})();
