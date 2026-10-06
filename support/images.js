// ==========================================================
// PingMe AI — Images Support
// ==========================================================

(function () {

    "use strict";

    const IMAGES_STORAGE_KEY =
        "pingme_generated_images";

    let imagesPanel = null;

    let imagesData = [];

    let currentPreviewIndex = -1;

    let currentImagesTab = "trending";


    /* =========================================================
       REALISTIC TRENDING IMAGES
       ========================================================= */

    const TRENDING_IMAGES = [

        {
            title: "Mountain Escape",
            category: "Nature",
            url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Ocean Sunset",
            category: "Travel",
            url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Alpine Lake",
            category: "Nature",
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Modern Architecture",
            category: "Architecture",
            url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "City Lights",
            category: "City",
            url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Elegant Portrait",
            category: "People",
            url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Professional Portrait",
            category: "People",
            url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Street Fashion",
            category: "Fashion",
            url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Coffee Moment",
            category: "Lifestyle",
            url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Fine Dining",
            category: "Food",
            url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Fresh Food",
            category: "Food",
            url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Creative Workspace",
            category: "Interior",
            url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85"
        }

    ];


    /* =========================================================
       REALISTIC IMAGE TEMPLATES
       ========================================================= */

    const TEMPLATE_IMAGES = [

        {
            title: "Realistic Portrait",
            category: "Portrait",
            prompt:
                "A professional photorealistic portrait with natural skin, cinematic lighting and a clean background.",
            url:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Travel Poster",
            category: "Travel",
            prompt:
                "A premium photorealistic travel scene with dramatic mountains, natural light and cinematic composition.",
            url:
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Luxury Interior",
            category: "Interior",
            prompt:
                "A modern luxury interior, photorealistic architectural photography, soft natural daylight.",
            url:
                "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Food Photography",
            category: "Food",
            prompt:
                "A premium restaurant food photograph, realistic textures, natural lighting and shallow depth of field.",
            url:
                "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Fashion Editorial",
            category: "Fashion",
            prompt:
                "A high-end fashion editorial photograph, realistic model, studio lighting and premium styling.",
            url:
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Product Photo",
            category: "Product",
            prompt:
                "A premium commercial product photograph with realistic studio lighting, clean background and sharp details.",
            url:
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Nature Scene",
            category: "Nature",
            prompt:
                "A photorealistic cinematic nature scene with mountains, trees, atmospheric light and realistic details.",
            url:
                "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85"
        },

        {
            title: "Urban Night",
            category: "City",
            prompt:
                "A photorealistic modern city at night with realistic lights, reflections and cinematic atmosphere.",
            url:
                "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=85"
        }

    ];


    /* =========================================================
       LOAD SAVED IMAGES
       ========================================================= */

    function loadSavedImages() {

        try {

            const saved =
                localStorage.getItem(
                    IMAGES_STORAGE_KEY
                );

            const parsed =
                saved
                    ? JSON.parse(saved)
                    : [];

            imagesData =
                Array.isArray(parsed)
                    ? parsed
                    : [];

        } catch (error) {

            console.error(
                "PingMe AI — Images Load Error:",
                error
            );

            imagesData = [];

        }

    }


    /* =========================================================
       SAVE IMAGES
       ========================================================= */

    function saveImages() {

        try {

            localStorage.setItem(
                IMAGES_STORAGE_KEY,
                JSON.stringify(imagesData)
            );

        } catch (error) {

            console.error(
                "PingMe AI — Images Save Error:",
                error
            );

        }

    }


    /* =========================================================
       CREATE IMAGES PANEL
       ========================================================= */

    function createImagesPanel() {

        if (imagesPanel) {

            return imagesPanel;

        }

        imagesPanel =
            document.createElement("div");

        imagesPanel.id =
            "pingmeImagesPanel";

        imagesPanel.innerHTML = `

            <div class="pingme-images-overlay"></div>

            <div class="pingme-images-panel">

                <div class="pingme-images-header">

                    <button
                        type="button"
                        class="pingme-images-back"
                        id="pingmeImagesBack"
                        aria-label="Close Images"
                    >
                        ‹
                    </button>

                    <div class="pingme-images-title">
                        Images
                    </div>

                </div>


                <div class="pingme-images-content">


                    <div class="pingme-images-hero">

                        <div class="pingme-images-hero-badge">
                            ✦ AI IMAGE STUDIO
                        </div>

                        <div class="pingme-images-hero-title">
                            Create something amazing
                        </div>

                        <div class="pingme-images-hero-text">
                            Explore realistic inspiration
                            or generate your own image
                            with PingMe AI.
                        </div>

                    </div>


                    <div
                        class="pingme-images-tabs"
                        role="tablist"
                    >

                        <button
                            type="button"
                            class="pingme-images-tab active"
                            data-images-tab="trending"
                        >
                            Trending
                        </button>

                        <button
                            type="button"
                            class="pingme-images-tab"
                            data-images-tab="templates"
                        >
                            Templates
                        </button>

                        <button
                            type="button"
                            class="pingme-images-tab"
                            data-images-tab="my-images"
                        >
                            My Images
                        </button>

                    </div>


                    <div
                        id="pingmeImagesDiscovery"
                        class="pingme-images-discovery"
                    ></div>


                    <div class="pingme-images-toolbar">

                        <button
                            type="button"
                            class="pingme-images-generate"
                            id="pingmeImagesGenerate"
                        >
                            Generate Image
                        </button>

                    </div>


                    <div
                        class="pingme-images-gallery"
                        id="pingmeImagesGallery"
                    ></div>


                    <div
                        class="pingme-images-empty"
                        id="pingmeImagesEmpty"
                    >

                        <div class="pingme-images-empty-icon">
                            🖼️
                        </div>

                        <div class="pingme-images-empty-title">
                            No images yet
                        </div>

                        <div class="pingme-images-empty-text">
                            Your generated images
                            will appear here.
                        </div>

                    </div>

                </div>

            </div>

        `;

        document.body.appendChild(
            imagesPanel
        );

        setupImagesEvents();

        renderImages();

        return imagesPanel;

    }


    /* =========================================================
       SETUP IMAGE EVENTS
       ========================================================= */

    function setupImagesEvents() {

        const backButton =
            document.getElementById(
                "pingmeImagesBack"
            );

        const overlay =
            imagesPanel.querySelector(
                ".pingme-images-overlay"
            );

        const generateButton =
            document.getElementById(
                "pingmeImagesGenerate"
            );


        if (backButton) {

            backButton.addEventListener(
                "click",
                closeImages
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeImages
            );

        }


        if (generateButton) {

            generateButton.addEventListener(
                "click",
                openGenerateDialog
            );

        }


        imagesPanel
            .querySelectorAll(
                "[data-images-tab]"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            switchImagesTab(
                                button.getAttribute(
                                    "data-images-tab"
                                )
                            );

                        }
                    );

                }
            );

    }


    /* =========================================================
       SWITCH IMAGE TAB
       ========================================================= */

    function switchImagesTab(
        tab
    ) {

        currentImagesTab =
            tab || "trending";

        if (!imagesPanel) {

            return;

        }


        imagesPanel
            .querySelectorAll(
                "[data-images-tab]"
            )
            .forEach(
                function (button) {

                    button.classList.toggle(
                        "active",
                        button.getAttribute(
                            "data-images-tab"
                        ) === currentImagesTab
                    );

                }
            );


        renderImages();

    }


    /* =========================================================
       RENDER DISCOVERY
       ========================================================= */

    function renderDiscovery() {

        const container =
            document.getElementById(
                "pingmeImagesDiscovery"
            );

        if (!container) {

            return;

        }


        container.innerHTML = "";


        if (
            currentImagesTab ===
            "my-images"
        ) {

            return;

        }


        const items =
            currentImagesTab ===
            "templates"
                ? TEMPLATE_IMAGES
                : TRENDING_IMAGES;


        const title =
            currentImagesTab ===
            "templates"
                ? "Ready-to-use templates"
                : "Realistic inspiration";


        const subtitle =
            currentImagesTab ===
            "templates"
                ? "Tap a template to use its prompt."
                : "Fresh photorealistic ideas to inspire your next creation.";


        const heading =
            document.createElement("div");

        heading.className =
            "pingme-images-section-heading";


        heading.innerHTML = `

            <div>

                <div class="pingme-images-section-title">
                    ${escapeHtml(title)}
                </div>

                <div class="pingme-images-section-subtitle">
                    ${escapeHtml(subtitle)}
                </div>

            </div>

        `;


        container.appendChild(
            heading
        );


        const grid =
            document.createElement("div");

        grid.className =
            "pingme-images-discovery-grid";


        items.forEach(
            function (item) {

                const card =
                    document.createElement("button");

                card.type =
                    "button";

                card.className =
                    "pingme-images-discovery-card";


                card.innerHTML = `

                    <img
                        src="${escapeHtml(
                            item.url
                        )}"
                        alt="${escapeHtml(
                            item.title
                        )}"
                        loading="lazy"
                    >

                    <span
                        class="pingme-images-discovery-gradient"
                    ></span>

                    <span
                        class="pingme-images-discovery-info"
                    >

                        <strong>
                            ${escapeHtml(
                                item.title
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                item.category ||
                                "Template"
                            )}
                        </small>

                    </span>

                `;


                card.addEventListener(
                    "click",
                    function () {

                        if (
                            currentImagesTab ===
                            "templates"
                        ) {

                            openGenerateDialog(
                                item.prompt ||
                                ""
                            );

                        } else {

                            openImageLightbox(
                                item.url,
                                item.title
                            );

                        }

                    }
                );


                grid.appendChild(
                    card
                );

            }
        );


        container.appendChild(
            grid
        );

    }


    /* =========================================================
       READY-MADE IMAGE PREVIEW
       ========================================================= */

    function openImageLightbox(
        url,
        title
    ) {

        closeImagePreview();


        const preview =
            document.createElement("div");

        preview.id =
            "pingmeImagesPreview";


        preview.innerHTML = `

            <div
                class="pingme-images-preview-overlay"
                id="pingmeImagesPreviewOverlay"
            ></div>

            <div
                class="pingme-images-preview-panel"
            >

                <button
                    type="button"
                    class="pingme-images-preview-close"
                    id="pingmeImagesPreviewClose"
                >
                    ×
                </button>

                <div
                    class="pingme-images-preview-image-wrap"
                >

                    <img
                        src="${escapeHtml(url)}"
                        alt="${escapeHtml(
                            title ||
                            "Image"
                        )}"
                    >

                </div>

                <div
                    class="pingme-images-preview-info"
                >

                    <div
                        class="pingme-images-preview-prompt"
                    >
                        ${escapeHtml(
                            title ||
                            "Image"
                        )}
                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            preview
        );


        const close =
            document.getElementById(
                "pingmeImagesPreviewClose"
            );

        const overlay =
            document.getElementById(
                "pingmeImagesPreviewOverlay"
            );


        if (close) {

            close.addEventListener(
                "click",
                closeImagePreview
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeImagePreview
            );

        }

    }


    /* =========================================================
       OPEN IMAGES
       ========================================================= */

    function openImages() {

        const panel =
            createImagesPanel();


        panel.classList.add(
            "active"
        );


        document.body.classList.add(
            "pingme-images-open"
        );


        renderImages();

    }


    /* =========================================================
       CLOSE IMAGES
       ========================================================= */

    function closeImages() {

        if (!imagesPanel) {

            return;

        }


        imagesPanel.classList.remove(
            "active"
        );


        document.body.classList.remove(
            "pingme-images-open"
        );


        closeGenerateDialog();

        closeImagePreview();

    }


    /* =========================================================
       GENERATE DIALOG
       ========================================================= */

    function openGenerateDialog(
        prefillPrompt
    ) {

        if (
            document.getElementById(
                "pingmeImagesGenerateDialog"
            )
        ) {

            return;

        }


        const dialog =
            document.createElement("div");

        dialog.id =
            "pingmeImagesGenerateDialog";


        dialog.innerHTML = `

            <div
                class="pingme-images-dialog-overlay"
                id="pingmeImagesDialogOverlay"
            ></div>


            <div
                class="pingme-images-dialog"
                role="dialog"
                aria-modal="true"
            >

                <div
                    class="pingme-images-dialog-header"
                >

                    <div
                        class="pingme-images-dialog-title"
                    >
                        Generate Image
                    </div>

                    <button
                        type="button"
                        class="pingme-images-dialog-close"
                        id="pingmeImagesDialogClose"
                    >
                        ×
                    </button>

                </div>


                <div
                    class="pingme-images-dialog-body"
                >

                    <label
                        class="pingme-images-field-label"
                        for="pingmeImagesPrompt"
                    >
                        Describe your image
                    </label>


                    <textarea
                        id="pingmeImagesPrompt"
                        class="pingme-images-prompt"
                        placeholder="Describe the image you want to create..."
                        rows="5"
                    ></textarea>


                    <div
                        class="pingme-images-prompt-error"
                        id="pingmeImagesPromptError"
                    ></div>


                    <div
                        class="pingme-images-options"
                    >

                        <div
                            class="pingme-images-option"
                        >

                            <label
                                for="pingmeImagesModel"
                            >
                                Model
                            </label>

                            <select
                                id="pingmeImagesModel"
                            >

                                <option value="gpt-image-1">
                                    GPT Image
                                </option>

                            </select>

                        </div>


                        <div
                            class="pingme-images-option"
                        >

                            <label
                                for="pingmeImagesSize"
                            >
                                Size
                            </label>

                            <select
                                id="pingmeImagesSize"
                            >

                                <option value="1024x1024">
                                    Square
                                </option>

                                <option value="1536x1024">
                                    Landscape
                                </option>

                                <option value="1024x1536">
                                    Portrait
                                </option>

                            </select>

                        </div>


                        <div
                            class="pingme-images-option"
                        >

                            <label
                                for="pingmeImagesQuality"
                            >
                                Quality
                            </label>

                            <select
                                id="pingmeImagesQuality"
                            >

                                <option value="auto">
                                    Auto
                                </option>

                                <option value="low">
                                    Low
                                </option>

                                <option value="medium">
                                    Medium
                                </option>

                                <option value="high">
                                    High
                                </option>

                            </select>

                        </div>


                        <div
                            class="pingme-images-option"
                        >

                            <label
                                for="pingmeImagesCount"
                            >
                                Images
                            </label>

                            <select
                                id="pingmeImagesCount"
                            >

                                <option value="1">
                                    1
                                </option>

                                <option value="2">
                                    2
                                </option>

                                <option value="3">
                                    3
                                </option>

                                <option value="4">
                                    4
                                </option>

                            </select>

                        </div>

                    </div>


                    <div
                        class="pingme-images-generation-error"
                        id="pingmeImagesGenerationError"
                    ></div>

                </div>


                <div
                    class="pingme-images-dialog-footer"
                >

                    <button
                        type="button"
                        class="pingme-images-cancel"
                        id="pingmeImagesCancel"
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        class="pingme-images-generate-confirm"
                        id="pingmeImagesGenerateConfirm"
                    >
                        Generate
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            dialog
        );


        setupGenerateDialogEvents();


        const prompt =
            document.getElementById(
                "pingmeImagesPrompt"
            );


        if (prompt) {

            if (prefillPrompt) {

                prompt.value =
                    prefillPrompt;

            }


            setTimeout(
                function () {

                    prompt.focus();

                },
                50
            );

        }

    }


    /* =========================================================
       GENERATE DIALOG EVENTS
       ========================================================= */

    function setupGenerateDialogEvents() {

        const closeButton =
            document.getElementById(
                "pingmeImagesDialogClose"
            );

        const cancelButton =
            document.getElementById(
                "pingmeImagesCancel"
            );

        const overlay =
            document.getElementById(
                "pingmeImagesDialogOverlay"
            );

        const generateButton =
            document.getElementById(
                "pingmeImagesGenerateConfirm"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeGenerateDialog
            );

        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeGenerateDialog
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeGenerateDialog
            );

        }


        if (generateButton) {

            generateButton.addEventListener(
                "click",
                handleGenerateImage
            );

        }

    }


    /* =========================================================
       CLOSE GENERATE DIALOG
       ========================================================= */

    function closeGenerateDialog() {

        const dialog =
            document.getElementById(
                "pingmeImagesGenerateDialog"
            );


        if (dialog) {

            dialog.remove();

        }

    }


    /* =========================================================
       HANDLE IMAGE GENERATION
       ========================================================= */

    async function handleGenerateImage() {

        const promptElement =
            document.getElementById(
                "pingmeImagesPrompt"
            );

        const modelElement =
            document.getElementById(
                "pingmeImagesModel"
            );

        const sizeElement =
            document.getElementById(
                "pingmeImagesSize"
            );

        const qualityElement =
            document.getElementById(
                "pingmeImagesQuality"
            );

        const countElement =
            document.getElementById(
                "pingmeImagesCount"
            );

        const errorElement =
            document.getElementById(
                "pingmeImagesPromptError"
            );

        const generationError =
            document.getElementById(
                "pingmeImagesGenerationError"
            );


        if (!promptElement) {

            return;

        }


        const prompt =
            promptElement.value.trim();


        if (errorElement) {

            errorElement.textContent =
                "";

        }


        if (generationError) {

            generationError.textContent =
                "";

        }


        if (!prompt) {

            if (errorElement) {

                errorElement.textContent =
                    "Please describe the image you want to generate.";

            }

            promptElement.focus();

            return;

        }


        if (prompt.length > 4000) {

            if (errorElement) {

                errorElement.textContent =
                    "Your prompt is too long. Please shorten it.";

            }

            return;

        }


        const options = {

            prompt:
                prompt,

            model:
                modelElement
                    ? modelElement.value
                    : "gpt-image-1",

            size:
                sizeElement
                    ? sizeElement.value
                    : "1024x1024",

            quality:
                qualityElement
                    ? qualityElement.value
                    : "auto",

            count:
                countElement
                    ? Number(
                        countElement.value
                    )
                    : 1

        };


        setGenerateLoading(
            true
        );


        try {

            const result =
                await requestImageGeneration(
                    options
                );


            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    result &&
                    result.error
                        ? result.error
                        : "Image generation service is not connected yet."
                );

            }


            if (
                Array.isArray(
                    result.images
                )
            ) {

                result.images.forEach(
                    function (image) {

                        addImageToGallery(
                            image,
                            options
                        );

                    }
                );

            }


            closeGenerateDialog();


            currentImagesTab =
                "my-images";


            renderImages();


        } catch (error) {

            console.error(
                "PingMe AI — Image Generation Error:",
                error
            );


            if (generationError) {

                generationError.textContent =
                    error.message ||
                    "Image generation failed.";

            }


        } finally {

            setGenerateLoading(
                false
            );

        }

    }


    /* =========================================================
       GENERATE LOADING
       ========================================================= */

    function setGenerateLoading(
        loading
    ) {

        const button =
            document.getElementById(
                "pingmeImagesGenerateConfirm"
            );

        const cancelButton =
            document.getElementById(
                "pingmeImagesCancel"
            );


        if (!button) {

            return;

        }


        button.disabled =
            loading;


        button.innerHTML =
            loading
                ? `
                    <span
                        class="pingme-images-spinner"
                    ></span>
                    Generating...
                `
                : "Generate";


        if (cancelButton) {

            cancelButton.disabled =
                loading;

        }

    }


    /* =========================================================
       IMAGE GENERATION API
       ========================================================= */

    async function requestImageGeneration(
        options
    ) {

        try {

            const response =
                await fetch(
                    "/api/images",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                prompt:
                                    options.prompt,

                                model:
                                    "flux",

                                width:
                                    1024,

                                height:
                                    1024

                            })

                    }
                );


            if (!response.ok) {

                let errorMessage =
                    "Image generation failed.";


                try {

                    const errorData =
                        await response.json();


                    if (
                        errorData &&
                        errorData.error
                    ) {

                        errorMessage =
                            errorData.error;

                    }

                } catch (_) {

                    /* Ignore JSON error */

                }


                return {

                    success:
                        false,

                    images:
                        [],

                    error:
                        errorMessage

                };

            }


            const imageBlob =
                await response.blob();


            const imageUrl =
                URL.createObjectURL(
                    imageBlob
                );


            return {

                success:
                    true,

                images: [
                    imageUrl
                ],

                error:
                    null

            };


        } catch (error) {

            return {

                success:
                    false,

                images:
                    [],

                error:
                    error.message ||
                    "Image generation failed."

            };

        }

    }


    /* =========================================================
       ADD IMAGE
       ========================================================= */

    function addImageToGallery(
        image,
        options
    ) {

        if (!image) {

            return;

        }


        const imageRecord = {

            id:
                "img_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .slice(2, 9),

            url:
                typeof image === "string"
                    ? image
                    : (
                        image.url ||
                        image.dataUrl ||
                        ""
                    ),

            prompt:
                options.prompt,

            model:
                options.model,

            size:
                options.size,

            quality:
                options.quality,

            createdAt:
                new Date().toISOString()

        };


        if (!imageRecord.url) {

            return;

        }


        imagesData.unshift(
            imageRecord
        );


        saveImages();

    }


    /* =========================================================
       RENDER IMAGES
       ========================================================= */

    function renderImages() {

        if (!imagesPanel) {

            return;

        }


        const gallery =
            document.getElementById(
                "pingmeImagesGallery"
            );

        const empty =
            document.getElementById(
                "pingmeImagesEmpty"
            );


        if (!gallery || !empty) {

            return;

        }


        renderDiscovery();


        gallery.innerHTML =
            "";


        if (
            currentImagesTab !==
            "my-images"
        ) {

            gallery.style.display =
                "none";

            empty.style.display =
                "none";

            return;

        }


        gallery.style.display =
            "grid";


        if (!imagesData.length) {

            empty.style.display =
                "flex";

            return;

        }


        empty.style.display =
            "none";


        imagesData.forEach(
            function (
                image,
                index
            ) {

                gallery.appendChild(
                    createImageCard(
                        image,
                        index
                    )
                );

            }
        );

    }


    /* =========================================================
       CREATE IMAGE CARD
       ========================================================= */

    function createImageCard(
        image,
        index
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "pingme-images-card";


        card.innerHTML = `

            <button
                type="button"
                class="pingme-images-card-image-button"
                aria-label="Open image"
            >

                <img
                    class="pingme-images-card-image"
                    src="${escapeHtml(
                        image.url
                    )}"
                    alt="${escapeHtml(
                        image.prompt ||
                        "Generated image"
                    )}"
                    loading="lazy"
                >

            </button>


            <div
                class="pingme-images-card-info"
            >

                <div
                    class="pingme-images-card-prompt"
                >
                    ${escapeHtml(
                        image.prompt ||
                        "Generated image"
                    )}
                </div>


                <div
                    class="pingme-images-card-date"
                >
                    ${formatImageDate(
                        image.createdAt
                    )}
                </div>


                <div
                    class="pingme-images-card-actions"
                >

                    <button
                        type="button"
                        data-image-action="preview"
                    >
                        Preview
                    </button>

                    <button
                        type="button"
                        data-image-action="download"
                    >
                        Download
                    </button>

                    <button
                        type="button"
                        data-image-action="regenerate"
                    >
                        Regenerate
                    </button>

                    <button
                        type="button"
                        data-image-action="delete"
                        class="danger"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;


        const imageButton =
            card.querySelector(
                ".pingme-images-card-image-button"
            );


        if (imageButton) {

            imageButton.addEventListener(
                "click",
                function () {

                    openImagePreview(
                        index
                    );

                }
            );

        }


        card
            .querySelectorAll(
                "[data-image-action]"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            handleImageAction(
                                button.getAttribute(
                                    "data-image-action"
                                ),
                                index
                            );

                        }
                    );

                }
            );


        return card;

    }


    /* =========================================================
       IMAGE ACTIONS
       ========================================================= */

    function handleImageAction(
        action,
        index
    ) {

        const image =
            imagesData[index];


        if (!image) {

            return;

        }


        if (action === "preview") {

            openImagePreview(
                index
            );

        }


        if (action === "download") {

            downloadImage(
                image
            );

        }


        if (action === "regenerate") {

            regenerateImage(
                image
            );

        }


        if (action === "delete") {

            deleteImage(
                index
            );

        }

    }


    /* =========================================================
       DELETE IMAGE
       ========================================================= */

    function deleteImage(
        index
    ) {

        if (!imagesData[index]) {

            return;

        }


        if (
            !window.confirm(
                "Delete this image?"
            )
        ) {

            return;

        }


        imagesData.splice(
            index,
            1
        );


        saveImages();

        renderImages();

    }


    /* =========================================================
       REGENERATE IMAGE
       ========================================================= */

    function regenerateImage(
        image
    ) {

        if (!image) {

            return;

        }


        openGenerateDialog(
            image.prompt ||
            ""
        );


        setTimeout(
            function () {

                const model =
                    document.getElementById(
                        "pingmeImagesModel"
                    );

                const size =
                    document.getElementById(
                        "pingmeImagesSize"
                    );

                const quality =
                    document.getElementById(
                        "pingmeImagesQuality"
                    );


                if (
                    model &&
                    image.model
                ) {

                    model.value =
                        image.model;

                }


                if (
                    size &&
                    image.size
                ) {

                    size.value =
                        image.size;

                }


                if (
                    quality &&
                    image.quality
                ) {

                    quality.value =
                        image.quality;

                }

            },
            50
        );

    }


    /* =========================================================
       DOWNLOAD IMAGE
       ========================================================= */

    function downloadImage(
        image
    ) {

        if (
            !image ||
            !image.url
        ) {

            return;

        }


        const link =
            document.createElement(
                "a"
            );


        link.href =
            image.url;


        link.download =
            "pingme-image-" +
            (
                image.id ||
                Date.now()
            ) +
            ".png";


        link.target =
            "_blank";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();

    }


    /* =========================================================
       IMAGE PREVIEW
       ========================================================= */

    function openImagePreview(
        index
    ) {

        const image =
            imagesData[index];


        if (!image) {

            return;

        }


        currentPreviewIndex =
            index;


        closeImagePreview();


        const preview =
            document.createElement(
                "div"
            );


        preview.id =
            "pingmeImagesPreview";


        preview.innerHTML = `

            <div
                class="pingme-images-preview-overlay"
                id="pingmeImagesPreviewOverlay"
            ></div>


            <div
                class="pingme-images-preview-panel"
            >

                <button
                    type="button"
                    class="pingme-images-preview-close"
                    id="pingmeImagesPreviewClose"
                >
                    ×
                </button>


                <button
                    type="button"
                    class="pingme-images-preview-prev"
                    id="pingmeImagesPreviewPrev"
                    aria-label="Previous image"
                >
                    ‹
                </button>


                <div
                    class="pingme-images-preview-image-wrap"
                >

                    <img
                        src="${escapeHtml(
                            image.url
                        )}"
                        alt="${escapeHtml(
                            image.prompt ||
                            "Generated image"
                        )}"
                    >

                </div>


                <button
                    type="button"
                    class="pingme-images-preview-next"
                    id="pingmeImagesPreviewNext"
                    aria-label="Next image"
                >
                    ›
                </button>


                <div
                    class="pingme-images-preview-info"
                >

                    <div
                        class="pingme-images-preview-prompt"
                    >
                        ${escapeHtml(
                            image.prompt ||
                            "Generated image"
                        )}
                    </div>


                    <div
                        class="pingme-images-preview-meta"
                    >

                        ${escapeHtml(
                            image.model ||
                            ""
                        )}

                        ${
                            image.size
                                ? " • " +
                                  escapeHtml(
                                      image.size
                                  )
                                : ""
                        }

                        ${
                            image.quality
                                ? " • " +
                                  escapeHtml(
                                      image.quality
                                  )
                                : ""
                        }

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            preview
        );


        const closeButton =
            document.getElementById(
                "pingmeImagesPreviewClose"
            );

        const overlay =
            document.getElementById(
                "pingmeImagesPreviewOverlay"
            );

        const previousButton =
            document.getElementById(
                "pingmeImagesPreviewPrev"
            );

        const nextButton =
            document.getElementById(
                "pingmeImagesPreviewNext"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeImagePreview
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeImagePreview
            );

        }


        if (previousButton) {

            previousButton.addEventListener(
                "click",
                showPreviousImage
            );

        }


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                showNextImage
            );

        }

    }


    /* =========================================================
       CLOSE IMAGE PREVIEW
       ========================================================= */

    function closeImagePreview() {

        const preview =
            document.getElementById(
                "pingmeImagesPreview"
            );


        if (preview) {

            preview.remove();

        }


        currentPreviewIndex =
            -1;

    }


    /* =========================================================
       PREVIOUS IMAGE
       ========================================================= */

    function showPreviousImage() {

        if (!imagesData.length) {

            return;

        }


        let index =
            currentPreviewIndex -
            1;


        if (index < 0) {

            index =
                imagesData.length -
                1;

        }


        openImagePreview(
            index
        );

    }


    /* =========================================================
       NEXT IMAGE
       ========================================================= */

    function showNextImage() {

        if (!imagesData.length) {

            return;

        }


        let index =
            currentPreviewIndex +
            1;


        if (
            index >=
            imagesData.length
        ) {

            index = 0;

        }


        openImagePreview(
            index
        );

    }


    /* =========================================================
       KEYBOARD CONTROLS
       ========================================================= */

    function setupKeyboardControls() {

        document.addEventListener(
            "keydown",
            function (event) {

                const preview =
                    document.getElementById(
                        "pingmeImagesPreview"
                    );

                const dialog =
                    document.getElementById(
                        "pingmeImagesGenerateDialog"
                    );


                if (
                    event.key ===
                    "Escape"
                ) {

                    if (preview) {

                        closeImagePreview();

                        return;

                    }


                    if (dialog) {

                        closeGenerateDialog();

                        return;

                    }


                    if (
                        imagesPanel &&
                        imagesPanel.classList.contains(
                            "active"
                        )
                    ) {

                        closeImages();

                    }

                }


                if (
                    preview &&
                    currentPreviewIndex >= 0
                ) {

                    if (
                        event.key ===
                        "ArrowLeft"
                    ) {

                        showPreviousImage();

                    }


                    if (
                        event.key ===
                        "ArrowRight"
                    ) {

                        showNextImage();

                    }

                }

            }
        );

    }


    /* =========================================================
       FORMAT DATE
       ========================================================= */

    function formatImageDate(
        value
    ) {

        if (!value) {

            return "";

        }


        try {

            return new Date(
                value
            ).toLocaleString();

        } catch (_) {

            return "";

        }

    }


    /* =========================================================
       ESCAPE HTML
       ========================================================= */

    function escapeHtml(
        value
    ) {

        if (
            value === null ||
            typeof value ===
                "undefined"
        ) {

            return "";

        }


        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =========================================================
       STYLES
       ========================================================= */

    function addImagesStyles() {

        if (
            document.getElementById(
                "pingmeImagesStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "pingmeImagesStyles";


        style.textContent = `

            #pingmeImagesPanel {

                position: fixed;
                inset: 0;
                z-index: 10000;
                display: none;

            }


            #pingmeImagesPanel.active {

                display: block;

            }


            .pingme-images-overlay {

                position: absolute;
                inset: 0;

                background:
                    rgba(
                        0,
                        0,
                        0,
                        0.45
                    );

            }


            .pingme-images-panel {

                position: absolute;

                top: 0;
                right: 0;

                width:
                    min(
                        100%,
                        560px
                    );

                height: 100%;

                background:
                    #ffffff;

                display:
                    flex;

                flex-direction:
                    column;

                box-shadow:
                    -10px
                    0
                    30px
                    rgba(
                        0,
                        0,
                        0,
                        0.15
                    );

            }


            .pingme-images-header {

                height: 64px;

                flex:
                    0 0 64px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                position:
                    relative;

                border-bottom:
                    1px solid
                    #e5e7eb;

            }


            .pingme-images-back {

                position:
                    absolute;

                left:
                    14px;

                width:
                    40px;

                height:
                    40px;

                border:
                    0;

                border-radius:
                    50%;

                background:
                    #f3f4f6;

                font-size:
                    30px;

                line-height:
                    1;

                cursor:
                    pointer;

            }


            .pingme-images-title {

                font-size:
                    18px;

                font-weight:
                    700;

            }


            .pingme-images-content {

                flex:
                    1;

                overflow-y:
                    auto;

                padding:
                    18px 18px 28px;

            }


            /* HERO */

            .pingme-images-hero {

                padding:
                    22px;

                border-radius:
                    22px;

                background:
                    linear-gradient(
                        135deg,
                        #111827,
                        #374151
                    );

                color:
                    #ffffff;

                margin-bottom:
                    18px;

            }


            .pingme-images-hero-badge {

                font-size:
                    10px;

                font-weight:
                    800;

                letter-spacing:
                    1.2px;

                opacity:
                    .78;

                margin-bottom:
                    9px;

            }


            .pingme-images-hero-title {

                font-size:
                    24px;

                font-weight:
                    800;

                line-height:
                    1.15;

            }


            .pingme-images-hero-text {

                margin-top:
                    8px;

                font-size:
                    13px;

                line-height:
                    1.55;

                opacity:
                    .82;

            }


            /* TABS */

            .pingme-images-tabs {

                display:
                    flex;

                gap:
                    6px;

                padding:
                    5px;

                background:
                    #f3f4f6;

                border-radius:
                    14px;

                margin-bottom:
                    20px;

            }


            .pingme-images-tab {

                flex:
                    1;

                border:
                    0;

                background:
                    transparent;

                border-radius:
                    10px;

                padding:
                    10px 8px;

                font-size:
                    13px;

                font-weight:
                    700;

                color:
                    #6b7280;

                cursor:
                    pointer;

            }


            .pingme-images-tab.active {

                background:
                    #ffffff;

                color:
                    #111827;

                box-shadow:
                    0
                    1px
                    5px
                    rgba(
                        0,
                        0,
                        0,
                        .08
                    );

            }


            /* DISCOVERY */

            .pingme-images-section-heading {

                display:
                    flex;

                justify-content:
                    space-between;

                margin-bottom:
                    12px;

            }


            .pingme-images-section-title {

                font-size:
                    17px;

                font-weight:
                    800;

            }


            .pingme-images-section-subtitle {

                margin-top:
                    3px;

                color:
                    #6b7280;

                font-size:
                    11px;

                line-height:
                    1.4;

            }


            .pingme-images-discovery-grid {

                display:
                    grid;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );

                gap:
                    11px;

            }


            .pingme-images-discovery-card {

                position:
                    relative;

                min-width:
                    0;

                aspect-ratio:
                    1 / 1.16;

                padding:
                    0;

                border:
                    0;

                border-radius:
                    16px;

                overflow:
                    hidden;

                background:
                    #e5e7eb;

                cursor:
                    pointer;

                text-align:
                    left;

            }


            .pingme-images-discovery-card img {

                display:
                    block;

                width:
                    100%;

                height:
                    100%;

                object-fit:
                    cover;

                transition:
                    transform
                    .3s
                    ease;

            }


            .pingme-images-discovery-card:hover img {

                transform:
                    scale(
                        1.04
                    );

            }


            .pingme-images-discovery-gradient {

                position:
                    absolute;

                inset:
                    35% 0 0;

                background:
                    linear-gradient(
                        transparent,
                        rgba(
                            0,
                            0,
                            0,
                            .72
                        )
                    );

            }


            .pingme-images-discovery-info {

                position:
                    absolute;

                left:
                    12px;

                right:
                    10px;

                bottom:
                    11px;

                color:
                    #ffffff;

            }


            .pingme-images-discovery-info strong {

                display:
                    block;

                font-size:
                    13px;

                line-height:
                    1.2;

            }


            .pingme-images-discovery-info small {

                display:
                    block;

                margin-top:
                    3px;

                font-size:
                    10px;

                opacity:
                    .78;

            }


            /* GENERATE BUTTON */

            .pingme-images-toolbar {

                display:
                    flex;

                justify-content:
                    flex-end;

                margin:
                    20px
                    0
                    12px;

            }


            .pingme-images-generate {

                border:
                    0;

                border-radius:
                    12px;

                padding:
                    11px
                    16px;

                background:
                    #111827;

                color:
                    #ffffff;

                font-size:
                    13px;

                font-weight:
                    700;

                cursor:
                    pointer;

            }


            /* MY IMAGES */

            .pingme-images-gallery {

                display:
                    grid;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );

                gap:
                    14px;

            }


            .pingme-images-card {

                overflow:
                    hidden;

                border:
                    1px solid
                    #e5e7eb;

                border-radius:
                    16px;

                background:
                    #ffffff;

            }


            .pingme-images-card-image-button {

                width:
                    100%;

                display:
                    block;

                padding:
                    0;

                border:
                    0;

                background:
                    #f3f4f6;

                cursor:
                    pointer;

            }


            .pingme-images-card-image {

                display:
                    block;

                width:
                    100%;

                aspect-ratio:
                    1 / 1;

                object-fit:
                    cover;

            }


            .pingme-images-card-info {

                padding:
                    11px;

            }


            .pingme-images-card-prompt {

                font-size:
                    12px;

                line-height:
                    1.4;

                font-weight:
                    600;

                display:
                    -webkit-box;

                -webkit-line-clamp:
                    2;

                -webkit-box-orient:
                    vertical;

                overflow:
                    hidden;

            }


            .pingme-images-card-date {

                margin-top:
                    5px;

                color:
                    #6b7280;

                font-size:
                    10px;

            }


            .pingme-images-card-actions {

                display:
                    flex;

                flex-wrap:
                    wrap;

                gap:
                    5px;

                margin-top:
                    9px;

            }


            .pingme-images-card-actions button {

                border:
                    1px solid
                    #e5e7eb;

                border-radius:
                    8px;

                padding:
                    6px
                    7px;

                background:
                    #ffffff;

                font-size:
                    10px;

                cursor:
                    pointer;

            }


            .pingme-images-card-actions button.danger {

                color:
                    #dc2626;

            }


            /* EMPTY */

            .pingme-images-empty {

                min-height:
                    300px;

                display:
                    flex;

                flex-direction:
                    column;

                align-items:
                    center;

                justify-content:
                    center;

                text-align:
                    center;

            }


            .pingme-images-empty-icon {

                width:
                    62px;

                height:
                    62px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    16px;

                background:
                    #f3f4f6;

                margin-bottom:
                    14px;

                font-size:
                    28px;

            }


            .pingme-images-empty-title {

                font-size:
                    19px;

                font-weight:
                    700;

                margin-bottom:
                    7px;

            }


            .pingme-images-empty-text {

                max-width:
                    280px;

                font-size:
                    13px;

                line-height:
                    1.5;

                color:
                    #6b7280;

            }


            /* GENERATE DIALOG */

            #pingmeImagesGenerateDialog {

                position:
                    fixed;

                inset:
                    0;

                z-index:
                    11000;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                padding:
                    18px;

            }


            .pingme-images-dialog-overlay {

                position:
                    absolute;

                inset:
                    0;

                background:
                    rgba(
                        0,
                        0,
                        0,
                        .55
                    );

            }


            .pingme-images-dialog {

                position:
                    relative;

                width:
                    min(
                        100%,
                        520px
                    );

                max-height:
                    90vh;

                overflow-y:
                    auto;

                background:
                    #ffffff;

                border-radius:
                    18px;

                box-shadow:
                    0
                    20px
                    60px
                    rgba(
                        0,
                        0,
                        0,
                        .25
                    );

            }


            .pingme-images-dialog-header {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    space-between;

                padding:
                    18px
                    20px;

                border-bottom:
                    1px solid
                    #e5e7eb;

            }


            .pingme-images-dialog-title {

                font-size:
                    18px;

                font-weight:
                    700;

            }


            .pingme-images-dialog-close {

                width:
                    36px;

                height:
                    36px;

                border:
                    0;

                border-radius:
                    10px;

                background:
                    transparent;

                font-size:
                    26px;

                cursor:
                    pointer;

            }


            .pingme-images-dialog-body {

                padding:
                    20px;

            }


            .pingme-images-field-label {

                display:
                    block;

                margin-bottom:
                    8px;

                font-size:
                    14px;

                font-weight:
                    600;

            }


            .pingme-images-prompt {

                width:
                    100%;

                box-sizing:
                    border-box;

                resize:
                    vertical;

                border:
                    1px solid
                    #d1d5db;

                border-radius:
                    12px;

                padding:
                    12px;

                font-family:
                    inherit;

                font-size:
                    14px;

                outline:
                    none;

            }


            .pingme-images-prompt:focus {

                border-color:
                    #111827;

            }


            .pingme-images-prompt-error {

                min-height:
                    18px;

                margin-top:
                    6px;

                color:
                    #dc2626;

                font-size:
                    12px;

            }


            .pingme-images-options {

                display:
                    grid;

                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );

                gap:
                    12px;

                margin-top:
                    12px;

            }


            .pingme-images-option label {

                display:
                    block;

                margin-bottom:
                    6px;

                font-size:
                    12px;

                font-weight:
                    600;

            }


            .pingme-images-option select {

                width:
                    100%;

                box-sizing:
                    border-box;

                border:
                    1px solid
                    #d1d5db;

                border-radius:
                    10px;

                padding:
                    10px;

                background:
                    #ffffff;

                font-size:
                    13px;

            }


            .pingme-images-generation-error {

                margin-top:
                    14px;

                color:
                    #dc2626;

                font-size:
                    13px;

                line-height:
                    1.5;

            }


            .pingme-images-dialog-footer {

                display:
                    flex;

                justify-content:
                    flex-end;

                gap:
                    10px;

                padding:
                    16px
                    20px;

                border-top:
                    1px solid
                    #e5e7eb;

            }


            .pingme-images-cancel,
            .pingme-images-generate-confirm {

                border:
                    0;

                border-radius:
                    10px;

                padding:
                    10px
                    16px;

                font-size:
                    13px;

                font-weight:
                    700;

                cursor:
                    pointer;

            }


            .pingme-images-cancel {

                background:
                    #f3f4f6;

                color:
                    #111827;

            }


            .pingme-images-generate-confirm {

                background:
                    #111827;

                color:
                    #ffffff;

            }


            .pingme-images-cancel:disabled,
            .pingme-images-generate-confirm:disabled {

                opacity:
                    .6;

                cursor:
                    not-allowed;

            }


            .pingme-images-spinner {

                display:
                    inline-block;

                width:
                    13px;

                height:
                    13px;

                margin-right:
                    7px;

                vertical-align:
                    -2px;

                border:
                    2px
                    solid
                    rgba(
                        255,
                        255,
                        255,
                        .4
                    );

                border-top-color:
                    #ffffff;

                border-radius:
                    50%;

                animation:
                    pingmeImagesSpin
                    .7s
                    linear
                    infinite;

            }


            @keyframes pingmeImagesSpin {

                to {

                    transform:
                        rotate(
                            360deg
                        );

                }

            }


            /* PREVIEW */

            #pingmeImagesPreview {

                position:
                    fixed;

                inset:
                    0;

                z-index:
                    12000;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                padding:
                    20px;

            }


            .pingme-images-preview-overlay {

                position:
                    absolute;

                inset:
                    0;

                background:
                    rgba(
                        0,
                        0,
                        0,
                        .86
                    );

            }


            .pingme-images-preview-panel {

                position:
                    relative;

                width:
                    min(
                        100%,
                        900px
                    );

                max-height:
                    95vh;

                display:
                    flex;

                flex-direction:
                    column;

                align-items:
                    center;

                justify-content:
                    center;

            }


            .pingme-images-preview-image-wrap {

                max-width:
                    100%;

                max-height:
                    75vh;

                overflow:
                    hidden;

                border-radius:
                    12px;

            }


            .pingme-images-preview-image-wrap img {

                display:
                    block;

                max-width:
                    100%;

                max-height:
                    75vh;

                object-fit:
                    contain;

            }


            .pingme-images-preview-close,
            .pingme-images-preview-prev,
            .pingme-images-preview-next {

                position:
                    absolute;

                z-index:
                    2;

                width:
                    42px;

                height:
                    42px;

                border:
                    0;

                border-radius:
                    50%;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .92
                    );

                color:
                    #111827;

                font-size:
                    28px;

                cursor:
                    pointer;

            }


            .pingme-images-preview-close {

                top:
                    -10px;

                right:
                    -10px;

            }


            .pingme-images-preview-prev {

                left:
                    -55px;

                top:
                    50%;

                transform:
                    translateY(
                        -50%
                    );

            }


            .pingme-images-preview-next {

                right:
                    -55px;

                top:
                    50%;

                transform:
                    translateY(
                        -50%
                    );

            }


            .pingme-images-preview-info {

                width:
                    min(
                        100%,
                        700px
                    );

                margin-top:
                    14px;

                padding:
                    12px
                    16px;

                border-radius:
                    12px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        .95
                    );

            }


            .pingme-images-preview-prompt {

                font-size:
                    13px;

                line-height:
                    1.5;

                font-weight:
                    600;

            }


            .pingme-images-preview-meta {

                margin-top:
                    5px;

                color:
                    #6b7280;

                font-size:
                    11px;

            }


            /* MOBILE */

            @media (
                max-width: 600px
            ) {

                .pingme-images-panel {

                    width:
                        100%;

                }


                .pingme-images-content {

                    padding:
                        14px
                        14px
                        24px;

                }


                .pingme-images-hero {

                    padding:
                        19px;

                    border-radius:
                        18px;

                }


                .pingme-images-hero-title {

                    font-size:
                        21px;

                }


                .pingme-images-discovery-grid {

                    gap:
                        9px;

                }


                .pingme-images-gallery {

                    grid-template-columns:
                        1fr;

                }


                .pingme-images-options {

                    grid-template-columns:
                        1fr;

                }


                .pingme-images-preview-prev {

                    left:
                        8px;

                }


                .pingme-images-preview-next {

                    right:
                        8px;

                }


                .pingme-images-preview-close {

                    top:
                        8px;

                    right:
                        8px;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =========================================================
       INITIALIZE
       ========================================================= */

    function initImages() {

        loadSavedImages();

        setupKeyboardControls();

        console.log(
            "PingMe AI — Images Support Ready"
        );

    }


    addImagesStyles();

    initImages();


    /* =========================================================
       PUBLIC API
       ========================================================= */

    window.PingMeImages = {

        init:
            initImages,

        open:
            openImages,

        close:
            closeImages

    };


})();
