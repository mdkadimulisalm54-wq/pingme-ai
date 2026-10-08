/* =========================================================
   PingMe AI — Attachments Support
   Photos • Files • Documents
   Preview • Remove • Multiple Files
   ========================================================= */

(() => {
    "use strict";

    const STYLE_ID = "pingme-attachments-style";
    const PREVIEW_ID = "pingme-attachments-preview";

    let selectedFiles = [];

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const input = () =>
        document.getElementById("chatInput");

    const plusMenu = () =>
        document.getElementById("pingme-plus-menu");

    /* =====================================================
       STYLES
       ===================================================== */

    function addStyles() {

        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `

        #${PREVIEW_ID} {
            display: none;
            width: 100%;
            padding: 7px 9px 2px;
            gap: 7px;
            flex-wrap: wrap;
            box-sizing: border-box;
        }

        #${PREVIEW_ID}.show {
            display: flex;
        }

        .pingme-attachment {
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 210px;
            min-width: 0;
            padding: 7px 9px;
            border-radius: 12px;
            background: #f4f7fb;
            border: 1px solid rgba(0,0,0,.07);
            box-shadow: 0 2px 7px rgba(0,0,0,.04);
        }

        .pingme-attachment-icon {
            width: 30px;
            height: 30px;
            min-width: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            background: #e8eef8;
        }

        .pingme-attachment-icon svg {
            width: 17px;
            height: 17px;
            fill: none;
            stroke: currentColor;
            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .pingme-attachment-info {
            min-width: 0;
            flex: 1;
        }

        .pingme-attachment-name {
            display: block;
            max-width: 135px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-size: 12px;
            font-weight: 600;
            color: #202124;
        }

        .pingme-attachment-size {
            display: block;
            margin-top: 1px;
            font-size: 10px;
            color: #858585;
        }

        .pingme-attachment-remove {
            width: 24px;
            height: 24px;
            border: 0;
            border-radius: 50%;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #777;
            padding: 0;
        }

        .pingme-attachment-remove:hover {
            background: #e8ebef;
            color: #222;
        }

        .pingme-attachment-remove svg {
            width: 14px;
            height: 14px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
        }

        .pingme-attachment-count {
            width: 100%;
            font-size: 10px;
            color: #888;
            padding: 0 3px 3px;
        }

        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       PREVIEW CONTAINER
       ===================================================== */

    function createPreview() {

        let preview =
            document.getElementById(PREVIEW_ID);

        if (preview) return preview;

        const chatInput = input();

        if (!chatInput) return null;

        preview = document.createElement("div");
        preview.id = PREVIEW_ID;

        /*
         * Put preview immediately before textarea.
         * This keeps everything inside the input card.
         */

        const row =
            chatInput.closest(".input-row");

        if (row) {
            row.insertBefore(preview, chatInput);
        } else {
            chatInput.parentNode.insertBefore(
                preview,
                chatInput
            );
        }

        return preview;
    }

    /* =====================================================
       ICONS
       ===================================================== */

    function iconFor(file) {

        const type =
            String(file.type || "").toLowerCase();

        if (type.startsWith("image/")) {

            return `
                <svg viewBox="0 0 24 24">
                    <rect x="3.5" y="4.5"
                          width="17" height="15"
                          rx="2.5"></rect>
                    <circle cx="8.5" cy="9" r="1.4"></circle>
                    <path d="M4.5 17l4.5-4.5
                             3.2 3.1 2.2-2.2
                             5.1 4.1"></path>
                </svg>
            `;
        }

        if (
            type.includes("pdf") ||
            file.name.toLowerCase().endsWith(".pdf")
        ) {

            return `
                <svg viewBox="0 0 24 24">
                    <path d="M6 3.5h8l4 4v13H6z"></path>
                    <path d="M14 3.5v4h4"></path>
                    <path d="M9 15h6"></path>
                    <path d="M9 18h4"></path>
                </svg>
            `;
        }

        return `
            <svg viewBox="0 0 24 24">
                <path d="M5 3.5h9l5 5v12H5z"></path>
                <path d="M14 3.5v5h5"></path>
                <path d="M8 13h8"></path>
                <path d="M8 16.5h6"></path>
            </svg>
        `;
    }

    /* =====================================================
       FILE SIZE
       ===================================================== */

    function formatSize(bytes) {

        if (!bytes) return "0 B";

        const units =
            ["B", "KB", "MB", "GB"];

        const index =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            );

        return (
            (bytes /
                Math.pow(1024, index))
                .toFixed(index ? 1 : 0)
            + " "
            + units[index]
        );
    }

    /* =====================================================
       RENDER PREVIEW
       ===================================================== */

    function renderPreview() {

        const preview =
            createPreview();

        if (!preview) return;

        preview.innerHTML = "";

        if (!selectedFiles.length) {
            preview.classList.remove("show");
            return;
        }

        preview.classList.add("show");

        selectedFiles.forEach(
            (file, index) => {

                const item =
                    document.createElement("div");

                item.className =
                    "pingme-attachment";

                item.innerHTML = `

                    <span class="pingme-attachment-icon">
                        ${iconFor(file)}
                    </span>

                    <span class="pingme-attachment-info">

                        <span class="pingme-attachment-name">
                            ${escapeHTML(file.name)}
                        </span>

                        <span class="pingme-attachment-size">
                            ${formatSize(file.size)}
                        </span>

                    </span>

                    <button
                        type="button"
                        class="pingme-attachment-remove"
                        aria-label="Remove attachment"
                    >

                        <svg viewBox="0 0 24 24">
                            <path d="M7 7l10 10"></path>
                            <path d="M17 7L7 17"></path>
                        </svg>

                    </button>
                `;

                item
                    .querySelector(
                        ".pingme-attachment-remove"
                    )
                    .addEventListener(
                        "click",
                        () => {

                            selectedFiles.splice(
                                index,
                                1
                            );

                            renderPreview();
                        }
                    );

                preview.appendChild(item);
            }
        );

        if (selectedFiles.length > 1) {

            const count =
                document.createElement("div");

            count.className =
                "pingme-attachment-count";

            count.textContent =
                `${selectedFiles.length} attachments selected`;

            preview.appendChild(count);
        }
    }

    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       ADD FILES
       ===================================================== */

    function addFiles(files) {

        if (!files || !files.length) return;

        const incoming =
            Array.from(files);

        incoming.forEach(file => {

            const exists =
                selectedFiles.some(
                    existing =>
                        existing.name === file.name &&
                        existing.size === file.size &&
                        existing.lastModified ===
                            file.lastModified
                );

            if (!exists) {
                selectedFiles.push(file);
            }
        });

        renderPreview();

        console.log(
            "PingMe attachments:",
            selectedFiles
        );
    }

    /* =====================================================
       PLUS MENU CONNECTION
       ===================================================== */

    window.addEventListener(
        "pingme:plus-files-selected",
        event => {

            const files =
                event?.detail?.files;

            addFiles(files);
        }
    );

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.PingMeAttachments = {

        getFiles() {
            return [...selectedFiles];
        },

        hasFiles() {
            return selectedFiles.length > 0;
        },

        clear() {
            selectedFiles = [];
            renderPreview();
        },

        remove(index) {

            if (
                index < 0 ||
                index >= selectedFiles.length
            ) {
                return;
            }

            selectedFiles.splice(index, 1);
            renderPreview();
        }

    };

    /* =====================================================
       INITIALIZE
       ===================================================== */

    function initialize() {

        addStyles();
        createPreview();

        console.log(
            "PingMe Attachments Support Connected"
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();
