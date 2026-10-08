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
            padding: 5px 7px 3px;
            gap: 7px;
            flex-wrap: wrap;
            align-items: flex-start;
        }

        #${PREVIEW_ID}.show {
            display: flex;
        }


        /* =================================================
           PHOTO
           ================================================= */

        .pingme-photo-attachment {
            position: relative !important;

            width: 38px !important;
            height: 38px !important;

            min-width: 38px !important;
            max-width: 38px !important;

            min-height: 38px !important;
            max-height: 38px !important;

            flex: 0 0 38px !important;

            box-sizing: border-box !important;
            overflow: hidden !important;

            display: block !important;

            border-radius: 9px !important;

            background: #000 !important;
            border: 1px solid rgba(0,0,0,.07) !important;

            box-shadow: 0 2px 6px rgba(0,0,0,.06) !important;
        }

        .pingme-photo-attachment img {
            display: block !important;

            width: 100% !important;
            height: 100% !important;

            min-width: 0 !important;
            max-width: none !important;

            min-height: 0 !important;
            max-height: none !important;

            box-sizing: border-box !important;

            object-fit: cover !important;
            object-position: center !important;

            background: #000 !important;

            margin: 0 !important;
            padding: 0 !important;
        }


        /* =================================================
           FILE
           ================================================= */

        .pingme-file-attachment {
            position: relative;

            width: 42px;
            height: 42px;

            flex: 0 0 42px;

            box-sizing: border-box;

            padding: 7px;

            border-radius: 10px;

            background: #f6f8fa;
            border: 1px solid #e0e4e8;

            box-shadow: 0 2px 7px rgba(0,0,0,.06);

            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;

            overflow: hidden;
        }

        .pingme-file-icon {
            width: 27px;
            height: 27px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 8px;

            background: #e9eef3;
            color: #596675;

            margin-bottom: 3px;
        }

        .pingme-file-icon svg {
            width: 16px;
            height: 16px;

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

            font-size: 8.5px;
            line-height: 10px;
            font-weight: 600;

            color: #30343a;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pingme-file-size {
            display: block;

            margin-top: 1px;

            font-size: 8px;
            line-height: 10px;

            color: #858b92;
        }


        /* =================================================
           DOCUMENT
           ================================================= */

        .pingme-document-attachment {
            position: relative;

            width: 165px;
            height: 48px;

            flex: 0 0 165px;

            box-sizing: border-box;

            display: flex;
            align-items: center;

            gap: 7px;

            padding: 6px 7px;

            border-radius: 11px;

            background: #f7f9fb;
            border: 1px solid #e0e4e8;

            box-shadow: 0 2px 8px rgba(0,0,0,.05);

            overflow: hidden;
        }

        .pingme-document-icon {
            width: 30px;
            height: 34px;
            min-width: 30px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 7px;

            background: #edf1f5;
            color: #596675;
        }

        .pingme-document-icon svg {
            width: 17px;
            height: 19px;

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
            line-height: 13px;
            font-weight: 600;

            color: #30343a;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pingme-document-size {
            display: block;

            margin-top: 1px;

            font-size: 9.5px;
            line-height: 12px;

            color: #858b92;
        }


        /* =================================================
           REMOVE / PHOTO CONTROL
           ================================================= */

        .pingme-attachment-remove {
            position: absolute !important;

            top: 3px !important;
            right: 3px !important;

            width: 16px !important;
            height: 16px !important;

            min-width: 16px !important;
            max-width: 16px !important;

            min-height: 16px !important;
            max-height: 16px !important;

            padding: 0 !important;
            margin: 0 !important;

            border: 0 !important;
            border-radius: 50% !important;

            display: flex !important;
            align-items: center !important;
            justify-content: center !important;

            background: rgba(255,255,255,.94) !important;
            color: #454a50 !important;

            box-shadow: 0 1px 4px rgba(0,0,0,.18) !important;

            cursor: pointer;
            z-index: 20 !important;

            -webkit-tap-highlight-color: transparent;
        }

        .pingme-attachment-remove:hover {
            background: #fff !important;
            color: #111 !important;
        }

        .pingme-attachment-remove:active {
            transform: scale(.9);
        }

        .pingme-attachment-remove svg {
            width: 9px !important;
            height: 9px !important;

            fill: none !important;
            stroke: currentColor !important;

            stroke-width: 2 !important;
            stroke-linecap: round !important;
        }


        /* =================================================
           COUNT
           ================================================= */

        .pingme-attachment-count {
            width: 100%;

            padding: 0 3px 2px;

            font-size: 10px;
            line-height: 13px;

            color: #888;
        }


        /* =================================================
           MOBILE
           ================================================= */

        @media (max-width: 480px) {

            #${PREVIEW_ID} {
                padding: 5px 7px 3px;
                gap: 7px;
            }

            .pingme-photo-attachment {
                width: 38px !important;
                height: 38px !important;

                min-width: 38px !important;
                max-width: 38px !important;

                min-height: 38px !important;
                max-height: 38px !important;

                flex: 0 0 38px !important;
            }

            .pingme-photo-attachment img {
                width: 100% !important;
                height: 100% !important;

                min-width: 0 !important;
                max-width: none !important;

                min-height: 0 !important;
                max-height: none !important;
            }

            .pingme-document-attachment {
                width: 165px !important;
                height: 48px !important;

                min-width: 165px !important;
                max-width: 165px !important;

                flex: 0 0 165px !important;
            }
        }
    `;

        document.head.appendChild(style);
    }


    /* ====================================================
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

        preview.id =
            PREVIEW_ID;

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
       HELPERS
       ===================================================== */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatSize(bytes) {

        if (!bytes) return "0 B";

        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {
            return (
                (bytes / 1024).toFixed(1) +
                " KB"
            );
        }

        if (bytes < 1024 * 1024 * 1024) {
            return (
                (bytes / (1024 * 1024)).toFixed(1) +
                " MB"
            );
        }

        return (
            (bytes / (1024 * 1024 * 1024)).toFixed(1) +
            " GB"
        );
    }


    function isImage(file) {

        return String(file?.type || "")
            .toLowerCase()
            .startsWith("image/");
    }


    function isDocument(file) {

        const name =
            String(file?.name || "")
                .toLowerCase();

        return (
            name.endsWith(".pdf") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx") ||
            name.endsWith(".txt") ||
            name.endsWith(".rtf") ||
            name.endsWith(".xls") ||
            name.endsWith(".xlsx") ||
            name.endsWith(".ppt") ||
            name.endsWith(".pptx")
        );
    }


    function closeIcon() {

        return `
            <svg viewBox="0 0 24 24"
                 aria-hidden="true">
                <path d="M7 7l10 10"></path>
                <path d="M17 7L7 17"></path>
            </svg>
        `;
    }


    function fileIcon() {

        return `
            <svg viewBox="0 0 24 24"
                 aria-hidden="true">
                <path d="M5 3.5h9l5 5v12H5z"></path>
                <path d="M14 3.5v5h5"></path>
                <path d="M8 13h8"></path>
                <path d="M8 16.5h6"></path>
            </svg>
        `;
    }


    /* =====================================================
       IMAGE LOADER
       ===================================================== */

    function loadImage(file, image) {

        const reader =
            new FileReader();

        reader.onload =
            event => {

                image.src =
                    event.target.result;
            };

        reader.onerror =
            () => {

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


        selectedFiles.forEach(
            (file, index) => {

                /* =========================================
                   PHOTO
                   ========================================= */

                if (isImage(file)) {

                    const card =
                        document.createElement("div");

                    card.className =
                        "pingme-photo-attachment";

                    const image =
                        document.createElement("img");

                    image.alt =
                        "Selected photo";

                    image.draggable =
                        false;

                    loadImage(
                        file,
                        image
                    );


                    const remove =
                        document.createElement("button");

                    remove.type =
                        "button";

                    remove.className =
                        "pingme-attachment-remove";

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

                            selectedFiles.splice(
                                index,
                                1
                            );

                            resetFileInputs();
                            renderPreview();
                        }
                    );


                    card.appendChild(image);
                    card.appendChild(remove);

                    preview.appendChild(card);

                    return;
                }


                /* =========================================
                   DOCUMENT
                   ========================================= */

                if (isDocument(file)) {

                    const card =
                        document.createElement("div");

                    card.className =
                        "pingme-document-attachment";

                    card.innerHTML = `

                        <span class="pingme-document-icon">
                            ${fileIcon()}
                        </span>

                        <span class="pingme-document-info">

                            <span class="pingme-document-name">
                                ${escapeHTML(file.name)}
                            </span>

                            <span class="pingme-document-size">
                                ${formatSize(file.size)}
                            </span>

                        </span>

                        <button
                            type="button"
                            class="pingme-attachment-remove"
                            aria-label="Remove document"
                        >
                            ${closeIcon()}
                        </button>
                    `;


                    const remove =
                        card.querySelector(
                            ".pingme-attachment-remove"
                        );


                    remove.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();
                            event.stopPropagation();

                            selectedFiles.splice(
                                index,
                                1
                            );

                            resetFileInputs();
                            renderPreview();
                        }
                    );


                    preview.appendChild(card);

                    return;
                }


                /* =========================================
                   FILE
                   ========================================= */

                const card =
                    document.createElement("div");

                card.className =
                    "pingme-file-attachment";

                card.innerHTML = `

                    <span class="pingme-file-icon">
                        ${fileIcon()}
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
                        class="pingme-attachment-remove"
                        aria-label="Remove file"
                    >
                        ${closeIcon()}
                    </button>
                `;


                const remove =
                    card.querySelector(
                        ".pingme-attachment-remove"
                    );


                remove.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        selectedFiles.splice(
                            index,
                            1
                        );

                        resetFileInputs();
                        renderPreview();
                    }
                );


                preview.appendChild(card);
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
       RESET FILE INPUTS
       ===================================================== */

    function resetFileInputs() {

        [
            "pingme-photo-input",
            "pingme-file-input",
            "pingme-document-input"
        ].forEach(id => {

            const fileInput =
                document.getElementById(id);

            if (fileInput) {

                try {
                    fileInput.value = "";
                } catch {}
            }
        });
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

                if (!file) return;

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
            }
        );

        renderPreview();

        resetFileInputs();

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

            selectedFiles.splice(
                index,
                1
            );

            resetFileInputs();
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
            initialize,
            { once: true }
        );

    } else {

        initialize();

    }

})();
