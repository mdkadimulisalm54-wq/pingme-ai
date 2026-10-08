/* =========================================================
   PingMe AI — Attachments Support
   Image Preview + File Card
   ========================================================= */

(() => {
    "use strict";

    const STYLE_ID = "pingme-attachments-style";
    const PREVIEW_ID = "pingme-attachments-preview";

    let selectedFiles = [];

    /* =====================================================
       STYLE
       ===================================================== */

    function addStyles() {

        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `

        #${PREVIEW_ID} {
            display: none;
            width: 100%;
            padding: 7px 8px 3px;
            gap: 8px;
            flex-wrap: wrap;
            box-sizing: border-box;
        }

        #${PREVIEW_ID}.show {
            display: flex;
        }


        /* =================================================
           IMAGE PREVIEW
           ================================================= */

        .pingme-image-attachment {
            position: relative;

            width: 92px;
            height: 92px;

            border-radius: 13px;
            overflow: hidden;

            background: #eef1f5;

            border: 1px solid rgba(0,0,0,.08);

            box-shadow:
                0 3px 10px rgba(0,0,0,.08);
        }

        .pingme-image-attachment img {
            display: block;

            width: 100%;
            height: 100%;

            object-fit: cover;
        }


        /* IMAGE REMOVE */

        .pingme-image-remove {
            position: absolute;

            top: 5px;
            right: 5px;

            width: 24px;
            height: 24px;

            border: 0;
            padding: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: rgba(255,255,255,.94);
            color: #222;

            box-shadow:
                0 2px 7px rgba(0,0,0,.18);

            cursor: pointer;
        }

        .pingme-image-remove svg {
            width: 13px;
            height: 13px;

            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
        }


        /* =================================================
           FILE CARD
           ================================================= */

        .pingme-file-card {
            display: flex;
            align-items: center;

            gap: 8px;

            width: 205px;
            max-width: 100%;

            padding: 8px;

            box-sizing: border-box;

            background: #f6f8fb;

            border: 1px solid rgba(0,0,0,.08);

            border-radius: 12px;

            box-shadow:
                0 2px 8px rgba(0,0,0,.05);
        }


        .pingme-file-icon {
            width: 36px;
            height: 36px;
            min-width: 36px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 9px;

            background: #e9eef7;
            color: #43536a;
        }

        .pingme-file-icon svg {
            width: 19px;
            height: 19px;

            fill: none;
            stroke: currentColor;

            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
        }


        .pingme-file-info {
            min-width: 0;
            flex: 1;
        }

        .pingme-file-name {
            display: block;

            font-size: 12px;
            line-height: 16px;

            font-weight: 600;

            color: #202124;

            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .pingme-file-size {
            display: block;

            margin-top: 2px;

            font-size: 10px;
            line-height: 13px;

            color: #858585;
        }


        /* FILE REMOVE */

        .pingme-file-remove {
            width: 24px;
            height: 24px;
            min-width: 24px;

            border: 0;
            padding: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: transparent;
            color: #777;

            cursor: pointer;
        }

        .pingme-file-remove:hover {
            background: #e8ebef;
            color: #222;
        }

        .pingme-file-remove svg {
            width: 14px;
            height: 14px;

            fill: none;
            stroke: currentColor;

            stroke-width: 2;
            stroke-linecap: round;
        }


        @media (max-width: 480px) {

            .pingme-image-attachment {
                width: 86px;
                height: 86px;
            }

            .pingme-file-card {
                width: 195px;
            }

        }

        `;

        document.head.appendChild(style);
    }


    /* =====================================================
       HELPERS
       ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatSize(bytes) {

        if (!bytes) return "0 B";

        const units = [
            "B",
            "KB",
            "MB",
            "GB"
        ];

        const index = Math.min(
            Math.floor(
                Math.log(bytes) / Math.log(1024)
            ),
            units.length - 1
        );

        const size =
            bytes / Math.pow(1024, index);

        return (
            size.toFixed(index === 0 ? 0 : 1)
            + " "
            + units[index]
        );
    }


    function isImage(file) {

        return String(file?.type || "")
            .toLowerCase()
            .startsWith("image/");
    }


    function fileIcon(file) {

        const name =
            String(file.name || "")
                .toLowerCase();

        if (
            name.endsWith(".pdf") ||
            String(file.type).includes("pdf")
        ) {

            return `
                <svg viewBox="0 0 24 24">
                    <path d="M6 3.5h8l4 4v13H6z"></path>
                    <path d="M14 3.5v4h4"></path>
                    <path d="M9 14h6"></path>
                    <path d="M9 17h4"></path>
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


    function removeIcon() {

        return `
            <svg viewBox="0 0 24 24">
                <path d="M7 7l10 10"></path>
                <path d="M17 7L7 17"></path>
            </svg>
        `;
    }


    /* =====================================================
       PREVIEW CONTAINER
       ===================================================== */

    function createPreview() {

        let preview =
            document.getElementById(PREVIEW_ID);

        if (preview) return preview;

        const chatInput =
            document.getElementById("chatInput");

        if (!chatInput) return null;

        preview =
            document.createElement("div");

        preview.id = PREVIEW_ID;

        const row =
            chatInput.closest(".input-row");

        if (row) {

            row.insertBefore(
                preview,
                chatInput
            );

        } else {

            chatInput.parentNode.insertBefore(
                preview,
                chatInput
            );
        }

        return preview;
    }


    /* =====================================================
       RENDER
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

                /* =========================================
                   IMAGE
                   ========================================= */

                if (isImage(file)) {

                    const card =
                        document.createElement("div");

                    card.className =
                        "pingme-image-attachment";

                    const image =
                        document.createElement("img");

                    image.alt = file.name;

                    const url =
                        URL.createObjectURL(file);

                    image.src = url;

                    image.onload = () => {
                        URL.revokeObjectURL(url);
                    };


                    const remove =
                        document.createElement("button");

                    remove.type = "button";

                    remove.className =
                        "pingme-image-remove";

                    remove.setAttribute(
                        "aria-label",
                        "Remove image"
                    );

                    remove.innerHTML =
                        removeIcon();


                    remove.addEventListener(
                        "click",
                        () => {

                            selectedFiles.splice(
                                index,
                                1
                            );

                            renderPreview();
                        }
                    );


                    card.appendChild(image);
                    card.appendChild(remove);

                    preview.appendChild(card);

                    return;
                }


                /* =========================================
                   FILE
                   ========================================= */

                const card =
                    document.createElement("div");

                card.className =
                    "pingme-file-card";

                card.innerHTML = `

                    <span class="pingme-file-icon">
                        ${fileIcon(file)}
                    </span>

                    <span class="pingme-file-info">

                        <span class="pingme-file-name">
                            ${escapeHTML(file.name)}
                        </span>

                        <span class="pingme-file-size">
                            ${formatSize(file.size)}
                        </span>

                    </span>

                    <button
                        type="button"
                        class="pingme-file-remove"
                        aria-label="Remove file"
                    >
                        ${removeIcon()}
                    </button>
                `;


                card
                    .querySelector(
                        ".pingme-file-remove"
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


                preview.appendChild(card);
            }
        );
    }


    /* =====================================================
       ADD FILES
       ===================================================== */

    function addFiles(files) {

        if (!files || !files.length) {
            return;
        }

        Array.from(files).forEach(
            file => {

                const exists =
                    selectedFiles.some(
                        oldFile =>
                            oldFile.name === file.name &&
                            oldFile.size === file.size &&
                            oldFile.lastModified ===
                                file.lastModified
                    );

                if (!exists) {
                    selectedFiles.push(file);
                }
            }
        );

        renderPreview();

        console.log(
            "PingMe attachment selected:",
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

            selectedFiles.splice(
                index,
                1
            );

            renderPreview();
        }
    };


    /* =====================================================
       INIT
       ===================================================== */

    function initialize() {

        addStyles();
        createPreview();

        console.log(
            "PingMe Attachments Support Connected"
        );
    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }

})();
