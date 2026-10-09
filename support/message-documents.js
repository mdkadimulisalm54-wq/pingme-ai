/* =========================================================
   PingMe AI — Message Documents Support
   Compact Document Cards • SVG Icons
   ========================================================= */

(() => {
    "use strict";

    window.PingMeMessageDocuments = {
        render(files, container) {
            if (!Array.isArray(files) || !container) return;

            const documents = files.filter(file =>
                file && !file.type?.startsWith("image/")
            );

            if (!documents.length) return;

            const list = document.createElement("div");
            list.style.cssText =
                "display:flex;flex-direction:row;flex-wrap:wrap;" +
                "align-items:flex-start;gap:6px;max-width:100%;" +
                "margin-top:7px;";

            documents.forEach(file => {
                const card = document.createElement("div");
                card.style.cssText =
                    "display:flex;align-items:center;gap:7px;" +
                    "width:210px;max-width:100%;min-width:0;" +
                    "box-sizing:border-box;padding:7px 9px;" +
                    "border:1px solid #8885;border-radius:9px;";

                const icon = document.createElement("span");
                icon.style.cssText =
                    "display:flex;align-items:center;flex:0 0 20px;" +
                    "opacity:.8;";

                icon.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor"
                         stroke-width="1.6" stroke-linecap="round"
                         stroke-linejoin="round" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <path d="M14 2v6h6M8 13h8M8 17h6"/>
                    </svg>`;

                const info = document.createElement("div");
                info.style.cssText =
                    "min-width:0;flex:1;overflow:hidden;";

                const name = document.createElement("div");
                name.textContent = file.name || "Document";
                name.title = file.name || "Document";
                name.style.cssText =
                    "font-size:12px;line-height:1.4;" +
                    "white-space:nowrap;overflow:hidden;" +
                    "text-overflow:ellipsis;";

                const size = document.createElement("div");
                size.textContent = file.size < 1048576
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : `${(file.size / 1048576).toFixed(1)} MB`;

                size.style.cssText =
                    "font-size:11px;opacity:.65;margin-top:2px;";

                info.append(name, size);
                card.append(icon, info);
                list.appendChild(card);
            });

            container.appendChild(list);
        }
    };
})();