// =========================================================
// PingMe AI — Voice Mode Support
// Complete Voice Room
// =========================================================

(() => {

    "use strict";


    // =====================================================
    // STATE
    // =====================================================

    let recognition = null;

    let voiceModeActive = false;
    let listening = false;
    let processing = false;
    let speaking = false;

    let currentLanguage = "bn-BD";

    let speechRate = 1;
    let speechVolume = 1;

    let restartTimer = null;

    let currentStream = null;

    let lastUserText = "";
    let lastAIText = "";

    let responseObserver = null;


    // =====================================================
    // SETTINGS
    // =====================================================

    const SETTINGS_KEY =
        "pingme_voice_settings";


    const defaultSettings = {

        language: "bn-BD",

        rate: 1,

        volume: 1,

        autoListen: true,

        greeting: true

    };


    function loadSettings() {

        try {

            const saved =
                localStorage.getItem(
                    SETTINGS_KEY
                );

            if (!saved) {
                return {
                    ...defaultSettings
                };
            }

            return {
                ...defaultSettings,
                ...JSON.parse(saved)
            };

        } catch {

            return {
                ...defaultSettings
            };

        }

    }


    function saveSettings() {

        localStorage.setItem(

            SETTINGS_KEY,

            JSON.stringify({

                language:
                    currentLanguage,

                rate:
                    speechRate,

                volume:
                    speechVolume,

                autoListen:
                    true,

                greeting:
                    true

            })

        );

    }


    const settings =
        loadSettings();


    currentLanguage =
        settings.language;

    speechRate =
        settings.rate;

    speechVolume =
        settings.volume;


    // =====================================================
    // SPEECH RECOGNITION SUPPORT
    // =====================================================

    function isSpeechRecognitionSupported() {

        return !!(

            window.SpeechRecognition ||

            window.webkitSpeechRecognition

        );

    }


    // =====================================================
    // CREATE VOICE ROOM
    // =====================================================

    function createVoiceRoom() {

        if (
            document.getElementById(
                "pingme-voice-overlay"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "pingme-voice-style";


        style.textContent = `

/* =====================================================
   VOICE OVERLAY
   ===================================================== */

#pingme-voice-overlay {

    position: fixed;

    inset: 0;

    z-index: 999999;

    display: none;

    align-items: center;

    justify-content: center;

    overflow: hidden;

    background:
        radial-gradient(
            circle at 50% 38%,
            rgba(68, 91, 180, 0.28),
            transparent 28%
        ),
        radial-gradient(
            circle at 50% 65%,
            rgba(74, 117, 255, 0.12),
            transparent 38%
        ),
        linear-gradient(
            180deg,
            #060914 0%,
            #090d1d 48%,
            #03050b 100%
        );

    color: white;

}


/* =====================================================
   STAR FIELD
   ===================================================== */

#pingme-voice-overlay::before {

    content: "";

    position: absolute;

    inset: 0;

    opacity: .55;

    background-image:

        radial-gradient(
            circle,
            rgba(255,255,255,.8) 1px,
            transparent 1px
        );

    background-size:
        82px 82px;

    animation:
        pingmeStars 18s linear infinite;

}


@keyframes pingmeStars {

    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(82px);
    }

}


/* =====================================================
   VOICE ROOM
   ===================================================== */

#pingme-voice-room {

    position: relative;

    width: 100%;

    height: 100%;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    z-index: 2;

}


/* =====================================================
   TOP BAR
   ===================================================== */

#pingme-voice-top {

    position: absolute;

    top: 0;

    left: 0;

    right: 0;

    height: 74px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    padding:
        env(safe-area-inset-top)
        18px
        0
        18px;

}


#pingme-voice-title {

    font-size: 17px;

    font-weight: 600;

    letter-spacing: .2px;

    opacity: .94;

}


#pingme-voice-close {

    width: 42px;

    height: 42px;

    border: 0;

    border-radius: 50%;

    display: flex;

    align-items: center;

    justify-content: center;

    background:
        rgba(255,255,255,.08);

    color: white;

    font-size: 25px;

    cursor: pointer;

    backdrop-filter:
        blur(12px);

}


/* =====================================================
   CENTER
   ===================================================== */

#pingme-voice-center {

    width: 100%;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    transform:
        translateY(-20px);

}


/* =====================================================
   AI ORB
   ===================================================== */

#pingme-voice-orb {

    position: relative;

    width: 190px;

    height: 190px;

    display: flex;

    align-items: center;

    justify-content: center;

}


/* =====================================================
   ORB GLOW
   ===================================================== */

#pingme-voice-orb-glow {

    position: absolute;

    width: 175px;

    height: 175px;

    border-radius: 50%;

    background:

        radial-gradient(
            circle at 35% 30%,
            #9ab6ff 0%,
            #5c7dff 24%,
            #344bc0 52%,
            #111936 76%,
            transparent 100%
        );

    filter:
        blur(1px);

    box-shadow:

        0 0 30px
        rgba(93,125,255,.45),

        0 0 90px
        rgba(79,105,255,.30);

    animation:
        pingmeOrbIdle
        3.5s ease-in-out infinite;

}


@keyframes pingmeOrbIdle {

    0%,
    100% {

        transform:
            scale(1);

    }

    50% {

        transform:
            scale(1.045);

    }

}


/* =====================================================
   AI AVATAR
   ===================================================== */

#pingme-voice-avatar {

    position: relative;

    width: 104px;

    height: 104px;

    border-radius: 50%;

    overflow: hidden;

    z-index: 3;

    border:
        2px solid
        rgba(255,255,255,.28);

    box-shadow:

        0 0 20px
        rgba(255,255,255,.22),

        inset 0 0 20px
        rgba(255,255,255,.12);

    background:
        #111827;

}


#pingme-voice-avatar img {

    width: 100%;

    height: 100%;

    object-fit: cover;

    display: block;

}


/* =====================================================
   WAVE RINGS
   ===================================================== */

.pingme-voice-wave {

    position: absolute;

    left: 50%;

    top: 50%;

    width: 190px;

    height: 190px;

    border-radius: 50%;

    border:
        1px solid
        rgba(119,151,255,.25);

    transform:
        translate(-50%, -50%)
        scale(.72);

    opacity: 0;

    pointer-events: none;

}


.pingme-voice-wave.wave-active {

    animation:
        pingmeWave
        2.2s ease-out infinite;

}


.pingme-voice-wave:nth-child(2) {

    animation-delay:
        .55s;

}


.pingme-voice-wave:nth-child(3) {

    animation-delay:
        1.1s;

}


@keyframes pingmeWave {

    0% {

        transform:
            translate(-50%, -50%)
            scale(.72);

        opacity:
            .75;

    }

    100% {

        transform:
            translate(-50%, -50%)
            scale(1.7);

        opacity:
            0;

    }

}


/* =====================================================
   REALISTIC MICROPHONE
   ===================================================== */

#pingme-voice-microphone {

    position: relative;

    width: 92px;

    height: 124px;

    margin-top: 30px;

    display: flex;

    align-items: center;

    justify-content: center;

}


/* microphone body */

.pingme-real-mic {

    position: relative;

    width: 44px;

    height: 72px;

    border-radius:
        24px;

    background:

        linear-gradient(
            90deg,
            #4a4d56 0%,
            #aeb2bc 18%,
            #f3f4f6 38%,
            #858994 62%,
            #383b44 100%
        );

    box-shadow:

        inset
        -4px 0 7px
        rgba(0,0,0,.32),

        inset
        4px 0 7px
        rgba(255,255,255,.28),

        0 12px 24px
        rgba(0,0,0,.38);

}


/* microphone grille */

.pingme-real-mic::before {

    content: "";

    position: absolute;

    left: 6px;

    right: 6px;

    top: 7px;

    bottom: 13px;

    border-radius:
        19px;

    background:

        repeating-linear-gradient(
            0deg,
            rgba(255,255,255,.18) 0px,
            rgba(255,255,255,.18) 2px,
            rgba(0,0,0,.12) 3px,
            rgba(0,0,0,.12) 5px
        ),

        linear-gradient(
            90deg,
            #343740,
            #a6a9b1,
            #343740
        );

    box-shadow:

        inset
        0 0 8px
        rgba(0,0,0,.35);

}


/* microphone lower neck */

.pingme-real-mic::after {

    content: "";

    position: absolute;

    width: 30px;

    height: 18px;

    left: 7px;

    bottom: -12px;

    border-radius:
        0 0 12px 12px;

    background:
        linear-gradient(
            90deg,
            #343740,
            #a0a4ad,
            #343740
        );

}


/* microphone stand */

.pingme-mic-stand {

    position: absolute;

    bottom: 0;

    width: 58px;

    height: 12px;

    border-radius: 20px;

    background:

        linear-gradient(
            180deg,
            #d4d7dd,
            #555861
        );

    box-shadow:
        0 5px 14px
        rgba(0,0,0,.38);

}


.pingme-mic-stem {

    position: absolute;

    bottom: 8px;

    width: 9px;

    height: 29px;

    border-radius: 8px;

    background:

        linear-gradient(
            90deg,
            #4a4d55,
            #c2c5cc,
            #44474f
        );

}


/* =====================================================
   MICROPHONE BUTTON
   ===================================================== */

#pingme-voice-main-button {

    position: absolute;

    width: 92px;

    height: 92px;

    border-radius: 50%;

    border: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    background:
        rgba(255,255,255,.045);

    box-shadow:

        0 0 0 1px
        rgba(255,255,255,.10),

        0 15px 35px
        rgba(0,0,0,.30);

    cursor: pointer;

    z-index: 8;

}


/* =====================================================
   STATUS
   ===================================================== */

#pingme-voice-status {

    margin-top: 22px;

    min-height: 24px;

    font-size: 16px;

    font-weight: 500;

    color:
        rgba(255,255,255,.86);

}


#pingme-voice-transcript {

    width:
        min(86%, 420px);

    min-height: 44px;

    margin-top: 12px;

    text-align: center;

    color:
        rgba(255,255,255,.58);

    font-size: 14px;

    line-height: 1.5;

}


/* =====================================================
   CONTROLS
   ===================================================== */

#pingme-voice-controls {

    position: absolute;

    bottom: 30px;

    left: 0;

    right: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 12px;

    padding-bottom:
        env(safe-area-inset-bottom);

}


.pingme-voice-control {

    min-width: 52px;

    height: 44px;

    padding:
        0 15px;

    border: 0;

    border-radius: 22px;

    color: white;

    background:
        rgba(255,255,255,.08);

    backdrop-filter:
        blur(15px);

    cursor: pointer;

    font-size: 14px;

}


/* =====================================================
   STATES
   ===================================================== */

#pingme-voice-overlay.voice-listening
#pingme-voice-orb-glow {

    box-shadow:

        0 0 35px
        rgba(89,133,255,.65),

        0 0 110px
        rgba(73,104,255,.42);

}


#pingme-voice-overlay.voice-listening
.pingme-voice-wave {

    border-color:
        rgba(112,153,255,.5);

}


#pingme-voice-overlay.voice-speaking
#pingme-voice-orb-glow {

    animation:
        pingmeOrbSpeaking
        .85s ease-in-out infinite;

}


@keyframes pingmeOrbSpeaking {

    0%,
    100% {

        transform:
            scale(1);

    }

    50% {

        transform:
            scale(1.12);

    }

}


#pingme-voice-overlay.voice-processing
#pingme-voice-orb-glow {

    animation:
        pingmeOrbProcessing
        1.1s linear infinite;

}


@keyframes pingmeOrbProcessing {

    from {

        transform:
            rotate(0deg)
            scale(1);

    }

    to {

        transform:
            rotate(360deg)
            scale(1.05);

    }

}


/* =====================================================
   MOBILE
   ===================================================== */

@media (max-width: 480px) {

    #pingme-voice-orb {

        width: 170px;

        height: 170px;

    }

    #pingme-voice-orb-glow {

        width: 158px;

        height: 158px;

    }

    #pingme-voice-avatar {

        width: 94px;

        height: 94px;

    }

    .pingme-voice-wave {

        width: 172px;

        height: 172px;

    }

}

`;


        document.head.appendChild(
            style
        );


        const overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "pingme-voice-overlay";


        overlay.innerHTML = `

            <div id="pingme-voice-room">

                <div id="pingme-voice-top">

                    <div id="pingme-voice-title">
                        PingMe AI Voice
                    </div>

                    <button
                        id="pingme-voice-close"
                        type="button"
                        aria-label="Close voice mode"
                    >
                        ×
                    </button>

                </div>


                <div id="pingme-voice-center">

                    <div id="pingme-voice-orb">

                        <div
                            id="pingme-voice-orb-glow">
                        </div>


                        <div
                            class="pingme-voice-wave">
                        </div>

                        <div
                            class="pingme-voice-wave">
                        </div>

                        <div
                            class="pingme-voice-wave">
                        </div>


                        <div
                            id="pingme-voice-avatar">

                            <img
                                src="icon-192.png"
                                alt="PingMe AI"
                            >

                        </div>

                    </div>


                    <div
                        id="pingme-voice-microphone"
                    >

                        <div
                            class="pingme-mic-stem">
                        </div>

                        <div
                            class="pingme-real-mic">
                        </div>

                        <div
                            class="pingme-mic-stand">
                        </div>


                        <button
                            id="pingme-voice-main-button"
                            type="button"
                            aria-label="Voice microphone"
                        >
                        </button>

                    </div>


                    <div
                        id="pingme-voice-status"
                    >
                        Ready
                    </div>


                    <div
                        id="pingme-voice-transcript"
                    >
                    </div>

                </div>


                <div id="pingme-voice-controls">

                    <button
                        class="pingme-voice-control"
                        id="pingme-voice-language"
                        type="button"
                    >
                        বাংলা
                    </button>

                    <button
                        class="pingme-voice-control"
                        id="pingme-voice-stop"
                        type="button"
                    >
                        Stop
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        connectVoiceUI();

    }


    // =====================================================
    // CONNECT UI
    // =====================================================

    function connectVoiceUI() {

        const closeButton =
            document.getElementById(
                "pingme-voice-close"
            );

        const mainButton =
            document.getElementById(
                "pingme-voice-main-button"
            );

        const languageButton =
            document.getElementById(
                "pingme-voice-language"
            );

        const stopButton =
            document.getElementById(
                "pingme-voice-stop"
            );


        if (closeButton) {

            closeButton.onclick =
                closeVoiceMode;

        }


        if (mainButton) {

            mainButton.onclick =
                toggleVoiceListening;

        }


        if (languageButton) {

            languageButton.onclick =
                toggleLanguage;

        }


        if (stopButton) {

            stopButton.onclick =
                stopVoiceEverything;

        }

    }


    // =====================================================
    // STATE UI
    // =====================================================

    function setVoiceState(
        state,
        text = ""
    ) {

        const overlay =
            document.getElementById(
                "pingme-voice-overlay"
            );

        const status =
            document.getElementById(
                "pingme-voice-status"
            );

        const transcript =
            document.getElementById(
                "pingme-voice-transcript"
            );


        if (!overlay) {
            return;
        }


        overlay.classList.remove(

            "voice-listening",

            "voice-speaking",

            "voice-processing"

        );


        if (state === "listening") {

            overlay.classList.add(
                "voice-listening"
            );

        }


        if (state === "speaking") {

            overlay.classList.add(
                "voice-speaking"
            );

        }


        if (state === "processing") {

            overlay.classList.add(
                "voice-processing"
            );

        }


        if (status) {

            status.textContent =
                text;

        }


        if (transcript && state !== "listening") {

            transcript.textContent =
                "";

        }


        updateWaveAnimation(
            state
        );

    }


    // =====================================================
    // WAVE ANIMATION
    // =====================================================

    function updateWaveAnimation(
        state
    ) {

        const waves =
            document.querySelectorAll(
                ".pingme-voice-wave"
            );


        waves.forEach(
            wave => {

                wave.classList.remove(
                    "wave-active"
                );

            }
        );


        if (
            state === "listening" ||
            state === "speaking"
        ) {

            waves.forEach(
                wave => {

                    wave.classList.add(
                        "wave-active"
                    );

                }
            );

        }

    }


    // =====================================================
    // OPEN VOICE MODE
    // =====================================================

    async function openVoiceMode() {

        if (voiceModeActive) {
            return;
        }


        createVoiceRoom();


        const overlay =
            document.getElementById(
                "pingme-voice-overlay"
            );


        if (!overlay) {
            return;
        }


        voiceModeActive =
            true;


        overlay.style.display =
            "flex";


        document.body.style.overflow =
            "hidden";


        setVoiceState(
            "processing",
            "Connecting..."
        );


        if (
            settings.greeting
        ) {

            await speakText(

                currentLanguage === "bn-BD"

                    ? "হ্যালো, আমি PingMe AI। কীভাবে সাহায্য করতে পারি?"

                    : "Hello, I am PingMe AI. How can I help you?"

            );

        }


        if (
            voiceModeActive &&
            settings.autoListen
        ) {

            startVoiceListening();

        }

    }


    // =====================================================
    // CLOSE VOICE MODE
    // =====================================================

    function closeVoiceMode() {

        voiceModeActive =
            false;


        stopVoiceEverything();


        if (restartTimer) {

            clearTimeout(
                restartTimer
            );

            restartTimer =
                null;

        }


        if (responseObserver) {

            responseObserver.disconnect();

            responseObserver =
                null;

        }


        const overlay =
            document.getElementById(
                "pingme-voice-overlay"
            );


        if (overlay) {

            overlay.style.display =
                "none";

        }


        document.body.style.overflow =
            "";


        setVoiceState(
            "idle",
            "Ready"
        );

    }


    // =====================================================
    // START LISTENING
    // =====================================================

    function startVoiceListening() {

        if (!voiceModeActive) {
            return;
        }


        if (
            !isSpeechRecognitionSupported()
        ) {

            setVoiceState(
                "idle",
                "Voice input is not supported"
            );

            return;

        }


        if (listening) {
            return;
        }


        stopSpeech();


        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        recognition =
            new Recognition();


        recognition.lang =
            currentLanguage;


        recognition.continuous =
            false;


        recognition.interimResults =
            true;


        recognition.maxAlternatives =
            1;


        recognition.onstart =
            function () {

                listening =
                    true;

                processing =
                    false;

                setVoiceState(
                    "listening",
                    currentLanguage === "bn-BD"
                        ? "শুনছি..."
                        : "Listening..."
                );

            };


        recognition.onresult =
            function (event) {

                let finalText =
                    "";

                let interimText =
                    "";


                for (
                    let i =
                        event.resultIndex;

                    i <
                        event.results.length;

                    i++
                ) {

                    const transcript =
                        event.results[i][0]
                            .transcript;


                    if (
                        event.results[i]
                            .isFinal
                    ) {

                        finalText +=
                            transcript;

                    } else {

                        interimText +=
                            transcript;

                    }

                }


                const transcriptBox =
                    document.getElementById(
                        "pingme-voice-transcript"
                    );


                if (transcriptBox) {

                    transcriptBox.textContent =
                        finalText ||
                        interimText;

                }


                if (finalText.trim()) {

                    handleVoiceInput(
                        finalText.trim()
                    );

                }

            };


        recognition.onerror =
            function (event) {

                listening =
                    false;


                if (
                    event.error ===
                    "not-allowed"
                ) {

                    setVoiceState(
                        "idle",
                        "Microphone permission denied"
                    );

                    return;

                }


                if (
                    event.error ===
                    "no-speech"
                ) {

                    scheduleRestart();

                    return;

                }


                setVoiceState(
                    "idle",
                    "Voice input error"
                );

            };


        recognition.onend =
            function () {

                listening =
                    false;


                if (
                    voiceModeActive &&
                    !processing &&
                    !speaking
                ) {

                    scheduleRestart();

                }

            };


        try {

            recognition.start();

        } catch {

            listening =
                false;

            scheduleRestart();

        }

    }


    // =====================================================
    // STOP LISTENING
    // =====================================================

    function stopVoiceListening() {

        if (!recognition) {
            return;
        }


        try {

            recognition.stop();

        } catch {}

        recognition =
            null;

        listening =
            false;

    }


    // =====================================================
    // RESTART LISTENING
    // =====================================================

    function scheduleRestart() {

        if (!voiceModeActive) {
            return;
        }


        if (restartTimer) {

            clearTimeout(
                restartTimer
            );

        }


        restartTimer =
            setTimeout(
                function () {

                    if (
                        voiceModeActive &&
                        !processing &&
                        !speaking &&
                        !listening
                    ) {

                        startVoiceListening();

                    }

                },

                700

            );

    }


    // =====================================================
    // HANDLE USER VOICE
    // =====================================================

    async function handleVoiceInput(
        text
    ) {

        if (!text) {
            return;
        }


        lastUserText =
            text;


        processing =
            true;


        stopVoiceListening();


        setVoiceState(
            "processing",
            currentLanguage === "bn-BD"
                ? "ভাবছি..."
                : "Thinking..."
        );


        const transcript =
            document.getElementById(
                "pingme-voice-transcript"
            );


        if (transcript) {

            transcript.textContent =
                text;

        }


        await sendVoiceMessage(
            text
        );

    }


    // =====================================================
    // SEND MESSAGE THROUGH EXISTING CHAT
    // =====================================================

    async function sendVoiceMessage(
        text
    ) {

        const input =
            document.getElementById(
                "chatInput"
            );

        const sendButton =
            document.getElementById(
                "sendButton"
            );


        if (!input || !sendButton) {

            processing =
                false;

            setVoiceState(
                "idle",
                "Chat connection unavailable"
            );

            return;

        }


        input.value =
            text;


        input.dispatchEvent(
            new Event(
                "input",
                {
                    bubbles: true
                }
            )
        );


        /*
         * IMPORTANT:
         *
         * We ONLY trigger the existing
         * SEND button here.
         *
         * We do NOT modify its icon.
         *
         * We do NOT attach Voice Mode
         * to the Send button.
         */


        sendButton.click();


        watchForAIResponse();

    }


    // =====================================================
    // WATCH AI RESPONSE
    // =====================================================

    function watchForAIResponse() {

        const chatArea =
            document.getElementById(
                "chatArea"
            );


        if (!chatArea) {

            processing =
                false;

            scheduleRestart();

            return;

        }


        if (responseObserver) {

            responseObserver.disconnect();

        }


        responseObserver =
            new MutationObserver(
                function (mutations) {

                    if (!voiceModeActive) {
                        return;
                    }


                    for (
                        const mutation
                        of mutations
                    ) {

                        if (
                            mutation.type !==
                            "childList"
                        ) {

                            continue;

                        }


                        for (
                            const node
                            of mutation.addedNodes
                        ) {

                            if (
                                node.nodeType !==
                                1
                            ) {

                                continue;

                            }


                            const text =
                                extractAIText(
                                    node
                                );


                            if (
                                text &&
                                text !==
                                    lastAIText
                            ) {

                                lastAIText =
                                    text;


                                responseObserver
                                    .disconnect();

                                responseObserver =
                                    null;


                                speakAIResponse(
                                    text
                                );


                                return;

                            }

                        }

                    }

                }
            );


        responseObserver.observe(

            chatArea,

            {
                childList: true,
                subtree: true
            }

        );


        /*
         * Safety timeout.
         */

        setTimeout(
            function () {

                if (
                    processing &&
                    voiceModeActive
                ) {

                    if (
                        responseObserver
                    ) {

                        responseObserver
                            .disconnect();

                        responseObserver =
                            null;

                    }


                    processing =
                        false;


                    scheduleRestart();

                }

            },

            30000

        );

    }


    // =====================================================
    // EXTRACT AI TEXT
    // =====================================================

    function extractAIText(
        node
    ) {

        if (!node) {
            return "";
        }


        let element =
            node;


        /*
         * Ignore user messages.
         */

        if (
            element.classList &&
            (
                element.classList.contains(
                    "user"
                ) ||

                element.classList.contains(
                    "user-message"
                )
            )
        ) {

            return "";

        }


        const text =
            (
                element.innerText ||
                element.textContent ||
                ""
            ).trim();


        if (!text) {
            return "";
        }


        /*
         * Ignore typing / thinking
         * indicators.
         */

        const lower =
            text.toLowerCase();


        if (

            lower.includes(
                "thinking..."
            ) ||

            lower.includes(
                "typing..."
            ) ||

            lower ===
                "thinking"

        ) {

            return "";

        }


        /*
         * Ignore our own voice
         * transcript.
         */

        if (
            element.id ===
                "pingme-voice-transcript"
        ) {

            return "";

        }


        return cleanSpeechText(
            text
        );

    }


    // =====================================================
    // SPEAK AI RESPONSE
    // =====================================================

    async function speakAIResponse(
        text
    ) {

        processing =
            false;


        if (!text) {

            scheduleRestart();

            return;

        }


        lastAIText =
            text;


        await speakText(
            text
        );


        if (
            voiceModeActive &&
            settings.autoListen
        ) {

            startVoiceListening();

        }

    }


    // =====================================================
    // TEXT TO SPEECH
    // =====================================================

    function speakText(
        text
    ) {

        return new Promise(
            resolve => {

                if (
                    !window.speechSynthesis
                ) {

                    resolve();

                    return;

                }


                stopSpeech();


                const cleanText =
                    cleanSpeechText(
                        text
                    );


                if (!cleanText) {

                    resolve();

                    return;

                }


                const utterance =
                    new SpeechSynthesisUtterance(
                        cleanText
                    );


                utterance.lang =
                    currentLanguage;


                utterance.rate =
                    speechRate;


                utterance.volume =
                    speechVolume;


                utterance.pitch =
                    1;


                const voices =
                    window.speechSynthesis
                        .getVoices();


                const selectedVoice =
                    findBestVoice(
                        voices,
                        currentLanguage
                    );


                if (selectedVoice) {

                    utterance.voice =
                        selectedVoice;

                }


                speaking =
                    true;


                setVoiceState(
                    "speaking",
                    currentLanguage === "bn-BD"
                        ? "বলছি..."
                        : "Speaking..."
                );


                utterance.onend =
                    function () {

                        speaking =
                            false;

                        resolve();

                    };


                utterance.onerror =
                    function () {

                        speaking =
                            false;

                        resolve();

                    };


                window.speechSynthesis
                    .speak(
                        utterance
                    );

            }
        );

    }


    // =====================================================
    // STOP SPEECH
    // =====================================================

    function stopSpeech() {

        if (
            window.speechSynthesis
        ) {

            window.speechSynthesis.cancel();

        }


        speaking =
            false;

    }


    // =====================================================
    // FIND BEST VOICE
    // =====================================================

    function findBestVoice(
        voices,
        language
    ) {

        if (!voices || !voices.length) {
            return null;
        }


        const exact =
            voices.find(
                voice =>
                    voice.lang
                        .toLowerCase() ===
                    language.toLowerCase()
            );


        if (exact) {
            return exact;
        }


        const prefix =
            language
                .split("-")[0]
                .toLowerCase();


        const matching =
            voices.find(
                voice =>
                    voice.lang
                        .toLowerCase()
                        .startsWith(prefix)
            );


        return matching ||
            voices[0];

    }


    // =====================================================
    // CLEAN TEXT FOR SPEECH
    // =====================================================

    function cleanSpeechText(
        text
    ) {

        return String(text)

            .replace(
                /```[\s\S]*?```/g,
                " "
            )

            .replace(
                /[*_#>`~]/g,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }


    // =====================================================
    // TOGGLE LISTENING
    // =====================================================

    function toggleVoiceListening() {

        if (!voiceModeActive) {
            return;
        }


        if (speaking) {

            stopSpeech();

            startVoiceListening();

            return;

        }


        if (listening) {

            stopVoiceListening();

            setVoiceState(
                "idle",
                "Paused"
            );

            return;

        }


        startVoiceListening();

    }


    // =====================================================
    // STOP EVERYTHING
    // =====================================================

    function stopVoiceEverything() {

        stopVoiceListening();

        stopSpeech();


        processing =
            false;

        listening =
            false;

        speaking =
            false;


        if (responseObserver) {

            responseObserver.disconnect();

            responseObserver =
                null;

        }


        if (restartTimer) {

            clearTimeout(
                restartTimer
            );

            restartTimer =
                null;

        }


        setVoiceState(
            "idle",
            "Ready"
        );

    }


    // =====================================================
    // LANGUAGE
    // =====================================================

    function toggleLanguage() {

        if (
            currentLanguage ===
            "bn-BD"
        ) {

            currentLanguage =
                "en-US";

        } else {

            currentLanguage =
                "bn-BD";

        }


        saveSettings();


        updateLanguageButton();


        if (voiceModeActive) {

            setVoiceState(
                "idle",
                currentLanguage === "bn-BD"
                    ? "বাংলা"
                    : "English"
            );

        }

    }


    function updateLanguageButton() {

        const button =
            document.getElementById(
                "pingme-voice-language"
            );


        if (!button) {
            return;
        }


        button.textContent =
            currentLanguage === "bn-BD"
                ? "বাংলা"
                : "English";

    }


    // =====================================================
    // MAIN MIC BUTTON
    // =====================================================

    function connectMainMicButton() {

        const micButton =
            document.getElementById(
                "micButton"
            );


        if (!micButton) {

            return;

        }


        /*
         * IMPORTANT:
         *
         * Voice Mode is connected ONLY
         * to #micButton.
         *
         * sendButton is never touched.
         */


        micButton.addEventListener(
            "click",
            function () {

                openVoiceMode();

            }
        );

    }


    // =====================================================
    // KEYBOARD ESC
    // =====================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape" &&
                voiceModeActive
            ) {

                closeVoiceMode();

            }

        }
    );


    // =====================================================
    // CLEANUP
    // =====================================================

    window.addEventListener(
        "beforeunload",
        function () {

            stopVoiceEverything();

        }
    );


    // =====================================================
    // PUBLIC API
    // =====================================================

    window.PingMeVoice = {

        open:
            openVoiceMode,

        close:
            closeVoiceMode,

        start:
            startVoiceListening,

        stop:
            stopVoiceEverything,

        isActive:
            function () {

                return voiceModeActive;

            },

        setLanguage:
            function (language) {

                currentLanguage =
                    language;

                saveSettings();

                updateLanguageButton();

            },

        setRate:
            function (rate) {

                speechRate =
                    Number(rate) || 1;

                saveSettings();

            },

        setVolume:
            function (volume) {

                speechVolume =
                    Number(volume) || 1;

                saveSettings();

            }

    };


    // =====================================================
    // INITIALIZE
    // =====================================================

    function initializeVoiceSupport() {

        createVoiceRoom();

        updateLanguageButton();

        connectMainMicButton();


        if (
            window.speechSynthesis
        ) {

            window.speechSynthesis
                .getVoices();

        }


        console.log(
            "PingMe AI — Voice Mode Connected"
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeVoiceSupport
        );

    } else {

        initializeVoiceSupport();

    }

})();
