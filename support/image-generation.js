
/* =========================================================
   PINGME AI — IMAGE GENERATION SUPPORT
   File: support/image-generation.js

   Features:
   • Animated dot-mesh generation screen
   • Rotating English status messages
   • Animated progress percentage
   • Image preview and download
   • Prompt input and generation controls
   • Image editing through future API connector
   • Image history stored locally
   • Responsive light/dark styling
   • No dependency on external libraries

   NOTE:
   Connect a real image-generation API using
   PingMeImageGeneration.setGenerator() when ready.
   ========================================================= */

(() => {
    "use strict";

    if (window.PingMeImageGeneration) return;

    const VERSION = "1.0.0";
    const STYLE_ID = "pingme-image-generation-styles";
    const ROOT_ID = "pingme-image-generation-root";
    const HISTORY_KEY = "pingme_image_generation_history";
    const MAX_HISTORY = 30;

    const state = {
        root: null,
        prompt: "",
        statusIndex: 0,
        progress: 0,
        phase: "idle",
        timer: null,
        statusTimer: null,
        generator: null,
        requestId: 0,
        history: [],
        lastImage: null,
        lastError: "",
        dark: false
    };

    const STATUS_MESSAGES = [
        {
            title: "Sketching it out",
            detail: "Understanding your idea..."
        },
        {
            title: "Imagining your vision",
            detail: "Planning the image composition..."
        },
        {
            title: "Creating the image",
            detail: "Building shapes and details..."
        },
        {
            title: "Adding fine details",
            detail: "Refining textures and lighting..."
        },
        {
            title: "Bringing it to life",
            detail: "Enhancing depth and clarity..."
        },
        {
            title: "Perfecting the colors",
            detail: "Adjusting colors and lighting..."
        },
        {
            title: "Almost there",
            detail: "Polishing the final details..."
        },
        {
            title: "Finalizing your image",
            detail: "Preparing your image..."
        }
    ];

    /* =====================================================
       UTILITIES
       ===================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    function makeId() {
        return "pingme-img-" +
            Date.now().toString(36) + "-" +
            Math.random().toString(36).slice(2, 9);
    }

    function readHistory() {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            const parsed = saved ? JSON.parse(saved) : [];

            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem(
                HISTORY_KEY,
                JSON.stringify(state.history.slice(0, MAX_HISTORY))
            );
        } catch (error) {
            console.warn(
                "[PingMe Image Generation] History could not be saved.",
                error
            );
        }
    }

    function emit(name, detail = {}) {
        document.dispatchEvent(
            new CustomEvent("pingme:image-generation:" + name, {
                detail
            })
        );
    }

    function clearTimers() {
        if (state.timer !== null) {
            clearInterval(state.timer);
            state.timer = null;
        }

        if (state.statusTimer !== null) {
            clearInterval(state.statusTimer);
            state.statusTimer = null;
        }
    }

    function getRoot() {
        return state.root;
    }

    /* =====================================================
       STYLES
       ===================================================== */

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            #${ROOT_ID} {
                --pmig-bg: #ffffff;
                --pmig-text: #202124;
                --pmig-muted: #858993;
                --pmig-blue: #537bd7;
                --pmig-line: #e9edf5;
                --pmig-card: #ffffff;

                position: relative;
                width: 100%;
                min-width: 0;
                color: var(--pmig-text);
                background: var(--pmig-bg);
                font-family: inherit;
                box-sizing: border-box;
                isolation: isolate;
            }

            #${ROOT_ID} *,
            #${ROOT_ID} *::before,
            #${ROOT_ID} *::after {
                box-sizing: border-box;
            }

            #${ROOT_ID}.pmig-dark {
                --pmig-bg: #17181b;
                --pmig-text: #f1f2f4;
                --pmig-muted: #a1a5af;
                --pmig-blue: #91adff;
                --pmig-line: #33353b;
                --pmig-card: #22242a;
            }

            #${ROOT_ID} .pmig-screen {
                width: 100%;
                padding: 20px 16px 26px;
            }

            #${ROOT_ID} .pmig-heading {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 14px;
            }

            #${ROOT_ID} .pmig-title {
                margin: 0;
                font-size: 16px;
                font-weight: 500;
                line-height: 1.5;
                color: var(--pmig-muted);
                overflow-wrap: anywhere;
            }

            #${ROOT_ID} .pmig-stage {
                position: relative;
                width: 100%;
                height: clamp(290px, 72vw, 610px);
                min-height: 290px;
                max-height: 610px;
                overflow: hidden;
                border-radius: 14px;
                background: var(--pmig-bg);
                isolation: isolate;
            }

            #${ROOT_ID} .pmig-mesh {
                position: absolute;
                inset: 3% 1% 4%;
                overflow: hidden;
                pointer-events: none;
                -webkit-mask-image:
                    radial-gradient(ellipse at center,
                        #000 15%, rgba(0,0,0,.92) 43%,
                        transparent 76%);
                mask-image:
                    radial-gradient(ellipse at center,
                        #000 15%, rgba(0,0,0,.92) 43%,
                        transparent 76%);
            }

            #${ROOT_ID} .pmig-dot {
                position: absolute;
                left: var(--x);
                top: var(--y);
                width: var(--size);
                height: var(--size);
                border-radius: 50%;
                background: var(--pmig-blue);
                opacity: var(--opacity);
                transform: translate(-50%, -50%);
                animation: pmig-wave var(--duration) ease-in-out
                    var(--delay) infinite alternate;
                will-change: transform, opacity;
            }

            @keyframes pmig-wave {
                0% {
                    transform: translate(
                        calc(-50% + var(--dx1)),
                        calc(-50% + var(--dy1))
                    ) scale(.78);
                    opacity: var(--opacity);
                }

                50% {
                    opacity: calc(var(--opacity) + .15);
                }

                100% {
                    transform: translate(
                        calc(-50% + var(--dx2)),
                        calc(-50% + var(--dy2))
                    ) scale(1.28);
                    opacity: var(--opacity);
                }
            }

            #${ROOT_ID} .pmig-progress-pill {
                position: absolute;
                right: 7%;
                bottom: 7%;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 82px;
                min-height: 48px;
                padding: 10px 17px;
                color: var(--pmig-blue);
                background: var(--pmig-card);
                border: 1px solid var(--pmig-line);
                border-radius: 999px;
                box-shadow: 0 5px 22px rgba(20, 35, 70, .06);
                font-size: 17px;
                font-weight: 500;
                font-variant-numeric: tabular-nums;
            }

            #${ROOT_ID} .pmig-result {
                display: none;
                width: 100%;
                margin-top: 16px;
            }

            #${ROOT_ID} .pmig-result.pmig-visible {
                display: block;
                animation: pmig-appear .32s ease both;
            }

            #${ROOT_ID} .pmig-result-image {
                display: block;
                width: 100%;
                max-height: 75vh;
                object-fit: contain;
                border-radius: 14px;
                background: var(--pmig-card);
            }

            @keyframes pmig-appear {
                from {
                    opacity: 0;
                    transform: translateY(8px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            #${ROOT_ID} .pmig-result-actions {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 9px;
                margin-top: 12px;
            }

            #${ROOT_ID} .pmig-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                min-height: 42px;
                padding: 10px 15px;
                border: 1px solid var(--pmig-line);
                border-radius: 999px;
                color: var(--pmig-text);
                background: var(--pmig-card);
                font: inherit;
                font-size: 14px;
                cursor: pointer;
                transition: opacity .2s, background .2s;
            }

            #${ROOT_ID} .pmig-btn:hover {
                opacity: .82;
            }

            #${ROOT_ID} .pmig-btn:disabled {
                opacity: .45;
                cursor: not-allowed;
            }

            #${ROOT_ID} .pmig-btn-primary {
                color: #fff;
                background: #4776df;
                border-color: #4776df;
            }

            #${ROOT_ID} .pmig-composer {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 22px;
                padding: 14px;
                background: var(--pmig-card);
                border: 1px solid var(--pmig-line);
                border-radius: 20px;
            }

            #${ROOT_ID} .pmig-prompt {
                display: block;
                width: 100%;
                min-height: 82px;
                max-height: 220px;
                resize: vertical;
                padding: 5px;
                border: 0;
                outline: none;
                color: var(--pmig-text);
                background: transparent;
                font: inherit;
                font-size: 15px;
                line-height: 1.65;
            }

            #${ROOT_ID} .pmig-prompt::placeholder {
                color: var(--pmig-muted);
            }

            #${ROOT_ID} .pmig-composer-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
            }

            #${ROOT_ID} .pmig-settings {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 8px;
            }

            #${ROOT_ID} .pmig-select {
                max-width: 150px;
                min-height: 38px;
                padding: 7px 10px;
                color: var(--pmig-text);
                background: var(--pmig-card);
                border: 1px solid var(--pmig-line);
                border-radius: 999px;
                font: inherit;
                font-size: 12px;
            }

            #${ROOT_ID} .pmig-message {
                display: none;
                margin-top: 13px;
                padding: 12px 14px;
                border: 1px solid var(--pmig-line);
                border-radius: 12px;
                font-size: 13px;
                line-height: 1.6;
                overflow-wrap: anywhere;
            }

            #${ROOT_ID} .pmig-message.pmig-visible {
                display: block;
            }

            #${ROOT_ID} .pmig-message.pmig-error {
                color: #b42318;
                background: #fff5f4;
                border-color: #ffd7d2;
            }

            #${ROOT_ID} .pmig-message.pmig-info {
                color: var(--pmig-muted);
                background: var(--pmig-card);
            }

            #${ROOT_ID} .pmig-history {
                margin-top: 26px;
            }

            #${ROOT_ID} .pmig-history-heading {
                margin: 0 0 13px;
                font-size: 15px;
                font-weight: 600;
            }

            #${ROOT_ID} .pmig-history-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 9px;
            }

            #${ROOT_ID} .pmig-history-item {
                position: relative;
                overflow: hidden;
                padding: 0;
                aspect-ratio: 1;
                border: 1px solid var(--pmig-line);
                border-radius: 12px;
                background: var(--pmig-card);
                cursor: pointer;
            }

            #${ROOT_ID} .pmig-history-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            #${ROOT_ID} .pmig-history-empty {
                color: var(--pmig-muted);
                font-size: 13px;
                line-height: 1.7;
            }

            #${ROOT_ID} .pmig-sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            @media (min-width: 700px) {
                #${ROOT_ID} .pmig-screen {
                    max-width: 850px;
                    margin-inline: auto;
                    padding: 28px 26px;
                }

                #${ROOT_ID} .pmig-stage {
                    height: min(65vw, 570px);
                }

                #${ROOT_ID} .pmig-history-grid {
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                }
            }

            @media (max-width: 380px) {
                #${ROOT_ID} .pmig-screen {
                    padding-inline: 10px;
                }

                #${ROOT_ID} .pmig-stage {
                    height: 320px;
                }

                #${ROOT_ID} .pmig-progress-pill {
                    min-width: 70px;
                    min-height: 41px;
                    font-size: 15px;
                }

                #${ROOT_ID} .pmig-btn {
                    padding-inline: 12px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #${ROOT_ID} .pmig-dot {
                    animation: none !important;
                }

                #${ROOT_ID} .pmig-result {
                    animation: none !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       ANIMATED DOT MESH
       ===================================================== */

    function createMesh() {
        const dots = document.createDocumentFragment();

        const columns = 25;
        const rows = 25;

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const dot = document.createElement("span");
                dot.className = "pmig-dot";

                const nx = column / (columns - 1);
                const ny = row / (rows - 1);

                const dx = (nx - 0.5) / 0.5;
                const dy = (ny - 0.5) / 0.5;

                const distance = Math.sqrt(dx * dx + dy * dy);
                const center = Math.max(0, 1 - distance / 1.35);

                const size = 2.4 + center * 2.1;
                const opacity = Math.min(
                    0.58,
                    0.12 + center * 0.42
                );

                const seed = (row * 37 + column * 19) % 17;

                dot.style.setProperty("--x", `${nx * 100}%`);
                dot.style.setProperty("--y", `${ny * 100}%`);
                dot.style.setProperty("--size", `${size}px`);
                dot.style.setProperty("--opacity", opacity.toFixed(2));
                dot.style.setProperty(
                    "--duration",
                    `${2.2 + (seed % 7) * 0.35}s`
                );
                dot.style.setProperty(
                    "--delay",
                    `${-((row + column) % 13) * 0.19}s`
                );
                dot.style.setProperty(
                    "--dx1",
                    `${Math.sin(seed) * 2.2}px`
                );
                dot.style.setProperty(
                    "--dy1",
                    `${Math.cos(seed) * 2.2}px`
                );
                dot.style.setProperty(
                    "--dx2",
                    `${Math.cos(seed * 1.4) * 4.5}px`
                );
                dot.style.setProperty(
                    "--dy2",
                    `${Math.sin(seed * 1.2) * 4.5}px`
                );

                dots.appendChild(dot);
            }
        }

        return dots;
    }

    /* =====================================================
       MAIN UI
       ===================================================== */

    function render(container, options = {}) {
        injectStyles();

        if (typeof container === "string") {
            container = document.querySelector(container);
        }

        if (!container) {
            throw new Error(
                "Image generation container was not found."
            );
        }

        state.root = container;

        container.innerHTML = `
            <section
                id="${ROOT_ID}"
                class="${options.dark ? "pmig-dark" : ""}"
                aria-label="PingMe AI Image Generation"
            >
                <div class="pmig-screen">

                    <div class="pmig-heading">
                        <h2 class="pmig-title" data-pmig-title>
                            Sketching it out
                        </h2>
                    </div>

                    <div
                        class="pmig-stage"
                        data-pmig-stage
                        aria-label="Image generation animation"
                    >
                        <div class="pmig-mesh" data-pmig-mesh></div>

                        <div
                            class="pmig-progress-pill"
                            data-pmig-progress
                            aria-live="polite"
                        >0%</div>

                        <span class="pmig-sr-only" data-pmig-live
                            aria-live="polite">
                            Ready to create an image
                        </span>
                    </div>

                    <div class="pmig-result" data-pmig-result>
                        <img
                            class="pmig-result-image"
                            data-pmig-result-image
                            alt="AI-generated image"
                        />

                        <div class="pmig-result-actions">
                            <button
                                type="button"
                                class="pmig-btn pmig-btn-primary"
                                data-pmig-download
                            >Download image</button>

                            <button
                                type="button"
                                class="pmig-btn"
                                data-pmig-again
                            >Create another</button>
                        </div>
                    </div>

                    <div class="pmig-composer">
                        <label class="pmig-sr-only" for="pmig-prompt">
                            Describe the image you want to create
                        </label>

                        <textarea
                            id="pmig-prompt"
                            class="pmig-prompt"
                            data-pmig-prompt
                            maxlength="10000"
                            placeholder="Describe the image you want to create..."
                        ></textarea>

                        <div class="pmig-composer-footer">
                            <div class="pmig-settings">
                                <label class="pmig-sr-only"
                                    for="pmig-style">Image style</label>

                                <select
                                    class="pmig-select"
                                    id="pmig-style"
                                    data-pmig-style
                                >
                                    <option value="realistic">
                                        Photorealistic
                                    </option>
                                    <option value="cinematic">
                                        Cinematic
                                    </option>
                                    <option value="anime">Anime</option>
                                    <option value="3d">3D Art</option>
                                    <option value="illustration">
                                        Illustration
                                    </option>
                                    <option value="logo">Logo</option>
                                    <option value="poster">Poster</option>
                                    <option value="watercolor">
                                        Watercolor
                                    </option>
                                    <option value="custom">Custom</option>
                                </select>

                                <label class="pmig-sr-only"
                                    for="pmig-ratio">Image ratio</label>

                                <select
                                    class="pmig-select"
                                    id="pmig-ratio"
                                    data-pmig-ratio
                                >
                                    <option value="1:1">Square</option>
                                    <option value="3:2">Landscape</option>
                                    <option value="2:3">Portrait</option>
                                    <option value="16:9">Widescreen</option>
                                    <option value="9:16">Vertical</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                class="pmig-btn pmig-btn-primary"
                                data-pmig-generate
                            >
                                <span data-pmig-button-label>
                                    Generate image
                                </span>
                            </button>
                        </div>
                    </div>

                    <div
                        class="pmig-message"
                        data-pmig-message
                        role="status"
                        aria-live="polite"
                    ></div>

                    <section class="pmig-history">
                        <h3 class="pmig-history-heading">My images</h3>
                        <div
                            class="pmig-history-grid"
                            data-pmig-history
                        ></div>
                    </section>
                </div>
            </section>
        `;

        const root = $("#" + ROOT_ID, container);

        $("[data-pmig-mesh]", root).appendChild(createMesh());

        bindEvents(root);
        applyIdleState();
        renderHistory();

        if (options.dark) state.dark = true;

        emit("ready", { version: VERSION });

        return api;
    }

    /* =====================================================
       UI STATE
       ===================================================== */

    function setMessage(message, type = "info") {
        const root = getRoot();
        if (!root) return;

        const el = $("[data-pmig-message]", root);
        if (!el) return;

        el.textContent = message || "";
        el.className = "pmig-message";

        if (message) {
            el.classList.add("pmig-visible", "pmig-" + type);
        }
    }

    function setStatus(index) {
        const root = getRoot();
        if (!root) return;

        const message = STATUS_MESSAGES[
            index % STATUS_MESSAGES.length
        ];

        const title = $("[data-pmig-title]", root);
        const live = $("[data-pmig-live]", root);

        if (title) title.textContent = message.title;

        if (live) {
            live.textContent =
                message.title + ". " + message.detail;
        }

        state.statusIndex = index;

        emit("status", {
            index,
            title: message.title,
            detail: message.detail
        });
    }

    function setProgress(value) {
        const root = getRoot();
        if (!root) return;

        const progress = Math.max(
            0,
            Math.min(100, Math.round(Number(value) || 0))
        );

        state.progress = progress;

        const pill = $("[data-pmig-progress]", root);

        if (pill) pill.textContent = `${progress}%`;

        emit("progress", { progress });
    }

    function applyIdleState() {
        const root = getRoot();
        if (!root) return;

        const result = $("[data-pmig-result]", root);
        const button = $("[data-pmig-generate]", root);
        const label = $("[data-pmig-button-label]", root);
        const mesh = $("[data-pmig-mesh]", root);

        if (result) result.classList.remove("pmig-visible");
        if (mesh) mesh.style.display = "";

        if (button) button.disabled = false;
        if (label) label.textContent = "Generate image";

        setProgress(0);
        setStatus(0);
    }

    function applyLoadingState() {
        const root = getRoot();
        if (!root) return;

        const result = $("[data-pmig-result]", root);
        const button = $("[data-pmig-generate]", root);
        const label = $("[data-pmig-button-label]", root);
        const mesh = $("[data-pmig-mesh]", root);

        if (result) result.classList.remove("pmig-visible");
        if (mesh) mesh.style.display = "";

        if (button) button.disabled = true;
        if (label) label.textContent = "Generating...";

        setMessage("");
        setStatus(0);
        setProgress(1);
    }

    /* =====================================================
       PROGRESS ANIMATION

       This is an estimated visual progress indicator.
       A real API can report actual progress when supported.
       It never automatically reaches 100%.
       ===================================================== */

    function startProgressAnimation() {
        clearTimers();

        state.statusIndex = 0;

        state.statusTimer = setInterval(() => {
            if (state.phase !== "generating") return;

            const next = Math.min(
                STATUS_MESSAGES.length - 1,
                state.statusIndex + 1
            );

            setStatus(next);
        }, 4500);

        state.timer = setInterval(() => {
            if (state.phase !== "generating") return;

            let increment;

            if (state.progress < 20) {
                increment = 1 + Math.random() * 2.0;
            } else if (state.progress < 55) {
                increment = 0.5 + Math.random() * 1.1;
            } else if (state.progress < 78) {
                increment = 0.2 + Math.random() * 0.65;
            } else {
                increment = 0.08 + Math.random() * 0.2;
            }

            setProgress(Math.min(94, state.progress + increment));
        }, 700);
    }

    /* =====================================================
       IMAGE GENERATION CONNECTOR

       Expected generator signature:

       async function generator(request, callbacks) {
           callbacks.onProgress(35);
           callbacks.onStatus("Rendering details...");
           return {
               url: "https://example.com/generated-image.png"
           };
       }

       The connector must be supplied later.
       ===================================================== */

    function setGenerator(generator) {
        if (generator !== null && typeof generator !== "function") {
            throw new TypeError(
                "Generator must be a function or null."
            );
        }

        state.generator = generator;

        emit("connector", {
            connected: typeof generator === "function"
        });

        return api;
    }

    async function start(prompt, settings = {}) {
        const root = getRoot();

        if (!root) {
            throw new Error(
                "Call PingMeImageGeneration.mount() first."
            );
        }

        const cleanPrompt = String(prompt ?? "").trim();

        if (!cleanPrompt) {
            setMessage(
                "Please describe the image you want to create.",
                "error"
            );
            return null;
        }

        if (state.phase === "generating") {
            setMessage(
                "An image is already being generated.",
                "info"
            );
            return null;
        }

        if (typeof state.generator !== "function") {
            setMessage(
                "Image generation is not connected yet. " +
                "Connect an image-generation API to create real images.",
                "info"
            );

            emit("not-connected", { prompt: cleanPrompt });

            return null;
        }

        clearTimers();

        const requestId = ++state.requestId;

        state.prompt = cleanPrompt;
        state.phase = "generating";
        state.lastError = "";

        const style = settings.style ||
            $("[data-pmig-style]", root)?.value ||
            "realistic";

        const ratio = settings.ratio ||
            $("[data-pmig-ratio]", root)?.value ||
            "1:1";

        const request = {
            prompt: cleanPrompt,
            style,
            aspectRatio: ratio,
            requestId,
            options: { ...settings }
        };

        applyLoadingState();
        startProgressAnimation();

        emit("start", request);

        try {
            const result = await state.generator(request, {
                onProgress(value) {
                    if (requestId !== state.requestId) return;

                    const progress = Number(value);

                    if (Number.isFinite(progress)) {
                        setProgress(
                            Math.min(99, Math.max(state.progress, progress))
                        );
                    }
                },

                onStatus(message) {
                    if (requestId !== state.requestId) return;

                    const title = String(message || "").trim();

                    if (!title) return;

                    const root = getRoot();
                    const heading = root &&
                        $("[data-pmig-title]", root);

                    if (heading) heading.textContent = title;

                    emit("status", { title, custom: true });
                }
            });

            if (requestId !== state.requestId) return null;

            const imageUrl = typeof result === "string"
                ? result
                : result && (result.url || result.imageUrl || result.dataUrl);

            if (!imageUrl) {
                throw new Error(
                    "The image service returned no image."
                );
            }

            complete(imageUrl, {
                prompt: cleanPrompt,
                style,
                ratio,
                requestId
            });

            return result;
        } catch (error) {
            if (requestId !== state.requestId) return null;

            fail(error);

            return null;
        }
    }

    /* =====================================================
       COMPLETION
       ===================================================== */

    function complete(imageUrl, metadata = {}) {
        const root = getRoot();
        if (!root) return;

        clearTimers();

        const requestId = metadata.requestId ?? state.requestId;

        if (requestId !== state.requestId) return;

        state.phase = "complete";
        state.lastImage = imageUrl;

        setProgress(100);

        const title = $("[data-pmig-title]", root);
        const mesh = $("[data-pmig-mesh]", root);
        const stage = $("[data-pmig-stage]", root);
        const result = $("[data-pmig-result]", root);
        const resultImage = $("[data-pmig-result-image]", root);
        const button = $("[data-pmig-generate]", root);
        const label = $("[data-pmig-button-label]", root);

        if (title) title.textContent = "Your image is ready";
        if (mesh) mesh.style.display = "none";
        if (stage) stage.style.display = "none";

        if (resultImage) {
            resultImage.src = imageUrl;
            resultImage.alt = metadata.prompt
                ? "Generated image: " + metadata.prompt
                : "AI-generated image";
        }

        if (result) result.classList.add("pmig-visible");

        if (button) button.disabled = false;
        if (label) label.textContent = "Generate image";

        setMessage("Image created successfully.", "info");

        const entry = {
            id: makeId(),
            url: imageUrl,
            prompt: metadata.prompt || state.prompt || "",
            style: metadata.style || "",
            ratio: metadata.ratio || "",
            createdAt: new Date().toISOString()
        };

        state.history.unshift(entry);
        state.history = state.history.slice(0, MAX_HISTORY);

        saveHistory();
        renderHistory();

        emit("complete", entry);
    }

    /* =====================================================
       FAILURE
       ===================================================== */

    function fail(error) {
        clearTimers();

        state.phase = "error";

        const message = error instanceof Error
            ? error.message
            : String(error || "Something went wrong.");

        state.lastError = message;

        const root = getRoot();

        if (root) {
            const stage = $("[data-pmig-stage]", root);
            const button = $("[data-pmig-generate]", root);
            const label = $("[data-pmig-button-label]", root);

            if (stage) stage.style.display = "";
            if (button) button.disabled = false;
            if (label) label.textContent = "Try again";

            setMessage(
                "Image generation failed: " + message,
                "error"
            );
        }

        emit("error", { message });
    }

    /* =====================================================
       RESET
       ===================================================== */

    function reset() {
        clearTimers();

        state.requestId++;
        state.phase = "idle";
        state.progress = 0;
        state.lastError = "";

        const root = getRoot();

        if (!root) return api;

        const stage = $("[data-pmig-stage]", root);
        const result = $("[data-pmig-result]", root);
        const mesh = $("[data-pmig-mesh]", root);

        if (stage) stage.style.display = "";
        if (result) result.classList.remove("pmig-visible");
        if (mesh) mesh.style.display = "";

        setMessage("");
        applyIdleState();

        return api;
    }

    /* =====================================================
       DOWNLOAD
       ===================================================== */

    function downloadImage(url, filename = "pingme-ai-image.png") {
        if (!url) {
            setMessage("There is no image to download.", "error");
            return;
        }

        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = filename;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        emit("download", { url, filename });
    }

    /* =====================================================
       HISTORY
       ===================================================== */

    function renderHistory() {
        const root = getRoot();
        if (!root) return;

        const grid = $("[data-pmig-history]", root);
        if (!grid) return;

        grid.innerHTML = "";

        if (!state.history.length) {
            const empty = document.createElement("p");
            empty.className = "pmig-history-empty";
            empty.textContent =
                "Your generated images will appear here.";

            grid.appendChild(empty);
            return;
        }

        state.history.forEach(item => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "pmig-history-item";
            button.title = item.prompt || "Open generated image";

            const image = document.createElement("img");
            image.src = item.url;
            image.alt = item.prompt || "Generated image";
            image.loading = "lazy";

            button.appendChild(image);

            button.addEventListener("click", () => {
                showHistoryItem(item);
            });

            grid.appendChild(button);
        });
    }

    function showHistoryItem(item) {
        const root = getRoot();
        if (!root || !item) return;

        clearTimers();

        state.phase = "complete";
        state.lastImage = item.url;
        state.prompt = item.prompt || "";

        const prompt = $("[data-pmig-prompt]", root);
        const stage = $("[data-pmig-stage]", root);
        const mesh = $("[data-pmig-mesh]", root);
        const result = $("[data-pmig-result]", root);
        const image = $("[data-pmig-result-image]", root);

        if (prompt) prompt.value = state.prompt;
        if (stage) stage.style.display = "none";
        if (mesh) mesh.style.display = "none";

        if (image) {
            image.src = item.url;
            image.alt = item.prompt || "Generated image";
        }

        if (result) result.classList.add("pmig-visible");

        setMessage("");
        emit("history-open", item);
    }

    function getHistory() {
        return state.history.map(item => ({ ...item }));
    }

    function clearHistory() {
        state.history = [];
        saveHistory();
        renderHistory();

        emit("history-cleared");
    }

    /* =====================================================
       EVENT BINDINGS
       ===================================================== */

    function bindEvents(root) {
        const prompt = $("[data-pmig-prompt]", root);
        const generate = $("[data-pmig-generate]", root);
        const download = $("[data-pmig-download]", root);
        const again = $("[data-pmig-again]", root);

        generate.addEventListener("click", () => {
            start(prompt.value);
        });

        prompt.addEventListener("keydown", event => {
            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.isComposing
            ) {
                event.preventDefault();
                start(prompt.value);
            }
        });

        download.addEventListener("click", () => {
            downloadImage(state.lastImage);
        });

        again.addEventListener("click", () => {
            reset();

            const stage = $("[data-pmig-stage]", root);
            if (stage) {
                stage.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }

            prompt.focus();
        });
    }

    /* =====================================================
       THEME
       ===================================================== */

    function setTheme(theme) {
        const root = getRoot();
        if (!root) return api;

        state.dark = theme === "dark";
        root.classList.toggle("pmig-dark", state.dark);

        emit("theme", { theme: state.dark ? "dark" : "light" });

        return api;
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    const api = {
        version: VERSION,

        mount: render,
        setGenerator,
        start,
        complete,
        fail,
        reset,
        download: downloadImage,
        getHistory,
        clearHistory,
        setTheme,

        getState() {
            return {
                phase: state.phase,
                progress: Math.round(state.progress),
                prompt: state.prompt,
                connected: typeof state.generator === "function",
                lastError: state.lastError
            };
        },

        destroy() {
            clearTimers();

            state.requestId++;

            if (state.root) {
                state.root.innerHTML = "";
            }

            state.root = null;
            state.phase = "idle";

            emit("destroy");
        }
    };

    /* =====================================================
       INITIALIZE
       ===================================================== */

    state.history = readHistory();

    window.PingMeImageGeneration = api;

    injectStyles();

    // Automatically initialize only if a matching container
    // already exists. Otherwise, mount it when the app is ready.
    function autoMount() {
        const container = document.querySelector(
            "[data-pingme-image-generation]"
        );

        if (container && !state.root) {
            render(container);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            autoMount,
            { once: true }
        );
    } else {
        autoMount();
    }

})();
