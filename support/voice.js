/* =========================================================
   PingMe AI — Voice Room
   AI Voice Chat • Speech Recognition • Animated Orb
   ========================================================= */

(() => {
    "use strict";

    if (window.__pingmeVoiceLoaded) return;
    window.__pingmeVoiceLoaded = true;

    const input = document.getElementById("chatInput");
    const sendButton = document.getElementById("sendButton");
    const micButton = document.getElementById("micButton");

    if (!input || !sendButton) {
        console.error("PingMe Voice: Chat controls not found.");
        return;
    }

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const canSpeak = "speechSynthesis" in window;

    let room = null;
    let roomOpen = false;
    let listening = false;
    let speaking = false;
    let waitingForReply = false;
    let recognition = null;
    let recognitionMode = "";
    let responseTimer = null;
    let responseTimeout = null;
    let lastSpokenResponse = "";
    let previousResponse = "";
    let observer = null;

    const $ = id => document.getElementById(id);

    /* =====================================================
       STYLES
       ===================================================== */

    function addStyles() {
        if ($("pingmeVoiceStyles")) return;

        const style = document.createElement("style");
        style.id = "pingmeVoiceStyles";

        style.textContent = `
            #pingmeVoiceRoom {
                position:fixed;
                inset:0;
                z-index:999999;
                font-family:system-ui,-apple-system,sans-serif;
                color:#fff;
                background:#030713;
            }

            #pingmeVoiceRoom * { box-sizing:border-box; }

            .voice-room-bg {
                position:absolute;
                inset:0;
                display:flex;
                align-items:center;
                justify-content:center;
                overflow:hidden;
                background:radial-gradient(
                    circle at 50% 45%,
                    #182f62 0%,#0b1735 38%,
                    #050b1c 72%,#02040b 100%
                );
            }

            .voice-room-close {
                position:absolute;
                top:max(22px,env(safe-area-inset-top));
                right:20px;
                width:44px;
                height:44px;
                border:0;
                border-radius:50%;
                background:#ffffff16;
                color:white;
                font-size:30px;
                cursor:pointer;
            }

            .voice-room-content {
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                width:100%;
                height:100%;
                padding:25px;
            }

            .voice-room-status {
                position:absolute;
                top:17%;
                left:20px;
                right:20px;
                min-height:24px;
                text-align:center;
                color:#dbeafe;
                font-size:15px;
            }

            .voice-orb {
                position:relative;
                width:min(72vw,280px);
                aspect-ratio:1;
                display:flex;
                align-items:center;
                justify-content:center;
            }

            .orb-ring {
                position:absolute;
                border:1px solid #60a5fa45;
                border-radius:50%;
                pointer-events:none;
            }

            .ring-one {
                inset:7%;
                animation:pmRing 4s ease-in-out infinite;
            }

            .ring-two {
                inset:-5%;
                border-color:#3b82f625;
                animation:pmRing 5s ease-in-out infinite reverse;
            }

            .orb-core {
                position:relative;
                width:68%;
                aspect-ratio:1;
                display:flex;
                align-items:center;
                justify-content:center;
                overflow:hidden;
                border-radius:50%;
                background:radial-gradient(
                    circle at 35% 25%,
                    #a5e1ff,#4298ff 28%,
                    #2563eb 55%,#111d48
                );
                box-shadow:0 0 35px #3b82f677,
                    0 0 90px #2563eb44,
                    inset 0 0 25px #ffffff30;
                animation:pmFloat 3s ease-in-out infinite;
            }

            .orb-light {
                position:absolute;
                inset:-40%;
                background:conic-gradient(
                    transparent,#ffffff35,transparent,
                    #60a5fa35,transparent
                );
                animation:pmRotate 5s linear infinite;
            }

            .orb-inner {
                position:relative;
                display:flex;
                align-items:center;
                justify-content:center;
                gap:6px;
            }

            .orb-inner span {
                width:6px;
                height:24px;
                border-radius:10px;
                background:white;
                box-shadow:0 0 12px #ffffff80;
                animation:pmWave 1.1s ease-in-out infinite;
            }

            .orb-inner span:nth-child(2) { animation-delay:.12s; }
            .orb-inner span:nth-child(3) { animation-delay:.24s; }
            .orb-inner span:nth-child(4) { animation-delay:.36s; }
            .orb-inner span:nth-child(5) { animation-delay:.48s; }

            .voice-bars {
                display:flex;
                align-items:center;
                justify-content:center;
                gap:5px;
                height:38px;
                margin-top:35px;
            }

            .voice-bars i {
                width:4px;
                height:7px;
                border-radius:10px;
                background:#93c5fd;
                animation:pmBars .8s ease-in-out infinite;
                animation-play-state:paused;
            }

            #pingmeVoiceRoom.active .voice-bars i {
                animation-play-state:running;
            }

            .voice-bars i:nth-child(2),
            .voice-bars i:nth-child(8) { animation-delay:.1s; }

            .voice-bars i:nth-child(3),
            .voice-bars i:nth-child(7) { animation-delay:.2s; }

            .voice-bars i:nth-child(4),
            .voice-bars i:nth-child(6) { animation-delay:.3s; }

            .voice-bars i:nth-child(5) { animation-delay:.4s; }

            .voice-room-label {
                margin-top:20px;
                color:#ffffff80;
                font-size:14px;
                letter-spacing:.4px;
            }

            .voice-room-speaking .orb-core {
                animation:pmSpeak .8s ease-in-out infinite;
            }

            .voice-room-speaking .ring-one,
            .voice-room-speaking .ring-two {
                animation-duration:1s;
            }

            @keyframes pmFloat {
                0%,100% { transform:translateY(0) scale(1); }
                50% { transform:translateY(-8px) scale(1.025); }
            }

            @keyframes pmSpeak {
                0%,100% { transform:scale(.96); }
                50% { transform:scale(1.08); }
            }

            @keyframes pmWave {
                0%,100% { height:13px; }
                50% { height:45px; }
            }

            @keyframes pmRotate {
                to { transform:rotate(360deg); }
            }

            @keyframes pmRing {
                0%,100% { transform:scale(.94); opacity:.35; }
                50% { transform:scale(1.08); opacity:.85; }
            }

            @keyframes pmBars {
                0%,100% { height:6px; }
                50% { height:30px; }
            }

            @media(max-height:500px) {
                .voice-room-status { top:10%; }
                .voice-orb { width:min(45vh,220px); }
                .voice-bars { margin-top:12px; }
                .voice-room-label { margin-top:8px; }
            }

            @media(prefers-reduced-motion:reduce) {
                .orb-core,.orb-light,.orb-ring,
                .orb-inner span,.voice-bars i {
                    animation-duration:3s;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       VOICE ROOM UI
       ===================================================== */

    function createRoom() {
        if (room) return;

        addStyles();

        room = document.createElement("div");
        room.id = "pingmeVoiceRoom";

        room.innerHTML = `
            <div class="voice-room-bg">
                <button class="voice-room-close"
                    id="voiceRoomClose"
                    type="button"
                    aria-label="Close Voice Room">×</button>

                <div class="voice-room-content">
                    <div class="voice-room-status"
                        id="voiceRoomStatus">Starting voice...</div>

                    <div class="voice-orb">
                        <div class="orb-ring ring-one"></div>
                        <div class="orb-ring ring-two"></div>

                        <div class="orb-core">
                            <div class="orb-light"></div>
                            <div class="orb-inner">
                                <span></span><span></span><span></span>
                                <span></span><span></span>
                            </div>
                        </div>
                    </div>

                    <div class="voice-bars">
                        <i></i><i></i><i></i><i></i><i></i>
                        <i></i><i></i><i></i><i></i>
                    </div>

                    <div class="voice-room-label">PingMe AI</div>
                </div>
            </div>
        `;

        document.body.appendChild(room);
        room.classList.add("active");

        $("voiceRoomClose").addEventListener("click", closeRoom);
    }

    function setStatus(message) {
        const status = $("voiceRoomStatus");
        if (status) status.textContent = message;
    }

    /* =====================================================
       LANGUAGE
       ===================================================== */

    function detectLanguage(text) {
        const bn = (text.match(/[\u0980-\u09FF]/g) || []).length;
        const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;

        const en = (text.match(/[A-Za-z]/g) || []).length;

        if (bn > en && bn > ar) return "bn-BD";
        if (ar > en) return "ar-SA";
        return "en-US";
    }

    function recognitionLanguage() {
        return input.dataset.voiceLanguage || "bn-BD";
    }

    /* =====================================================
       SPEECH RECOGNITION
       ===================================================== */

    function stopRecognition() {
        listening = false;

        if (recognition) {
            const old = recognition;
            recognition = null;

            try {
                old.onresult = null;
                old.onerror = null;
                old.onend = null;
                old.stop();
            } catch (_) {}
        }
    }

    function startRecognition(mode) {
        if (!SpeechRecognition) {
            setStatus("Speech recognition isn't supported in this browser.");
            return false;
        }

        if (mode === "room" &&
            (!roomOpen || speaking || waitingForReply)) {
            return false;
        }

        stopRecognition();

        recognitionMode = mode;

        const rec = new SpeechRecognition();
        recognition = rec;

        rec.lang = recognitionLanguage();
        rec.continuous = false;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        if (mode === "room") {
            listening = true;
            setStatus("Listening...");
        }

        let finalText = "";

        rec.onresult = event => {
            let interim = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalText += transcript;
                } else {
                    interim += transcript;
                }
            }

            const text = (finalText || interim).trim();

            if (mode === "room" && text) {
                setStatus(text);
            }
        };

        rec.onerror = event => {
            if (recognition !== rec) return;

            listening = false;

            if (mode === "room" && roomOpen) {
                if (event.error === "not-allowed" ||
                    event.error === "service-not-allowed") {
                    setStatus("Allow microphone access in your browser.");
                } else if (event.error === "no-speech") {
                    setStatus("No speech detected. Listening again...");
                } else {
                    setStatus("Voice error: " + event.error);
                }
            }
        };

        rec.onend = () => {
            if (recognition !== rec) return;

            recognition = null;
            listening = false;

            const spokenText = finalText.trim();

            if (mode === "input") {
                if (spokenText) {
                    input.value = spokenText;
                    input.dataset.voiceLanguage = detectLanguage(spokenText);
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                }
                return;
            }

            if (mode === "room" && roomOpen) {
                if (spokenText) {
                    sendRecognizedText(spokenText);
                } else if (!speaking && !waitingForReply) {
                    setTimeout(() => {
                        if (roomOpen && !speaking && !waitingForReply) {
                            startRecognition("room");
                        }
                    }, 500);
                }
            }
        };

        try {
            rec.start();
            return true;
        } catch (error) {
            console.error("PingMe Voice: Recognition start failed.", error);
            recognition = null;
            listening = false;
            setStatus("Couldn't start the microphone. Try again.");
            return false;
        }
    }

    /* =====================================================
       LEFT MIC — VOICE TO TEXT
       ===================================================== */

    function startVoiceInput() {
        if (!SpeechRecognition) {
            alert("Voice input isn't supported in this browser. Try Chrome.");
            return;
        }

        startRecognition("input");
    }

    /* =====================================================
       SEND RECOGNIZED SPEECH TO EXISTING AI
       ===================================================== */

    function sendRecognizedText(text) {
        if (!roomOpen || !text.trim()) return;

        stopRecognition();

        input.value = text.trim();
        input.dataset.voiceLanguage = detectLanguage(text);

        input.dispatchEvent(new Event("input", { bubbles: true }));

        previousResponse = getLastAssistantMessage();
        waitingForReply = true;

        setStatus("Thinking...");

        clearTimeout(responseTimeout);

        responseTimeout = setTimeout(() => {
            if (!waitingForReply || !roomOpen) return;

            waitingForReply = false;
            setStatus("Listening...");
            startRecognition("room");
        }, 45000);

        sendButton.click();
    }

    /* =====================================================
       FIND AI RESPONSE
       ===================================================== */

    function getLastAssistantMessage() {
        const area = document.getElementById("chatArea");
        if (!area) return "";

        const messages = area.querySelectorAll(".ai-message");
        if (!messages.length) return "";

        const last = messages[messages.length - 1].cloneNode(true);

        last.querySelectorAll(
            "button,.message-actions,.pingme-message-actions"
        ).forEach(node => node.remove());

        return (last.innerText || last.textContent || "").trim();
    }

    /* =====================================================
       SPEAK AI RESPONSE
       ===================================================== */

    function speakResponse(text) {
        if (!roomOpen || !canSpeak || !text) return;

        text = text.trim();

        if (!text || text === lastSpokenResponse) return;

        lastSpokenResponse = text;
        stopRecognition();
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const language = detectLanguage(text);

        utterance.lang = language;
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = speechSynthesis.getVoices();
        const base = language.split("-")[0];

        const voice = voices.find(v =>
            v.lang && v.lang.toLowerCase().startsWith(base)
        );

        if (voice) utterance.voice = voice;

        utterance.onstart = () => {
            speaking = true;
            if (room) room.classList.add("voice-room-speaking");
            setStatus("Speaking...");
        };

        utterance.onend = () => {
            speaking = false;

            if (room) room.classList.remove("voice-room-speaking");

            if (roomOpen) {
                setStatus("Listening...");
                setTimeout(() => {
                    if (roomOpen && !speaking && !waitingForReply) {
                        startRecognition("room");
                    }
                }, 350);
            }
        };

        utterance.onerror = () => {
            speaking = false;

            if (room) room.classList.remove("voice-room-speaking");

            if (roomOpen) {
                setStatus("Listening...");
                startRecognition("room");
            }
        };

        speechSynthesis.speak(utterance);
    }

    /* =====================================================
       WATCH EXISTING CHAT FOR AI REPLIES
       ===================================================== */

    function watchAIResponse() {
        const area = document.getElementById("chatArea");
        if (!area || observer) return;

        observer = new MutationObserver(() => {
            if (!roomOpen || !waitingForReply) return;

            clearTimeout(responseTimer);

            responseTimer = setTimeout(() => {
                if (!roomOpen || !waitingForReply) return;

                const text = getLastAssistantMessage();

                if (!text || text === previousResponse) return;

                // Wait until the existing chat loader disappears.
                if ($("pingmeAiLoaderRow") || $("pingmeFallbackLoader")) {
                    return;
                }

                clearTimeout(responseTimeout);
                waitingForReply = false;
                speakResponse(text);
            }, 900);
        });

        observer.observe(area, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    /* =====================================================
       OPEN / CLOSE VOICE ROOM
       ===================================================== */

    function openRoom() {
        if (roomOpen) return;

        if (!SpeechRecognition) {
            alert("AI Voice Room needs speech recognition. Please open PingMe AI in Chrome.");
            return;
        }

        if (!canSpeak) {
            alert("This browser doesn't support speech output.");
            return;
        }

        createRoom();

        roomOpen = true;
        waitingForReply = false;
        speaking = false;
        lastSpokenResponse = "";

        watchAIResponse();

        setStatus("Starting microphone...");
        startRecognition("room");
    }

    function closeRoom() {
        roomOpen = false;
        waitingForReply = false;
        speaking = false;

        clearTimeout(responseTimer);
        clearTimeout(responseTimeout);

        stopRecognition();

        if (canSpeak) speechSynthesis.cancel();

        if (room) {
            room.remove();
            room = null;
        }
    }

    /* =====================================================
       PUBLIC FUNCTIONS — USED BY EXISTING SCRIPT
       ===================================================== */

    window.startAIVoice = openRoom;
    window.startVoice = startVoiceInput;
    window.closeAIVoice = closeRoom;

    /* =====================================================
       SEND BUTTON — EMPTY INPUT OPENS VOICE ROOM
       Keep normal text/file sending untouched.
       ===================================================== */

    sendButton.addEventListener("click", event => {
        const hasText = input.value.trim() !== "";
        const hasFiles =
            window.PingMeAttachments?.hasFiles?.() || false;

        if (hasText || hasFiles) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        openRoom();
    }, true);

    window.addEventListener("beforeunload", () => {
        closeRoom();
    });

    console.log("PingMe AI Voice Room loaded.");
})();