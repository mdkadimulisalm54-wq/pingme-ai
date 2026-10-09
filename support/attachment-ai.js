
/* =========================================================
   PingMe AI — Attachment AI Bridge
   Images • PDF • Text Files • Multiple Attachments
   ========================================================= */

(() => {
    "use strict";

    const API_NAME = "PingMeAttachmentAI";

    const TEXT_EXTENSIONS = [
        "txt", "md", "csv", "json", "xml", "html",
        "htm", "css", "js", "ts", "py", "java",
        "c", "cpp", "h", "sql", "log", "yaml",
        "yml", "ini", "rtf"
    ];

    function getFiles() {
        return window.PingMeAttachments?.getFiles?.() || [];
    }

    function hasFiles() {
        return getFiles().length > 0;
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
                    reject(new Error(
                        `Could not read file: ${file.name}`
                    ));
                    return;
                }

                resolve(result.slice(comma + 1));
            };

            reader.onerror = () => reject(
                new Error(`Could not read file: ${file.name}`)
            );

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
                const content = await file.text();

                parts.push({
                    text:
                        `Attachment: ${name}\n` +
                        `Content:\n${content}`
                });

                names.push(name);
                continue;
            }

            throw new Error(
                `এই ফাইলের ফরম্যাট এখনো সাপোর্ট করা হচ্ছে না: ${name}`
            );
        }

        return { parts, names };
    }

    async function prepareMessage(message, files = getFiles()) {
        const result = await prepare(files);

        return {
            parts: [
                {
                    text: String(message || "").trim() ||
                        "Please examine the attached files and help the user."
                },
                ...result.parts
            ],
            names: result.names
        };
    }

    window[API_NAME] = {
        getFiles,
        hasFiles,
        prepare,
        prepareMessage,
        clear() {
            window.PingMeAttachments?.clear?.();
        }
    };

    console.log("PingMe Attachment AI Bridge Connected");
})();
