/* =========================================================
   PINGME AI — IMAGES SUPPORT
   Trending • Templates • My Images
   Image Generation Integration • Preview • Download
   ========================================================= */

(() => {
    "use strict";

    if (window.PingMeImages?.__initialized) return;

    const STORAGE_KEY = "pingme_generated_images";
    const STYLE_ID = "pingme-images-support-style";
    const ROOT_ID = "pingme-images-root";

    let root = null;
    let activeTab = "trending";
    let activeDialog = null;
    let currentPreview = null;
    let escapeHandler = null;

    const templates = [
        {
            title: "Cinematic Portrait",
            category: "Portrait",
            prompt: "Create a cinematic, ultra-realistic portrait with dramatic lighting, natural skin texture, shallow depth of field and professional photography."
        },
        {
            title: "Dream Landscape",
            category: "Nature",
            prompt: "Create a breathtaking fantasy landscape with majestic mountains, a beautiful sky, atmospheric lighting and highly detailed scenery."
        },
        {
            title: "Product Photography",
            category: "Product",
            prompt: "Create premium commercial product photography with soft studio lighting, a clean background, realistic shadows and elegant composition."
        },
        {
            title: "Anime Character",
            category: "Anime",
            prompt: "Create a beautifully detailed anime character with expressive eyes, polished artwork, cinematic lighting and a vibrant background."
        },
        {
            title: "Futuristic City",
            category: "Sci-Fi",
            prompt: "Create a futuristic cyberpunk city at night with neon lights, atmospheric fog, reflective streets and cinematic composition."
        },
        {
            title: "Minimal Wallpaper",
            category: "Wallpaper",
            prompt: "Create an elegant minimalist wallpaper with harmonious colors, beautiful gradients, clean composition and high visual quality."
        }
    ];

    const trending = [
        {
            title: "Cinematic World",
            category: "Cinematic",
            prompt: "Create an epic cinematic scene with atmospheric lighting, realistic details, rich colors and a professional movie-like composition."
        },
        {
            title: "Nature Dreams",
            category: "Nature",
            prompt: "Create a photorealistic natural landscape with golden-hour sunlight, beautiful atmospheric depth and intricate details."
        },
        {
            title: "Digital Art",
            category: "Digital Art",
            prompt: "Create stunning digital artwork with imaginative details, balanced colors, sophisticated lighting and a polished artistic finish."
        },
        {
            title: "Luxury Design",
            category: "Design",
            prompt: "Create a luxurious, modern visual design with elegant composition, premium materials, sophisticated lighting and realistic details."
        }
    ];

    /* =====================================================
       HELPERS
       ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getSavedImages() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    }

    function saveImages(images) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
            return true;
        } catch (error) {
            console.warn("PingMe Images: Could not save image history.", error);
            return false;
        }
    }

    function getImageURL(item) {
        if (typeof item === "string") return item;

        if (!item || typeof item !== "object") return "";

        return (
            item.url ||
            item.imageUrl ||
            item.image_url ||
            item.src ||
            item.dataUrl ||
            item.dataURL ||
            item.image ||
            ""
        );
    }

    function getImagePrompt(item) {
        if (typeof item === "string") return "";

        return item?.prompt || item?.description || "";
    }

    function notify(message) {
        let toast = document.getElementById("pingme-images-toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "pingme-images-toast";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add("is-visible");

        clearTimeout(toast._hideTimer);

        toast._hideTimer = setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 2600);
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            #${ROOT_ID} {
                --pi-bg: var(--background, var(--bg-primary, #ffffff));
                --pi-text: var(--text-primary, #171717);
                --pi-muted: var(--text-secondary, #737373);
                --pi-border: var(--border-color, #e5e5e5);
                --pi-card: var(--surface-color, #f7f7f7);
                color: var(--pi-text);
                width: 100%;
                min-width: 0;
                font-family: inherit;
            }

            #${ROOT_ID} *,
            #pingme-images-dialog *,
            #pingme-images-preview-dialog * {
                box-sizing: border-box;
            }

            #${ROOT_ID} button,
            #pingme-images-dialog button,
            #pingme-images-preview-dialog button {
                font: inherit;
            }

            #${ROOT_ID} button {
                cursor: pointer;
            }

            #${ROOT_ID} .pi-page {
                width: 100%;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }

            #${ROOT_ID} .pi-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
                margin-bottom: 24px;
            }

            #${ROOT_ID} .pi-heading {
                font-size: 25px;
                font-weight: 750;
                letter-spacing: -0.7px;
                margin: 0;
            }

            #${ROOT_ID} .pi-subtitle {
                margin: 7px 0 0;
                color: var(--pi-muted);
                font-size: 14px;
                line-height: 1.5;
            }

            #${ROOT_ID} .pi-primary,
            #${ROOT_ID} .pi-secondary {
                min-height: 42px;
                padding: 10px 16px;
                border-radius: 13px;
                border: 1px solid var(--pi-border);
                font-weight: 650;
                font-size: 13px;
                cursor: pointer;
            }

            #${ROOT_ID} .pi-primary {
                background: var(--text-primary, #171717);
                color: var(--button-text, #fff);
                border-color: transparent;
            }

            #${ROOT_ID} .pi-secondary {
                background: var(--pi-bg);
                color: var(--pi-text);
            }

            #${ROOT_ID} .pi-hero {
                position: relative;
                overflow: hidden;
                padding: 30px;
                min-height: 215px;
                border-radius: 23px;
                margin-bottom: 28px;
                background:
                    radial-gradient(ellipse at 85% 20%, rgba(190, 170, 255, .65), transparent 38%),
                    radial-gradient(ellipse at 10% 100%, rgba(116, 191, 255, .35), transparent 42%),
                    linear-gradient(125deg, #eee9ff, #f4f0ff 48%, #e9f4ff);
                color: #17152a;
            }

            #${ROOT_ID} .pi-hero h2 {
                font-size: clamp(23px, 4vw, 34px);
                line-height: 1.2;
                letter-spacing: -1px;
                max-width: 470px;
                margin: 0 0 12px;
            }

            #${ROOT_ID} .pi-hero p {
                max-width: 430px;
                color: #514d67;
                line-height: 1.65;
                font-size: 14px;
                margin: 0 0 20px;
            }

            #${ROOT_ID} .pi-hero .pi-primary {
                background: #201a38;
                color: white;
            }

            #${ROOT_ID} .pi-section-heading {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                margin: 25px 0 15px;
            }

            #${ROOT_ID} .pi-section-heading h3 {
                font-size: 18px;
                margin: 0;
                font-weight: 750;
            }

            #${ROOT_ID} .pi-tabs {
                display: flex;
                align-items: center;
                gap: 7px;
                overflow-x: auto;
                margin: 0 0 20px;
                padding-bottom: 4px;
            }

            #${ROOT_ID} .pi-tab {
                flex-shrink: 0;
                border: 1px solid transparent;
                background: transparent;
                color: var(--pi-muted);
                border-radius: 12px;
                padding: 10px 15px;
                font-size: 13px;
                font-weight: 650;
            }

            #${ROOT_ID} .pi-tab.is-active {
                background: var(--pi-card);
                color: var(--pi-text);
                border-color: var(--pi-border);
            }

            #${ROOT_ID} .pi-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 16px;
            }

            #${ROOT_ID} .pi-card {
                min-width: 0;
                overflow: hidden;
                border: 1px solid var(--pi-border);
                background: var(--pi-bg);
                border-radius: 17px;
            }

            #${ROOT_ID} .pi-card-image {
                width: 100%;
                aspect-ratio: 4 / 3;
                display: block;
                object-fit: cover;
                background: var(--pi-card);
            }

            #${ROOT_ID} .pi-card-placeholder {
                aspect-ratio: 4 / 3;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 18px;
                text-align: center;
                color: var(--pi-muted);
                background:
                    radial-gradient(ellipse at top right, #e8ddff, transparent 65%),
                    var(--pi-card);
                font-size: 13px;
            }

            #${ROOT_ID} .pi-card-body {
                padding: 13px;
            }

            #${ROOT_ID} .pi-card-title {
                font-size: 14px;
                font-weight: 700;
                margin: 0 0 6px;
                overflow-wrap: anywhere;
            }

            #${ROOT_ID} .pi-card-meta {
                color: var(--pi-muted);
                font-size: 12px;
                margin: 0 0 12px;
            }

            #${ROOT_ID} .pi-card-actions {
                display: flex;
                gap: 7px;
            }

            #${ROOT_ID} .pi-card-actions button {
                flex: 1;
                min-width: 0;
                border: 1px solid var(--pi-border);
                background: var(--pi-bg);
                color: var(--pi-text);
                border-radius: 9px;
                padding: 8px 5px;
                font-size: 12px;
                font-weight: 650;
            }

            #${ROOT_ID} .pi-empty {
                border: 1px dashed var(--pi-border);
                border-radius: 18px;
                padding: 45px 20px;
                text-align: center;
                color: var(--pi-muted);
                grid-column: 1 / -1;
            }

            #${ROOT_ID} .pi-empty h3 {
                color: var(--pi-text);
                font-size: 17px;
                margin: 0 0 8px;
            }

            #${ROOT_ID} .pi-empty p {
                font-size: 13px;
                line-height: 1.6;
                margin: 0 0 17px;
            }

            #pingme-images-dialog,
            #pingme-images-preview-dialog {
                position: fixed;
                inset: 0;
                z-index: 100100;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 18px;
                background: rgba(0, 0, 0, .58);
                backdrop-filter: blur(7px);
            }

            #pingme-images-dialog .pi-dialog,
            #pingme-images-preview-dialog .pi-preview-dialog {
                width: min(100%, 760px);
                max-height: min(92vh, 900px);
                overflow: auto;
                background: var(--background, var(--bg-primary, #fff));
                color: var(--text-primary, #171717);
                border: 1px solid var(--border-color, #e5e5e5);
                border-radius: 21px;
                box-shadow: 0 25px 90px rgba(0, 0, 0, .24);
            }

            #pingme-images-dialog .pi-dialog-header {
                position: sticky;
                top: 0;
                z-index: 3;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 17px 20px;
                border-bottom: 1px solid var(--border-color, #e5e5e5);
                background: var(--background, var(--bg-primary, #fff));
            }

            #pingme-images-dialog .pi-dialog-header h2 {
                font-size: 17px;
                font-weight: 750;
                margin: 0;
            }

            #pingme-images-dialog .pi-close,
            #pingme-images-preview-dialog .pi-close {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 38px;
                height: 38px;
                border-radius: 12px;
                border: 1px solid var(--border-color, #e5e5e5);
                background: transparent;
                color: inherit;
                font-size: 23px;
                cursor: pointer;
            }

            #pingme-images-dialog .pi-generator-host {
                padding: 18px;
                min-height: 180px;
            }

            #pingme-images-dialog .pi-generator-host > * {
                max-width: 100%;
            }

            #pingme-images-dialog .pi-generator-fallback {
                padding: 20px 5px;
                text-align: center;
                color: var(--text-secondary, #737373);
                line-height: 1.7;
                font-size: 14px;
            }

            #pingme-images-preview-dialog .pi-preview-dialog {
                position: relative;
                width: min(100%, 900px);
                padding: 15px;
            }

            #pingme-images-preview-dialog .pi-preview-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            }

            #pingme-images-preview-dialog .pi-preview-image {
                display: block;
                max-width: 100%;
                max-height: 68vh;
                object-fit: contain;
                margin: 0 auto;
                border-radius: 12px;
            }

            #pingme-images-preview-dialog .pi-preview-prompt {
                color: var(--text-secondary, #737373);
                font-size: 13px;
                line-height: 1.6;
                margin: 12px 0;
                overflow-wrap: anywhere;
            }

            #pingme-images-preview-dialog .pi-preview-actions {
                display: flex;
                justify-content: flex-end;
                gap: 9px;
                flex-wrap: wrap;
            }

            #pingme-images-preview-dialog .pi-preview-actions button {
                border: 1px solid var(--border-color, #e5e5e5);
                background: transparent;
                color: inherit;
                padding: 10px 14px;
                border-radius: 11px;
                cursor: pointer;
            }

            #pingme-images-toast {
                position: fixed;
                left: 50%;
                bottom: 25px;
                z-index: 100200;
                max-width: calc(100vw - 30px);
                transform: translate(-50%, 12px);
                opacity: 0;
                pointer-events: none;
                background: #202020;
                color: white;
                padding: 12px 17px;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,.2);
                font-size: 13px;
                transition: opacity .2s ease, transform .2s ease;
            }

            #pingme-images-toast.is-visible {
                opacity: 1;
                transform: translate(-50%, 0);
            }

            @media (max-width: 850px) {
                #${ROOT_ID} .pi-grid {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
            }

            @media (max-width: 600px) {
                #${ROOT_ID} .pi-page {
                    padding: 14px;
                }

                #${ROOT_ID} .pi-header {
                    align-items: flex-start;
                }

                #${ROOT_ID} .pi-heading {
                    font-size: 23px;
                }

                #${ROOT_ID} .pi-hero {
                    padding: 23px 20px;
                    min-height: 200px;
                    border-radius: 19px;
                }

                #${ROOT_ID} .pi-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 11px;
                }

                #${ROOT_ID} .pi-card-body {
                    padding: 10px;
                }

                #${ROOT_ID} .pi-card-actions button {
                    font-size: 11px;
                }

                #pingme-images-dialog,
                #pingme-images-preview-dialog {
                    padding: 8px;
                }

                #pingme-images-dialog .pi-dialog {
                    max-height: 96vh;
                    border-radius: 17px;
                }

                #pingme-images-dialog .pi-generator-host {
                    padding: 12px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #pingme-images-toast {
                    transition: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       PAGE INITIALIZATION
       ===================================================== */

    function init(container) {
        addStyles();

        if (container && container.nodeType === 1) {
            root = container;
        } else {
            root =
                document.getElementById(ROOT_ID) ||
                document.querySelector("[data-pingme-images-page]");
        }

        if (!root) {
            root = document.createElement("div");
            root.id = ROOT_ID;
            document.body.appendChild(root);
        }

        root.id = ROOT_ID;
        root.innerHTML = `
            <div class="pi-page">
                <header class="pi-header">
                    <div>
                        <h1 class="pi-heading">Images</h1>
                        <p class="pi-subtitle">Create, explore and manage AI images.</p>
                    </div>
                    <button class="pi-primary" type="button" data-pi-generate>
                        + Create image
                    </button>
                </header>

                <section class="pi-hero">
                    <h2>Bring your ideas to life.</h2>
                    <p>
                        Turn your imagination into images. Describe what you
                        want to see and create something unique.
                    </p>
                    <button class="pi-primary" type="button" data-pi-generate>
                        Create an image
                    </button>
                </section>

                <nav class="pi-tabs" aria-label="Image collections">
                    <button class="pi-tab" type="button" data-pi-tab="trending">
                        Trending
                    </button>
                    <button class="pi-tab" type="button" data-pi-tab="templates">
                        Templates
                    </button>
                    <button class="pi-tab" type="button" data-pi-tab="mine">
                        My Images
                    </button>
                </nav>

                <div class="pi-content" aria-live="polite"></div>
            </div>
        `;

        root.querySelectorAll("[data-pi-generate]").forEach(button => {
            button.addEventListener("click", () => openGenerateDialog());
        });

        root.querySelectorAll("[data-pi-tab]").forEach(button => {
            button.addEventListener("click", () => {
                activeTab = button.dataset.piTab;
                renderPage();
            });
        });

        renderPage();
        return root;
    }

    function open() {
        if (!root || !root.isConnected) init();
        root.hidden = false;
        renderPage();
        return root;
    }

    function close() {
        if (root) root.hidden = true;
        closeGenerateDialog();
        closePreview();
    }

    /* =====================================================
       PAGE CONTENT
       ===================================================== */

    function renderPage() {
        if (!root) return;

        root.querySelectorAll("[data-pi-tab]").forEach(button => {
            button.classList.toggle(
                "is-active",
                button.dataset.piTab === activeTab
            );
        });

        const content = root.querySelector(".pi-content");
        if (!content) return;

        if (activeTab === "mine") {
            renderMyImages(content);
            return;
        }

        if (activeTab === "templates") {
            renderPresetCards(content, templates, "Templates");
            return;
        }

        renderPresetCards(content, trending, "Trending now");
    }

    function renderPresetCards(container, items, heading) {
        container.innerHTML = `
            <div class="pi-section-heading">
                <h3>${escapeHTML(heading)}</h3>
            </div>
            <div class="pi-grid">
                ${items.map((item, index) => `
                    <article class="pi-card">
                        <div class="pi-card-placeholder">
                            <span>${escapeHTML(item.category)}</span>
                        </div>
                        <div class="pi-card-body">
                            <h4 class="pi-card-title">${escapeHTML(item.title)}</h4>
                            <p class="pi-card-meta">AI image prompt</p>
                            <div class="pi-card-actions">
                                <button type="button"
                                    data-pi-use-prompt="${index}">
                                    Use prompt
                                </button>
                            </div>
                        </div>
                    </article>
                `).join("")}
            </div>
        `;

        container.querySelectorAll("[data-pi-use-prompt]").forEach(button => {
            button.addEventListener("click", () => {
                const item = items[Number(button.dataset.piUsePrompt)];
                if (item) openGenerateDialog(item.prompt);
            });
        });
    }

    function renderMyImages(container) {
        const images = getSavedImages();

        container.innerHTML = `
            <div class="pi-section-heading">
                <h3>My Images</h3>
                <span style="color:var(--pi-muted);font-size:13px">
                    ${images.length} ${images.length === 1 ? "image" : "images"}
                </span>
            </div>
            <div class="pi-grid" data-pi-gallery></div>
        `;

        const gallery = container.querySelector("[data-pi-gallery]");

        if (!images.length) {
            gallery.innerHTML = `
                <div class="pi-empty">
                    <h3>Your images will appear here</h3>
                    <p>Generate an image to start building your collection.</p>
                    <button class="pi-primary" type="button" data-pi-empty-generate>
                        Create an image
                    </button>
                </div>
            `;

            gallery.querySelector("[data-pi-empty-generate]")
                .addEventListener("click", () => openGenerateDialog());

            return;
        }

        gallery.innerHTML = images.map((item, index) => {
            const url = getImageURL(item);
            const prompt = getImagePrompt(item);

            return `
                <article class="pi-card">
                    ${
                        url
                            ? `<img class="pi-card-image"
                                src="${escapeHTML(url)}"
                                alt="${escapeHTML(prompt || "Generated image")}"
                                loading="lazy"
                                data-pi-image="${index}">`
                            : `<div class="pi-card-placeholder">Image unavailable</div>`
                    }
                    <div class="pi-card-body">
                        <h4 class="pi-card-title">
                            ${escapeHTML(prompt || "Generated image")}
                        </h4>
                        <div class="pi-card-actions">
                            <button type="button" data-pi-preview="${index}">
                                Preview
                            </button>
                            <button type="button" data-pi-delete="${index}">
                                Delete
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        gallery.querySelectorAll("[data-pi-preview]").forEach(button => {
            button.addEventListener("click", () => {
                const item = getSavedImages()[Number(button.dataset.piPreview)];
                if (item) openPreview(item);
            });
        });

        gallery.querySelectorAll("[data-pi-image]").forEach(image => {
            image.addEventListener("click", () => {
                const item = getSavedImages()[Number(image.dataset.piImage)];
                if (item) openPreview(item);
            });

            image.style.cursor = "pointer";
        });

        gallery.querySelectorAll("[data-pi-delete]").forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.piDelete);
                const images = getSavedImages();

                if (index < 0 || index >= images.length) return;

                images.splice(index, 1);
                saveImages(images);
                renderPage();
                notify("Image removed from My Images.");
            });
        });
    }

    /* =====================================================
       GENERATOR DIALOG
       ===================================================== */

    function openGenerateDialog(prefillPrompt = "") {
        closeGenerateDialog();
        addStyles();

        const dialog = document.createElement("div");
        dialog.id = "pingme-images-dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("aria-label", "Create an image");

        dialog.innerHTML = `
            <section class="pi-dialog">
                <header class="pi-dialog-header">
                    <h2>Create an image</h2>
                    <button class="pi-close" type="button"
                        data-pi-dialog-close aria-label="Close">×</button>
                </header>
                <div class="pi-generator-host" data-pi-generator-host>
                    <div class="pi-generator-fallback">
                        Loading image generator…
                    </div>
                </div>
            </section>
        `;

        document.body.appendChild(dialog);
        activeDialog = dialog;

        dialog.querySelector("[data-pi-dialog-close]")
            .addEventListener("click", closeGenerateDialog);

        dialog.addEventListener("click", event => {
            if (event.target === dialog) closeGenerateDialog();
        });

        escapeHandler = event => {
            if (event.key === "Escape") closeGenerateDialog();
        };

        document.addEventListener("keydown", escapeHandler);

        const host = dialog.querySelector("[data-pi-generator-host]");
        const generator = window.PingMeImageGeneration;

        if (!generator) {
            host.innerHTML = `
                <div class="pi-generator-fallback">
                    <p>The image generator has not loaded yet.</p>
                    <p>Check that <code>support/image-generation.js</code>
                    is included in your page.</p>
                </div>
            `;
            return;
        }

        try {
            host.innerHTML = "";

            const mountFunction = generator.mount || generator.render;

            if (typeof mountFunction !== "function") {
                throw new Error("The generator does not expose mount() or render().");
            }

            mountFunction.call(generator, host, {
                endpoint: "/api/images",
                onGenerated: handleGeneratedImage,
                onImageGenerated: handleGeneratedImage,
                onComplete: handleGeneratedImage
            });

            if (prefillPrompt) {
                requestAnimationFrame(() => {
                    const promptField = host.querySelector(
                        'textarea, input[name="prompt"], input[placeholder*="Describe" i]'
                    );

                    if (promptField) {
                        promptField.value = prefillPrompt;
                        promptField.dispatchEvent(
                            new Event("input", { bubbles: true })
                        );
                        promptField.dispatchEvent(
                            new Event("change", { bubbles: true })
                        );
                    }
                });
            }
        } catch (error) {
            console.error("PingMe Images generator error:", error);

            host.innerHTML = `
                <div class="pi-generator-fallback">
                    <p>Could not open the image generator.</p>
                    <p>${escapeHTML(error.message || "Unknown error")}</p>
                    <button class="pi-secondary" type="button"
                        data-pi-generator-retry>Try again</button>
                </div>
            `;

            host.querySelector("[data-pi-generator-retry]")
                ?.addEventListener("click", () => {
                    closeGenerateDialog();
                    openGenerateDialog(prefillPrompt);
                });
        }
    }

    function closeGenerateDialog() {
        if (activeDialog) {
            activeDialog.remove();
            activeDialog = null;
        }

        if (escapeHandler) {
            document.removeEventListener("keydown", escapeHandler);
            escapeHandler = null;
        }
    }

    /* =====================================================
       GENERATED IMAGE HISTORY
       ===================================================== */

    function handleGeneratedImage(result) {
        if (!result) return;

        const candidates = Array.isArray(result)
            ? result
            : Array.isArray(result.images)
                ? result.images
                : [result];

        let added = 0;
        const saved = getSavedImages();

        candidates.forEach(candidate => {
            const url = getImageURL(candidate);
            if (!url) return;

            saved.unshift({
                url,
                prompt: getImagePrompt(candidate),
                createdAt: Date.now()
            });

            added++;
        });

        if (added) {
            saveImages(saved.slice(0, 100));

            if (activeTab === "mine") renderPage();

            notify(added === 1
                ? "Image added to My Images."
                : `${added} images added to My Images.`);
        }
    }

    // Support generator versions that announce generated images via events.
    [
        "pingme:image-generated",
        "pingme:image-generated-complete",
        "pingme-image-generated",
        "pingme:images-generated"
    ].forEach(eventName => {
        window.addEventListener(eventName, event => {
            handleGeneratedImage(event.detail);
        });
    });

    /* =====================================================
       IMAGE PREVIEW AND DOWNLOAD
       ===================================================== */

    function openPreview(item) {
        closePreview();

        const url = getImageURL(item);
        if (!url) {
            notify("This image is unavailable.");
            return;
        }

        const dialog = document.createElement("div");
        dialog.id = "pingme-images-preview-dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");

        dialog.innerHTML = `
            <section class="pi-preview-dialog">
                <div class="pi-preview-top">
                    <strong>Image preview</strong>
                    <button class="pi-close" type="button"
                        data-pi-preview-close aria-label="Close">×</button>
                </div>
                <img class="pi-preview-image"
                    src="${escapeHTML(url)}"
                    alt="${escapeHTML(getImagePrompt(item) || "Generated image")}">
                <p class="pi-preview-prompt">
                    ${escapeHTML(getImagePrompt(item))}
                </p>
                <div class="pi-preview-actions">
                    <button type="button" data-pi-download>Download image</button>
                    <button type="button" data-pi-preview-done>Done</button>
                </div>
            </section>
        `;

        document.body.appendChild(dialog);
        currentPreview = dialog;

        dialog.querySelector("[data-pi-preview-close]")
            .addEventListener("click", closePreview);

        dialog.querySelector("[data-pi-preview-done]")
            .addEventListener("click", closePreview);

        dialog.querySelector("[data-pi-download]")
            .addEventListener("click", () => downloadImage(url));

        dialog.addEventListener("click", event => {
            if (event.target === dialog) closePreview();
        });
    }

    function closePreview() {
        if (currentPreview) {
            currentPreview.remove();
            currentPreview = null;
        }
    }

    async function downloadImage(url) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Image download failed.");
            }

            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = objectURL;
            link.download = `pingme-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(objectURL), 1500);
        } catch (error) {
            // A cross-origin URL may not allow fetch; try opening it directly.
            const link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.download = `pingme-image-${Date.now()}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.PingMeImages = {
        __initialized: true,
        init,
        open,
        close,
        openGenerateDialog,
        closeGenerateDialog,
        openPreview,
        saveImage(item) {
            handleGeneratedImage(item);
        },
        getImages() {
            return getSavedImages();
        },
        refresh() {
            renderPage();
        }
    };

    // Initialize automatically if an Images page already exists.
    const existingRoot =
        document.getElementById(ROOT_ID) ||
        document.querySelector("[data-pingme-images-page]");

    if (existingRoot) init(existingRoot);

})();