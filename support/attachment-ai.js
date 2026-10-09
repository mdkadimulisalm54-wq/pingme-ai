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

    function readAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const result = String(reader.result || "");
                const comma = result.indexOf(",");

                if (comma < 0) {
                    reject(new Error("ফাইল পড়া যায়নি: " + file.name));
                    return;
                }

                resolve(result.slice(comma + 1));
            };

            reader.onerror = () =>
                reject(new Error("ফাইল পড়া যায়নি: " + file.name));

            reader.readAsDataURL(file);
        });
    }

    async function prepare(files = getFiles()) {
        const parts = [];
        const names = [];

        for (const file of files) {
            if (!(file instanceof Blob)) continue;

            const name = String(file.name || "attachment");
            const mime = String(
                file.type || "application/octet-stream"
            ).toLowerCase();

            const extension = getExtension(name);

            if (mime.startsWith("image/") || mime === "application/pdf") {
                parts.push({
                    inlineData: {
                        mimeType: mime,
                        data: await readAsBase64(file)
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
                    text: `Attachment: ${name}\nContent:\n${await file.text()}`
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
                    text: String(message || "").trim() ||
                        "Please examine the attached files and help the user."
                },
                ...prepared.parts
            ],
            names: prepared.names
        };
    }

    // Send text and attachments through the existing Gemini chat.
    async function sendToChat(chat, message) {
        if (!chat) throw new Error("AI chat session পাওয়া যায়নি।");

        const files = getFiles();

        if (!files.length) {
            return chat.sendMessage(message);
        }

        const prepared = await prepareMessage(message, files);
        const result = await chat.sendMessage(prepared.parts);

        // Clear attachments only after a successful send.
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