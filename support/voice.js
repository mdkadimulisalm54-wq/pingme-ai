// =========================================================
// PingMe AI — Complete Voice Mode Support
// =========================================================
// Includes:
// - Voice Room UI
// - Speech Recognition
// - Auto Listening
// - AI Greeting
// - AI Response Voice
// - Speaking / Listening Animation
// - Interrupt / Barge-in
// - Voice Settings
// - Language Settings
// - Speed / Volume
// - LocalStorage
// - Automatic connection to existing Mic Button
// - Automatic connection to existing Chat / Send system
// - No extra HTML UI required
// =========================================================


(() => {

    "use strict";


    // =====================================================
    // STATE
    // =====================================================

    let pingmeSpeechRecognition = null;

    let voiceInputActive = false;

    let voiceModeActive = false;

    let voiceSpeaking = false;

    let voiceProcessing = false;

    let voiceClosing = false;

    let recognitionRestartTimer = null;

    let speechWatchTimer = null;

    let lastSpokenResponse = "";

    let lastUserMessage = "";

    let voiceConversationStarted = false;

    let waitingForAIResponse = false;


    // =====================================================
    // SETTINGS
    // =====================================================

    const VOICE_SETTINGS_KEY =
        "pingme_voice_settings";


    const defaultVoiceSettings = {

        enabled: true,

        language: "bn-BD",

        speechRate: 1,

        speechVolume: 1,

        autoListen: true,

        greeting: true,

        greetingText:
            "হ্যালো, আমি PingMe AI। কিভাবে সাহায্য করতে পারি?",

        selectedVoice: "",

        theme: "sky"

    };


    let voiceSettings = loadVoiceSettings();


    function loadVoiceSettings() {

        try {

            const saved =
                localStorage.getItem(
                    VOICE_SETTINGS_KEY
                );


            if (!saved) {

                return {
                    ...defaultVoiceSettings
                };

            }


            return {

                ...defaultVoiceSettings,

                ...JSON.parse(saved)

            };

        } catch (error) {

            console.warn(
                "Voice Settings Load Error:",
                error
            );


            return {
                ...defaultVoiceSettings
            };

        }

    }


    function saveVoiceSettings() {

        try {

            localStorage.setItem(

                VOICE_SETTINGS_KEY,

                JSON.stringify(
                    voiceSettings
                )

            );

        } catch (error) {

            console.warn(
                "Voice Settings Save Error:",
                error
            );

        }

    }


    function setVoiceSetting(
        key,
        value
    ) {

        voiceSettings[key] =
            value;

        saveVoiceSettings();

    }


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
    // VOICE SYNTHESIS SUPPORT
    // =====================================================

    function isSpeechSynthesisSupported() {

        return (
            "speechSynthesis" in window
        );

    }


    // =====================================================
    // VOICE MODE UI
    // =====================================================

    let voiceOverlay = null;

    let voiceOrb = null;

    let voiceStatus = null;

    let voiceTranscript = null;

    let voiceCloseButton = null;

    let voiceMuteButton = null;


    function createVoiceUI() {

        if (voiceOverlay) {

            return;

        }


        const style =
            document.createElement("style");


        style.id =
            "pingme-voice-mode-style";


        style.textContent = `

/* =====================================================
   PINGME VOICE MODE
   ===================================================== */

#pingme-voice-overlay {

    position: fixed;

    inset: 0;

    z-index: 999999;

    display: none;

    align-items: center;

    justify-content: center;

    background:
        radial-gradient(
            circle at 50% 30%,
            rgba(75, 110, 255, 0.28),
            transparent 35%
        ),
        linear-gradient(
            160deg,
            #050816 0%,
            #08142c 45%,
            #07152a 70%,
            #03050c 100%
        );

    color: #fff;

    overflow: hidden;

    padding:
        env(safe-area-inset-top)
        20px
        env(safe-area-inset-bottom)
        20px;

    box-sizing: border-box;

    animation:
        pingmeVoiceOpen
        .35s
        ease
        forwards;

}


/* Background glow */

#pingme-voice-overlay::before {

    content: "";

    position: absolute;

    width: 420px;

    height: 420px;

    border-radius: 50%;

    background:
        radial-gradient(
            circle,
            rgba(80,150,255,.18),
            rgba(80,150,255,.05) 45%,
            transparent 70%
        );

    filter: blur(20px);

    animation:
        pingmeVoiceBackground
        7s
        ease-in-out
        infinite;

}


/* Main container */

#pingme-voice-room {

    position: relative;

    width: 100%;

    max-width: 520px;

    height: 100%;

    max-height: 900px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: space-between;

    padding:
        30px
        0
        24px;

    box-sizing: border-box;

}


/* Top */

#pingme-voice-top {

    width: 100%;

    display: flex;

    align-items: center;

    justify-content: space-between;

}


.pingme-voice-title {

    font-size: 18px;

    font-weight: 700;

    letter-spacing: .2px;

}


.pingme-voice-subtitle {

    margin-top: 3px;

    font-size: 12px;

    opacity: .55;

}


#pingme-voice-close {

    width: 42px;

    height: 42px;

    border: none;

    border-radius: 50%;

    background:
        rgba(255,255,255,.10);

    color: white;

    font-size: 22px;

    cursor: pointer;

    backdrop-filter: blur(12px);

}


/* Center */

#pingme-voice-center {

    flex: 1;

    width: 100%;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

}


/* Orb */

#pingme-voice-orb {

    position: relative;

    width: min(72vw, 300px);

    height: min(72vw, 300px);

    border-radius: 50%;

    display: flex;

    align-items: center;

    justify-content: center;

    background:
        radial-gradient(
            circle at 35% 25%,
            #8cc8ff 0%,
            #4479ff 25%,
            #3038a5 55%,
            #121642 78%,
            #080a1d 100%
        );

    box-shadow:
        0 0 35px
        rgba(70,130,255,.35),

        0 0 90px
        rgba(80,100,255,.20),

        inset 0 0 45px
        rgba(255,255,255,.12);

    transition:
        transform .25s ease,
        box-shadow .25s ease;

}


/* Orb inner glow */

#pingme-voice-orb::before {

    content: "";

    position: absolute;

    inset: -12px;

    border-radius: 50%;

    border:
        1px solid
        rgba(130,190,255,.28);

    animation:
        pingmeVoiceRing
        3s
        ease-in-out
        infinite;

}


/* Voice waves */

.pingme-voice-wave {

    position: absolute;

    width: 100%;

    height: 100%;

    border-radius: 50%;

    border:
        2px solid
        rgba(125,190,255,.20);

    transform: scale(1);

    opacity: .65;

}


.pingme-voice-wave.wave-one {

    animation:
        pingmeVoiceWave
        1.8s
        ease-out
        infinite;

}


.pingme-voice-wave.wave-two {

    animation:
        pingmeVoiceWave
        1.8s
        .6s
        ease-out
        infinite;

}


.pingme-voice-wave.wave-three {

    animation:
        pingmeVoiceWave
        1.8s
        1.2s
        ease-out
        infinite;

}


/* Avatar */

#pingme-voice-avatar {

    position: relative;

    z-index: 4;

    width: 112px;

    height: 112px;

    border-radius: 50%;

    overflow: hidden;

    background:
        rgba(255,255,255,.12);

    border:
        2px solid
        rgba(255,255,255,.35);

    box-shadow:
        0 8px 35px
        rgba(0,0,0,.30);

}


#pingme-voice-avatar img {

    width: 100%;

    height: 100%;

    object-fit: cover;

    display: block;

}


/* Status */

#pingme-voice-status {

    margin-top: 34px;

    font-size: 17px;

    font-weight: 600;

    text-align: center;

    min-height: 25px;

}


#pingme-voice-transcript {

    margin-top: 10px;

    max-width: 90%;

    min-height: 22px;

    text-align: center;

    font-size: 13px;

    line-height: 1.5;

    opacity: .55;

}


/* Bottom */

#pingme-voice-bottom {

    width: 100%;

    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 18px;

}


/* Listening dots */

#pingme-voice-level {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 5px;

    height: 30px;

}


.pingme-voice-level-bar {

    width: 4px;

    height: 6px;

    border-radius: 20px;

    background:
        rgba(150,210,255,.8);

    transition:
        height .12s ease;

}


/* Main control */

#pingme-voice-main-button {

    width: 68px;

    height: 68px;

    border: none;

    border-radius: 50%;

    background:
        rgba(255,255,255,.12);

    color: white;

    display: flex;

    align-items: center;

    justify-content: center;

    cursor: pointer;

    backdrop-filter: blur(15px);

    box-shadow:
        0 8px 30px
        rgba(0,0,0,.25);

    transition:
        transform .2s ease,
        background .2s ease;

}


#pingme-voice-main-button:active {

    transform: scale(.92);

}


#pingme-voice-main-button.muted {

    background:
        rgba(220,60,60,.80);

}


/* Settings */

#pingme-voice-settings {

    display: flex;

    gap: 10px;

}


.pingme-voice-small-button {

    min-width: 46px;

    height: 40px;

    padding: 0 14px;

    border: none;

    border-radius: 20px;

    background:
        rgba(255,255,255,.09);

    color: white;

    font-size: 13px;

    cursor: pointer;

}


/* States */

#pingme-voice-overlay.listening
#pingme-voice-orb {

    transform: scale(1.035);

}


#pingme-voice-overlay.speaking
#pingme-voice-orb {

    transform: scale(1.055);

    box-shadow:
        0 0 55px
        rgba(100,180,255,.50),

        0 0 120px
        rgba(100,120,255,.28),

        inset 0 0 55px
        rgba(255,255,255,.16);

}


#pingme-voice-overlay.processing
#pingme-voice-orb {

    animation:
        pingmeVoiceProcessing
        1.3s
        ease-in-out
        infinite;

}


/* Animations */

@keyframes pingmeVoiceOpen {

    from {

        opacity: 0;

        transform: scale(.98);

    }

    to {

        opacity: 1;

        transform: scale(1);

    }

}


@keyframes pingmeVoiceBackground {

    0%,100% {

        transform:
            translate(-20px,-10px)
            scale(1);

    }

    50% {

        transform:
            translate(20px,15px)
            scale(1.12);

    }

}


@keyframes pingmeVoiceRing {

    0%,100% {

        transform: scale(1);

        opacity: .35;

    }

    50% {

        transform: scale(1.05);

        opacity: .75;

    }

}


@keyframes pingmeVoiceWave {

    0% {

        transform: scale(1);

        opacity: .55;

    }

    100% {

        transform: scale(1.45);

        opacity: 0;

    }

}


@keyframes pingmeVoiceProcessing {

    0%,100% {

        transform: scale(1);

    }

    50% {

        transform: scale(1.025);

    }

}


@media (max-height: 650px) {

    #pingme-voice-orb {

        width: 210px;

        height: 210px;

    }

    #pingme-voice-avatar {

        width: 82px;

        height: 82px;

    }

    #pingme-voice-status {

        margin-top: 20px;

    }

}

        `;


        document.head.appendChild(style);


        // =================================================
        // OVERLAY
        // =================================================

        voiceOverlay =
            document.createElement("div");


        voiceOverlay.id =
            "pingme-voice-overlay";


        voiceOverlay.innerHTML = `

            <div id="pingme-voice-room">


                <div id="pingme-voice-top">

                    <div>

                        <div
                            class="pingme-voice-title">

                            PingMe AI

                        </div>

                        <div
                            class="pingme-voice-subtitle">

                            Voice Mode

                        </div>

                    </div>


                    <button
                        type="button"
                        id="pingme-voice-close"
                        aria-label="Close">

                        ×

                    </button>

                </div>


                <div id="pingme-voice-center">


                    <div
                        id="pingme-voice-orb">


                        <div
                            class="pingme-voice-wave wave-one">
                        </div>


                        <div
                            class="pingme-voice-wave wave-two">
                        </div>


                        <div
                            class="pingme-voice-wave wave-three">
                        </div>


                        <div
                            id="pingme-voice-avatar">

                            <img
                                src="icon-192.png"
                                alt="PingMe AI">

                        </div>


                    </div>


                    <div
                        id="pingme-voice-status">

                        Connecting...

                    </div>


                    <div
                        id="pingme-voice-transcript">

                    </div>


                </div>


                <div id="pingme-voice-bottom">


                    <div
                        id="pingme-voice-level">

                        <span
                            class="pingme-voice-level-bar">
                        </span>

                        <span
                            class="pingme-voice-level-bar">
                        </span>

                        <span
                            class="pingme-voice-level-bar">
                        </span>

                        <span
                            class="pingme-voice-level-bar">
                        </span>

                        <span
                            class="pingme-voice-level-bar">
                        </span>

                        <span
                            class="pingme-voice-level-bar">
                        </span>

                        <span
                            class="pingme-voice-level-bar">
                        </span>

                    </div>


                    <button
                        type="button"
                        id="pingme-voice-main-button"
                        aria-label="Mute voice">

                        🎙️

                    </button>


                    <div
                        id="pingme-voice-settings">

                        <button
                            type="button"
                            id="pingme-voice-language"
                            class="pingme-voice-small-button">

                            বাংলা

                        </button>

                    </div>


                </div>


            </div>

        `;


        document.body.appendChild(
            voiceOverlay
        );


        // =================================================
        // ELEMENT REFERENCES
        // =================================================

        voiceOrb =
            document.getElementById(
                "pingme-voice-orb"
            );


        voiceStatus =
            document.getElementById(
                "pingme-voice-status"
            );


        voiceTranscript =
            document.getElementById(
                "pingme-voice-transcript"
            );


        voiceCloseButton =
            document.getElementById(
                "pingme-voice-close"
            );


        voiceMuteButton =
            document.getElementById(
                "pingme-voice-main-button"
            );


        // =================================================
        // CLOSE
        // =================================================

        voiceCloseButton.addEventListener(
            "click",
            function () {

                closeVoiceMode();

            }
        );


        // =================================================
        // MUTE / STOP
        // =================================================

        voiceMuteButton.addEventListener(
            "click",
            function () {

                if (
                    voiceInputActive
                ) {

                    stopVoiceInput();

                    setVoiceState(
                        "idle"
                    );

                    return;

                }


                if (
                    voiceSpeaking
                ) {

                    stopVoiceSpeech();

                    return;

                }


                if (
                    voiceModeActive
                ) {

                    startVoiceListening();

                }

            }
        );


        // =================================================
        // LANGUAGE BUTTON
        // =================================================

        const languageButton =
            document.getElementById(
                "pingme-voice-language"
            );


        languageButton.addEventListener(
            "click",
            function () {

                toggleVoiceLanguage();

            }
        );


        // =================================================
        // ESC KEY
        // =================================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    voiceModeActive
                ) {

                    closeVoiceMode();

                }

            }
        );

    }


    // =====================================================
    // VOICE STATE
    // =====================================================

    function setVoiceState(
        state
    ) {

        if (!voiceOverlay) {

            return;

        }


        voiceOverlay.classList.remove(
            "listening",
            "speaking",
            "processing"
        );


        if (state === "listening") {

            voiceOverlay.classList.add(
                "listening"
            );


            voiceStatus.textContent =
                "Listening…";

        }


        else if (
            state === "speaking"
        ) {

            voiceOverlay.classList.add(
                "speaking"
            );


            voiceStatus.textContent =
                "PingMe AI is speaking…";

        }


        else if (
            state === "processing"
        ) {

            voiceOverlay.classList.add(
                "processing"
            );


            voiceStatus.textContent =
                "Thinking…";

        }


        else if (
            state === "idle"
        ) {

            voiceStatus.textContent =
                "Tap the microphone to speak";

        }


        else if (
            state === "connecting"
        ) {

            voiceStatus.textContent =
                "Connecting…";

        }

    }


    // =====================================================
    // VOICE LEVEL ANIMATION
    // =====================================================

    let levelAnimationTimer = null;


    function startVoiceLevelAnimation() {

        stopVoiceLevelAnimation();


        const bars =
            document.querySelectorAll(
                ".pingme-voice-level-bar"
            );


        levelAnimationTimer =
            setInterval(
                function () {

                    bars.forEach(
                        function (bar) {

                            const height =
                                5 +
                                Math.random() *
                                22;


                            bar.style.height =
                                height + "px";

                        }
                    );

                },
                120
            );

    }


    function stopVoiceLevelAnimation() {

        if (
            levelAnimationTimer
        ) {

            clearInterval(
                levelAnimationTimer
            );

            levelAnimationTimer =
                null;

        }


        const bars =
            document.querySelectorAll(
                ".pingme-voice-level-bar"
            );


        bars.forEach(
            function (bar) {

                bar.style.height =
                    "6px";

            }
        );

    }


    // =====================================================
    // OPEN VOICE MODE
    // =====================================================

    async function openVoiceMode() {

        if (voiceModeActive) {

            return;

        }


        createVoiceUI();


        voiceModeActive =
            true;


        voiceClosing =
            false;


        voiceConversationStarted =
            false;


        lastSpokenResponse =
            "";


        lastUserMessage =
            "";


        waitingForAIResponse =
            false;


        voiceOverlay.style.display =
            "flex";


        document.body.style.overflow =
            "hidden";


        setVoiceState(
            "connecting"
        );


        startVoiceLevelAnimation();


        // Give UI time to appear
        await delay(350);


        // Greeting
        if (
            voiceSettings.greeting &&
            voiceSettings.enabled
        ) {

            await speakText(
                voiceSettings.greetingText
            );

        }


        if (
            voiceClosing ||
            !voiceModeActive
        ) {

            return;

        }


        voiceConversationStarted =
            true;


        if (
            voiceSettings.autoListen
        ) {

            startVoiceListening();

        } else {

            setVoiceState(
                "idle"
            );

        }

    }


    // =====================================================
    // CLOSE VOICE MODE
    // =====================================================

    function closeVoiceMode() {

        if (
            voiceClosing
        ) {

            return;

        }


        voiceClosing =
            true;


        voiceModeActive =
            false;


        waitingForAIResponse =
            false;


        voiceConversationStarted =
            false;


        stopVoiceInput();


        stopVoiceSpeech();


        if (
            recognitionRestartTimer
        ) {

            clearTimeout(
                recognitionRestartTimer
            );

            recognitionRestartTimer =
                null;

        }


        stopVoiceLevelAnimation();


        if (speechWatchTimer) {

            clearTimeout(
                speechWatchTimer
            );

            speechWatchTimer =
                null;

        }


        if (voiceOverlay) {

            voiceOverlay.style.display =
                "none";

        }


        document.body.style.overflow =
            "";


        setTimeout(
            function () {

                voiceClosing =
                    false;

            },
            100
        );

    }


    // =====================================================
    // START VOICE INPUT
    // =====================================================

    function startVoiceListening() {

        if (
            !voiceModeActive ||
            voiceClosing
        ) {

            return;

        }


        if (
            voiceProcessing
        ) {

            return;

        }


        if (
            voiceSpeaking
        ) {

            stopVoiceSpeech();

        }


        if (
            !isSpeechRecognitionSupported()
        ) {

            setVoiceState(
                "idle"
            );


            showVoiceMessage(
                "এই browser-এ Voice Input support নেই।"
            );


            return;

        }


        stopVoiceInput();


        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        pingmeSpeechRecognition =
            new Recognition();


        pingmeSpeechRecognition.lang =
            voiceSettings.language;


        pingmeSpeechRecognition.continuous =
            false;


        pingmeSpeechRecognition.interimResults =
            true;


        voiceInputActive =
            true;


        setVoiceState(
            "listening"
        );


        pingmeSpeechRecognition.onstart =
            function () {

                voiceInputActive =
                    true;


                setVoiceState(
                    "listening"
                );


                console.log(
                    "Voice Input Started"
                );

            };


        pingmeSpeechRecognition.onresult =
            function (event) {

                let finalText = "";

                let interimText = "";


                for (
                    let i =
                        event.resultIndex;

                    i <
                    event.results.length;

                    i++
                ) {

                    const transcript =
                        event
                            .results[i][0]
                            .transcript;


                    if (
                        event
                            .results[i]
                            .isFinal
                    ) {

                        finalText +=
                            transcript;

                    } else {

                        interimText +=
                            transcript;

                    }

                }


                const visibleText =
                    (
                        finalText ||
                        interimText
                    ).trim();


                if (
                    voiceTranscript
                ) {

                    voiceTranscript.textContent =
                        visibleText;

                }


                if (
                    finalText.trim()
                ) {

                    handleVoiceUserMessage(
                        finalText.trim()
                    );

                }

            };


        pingmeSpeechRecognition.onend =
            function () {

                voiceInputActive =
                    false;


                console.log(
                    "Voice Input Ended"
                );


                if (
                    !voiceModeActive ||
                    voiceClosing
                ) {

                    return;

                }


                if (
                    !waitingForAIResponse &&
                    !voiceSpeaking
                ) {

                    setVoiceState(
                        "idle"
                    );

                }

            };


        pingmeSpeechRecognition.onerror =
            function (event) {

                voiceInputActive =
                    false;


                console.error(
                    "Voice Input Error:",
                    event.error
                );


                if (
                    event.error ===
                    "aborted"
                ) {

                    return;

                }


                if (
                    event.error ===
                    "no-speech"
                ) {

                    if (
                        voiceModeActive &&
                        voiceSettings.autoListen
                    ) {

                        scheduleVoiceRestart();

                    }

                    return;

                }


                showVoiceMessage(
                    getVoiceErrorMessage(
                        event.error
                    )
                );


                setVoiceState(
                    "idle"
                );

            };


        try {

            pingmeSpeechRecognition.start();

        } catch (error) {

            voiceInputActive =
                false;


            console.error(
                "Voice Input Start Error:",
                error
            );


            setVoiceState(
                "idle"
            );

        }

    }


    // =====================================================
    // STOP VOICE INPUT
    // =====================================================

    function stopVoiceInput() {

        if (
            !pingmeSpeechRecognition
        ) {

            voiceInputActive =
                false;

            return;

        }


        try {

            pingmeSpeechRecognition.stop();

        } catch (error) {

            console.warn(
                "Voice Input Stop Error:",
                error
            );

        }


        voiceInputActive =
            false;

    }


    // =====================================================
    // RESTART LISTENING
    // =====================================================

    function scheduleVoiceRestart() {

        if (
            recognitionRestartTimer
        ) {

            clearTimeout(
                recognitionRestartTimer
            );

        }


        recognitionRestartTimer =
            setTimeout(
                function () {

                    if (
                        voiceModeActive &&
                        !voiceSpeaking &&
                        !waitingForAIResponse
                    ) {

                        startVoiceListening();

                    }

                },
                500
            );

    }


    // =====================================================
    // HANDLE USER VOICE
    // =====================================================

    async function handleVoiceUserMessage(
        text
    ) {

        if (
            !text ||
            !voiceModeActive
        ) {

            return;

        }


        if (
            voiceProcessing
        ) {

            return;

        }


        lastUserMessage =
            text;


        waitingForAIResponse =
            true;


        stopVoiceInput();


        if (
            voiceTranscript
        ) {

            voiceTranscript.textContent =
                text;

        }


        setVoiceState(
            "processing"
        );


        try {

            const sent =
                await sendVoiceMessageToExistingChat(
                    text
                );


            if (
                !sent
            ) {

                // যদি existing chat response
                // detect না করা যায়
                // fallback message

                await speakText(
                    "দুঃখিত, আমি এখন উত্তরটি পেতে পারছি না।"
                );

            }

        } catch (error) {

            console.error(
                "Voice AI Error:",
                error
            );


            await speakText(
                "দুঃখিত, একটি সমস্যা হয়েছে।"
            );

        }


        waitingForAIResponse =
            false;


        if (
            voiceModeActive &&
            voiceSettings.autoListen &&
            !voiceClosing
        ) {

            scheduleVoiceRestart();

        }

    }


    // =====================================================
    // SEND MESSAGE THROUGH EXISTING PINGME CHAT
    // =====================================================

    async function sendVoiceMessageToExistingChat(
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


        if (
            !input ||
            !sendButton
        ) {

            console.warn(
                "PingMe chat input/send button not found."
            );


            return false;

        }


        const chatArea =
            document.getElementById(
                "chatArea"
            );


        const previousCount =
            chatArea
                ? chatArea.children.length
                : 0;


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


        // Observe new AI response

        const responsePromise =
            waitForAIResponse(
                chatArea,
                previousCount
            );


        sendButton.click();


        const response =
            await responsePromise;


        if (
            response
        ) {

            await speakText(
                response
            );


            return true;

        }


        return false;

    }


    // =====================================================
    // WATCH EXISTING CHAT FOR AI RESPONSE
    // =====================================================

    function waitForAIResponse(
        chatArea,
        previousCount
    ) {

        return new Promise(
            function (resolve) {

                if (!chatArea) {

                    resolve(null);

                    return;

                }


                let finished =
                    false;


                let observer =
                    null;


                const finish =
                    function (text) {

                        if (
                            finished
                        ) {

                            return;

                        }


                        finished =
                            true;


                        if (
                            observer
                        ) {

                            observer.disconnect();

                        }


                        if (
                            speechWatchTimer
                        ) {

                            clearTimeout(
                                speechWatchTimer
                            );

                            speechWatchTimer =
                                null;

                        }


                        resolve(
                            text
                                ? text.trim()
                                : null
                        );

                    };


                const findResponse =
                    function () {

                        const children =
                            Array.from(
                                chatArea.children
                            );


                        if (
                            children.length <=
                            previousCount
                        ) {

                            return;

                        }


                        const candidates =
                            children.slice(
                                previousCount
                            );


                        for (
                            let i = 0;

                            i <
                            candidates.length;

                            i++
                        ) {

                            const element =
                                candidates[i];


                            const text =
                                (
                                    element.innerText ||
                                    element.textContent ||
                                    ""
                                ).trim();


                            if (
                                !text
                            ) {

                                continue;

                            }


                            if (
                                isLikelyUserMessage(
                                    element
                                )
                            ) {

                                continue;

                            }


                            if (
                                isLikelyThinkingElement(
                                    element
                                )
                            ) {

                                continue;

                            }


                            finish(
                                text
                            );

                            return;

                        }

                    };


                observer =
                    new MutationObserver(
                        function () {

                            findResponse();

                        }
                    );


                observer.observe(
                    chatArea,
                    {
                        childList: true,
                        subtree: true,
                        characterData: true
                    }
                );


                findResponse();


                speechWatchTimer =
                    setTimeout(
                        function () {

                            finish(
                                null
                            );

                        },
                        30000
                    );

            }
        );

    }


    // =====================================================
    // DETECT USER MESSAGE
    // =====================================================

    function isLikelyUserMessage(
        element
    ) {

        const className =
            (
                element.className ||
                ""
            ).toString().toLowerCase();


        const id =
            (
                element.id ||
                ""
            ).toString().toLowerCase();


        return (
            className.includes("user") ||
            className.includes("message-user") ||
            className.includes("sent") ||
            id.includes("user")
        );

    }


    // =====================================================
    // DETECT THINKING
    // =====================================================

    function isLikelyThinkingElement(
        element
    ) {

        const className =
            (
                element.className ||
                ""
            ).toString().toLowerCase();


        const id =
            (
                element.id ||
                ""
            ).toString().toLowerCase();


        return (
            className.includes("thinking") ||
            className.includes("loading") ||
            id.includes("thinking")
        );

    }


    // =====================================================
    // AI SPEECH
    // =====================================================

    function speakText(
        text
    ) {

        return new Promise(
            function (resolve) {

                if (
                    !text ||
                    !voiceModeActive
                ) {

                    resolve();

                    return;

                }


                if (
                    !isSpeechSynthesisSupported()
                ) {

                    resolve();

                    return;

                }


                stopVoiceSpeech();


                let cleanText =
                    cleanTextForSpeech(
                        text
                    );


                if (
                    !cleanText
                ) {

                    resolve();

                    return;

                }


                lastSpokenResponse =
                    cleanText;


                voiceSpeaking =
                    true;


                setVoiceState(
                    "speaking"
                );


                const utterance =
                    new SpeechSynthesisUtterance(
                        cleanText
                    );


                utterance.lang =
                    voiceSettings.language;


                utterance.rate =
                    voiceSettings.speechRate;


                utterance.volume =
                    voiceSettings.speechVolume;


                const voices =
                    window.speechSynthesis
                        .getVoices();


                const selectedVoice =
                    findBestVoice(
                        voices,
                        voiceSettings
                            .language,
                        voiceSettings
                            .selectedVoice
                    );


                if (
                    selectedVoice
                ) {

                    utterance.voice =
                        selectedVoice;

                }


                utterance.onstart =
                    function () {

                        voiceSpeaking =
                            true;


                        setVoiceState(
                            "speaking"
                        );

                    };


                utterance.onend =
                    function () {

                        voiceSpeaking =
                            false;


                        setVoiceState(
                            "idle"
                        );


                        resolve();

                    };


                utterance.onerror =
                    function (error) {

                        voiceSpeaking =
                            false;


                        console.warn(
                            "Speech Synthesis Error:",
                            error
                        );


                        setVoiceState(
                            "idle"
                        );


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
    // STOP AI SPEECH
    // =====================================================

    function stopVoiceSpeech() {

        if (
            isSpeechSynthesisSupported()
        ) {

            window.speechSynthesis.cancel();

        }


        voiceSpeaking =
            false;

    }


    // =====================================================
    // FIND BEST VOICE
    // =====================================================

    function findBestVoice(
        voices,
        language,
        selectedVoice
    ) {

        if (
            !voices ||
            !voices.length
        ) {

            return null;

        }


        if (
            selectedVoice
        ) {

            const selected =
                voices.find(
                    function (voice) {

                        return (
                            voice.name ===
                            selectedVoice
                        );

                    }
                );


            if (
                selected
            ) {

                return selected;

            }

        }


        const exact =
            voices.find(
                function (voice) {

                    return (
                        voice.lang ===
                        language
                    );

                }
            );


        if (
            exact
        ) {

            return exact;

        }


        const baseLanguage =
            language.split("-")[0];


        const sameLanguage =
            voices.find(
                function (voice) {

                    return (
                        voice.lang
                            .toLowerCase()
                            .startsWith(
                                baseLanguage
                                    .toLowerCase()
                            )
                    );

                }
            );


        if (
            sameLanguage
        ) {

            return sameLanguage;

        }


        return voices[0];

    }


    // =====================================================
    // CLEAN TEXT FOR SPEECH
    // =====================================================

    function cleanTextForSpeech(
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
                /\[([^\]]+)\]\([^)]+\)/g,
                "$1"
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }


    // =====================================================
    // LANGUAGE SWITCH
    // =====================================================

    function toggleVoiceLanguage() {

        if (
            voiceSettings.language ===
            "bn-BD"
        ) {

            setVoiceSetting(
                "language",
                "en-US"
            );

        } else {

            setVoiceSetting(
                "language",
                "bn-BD"
            );

        }


        updateLanguageButton();


        if (
            voiceModeActive &&
            voiceInputActive
        ) {

            stopVoiceInput();

            scheduleVoiceRestart();

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
            voiceSettings.language ===
            "bn-BD"
                ? "বাংলা"
                : "English";

    }


    // =====================================================
    // VOICE ERROR MESSAGE
    // =====================================================

    function getVoiceErrorMessage(
        error
    ) {

        switch (error) {

            case "not-allowed":

                return "Microphone permission দেওয়া হয়নি।";


            case "audio-capture":

                return "Microphone পাওয়া যাচ্ছে না।";


            case "network":

                return "Voice network connection-এ সমস্যা হয়েছে।";


            case "service-not-allowed":

                return "Voice service ব্যবহার করা যাচ্ছে না।";


            case "language-not-supported":

                return "এই ভাষাটি Voice Input-এ support করছে না।";


            default:

                return "Voice Input-এ সমস্যা হয়েছে।";

        }

    }


    // =====================================================
    // SHOW VOICE MESSAGE
    // =====================================================

    function showVoiceMessage(
        message
    ) {

        if (
            voiceTranscript
        ) {

            voiceTranscript.textContent =
                message;

        }

    }


    // =====================================================
    // CHECK CURRENT INPUT STATE
    // =====================================================

    function isVoiceInputActive() {

        return voiceInputActive;

    }


    // =====================================================
    // CONNECT MAIN MIC BUTTON
    // =====================================================

    function connectMainMicButton() {

        const micButton =
            document.getElementById(
                "micButton"
            );


        if (!micButton) {

            console.warn(
                "PingMe Voice: micButton not found."
            );

            return;

        }


        micButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                if (
                    voiceModeActive
                ) {

                    return;

                }


                openVoiceMode();

            }
        );


        console.log(
            "PingMe Voice Button Connected"
        );

    }


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
            stopVoiceInput,

        speak:
            speakText,

        stopSpeaking:
            stopVoiceSpeech,

        isActive:
            function () {

                return voiceModeActive;

            },

        isListening:
            isVoiceInputActive,

        getSettings:
            function () {

                return {
                    ...voiceSettings
                };

            },

        setSetting:
            setVoiceSetting

    };


    // =====================================================
    // UTILITY
    // =====================================================

    function delay(
        milliseconds
    ) {

        return new Promise(
            function (resolve) {

                setTimeout(
                    resolve,
                    milliseconds
                );

            }
        );

    }


    // =====================================================
    // BROWSER VOICE LOAD
    // =====================================================

    if (
        isSpeechSynthesisSupported()
    ) {

        window.speechSynthesis
            .addEventListener(
                "voiceschanged",
                function () {

                    console.log(
                        "PingMe AI Voices Loaded"
                    );

                }
            );

    }


    // =====================================================
    // PAGE CLEANUP
    // =====================================================

    window.addEventListener(
        "beforeunload",
        function () {

            stopVoiceInput();

            stopVoiceSpeech();

        }
    );


    // =====================================================
    // INITIALIZE
    // =====================================================

    function initializeVoiceSupport() {

        createVoiceUI();

        updateLanguageButton();

        connectMainMicButton();


        console.log(
            "PingMe AI — Complete Voice Support Connected"
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