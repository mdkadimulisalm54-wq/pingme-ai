/* =========================================================
   PingMe AI — Message Documents Support
   ========================================================= */

(() => {
    "use strict";

    window.PingMeMessageDocuments = {
        render(files, container) {
            if (!Array.isArray(files) || !container) return;

            files.forEach(file => {
                if (!file || file.type?.startsWith("image/")) return;

                const card = document.createElement("div");
                card.style.cssText =
                    "display:flex;align-items:center;gap:10px;" +
                    "max-width:100%;margin-top:8px;padding:10px;" +
                    "border:1px solid #8885;border-radius:10px;";

                const icon = document.createElement("span");
                icon.textContent = "📄";

                const info = document.createElement("div");
                info.style.cssText = "min-width:0;";

                const name = document.createElement("div");
                name.textContent = file.name || "Document";
                name.style.cssText =
                    "overflow-wrap:anywhere;font-size:14px;";

                const size = document.createElement("div");
                size.textContent = file.size < 1048576
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : `${(file.size / 1048576).toFixed(1)} MB`;

                size.style.cssText =
                    "font-size:12px;opacity:.7;margin-top:3px;";

                info.append(name, size);
                card.append(icon, info);
                container.appendChild(card);
            });
        }
    };
})();