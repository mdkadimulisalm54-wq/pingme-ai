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

    function addStyles() {

        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `

        /* =================================================
           PREVIEW
           ================================================= */

        #${PREVIEW_ID} {
            display: none !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;

            padding: 4px 7px 3px !important;

            gap: 6px !important;

            flex-wrap: wrap !important;
            align-items: flex-start !important;

            overflow: hidden !important;

            min-height: 0 !important;
        }

        #${PREVIEW_ID}.show {
            display: flex !important;
        }


        /* =================================================
           PHOTO — SMALL COMPACT THUMBNAIL
           ================================================= */

        #${PREVIEW_ID} .pingme-photo-attachment {
            position: relative !important;

            width: 34px !important;
            height: 34px !important;

            min-width: 34px !important;
            min-height: 34px !important;

            max-width: 34px !important;
            max-height: 34px !important;

            flex: 0 0 34px !important;

            box-sizing: border-box !important;

            display: block !important;

            padding: 0 !important;
            margin: 0 !important;

            overflow: hidden !important;

            border-radius: 8px !important;

            background: #000 !important;

            border: 1px solid rgba(0,0,0,.12) !important;

            box-shadow: none !important;

            line-height: 0 !important;

            transform: none !important;
        }

        #${PREVIEW_ID} .pingme-photo-attachment img {
            display: block !important;

            width: 34px !important;
            height: 34px !important;

            min-width: 34px !important;
            min-height: 34px !important;

            max-width: 34px !important;
            max-height: 34px !important;

            box-sizing: border-box !important;

            padding: 0 !important;
            margin: 0 !important;

            border: 0 !important;

            background: #000 !important;

            object-fit: cover !important;
            object-position: center !important;

            border-radius: 7px !important;

            display: block !important;
        }


        /* =================================================
           FILE — SAME SIZE AS PHOTO
           ================================================= */

        #${PREVIEW_ID} .pingme-file-attachment {
            position: relative !important;

            width: 34px !important;
            height: 34px !important;

            min-width: 34px !important;
            min-height: 34px !important;

            max-width: 34px !important;
            max-height: 34px !important;

            flex: 0 0 34px !important;

            box-sizing: border-box !important;

            padding: 3px !important;
            margin: 0 !important;

            border-radius: 8px !important;

            background: #f6f8fa !important;

            border: 1px solid #e0e4e8 !important;

            box-shadow: none !important;

            display: flex !important;

            align-items: center !important;
            justify-content: center !important;

            overflow: hidden !important;

            line-height: 0 !important;

            transform: none !important;
        }

        #${PREVIEW_ID} .pingme-file-icon {
            width: 22px !important;
            height: 22px !important;

            min-width: 22px !important;
            min-height: 22px !important;

            max-width: 22px !important;
            max-height: 22px !important;

            display: flex !important;

            align-items: center !important;
            justify-content: center !important;

            border-radius: 5px !important;

            background: #e9eef3 !important;

            color: #596675 !important;

            margin: 0 !important;
            padding: 0 !important;
        }

        #${PREVIEW_ID} .pingme-file-icon svg {
            width: 13px !important;
            height: 13px !important;

            fill: none !important;
            stroke: currentColor !important;

            stroke-width: 1.7 !important;
            stroke-linecap: round !important;
            stroke-linejoin: round !important;
        }

        #${PREVIEW_ID} .pingme-file-info {
            display: none !important;
        }


        /* =================================================
           DOCUMENT — KEEP ORIGINAL SIZE
           ================================================= */

        #${PREVIEW_ID} .pingme-document-attachment {
            position: relative !important;

            width: 165px !important;
            height: 48px !important;

            min-width: 165px !important;
            min-height: 48px !important;

            max-width: 165px !important;
            max-height: 48px !important;

            flex: 0 0 165px !important;

            box-sizing: border-box !important;

            display: flex !important;
            align-items: center !important;

            gap: 7px !important;

            padding: 6px 7px !important;
            margin: 0 !important;

            border-radius: 11px !important;

            background: #f7f9fb !important;

            border: 1px solid #e0e4e8 !important;

            box-shadow: 0 2px 8px rgba(0,0,0,.05) !important;

            overflow: hidden !important;
        }

        #${PREVIEW_ID} .pingme-document-icon {
            width: 30px !important;
            height: 34px !important;

            min-width: 30px !important;

            display: flex !important;
            align-items: center !important;
            justify-content: center !important;

            border-radius: 7px !important;

            background: #edf1f5 !important;
            color: #596675 !important;
        }

        #${PREVIEW_ID} .pingme-document-icon svg {
            width: 17px !important;
            height: 19px !important;

            fill: none !important;
            stroke: currentColor !important;

            stroke-width: 1.7 !important;
            stroke-linecap: round !important;
            stroke-linejoin: round !important;
        }

        #${PREVIEW_ID} .pingme-document-info {
            min-width: 0 !important;
            flex: 1 !important;
        }

        #${PREVIEW_ID} .pingme-document-name {
            display: block !important;

            width: 100% !important;

            font-size: 10.5px !important;
            line-height: 13px !important;
            font-weight: 600 !important;

            color: #30343a !important;

            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        #${PREVIEW_ID} .pingme-document-size {
            display: block !important;

            margin-top: 1px !important;

            font-size: 9.5px !important;
            line-height: 12px !important;

            color: #858b92 !important;
        }


        /* =================================================
           REMOVE — SMALL OVERLAY ON PHOTO / FILE
           ================================================= */

        #${PREVIEW_ID} .pingme-attachment-remove {
            position: absolute !important;

            top: 2px !important;
            right: 2px !important;

            width: 12px !important;
            height: 12px !important;

            min-width: 12px !important;
            min-height: 12px !important;

            max-width: 12px !important;
            max-height: 12px !important;

            padding: 0 !important;
            margin: 0 !important;

            border: 0 !important;
            border-radius: 50% !important;

            display: flex !important;

            align-items: center !important;
            justify-content: center !important;

            background: rgba(255,255,255,.94) !important;

            color: #454a50 !important;

            box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;

            cursor: pointer !important;

            z-index: 50 !important;

            line-height: 0 !important;

            transform: none !important;
        }

        #${PREVIEW_ID} .pingme-attachment-remove svg {
            width: 7px !important;
            height: 7px !important;

            fill: none !important;
            stroke: currentColor !important;

            stroke-width: 2 !important;
            stroke-linecap: round !important;
        }

        #${PREVIEW_ID} .pingme-attachment-remove:active {
            transform: scale(.9) !important;
        }


        /* =================================================
           COUNT
           ================================================= */

        #${PREVIEW_ID} .pingme-attachment-count {
            width: 100% !important;

            padding: 0 2px 1px !important;

            font-size: 9px !important;
            line-height: 11px !important;

            color: #888 !important;
        }


        /* =================================================
           MOBILE — SAME COMPACT SIZE
           ================================================= */

        @media (max-width: 480px) {

            #${PREVIEW_ID} {
                padding: 4px 7px 3px !important;
                gap: 6px !important;
            }

            #${PREVIEW_ID} .pingme-photo-attachment,
            #${PREVIEW_ID} .pingme-file-attachment {
                width: 34px !important;
                height: 34px !important;

                min-width: 34px !important;
                min-height: 34px !important;

                max-width: 34px !important;
                max-height: 34px !important;

                flex: 0 0 34px !important;
            }

            #${PREVIEW_ID} .pingme-photo-attachment img {
                width: 34px !important;
                height: 34px !important;
            }

            #${PREVIEW_ID} .pingme-document-attachment {
                width: 165px !important;
                height: 48px !important;

                min-width: 165px !important;
                min-height: 48px !important;

                max-width: 165px !important;
                max-height: 48px !important;

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

                /* ================= PHOTO ================= */

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


                /* ================= DOCUMENT ================= */

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


                /* ================= FILE ================= */

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
