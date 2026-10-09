/* =========================================================
   PingMe AI — Attachment AI Bridge
   Images • PDFs • Text Files • Gemini Chat
   ========================================================= */

(() => {
    "use strict";

    const API_NAME = "PingMeAttachmentAI";

    const TEXT_EXTENSIONS = [
        "txt", "md", "csv", "json", "xml", "html", "htm",
        "css", "js", "ts", "py", "java", "c", "cpp",
        "h", "sql", "log", "yaml", "yml", "ini", "rtf"
    ];

    function getFiles() {
        return window.PingMeAttachments?.getFiles?.() || [];
    }

    function getExtension(name) {
        const parts = String(name || "").split(".");
        return parts.length > 1
            ? parts.pop().toLowerCase()
            : "";
    }

    function getMimeType(file) {
        const mime = String(file.type || "").toLowerCase();

        if (mime && mime !== "application/octet-stream") {
            return mime;
        }

        const extension = getExtension(file.name);

        const types = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            gif: "image/gif",
            bmp: "image/bmp",
            heic: "image/heic",
            heif: "image/heif",
            pdf: "application/pdf",
            txt: "text/plain",
            md: "text/markdown",
            csv: "text/csv",
            json: "application/json",
            xml: "application/xml",
            html: "text/html",
            htm: "text/html",
            css: "text/css",
            js: "text/javascript",
            yaml: "text/yaml",
            yml: "text/yaml",
            rtf: "application/rtf"
        };

        return types[extension] || mime || "application/octet-stream";
    }

    async function readAsBase64(file) {
        if (!(file instanceof Blob) || file.size === 0) {
            throw new Error("ছবির ফাইলটি খালি বা পড়ার অযোগ্য।");
        }

        try {
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            const chunkSize = 8192;
            let binary = "";

            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode(
                    ...bytes.subarray(i, i + chunkSize)
                );
            }

            return btoa(binary);
        } catch (error) {
            console.error("PingMe: File read failed", error);

            throw new Error(
                "ফাইল পড়া যায়নি: " + (file.name || "attachment")
            );
        }
    }

    async function prepare(files = getFiles()) {
        const parts = [];
        const names = [];

        for (const file of files) {
            if (!(file instanceof Blob)) continue;

            const name = String(file.name || "attachment");
            const mime = getMimeType(file);
            const extension = getExtension(name);

            if (mime.startsWith("image/") || mime === "application/pdf") {
                const data = await readAsBase64(file);

                parts.push({
                    inlineData: {
                        mimeType: mime,
                        data
                    }
                });

                names.push(name);
                continue;
            }

            const isText =
                mime.startsWith("text/") ||
                [
                    "application/json",
                    "application/xml",
                    "application/rtf"
                ].includes(mime) ||
                TEXT_EXTENSIONS.includes(extension);

            if (isText) {
                parts.push({
                    text:
                        `Attachment: ${name}\nContent:\n` +
                        await file.text()
                });

                names.push(name);
                continue;
            }

            throw new Error(
                "এই ফাইলের ফরম্যাট এখনো সাপোর্ট করা হচ্ছে না: " + name
            );
        }

        return { parts, names };
    }

    async function prepareMessage(message, files = getFiles()) {
        const prepared = await prepare(files);

        return {
            parts: [
                {
                    text:
                        String(message || "").trim() ||
                        "Please examine the attached files and help the user."
                },
                ...prepared.parts
            ],
            names: prepared.names
        };
    }

    async function sendToChat(chat, message) {
        if (!chat) {
            throw new Error("AI chat session পাওয়া যায়নি।");
        }

        const files = getFiles();
        const text = String(message || "").trim();

        if (!files.length) {
            if (!text) {
                throw new Error("মেসেজ বা ফাইল সংযুক্ত কর।");
            }

            return chat.sendMessage(text);
        }

        const prepared = await prepareMessage(text, files);

        if (!prepared.parts.length) {
            throw new Error("পাঠানোর মতো কোনো ফাইল পাওয়া যায়নি।");
        }

        const result = await chat.sendMessage(prepared.parts);

        // Clear attachments only after Gemini accepts the message.
        window.PingMeAttachments?.clear?.();

        return result;
    }

    window[API_NAME] = {
        getFiles,
        hasFiles: () => getFiles().length > 0,
        prepare,
        prepareMessage,
        sendToChat,
        clear: () => window.PingMeAttachments?.clear?.()
    };

    console.log("PingMe Attachment AI Bridge Connected");
})();