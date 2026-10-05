// ==========================================================
// PingMe AI — Images Support
// Complete Images UI + Gallery + Pollinations Generation
// ==========================================================

(function () {

    "use strict";

    /* =========================================================
       STATE
       ========================================================= */

    let imagesPanel = null;

    let imagesData = [];

    let currentPreviewIndex = -1;

    let currentTab = "trending";

    let selectedReferenceImage = null;

    let isGenerating = false;

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

                imagesData = parsed.filter(
                    function (image) {

                        return (
                            image &&
                            typeof image === "object" &&
                            image.url
                        );

                    }
                );

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

            /*
             * localStorage can become full when many large
             * generated images are saved.
             */

            if (
                error &&
                (
                    error.name === "QuotaExceededError" ||
                    error.code === 22
                )
            ) {

                try {

                    /*
                     * Keep the newest images first.
                     */

                    imagesData =
                        imagesData.slice(
                            0,
                            Math.max(
                                1,
                                Math.floor(
                                    imagesData.length * 0.7
                                )
                            )
                        );

                    localStorage.setItem(
                        IMAGES_STORAGE_KEY,
                        JSON.stringify(imagesData)
                    );

                } catch (retryError) {

                    console.error(
                        "PingMe AI — Images Storage Full:",
                        retryError
                    );

                }

            }

        }

    }


    /* =========================================================
       TEMPLATE DATA
       ========================================================= */

    const IMAGE_TEMPLATES = [

        {
            id: "template_nature",
            title: "Dreamy Nature",
            prompt:
                "A breathtaking cinematic mountain landscape at golden hour, misty valleys, dramatic clouds, realistic photography, highly detailed",
            imageUrl:
                "https://image.pollinations.ai/prompt/A%20breathtaking%20cinematic%20mountain%20landscape%20at%20golden%20hour%2C%20misty%20valleys%2C%20dramatic%20clouds%2C%20realistic%20photography%2C%20highly%20detailed?width=768&height=768&nologo=true"
        },

        {
            id: "template_portrait",
            title: "Studio Portrait",
            prompt:
                "A professional cinematic studio portrait, soft dramatic lighting, elegant fashion, realistic skin texture, premium photography",
            imageUrl:
                "https://image.pollinations.ai/prompt/A%20professional%20cinematic%20studio%20portrait%2C%20soft%20dramatic%20lighting%2C%20elegant%20fashion%2C%20realistic%20skin%20texture%2C%20premium%20photography?width=768&height=768&nologo=true"
        },

        {
            id: "template_city",
            title: "Neon City",
            prompt:
                "A futuristic neon city at night, glowing signs, wet streets, cinematic atmosphere, cyberpunk architecture, ultra detailed",
            imageUrl:
                "https://image.pollinations.ai/prompt/A%20futuristic%20neon%20city%20at%20night%2C%20glowing%20signs%2C%20wet%20streets%2C%20cinematic%20atmosphere%2C%20cyberpunk%20architecture%2C%20ultra%20detailed?width=768&height=768&nologo=true"
        },

        {
            id: "template_product",
            title: "Product Studio",
            prompt:
                "A premium product advertisement on a clean studio background, dramatic softbox lighting, realistic reflections, luxury commercial photography",
            imageUrl:
                "https://image.pollinations.ai/prompt/A%20premium%20product%20advertisement%20on%20a%20clean%20studio%20background%2C%20dramatic%20softbox%20lighting%2C%20realistic%20reflections%2C%20luxury%20commercial%20photography?width=768&height=768&nologo=true"
        },

        {
            id: "template_food",
            title: "Food Photography",
            prompt:
                "Beautiful professional food photography, delicious gourmet dish, warm restaurant lighting, shallow depth of field, realistic details",
            imageUrl:
                "https://image.pollinations.ai/prompt/Beautiful%20professional%20food%20photography%2C%20delicious%20gourmet%20dish%2C%20warm%20restaurant%20lighting%2C%20shallow%20depth%20of%20field%2C%20realistic%20details?width=768&height=768&nologo=true"
        },

        {
            id: "template_fantasy",
            title: "Fantasy World",
            prompt:
                "A magical fantasy world with glowing waterfalls, ancient castle, enchanted forest, cinematic lighting, epic concept art",
            imageUrl:
                "https://image.pollinations.ai/prompt/A%20magical%20fantasy%20world%20with%20glowing%20waterfalls%2C%20ancient%20castle%2C%20enchanted%20forest%2C%20cinematic%20lighting%2C%20epic%20concept%20art?width=768&height=768&nologo=true"
        }

    ];


    /* =========================================================
       CREATE MAIN PANEL
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

            <div
                class="pingme-images-shell"
            >

                <!-- HEADER -->

                <header
                    class="pingme-images-header"
                >

                    <button
                        type="button"
                        class="pingme-images-back"
                        id="pingmeImagesBack"
                        aria-label="Back"
                    >
                        <span>‹</span>
                    </button>

                    <div
                        class="pingme-images-title"
                    >
                        Images
                    </div>

                    <div
                        class="pingme-images-header-space"
                    ></div>

                </header>


                <!-- SCROLL CONTENT -->

                <main
                    class="pingme-images-content"
                    id="pingmeImagesContent"
                >

                    <!-- NOTICE -->

                    <section
                        class="pingme-images-notice"
                    >

                        <div
                            class="pingme-images-notice-icon"
                        >
                            ✦
                        </div>

                        <div
                            class="pingme-images-notice-content"
                        >

                            <div
                                class="pingme-images-notice-title"
                            >
                                Create images with PingMe AI
                            </div>

                            <div
                                class="pingme-images-notice-text"
                            >
                                Describe anything you imagine and
                                turn your ideas into beautiful images.
                            </div>

                        </div>

                    </section>


                    <!-- TABS -->

                    <div
                        class="pingme-images-tabs"
                        role="tablist"
                    >

                        <button
                            type="button"
                            class="pingme-images-tab active"
                            data-images-tab="trending"
                            role="tab"
                            aria-selected="true"
                        >
                            Trending
                        </button>

                        <button
                            type="button"
                            class="pingme-images-tab"
                            data-images-tab="templates"
                            role="tab"
                            aria-selected="false"
                        >
                            Templates
                        </button>

                    </div>


                    <!-- DISCOVERY AREA -->

                    <section
                        id="pingmeImagesDiscovery"
                        class="pingme-images-discovery"
                    ></section>


                    <!-- MY IMAGES -->

                    <section
                        class="pingme-my-images-section"
                    >

                        <div
                            class="pingme-section-heading"
                        >

                            <div>

                                <div
                                    class="pingme-section-title"
                                >
                                    My images
                                </div>

                                <div
                                    class="pingme-section-subtitle"
                                >
                                    Images you've created with PingMe AI
                                </div>

                            </div>

                            <div
                                class="pingme-my-images-count"
                                id="pingmeMyImagesCount"
                            >
                                0
                            </div>

                        </div>


                        <div
                            class="pingme-images-gallery"
                            id="pingmeImagesGallery"
                        ></div>


                        <div
                            class="pingme-images-empty"
                            id="pingmeImagesEmpty"
                        >

                            <div
                                class="pingme-images-empty-icon"
                            >
                                ✦
                            </div>

                            <div
                                class="pingme-images-empty-title"
                            >
                                No images yet
                            </div>

                            <div
                                class="pingme-images-empty-text"
                            >
                                Describe an image below and
                                your creations will appear here.
                            </div>

                        </div>

                    </section>


                    <!-- BOTTOM SPACE -->

                    <div
                        class="pingme-images-bottom-space"
                    ></div>

                </main>


                <!-- FIXED GENERATION BAR -->

                <div
                    class="pingme-images-composer-wrap"
                >

                    <div
                        class="pingme-images-reference-preview"
                        id="pingmeImagesReferencePreview"
                    ></div>


                    <div
                        class="pingme-images-composer"
                    >

                        <button
                            type="button"
                            class="pingme-images-composer-button"
                            id="pingmeImagesAttach"
                            aria-label="Add reference image"
                            title="Add image"
                        >
                            <span>＋</span>
                        </button>

                        <textarea
                            id="pingmeImagesPrompt"
                            class="pingme-images-composer-input"
                            placeholder="Describe an image"
                            rows="1"
                            maxlength="4000"
                            aria-label="Describe an image"
                        ></textarea>

                        <button
                            type="button"
                            class="pingme-images-composer-button mic"
                            id="pingmeImagesMic"
                            aria-label="Voice input"
                            title="Voice input"
                        >
                            <span>⌕</span>
                        </button>

                        <button
                            type="button"
                            class="pingme-images-send"
                            id="pingmeImagesSend"
                            aria-label="Generate image"
                            title="Generate image"
                        >
                            <span>↑</span>
                        </button>

                    </div>


                    <div
                        class="pingme-images-composer-hint"
                        id="pingmeImagesComposerHint"
                    >
                        AI generated images may take a moment
                    </div>

                </div>


                <!-- HIDDEN FILE INPUT -->

                <input
                    type="file"
                    id="pingmeImagesFileInput"
                    accept="image/*"
                    hidden
                />

            </div>

        `;

        document.body.appendChild(
            imagesPanel
        );

        setupImagesEvents();

        renderDiscovery();

        renderImages();

        return imagesPanel;

    }


    /* =========================================================
       SETUP MAIN EVENTS
       ========================================================= */

    function setupImagesEvents() {

        const backButton =
            document.getElementById(
                "pingmeImagesBack"
            );

        const prompt =
            document.getElementById(
                "pingmeImagesPrompt"
            );

        const sendButton =
            document.getElementById(
                "pingmeImagesSend"
            );

        const micButton =
            document.getElementById(
                "pingmeImagesMic"
            );

        const attachButton =
            document.getElementById(
                "pingmeImagesAttach"
            );

        const fileInput =
            document.getElementById(
                "pingmeImagesFileInput"
            );

        if (backButton) {

            backButton.addEventListener(
                "click",
                closeImages
            );

        }

        if (prompt) {

            prompt.addEventListener(
                "input",
                autoResizePrompt
            );

            prompt.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        handleGenerateImage();

                    }

                }
            );

        }

        if (sendButton) {

            sendButton.addEventListener(
                "click",
                handleGenerateImage
            );

        }

        if (micButton) {

            micButton.addEventListener(
                "click",
                handleVoiceInput
            );

        }

        if (attachButton && fileInput) {

            attachButton.addEventListener(
                "click",
                function () {

                    fileInput.click();

                }
            );

            fileInput.addEventListener(
                "change",
                handleReferenceImage
            );

        }

        const tabs =
            imagesPanel.querySelectorAll(
                "[data-images-tab]"
            );

        tabs.forEach(
            function (tab) {

                tab.addEventListener(
                    "click",
                    function () {

                        const name =
                            tab.getAttribute(
                                "data-images-tab"
                            );

                        setImagesTab(
                            name
                        );

                    }
                );

            }
        );

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

        loadSavedImages();

        renderImages();

        renderDiscovery();

        setTimeout(
            function () {

                const prompt =
                    document.getElementById(
                        "pingmeImagesPrompt"
                    );

                if (prompt) {

                    prompt.focus();

                }

            },
            100
        );

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

        closeImagePreview();

        stopVoiceRecognition();

    }


    /* =========================================================
       SET TAB
       ========================================================= */

    function setImagesTab(
        tabName
    ) {

        if (
            tabName !== "trending" &&
            tabName !== "templates"
        ) {

            tabName = "trending";

        }

        currentTab =
            tabName;

        const tabs =
            imagesPanel.querySelectorAll(
                "[data-images-tab]"
            );

        tabs.forEach(
            function (tab) {

                const active =
                    tab.getAttribute(
                        "data-images-tab"
                    ) === tabName;

                tab.classList.toggle(
                    "active",
                    active
                );

                tab.setAttribute(
                    "aria-selected",
                    active ?
                    "true" :
                    "false"
                );

            }
        );

        renderDiscovery();

    }


    /* =========================================================
       RENDER DISCOVERY
       ========================================================= */

    function renderDiscovery() {

        if (!imagesPanel) {

            return;

        }

        const container =
            document.getElementById(
                "pingmeImagesDiscovery"
            );

        if (!container) {

            return;

        }

        container.innerHTML = "";

        if (currentTab === "templates") {

            renderTemplateCards(
                container
            );

            return;

        }

        renderTrendingCards(
            container
        );

    }


    /* =========================================================
       RENDER TRENDING
       ========================================================= */

    function renderTrendingCards(
        container
    ) {

        const title =
            document.createElement("div");

        title.className =
            "pingme-discovery-label";

        title.textContent =
            "Trending now";

        container.appendChild(
            title
        );

        const grid =
            document.createElement("div");

        grid.className =
            "pingme-discovery-grid";

        IMAGE_TEMPLATES
            .slice(
                0,
                6
            )
            .forEach(
                function (item) {

                    grid.appendChild(
                        createDiscoveryCard(
                            item
                        )
                    );

                }
            );

        container.appendChild(
            grid
        );

    }


    /* =========================================================
       RENDER TEMPLATES
       ========================================================= */

    function renderTemplateCards(
        container
    ) {

        const title =
            document.createElement("div");

        title.className =
            "pingme-discovery-label";

        title.textContent =
            "Ready-to-use templates";

        container.appendChild(
            title
        );

        const grid =
            document.createElement("div");

        grid.className =
            "pingme-discovery-grid";

        IMAGE_TEMPLATES.forEach(
            function (item) {

                grid.appendChild(
                    createDiscoveryCard(
                        item
                    )
                );

            }
        );

        container.appendChild(
            grid
        );

    }


    /* =========================================================
       CREATE DISCOVERY CARD
       ========================================================= */

    function createDiscoveryCard(
        item
    ) {

        const card =
            document.createElement("button");

        card.type =
            "button";

        card.className =
            "pingme-discovery-card";

        card.innerHTML = `

            <div
                class="pingme-discovery-image-wrap"
            >

                <img
                    src="${escapeHtml(
                        item.imageUrl
                    )}"
                    alt="${escapeHtml(
                        item.title
                    )}"
                    loading="lazy"
                >

                <div
                    class="pingme-discovery-overlay"
                >

                    <span>
                        Use idea
                    </span>

                </div>

            </div>

            <div
                class="pingme-discovery-card-title"
            >
                ${escapeHtml(
                    item.title
                )}
            </div>

        `;

        card.addEventListener(
            "click",
            function () {

                useTemplate(
                    item
                );

            }
        );

        return card;

    }


    /* =========================================================
       USE TEMPLATE
       ========================================================= */

    function useTemplate(
        template
    ) {

        const prompt =
            document.getElementById(
                "pingmeImagesPrompt"
            );

        if (!prompt) {

            return;

        }

        prompt.value =
            template.prompt ||
            "";

        autoResizePrompt();

        prompt.focus();

    }


    /* =========================================================
       GENERATION
       ========================================================= */

    async function handleGenerateImage() {

        if (isGenerating) {

            return;

        }

        const promptElement =
            document.getElementById(
                "pingmeImagesPrompt"
            );

        if (!promptElement) {

            return;

        }

        const prompt =
            promptElement.value.trim();

        if (!prompt) {

            showComposerMessage(
                "Describe the image you want to create."
            );

            promptElement.focus();

            return;

        }

        if (prompt.length > 4000) {

            showComposerMessage(
                "Your prompt is too long. Please shorten it."
            );

            return;

        }

        const options = {

            prompt:
                prompt,

            model:
                "flux",

            size:
                "1024x1024",

            quality:
                "auto",

            count:
                1,

            referenceImage:
                selectedReferenceImage ?
                selectedReferenceImage.dataUrl :
                null

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
                        : "Image generation failed."
                );

            }

            if (
                Array.isArray(
                    result.images
                )
            ) {

                for (
                    let i = 0;
                    i < result.images.length;
                    i++
                ) {

                    await addImageToGallery(
                        result.images[i],
                        options
                    );

                }

            }

            promptElement.value =
                "";

            autoResizePrompt();

            clearReferenceImage();

            renderImages();

            showComposerMessage(
                "Image created successfully."
            );

            scrollToMyImages();

        } catch (error) {

            console.error(
                "PingMe AI — Image Generation Error:",
                error
            );

            showComposerMessage(
                error.message ||
                "Image generation failed."
            );

        } finally {

            setGenerateLoading(
                false
            );

        }

    }


    /* =========================================================
       GENERATION LOADING
       ========================================================= */

    function setGenerateLoading(
        loading
    ) {

        isGenerating =
            loading;

        const sendButton =
            document.getElementById(
                "pingmeImagesSend"
            );

        const hint =
            document.getElementById(
                "pingmeImagesComposerHint"
            );

        if (!sendButton) {

            return;

        }

        if (loading) {

            sendButton.disabled =
                true;

            sendButton.classList.add(
                "loading"
            );

            sendButton.innerHTML = `
                <span
                    class="pingme-images-spinner"
                ></span>
            `;

            if (hint) {

                hint.textContent =
                    "Creating your image…";

            }

        } else {

            sendButton.disabled =
                false;

            sendButton.classList.remove(
                "loading"
            );

            sendButton.innerHTML =
                "<span>↑</span>";

            if (hint) {

                hint.textContent =
                    "AI generated images may take a moment";

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
                                    1024,

                                referenceImage:
                                    options.referenceImage ||
                                    null

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

                    /* Ignore JSON parsing errors */

                }

                return {

                    success: false,

                    images: [],

                    error:
                        errorMessage

                };

            }

            const contentType =
                (
                    response.headers
                        .get("content-type") ||
                    ""
                ).toLowerCase();


            /*
             * JSON response support.
             */

            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                const data =
                    await response.json();

                if (
                    data &&
                    Array.isArray(
                        data.images
                    )
                ) {

                    return {

                        success: true,

                        images:
                            data.images,

                        error:
                            null

                    };

                }

                if (
                    data &&
                    (
                        data.url ||
                        data.image ||
                        data.dataUrl
                    )
                ) {

                    return {

                        success: true,

                        images: [
                            data.url ||
                            data.image ||
                            data.dataUrl
                        ],

                        error:
                            null

                    };

                }

            }


            /*
             * Blob response support.
             */

            const imageBlob =
                await response.blob();

            const dataUrl =
                await blobToDataUrl(
                    imageBlob
                );

            if (!dataUrl) {

                return {

                    success: false,

                    images: [],

                    error:
                        "The image response was empty."

                };

            }

            return {

                success: true,

                images: [
                    dataUrl
                ],

                error:
                    null

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
       BLOB TO DATA URL
       ========================================================= */

    function blobToDataUrl(
        blob
    ) {

        return new Promise(
            function (
                resolve,
                reject
            ) {

                const reader =
                    new FileReader();

                reader.onload =
                    function () {

                        resolve(
                            reader.result
                        );

                    };

                reader.onerror =
                    function () {

                        reject(
                            reader.error
                        );

                    };

                reader.readAsDataURL(
                    blob
                );

            }
        );

    }


    /* =========================================================
       ADD IMAGE TO GALLERY
       ========================================================= */

    async function addImageToGallery(
        image,
        options
    ) {

        if (!image) {

            return;

        }

        let imageUrl = "";

        if (
            typeof image === "string"
        ) {

            imageUrl =
                image;

        } else if (
            image.url
        ) {

            imageUrl =
                image.url;

        } else if (
            image.dataUrl
        ) {

            imageUrl =
                image.dataUrl;

        } else if (
            image.b64_json
        ) {

            imageUrl =
                "data:image/png;base64," +
                image.b64_json;

        }

        if (!imageUrl) {

            return;

        }


        /*
         * If the API still returns a blob URL,
         * convert it into a persistent Data URL.
         */

        if (
            imageUrl.indexOf(
                "blob:"
            ) === 0
        ) {

            try {

                const response =
                    await fetch(
                        imageUrl
                    );

                const blob =
                    await response.blob();

                imageUrl =
                    await blobToDataUrl(
                        blob
                    );

            } catch (error) {

                console.error(
                    "PingMe AI — Blob Conversion Error:",
                    error
                );

                return;

            }

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
                imageUrl,

            prompt:
                options.prompt,

            model:
                options.model ||
                "flux",

            size:
                options.size ||
                "1024x1024",

            quality:
                options.quality ||
                "auto",

            createdAt:
                new Date().toISOString()

        };


        imagesData.unshift(
            imageRecord
        );

        saveImages();

    }


    /* =========================================================
       RENDER MY IMAGES
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

        const count =
            document.getElementById(
                "pingmeMyImagesCount"
            );

        if (
            !gallery ||
            !empty
        ) {

            return;

        }

        gallery.innerHTML =
            "";


        if (count) {

            count.textContent =
                String(
                    imagesData.length
                );

        }


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
            document.createElement("article");

        card.className =
            "pingme-images-card";


        const imageButton =
            document.createElement("button");

        imageButton.type =
            "button";

        imageButton.className =
            "pingme-images-card-image-button";

        imageButton.setAttribute(
            "aria-label",
            "Open image"
        );


        const img =
            document.createElement("img");

        img.className =
            "pingme-images-card-image";

        img.src =
            image.url;

        img.alt =
            image.prompt ||
            "Generated image";

        img.loading =
            "lazy";


        imageButton.appendChild(
            img
        );


        const info =
            document.createElement("div");

        info.className =
            "pingme-images-card-info";


        const prompt =
            document.createElement("div");

        prompt.className =
            "pingme-images-card-prompt";

        prompt.textContent =
            image.prompt ||
            "Generated image";


        const date =
            document.createElement("div");

        date.className =
            "pingme-images-card-date";

        date.textContent =
            formatImageDate(
                image.createdAt
            );


        const actions =
            document.createElement("div");

        actions.className =
            "pingme-images-card-actions";


        actions.appendChild(
            createActionButton(
                "Preview",
                "preview",
                index
            )
        );

        actions.appendChild(
            createActionButton(
                "Download",
                "download",
                index
            )
        );

        actions.appendChild(
            createActionButton(
                "Regenerate",
                "regenerate",
                index
            )
        );

        actions.appendChild(
            createActionButton(
                "Delete",
                "delete",
                index,
                true
            )
        );


        info.appendChild(
            prompt
        );

        info.appendChild(
            date
        );

        info.appendChild(
            actions
        );


        card.appendChild(
            imageButton
        );

        card.appendChild(
            info
        );


        imageButton.addEventListener(
            "click",
            function () {

                openImagePreview(
                    index
                );

            }
        );


        return card;

    }


    /* =========================================================
       CREATE ACTION BUTTON
       ========================================================= */

    function createActionButton(
        text,
        action,
        index,
        danger
    ) {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.textContent =
            text;

        button.setAttribute(
            "data-image-action",
            action
        );

        if (danger) {

            button.classList.add(
                "danger"
            );

        }

        button.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                handleImageAction(
                    action,
                    index
                );

            }
        );

        return button;

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
                "Delete this image from My images?"
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

        const prompt =
            document.getElementById(
                "pingmeImagesPrompt"
            );

        if (!prompt) {

            return;

        }

        prompt.value =
            image.prompt ||
            "";

        autoResizePrompt();

        prompt.focus();

    }


    /* =========================================================
       DOWNLOAD IMAGE
       ========================================================= */

    async function downloadImage(
        image
    ) {

        if (
            !image ||
            !image.url
        ) {

            return;

        }

        try {

            const response =
                await fetch(
                    image.url
                );

            const blob =
                await response.blob();

            const url =
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href =
                url;

            link.download =
                "pingme-image-" +
                (
                    image.id ||
                    Date.now()
                ) +
                ".png";

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                },
                1000
            );

        } catch (error) {

            /*
             * Fallback for remote images where fetch
             * is blocked by browser CORS.
             */

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

            <div
                class="pingme-images-preview-panel"
            >

                <button
                    type="button"
                    class="pingme-images-preview-close"
                    id="pingmeImagesPreviewClose"
                    aria-label="Close preview"
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
                            "flux"
                        )}
                        ${
                            image.createdAt
                                ? " • " +
                                  escapeHtml(
                                      formatImageDate(
                                          image.createdAt
                                      )
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

        setupPreviewEvents();

    }


    /* =========================================================
       PREVIEW EVENTS
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
       CLOSE PREVIEW
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
       REFERENCE IMAGE
       ========================================================= */

    function handleReferenceImage(
        event
    ) {

        const file =
            event.target.files &&
            event.target.files[0];

        if (!file) {

            return;

        }

        if (
            !file.type ||
            file.type.indexOf(
                "image/"
            ) !== 0
        ) {

            showComposerMessage(
                "Please select an image file."
            );

            return;

        }

        if (
            file.size >
            10 * 1024 * 1024
        ) {

            showComposerMessage(
                "Please choose an image smaller than 10 MB."
            );

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function () {

                selectedReferenceImage = {

                    name:
                        file.name,

                    type:
                        file.type,

                    dataUrl:
                        reader.result

                };

                renderReferenceImage();

            };


        reader.onerror =
            function () {

                showComposerMessage(
                    "Could not read that image."
                );

            };


        reader.readAsDataURL(
            file
        );


        event.target.value =
            "";

    }


    /* =========================================================
       RENDER REFERENCE IMAGE
       ========================================================= */

    function renderReferenceImage() {

        const container =
            document.getElementById(
                "pingmeImagesReferencePreview"
            );

        if (!container) {

            return;

        }

        if (!selectedReferenceImage) {

            container.innerHTML =
                "";

            container.classList.remove(
                "active"
            );

            return;

        }

        container.classList.add(
            "active"
        );

        container.innerHTML = `

            <div
                class="pingme-reference-card"
            >

                <img
                    src="${escapeHtml(
                        selectedReferenceImage.dataUrl
                    )}"
                    alt="Reference image"
                >

                <div
                    class="pingme-reference-info"
                >

                    <div>
                        Reference image
                    </div>

                    <small>
                        ${escapeHtml(
                            selectedReferenceImage.name
                        )}
                    </small>

                </div>

                <button
                    type="button"
                    id="pingmeImagesRemoveReference"
                    aria-label="Remove reference image"
                >
                    ×
                </button>

            </div>

        `;


        const removeButton =
            document.getElementById(
                "pingmeImagesRemoveReference"
            );

        if (removeButton) {

            removeButton.addEventListener(
                "click",
                clearReferenceImage
            );

        }

    }


    /* =========================================================
       CLEAR REFERENCE IMAGE
       ========================================================= */

    function clearReferenceImage() {

        selectedReferenceImage =
            null;

        renderReferenceImage();

    }


    /* =========================================================
       VOICE INPUT
       ========================================================= */

    let voiceRecognition =
        null;

    let voiceListening =
        false;


    function handleVoiceInput() {

        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!Recognition) {

            showComposerMessage(
                "Voice input is not supported by this browser."
            );

            return;

        }


        if (voiceListening) {

            stopVoiceRecognition();

            return;

        }


        if (!voiceRecognition) {

            voiceRecognition =
                new Recognition();

            voiceRecognition.lang =
                navigator.language ||
                "en-US";

            voiceRecognition.interimResults =
                true;

            voiceRecognition.continuous =
                false;


            voiceRecognition.onstart =
                function () {

                    voiceListening =
                        true;

                    updateMicState();

                };


            voiceRecognition.onresult =
                function (
                    event
                ) {

                    const prompt =
                        document.getElementById(
                            "pingmeImagesPrompt"
                        );

                    if (!prompt) {

                        return;

                    }

                    let transcript =
                        "";

                    for (
                        let i = 0;
                        i < event.results.length;
                        i++
                    ) {

                        transcript +=
                            event.results[i][0]
                                .transcript;

                    }

                    if (transcript) {

                        prompt.value =
                            transcript;

                        autoResizePrompt();

                    }

                };


            voiceRecognition.onerror =
                function (
                    event
                ) {

                    console.warn(
                        "PingMe AI — Voice Input:",
                        event.error
                    );

                    voiceListening =
                        false;

                    updateMicState();

                };


            voiceRecognition.onend =
                function () {

                    voiceListening =
                        false;

                    updateMicState();

                };

        }


        try {

            voiceRecognition.start();

        } catch (error) {

            console.warn(
                "PingMe AI — Voice Start Error:",
                error
            );

        }

    }


    /* =========================================================
       STOP VOICE
       ========================================================= */

    function stopVoiceRecognition() {

        if (!voiceRecognition) {

            return;

        }

        try {

            voiceRecognition.stop();

        } catch (error) {

            /* Ignore */

        }

        voiceListening =
            false;

        updateMicState();

    }


    /* =========================================================
       UPDATE MIC STATE
       ========================================================= */

    function updateMicState() {

        const button =
            document.getElementById(
                "pingmeImagesMic"
            );

        if (!button) {

            return;

        }

        button.classList.toggle(
            "recording",
            voiceListening
        );

    }


    /* =========================================================
       AUTO RESIZE PROMPT
       ========================================================= */

    function autoResizePrompt() {

        const prompt =
            document.getElementById(
                "pingmeImagesPrompt"
            );

        if (!prompt) {

            return;

        }

        prompt.style.height =
            "auto";

        prompt.style.height =
            Math.min(
                prompt.scrollHeight,
                120
            ) +
            "px";

    }


    /* =========================================================
       COMPOSER MESSAGE
       ========================================================= */

    function showComposerMessage(
        message
    ) {

        const hint =
            document.getElementById(
                "pingmeImagesComposerHint"
            );

        if (!hint) {

            return;

        }

        hint.textContent =
            message;

        hint.classList.add(
            "message"
        );


        clearTimeout(
            showComposerMessage.timer
        );


        showComposerMessage.timer =
            setTimeout(
                function () {

                    if (!isGenerating) {

                        hint.textContent =
                            "AI generated images may take a moment";

                        hint.classList.remove(
                            "message"
                        );

                    }

                },
                3500
            );

    }


    /* =========================================================
       SCROLL TO MY IMAGES
       ========================================================= */

    function scrollToMyImages() {

        const section =
            imagesPanel &&
            imagesPanel.querySelector(
                ".pingme-my-images-section"
            );

        if (!section) {

            return;

        }

        setTimeout(
            function () {

                section.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            150
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


                if (
                    event.key === "Escape"
                ) {

                    if (preview) {

                        closeImagePreview();

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


                if (preview) {

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

        addImagesStyles();

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

            /* =================================================
               MAIN PANEL
               ================================================= */

            #pingmeImagesPanel {

                position: fixed;

                inset: 0;

                z-index: 10000;

                display: none;

                background:
                    #f8fafc;

            }


            #pingmeImagesPanel.active {

                display: block;

            }


            .pingme-images-shell {

                position: relative;

                width: 100%;

                height: 100%;

                display: flex;

                flex-direction: column;

                overflow: hidden;

                background:
                    #f8fafc;

            }


            /* =================================================
               HEADER
               ================================================= */

            .pingme-images-header {

                flex:
                    0 0 64px;

                height: 64px;

                display: flex;

                align-items: center;

                justify-content: center;

                position: relative;

                z-index: 3;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.94
                    );

                border-bottom:
                    1px solid
                    rgba(
                        15,
                        23,
                        42,
                        0.07
                    );

                backdrop-filter:
                    blur(18px);

                -webkit-backdrop-filter:
                    blur(18px);

            }


            .pingme-images-back {

                position: absolute;

                left: 14px;

                top: 12px;

                width: 40px;

                height: 40px;

                display: flex;

                align-items: center;

                justify-content: center;

                border: 0;

                border-radius: 50%;

                background:
                    #f1f5f9;

                color:
                    #0f172a;

                font-size: 31px;

                line-height: 1;

                cursor: pointer;

                transition:
                    transform 0.18s ease,
                    background 0.18s ease;

            }


            .pingme-images-back:active {

                transform:
                    scale(0.92);

            }


            .pingme-images-back:hover {

                background:
                    #e2e8f0;

            }


            .pingme-images-title {

                font-size:
                    18px;

                font-weight:
                    700;

                color:
                    #0f172a;

                letter-spacing:
                    -0.2px;

            }


            .pingme-images-header-space {

                position:
                    absolute;

                right:
                    14px;

                width:
                    40px;

                height:
                    40px;

            }


            /* =================================================
               CONTENT
               ================================================= */

            .pingme-images-content {

                flex:
                    1;

                overflow-y:
                    auto;

                overflow-x:
                    hidden;

                padding:
                    18px
                    16px
                    150px;

                -webkit-overflow-scrolling:
                    touch;

                scrollbar-width:
                    thin;

            }


            /* =================================================
               NOTICE
               ================================================= */

            .pingme-images-notice {

                position:
                    relative;

                display:
                    flex;

                align-items:
                    center;

                gap:
                    14px;

                padding:
                    17px;

                margin-bottom:
                    20px;

                border-radius:
                    20px;

                overflow:
                    hidden;

                background:
                    linear-gradient(
                        135deg,
                        #111827,
                        #334155
                    );

                color:
                    #ffffff;

                box-shadow:
                    0 12px 30px
                    rgba(
                        15,
                        23,
                        42,
                        0.14
                    );

            }


            .pingme-images-notice::after {

                content:
                    "";

                position:
                    absolute;

                width:
                    150px;

                height:
                    150px;

                right:
                    -55px;

                top:
                    -70px;

                border-radius:
                    50%;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.09
                    );

            }


            .pingme-images-notice-icon {

                flex:
                    0 0 44px;

                width:
                    44px;

                height:
                    44px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    14px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.13
                    );

                font-size:
                    23px;

            }


            .pingme-images-notice-title {

                font-size:
                    15px;

                font-weight:
                    700;

                margin-bottom:
                    4px;

            }


            .pingme-images-notice-text {

                max-width:
                    420px;

                font-size:
                    12px;

                line-height:
                    1.5;

                color:
                    rgba(
                        255,
                        255,
                        255,
                        0.78
                    );

            }


            /* =================================================
               TABS
               ================================================= */

            .pingme-images-tabs {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    8px;

                margin-bottom:
                    15px;

            }


            .pingme-images-tab {

                border:
                    0;

                border-radius:
                    999px;

                padding:
                    9px
                    15px;

                background:
                    #e9eef5;

                color:
                    #64748b;

                font-size:
                    13px;

                font-weight:
                    600;

                cursor:
                    pointer;

                transition:
                    all 0.18s ease;

            }


            .pingme-images-tab.active {

                background:
                    #0f172a;

                color:
                    #ffffff;

            }


            /* =================================================
               DISCOVERY
               ================================================= */

            .pingme-discovery-label {

                margin-bottom:
                    10px;

                color:
                    #334155;

                font-size:
                    14px;

                font-weight:
                    700;

            }


            .pingme-discovery-grid {

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

                margin-bottom:
                    26px;

            }


            .pingme-discovery-card {

                min-width:
                    0;

                padding:
                    0;

                overflow:
                    hidden;

                border:
                    0;

                border-radius:
                    17px;

                background:
                    #ffffff;

                box-shadow:
                    0 5px 18px
                    rgba(
                        15,
                        23,
                        42,
                        0.08
                    );

                text-align:
                    left;

                cursor:
                    pointer;

                transition:
                    transform 0.18s ease,
                    box-shadow 0.18s ease;

            }


            .pingme-discovery-card:hover {

                transform:
                    translateY(-2px);

                box-shadow:
                    0 9px 24px
                    rgba(
                        15,
                        23,
                        42,
                        0.13
                    );

            }


            .pingme-discovery-card:active {

                transform:
                    scale(0.98);

            }


            .pingme-discovery-image-wrap {

                position:
                    relative;

                width:
                    100%;

                aspect-ratio:
                    1 / 1;

                overflow:
                    hidden;

                background:
                    #e2e8f0;

            }


            .pingme-discovery-image-wrap img {

                display:
                    block;

                width:
                    100%;

                height:
                    100%;

                object-fit:
                    cover;

                transition:
                    transform 0.35s ease;

            }


            .pingme-discovery-card:hover
            .pingme-discovery-image-wrap img {

                transform:
                    scale(1.045);

            }


            .pingme-discovery-overlay {

                position:
                    absolute;

                inset:
                    0;

                display:
                    flex;

                align-items:
                    flex-end;

                justify-content:
                    center;

                padding:
                    12px;

                background:
                    linear-gradient(
                        transparent 45%,
                        rgba(
                            0,
                            0,
                            0,
                            0.62
                        )
                    );

                opacity:
                    0;

                transition:
                    opacity 0.2s ease;

            }


            .pingme-discovery-card:hover
            .pingme-discovery-overlay {

                opacity:
                    1;

            }


            .pingme-discovery-overlay span {

                padding:
                    7px
                    11px;

                border-radius:
                    999px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.94
                    );

                color:
                    #0f172a;

                font-size:
                    11px;

                font-weight:
                    700;

            }


            .pingme-discovery-card-title {

                padding:
                    11px
                    12px
                    13px;

                color:
                    #1e293b;

                font-size:
                    12px;

                font-weight:
                    650;

            }


            /* =================================================
               MY IMAGES
               ================================================= */

            .pingme-my-images-section {

                margin-top:
                    2px;

            }


            .pingme-section-heading {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    space-between;

                gap:
                    12px;

                margin-bottom:
                    13px;

            }


            .pingme-section-title {

                color:
                    #0f172a;

                font-size:
                    16px;

                font-weight:
                    750;

            }


            .pingme-section-subtitle {

                margin-top:
                    3px;

                color:
                    #94a3b8;

                font-size:
                    11px;

            }


            .pingme-my-images-count {

                min-width:
                    28px;

                height:
                    28px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                padding:
                    0 8px;

                border-radius:
                    999px;

                background:
                    #e2e8f0;

                color:
                    #475569;

                font-size:
                    11px;

                font-weight:
                    700;

            }


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
                    12px;

            }


            .pingme-images-card {

                min-width:
                    0;

                overflow:
                    hidden;

                border:
                    1px solid
                    rgba(
                        15,
                        23,
                        42,
                        0.07
                    );

                border-radius:
                    17px;

                background:
                    #ffffff;

                box-shadow:
                    0 5px 18px
                    rgba(
                        15,
                        23,
                        42,
                        0.06
                    );

            }


            .pingme-images-card-image-button {

                display:
                    block;

                width:
                    100%;

                padding:
                    0;

                border:
                    0;

                background:
                    #e2e8f0;

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
                    10px;

            }


            .pingme-images-card-prompt {

                display:
                    -webkit-box;

                overflow:
                    hidden;

                -webkit-line-clamp:
                    2;

                -webkit-box-orient:
                    vertical;

                min-height:
                    30px;

                color:
                    #334155;

                font-size:
                    11px;

                line-height:
                    1.4;

                font-weight:
                    600;

            }


            .pingme-images-card-date {

                margin-top:
                    5px;

                color:
                    #94a3b8;

                font-size:
                    9px;

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

                flex:
                    1 1 auto;

                min-width:
                    0;

                border:
                    1px solid
                    #e2e8f0;

                border-radius:
                    8px;

                padding:
                    6px 7px;

                background:
                    #ffffff;

                color:
                    #475569;

                font-size:
                    9px;

                font-weight:
                    600;

                cursor:
                    pointer;

            }


            .pingme-images-card-actions button:hover {

                background:
                    #f8fafc;

            }


            .pingme-images-card-actions
            button.danger {

                color:
                    #dc2626;

            }


            /* =================================================
               EMPTY STATE
               ================================================= */

            .pingme-images-empty {

                min-height:
                    190px;

                display:
                    flex;

                flex-direction:
                    column;

                align-items:
                    center;

                justify-content:
                    center;

                padding:
                    24px;

                border:
                    1px dashed
                    #cbd5e1;

                border-radius:
                    18px;

                text-align:
                    center;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.55
                    );

            }


            .pingme-images-empty-icon {

                width:
                    52px;

                height:
                    52px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                margin-bottom:
                    11px;

                border-radius:
                    16px;

                background:
                    #e2e8f0;

                color:
                    #64748b;

                font-size:
                    22px;

            }


            .pingme-images-empty-title {

                color:
                    #334155;

                font-size:
                    15px;

                font-weight:
                    700;

            }


            .pingme-images-empty-text {

                max-width:
                    280px;

                margin-top:
                    5px;

                color:
                    #94a3b8;

                font-size:
                    11px;

                line-height:
                    1.5;

            }


            /* =================================================
               COMPOSER
               ================================================= */

            .pingme-images-composer-wrap {

                position:
                    absolute;

                left:
                    0;

                right:
                    0;

                bottom:
                    0;

                z-index:
                    10;

                padding:
                    8px
                    12px
                    calc(
                        10px +
                        env(
                            safe-area-inset-bottom
                        )
                    );

                background:
                    linear-gradient(
                        to top,
                        #f8fafc 65%,
                        rgba(
                            248,
                            250,
                            252,
                            0
                        )
                    );

            }


            .pingme-images-composer {

                display:
                    flex;

                align-items:
                    flex-end;

                gap:
                    7px;

                min-height:
                    52px;

                padding:
                    6px;

                border:
                    1px solid
                    rgba(
                        15,
                        23,
                        42,
                        0.11
                    );

                border-radius:
                    18px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.96
                    );

                box-shadow:
                    0 10px 30px
                    rgba(
                        15,
                        23,
                        42,
                        0.12
                    );

                backdrop-filter:
                    blur(16px);

                -webkit-backdrop-filter:
                    blur(16px);

            }


            .pingme-images-composer-input {

                flex:
                    1;

                min-width:
                    0;

                max-height:
                    120px;

                height:
                    36px;

                resize:
                    none;

                border:
                    0;

                outline:
                    0;

                padding:
                    9px
                    2px;

                background:
                    transparent;

                color:
                    #0f172a;

                font-family:
                    inherit;

                font-size:
                    14px;

                line-height:
                    1.35;

            }


            .pingme-images-composer-input::placeholder {

                color:
                    #94a3b8;

            }


            .pingme-images-composer-button,
            .pingme-images-send {

                flex:
                    0 0 36px;

                width:
                    36px;

                height:
                    36px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border:
                    0;

                border-radius:
                    50%;

                cursor:
                    pointer;

                transition:
                    transform 0.16s ease,
                    background 0.16s ease;

            }


            .pingme-images-composer-button {

                background:
                    #f1f5f9;

                color:
                    #475569;

                font-size:
                    19px;

            }


            .pingme-images-composer-button:hover {

                background:
                    #e2e8f0;

            }


            .pingme-images-composer-button:active,
            .pingme-images-send:active {

                transform:
                    scale(0.91);

            }


            .pingme-images-composer-button.mic {

                font-size:
                    19px;

            }


            .pingme-images-composer-button.mic.recording {

                background:
                    #fee2e2;

                color:
                    #dc2626;

                animation:
                    pingmeMicPulse
                    1s
                    ease-in-out
                    infinite;

            }


            .pingme-images-send {

                background:
                    #0f172a;

                color:
                    #ffffff;

                font-size:
                    20px;

                font-weight:
                    700;

            }


            .pingme-images-send:hover {

                background:
                    #1e293b;

            }


            .pingme-images-send:disabled {

                opacity:
                    0.72;

                cursor:
                    not-allowed;

            }


            .pingme-images-send.loading {

                cursor:
                    wait;

            }


            .pingme-images-composer-hint {

                min-height:
                    14px;

                margin-top:
                    4px;

                text-align:
                    center;

                color:
                    #94a3b8;

                font-size:
                    9px;

                transition:
                    color 0.2s ease;

            }


            .pingme-images-composer-hint.message {

                color:
                    #475569;

            }


            /* =================================================
               REFERENCE IMAGE
               ================================================= */

            .pingme-images-reference-preview {

                display:
                    none;

                margin:
                    0 auto 7px;

                max-width:
                    100%;

            }


            .pingme-images-reference-preview.active {

                display:
                    block;

            }


            .pingme-reference-card {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    9px;

                max-width:
                    280px;

                padding:
                    6px 8px;

                border:
                    1px solid
                    #e2e8f0;

                border-radius:
                    13px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.96
                    );

                box-shadow:
                    0 5px 18px
                    rgba(
                        15,
                        23,
                        42,
                        0.08
                    );

            }


            .pingme-reference-card img {

                width:
                    38px;

                height:
                    38px;

                flex:
                    0 0 38px;

                object-fit:
                    cover;

                border-radius:
                    8px;

            }


            .pingme-reference-info {

                min-width:
                    0;

                flex:
                    1;

                color:
                    #334155;

                font-size:
                    10px;

                font-weight:
                    700;

            }


            .pingme-reference-info small {

                display:
                    block;

                overflow:
                    hidden;

                margin-top:
                    2px;

                color:
                    #94a3b8;

                font-size:
                    9px;

                font-weight:
                    400;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;

            }


            .pingme-reference-card button {

                flex:
                    0 0 27px;

                width:
                    27px;

                height:
                    27px;

                border:
                    0;

                border-radius:
                    50%;

                background:
                    #f1f5f9;

                color:
                    #64748b;

                font-size:
                    18px;

                line-height:
                    1;

                cursor:
                    pointer;

            }


            /* =================================================
               PREVIEW
               ================================================= */

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
                    18px;

            }


            .pingme-images-preview-overlay {

                position:
                    absolute;

                inset:
                    0;

                background:
                    rgba(
                        2,
                        6,
                        23,
                        0.91
                    );

                backdrop-filter:
                    blur(8px);

            }


            .pingme-images-preview-panel {

                position:
                    relative;

                z-index:
                    2;

                width:
                    min(
                        100%,
                        900px
                    );

                max-height:
                    94vh;

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
                    78vh;

                overflow:
                    hidden;

                border-radius:
                    16px;

                background:
                    #0f172a;

                box-shadow:
                    0 25px 70px
                    rgba(
                        0,
                        0,
                        0,
                        0.4
                    );

            }


            .pingme-images-preview-image-wrap img {

                display:
                    block;

                max-width:
                    100%;

                max-height:
                    78vh;

                object-fit:
                    contain;

            }


            .pingme-images-preview-close,
            .pingme-images-preview-prev,
            .pingme-images-preview-next {

                position:
                    absolute;

                z-index:
                    4;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                width:
                    44px;

                height:
                    44px;

                border:
                    0;

                border-radius:
                    50%;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.94
                    );

                color:
                    #0f172a;

                cursor:
                    pointer;

                box-shadow:
                    0 6px 20px
                    rgba(
                        0,
                        0,
                        0,
                        0.2
                    );

            }


            .pingme-images-preview-close {

                top:
                    -12px;

                right:
                    -12px;

                font-size:
                    27px;

            }


            .pingme-images-preview-prev {

                left:
                    -58px;

                top:
                    50%;

                transform:
                    translateY(-50%);

                font-size:
                    31px;

            }


            .pingme-images-preview-next {

                right:
                    -58px;

                top:
                    50%;

                transform:
                    translateY(-50%);

                font-size:
                    31px;

            }


            .pingme-images-preview-info {

                width:
                    min(
                        100%,
                        720px
                    );

                box-sizing:
                    border-box;

                margin-top:
                    12px;

                padding:
                    12px 15px;

                border-radius:
                    13px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.95
                    );

            }


            .pingme-images-preview-prompt {

                color:
                    #1e293b;

                font-size:
                    12px;

                line-height:
                    1.5;

                font-weight:
                    600;

            }


            .pingme-images-preview-meta {

                margin-top:
                    4px;

                color:
                    #64748b;

                font-size:
                    9px;

            }


            /* =================================================
               SPINNER
               ================================================= */

            .pingme-images-spinner {

                display:
                    block;

                width:
                    15px;

                height:
                    15px;

                border:
                    2px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.35
                    );

                border-top-color:
                    #ffffff;

                border-radius:
                    50%;

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


            @keyframes pingmeMicPulse {

                0%,
                100% {

                    transform:
                        scale(1);

                }

                50% {

                    transform:
                        scale(1.06);

                }

            }


            /* =================================================
               MOBILE
               ================================================= */

            @media (
                max-width: 600px
            ) {

                .pingme-images-content {

                    padding:
                        15px
                        12px
                        150px;

                }


                .pingme-images-notice {

                    padding:
                        15px;

                    border-radius:
                        18px;

                }


                .pingme-discovery-grid,
                .pingme-images-gallery {

                    grid-template-columns:
                        repeat(
                            2,
                            minmax(
                                0,
                                1fr
                            )
                        );

                    gap:
                        9px;

                }


                .pingme-images-card-actions {

                    gap:
                        4px;

                }


                .pingme-images-card-actions button {

                    padding:
                        6px 5px;

                    font-size:
                        8px;

                }


                .pingme-images-preview-prev {

                    left:
                        7px;

                }


                .pingme-images-preview-next {

                    right:
                        7px;

                }


                .pingme-images-preview-close {

                    top:
                        7px;

                    right:
                        7px;

                }

            }


            @media (
                min-width: 700px
            ) {

                .pingme-images-content {

                    width:
                        min(
                            100%,
                            760px
                        );

                    margin:
                        0 auto;

                    box-sizing:
                        border-box;

                }


                .pingme-images-composer-wrap {

                    left:
                        50%;

                    right:
                        auto;

                    width:
                        min(
                            calc(
                                100% -
                                24px
                            ),
                            760px
                        );

                    transform:
                        translateX(-50%);

                    background:
                        linear-gradient(
                            to top,
                            #f8fafc 70%,
                            rgba(
                                248,
                                250,
                                252,
                                0
                            )
                        );

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