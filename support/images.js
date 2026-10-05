// ==========================================================
// PingMe AI — Images Support
// ==========================================================

(function () {

    "use strict";


    /* =========================================================
       IMAGES SUPPORT
       ========================================================= */

    let imagesPanel = null;


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


                    <div class="pingme-images-empty">

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

    }


    /* =========================================================
       INITIALIZE
       ========================================================= */

    function initImages() {

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

        init: initImages,

        open: openImages,

        close: closeImages

    };


})();