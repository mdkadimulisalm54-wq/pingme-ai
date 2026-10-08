/* =========================================================
   PingMe AI — Attachments Support
   Premium Light Preview UI
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

        /* ================= IMAGE ================= */

        .pingme-image-attachment {
            position: relative;
            width: 96px;
            height: 96px;
            flex: 0 0 96px;
            overflow: hidden;
            border-radius: 14px;
            background: #f1f4f8;
            border: 1px solid #e2e6eb;
            box-shadow: 0 2px 9px rgba(0,0,0,.07);
        }

        .pingme-image-attachment img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            background: #f1f4f8;
        }

        /* IMAGE REMOVE */

        .pingme-image-remove {
            position: absolute;
            top: 6px;
            right: 6px;

            width: 23px;
            height: 23px;
            min-width: 23px;

            padding: 0;
            border: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: rgba(255,255,255,.96);
            color: #555;

            box-shadow: 0 2px 7px rgba(0,0,0,.16);

            cursor: pointer;
            z-index: 5;

            -webkit-tap-highlight-color: transparent;
        }

        .pingme-image-remove svg {
            width: 12px;
            height: 12px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
        }

        .pingme-image-remove:active {
            transform: scale(.9);
        }

        /* ================= FILE ================= */

        .pingme-file-card {
            display: flex;
            align-items: center;

            width: 188px;
            max-width: calc(100vw - 45px);
            min-height: 48px;

            padding: 6px 6px 6px 7px;
            box-sizing: border-box;

            gap: 7px;

            background: #f7f9fc;
            border: 1px solid #e1e5eb;
            border-radius: 12px;

            box-shadow: 0 2px 8px rgba(0,0,0,.05);

            overflow: hidden;
        }

        .pingme-file-icon {
            width: 32px;
            height: 32px;
            min-width: 32px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 9px;

            background: #edf2f7;
            color: #596777;
        }

        .pingme-file-icon svg {
            width: 17px;
            height: 17px;

            fill: none;
            stroke: currentColor;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .pingme-file-info {
            min-width: 0;
            flex: 1;
            overflow: hidden;
        }

        .pingme-file-name {
            display: block;

            font-size: 11.5px;
            line-height: 15px;

            font-weight: 600;
            color: #34383d;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pingme-file-size {
            display: block;

            margin-top: 1px;

            font-size: 10px;
            line-height: 13px;

            color: #8a9199;
        }

        /* FILE REMOVE */

        .pingme-file-remove {
            position: static !important;

            width: 22px;
            height: 22px;
            min-width: 22px;

            padding: 0;
            margin: 0;

            border: 0;

            display: flex !important;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: transparent;
            color: #777;

            box-shadow: none;

            cursor: pointer;
            z-index: 2;

            -webkit-tap-highlight-color: transparent;
        }

        .pingme-file-remove:hover {
            background: #e9edf1;
            color: #333;
        }

        .pingme-file-remove:active {
            transform: scale(.9);
        }

        .pingme-file-remove svg {
            width: 12px;
            height: 12px;

            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
        }

        /* ================= MOBILE ================= */

        @media (max-width: 480px) {

            .pingme-image-attachment {
                width: 94px;
                height: 94px;
                flex-basis: 94px;
            }

            .pingme-file-card {
                width: 182px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .pingme-image-remove,
            .pingme-file-remove {
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

    function closeIcon() {
        return `
            <svg viewBox="0 0 24 24">
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
       PREVIEW CONTAINER
       ===================================================== */

    function createPreview() {
        let preview =
            document.getElementById(PREVIEW_ID);

        if (preview) return preview;

        const input =
            document.getElementById("chatInput");

        if (!input) return null;

        preview =
            document.createElement("div");

        preview.id = PREVIEW_ID;

        const row =
            input.closest(".input-row");

        if (row) {
            row.insertBefore(preview, input);
        } else if (input.parentNode) {
            input.parentNode.insertBefore(
                preview,
                input
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

                const card =
                    document.createElement("div");

                card.className =
                    "pingme-image-attachment";

                const image =
                    document.createElement("img");

                image.alt =
                    file.name || "Selected image";

                image.src =
                    URL.createObjectURL(file);

                image.onload = () => {
                    try {
                        URL.revokeObjectURL(image.src);
                    } catch {}
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
                    closeIcon();

                remove.addEventListener(
                    "click",
                    event => {
                        event.preventDefault();
                        event.stopPropagation();

                        selectedFiles.splice(index, 1);

                        renderPreview();
                        resetFileInputs();
                    }
                );

                card.appendChild(image);
                card.appendChild(remove);

                preview.appendChild(card);

                return;
            }

            /* FILE / DOCUMENT */

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
                        ${escapeHTML(
                            file.name || "Unnamed file"
                        )}
                    </span>

                    <span class="pingme-file-size">
                        ${formatSize(file.size)}
                    </span>
                </span>

                <button
                    type="button"
                    class="pingme-file-remove"
                    aria-label="Remove file">
                    ${closeIcon()}
                </button>
            `;

            const remove =
                card.querySelector(
                    ".pingme-file-remove"
                );

            remove.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    selectedFiles.splice(index, 1);

                    renderPreview();
                    resetFileInputs();
                }
            );

            preview.appendChild(card);
        });
    }

    /* =====================================================
       RESET INPUTS
       ===================================================== */

    function resetFileInputs() {
        [
            "pingme-photo-input",
            "pingme-file-input",
            "pingme-document-input"
        ].forEach(id => {

            const input =
                document.getElementById(id);

            if (input) {
                input.value = "";
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

            const exists =
                selectedFiles.some(oldFile =>
                    oldFile.name === file.name &&
                    oldFile.size === file.size &&
                    oldFile.lastModified ===
                        file.lastModified
                );

            if (!exists) {
                selectedFiles.push(file);
            }
        });

        renderPreview();
        resetFileInputs();

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

            if (!files) return;

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
            resetFileInputs();
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

            resetFileInputs();
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
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

})();
