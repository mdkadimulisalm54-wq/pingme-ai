/* =========================================================
   PingMe AI — Chat Support
   Fixed Four-Corner Glow Loader
   History Support • Loader Events • Legacy Compatibility
   ========================================================= */

(() => {
    "use strict";

    if (window.__pingmeChatSupportLoaded) return;
    window.__pingmeChatSupportLoaded = true;

    const STYLE_ID = "pingme-chat-support-style";
    const LOADER_ID = "pingmeAiLoaderRow";

    /* =====================================================
       STYLES
       ===================================================== */

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            .user-message {
                align-self: flex-end;
                max-width: 88%;
                overflow-wrap: anywhere;
            }

            .ai-message {
                align-self: flex-start;
                max-width: 100%;
                overflow-wrap: anywhere;
            }

            /* Hide the old star loader */
            .pingme-thinking-row {
                display: none !important;
            }

            #${LOADER_ID} {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                padding: 7px 0;
                box-sizing: border-box;
            }

            .pingme-loader-box {
                position: relative;
                width: 36px;
                height: 36px;
                flex: 0 0 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: visible;
            }

            /* The outline never rotates */
            .pingme-loader-orbit {
                position: absolute;
                inset: 2px;
                box-sizing: border-box;
                border: 1.5px solid rgba(130, 145, 255, .42);
                border-radius: 9px;
                background: transparent;
            }

            /* Only this blue-purple glow travels */
            .pingme-loader-light {
                position: absolute;
                left: 50%;
                top: 50%;
                width: 7px;
                height: 4px;
                border-radius: 50%;
                pointer-events: none;
                background: #9bbaff;
                box-shadow:
                    0 0 4px 1px rgba(106, 156, 255, .8),
                    0 0 9px 2px rgba(153, 116, 255, .45);
                animation: pingmeLightTravel 3.2s linear infinite;
                will-change: transform;
            }

            @keyframes pingmeLightTravel {
                0% {
                    transform: translate(-50%, -17px);
                }
                12.5% {
                    transform: translate(5px, -15px);
                }
                25% {
                    transform: translate(14px, -50%);
                }
                37.5% {
                    transform: translate(14px, 5px);
                }
                50% {
                    transform: translate(-50%, 14px);
                }
                62.5% {
                    transform: translate(-19px, 5px);
                }
                75% {
                    transform: translate(-19px, -50%);
                }
                87.5% {
                    transform: translate(-19px, -15px);
                }
                100% {
                    transform: translate(-50%, -17px);
                }
            }

            .pingme-loader-dots {
                position: relative;
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 3px;
            }

            .pingme-loader-dots span {
                width: 3px;
                height: 3px;
                border-radius: 50%;
                background: #333;
                animation: pingmeDotPulse 1.2s ease-in-out infinite;
            }

            .pingme-loader-dots span:nth-child(2) {
                animation-delay: .15s;
            }

            .pingme-loader-dots span:nth-child(3) {
                animation-delay: .3s;
            }

            @keyframes pingmeDotPulse {
                0%, 60%, 100% {
                    opacity: .45;
                    transform: scale(.85);
                }
                30% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .pingme-loader-light,
                .pingme-loader-dots span {
                    animation-duration: 3.2s;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       LOADER
       ===================================================== */

    function getChatArea() {
        return document.getElementById("chatArea");
    }

    function addLoader() {
        addStyles();

        const area = getChatArea();
        if (!area) return null;

        let row = document.getElementById(LOADER_ID);

        if (!row) {
            row = document.createElement("div");
            row.id = LOADER_ID;
            row.setAttribute("aria-label", "AI is thinking");
            row.setAttribute("role", "status");

            row.innerHTML = `
                <div class="pingme-loader-box">
                    <div class="pingme-loader-orbit"></div>
                    <div class="pingme-loader-light"></div>
                    <div class="pingme-loader-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
        }

        if (row.parentElement !== area) {
            area.appendChild(row);
        }

        return row;
    }

    function showLoader() {
        addLoader();
    }

    function hideLoader() {
        document.getElementById(LOADER_ID)?.remove();
        document.getElementById("pingmeFallbackLoader")?.remove();
        document.getElementById("thinking")?.remove();
        document.querySelectorAll(".pingme-thinking-row").forEach(row => {
            row.remove();
        });
    }

    window.PingMeLoader = {
        show: showLoader,
        hide: hideLoader
    };

    /* =====================================================
       LEGACY SCRIPT COMPATIBILITY
       Detect the old loader row and show the new one.
       ===================================================== */

    let legacyLoaderActive = false;
    let legacyObserver = null;

    function watchLegacyLoader() {
        const area = getChatArea();
        if (!area || legacyObserver) return;

        legacyObserver = new MutationObserver(() => {
            const legacyExists = !!area.querySelector(
                ".pingme-thinking-row"
            );

            if (legacyExists && !legacyLoaderActive) {
                legacyLoaderActive = true;
                showLoader();
            } else if (!legacyExists && legacyLoaderActive) {
                legacyLoaderActive = false;
                document.getElementById(LOADER_ID)?.remove();
            }
        });

        legacyObserver.observe(area, {
            childList: true,
            subtree: true
        });
    }

    function initialize() {
        addStyles();
        watchLegacyLoader();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {
            once: true
        });
    } else {
        initialize();
    }

    /* =====================================================
       LOADER EVENTS
       ===================================================== */

    window.addEventListener("pingme:ai:start", showLoader);
    window.addEventListener("pingme:ai:complete", hideLoader);
    window.addEventListener("pingme:ai:error", hideLoader);

    /* =====================================================
       HISTORY SUPPORT — PRESERVED
       ===================================================== */

    function observeHistoryMessages() {
        const area = getChatArea();
        if (!area || area.dataset.pingmeHistoryObserved === "true") {
            return;
        }

        area.dataset.pingmeHistoryObserved = "true";

        const observer = new MutationObserver(() => {
            area.querySelectorAll(
                ".user-message, .ai-message"
            ).forEach(message => {
                message.dataset.pingmeHistoryMessage = "true";
            });
        });

        observer.observe(area, {
            childList: true,
            subtree: true
        });

        area.querySelectorAll(
            ".user-message, .ai-message"
        ).forEach(message => {
            message.dataset.pingmeHistoryMessage = "true";
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            observeHistoryMessages,
            { once: true }
        );
    } else {
        observeHistoryMessages();
    }

})();