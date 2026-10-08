/* =========================================================
   PingMe AI — Attachments Support
   Compact File Cards
   Photos • Files • Documents
   ========================================================= */

(() => {
    "use strict";

    const STYLE_ID = "pingme-attachments-style";
    const PREVIEW_ID = "pingme-attachments-preview";

    let selectedFiles = [];
    let filesForNextMessage = [];

    /* =====================================================
       STYLES
       ===================================================== */

    function addStyles() {

        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `

        /* INPUT PREVIEW */

        #${PREVIEW_ID} {
            display: none;
            width: 100%;
            padding: 6px 8px 2px;
            gap: 7px;
            flex-wrap: wrap;
            box-sizing: border-box;
        }

        #${PREVIEW_ID}.show {
            display: flex;
        }


        /* FILE CARD */

        .pingme-file-card {
            display: flex;
            align-items: center;
            gap: 8px;

            width: 190px;
            max-width: 100%;

            padding: 7px 8px;

            background: #f6f8fb;
            border: 1px solid rgba(0,0,0,.08);

            border-radius: 12px;

            box-shadow:
                0 2px 8px rgba(0,0,0,.05);

            box-sizing: border-box;
        }


        /* ICON */

        .pingme-file-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 9px;

            background: #e9eef7;
            color: #39485c;
        }

        .pingme-file-icon svg {
            width: 18px;
            height: 18px;

            fill: none;
            stroke: currentColor;

            stroke-width: 1.8;
            stroke-linecap: round;
            stroke-linejoin: round;
        }


        /* INFORMATION */

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

        .pingme-file-meta {
            display: block;

            margin-top: 1px;

            font-size: 10px;
            line-height: 14px;

            color: #858585;
        }


        /* REMOVE */

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


        /* COUNT */

        .pingme-file-count {
            width: 100%;

            padding: 0 3px 2px;

            font-size: 10px;
            color: #888;
        }


        /* =================================================
           ATTACHMENT INSIDE USER MESSAGE
           ================================================= */

        .pingme-message-attachments {
            display: flex;

            flex-wrap: wrap;
            gap: 7px;

            margin-top: 8px;
        }

        .pingme-sent-file {
            display: flex;
            align-items: center;

            gap: 8px;

            width: 190px;
            max-width: 100%;

            padding: 7px 8px;

            background: rgba(255,255,255,.72);

            border: 1px solid rgba(80,100,130,.14);

            border-radius: 11px;

            box-sizing: border-box;
        }

        .pingme-sent-file .pingme-file-icon {
            width: 31px;
            height: 31px;
            min-width: 31px;
        }

        .pingme-sent-file .pingme-file-name {
            font-size: 11.5px;
        }

        .pingme-sent-file .pingme-file-meta {
            font-size: 9.5px;
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
                Math.log(bytes) /
                Math.log(1024)
            ),
            units.length - 1
        );

        const size =
            bytes /
            Math.pow(1024, index);

        return (
            size.toFixed(
                index === 0 ? 0 : 1
            )
            + " "
            + units[index]
        );
    }


    function getFileType(file) {

        const type =
            String(file.type || "")
                .toLowerCase();

        const name =
            String(file.name || "")
                .toLowerCase();

        if (type.startsWith("image/")) {
            return "Photo";
        }

        if (
            type.includes("pdf") ||
            name.endsWith(".pdf")
        ) {
            return "PDF";
        }

        if (
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {
            return "Document";
        }

        if (
            name.endsWith(".xls") ||
            name.endsWith(".xlsx")
        ) {
            return "Spreadsheet";
        }

        if (
            name.endsWith(".ppt") ||
            name.endsWith(".pptx")
        ) {
            return "Presentation";
        }

        if (
            type.startsWith("text/") ||
            name.endsWith(".txt")
        ) {
            return "Text file";
        }

        return "File";
    }


    function fileIcon(file) {

        const type =
            String(file.type || "")
                .toLowerCase();

        const name =
            String(file.name || "")
                .toLowerCase();

        /* PHOTO */

        if (type.startsWith("image/")) {

            return `
                <svg viewBox="0 0 24 24">
                    <rect
                        x="3.5"
                        y="4.5"
                        width="17"
                        height="15"
                        rx="2.5"
                    ></rect>

                    <circle
                        cx="8.5"
                        cy="9"
                        r="1.4"
                    ></circle>

                    <path
                        d="M4.5 17l4.5-4.5
                           3.2 3.1
                           2.2-2.2
                           5.1 4.1"
                    ></path>
                </svg>
            `;
        }


        /* PDF */

        if (
            type.includes("pdf") ||
            name.endsWith(".pdf")
        ) {

            return `
                <svg viewBox="0 0 24 24">

                    <path
                        d="M6 3.5h8l4 4v13H6z"
                    ></path>

                    <path
                        d="M14 3.5v4h4"
                    ></path>

                    <path
                        d="M9 14h6"
                    ></path>

                    <path
                        d="M9 17h4"
                    ></path>

                </svg>
            `;
        }


        /* DEFAULT FILE */

        return `
            <svg viewBox="0 0 24 24">

                <path
                    d="M5 3.5h9l5 5v12H5z"
                ></path>

                <path
                    d="M14 3.5v5h5"
                ></path>

                <path
                    d="M8 13h8"
                ></path>

                <path
                    d="M8 16.5h6"
                ></path>

            </svg>
        `;
    }


    /* =====================================================
       PREVIEW
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


    function renderPreview() {

        const preview =
            createPreview();

        if (!preview) return;

        preview.innerHTML = "";

        if (!selectedFiles.length) {

            preview.classList.remove(
                "show"
            );

            return;
        }

        preview.classList.add(
            "show"
        );


        selectedFiles.forEach(
            (file, index) => {

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

                        <span class="pingme-file-meta">
                            ${getFileType(file)}
                            •
                            ${formatSize(file.size)}
                        </span>

                    </span>

                    <button
                        type="button"
                        class="pingme-file-remove"
                        aria-label="Remove file"
                    >

                        <svg viewBox="0 0 24 24">
                            <path d="M7 7l10 10"></path>
                            <path d="M17 7L7 17"></path>
                        </svg>

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


                preview.appendChild(
                    card
                );
            }
        );


        if (selectedFiles.length > 1) {

            const count =
                document.createElement("div");

            count.className =
                "pingme-file-count";

            count.textContent =
                `${selectedFiles.length} attachments selected`;

            preview.appendChild(
                count
            );
        }
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
                        existing =>
                            existing.name ===
                                file.name &&
                            existing.size ===
                                file.size &&
                            existing.lastModified ===
                                file.lastModified
                    );

                if (!exists) {
                    selectedFiles.push(
                        file
                    );
                }
            }
        );

        renderPreview();

        console.log(
            "PingMe attachments selected:",
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
       SENT ATTACHMENT CARD
       ===================================================== */

    function createSentCard(file) {

        const card =
            document.createElement("div");

        card.className =
            "pingme-sent-file";

        card.innerHTML = `

            <span class="pingme-file-icon">
                ${fileIcon(file)}
            </span>

            <span class="pingme-file-info">

                <span class="pingme-file-name">
                    ${escapeHTML(file.name)}
                </span>

                <span class="pingme-file-meta">
                    ${getFileType(file)}
                    •
                    ${formatSize(file.size)}
                </span>

            </span>
        `;

        return card;
    }


    function attachFilesToMessage(
        messageRow,
        files
    ) {

        if (
            !messageRow ||
            !files ||
            !files.length
        ) {
            return;
        }

        if (
            messageRow.querySelector(
                ".pingme-message-attachments"
            )
        ) {
            return;
        }

        const box =
            messageRow.querySelector(
                ".message-box"
            ) || messageRow;

        const container =
            document.createElement("div");

        container.className =
            "pingme-message-attachments";

        files.forEach(
            file => {

                container.appendChild(
                    createSentCard(file)
                );
            }
        );

        box.appendChild(
            container
        );
    }


    /* =====================================================
       WATCH NEW USER MESSAGE
       ===================================================== */

    const chatArea =
        document.getElementById("chatArea");

    if (chatArea) {

        const observer =
            new MutationObserver(
                mutations => {

                    if (
                        !filesForNextMessage.length
                    ) {
                        return;
                    }

                    for (
                        const mutation
                        of mutations
                    ) {

                        for (
                            const node
                            of mutation.addedNodes
                        ) {

                            if (
                                node.nodeType !== 1
                            ) {
                                continue;
                            }

                            if (
                                node.classList.contains(
                                    "message-row"
                                ) &&
                                node.classList.contains(
                                    "user"
                                )
                            ) {

                                attachFilesToMessage(
                                    node,
                                    filesForNextMessage
                                );

                                filesForNextMessage = [];

                                selectedFiles = [];

                                renderPreview();

                                return;
                            }
                        }
                    }
                }
            );

        observer.observe(
            chatArea,
            {
                childList: true
            }
        );
    }


    /* =====================================================
       PREPARE FILES BEFORE SEND
       ===================================================== */

    function prepareForSend() {

        if (!selectedFiles.length) {
            return;
        }

        filesForNextMessage =
            [...selectedFiles];
    }


    const sendButton =
        document.getElementById(
            "sendButton"
        );


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            prepareForSend
        );
    }


    /* =====================================================
       ENTER SEND
       ===================================================== */

    const chatInput =
        document.getElementById(
            "chatInput"
        );


    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    prepareForSend();
                }
            }
        );
    }


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

            filesForNextMessage = [];

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
