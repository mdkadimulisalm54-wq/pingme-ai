/* =========================================================
   PINGME AI — IMAGE GENERATION SUPPORT
   File: support/image-generation.js

   Features:
   • Animated English generation status
   • Progress indicator
   • Prompt, style and aspect ratio
   • Image preview and download
   • Image history
   • API connector: POST /api/images
   • Responsive and dark-mode support
   ========================================================= */

(() => {
    "use strict";

    if (window.PingMeImageGeneration) return;

    const VERSION = "2.0.0";
    const ROOT_SELECTOR = "[data-pingme-image-generation]";
    const STYLE_ID = "pingme-image-generation-styles";
    const STORAGE_KEY = "pingme_image_generation_history_v2";
    const MAX_HISTORY = 30;
    const API_ENDPOINT = "/api/images";

    const STATUS_MESSAGES = [
        {
            title: "Understanding your idea",
            detail: "Preparing your prompt for image generation..."
        },
        {
            title: "Imagining your vision",
            detail: "Planning the composition, style, and atmosphere..."
        },
        {
            title: "Creating your image",
            detail: "Building the scene and bringing your idea to life..."
        },
        {
            title: "Adding fine details",
            detail: "Refining textures, shapes, and small details..."
        },
        {
            title: "Perfecting the lighting",
            detail: "Balancing shadows, highlights, and depth..."
        },
        {
            title: "Fine-tuning the colors",
            detail: "Adjusting colors and improving visual clarity..."
        },
        {
            title: "Your image is almost ready",
            detail: "Polishing the final details..."
        },
        {
            title: "Finalizing your image",
            detail: "Preparing your finished image..."
        }
    ];

    const state = {
        root: null,
        prompt: "",
        style: "realistic",
        aspectRatio: "1:1",
        progress: 0,
        statusIndex: 0,
        generating: false,
        history: [],
        lastImage: null,
        lastError: "",
        requestId: 0,
        statusTimer: null,
        progressTimer: null,
        generator: null,
        theme: "auto",
        destroyed: false
    };

    /* =====================================================
       UTILITIES
       ===================================================== */

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    function createId() {
        return Date.now().toString(36) +
            Math.random().toString(36).slice(2, 9);
    }

    function isValidImageURL(value) {
        if (typeof value !== "string") return false;

        const trimmed = value.trim();

        return (
            trimmed.startsWith("data:image/") ||
            trimmed.startsWith("blob:") ||
            /^https?:\/\//i.test(trimmed) ||
            trimmed.startsWith("/")
        );
    }

    function emit(name, detail = {}) {
        if (!state.root) return;

        state.root.dispatchEvent(new CustomEvent(
            "pingme:image-generation:" + name,
            {
                bubbles: true,
                detail
            }
        ));
    }

    function stopTimers() {
        clearInterval(state.statusTimer);
        clearInterval(state.progressTimer);

        state.statusTimer = null;
        state.progressTimer = null;
    }

    function getElement(id) {
        return state.root?.querySelector("#" + id) || null;
    }

    /* =====================================================
       STYLES
       ===================================================== */

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            .pmig {
                --pmig-bg: #ffffff;
                --pmig-card: #f7f8fa;
                --pmig-text: #17191f;
                --pmig-muted: #737782;
                --pmig-border: #e5e7eb;
                --pmig-primary: #3867f4;
                --pmig-primary-soft: #edf2ff;
                width: 100%;
                max-width: 100%;
                color: var(--pmig-text);
                font-family: inherit;
                box-sizing: border-box;
            }

            .pmig *,
            .pmig *::before,
            .pmig *::after {
                box-sizing: border-box;
            }

            .pmig button,
            .pmig textarea,
            .pmig select {
                font: inherit;
            }

            .pmig button {
                cursor: pointer;
            }

            .pmig-header {
                margin-bottom: 20px;
            }

            .pmig-title {
                margin: 0 0 6px;
                font-size: 25px;
                line-height: 1.3;
                font-weight: 700;
                letter-spacing: -0.5px;
            }

            .pmig-subtitle {
                margin: 0;
                color: var(--pmig-muted);
                font-size: 14px;
                line-height: 1.6;
            }

            .pmig-stage {
                position: relative;
                display: flex;
                min-height: 260px;
                width: 100%;
                overflow: hidden;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 18px;
                padding: 28px 18px;
                margin-bottom: 18px;
                border: 1px solid var(--pmig-border);
                border-radius: 22px;
                background:
                    radial-gradient(
                        ellipse at 50% 40%,
                        rgba(63, 111, 255, 0.09),
                        transparent 58%
                    ),
                    var(--pmig-card);
                text-align: center;
            }

            .pmig-stage[hidden],
            .pmig-result[hidden],
            .pmig-error[hidden],
            .pmig-history[hidden] {
                display: none !important;
            }

            .pmig-mesh {
                display: grid;
                grid-template-columns: repeat(25, 4px);
                gap: 8px;
                justify-content: center;
                align-content: center;
                min-height: 105px;
                max-width: 100%;
                overflow: hidden;
                opacity: .9;
                mask-image: radial-gradient(
                    ellipse,
                    black 20%,
                    transparent 75%
                );
            }

            .pmig-dot {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: var(--pmig-primary);
                opacity: .18;
                animation: pmig-dot-wave 2.6s ease-in-out infinite;
                animation-delay: var(--delay, 0ms);
            }

            @keyframes pmig-dot-wave {
                0%, 100% {
                    opacity: .12;
                    transform: scale(.65);
                }
                50% {
                    opacity: .85;
                    transform: scale(1.3);
                }
            }

            .pmig-status {
                width: 100%;
                max-width: 440px;
            }

            .pmig-status-title {
                margin: 0 0 7px;
                font-size: 18px;
                font-weight: 650;
                line-height: 1.45;
                transition: opacity .2s ease;
            }

            .pmig-status-detail {
                margin: 0;
                min-height: 22px;
                color: var(--pmig-muted);
                font-size: 13px;
                line-height: 1.65;
            }

            .pmig-progress-wrap {
                width: min(100%, 360px);
                margin-top: 2px;
            }

            .pmig-progress-top {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 8px;
                color: var(--pmig-muted);
                font-size: 12px;
            }

            .pmig-progress-track {
                height: 6px;
                overflow: hidden;
                border-radius: 999px;
                background: var(--pmig-border);
            }

            .pmig-progress-bar {
                width: 0%;
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(
                    90deg,
                    #3867f4,
                    #7b61ff,
                    #42a5ff
                );
                transition: width .45s ease;
            }

            .pmig-result {
                margin-bottom: 18px;
                overflow: hidden;
                border: 1px solid var(--pmig-border);
                border-radius: 20px;
                background: var(--pmig-card);
            }

            .pmig-result-image {
                display: block;
                width: 100%;
                max-height: 720px;
                object-fit: contain;
                background: var(--pmig-card);
            }

            .pmig-result-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                padding: 14px;
            }

            .pmig-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                min-height: 42px;
                padding: 10px 15px;
                border: 1px solid var(--pmig-border);
                border-radius: 12px;
                color: var(--pmig-text);
                background: var(--pmig-bg);
                font-size: 13px;
                font-weight: 600;
                transition:
                    background .18s ease,
                    transform .18s ease,
                    opacity .18s ease;
            }

            .pmig-btn:hover {
                transform: translateY(-1px);
            }

            .pmig-btn:disabled {
                cursor: not-allowed;
                opacity: .55;
                transform: none;
            }

            .pmig-btn-primary {
                border-color: var(--pmig-primary);
                color: #ffffff;
                background: var(--pmig-primary);
            }

            .pmig-btn-primary:hover {
                background: #2854db;
            }

            .pmig-btn svg {
                width: 17px;
                height: 17px;
                flex: 0 0 auto;
            }

            .pmig-composer {
                padding: 16px;
                border: 1px solid var(--pmig-border);
                border-radius: 20px;
                background: var(--pmig-bg);
            }

            .pmig-label {
                display: block;
                margin: 0 0 9px;
                font-size: 13px;
                font-weight: 650;
            }

            .pmig-prompt {
                display: block;
                width: 100%;
                min-height: 110px;
                resize: vertical;
                padding: 12px;
                border: 1px solid var(--pmig-border);
                border-radius: 13px;
                outline: none;
                color: var(--pmig-text);
                background: var(--pmig-card);
                font-size: 14px;
                line-height: 1.65;
            }

            .pmig-prompt:focus,
            .pmig-select:focus {
                border-color: var(--pmig-primary);
                box-shadow: 0 0 0 3px rgba(56, 103, 244, .12);
            }

            .pmig-prompt::placeholder {
                color: var(--pmig-muted);
            }

            .pmig-options {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
                margin-top: 16px;
            }

            .pmig-select {
                width: 100%;
                min-height: 43px;
                padding: 10px;
                border: 1px solid var(--pmig-border);
                border-radius: 11px;
                outline: none;
                color: var(--pmig-text);
                background: var(--pmig-bg);
                font-size: 13px;
            }

            .pmig-generate-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 16px;
            }

            .pmig-hint {
                margin: 0;
                color: var(--pmig-muted);
                font-size: 12px;
                line-height: 1.5;
            }

            .pmig-generate {
                min-width: 155px;
            }

            .pmig-spinner {
                display: none;
                width: 15px;
                height: 15px;
                border: 2px solid rgba(255,255,255,.4);
                border-top-color: #fff;
                border-radius: 50%;
                animation: pmig-spin .7s linear infinite;
            }

            .pmig-generating .pmig-spinner {
                display: inline-block;
            }

            @keyframes pmig-spin {
                to { transform: rotate(360deg); }
            }

            .pmig-error {
                margin-top: 12px;
                padding: 12px 14px;
                border: 1px solid #f2caca;
                border-radius: 12px;
                color: #b42318;
                background: #fff5f5;
                font-size: 13px;
                line-height: 1.6;
                overflow-wrap: anywhere;
            }

            .pmig-history {
                margin-top: 26px;
            }

            .pmig-history-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 13px;
            }

            .pmig-history-title {
                margin: 0;
                font-size: 16px;
                font-weight: 700;
            }

            .pmig-clear {
                border: 0;
                padding: 5px;
                color: var(--pmig-muted);
                background: transparent;
                font-size: 12px;
            }

            .pmig-history-grid {
                display: grid;
                grid-template-columns: repeat(
                    auto-fill,
                    minmax(115px, 1fr)
                );
                gap: 10px;
            }

            .pmig-history-item {
                min-width: 0;
                overflow: hidden;
                padding: 0;
                border: 1px solid var(--pmig-border);
                border-radius: 12px;
                background: var(--pmig-card);
                text-align: left;
            }

            .pmig-history-item img {
                display: block;
                width: 100%;
                aspect-ratio: 1 / 1;
                object-fit: cover;
            }

            .pmig-history-caption {
                display: block;
                overflow: hidden;
                padding: 8px;
                color: var(--pmig-text);
                font-size: 11px;
                line-height: 1.5;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .pmig-empty-history {
                color: var(--pmig-muted);
                font-size: 13px;
                line-height: 1.6;
            }

            .pmig-sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }

            .pmig-dark {
                --pmig-bg: #17191e;
                --pmig-card: #20232a;
                --pmig-text: #f2f3f5;
                --pmig-muted: #a1a6b1;
                --pmig-border: #343842;
                --pmig-primary-soft: #202d50;
            }

            .pmig-dark .pmig-error {
                border-color: #6e3434;
                color: #ffb4ab;
                background: #321f22;
            }

            @media (max-width: 520px) {
                .pmig-title {
                    font-size: 22px;
                }

                .pmig-stage {
                    min-height: 235px;
                    padding: 22px 12px;
                    border-radius: 17px;
                }

                .pmig-options {
                    grid-template-columns: 1fr;
                }

                .pmig-generate-row {
                    align-items: stretch;
                    flex-direction: column;
                }

                .pmig-generate {
                    width: 100%;
                }

                .pmig-result-actions .pmig-btn {
                    flex: 1 1 130px;
                }

                .pmig-history-grid {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .pmig *,
                .pmig *::before,
                .pmig *::after {
                    animation-duration: .01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: .01ms !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       ICONS AND MESH
       ===================================================== */

    const ICONS = {
        download: `
            <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <path d="m7 10 5 5 5-5"/>
                <path d="M12 15V3"/>
            </svg>`,
        refresh: `
            <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <path d="M20 7v5h-5"/>
                <path d="M4 17v-5h5"/>
                <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12"/>
                <path d="M4 12l2.8 5a7 7 0 0 0 11.6-2"/>
            </svg>`
    };

    function createMesh() {
        let html = "";

        for (let i = 0; i < 225; i++) {
            const delay = ((i * 37) % 1800);

            html += `
                <span class="pmig-dot"
                    style="--delay:${delay}ms"></span>`;
        }

        return html;
    }

    /* =====================================================
       HISTORY STORAGE
       ===================================================== */

    function loadHistory() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const items = stored ? JSON.parse(stored) : [];

            state.history = Array.isArray(items)
                ? items.filter(item =>
                    item &&
                    typeof item.id === "string" &&
                    typeof item.prompt === "string" &&
                    isValidImageURL(item.url)
                ).slice(0, MAX_HISTORY)
                : [];
        } catch {
            state.history = [];
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state.history.slice(0, MAX_HISTORY))
            );
        } catch (error) {
            console.warn(
                "[PingMe Image Generation] Could not save history.",
                error
            );
        }
    }

    function addHistory(url, prompt, settings = {}) {
        const item = {
            id: createId(),
            url,
            prompt,
            style: settings.style || state.style,
            aspectRatio: settings.aspectRatio || state.aspectRatio,
            createdAt: new Date().toISOString()
        };

        state.history.unshift(item);
        state.history = state.history.slice(0, MAX_HISTORY);

        saveHistory();
        renderHistory();

        return item;
    }

    /* =====================================================
       MOUNT UI
       ===================================================== */

    function render(container, options = {}) {
        if (typeof container === "string") {
            container = document.querySelector(container);
        }

        if (!container || !(container instanceof Element)) {
            console.error(
                "[PingMe Image Generation] A valid container is required."
            );
            return null;
        }

        injectStyles();

        if (state.root && state.root !== container) {
            destroy();
        }

        state.root = container;
        state.destroyed = false;

        if (options.endpoint) {
            state.endpoint = options.endpoint;
        }

        if (typeof options.generator === "function") {
            state.generator = options.generator;
        }

        container.innerHTML = `
            <section class="pmig" aria-label="AI image generation">

                <header class="pmig-header">
                    <h2 class="pmig-title">Create images</h2>
                    <p class="pmig-subtitle">
                        Turn your ideas into images with PingMe AI.
                    </p>
                </header>

                <div class="pmig-stage" id="pmigStage">
                    <div class="pmig-mesh" aria-hidden="true">
                        ${createMesh()}
                    </div>

                    <div class="pmig-status" aria-live="polite">
                        <h3 class="pmig-status-title"
                            id="pmigStatusTitle">
                            Ready to create
                        </h3>

                        <p class="pmig-status-detail"
                            id="pmigStatusDetail">
                            Describe the image you want to make.
                        </p>
                    </div>

                    <div class="pmig-progress-wrap"
                        id="pmigProgressWrap" hidden>
                        <div class="pmig-progress-top">
                            <span id="pmigProgressLabel">
                                Preparing your image...
                            </span>
                            <span id="pmigProgressPercent">0%</span>
                        </div>

                        <div class="pmig-progress-track"
                            role="progressbar"
                            aria-label="Image generation progress"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow="0"
                            id="pmigProgressTrack">
                            <div class="pmig-progress-bar"
                                id="pmigProgressBar"></div>
                        </div>
                    </div>
                </div>

                <div class="pmig-result" id="pmigResult" hidden>
                    <img class="pmig-result-image"
                        id="pmigResultImage"
                        alt="Generated image"
                        decoding="async">

                    <div class="pmig-result-actions">
                        <button type="button"
                            class="pmig-btn pmig-btn-primary"
                            id="pmigDownloadButton">
                            ${ICONS.download}
                            Download image
                        </button>

                        <button type="button"
                            class="pmig-btn"
                            id="pmigAnotherButton">
                            ${ICONS.refresh}
                            Create another
                        </button>
                    </div>
                </div>

                <div class="pmig-composer">
                    <label class="pmig-label" for="pmigPrompt">
                        Describe your image
                    </label>

                    <textarea
                        class="pmig-prompt"
                        id="pmigPrompt"
                        maxlength="5000"
                        placeholder="A cinematic sunset over a peaceful lake, realistic lighting, highly detailed..."
                        aria-describedby="pmigPromptHint"></textarea>

                    <div class="pmig-options">
                        <div>
                            <label class="pmig-label"
                                for="pmigStyle">Image style</label>

                            <select class="pmig-select"
                                id="pmigStyle">
                                <option value="realistic">Photorealistic</option>
                                <option value="cinematic">Cinematic</option>
                                <option value="anime">Anime</option>
                                <option value="3d">3D render</option>
                                <option value="illustration">Illustration</option>
                                <option value="logo">Logo</option>
                                <option value="poster">Poster</option>
                                <option value="watercolor">Watercolor</option>
                                <option value="custom">Custom style</option>
                            </select>
                        </div>

                        <div>
                            <label class="pmig-label"
                                for="pmigRatio">Aspect ratio</label>

                            <select class="pmig-select"
                                id="pmigRatio">
                                <option value="1:1">Square · 1:1</option>
                                <option value="3:2">Landscape · 3:2</option>
                                <option value="2:3">Portrait · 2:3</option>
                                <option value="16:9">Wide · 16:9</option>
                                <option value="9:16">Vertical · 9:16</option>
                            </select>
                        </div>
                    </div>

                    <div class="pmig-generate-row">
                        <p class="pmig-hint" id="pmigPromptHint">
                            Be specific about the subject, lighting, and style.
                        </p>

                        <button type="button"
                            class="pmig-btn pmig-btn-primary pmig-generate"
                            id="pmigGenerateButton">
                            <span class="pmig-spinner"
                                aria-hidden="true"></span>
                            <span id="pmigGenerateLabel">
                                Generate image
                            </span>
                        </button>
                    </div>

                    <div class="pmig-error" id="pmigError"
                        role="alert" hidden></div>
                </div>

                <section class="pmig-history" id="pmigHistory">
                    <div class="pmig-history-header">
                        <h3 class="pmig-history-title">Your images</h3>

                        <button type="button"
                            class="pmig-clear"
                            id="pmigClearHistory">
                            Clear history
                        </button>
                    </div>

                    <div class="pmig-history-grid"
                        id="pmigHistoryGrid"></div>
                </section>

                <p class="pmig-sr-only"
                    id="pmigLiveRegion"
                    aria-live="polite"></p>
            </section>
        `;

        loadHistory();
        bindEvents();
        renderHistory();
        setTheme(state.theme);

        return container;
    }

    /* =====================================================
       STATUS AND PROGRESS
       ===================================================== */

    function setStatus(index) {
        state.statusIndex = Math.max(
            0,
            Math.min(index, STATUS_MESSAGES.length - 1)
        );

        const message = STATUS_MESSAGES[state.statusIndex];

        const title = getElement("pmigStatusTitle");
        const detail = getElement("pmigStatusDetail");
        const live = getElement("pmigLiveRegion");

        if (title) {
            title.style.opacity = "0";

            requestAnimationFrame(() => {
                if (!state.root || !title.isConnected) return;

                title.textContent = message.title;
                title.style.opacity = "1";
            });
        }

        if (detail) detail.textContent = message.detail;

        if (live) {
            live.textContent = message.title + ". " + message.detail;
        }

        const label = getElement("pmigProgressLabel");

        if (label) {
            label.textContent = message.title + "...";
        }

        emit("status", {
            index: state.statusIndex,
            ...message
        });
    }

    function setProgress(value) {
        const progress = Math.max(
            0,
            Math.min(100, Math.round(Number(value) || 0))
        );

        state.progress = progress;

        const bar = getElement("pmigProgressBar");
        const percent = getElement("pmigProgressPercent");
        const track = getElement("pmigProgressTrack");

        if (bar) bar.style.width = progress + "%";
        if (percent) percent.textContent = progress + "%";

        if (track) {
            track.setAttribute("aria-valuenow", String(progress));
        }

        emit("progress", { progress });
    }

    function startProgressAnimation() {
        stopTimers();

        state.statusTimer = setInterval(() => {
            if (!state.generating) return;

            const next = (state.statusIndex + 1) %
                STATUS_MESSAGES.length;

            setStatus(next);
        }, 4200);

        state.progressTimer = setInterval(() => {
            if (!state.generating) return;

            if (state.progress < 25) {
                setProgress(state.progress + 2);
            } else if (state.progress < 55) {
                setProgress(state.progress + 1);
            } else if (state.progress < 78) {
                setProgress(state.progress + 0.5);
            } else if (state.progress < 92) {
                setProgress(state.progress + 0.2);
            } else if (state.progress < 94) {
                setProgress(94);
            }
        }, 900);
    }

    function showError(message) {
        const error = getElement("pmigError");

        if (!error) return;

        error.textContent = message;
        error.hidden = false;
    }

    function clearError() {
        const error = getElement("pmigError");

        if (!error) return;

        error.textContent = "";
        error.hidden = true;
    }

    function applyGeneratingState(isGenerating) {
        state.generating = isGenerating;

        const button = getElement("pmigGenerateButton");
        const label = getElement("pmigGenerateLabel");
        const prompt = getElement("pmigPrompt");
        const style = getElement("pmigStyle");
        const ratio = getElement("pmigRatio");
        const progressWrap = getElement("pmigProgressWrap");
        const stage = getElement("pmigStage");

        if (button) {
            button.disabled = isGenerating;
            button.classList.toggle(
                "pmig-generating",
                isGenerating
            );
        }

        if (label) {
            label.textContent = isGenerating
                ? "Creating image..."
                : "Generate image";
        }

        if (prompt) prompt.disabled = isGenerating;
        if (style) style.disabled = isGenerating;
        if (ratio) ratio.disabled = isGenerating;

        if (progressWrap) progressWrap.hidden = !isGenerating;
        if (stage) stage.hidden = false;

        if (!isGenerating) {
            stopTimers();
        }
    }

    /* =====================================================
       IMAGE GENERATION API
       ===================================================== */

    function buildRequest(prompt, settings = {}) {
        return {
            prompt,
            style: settings.style || state.style,
            aspectRatio: settings.aspectRatio || state.aspectRatio,
            width: ratioDimensions(
                settings.aspectRatio || state.aspectRatio
            ).width,
            height: ratioDimensions(
                settings.aspectRatio || state.aspectRatio
            ).height
        };
    }

    function ratioDimensions(ratio) {
        const dimensions = {
            "1:1": { width: 1024, height: 1024 },
            "3:2": { width: 1536, height: 1024 },
            "2:3": { width: 1024, height: 1536 },
            "16:9": { width: 1536, height: 864 },
            "9:16": { width: 864, height: 1536 }
        };

        return dimensions[ratio] || dimensions["1:1"];
    }

    async function defaultGenerator(request, callbacks = {}) {
        const endpoint = state.endpoint || API_ENDPOINT;

        callbacks.onStatus?.("Connecting to the image generator...");
        callbacks.onProgress?.(5);

        let response;

        try {
            response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json, image/*"
                },
                body: JSON.stringify(request)
            });
        } catch (error) {
            throw new Error(
                "Could not connect to the image-generation API. " +
                "Check your network and API endpoint."
            );
        }

        if (!response.ok) {
            let detail = "";

            try {
                const data = await response.json();
                detail = data.error || data.message || "";
            } catch {
                try {
                    detail = await response.text();
                } catch {
                    detail = "";
                }
            }

            throw new Error(
                detail ||
                "Image generation failed (HTTP " +
                response.status + ")."
            );
        }

        const contentType = (
            response.headers.get("content-type") || ""
        ).toLowerCase();

        if (contentType.startsWith("image/")) {
            const blob = await response.blob();
            callbacks.onProgress?.(98);

            return {
                url: URL.createObjectURL(blob),
                prompt: request.prompt
            };
        }

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "The image API returned an unsupported response."
            );
        }

        callbacks.onProgress?.(95);

        if (typeof data === "string") {
            return { url: data };
        }

        if (data && data.error) {
            throw new Error(String(data.error));
        }

        const imageUrl =
            data?.url ||
            data?.imageUrl ||
            data?.image_url ||
            data?.dataUrl ||
            data?.data_url ||
            data?.output?.url ||
            data?.image?.url ||
            (typeof data?.image === "string" ? data.image : null) ||
            (typeof data?.data === "string" ? data.data : null) ||
            (Array.isArray(data?.data)
                ? data.data[0]?.url || data.data[0]
                : null) ||
            (Array.isArray(data?.images)
                ? data.images[0]?.url || data.images[0]
                : null);

        if (typeof imageUrl !== "string" ||
            !isValidImageURL(imageUrl)) {
            throw new Error(
                "The API responded, but no usable image URL was found. " +
                "Make sure the endpoint returns url, imageUrl, dataUrl, " +
                "or a supported image response."
            );
        }

        return {
            url: imageUrl,
            metadata: data.metadata || {}
        };
    }

    function setGenerator(generator) {
        if (generator !== null &&
            typeof generator !== "function") {
            throw new TypeError(
                "The image generator must be a function or null."
            );
        }

        state.generator = generator;
    }

    async function start(prompt, settings = {}) {
        if (!state.root) {
            throw new Error(
                "Mount the image-generation UI before generating."
            );
        }

        if (state.generating) return null;

        const cleanPrompt = String(prompt || "").trim();

        if (!cleanPrompt) {
            showError("Please describe the image you want to create.");
            getElement("pmigPrompt")?.focus();
            return null;
        }

        clearError();

        state.prompt = cleanPrompt;
        state.style = settings.style ||
            getElement("pmigStyle")?.value ||
            state.style;

        state.aspectRatio = settings.aspectRatio ||
            getElement("pmigRatio")?.value ||
            state.aspectRatio;

        state.lastError = "";
        state.lastImage = null;

        const requestId = ++state.requestId;
        const request = buildRequest(cleanPrompt, settings);

        const result = getElement("pmigResult");

        if (result) result.hidden = true;

        applyGeneratingState(true);
        setProgress(0);
        setStatus(0);
        startProgressAnimation();

        emit("start", { request });

        try {
            const generator = state.generator || defaultGenerator;

            const output = await generator(request, {
                onProgress: value => {
                    if (requestId !== state.requestId) return;
                    setProgress(value);
                },

                onStatus: message => {
                    if (requestId !== state.requestId) return;

                    const detail = getElement("pmigStatusDetail");

                    if (detail && typeof message === "string") {
                        detail.textContent = message;
                    }
                }
            });

            if (requestId !== state.requestId) return null;

            const imageUrl = typeof output === "string"
                ? output
                : output?.url ||
                  output?.imageUrl ||
                  output?.dataUrl ||
                  output?.image_url ||
                  output?.data_url;

            if (!isValidImageURL(imageUrl)) {
                throw new Error(
                    "The image generator did not return a valid image URL."
                );
            }

            return complete(imageUrl, {
                prompt: cleanPrompt,
                style: request.style,
                aspectRatio: request.aspectRatio,
                ...(output?.metadata || {})
            });
        } catch (error) {
            if (requestId !== state.requestId) return null;

            fail(error);
            return null;
        }
    }

    /* =====================================================
       GENERATION COMPLETE / FAILURE
       ===================================================== */

    function complete(imageUrl, metadata = {}) {
        if (!isValidImageURL(imageUrl)) {
            fail(new Error("The generated image URL is invalid."));
            return null;
        }

        stopTimers();

        state.generating = false;
        state.lastError = "";
        state.lastImage = imageUrl;

        applyGeneratingState(false);
        setProgress(100);

        const stage = getElement("pmigStage");
        const result = getElement("pmigResult");
        const image = getElement("pmigResultImage");
        const progressLabel = getElement("pmigProgressLabel");

        if (stage) stage.hidden = false;

        setStatus(7);

        const title = getElement("pmigStatusTitle");
        const detail = getElement("pmigStatusDetail");

        if (title) title.textContent = "Your image is ready!";
        if (detail) {
            detail.textContent =
                "Your image has been created successfully.";
        }

        if (progressLabel) {
            progressLabel.textContent = "Image complete";
        }

        if (image) {
            image.onload = () => {
                if (result) result.hidden = false;
            };

            image.onerror = () => {
                if (result) result.hidden = true;
                showError(
                    "The image was generated, but it could not be displayed. " +
                    "Try generating it again."
                );
            };

            image.src = imageUrl;
            image.alt = metadata.prompt
                ? "Generated image: " + metadata.prompt
                : "Generated image";
        }

        if (result) result.hidden = false;

        const prompt = metadata.prompt || state.prompt;

        const item = addHistory(imageUrl, prompt, {
            style: metadata.style || state.style,
            aspectRatio: metadata.aspectRatio || state.aspectRatio
        });

        emit("complete", {
            imageUrl,
            metadata,
            historyItem: item
        });

        return item;
    }

    function fail(error) {
        stopTimers();
        state.generating = false;

        const message = error instanceof Error
            ? error.message
            : String(error || "An unknown error occurred.");

        state.lastError = message;

        applyGeneratingState(false);
        setProgress(0);

        const title = getElement("pmigStatusTitle");
        const detail = getElement("pmigStatusDetail");

        if (title) title.textContent = "Image generation failed";
        if (detail) {
            detail.textContent =
                "Something went wrong while creating your image.";
        }

        showError(message);

        emit("error", { error: message });

        return false;
    }

    /* =====================================================
       DOWNLOAD
       ===================================================== */

    async function downloadImage(url = state.lastImage) {
        if (!url || !isValidImageURL(url)) {
            showError("There is no image available to download.");
            return false;
        }

        try {
            let downloadUrl = url;
            let objectUrl = null;

            if (!url.startsWith("data:") &&
                !url.startsWith("blob:")) {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(
                        "The image could not be downloaded."
                    );
                }

                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                downloadUrl = objectUrl;
            }

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = "pingme-image-" +
                new Date().toISOString().replace(/[:.]/g, "-") +
                ".png";

            document.body.appendChild(link);
            link.click();
            link.remove();

            if (objectUrl) {
                setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
            }

            emit("download", { url });

            return true;
        } catch (error) {
            showError(
                error.message ||
                "Download failed. Try opening the image in a new tab."
            );

            return false;
        }
    }

    /* =====================================================
       HISTORY
       ===================================================== */

    function renderHistory() {
        const grid = getElement("pmigHistoryGrid");
        const section = getElement("pmigHistory");

        if (!grid || !section) return;

        if (!state.history.length) {
            grid.innerHTML = `
                <p class="pmig-empty-history">
                    Your generated images will appear here.
                </p>
            `;

            section.hidden = false;
            return;
        }

        grid.innerHTML = state.history.map(item => `
            <button type="button"
                class="pmig-history-item"
                data-history-id="${escapeHTML(item.id)}"
                title="${escapeHTML(item.prompt)}">

                <img
                    src="${escapeHTML(item.url)}"
                    alt="${escapeHTML(item.prompt)}"
                    loading="lazy">

                <span class="pmig-history-caption">
                    ${escapeHTML(item.prompt)}
                </span>
            </button>
        `).join("");

        section.hidden = false;
    }

    function showHistoryItem(id) {
        const item = state.history.find(entry => entry.id === id);

        if (!item) return null;

        state.lastImage = item.url;
        state.prompt = item.prompt;
        state.style = item.style || "realistic";
        state.aspectRatio = item.aspectRatio || "1:1";

        const prompt = getElement("pmigPrompt");
        const style = getElement("pmigStyle");
        const ratio = getElement("pmigRatio");
        const image = getElement("pmigResultImage");
        const result = getElement("pmigResult");
        const stage = getElement("pmigStage");

        if (prompt) prompt.value = item.prompt;
        if (style) style.value = state.style;
        if (ratio) ratio.value = state.aspectRatio;

        if (image) {
            image.src = item.url;
            image.alt = "Generated image: " + item.prompt;
        }

        if (result) result.hidden = false;
        if (stage) stage.hidden = true;

        clearError();

        emit("history-open", { item });

        return item;
    }

    function getHistory() {
        return state.history.map(item => ({ ...item }));
    }

    function clearHistory() {
        state.history = [];
        saveHistory();
        renderHistory();

        emit("history-clear");
    }

    /* =====================================================
       RESET / THEME / EVENTS
       ===================================================== */

    function reset() {
        state.requestId++;
        stopTimers();

        state.generating = false;
        state.progress = 0;
        state.lastError = "";
        state.lastImage = null;

        applyGeneratingState(false);
        setProgress(0);
        clearError();

        const prompt = getElement("pmigPrompt");
        const result = getElement("pmigResult");
        const stage = getElement("pmigStage");
        const progressWrap = getElement("pmigProgressWrap");

        if (prompt) prompt.value = "";
        if (result) result.hidden = true;
        if (stage) stage.hidden = false;
        if (progressWrap) progressWrap.hidden = true;

        setStatus(0);

        const title = getElement("pmigStatusTitle");
        const detail = getElement("pmigStatusDetail");

        if (title) title.textContent = "Ready to create";
        if (detail) {
            detail.textContent =
                "Describe the image you want to make.";
        }

        emit("reset");
    }

    function setTheme(theme = "auto") {
        state.theme = theme;

        if (!state.root) return;

        const dark = theme === "dark" ||
            (theme === "auto" &&
                window.matchMedia?.(
                    "(prefers-color-scheme: dark)"
                ).matches);

        const section = state.root.querySelector(".pmig");

        if (section) {
            section.classList.toggle("pmig-dark", Boolean(dark));
        }
    }

    function bindEvents() {
        const generateButton = getElement("pmigGenerateButton");
        const prompt = getElement("pmigPrompt");
        const style = getElement("pmigStyle");
        const ratio = getElement("pmigRatio");
        const downloadButton = getElement("pmigDownloadButton");
        const anotherButton = getElement("pmigAnotherButton");
        const clearButton = getElement("pmigClearHistory");
        const historyGrid = getElement("pmigHistoryGrid");

        generateButton?.addEventListener("click", () => {
            start(prompt?.value || "", {
                style: style?.value || "realistic",
                aspectRatio: ratio?.value || "1:1"
            });
        });

        prompt?.addEventListener("keydown", event => {
            if ((event.ctrlKey || event.metaKey) &&
                event.key === "Enter") {
                event.preventDefault();
                generateButton?.click();
            }
        });

        style?.addEventListener("change", () => {
            state.style = style.value;
        });

        ratio?.addEventListener("change", () => {
            state.aspectRatio = ratio.value;
        });

        downloadButton?.addEventListener("click", () => {
            downloadImage();
        });

        anotherButton?.addEventListener("click", () => {
            reset();
            prompt?.focus();
        });

        clearButton?.addEventListener("click", () => {
            if (!state.history.length) return;

            clearHistory();
        });

        historyGrid?.addEventListener("click", event => {
            const button = event.target.closest(
                "[data-history-id]"
            );

            if (!button) return;

            showHistoryItem(button.dataset.historyId);
        });
    }

    function destroy() {
        stopTimers();

        if (state.root) {
            state.root.innerHTML = "";
        }

        state.root = null;
        state.destroyed = true;
    }

    function getState() {
        return {
            version: VERSION,
            generating: state.generating,
            progress: state.progress,
            prompt: state.prompt,
            style: state.style,
            aspectRatio: state.aspectRatio,
            lastImage: state.lastImage,
            lastError: state.lastError,
            historyCount: state.history.length
        };
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.PingMeImageGeneration = {
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
        showHistoryItem,
        setTheme,
        setProgress,
        setStatus,
        getState,
        destroy
    };

    /* =====================================================
       AUTO-MOUNT
       ===================================================== */

    function autoMount() {
        const container = document.querySelector(ROOT_SELECTOR);

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