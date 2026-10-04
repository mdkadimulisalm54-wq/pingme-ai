// =========================================================
// PingMe AI — Voice Room Support
// =========================================================

(() => {

    "use strict";

    const sendButton = document.getElementById("sendButton");
    const input = document.getElementById("chatInput");

    if (!sendButton || !input) {
        console.warn("PingMe Voice Room: Main send button not found.");
        return;
    }

    let recognition = null;
    let voiceRoomOpen = false;
    let recognitionRunning = false;

    let selectedLanguage = "en-US";
    let selectedVoice = "voice-1";
    let autoTalk = true;

    // =====================================================
    // VOICE ROOM STYLE
    // =====================================================

    const style = document.createElement("style");

    style.textContent = `

        .pingme-voice-room {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding:
                calc(24px + env(safe-area-inset-top))
                22px
                calc(24px + env(safe-area-inset-bottom));

            background:
                radial-gradient(
                    circle at 50% 38%,
                    #252052 0%,
                    #111126 38%,
                    #07070d 75%,
                    #030305 100%
                );

            color: white;
            overflow: hidden;
        }

        .pingme-voice-room.hidden {
            display: none;
        }

        .pingme-voice-top {
            position: absolute;
            top: calc(18px + env(safe-area-inset-top));
            left: 18px;
            right: 18px;

            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .pingme-voice-title {
            font-size: 17px;
            font-weight: 600;
            letter-spacing: .2px;
        }

        .pingme-voice-close {
            width: 42px;
            height: 42px;
            border: 0;
            border-radius: 50%;

            background: rgba(255,255,255,.08);
            color: white;

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 25px;
            cursor: pointer;

            -webkit-tap-highlight-color: transparent;
        }

        .pingme-voice-orb {
            position: relative;

            width: 190px;
            height: 190px;

            margin-top: 20px;

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            background:
                radial-gradient(
                    circle at 35% 30%,
                    #ffffff 0%,
                    #cfcaff 5%,
                    #7d72ff 22%,
                    #5147db 48%,
                    #211d70 72%,
                    #100e35 100%
                );

            box-shadow:
                0 0 35px rgba(110,95,255,.55),
                0 0 90px rgba(95,80,255,.28),
                inset 0 0 35px rgba(255,255,255,.18);

            animation: pingmeVoiceOrb 3s ease-in-out infinite;
        }

        .pingme-voice-orb::before {
            content: "";

            position: absolute;
            inset: -12px;

            border-radius: 50%;

            border: 1px solid rgba(150,140,255,.28);

            animation: pingmeVoiceRing 2.4s ease-out infinite;
        }

        .pingme-voice-orb::after {
            content: "";

            position: absolute;
            inset: -28px;

            border-radius: 50%;

            border: 1px solid rgba(120,110,255,.12);

            animation: pingmeVoiceRing 3.2s ease-out infinite;
        }

        .pingme-voice-logo {
            width: 92px;
            height: 92px;

            border-radius: 25px;

            object-fit: contain;

            filter:
                drop-shadow(0 0 18px rgba(255,255,255,.35));
        }

        .pingme-voice-status {
            margin-top: 32px;

            font-size: 15px;

            color: rgba(255,255,255,.72);

            text-align: center;
        }

        .pingme-voice-wave {
            height: 34px;

            display: flex;
            align-items: center;
            justify-content: center;

            gap: 5px;

            margin-top: 12px;
        }

        .pingme-voice-wave span {
            width: 4px;
            height: 7px;

            border-radius: 10px;

            background: #aaa2ff;

            animation: pingmeVoiceWave 1s ease-in-out infinite;
        }

        .pingme-voice-wave span:nth-child(2) {
            animation-delay: .1s;
        }

        .pingme-voice-wave span:nth-child(3) {
            animation-delay: .2s;
        }

        .pingme-voice-wave span:nth-child(4) {
            animation-delay: .3s;
        }

        .pingme-voice-wave span:nth-child(5) {
            animation-delay: .4s;
        }

        .pingme-voice-controls {
            position: absolute;

            left: 20px;
            right: 20px;
            bottom: calc(24px + env(safe-area-inset-bottom));

            display: flex;
            flex-direction: column;

            gap: 12px;
        }

        .pingme-voice-option {
            width: 100%;

            min-height: 52px;

            padding: 0 16px;

            border: 1px solid rgba(255,255,255,.09);

            border-radius: 17px;

            background: rgba(255,255,255,.07);

            color: white;

            display: flex;
            align-items: center;
            justify-content: space-between;

            font-size: 14px;

            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);

            cursor: pointer;

            -webkit-tap-highlight-color: transparent;
        }

        .pingme-voice-option-left {
            display: flex;
            align-items: center;
            gap: 11px;
        }

        .pingme-voice-option-icon {
            width: 34px;
            height: 34px;

            border-radius: 11px;

            display: flex;
            align-items: center;
            justify-content: center;

            background: rgba(125,114,255,.18);

            font-size: 17px;
        }

        .pingme-voice-option-text {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 3px;
        }

        .pingme-voice-option-label {
            color: rgba(255,255,255,.52);
            font-size: 11px;
        }

        .pingme-voice-option-value {
            font-size: 14px;
        }

        .pingme-voice-chevron {
            color: rgba(255,255,255,.45);
            font-size: 18px;
        }

        .pingme-voice-toggle-row {
            display: flex;
            align-items: center;
            justify-content: space-between;

            min-height: 52px;

            padding: 0 16px;

            border-radius: 17px;

            background: rgba(255,255,255,.06);

            border: 1px solid rgba(255,255,255,.08);
        }

        .pingme-voice-toggle-label {
            display: flex;
            align-items: center;
            gap: 10px;

            font-size: 14px;
        }

        .pingme-voice-toggle {
            position: relative;

            width: 50px;
            height: 29px;

            border: 0;
            border-radius: 30px;

            background: rgba(255,255,255,.18);

            cursor: pointer;

            transition: .25s ease;
        }

        .pingme-voice-toggle.active {
            background: #7167ff;
        }

        .pingme-voice-toggle span {
            position: absolute;

            top: 4px;
            left: 4px;

            width: 21px;
            height: 21px;

            border-radius: 50%;

            background: white;

            transition: .25s ease;

            box-shadow: 0 2px 8px rgba(0,0,0,.25);
        }

        .pingme-voice-toggle.active span {
            transform: translateX(21px);
        }

        .pingme-voice-menu {
            position: fixed;

            left: 20px;
            right: 20px;
            bottom: calc(25px + env(safe-area-inset-bottom));

            z-index: 1000001;

            display: none;

            padding: 10px;

            border-radius: 20px;

            background: rgba(25,24,43,.96);

            border: 1px solid rgba(255,255,255,.1);

            box-shadow:
                0 20px 60px rgba(0,0,0,.45);

            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
        }

        .pingme-voice-menu.show {
            display: block;
        }

        .pingme-voice-menu-title {
            padding: 10px 12px;

            font-size: 12px;

            color: rgba(255,255,255,.45);
        }

        .pingme-voice-menu-item {
            width: 100%;

            border: 0;

            border-radius: 13px;

            padding: 13px 12px;

            background: transparent;

            color: white;

            text-align: left;

            font-size: 14px;

            cursor: pointer;
        }

        .pingme-voice-menu-item:hover {
            background: rgba(255,255,255,.08);
        }

        @keyframes pingmeVoiceOrb {

            0%, 100% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.045);
            }

        }

        @keyframes pingmeVoiceRing {

            0% {
                transform: scale(.82);
                opacity: .7;
            }

            100% {
                transform: scale(1.25);
                opacity: 0;
            }

        }

        @keyframes pingmeVoiceWave {

            0%, 100% {
                height: 7px;
                opacity: .45;
            }

            50% {
                height: 29px;
                opacity: 1;
            }

        }

    `;

    document.head.appendChild(style);


    // =====================================================
    // VOICE ROOM
    // =====================================================

    const room = document.createElement("div");

    room.className = "pingme-voice-room hidden";

    room.innerHTML = `

        <div class="pingme-voice-top">

            <div class="pingme-voice-title">
                PingMe AI Voice
            </div>

            <button
                class="pingme-voice-close"
                id="pingmeVoiceClose"
                type="button">
                ×
            </button>

        </div>


        <div class="pingme-voice-orb">

            <img
                class="pingme-voice-logo"
                src="icon-192.png"
                alt="PingMe AI">

        </div>


        <div
            class="pingme-voice-status"
            id="pingmeVoiceStatus">

            Listening...

        </div>


        <div class="pingme-voice-wave">

            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>

        </div>


        <div class="pingme-voice-controls">

            <button
                class="pingme-voice-option"
                id="pingmeLanguageButton"
                type="button">

                <div class="pingme-voice-option-left">

                    <div class="pingme-voice-option-icon">
                        🌐
                    </div>

                    <div class="pingme-voice-option-text">

                        <div class="pingme-voice-option-label">
                            Language
                        </div>

                        <div
                            class="pingme-voice-option-value"
                            id="pingmeLanguageValue">

                            English

                        </div>

                    </div>

                </div>

                <div class="pingme-voice-chevron">
                    ›
                </div>

            </button>


            <button
                class="pingme-voice-option"
                id="pingmeVoiceButton"
                type="button">

                <div class="pingme-voice-option-left">

                    <div class="pingme-voice-option-icon">
                        🎙️
                    </div>

                    <div class="pingme-voice-option-text">

                        <div class="pingme-voice-option-label">
                            Voice
                        </div>

                        <div
                            class="pingme-voice-option-value"
                            id="pingmeVoiceValue">

                            Voice 1

                        </div>

                    </div>

                </div>

                <div class="pingme-voice-chevron">
                    ›
                </div>

            </button>


            <div class="pingme-voice-toggle-row">

                <div class="pingme-voice-toggle-label">

                    <span>Automatic conversation</span>

                </div>

                <button
                    class="pingme-voice-toggle active"
                    id="pingmeAutoToggle"
                    type="button">

                    <span></span>

                </button>

            </div>

        </div>

    `;

    document.body.appendChild(room);


    // =====================================================
    // MENUS
    // =====================================================

    const languageMenu = document.createElement("div");

    languageMenu.className = "pingme-voice-menu";

    languageMenu.innerHTML = `

        <div class="pingme-voice-menu-title">
            Choose language
        </div>

        <button
            class="pingme-voice-menu-item"
            data-lang="en-US"
            data-name="English"
            type="button">
            🇬🇧 English
        </button>

        <button
            class="pingme-voice-menu-item"
            data-lang="bn-BD"
            data-name="বাংলা"
            type="button">
            🇧🇩 বাংলা
        </button>

        <button
            class="pingme-voice-menu-item"
            data-lang="es-ES"
            data-name="Spanish"
            type="button">
            🇪🇸 Spanish
        </button>

    `;

    room.appendChild(languageMenu);


    const voiceMenu = document.createElement("div");

    voiceMenu.className = "pingme-voice-menu";

    voiceMenu.innerHTML = `

        <div class="pingme-voice-menu-title">
            Choose voice
        </div>

        <button
            class="pingme-voice-menu-item"
            data-voice="voice-1"
            type="button">
            Voice 1 — Natural
        </button>

        <button
            class="pingme-voice-menu-item"
            data-voice="voice-2"
            type="button">
            Voice 2 — Warm
        </button>

        <button
            class="pingme-voice-menu-item"
            data-voice="voice-3"
            type="button">
            Voice 3 — Calm
        </button>

    `;

    room.appendChild(voiceMenu);


    // =====================================================
    // ELEMENTS
    // =====================================================

    const closeButton =
        room.querySelector("#pingmeVoiceClose");

    const languageButton =
        room.querySelector("#pingmeLanguageButton");

    const voiceButton =
        room.querySelector("#pingmeVoiceButton");

    const autoToggle =
        room.querySelector("#pingmeAutoToggle");

    const status =
        room.querySelector("#pingmeVoiceStatus");

    const languageValue =
        room.querySelector("#pingmeLanguageValue");

    const voiceValue =
        room.querySelector("#pingmeVoiceValue");


    // =====================================================
    // SPEECH RECOGNITION
    // =====================================================

    function speechSupported() {

        return !!(
            window.SpeechRecognition ||
            window.webkitSpeechRecognition
        );

    }


    function createRecognition() {

        if (!speechSupported()) {

            status.textContent =
                "Voice recognition is not supported";

            return null;
        }


        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        const instance = new Recognition();


        instance.lang = selectedLanguage;

        instance.continuous = true;

        instance.interimResults = true;


        instance.onstart = function () {

            recognitionRunning = true;

            status.textContent =
                "Listening...";

        };


        instance.onresult = function (event) {

            let finalText = "";
            let interimText = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const text =
                    event.results[i][0].transcript;


                if (event.results[i].isFinal) {

                    finalText += text;

                } else {

                    interimText += text;

                }

            }


            const result =
                (finalText || interimText).trim();


            if (result) {

                status.textContent =
                    result;

            }


            if (finalText.trim()) {

                input.value =
                    finalText.trim();

                input.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );


                if (autoTalk) {

                    setTimeout(() => {

                        const currentText =
                            input.value.trim();


                        if (!currentText) {
                            return;
                        }


                        /*
                         * Use the EXISTING main Send button.
                         * We do not touch the camera-side
                         * microphone button.
                         */

                        sendButton.click();

                    }, 350);

                }

            }

        };


        instance.onerror = function (event) {

            console.warn(
                "PingMe Voice Error:",
                event.error
            );


            if (event.error === "not-allowed") {

                status.textContent =
                    "Microphone permission required";

            } else {

                status.textContent =
                    "Voice connection interrupted";

            }

        };


        instance.onend = function () {

            recognitionRunning = false;


            if (!voiceRoomOpen) {
                return;
            }


            if (autoTalk) {

                setTimeout(() => {

                    if (
                        voiceRoomOpen &&
                        !recognitionRunning
                    ) {

                        startRecognition();

                    }

                }, 400);

            }

        };


        return instance;

    }


    function startRecognition() {

        if (!voiceRoomOpen) {
            return;
        }


        if (!speechSupported()) {

            status.textContent =
                "Voice recognition is not supported";

            return;

        }


        if (recognitionRunning) {
            return;
        }


        try {

            recognition =
                createRecognition();


            if (recognition) {

                recognition.start();

            }

        } catch (error) {

            console.warn(
                "Voice start error:",
                error
            );

        }

    }


    function stopRecognition() {

        if (!recognition) {
            return;
        }


        try {

            recognition.stop();

        } catch (error) {

            console.warn(
                "Voice stop error:",
                error
            );

        }


        recognitionRunning = false;

    }


    // =====================================================
    // OPEN VOICE ROOM
    // =====================================================

    function openVoiceRoom() {

        voiceRoomOpen = true;

        room.classList.remove("hidden");

        document.body.style.overflow = "hidden";

        status.textContent =
            "Starting voice...";


        /*
         * Voice Room opens directly into listening.
         * There is NO second microphone button.
         */

        setTimeout(() => {

            startRecognition();

        }, 250);

    }


    // =====================================================
    // CLOSE VOICE ROOM
    // =====================================================

    function closeVoiceRoom() {

        voiceRoomOpen = false;

        stopRecognition();

        room.classList.add("hidden");

        document.body.style.overflow = "";

        languageMenu.classList.remove("show");

        voiceMenu.classList.remove("show");

    }


    // =====================================================
    // IMPORTANT:
    // ONLY THE MAIN RIGHT-SIDE MIC/SEND BUTTON
    // OPENS VOICE ROOM WHEN INPUT IS EMPTY.
    //
    // The camera-side microphone is NOT touched.
    // =====================================================

    sendButton.addEventListener(
        "click",
        function (event) {

            const text =
                input.value.trim();


            if (text !== "") {

                /*
                 * Text exists.
                 * Let the existing Send system
                 * handle it normally.
                 */

                return;

            }


            /*
             * Input is empty.
             * This is the Voice state.
             *
             * Stop the old inline Voice handler
             * from also running.
             */

            event.preventDefault();
            event.stopImmediatePropagation();

            openVoiceRoom();

        },
        true
    );


    // =====================================================
    // CLOSE
    // =====================================================

    closeButton.addEventListener(
        "click",
        function () {

            closeVoiceRoom();

        }
    );


    // =====================================================
    // LANGUAGE
    // =====================================================

    languageButton.addEventListener(
        "click",
        function () {

            voiceMenu.classList.remove("show");

            languageMenu.classList.toggle("show");

        }
    );


    languageMenu
        .querySelectorAll(".pingme-voice-menu-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    selectedLanguage =
                        button.dataset.lang;

                    languageValue.textContent =
                        button.dataset.name;

                    languageMenu.classList.remove(
                        "show"
                    );


                    if (voiceRoomOpen) {

                        stopRecognition();

                        setTimeout(() => {

                            startRecognition();

                        }, 250);

                    }

                }
            );

        });


    // =====================================================
    // VOICE SELECTION
    // =====================================================

    voiceButton.addEventListener(
        "click",
        function () {

            languageMenu.classList.remove(
                "show"
            );

            voiceMenu.classList.toggle(
                "show"
            );

        }
    );


    voiceMenu
        .querySelectorAll(".pingme-voice-menu-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    selectedVoice =
                        button.dataset.voice;


                    const names = {

                        "voice-1":
                            "Voice 1",

                        "voice-2":
                            "Voice 2",

                        "voice-3":
                            "Voice 3"

                    };


                    voiceValue.textContent =
                        names[selectedVoice];


                    voiceMenu.classList.remove(
                        "show"
                    );

                }
            );

        });


    // =====================================================
    // AUTOMATIC CONVERSATION TOGGLE
    // =====================================================

    autoToggle.addEventListener(
        "click",
        function () {

            autoTalk = !autoTalk;

            autoToggle.classList.toggle(
                "active",
                autoTalk
            );


            if (autoTalk) {

                status.textContent =
                    "Listening...";

                startRecognition();

            } else {

                status.textContent =
                    "Automatic conversation off";

            }

        }
    );


    // =====================================================
    // CLEANUP
    // =====================================================

    window.addEventListener(
        "beforeunload",
        function () {

            stopRecognition();

        }
    );


    console.log(
        "PingMe AI — Voice Room Connected"
    );

})();