/* =========================================================
   PingMe AI — Voice Room
   Auto Voice • Auto Language • Animated AI Orb
   ========================================================= */

(function () {

    "use strict";

    const sendButton = document.getElementById("sendButton");
    const input = document.getElementById("chatInput");

    if (!sendButton || !input) {
        console.error("PingMe Voice: sendButton or chatInput not found.");
        return;
    }


    const speechSupported =
        "speechSynthesis" in window;

    let room = null;

    let roomOpen = false;
    let keepListening = false;
    let speaking = false;

    let microphoneReady = false;
    let lastSpokenResponse = "";

    /* =====================================================
       CREATE VOICE ROOM
       ===================================================== */

    function createRoom() {

        if (room) return;

        room = document.createElement("div");

        room.id = "pingmeVoiceRoom";

        room.innerHTML = `
            <div class="voice-room-bg">

                <div class="voice-orb-glow glow-one"></div>
                <div class="voice-orb-glow glow-two"></div>

                <button
                    class="voice-room-close"
                    id="voiceRoomClose"
                    type="button"
                    aria-label="Close"
                >
                    ×
                </button>

                <div class="voice-room-content">

                    <div
                        class="voice-room-status"
                        id="voiceRoomStatus"
                    >
                        Listening...
                    </div>

                    <div
                        class="voice-orb"
                        id="voiceOrb"
                    >

                        <div class="orb-ring ring-one"></div>
                        <div class="orb-ring ring-two"></div>

                        <div
                            class="orb-core"
                            id="orbCore"
                        >
                            <div class="orb-light"></div>

                            <div class="orb-inner">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>

                    </div>

                    <div
                        class="voice-bars"
                        id="voiceBars"
                    >
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                    </div>

                    <div class="voice-room-label">
                        PingMe AI
                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(room);

        addStyles();

        const close =
            document.getElementById("voiceRoomClose");

        close.addEventListener(
            "click",
            closeRoom
        );

        startOrbAnimation();
    }

    /* =====================================================
       STYLE
       ===================================================== */

    function addStyles() {

        if (document.getElementById("pingmeVoiceRoomStyle")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "pingmeVoiceRoomStyle";

        style.textContent = `

        #pingmeVoiceRoom {
            position: fixed;
            inset: 0;
            z-index: 999999;
            overflow: hidden;
            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;
        }

        .voice-room-bg {
            position: absolute;
            inset: 0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;

            background:
                radial-gradient(
                    circle at 50% 45%,
                    #182f62 0%,
                    #0b1735 32%,
                    #050b1c 67%,
                    #02040b 100%
                );
        }

        .voice-room-content {
            position: relative;
            z-index: 5;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .voice-room-close {
            position: absolute;
            top: 26px;
            right: 22px;
            z-index: 20;

            width: 44px;
            height: 44px;

            border: 0;
            border-radius: 50%;

            background:
                rgba(255,255,255,.09);

            color: white;
            font-size: 30px;
            line-height: 42px;

            cursor: pointer;

            -webkit-tap-highlight-color:
                transparent;
        }

        .voice-room-close:active {
            transform: scale(.92);
        }

        .voice-room-status {
            position: absolute;
            top: 88px;
            left: 20px;
            right: 20px;

            text-align: center;

            color:
                rgba(255,255,255,.72);

            font-size: 15px;
            font-weight: 500;

            min-height: 22px;
        }

        .voice-orb {
            position: relative;

            width: 260px;
            height: 260px;

            display: flex;
            align-items: center;
            justify-content: center;
        }

        .orb-ring {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
        }

        .ring-one {
            width: 245px;
            height: 245px;

            border:
                1px solid
                rgba(96,165,250,.28);

            animation:
                orbRingOne
                4s ease-in-out infinite;
        }

        .ring-two {
            width: 295px;
            height: 295px;

            border:
                1px solid
                rgba(59,130,246,.13);

            animation:
                orbRingTwo
                5s ease-in-out infinite;
        }

        .orb-core {
            position: relative;

            width: 178px;
            height: 178px;

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            overflow: hidden;

            background:
                radial-gradient(
                    circle at 35% 28%,
                    #8bd5ff 0%,
                    #4298ff 24%,
                    #2563eb 48%,
                    #111d48 100%
                );

            box-shadow:
                0 0 30px
                rgba(59,130,246,.55),

                0 0 75px
                rgba(59,130,246,.27),

                inset 0 0 30px
                rgba(255,255,255,.17);

            animation:
                orbFloat
                3s ease-in-out infinite;
        }

        .orb-light {
            position: absolute;
            inset: -35%;

            background:
                conic-gradient(
                    from 0deg,
                    transparent,
                    rgba(255,255,255,.18),
                    transparent,
                    rgba(96,165,250,.16),
                    transparent
                );

            animation:
                orbLight
                4s linear infinite;
        }

        .orb-inner {
            position: relative;

            width: 92px;
            height: 92px;

            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .orb-inner span {
            width: 7px;
            height: 28px;

            border-radius: 20px;

            background:
                rgba(255,255,255,.9);

            box-shadow:
                0 0 12px
                rgba(255,255,255,.45);

            animation:
                orbWave
                1.2s ease-in-out infinite;
        }

        .orb-inner span:nth-child(2) {
            animation-delay: .12s;
        }

        .orb-inner span:nth-child(3) {
            animation-delay: .24s;
        }

        .orb-inner span:nth-child(4) {
            animation-delay: .36s;
        }

        .orb-inner span:nth-child(5) {
            animation-delay: .48s;
        }

        .voice-bars {
            margin-top: 42px;

            height: 38px;

            display: flex;
            align-items: center;
            justify-content: center;

            gap: 5px;
        }

        .voice-bars i {
            display: block;

            width: 4px;
            height: 7px;

            border-radius: 20px;

            background:
                rgba(147,197,253,.85);

            animation:
                voiceBar
                1s ease-in-out infinite;

            animation-play-state:
                paused;
        }

        #pingmeVoiceRoom.active
        .voice-bars i {

            animation-play-state:
                running;
        }

        .voice-bars i:nth-child(2) {
            animation-delay: .1s;
        }

        .voice-bars i:nth-child(3) {
            animation-delay: .2s;
        }

        .voice-bars i:nth-child(4) {
            animation-delay: .3s;
        }

        .voice-bars i:nth-child(5) {
            animation-delay: .4s;
        }

        .voice-bars i:nth-child(6) {
            animation-delay: .3s;
        }

        .voice-bars i:nth-child(7) {
            animation-delay: .2s;
        }

        .voice-bars i:nth-child(8) {
            animation-delay: .1s;
        }

        .voice-bars i:nth-child(9) {
            animation-delay: 0s;
        }

        .voice-room-label {
            margin-top: 24px;

            color:
                rgba(255,255,255,.48);

            font-size: 13px;
            letter-spacing: .4px;
        }

        .voice-room-speaking .orb-core {
            animation:
                orbSpeaking
                .9s ease-in-out infinite;
        }

        .voice-room-speaking .ring-one {
            animation:
                speakingRingOne
                1.1s ease-in-out infinite;
        }

        .voice-room-speaking .ring-two {
            animation:
                speakingRingTwo
                1.3s ease-in-out infinite;
        }

        @keyframes orbFloat {

            0%,100% {
                transform:
                    translateY(0)
                    scale(1);
            }

            50% {
                transform:
                    translateY(-9px)
                    scale(1.025);
            }
        }

        @keyframes orbSpeaking {

            0%,100% {
                transform:
                    translateY(0)
                    scale(.97);
            }

            50% {
                transform:
                    translateY(-12px)
                    scale(1.07);
            }
        }

        @keyframes orbWave {

            0%,100% {
                height: 14px;
            }

            50% {
                height: 50px;
            }
        }

        @keyframes orbLight {

            from {
                transform:
                    rotate(0deg);
            }

            to {
                transform:
                    rotate(360deg);
            }
        }

        @keyframes orbRingOne {

            0%,100% {
                transform:
                    scale(.94)
                    rotate(0deg);
                opacity: .45;
            }

            50% {
                transform:
                    scale(1.05)
                    rotate(180deg);
                opacity: .85;
            }
        }

        @keyframes orbRingTwo {

            0%,100% {
                transform:
                    scale(.94)
                    rotate(0deg);
                opacity: .25;
            }

            50% {
                transform:
                    scale(1.08)
                    rotate(-180deg);
                opacity: .55;
            }
        }

        @keyframes speakingRingOne {

            0%,100% {
                transform:
                    scale(.88);
                opacity: .25;
            }

            50% {
                transform:
                    scale(1.16);
                opacity: .9;
            }
        }

        @keyframes speakingRingTwo {

            0%,100% {
                transform:
                    scale(.90);
                opacity: .18;
            }

            50% {
                transform:
                    scale(1.24);
                opacity: .65;
            }
        }

        @keyframes voiceBar {

            0%,100% {
                height: 6px;
            }

            50% {
                height: 32px;
            }
        }

        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       ORB ANIMATION
       ===================================================== */

    function startOrbAnimation() {

        if (!room) return;

        room.classList.add("active");
    }

    function setStatus(text) {

        const status =
            document.getElementById(
                "voiceRoomStatus"
            );

        if (status) {
            status.textContent = text;
        }
    }

    /* =====================================================
       MICROPHONE PERMISSION
       ===================================================== */

    async function requestMicrophone() {

        if (microphoneReady) {
            return true;
        }

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            microphoneReady = true;
            return true;
        }

        try {

            const stream =
                await navigator.mediaDevices
                    .getUserMedia({
                        audio: true
                    });

            stream
                .getTracks()
                .forEach(function (track) {
                    track.stop();
                });

            microphoneReady = true;

            return true;

        } catch (error) {

            console.error(
                "PingMe microphone error:",
                error
            );

            setStatus(
                "Microphone permission required"
            );

            return false;
        }
    }

    /* =====================================================
       LANGUAGE DETECTION
       ===================================================== */

    function detectLanguage(text) {

        const bangla =
            (text.match(
                /[\u0980-\u09FF]/g
            ) || []).length;

        const arabic =
            (text.match(
                /[\u0600-\u06FF]/g
            ) || []).length;

        const english =
            (text.match(
                /[A-Za-z]/g
            ) || []).length;

        if (
            bangla > english &&
            bangla > arabic
        ) {
            return "bn-BD";
        }
         if (arabic > english) {
             return "ar-SA";
         }

         return "en-US";
        }
          

       
    /* =====================================================
       USER SPEECH
       ===================================================== */

    function handleSpeech(text) {

        if (!text) {
            return;
        }

        const detected =
            detectLanguage(text);

        /*
         * Store the detected language on the input
         * without adding any visible language selector.
         */

        input.dataset.voiceLanguage =
            detected;

        input.value = text;

        input.dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );

        stopRecognition();

        setStatus("Thinking...");

        /*
         * Use the existing Send system.
         */

        setTimeout(
            function () {

                if (
                    input.value.trim() ===
                    text.trim()
                ) {

                    sendButton.click();
                }

            },
            300
        );
    }

    /* =====================================================
       FIND AI MESSAGE
       ===================================================== */

    function findAssistantMessage() {

        const chatArea =
            document.getElementById(
                "chatArea"
            );

        if (!chatArea) {
            return "";
        }

        const selectors = [
            ".assistant-message",
            ".ai-message",
            ".bot-message",
            ".message.assistant",
            ".message.ai",
            "[data-role='assistant']",
            "[data-role='ai']"
        ];

        let found = [];

        selectors.forEach(
            function (selector) {

                chatArea
                    .querySelectorAll(selector)
                    .forEach(
                        function (element) {
                            found.push(element);
                        }
                    );
            }
        );

        if (!found.length) {
            return "";
        }

        const last =
            found[found.length - 1];

        return (
            last.innerText ||
            last.textContent ||
            ""
        ).trim();
    }

    /* =====================================================
       SELECT SYSTEM VOICE
       ===================================================== */

    function selectVoice(language) {

        if (!speechSupported) {
            return null;
        }

        const voices =
            speechSynthesis.getVoices();

        if (!voices.length) {
            return null;
        }

        const base =
            language
                .toLowerCase()
                .split("-")[0];

        const matching =
            voices.filter(
                function (voice) {

                    return (
                        voice.lang &&
                        voice.lang
                            .toLowerCase()
                            .startsWith(base)
                    );
                }
            );

        if (!matching.length) {
            return voices[0];
        }

        /*
         * Prefer natural/neural voices when available.
         */

        const natural =
            matching.find(
                function (voice) {

                    const name =
                        voice.name
                            .toLowerCase();

                    return (
                        name.includes("natural") ||
                        name.includes("neural") ||
                        name.includes("google") ||
                        name.includes("premium")
                    );
                }
            );

        return natural || matching[0];
    }

    /* =====================================================
       SPEAK AI RESPONSE
       ===================================================== */

    function speak(text) {

        if (
            !text ||
            !speechSupported ||
            !roomOpen
        ) {
            return;
        }

        if (
            text === lastSpokenResponse
        ) {
            return;
        }

        lastSpokenResponse = text;

        speechSynthesis.cancel();

        const language =
            detectLanguage(text);

        const utterance =
            new SpeechSynthesisUtterance(
                text
            );

        utterance.lang =
            language;

        const voice =
            selectVoice(language);

        if (voice) {
            utterance.voice = voice;
        }

        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart =
            function () {

                speaking = true;

                stopRecognition();

                if (room) {
                    room.classList.add(
                        "voice-room-speaking"
                    );
                }

                setStatus(
                    "Speaking..."
                );
            };

        utterance.onend =
            function () {

                speaking = false;

                if (room) {
                    room.classList.remove(
                        "voice-room-speaking"
                    );
                }

                if (
                    roomOpen &&
                    keepListening
                ) {

                    setStatus(
                        "Listening..."
                    );

                    setTimeout(
                        startRecognition,
                        300
                    );
                }
            };

        utterance.onerror =
            function () {

                speaking = false;

                if (room) {
                    room.classList.remove(
                        "voice-room-speaking"
                    );
                }

                if (
                    roomOpen &&
                    keepListening
                ) {
                    startRecognition();
                }
            };

        speechSynthesis.speak(
            utterance
        );
    }

    /* =====================================================
       WATCH CHAT FOR AI RESPONSE
       ===================================================== */

    function watchAIResponse() {

        const chatArea =
            document.getElementById(
                "chatArea"
            );

        if (!chatArea) {
            return;
        }

        const observer =
            new MutationObserver(
                function () {

                    if (
                        !roomOpen ||
                        speaking
                    ) {
                        return;
                    }

                    const text =
                        findAssistantMessage();

                    if (
                        text &&
                        text !== lastSpokenResponse
                    ) {

                        setTimeout(
                            function () {

                                if (
                                    roomOpen &&
                                    !speaking
                                ) {

                                    speak(text);
                                }

                            },
                            400
                        );
                    }
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
    }

    /* =====================================================
       OPEN
       ===================================================== */

    async function openRoom() {

        if (roomOpen) {
            return;
        }

        createRoom();

        roomOpen = true;
        keepListening = true;

        setStatus(
            "Checking microphone..."
        );

        const ready =
            await requestMicrophone();

        if (!ready) {
            keepListening = false;
            return;
        }

        setStatus(
            "Listening..."
        );

        startRecognition();
    }

    /* =====================================================
       CLOSE
       ===================================================== */

    function closeRoom() {

        roomOpen = false;
        keepListening = false;

        stopRecognition();

        if (speechSupported) {
            speechSynthesis.cancel();
        }

        speaking = false;

        if (room) {

            room.remove();
            room = null;
        }
    }

    /* =====================================================
       MAIN RIGHT-SIDE MIC/SEND BUTTON
       ===================================================== */

    sendButton.addEventListener(
        "click",
        function (event) {

            const text =
                input.value.trim();

            /*
             * Text exists:
             * leave the existing Send behavior alone.
             */

            if (text !== "") {
                return;
            }

            /*
             * Empty:
             * open Voice Room.
             */

            event.preventDefault();
            event.stopImmediatePropagation();

            openRoom();

        },
        true
    );

    /* =====================================================
       SYSTEM VOICES
       ===================================================== */

    if (speechSupported) {

        speechSynthesis.addEventListener(
            "voiceschanged",
            function () {
                speechSynthesis.getVoices();
            }
        );
    }

    /* =====================================================
       START AI RESPONSE WATCHER
       ===================================================== */

    watchAIResponse();

    /* =====================================================
       CLEANUP
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            stopRecognition();

            if (speechSupported) {
                speechSynthesis.cancel();
            }

        }
    );

    console.log(
        "PingMe AI — Voice Room Ready"
    );

})();
