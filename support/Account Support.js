/* =========================================================
   PingMe AI — Attachments Support
   Image Preview + File Card + Remove
   ========================================================= */

(() => {
    "use strict";

    const STYLE_ID = "pingme-attachments-style";
    const PREVIEW_ID = "pingme-attachments-preview";

    let selectedFiles = [];

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
            box-sizing: border-box;
            padding: 8px 8px 5px;
            gap: 8px;
            flex-wrap: wrap;
            align-items: flex-start;
        }

        #${PREVIEW_ID}.show {
            display: flex;
        }

        /* IMAGE */
        .pingme-image-attachment {
            position: relative;
            width: 82px;
            height: 82px;
            flex: 0 0 82px;
            overflow: hidden;
            border-radius: 14px;
            background: #eef1f5;
            border: 1px solid rgba(0,0,0,.08);
            box-shadow: 0 3px 12px rgba(0,0,0,.10);
        }

        .pingme-image-attachment img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* REMOVE */
        .pingme-attachment-remove {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 22px;
            height: 22px;
            padding: 0;
            border: 0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,.96);
            color: #222;
            box-shadow: 0 2px 7px rgba(0,0,0,.20);
            cursor: pointer;
            z-index: 2;
            -webkit-tap-highlight-color: transparent;
        }

        .pingme-attachment-remove:active {
            transform: scale(.90);
            background: #f0f0f0;
        }

        .pingme-attachment-remove svg {
            width: 12px;
            height: 12px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
        }

        /* FILE */
        .pingme-file-card {
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
            width: 210px;
            max-width: 100%;
            min-height: 52px;
            padding: 7px 7px 7px 8px;
            box-sizing: border-box;
            background: #f7f9fc;
            border: 1px solid rgba(0,0,0,.08);
            border-radius: 13px;
            box-shadow: 0 2px 9px rgba(0,0,0,.06);
        }

        .pingme-file-icon {
            width: 36px;
            height: 36px;
            min-width: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: #eaf0f8;
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
            max-width: 100%;
            font-size: 12px;
            line-height: 16px;
            font-weight: 600;
            color: #202124;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pingme-file-size {
            display: block;
            margin-top: 2px;
            font-size: 10.5px;
            line-height: 14px;
            color: #7b8189;
        }

        .pingme-file-card .pingme-attachment-remove {
            position: static;
            flex: 0 0 22px;
            background: transparent;
            box-shadow: none;
            color: #777;
        }

        .pingme-file-card .pingme-attachment-remove:hover {
            background: #e8ebef;
            color: #222;
        }

        @media (max-width: 480px) {
            #${PREVIEW_ID} {
                padding-left: 7px;
                padding-right: 7px;
            }

            .pingme-image-attachment {
                width: 78px;
                height: 78px;
                flex-basis: 78px;
            }

            .pingme-file-card {
                width: 195px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .pingme-attachment-remove {
                transition: none;
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
        bytes = Number(bytes) || 0;

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        if (bytes < 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }

        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }

    function isImage(file) {
        return String(file?.type || "")
            .toLowerCase()
            .startsWith("image/");
    }

    function removeIcon() {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 7l10 10"></path>
                <path d="M17 7L7 17"></path>
            </svg>
        `;
    }

    function fileIcon(file) {
        const name = String(file?.name || "").toLowerCase();
        const type = String(file?.type || "").toLowerCase();

        if (type.includes("pdf") || name.endsWith(".pdf")) {
            return `
                <svg viewBox="0 0 24 24">
                    <path d="M6 3.5h8l4 4v13H6z"></path>
                    <path d="M14 3.5v4h4"></path>
                    <path d="M9 14h6"></path>
                    <path d="M9 17h4"></path>
                </svg>
            `;
        }

        if (
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {
            return `
                <svg viewBox="0 0 24 24">
                    <path d="M6 3.5h8l4 4v13H6z"></path>
                    <path d="M14 3.5v4h4"></path>
                    <path d="M9 13h6"></path>
                    <path d="M9 16h5"></path>
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
       PREVIEW
       ===================================================== */

    function createPreview() {
        let preview = document.getElementById(PREVIEW_ID);

        if (preview) return preview;

        const chatInput = document.getElementById("chatInput");
        if (!chatInput) return null;

        preview = document.createElement("div");
        preview.id = PREVIEW_ID;

        const row = chatInput.closest(".input-row");

        if (row) {
            row.insertBefore(preview, chatInput);
        } else if (chatInput.parentNode) {
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
        const preview = createPreview();

        if (!preview) return;

        preview.innerHTML = "";

        if (!selectedFiles.length) {
            preview.classList.remove("show");
            return;
        }

        preview.classList.add("show");

        selectedFiles.forEach((file, index) => {

            /* IMAGE */
            if (isImage(file)) {

                const card = document.createElement("div");
                card.className = "pingme-image-attachment";

                const image = document.createElement("img");

                image.alt = file.name || "Selected image";
                image.loading = "eager";

                const objectURL = URL.createObjectURL(file);
                image.src = objectURL;

                image.onload = () => {
                    URL.revokeObjectURL(objectURL);
                };

                image.onerror = () => {
                    URL.revokeObjectURL(objectURL);
                };

                const remove = document.createElement("button");

                remove.type = "button";
                remove.className = "pingme-attachment-remove";
                remove.setAttribute(
                    "aria-label",
                    "Remove image"
                );
                remove.innerHTML = removeIcon();

                remove.addEventListener("click", () => {
                    selectedFiles.splice(index, 1);
                    renderPreview();
                    syncInputs();
                });

                card.appendChild(image);
                card.appendChild(remove);
                preview.appendChild(card);

                return;
            }

            /* FILE */
            const card = document.createElement("div");
            card.className = "pingme-file-card";

            card.innerHTML = `
                <span class="pingme-file-icon">
                    ${fileIcon(file)}
                </span>

                <span class="pingme-file-info">
                    <span class="pingme-file-name">
                        ${escapeHTML(file.name || "Unnamed file")}
                    </span>

                    <span class="pingme-file-size">
                        ${formatSize(file.size)}
                    </span>
                </span>

                <button
                    type="button"
                    class="pingme-attachment-remove"
                    aria-label="Remove file">
                    ${removeIcon()}
                </button>
            `;

            const remove =
                card.querySelector(".pingme-attachment-remove");

            remove.addEventListener("click", () => {
                selectedFiles.splice(index, 1);
                renderPreview();
                syncInputs();
            });

            preview.appendChild(card);
        });
    }

    /* =====================================================
       INPUT SYNC
       ===================================================== */

    function syncInputs() {
        [
            "pingme-photo-input",
            "pingme-file-input",
            "pingme-document-input"
        ].forEach(id => {
            const input = document.getElementById(id);

            if (input) {
                try {
                    input.value = "";
                } catch (error) {
                    console.warn(
                        "PingMe Attachments: input reset failed.",
                        error
                    );
                }
            }
        });
    }

    /* =====================================================
       ADD FILES
       ===================================================== */

    function addFiles(files) {
        if (!files || !files.length) return;

        Array.from(files).forEach(file => {

            if (!file) return;

            const exists = selectedFiles.some(oldFile =>
                oldFile.name === file.name &&
                oldFile.size === file.size &&
                oldFile.lastModified === file.lastModified
            );

            if (!exists) {
                selectedFiles.push(file);
            }
        });

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
                event &&
                event.detail &&
                event.detail.files;

            if (!files) return;

            addFiles(files);

            /* Allow same file to be selected again later */
            syncInputs();
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
            syncInputs();
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
            syncInputs();
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

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

})();
