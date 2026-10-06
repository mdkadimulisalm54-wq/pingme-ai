// PingMe AI — Account Support
// =========================================================
// Complete Account / Google Login / Profile Support
// =========================================================

(function () {

    "use strict";


    /* =========================================================
       STATE
       ========================================================= */

    let accountOverlay = null;
    let accountPanel = null;


    /* =========================================================
       CREATE ACCOUNT UI
       ========================================================= */

    function createAccountUI() {

        if (
            document.getElementById(
                "pingmeAccountOverlay"
            )
        ) {
            accountOverlay =
                document.getElementById(
                    "pingmeAccountOverlay"
                );

            accountPanel =
                document.getElementById(
                    "pingmeAccountPanel"
                );

            return;
        }


        accountOverlay =
            document.createElement("div");

        accountOverlay.id =
            "pingmeAccountOverlay";


        accountOverlay.innerHTML = `

            <div
                id="pingmeAccountPanel"
                class="pingme-account-panel"
                role="dialog"
                aria-modal="true"
            >

                <button
                    type="button"
                    class="pingme-account-close"
                    id="pingmeAccountClose"
                    aria-label="Close"
                >
                    ×
                </button>


                <div
                    id="pingmeAccountContent"
                    class="pingme-account-content"
                >
                </div>

            </div>

        `;


        document.body.appendChild(
            accountOverlay
        );


        accountPanel =
            document.getElementById(
                "pingmeAccountPanel"
            );


        const closeButton =
            document.getElementById(
                "pingmeAccountClose"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeAccountPanel
            );

        }


        accountOverlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    accountOverlay
                ) {

                    closeAccountPanel();

                }

            }
        );

    }


    /* =========================================================
       ACCOUNT BUTTON
       ========================================================= */

    function setupAccountButton() {

        /*
         * Account button is created by menu.js.
         * Event delegation makes this work even when
         * the button is dynamically created.
         */

        if (
            window.__pingmeAccountDelegationReady
        ) {
            return;
        }


        window.__pingmeAccountDelegationReady =
            true;


        document.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "#pingmeAccountButton"
                    );


                if (!button) {
                    return;
                }


                event.preventDefault();
                event.stopPropagation();


                openPingMeAccountPanel();

            },
            true
        );

    }


    /* =========================================================
       OPEN ACCOUNT PANEL
       ========================================================= */

    function openPingMeAccountPanel() {

        createAccountUI();

        renderAccountScreen();


        if (accountOverlay) {

            accountOverlay.classList.add(
                "show"
            );

        }


        document.body.classList.add(
            "pingme-account-open"
        );

    }


    /* =========================================================
       CLOSE ACCOUNT PANEL
       ========================================================= */

    function closeAccountPanel() {

        if (!accountOverlay) {
            return;
        }


        accountOverlay.classList.remove(
            "show"
        );


        document.body.classList.remove(
            "pingme-account-open"
        );

    }


    /* =========================================================
       RENDER ACCOUNT SCREEN
       ========================================================= */

    function renderAccountScreen() {

        const content =
            document.getElementById(
                "pingmeAccountContent"
            );


        if (!content) {
            return;
        }


        const user =
            typeof window.getAuthUser ===
            "function"
                ? window.getAuthUser()
                : null;


        if (!user) {

            renderLoginScreen(
                content
            );

            return;

        }


        renderProfileScreen(
            content,
            user
        );

    }


    /* =========================================================
       LOGIN SCREEN
       ========================================================= */

    function renderLoginScreen(
        content
    ) {

        content.innerHTML = `

            <div
                class="pingme-login-screen"
            >

                <div
                    class="pingme-login-logo"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>


                <h2>
                    Welcome to PingMe AI
                </h2>


                <p>
                    Sign in to sync your
                    account and personalize
                    your PingMe experience.
                </p>


                <button
                    type="button"
                    id="pingmeGoogleLogin"
                    class="pingme-google-login"
                >

                    <span
                        class="pingme-google-icon"
                    >
                        G
                    </span>

                    <span>
                        Continue with Google
                    </span>

                </button>


                <div
                    id="pingmeLoginStatus"
                    class="pingme-login-status"
                >
                </div>

            </div>

        `;


        const googleButton =
            document.getElementById(
                "pingmeGoogleLogin"
            );


        if (googleButton) {

            googleButton.addEventListener(
                "click",
                handleGoogleLogin
            );

        }

    }


    /* =========================================================
       GOOGLE LOGIN
       ========================================================= */

    async function handleGoogleLogin() {

        const button =
            document.getElementById(
                "pingmeGoogleLogin"
            );


        const status =
            document.getElementById(
                "pingmeLoginStatus"
            );


        /*
         * Auth Support is loaded as a classic script.
         * Functions are therefore available through
         * the global window scope.
         */

        const googleLoginFunction =
            window.signInWithGoogle;


        if (
            typeof googleLoginFunction !==
            "function"
        ) {

            if (status) {

                status.textContent =
                    "Google Authentication is not connected yet.";

            }


            console.error(
                "PingMe AI — signInWithGoogle() was not found."
            );


            return;

        }


        if (button) {

            button.disabled = true;

            button.innerHTML = `
                <span class="pingme-login-spinner"></span>
                Signing in...
            `;

        }


        if (status) {

            status.textContent = "";

        }


        try {

            const user =
                await googleLoginFunction();


            if (user) {

                updateMenuAccount(
                    user
                );


                renderAccountScreen();


            } else {

                if (status) {

                    status.textContent =
                        "Google Sign-In was not completed.";

                }


                restoreGoogleButton();

            }


        } catch (error) {

            console.error(
                "PingMe AI — Google Login Error:",
                error
            );


            if (status) {

                status.textContent =
                    getFriendlyAuthError(
                        error
                    );

            }


            restoreGoogleButton();

        }

    }


    /* =========================================================
       RESTORE GOOGLE BUTTON
       ========================================================= */

    function restoreGoogleButton() {

        const button =
            document.getElementById(
                "pingmeGoogleLogin"
            );


        if (!button) {
            return;
        }


        button.disabled = false;


        button.innerHTML = `

            <span
                class="pingme-google-icon"
            >
                G
            </span>

            <span>
                Continue with Google
            </span>

        `;

    }


    /* =========================================================
       PROFILE SCREEN
       ========================================================= */

    function renderProfileScreen(
        content,
        user
    ) {

        const name =
            user.displayName ||
            "PingMe User";


        const email =
            user.email ||
            "";


        const photo =
            user.photoURL ||
            "";


        const initial =
            getInitial(
                name,
                email
            );


        content.innerHTML = `

            <div
                class="pingme-profile-screen"
            >

                <div
                    class="pingme-profile-avatar"
                >
                    ${
                        photo
                        ?
                        `
                        <img
                            src="${escapeHTML(photo)}"
                            alt="Profile photo"
                        >
                        `
                        :
                        `
                        <span>
                            ${escapeHTML(initial)}
                        </span>
                        `
                    }
                </div>


                <h2>
                    ${escapeHTML(name)}
                </h2>


                <div
                    class="pingme-profile-email"
                >
                    ${escapeHTML(email)}
                </div>


                <div
                    class="pingme-account-card"
                >

                    <div
                        class="pingme-account-card-icon"
                    >
                        ✓
                    </div>

                    <div>

                        <strong>
                            Google account connected
                        </strong>

                        <span>
                            Your PingMe AI account is
                            signed in.
                        </span>

                    </div>

                </div>


                <button
                    type="button"
                    id="pingmeSettingsButton"
                    class="pingme-account-action"
                >
                    <span>⚙</span>
                    <span>Settings</span>
                    <b>›</b>
                </button>


                <button
                    type="button"
                    id="pingmeLogoutButton"
                    class="pingme-logout-button"
                >
                    Sign out
                </button>


                <div
                    id="pingmeLogoutStatus"
                    class="pingme-login-status"
                >
                </div>

            </div>

        `;


        const logoutButton =
            document.getElementById(
                "pingmeLogoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                handleLogout
            );

        }


        const settingsButton =
            document.getElementById(
                "pingmeSettingsButton"
            );


        if (settingsButton) {

            settingsButton.addEventListener(
                "click",
                function () {

                    openSettings();

                }
            );

        }

    }


    /* =========================================================
       LOGOUT
       ========================================================= */

    async function handleLogout() {

        const button =
            document.getElementById(
                "pingmeLogoutButton"
            );


        const status =
            document.getElementById(
                "pingmeLogoutStatus"
            );


        const logoutFunction =
            window.signOutPingMe;


        if (
            typeof logoutFunction !==
            "function"
        ) {

            if (status) {

                status.textContent =
                    "Authentication system is not connected.";

            }

            return;

        }


        if (button) {

            button.disabled = true;

            button.textContent =
                "Signing out...";

        }


        try {

            await logoutFunction();


            updateMenuAccount(
                null
            );


            renderAccountScreen();


        } catch (error) {

            console.error(
                "PingMe AI — Logout Error:",
                error
            );


            if (status) {

                status.textContent =
                    "Could not sign out.";

            }


            if (button) {

                button.disabled = false;

                button.textContent =
                    "Sign out";

            }

        }

    }


    /* =========================================================
       UPDATE SIDE MENU ACCOUNT
       ========================================================= */

    function updateMenuAccount(
        user
    ) {

        const nameElement =
            document.getElementById(
                "pingmeAccountName"
            );


        const emailElement =
            document.getElementById(
                "pingmeAccountEmail"
            );


        const avatarElement =
            document.getElementById(
                "pingmeAccountAvatar"
            );


        if (!user) {

            if (nameElement) {

                nameElement.textContent =
                    "PingMe User";

            }


            if (emailElement) {

                emailElement.textContent =
                    "Not signed in";

            }


            if (avatarElement) {

                avatarElement.innerHTML = `

                    <span
                        id="pingmeAccountInitial"
                    >
                        P
                    </span>

                `;

            }

            return;

        }


        const name =
            user.displayName ||
            "PingMe User";


        const email =
            user.email ||
            "Signed in";


        const photo =
            user.photoURL ||
            "";


        if (nameElement) {

            nameElement.textContent =
                name;

        }


        if (emailElement) {

            emailElement.textContent =
                email;

        }


        if (avatarElement) {

            if (photo) {

                avatarElement.innerHTML = `

                    <img
                        src="${escapeHTML(photo)}"
                        alt="Google profile photo"
                    >

                `;

            } else {

                avatarElement.innerHTML = `

                    <span
                        id="pingmeAccountInitial"
                    >
                        ${escapeHTML(
                            getInitial(
                                name,
                                email
                            )
                        )}
                    </span>

                `;

            }

        }

    }


    /* =========================================================
       SETTINGS CONNECTION
       ========================================================= */

    function openSettings() {

        closeAccountPanel();


        if (
            typeof window.openPingMeSettings ===
            "function"
        ) {

            window.openPingMeSettings();

            return;

        }


        if (
            window.PingMeSettings &&
            typeof window.PingMeSettings.open ===
            "function"
        ) {

            window.PingMeSettings.open();

            return;

        }


        console.warn(
            "PingMe AI — Settings Support is not connected yet."
        );

    }


    /* =========================================================
       AUTH ERROR MESSAGE
       ========================================================= */

    function getFriendlyAuthError(
        error
    ) {

        if (!error) {

            return "Sign-in failed.";

        }


        const code =
            error.code ||
            "";


        if (
            code ===
            "auth/popup-blocked"
        ) {

            return "The Google sign-in popup was blocked.";

        }


        if (
            code ===
            "auth/popup-closed-by-user"
        ) {

            return "Google sign-in was cancelled.";

        }


        if (
            code ===
            "auth/cancelled-popup-request"
        ) {

            return "The sign-in request was cancelled.";

        }


        if (
            code ===
            "auth/unauthorized-domain"
        ) {

            return "This website is not authorized in Firebase.";

        }


        if (
            code ===
            "auth/operation-not-allowed"
        ) {

            return "Google Sign-In is not enabled in Firebase.";

        }


        if (
            code ===
            "auth/network-request-failed"
        ) {

            return "Network error. Check your internet connection.";

        }


        return (
            error.message ||
            "Unable to sign in with Google."
        );

    }


    /* =========================================================
       INITIAL LETTER
       ========================================================= */

    function getInitial(
        name,
        email
    ) {

        const value =
            name ||
            email ||
            "P";


        return value
            .trim()
            .charAt(0)
            .toUpperCase();

    }


    /* =========================================================
       SAFE HTML
       ========================================================= */

    function escapeHTML(
        value
    ) {

        return String(
            value || ""
        )
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
       CSS
       ========================================================= */

    function addStyles() {

        if (
            document.getElementById(
                "pingmeAccountSupportStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "pingmeAccountSupportStyles";


        style.textContent = `

            #pingmeAccountOverlay {

                position: fixed;

                inset: 0;

                z-index: 100000;

                display: flex;

                align-items: center;

                justify-content: center;

                padding: 20px;

                background:
                    rgba(0,0,0,0.42);

                backdrop-filter:
                    blur(8px);

                -webkit-backdrop-filter:
                    blur(8px);

                opacity: 0;

                visibility: hidden;

                pointer-events: none;

                transition:
                    opacity 0.22s ease,
                    visibility 0.22s ease;

            }


            #pingmeAccountOverlay.show {

                opacity: 1;

                visibility: visible;

                pointer-events: auto;

            }


            .pingme-account-panel {

                position: relative;

                width:
                    min(410px, 100%);

                max-height:
                    min(700px, 90dvh);

                overflow-y: auto;

                background:
                    #ffffff;

                color:
                    #171717;

                border-radius:
                    24px;

                padding:
                    30px 24px 26px;

                box-shadow:
                    0 24px 70px
                    rgba(0,0,0,0.25);

                transform:
                    translateY(18px)
                    scale(0.97);

                transition:
                    transform 0.25s
                    cubic-bezier(.2,.8,.2,1);

            }


            #pingmeAccountOverlay.show
            .pingme-account-panel {

                transform:
                    translateY(0)
                    scale(1);

            }


            .pingme-account-close {

                position: absolute;

                top: 12px;

                right: 12px;

                width: 40px;

                height: 40px;

                border: 0;

                border-radius: 50%;

                background:
                    #f2f2f2;

                color:
                    #555555;

                font-size: 27px;

                line-height: 1;

                cursor: pointer;

            }


            .pingme-account-close:active {

                transform:
                    scale(0.94);

            }


            .pingme-login-screen,
            .pingme-profile-screen {

                text-align: center;

                padding:
                    18px 4px 4px;

            }


            .pingme-login-logo {

                width: 68px;

                height: 68px;

                margin:
                    10px auto 20px;

                border-radius: 20px;

                background:
                    #111111;

                display: flex;

                align-items: center;

                justify-content: center;

                gap: 4px;

                box-shadow:
                    0 10px 25px
                    rgba(0,0,0,0.16);

            }


            .pingme-login-logo span {

                display: block;

                width: 5px;

                border-radius: 10px;

                background:
                    #ffffff;

            }


            .pingme-login-logo span:nth-child(1) {

                height: 17px;
