/* =========================================================
   PingMe AI — Attachments Support
   Photos + Files + Documents
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
            box-sizing: border-box;
            padding: 8px 8px 5px;
            gap: 8px;
            flex-wrap: wrap;
            align-items: flex-start;
        }

        #${PREVIEW_ID}.show {
            display: flex;
        }

        /* =================================================
           PHOTO + FILE : SAME SIZE
           ================================================= */

        .pingme-photo-card,
        .pingme-file-card {
            position: relative;
            width: 92px;
            height: 92px;
            flex: 0 0 92px;
            box-sizing: border-box;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #e1e5ea;
            background: #f6f8fa;
            box-shadow: 0 2px 9px rgba(0,0,0,.07);
        }

        /* =================================================
           PHOTO
           ================================================= */

        .pingme-photo-card {
            background: #f2f4f7;
        }

        .pingme-photo-card img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            background: #f2f4f7;
        }

        /* =================================================
           FILE
           ================================================= */

        .pingme-file-card {
            padding: 9px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            background: #f7f9fb;
        }

        .pingme-file-icon {
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            background: #eaf0f6;
            color: #5a6674;
            margin-bottom: 6px;
        }

        .pingme-file-icon svg {
            width: 18px;
            height: 18px;
            fill: none;
            stroke: currentColor;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .pingme-file-info {
            width: 100%;
            min-width: 0;
        }

        .pingme-file-name {
            display: block;
            width: 100%;
            font-size: 10.5px;
            line-height: 13px;
            font-weight: 600;
            color: #34383d;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pingme-file-size {
            display: block;
            margin-top: 2px;
            font-size: 9.5px;
            line-height: 12px;
            color: #858c94;
        }

        /* =================================================
           DOCUMENT : SMALL CHIP
           ================================================= */

        .pingme-document-card {
            position: relative;
            display: flex;
            align-items: center;
            gap: 7px;

            width: 165px;
            height: 48px;
            flex: 0 0 165px;

            padding: 6px 7px;

            box-sizing: border-box;

            border-radius: 11px;
            border: 1px solid #e1e5ea;
            background: #f7f9fb;

            box-shadow: 0 2px 7px rgba(0,0,0,.05);

            overflow: hidden;
        }

        .pingme-document-icon {
            width: 31px;
            height: 34px;
            min-width: 31px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 7px;

            background: #edf1f5;
            color: #596675;
        }

        .pingme-document-icon svg {
            width: 17px;
            height: 17px;
            fill: none;
            stroke: currentColor;
            stroke-width: 1.7;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .pingme-document-info {
            min-width: 0;
            flex: 1;
        }

        .pingme-document-name {
            display: block;
            width: 100%;

            font-size: 10.5px;
            line-height: 14px;
            font-weight: 600;

            color: #34383d;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pingme-document-size {
            display: block;

            margin-top: 1px;

            font-size: 9.5px;
            line-height: 12px;

            color: #858c94;
        }

        /* =================================================
           REMOVE BUTTON
           ================================================= */

        .pingme-photo-remove {
            position: absolute;
            top: 5px;
            right: 5px;
        }

        .pingme-file-remove {
            position: absolute;
            top: 5px;
            right: 5px;
        }

        .pingme-document-remove {
            position: static;
            flex: 0 0 22px;
        }

        .pingme-attachment-remove {
            width: 22px;
            height: 22px;
            min-width: 22px;

            padding: 0;
            margin: 0;

            border: 0;
            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            background: rgba(255,255,255,.96);
            color: #555;

            box-shadow: 0 2px 7px rgba(0,0,0,.16);

            cursor: pointer;

            z-index: 5;

            -webkit-tap-highlight-color: transparent;
        }

        .pingme-document-remove {
            background: transparent;
            box-shadow: none;
            color: #777;
        }

        .pingme-attachment-remove svg {
            width: 11px;
            height: 11px;

            fill: none;
            stroke: currentColor;

            stroke-width: 2;
            stroke-linecap: round;
        }

        .pingme-attachment-remove:active {
            transform: scale(.88);
        }

        .pingme-document-remove:hover {
            background: #e9edf1;
            color: #333;
        }

        /* =================================================
           MOBILE
           ================================================= */

        @media (max-width: 480px) {
            .pingme-photo-card,
            .pingme-file-card {
                width: 92px;
                height: 92px;
                flex-basis: 92px;
            }

            .pingme-document-card {
                width: 160px;
                flex-basis: 160px;
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

    function isDocument(file) {
        const name =
            String(file?.name || "").toLowerCase();

        return [
            ".pdf",
            ".doc",
            ".docx",
            ".txt",
            ".rtf",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx"
        ].some(ext => name.endsWith(ext));
    }

    function closeIcon() {
        return `
            <svg viewBox="0 0 24 24">
                <path d="M7 7l10 10"></path>
                <path d="M17 7L7 17"></path>
            </svg>
        `;
    }

    function fileIcon() {
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
        } else {
            input.parentNode.insertBefore(
                preview,
                input
            );
        }

        return preview;
    }

    /* =====================================================
       IMAGE READER
       ===================================================== */

    function loadImage(file, image) {
        const reader = new FileReader();

        reader.onload = event => {
            image.src = event.target.result;
        };

        reader.onerror = () => {
            image.removeAttribute("src");
        };

        reader.readAsDataURL(file);
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

        selectedFiles.forEach((file, index) => {

            /* =================================================
               PHOTO
               ================================================= */

            if (isImage(file)) {

                const card =
                    document.createElement("div");

                card.className =
                    "pingme-photo-card";

                const image =
                    document.createElement("img");

                image.alt =
                    file.name || "Selected photo";

                image.draggable = false;

                loadImage(file, image);

                const remove =
                    document.createElement("button");

                remove.type = "button";

                remove.className =
                    "pingme-attachment-remove pingme-photo-remove";

                remove.setAttribute(
                    "aria-label",
                    "Remove photo"
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
                        resetInputs();
                    }
                );

                card.appendChild(image);
                card.appendChild(remove);

                preview.appendChild(card);

                return;
            }

            /* =================================================
               DOCUMENT
               ================================================= */

            if (isDocument(file)) {

                const card =
                    document.createElement("div");

                card.className =
                    "pingme-document-card";

                card.innerHTML = `
                    <span class="pingme-document-icon">
                        ${fileIcon()}
                    </span>

                    <span class="pingme-document-info">
                        <span class="pingme-document-name">
                            ${escapeHTML(
                                file.name || "Document"
                            )}
                        </span>

                        <span class="pingme-document-size">
                            ${formatSize(file.size)}
                        </span>
                    </span>

                    <button
                        type="button"
                        class="pingme-attachment-remove pingme-document-remove"
                        aria-label="Remove document">
                        ${closeIcon()}
                    </button>
                `;

                const remove =
                    card.querySelector(
                        ".pingme-document-remove"
                    );

                remove.addEventListener(
                    "click",
                    event => {
                        event.preventDefault();
                        event.stopPropagation();

                        selectedFiles.splice(index, 1);

                        renderPreview();
                        resetInputs();
                    }
                );

                preview.appendChild(card);

                return;
            }

            /* =================================================
               NORMAL FILE
               ================================================= */

            const card =
                document.createElement("div");

            card.className =
                "pingme-file-card";

            card.innerHTML = `
                <span class="pingme-file-icon">
                    ${fileIcon()}
                </span>

                <span class="pingme-file-info">
                    <span class="pingme-file-name">
                        ${escapeHTML(
                            file.name || "File"
                        )}
                    </span>

                    <span class="pingme-file-size">
                        ${formatSize(file.size)}
                    </span>
                </span>

                <button
                    type="button"
                    class="pingme-attachment-remove pingme-file-remove"
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
                    resetInputs();
                }
            );

            preview.appendChild(card);
        });
    }

    /* =====================================================
       RESET FILE INPUTS
       ===================================================== */

    function resetInputs() {
        [
            "pingme-photo-input",
            "pingme-file-input",
            "pingme-document-input"
        ].forEach(id => {

            const input =
                document.getElementById(id);

            if (input) {
                try {
                    input.value = "";
                } catch {}
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
        resetInputs();

        console.log(
            "PingMe Attachments:",
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
            resetInputs();
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

            resetInputs();
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
