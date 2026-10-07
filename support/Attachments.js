// PingMe AI — Attachments Support
// Photos / Files / Documents + Preview + Remove

(() => {
    "use strict";

    const state = {
        files: []
    };

    const $ = id => document.getElementById(id);

    /* =========================
       STYLE
       ========================= */

    const style = document.createElement("style");
    style.textContent = `
        #pingmeAttachmentPreview {
            display:none;
            gap:8px;
            padding:8px 12px;
            overflow-x:auto;
            border-radius:14px;
        }

        .pm-attachment {
            position:relative;
            flex:0 0 auto;
            width:72px;
            height:72px;
            border:1px solid rgba(127,127,127,.22);
            border-radius:13px;
            overflow:hidden;
            background:rgba(127,127,127,.08);
            display:flex;
            align-items:center;
            justify-content:center;
        }

        .pm-attachment img {
            width:100%;
            height:100%;
            object-fit:cover;
        }

        .pm-file {
            padding:7px;
            text-align:center;
            font-size:11px;
            line-height:14px;
            overflow:hidden;
        }

        .pm-file-icon {
            font-size:24px;
            display:block;
            margin-bottom:3px;
        }

        .pm-attachment-remove {
            position:absolute;
            top:4px;
            right:4px;
            width:20px;
            height:20px;
            border:0;
            border-radius:50%;
            background:rgba(0,0,0,.68);
            color:#fff;
            font-size:14px;
            line-height:20px;
            padding:0;
            cursor:pointer;
        }

        #pingmeAttachmentInput {
            display:none;
        }
    `;
    document.head.appendChild(style);

    /* =========================
       UI
       ========================= */

    function createUI() {
        if ($("pingmeAttachmentInput")) return;

        const input = document.createElement("input");
        input.id = "pingmeAttachmentInput";
        input.type = "file";
        input.multiple = true;
        input.accept = "image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.json";
        document.body.appendChild(input);

        const preview = document.createElement("div");
        preview.id = "pingmeAttachmentPreview";

        const chatInput = $("chatInput");
        if (chatInput && chatInput.parentElement) {
            chatInput.parentElement.insertBefore(preview, chatInput);
        } else {
            document.body.appendChild(preview);
        }

        input.addEventListener("change", e => {
            addFiles([...e.target.files]);
            input.value = "";
        });
    }

    /* =========================
       FILE HANDLING
       ========================= */

    function addFiles(files) {
        files.forEach(file => {
            if (!file || state.files.some(x =>
                x.name === file.name &&
                x.size === file.size &&
                x.lastModified === file.lastModified
            )) return;

            state.files.push(file);
        });

        render();
        exposeState();
    }

    function removeFile(index) {
        state.files.splice(index, 1);
        render();
        exposeState();
    }

    function clearAttachments() {
        state.files.length = 0;
        render();
        exposeState();
    }

    /* =========================
       PREVIEW
       ========================= */

    function render() {
        const box = $("pingmeAttachmentPreview");
        if (!box) return;

        box.innerHTML = "";

        if (!state.files.length) {
            box.style.display = "none";
            return;
        }

        box.style.display = "flex";

        state.files.forEach((file, index) => {
            const item = document.createElement("div");
            item.className = "pm-attachment";

            const remove = document.createElement("button");
            remove.className = "pm-attachment-remove";
            remove.type = "button";
            remove.textContent = "×";
            remove.onclick = () => removeFile(index);

            if (file.type.startsWith("image/")) {
                const img = document.createElement("img");
                img.alt = file.name;

                const reader = new FileReader();
                reader.onload = e => {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);

                item.appendChild(img);
            } else {
                const fileBox = document.createElement("div");
                fileBox.className = "pm-file";

                const icon = document.createElement("span");
                icon.className = "pm-file-icon";
                icon.textContent = getFileIcon(file);

                const name = document.createElement("span");
                name.textContent = shorten(file.name);

                fileBox.append(icon, name);
                item.appendChild(fileBox);
            }

            item.appendChild(remove);
            box.appendChild(item);
        });
    }

    function shorten(name) {
        if (name.length <= 16) return name;
        return name.slice(0, 11) + "…" + name.slice(-4);
    }

    function getFileIcon(file) {
        const type = file.type || "";
        const name = file.name.toLowerCase();

        if (type === "application/pdf" || name.endsWith(".pdf")) return "PDF";
        if (type.includes("word") || /\.(doc|docx)$/.test(name)) return "DOC";
        if (type.includes("sheet") || /\.(xls|xlsx|csv)$/.test(name)) return "XLS";
        if (type.includes("presentation") || /\.(ppt|pptx)$/.test(name)) return "PPT";
        if (type.includes("json")) return "{}";
        if (type.startsWith("text/")) return "TXT";

        return "FILE";
    }

    /* =========================
       OPEN FILE PICKER
       ========================= */

    function openPicker(options = {}) {
        createUI();

        const input = $("pingmeAttachmentInput");
        if (!input) return;

        input.accept = options.accept ||
            "image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.json";

        input.multiple = options.multiple !== false;
        input.click();
    }

    function openPhotos() {
        openPicker({
            accept: "image/*",
            multiple: true
        });
    }

    function openFiles() {
        openPicker({
            accept: "*/*",
            multiple: true
        });
    }

    function openDocuments() {
        openPicker({
            accept: ".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.json",
            multiple: true
        });
    }

    /* =========================
       PLUS MENU CONNECTION
       ========================= */

    function connectPlusMenu() {
        const selectors = [
            "[data-attachment]",
            "[data-action='photos']",
            "[data-action='files']",
            "[data-action='documents']"
        ];

        document.addEventListener("click", e => {
            const target = e.target.closest(selectors.join(","));
            if (!target) return;

            const action =
                target.dataset.attachment ||
                target.dataset.action ||
                "";

            if (/photo|image/i.test(action)) {
                e.preventDefault();
                openPhotos();
            } else if (/document/i.test(action)) {
                e.preventDefault();
                openDocuments();
            } else if (/file/i.test(action)) {
                e.preventDefault();
                openFiles();
            }
        });
    }

    /* =========================
       PUBLIC API
       ========================= */

    function exposeState() {
        window.PingMeAttachments = {
            files: [...state.files],
            addFiles,
            removeFile,
            clear: clearAttachments,
            openPicker,
            openPhotos,
            openFiles,
            openDocuments,
            hasFiles: state.files.length > 0
        };

        window.pingmeAttachments = state.files;
    }

    /* =========================
       INIT
       ========================= */

    function init() {
        createUI();
        connectPlusMenu();
        exposeState();
        render();

        console.log("PingMe Attachments Support Connected");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();