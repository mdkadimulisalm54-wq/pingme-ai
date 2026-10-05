// ==========================================================
// PingMe AI — Images Support
// ==========================================================

(function () {

    "use strict";

    /* =========================================================
       IMAGES SUPPORT
       ========================================================= */

    let imagesPanel = null;

    let imagesData = [];

    let currentPreviewIndex = -1;

    const IMAGES_STORAGE_KEY =
        "pingme_generated_images";

    /* =========================================================
       LOAD SAVED IMAGES
       ========================================================= */

    function loadSavedImages() {

        try {

            const saved =
                localStorage.getItem(
                    IMAGES_STORAGE_KEY
                );

            if (!saved) {

                imagesData = [];

                return;

            }

            const parsed =
                JSON.parse(saved);

            if (Array.isArray(parsed)) {

                imagesData = parsed;

            } else {

                imagesData = [];

            }

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
                        ×
                    </button>

                    <div class="pingme-images-title">
                        Images
                    </div>

                </div>

                <div class="pingme-images-content">

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
                            Your generated images will appear here.
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
       SETUP EVENTS
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
       OPEN GENERATE DIALOG
       ========================================================= */

    function openGenerateDialog() {

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
                aria-labelledby="pingmeImagesDialogTitle"
            >

                <div class="pingme-images-dialog-header">

                    <div
                        class="pingme-images-dialog-title"
                        id="pingmeImagesDialogTitle"
                    >
                        Generate Image
                    </div>

                    <button
                        type="button"
                        class="pingme-images-dialog-close"
                        id="pingmeImagesDialogClose"
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>

                <div class="pingme-images-dialog-body">

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

                    <div class="pingme-images-options">

                        <div class="pingme-images-option">

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

                        <div class="pingme-images-option">

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

                        <div class="pingme-images-option">

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

                        <div class="pingme-images-option">

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

                <div class="pingme-images-dialog-footer">

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

            setTimeout(
                function () {

                    prompt.focus();

                },
                50
            );

        }

    }

    /* =========================================================
       SETUP GENERATE DIALOG EVENTS
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
       HANDLE GENERATE IMAGE
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

        const generateButton =
            document.getElementById(
                "pingmeImagesGenerateConfirm"
            );

        if (!promptElement) {

            return;

        }

        const prompt =
            promptElement.value.trim();

        if (errorElement) {

            errorElement.textContent = "";

        }

        if (generationError) {

            generationError.textContent = "";

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

            prompt: prompt,

            model:
                modelElement ?
                modelElement.value :
                "gpt-image-1",

            size:
                sizeElement ?
                sizeElement.value :
                "1024x1024",

            quality:
                qualityElement ?
                qualityElement.value :
                "auto",

            count:
                countElement ?
                Number(countElement.value) :
                1

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
       GENERATE LOADING STATE
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

        if (loading) {

            button.disabled = true;

            button.innerHTML = `
                <span
                    class="pingme-images-spinner"
                ></span>
                Generating...
            `;

            if (cancelButton) {

                cancelButton.disabled =
                    true;

            }

        } else {

            button.disabled = false;

            button.textContent =
                "Generate";

            if (cancelButton) {

                cancelButton.disabled =
                    false;

            }

        }

    }

    /* =========================================================
       IMAGE GENERATION API CONNECTOR
       ========================================================= */

       async function requestImageGeneration(
        options
    ) {

        try {

            const response =
                await fetch(
                    "/api/images",
                    {
                        method: "POST",

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

                } catch (error) {

                    /* Ignore JSON parsing error */

                }

                return {

                    success: false,

                    images: [],

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

                success: true,

                images: [
                    imageUrl
                ],

                error: null

            };

        } catch (error) {

            return {

                success: false,

                images: [],

                error:
                    error.message ||
                    "Image generation failed."

            };

        }

    }

    /* =========================================================
       ADD IMAGE TO GALLERY
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
                image.url ||
                image.dataUrl ||
                "",

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

        gallery.innerHTML = "";

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

                const card =
                    createImageCard(
                        image,
                        index
                    );

                gallery.appendChild(
                    card
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
            document.createElement("div");

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
                >

            </button>

            <div class="pingme-images-card-info">

                <div class="pingme-images-card-prompt">
                    ${escapeHtml(
                        image.prompt ||
                        "Generated image"
                    )}
                </div>

                <div class="pingme-images-card-date">
                    ${formatImageDate(
                        image.createdAt
                    )}
                </div>

                <div class="pingme-images-card-actions">

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

        const actionButtons =
            card.querySelectorAll(
                "[data-image-action]"
            );

        actionButtons.forEach(
            function (
                button
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        const action =
                            button.getAttribute(
                                "data-image-action"
                            );

                        handleImageAction(
                            action,
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

        switch (action) {

            case "preview":

                openImagePreview(
                    index
                );

                break;

            case "download":

                downloadImage(
                    image
                );

                break;

            case "regenerate":

                regenerateImage(
                    image
                );

                break;

            case "delete":

                deleteImage(
                    index
                );

                break;

            default:

                break;

        }

    }

    /* =========================================================
       DELETE IMAGE
       ========================================================= */

    function deleteImage(
        index
    ) {

        const image =
            imagesData[index];

        if (!image) {

            return;

        }

        const confirmed =
            window.confirm(
                "Delete this image?"
            );

        if (!confirmed) {

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

        openGenerateDialog();

        setTimeout(
            function () {

                const prompt =
                    document.getElementById(
                        "pingmeImagesPrompt"
                    );

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

                if (prompt) {

                    prompt.value =
                        image.prompt ||
                        "";

                }

                if (model && image.model) {

                    model.value =
                        image.model;

                }

                if (size && image.size) {

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
            document.createElement("a");

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
            document.createElement("div");

        preview.id =
            "pingmeImagesPreview";

        preview.innerHTML = `

            <div
                class="pingme-images-preview-overlay"
                id="pingmeImagesPreviewOverlay"
            ></div>

            <div class="pingme-images-preview-panel">

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

                <div class="pingme-images-preview-image-wrap">

                    <img
                        id="pingmeImagesPreviewImage"
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

                <div class="pingme-images-preview-info">

                    <div class="pingme-images-preview-prompt">
                        ${escapeHtml(
                            image.prompt ||
                            "Generated image"
                        )}
                    </div>

                    <div class="pingme-images-preview-meta">
                        ${escapeHtml(
                            image.model ||
                            ""
                        )}
                        ${image.size
                            ? " • " +
                              escapeHtml(
                                  image.size
                              )
                            : ""}
                        ${image.quality
                            ? " • " +
                              escapeHtml(
                                  image.quality
                              )
                            : ""}
                    </div>

                </div>

            </div>

        `;

        document.body.appendChild(
            preview
        );

        setupPreviewEvents();

    }

    /* =========================================================
       SETUP PREVIEW EVENTS
       ========================================================= */

    function setupPreviewEvents() {

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
            currentPreviewIndex - 1;

        if (index < 0) {

            index =
                imagesData.length - 1;

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
            currentPreviewIndex + 1;

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

                if (
                    event.key === "Escape"
                ) {

                    const preview =
                        document.getElementById(
                            "pingmeImagesPreview"
                        );

                    const dialog =
                        document.getElementById(
                            "pingmeImagesGenerateDialog"
                        );

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
                    document.getElementById(
                        "pingmeImagesPreview"
                    )
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
       FORMAT IMAGE DATE
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

        } catch (error) {

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
            typeof value === "undefined"
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
       INITIALIZE
       ========================================================= */

    function initImages() {

        loadSavedImages();

        setupKeyboardControls();

        console.log(
            "PingMe AI — Images Support Ready"
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
            document.createElement("style");

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
                background: rgba(
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
                width: min(
                    100%,
                    520px
                );
                height: 100%;
                background: #ffffff;
                display: flex;
                flex-direction: column;
                box-shadow:
                    -10px 0 30px
                    rgba(
                        0,
                        0,
                        0,
                        0.15
                    );
            }

            .pingme-images-header {
                height: 64px;
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 0 18px;
                border-bottom:
                    1px solid
                    #e5e7eb;
            }

            .pingme-images-back {
                width: 40px;
                height: 40px;
                border: 0;
                border-radius: 10px;
                background: transparent;
                font-size: 28px;
                cursor: pointer;
            }

            .pingme-images-title {
                font-size: 18px;
                font-weight: 600;
            }

            .pingme-images-content {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
            }

            .pingme-images-toolbar {
                width: 100%;
                display: flex;
                justify-content: flex-end;
                margin-bottom: 24px;
            }

            .pingme-images-generate {
                border: 0;
                border-radius: 12px;
                padding: 12px 18px;
                background: #111827;
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
            }

            .pingme-images-generate:active {
                transform: scale(0.98);
            }

            .pingme-images-gallery {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
                gap: 16px;
            }

            .pingme-images-card {
                overflow: hidden;
                border:
                    1px solid
                    #e5e7eb;
                border-radius: 16px;
                background: #ffffff;
            }

            .pingme-images-card-image-button {
                width: 100%;
                display: block;
                padding: 0;
                border: 0;
                background: #f3f4f6;
                cursor: pointer;
            }

            .pingme-images-card-image {
                display: block;
                width: 100%;
                aspect-ratio: 1 / 1;
                object-fit: cover;
            }

            .pingme-images-card-info {
                padding: 12px;
            }

            .pingme-images-card-prompt {
                font-size: 13px;
                line-height: 1.4;
                font-weight: 500;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .pingme-images-card-date {
                margin-top: 6px;
                color: #6b7280;
                font-size: 11px;
            }

            .pingme-images-card-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 10px;
            }

            .pingme-images-card-actions button {
                border:
                    1px solid
                    #e5e7eb;
                border-radius: 8px;
                padding: 6px 8px;
                background: #ffffff;
                font-size: 11px;
                cursor: pointer;
            }

            .pingme-images-card-actions button.danger {
                color: #dc2626;
            }

            .pingme-images-empty {
                min-height: calc(
                    100% - 80px
                );
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }

            .pingme-images-empty-icon {
                width: 64px;
                height: 64px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 16px;
                background: #f3f4f6;
                margin-bottom: 16px;
                font-size: 28px;
            }

            .pingme-images-empty-title {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .pingme-images-empty-text {
                max-width: 280px;
                font-size: 14px;
                line-height: 1.5;
                color: #6b7280;
            }

            /* =================================================
               GENERATE DIALOG
               ================================================= */

            #pingmeImagesGenerateDialog {
                position: fixed;
                inset: 0;
                z-index: 11000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 18px;
            }

            .pingme-images-dialog-overlay {
                position: absolute;
                inset: 0;
                background:
                    rgba(
                        0,
                        0,
                        0,
                        0.55
                    );
            }

            .pingme-images-dialog {
                position: relative;
                width: min(
                    100%,
                    520px
                );
                max-height: 90vh;
                overflow-y: auto;
                background: #ffffff;
                border-radius: 18px;
                box-shadow:
                    0 20px 60px
                    rgba(
                        0,
                        0,
                        0,
                        0.25
                    );
            }

            .pingme-images-dialog-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18px 20px;
                border-bottom:
                    1px solid
                    #e5e7eb;
            }

            .pingme-images-dialog-title {
                font-size: 18px;
                font-weight: 600;
            }

            .pingme-images-dialog-close {
                width: 36px;
                height: 36px;
                border: 0;
                border-radius: 10px;
                background: transparent;
                font-size: 26px;
                cursor: pointer;
            }

            .pingme-images-dialog-body {
                padding: 20px;
            }

            .pingme-images-field-label {
                display: block;
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 600;
            }

            .pingme-images-prompt {
                width: 100%;
                box-sizing: border-box;
                resize: vertical;
                border:
                    1px solid
                    #d1d5db;
                border-radius: 12px;
                padding: 12px;
                font-family: inherit;
                font-size: 14px;
                outline: none;
            }

            .pingme-images-prompt:focus {
                border-color: #111827;
            }

            .pingme-images-prompt-error {
                min-height: 18px;
                margin-top: 6px;
                color: #dc2626;
                font-size: 12px;
            }

            .pingme-images-options {
                display: grid;
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
                gap: 12px;
                margin-top: 12px;
            }

            .pingme-images-option label {
                display: block;
                margin-bottom: 6px;
                font-size: 12px;
                font-weight: 600;
            }

            .pingme-images-option select {
                width: 100%;
                box-sizing: border-box;
                border:
                    1px solid
                    #d1d5db;
                border-radius: 10px;
                padding: 10px;
                background: #ffffff;
                font-size: 13px;
            }

            .pingme-images-generation-error {
                margin-top: 14px;
                color: #dc2626;
                font-size: 13px;
                line-height: 1.5;
            }

            .pingme-images-dialog-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 16px 20px;
                border-top:
                    1px solid
                    #e5e7eb;
            }

            .pingme-images-cancel,
            .pingme-images-generate-confirm {
                border: 0;
                border-radius: 10px;
                padding: 10px 16px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
            }

            .pingme-images-cancel {
                background: #f3f4f6;
                color: #111827;
            }

            .pingme-images-generate-confirm {
                background: #111827;
                color: #ffffff;
            }

            .pingme-images-cancel:disabled,
            .pingme-images-generate-confirm:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .pingme-images-spinner {
                display: inline-block;
                width: 13px;
                height: 13px;
                margin-right: 7px;
                vertical-align: -2px;
                border:
                    2px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.4
                    );
                border-top-color:
                    #ffffff;
                border-radius: 50%;
                animation:
                    pingmeImagesSpin
                    0.7s
                    linear
                    infinite;
            }

            @keyframes pingmeImagesSpin {

                to {
                    transform:
                        rotate(360deg);
                }

            }

            /* =================================================
               IMAGE PREVIEW
               ================================================= */

            #pingmeImagesPreview {
                position: fixed;
                inset: 0;
                z-index: 12000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .pingme-images-preview-overlay {
                position: absolute;
                inset: 0;
                background:
                    rgba(
                        0,
                        0,
                        0,
                        0.85
                    );
            }

            .pingme-images-preview-panel {
                position: relative;
                width: min(
                    100%,
                    900px
                );
                max-height: 95vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .pingme-images-preview-image-wrap {
                max-width: 100%;
                max-height: 75vh;
                overflow: hidden;
                border-radius: 12px;
            }

            .pingme-images-preview-image-wrap img {
                display: block;
                max-width: 100%;
                max-height: 75vh;
                object-fit: contain;
            }

            .pingme-images-preview-close,
            .pingme-images-preview-prev,
            .pingme-images-preview-next {
                position: absolute;
                z-index: 2;
                width: 42px;
                height: 42px;
                border: 0;
                border-radius: 50%;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.9
                    );
                color: #111827;
                font-size: 28px;
                cursor: pointer;
            }

            .pingme-images-preview-close {
                top: -10px;
                right: -10px;
            }

            .pingme-images-preview-prev {
                left: -55px;
                top: 50%;
                transform:
                    translateY(-50%);
            }

            .pingme-images-preview-next {
                right: -55px;
                top: 50%;
                transform:
                    translateY(-50%);
            }

            .pingme-images-preview-info {
                width: min(
                    100%,
                    700px
                );
                margin-top: 14px;
                padding: 12px 16px;
                border-radius: 12px;
                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.95
                    );
            }

            .pingme-images-preview-prompt {
                font-size: 13px;
                line-height: 1.5;
                font-weight: 500;
            }

            .pingme-images-preview-meta {
                margin-top: 5px;
                color: #6b7280;
                font-size: 11px;
            }

            /* =================================================
               MOBILE
               ================================================= */

            @media (
                max-width: 600px
            ) {

                .pingme-images-panel {
                    width: 100%;
                }

                .pingme-images-content {
                    padding: 18px;
                }

                .pingme-images-toolbar {
                    justify-content: stretch;
                }

                .pingme-images-generate {
                    width: 100%;
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
                    left: 8px;
                }

                .pingme-images-preview-next {
                    right: 8px;
                }

                .pingme-images-preview-close {
                    top: 8px;
                    right: 8px;
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
