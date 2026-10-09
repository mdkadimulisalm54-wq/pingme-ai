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

    function getInput() {
        return document.getElementById("chatInput") ||
               document.getElementById("messageInput");
    }

    function getSendButton() {
        return document.getElementById("sendButton") ||
               document.getElementById("sendBtn");
    }

    function updateSendButton() {
        const button = getSendButton();
        const input = getInput();

        if (!button) return;

        const hasText = !!input?.value.trim();
        const hasFiles = selectedFiles.length > 0;

        button.classList.toggle(
            "has-attachments",
            hasFiles
        );

        if (hasText || hasFiles) {
            button.style.visibility = "visible";
            button.style.opacity = "1";
        }

        button.disabled = !hasText && !hasFiles;
    }

    function addStyles() {
        document.getElementById(STYLE_ID)?.remove();

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
        #${PREVIEW_ID} {
            display: none !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            padding: 5px 4px !important;
            gap: 7px !important;
            flex-wrap: wrap !important;
            align-items: flex-start !important;
            overflow: hidden !important;
            min-height: 0 !important;
        }

        #${PREVIEW_ID}.show {
            display: flex !important;
        }

        #${PREVIEW_ID} .pingme-photo-attachment {
            position: relative !important;
            width: 72px !important;
            height: 72px !important;
            min-width: 72px !important;
            min-height: 72px !important;
            max-width: 72px !important;
            max-height: 72px !important;
            flex: 0 0 72px !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
            border-radius: 9px !important;
            background: transparent !important;
            border: 1px solid rgba(0,0,0,.10) !important;
            box-shadow: none !important;
            line-height: 0 !important;
        }

        #${PREVIEW_ID} .pingme-photo-attachment img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            min-width: 0 !important;
            min-height: 0 !important;
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: cover !important;
            object-position: center !important;
            border: 0 !important;
            border-radius: 8px !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
        }

        #${PREVIEW_ID} .pingme-file-attachment {
            position: relative !important;
            width: 46px !important;
            height: 46px !important;
            min-width: 46px !important;
            min-height: 46px !important;
            max-width: 46px !important;
            max-height: 46px !important;
            flex: 0 0 46px !important;
            box-sizing: border-box !important;
            padding: 3px !important;
            margin: 0 !important;
            border-radius: 8px !important;
            background: #f6f8fa !important;
            border: 1px solid #e0e4e8 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            line-height: 0 !important;
        }

        #${PREVIEW_ID} .pingme-file-icon {
            width: 26px !important;
            height: 26px !important;
            min-width: 26px !important;
            min-height: 26px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 5px !important;
            background: #e9eef3 !important;
            color: #596675 !important;
        }

        #${PREVIEW_ID} .pingme-file-icon svg {
            width: 15px !important;
            height: 15px !important;
            fill: none !important;
            stroke: currentColor !important;
            stroke-width: 1.7 !important;
            stroke-linecap: round !important;
            stroke-linejoin: round !important;
        }

        #${PREVIEW_ID} .pingme-file-info {
            display: none !important;
        }

        #${PREVIEW_ID} .pingme-document-attachment {
            position: relative !important;
            width: 165px !important;
            height: 48px !important;
            min-width: 0 !important;
            min-height: 48px !important;
            max-width: 100% !important;
            max-height: 48px !important;
            flex: 0 1 165px !important;
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

        #${PREVIEW_ID} .pingme-attachment-remove {
            position: absolute !important;
            top: 2px !important;
            right: 2px !important;
            width: 14px !important;
            height: 14px !important;
            min-width: 14px !important;
            min-height: 14px !important;
            max-width: 14px !important;
            max-height: 14px !important;
            padding: 0 !important;
            margin: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(255,255,255,.95) !important;
            color: #454a50 !important;
            box-shadow: 0 1px 3px rgba(0,0,0,.18) !important;
            cursor: pointer !important;
            z-index: 50 !important;
            line-height: 0 !important;
        }

        #${PREVIEW_ID} .pingme-attachment-remove svg {
            width: 8px !important;
            height: 8px !important;
            fill: none !important;
            stroke: currentColor !important;
            stroke-width: 2 !important;
            stroke-linecap: round !important;
        }

        #${PREVIEW_ID} .pingme-attachment-count {
            width: 100% !important;
            padding: 0 2px 1px !important;
            font-size: 9px !important;
            line-height: 11px !important;
            color: #888 !important;
        }

        @media (max-width: 480px) {
            #${PREVIEW_ID} {
                padding: 4px 3px !important;
                gap: 6px !important;
            }

            #${PREVIEW_ID} .pingme-photo-attachment {
                width: 72px !important;
                height: 72px !important;
                min-width: 72px !important;
                min-height: 72px !important;
                max-width: 72px !important;
                max-height: 72px !important;
                flex: 0 0 72px !important;
            }

            #${PREVIEW_ID} .pingme-file-attachment {
                width: 46px !important;
                height: 46px !important;
                min-width: 46px !important;
                min-height: 46px !important;
                max-width: 46px !important;
                max-height: 46px !important;
                flex: 0 0 46px !important;
            }

            #${PREVIEW_ID} .pingme-document-attachment {
                flex-basis: 165px !important;
                max-width: 100% !important;
            }
        }
        `;

        document.head.appendChild(style);
    }

    function createPreview() {
        let preview = document.getElementById(PREVIEW_ID);
        if (preview) return preview;

        const chatInput = getInput();
        if (!chatInput) return null;

        preview = document.createElement("div");
        preview.id = PREVIEW_ID;

        const row = chatInput.closest(".input-row");

        if (row) {
            row.insertBefore(preview, chatInput);
        } else {
            chatInput.parentNode.insertBefore(preview, chatInput);
        }

        return preview;
    }

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
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + " KB";
        if (bytes < 1024 * 1024 * 1024)
            return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    }

    function isImage(file) {
        return String(file?.type || "")
            .toLowerCase().startsWith("image/");
    }

    function isDocument(file) {
        const name = String(file?.name || "").toLowerCase();
        return [
            ".pdf", ".doc", ".docx", ".txt", ".rtf",
            ".xls", ".xlsx", ".ppt", ".pptx"
        ].some(ext => name.endsWith(ext));
    }

    function closeIcon() {
        return `<svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7l10 10"></path>
            <path d="M17 7L7 17"></path>
        </svg>`;
    }

    function fileIcon() {
        return `<svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 3.5h9l5 5v12H5z"></path>
            <path d="M14 3.5v5h5"></path>
            <path d="M8 13h8"></path>
            <path d="M8 16.5h6"></path>
        </svg>`;
    }

    function loadImage(file, image) {
        const reader = new FileReader();

        reader.onload = event => {
            image.src = event.target.result;
        };

        reader.onerror = () => image.removeAttribute("src");
        reader.readAsDataURL(file);
    }

    function renderPreview() {
        const preview = createPreview();
        if (!preview) return;

        preview.innerHTML = "";

        if (!selectedFiles.length) {
            preview.classList.remove("show");
            updateSendButton();
            return;
        }

        preview.classList.add("show");

        selectedFiles.forEach((file, index) => {
            let card;

            if (isImage(file)) {
                card = document.createElement("div");
                card.className = "pingme-photo-attachment";

                const image = document.createElement("img");
                image.alt = "Selected photo";
                image.draggable = false;

                loadImage(file, image);
                card.appendChild(image);
            } else if (isDocument(file)) {
                card = document.createElement("div");
                card.className = "pingme-document-attachment";

                card.innerHTML = `
                    <span class="pingme-document-icon">${fileIcon()}</span>
                    <span class="pingme-document-info">
                        <span class="pingme-document-name">
                            ${escapeHTML(file.name)}
                        </span>
                        <span class="pingme-document-size">
                            ${formatSize(file.size)}
                        </span>
                    </span>`;
            } else {
                card = document.createElement("div");
                card.className = "pingme-file-attachment";

                card.innerHTML = `
                    <span class="pingme-file-icon">${fileIcon()}</span>
                    <span class="pingme-file-info">
                        <span class="pingme-file-name">
                            ${escapeHTML(file.name)}
                        </span>
                        <span class="pingme-file-size">
                            ${formatSize(file.size)}
                        </span>
                    </span>`;
            }

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "pingme-attachment-remove";
            remove.setAttribute("aria-label", "Remove attachment");
            remove.innerHTML = closeIcon();

            remove.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();

                selectedFiles.splice(index, 1);
                resetFileInputs();
                renderPreview();
            });

            card.appendChild(remove);
            preview.appendChild(card);
        });

        if (selectedFiles.length > 1) {
            const count = document.createElement("div");
            count.className = "pingme-attachment-count";
            count.textContent =
                `${selectedFiles.length} attachments selected`;

            preview.appendChild(count);
        }

        updateSendButton();
    }

    function resetFileInputs() {
        [
            "pingme-photo-input",
            "pingme-file-input",
            "pingme-document-input"
        ].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                try {
                    input.value = "";
                } catch {}
            }
        });
    }

    function addFiles(files) {
        if (!files || !files.length) return;

        Array.from(files).forEach(file => {
            if (!file) return;

            const exists = selectedFiles.some(existing =>
                existing.name === file.name &&
                existing.size === file.size &&
                existing.lastModified === file.lastModified
            );

            if (!exists) selectedFiles.push(file);
        });

        renderPreview();
        resetFileInputs();
        updateSendButton();

        console.log("PingMe Attachments:", selectedFiles);
    }

    window.addEventListener("pingme:plus-files-selected", event => {
        const files = event?.detail?.files;
        if (files) addFiles(files);
    });

    document.addEventListener("input", event => {
        if (
            event.target.id === "chatInput" ||
            event.target.id === "messageInput"
        ) {
            updateSendButton();
        }
    });

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
            updateSendButton();
        },

        remove(index) {
            if (index < 0 || index >= selectedFiles.length) return;

            selectedFiles.splice(index, 1);
            resetFileInputs();
            renderPreview();
            updateSendButton();
        }
    };

    function initialize() {
        addStyles();
        createPreview();
        updateSendButton();
        console.log("PingMe Attachments Support Connected");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {
            once: true
        });
    } else {
        initialize();
    }
})();